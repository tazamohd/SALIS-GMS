/**
 * Spare part repository (Phase E4 — Repository Pattern).
 *
 * The only place in the inventory module that touches the data layer; delegates
 * to the legacy `storage` facade (strangler-fig seam).
 */

import { storage } from '../../../storage';
import type { SparePart } from '../domain/spare-part.types';

export interface ISparePartRepository {
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SparePart[]>;
  count(garageId: string | undefined): Promise<number>;
  getById(id: string): Promise<SparePart | undefined>;
  getInventories(
    garageId: string,
    sparePartId?: string,
  ): ReturnType<typeof storage.getSparePartInventories>;
}

export class SparePartRepository implements ISparePartRepository {
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SparePart[]> {
    return storage.getSparePartsPaginated(garageId, limit, offset);
  }

  count(garageId: string | undefined): Promise<number> {
    return storage.countSpareParts(garageId);
  }

  getById(id: string): Promise<SparePart | undefined> {
    return storage.getSparePart(id);
  }

  getInventories(garageId: string, sparePartId?: string) {
    return storage.getSparePartInventories(garageId, sparePartId);
  }
}
