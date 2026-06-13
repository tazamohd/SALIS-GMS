import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
  }
}

export function generateCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  next();
}

export function csrfTokenRoute(req: Request, res: Response): void {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.json({ csrfToken: req.session.csrfToken });
}

const SKIP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Auth entry points are exempt from CSRF - they create sessions and are
// protected by rate limiting instead. CSRF protects actions within an
// authenticated session, not the session creation itself.
// Paths checked against req.originalUrl (full path including mount prefix)
const CSRF_EXEMPT_PATHS = new Set([
  "/api/login",
  "/api/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/customer-portal/login",
  // Logout only tears down the caller's own session; a forced logout is a minor
  // nuisance rather than a security breach, so it is exempt from CSRF.
  "/api/logout",
  "/api/auth/logout",
]);

export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  if (SKIP_METHODS.has(req.method)) {
    return next();
  }

  // CSRF only protects requests authenticated via the session cookie — that is
  // the only credential an attacker can ride from a victim's browser. Requests
  // without an active passport session (public endpoints, server-to-server
  // webhooks, the separately-authenticated customer portal, kiosk walk-ins)
  // have no ambient session to abuse, so they are not subject to CSRF.
  const isAuthed = typeof (req as any).isAuthenticated === "function" && (req as any).isAuthenticated();
  if (!isAuthed) {
    return next();
  }

  // Use originalUrl so path matching works regardless of Express mount prefix
  if (CSRF_EXEMPT_PATHS.has(req.originalUrl.split("?")[0])) {
    return next();
  }

  const token = req.headers["x-csrf-token"] as string | undefined;
  const sessionToken = req.session.csrfToken;

  if (!token || !sessionToken) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }

  // Constant-time comparison: hash both sides to equal-length digests so
  // timingSafeEqual never throws on unequal length, and the comparison
  // itself doesn't leak token bytes via short-circuit timing.
  const tokenDigest = crypto.createHash("sha256").update(String(token)).digest();
  const sessionDigest = crypto.createHash("sha256").update(String(sessionToken)).digest();

  if (!crypto.timingSafeEqual(tokenDigest, sessionDigest)) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }

  next();
}
