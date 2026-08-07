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
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import {
  SPARE_PART_SERVICE,
  INVENTORY_DASHBOARD_SERVICE,
  STOCK_ALERT_SERVICE,
  INVENTORY_AUDIT_SERVICE,
  INVENTORY_TRANSFER_SERVICE,
} from '../../infrastructure/di/tokens';
import { makeSparePartController } from './controllers/spare-part.controller';
import { makeInventoryDashboardController } from './controllers/inventory-dashboard.controller';
import { makeStockAlertController } from './controllers/stock-alert.controller';
import { makeInventoryAuditController } from './controllers/inventory-audit.controller';
import { makeInventoryTransferController } from './controllers/inventory-transfer.controller';
import { inventoryErrorHandler } from './controllers/inventory.error';
import type { SparePartService } from './services/spare-part.service';
import type { InventoryDashboardService } from './services/inventory-dashboard.service';
import type { StockAlertService } from './services/stock-alert.service';
import type { InventoryAuditService } from './services/inventory-audit.service';
import type { InventoryTransferService } from './services/inventory-transfer.service';

export interface InventoryModuleDeps {
  service?: SparePartService;
  dashboardService?: InventoryDashboardService;
  stockAlertService?: StockAlertService;
  auditService?: InventoryAuditService;
  transferService?: InventoryTransferService;
}

export function createInventoryModule(deps: InventoryModuleDeps = {}): Router {
  const container = getAppContainer();
  const parts = makeSparePartController(deps.service ?? container.resolve(SPARE_PART_SERVICE));
  const dash = makeInventoryDashboardController(
    deps.dashboardService ?? container.resolve(INVENTORY_DASHBOARD_SERVICE),
  );
  const alerts = makeStockAlertController(
    deps.stockAlertService ?? container.resolve(STOCK_ALERT_SERVICE),
  );
  const audit = makeInventoryAuditController(
    deps.auditService ?? container.resolve(INVENTORY_AUDIT_SERVICE),
  );
  const transfers = makeInventoryTransferController(
    deps.transferService ?? container.resolve(INVENTORY_TRANSFER_SERVICE),
  );
  const ownsTransfer = requireResourceOwnership({
    table: 'inventory_transfers',
    tenantColumns: ['from_garage_id', 'to_garage_id'],
  });
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

  // Stock alerts.
  router.get('/stock-alerts', isAuthenticated, asyncHandler(alerts.list));
  router.post('/stock-alerts', isAuthenticated, asyncHandler(alerts.create));
  router.patch(
    '/stock-alerts/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'stock_alerts' }),
    asyncHandler(alerts.update),
  );
  router.post(
    '/stock-alerts/:id/acknowledge',
    isAuthenticated,
    requireResourceOwnership({ table: 'stock_alerts' }),
    asyncHandler(alerts.acknowledge),
  );

  // Inventory audit trail.
  router.get('/inventory-audit-trail', isAuthenticated, asyncHandler(audit.list));
  router.post('/inventory-audit-trail', isAuthenticated, asyncHandler(audit.create));

  // Inventory transfers (dual-garage ownership: from_garage_id / to_garage_id).
  router.get('/inventory-transfers', isAuthenticated, asyncHandler(transfers.list));
  router.get('/inventory-transfers/:id', isAuthenticated, ownsTransfer, asyncHandler(transfers.getById));
  router.post('/inventory-transfers', isAuthenticated, asyncHandler(transfers.create));
  router.patch('/inventory-transfers/:id', isAuthenticated, ownsTransfer, asyncHandler(transfers.update));
  router.post(
    '/inventory-transfers/:id/approve',
    isAuthenticated,
    ownsTransfer,
    asyncHandler(transfers.approve),
  );
  router.post(
    '/inventory-transfers/:id/complete',
    isAuthenticated,
    ownsTransfer,
    asyncHandler(transfers.complete),
  );

  router.use(inventoryErrorHandler);
  return router;
}

export default createInventoryModule();
