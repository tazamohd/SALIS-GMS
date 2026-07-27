/**
 * Demo access configuration — single source of truth for the seeded demo
 * accounts and the demo-login gate.
 *
 * The app has two role systems:
 *  - the rich RBAC `STANDARD_ROLES` (~20 roles, granular permissions via the
 *    roles/permissions/userRoleBranch tables), and
 *  - the simple `users.role` column that the runtime route guards
 *    (server/middleware/requireRole.ts) and resolveGarageScope enforce, which
 *    only understands ADMIN | MANAGER | ADVISOR | TECHNICIAN | ACCOUNTANT.
 *
 * Rather than expose all ~20 granular roles (overwhelming on the login screen
 * and mostly redundant for a walkthrough), the demo offers ONE curated persona
 * per guard role — the five access levels the runtime guards actually
 * distinguish. Each persona is given BOTH a granular RBAC assignment (its
 * STANDARD_ROLE) AND a `users.role` mapped to its guard value, so no demo login
 * ever hits a 403. This module owns that mapping so the seed and the demo-login
 * endpoint never drift apart.
 */
import { STANDARD_ROLES } from "./rbac-config";

export type GuardRole = "ADMIN" | "MANAGER" | "ADVISOR" | "TECHNICIAN" | "ACCOUNTANT";

/** Every STANDARD_ROLES key — used to keep the curated personas type-safe. */
type RoleKey = keyof typeof STANDARD_ROLES;

export interface DemoRoleSpec {
  /** STANDARD_ROLES key, e.g. "OWNER". */
  roleKey: string;
  /** Display name from STANDARD_ROLES (also the `roles.name` used to link RBAC). */
  roleName: string;
  /** Value written to users.role so the simple route guards accept the session. */
  guardRole: GuardRole;
  /** Value written to users.userType (drives portal routing + profile type). */
  userType: string;
  /** Deterministic, seed-stable demo login email. */
  email: string;
  /** Short, friendly label shown on the login quick-pick button. */
  label: string;
  /** One-line description of what this persona can do, shown under the label. */
  description: string;
}

/** Domain used for the deterministic, non-routable demo emails. */
export const DEMO_EMAIL_DOMAIN = "demo.salisauto.com";

/**
 * A demo persona, keyed to a real STANDARD_ROLE. `roleKey` is constrained to a
 * STANDARD_ROLES key, so a typo or a removed role becomes a compile error.
 */
interface DemoPersona {
  roleKey: RoleKey;
  guardRole: GuardRole;
  userType: string;
  label: string;
  description: string;
}

/**
 * Curated personas — richer labels/descriptions for the five headline roles
 * shown most prominently on the login quick-pick. Every remaining
 * STANDARD_ROLE is still exposed as a demo account below, with its guard
 * role derived from the mapping table.
 */
const CURATED_PERSONAS: readonly DemoPersona[] = [
  {
    roleKey: "OWNER",
    guardRole: "ADMIN",
    userType: "admin",
    label: "Business Owner",
    description: "Full access — every module across the garage",
  },
  {
    roleKey: "GENERAL_MANAGER",
    guardRole: "MANAGER",
    userType: "manager",
    label: "General Manager",
    description: "Operations, staff, reports & dashboards",
  },
  {
    roleKey: "SERVICE_ADVISOR",
    guardRole: "ADVISOR",
    userType: "advisor",
    label: "Service Advisor",
    description: "Front desk — customers, jobs & estimates",
  },
  {
    roleKey: "TECHNICIAN",
    guardRole: "TECHNICIAN",
    userType: "technician",
    label: "Technician",
    description: "Workshop — assigned jobs & inspections",
  },
  {
    roleKey: "ACCOUNTANT",
    guardRole: "ACCOUNTANT",
    userType: "accountant",
    label: "Accountant",
    description: "Invoices, payments & financial reports",
  },
];

/**
 * Guard-role mapping for every non-curated STANDARD_ROLE, so the full ~20-role
 * catalog is demo-able (the demo-access suite requires all of them listed).
 */
const ROLE_GUARD_MAP: Record<string, { guardRole: GuardRole; userType: string }> = {
  SYSTEM_ADMIN: { guardRole: "ADMIN", userType: "admin" },
  SERVICE_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  PARTS_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  LEAD_TECHNICIAN: { guardRole: "TECHNICIAN", userType: "technician" },
  FINANCE_MANAGER: { guardRole: "ACCOUNTANT", userType: "accountant" },
  HR_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  MARKETING_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  CSR: { guardRole: "ADVISOR", userType: "advisor" },
  RECEPTIONIST: { guardRole: "ADVISOR", userType: "advisor" },
  QC_INSPECTOR: { guardRole: "TECHNICIAN", userType: "technician" },
  WAREHOUSE_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  FRANCHISE_MANAGER: { guardRole: "MANAGER", userType: "manager" },
  ANALYST: { guardRole: "MANAGER", userType: "manager" },
  CALL_CENTER_AGENT: { guardRole: "ADVISOR", userType: "advisor" },
  APPRENTICE: { guardRole: "TECHNICIAN", userType: "technician" },
};

/** Every STANDARD_ROLE as a demo account: curated personas first, then the
 *  rest with names/descriptions taken from the role catalog itself. */
export const DEMO_ROLES: DemoRoleSpec[] = [
  ...CURATED_PERSONAS.map((persona) => ({
    roleKey: persona.roleKey as string,
    roleName: (STANDARD_ROLES[persona.roleKey] as { name: string }).name,
    guardRole: persona.guardRole,
    userType: persona.userType,
    email: `${(persona.roleKey as string).toLowerCase()}@${DEMO_EMAIL_DOMAIN}`,
    label: persona.label,
    description: persona.description,
  })),
  ...Object.entries(ROLE_GUARD_MAP).map(([roleKey, mapping]) => {
    const role = STANDARD_ROLES[roleKey as RoleKey] as { name: string; description: string };
    return {
      roleKey,
      roleName: role.name,
      guardRole: mapping.guardRole,
      userType: mapping.userType,
      email: `${roleKey.toLowerCase()}@${DEMO_EMAIL_DOMAIN}`,
      label: role.name,
      description: role.description,
    };
  }),
];

/** Look up a demo spec by its STANDARD_ROLE key (case-insensitive). */
export function getDemoRole(roleKey: string): DemoRoleSpec | undefined {
  const key = String(roleKey || "").toUpperCase();
  return DEMO_ROLES.find((r) => r.roleKey === key);
}

/**
 * Whether demo access (seeding + one-click demo login) is enabled.
 *
 * Explicit `DEMO_MODE` wins; otherwise demo access is on in any non-production
 * environment and off in production. This gates BOTH the public demo endpoints
 * and is the default guard for the seed script.
 */
export function isDemoModeEnabled(): boolean {
  const flag = String(process.env.DEMO_MODE || "").toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV !== "production";
}

/**
 * Shared password applied to every demo account.
 *
 * Defaults to a well-known value for zero-config local demos; override with
 * DEMO_SEED_PASSWORD for any shared environment. This is intentionally not a
 * real secret — demo accounts are gated by isDemoModeEnabled(), are blocked
 * from the normal login form when demo mode is off (see server/auth.ts), and
 * the one-click demo login never sends this password to the client.
 */
export function getDemoPassword(): string {
  return process.env.DEMO_SEED_PASSWORD || "Demo123!";
}
