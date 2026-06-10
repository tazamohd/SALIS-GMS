import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { resolveGarageScope } from "../middleware/garageScope";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// ── Vehicle Catalog Endpoints ──────────────────────────────────────

router.get("/catalogs/vehicle-makes", isAuthenticated, async (req, res) => {
  try {
    const { vehicleMakes } = await import("@shared/vehicleCatalogs");
    res.json(vehicleMakes);
  } catch (error) {
    console.error("Error fetching vehicle makes:", error);
    res.status(500).json({ message: "Failed to fetch vehicle makes" });
  }
});

router.get("/catalogs/vehicle-models", isAuthenticated, async (req, res) => {
  try {
    const { makeId } = req.query;
    const { vehicleModels, getModelsForMake } = await import("@shared/vehicleCatalogs");
    if (makeId) {
      res.json(getModelsForMake(makeId as string));
    } else {
      res.json(vehicleModels);
    }
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    res.status(500).json({ message: "Failed to fetch vehicle models" });
  }
});

router.get("/catalogs/nationalities", isAuthenticated, async (req, res) => {
  try {
    const { nationalities } = await import("@shared/vehicleCatalogs");
    res.json(nationalities);
  } catch (error) {
    console.error("Error fetching nationalities:", error);
    res.status(500).json({ message: "Failed to fetch nationalities" });
  }
});

router.get("/catalogs/years", isAuthenticated, async (req, res) => {
  try {
    const { vehicleYears } = await import("@shared/vehicleCatalogs");
    res.json(vehicleYears);
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ message: "Failed to fetch years" });
  }
});

router.get("/catalogs/colors", isAuthenticated, async (req, res) => {
  try {
    const { colors } = await import("@shared/vehicleCatalogs");
    res.json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ message: "Failed to fetch colors" });
  }
});

router.get("/catalogs/engine-types", isAuthenticated, async (req, res) => {
  try {
    const { engineTypes } = await import("@shared/vehicleCatalogs");
    res.json(engineTypes);
  } catch (error) {
    console.error("Error fetching engine types:", error);
    res.status(500).json({ message: "Failed to fetch engine types" });
  }
});

router.get("/catalogs/transmission-types", isAuthenticated, async (req, res) => {
  try {
    const { transmissionTypes } = await import("@shared/vehicleCatalogs");
    res.json(transmissionTypes);
  } catch (error) {
    console.error("Error fetching transmission types:", error);
    res.status(500).json({ message: "Failed to fetch transmission types" });
  }
});

// ── VIN Decode (NHTSA API) ─────────────────────────────────────────

function mapFuelType(fuelType: string | null): string {
  if (!fuelType) return "";
  const lower = fuelType.toLowerCase();
  if (lower.includes("gasoline") || lower.includes("petrol")) return "gasoline";
  if (lower.includes("diesel")) return "diesel";
  if (lower.includes("electric")) return "electric";
  if (lower.includes("hybrid")) return "hybrid";
  if (lower.includes("natural gas")) return "natural_gas";
  if (lower.includes("hydrogen")) return "hydrogen";
  return "gasoline";
}

function mapTransmission(transmission: string | null): string {
  if (!transmission) return "";
  const lower = transmission.toLowerCase();
  if (lower.includes("automatic")) return "automatic";
  if (lower.includes("manual")) return "manual";
  if (lower.includes("cvt")) return "cvt";
  if (lower.includes("dual") || lower.includes("dct")) return "dct";
  return "automatic";
}

router.get("/vin-decode/:vin", isAuthenticated, async (req, res) => {
  try {
    const { vin } = req.params;

    if (!vin || vin.length !== 17) {
      return res.status(400).json({ message: "Invalid VIN. VIN must be exactly 17 characters." });
    }

    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);

    if (!response.ok) {
      throw new Error("Failed to decode VIN from NHTSA");
    }

    const data = await response.json();
    const results = data.Results || [];

    const getValueByName = (name: string) => {
      const item = results.find((r: any) => r.Variable === name);
      return item?.Value || null;
    };

    const decodedVehicle = {
      vin,
      make: getValueByName("Make") || "",
      model: getValueByName("Model") || "",
      year: parseInt(getValueByName("Model Year") || "0") || null,
      bodyClass: getValueByName("Body Class") || "",
      vehicleType: getValueByName("Vehicle Type") || "",
      engineCylinders: getValueByName("Engine Number of Cylinders") || "",
      engineDisplacement: getValueByName("Displacement (L)") || "",
      engineConfiguration: getValueByName("Engine Configuration") || "",
      fuelType: getValueByName("Fuel Type - Primary") || "",
      transmissionStyle: getValueByName("Transmission Style") || "",
      driveType: getValueByName("Drive Type") || "",
      doors: getValueByName("Doors") || "",
      manufacturer: getValueByName("Manufacturer Name") || "",
      plantCountry: getValueByName("Plant Country") || "",
      plantCity: getValueByName("Plant City") || "",
      series: getValueByName("Series") || "",
      trim: getValueByName("Trim") || "",
      gvwr: getValueByName("Gross Vehicle Weight Rating From") || "",
      errorCode: getValueByName("Error Code") || "0",
      errorText: getValueByName("Error Text") || "",
      engineType: mapFuelType(getValueByName("Fuel Type - Primary")),
      transmissionType: mapTransmission(getValueByName("Transmission Style")),
      color: "",
    };

    res.json(decodedVehicle);
  } catch (error) {
    console.error("Error decoding VIN:", error);
    res.status(500).json({ message: "Failed to decode VIN" });
  }
});

