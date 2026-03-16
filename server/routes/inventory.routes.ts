import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Inventory Management Routes
 * - GET /api/spare-parts - List spare parts
 * - POST /api/spare-parts - Create spare part
 * - GET /api/spare-parts/:id - Get spare part details
 * - PATCH /api/spare-parts/:id - Update spare part
 * - DELETE /api/spare-parts/:id - Delete spare part
 * - GET /api/spare-part-inventories - List inventory
 * - POST /api/spare-part-inventories - Create inventory record
 * - PATCH /api/spare-part-inventories/:id - Update inventory
 * - GET /api/stock-alerts - Get stock alerts
 * - POST /api/auto-reorder - Setup auto-reorder
 * - GET /api/inventory-audit-trail - Get audit trail
 * - GET /api/inventory-transfers - Get transfers
 * - POST /api/inventory-transfers - Create transfer
 * - GET /api/inventory-forecasts - Get forecasts
 */

// Get all spare parts
router.get("/spare-parts", isAuthenticated, async (req, res) => {
  try {
    const { garageId, search } = req.query;
    const parts = await storage.getSpareParts(
      garageId as string,
      search as string
    );
    res.json(parts);
  } catch (error) {
    console.error("Error fetching spare parts:", error);
    res.status(500).json({ message: "Failed to fetch spare parts" });
  }
});

// Create spare part
router.post("/spare-parts", isAuthenticated, async (req: any, res) => {
  try {
    const { partNumber, name, description, category, cost, retail } = req.body;

    if (!partNumber || !name) {
      return res
        .status(400)
        .json({ message: "Part number and name are required" });
    }

    const part = await storage.createSparePart({
      partNumber,
      name,
      description: description || null,
      category: category || null,
      cost: cost || 0,
      retail: retail || 0,
    });

    res.status(201).json(part);
  } catch (error) {
    console.error("Error creating spare part:", error);
    res.status(500).json({ message: "Failed to create spare part" });
  }
});

// Get spare part by ID
router.get("/spare-parts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const part = await storage.getSparePart(id);
    if (!part) {
      return res.status(404).json({ message: "Spare part not found" });
    }
    res.json(part);
  } catch (error) {
    console.error("Error fetching spare part:", error);
    res.status(500).json({ message: "Failed to fetch spare part" });
  }
});

// Update spare part
router.patch("/spare-parts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, cost, retail } = req.body;

    const part = await storage.updateSparePart(id, {
      name: name || undefined,
      description: description || undefined,
      category: category || undefined,
      cost: cost || undefined,
      retail: retail || undefined,
    });

    res.json(part);
  } catch (error) {
    console.error("Error updating spare part:", error);
    res.status(500).json({ message: "Failed to update spare part" });
  }
});

// Delete spare part
router.delete("/spare-parts/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteSparePart(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting spare part:", error);
    res.status(500).json({ message: "Failed to delete spare part" });
  }
});

// Get inventory
router.get(
  "/spare-part-inventories",
  isAuthenticated,
  async (req, res) => {
    try {
      const { garageId } = req.query;
      const inventory = await storage.getInventory(garageId as string);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  }
);

// Create inventory record
router.post(
  "/spare-part-inventories",
  isAuthenticated,
  async (req, res) => {
    try {
      const { sparePartId, garageId, quantity, minThreshold, location } =
        req.body;

      if (!sparePartId || !garageId) {
        return res
          .status(400)
          .json({ message: "Spare part and garage are required" });
      }

      const record = await storage.createInventoryRecord({
        sparePartId,
        garageId,
        stockQuantity: quantity || 0,
        minThreshold: minThreshold || 5,
        location: location || null,
      });

      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating inventory record:", error);
      res.status(500).json({ message: "Failed to create inventory record" });
    }
  }
);

// Update inventory
router.patch(
  "/spare-part-inventories/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, minThreshold, location } = req.body;

      const record = await storage.updateInventoryRecord(id, {
        stockQuantity: quantity || undefined,
        minThreshold: minThreshold || undefined,
        location: location || undefined,
      });

      res.json(record);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  }
);

// TODO: Implement remaining inventory endpoints
// - GET /api/stock-alerts
// - POST /api/auto-reorder
// - GET /api/inventory-audit-trail
// - GET /api/inventory-transfers
// - POST /api/inventory-transfers
// - GET /api/inventory-forecasts

export const inventoryRoutes = router;
