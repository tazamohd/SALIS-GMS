/**
 * SALIS-GMS — Tenant HTTP helpers (existence-hiding, AD-4)
 *
 * Cross-tenant reads must be indistinguishable from a genuinely missing record:
 * return 404 with a neutral body, never 403 (which would confirm the record
 * exists in another tenant). 403 is reserved for in-scope-but-role-forbidden.
 */
import type { Response } from "express";

/** Send a neutral 404 that does not reveal whether the resource exists elsewhere. */
export function sendTenantNotFound(res: Response, resource = "Resource"): Response {
  return res.status(404).json({ message: `${resource} not found` });
}

/** Send a 403 for an authorization (not isolation) failure within the caller's tenant. */
export function sendForbidden(res: Response, message = "Access denied"): Response {
  return res.status(403).json({ message });
}
