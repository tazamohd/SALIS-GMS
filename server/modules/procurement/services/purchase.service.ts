/**
 * Purchase service (Phase E5). Owns purchase-order and purchase-task reads,
 * scoped to the caller's garage. Lists use opt-in pagination (count only when a
 * page is explicitly requested); by-id and child reads 404 across tenants.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IPurchaseRepository } from '../repositories/purchase.repository';

export interface Paging {
  explicit: boolean;
  limit: number;
  offset: number;
}

export class PurchaseService {
  constructor(private readonly repository: IPurchaseRepository) {}

  async listOrders(garageId: string | undefined, status: string | undefined, pg: Paging) {
    const opts = pg.explicit ? { limit: pg.limit, offset: pg.offset } : undefined;
    const [rows, total] = await Promise.all([
      this.repository.listOrders(garageId, status, opts),
      pg.explicit ? this.repository.countOrders(garageId, status) : Promise.resolve(0),
    ]);
    return { rows, total };
  }

  async getOrder(id: string, garageId: string | undefined) {
    const order = await this.repository.getOrder(id, garageId);
    if (!order) throw new NotFoundError('Purchase order not found', { context: { id } });
    return order;
  }

  async orderItems(id: string, garageId: string | undefined) {
    const order = await this.repository.getOrder(id, garageId);
    if (!order) throw new NotFoundError('Purchase order not found', { context: { id } });
    return this.repository.getOrderItems(id);
  }

  async listTasks(
    garageId: string | undefined,
    status: string | undefined,
    priority: string | undefined,
    pg: Paging,
  ) {
    const opts = pg.explicit ? { limit: pg.limit, offset: pg.offset } : undefined;
    const [rows, total] = await Promise.all([
      this.repository.listTasks(garageId, status, priority, opts),
      pg.explicit ? this.repository.countTasks(garageId, status, priority) : Promise.resolve(0),
    ]);
    return { rows, total };
  }

  async getTask(id: string, garageId: string | undefined) {
    const task = await this.repository.getTask(id, garageId);
    if (!task) throw new NotFoundError('Task not found', { context: { id } });
    return task;
  }

  async taskParts(id: string, garageId: string | undefined) {
    const task = await this.repository.getTask(id, garageId);
    if (!task) throw new NotFoundError('Task not found', { context: { id } });
    return this.repository.getTaskParts(id);
  }
}
