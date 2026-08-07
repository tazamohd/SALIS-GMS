/**
 * Inventory transfer controller (Phase E2). Thin HTTP adapter; preserves the
 * raw-array list, 404-on-missing detail, 201-on-create, and the approve/complete
 * action responses. No data-layer access.
 */

import type { Request, Response } from 'express';
import type { InventoryTransferService } from '../services/inventory-transfer.service';

function user(req: Request) {
  return req.user as { id?: string; garageId?: string } | undefined;
}

export function makeInventoryTransferController(service: InventoryTransferService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const garageId = user(req)?.garageId ?? (typeof req.query.garageId === 'string' ? req.query.garageId : undefined);
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      res.json(await service.list(garageId, status));
    },

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getById(req.params.id));
    },

    async create(req: Request, res: Response): Promise<void> {
      res.status(201).json(await service.create(req.body));
    },

    async update(req: Request, res: Response): Promise<void> {
      res.json(await service.update(req.params.id, req.body));
    },

    async approve(req: Request, res: Response): Promise<void> {
      res.json(await service.approve(req.params.id, user(req)?.id || 'default-user'));
    },

    async complete(req: Request, res: Response): Promise<void> {
      res.json(await service.complete(req.params.id, user(req)?.id || 'default-user'));
    },
  };
}

export type InventoryTransferController = ReturnType<typeof makeInventoryTransferController>;
