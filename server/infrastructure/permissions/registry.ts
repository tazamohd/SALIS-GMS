/**
 * Central permission registry (Phase E8 — RBAC 2.0).
 *
 * One source of truth for permissions, role grants, and policy overrides,
 * replacing scattered inline role checks. Authorization resolves in order:
 *
 *   1. an explicit policy for the permission key (attribute/ownership/tenant
 *      aware), else
 *   2. a static role grant.
 *
 * The same registry can be shared with the client to drive UI authorization,
 * keeping server and UI permission definitions in lockstep.
 */

import type { RequestHandler } from 'express';
import { AuthorizationError, AuthenticationError } from '../errors/domain-errors';

export interface PermissionDef {
  key: string;
  description: string;
  category?: string;
}

export interface AuthzSubject {
  id?: string;
  role?: string;
  garageId?: string | null;
  userType?: string;
}

export interface ResourceContext {
  garageId?: string | null;
  ownerId?: string | null;
}

export type Policy = (subject: AuthzSubject, resource?: ResourceContext) => boolean;

/**
 * Tenant guard: a subject with a garage may only touch resources in that garage;
 * a garage-less subject (platform admin) or a garage-less resource passes.
 */
export function sameTenant(subject: AuthzSubject, resource?: ResourceContext): boolean {
  if (!subject.garageId) return true;
  if (resource?.garageId == null) return true;
  return subject.garageId === resource.garageId;
}

/** Ownership guard: the subject owns the resource (or platform admin). */
export function isOwner(subject: AuthzSubject, resource?: ResourceContext): boolean {
  if (!subject.garageId) return true;
  if (resource?.ownerId == null) return true;
  return subject.id === resource.ownerId;
}

export class PermissionRegistry {
  private readonly permissions = new Map<string, PermissionDef>();
  private readonly rolePermissions = new Map<string, Set<string>>();
  private readonly policies = new Map<string, Policy>();

  definePermission(def: PermissionDef): this {
    this.permissions.set(def.key, def);
    return this;
  }

  /** Grant one or more permission keys to a role. */
  grant(role: string, ...keys: string[]): this {
    const set = this.rolePermissions.get(role) ?? new Set<string>();
    for (const k of keys) set.add(k);
    this.rolePermissions.set(role, set);
    return this;
  }

  /** Attach an attribute/ownership/tenant-aware policy to a permission key. */
  definePolicy(key: string, policy: Policy): this {
    this.policies.set(key, policy);
    return this;
  }

  can(subject: AuthzSubject, key: string, resource?: ResourceContext): boolean {
    const policy = this.policies.get(key);
    if (policy) return policy(subject, resource);
    return this.rolePermissions.get(subject.role ?? '')?.has(key) ?? false;
  }

  list(): PermissionDef[] {
    return [...this.permissions.values()];
  }
}

/**
 * Express guard factory. 401 if unauthenticated, 403 if the subject lacks the
 * permission. `resourceFrom` optionally derives resource context from the
 * request for ownership/tenant policies.
 */
export function authorize(
  registry: PermissionRegistry,
  key: string,
  resourceFrom?: (req: { user?: unknown; params?: Record<string, string> }) => ResourceContext,
): RequestHandler {
  return (req, _res, next) => {
    const user = (req as { user?: AuthzSubject }).user;
    if (!user) return next(new AuthenticationError('Authentication required'));
    const resource = resourceFrom?.(req as never);
    if (!registry.can(user, key, resource)) {
      return next(new AuthorizationError('You do not have permission to perform this action'));
    }
    next();
  };
}
