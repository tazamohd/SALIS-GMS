import { Router } from "express";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import rateLimit from "express-rate-limit";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import {
  branches,
  estimates,
  invoices,
  jobCards,
  mediaAttachments,
  users,
} from "@shared/schema";
import { sendSMS } from "../smsService";
import { z } from "zod";

/**
 * Public portal API — the unauthenticated customer surface behind /public-portal/*.
 *
 * Replaces the retired tracking-token links. A token in a URL is bearer proof: forward the
 * SMS and you hand over the car's history. Here the customer names a job they already know
 * (plate or job card number) and proves the phone, and the resulting session lives in an
 * httpOnly cookie rather than in a URL.
 *
 * Three rules shape everything below:
 *
 *  1. Never confirm whether a job exists. POST /otp answers 200 whether or not anything
 *     matched, so the endpoint cannot be used to enumerate plates or job numbers.
 *  2. The challenge never leaves the server. Only a salted hash of the code is stored, in
 *     the session, and comparison is constant-time.
 *  3. Identifiers stay out of URLs and out of responses. Not even a masked phone number
 *     comes back from the lookup: returning one only on a match would rebuild the oracle
 *     rule 1 removes. The verify step returns a path,
 *     not a token; the job payload is keyed off the session alone.
 */

const router = Router();

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_RESENDS = 3;

declare module "express-session" {
  interface SessionData {
    portal?: {
      challenge?: {
        jobCardId: string;
        codeHash: string;
        salt: string;
        expiresAt: number;
        attempts: number;
        resends: number;
      };
      job?: { jobCardId: string; verifiedAt: number };
    };
  }
}

/* ---------------------------------------------------------------- helpers */

/**
 * Saudi mobiles get written every possible way: 0501234567, +966501234567,
 * 966 50 123 4567. Compare on the last nine digits so a customer is not locked out by the
 * formatting the workshop happened to use.
 */
function phoneKey(raw: string): string {
  return (raw || "").replace(/\D/g, "").slice(-9);
}

function hashCode(code: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

function sameHash(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function pair(en: string, ar: string) {
  return { en, ar };
}

/** Rate limits are per IP. The OTP request is the enumeration surface, so it is tightest. */
const requestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
});

/* --------------------------------------------------------------- lookup */

const lookupSchema = z.union([
  z.object({
    mode: z.literal("plate"),
    phone: z.string().min(6).max(24),
    plate_area: z.string().min(1).max(8),
    plate_number: z.string().min(1).max(12),
  }),
  z.object({
    mode: z.literal("jc"),
    phone: z.string().min(6).max(24),
    job_card: z.string().min(2).max(40),
  }),
]);

/**
 * Finds the job the customer named, but only if the phone they typed matches the one the
 * workshop holds for that job. Returns null for every kind of miss — wrong plate, wrong
 * phone, no such job — because the caller must not be able to tell them apart.
 */
async function findJobForLookup(input: z.infer<typeof lookupSchema>) {
  const key = phoneKey(input.phone);
  if (key.length < 9) return null;

  const rows = await db
    .select({ jobCard: jobCards, customerPhone: users.phone })
    .from(jobCards)
    /* customerId is an unconstrained varchar holding a users.id — the same convention
       invoices.customerId uses. A real FK would be better; see the PR notes. */
    .leftJoin(users, eq(jobCards.customerId, users.id))
    .where(
      input.mode === "jc"
        ? eq(jobCards.jobNumber, input.job_card.trim().toUpperCase())
        : sql`upper(regexp_replace(coalesce(${jobCards.vehicleInfo} ->> 'licensePlate', ''), '[^A-Za-z0-9]', '', 'g'))
              = ${(input.plate_area + input.plate_number).replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`,
    )
    .orderBy(desc(jobCards.createdAt))
    .limit(5);

  const hit = rows.find((r: any) => r.customerPhone && phoneKey(r.customerPhone) === key);
  return hit ? { jobCard: hit.jobCard, phone: hit.customerPhone as string } : null;
}

