/**
 * Marketplace write-path repository (Phase E). The only data-layer / external-
 * service access for the AUTHENTICATED parts-marketplace surface: the eBay/Amazon
 * parts search, order placement and tracking (the `phase3Service` integration
 * seam), plus the customer review-submission reads/writes (the `storage`
 * facade). Delegation only — no business rules here.
 */

import { storage } from '../../../storage';
import * as phase3Service from '../../../phase3-integrations-service';

/** The external marketplaces the parts search/order flow supports. */
export type MarketplaceKind = 'ebay' | 'amazon';

/** The order payload `phase3Service.placeMarketplaceOrder` accepts. */
export type PlaceOrderInput = Parameters<typeof phase3Service.placeMarketplaceOrder>[0];

export interface IMarketplaceWritesRepository {
  searchParts(
    partNumber: string,
    marketplace: MarketplaceKind,
  ): ReturnType<typeof phase3Service.searchMarketplaceParts>;
  placeOrder(data: PlaceOrderInput): ReturnType<typeof phase3Service.placeMarketplaceOrder>;
  trackOrder(orderId: string): ReturnType<typeof phase3Service.trackMarketplaceOrder>;
  getProvider(id: string): ReturnType<typeof storage.getMarketplaceProvider>;
  hasTransactedWith(
    customerId: string,
    providerId: string,
  ): ReturnType<typeof storage.hasTransactedWith>;
  upsertReview(
    providerId: string,
    customerId: string,
    rating: number,
    comment?: string,
  ): ReturnType<typeof storage.upsertProviderReview>;
}

export class MarketplaceWritesRepository implements IMarketplaceWritesRepository {
  searchParts(partNumber: string, marketplace: MarketplaceKind) {
    return phase3Service.searchMarketplaceParts(partNumber, marketplace);
  }
  placeOrder(data: PlaceOrderInput) {
    return phase3Service.placeMarketplaceOrder(data);
  }
  trackOrder(orderId: string) {
    return phase3Service.trackMarketplaceOrder(orderId);
  }
  getProvider(id: string) {
    return storage.getMarketplaceProvider(id);
  }
  hasTransactedWith(customerId: string, providerId: string) {
    return storage.hasTransactedWith(customerId, providerId);
  }
  upsertReview(providerId: string, customerId: string, rating: number, comment?: string) {
    return storage.upsertProviderReview(providerId, customerId, rating, comment);
  }
}
