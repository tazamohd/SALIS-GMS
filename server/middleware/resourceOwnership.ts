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

/** A join hop from a child table up to a table nearer the tenant root. */
export interface ParentHop {
  table: string;
  /** FK column on the child pointing at this table's PK. */
  fk: string;
  /** This table's PK column. Default "id". */
  parentIdColumn?: string;
  /** This table's tenant column (used when there is no further hop). Default "garage_id". */
  tenantColumn?: string;
  /** A further hop up, when this table also lacks a tenant column. */
  parent?: ParentHop;
}

export interface OwnershipConfig {
  /** The table the :id addresses, e.g. "refunds". */
  table: string;
  /** Route param holding the row id. Default "id". */
  idParam?: string;
  /** Tenant column on `table` when it has one directly. Default "garage_id". */
  tenantColumn?: string;
  /**
   * Two-or-more tenant columns on `table` that each hold a garage id; the row
   * is visible when ANY of them matches the caller's garage (e.g. an inventory
   * transfer's from_garage_id / to_garage_id — both parties may see it).
   */
  tenantColumns?: string[];
  /** For child tables with no garage_id: scope through a parent's tenant (1+ hops). */
  parent?: ParentHop;
}

interface NormHop {
  table: string;
  fk: string;
  parentIdColumn: string;
  tenantColumn: string;
  parent?: NormHop;
}

function normHop(h: ParentHop): NormHop {
  return {
    table: ident(h.table),
    fk: ident(h.fk),
    parentIdColumn: ident(h.parentIdColumn ?? "id"),
    tenantColumn: ident(h.tenantColumn ?? "garage_id"),
    parent: h.parent ? normHop(h.parent) : undefined,
  };
}

export function requireResourceOwnership(config: OwnershipConfig): RequestHandler {
  const table = ident(config.table);
  const idParam = config.idParam ?? "id";
  const tenantColumn = ident(config.tenantColumn ?? "garage_id");
  const tenantColumns = config.tenantColumns?.map(ident);
  const parent = config.parent ? normHop(config.parent) : undefined;

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
      let q;
      if (parent) {
        // Walk the parent chain, aliasing each join level a0, a1, ...; the
        // tenant predicate lands on the last hop (the one nearest the root).
        const joins: any[] = [];
        let childAlias = "t";
        let hop: NormHop | undefined = parent;
        let level = 0;
        let tenantPred = sql``;
        while (hop) {
          const alias = `a${level}`;
          joins.push(
            sql` JOIN ${sql.raw(hop.table)} ${sql.raw(alias)} ON ${sql.raw(childAlias)}.${sql.raw(hop.fk)} = ${sql.raw(alias)}.${sql.raw(hop.parentIdColumn)}`,
          );
          if (!hop.parent) {
            tenantPred = sql`${sql.raw(alias)}.${sql.raw(hop.tenantColumn)} = ${garageId}`;
          }
          childAlias = alias;
          hop = hop.parent;
          level++;
        }
        q = sql`SELECT 1 FROM ${sql.raw(table)} t${sql.join(joins, sql``)} WHERE t.id = ${id} AND ${tenantPred} LIMIT 1`;
      } else if (tenantColumns && tenantColumns.length) {
        // Dual (or multi) tenant column: the row is owned if ANY column matches.
        const ors = tenantColumns.map((c) => sql`${sql.raw(c)} = ${garageId}`);
        q = sql`SELECT 1 FROM ${sql.raw(table)} WHERE id = ${id} AND (${sql.join(ors, sql` OR `)}) LIMIT 1`;
      } else {
        q = sql`SELECT 1 FROM ${sql.raw(table)} WHERE id = ${id} AND ${sql.raw(tenantColumn)} = ${garageId} LIMIT 1`;
      }
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
