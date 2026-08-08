/**
 * AI module assembly (Phase E1/E2). Consolidates the three AI route files
 * (ai-insights, ai-predictions, ai-repair-guide) into one layered router via DI:
 * business insights + revenue/demand forecasts, the PRO-gated statistical
 * predictions/accuracy, and the ENTERPRISE-gated repair guide. Route paths, the
 * `requirePlan` gates, the session-garage 403s, and response shapes are
 * identical to the legacy route files they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requirePlan } from '../../middleware/requirePlan';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { AI_SERVICE, AI_JOB_ESTIMATION_SERVICE } from '../../infrastructure/di/tokens';
import { makeAiController } from './controllers/ai.controller';
import { makeAiJobEstimationController } from './controllers/ai-job-estimation.controller';
import type { AiService } from './services/ai.service';
import type { AiJobEstimationService } from './services/ai-job-estimation.service';

export interface AiModuleDeps {
  service?: AiService;
  jobEstimationService?: AiJobEstimationService;
}

export function createAiModule(deps: AiModuleDeps = {}): Router {
  const container = getAppContainer();
  const c = makeAiController(deps.service ?? container.resolve(AI_SERVICE));
  const je = makeAiJobEstimationController(
    deps.jobEstimationService ?? container.resolve(AI_JOB_ESTIMATION_SERVICE),
  );
  const router = Router();

  // Business intelligence (all authenticated users).
  router.get('/ai/insights', isAuthenticated, asyncHandler(c.insights));
  router.get('/ai/forecast/revenue', isAuthenticated, asyncHandler(c.forecastRevenue));
  router.get('/ai/forecast/demand', isAuthenticated, asyncHandler(c.forecastDemand));

  // Statistical predictions (PRO plan).
  router.get('/ai/predictions', isAuthenticated, requirePlan('PRO'), asyncHandler(c.predictions));
  router.get('/ai/accuracy', isAuthenticated, requirePlan('PRO'), asyncHandler(c.accuracy));

  // LLM repair guide (ENTERPRISE plan).
  router.post('/ai/repair-guide', isAuthenticated, requirePlan('ENTERPRISE'), asyncHandler(c.repairGuide));

  // Job estimations (LLM-assisted; per-garage ownership on the :id routes).
  router.post('/ai/estimate-job', isAuthenticated, asyncHandler(je.estimate));
  router.get('/ai/job-estimations', isAuthenticated, asyncHandler(je.list));
  router.get('/ai/job-estimations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_job_estimations' }), asyncHandler(je.get));
  router.patch('/ai/job-estimations/:id', isAuthenticated, requireResourceOwnership({ table: 'ai_job_estimations' }), asyncHandler(je.update));

  return router;
}

export default createAiModule();
