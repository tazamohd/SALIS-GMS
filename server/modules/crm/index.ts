/**
 * CRM module assembly (Phase E1/E2). Wires the CRM read dashboards (customer
 * 360, segments, loyalty, retention, campaigns) into an Express router via DI.
 * Route paths, the garage-required 403, the graceful-degradation defaults, and
 * the award-points validation are identical to the legacy `server/routes/crm.ts`
 * it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { awardLoyaltyPointsSchema } from '../../schemas/validation';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { CRM_SERVICE } from '../../infrastructure/di/tokens';
import { makeCrmController } from './controllers/crm.controller';
import type { CrmService } from './services/crm.service';

export interface CrmModuleDeps {
  service?: CrmService;
}

export function createCrmModule(deps: CrmModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(CRM_SERVICE);
  const controller = makeCrmController(service);
  const router = Router();

  router.get('/crm/customers', isAuthenticated, asyncHandler(controller.customers));
  router.get('/crm/customers/:id', isAuthenticated, asyncHandler(controller.customerDetail));
  router.get('/crm/segments', isAuthenticated, asyncHandler(controller.segments));
  router.get('/crm/loyalty/summary', isAuthenticated, asyncHandler(controller.loyaltySummary));
  router.post(
    '/crm/loyalty/points',
    isAuthenticated,
    validate(awardLoyaltyPointsSchema),
    asyncHandler(controller.awardPoints),
  );
  router.get('/crm/retention', isAuthenticated, asyncHandler(controller.retention));
  router.get('/crm/campaigns', isAuthenticated, asyncHandler(controller.campaigns));

  return router;
}

export default createCrmModule();
