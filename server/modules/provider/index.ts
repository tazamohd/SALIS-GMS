/**
 * Provider module assembly (Phase E1/E2). Wires the provider marketplace surface
 * — the caller's garage acting as a marketplace provider: its bookings,
 * offerings, public profile, product orders and insurance quotes — into an
 * Express router via DI. All routes are `isAuthenticated`; the `:id` mutations
 * keep the tenant-scoped `requireResourceOwnership` guards from the monolith.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { PROVIDER_SERVICE } from '../../infrastructure/di/tokens';
import { makeProviderController } from './controllers/provider.controller';
import type { ProviderService } from './services/provider.service';

export interface ProviderModuleDeps {
  service?: ProviderService;
}

export function createProviderModule(deps: ProviderModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(PROVIDER_SERVICE);
  const c = makeProviderController(service);
  const router = Router();

  // Bookings made TO the caller's garage.
  router.get('/provider/bookings', isAuthenticated, asyncHandler(c.listBookings));
  router.patch(
    '/provider/bookings/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'marketplace_bookings', tenantColumn: 'provider_id' }),
    asyncHandler(c.updateBooking),
  );

  // Offerings the provider presents in the marketplace.
  router.get('/provider/offerings', isAuthenticated, asyncHandler(c.listOfferings));
  router.post('/provider/offerings', isAuthenticated, asyncHandler(c.createOffering));
  router.patch(
    '/provider/offerings/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'provider_offerings', tenantColumn: 'provider_id' }),
    asyncHandler(c.updateOffering),
  );
  router.delete(
    '/provider/offerings/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'provider_offerings', tenantColumn: 'provider_id' }),
    asyncHandler(c.deleteOffering),
  );

  // The provider's own public profile.
  router.get('/provider/profile', isAuthenticated, asyncHandler(c.getProfile));
  router.patch('/provider/profile', isAuthenticated, asyncHandler(c.updateProfile));

  // Product orders placed with the provider.
  router.get('/provider/orders', isAuthenticated, asyncHandler(c.listOrders));
  router.patch(
    '/provider/orders/:id',
    isAuthenticated,
    requireResourceOwnership({ table: 'provider_orders', tenantColumn: 'provider_id' }),
    asyncHandler(c.updateOrder),
  );

  // Insurance-quote requests routed to the provider.
  router.get('/provider/quotes', isAuthenticated, asyncHandler(c.listQuotes));
  router.post('/provider/quotes/:id/respond', isAuthenticated, asyncHandler(c.respondQuote));

  return router;
}

export default createProviderModule();
