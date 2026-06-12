import type { Request, Response, NextFunction } from "express";

export type UserRole = 'ADMIN' | 'MANAGER' | 'ADVISOR' | 'TECHNICIAN' | 'ACCOUNTANT';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = user.role?.toUpperCase() || 'ADVISOR';
    
    if (userRole === 'ADMIN') {
      return next();
    }
    
    if (!allowedRoles.includes(userRole as UserRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${  allowedRoles.join(' or ')}`
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
