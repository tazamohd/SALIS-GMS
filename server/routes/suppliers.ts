// @ts-nocheck
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import {
  insertSupplierPriceListSchema,
  insertSupplierPerformanceSchema,
} from "../../shared/schema";

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

// ─── Suppliers (Module 11: Purchase Orders & Supplier Integration) ───────────

router.get("/suppliers", isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const suppliers = await storage.getSuppliers(garage_id as string);
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
});

router.get("/suppliers/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await storage.getSupplier(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ message: "Failed to fetch supplier" });
  }
});

router.post("/suppliers", isAuthenticated, async (req, res) => {
  try {
    const { insertSupplierSchema } = await import("@shared/schema");
    const validationResult = insertSupplierSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error),
      });
    }

    const supplier = await storage.createSupplier(validationResult.data);
    res.status(201).json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ message: "Failed to create supplier" });
  }
});

router.patch("/suppliers/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertSupplierSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertSupplierSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error),
      });
    }

    const supplier = await storage.updateSupplier(id, validationResult.data);
    res.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ message: "Failed to update supplier" });
  }
});

router.delete("/suppliers/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteSupplier(id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Failed to delete supplier" });
  }
});

// ─── Supplier Price Lists (Module 43: Vendor/Supplier Portal) ────────────────

router.get("/supplier-price-lists", isAuthenticated, async (req, res) => {
  try {
    const { supplierId, sparePartId } = req.query;
    const priceLists = await storage.getSupplierPriceLists(
      supplierId as string | undefined,
      sparePartId as string | undefined,
    );
    res.json(priceLists);
  } catch (error) {
    console.error("Error fetching supplier price lists:", error);
    res.status(500).json({ message: "Failed to fetch price lists" });
  }
});

router.get("/supplier-price-lists/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const priceList = await storage.getSupplierPriceList(id);
    if (!priceList) {
      return res.status(404).json({ message: "Price list not found" });
    }
    res.json(priceList);
  } catch (error) {
    console.error("Error fetching price list:", error);
    res.status(500).json({ message: "Failed to fetch price list" });
  }
});

router.post("/supplier-price-lists", isAuthenticated, async (req, res) => {
  try {
    const validationResult = insertSupplierPriceListSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error),
      });
    }

    const priceList = await storage.createSupplierPriceList(validationResult.data);
    res.status(201).json(priceList);
  } catch (error) {
    console.error("Error creating price list:", error);
    res.status(500).json({ message: "Failed to create price list" });
  }
});

router.patch("/supplier-price-lists/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const validationResult = insertSupplierPriceListSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error),
      });
    }

    const priceList = await storage.updateSupplierPriceList(id, validationResult.data);
    res.json(priceList);
  } catch (error) {
    console.error("Error updating price list:", error);
    res.status(500).json({ message: "Failed to update price list" });
  }
});

router.delete("/supplier-price-lists/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteSupplierPriceList(id);
    res.json({ message: "Price list deleted successfully" });
  } catch (error) {
    console.error("Error deleting price list:", error);
    res.status(500).json({ message: "Failed to delete price list" });
  }
});

router.get("/supplier-price-lists/compare/:sparePartId", isAuthenticated, async (req, res) => {
  try {
    const { sparePartId } = req.params;
    const comparison = await storage.comparePrices(sparePartId);
    res.json(comparison);
  } catch (error) {
    console.error("Error comparing prices:", error);
    res.status(500).json({ message: "Failed to compare prices" });
  }
});

// ─── Supplier Performance (Module 43: Vendor/Supplier Portal) ────────────────

router.get("/supplier-performance", isAuthenticated, async (req, res) => {
  try {
    const { supplierId, period } = req.query;
    const performanceRecords = await storage.getSupplierPerformance(
      supplierId as string | undefined,
      period as string | undefined,
    );
    res.json(performanceRecords);
  } catch (error) {
    console.error("Error fetching supplier performance:", error);
    res.status(500).json({ message: "Failed to fetch performance records" });
  }
});

