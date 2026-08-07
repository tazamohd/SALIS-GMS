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

  // --- Writes ---

  createOrder(data: Parameters<IPurchaseRepository['createOrder']>[0]) {
    return this.repository.createOrder(data);
  }

  createOrderWithItems(
    order: Parameters<IPurchaseRepository['createOrderWithItems']>[0],
    items: Parameters<IPurchaseRepository['createOrderWithItems']>[1],
  ) {
    return this.repository.createOrderWithItems(order, items);
  }

  async updateOrder(
    id: string,
    data: Parameters<IPurchaseRepository['updateOrder']>[1],
    garageId: string | undefined,
  ) {
    const order = await this.repository.updateOrder(id, data, garageId);
    if (!order) throw new NotFoundError('Purchase order not found', { context: { id } });
    return order;
  }

  deleteOrder(id: string, garageId: string | undefined) {
    return this.repository.deleteOrder(id, garageId);
  }

  createOrderItem(data: Parameters<IPurchaseRepository['createOrderItem']>[0]) {
    return this.repository.createOrderItem(data);
  }

  deleteOrderItem(id: string) {
    return this.repository.deleteOrderItem(id);
  }

  async createTask(
    taskData: Parameters<IPurchaseRepository['createTask']>[0],
    parts: unknown,
  ) {
    const task = await this.repository.createTask(taskData);
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        await this.repository.createTaskPart({ ...part, taskId: task.id });
      }
    }
    return task;
  }

  async updateTask(
    id: string,
    data: Parameters<IPurchaseRepository['updateTask']>[1],
    garageId: string | undefined,
  ) {
    const task = await this.repository.updateTask(id, data, garageId);
    if (!task) throw new NotFoundError('Purchase task not found', { context: { id } });
    return task;
  }

  deleteTask(id: string, garageId: string | undefined) {
    return this.repository.deleteTask(id, garageId);
  }
}
