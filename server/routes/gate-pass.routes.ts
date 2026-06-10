/**
 * Gate pass routes.
 *
 * When an invoice is paid, a gate pass can be issued: a short code + QR the
 * customer shows at the gate to collect their vehicle. Gate staff scan it to
 * verify (it's active, not expired, belongs to their garage) and release the
 * vehicle, which marks the pass "used".
 *
 *   POST /api/gate-pass/issue      { invoiceId }     → issue (idempotent) for a PAID invoice
 *   GET  /api/gate-pass/:invoiceId                   → the active pass for an invoice (+ QR)
 *   POST /api/gate-pass/verify     { passCode }      → staff: validate + mark used, return details
 *
 * Issuing requires the caller to own the invoice (customer) or be in its garage
 * (staff). Verifying is staff-only (manager/advisor/admin).
 */
import { Router } from "express";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { db } from "../db";
import { gatePasses, invoices } from "@shared/schema";
import { logger } from "../logger";

const router = Router();

function generatePassCode(): string {
  // Human-readable: GP-XXXXXXXX (no ambiguous chars).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return `GP-${code}`;
}

async function qrFor(passCode: string): Promise<string> {
  // Encode a verify URL so a generic QR scanner deep-links to the gate screen.
  const base = process.env.PUBLIC_APP_URL || process.env.APP_URL || "";
  const payload = base ? `${base}/gate-pass/verify?code=${passCode}` : passCode;
  return QRCode.toDataURL(payload, { width: 240, margin: 1 });
}

// ── POST /api/gate-pass/issue ───────────────────────────────────────────────
router.post("/gate-pass/issue", isAuthenticated, async (req: any, res) => {
  try {
    const { invoiceId } = req.body || {};
    if (!invoiceId) return res.status(400).json({ message: "invoiceId is required" });

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Ownership / tenancy.
    const user = req.user || {};
    const isCustomer = user.userType === "customer" || String(user.role || "").toUpperCase() === "CUSTOMER";
    if (user.garageId && (invoice as any).garageId && (invoice as any).garageId !== user.garageId) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    if (isCustomer && (invoice as any).customerId && (invoice as any).customerId !== user.id) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Only a paid invoice can produce a gate pass.
    const balance = parseFloat((invoice as any).balanceAmount ?? "0");
    if ((invoice as any).status !== "paid" && balance > 0) {
      return res.status(409).json({ message: "Invoice is not fully paid; cannot issue a gate pass." });
    }

    // Idempotent: reuse an existing active pass.
    const [existing] = await db
      .select()
      .from(gatePasses)
      .where(and(eq(gatePasses.invoiceId, invoiceId), eq(gatePasses.status, "active")))
      .limit(1);

    let pass = existing;
    if (!pass) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // valid 7 days
      const [created] = await db
        .insert(gatePasses)
        .values({
          invoiceId,
          garageId: (invoice as any).garageId ?? null,
          customerId: (invoice as any).customerId ?? null,
          vehicleId: (invoice as any).vehicleId ?? null,
          passCode: generatePassCode(),
          status: "active",
          issuedBy: user.id ?? null,
          expiresAt,
        } as any)
        .returning();
      pass = created;
    }

    const qr = await qrFor(pass.passCode);
    res.status(201).json({ data: { ...pass, qr, invoiceNumber: (invoice as any).invoiceNumber } });
  } catch (error: any) {
    logger.error("gate-pass issue failed", { error: String(error) });
    res.status(500).json({ message: "Failed to issue gate pass" });
  }
});

// ── GET /api/gate-pass/:invoiceId ───────────────────────────────────────────
router.get("/gate-pass/:invoiceId", isAuthenticated, async (req: any, res) => {
  try {
    const [pass] = await db
      .select()
      .from(gatePasses)
      .where(and(eq(gatePasses.invoiceId, req.params.invoiceId), eq(gatePasses.status, "active")))
      .limit(1);
    if (!pass) return res.status(404).json({ message: "No active gate pass for this invoice" });

    const user = req.user || {};
    if (user.garageId && pass.garageId && pass.garageId !== user.garageId) {
      return res.status(404).json({ message: "No active gate pass for this invoice" });
    }
    const qr = await qrFor(pass.passCode);
    res.json({ data: { ...pass, qr } });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch gate pass" });
  }
});

// ── POST /api/gate-pass/verify (staff scan → release) ───────────────────────
router.post(
  "/gate-pass/verify",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER", "ADVISOR"]),
  async (req: any, res) => {
    try {
      const { passCode } = req.body || {};
      if (!passCode) return res.status(400).json({ message: "passCode is required" });

      const [pass] = await db.select().from(gatePasses).where(eq(gatePasses.passCode, passCode)).limit(1);
      if (!pass) return res.status(404).json({ valid: false, message: "Pass not found" });

      const user = req.user || {};
      if (user.garageId && pass.garageId && pass.garageId !== user.garageId) {
        return res.status(403).json({ valid: false, message: "Pass belongs to another garage" });
      }
      if (pass.status === "used") {
        return res.status(409).json({ valid: false, message: "Pass already used", usedAt: pass.usedAt });
      }
      if (pass.status !== "active") {
        return res.status(409).json({ valid: false, message: `Pass is ${pass.status}` });
      }
      if (pass.expiresAt && new Date(pass.expiresAt) < new Date()) {
        await db.update(gatePasses).set({ status: "expired" }).where(eq(gatePasses.id, pass.id));
        return res.status(409).json({ valid: false, message: "Pass expired" });
      }

      // Mark used and release.
      const [updated] = await db
        .update(gatePasses)
        .set({ status: "used", usedAt: new Date(), usedBy: user.id ?? null })
        .where(eq(gatePasses.id, pass.id))
        .returning();

      // Provide the gate agent the vehicle/invoice it belongs to.
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, pass.invoiceId)).limit(1);
      res.json({
        valid: true,
        message: "Gate pass verified — vehicle released",
        data: {
          passCode: updated.passCode,
          invoiceId: pass.invoiceId,
          invoiceNumber: (invoice as any)?.invoiceNumber,
          vehicleId: pass.vehicleId,
          customerId: pass.customerId,
          usedAt: updated.usedAt,
        },
      });
    } catch (error: any) {
      logger.error("gate-pass verify failed", { error: String(error) });
      res.status(500).json({ message: "Failed to verify gate pass" });
    }
  },
);

export default router;
