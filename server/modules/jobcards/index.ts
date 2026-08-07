/**
 * Job cards module assembly (Phase E1/E2). Wires the layered job card read
 * surface into an Express router via DI. Route paths and response shapes are
 * identical to the legacy `server/routes/job-cards.ts` it replaces; sub-resource
 * ownership (previously the `requireOwnJobCard` guard) now lives in the service.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { JOBCARD_SERVICE } from '../../infrastructure/di/tokens';
import { makeJobCardController } from './controllers/jobcard.controller';
import { jobCardErrorHandler } from './controllers/jobcard.error';
import type { JobCardService } from './services/jobcard.service';

export interface JobCardsModuleDeps {
  service?: JobCardService;
}

export function createJobCardsModule(deps: JobCardsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(JOBCARD_SERVICE);
  const controller = makeJobCardController(service);
  const router = Router();

  router.get('/job-cards', isAuthenticated, asyncHandler(controller.list));
  router.get('/job-cards/:id', isAuthenticated, asyncHandler(controller.getById));
  router.get('/job-cards/:id/details', isAuthenticated, asyncHandler(controller.details));
  router.get('/job-cards/:jobCardId/parts', isAuthenticated, asyncHandler(controller.parts));
  router.get('/job-cards/:jobCardId/tasks', isAuthenticated, asyncHandler(controller.tasks));

  router.use(jobCardErrorHandler);
  return router;
}

export default createJobCardsModule();
