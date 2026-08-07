/**
 * Supplier controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the existing wire format (`sendPaginated` list;
 * raw object/array otherwise). No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { SupplierService } from '../services/supplier.service';
import type { SupplierAuthContext } from '../domain/supplier.types';

function authOf(req: Request): SupplierAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeSupplierController(service: SupplierService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const pagination = parsePagination(req);
      const garageIdParam =
        typeof req.query.garage_id === 'string' ? req.query.garage_id : undefined;
      const { rows, total } = await service.list({
        auth: authOf(req),
        garageIdParam,
        limit: pagination.limit,
        offset: pagination.offset,
      });
      sendPaginated(res, rows, total, pagination, pagination.explicit);
    },

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getVisible(req.params.id, authOf(req)));
    },

    async priceLists(req: Request, res: Response): Promise<void> {
      const supplierId = typeof req.query.supplierId === 'string' ? req.query.supplierId : undefined;
      const sparePartId = typeof req.query.sparePartId === 'string' ? req.query.sparePartId : undefined;
      res.json(await service.priceLists(supplierId, sparePartId));
    },

    async priceListById(req: Request, res: Response): Promise<void> {
      res.json(await service.priceListById(req.params.id, authOf(req)));
    },

    async comparePrices(req: Request, res: Response): Promise<void> {
      res.json(await service.comparePrices(req.params.sparePartId));
    },
  };
}

export type SupplierController = ReturnType<typeof makeSupplierController>;
