// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import {
  insertFulfillmentOrderSchema,
  insertShipmentEventSchema,
  insertWarehouseNodeSchema,
} from "@shared/schema";

const router = Router();

// ========================================================================
// Warehouse & Fulfillment Routes
// (extracted from monolith routes.ts — Module 56 Franchise Command Center)
// ========================================================================

// --------------- Fulfillment Orders ---------------

// POST /api/fulfillment-orders
router.post("/fulfillment-orders", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertFulfillmentOrderSchema.parse(req.body);
    const order = await storage.createFulfillmentOrder(validatedData);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Error creating fulfillment order:", error);
    res.status(400).json({ error: error.message || "Failed to create fulfillment order" });
  }
});

// GET /api/fulfillment-orders
router.get("/fulfillment-orders", isAuthenticated, async (req, res) => {
  try {
    const { partnerId, branchId, status } = req.query;
    const orders = await storage.getFulfillmentOrders({
      partnerId: partnerId as string | undefined,
      branchId: branchId as string | undefined,
      status: status as string | undefined
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching fulfillment orders:", error);
    res.status(500).json({ error: "Failed to fetch fulfillment orders" });
  }
});

// GET /api/fulfillment-orders/:id
router.get("/fulfillment-orders/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storage.getFulfillmentOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Fulfillment order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching fulfillment order:", error);
    res.status(500).json({ error: "Failed to fetch fulfillment order" });
  }
});

// PATCH /api/fulfillment-orders/:id
router.patch("/fulfillment-orders/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateFulfillmentOrder(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating fulfillment order:", error);
    res.status(400).json({ error: error.message || "Failed to update fulfillment order" });
  }
});

// DELETE /api/fulfillment-orders/:id
router.delete("/fulfillment-orders/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteFulfillmentOrder(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting fulfillment order:", error);
    res.status(500).json({ error: "Failed to delete fulfillment order" });
  }
});

// --------------- Shipment Events ---------------

// POST /api/shipment-events
router.post("/shipment-events", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertShipmentEventSchema.parse(req.body);
    const event = await storage.createShipmentEvent(validatedData);
    res.status(201).json(event);
  } catch (error: any) {
    console.error("Error creating shipment event:", error);
    res.status(400).json({ error: error.message || "Failed to create shipment event" });
  }
});

// GET /api/fulfillment-orders/:fulfillmentOrderId/shipment-events
router.get("/fulfillment-orders/:fulfillmentOrderId/shipment-events", isAuthenticated, async (req, res) => {
  try {
    const { fulfillmentOrderId } = req.params;
    const events = await storage.getShipmentEvents(fulfillmentOrderId);
    res.json(events);
  } catch (error) {
    console.error("Error fetching shipment events:", error);
    res.status(500).json({ error: "Failed to fetch shipment events" });
  }
});

// --------------- Warehouse Nodes ---------------

// POST /api/warehouse-nodes
router.post("/warehouse-nodes", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertWarehouseNodeSchema.parse(req.body);
    const node = await storage.createWarehouseNode(validatedData);
    res.status(201).json(node);
  } catch (error: any) {
    console.error("Error creating warehouse node:", error);
    res.status(400).json({ error: error.message || "Failed to create warehouse node" });
  }
});

// GET /api/warehouse-nodes
router.get("/warehouse-nodes", isAuthenticated, async (req, res) => {
  try {
    const { partnerId } = req.query;
    const nodes = await storage.getWarehouseNodes(partnerId as string | undefined);
    res.json(nodes);
  } catch (error) {
    console.error("Error fetching warehouse nodes:", error);
    res.status(500).json({ error: "Failed to fetch warehouse nodes" });
  }
});

// GET /api/warehouse-nodes/:id
router.get("/warehouse-nodes/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const node = await storage.getWarehouseNodeById(id);
    if (!node) {
      return res.status(404).json({ error: "Warehouse node not found" });
    }
    res.json(node);
  } catch (error) {
    console.error("Error fetching warehouse node:", error);
    res.status(500).json({ error: "Failed to fetch warehouse node" });
  }
});

// PATCH /api/warehouse-nodes/:id
router.patch("/warehouse-nodes/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateWarehouseNode(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating warehouse node:", error);
    res.status(400).json({ error: error.message || "Failed to update warehouse node" });
  }
});

// DELETE /api/warehouse-nodes/:id
router.delete("/warehouse-nodes/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteWarehouseNode(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting warehouse node:", error);
    res.status(500).json({ error: "Failed to delete warehouse node" });
  }
});

export default router;
