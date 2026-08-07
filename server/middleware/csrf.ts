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
  // Demo one-click login creates a session (like /api/login) and is demo-gated.
  "/api/demo/login",
  // Public no-session entry points: nothing to forge — there is no session yet.
  "/api/garage-applications",
  "/api/customer/register",
]);

// Server-to-server callbacks and sessionless kiosks authenticate by provider
// signature / their own gating, not cookies, so CSRF does not apply.
const CSRF_EXEMPT_PATTERNS: RegExp[] = [
  /^\/api\/stripe\/webhook$/,
  /^\/api\/whatsapp\/webhook$/,
  /^\/api\/payments\/webhook\/[^/]+$/,
  /^\/api\/kiosk\//,
  /^\/api\/demo\//,
  /^\/api\/public\//,
];

/**
 * Whether mutating requests must carry X-CSRF-Token. Read at REQUEST time (not
 * mount time) so tests can toggle it via CSRF_ENFORCE=true|false.
 *
 * Fail-safe ON (audit H-3): the previous default enforced ONLY when
 * NODE_ENV === "production", so any other deployment (staging, "prod"-typo,
 * unset NODE_ENV) silently ran with CSRF disabled. Default to enforcing
 * everywhere and carve out only the test runner, whose supertest agents don't
 * perform the /api/csrf-token round-trip. The browser client already fetches
 * and sends the token, so real dev/prod traffic is unaffected. Set
 * CSRF_ENFORCE=false for an explicit local opt-out.
 */
export function csrfEnforcementEnabled(): boolean {
  const v = process.env.CSRF_ENFORCE;
  if (v !== undefined) return v === "true";
  return process.env.NODE_ENV !== "test";
}

/** Request-time gate around validateCsrfToken (mount this). */
export function enforceCsrf(req: Request, res: Response, next: NextFunction): void {
  if (!csrfEnforcementEnabled()) return next();
  return validateCsrfToken(req, res, next);
}

export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  if (SKIP_METHODS.has(req.method)) {
    return next();
  }

  // Use originalUrl so path matching works regardless of Express mount prefix
  const path = req.originalUrl.split("?")[0];
  if (CSRF_EXEMPT_PATHS.has(path)) {
    return next();
  }
  if (CSRF_EXEMPT_PATTERNS.some((re) => re.test(path))) {
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
