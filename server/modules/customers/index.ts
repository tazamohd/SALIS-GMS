/**
 * Customers module assembly (Phase E1/E2).
 *
 * Wires the layered customer slice into an Express router: controllers resolved
 * from the DI container (service → repository → storage seam), the same
 * authentication middleware, `asyncHandler` for safe error propagation, and a
 * module-scoped error boundary. The route surface and response shapes are
 * identical to the legacy `server/routes/customers.ts` it replaces.
 *
 * `createCustomersModule(deps)` accepts optional overrides so the module can be
 * mounted with fakes in integration tests without the global container.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { CUSTOMER_SERVICE } from '../../infrastructure/di/tokens';
import { makeCustomerController } from './controllers/customer.controller';
import { customerErrorHandler } from './controllers/customer.error';
import type { CustomerService } from './services/customer.service';

export interface CustomersModuleDeps {
  service?: CustomerService;
}

export function createCustomersModule(deps: CustomersModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(CUSTOMER_SERVICE);
  const controller = makeCustomerController(service);
  const router = Router();

  router.get('/customers', isAuthenticated, asyncHandler(controller.list));
  router.get('/customers/:id', isAuthenticated, asyncHandler(controller.getById));
  router.get('/customers/:id/vehicles', isAuthenticated, asyncHandler(controller.vehicles));
  router.get('/customers/:id/job-cards', isAuthenticated, asyncHandler(controller.jobCards));
  router.get('/customers/:id/invoices', isAuthenticated, asyncHandler(controller.invoices));
  router.get('/customers/:id/payments', isAuthenticated, asyncHandler(controller.payments));
  router.get('/customers/:id/notes', isAuthenticated, asyncHandler(controller.notes));
  router.get(
    '/customers/:customerId/service-reminders',
    isAuthenticated,
    asyncHandler(controller.serviceReminders),
  );
  router.get('/customers/:customerId/reviews', isAuthenticated, asyncHandler(controller.reviews));
  router.get(
    '/customers/:customerId/signatures',
    isAuthenticated,
    asyncHandler(controller.signatures),
  );

  // Module-scoped error boundary (E12): renders legacy-compatible bodies.
  router.use(customerErrorHandler);
  return router;
}

export default createCustomersModule();
