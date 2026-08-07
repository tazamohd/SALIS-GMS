/**
 * Stock alert controller (Phase E2). Thin HTTP adapter; preserves the raw-array
 * list, 201-on-create, and 404-on-missing-update contracts. No data-layer access.
 */

import type { Request, Response } from 'express';
import type { StockAlertService } from '../services/stock-alert.service';

function user(req: Request) {
  return req.user as { id?: string; garageId?: string } | undefined;
}

export function makeStockAlertController(service: StockAlertService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const garageId = user(req)?.garageId ?? (typeof req.query.garageId === 'string' ? req.query.garageId : undefined);
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      res.json(await service.list(garageId, status));
    },

    async create(req: Request, res: Response): Promise<void> {
      res.status(201).json(await service.create(req.body));
    },

    async update(req: Request, res: Response): Promise<void> {
      res.json(await service.update(req.params.id, req.body, user(req)?.garageId));
    },

    async acknowledge(req: Request, res: Response): Promise<void> {
      res.json(await service.acknowledge(req.params.id, user(req)?.id || 'default-user'));
    },
  };
}

export type StockAlertController = ReturnType<typeof makeStockAlertController>;
