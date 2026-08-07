/**
 * Pricing-history repository (Phase E4). The only data-layer access for pricing
 * history; delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';

export interface IPricingHistoryRepository {
  getBySparePart(sparePartId: string): ReturnType<typeof storage.getPricingHistory>;
  create(data: Parameters<typeof storage.createPricingHistory>[0]): ReturnType<typeof storage.createPricingHistory>;
}

export class PricingHistoryRepository implements IPricingHistoryRepository {
  getBySparePart(sparePartId: string) {
    return storage.getPricingHistory(sparePartId);
  }
  create(data: Parameters<typeof storage.createPricingHistory>[0]) {
    return storage.createPricingHistory(data);
  }
}
