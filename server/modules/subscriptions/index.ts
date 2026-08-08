/**
 * Subscriptions module assembly (Phase E1/E2). Wires the subscriptions/billing
 * surface into one layered router via DI: the public plan catalog, the
 * per-garage current/change/cancel/resume flows, and the platform-admin
 * list/patch. Route paths, auth, the platform-admin 403, and response shapes are
 * identical to the retired `server/routes/subscriptions.ts`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { SUBSCRIPTION_SERVICE } from '../../infrastructure/di/tokens';
import { makeSubscriptionController } from './controllers/subscription.controller';
import type { SubscriptionService } from './services/subscription.service';

export interface SubscriptionsModuleDeps {
  service?: SubscriptionService;
}

export function createSubscriptionsModule(deps: SubscriptionsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(SUBSCRIPTION_SERVICE);
  const c = makeSubscriptionController(service);
  const router = Router();

  // Public plan catalog.
  router.get('/plans', c.plans);

  // Per-garage subscription (authenticated).
  router.get('/subscriptions/current', isAuthenticated, c.current);
  router.post('/subscriptions/change-plan', isAuthenticated, c.changePlan);
  router.post('/subscriptions/cancel', isAuthenticated, c.cancel);
  router.post('/subscriptions/resume', isAuthenticated, c.resume);

  // Platform-admin (authenticated + role checked in the controller).
  router.get('/subscriptions/all', isAuthenticated, c.listAll);
  router.patch('/subscriptions/:garageId', isAuthenticated, c.adminPatch);

  return router;
}

export default createSubscriptionsModule();
