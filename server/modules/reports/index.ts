/**
 * Reports module assembly (Phase E1/E2). Wires the management reporting surface
 * (revenue, technician performance, inventory turnover, customer analytics,
 * executive summary) into an Express router via DI. Route paths, the role guards
 * (financial: ADMIN/MANAGER/ACCOUNTANT; people: ADMIN/MANAGER), the
 * session-garage 403, and response shapes are identical to the legacy
 * `server/routes/reports.ts` it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireRole } from '../../middleware/requireRole';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { REPORTS_SERVICE } from '../../infrastructure/di/tokens';
import { makeReportsController } from './controllers/reports.controller';
import type { ReportsService } from './services/reports.service';

export interface ReportsModuleDeps {
  service?: ReportsService;
}

export function createReportsModule(deps: ReportsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(REPORTS_SERVICE);
  const c = makeReportsController(service);
  const router = Router();

  // Financial/aggregate reports: ADMIN/MANAGER/ACCOUNTANT. People reports: ADMIN/MANAGER.
  const requireFinancialRole = requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']);
  const requireManagementRole = requireRole(['ADMIN', 'MANAGER']);

  router.get('/reports/revenue', isAuthenticated, requireFinancialRole, asyncHandler(c.revenue));
  router.get('/reports/technician-performance', isAuthenticated, requireManagementRole, asyncHandler(c.technicianPerformance));
  router.get('/reports/inventory-turnover', isAuthenticated, requireFinancialRole, asyncHandler(c.inventoryTurnover));
  router.get('/reports/customer-analytics', isAuthenticated, requireManagementRole, asyncHandler(c.customerAnalytics));
  router.get('/reports/summary', isAuthenticated, requireFinancialRole, asyncHandler(c.summary));

  return router;
}

export default createReportsModule();
