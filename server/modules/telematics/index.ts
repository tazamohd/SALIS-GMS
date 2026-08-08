/**
 * Telematics module assembly (Phase E1/E2). Wires the telematics domain — the
 * integration feeds + alerts (with the alert-resolve transition) and the
 * per-vehicle device + readings lookups — into an Express router via DI. The
 * `alerts/:id/resolve` route keeps its parent-scoped `requireResourceOwnership`
 * guard and the `:vehicleId` routes keep the vehicle ownership guard; all routes
 * are `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { TELEMATICS_SERVICE } from '../../infrastructure/di/tokens';
import { makeTelematicsController } from './controllers/telematics.controller';
import type { TelematicsService } from './services/telematics.service';

export interface TelematicsModuleDeps {
  service?: TelematicsService;
}

export function createTelematicsModule(deps: TelematicsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(TELEMATICS_SERVICE);
  const c = makeTelematicsController(service);
  const router = Router();
  const ownVehicle = requireResourceOwnership({ table: 'vehicles', idParam: 'vehicleId' });

  // Integration feeds + alerts
  router.get('/telematics/feeds', isAuthenticated, asyncHandler(c.listFeeds));
  router.post('/telematics/feeds', isAuthenticated, asyncHandler(c.createFeed));
  router.get('/telematics/alerts', isAuthenticated, asyncHandler(c.listAlerts));
  router.post('/telematics/alerts', isAuthenticated, asyncHandler(c.createAlert));
  router.patch(
    '/telematics/alerts/:id/resolve',
    isAuthenticated,
    requireResourceOwnership({ table: 'telematics_alerts', parent: { table: 'vehicles', fk: 'vehicle_id' } }),
    asyncHandler(c.resolveAlert),
  );

  // Per-vehicle device + readings
  router.get('/telematics/device/:vehicleId', isAuthenticated, ownVehicle, asyncHandler(c.getDevice));
  router.get('/telematics/readings/:vehicleId', isAuthenticated, ownVehicle, asyncHandler(c.getReadings));

  return router;
}

export default createTelematicsModule();
