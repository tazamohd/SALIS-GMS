// @ts-nocheck
/**
 * SALIS AUTO - RBAC Middleware
 *
 * Middleware functions for enforcing role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import {
  userRoleBranch,
  rolePermissions,
  permissions,
  permissionOverrides,
  roles
} from '@shared/schema';
import { eq, and, or, gte } from 'drizzle-orm';
import { hasPermission } from './rbac-config';

// Extend Express Request to include user permissions
declare global {
  namespace Express {
    interface Request {
      userPermissions?: Array<{ resource: string; action: string }>;
      userRoles?: Array<{ roleId: string; roleName: string; branchId: string }>;
    }
  }
}

const CACHE_TTL_MS = 5 * 60 * 1000;
interface CachedPermissions {
  permissions: Array<{ resource: string; action: string }>;
  roles: Array<{ roleId: string; roleName: string; branchId: string }>;
  expiresAt: number;
}
const permissionCache = new Map<string, CachedPermissions>();

export function invalidatePermissionCache(userId: string) { permissionCache.delete(userId); }
export function clearPermissionCache() { permissionCache.clear(); }

/**
 * Load user permissions and attach to request
 * This middleware should run after authentication
 */
export async function loadUserPermissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      // No user logged in, continue without permissions
      req.userPermissions = [];
      req.userRoles = [];
      return next();
    }

    const cached = permissionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      req.userPermissions = cached.permissions;
      req.userRoles = cached.roles;
      return next();
    }

    // Get user's roles and their permissions
    const userRolesData = await db
      .select({
        roleId: userRoleBranch.roleId,
        roleName: roles.name,
        branchId: userRoleBranch.branchId,
        roleScope: roles.scope,
        isSystemRole: roles.isSystemRole,
      })
      .from(userRoleBranch)
      .innerJoin(roles, eq(roles.id, userRoleBranch.roleId))
      .where(eq(userRoleBranch.userId, userId));

    // Store user roles on request
    req.userRoles = userRolesData.map(r => ({
      roleId: r.roleId,
      roleName: r.roleName,
      branchId: r.branchId,
    }));

    // Get all permissions for the user's roles
    const roleIds = userRolesData.map(r => r.roleId);
    const rolePermissionsData = await db
      .select({
        resource: permissions.resource,
        action: permissions.action,
        granted: rolePermissions.granted,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(
        and(
          or(...roleIds.map(id => eq(rolePermissions.roleId, id))),
          eq(rolePermissions.granted, true)
        )
      );

    // Get permission overrides for this user
    const now = new Date();
    const overrides = await db
      .select({
        resource: permissionOverrides.resource,
        action: permissionOverrides.action,
        allowed: permissionOverrides.allowed,
      })
      .from(permissionOverrides)
      .where(
        and(
          eq(permissionOverrides.userId, userId),
          or(
            eq(permissionOverrides.expiresAt, null),
            gte(permissionOverrides.expiresAt, now)
          )
        )
      );

    // Combine role permissions with overrides
    const permissionMap = new Map<string, boolean>();

    // First, add all role permissions
    rolePermissionsData.forEach(p => {
      const key = `${p.resource}:${p.action}`;
      permissionMap.set(key, p.granted);
    });

    // Then, apply overrides (these take precedence)
    overrides.forEach(o => {
      const key = `${o.resource}:${o.action}`;
      permissionMap.set(key, o.allowed);
    });

    // Convert to array and filter out denied permissions
    req.userPermissions = Array.from(permissionMap.entries())
      .filter(([_, allowed]) => allowed)
      .map(([key, _]) => {
        const [resource, action] = key.split(':');
        return { resource, action };
      });

    permissionCache.set(userId, {
      permissions: req.userPermissions,
      roles: req.userRoles!,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    next();
  } catch (error) {
    console.error('Error loading user permissions:', error);
    // Continue without permissions rather than blocking the request
    req.userPermissions = [];
    req.userRoles = [];
    next();
  }
}

/**
 * Middleware to check if user has specific permission
 * Usage: requirePermission('job_cards', 'create')
 */
export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if permissions are loaded
    if (!req.userPermissions) {
      res.status(500).json({ error: 'Permissions not loaded. Ensure loadUserPermissions middleware is used.' });
      return;
    }

    // Check if user has the required permission
    const hasAccess = hasPermission(req.userPermissions, resource, action);

    if (!hasAccess) {
      res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to ${action} ${resource}`,
        required: { resource, action }
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has ANY of the specified permissions
 * Usage: requireAnyPermission([['job_cards', 'read'], ['job_cards', 'view_own']])
 */
export function requireAnyPermission(permissionPairs: Array<[string, string]>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.userPermissions) {
      res.status(500).json({ error: 'Permissions not loaded' });
      return;
    }

    // Check if user has any of the required permissions
    const hasAccess = permissionPairs.some(([resource, action]) =>
      hasPermission(req.userPermissions!, resource, action)
    );

    if (!hasAccess) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You don\'t have any of the required permissions',
        required: permissionPairs.map(([r, a]) => ({ resource: r, action: a }))
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has ALL of the specified permissions
 * Usage: requireAllPermissions([['job_cards', 'read'], ['job_cards', 'update']])
 */
export function requireAllPermissions(permissionPairs: Array<[string, string]>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.userPermissions) {
      res.status(500).json({ error: 'Permissions not loaded' });
      return;
    }

    // Check if user has all of the required permissions
    const missingPermissions = permissionPairs.filter(([resource, action]) =>
      !hasPermission(req.userPermissions!, resource, action)
    );

    if (missingPermissions.length > 0) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You don\'t have all required permissions',
        missing: missingPermissions.map(([r, a]) => ({ resource: r, action: a }))
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has a specific role
 * Usage: requireRole('Service Manager')
 */
export function requireRole(roleName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.userRoles) {
      res.status(500).json({ error: 'Roles not loaded' });
      return;
    }

    const hasRole = req.userRoles.some(r => r.roleName === roleName);

    if (!hasRole) {
      res.status(403).json({
        error: 'Access denied',
        message: `Role '${roleName}' required`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has ANY of the specified roles
 * Usage: requireAnyRole(['Service Manager', 'General Manager'])
 */
export function requireAnyRole(roleNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.userRoles) {
      res.status(500).json({ error: 'Roles not loaded' });
      return;
    }

    const hasRole = req.userRoles.some(r => roleNames.includes(r.roleName));

    if (!hasRole) {
      res.status(403).json({
        error: 'Access denied',
        message: `One of these roles required: ${roleNames.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Check if user can access a specific branch
 */
export function requireBranchAccess(branchIdParam: string = 'branchId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.userRoles) {
      res.status(500).json({ error: 'Roles not loaded' });
      return;
    }

    // Get branch ID from params, query, or body
    const branchId = req.params[branchIdParam] || req.query[branchIdParam] || req.body?.branchId;

    if (!branchId) {
      res.status(400).json({ error: 'Branch ID required' });
      return;
    }

    // Check if user has role at this branch or system-wide role
    const hasAccess = req.userRoles.some(r =>
      r.branchId === branchId || r.branchId === null
    );

    if (!hasAccess) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You don\'t have access to this branch',
      });
      return;
    }

    next();
  };
}

/**
 * Helper function to check permission programmatically within route handlers
 */
export function checkPermission(
  req: Request,
  resource: string,
  action: string
): boolean {
  if (!req.userPermissions) {
    return false;
  }

  return hasPermission(req.userPermissions, resource, action);
}

/**
 * Helper function to get user's permissions as an array
 */
export function getUserPermissions(req: Request): Array<{ resource: string; action: string }> {
  return req.userPermissions || [];
}

/**
 * Helper function to get user's roles
 */
export function getUserRoles(req: Request): Array<{ roleId: string; roleName: string; branchId: string }> {
  return req.userRoles || [];
}
