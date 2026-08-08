/**
 * Quota module assembly (Phase D.1 / LIC-2). Wires the entitlement-quota status
 * surface (`GET /api/quota`) via DI and re-exports `enforceQuota` so create
 * routes can cap usage against the effective license/plan limits.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { QUOTA_SERVICE } from '../../infrastructure/di/tokens';
import { makeQuotaController } from './controllers/quota.controller';
import type { QuotaService } from './services/quota.service';

export { enforceQuota } from './quota.middleware';

export interface QuotaModuleDeps {
  service?: QuotaService;
}

export function createQuotaModule(deps: QuotaModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(QUOTA_SERVICE);
  const c = makeQuotaController(service);
  const router = Router();
  router.get('/quota', isAuthenticated, asyncHandler(c.status));
  return router;
}

export default createQuotaModule();
