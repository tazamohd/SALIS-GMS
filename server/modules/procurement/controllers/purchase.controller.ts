/**
 * Purchase controller (Phase E2). Thin HTTP adapter; preserves the opt-in
 * `sendPaginated` envelope for lists and raw responses for detail/child reads.
 */

import type { Request, Response } from 'express';
import { parsePagination, sendPaginated } from '../../../routes/pagination';
import {
  sanitizeZodError,
  sanitizeArrayValidationErrors,
} from '../../../utils/validation-errors';
import {
  purchaseOrderInsertSchema,
  purchaseOrderUpdateSchema,
  purchaseOrderItemInsertSchema,
  purchaseOrderItemWithoutParentSchema,
} from '../validators/purchase.validators';
import type { PurchaseService } from '../services/purchase.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function userOf(req: Request): string {
  return (req.user as { id?: string } | undefined)?.id || 'default-user';
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makePurchaseController(service: PurchaseService) {
  return {
    async listOrders(req: Request, res: Response): Promise<void> {
      const pg = parsePagination(req);
      const { rows, total } = await service.listOrders(garageOf(req), str(req.query.status), pg);
      sendPaginated(res, rows, total, pg, pg.explicit);
    },
    async getOrder(req: Request, res: Response): Promise<void> {
      res.json(await service.getOrder(req.params.id, garageOf(req)));
    },
    async orderItems(req: Request, res: Response): Promise<void> {
      res.json(await service.orderItems(req.params.id, garageOf(req)));
    },
    async listTasks(req: Request, res: Response): Promise<void> {
      const pg = parsePagination(req);
      const { rows, total } = await service.listTasks(
        garageOf(req),
        str(req.query.status),
        str(req.query.priority),
        pg,
      );
      sendPaginated(res, rows, total, pg, pg.explicit);
    },
    async getTask(req: Request, res: Response): Promise<void> {
      res.json(await service.getTask(req.params.id, garageOf(req)));
    },
    async taskParts(req: Request, res: Response): Promise<void> {
      res.json(await service.taskParts(req.params.id, garageOf(req)));
    },

    // --- Writes ---

    async createOrder(req: Request, res: Response): Promise<void> {
      const validation = purchaseOrderInsertSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const order = await service.createOrder({
        ...validation.data,
        createdBy: userOf(req),
      } as never);
      res.status(201).json(order);
    },

    async createOrderWithItems(req: Request, res: Response): Promise<void> {
      const { purchaseOrder, items } = req.body ?? {};
      if (!purchaseOrder || !items || !Array.isArray(items)) {
        res
          .status(400)
          .json({ message: 'Invalid request: purchaseOrder and items (array) required' });
        return;
      }

      const poValidation = purchaseOrderInsertSchema.safeParse(purchaseOrder);
      if (!poValidation.success) {
        res.status(400).json(sanitizeZodError(poValidation.error));
        return;
      }

      const itemsValidation = items.map((item: unknown) =>
        purchaseOrderItemWithoutParentSchema.safeParse(item),
      );
      const invalidItems = itemsValidation.filter((v) => !v.success);
      if (invalidItems.length > 0) {
        res.status(400).json(
          sanitizeArrayValidationErrors(
            invalidItems as Array<{ success: false; error: import('zod').ZodError }>,
          ),
        );
        return;
      }

      const orderData = { ...poValidation.data, createdBy: userOf(req) };
      const validItems = itemsValidation.map((v) => (v.success ? v.data : null)).filter(Boolean);

      const order = await service.createOrderWithItems(orderData as never, validItems as never);
      res.status(201).json(order);
    },

    async updateOrder(req: Request, res: Response): Promise<void> {
      const validation = purchaseOrderUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const order = await service.updateOrder(
        req.params.id,
        validation.data as never,
        garageOf(req),
      );
      res.json(order);
    },

    async deleteOrder(req: Request, res: Response): Promise<void> {
      await service.deleteOrder(req.params.id, garageOf(req));
      res.json({ message: 'Purchase order deleted successfully' });
    },

    async createOrderItem(req: Request, res: Response): Promise<void> {
      const validation = purchaseOrderItemInsertSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ ...sanitizeZodError(validation.error) });
        return;
      }
      const item = await service.createOrderItem(validation.data as never);
      res.status(201).json(item);
    },

    async deleteOrderItem(req: Request, res: Response): Promise<void> {
      await service.deleteOrderItem(req.params.id);
      res.json({ message: 'Item deleted successfully' });
    },

    async createTask(req: Request, res: Response): Promise<void> {
      const { parts, ...taskData } = req.body ?? {};
      const task = await service.createTask(
        { ...taskData, assignedTo: userOf(req) } as never,
        parts,
      );
      res.status(201).json(task);
    },

    async updateTask(req: Request, res: Response): Promise<void> {
      const task = await service.updateTask(req.params.id, req.body as never, garageOf(req));
      res.json(task);
    },

    async deleteTask(req: Request, res: Response): Promise<void> {
      await service.deleteTask(req.params.id, garageOf(req));
      res.json({ message: 'Task deleted successfully' });
    },
  };
}

export type PurchaseController = ReturnType<typeof makePurchaseController>;