router.get("/supplier-performance/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const performanceRecord = await storage.getSupplierPerformanceRecord(id);
    if (!performanceRecord) {
      return res.status(404).json({ message: "Performance record not found" });
    }
    res.json(performanceRecord);
  } catch (error) {
    console.error("Error fetching performance record:", error);
    res.status(500).json({ message: "Failed to fetch performance record" });
  }
});

router.post("/supplier-performance", isAuthenticated, async (req, res) => {
  try {
    const validationResult = insertSupplierPerformanceSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error),
      });
    }

    const performanceRecord = await storage.createSupplierPerformance(validationResult.data);
    res.status(201).json(performanceRecord);
  } catch (error) {
    console.error("Error creating performance record:", error);
    res.status(500).json({ message: "Failed to create performance record" });
  }
});

router.patch("/supplier-performance/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const validationResult = insertSupplierPerformanceSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error),
      });
    }

    const performanceRecord = await storage.updateSupplierPerformance(id, validationResult.data);
    res.json(performanceRecord);
  } catch (error) {
    console.error("Error updating performance record:", error);
    res.status(500).json({ message: "Failed to update performance record" });
  }
});

router.delete("/supplier-performance/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteSupplierPerformance(id);
    res.json({ message: "Performance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting performance record:", error);
    res.status(500).json({ message: "Failed to delete performance record" });
  }
});

// ─── Supplier Parts Availability (Feature #5) ───────────────────────────────

router.get("/supplier-availability/search", isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const { spare_part_id, supplier_id, part_name } = req.query;

    const filters = {
      sparePartId: spare_part_id as string | undefined,
      supplierId: supplier_id as string | undefined,
      partName: part_name as string | undefined,
    };

    const availability = await storage.getSupplierPartsAvailability(userGarageId, filters);
    res.json(availability);
  } catch (error) {
    console.error("Error searching supplier availability:", error);
    res.status(500).json({ message: "Failed to search supplier availability" });
  }
});

router.post("/supplier-availability/sync", isAuthenticated, async (req: any, res) => {
  try {
    const { insertSupplierPartsAvailabilitySchema } = await import("@shared/schema");
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const { availabilityData } = req.body;

    if (!Array.isArray(availabilityData)) {
      return res.status(400).json({ message: "availabilityData must be an array" });
    }

    const validatedData = availabilityData.map(item => {
      const result = insertSupplierPartsAvailabilitySchema.safeParse({
        ...item,
        garageId: userGarageId,
      });

      if (!result.success) {
        throw new Error(`Validation error: ${result.error.message}`);
      }

      return result.data;
    });

    const synced = await storage.syncSupplierAvailability(userGarageId, validatedData);
    res.status(201).json({
      message: `Successfully synced ${synced.length} availability records`,
      data: synced,
    });
  } catch (error) {
    console.error("Error syncing supplier availability:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to sync supplier availability" });
  }
});

router.get("/supplier-availability/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const availability = await storage.getSupplierPartAvailability(id, userGarageId);
    if (!availability) {
      return res.status(404).json({ message: "Availability record not found" });
    }
    res.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

router.post("/supplier-availability", isAuthenticated, async (req: any, res) => {
  try {
    const { insertSupplierPartsAvailabilitySchema } = await import("@shared/schema");
    const userGarageId = req.user?.garageId;

    const validationResult = insertSupplierPartsAvailabilitySchema.safeParse({
      ...req.body,
      garageId: userGarageId,
    });

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const availability = await storage.createSupplierPartAvailability(validationResult.data);
    res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating availability:", error);
    res.status(500).json({ message: "Failed to create availability" });
  }
});

router.patch("/supplier-availability/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { insertSupplierPartsAvailabilitySchema } = await import("@shared/schema");
    const { id } = req.params;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const validationResult = insertSupplierPartsAvailabilitySchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const availability = await storage.updateSupplierPartAvailability(id, userGarageId, validationResult.data);
    if (!availability) {
      return res.status(404).json({ message: "Availability record not found" });
    }
    res.json(availability);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Failed to update availability" });
  }
});

router.delete("/supplier-availability/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const deleted = await storage.deleteSupplierPartAvailability(id, userGarageId);
    if (!deleted) {
      return res.status(404).json({ message: "Availability record not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({ message: "Failed to delete availability" });
  }
});

export default router;
