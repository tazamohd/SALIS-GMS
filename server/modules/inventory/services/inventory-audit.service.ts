/**
 * Inventory audit-trail service (Phase E5). Requires an effective garage for
 * listing (400 otherwise). Data access flows through the repository.
 */

import { ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { IInventoryAuditRepository } from '../repositories/inventory-audit.repository';

export class InventoryAuditService {
  constructor(private readonly repository: IInventoryAuditRepository) {}

  list(garageId: string | undefined, sparePartId?: string, limit?: number) {
    if (!garageId) throw new ValidationError('garageId is required');
    return this.repository.list(garageId, sparePartId, limit);
  }

  create(data: Parameters<IInventoryAuditRepository['create']>[0]) {
    return this.repository.create(data);
  }
}
