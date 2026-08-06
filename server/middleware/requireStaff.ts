import type { Request, Response, NextFunction } from "express";

/**
 * C-1 / C-2 fix — staff-endpoint lockout for customer sessions.
 *
 * A self-registered marketplace customer (`POST /api/customer/register`) gets a
 * real Passport session with `userType="customer"` / `role="CUSTOMER"` and,
 * critically, **no garageId**. The legacy monolith gates ~283 GET routes with
 * `isAuthenticated` only (no role/userType check), and the tenant-scope
 * middleware deliberately exempts customers — so such a session could read
 * staff surfaces (`/api/customers`, `/api/users`, `/api/invoices`,
 * `/api/hr/employees`, …). With a null garageId the getters' "no garage ⇒ all
 * tenants" behaviour turned that into a cross-tenant read (audit C-1 + C-2).
 *
 * This is the counterpart to `requireAuthByDefault`: default-DENY the staff
 * surface for customer sessions. A customer may only reach the explicitly
 * customer-facing namespaces below (their own data scopes by customerId, never
 * by garageId, so tenant isolation for customers is handled there). Staff
 * sessions (any non-customer userType) pass through untouched; per-role
 * authorization still applies via requireRole where attached.
 *
 * Placed AFTER requireAuthByDefault (so anonymous requests are already handled)
 * and BEFORE the garage-scope/tenant middleware.
 */

// Endpoints a customer session is legitimately allowed to reach. Anything not
// matched here is denied for customers. Entries are matched against req.path;
// `methods` (when present) further restricts which verbs are allowed.
type Rule = { pattern: string | RegExp; methods?: ReadonlyArray<string> };

const CUSTOMER_ALLOWED: ReadonlyArray<Rule> = [
  // --- session / auth plumbing ---
  { pattern: "/api/user" },
  { pattern: "/api/auth/user" },
  { pattern: "/api/logout", methods: ["POST"] },
  { pattern: "/api/auth/logout", methods: ["POST"] },
  { pattern: "/api/csrf-token" },
  // --- customer-owned data namespaces (scoped by customerId inside handlers) ---
  { pattern: /^\/api\/my\/.*/ },
  { pattern: /^\/api\/customer\/.*/ }, // profile, vehicles, invoices, appointments, communications, job-cards, otp
  { pattern: /^\/api\/customer-portal\/.*/ },
  { pattern: /^\/api\/portal\/.*/ },
  // --- marketplace browse + provider directory ---
  { pattern: /^\/api\/marketplace\/.*/ },
  { pattern: /^\/api\/public\/.*/ },
  { pattern: /^\/api\/plans$/ },
  // Browse garages/providers (read-only) for find-a-garage / booking flows.
  { pattern: /^\/api\/garages(\/[^/]+)?$/, methods: ["GET"] },
  { pattern: /^\/api\/providers(\/[^/]+)?$/, methods: ["GET"] },
  // VIN decode when adding a vehicle.
  { pattern: /^\/api\/vin(-decode)?\/.*/ },
  { pattern: /^\/api\/vin-decode$/, methods: ["GET", "POST"] },
  // Notifications for the signed-in customer (own).
  { pattern: /^\/api\/notifications\/.*/, methods: ["GET", "PATCH"] },
];

function isCustomerSession(user: any): boolean {
  if (!user) return false;
  const role = String(user.role || "").toUpperCase();
  return user.userType === "customer" || role === "CUSTOMER";
}

function isCustomerAllowed(method: string, path: string): boolean {
  return CUSTOMER_ALLOWED.some((rule) => {
    const matches =
      typeof rule.pattern === "string" ? path === rule.pattern : rule.pattern.test(path);
    if (!matches) return false;
    if (rule.methods && !rule.methods.includes(method.toUpperCase())) return false;
    return true;
  });
}

export function requireStaffByDefault(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith("/api")) return next();

  const user = (req as any).user;
  // Not a customer session (staff, platform admin, or anonymous — anonymous is
  // already handled by requireAuthByDefault) → no additional restriction here.
  if (!isCustomerSession(user)) return next();

  if (isCustomerAllowed(req.method, req.path)) return next();

  res.status(403).json({ message: "Forbidden: this resource is not available to customer accounts" });
  return;
}

export const __test = { isCustomerSession, isCustomerAllowed, CUSTOMER_ALLOWED };
