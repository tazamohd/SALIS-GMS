/**
 * SALIS-GMS — Tenant Context middleware
 *
 * Resolves the request's Tenant Scope and enters the AsyncLocalStorage store for
 * the full async lifetime of the request. Must run AFTER authentication so
 * `req.user` is populated.
 */
import type { Request, Response, NextFunction } from "express";
import { tenantContextStorage } from "./tenant-context";
import { resolveTenantScope } from "./tenant-scope";

export async function tenantContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const scope = await resolveTenantScope(req);
    // Enter the store and continue the middleware chain inside it; Express's
    // downstream handlers and their async continuations retain this context.
    tenantContextStorage.run(scope, () => next());
  } catch (err) {
    next(err as Error);
  }
}
