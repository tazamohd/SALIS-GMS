/**
 * Dynamic Pricing Suggestions — backs /api/dynamic-pricing/*.
 * Market data, vehicle factors, pricing suggestions, price calculation,
 * and reference lists (service types, vehicle classes).
 */
import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// ---------------------------------------------------------------------------
// Market Pricing Data
// ---------------------------------------------------------------------------

// GET /api/dynamic-pricing/market-data
router.get("/dynamic-pricing/market-data", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { region, serviceType, vehicleClass } = req.query;
    const garageId = user?.garageId;
    const data = await storage.getMarketPricingData(garageId, {
      region: region as string,
      serviceType: serviceType as string,
      vehicleClass: vehicleClass as string,
    });
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching market pricing data:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/dynamic-pricing/market-data
router.post(
  "/dynamic-pricing/market-data",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const data = await storage.createMarketPricingData(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating market pricing data:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// PATCH /api/dynamic-pricing/market-data/:id
router.patch(
  "/dynamic-pricing/market-data/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const data = await storage.updateMarketPricingData(req.params.id, req.body);
      res.json(data);
    } catch (error: any) {
      console.error("Error updating market pricing data:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// DELETE /api/dynamic-pricing/market-data/:id
router.delete(
  "/dynamic-pricing/market-data/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      await storage.deleteMarketPricingData(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting market pricing data:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// ---------------------------------------------------------------------------
// Vehicle Pricing Factors
// ---------------------------------------------------------------------------

// GET /api/dynamic-pricing/vehicle-factors
router.get("/dynamic-pricing/vehicle-factors", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { vehicleMake } = req.query;
    const garageId = user?.garageId;
    const data = await storage.getVehiclePricingFactors(garageId, vehicleMake as string);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching vehicle pricing factors:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/dynamic-pricing/vehicle-factors
router.post(
  "/dynamic-pricing/vehicle-factors",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const data = await storage.createVehiclePricingFactor(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating vehicle pricing factor:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// PATCH /api/dynamic-pricing/vehicle-factors/:id
router.patch(
  "/dynamic-pricing/vehicle-factors/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const data = await storage.updateVehiclePricingFactor(req.params.id, req.body);
      res.json(data);
    } catch (error: any) {
      console.error("Error updating vehicle pricing factor:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// DELETE /api/dynamic-pricing/vehicle-factors/:id
router.delete(
  "/dynamic-pricing/vehicle-factors/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      await storage.deleteVehiclePricingFactor(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting vehicle pricing factor:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// ---------------------------------------------------------------------------
// Pricing Suggestions
// ---------------------------------------------------------------------------

// GET /api/dynamic-pricing/suggestions
router.get("/dynamic-pricing/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const garageId = user?.garageId || req.query.garageId;
    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }
    const { vehicleId, status } = req.query;
    const data = await storage.getDynamicPricingSuggestions(garageId as string, {
      vehicleId: vehicleId as string,
      status: status as string,
    });
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching pricing suggestions:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/dynamic-pricing/suggestions/:id
router.get("/dynamic-pricing/suggestions/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const data = await storage.getDynamicPricingSuggestion(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Pricing suggestion not found" });
    }
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching pricing suggestion:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/dynamic-pricing/suggestions
router.post(
  "/dynamic-pricing/suggestions",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const garageId = user?.garageId || req.body.garageId;
      const data = await storage.createDynamicPricingSuggestion({ ...req.body, garageId });
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating pricing suggestion:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// PATCH /api/dynamic-pricing/suggestions/:id (accept/reject)
router.patch(
  "/dynamic-pricing/suggestions/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const updateData: any = { ...req.body };
      if (req.body.status === "accepted") {
        updateData.acceptedBy = user?.id;
        updateData.acceptedAt = new Date();
      }
      const data = await storage.updateDynamicPricingSuggestion(req.params.id, updateData);
      res.json(data);
    } catch (error: any) {
      console.error("Error updating pricing suggestion:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// DELETE /api/dynamic-pricing/suggestions/:id
router.delete(
  "/dynamic-pricing/suggestions/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      await storage.deleteDynamicPricingSuggestion(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting pricing suggestion:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

// ---------------------------------------------------------------------------
// Dynamic Price Calculation
// ---------------------------------------------------------------------------

// POST /api/dynamic-pricing/calculate
router.post("/dynamic-pricing/calculate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { serviceType, vehicleMake, vehicleYear, vehicleClass, region } = req.body;
    if (!serviceType) {
      return res.status(400).json({ message: "Service type is required" });
    }
    const result = await storage.calculateDynamicPrice({
      serviceType,
      vehicleMake,
      vehicleYear,
      vehicleClass,
      region,
    });
    res.json(result);
  } catch (error: any) {
    console.error("Error calculating dynamic price:", error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Reference Lists
// ---------------------------------------------------------------------------

// GET /api/dynamic-pricing/service-types
router.get("/dynamic-pricing/service-types", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const serviceTypes = [
      { value: "oil_change", label: "Oil Change", category: "maintenance" },
      { value: "brake_service", label: "Brake Service", category: "maintenance" },
      { value: "tire_rotation", label: "Tire Rotation", category: "maintenance" },
      { value: "battery_replacement", label: "Battery Replacement", category: "maintenance" },
      { value: "ac_service", label: "A/C Service", category: "maintenance" },
      { value: "engine_repair", label: "Engine Repair", category: "repair" },
      { value: "transmission_repair", label: "Transmission Repair", category: "repair" },
      { value: "suspension_repair", label: "Suspension Repair", category: "repair" },
      { value: "electrical_repair", label: "Electrical Repair", category: "repair" },
      { value: "full_diagnostic", label: "Full Diagnostic", category: "diagnostic" },
      { value: "obd_scan", label: "OBD Scan", category: "diagnostic" },
      { value: "body_work", label: "Body Work", category: "body_work" },
      { value: "paint_job", label: "Paint Job", category: "body_work" },
      { value: "dent_removal", label: "Dent Removal", category: "body_work" },
    ];
    res.json(serviceTypes);
  } catch (error: any) {
    console.error("Error fetching service types:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/dynamic-pricing/vehicle-classes
router.get("/dynamic-pricing/vehicle-classes", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const vehicleClasses = [
      { value: "economy", label: "Economy" },
      { value: "standard", label: "Standard" },
      { value: "luxury", label: "Luxury" },
      { value: "suv", label: "SUV" },
      { value: "truck", label: "Truck" },
    ];
    res.json(vehicleClasses);
  } catch (error: any) {
    console.error("Error fetching vehicle classes:", error);
    res.status(500).json({ message: error.message });
  }
});

export const dynamicPricingRoutes = router;