// ── decode-vin (storage-based) ─────────────────────────────────────

router.get("/decode-vin/:vin", isAuthenticated, async (req, res) => {
  try {
    const { vin } = req.params;
    const vinData = await storage.decodeVIN(vin);

    if (!vinData) {
      return res.status(404).json({ message: "VIN not found or invalid" });
    }

    res.json(vinData);
  } catch (error) {
    console.error("Error decoding VIN:", error);
    res.status(500).json({ message: "Failed to decode VIN" });
  }
});

// ── Vehicle CRUD ───────────────────────────────────────────────────

router.get("/vehicles", isAuthenticated, async (req, res) => {
  try {
    // Scope to the caller's garage; ignore client-supplied garageId.
    const garageId = resolveGarageScope(req);
    const vehicles = await storage.getVehicles(garageId as string | undefined);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

router.post("/vehicles", isAuthenticated, async (req, res) => {
  try {
    const { insertVehicleSchema } = await import("@shared/schema");
    const validationResult = insertVehicleSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const vehicle = await storage.createVehicle(validationResult.data);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
});

router.patch("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertVehicleSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertVehicleSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const updatedVehicle = await storage.updateVehicle(id, validationResult.data);
    res.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: "Failed to update vehicle" });
  }
});

router.delete("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteVehicle(id);
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Failed to delete vehicle" });
  }
});

// ── Vehicle Service History ────────────────────────────────────────

router.get("/vehicles/:id/service-history", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const history = await storage.getVehicleServiceHistory(id);
    res.json(history);
  } catch (error) {
    console.error("Error fetching service history:", error);
    res.status(500).json({ message: "Failed to fetch service history" });
  }
});

router.post("/vehicles/:id/service-history", isAuthenticated, async (req: any, res) => {
  try {
    const { insertVehicleServiceHistorySchema } = await import("@shared/schema");
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';

    // Coerce date strings from JSON
    const body = { ...req.body };
    if (typeof body.serviceDate === 'string') body.serviceDate = new Date(body.serviceDate);

    const validationResult = insertVehicleServiceHistorySchema.safeParse({
      ...body,
      vehicleId: id,
      performedBy: userId
    });

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const history = await storage.createServiceHistory(validationResult.data);
    res.status(201).json(history);
  } catch (error) {
    console.error("Error creating service history:", error);
    res.status(500).json({ message: "Failed to create service history" });
  }
});

router.delete("/service-history/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteServiceHistory(id);
    res.json({ message: "Service history deleted successfully" });
  } catch (error) {
    console.error("Error deleting service history:", error);
    res.status(500).json({ message: "Failed to delete service history" });
  }
});

// ── Maintenance Schedules ──────────────────────────────────────────

router.get("/vehicles/:id/maintenance-schedules", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const schedules = await storage.getMaintenanceSchedules(id);
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    res.status(500).json({ message: "Failed to fetch maintenance schedules" });
  }
});

router.post("/vehicles/:id/maintenance-schedules", isAuthenticated, async (req, res) => {
  try {
    const { insertMaintenanceScheduleSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertMaintenanceScheduleSchema.safeParse({
      ...req.body,
      vehicleId: id
    });

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const schedule = await storage.createMaintenanceSchedule(validationResult.data);
    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    res.status(500).json({ message: "Failed to create maintenance schedule" });
  }
});

router.patch("/maintenance-schedules/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertMaintenanceScheduleSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertMaintenanceScheduleSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const schedule = await storage.updateMaintenanceSchedule(id, validationResult.data);
    res.json(schedule);
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    res.status(500).json({ message: "Failed to update maintenance schedule" });
  }
});

router.delete("/maintenance-schedules/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteMaintenanceSchedule(id);
    res.json({ message: "Maintenance schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    res.status(500).json({ message: "Failed to delete maintenance schedule" });
  }
});

// ── Service Reminders ──────────────────────────────────────────────

router.get("/vehicles/:id/service-reminders", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const reminders = await storage.getServiceReminders(id, status as string | undefined);
    res.json(reminders);
  } catch (error) {
    console.error("Error fetching service reminders:", error);
    res.status(500).json({ message: "Failed to fetch service reminders" });
  }
});

router.post("/vehicles/:id/service-reminders", isAuthenticated, async (req, res) => {
  try {
    const { insertServiceReminderSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertServiceReminderSchema.safeParse({
      ...req.body,
      vehicleId: id
    });

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const reminder = await storage.createServiceReminder(validationResult.data);
    res.status(201).json(reminder);
  } catch (error) {
    console.error("Error creating service reminder:", error);
    res.status(500).json({ message: "Failed to create service reminder" });
  }
});

router.patch("/service-reminders/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertServiceReminderSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertServiceReminderSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const reminder = await storage.updateServiceReminder(id, validationResult.data);
    res.json(reminder);
  } catch (error) {
    console.error("Error updating service reminder:", error);
    res.status(500).json({ message: "Failed to update service reminder" });
  }
});

router.delete("/service-reminders/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteServiceReminder(id);
    res.json({ message: "Service reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting service reminder:", error);
    res.status(500).json({ message: "Failed to delete service reminder" });
  }
});

export const vehicleRoutes = router;
