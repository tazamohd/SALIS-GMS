/**
 * Vehicle DTO mappers (Phase E9/E10 — DTO boundary).
 *
 * Passthrough today to preserve the exact current response contract; the seam
 * exists so a narrowed public shape can be introduced behind API versioning.
 */

import type { Vehicle } from '../domain/vehicle.types';

export type VehicleDTO = Vehicle;

export function toVehicleDTO(vehicle: Vehicle): VehicleDTO {
  return vehicle;
}

export function toVehicleListDTO(vehicles: Vehicle[]): VehicleDTO[] {
  return vehicles.map(toVehicleDTO);
}
