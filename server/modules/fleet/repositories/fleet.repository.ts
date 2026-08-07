/**
 * Fleet repository (Phase E4). The only data-layer access for the fleet-accounts
 * domain; delegates to the legacy `storage` facade (strangler seam).
 */

import { storage } from '../../../storage';

export interface IFleetRepository {
  listAccounts(garageId?: string): ReturnType<typeof storage.listFleetAccounts>;
  getAccount(id: string, garageId?: string): ReturnType<typeof storage.getFleetAccount>;
  createAccount(data: Parameters<typeof storage.createFleetAccount>[0]): ReturnType<typeof storage.createFleetAccount>;
  listVehicles(accountId?: string): ReturnType<typeof storage.listFleetAccountVehicles>;
  listMaintenance(accountId?: string): ReturnType<typeof storage.listFleetMaintenanceEntries>;
}

export class FleetRepository implements IFleetRepository {
  listAccounts(garageId?: string) {
    return storage.listFleetAccounts(garageId);
  }
  getAccount(id: string, garageId?: string) {
    return storage.getFleetAccount(id, garageId);
  }
  createAccount(data: Parameters<typeof storage.createFleetAccount>[0]) {
    return storage.createFleetAccount(data);
  }
  listVehicles(accountId?: string) {
    return storage.listFleetAccountVehicles(accountId);
  }
  listMaintenance(accountId?: string) {
    return storage.listFleetMaintenanceEntries(accountId);
  }
}
