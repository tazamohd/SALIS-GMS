/**
 * Garage controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the existing wire format (`sendPaginated`
 * envelope for the list; raw object/array for the rest). No business rules, no
 * data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { GarageService } from '../services/garage.service';

export function makeGarageController(service: GarageService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const pagination = parsePagination(req);
      const { rows, total } = await service.list({
        limit: pagination.limit,
        offset: pagination.offset,
      });
      sendPaginated(res, rows, total, pagination, pagination.explicit);
    },

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getById(req.params.id));
    },

    async branches(req: Request, res: Response): Promise<void> {
      res.json(await service.branches(req.params.id));
    },

    async roles(_req: Request, res: Response): Promise<void> {
      res.json(await service.roles());
    },

    async userRoles(req: Request, res: Response): Promise<void> {
      res.json(await service.userRoles(req.params.id));
    },
  };
}

export type GarageController = ReturnType<typeof makeGarageController>;
