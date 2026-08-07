/**
 * Vehicle service (Phase E5 — Domain Services).
 *
 * Owns the vehicle module's business rules. The list is tenant-pinned exactly
 * as before (session garage wins; `?garageId` is only a fallback for garage-less
 * platform users). Sub-resource reads are guarded at the route by the reusable
 * `requireResourceOwnership` middleware, so the service methods are thin
 * delegations — all data access flows through the injected repository.
 */

import type { IVehicleRepository } from '../repositories/vehicle.repository';
import type {
  VehicleAuthContext,
  VehicleListParams,
  VehicleListResult,
} from '../domain/vehicle.types';

export class VehicleService {
  constructor(private readonly repository: IVehicleRepository) {}

  private effectiveGarageId(auth: VehicleAuthContext, garageIdParam?: string): string | undefined {
    return auth.garageId ?? garageIdParam ?? undefined;
  }

  async list(params: VehicleListParams): Promise<VehicleListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.limit, params.offset),
      this.repository.count(garageId),
    ]);
    return { rows, total };
  }

  serviceHistory(vehicleId: string) {
    return this.repository.getServiceHistory(vehicleId);
  }

  maintenanceSchedules(vehicleId: string) {
    return this.repository.getMaintenanceSchedules(vehicleId);
  }

  serviceReminders(vehicleId: string, status?: string) {
    return this.repository.getServiceReminders(vehicleId, status);
  }
}
