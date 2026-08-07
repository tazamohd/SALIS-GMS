/**
 * Fleet module assembly (Phase E1/E2). Wires the fleet-accounts surface (account
 * list/detail/create, vehicles, maintenance schedule, analytics) into an Express
 * router via DI. Route paths, garage scoping, the create validation, and
 * response shapes are identical to the legacy `server/routes/fleet.ts` it
 * replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { createFleetAccountSchema } from '../../schemas/validation';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { FLEET_SERVICE } from '../../infrastructure/di/tokens';
import { makeFleetController } from './controllers/fleet.controller';
import type { FleetService } from './services/fleet.service';

export interface FleetModuleDeps {
  service?: FleetService;
}

export function createFleetModule(deps: FleetModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(FLEET_SERVICE);
  const controller = makeFleetController(service);
  const router = Router();

  router.get('/fleet/accounts', isAuthenticated, asyncHandler(controller.listAccounts));
  router.get('/fleet/accounts/:id', isAuthenticated, asyncHandler(controller.accountDetail));
  router.post(
    '/fleet/accounts',
    isAuthenticated,
    validate(createFleetAccountSchema),
    asyncHandler(controller.createAccount),
  );
  router.get('/fleet/vehicles', isAuthenticated, asyncHandler(controller.listVehicles));
  router.get(
    '/fleet/maintenance-schedule',
    isAuthenticated,
    asyncHandler(controller.maintenanceSchedule),
  );
  router.get('/fleet/analytics', isAuthenticated, asyncHandler(controller.analytics));

  return router;
}

export default createFleetModule();
