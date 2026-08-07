/**
 * Vehicle repository (Phase E4 — Repository Pattern).
 *
 * The only place in the vehicle module that touches the data layer. Delegates
 * to the legacy `storage` facade (strangler-fig seam); internals can move to
 * direct Drizzle queries later without changing callers.
 */

import { storage } from '../../../storage';
import type { Vehicle } from '../domain/vehicle.types';

export interface IVehicleRepository {
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Vehicle[]>;
  count(garageId: string | undefined): Promise<number>;
  getServiceHistory(vehicleId: string): ReturnType<typeof storage.getVehicleServiceHistory>;
  getMaintenanceSchedules(vehicleId: string): ReturnType<typeof storage.getMaintenanceSchedules>;
  getServiceReminders(
    vehicleId: string,
    status?: string,
  ): ReturnType<typeof storage.getServiceReminders>;
}

export class VehicleRepository implements IVehicleRepository {
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Vehicle[]> {
    return storage.getVehiclesPaginated(garageId, limit, offset);
  }

  count(garageId: string | undefined): Promise<number> {
    return storage.countVehicles(garageId);
  }

  getServiceHistory(vehicleId: string) {
    return storage.getVehicleServiceHistory(vehicleId);
  }

  getMaintenanceSchedules(vehicleId: string) {
    return storage.getMaintenanceSchedules(vehicleId);
  }

  getServiceReminders(vehicleId: string, status?: string) {
    return storage.getServiceReminders(vehicleId, status);
  }
}
