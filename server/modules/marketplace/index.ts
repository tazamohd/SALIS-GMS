/**
 * Marketplace module assembly (Phase E1/E2). Wires the PUBLIC marketplace
 * provider-discovery reads (providers list/detail, smart search, reviews) into
 * an Express router via DI. These routes are intentionally unauthenticated —
 * identical to the legacy monolith handlers they replace.
 *
 * Scope: this is the provider-discovery surface only. The authenticated
 * parts-marketplace (`/marketplace/search`, `/marketplace/orders*`, order
 * tracking) and the customer review-submission (`/my/reviews`) remain in the
 * monolith for follow-on increments.
 */

import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { MARKETPLACE_SERVICE } from '../../infrastructure/di/tokens';
import { makeMarketplaceController } from './controllers/marketplace.controller';
import type { MarketplaceService } from './services/marketplace.service';

export interface MarketplaceModuleDeps {
  service?: MarketplaceService;
}

export function createMarketplaceModule(deps: MarketplaceModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(MARKETPLACE_SERVICE);
  const controller = makeMarketplaceController(service);
  const router = Router();

  // Public provider discovery (no auth — matches the legacy handlers).
  router.get('/marketplace/providers', asyncHandler(controller.listProviders));
  router.get('/marketplace/providers/:id', asyncHandler(controller.getProvider));
  router.get('/marketplace/find', asyncHandler(controller.find));
  router.get('/marketplace/providers/:id/reviews', asyncHandler(controller.reviews));

  return router;
}

export default createMarketplaceModule();
