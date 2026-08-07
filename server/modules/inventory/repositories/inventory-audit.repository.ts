/**
 * Inventory audit-trail repository (Phase E4). The only data-layer access for
 * the audit-trail sub-domain; delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';

export interface IInventoryAuditRepository {
  list(
    garageId: string,
    sparePartId?: string,
    limit?: number,
  ): ReturnType<typeof storage.getInventoryAuditTrail>;
  create(
    data: Parameters<typeof storage.createAuditTrailEntry>[0],
  ): ReturnType<typeof storage.createAuditTrailEntry>;
}

export class InventoryAuditRepository implements IInventoryAuditRepository {
  list(garageId: string, sparePartId?: string, limit = 100) {
    return storage.getInventoryAuditTrail(garageId, sparePartId, limit);
  }

  create(data: Parameters<typeof storage.createAuditTrailEntry>[0]) {
    return storage.createAuditTrailEntry(data);
  }
}
