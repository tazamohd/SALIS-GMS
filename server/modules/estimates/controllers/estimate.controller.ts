/**
 * Estimate controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter: validates input at the boundary (Zod + the shared
 * sanitizers), calls the service, and writes responses in the EXISTING wire
 * format (`sendPaginated` list, raw objects, `{ jobCard|invoice, message }`
 * conversion envelopes). No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import {
  sanitizeZodError,
  sanitizeArrayValidationErrors,
} from '../../../utils/validation-errors';
import {
  estimateInsertSchema,
  estimateUpdateSchema,
  estimateItemInsertSchema,
} from '../validators/estimate.validators';
import type { EstimateService } from '../services/estimate.service';
import type { EstimateAuthContext } from '../domain/estimate.types';

function authOf(req: Request): EstimateAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeEstimateController(service: EstimateService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const pagination = parsePagination(req);
      const garageIdParam =
        typeof req.query.garage_id === 'string' ? req.query.garage_id : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const { rows, total } = await service.list({
        auth: authOf(req),
        garageIdParam,
        status,
        limit: pagination.limit,
        offset: pagination.offset,
      });
      sendPaginated(res, rows, total, pagination, pagination.explicit);
    },

    async stats(req: Request, res: Response): Promise<void> {
      res.json(await service.stats(authOf(req).garageId));
    },

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getVisible(req.params.id, authOf(req)));
    },

    async createWithItems(req: Request, res: Response): Promise<void> {
      const userId = authOf(req).userId || 'default-user';
      const { estimate, items } = req.body ?? {};

      if (!estimate || !items || !Array.isArray(items)) {
        res.status(400).json({ message: 'Invalid request: estimate and items (array) required' });
        return;
      }

      const estimateValidation = estimateInsertSchema.safeParse(estimate);
      if (!estimateValidation.success) {
        res.status(400).json(sanitizeZodError(estimateValidation.error));
        return;
      }

      const itemsValidation = items.map((item: unknown) => estimateItemInsertSchema.safeParse(item));
      const invalidItems = itemsValidation.filter((v) => !v.success);
      if (invalidItems.length > 0) {
        res.status(400).json(
          sanitizeArrayValidationErrors(invalidItems as Array<{ success: false; error: import('zod').ZodError }>),
        );
        return;
      }

      const estimateData = { ...estimateValidation.data, createdBy: userId };
      const validItems = itemsValidation
        .map((v) => (v.success ? v.data : null))
        .filter(Boolean);

      const created = await service.createWithItems(estimateData as never, validItems as never);
      res.status(201).json(created);
    },

    async update(req: Request, res: Response): Promise<void> {
      const validation = estimateUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const estimate = await service.update(
        req.params.id,
        validation.data as never,
        authOf(req).garageId ?? undefined,
      );
      res.json(estimate);
    },

    async remove(req: Request, res: Response): Promise<void> {
      await service.delete(req.params.id, authOf(req).garageId ?? undefined);
      res.json({ message: 'Estimate deleted successfully' });
    },

    async items(req: Request, res: Response): Promise<void> {
      res.json(await service.getItems(req.params.id));
    },

    async convertToJobCard(req: Request, res: Response): Promise<void> {
      const jobCard = await service.convertToJobCard(req.params.id, authOf(req));
      res.json({ jobCard, message: 'Estimate converted to job card successfully' });
    },

    async convertToInvoice(req: Request, res: Response): Promise<void> {
      const invoice = await service.convertToInvoice(req.params.id, authOf(req));
      res.json({ invoice, message: 'Estimate converted to invoice successfully' });
    },
  };
}

export type EstimateController = ReturnType<typeof makeEstimateController>;
