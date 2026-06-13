/**
 * SALIS-GMS — Tenant guard (scoped data-access primitive, Story 1.2)
 *
 * Deny-by-default building blocks for tenant-scoped queries. The authoritative
 * garage id comes from the request's Tenant Scope (AsyncLocalStorage), NOT from
 * caller-supplied values — so a query can never silently widen to all tenants
 * just because a route forgot to pass garageId (architecture AD-2 / FR-1).
 */
import { eq, inArray, sql, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";
import { db } from "../db";
import { userRoleBranch } from "@shared/schema";
import { getTenantScope, hasTenantScope } from "./tenant-context";

/**
 * Resolve the authoritative garage id for a tenant-scoped query.
 *
 * Precedence:
 *  1. Active impersonation target (a platform principal acting inside a tenant).
 *  2. The Tenant Scope's garageId (the normal authenticated case).
 *  3. The explicitly passed id — a migration-era fallback used only when no
 *     Tenant Scope is established or for an un-impersonating platform principal.
 *
 * Returns `null` when nothing can be resolved → callers must DENY (empty set),
 * never fall back to returning every tenant's rows.
 */
export function resolveScopedGarageId(passed?: string | null): string | null {
  const scope = getTenantScope();
  if (scope) {
    const fromContext = scope.impersonation?.targetGarageId ?? scope.garageId;
    if (fromContext) return fromContext;
    // Authenticated platform principal not bound to a garage may target an
    // explicit id (e.g. support tooling); a normal user with no garage denies.
    if (scope.isPlatformPrincipal) return passed ?? null;
    return null;
  }
  // No Tenant Scope established (e.g. background job): honor an explicit id.
  return passed ?? null;
}

/**
 * A Drizzle WHERE condition scoping `column` to the current garage.
 *
 * Semantics (deny-by-default within a request, non-disruptive for background work):
 *  - A Tenant Scope IS established (every `/api` request — Story 1.1 sets at least
 *    an anonymous scope): constrain to the resolved garage, or match NOTHING
 *    (`false`) when none resolves (anonymous / tenant user without a garage).
 *  - NO Tenant Scope at all (background jobs, the workflow engine, seeds):
 *    honor an explicitly passed id, otherwise do not restrict (`true`). These
 *    paths are trusted and have no request tenant to scope to.
 *
 * Drop-in replacement for the legacy `if (garageId) conditions.push(eq(col, id))`
 * pattern, which omitted the predicate — and thus returned all tenants — whenever
 * garageId was absent inside a request.
 */
export function garageScope(column: AnyColumn, passed?: string | null): SQL {
  if (!hasTenantScope()) {
    return passed ? eq(column, passed) : sql`true`;
  }
  const gid = resolveScopedGarageId(passed);
  return gid ? eq(column, gid) : sql`false`;
}

/**
 * A Drizzle WHERE condition restricting `branchColumn` to the caller's Branch(es)
 * for branch-scoped resources.
 *
 *  - No Tenant Scope (background) or a garage-level / platform principal: no
 *    branch restriction (`true`) — the garage boundary is enforced separately by
 *    `garageScope`.
 *  - A branch-restricted user with bound branches: restrict to those branch ids.
 *  - A branch-restricted user with NO bound branches: deny (`false`).
 *
 * NOTE: not yet applied to any resource — the per-resource branch-vs-garage
 * matrix is PRD Open Question #1. Provided so resources can adopt it once the
 * matrix is confirmed, without re-deriving the rule each time.
 */
export function branchScope(branchColumn: AnyColumn): SQL {
  const scope = getTenantScope();
  if (!scope || !scope.isBranchRestricted) {
    return sql`true`;
  }
  return scope.branchIds.length > 0 ? inArray(branchColumn, scope.branchIds) : sql`false`;
}

/**
 * Branch restriction for tables keyed by USER (e.g. staff/technicians in `users`,
 * which has no branch column). Restricts to users who have a role binding in one
 * of the caller's branches. No restriction for garage-level/platform/background.
 */
export function branchScopeByUserId(userIdColumn: AnyColumn): SQL {
  const scope = getTenantScope();
  if (!scope || !scope.isBranchRestricted) {
    return sql`true`;
  }
  if (scope.branchIds.length === 0) {
    return sql`false`;
  }
  const branchMembers = db
    .select({ userId: userRoleBranch.userId })
    .from(userRoleBranch)
    .where(inArray(userRoleBranch.branchId, scope.branchIds));
  return inArray(userIdColumn, branchMembers);
}

/**
 * Record a detected cross-tenant access/mutation attempt (an "Isolation Leak"
 * attempt). For now this emits a structured, greppable/monitorable warning;
 * Story 5.1 wires this single hook into the immutable audit pipeline so the
 * event becomes a durable, tenant-attributed Audit Event.
 */
export function recordIsolationLeakAttempt(detail: {
  action: "create" | "update" | "delete" | "read";
  table?: string;
  suppliedGarageId?: string | null;
  scopedGarageId?: string | null;
  id?: string;
}): void {
  const scope = getTenantScope();
  // eslint-disable-next-line no-console
  console.warn(
    "[ISOLATION-LEAK]",
    JSON.stringify({
      ...detail,
      userId: scope?.userId ?? null,
      isPlatformPrincipal: scope?.isPlatformPrincipal ?? false,
      ts: new Date().toISOString(),
    }),
  );
  // Durably record the attempt (Story 5.1), fire-and-forget so it never blocks.
  if (detail.action === "create" || detail.action === "update" || detail.action === "delete") {
    void import("./audit-sink").then((m) => m.persistIsolationLeak(detail)).catch(() => {});
  }
}

/**
 * Stamp the authoritative garage id onto a create payload, server-side. Any
 * client-supplied garageId that differs from the request's Tenant Scope is
 * IGNORED (no client-controlled tenancy, FR-2) and recorded as an Isolation
 * Leak attempt. When no scope can be resolved (e.g. background jobs) the
 * provided value is preserved.
 */
export function stampGarageId<T extends { garageId?: string | null }>(data: T, table?: string): T {
  const supplied = data?.garageId ?? null;
  const scoped = resolveScopedGarageId(supplied);
  if (supplied && scoped && supplied !== scoped) {
    recordIsolationLeakAttempt({ action: "create", table, suppliedGarageId: supplied, scopedGarageId: scoped });
  }
  return { ...data, garageId: scoped ?? supplied };
}
