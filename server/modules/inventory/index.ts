/**
 * Inventory module assembly (Phase E1/E2).
 *
 * Wires the inventory-items core — spare parts list/detail and per-garage
 * inventory rows — into an Express router via DI. Route paths and response
 * shapes are identical to the legacy `server/routes/spare-parts.ts` it replaces.
 * Inventory dashboards, stock alerts, audit trail, and transfers are further
 * inventory sub-domains migrated separately.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { SPARE_PART_SERVICE } from '../../infrastructure/di/tokens';
import { makeSparePartController } from './controllers/spare-part.controller';
import { inventoryErrorHandler } from './controllers/inventory.error';
import type { SparePartService } from './services/spare-part.service';

export interface InventoryModuleDeps {
  service?: SparePartService;
}

export function createInventoryModule(deps: InventoryModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(SPARE_PART_SERVICE);
  const controller = makeSparePartController(service);
  const router = Router();

  router.get('/spare-parts', isAuthenticated, asyncHandler(controller.list));
  router.get('/spare-parts/:id', isAuthenticated, asyncHandler(controller.getById));
  router.get('/spare-part-inventories', isAuthenticated, asyncHandler(controller.inventories));

  router.use(inventoryErrorHandler);
  return router;
}

export default createInventoryModule();
