/**
 * SALIS-GMS — Audited impersonation (Story 5.2 / FR-10)
 *
 * A Platform Principal (a user not bound to a single Garage) may act inside a
 * specific tenant via an explicit, audited session. Start/stop are Audit Events;
 * while active, the Tenant Scope resolves to the target garage (see
 * tenant-scope.ts), so the principal cannot exceed that tenant's data.
 */
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { logAudit } from "../services/audit-trail";

const router = Router();

/** Only a Platform Principal (no garageId) may impersonate. */
function requirePlatformPrincipal(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.garageId) {
    return res.status(403).json({ message: "Only platform administrators may impersonate a tenant" });
  }
  next();
}

router.post("/admin/impersonate", isAuthenticated, requirePlatformPrincipal, async (req: any, res, next) => {
  try {
    const { targetGarageId } = req.body ?? {};
    if (!targetGarageId) {
      return res.status(400).json({ message: "targetGarageId is required" });
    }
    const garage = await storage.getGarageById(targetGarageId);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }
    req.session.impersonation = { targetGarageId, actorUserId: req.user.id, startedAt: Date.now() };
    req.session.save(async (err: any) => {
      if (err) return next(err);
      await logAudit({
        userId: req.user.id,
        userName: req.user.email || req.user.id,
        action: "IMPERSONATION_START",
        resource: "garage",
        resourceId: targetGarageId,
        details: JSON.stringify({ targetGarageId }),
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        garageId: targetGarageId,
        severity: "high",
      }).catch(() => {});
      res.json({ impersonating: true, targetGarageId });
    });
  } catch (e) {
    next(e);
  }
});

router.post("/admin/impersonate/stop", isAuthenticated, async (req: any, res, next) => {
  const impersonation = req.session?.impersonation;
  if (!impersonation) {
    return res.json({ impersonating: false });
  }
  delete req.session.impersonation;
  req.session.save(async (err: any) => {
    if (err) return next(err);
    await logAudit({
      userId: req.user?.id || impersonation.actorUserId,
      userName: req.user?.email || req.user?.id || "system",
      action: "IMPERSONATION_STOP",
      resource: "garage",
      resourceId: impersonation.targetGarageId,
      details: JSON.stringify({ targetGarageId: impersonation.targetGarageId }),
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
      garageId: impersonation.targetGarageId,
      severity: "high",
    }).catch(() => {});
    res.json({ impersonating: false });
  });
});

router.get("/admin/impersonate/status", isAuthenticated, (req: any, res) => {
  const impersonation = req.session?.impersonation;
  res.json(
    impersonation
      ? { impersonating: true, targetGarageId: impersonation.targetGarageId }
      : { impersonating: false },
  );
});

export const impersonationRoutes = router;
