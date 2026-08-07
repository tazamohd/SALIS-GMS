/**
 * Fleet-management service (Phase E5 — Domain Services).
 *
 * Owns the fleet-management aggregates' behavior: create/list/update/delete
 * delegation plus the by-id existence rule (a missing entity surfaces as a
 * NotFoundError carrying the legacy message). The create payloads (with their
 * `garageId` / `createdBy` derivation) are assembled by the controller from the
 * request; the service is data-source agnostic via the injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IFleetManagementRepository } from '../repositories/fleet-management.repository';

export class FleetManagementService {
  constructor(private readonly repository: IFleetManagementRepository) {}

  private async requireById<T>(value: Promise<T>, message: string, id: string): Promise<T> {
    const found = await value;
    if (!found) throw new NotFoundError(message, { context: { id } });
    return found;
  }

  // Groups
  createGroup(data: any) { return this.repository.createGroup(data); }
  listGroups(garageId: string | undefined) { return this.repository.listGroupsByGarage(garageId); }
  getGroup(id: string) { return this.requireById(this.repository.getGroup(id), 'Fleet group not found', id); }
  updateGroup(id: string, data: any) { return this.repository.updateGroup(id, data); }
  deleteGroup(id: string) { return this.repository.deleteGroup(id); }

  // Vehicles
  createVehicle(data: any) { return this.repository.createVehicle(data); }
  listVehiclesByGroup(fleetGroupId: string) { return this.repository.listVehiclesByGroup(fleetGroupId); }
  getVehicle(id: string) { return this.requireById(this.repository.getVehicle(id), 'Fleet vehicle not found', id); }
  updateVehicle(id: string, data: any) { return this.repository.updateVehicle(id, data); }
  deleteVehicle(id: string) { return this.repository.deleteVehicle(id); }

  // Contracts
  createContract(data: any) { return this.repository.createContract(data); }
  listContractsByGroup(fleetGroupId: string) { return this.repository.listContractsByGroup(fleetGroupId); }
  getContract(id: string) { return this.requireById(this.repository.getContract(id), 'Fleet contract not found', id); }
  updateContract(id: string, data: any) { return this.repository.updateContract(id, data); }
  deleteContract(id: string) { return this.repository.deleteContract(id); }

  // Pricing tiers
  createPricingTier(data: any) { return this.repository.createPricingTier(data); }
  listPricingTiers(garageId: string | undefined, fleetGroupId?: string) {
    return fleetGroupId
      ? this.repository.listPricingTiersByGroup(fleetGroupId)
      : this.repository.listPricingTiersByGarage(garageId);
  }
  getPricingTier(id: string) { return this.requireById(this.repository.getPricingTier(id), 'Pricing tier not found', id); }
  updatePricingTier(id: string, data: any) { return this.repository.updatePricingTier(id, data); }
  deletePricingTier(id: string) { return this.repository.deletePricingTier(id); }

  // Maintenance schedules
  createMaintenanceSchedule(data: any) { return this.repository.createMaintenanceSchedule(data); }
  listMaintenanceSchedulesByGroup(fleetGroupId: string) { return this.repository.listMaintenanceSchedulesByGroup(fleetGroupId); }
  getMaintenanceSchedule(id: string) {
    return this.requireById(this.repository.getMaintenanceSchedule(id), 'Maintenance schedule not found', id);
  }
  updateMaintenanceSchedule(id: string, data: any) { return this.repository.updateMaintenanceSchedule(id, data); }
  deleteMaintenanceSchedule(id: string) { return this.repository.deleteMaintenanceSchedule(id); }
}
