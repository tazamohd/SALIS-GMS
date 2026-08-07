/**
 * Estimates module assembly (Phase E1/E2).
 *
 * Wires the full estimate surface — reads, writes, stats, and the two
 * conversion workflows — into an Express router via DI. This is the first module
 * extracted from the legacy monolith (`server/routes.ts`) rather than an
 * existing modular route file. Route paths, ordering, middleware
 * (`requireResourceOwnership` on by-id routes), and response shapes are
 * identical to the handlers it replaces.
 *
 * Ordering note: `/estimates/stats` MUST be declared before `/estimates/:id`,
 * or the literal "stats" is captured as `:id` and the ownership guard 500s
 * casting it to a uuid (regression F4-7).
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { ESTIMATE_SERVICE } from '../../infrastructure/di/tokens';
import { makeEstimateController } from './controllers/estimate.controller';
import { estimateErrorHandler } from './controllers/estimate.error';
import type { EstimateService } from './services/estimate.service';

export interface EstimatesModuleDeps {
  service?: EstimateService;
}

export function createEstimatesModule(deps: EstimatesModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(ESTIMATE_SERVICE);
  const controller = makeEstimateController(service);
  const router = Router();
  const ownsEstimate = requireResourceOwnership({ table: 'estimates' });

  router.get('/estimates', isAuthenticated, asyncHandler(controller.list));
  // Must precede '/estimates/:id'.
  router.get('/estimates/stats', isAuthenticated, asyncHandler(controller.stats));
  router.get('/estimates/:id', isAuthenticated, ownsEstimate, asyncHandler(controller.getById));
  router.post('/estimates/with-items', isAuthenticated, asyncHandler(controller.createWithItems));
  router.patch('/estimates/:id', isAuthenticated, ownsEstimate, asyncHandler(controller.update));
  router.delete('/estimates/:id', isAuthenticated, ownsEstimate, asyncHandler(controller.remove));
  router.get('/estimates/:id/items', isAuthenticated, ownsEstimate, asyncHandler(controller.items));
  router.post(
    '/estimates/:id/convert-to-job-card',
    isAuthenticated,
    ownsEstimate,
    asyncHandler(controller.convertToJobCard),
  );
  router.post(
    '/estimates/:id/convert-to-invoice',
    isAuthenticated,
    ownsEstimate,
    asyncHandler(controller.convertToInvoice),
  );

  router.use(estimateErrorHandler);
  return router;
}

export default createEstimatesModule();
