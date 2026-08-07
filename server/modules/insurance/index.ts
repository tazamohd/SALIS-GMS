/**
 * Insurance module assembly (Phase E1/E2). Wires the insurance-claims surface
 * (create, list, status update, analytics) into an Express router via DI. Route
 * paths, the `requireResourceOwnership` guard on the status update, the
 * validation boundary, and response shapes are identical to the legacy monolith
 * handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { INSURANCE_SERVICE } from '../../infrastructure/di/tokens';
import { makeInsuranceController } from './controllers/insurance.controller';
import type { InsuranceService } from './services/insurance.service';

export interface InsuranceModuleDeps {
  service?: InsuranceService;
}

export function createInsuranceModule(deps: InsuranceModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(INSURANCE_SERVICE);
  const controller = makeInsuranceController(service);
  const router = Router();

  router.post('/insurance/claims', isAuthenticated, asyncHandler(controller.createClaim));
  router.get('/insurance/claims', isAuthenticated, asyncHandler(controller.listClaims));
  router.patch(
    '/insurance/claims/:id/status',
    isAuthenticated,
    requireResourceOwnership({ table: 'insurance_claims' }),
    asyncHandler(controller.updateStatus),
  );
  router.get('/insurance/claims/analytics', isAuthenticated, asyncHandler(controller.analytics));

  return router;
}

export default createInsuranceModule();
