/**
 * Fleet-management module assembly (Phase E1/E2). Wires the fleet-management
 * CRUD surface — groups, vehicles, contracts, pricing tiers, and maintenance
 * schedules — into an Express router via DI. Route paths, the
 * `requireResourceOwnership` guards (including the parent-scoped by-id guards and
 * the `idParam` group-scoped list guards), the `/group/:fleetGroupId`-before-
 * `/:id` ordering, and response shapes are identical to the legacy monolith
 * handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { FLEET_MANAGEMENT_SERVICE } from '../../infrastructure/di/tokens';
import { makeFleetManagementController } from './controllers/fleet-management.controller';
import type { FleetManagementService } from './services/fleet-management.service';

export interface FleetManagementModuleDeps {
  service?: FleetManagementService;
}

export function createFleetManagementModule(deps: FleetManagementModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(FLEET_MANAGEMENT_SERVICE);
  const c = makeFleetManagementController(service);
  const router = Router();

  const groupOwn = requireResourceOwnership({ table: 'fleet_groups' });
  const groupIdParam = requireResourceOwnership({ table: 'fleet_groups', idParam: 'fleetGroupId' });
  const vehicleOwn = requireResourceOwnership({
    table: 'fleet_vehicles',
    parent: { table: 'fleet_groups', fk: 'fleet_group_id' },
  });
  const contractOwn = requireResourceOwnership({
    table: 'fleet_contracts',
    parent: { table: 'fleet_groups', fk: 'fleet_group_id' },
  });
  const pricingOwn = requireResourceOwnership({ table: 'fleet_pricing_tiers' });
  const maintenanceOwn = requireResourceOwnership({
    table: 'fleet_maintenance_schedules',
    parent: { table: 'fleet_groups', fk: 'fleet_group_id' },
  });

  // Groups
  router.post('/fleet/groups', isAuthenticated, asyncHandler(c.createGroup));
  router.get('/fleet/groups', isAuthenticated, asyncHandler(c.listGroups));
  router.get('/fleet/groups/:id', isAuthenticated, groupOwn, asyncHandler(c.getGroup));
  router.patch('/fleet/groups/:id', isAuthenticated, groupOwn, asyncHandler(c.updateGroup));
  router.delete('/fleet/groups/:id', isAuthenticated, groupOwn, asyncHandler(c.deleteGroup));

  // Vehicles (group list before /:id)
  router.post('/fleet/vehicles', isAuthenticated, asyncHandler(c.createVehicle));
  router.get('/fleet/vehicles/group/:fleetGroupId', isAuthenticated, groupIdParam, asyncHandler(c.listVehiclesByGroup));
  router.get('/fleet/vehicles/:id', isAuthenticated, vehicleOwn, asyncHandler(c.getVehicle));
  router.patch('/fleet/vehicles/:id', isAuthenticated, vehicleOwn, asyncHandler(c.updateVehicle));
  router.delete('/fleet/vehicles/:id', isAuthenticated, vehicleOwn, asyncHandler(c.deleteVehicle));

  // Contracts (group list before /:id)
  router.post('/fleet/contracts', isAuthenticated, asyncHandler(c.createContract));
  router.get('/fleet/contracts/group/:fleetGroupId', isAuthenticated, groupIdParam, asyncHandler(c.listContractsByGroup));
  router.get('/fleet/contracts/:id', isAuthenticated, contractOwn, asyncHandler(c.getContract));
  router.patch('/fleet/contracts/:id', isAuthenticated, contractOwn, asyncHandler(c.updateContract));
  router.delete('/fleet/contracts/:id', isAuthenticated, contractOwn, asyncHandler(c.deleteContract));

  // Pricing tiers
  router.post('/fleet/pricing-tiers', isAuthenticated, asyncHandler(c.createPricingTier));
  router.get('/fleet/pricing-tiers', isAuthenticated, asyncHandler(c.listPricingTiers));
  router.get('/fleet/pricing-tiers/:id', isAuthenticated, pricingOwn, asyncHandler(c.getPricingTier));
  router.patch('/fleet/pricing-tiers/:id', isAuthenticated, pricingOwn, asyncHandler(c.updatePricingTier));
  router.delete('/fleet/pricing-tiers/:id', isAuthenticated, pricingOwn, asyncHandler(c.deletePricingTier));

  // Maintenance schedules (group list before /:id)
  router.post('/fleet/maintenance-schedules', isAuthenticated, asyncHandler(c.createMaintenanceSchedule));
  router.get('/fleet/maintenance-schedules/group/:fleetGroupId', isAuthenticated, groupIdParam, asyncHandler(c.listMaintenanceSchedulesByGroup));
  router.get('/fleet/maintenance-schedules/:id', isAuthenticated, maintenanceOwn, asyncHandler(c.getMaintenanceSchedule));
  router.patch('/fleet/maintenance-schedules/:id', isAuthenticated, maintenanceOwn, asyncHandler(c.updateMaintenanceSchedule));
  router.delete('/fleet/maintenance-schedules/:id', isAuthenticated, maintenanceOwn, asyncHandler(c.deleteMaintenanceSchedule));

  return router;
}

export default createFleetManagementModule();
