/**
 * Payments module assembly (Phase E1/E2).
 *
 * Wires the core payment surface — garage-scoped list, atomic record, and
 * role-gated reversal — into an Express router via DI. Extracted from the legacy
 * monolith (`server/routes.ts`). Route paths, middleware (the parent-scoped
 * `requireResourceOwnership` and the ADMIN/MANAGER/ACCOUNTANT role gate on
 * reversal), and response shapes are identical to the handlers they replace.
 *
 * Scope note: the payment-gateway integration (`payments-gateway.routes.ts`) and
 * supplier payments (`supplier-payments.ts`) are separate domains and are not
 * part of this module.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { requireRole } from '../../middleware/requireRole';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { PAYMENT_SERVICE } from '../../infrastructure/di/tokens';
import { makePaymentController } from './controllers/payment.controller';
import { paymentErrorHandler } from './controllers/payment.error';
import type { PaymentService } from './services/payment.service';

export interface PaymentsModuleDeps {
  service?: PaymentService;
}

export function createPaymentsModule(deps: PaymentsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(PAYMENT_SERVICE);
  const controller = makePaymentController(service);
  const router = Router();

  router.get('/payments', isAuthenticated, asyncHandler(controller.list));
  router.post('/payments', isAuthenticated, asyncHandler(controller.create));
  router.delete(
    '/payments/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'payments', parent: { table: 'invoices', fk: 'invoice_id' } }),
    requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']),
    asyncHandler(controller.reverse),
  );

  router.use(paymentErrorHandler);
  return router;
}

export default createPaymentsModule();
