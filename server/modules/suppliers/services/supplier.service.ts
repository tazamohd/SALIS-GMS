/**
 * Supplier service (Phase E5 — Domain Services).
 *
 * Owns the supplier module's business rules: tenant-pinned listing (session
 * garage wins over `?garage_id`), cross-garage 404 on supplier detail, and the
 * price-list reads (list / by-id garage-scoped / cross-supplier comparison).
 * All data access flows through the injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { ISupplierRepository } from '../repositories/supplier.repository';
import type {
  Supplier,
  SupplierAuthContext,
  SupplierListParams,
  SupplierListResult,
} from '../domain/supplier.types';

export class SupplierService {
  constructor(private readonly repository: ISupplierRepository) {}

  private effectiveGarageId(auth: SupplierAuthContext, garageIdParam?: string): string | undefined {
    return auth.garageId ?? garageIdParam ?? undefined;
  }

  async list(params: SupplierListParams): Promise<SupplierListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.limit, params.offset),
      this.repository.count(garageId),
    ]);
    return { rows, total };
  }

  async getVisible(id: string, auth: SupplierAuthContext): Promise<Supplier> {
    const supplier = await this.repository.getById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found', { context: { id } });
    }
    const garageId = (supplier as { garageId?: string | null }).garageId;
    if (auth.garageId && garageId && garageId !== auth.garageId) {
      throw new NotFoundError('Supplier not found', { context: { id } });
    }
    return supplier;
  }

  priceLists(supplierId?: string, sparePartId?: string) {
    return this.repository.getPriceLists(supplierId, sparePartId);
  }

  async priceListById(id: string, auth: SupplierAuthContext) {
    const priceList = await this.repository.getPriceListById(id, auth.garageId ?? undefined);
    if (!priceList) {
      throw new NotFoundError('Price list not found', { context: { id } });
    }
    return priceList;
  }

  comparePrices(sparePartId: string) {
    return this.repository.comparePrices(sparePartId);
  }
}
