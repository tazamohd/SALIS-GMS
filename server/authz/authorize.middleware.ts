/**
 * SALIS-GMS — Shared RBAC authorize middleware (Story 3.2)
 *
 * Enforces the policy registry on mutating requests, deny-by-default for mapped
 * route groups. ADMIN always passes (consistent with requireRole's bypass).
 * Applied centrally on /api so both the modular and legacy route layers get the
 * same decision without editing individual handlers.
 */
import type { Request, Response, NextFunction } from "express";
import { matchPolicy } from "./policy-registry";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function authorizeByPolicy(req: Request, res: Response, next: NextFunction): void {
  // Mounted without a path prefix, so req.path is the full path (e.g. /api/invoices).
  if (!req.path.startsWith("/api")) return next();
  if (!MUTATING.has(req.method)) return next();

  const policy = matchPolicy(req.method, req.path);
  if (!policy) return next(); // unmapped mutation — allowed during incremental rollout

  const user = (req as Request & { user?: { role?: string | null } }).user;
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const role = (user.role || "").toUpperCase();
  if (role === "ADMIN" || policy.roles.includes(role)) {
    return next();
  }

  res.status(403).json({
    message: `Access denied. Requires role: ${policy.roles.join(" or ")}`,
  });
}
