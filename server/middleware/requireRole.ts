import type { Request, Response, NextFunction } from "express";

export type UserRole = 'ADMIN' | 'MANAGER' | 'ADVISOR' | 'TECHNICIAN' | 'ACCOUNTANT';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Deny-by-default: a missing/blank role must NOT silently inherit a working
    // role. Previously this fell back to 'ADVISOR', granting any roleless session
    // advisor-level access (audit finding H-1). A user with no role is denied.
    const userRole = user.role?.toUpperCase();
    if (!userRole) {
      return res.status(403).json({ message: "Access denied. No role assigned." });
    }

    if (userRole === 'ADMIN') {
      return next();
    }
    
    if (!allowedRoles.includes(userRole as UserRole)) {
      return res.status(403).json({ 
        message: "Access denied. Required role: " + allowedRoles.join(' or ')
      });
    }
    
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['ADMIN'])(req, res, next);
}

export function requireManagerOrAbove(req: Request, res: Response, next: NextFunction) {
  return requireRole(['ADMIN', 'MANAGER'])(req, res, next);
}

/**
 * Platform (super) admin only. This gates the /api/platform-admin/* control
 * plane, which spans EVERY tenant, so garage-level ADMIN must NOT pass — unlike
 * requireRole, which short-circuits for ADMIN. Only a PLATFORM_ADMIN role (or
 * the parallel userType='platform_admin' authority) is allowed.
 */
export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const role = (user.role ?? "").toUpperCase();
  const userType = (user.userType ?? "").toLowerCase();
  if (role === "PLATFORM_ADMIN" || role === "SUPER_ADMIN" || role === "SUPERADMIN" || userType === "platform_admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Platform administrator only." });
}
