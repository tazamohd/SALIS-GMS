/**
 * Invoice controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter: validates input at the boundary (Zod + shared sanitizers),
 * calls the service, and writes responses in the EXISTING wire format
 * (`sendPaginated` list, raw objects, `{ invoice, breakdown, items }` for the
 * from-job flow). No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import {
  sanitizeZodError,
  sanitizeArrayValidationErrors,
} from '../../../utils/validation-errors';
import {
  invoiceInsertSchema,
  invoiceUpdateSchema,
  invoiceItemInsertSchema,
} from '../validators/invoice.validators';
import type { InvoiceService } from '../services/invoice.service';
import type { InvoiceAuthContext } from '../domain/invoice.types';

function authOf(req: Request): InvoiceAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makeInvoiceController(service: InvoiceService) {
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

    async getById(req: Request, res: Response): Promise<void> {
      res.json(await service.getVisible(req.params.id, authOf(req)));
    },

    async create(req: Request, res: Response): Promise<void> {
      const validation = invoiceInsertSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const invoice = await service.create(validation.data as never, authOf(req));
      res.status(201).json(invoice);
    },

    async createWithItems(req: Request, res: Response): Promise<void> {
      const { invoice, items } = req.body ?? {};
      if (!invoice || !items || !Array.isArray(items)) {
        res.status(400).json({ message: 'Invalid request: invoice and items (array) required' });
        return;
      }
      const invoiceValidation = invoiceInsertSchema.safeParse(invoice);
      if (!invoiceValidation.success) {
        res.status(400).json(sanitizeZodError(invoiceValidation.error));
        return;
      }
      const itemsValidation = items.map((item: unknown) => invoiceItemInsertSchema.safeParse(item));
      const invalidItems = itemsValidation.filter((v) => !v.success);
      if (invalidItems.length > 0) {
        res.status(400).json(
          sanitizeArrayValidationErrors(invalidItems as Array<{ success: false; error: import('zod').ZodError }>),
        );
        return;
      }
      const validItems = itemsValidation.map((v) => (v.success ? v.data : null)).filter(Boolean);
      const created = await service.createWithItems(
        invoiceValidation.data as never,
        validItems as never,
        authOf(req),
      );
      res.status(201).json(created);
    },

    async createFromJob(req: Request, res: Response): Promise<void> {
      const result = await service.createFromJob(req.params.jobId, authOf(req));
      res.status(201).json(result);
    },

    async update(req: Request, res: Response): Promise<void> {
      const validation = invoiceUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const invoice = await service.update(req.params.id, validation.data as never, authOf(req));
      res.json(invoice);
    },

    async remove(req: Request, res: Response): Promise<void> {
      await service.delete(req.params.id, authOf(req));
      res.json({ message: 'Invoice deleted successfully' });
    },

    async items(req: Request, res: Response): Promise<void> {
      res.json(await service.getItemsVisible(req.params.id, authOf(req)));
    },
  };
}

export type InvoiceController = ReturnType<typeof makeInvoiceController>;
