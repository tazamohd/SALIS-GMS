/**
 * Licensing module assembly (Phase D.1). Wires the internal license-management
 * subsystem into an Express router via DI. Platform-admin issues / lists /
 * renews / revokes / deactivates licenses (audit-logged); any authenticated
 * tenant activates a key against its garage or validates one. Complements the
 * SaaS `subscriptions` module — reuses `@shared/plans` for entitlement limits.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requirePlatformAdmin } from '../../middleware/requireRole';
import { auditLog } from '../../auditMiddleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { LICENSING_SERVICE } from '../../infrastructure/di/tokens';
import { makeLicensingController } from './controllers/licensing.controller';
import type { LicensingService } from './services/licensing.service';

export interface LicensingModuleDeps {
  service?: LicensingService;
}

export function createLicensingModule(deps: LicensingModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(LICENSING_SERVICE);
  const c = makeLicensingController(service);
  const router = Router();

  // Tenant self-service: activate / validate a key (fixed paths before :id).
  router.post('/licenses/activate', isAuthenticated, asyncHandler(c.activate));
  router.post('/licenses/validate', isAuthenticated, asyncHandler(c.validate));

  // Platform-admin license administration.
  router.post('/licenses', requirePlatformAdmin, auditLog, asyncHandler(c.issue));
  router.get('/licenses', requirePlatformAdmin, asyncHandler(c.list));
  router.get('/licenses/:id', requirePlatformAdmin, asyncHandler(c.get));
  router.get('/licenses/:id/activations', requirePlatformAdmin, asyncHandler(c.activations));
  router.post('/licenses/:id/renew', requirePlatformAdmin, auditLog, asyncHandler(c.renew));
  router.post('/licenses/:id/revoke', requirePlatformAdmin, auditLog, asyncHandler(c.revoke));
  router.post('/licenses/:id/deactivate', requirePlatformAdmin, auditLog, asyncHandler(c.deactivate));

  return router;
}

export default createLicensingModule();
