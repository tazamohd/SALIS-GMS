/**
 * Vehicle controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the existing wire format (`sendPaginated`
 * envelope for the list; raw arrays for sub-resources). No business rules, no
 * data-layer access. Thrown errors propagate via `asyncHandler` to the module
 * error boundary.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { VehicleService } from '../services/vehicle.service';
import type { VehicleAuthContext } from '../domain/vehicle.types';

function authOf(req: Request): VehicleAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeVehicleController(service: VehicleService) {
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

    async serviceHistory(req: Request, res: Response): Promise<void> {
      res.json(await service.serviceHistory(req.params.id));
    },

    async maintenanceSchedules(req: Request, res: Response): Promise<void> {
      res.json(await service.maintenanceSchedules(req.params.id));
    },

    async serviceReminders(req: Request, res: Response): Promise<void> {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      res.json(await service.serviceReminders(req.params.id, status));
    },
  };
}

export type VehicleController = ReturnType<typeof makeVehicleController>;
