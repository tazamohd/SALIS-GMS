import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertPurchaseOrderSchema, insertPurchaseOrderItemSchema } from "../../shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

router.get("/purchase-orders", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const { garage_id, status } = req.query;
    const orders = await storage.getPurchaseOrders(garage_id as string, status as string);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
});

router.get("/purchase-orders/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const order = await storage.getPurchaseOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Purchase order not found" });
    res.json(order);
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({ message: "Failed to fetch purchase order" });
  }
});

router.post("/purchase-orders", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "default-user";
    const result = insertPurchaseOrderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", ...sanitizeZodError(result.error) });
    }
    const order = await storage.createPurchaseOrder({ ...result.data, createdBy: userId } as any);
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ message: "Failed to create purchase order" });
  }
});

router.post("/purchase-orders/with-items", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "default-user";
    const { purchaseOrder, items } = req.body;

    if (!purchaseOrder || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid request: purchaseOrder and items (array) required" });
    }

    const poResult = insertPurchaseOrderSchema.safeParse(purchaseOrder);
    if (!poResult.success) return res.status(400).json(sanitizeZodError(poResult.error));

    const itemResults = items.map((item: any) =>
      insertPurchaseOrderItemSchema.omit({ purchaseOrderId: true }).safeParse(item),
    );
    const invalid = itemResults.filter((v: any) => !v.success);
    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: invalid.flatMap((v: any) =>
          v.error.errors.map((err: any) => ({ field: err.path.join("."), message: err.message })),
        ),
      });
    }

    const validItems = itemResults.map((v: any) => (v.success ? v.data : null)).filter(Boolean);
    const order = await storage.createPurchaseOrderWithItems(
      { ...poResult.data, createdBy: userId } as any,
      validItems as any,
    );
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating purchase order with items:", error);
    res.status(500).json({ message: "Failed to create purchase order with items" });
  }
});

router.patch("/purchase-orders/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const result = insertPurchaseOrderSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", ...sanitizeZodError(result.error) });
    }
    const order = await storage.updatePurchaseOrder(req.params.id, result.data);
    res.json(order);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(500).json({ message: "Failed to update purchase order" });
  }
});

router.delete("/purchase-orders/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    await storage.deletePurchaseOrder(req.params.id);
    res.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ message: "Failed to delete purchase order" });
  }
});

router.get("/purchase-orders/:id/items", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const items = await storage.getPurchaseOrderItems(req.params.id);
    res.json(items);
  } catch (error) {
    console.error("Error fetching purchase order items:", error);
    res.status(500).json({ message: "Failed to fetch purchase order items" });
  }
});

router.post("/purchase-order-items", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    const result = insertPurchaseOrderItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", ...sanitizeZodError(result.error) });
    }
    const item = await storage.createPurchaseOrderItem(result.data);
    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating purchase order item:", error);
    res.status(500).json({ message: "Failed to create purchase order item" });
  }
});

router.delete("/purchase-order-items/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  try {
    await storage.deletePurchaseOrderItem(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

export const purchaseOrderRoutes = router;
