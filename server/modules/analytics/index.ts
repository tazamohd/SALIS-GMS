/**
 * Analytics module assembly (Phase E1/E2). Wires the full `/api/analytics/*`
 * surface — performance report, dashboard metrics, custom reports, profit
 * analysis, customer LTV, and heat maps — into an Express router via DI. Route
 * paths, the performance report's garage + management 403s, and response shapes
 * are identical to the legacy `server/routes/analytics-performance.ts` and the
 * monolith `/api/analytics/*` handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { ANALYTICS_SERVICE } from '../../infrastructure/di/tokens';
import { makeAnalyticsController } from './controllers/analytics.controller';
import type { AnalyticsService } from './services/analytics.service';

export interface AnalyticsModuleDeps {
  service?: AnalyticsService;
}

export function createAnalyticsModule(deps: AnalyticsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(ANALYTICS_SERVICE);
  const c = makeAnalyticsController(service);
  const router = Router();

  router.get('/analytics/performance', isAuthenticated, asyncHandler(c.performance));
  router.get('/analytics/dashboard-metrics', isAuthenticated, asyncHandler(c.dashboardMetrics));
  router.get('/analytics/custom-reports', isAuthenticated, asyncHandler(c.listCustomReports));
  router.post('/analytics/custom-reports', isAuthenticated, asyncHandler(c.createCustomReport));
  router.post('/analytics/custom-reports/:id/run', isAuthenticated, asyncHandler(c.runCustomReport));
  router.get('/analytics/profit-analysis', isAuthenticated, asyncHandler(c.profitAnalysis));
  router.get('/analytics/customer-ltv', isAuthenticated, asyncHandler(c.customerLTV));
  router.get('/analytics/heatmaps', isAuthenticated, asyncHandler(c.heatmaps));

  return router;
}

export default createAnalyticsModule();
