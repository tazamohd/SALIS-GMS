/**
 * Purchase controller (Phase E2). Thin HTTP adapter; preserves the opt-in
 * `sendPaginated` envelope for lists and raw responses for detail/child reads.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { PurchaseService } from '../services/purchase.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makePurchaseController(service: PurchaseService) {
  return {
    async listOrders(req: Request, res: Response): Promise<void> {
      const pg = parsePagination(req);
      const { rows, total } = await service.listOrders(garageOf(req), str(req.query.status), pg);
      sendPaginated(res, rows, total, pg, pg.explicit);
    },
    async getOrder(req: Request, res: Response): Promise<void> {
      res.json(await service.getOrder(req.params.id, garageOf(req)));
    },
    async orderItems(req: Request, res: Response): Promise<void> {
      res.json(await service.orderItems(req.params.id, garageOf(req)));
    },
    async listTasks(req: Request, res: Response): Promise<void> {
      const pg = parsePagination(req);
      const { rows, total } = await service.listTasks(
        garageOf(req),
        str(req.query.status),
        str(req.query.priority),
        pg,
      );
      sendPaginated(res, rows, total, pg, pg.explicit);
    },
    async getTask(req: Request, res: Response): Promise<void> {
      res.json(await service.getTask(req.params.id, garageOf(req)));
    },
    async taskParts(req: Request, res: Response): Promise<void> {
      res.json(await service.taskParts(req.params.id, garageOf(req)));
    },
  };
}

export type PurchaseController = ReturnType<typeof makePurchaseController>;
