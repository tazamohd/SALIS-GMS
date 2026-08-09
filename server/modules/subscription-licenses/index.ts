/**
 * Subscription-licenses module assembly (Phase E1/E2). Wires the
 * subscription-licenses domain — license CRUD with the optional branch/status
 * filtered list and the per-license audit-log lookup — into an Express router
 * via DI.
 *
 * By-id ownership guards mirror the monolith: every `:id` / `:licenseId` route
 * scopes the license through its parent `branches` row (licenses carry no
 * `garage_id`). All routes are `isAuthenticated`. Route order matches the
 * monolith. Scope note: the `/api/license-audit-logs` write and the
 * entitlement-assignments endpoints are separate resources and remain in the
 * monolith.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { SUBSCRIPTION_LICENSE_SERVICE } from '../../infrastructure/di/tokens';
import { makeSubscriptionLicenseController } from './controllers/subscription-license.controller';
import type { SubscriptionLicenseService } from './services/subscription-license.service';

export interface SubscriptionLicenseModuleDeps {
  service?: SubscriptionLicenseService;
}

export function createSubscriptionLicenseModule(deps: SubscriptionLicenseModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(SUBSCRIPTION_LICENSE_SERVICE);
  const c = makeSubscriptionLicenseController(service);
  const router = Router();

  const ownLicense = requireResourceOwnership({
    table: 'subscription_licenses',
    parent: { table: 'branches', fk: 'branch_id' },
  });
  const ownLicenseByParam = requireResourceOwnership({
    table: 'subscription_licenses',
    idParam: 'licenseId',
    parent: { table: 'branches', fk: 'branch_id' },
  });

  router.post('/subscription-licenses', isAuthenticated, asyncHandler(c.create));
  router.get('/subscription-licenses', isAuthenticated, asyncHandler(c.list));
  router.get('/subscription-licenses/:id', isAuthenticated, ownLicense, asyncHandler(c.getById));
  router.patch('/subscription-licenses/:id', isAuthenticated, ownLicense, asyncHandler(c.update));
  router.delete('/subscription-licenses/:id', isAuthenticated, ownLicense, asyncHandler(c.remove));
  router.get('/subscription-licenses/:licenseId/audit-logs', isAuthenticated, ownLicenseByParam, asyncHandler(c.listAuditLogs));

  return router;
}

export default createSubscriptionLicenseModule();
