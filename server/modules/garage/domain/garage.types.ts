/**
 * Garage domain types (Phase E2 — domain layer).
 *
 * Note: `/roles` and `/user/:id/roles` are administrative (RBAC) reads that
 * historically shipped in the garages route file. They are migrated here to keep
 * the extraction faithful and are candidates to relocate to a dedicated
 * `administration` module later in the plan.
 */

import type { Garage } from '../../../../shared/schema';

export type { Garage };

export interface GarageListParams {
  limit: number;
  offset: number;
}
