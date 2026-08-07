/**
 * Inventory transfer service (Phase E5). Requires an effective garage for
 * listing (400 otherwise) and 404s a missing transfer on detail read. Dual-garage
 * tenant ownership (from/to) is enforced at the route via
 * `requireResourceOwnership`. Data access flows through the repository.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { IInventoryTransferRepository } from '../repositories/inventory-transfer.repository';

export class InventoryTransferService {
  constructor(private readonly repository: IInventoryTransferRepository) {}

  list(garageId: string | undefined, status?: string) {
    if (!garageId) throw new ValidationError('garageId is required');
    return this.repository.list(garageId, status);
  }

  async getById(id: string) {
    const transfer = await this.repository.getById(id);
    if (!transfer) throw new NotFoundError('Transfer not found', { context: { id } });
    return transfer;
  }

  create(data: Parameters<IInventoryTransferRepository['create']>[0]) {
    return this.repository.create(data);
  }

  update(id: string, data: Parameters<IInventoryTransferRepository['update']>[1]) {
    return this.repository.update(id, data);
  }

  approve(id: string, userId: string) {
    return this.repository.approve(id, userId);
  }

  complete(id: string, userId: string) {
    return this.repository.complete(id, userId);
  }
}
