/**
 * Garage module assembly (Phase E1/E2). Wires the garage read surface —
 * garages list/detail/branches plus the administrative role catalog and
 * per-user role reads — into an Express router via DI. Route paths, middleware
 * (requireManagerOrAbove, requireResourceOwnership), and response shapes are
 * identical to the legacy `server/routes/garages.ts` it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireManagerOrAbove } from '../../middleware/requireRole';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { GARAGE_SERVICE } from '../../infrastructure/di/tokens';
import { makeGarageController } from './controllers/garage.controller';
import { garageErrorHandler } from './controllers/garage.error';
import type { GarageService } from './services/garage.service';

export interface GarageModuleDeps {
  service?: GarageService;
}

export function createGarageModule(deps: GarageModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(GARAGE_SERVICE);
  const controller = makeGarageController(service);
  const router = Router();

  router.get('/garages', isAuthenticated, asyncHandler(controller.list));
  router.get('/garages/:id', isAuthenticated, asyncHandler(controller.getById));
  router.get('/garages/:id/branches', isAuthenticated, asyncHandler(controller.branches));

  // Administrative RBAC reads (kept with the extraction; see domain notes).
  router.get('/roles', isAuthenticated, requireManagerOrAbove, asyncHandler(controller.roles));
  router.get(
    '/user/:id/roles',
    isAuthenticated,
    requireResourceOwnership({ table: 'users' }),
    asyncHandler(controller.userRoles),
  );

  router.use(garageErrorHandler);
  return router;
}

export default createGarageModule();
