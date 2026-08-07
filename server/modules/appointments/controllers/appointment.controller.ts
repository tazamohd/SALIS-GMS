/**
 * Appointment controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the existing wire format (`sendPaginated`
 * envelope for the list; raw object for detail). No business rules, no
 * data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { AppointmentService } from '../services/appointment.service';
import type { AppointmentAuthContext } from '../domain/appointment.types';

function authOf(req: Request): AppointmentAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeAppointmentController(service: AppointmentService) {
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
      const appointment = await service.getVisible(req.params.id, authOf(req));
      res.json(appointment);
    },
  };
}

export type AppointmentController = ReturnType<typeof makeAppointmentController>;
