/**
 * Marketplace repository (Phase E4). The only data-layer access for the public
 * marketplace provider-discovery surface; delegates to the legacy `storage`
 * facade (strangler seam).
 */

import { storage } from '../../../storage';

export interface MarketplaceProviderFilters {
  type?: string;
  q?: string;
  city?: string;
}

export interface IMarketplaceRepository {
  listProviders(filters: MarketplaceProviderFilters): ReturnType<typeof storage.listMarketplaceProviders>;
  getProvider(id: string): ReturnType<typeof storage.getMarketplaceProvider>;
  search(query: string): ReturnType<typeof storage.searchMarketplace>;
  listReviews(providerId: string, limit: number): ReturnType<typeof storage.listProviderReviews>;
}

export class MarketplaceRepository implements IMarketplaceRepository {
  listProviders(filters: MarketplaceProviderFilters) {
    return storage.listMarketplaceProviders(filters);
  }
  getProvider(id: string) {
    return storage.getMarketplaceProvider(id);
  }
  search(query: string) {
    return storage.searchMarketplace(query);
  }
  listReviews(providerId: string, limit: number) {
    return storage.listProviderReviews(providerId, limit);
  }
}
