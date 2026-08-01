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
import type { Request, Response, NextFunction } from "express";

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

/**
 * Defense-in-depth: force `?garage_id` / `?garageId` to the caller's session
 * garage for ordinary staff, BEFORE any route handler reads it. This closes the
 * "trust the client garage_id" cross-tenant class across the entire legacy
 * monolith in one place, without editing dozens of handlers.
 *
 * Exemptions (the param is left as the client sent it):
 *  - PLATFORM_ADMIN / SUPER_ADMIN — legitimately query across garages.
 *  - CUSTOMER — browses across garages (find-a-garage, storefronts); their own
 *    data endpoints scope by customerId, not garageId.
 *  - users with no session garageId (nothing to pin to).
 *
 * Modular routes that already call resolveGarageScope are unaffected (they
 * ignore the query param for non-admins regardless).
 */
export function enforceGarageScopeOnQuery(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as any).user || {};
  const role = String(user.role || "").toUpperCase();
  const isCustomer = user.userType === "customer" || role === "CUSTOMER";
  if (!CROSS_GARAGE_ROLES.has(role) && !isCustomer && user.garageId) {
    if (req.query && "garage_id" in req.query) (req.query as any).garage_id = user.garageId;
    if (req.query && "garageId" in req.query) (req.query as any).garageId = user.garageId;
  }
  next();
}

const MUTATING = new Set(["POST", "PUT", "PATCH"]);

/**
 * Defense-in-depth against the systemic mass-assignment class (deep-audit
 * blocker B12): ordinary staff must never set a write's tenant from the request
 * body. Applied to every mutating /api request BEFORE any handler validates
 * req.body, so a create handler that spreads the parsed body picks up the
 * session garage automatically — no per-handler edits needed.
 *
 *  - POST (create): pin body.garageId / garage_id to the caller's session garage
 *    so a new row always belongs to the creator's tenant (a forged victim id is
 *    overwritten). Bodies for entities without a garageId column simply carry an
 *    extra field that their insert schema strips.
 *  - PUT/PATCH (update): STRIP body.garageId / garage_id entirely — a row's
 *    tenant can never be reassigned via an update (which would otherwise let an
 *    unscoped update "steal" a row into the caller's garage).
 *
 * Exemptions (left untouched): PLATFORM_ADMIN / SUPER_ADMIN (legitimately act
 * across garages), CUSTOMER (their writes scope by customerId), and any caller
 * with no session garageId (nothing to pin to). Non-object bodies are ignored.
 */
export function enforceTenantOnBody(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as any).user || {};
  const role = String(user.role || "").toUpperCase();
  const isCustomer = user.userType === "customer" || role === "CUSTOMER";
  const body = req.body;

  if (
    MUTATING.has(req.method) &&
    !CROSS_GARAGE_ROLES.has(role) &&
    !isCustomer &&
    user.garageId &&
    body &&
    typeof body === "object" &&
    !Array.isArray(body)
  ) {
    if (req.method === "POST") {
      body.garageId = user.garageId;
      if ("garage_id" in body) body.garage_id = user.garageId;
    } else {
      delete body.garageId;
      delete body.garage_id;
    }
  }
  next();
}
