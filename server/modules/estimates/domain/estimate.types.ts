/**
 * Estimate domain types (Phase E2 — domain layer).
 */

import type { Estimate, EstimateItem } from '../../../../shared/schema';

export type { Estimate, EstimateItem };

export interface EstimateAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface EstimateListParams {
  auth: EstimateAuthContext;
  garageIdParam?: string;
  status?: string;
  limit: number;
  offset: number;
}

export interface EstimateListResult {
  rows: Estimate[];
  total: number;
}

export interface EstimateStats {
  totalEstimates: number;
  conversionRate: number;
  avgValue: number;
  pendingCount: number;
  funnel: { created: number; sent: number; approved: number; converted: number };
  byStatus: Record<string, number>;
}

/** Raw aggregate rows the repository returns for stats computation. */
export interface EstimateStatsRaw {
  agg: Record<string, unknown> | undefined;
  byStatus: Array<{ status: unknown; count: unknown }>;
}
