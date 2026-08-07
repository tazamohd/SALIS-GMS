/**
 * Job card controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the existing wire format (`sendPaginated`
 * envelope for the list; raw object/array for the rest). No business rules, no
 * data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { JobCardService } from '../services/jobcard.service';
import type { JobCardAuthContext } from '../domain/jobcard.types';

function authOf(req: Request): JobCardAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeJobCardController(service: JobCardService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const pagination = parsePagination(req);
      const garageIdParam =
        typeof req.query.garage_id === 'string' ? req.query.garage_id : undefined;
      const assignedTo =
        typeof req.query.assigned_to === 'string' ? req.query.assigned_to : undefined;
      const { rows, total } = await service.list({
        auth: authOf(req),
        garageIdParam,
        assignedTo,
        limit: pagination.limit,
        offset: pagination.offset,
      });
      sendPaginated(res, rows, total, pagination, pagination.explicit);
    },

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getVisible(req.params.id, authOf(req)));
    },

    async details(req: Request, res: Response): Promise<void> {
      res.json(await service.getDetailsVisible(req.params.id, authOf(req)));
    },

    async parts(req: Request, res: Response): Promise<void> {
      res.json(await service.parts(req.params.jobCardId, authOf(req)));
    },

    async tasks(req: Request, res: Response): Promise<void> {
      res.json(await service.tasks(req.params.jobCardId, authOf(req)));
    },
  };
}

export type JobCardController = ReturnType<typeof makeJobCardController>;
