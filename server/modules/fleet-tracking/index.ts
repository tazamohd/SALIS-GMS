/**
 * Fleet-tracking module assembly (Phase E1/E2). Wires the fleet-tracking surface
 * — vehicle telemetry (locations), geofence zones/events, and route planning —
 * into an Express router via DI. Route paths, the `requireResourceOwnership`
 * guards on the geofence/route mutations, the per-vehicle ownership checks, and
 * response shapes are identical to the legacy monolith handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { FLEET_TRACKING_SERVICE } from '../../infrastructure/di/tokens';
import { makeFleetTrackingController } from './controllers/fleet-tracking.controller';
import type { FleetTrackingService } from './services/fleet-tracking.service';

export interface FleetTrackingModuleDeps {
  service?: FleetTrackingService;
}

export function createFleetTrackingModule(deps: FleetTrackingModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(FLEET_TRACKING_SERVICE);
  const c = makeFleetTrackingController(service);
  const router = Router();

  const geofenceOwn = requireResourceOwnership({ table: 'geofence_zones' });
  const routeOwn = requireResourceOwnership({ table: 'fleet_routes' });

  // Vehicle telemetry (locations)
  router.post('/fleet/locations', isAuthenticated, asyncHandler(c.recordLocation));
  router.get('/fleet/vehicles/:vehicleId/locations', isAuthenticated, asyncHandler(c.locationHistory));
  router.get('/fleet/vehicles/:vehicleId/location/latest', isAuthenticated, asyncHandler(c.latestLocation));

  // Geofence zones + events
  router.get('/fleet/geofences', isAuthenticated, asyncHandler(c.listGeofences));
  router.post('/fleet/geofences', isAuthenticated, asyncHandler(c.createGeofence));
  router.patch('/fleet/geofences/:id', isAuthenticated, geofenceOwn, asyncHandler(c.updateGeofence));
  router.delete('/fleet/geofences/:id', isAuthenticated, geofenceOwn, asyncHandler(c.deleteGeofence));
  router.get('/fleet/geofence-events', isAuthenticated, asyncHandler(c.geofenceEvents));

  // Route planning
  router.get('/fleet/routes', isAuthenticated, asyncHandler(c.listRoutes));
  router.post('/fleet/routes', isAuthenticated, asyncHandler(c.createRoute));
  router.get('/fleet/routes/:id', isAuthenticated, routeOwn, asyncHandler(c.getRoute));
  router.patch('/fleet/routes/:id', isAuthenticated, routeOwn, asyncHandler(c.updateRoute));

  return router;
}

export default createFleetTrackingModule();
