/**
 * Job card domain types (Phase E2 — domain layer).
 */

import type { JobCard } from '../../../../shared/schema';

export type { JobCard };

export interface JobCardAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface JobCardListParams {
  auth: JobCardAuthContext;
  garageIdParam?: string;
  assignedTo?: string;
  limit: number;
  offset: number;
}

export interface JobCardListResult {
  rows: JobCard[];
  total: number;
}
