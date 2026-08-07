/**
 * Inventory module assembly (Phase E1/E2).
 *
 * Wires the inventory domain into an Express router via DI:
 *  - items core (spare parts list/detail + per-garage inventories), extracted
 *    from `server/routes/spare-parts.ts`;
 *  - analytics dashboards (overview, items, low-stock, suppliers, turnover,
 *    valuation) and the reorder purchase-order flow, extracted from
 *    `server/routes/inventory-management.ts`.
 *
 * Route paths and response shapes — including the dashboards' graceful-
 * degradation defaults and the reorder `{ error }` contract — are identical to
 * the handlers they replace. Stock alerts, audit trail, and transfers are
 * further inventory sub-domains migrated separately.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { SPARE_PART_SERVICE, INVENTORY_DASHBOARD_SERVICE } from '../../infrastructure/di/tokens';
import { makeSparePartController } from './controllers/spare-part.controller';
import { makeInventoryDashboardController } from './controllers/inventory-dashboard.controller';
import { inventoryErrorHandler } from './controllers/inventory.error';
import type { SparePartService } from './services/spare-part.service';
import type { InventoryDashboardService } from './services/inventory-dashboard.service';

export interface InventoryModuleDeps {
  service?: SparePartService;
  dashboardService?: InventoryDashboardService;
}

export function createInventoryModule(deps: InventoryModuleDeps = {}): Router {
  const container = getAppContainer();
  const parts = makeSparePartController(deps.service ?? container.resolve(SPARE_PART_SERVICE));
  const dash = makeInventoryDashboardController(
    deps.dashboardService ?? container.resolve(INVENTORY_DASHBOARD_SERVICE),
  );
  const router = Router();

  // Items core.
  router.get('/spare-parts', isAuthenticated, asyncHandler(parts.list));
  router.get('/spare-parts/:id', isAuthenticated, asyncHandler(parts.getById));
  router.get('/spare-part-inventories', isAuthenticated, asyncHandler(parts.inventories));

  // Analytics dashboards + reorder (each handler manages its own error contract).
  router.get('/inventory/overview', isAuthenticated, dash.overview);
  router.get('/inventory/items', isAuthenticated, dash.items);
  router.get('/inventory/low-stock', isAuthenticated, dash.lowStock);
  router.post('/inventory/reorder', isAuthenticated, dash.reorder);
  router.get('/inventory/suppliers', isAuthenticated, dash.suppliers);
  router.get('/inventory/turnover', isAuthenticated, dash.turnover);
  router.get('/inventory/valuation', isAuthenticated, dash.valuation);

  router.use(inventoryErrorHandler);
  return router;
}

export default createInventoryModule();
