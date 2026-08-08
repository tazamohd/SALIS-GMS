/**
 * IoT module assembly (Phase E1/E2). Wires the IoT domain — vehicle sensors,
 * sensor readings, anomalies, alerts (acknowledge/resolve) and the dashboard
 * summary — into an Express router via DI. The `:id` sensor/alert routes keep
 * their parent-scoped `requireResourceOwnership` (via the owning vehicle) and
 * the vehicle-scoped reads keep the vehicle ownership guard; all routes are
 * `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { IOT_SERVICE } from '../../infrastructure/di/tokens';
import { makeIotController } from './controllers/iot.controller';
import type { IotService } from './services/iot.service';

export interface IotModuleDeps {
  service?: IotService;
}

export function createIotModule(deps: IotModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(IOT_SERVICE);
  const c = makeIotController(service);
  const router = Router();
  const ownSensor = requireResourceOwnership({ table: 'iot_sensors', parent: { table: 'vehicles', fk: 'vehicle_id' } });
  const ownAlert = requireResourceOwnership({ table: 'iot_alerts', parent: { table: 'vehicles', fk: 'vehicle_id' } });
  const ownVehicle = requireResourceOwnership({ table: 'vehicles', idParam: 'vehicleId' });

  // Sensors
  router.get('/iot/sensors', isAuthenticated, asyncHandler(c.listSensors));
  router.get('/iot/sensors/:id', isAuthenticated, ownSensor, asyncHandler(c.getSensor));
  router.post('/iot/sensors', isAuthenticated, asyncHandler(c.createSensor));
  router.patch('/iot/sensors/:id', isAuthenticated, ownSensor, asyncHandler(c.updateSensor));
  router.delete('/iot/sensors/:id', isAuthenticated, ownSensor, asyncHandler(c.deleteSensor));

  // Readings + anomalies
  router.post('/iot/readings', isAuthenticated, asyncHandler(c.recordReading));
  router.get('/iot/sensors/:id/readings', isAuthenticated, ownSensor, asyncHandler(c.getReadings));
  router.get('/iot/vehicles/:vehicleId/anomalies', isAuthenticated, ownVehicle, asyncHandler(c.vehicleAnomalies));

  // Alerts
  router.get('/iot/alerts', isAuthenticated, asyncHandler(c.listAlerts));
  router.get('/iot/alerts/:id', isAuthenticated, ownAlert, asyncHandler(c.getAlert));
  router.post('/iot/alerts/:id/acknowledge', isAuthenticated, ownAlert, asyncHandler(c.acknowledgeAlert));
  router.post('/iot/alerts/:id/resolve', isAuthenticated, ownAlert, asyncHandler(c.resolveAlert));

  // Dashboard + latest readings
  router.get('/iot/dashboard/summary', isAuthenticated, asyncHandler(c.dashboardSummary));
  router.get('/iot/vehicles/:vehicleId/latest-readings', isAuthenticated, ownVehicle, asyncHandler(c.latestReadings));

  return router;
}

export default createIotModule();
