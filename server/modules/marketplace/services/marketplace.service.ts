/**
 * Marketplace service (Phase E5 — Domain Services).
 *
 * Owns the public provider-discovery reads: filtered provider listing, single
 * provider (404 when absent), cross-entity search, and the capped review feed.
 * The review page size (50) is a domain constant lifted from the legacy handler.
 * All data access flows through the injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type {
  IMarketplaceRepository,
  MarketplaceProviderFilters,
} from '../repositories/marketplace.repository';

/** Legacy provider-review feed cap. */
const REVIEW_LIMIT = 50;

export class MarketplaceService {
  constructor(private readonly repository: IMarketplaceRepository) {}

  listProviders(filters: MarketplaceProviderFilters) {
    return this.repository.listProviders(filters);
  }

  async getProvider(id: string) {
    const provider = await this.repository.getProvider(id);
    if (!provider) throw new NotFoundError('Provider not found', { context: { id } });
    return provider;
  }

  search(query: string) {
    return this.repository.search(query);
  }

  listReviews(providerId: string) {
    return this.repository.listReviews(providerId, REVIEW_LIMIT);
  }
}
