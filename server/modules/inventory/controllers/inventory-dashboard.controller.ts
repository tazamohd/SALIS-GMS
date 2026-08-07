/**
 * Inventory dashboard controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter. The GET dashboards gracefully degrade — on any error they
 * return HTTP 200 with the documented empty/zero default (matching the legacy
 * handlers), so the frontend dashboards never hard-fail. The reorder POST does
 * its own request validation (401/400) and returns an `{ error }` body on
 * failure — preserving the exact legacy contract. No data-layer access.
 */

import type { Request, Response } from 'express';
import type { InventoryDashboardService } from '../services/inventory-dashboard.service';
import { EMPTY_OVERVIEW } from '../domain/inventory-dashboard.types';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}

export function makeInventoryDashboardController(service: InventoryDashboardService) {
  return {
    async overview(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.overview(garageOf(req)));
      } catch (error) {
        console.error('Inventory overview error:', error);
        res.json(EMPTY_OVERVIEW);
      }
    },

    async items(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.items(garageOf(req)));
      } catch (error) {
        console.error('Inventory items error:', error);
        res.json({ items: [] });
      }
    },

    async lowStock(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.lowStock(garageOf(req)));
      } catch (error) {
        console.error('Low stock error:', error);
        res.json({ items: [] });
      }
    },

    async suppliers(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.suppliers(garageOf(req)));
      } catch (error) {
        console.error('Suppliers error:', error);
        res.json({ suppliers: [] });
      }
    },

    async turnover(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.turnover(garageOf(req)));
      } catch (error) {
        console.error('Turnover error:', error);
        res.json({ turnover: [] });
      }
    },

    async valuation(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.valuation(garageOf(req)));
      } catch (error) {
        console.error('Valuation error:', error);
        res.json({
          totalCostValue: 0,
          totalSellingValue: 0,
          totalQuantity: 0,
          totalItems: 0,
          potentialProfit: 0,
          categories: [],
        });
      }
    },

    async reorder(req: Request, res: Response): Promise<void> {
      const user = req.user as { id?: string; garageId?: string } | undefined;
      const garageId = user?.garageId;
      const userId = user?.id;
      if (!garageId || !userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { supplierId, items, notes } = req.body ?? {};
      if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'supplierId and items array are required' });
        return;
      }
      try {
        const { poNumber, purchaseOrder } = await service.reorder(garageId, userId, {
          supplierId,
          items,
          notes,
        });
        res.json({
          success: true,
          purchaseOrder,
          message: `Purchase order ${poNumber} created successfully`,
        });
      } catch (error) {
        console.error('Reorder error:', error);
        res.status(500).json({ error: 'Failed to create purchase order' });
      }
    },
  };
}

export type InventoryDashboardController = ReturnType<typeof makeInventoryDashboardController>;
