/**
 * Marketplace module assembly (Phase E1/E2). Wires two surfaces into one
 * Express router via DI:
 *
 *  1. PUBLIC provider discovery (providers list/detail, smart search, reviews) —
 *     intentionally unauthenticated, identical to the legacy monolith handlers.
 *  2. AUTHENTICATED write-path — the eBay/Amazon parts marketplace
 *     (`/marketplace/search`, `/marketplace/orders*`, order tracking) and the
 *     customer review-submission (`/my/reviews`), each behind `isAuthenticated`,
 *     matching the legacy handlers they replace.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { MARKETPLACE_SERVICE, MARKETPLACE_WRITES_SERVICE } from '../../infrastructure/di/tokens';
import { makeMarketplaceController } from './controllers/marketplace.controller';
import { makeMarketplaceWritesController } from './controllers/marketplace-writes.controller';
import type { MarketplaceService } from './services/marketplace.service';
import type { MarketplaceWritesService } from './services/marketplace-writes.service';

export interface MarketplaceModuleDeps {
  service?: MarketplaceService;
  writesService?: MarketplaceWritesService;
}

export function createMarketplaceModule(deps: MarketplaceModuleDeps = {}): Router {
  const container = getAppContainer();
  const service = deps.service ?? container.resolve(MARKETPLACE_SERVICE);
  const writesService = deps.writesService ?? container.resolve(MARKETPLACE_WRITES_SERVICE);
  const controller = makeMarketplaceController(service);
  const writes = makeMarketplaceWritesController(writesService);
  const router = Router();

  // Public provider discovery (no auth — matches the legacy handlers).
  router.get('/marketplace/providers', asyncHandler(controller.listProviders));
  router.get('/marketplace/providers/:id', asyncHandler(controller.getProvider));
  router.get('/marketplace/find', asyncHandler(controller.find));
  router.get('/marketplace/providers/:id/reviews', asyncHandler(controller.reviews));

  // Authenticated parts marketplace (eBay/Amazon) — search, orders, tracking.
  router.get('/marketplace/search', isAuthenticated, asyncHandler(writes.searchParts));
  router.get('/marketplace/orders', isAuthenticated, asyncHandler(writes.listOrders));
  router.post('/marketplace/orders', isAuthenticated, asyncHandler(writes.placeOrder));
  router.get('/marketplace/orders/:id/track', isAuthenticated, asyncHandler(writes.trackOrder));

  // Authenticated customer review submission (transaction-gated).
  router.post('/my/reviews', isAuthenticated, asyncHandler(writes.submitReview));

  return router;
}

export default createMarketplaceModule();
