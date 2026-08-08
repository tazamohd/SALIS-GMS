/**
 * Dynamic-pricing repository (Phase E). The only data-layer access for the
 * dynamic-pricing domain: the `storage` market-data / vehicle-factor /
 * suggestion CRUD plus the price-calculation engine. Delegation only.
 */

import { storage } from '../../../storage';

export class DynamicPricingRepository {
  // Market pricing data
  getMarketPricingData(
    garageId: string | undefined,
    filters: { region?: string; serviceType?: string; vehicleClass?: string },
  ) {
    return storage.getMarketPricingData(garageId, filters);
  }
  createMarketPricingData(data: Parameters<typeof storage.createMarketPricingData>[0]) {
    return storage.createMarketPricingData(data);
  }
  updateMarketPricingData(id: string, data: Parameters<typeof storage.updateMarketPricingData>[1]) {
    return storage.updateMarketPricingData(id, data);
  }
  deleteMarketPricingData(id: string) {
    return storage.deleteMarketPricingData(id);
  }

  // Vehicle pricing factors
  getVehiclePricingFactors(garageId: string | undefined, vehicleMake?: string) {
    return storage.getVehiclePricingFactors(garageId, vehicleMake);
  }
  createVehiclePricingFactor(data: Parameters<typeof storage.createVehiclePricingFactor>[0]) {
    return storage.createVehiclePricingFactor(data);
  }
  updateVehiclePricingFactor(id: string, data: Parameters<typeof storage.updateVehiclePricingFactor>[1]) {
    return storage.updateVehiclePricingFactor(id, data);
  }
  deleteVehiclePricingFactor(id: string) {
    return storage.deleteVehiclePricingFactor(id);
  }

  // Pricing suggestions
  getDynamicPricingSuggestions(garageId: string, filters: { vehicleId?: string; status?: string }) {
    return storage.getDynamicPricingSuggestions(garageId, filters);
  }
  getDynamicPricingSuggestion(id: string) {
    return storage.getDynamicPricingSuggestion(id);
  }
  createDynamicPricingSuggestion(data: Parameters<typeof storage.createDynamicPricingSuggestion>[0]) {
    return storage.createDynamicPricingSuggestion(data);
  }
  updateDynamicPricingSuggestion(id: string, data: Parameters<typeof storage.updateDynamicPricingSuggestion>[1]) {
    return storage.updateDynamicPricingSuggestion(id, data);
  }
  deleteDynamicPricingSuggestion(id: string) {
    return storage.deleteDynamicPricingSuggestion(id);
  }

  // Price calculation
  calculateDynamicPrice(params: Parameters<typeof storage.calculateDynamicPrice>[0]) {
    return storage.calculateDynamicPrice(params);
  }
}
