import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { insertReplenishmentOrderSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId.
const orderBody = insertReplenishmentOrderSchema.omit({ garageId: true });
const manager = requireRole(["ADMIN", "MANAGER"]);

async function loadOwnedOrder(req: any, res: any, id: string) {
  const order = await storage.getReplenishmentOrder(id);
  if (!order || order.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Order not found" });
    return null;
  }
  return order;
}

// GET /api/replenishment-orders — scoped to the caller's garage (not a query param)
router.get("/replenishment-orders", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getReplenishmentOrders(garageId, req.query.status as string | undefined));
  } catch (error) {
    console.error("Error fetching replenishment orders:", error);
    res.status(500).json({ message: "Failed to fetch replenishment orders" });
  }
});

router.get("/replenishment-orders/:id", isAuthenticated, async (req: any, res) => {
  try {
    const order = await loadOwnedOrder(req, res, req.params.id);
    if (!order) return;
    res.json(order);
  } catch (error) {
    console.error("Error fetching replenishment order:", error);
    res.status(500).json({ message: "Failed to fetch replenishment order" });
  }
});

router.post("/replenishment-orders", isAuthenticated, manager, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = orderBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.status(201).json(await storage.createReplenishmentOrder({ ...parsed.data, garageId }));
  } catch (error) {
    console.error("Error creating replenishment order:", error);
    res.status(500).json({ message: "Failed to create replenishment order" });
  }
});

router.patch("/replenishment-orders/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedOrder(req, res, req.params.id))) return;
    const parsed = orderBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateReplenishmentOrder(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating replenishment order:", error);
    res.status(500).json({ message: "Failed to update replenishment order" });
  }
});

router.post("/replenishment-orders/:id/approve", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedOrder(req, res, req.params.id))) return;
    res.json(await storage.approveReplenishmentOrder(req.params.id, req.user?.id || "system"));
  } catch (error) {
    console.error("Error approving replenishment order:", error);
    res.status(500).json({ message: "Failed to approve replenishment order" });
  }
});

export const replenishmentOrdersRoutes = router;
