/**
 * Delivery service (Phase E5). Owns delivery reads scoped to the caller's
 * garage; child collections (items, timeline, live status) verify the parent
 * delivery first (404 across tenants).
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IDeliveryRepository } from '../repositories/delivery.repository';

export class DeliveryService {
  constructor(private readonly repository: IDeliveryRepository) {}

  list(garageId: string | undefined, status: string | undefined) {
    return this.repository.list(garageId, status);
  }

  private async assertParent(id: string, garageId: string | undefined) {
    const delivery = await this.repository.getById(id, garageId);
    if (!delivery) throw new NotFoundError('Delivery not found', { context: { id } });
    return delivery;
  }

  getById(id: string, garageId: string | undefined) {
    return this.assertParent(id, garageId);
  }

  async items(id: string, garageId: string | undefined) {
    await this.assertParent(id, garageId);
    return this.repository.items(id);
  }

  async timeline(id: string, garageId: string | undefined) {
    await this.assertParent(id, garageId);
    return this.repository.timeline(id);
  }

  async live(id: string, garageId: string | undefined) {
    await this.assertParent(id, garageId);
    const status = await this.repository.liveStatus(id);
    if (!status) throw new NotFoundError('Live status not found', { context: { id } });
    return status;
  }
}