async function issueCode(req: any, jobCardId: string, phone: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const salt = createHash("sha256").update(`${jobCardId}:${Date.now()}:${Math.random()}`).digest("hex").slice(0, 16);

  req.session.portal = {
    ...(req.session.portal || {}),
    challenge: {
      jobCardId,
      codeHash: hashCode(code, salt),
      salt,
      expiresAt: Date.now() + CODE_TTL_MS,
      attempts: 0,
      resends: req.session.portal?.challenge?.resends ?? 0,
    },
  };

  const result = await sendSMS({
    to: phone,
    body: `SALIS AUTO: your one-time code is ${code}. It expires in 10 minutes. رمزك: ${code}`,
  });

  /* Delivery failure is not reported back to the caller — doing so would leak that the
     lookup matched. It is logged for operators instead. */
  if (!result.success) {
    console.warn("[public-portal] OTP SMS not delivered:", result.error);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[public-portal] dev code for job ${jobCardId}: ${code}`);
    }
  }
}

/* ------------------------------------------------------------ endpoints */

/**
 * POST /api/public-portal/otp
 *
 * Always 200. A miss and a hit are indistinguishable to the caller by status, body or
 * shape — the only difference is whether an SMS goes out.
 */
router.post("/public-portal/otp", requestLimiter, async (req: any, res) => {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    /* Even a malformed body gets the neutral answer, so probing the shape tells nothing. */
    return res.json({ ok: true });
  }

  try {
    const found = await findJobForLookup(parsed.data);
    if (found) {
      await issueCode(req, found.jobCard.id, found.phone);
    } else {
      /* Clear any earlier challenge so a failed lookup cannot be verified against a
         previous job's code. */
      if (req.session.portal) delete req.session.portal.challenge;
    }
    res.json({ ok: true, next: "/public-portal/verify" });
  } catch (error) {
    console.error("[public-portal] otp request failed:", error);
    res.status(500).json({ message: "Could not send the code. Try again shortly." });
  }
});

/**
 * POST /api/public-portal/otp/verify
 *
 * 401 no challenge · 410 expired · 429 out of attempts · 422 wrong code.
 * The page shows the same generic wording for the last two.
 */
router.post("/public-portal/otp/verify", verifyLimiter, async (req: any, res) => {
  const code = String(req.body?.code ?? "").replace(/\D/g, "");
  const challenge = req.session.portal?.challenge;

  if (!challenge) return res.status(401).json({ message: "No code was requested." });
  if (Date.now() > challenge.expiresAt) {
    delete req.session.portal.challenge;
    return res.status(410).json({ message: "That code has expired." });
  }
  if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
    delete req.session.portal.challenge;
    return res.status(429).json({ message: "Too many attempts." });
  }

  challenge.attempts += 1;

  if (code.length !== 6 || !sameHash(hashCode(code, challenge.salt), challenge.codeHash)) {
    return res.status(422).json({ message: "That code is not right." });
  }

  /* Rotate the session id on success: the cookie now carries authority it did not have a
     moment ago, so anything that saw the pre-verification id must not be able to reuse it. */
  const jobCardId = challenge.jobCardId;
  req.session.regenerate((err: unknown) => {
    if (err) {
      console.error("[public-portal] session regenerate failed:", err);
      return res.status(500).json({ message: "Could not start your session." });
    }
    req.session.portal = { job: { jobCardId, verifiedAt: Date.now() } };
    req.session.save(() => res.json({ next: "/public-portal/job" }));
  });
});

/** POST /api/public-portal/otp/resend — same challenge, new code, capped. */
router.post("/public-portal/otp/resend", requestLimiter, async (req: any, res) => {
  const challenge = req.session.portal?.challenge;
  if (!challenge) return res.status(401).json({ message: "No code was requested." });
  if (challenge.resends >= MAX_RESENDS) {
    return res.status(429).json({ message: "Too many codes requested." });
  }

  try {
    const jobCard = await storage.getJobCard(challenge.jobCardId);
    if (!jobCard) return res.status(404).json({ message: "No code was requested." });

    if (!jobCard.customerId) return res.status(404).json({ message: "No code was requested." });

    const [customer] = await db
      .select({ phone: users.phone })
      .from(users)
      .where(eq(users.id, jobCard.customerId))
      .limit(1);
    if (!customer?.phone) return res.status(404).json({ message: "No code was requested." });

    const resends = challenge.resends + 1;
    await issueCode(req, jobCard.id, customer.phone);
    req.session.portal!.challenge!.resends = resends;
    res.json({ ok: true });
  } catch (error) {
    console.error("[public-portal] resend failed:", error);
    res.status(500).json({ message: "Could not send a new code." });
  }
});

/* ------------------------------------------------------------- job view */

/** jobCards.status → the chip and the stage the timeline stops at. */
const STATUS_STAGES = [
  { key: "pending", label: pair("Check-in", "الاستقبال") },
  { key: "assigned", label: pair("Inspection", "الفحص") },
  { key: "in_progress", label: pair("In repair", "قيد الإصلاح") },
  { key: "quality_check", label: pair("Quality control", "فحص الجودة") },
  { key: "completed", label: pair("Delivery + invoice", "التسليم والفاتورة") },
];

const STATUS_LABEL: Record<string, { tone?: "wait" | "done"; label: { en: string; ar: string } }> = {
  pending: { tone: "wait", label: pair("Awaiting check-in", "بانتظار الاستقبال") },
  assigned: { tone: "wait", label: pair("Inspection", "الفحص") },
  in_progress: { tone: "wait", label: pair("In repair", "قيد الإصلاح") },
  quality_check: { tone: "wait", label: pair("Quality control", "فحص الجودة") },
  completed: { tone: "done", label: pair("Ready", "جاهزة") },
  cancelled: { tone: undefined, label: pair("Cancelled", "ملغاة") },
};

function moneyPair(amount: unknown): { en: string; ar: string } {
  const n = Number(amount ?? 0);
  const en = `SAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const ar = `${n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`;
  return { en, ar };
}

function stamp(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 16).replace("T", " · ");
}

