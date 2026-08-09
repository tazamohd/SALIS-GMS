/**
 * Warranty module assembly (Phase E1/E2). Wires the warranty domain — warranty
 * CRUD with the active / expired / expiring status-window lookups and the
 * per-vehicle / per-customer lookups, plus warranty-claim CRUD with the
 * per-warranty lookup — into an Express router via DI.
 *
 * By-id ownership guards mirror the H-2 hardening: `/warranties/:id` scopes on
 * the row's own `garage_id`; `/warranties/vehicle/:vehicleId` on the vehicle;
 * `/warranty-claims/:id` through its parent warranty (claims carry no
 * `garage_id`); and `/warranty-claims/warranty/:warrantyId` on that warranty.
 * The `active` / `expired` / `expiring` literals are registered before `:id` so
 * they win. All routes are `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { WARRANTY_SERVICE } from '../../infrastructure/di/tokens';
import { makeWarrantyController } from './controllers/warranty.controller';
import type { WarrantyService } from './services/warranty.service';

export interface WarrantyModuleDeps {
  service?: WarrantyService;
}

export function createWarrantyModule(deps: WarrantyModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(WARRANTY_SERVICE);
  const c = makeWarrantyController(service);
  const router = Router();

  const ownWarranty = requireResourceOwnership({ table: 'warranties' });
  const ownVehicle = requireResourceOwnership({ table: 'vehicles', idParam: 'vehicleId' });
  const ownWarrantyByParam = requireResourceOwnership({ table: 'warranties', idParam: 'warrantyId' });
  const ownClaim = requireResourceOwnership({
    table: 'warranty_claims',
    parent: { table: 'warranties', fk: 'warranty_id' },
  });

  // Warranties
  router.post('/warranties', isAuthenticated, asyncHandler(c.create));
  router.get('/warranties', isAuthenticated, asyncHandler(c.list));
  router.get('/warranties/active', isAuthenticated, asyncHandler(c.listActive));
  router.get('/warranties/expired', isAuthenticated, asyncHandler(c.listExpired));
  router.get('/warranties/expiring', isAuthenticated, asyncHandler(c.listExpiring));
  router.get('/warranties/vehicle/:vehicleId', isAuthenticated, ownVehicle, asyncHandler(c.listByVehicle));
  router.get('/warranties/customer/:customerId', isAuthenticated, asyncHandler(c.listByCustomer));
  router.get('/warranties/:id', isAuthenticated, ownWarranty, asyncHandler(c.getById));
  router.patch('/warranties/:id', isAuthenticated, ownWarranty, asyncHandler(c.update));
  router.delete('/warranties/:id', isAuthenticated, ownWarranty, asyncHandler(c.remove));

  // Warranty claims
  router.post('/warranty-claims', isAuthenticated, asyncHandler(c.createClaim));
  router.get('/warranty-claims', isAuthenticated, asyncHandler(c.listClaims));
  router.get('/warranty-claims/warranty/:warrantyId', isAuthenticated, ownWarrantyByParam, asyncHandler(c.listClaimsByWarranty));
  router.get('/warranty-claims/:id', isAuthenticated, ownClaim, asyncHandler(c.getClaimById));
  router.patch('/warranty-claims/:id', isAuthenticated, ownClaim, asyncHandler(c.updateClaim));
  router.delete('/warranty-claims/:id', isAuthenticated, ownClaim, asyncHandler(c.removeClaim));

  return router;
}

export default createWarrantyModule();
