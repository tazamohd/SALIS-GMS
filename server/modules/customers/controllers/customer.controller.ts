/**
 * Customer controller (Phase E2 — Layered Architecture, controller layer).
 *
 * Thin HTTP adapter: extracts the request, calls the service, and writes the
 * response in the EXISTING wire format (raw arrays/objects and the shared
 * `sendPaginated` envelope) so clients and tests are unaffected by the
 * migration. It never touches the data layer and holds no business rules —
 * those live in the service. Thrown domain errors propagate via `asyncHandler`
 * to the module error boundary.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import type { CustomerService } from '../services/customer.service';
import type { CustomerAuthContext } from '../domain/customer.types';

function authOf(req: Request): CustomerAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeCustomerController(service: CustomerService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const pagination = parsePagination(req);
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const garageIdParam =
        typeof req.query.garage_id === 'string' ? req.query.garage_id : undefined;

      const { rows, total } = await service.list({
        auth: authOf(req),
        garageIdParam,
        search,
        limit: pagination.limit,
        offset: pagination.offset,
      });
      sendPaginated(res, rows, total, pagination, pagination.explicit);
    },

    async getById(req: Request, res: Response): Promise<void> {
      const customer = await service.getVisible(req.params.id, authOf(req));
      res.json(customer);
    },

    async vehicles(req: Request, res: Response): Promise<void> {
      res.json(await service.vehicles(req.params.id, authOf(req)));
    },

    async jobCards(req: Request, res: Response): Promise<void> {
      res.json(await service.jobCards(req.params.id, authOf(req)));
    },

    async invoices(req: Request, res: Response): Promise<void> {
      res.json(await service.invoices(req.params.id, authOf(req)));
    },

    async payments(req: Request, res: Response): Promise<void> {
      res.json(await service.payments(req.params.id, authOf(req)));
    },

    async notes(req: Request, res: Response): Promise<void> {
      res.json(await service.notes(req.params.id, authOf(req)));
    },

    async serviceReminders(req: Request, res: Response): Promise<void> {
      res.json(await service.serviceReminders(req.params.customerId, authOf(req)));
    },

    async reviews(req: Request, res: Response): Promise<void> {
      res.json(await service.reviews(req.params.customerId, authOf(req)));
    },

    async signatures(req: Request, res: Response): Promise<void> {
      res.json(await service.signatures(req.params.customerId, authOf(req)));
    },
  };
}

export type CustomerController = ReturnType<typeof makeCustomerController>;
