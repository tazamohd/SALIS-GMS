/**
 * Dynamic-pricing module assembly (Phase E1/E2). Wires the dynamic-pricing
 * domain — market pricing data, vehicle pricing factors, pricing suggestions
 * (accept/reject), the price calculator and the service-type / vehicle-class
 * catalogues — into an Express router via DI. The `:id` mutations keep their
 * `requireResourceOwnership` guards; all routes are `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { DYNAMIC_PRICING_SERVICE } from '../../infrastructure/di/tokens';
import { makeDynamicPricingController } from './controllers/dynamic-pricing.controller';
import type { DynamicPricingService } from './services/dynamic-pricing.service';

export interface DynamicPricingModuleDeps {
  service?: DynamicPricingService;
}

export function createDynamicPricingModule(deps: DynamicPricingModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(DYNAMIC_PRICING_SERVICE);
  const c = makeDynamicPricingController(service);
  const router = Router();
  const ownMarketData = requireResourceOwnership({ table: 'market_pricing_data' });
  const ownVehicleFactor = requireResourceOwnership({ table: 'vehicle_pricing_factors' });
  const ownSuggestion = requireResourceOwnership({ table: 'dynamic_pricing_suggestions' });

  // Market pricing data
  router.get('/dynamic-pricing/market-data', isAuthenticated, asyncHandler(c.listMarketData));
  router.post('/dynamic-pricing/market-data', isAuthenticated, asyncHandler(c.createMarketData));
  router.patch('/dynamic-pricing/market-data/:id', isAuthenticated, ownMarketData, asyncHandler(c.updateMarketData));
  router.delete('/dynamic-pricing/market-data/:id', isAuthenticated, ownMarketData, asyncHandler(c.deleteMarketData));

  // Vehicle pricing factors
  router.get('/dynamic-pricing/vehicle-factors', isAuthenticated, asyncHandler(c.listVehicleFactors));
  router.post('/dynamic-pricing/vehicle-factors', isAuthenticated, asyncHandler(c.createVehicleFactor));
  router.patch('/dynamic-pricing/vehicle-factors/:id', isAuthenticated, ownVehicleFactor, asyncHandler(c.updateVehicleFactor));
  router.delete('/dynamic-pricing/vehicle-factors/:id', isAuthenticated, ownVehicleFactor, asyncHandler(c.deleteVehicleFactor));

  // Pricing suggestions
  router.get('/dynamic-pricing/suggestions', isAuthenticated, asyncHandler(c.listSuggestions));
  router.get('/dynamic-pricing/suggestions/:id', isAuthenticated, ownSuggestion, asyncHandler(c.getSuggestion));
  router.post('/dynamic-pricing/suggestions', isAuthenticated, asyncHandler(c.createSuggestion));
  router.patch('/dynamic-pricing/suggestions/:id', isAuthenticated, ownSuggestion, asyncHandler(c.updateSuggestion));
  router.delete('/dynamic-pricing/suggestions/:id', isAuthenticated, ownSuggestion, asyncHandler(c.deleteSuggestion));

  // Calculation + catalogues
  router.post('/dynamic-pricing/calculate', isAuthenticated, asyncHandler(c.calculate));
  router.get('/dynamic-pricing/service-types', isAuthenticated, asyncHandler(c.serviceTypes));
  router.get('/dynamic-pricing/vehicle-classes', isAuthenticated, asyncHandler(c.vehicleClasses));

  return router;
}

export default createDynamicPricingModule();
