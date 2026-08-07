/**
 * Fleet-management repository (Phase E4). The only data-layer access for the
 * fleet-management aggregates — groups, vehicles, contracts, pricing tiers, and
 * maintenance schedules. Delegates to the legacy `storage` facade (strangler
 * seam); every method is a thin pass-through preserving the monolith's behavior.
 */

import { storage } from '../../../storage';

// The fleet-management storage methods are loosely typed; `Any` keeps this
// strangler seam readable without widening the public module contract.
type Any = any;

export interface IFleetManagementRepository {
  // Groups
  createGroup(data: Any): Promise<Any>;
  listGroupsByGarage(garageId: string | undefined): Promise<Any>;
  getGroup(id: string): Promise<Any>;
  updateGroup(id: string, data: Any): Promise<Any>;
  deleteGroup(id: string): Promise<void>;
  // Vehicles
  createVehicle(data: Any): Promise<Any>;
  listVehiclesByGroup(fleetGroupId: string): Promise<Any>;
  getVehicle(id: string): Promise<Any>;
  updateVehicle(id: string, data: Any): Promise<Any>;
  deleteVehicle(id: string): Promise<void>;
  // Contracts
  createContract(data: Any): Promise<Any>;
  listContractsByGroup(fleetGroupId: string): Promise<Any>;
  getContract(id: string): Promise<Any>;
  updateContract(id: string, data: Any): Promise<Any>;
  deleteContract(id: string): Promise<void>;
  // Pricing tiers
  createPricingTier(data: Any): Promise<Any>;
  listPricingTiersByGroup(fleetGroupId: string): Promise<Any>;
  listPricingTiersByGarage(garageId: string | undefined): Promise<Any>;
  getPricingTier(id: string): Promise<Any>;
  updatePricingTier(id: string, data: Any): Promise<Any>;
  deletePricingTier(id: string): Promise<void>;
  // Maintenance schedules
  createMaintenanceSchedule(data: Any): Promise<Any>;
  listMaintenanceSchedulesByGroup(fleetGroupId: string): Promise<Any>;
  getMaintenanceSchedule(id: string): Promise<Any>;
  updateMaintenanceSchedule(id: string, data: Any): Promise<Any>;
  deleteMaintenanceSchedule(id: string): Promise<void>;
}

export class FleetManagementRepository implements IFleetManagementRepository {
  // Groups
  createGroup(data: Any) { return storage.createFleetGroup(data); }
  listGroupsByGarage(garageId: string | undefined) { return storage.getFleetGroupsByGarage(garageId as string); }
  getGroup(id: string) { return storage.getFleetGroup(id); }
  updateGroup(id: string, data: Any) { return storage.updateFleetGroup(id, data); }
  deleteGroup(id: string) { return storage.deleteFleetGroup(id); }
  // Vehicles
  createVehicle(data: Any) { return storage.createFleetVehicle(data); }
  listVehiclesByGroup(fleetGroupId: string) { return storage.getFleetVehiclesByGroup(fleetGroupId); }
  getVehicle(id: string) { return storage.getFleetVehicle(id); }
  updateVehicle(id: string, data: Any) { return storage.updateFleetVehicle(id, data); }
  deleteVehicle(id: string) { return storage.deleteFleetVehicle(id); }
  // Contracts
  createContract(data: Any) { return storage.createFleetContract(data); }
  listContractsByGroup(fleetGroupId: string) { return storage.getFleetContractsByGroup(fleetGroupId); }
  getContract(id: string) { return storage.getFleetContract(id); }
  updateContract(id: string, data: Any) { return storage.updateFleetContract(id, data); }
  deleteContract(id: string) { return storage.deleteFleetContract(id); }
  // Pricing tiers
  createPricingTier(data: Any) { return storage.createFleetPricingTier(data); }
  listPricingTiersByGroup(fleetGroupId: string) { return storage.getFleetPricingTiersByGroup(fleetGroupId); }
  listPricingTiersByGarage(garageId: string | undefined) { return storage.getFleetPricingTiersByGarage(garageId as string); }
  getPricingTier(id: string) { return storage.getFleetPricingTier(id); }
  updatePricingTier(id: string, data: Any) { return storage.updateFleetPricingTier(id, data); }
  deletePricingTier(id: string) { return storage.deleteFleetPricingTier(id); }
  // Maintenance schedules
  createMaintenanceSchedule(data: Any) { return storage.createFleetMaintenanceSchedule(data); }
  listMaintenanceSchedulesByGroup(fleetGroupId: string) { return storage.getFleetMaintenanceSchedulesByGroup(fleetGroupId); }
  getMaintenanceSchedule(id: string) { return storage.getFleetMaintenanceSchedule(id); }
  updateMaintenanceSchedule(id: string, data: Any) { return storage.updateFleetMaintenanceSchedule(id, data); }
  deleteMaintenanceSchedule(id: string) { return storage.deleteFleetMaintenanceSchedule(id); }
}
