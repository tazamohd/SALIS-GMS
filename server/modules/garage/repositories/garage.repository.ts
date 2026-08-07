/**
 * Garage repository (Phase E4 — Repository Pattern).
 *
 * The only place in the garage module that touches the data layer; delegates to
 * the legacy `storage` facade (strangler-fig seam).
 */

import { storage } from '../../../storage';
import type { Garage } from '../domain/garage.types';

export interface IGarageRepository {
  listPaginated(limit: number, offset: number): ReturnType<typeof storage.getGaragesPaginated>;
  count(): Promise<number>;
  getById(id: string): Promise<Garage | undefined>;
  getBranches(garageId: string): ReturnType<typeof storage.getBranchesByGarageId>;
  getRoles(): ReturnType<typeof storage.getRoles>;
  getUserRoles(userId: string): ReturnType<typeof storage.getUserRoles>;
}

export class GarageRepository implements IGarageRepository {
  listPaginated(limit: number, offset: number) {
    return storage.getGaragesPaginated(limit, offset);
  }

  count(): Promise<number> {
    return storage.countGarages();
  }

  getById(id: string): Promise<Garage | undefined> {
    return storage.getGarageById(id);
  }

  getBranches(garageId: string) {
    return storage.getBranchesByGarageId(garageId);
  }

  getRoles() {
    return storage.getRoles();
  }

  getUserRoles(userId: string) {
    return storage.getUserRoles(userId);
  }
}
