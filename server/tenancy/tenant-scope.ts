/**
 * SALIS-GMS — Tenant Scope resolution
 *
 * Derives the TenantScope for a request from the authenticated user
 * (`req.user.garageId`) and the user's Role Bindings (`user_role_branch`).
 */
import type { Request } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { userRoleBranch } from "@shared/schema";
import type { TenantScope } from "./tenant-context";
import { ANONYMOUS_SCOPE } from "./tenant-context";

function unique(ids: Array<string | null | undefined>): string[] {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

/**
 * Resolve the Tenant Scope for the given request.
 *
 * - Unauthenticated requests resolve to ANONYMOUS_SCOPE (deny-by-default downstream).
 * - garageId comes from the authenticated user; absence denotes a Platform Principal
 *   (a Super Admin not bound to a single Garage). [ASSUMPTION: no explicit super-admin
 *   flag exists today; revisit if one is added.]
 * - branchIds reuse `req.userRoles` when loadUserPermissions already populated them,
 *   otherwise fall back to a direct indexed user_role_branch lookup.
 */
/**
 * Coarse roles that operate at the Garage level (see all Branches). Everyone
 * else with branch bindings is treated as branch-restricted.
 * [ASSUMPTION] This classification is provisional — the authoritative
 * per-role / per-resource matrix is PRD Open Question #1. `branchScope` is not
 * yet applied to any resource, so this only populates the scope flag.
 */
const GARAGE_LEVEL_ROLES = new Set(["ADMIN", "MANAGER", "OWNER", "GARAGE_OWNER", "SUPER_ADMIN"]);

export async function resolveTenantScope(req: Request): Promise<TenantScope> {
  const user = req.user as { id?: string; garageId?: string | null; role?: string | null } | undefined;

  if (!user?.id) {
    return ANONYMOUS_SCOPE;
  }

  const garageId: string | null = user.garageId ?? null;
  const isPlatformPrincipal = !garageId;
  const isGarageLevelRole = !!user.role && GARAGE_LEVEL_ROLES.has(user.role.toUpperCase());

  let branchIds: string[] = [];
  const preloaded = (req as Request & {
    userRoles?: Array<{ branchId: string | null }>;
  }).userRoles;

  if (preloaded && preloaded.length > 0) {
    branchIds = unique(preloaded.map((r) => r.branchId));
  } else {
    const rows = await db
      .select({ branchId: userRoleBranch.branchId })
      .from(userRoleBranch)
      .where(eq(userRoleBranch.userId, user.id));
    branchIds = unique(rows.map((r) => r.branchId));
  }

  return {
    userId: user.id,
    garageId,
    branchIds,
    isBranchRestricted: !isPlatformPrincipal && !isGarageLevelRole && branchIds.length > 0,
    isPlatformPrincipal,
  };
}