/** GET /api/public-portal/job — everything the job view renders, keyed off the session. */
router.get("/public-portal/job", async (req: any, res) => {
  const session = req.session.portal?.job;
  if (!session) return res.status(401).json({ message: "Not verified." });

  try {
    const jobCard = await storage.getJobCard(session.jobCardId);
    if (!jobCard) return res.status(404).json({ message: "Job not found." });

    const vehicleInfo = (jobCard.vehicleInfo ?? {}) as Record<string, any>;

    const [branch] = jobCard.branchId
      ? await db.select({ name: branches.name }).from(branches).where(eq(branches.id, jobCard.branchId)).limit(1)
      : [];

    const [advisor] = jobCard.assignedTo
      ? await db
          .select({ firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(eq(users.id, jobCard.assignedTo))
          .limit(1)
      : [];
    const advisorName = [advisor?.firstName, advisor?.lastName].filter(Boolean).join(" ");

    /* Only events the workshop marked customer-visible. */
    const events = await storage.getJobTrackingEvents(jobCard.id, true);

    const reached = Math.max(0, STATUS_STAGES.findIndex((s) => s.key === jobCard.status));
    const stages = STATUS_STAGES.map((s, i) => ({
      state: i < reached ? "done" : i === reached ? "now" : "pending",
      label: s.label,
      at:
        i === 0
          ? stamp(jobCard.createdAt)
          : s.key === "in_progress"
            ? stamp(jobCard.startedAt)
            : s.key === "completed"
              ? stamp(jobCard.completedAt)
              : null,
    }));

    const estimateRows = await db
      .select()
      .from(estimates)
      .where(eq(estimates.convertedToJobCardId, jobCard.id))
      .orderBy(desc(estimates.createdAt));

    const photoRows = await db
      .select()
      .from(mediaAttachments)
      .where(and(eq(mediaAttachments.relatedType, "job_card"), eq(mediaAttachments.relatedId, jobCard.id)))
      .orderBy(desc(mediaAttachments.createdAt))
      .limit(12);

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.jobCardId, jobCard.id))
      .orderBy(desc(invoices.invoiceDate))
      .limit(1);

    const historyRows = jobCard.customerId
      ? await db
          .select({ jobNumber: jobCards.jobNumber, completedAt: jobCards.completedAt, description: jobCards.description })
          .from(jobCards)
          .where(and(eq(jobCards.customerId, jobCard.customerId), ne(jobCards.id, jobCard.id)))
          .orderBy(desc(jobCards.createdAt))
          .limit(5)
      : [];

    res.json({
      job: {
        id: jobCard.jobNumber,
        vehicle: [vehicleInfo.year, vehicleInfo.make, vehicleInfo.model].filter(Boolean).join(" ") || "—",
        plate: vehicleInfo.licensePlate || "—",
        eta: stamp(jobCard.estimatedCompletionAt),
        branch: pair(branch?.name || "—", branch?.name || "—"),
        advisor: pair(advisorName || "—", advisorName || "—"),
        status: STATUS_LABEL[jobCard.status] ?? { label: pair(jobCard.status, jobCard.status) },
      },
      stages,
      approvals: estimateRows.map((e: any) => ({
        id: e.id,
        status: e.status === "approved" ? "approved" : e.status === "rejected" ? "declined" : "pending",
        title: pair(e.title || "Estimate", e.title || "عرض سعر"),
        amount: moneyPair(e.totalAmount),
        note: e.description ? pair(e.description, e.description) : undefined,
      })),
      photos: photoRows
        .filter((m: any) => (m.mediaType || "").startsWith("image") || (m.mimeType || "").startsWith("image"))
        .map((m: any) => ({
          url: m.fileUrl,
          thumb: m.thumbnailUrl || undefined,
          caption: pair(m.description || m.fileName || "", m.description || m.fileName || ""),
          at: stamp(m.createdAt),
        })),
      history: historyRows.map((h: any) => ({
        ref: h.jobNumber,
        date: stamp(h.completedAt) || "—",
        summary: pair(h.description || "—", h.description || "—"),
      })),
      invoice: invoice
        ? {
            status: invoice.status === "paid" ? "paid" : "unpaid",
            total: moneyPair(invoice.totalAmount),
          }
        : null,
      /* No workshop contact is returned: neither garages nor branches carries a phone
         column today, and the job view hides the helpline when this is absent. */
    });
  } catch (error) {
    console.error("[public-portal] job fetch failed:", error);
    res.status(500).json({ message: "Could not load the job." });
  }
});

