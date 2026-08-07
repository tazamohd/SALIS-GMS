/**
 * Supplier domain types (Phase E2 — domain layer).
 *
 * Covers the suppliers core (suppliers + supplier price lists). Purchase orders,
 * deliveries, reorder-settings, and pricing-history are adjacent
 * procurement/pricing sub-domains migrated separately.
 */

import type { Supplier, SupplierPriceList } from '../../../../shared/schema';

export type { Supplier, SupplierPriceList };

export interface SupplierAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface SupplierListParams {
  auth: SupplierAuthContext;
  garageIdParam?: string;
  limit: number;
  offset: number;
}

export interface SupplierListResult {
  rows: Supplier[];
  total: number;
}
