import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

function sanitizeZodError(error: any) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err: any) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

// Get all spare parts
router.get("/spare-parts", isAuthenticated, async (req, res) => {
  try {
    const parts = await storage.getSpareParts();
    res.json(parts);
  } catch (error) {
    console.error("Error fetching spare parts:", error);
    res.status(500).json({ message: "Failed to fetch spare parts" });
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

// Create spare part
router.post("/spare-parts", isAuthenticated, async (req: any, res) => {
  try {
    const { insertSparePartSchema } = await import("@shared/schema");
    const userId = req.user?.id || "default-user";

    const validationResult = insertSparePartSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const partData = {
      ...validationResult.data,
      createdBy: userId,
    };

    const part = await storage.createSparePart(partData);
    res.status(201).json(part);
  } catch (error) {
    console.error("Error creating spare part:", error);
    res.status(500).json({ message: "Failed to create spare part" });
  }
});

// Update spare part
router.patch("/spare-parts/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertSparePartSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertSparePartSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const updatedPart = await storage.updateSparePart(id, validationResult.data);
    res.json(updatedPart);
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

// Get spare part inventories
router.get("/spare-part-inventories", isAuthenticated, async (req, res) => {
  try {
    const { garage_id, spare_part_id } = req.query;
    if (!garage_id) {
      return res.status(400).json({ message: "garage_id is required" });
    }
    const inventories = await storage.getSparePartInventories(
      garage_id as string,
      spare_part_id as string
    );
    res.json(inventories);
  } catch (error) {
    console.error("Error fetching spare part inventories:", error);
    res.status(500).json({ message: "Failed to fetch spare part inventories" });
  }
});

// Create spare part inventory
router.post("/spare-part-inventories", isAuthenticated, async (req, res) => {
  try {
    const { insertSparePartInventorySchema } = await import("@shared/schema");

    const validationResult = insertSparePartInventorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const inventory = await storage.createSparePartInventory(validationResult.data);
    res.status(201).json(inventory);
  } catch (error) {
    console.error("Error creating spare part inventory:", error);
    res.status(500).json({ message: "Failed to create spare part inventory" });
  }
});

// Update spare part inventory
router.patch("/spare-part-inventories/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertSparePartInventorySchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertSparePartInventorySchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const updatedInventory = await storage.updateSparePartInventory(id, validationResult.data);
    res.json(updatedInventory);
  } catch (error) {
    console.error("Error updating spare part inventory:", error);
    res.status(500).json({ message: "Failed to update spare part inventory" });
  }
});

// Get stock alerts
router.get("/stock-alerts", isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, status } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const alerts = await storage.getStockAlerts(garageId as string, status as string);
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    res.status(500).json({ message: "Failed to fetch stock alerts" });
  }
});

// Create stock alert
router.post("/stock-alerts", isAuthenticated, async (req: any, res) => {
  try {
    const alert = await storage.createStockAlert(req.body);
    res.status(201).json(alert);
  } catch (error) {
    console.error("Error creating stock alert:", error);
    res.status(500).json({ message: "Failed to create stock alert" });
  }
});

// Update stock alert
router.patch("/stock-alerts/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const alert = await storage.updateStockAlert(id, req.body);
    res.json(alert);
  } catch (error) {
    console.error("Error updating stock alert:", error);
    res.status(500).json({ message: "Failed to update stock alert" });
  }
});

// Acknowledge stock alert
router.post("/stock-alerts/:id/acknowledge", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "default-user";
    const alert = await storage.acknowledgeStockAlert(id, userId);
    res.json(alert);
  } catch (error) {
    console.error("Error acknowledging stock alert:", error);
    res.status(500).json({ message: "Failed to acknowledge stock alert" });
  }
});

export const inventoryRoutes = router;
