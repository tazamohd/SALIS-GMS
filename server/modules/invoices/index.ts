/**
 * Invoices module assembly (Phase E1/E2).
 *
 * Wires the full invoice surface — reads, writes, the server-side from-job
 * generation, status-workflow updates, and deletion — into an Express router via
 * DI. Extracted from the legacy monolith (`server/routes.ts`); the
 * `/api/reconciliation/financial` handler that sat between these routes stays in
 * the monolith (it belongs to financial reporting, not invoice CRUD).
 *
 * Route paths, middleware (`requireResourceOwnership`, the ADMIN/MANAGER role
 * gate on delete, the job-card ownership guard on from-job) and response shapes
 * are identical to the handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { requireRole } from '../../middleware/requireRole';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { INVOICE_SERVICE } from '../../infrastructure/di/tokens';
import { makeInvoiceController } from './controllers/invoice.controller';
import { invoiceErrorHandler } from './controllers/invoice.error';
import type { InvoiceService } from './services/invoice.service';

export interface InvoicesModuleDeps {
  service?: InvoiceService;
}

export function createInvoicesModule(deps: InvoicesModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(INVOICE_SERVICE);
  const controller = makeInvoiceController(service);
  const router = Router();
  const ownsInvoice = requireResourceOwnership({ table: 'invoices' });

  router.get('/invoices', isAuthenticated, asyncHandler(controller.list));
  router.get('/invoices/:id', isAuthenticated, ownsInvoice, asyncHandler(controller.getById));
  router.post('/invoices', isAuthenticated, asyncHandler(controller.create));
  router.post('/invoices/with-items', isAuthenticated, asyncHandler(controller.createWithItems));
  router.post(
    '/invoices/from-job/:jobId',
    isAuthenticated,
    requireResourceOwnership({ table: 'job_cards', idParam: 'jobId' }),
    asyncHandler(controller.createFromJob),
  );
  router.patch('/invoices/:id', isAuthenticated, ownsInvoice, asyncHandler(controller.update));
  router.delete(
    '/invoices/:id',
    isAuthenticated,
    ownsInvoice,
    requireRole(['ADMIN', 'MANAGER']),
    asyncHandler(controller.remove),
  );
  router.get('/invoices/:id/items', isAuthenticated, ownsInvoice, asyncHandler(controller.items));

  router.use(invoiceErrorHandler);
  return router;
}

export default createInvoicesModule();
