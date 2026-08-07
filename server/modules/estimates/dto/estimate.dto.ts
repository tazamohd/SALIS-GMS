/**
 * Estimate DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { Estimate } from '../domain/estimate.types';

export type EstimateDTO = Estimate;

export function toEstimateDTO(estimate: Estimate): EstimateDTO {
  return estimate;
}
