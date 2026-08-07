/**
 * Vehicles module assembly (Phase E1/E2).
 *
 * Consolidates the vehicle read surface previously split across
 * `server/routes/vehicles.ts` (list) and `server/routes/vehicle-maintenance.ts`
 * (`/vehicles/:id/*` sub-resources) into one layered module wired via DI. Route
 * paths, the `requireResourceOwnership` guard on sub-resources, and response
 * shapes are identical to the routes it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { VEHICLE_SERVICE } from '../../infrastructure/di/tokens';
import { makeVehicleController } from './controllers/vehicle.controller';
import { vehicleErrorHandler } from './controllers/vehicle.error';
import type { VehicleService } from './services/vehicle.service';

export interface VehiclesModuleDeps {
  service?: VehicleService;
}

export function createVehiclesModule(deps: VehiclesModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(VEHICLE_SERVICE);
  const controller = makeVehicleController(service);
  const router = Router();
  const ownsVehicle = requireResourceOwnership({ table: 'vehicles' });

  router.get('/vehicles', isAuthenticated, asyncHandler(controller.list));
  router.get(
    '/vehicles/:id/service-history',
    isAuthenticated,
    ownsVehicle,
    asyncHandler(controller.serviceHistory),
  );
  router.get(
    '/vehicles/:id/maintenance-schedules',
    isAuthenticated,
    ownsVehicle,
    asyncHandler(controller.maintenanceSchedules),
  );
  router.get(
    '/vehicles/:id/service-reminders',
    isAuthenticated,
    ownsVehicle,
    asyncHandler(controller.serviceReminders),
  );

  router.use(vehicleErrorHandler);
  return router;
}

export default createVehiclesModule();
