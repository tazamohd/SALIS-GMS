// @ts-nocheck
/**
 * SALIS AUTO — Inventory Extended Routes
 *
 * Extracted from the monolith (server/routes.ts).
 * Covers: inventory transfers, reorder settings, replenishment orders,
 * tool availability.
 *
 * NOTE: /api/reorder-settings routes were checked against
 * server/routes/inventory-management.ts and server/routes/inventory.routes.ts —
 * those files have /api/inventory/reorder (a different path) so there is no
 * overlap with the /api/reorder-settings endpoints extracted here.
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// ==========================================
// INVENTORY TRANSFERS ROUTES — 6 routes
// ==========================================

router.get('/inventory-transfers', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, status } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const transfers = await storage.getInventoryTransfers(garageId as string, status as string);
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching inventory transfers:", error);
    res.status(500).json({ message: "Failed to fetch inventory transfers" });
  }
});

router.get('/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const transfer = await storage.getInventoryTransfer(id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    console.error("Error fetching inventory transfer:", error);
    res.status(500).json({ message: "Failed to fetch inventory transfer" });
  }
});

router.post('/inventory-transfers', isAuthenticated, async (req: any, res) => {
  try {
    const transfer = await storage.createInventoryTransfer(req.body);
    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error creating inventory transfer:", error);
    res.status(500).json({ message: "Failed to create inventory transfer" });
  }
});

router.patch('/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const transfer = await storage.updateInventoryTransfer(id, req.body);
    res.json(transfer);
  } catch (error) {
    console.error("Error updating inventory transfer:", error);
    res.status(500).json({ message: "Failed to update inventory transfer" });
  }
});

router.post('/inventory-transfers/:id/approve', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';
    const transfer = await storage.approveInventoryTransfer(id, userId);
    res.json(transfer);
  } catch (error) {
    console.error("Error approving inventory transfer:", error);
    res.status(500).json({ message: "Failed to approve inventory transfer" });
  }
});

router.post('/inventory-transfers/:id/complete', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';
    const transfer = await storage.completeInventoryTransfer(id, userId);
    res.json(transfer);
  } catch (error) {
    console.error("Error completing inventory transfer:", error);
    res.status(500).json({ message: "Failed to complete inventory transfer" });
  }
});

// ==========================================
// REORDER SETTINGS ROUTES — 4 routes
// ==========================================

router.get('/reorder-settings', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, sparePartId } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const settings = await storage.getReorderSettings(garageId as string, sparePartId as string);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching reorder settings:", error);
    res.status(500).json({ message: "Failed to fetch reorder settings" });
  }
});

router.post('/reorder-settings', isAuthenticated, async (req: any, res) => {
  try {
    const setting = await storage.createReorderSetting(req.body);
    res.status(201).json(setting);
  } catch (error) {
    console.error("Error creating reorder setting:", error);
    res.status(500).json({ message: "Failed to create reorder setting" });
  }
});

router.patch('/reorder-settings/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const setting = await storage.updateReorderSetting(id, req.body);
    res.json(setting);
  } catch (error) {
    console.error("Error updating reorder setting:", error);
    res.status(500).json({ message: "Failed to update reorder setting" });
  }
});

router.post('/reorder-settings/process', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.body;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const reorders = await storage.processAutoReorders(garageId);
    res.json({ reorders, count: reorders.length });
  } catch (error) {
    console.error("Error processing auto reorders:", error);
    res.status(500).json({ message: "Failed to process auto reorders" });
  }
});

// ==========================================
// REPLENISHMENT ORDERS ROUTES — 5 routes
// ==========================================

router.get('/replenishment-orders', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, status } = req.query;
    const orders = await storage.getReplenishmentOrders(garageId as string, status as string);
    res.json(orders);
  } catch (error: any) {
    console.error("Error fetching replenishment orders:", error);
    res.status(500).json({ message: "Failed to fetch replenishment orders" });
  }
});

router.get('/replenishment-orders/:id', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.getReplenishmentOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error: any) {
    console.error("Error fetching replenishment order:", error);
    res.status(500).json({ message: "Failed to fetch replenishment order" });
  }
});

router.post('/replenishment-orders', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.createReplenishmentOrder(req.body);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Error creating replenishment order:", error);
    res.status(500).json({ message: "Failed to create replenishment order" });
  }
});

router.patch('/replenishment-orders/:id', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.updateReplenishmentOrder(req.params.id, req.body);
    res.json(order);
  } catch (error: any) {
    console.error("Error updating replenishment order:", error);
    res.status(500).json({ message: "Failed to update replenishment order" });
  }
});

router.post('/replenishment-orders/:id/approve', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.approveReplenishmentOrder(req.params.id, req.user?.id || 'system');
    res.json(order);
  } catch (error: any) {
    console.error("Error approving replenishment order:", error);
    res.status(500).json({ message: "Failed to approve replenishment order" });
  }
});

// ==========================================
// TOOL AVAILABILITY ROUTES — 3 routes
// ==========================================

router.get('/tool-availability', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, tool_id } = req.query;
    if (!garage_id) {
      return res.status(400).json({ message: "garage_id is required" });
    }
    const availability = await storage.getToolAvailability(
      garage_id as string,
      tool_id as string
    );
    res.json(availability);
  } catch (error) {
    console.error("Error fetching tool availability:", error);
    res.status(500).json({ message: "Failed to fetch tool availability" });
  }
});

router.post('/tool-availability', isAuthenticated, async (req, res) => {
  try {
    const availability = await storage.createToolAvailability(req.body);
    res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating tool availability:", error);
    res.status(500).json({ message: "Failed to create tool availability" });
  }
});

router.put('/tool-availability/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAvailability = await storage.updateToolAvailability(id, req.body);
    res.json(updatedAvailability);
  } catch (error) {
    console.error("Error updating tool availability:", error);
    res.status(500).json({ message: "Failed to update tool availability" });
  }
});

export default router;
