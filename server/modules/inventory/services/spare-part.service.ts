/**
 * Spare part service (Phase E5 — Domain Services).
 *
 * Owns the inventory-items business rules: the list is tenant-pinned (session
 * garage wins; `?garageId` only for garage-less platform users); the
 * inventories read requires an effective garage (400 otherwise). Note the
 * by-id read intentionally does NOT apply a cross-garage 404 — matching the
 * legacy handler, which returned any spare part by id. All data access flows
 * through the injected repository.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { ISparePartRepository } from '../repositories/spare-part.repository';
import type {
  SparePart,
  InventoryAuthContext,
  SparePartListParams,
  SparePartListResult,
} from '../domain/spare-part.types';

export class SparePartService {
  constructor(private readonly repository: ISparePartRepository) {}

  private effectiveGarageId(auth: InventoryAuthContext, garageIdParam?: string): string | undefined {
    return auth.garageId ?? garageIdParam ?? undefined;
  }

  async list(params: SparePartListParams): Promise<SparePartListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.limit, params.offset),
      this.repository.count(garageId),
    ]);
    return { rows, total };
  }

  async getById(id: string): Promise<SparePart> {
    const part = await this.repository.getById(id);
    if (!part) {
      throw new NotFoundError('Spare part not found', { context: { id } });
    }
    return part;
  }

  inventories(auth: InventoryAuthContext, garageIdParam?: string, sparePartId?: string) {
    const garageId = this.effectiveGarageId(auth, garageIdParam);
    if (!garageId) {
      throw new ValidationError('garage_id is required');
    }
    return this.repository.getInventories(garageId, sparePartId);
  }
}
