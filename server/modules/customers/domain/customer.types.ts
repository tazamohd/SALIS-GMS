/**
 * Customer domain types (Phase E2 — Layered Architecture, domain layer).
 *
 * The customer entity is a `users` row of type "customer" with the password
 * stripped (`SafeUser`). These aliases give the module a stable domain
 * vocabulary independent of the storage layer's naming.
 */

import type { SafeUser } from '../../../storage';

export type Customer = SafeUser;

/** Authenticated caller context relevant to customer authorization. */
export interface CustomerAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

/** Normalized inputs for a customer list query. */
export interface CustomerListQuery {
  garageId?: string;
  search?: string;
  limit: number;
  offset: number;
  explicit: boolean;
}

export interface CustomerListResult {
  rows: Customer[];
  total: number;
}
