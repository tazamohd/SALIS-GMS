import type { Request, Response, NextFunction } from "express";

const PUBLIC_ROUTES: Array<string | RegExp> = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/login",
  "/api/register",
  "/api/customer-portal/login",
  // Public garage onboarding signup — creates a PENDING application for a
  // PLATFORM_ADMIN to review. No session exists yet (the garage isn't
  // provisioned until approval), so it must be anonymous.
  "/api/garage-applications",
  // Public customer signup for the marketplace (creates the session itself).
  "/api/customer/register",
  // Public marketplace browsing (provider directory + smart search) — a
  // customer can look before creating an account.
  /^\/api\/marketplace\/.*/,
  "/api/csrf-token",
  "/api/health",
  "/api/health/live",
  "/api/health/ready",
  "/api/ready",
  /^\/api\/public\/.*/,
  /^\/api\/plans$/,
  // Demo access (role list + one-click demo login) is intentionally anonymous
  // and is itself gated by isDemoModeEnabled() inside the handlers.
  /^\/api\/demo\/.*/,
  // Self-service kiosk lives in shop-floor tablets without a user session.
  // The walk-in queue, service catalog, and registration endpoints must be
  // reachable anonymously by design.
  /^\/api\/kiosk\/.*/,
  // Payment/messaging webhooks are server-to-server callbacks with NO user
  // session — they authenticate via provider signature, not our auth. They
  // must remain reachable anonymously (default-deny would break settlement
  // and WhatsApp verification). Each handler is responsible for verifying its
  // own signature (see the payments/compliance audit).
  "/api/stripe/webhook",
  "/api/whatsapp/webhook",
  /^\/api\/payments\/webhook\/[^/]+$/,
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
