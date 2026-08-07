/**
 * Spare part controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the existing wire format (`sendPaginated` list;
 * raw object/array otherwise). No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { SparePartService } from '../services/spare-part.service';
import type { InventoryAuthContext } from '../domain/spare-part.types';

function authOf(req: Request): InventoryAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeSparePartController(service: SparePartService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const pagination = parsePagination(req);
      const garageIdParam =
        typeof req.query.garageId === 'string' ? req.query.garageId : undefined;
      const { rows, total } = await service.list({
        auth: authOf(req),
        garageIdParam,
        limit: pagination.limit,
        offset: pagination.offset,
      });
      sendPaginated(res, rows, total, pagination, pagination.explicit);
    },

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getById(req.params.id));
    },

    async inventories(req: Request, res: Response): Promise<void> {
      const garageIdParam =
        typeof req.query.garage_id === 'string' ? req.query.garage_id : undefined;
      const sparePartId =
        typeof req.query.spare_part_id === 'string' ? req.query.spare_part_id : undefined;
      res.json(await service.inventories(authOf(req), garageIdParam, sparePartId));
    },
  };
}

export type SparePartController = ReturnType<typeof makeSparePartController>;
