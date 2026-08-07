/**
 * Purchase repository (Phase E4). The only data-layer access for purchase orders
 * and purchase tasks; delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';

type ListOpts = { limit: number; offset: number } | undefined;

export interface IPurchaseRepository {
  listOrders(garageId: string | undefined, status: string | undefined, opts: ListOpts): ReturnType<typeof storage.getPurchaseOrders>;
  countOrders(garageId: string | undefined, status: string | undefined): Promise<number>;
  getOrder(id: string, garageId: string | undefined): ReturnType<typeof storage.getPurchaseOrder>;
  getOrderItems(id: string): ReturnType<typeof storage.getPurchaseOrderItems>;
  listTasks(
    garageId: string | undefined,
    status: string | undefined,
    priority: string | undefined,
    opts: ListOpts,
  ): ReturnType<typeof storage.getPurchaseTasks>;
  countTasks(garageId: string | undefined, status: string | undefined, priority: string | undefined): Promise<number>;
  getTask(id: string, garageId: string | undefined): ReturnType<typeof storage.getPurchaseTask>;
  getTaskParts(id: string): ReturnType<typeof storage.getPurchaseTaskParts>;
}

export class PurchaseRepository implements IPurchaseRepository {
  listOrders(garageId: string | undefined, status: string | undefined, opts: ListOpts) {
    return storage.getPurchaseOrders(garageId as string, status as string, opts);
  }
  countOrders(garageId: string | undefined, status: string | undefined) {
    return storage.countPurchaseOrders(garageId as string, status as string);
  }
  getOrder(id: string, garageId: string | undefined) {
    return storage.getPurchaseOrder(id, garageId as string);
  }
  getOrderItems(id: string) {
    return storage.getPurchaseOrderItems(id);
  }
  listTasks(garageId: string | undefined, status: string | undefined, priority: string | undefined, opts: ListOpts) {
    return storage.getPurchaseTasks(garageId as string, status as string, priority as string, opts);
  }
  countTasks(garageId: string | undefined, status: string | undefined, priority: string | undefined) {
    return storage.countPurchaseTasks(garageId as string, status as string, priority as string);
  }
  getTask(id: string, garageId: string | undefined) {
    return storage.getPurchaseTask(id, garageId as string);
  }
  getTaskParts(id: string) {
    return storage.getPurchaseTaskParts(id);
  }
}
