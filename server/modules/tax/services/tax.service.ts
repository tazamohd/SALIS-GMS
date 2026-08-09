/**
 * Tax service (Phase E — Domain Services).
 *
 * Owns the tax-regions domain: the tax-region CRUD and the optional
 * country-code filtered list. Tax regions are global reference data, so there
 * is no garage scoping; Zod body validation and the by-id 404 stay at the
 * controller boundary. All data access flows through the repository.
 */

import type { TaxRepository } from '../repositories/tax.repository';

export class TaxService {
  constructor(private readonly repository: TaxRepository) {}

  createRegion(validated: Parameters<TaxRepository['createTaxRegion']>[0]) {
    return this.repository.createTaxRegion(validated);
  }
  listRegions(countryCode?: string) {
    return this.repository.getTaxRegions(countryCode);
  }
  getRegion(id: string) {
    return this.repository.getTaxRegionById(id);
  }
  updateRegion(id: string, data: Parameters<TaxRepository['updateTaxRegion']>[1]) {
    return this.repository.updateTaxRegion(id, data);
  }
  deleteRegion(id: string) {
    return this.repository.deleteTaxRegion(id);
  }
}
