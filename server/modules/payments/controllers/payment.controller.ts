/**
 * Payment controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter: validates input at the boundary, calls the service, and
 * writes responses in the EXISTING wire format (the list is a RAW array — not
 * the paginated envelope). No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { paymentInsertSchema } from '../validators/payment.validators';
import type { PaymentService } from '../services/payment.service';
import type { PaymentAuthContext } from '../domain/payment.types';

function authOf(req: Request): PaymentAuthContext {
  const user = req.user as { id?: string; role?: string; garageId?: string | null } | undefined;
  return { userId: user?.id, role: user?.role, garageId: user?.garageId };
}

export function makePaymentController(service: PaymentService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const invoiceId = typeof req.query.invoice_id === 'string' ? req.query.invoice_id : undefined;
      const method = typeof req.query.method === 'string' ? req.query.method : undefined;
      const rows = await service.list(authOf(req), { invoiceId, method });
      res.json(rows);
    },

    async create(req: Request, res: Response): Promise<void> {
      const validation = paymentInsertSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const payment = await service.create(validation.data as never, authOf(req));
      res.status(201).json(payment);
    },

    async reverse(req: Request, res: Response): Promise<void> {
      await service.reverse(req.params.id, authOf(req));
      res.json({ message: 'Payment reversed successfully' });
    },
  };
}

export type PaymentController = ReturnType<typeof makePaymentController>;
