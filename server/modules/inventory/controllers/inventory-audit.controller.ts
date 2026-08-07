/**
 * Inventory audit-trail controller (Phase E2). Thin HTTP adapter; preserves the
 * raw-array list, the `?limit` parse (default 100), and 201-on-create.
 */

import type { Request, Response } from 'express';
import type { InventoryAuditService } from '../services/inventory-audit.service';

function garageOf(req: Request): string | undefined {
  const u = req.user as { garageId?: string } | undefined;
  return u?.garageId ?? (typeof req.query.garageId === 'string' ? req.query.garageId : undefined);
}

export function makeInventoryAuditController(service: InventoryAuditService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const sparePartId =
        typeof req.query.sparePartId === 'string' ? req.query.sparePartId : undefined;
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : undefined;
      res.json(await service.list(garageOf(req), sparePartId, limit));
    },

    async create(req: Request, res: Response): Promise<void> {
      res.status(201).json(await service.create(req.body));
    },
  };
}

export type InventoryAuditController = ReturnType<typeof makeInventoryAuditController>;
