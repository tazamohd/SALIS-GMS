/**
 * Suppliers module assembly (Phase E1/E2). Wires the suppliers core (suppliers
 * list/detail + supplier price lists) into an Express router via DI. Route paths
 * and response shapes are identical to the legacy `server/routes/suppliers.ts`
 * it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { SUPPLIER_SERVICE } from '../../infrastructure/di/tokens';
import { makeSupplierController } from './controllers/supplier.controller';
import { supplierErrorHandler } from './controllers/supplier.error';
import type { SupplierService } from './services/supplier.service';

export interface SuppliersModuleDeps {
  service?: SupplierService;
}

export function createSuppliersModule(deps: SuppliersModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(SUPPLIER_SERVICE);
  const controller = makeSupplierController(service);
  const router = Router();

  router.get('/suppliers', isAuthenticated, asyncHandler(controller.list));
  router.get('/suppliers/:id', isAuthenticated, asyncHandler(controller.getById));
  router.get('/supplier-price-lists', isAuthenticated, asyncHandler(controller.priceLists));
  router.get('/supplier-price-lists/:id', isAuthenticated, asyncHandler(controller.priceListById));
  router.get(
    '/supplier-price-lists/compare/:sparePartId',
    isAuthenticated,
    asyncHandler(controller.comparePrices),
  );

  router.use(supplierErrorHandler);
  return router;
}

export default createSuppliersModule();
