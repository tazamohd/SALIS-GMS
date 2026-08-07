/**
 * Appointment domain types (Phase E2 — domain layer).
 */

import type { Appointment } from '../../../../shared/schema';

export type { Appointment };

export interface AppointmentAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface AppointmentListParams {
  auth: AppointmentAuthContext;
  garageIdParam?: string;
  limit: number;
  offset: number;
}

export interface AppointmentListResult {
  rows: Appointment[];
  total: number;
}
