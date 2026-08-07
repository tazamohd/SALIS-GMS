/**
 * Delivery controller (Phase E2). Thin HTTP adapter; preserves the raw-array
 * list and raw detail/child responses.
 */

import type { Request, Response } from 'express';
import type { DeliveryService } from '../services/delivery.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}

export function makeDeliveryController(service: DeliveryService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      res.json(await service.list(garageOf(req), status));
    },
    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getById(req.params.id, garageOf(req)));
    },
    async items(req: Request, res: Response): Promise<void> {
      res.json(await service.items(req.params.id, garageOf(req)));
    },
    async timeline(req: Request, res: Response): Promise<void> {
      res.json(await service.timeline(req.params.id, garageOf(req)));
    },
    async live(req: Request, res: Response): Promise<void> {
      res.json(await service.live(req.params.id, garageOf(req)));
    },
  };
}

export type DeliveryController = ReturnType<typeof makeDeliveryController>;
