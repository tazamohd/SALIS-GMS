/**
 * Reorder-setting controller (Phase E2). Thin HTTP adapter; preserves the
 * garage-required list, 201-on-create, 404-on-missing-update, and the
 * process-auto-reorders `{ reorders, count }` response.
 */

import type { Request, Response } from 'express';
import type { ReorderSettingService } from '../services/reorder-setting.service';

function user(req: Request) {
  return req.user as { garageId?: string } | undefined;
}

export function makeReorderSettingController(service: ReorderSettingService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const garageId = user(req)?.garageId ?? (typeof req.query.garageId === 'string' ? req.query.garageId : undefined);
      const sparePartId = typeof req.query.sparePartId === 'string' ? req.query.sparePartId : undefined;
      res.json(await service.list(garageId, sparePartId));
    },
    async create(req: Request, res: Response): Promise<void> {
      res.status(201).json(await service.create(req.body));
    },
    async update(req: Request, res: Response): Promise<void> {
      res.json(await service.update(req.params.id, req.body, user(req)?.garageId));
    },
    async process(req: Request, res: Response): Promise<void> {
      const garageId = (req.body ?? {}).garageId as string | undefined;
      res.json(await service.process(garageId));
    },
  };
}

export type ReorderSettingController = ReturnType<typeof makeReorderSettingController>;
