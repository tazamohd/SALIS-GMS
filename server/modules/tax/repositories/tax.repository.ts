/**
 * Tax repository (Phase E). The only data-layer access for the tax-regions
 * domain: the `storage` tax-region CRUD + the optional country-code filtered
 * list. Tax regions are global reference data (no garage scoping). Delegation
 * only.
 */

import { storage } from '../../../storage';

export class TaxRepository {
  createTaxRegion(data: Parameters<typeof storage.createTaxRegion>[0]) {
    return storage.createTaxRegion(data);
  }
  getTaxRegions(countryCode?: string) {
    return storage.getTaxRegions(countryCode);
  }
  getTaxRegionById(id: string) {
    return storage.getTaxRegionById(id);
  }
  updateTaxRegion(id: string, data: Parameters<typeof storage.updateTaxRegion>[1]) {
    return storage.updateTaxRegion(id, data);
  }
  deleteTaxRegion(id: string) {
    return storage.deleteTaxRegion(id);
  }
}
