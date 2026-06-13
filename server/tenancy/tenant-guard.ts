/**
 * SALIS-GMS — Tenant guard (scoped data-access primitive, Story 1.2)
 *
 * Deny-by-default building blocks for tenant-scoped queries. The authoritative
 * garage id comes from the request's Tenant Scope (AsyncLocalStorage), NOT from
 * caller-supplied values — so a query can never silently widen to all tenants
 * just because a route forgot to pass garageId (architecture AD-2 / FR-1).
 */
import { eq, sql, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";
import { getTenantScope } from "./tenant-context";

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
 * A Drizzle WHERE condition scoping `column` to the current garage, or matching
 * NOTHING (`false`) when no garage can be resolved. Drop-in replacement for the
 * legacy `if (garageId) conditions.push(eq(col, garageId))` pattern, which left
 * the predicate off entirely — and thus returned all tenants — when garageId
 * was absent.
 */
export function garageScope(column: AnyColumn, passed?: string | null): SQL {
  const gid = resolveScopedGarageId(passed);
  return gid ? eq(column, gid) : sql`false`;
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
