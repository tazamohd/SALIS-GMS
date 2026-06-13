/**
 * Subscriptions — backs /api/plans and /api/subscriptions/*.
 *
 *   GET  /api/plans                       — public plan definitions + tier matrix
 *   GET  /api/subscriptions/current       — current garage subscription
 *   POST /api/subscriptions/change-plan   — switch tier (stub if Stripe key absent)
 *   POST /api/subscriptions/cancel        — schedule cancel-at-period-end
 *   POST /api/subscriptions/resume        — clear pending cancel
 *   GET  /api/subscriptions/all           — platform-admin: every garage's plan
 *   PATCH /api/subscriptions/:garageId    — platform-admin: force change/refund
 */
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import {
  ALL_PLAN_IDS,
  CATEGORY_MIN_PLAN,
  PLAN_HIERARCHY,
  PLANS,
  type PlanId,
} from "../../shared/plans";

const router = Router();

interface AuthedUser { id?: string; garageId?: string; role?: string }
const u = (req: Request): AuthedUser => (req.user as AuthedUser | undefined) ?? {};

function isPlatformAdmin(user: AuthedUser): boolean {
  return user.role === "PLATFORM_ADMIN";
}

// ── Public plan catalog ─────────────────────────────────────────────────
router.get("/plans", (_req, res) => {
  res.json({
    plans: ALL_PLAN_IDS.map(id => PLANS[id]),
    categoryMinPlan: CATEGORY_MIN_PLAN,
    hierarchy: PLAN_HIERARCHY,
  });
});

// ── Current subscription ────────────────────────────────────────────────
router.get("/subscriptions/current", isAuthenticated, async (req, res) => {
  const user = u(req);
  if (!user.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const sub = await storage.ensureSubscription(user.garageId);
    res.json({
      garageId: sub.garageId,
      plan: sub.plan,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAt: sub.cancelAt,
      canceledAt: sub.canceledAt,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      stripeCustomerId: sub.stripeCustomerId,
    });
  } catch (err) {
    console.error("[subscriptions/current] error:", err);
    res.status(500).json({ message: "Failed to load subscription" });
  }
});

// ── Change plan ─────────────────────────────────────────────────────────
const changeSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"] as [PlanId, ...PlanId[]]),
});
router.post("/subscriptions/change-plan", isAuthenticated, async (req, res) => {
  const user = u(req);
  if (!user.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = changeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid plan", errors: parsed.error.flatten() });

  const stripeReady = !!process.env.STRIPE_SECRET_KEY && parsed.data.plan !== "STARTER";

  // SECURITY: the direct in-DB upgrade below charges nothing. That is acceptable
  // only as dev scaffolding — in production it would let any user self-upgrade to
  // a paid tier for free. Block the unpaid upgrade path in production until a
  // real Checkout flow gates it. (Downgrades to STARTER remain allowed.)
  if (process.env.NODE_ENV === "production" && parsed.data.plan !== "STARTER") {
    return res.status(402).json({
      message: "Paid plan changes require checkout, which is not yet available.",
    });
  }

  // Until Stripe checkout is wired, do an immediate in-DB upgrade so the rest
  // of the gating works end-to-end. Production will replace this with a
  // Checkout-session redirect.
  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  try {
    const updated = await storage.updateSubscription(user.garageId, {
      plan: parsed.data.plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: oneMonthLater,
      cancelAt: null,
      canceledAt: null,
    });
    res.json({
      ok: true,
      subscription: updated,
      stripeReady,
      note: stripeReady
        ? "Stripe is configured; live checkout will be wired separately."
        : "Stripe not configured — applied plan change directly for development.",
    });
  } catch (err) {
    console.error("[subscriptions/change-plan] error:", err);
    res.status(500).json({ message: "Failed to change plan" });
  }
});

// ── Cancel (at period end) ──────────────────────────────────────────────
router.post("/subscriptions/cancel", isAuthenticated, async (req, res) => {
  const user = u(req);
  if (!user.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const sub = await storage.ensureSubscription(user.garageId);
    const cancelAt = sub.currentPeriodEnd ?? new Date();
    const updated = await storage.updateSubscription(user.garageId, {
      cancelAt,
    });
    res.json({ ok: true, subscription: updated });
  } catch (err) {
    console.error("[subscriptions/cancel] error:", err);
    res.status(500).json({ message: "Failed to schedule cancellation" });
  }
});

router.post("/subscriptions/resume", isAuthenticated, async (req, res) => {
  const user = u(req);
  if (!user.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const updated = await storage.updateSubscription(user.garageId, {
      cancelAt: null,
      canceledAt: null,
      status: "active",
    });
    res.json({ ok: true, subscription: updated });
  } catch (err) {
    console.error("[subscriptions/resume] error:", err);
    res.status(500).json({ message: "Failed to resume subscription" });
  }
});

// ── Platform-admin: list / patch any garage ─────────────────────────────
router.get("/subscriptions/all", isAuthenticated, async (req, res) => {
  const user = u(req);
  if (!isPlatformAdmin(user)) return res.status(403).json({ message: "Forbidden" });
  try {
    const rows = await storage.listAllSubscriptions();
    res.json(rows);
  } catch (err) {
    console.error("[subscriptions/all] error:", err);
    res.status(500).json({ message: "Failed to list subscriptions" });
  }
});

const adminPatchSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"] as [PlanId, ...PlanId[]]).optional(),
  status: z.enum(["active", "trialing", "past_due", "canceled", "unpaid"]).optional(),
  currentPeriodEnd: z.coerce.date().nullable().optional(),
  cancelAt: z.coerce.date().nullable().optional(),
});
router.patch("/subscriptions/:garageId", isAuthenticated, async (req, res) => {
  const user = u(req);
  if (!isPlatformAdmin(user)) return res.status(403).json({ message: "Forbidden" });
  const parsed = adminPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid patch", errors: parsed.error.flatten() });
  try {
    await storage.ensureSubscription(req.params.garageId);
    const updated = await storage.updateSubscription(req.params.garageId, parsed.data);
    res.json({ ok: true, subscription: updated });
  } catch (err) {
    console.error("[subscriptions/:garageId] error:", err);
    res.status(500).json({ message: "Failed to update subscription" });
  }
});

export const subscriptionsRoutes = router;
