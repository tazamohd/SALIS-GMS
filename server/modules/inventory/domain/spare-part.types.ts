/**
 * Inventory (spare parts) domain types (Phase E2 — domain layer).
 *
 * This module covers the inventory-items core (spare parts + their per-garage
 * inventory rows). Inventory dashboards (`inventory-management.ts`), stock
 * alerts, audit trail, and transfers are further inventory sub-domains migrated
 * separately.
 */

import type { SparePart, SparePartInventory } from '../../../../shared/schema';

export type { SparePart, SparePartInventory };

export interface InventoryAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface SparePartListParams {
  auth: InventoryAuthContext;
  garageIdParam?: string;
  limit: number;
  offset: number;
}

export interface SparePartListResult {
  rows: SparePart[];
  total: number;
}
