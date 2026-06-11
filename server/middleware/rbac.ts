import type { Request, Response, NextFunction } from "express";

export type UserRole = "ADMIN" | "MANAGER" | "ADVISOR" | "TECHNICIAN" | "ACCOUNTANT";

/**
 * Require authentication (reusable standalone middleware).
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Authentication required" });
}

/**
 * Require the authenticated user to have one of the specified roles.
 * ADMIN always passes regardless of the list provided.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = (req as any).user;
    // Deny-by-default: a missing/blank role must NOT silently inherit a working
    // role. Previously this fell back to "ADVISOR", silently granting access to
    // any roleless session (security gate H-1).
    const rawRole = user?.role?.toUpperCase();
    if (!rawRole) {
      return res.status(403).json({ message: "Insufficient permissions: no role assigned" });
    }
    const userRole = rawRole as UserRole;

    // ADMIN always has access
    if (userRole === "ADMIN") {
      return next();
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Insufficient permissions. Required role: " + roles.join(" or "),
      });
    }

    next();
  };
}

/**
 * Extract garageId from the authenticated user's session.
 * Returns null when the user has no garageId (e.g. super-admins).
 */
export function getGarageId(req: Request): string | null {
  const user = (req as any).user;
  return user?.garageId || null;
}

/**
 * Middleware that injects the user's garageId into `req.query.garage_id`
 * (and `req.query.garageId`) so that downstream handlers automatically
 * scope queries to the user's tenant.  If the user is an ADMIN without a
 * garageId the original query value (if any) is left untouched.
 */
export function injectGarageId(req: Request, _res: Response, next: NextFunction) {
  const user = (req as any).user;
  const garageId: string | undefined = user?.garageId;

  if (garageId) {
    // Enforce tenant isolation — always override query param with session value
    (req.query as any).garage_id = garageId;
    (req.query as any).garageId = garageId;
  }
  next();
}
