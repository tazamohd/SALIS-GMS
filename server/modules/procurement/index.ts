/**
 * Procurement module assembly (Phase E1/E2).
 *
 * Wires the procurement sub-domains into an Express router via DI:
 *  - purchase orders + purchase tasks (from `server/routes/purchase-orders.ts`);
 *  - deliveries (from `server/routes/deliveries.ts`);
 *  - reorder settings + pricing history (extracted from `server/routes.ts`).
 *
 * Route paths, garage-scoped reads, parent-verify 404s, the
 * `requireResourceOwnership` guard on reorder-setting updates, and response
 * shapes are identical to the handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import {
  PURCHASE_SERVICE,
  DELIVERY_SERVICE,
  REORDER_SETTING_SERVICE,
  PRICING_HISTORY_SERVICE,
} from '../../infrastructure/di/tokens';
import { makePurchaseController } from './controllers/purchase.controller';
import { makeDeliveryController } from './controllers/delivery.controller';
import { makeReorderSettingController } from './controllers/reorder-setting.controller';
import { makePricingHistoryController } from './controllers/pricing-history.controller';
import { procurementErrorHandler } from './controllers/procurement.error';
import type { PurchaseService } from './services/purchase.service';
import type { DeliveryService } from './services/delivery.service';
import type { ReorderSettingService } from './services/reorder-setting.service';
import type { PricingHistoryService } from './services/pricing-history.service';

export interface ProcurementModuleDeps {
  purchaseService?: PurchaseService;
  deliveryService?: DeliveryService;
  reorderSettingService?: ReorderSettingService;
  pricingHistoryService?: PricingHistoryService;
}

export function createProcurementModule(deps: ProcurementModuleDeps = {}): Router {
  const c = getAppContainer();
  const purchase = makePurchaseController(deps.purchaseService ?? c.resolve(PURCHASE_SERVICE));
  const delivery = makeDeliveryController(deps.deliveryService ?? c.resolve(DELIVERY_SERVICE));
  const reorder = makeReorderSettingController(
    deps.reorderSettingService ?? c.resolve(REORDER_SETTING_SERVICE),
  );
  const pricing = makePricingHistoryController(
    deps.pricingHistoryService ?? c.resolve(PRICING_HISTORY_SERVICE),
  );
  const router = Router();

  // Purchase orders + tasks (reads).
  router.get('/purchase-orders', isAuthenticated, asyncHandler(purchase.listOrders));
  router.get('/purchase-orders/:id', isAuthenticated, asyncHandler(purchase.getOrder));
  router.get('/purchase-orders/:id/items', isAuthenticated, asyncHandler(purchase.orderItems));
  router.get('/purchase-tasks', isAuthenticated, asyncHandler(purchase.listTasks));
  router.get('/purchase-tasks/:id', isAuthenticated, asyncHandler(purchase.getTask));
  router.get('/purchase-tasks/:id/parts', isAuthenticated, asyncHandler(purchase.taskParts));

  // Purchase orders + tasks (writes).
  router.post('/purchase-orders', isAuthenticated, asyncHandler(purchase.createOrder));
  router.post('/purchase-orders/with-items', isAuthenticated, asyncHandler(purchase.createOrderWithItems));
  router.patch(
    '/purchase-orders/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'purchase_orders' }),
    asyncHandler(purchase.updateOrder),
  );
  router.delete(
    '/purchase-orders/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'purchase_orders' }),
    asyncHandler(purchase.deleteOrder),
  );
  router.post('/purchase-order-items', isAuthenticated, asyncHandler(purchase.createOrderItem));
  router.delete(
    '/purchase-order-items/:id',
    isAuthenticated,
    requireResourceOwnership({
      table: 'purchase_order_items',
      parent: { table: 'purchase_orders', fk: 'purchase_order_id' },
    }),
    asyncHandler(purchase.deleteOrderItem),
  );
  router.post('/purchase-tasks', isAuthenticated, asyncHandler(purchase.createTask));
  router.patch(
    '/purchase-tasks/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'purchase_tasks' }),
    asyncHandler(purchase.updateTask),
  );
  router.delete(
    '/purchase-tasks/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'purchase_tasks' }),
    asyncHandler(purchase.deleteTask),
  );

  // Deliveries.
  router.get('/deliveries', isAuthenticated, asyncHandler(delivery.list));
  router.get('/deliveries/:id', isAuthenticated, asyncHandler(delivery.getById));
  router.get('/deliveries/:id/items', isAuthenticated, asyncHandler(delivery.items));
  router.get('/deliveries/:id/timeline', isAuthenticated, asyncHandler(delivery.timeline));
  router.get('/deliveries/:id/live', isAuthenticated, asyncHandler(delivery.live));

  // Reorder settings.
  router.get('/reorder-settings', isAuthenticated, asyncHandler(reorder.list));
  router.post('/reorder-settings', isAuthenticated, asyncHandler(reorder.create));
  router.patch(
    '/reorder-settings/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'reorder_settings' }),
    asyncHandler(reorder.update),
  );
  router.post('/reorder-settings/process', isAuthenticated, asyncHandler(reorder.process));

  // Pricing history.
  router.get('/pricing-history/:sparePartId', isAuthenticated, asyncHandler(pricing.getBySparePart));
  router.post('/pricing-history', isAuthenticated, asyncHandler(pricing.create));

  router.use(procurementErrorHandler);
  return router;
}

export default createProcurementModule();
