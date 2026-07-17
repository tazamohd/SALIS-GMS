/**
 * Shared management-access check for garage-wide analytics endpoints.
 *
 * Authorizes on `user.userType` (lowercase). NOTE: this is a parallel authority
 * surface to the `role`-based `requireRole` middleware — unify when reconciling
 * RBAC (audit H-2). Fail-closed: a missing/empty `userType` is denied (audit H-1).
 */

/** User types permitted to view management-only (garage-wide) analytics. */
export const MANAGEMENT_TYPES = new Set(["admin", "manager", "owner", "accountant", "staff"]);

/**
 * Returns true only when the user has a `userType` present in MANAGEMENT_TYPES.
 * A null/undefined/empty `userType` returns false (denied) — fail-closed.
 */
export function isManagementUser(user: { userType?: string | null } | undefined): boolean {
  return !!user?.userType && MANAGEMENT_TYPES.has(user.userType);
}
