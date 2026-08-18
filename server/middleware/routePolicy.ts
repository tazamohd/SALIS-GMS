import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "./requireRole";

/**
 * Per-endpoint role enforcement, declared as data.
 *
 * The sidebar already hides what a role shouldn't see (client/src/config/
 * navigation.ts), but hiding a menu entry does not stop anyone from calling the
 * API directly — a technician could still `curl` the payroll routes. This is
 * the server-side half of that boundary.
 *
 * It is a table rather than a thousand inline `requireRole([...])` arguments so
 * that the policy can be *read* in one sitting and diffed in review. A security
 * boundary scattered across 15k lines is one nobody can audit.
 *
 * Scope: routes listed here are enforced. Anything unlisted keeps the existing
 * behaviour (authenticated + staff-only via `requireAuthByDefault` and
 * `requireStaffByDefault`), so mounting this is additive and cannot widen
 * access. Domains are added deliberately, most-sensitive first.
 */

/** Roles allowed to reach a group of paths. ADMIN is implicitly allowed
 *  everywhere (mirroring `requireRole`), so it is never listed. */
export interface RoutePolicy {
  /** Matched against the path after `/api`, e.g. `/hr/employees/42`. */
  prefix: string;
  /** Methods this rule covers. Omit for all methods. */
  methods?: readonly string[];
  /** Non-admin roles permitted. An empty list means ADMIN-only. */
  roles: readonly UserRole[];
  /** Why this boundary exists — shown in review, not at runtime. */
  reason: string;
}

export const ROUTE_POLICIES: readonly RoutePolicy[] = [
  // ─── People and pay ──────────────────────────────────────────────────────
  // Salary, contracts and disciplinary records. The rebuilt HR screen redacts
  // salary via `fieldHidden('Employee salary')`; this is the same rule server-side.
  { prefix: "/hr", roles: ["MANAGER"], reason: "Employee records, salary and contracts" },
  { prefix: "/payroll", roles: ["MANAGER", "ACCOUNTANT"], reason: "Payroll runs and salary payments" },

  // ─── Money ───────────────────────────────────────────────────────────────
  { prefix: "/accounting", roles: ["MANAGER", "ACCOUNTANT"], reason: "Ledger and journal entries" },
  { prefix: "/financial-reports", roles: ["MANAGER", "ACCOUNTANT"], reason: "P&L and balance sheet" },
  { prefix: "/tax", roles: ["MANAGER", "ACCOUNTANT"], reason: "VAT and ZATCA filings" },

  // ─── Platform and security control planes ────────────────────────────────
  { prefix: "/security", roles: [], reason: "Security settings and audit configuration" },
  { prefix: "/licenses", roles: [], reason: "License keys and entitlements" },
  { prefix: "/compliance", roles: ["MANAGER"], reason: "Regulatory compliance records" },

  // ─── Tenant-wide configuration ───────────────────────────────────────────
  // Read is broad (screens show connection status); writes are privileged.
  { prefix: "/integrations", methods: ["POST", "PUT", "PATCH", "DELETE"], roles: ["MANAGER"], reason: "Third-party credentials and webhooks" },
  { prefix: "/dynamic-pricing", methods: ["POST", "PUT", "PATCH", "DELETE"], roles: ["MANAGER"], reason: "Pricing rules affect every quote" },
];

const ALL_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

/** True when `path` is inside `prefix` — `/hr` matches `/hr` and `/hr/x`,
 *  but never `/hrothers`. */
function underPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + "/");
}

export function policyFor(method: string, path: string): RoutePolicy | undefined {
  const upper = method.toUpperCase();
  return ROUTE_POLICIES.find(
    (policy) =>
      underPrefix(path, policy.prefix) &&
      (policy.methods ?? ALL_METHODS).includes(upper),
  );
}

/**
 * Enforces `ROUTE_POLICIES`. Mount after authentication so `req.user` is set;
 * unauthenticated requests are already rejected upstream, but this fails closed
 * rather than assuming that.
 */
export function enforceRoutePolicy(req: Request, res: Response, next: NextFunction) {
  // `req.path` here is relative to the mount point (`/api`).
  const policy = policyFor(req.method, req.path);
  if (!policy) return next();

  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const role = (user.role ?? "").toUpperCase();
  // A session with no role is denied outright — the same deny-by-default rule
  // `requireRole` enforces after audit finding H-1.
  if (!role) {
    return res.status(403).json({ message: "Access denied. No role assigned." });
  }

  // Platform admins operate above the tenant; garage ADMIN is allowed here
  // because these are tenant-scoped resources, matching `requireRole`.
  if (role === "ADMIN" || role === "PLATFORM_ADMIN" || role === "SUPER_ADMIN" || role === "SUPERADMIN") {
    return next();
  }

  if (!policy.roles.includes(role as UserRole)) {
    return res.status(403).json({
      message: policy.roles.length
        ? "Access denied. Required role: " + ["ADMIN", ...policy.roles].join(" or ")
        : "Access denied. Administrator only.",
    });
  }

  return next();
}