/**
 * POST /api/public-portal/job/approvals/:id
 *
 * The estimate must belong to the job in the session — otherwise a verified customer could
 * answer somebody else's estimate by guessing an id.
 */
router.post("/public-portal/job/approvals/:id", async (req: any, res) => {
  const session = req.session.portal?.job;
  if (!session) return res.status(401).json({ message: "Not verified." });

  const decision = req.body?.decision;
  if (decision !== "approve" && decision !== "decline") {
    return res.status(422).json({ message: "Unknown decision." });
  }

  try {
    const [estimate] = await db
      .select()
      .from(estimates)
      .where(and(eq(estimates.id, req.params.id), eq(estimates.convertedToJobCardId, session.jobCardId)))
      .limit(1);

    if (!estimate) return res.status(404).json({ message: "Not found." });
    if (estimate.status === "approved" || estimate.status === "rejected") {
      return res.status(409).json({ message: "Already answered." });
    }

    const approved = decision === "approve";
    await db
      .update(estimates)
      .set({
        status: approved ? "approved" : "rejected",
        approvedAt: approved ? new Date() : null,
        rejectedAt: approved ? null : new Date(),
      })
      .where(eq(estimates.id, estimate.id));

    /* The workshop sees the answer on the same audit trail the customer does. */
    await storage.createJobTrackingEvent({
      jobCardId: session.jobCardId,
      eventType: "message",
      title: approved ? "Estimate approved by customer" : "Estimate declined by customer",
      description: estimate.title || undefined,
      isVisibleToCustomer: true,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("[public-portal] approval failed:", error);
    res.status(500).json({ message: "Could not record your answer." });
  }
});

export { router as publicPortalRoutes };
