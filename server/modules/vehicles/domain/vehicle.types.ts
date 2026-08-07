/**
 * Vehicle domain types (Phase E2 — domain layer).
 */

import type { Vehicle } from '../../../../shared/schema';

export type { Vehicle };

/** Authenticated caller context relevant to vehicle authorization. */
export interface VehicleAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface VehicleListParams {
  auth: VehicleAuthContext;
  garageIdParam?: string;
  limit: number;
  offset: number;
}

export interface VehicleListResult {
  rows: Vehicle[];
  total: number;
}
