/**
 * Inventory transfer repository (Phase E4). The only data-layer access for the
 * transfers sub-domain; delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';
import type { InventoryTransfer } from '@shared/schema';

export interface IInventoryTransferRepository {
  list(garageId: string, status?: string): ReturnType<typeof storage.getInventoryTransfers>;
  getById(id: string): Promise<InventoryTransfer | undefined>;
  create(
    data: Parameters<typeof storage.createInventoryTransfer>[0],
  ): ReturnType<typeof storage.createInventoryTransfer>;
  update(
    id: string,
    data: Parameters<typeof storage.updateInventoryTransfer>[1],
  ): ReturnType<typeof storage.updateInventoryTransfer>;
  approve(id: string, userId: string): ReturnType<typeof storage.approveInventoryTransfer>;
  complete(id: string, userId: string): ReturnType<typeof storage.completeInventoryTransfer>;
}

export class InventoryTransferRepository implements IInventoryTransferRepository {
  list(garageId: string, status?: string) {
    return storage.getInventoryTransfers(garageId, status);
  }

  getById(id: string): Promise<InventoryTransfer | undefined> {
    return storage.getInventoryTransfer(id) as Promise<InventoryTransfer | undefined>;
  }

  create(data: Parameters<typeof storage.createInventoryTransfer>[0]) {
    return storage.createInventoryTransfer(data);
  }

  update(id: string, data: Parameters<typeof storage.updateInventoryTransfer>[1]) {
    return storage.updateInventoryTransfer(id, data);
  }

  approve(id: string, userId: string) {
    return storage.approveInventoryTransfer(id, userId);
  }

  complete(id: string, userId: string) {
    return storage.completeInventoryTransfer(id, userId);
  }
}
