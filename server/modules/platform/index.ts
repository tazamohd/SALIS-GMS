/**
 * Platform module assembly (Phase E1/E2). Hosts the platform/administration
 * surface — currently the per-garage feature-flag CRUD extracted from
 * `server/routes/feature-flags.ts` — as one layered router wired via DI. Route
 * paths, auth (401), and response shapes are identical to the legacy route file.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { FEATURE_FLAG_SERVICE } from '../../infrastructure/di/tokens';
import { makeFeatureFlagController } from './controllers/feature-flag.controller';
import type { FeatureFlagService } from './services/feature-flag.service';

export interface PlatformModuleDeps {
  featureFlagService?: FeatureFlagService;
}

export function createPlatformModule(deps: PlatformModuleDeps = {}): Router {
  const service =
    deps.featureFlagService ?? getAppContainer().resolve(FEATURE_FLAG_SERVICE);
  const c = makeFeatureFlagController(service);
  const router = Router();

  router.get('/feature-flags', isAuthenticated, c.list);
  router.get('/feature-flags/:id', isAuthenticated, c.get);
  router.post('/feature-flags', isAuthenticated, c.create);
  router.patch('/feature-flags/:id', isAuthenticated, c.update);
  router.delete('/feature-flags/:id', isAuthenticated, c.remove);

  return router;
}

export default createPlatformModule();
