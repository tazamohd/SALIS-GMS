/**
 * Tax module assembly (Phase E1/E2). Wires the tax-regions domain — tax-region
 * CRUD with the optional country-code filtered list — into an Express router via
 * DI. Tax regions are global reference data (no garage scoping), so the routes
 * carry no ownership guards; all are `isAuthenticated`. Route order matches the
 * monolith.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { TAX_SERVICE } from '../../infrastructure/di/tokens';
import { makeTaxController } from './controllers/tax.controller';
import type { TaxService } from './services/tax.service';

export interface TaxModuleDeps {
  service?: TaxService;
}

export function createTaxModule(deps: TaxModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(TAX_SERVICE);
  const c = makeTaxController(service);
  const router = Router();

  router.post('/tax-regions', isAuthenticated, asyncHandler(c.create));
  router.get('/tax-regions', isAuthenticated, asyncHandler(c.list));
  router.get('/tax-regions/:id', isAuthenticated, asyncHandler(c.getById));
  router.patch('/tax-regions/:id', isAuthenticated, asyncHandler(c.update));
  router.delete('/tax-regions/:id', isAuthenticated, asyncHandler(c.remove));

  return router;
}

export default createTaxModule();
