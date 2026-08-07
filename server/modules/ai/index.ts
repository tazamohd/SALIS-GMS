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
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { AI_SERVICE } from '../../infrastructure/di/tokens';
import { makeAiController } from './controllers/ai.controller';
import type { AiService } from './services/ai.service';

export interface AiModuleDeps {
  service?: AiService;
}

export function createAiModule(deps: AiModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(AI_SERVICE);
  const c = makeAiController(service);
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

  return router;
}

export default createAiModule();
