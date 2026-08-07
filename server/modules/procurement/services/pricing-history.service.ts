/**
 * Pricing-history service (Phase E5). Thin reads/writes for spare-part pricing
 * history; data access flows through the repository.
 */

import type { IPricingHistoryRepository } from '../repositories/pricing-history.repository';

export class PricingHistoryService {
  constructor(private readonly repository: IPricingHistoryRepository) {}

  getBySparePart(sparePartId: string) {
    return this.repository.getBySparePart(sparePartId);
  }

  create(data: Parameters<IPricingHistoryRepository['create']>[0]) {
    return this.repository.create(data);
  }
}
