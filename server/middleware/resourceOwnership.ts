/**
 * Central object-level authorization (audit finding H-1).
 *
 * The security floor (requireAuthByDefault + enforceGarageScopeOnQuery +
 * enforceTenantOnBody) pins the tenant on the query string and request body,
 * but it CANNOT enforce ownership on a `:id` PATH parameter — a handler that
 * looks a row up by id with no garage predicate lets any authenticated staff
 * user read/mutate another tenant's record by UUID.
 *
 * `requireResourceOwnership` closes that gap declaratively: mounted in a
 * route's middleware chain, it loads the target row's tenant (directly from a
 * `garage_id` column, or through a parent table for child records that lack
 * one) and 404s when it isn't the caller's garage — BEFORE the handler runs,
 * so the handler's own (still id-only) storage call only ever touches an
 * already-verified-owned row.
 *
 *   app.patch('/api/refunds/:id', isAuthenticated, requireManagerOrAbove,
 *     requireResourceOwnership({ table: 'refunds' }), handler);
 *
 *   // child record scoped through its parent's garage:
 *   app.get('/api/fleet/vehicles/:id', isAuthenticated,
 *     requireResourceOwnership({ table: 'fleet_vehicles',
 *       parent: { table: 'fleet_groups', fk: 'fleet_group_id' } }), handler);
 *
 * Table/column names come only from these developer-authored configs (never
 * request input), so `sql.raw` on them is injection-safe; the id and garage
 * are always parameterized.
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db";

const CROSS_GARAGE_ROLES = new Set(["PLATFORM_ADMIN", "SUPER_ADMIN", "SUPERADMIN"]);

// Guard against a config typo becoming a SQL fragment: identifiers must be
// plain snake_case. Anything else throws at wire-up (fail fast), not runtime.
const IDENT = /^[a-z_][a-z0-9_]*$/;
function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`resourceOwnership: unsafe identifier ${JSON.stringify(name)}`);
  return name;
}

export interface OwnershipConfig {
  /** The table the :id addresses, e.g. "refunds". */
  table: string;
  /** Route param holding the row id. Default "id". */
  idParam?: string;
  /** Tenant column on `table` when it has one directly. Default "garage_id". */
  tenantColumn?: string;
  /** For child tables with no garage_id: scope through a parent's tenant. */
  parent?: {
    table: string;
    /** FK column on the child pointing at the parent's PK. */
    fk: string;
    /** Parent's PK column. Default "id". */
    parentIdColumn?: string;
    /** Parent's tenant column. Default "garage_id". */
    tenantColumn?: string;
  };
}

export function requireResourceOwnership(config: OwnershipConfig): RequestHandler {
  const table = ident(config.table);
  const idParam = config.idParam ?? "id";
  const tenantColumn = ident(config.tenantColumn ?? "garage_id");
  const parent = config.parent
    ? {
        table: ident(config.parent.table),
        fk: ident(config.parent.fk),
        parentIdColumn: ident(config.parent.parentIdColumn ?? "id"),
        tenantColumn: ident(config.parent.tenantColumn ?? "garage_id"),
      }
    : undefined;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user || {};
    const role = String(user.role || "").toUpperCase();
    // Platform/cross-garage roles may reach any tenant's rows.
    if (CROSS_GARAGE_ROLES.has(role)) return next();
    const garageId = user.garageId;
    // No session garage → nothing to pin against; leave it to the handler /
    // other guards (customers are scoped by customerId elsewhere).
    if (!garageId) return next();

    const id = (req.params as any)[idParam];
    if (!id) return next();

    try {
      const q = parent
        ? sql`SELECT 1 FROM ${sql.raw(table)} t
               JOIN ${sql.raw(parent.table)} p ON t.${sql.raw(parent.fk)} = p.${sql.raw(parent.parentIdColumn)}
               WHERE t.id = ${id} AND p.${sql.raw(parent.tenantColumn)} = ${garageId}
               LIMIT 1`
        : sql`SELECT 1 FROM ${sql.raw(table)}
               WHERE id = ${id} AND ${sql.raw(tenantColumn)} = ${garageId}
               LIMIT 1`;
      const result = await db.execute(q);
      if (result.rows.length === 0) {
        res.status(404).json({ message: "Not found" });
        return;
      }
      next();
    } catch (err) {
      console.error(`[resourceOwnership] check failed for ${table}:`, err);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
}
