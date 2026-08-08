/**
 * Compliance module assembly (Phase E1/E2). Wires the compliance domain —
 * environmental records (create / list / analytics) and the policy / audit /
 * task management surface — into an Express router via DI. The
 * `tasks/:id/complete` route keeps its `requireResourceOwnership` guard; all
 * routes are `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { COMPLIANCE_SERVICE } from '../../infrastructure/di/tokens';
import { makeComplianceController } from './controllers/compliance.controller';
import type { ComplianceService } from './services/compliance.service';

export interface ComplianceModuleDeps {
  service?: ComplianceService;
}

export function createComplianceModule(deps: ComplianceModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(COMPLIANCE_SERVICE);
  const c = makeComplianceController(service);
  const router = Router();

  // Environmental compliance
  router.post('/compliance/environmental', isAuthenticated, asyncHandler(c.createEnvironmental));
  router.get('/compliance/environmental', isAuthenticated, asyncHandler(c.listEnvironmental));
  router.get('/compliance/environmental/analytics', isAuthenticated, asyncHandler(c.environmentalAnalytics));

  // Policies / audits / tasks
  router.get('/compliance/policies', isAuthenticated, asyncHandler(c.listPolicies));
  router.post('/compliance/policies', isAuthenticated, asyncHandler(c.createPolicy));
  router.get('/compliance/audits', isAuthenticated, asyncHandler(c.listAudits));
  router.post('/compliance/audits', isAuthenticated, asyncHandler(c.createAudit));
  router.get('/compliance/tasks', isAuthenticated, asyncHandler(c.listTasks));
  router.post('/compliance/tasks', isAuthenticated, asyncHandler(c.createTask));
  router.patch(
    '/compliance/tasks/:id/complete',
    isAuthenticated,
    requireResourceOwnership({ table: 'compliance_tasks' }),
    asyncHandler(c.completeTask),
  );

  return router;
}

export default createComplianceModule();
