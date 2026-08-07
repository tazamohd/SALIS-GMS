/**
 * HR module assembly (Phase E1/E2). Wires the HR/payroll surface — employee
 * directory, attendance, leave requests, and payroll — into an Express router
 * via DI. Route paths, the role guards (`requireManagerOrAbove`,
 * `requireRole([...])`), the leave-request validation, and response shapes are
 * identical to the legacy `server/routes/hr-payroll.ts` it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireRole, requireManagerOrAbove } from '../../middleware/requireRole';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { createLeaveRequestSchema } from '../../schemas/validation';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { HR_SERVICE } from '../../infrastructure/di/tokens';
import { makeHrController } from './controllers/hr.controller';
import type { HrService } from './services/hr.service';

export interface HrModuleDeps {
  service?: HrService;
}

export function createHrModule(deps: HrModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(HR_SERVICE);
  const c = makeHrController(service);
  const router = Router();
  const payrollRoles = requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']);

  // Employees (compensation/PII — managers+ only)
  router.get('/hr/employees', isAuthenticated, requireManagerOrAbove, asyncHandler(c.listEmployees));
  router.get('/hr/employees/:id', isAuthenticated, requireManagerOrAbove, asyncHandler(c.employeeDetail));
  router.post('/hr/employees', isAuthenticated, requireManagerOrAbove, asyncHandler(c.createEmployee));

  // Attendance
  router.get('/hr/attendance', isAuthenticated, asyncHandler(c.attendance));
  router.post('/hr/attendance/clock', isAuthenticated, asyncHandler(c.clock));

  // Leave requests
  router.get('/hr/leave-requests', isAuthenticated, asyncHandler(c.listLeave));
  router.post('/hr/leave-requests', isAuthenticated, validate(createLeaveRequestSchema), asyncHandler(c.createLeave));
  router.patch('/hr/leave-requests/:id', isAuthenticated, requireManagerOrAbove, asyncHandler(c.updateLeave));

  // Payroll (salary data — manager/accountant only)
  router.get('/hr/payroll/summary', isAuthenticated, payrollRoles, asyncHandler(c.payrollSummary));
  router.get('/hr/payroll/slip/:employeeId', isAuthenticated, payrollRoles, asyncHandler(c.payslip));

  return router;
}

export default createHrModule();
