/**
 * Tenant scoping helper.
 *
 * List endpoints must scope to the caller's own garage, NOT to a client-supplied
 * `?garage_id` query param (trusting the query param lets any authenticated user
 * read another tenant's data — the audit's "missing garageId returns all
 * tenants' data" finding). Only platform-level admins may query across garages.
 *
 *   const garageId = resolveGarageScope(req);
 *   const rows = await storage.getCustomers(garageId);
 *
 * For a normal user this is always their session `garageId`; the query param is
 * ignored. For a PLATFORM_ADMIN / SUPER_ADMIN it honours an explicit override so
 * platform staff can inspect a specific garage.
 */
import type { Request } from "express";

const CROSS_GARAGE_ROLES = new Set(["PLATFORM_ADMIN", "SUPER_ADMIN", "SUPERADMIN"]);

export function resolveGarageScope(req: Request): string | undefined {
  const user = (req as any).user || {};
  const role = String(user.role || "").toUpperCase();
  const queryGarage =
    (req.query.garage_id as string) || (req.query.garageId as string) || undefined;

  if (CROSS_GARAGE_ROLES.has(role)) {
    // Platform admins may target any garage; default to their own if none given.
    return queryGarage || user.garageId || undefined;
  }
  // Everyone else is bound to their session garage — query param is ignored.
  return user.garageId || undefined;
}

/** True when the caller is allowed to operate across garages. */
export function isCrossGarageRole(req: Request): boolean {
  const role = String(((req as any).user || {}).role || "").toUpperCase();
  return CROSS_GARAGE_ROLES.has(role);
}
