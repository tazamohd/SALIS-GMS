/**
 * Supplier repository (Phase E4 — Repository Pattern).
 *
 * The only place in the supplier module that touches the data layer; delegates
 * to the legacy `storage` facade (strangler-fig seam).
 */

import { storage } from '../../../storage';
import type { Supplier } from '../domain/supplier.types';

export interface ISupplierRepository {
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Supplier[]>;
  count(garageId: string | undefined): Promise<number>;
  getById(id: string): Promise<Supplier | undefined>;
  getPriceLists(
    supplierId?: string,
    sparePartId?: string,
  ): ReturnType<typeof storage.getSupplierPriceLists>;
  getPriceListById(id: string, garageId?: string): ReturnType<typeof storage.getSupplierPriceList>;
  comparePrices(sparePartId: string): ReturnType<typeof storage.comparePrices>;
}

export class SupplierRepository implements ISupplierRepository {
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Supplier[]> {
    return storage.getSuppliersPaginated(garageId, limit, offset);
  }

  count(garageId: string | undefined): Promise<number> {
    return storage.countSuppliers(garageId);
  }

  getById(id: string): Promise<Supplier | undefined> {
    return storage.getSupplier(id);
  }

  getPriceLists(supplierId?: string, sparePartId?: string) {
    return storage.getSupplierPriceLists(supplierId, sparePartId);
  }

  getPriceListById(id: string, garageId?: string) {
    return storage.getSupplierPriceList(id, garageId);
  }

  comparePrices(sparePartId: string) {
    return storage.comparePrices(sparePartId);
  }
}
