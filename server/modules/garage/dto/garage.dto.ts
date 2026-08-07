/**
 * Garage DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { Garage } from '../domain/garage.types';

export type GarageDTO = Garage;

export function toGarageDTO(garage: Garage): GarageDTO {
  return garage;
}
