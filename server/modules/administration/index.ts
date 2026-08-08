/**
 * Administration module assembly (Phase E1/E2). Wires the platform-admin surface
 * — cross-tenant oversight (stats, garages, suppliers, support tickets, system
 * health) and the onboarding / subscription-request review queues — into an
 * Express router via DI. Every route keeps its `requirePlatformAdmin` guard, and
 * the mutating routes keep their `auditLog` middleware, exactly as in the
 * monolith. The public intake endpoints (`POST /api/garage-applications`,
 * `POST /api/subscription-requests`) stay in the monolith by design — they are
 * not platform-admin routes.
 */

import { Router } from 'express';
import { requirePlatformAdmin } from '../../middleware/requireRole';
import { auditLog } from '../../auditMiddleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { ADMINISTRATION_SERVICE } from '../../infrastructure/di/tokens';
import { makeAdministrationController } from './controllers/administration.controller';
import type { AdministrationService } from './services/administration.service';

export interface AdministrationModuleDeps {
  service?: AdministrationService;
}

export function createAdministrationModule(deps: AdministrationModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(ADMINISTRATION_SERVICE);
  const c = makeAdministrationController(service);
  const router = Router();

  // Cross-tenant oversight.
  router.get('/platform-admin/stats', requirePlatformAdmin, asyncHandler(c.stats));
  router.get('/platform-admin/garages', requirePlatformAdmin, asyncHandler(c.listGarages));
  router.post('/platform-admin/garages', requirePlatformAdmin, auditLog, asyncHandler(c.createGarage));
  router.patch('/platform-admin/garages/:id/status', requirePlatformAdmin, auditLog, asyncHandler(c.setGarageStatus));
  router.get('/platform-admin/suppliers', requirePlatformAdmin, asyncHandler(c.listSuppliers));
  router.get('/platform-admin/support-tickets', requirePlatformAdmin, asyncHandler(c.listSupportTickets));
  router.patch('/platform-admin/support-tickets/:id', requirePlatformAdmin, auditLog, asyncHandler(c.updateSupportTicket));
  router.get('/platform-admin/system-health', requirePlatformAdmin, asyncHandler(c.systemHealth));

  // Garage onboarding application review queue.
  router.get('/platform-admin/garage-applications', requirePlatformAdmin, asyncHandler(c.listGarageApplications));
  router.post('/platform-admin/garage-applications/:id/approve', requirePlatformAdmin, auditLog, asyncHandler(c.approveGarageApplication));
  router.post('/platform-admin/garage-applications/:id/reject', requirePlatformAdmin, auditLog, asyncHandler(c.rejectGarageApplication));

  // Subscription-change request review queue.
  router.get('/platform-admin/subscription-requests', requirePlatformAdmin, asyncHandler(c.listSubscriptionRequests));
  router.post('/platform-admin/subscription-requests/:id/approve', requirePlatformAdmin, auditLog, asyncHandler(c.approveSubscriptionRequest));
  router.post('/platform-admin/subscription-requests/:id/reject', requirePlatformAdmin, auditLog, asyncHandler(c.rejectSubscriptionRequest));

  return router;
}

export default createAdministrationModule();
