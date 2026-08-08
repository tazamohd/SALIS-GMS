/**
 * Emerging-tech module assembly (Phase E1/E2). Wires the emerging-technologies
 * showcase domain — blockchain history, AR guides, IoT sensors/readings, 3D
 * models, drone inspections, AI video, digital twins, fraud cases, biometric
 * profile, collaboration sessions, edge devices/diagnostics, pricing
 * optimization, and the sample-data seeder — into an Express router via DI. All
 * routes are `isAuthenticated`; the reads are garage/user-scoped in the service.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { EMERGING_TECH_SERVICE } from '../../infrastructure/di/tokens';
import { makeEmergingTechController } from './controllers/emerging-tech.controller';
import type { EmergingTechService } from './services/emerging-tech.service';

export interface EmergingTechModuleDeps {
  service?: EmergingTechService;
}

export function createEmergingTechModule(deps: EmergingTechModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(EMERGING_TECH_SERVICE);
  const c = makeEmergingTechController(service);
  const router = Router();

  router.get('/emerging-tech/blockchain', isAuthenticated, asyncHandler(c.blockchain));
  router.get('/emerging-tech/ar-guides', isAuthenticated, asyncHandler(c.arGuides));
  router.get('/emerging-tech/iot-sensors', isAuthenticated, asyncHandler(c.iotSensors));
  router.get('/emerging-tech/iot-readings', isAuthenticated, asyncHandler(c.iotReadings));
  router.get('/emerging-tech/3d-models', isAuthenticated, asyncHandler(c.models3D));
  router.get('/emerging-tech/drone-inspections', isAuthenticated, asyncHandler(c.droneInspections));
  router.get('/emerging-tech/ai-video', isAuthenticated, asyncHandler(c.aiVideo));
  router.get('/emerging-tech/digital-twins', isAuthenticated, asyncHandler(c.digitalTwins));
  router.get('/emerging-tech/fraud-cases', isAuthenticated, asyncHandler(c.fraudCases));
  router.get('/emerging-tech/biometric-profile', isAuthenticated, asyncHandler(c.biometricProfile));
  router.get('/emerging-tech/collaboration-sessions', isAuthenticated, asyncHandler(c.collaborationSessions));
  router.get('/emerging-tech/edge-devices', isAuthenticated, asyncHandler(c.edgeDevices));
  router.get('/emerging-tech/edge-diagnostics', isAuthenticated, asyncHandler(c.edgeDiagnostics));
  router.get('/emerging-tech/pricing-optimization', isAuthenticated, asyncHandler(c.pricingOptimization));
  router.post('/emerging-tech/seed', isAuthenticated, asyncHandler(c.seed));

  return router;
}

export default createEmergingTechModule();
