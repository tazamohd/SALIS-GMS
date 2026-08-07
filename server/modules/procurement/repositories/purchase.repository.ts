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
  createOrder(data: Parameters<typeof storage.createPurchaseOrder>[0]): ReturnType<typeof storage.createPurchaseOrder>;
  createOrderWithItems(
    order: Parameters<typeof storage.createPurchaseOrderWithItems>[0],
    items: Parameters<typeof storage.createPurchaseOrderWithItems>[1],
  ): ReturnType<typeof storage.createPurchaseOrderWithItems>;
  updateOrder(
    id: string,
    data: Parameters<typeof storage.updatePurchaseOrder>[1],
    garageId: string | undefined,
  ): ReturnType<typeof storage.updatePurchaseOrder>;
  deleteOrder(id: string, garageId: string | undefined): ReturnType<typeof storage.deletePurchaseOrder>;
  createOrderItem(data: Parameters<typeof storage.createPurchaseOrderItem>[0]): ReturnType<typeof storage.createPurchaseOrderItem>;
  deleteOrderItem(id: string): ReturnType<typeof storage.deletePurchaseOrderItem>;
  createTask(data: Parameters<typeof storage.createPurchaseTask>[0]): ReturnType<typeof storage.createPurchaseTask>;
  createTaskPart(data: Parameters<typeof storage.createPurchaseTaskPart>[0]): ReturnType<typeof storage.createPurchaseTaskPart>;
  updateTask(
    id: string,
    data: Parameters<typeof storage.updatePurchaseTask>[1],
    garageId: string | undefined,
  ): ReturnType<typeof storage.updatePurchaseTask>;
  deleteTask(id: string, garageId: string | undefined): ReturnType<typeof storage.deletePurchaseTask>;
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
  createOrder(data: Parameters<typeof storage.createPurchaseOrder>[0]) {
    return storage.createPurchaseOrder(data);
  }
  createOrderWithItems(
    order: Parameters<typeof storage.createPurchaseOrderWithItems>[0],
    items: Parameters<typeof storage.createPurchaseOrderWithItems>[1],
  ) {
    return storage.createPurchaseOrderWithItems(order, items);
  }
  updateOrder(id: string, data: Parameters<typeof storage.updatePurchaseOrder>[1], garageId: string | undefined) {
    return storage.updatePurchaseOrder(id, data, garageId as string);
  }
  deleteOrder(id: string, garageId: string | undefined) {
    return storage.deletePurchaseOrder(id, garageId as string);
  }
  createOrderItem(data: Parameters<typeof storage.createPurchaseOrderItem>[0]) {
    return storage.createPurchaseOrderItem(data);
  }
  deleteOrderItem(id: string) {
    return storage.deletePurchaseOrderItem(id);
  }
  createTask(data: Parameters<typeof storage.createPurchaseTask>[0]) {
    return storage.createPurchaseTask(data);
  }
  createTaskPart(data: Parameters<typeof storage.createPurchaseTaskPart>[0]) {
    return storage.createPurchaseTaskPart(data);
  }
  updateTask(id: string, data: Parameters<typeof storage.updatePurchaseTask>[1], garageId: string | undefined) {
    return storage.updatePurchaseTask(id, data, garageId as string);
  }
  deleteTask(id: string, garageId: string | undefined) {
    return storage.deletePurchaseTask(id, garageId as string);
  }
}
