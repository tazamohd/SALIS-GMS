/**
 * SALIS-GMS — Tenant Context (multi-tenant isolation)
 *
 * Establishes a request-scoped Tenant Scope using AsyncLocalStorage so the data
 * access layer can enforce isolation WITHOUT any endpoint passing `garageId` by
 * hand (architecture decision AD-1 / FR-4 "safe by default").
 *
 * This module only ESTABLISHES and EXPOSES the scope. Consuming it to filter
 * queries (deny-by-default, removing the legacy "no garageId => return all"
 * fallback) is Story 1.2 and lands in the scoped data-access primitive.
 */
import { AsyncLocalStorage } from "node:async_hooks";

/** A Platform Principal acting within a specific tenant via an audited session. */
export interface ImpersonationContext {
  /** The platform principal performing the impersonation. */
  actorUserId: string;
  /** The Garage being impersonated into. */
  targetGarageId: string;
}

/**
 * The set of (Garage, Branch) a request is authorized to access, derived from
 * the authenticated User's Role Bindings. The single source of truth for tenant
 * isolation decisions in the data layer.
 */
export interface TenantScope {
  /** Authenticated user id, or null for anonymous/public requests. */
  userId: string | null;
  /** The Garage (tenant) id, or null for platform principals / anonymous. */
  garageId: string | null;
  /** Branch ids the user is bound to (from user_role_branch). */
  branchIds: string[];
  /** True when the principal is not bound to a single Garage (Super Admin). */
  isPlatformPrincipal: boolean;
  /** Present only while a platform principal is impersonating a tenant. */
  impersonation?: ImpersonationContext;
}

/**
 * Scope used for unauthenticated / public requests. Downstream (Story 1.2) treats
 * a null garageId as DENY (empty result set) — never as "return everything".
 */
export const ANONYMOUS_SCOPE: TenantScope = Object.freeze({
  userId: null,
  garageId: null,
  branchIds: [],
  isPlatformPrincipal: false,
});

export const tenantContextStorage = new AsyncLocalStorage<TenantScope>();

/** Run `fn` with the given Tenant Scope active for its full async lifetime. */
export function runWithTenantScope<T>(scope: TenantScope, fn: () => T): T {
  return tenantContextStorage.run(scope, fn);
}

/** The active Tenant Scope, or undefined if none has been established. */
export function getTenantScope(): TenantScope | undefined {
  return tenantContextStorage.getStore();
}

/**
 * The active Tenant Scope, throwing if none is established. Use in code paths
 * that must never run un-scoped (e.g. the scoped data-access primitive).
 */
export function requireTenantScope(): TenantScope {
  const scope = tenantContextStorage.getStore();
  if (!scope) {
    throw new Error(
      "Tenant scope is not established for this execution context. " +
        "Ensure tenantContextMiddleware ran, or wrap the work in runWithTenantScope().",
    );
  }
  return scope;
}

/** Convenience accessor for the current Garage id (null when unscoped/platform). */
export function getCurrentGarageId(): string | null {
  return tenantContextStorage.getStore()?.garageId ?? null;
}

/** True when a Tenant Scope (of any kind) is established. */
export function hasTenantScope(): boolean {
  return tenantContextStorage.getStore() !== undefined;
}
