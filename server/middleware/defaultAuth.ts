import type { Request, Response, NextFunction } from "express";

const PUBLIC_ROUTES: Array<string | RegExp> = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/csrf-token",
  "/api/health",
  "/api/ready",
  /^\/api\/public\/.*/,
];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => {
    if (typeof pattern === "string") {
      return path === pattern;
    }
    return pattern.test(path);
  });
}

export function requireAuthByDefault(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith("/api")) {
    return next();
  }

  if (isPublicRoute(req.path)) {
    return next();
  }

  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: "Authentication required" });
  return;
}
