// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Vehicle Management Routes
 * - GET /api/vehicles - List all vehicles
 * - POST /api/vehicles - Create new vehicle
 * - GET /api/vehicles/:id - Get vehicle details
 * - PATCH /api/vehicles/:id - Update vehicle
 * - DELETE /api/vehicles/:id - Delete vehicle
 * - GET /api/vehicles/:id/service-history - Get vehicle service history
 * - POST /api/vehicles/:id/service-history - Add service history entry
 * - DELETE /api/service-history/:id - Delete service history entry
 * - GET /api/vehicles/:id/maintenance-schedules - Get maintenance schedules
 * - POST /api/vehicles/:id/maintenance-schedules - Create maintenance schedule
 * - PATCH /api/maintenance-schedules/:id - Update maintenance schedule
 * - DELETE /api/maintenance-schedules/:id - Delete maintenance schedule
 * - GET /api/vehicles/:id/service-reminders - Get service reminders
 * - POST /api/vehicles/:id/service-reminders - Create service reminder
 * - PATCH /api/service-reminders/:id - Update service reminder
 * - DELETE /api/service-reminders/:id - Delete service reminder
 * - GET /api/catalogs/vehicle-makes - Get vehicle makes
 * - GET /api/catalogs/vehicle-models - Get vehicle models
 * - GET /api/catalogs/nationalities - Get nationalities
 * - GET /api/catalogs/years - Get vehicle years
 * - GET /api/catalogs/colors - Get vehicle colors
 * - GET /api/catalogs/engine-types - Get engine types
 * - GET /api/catalogs/transmission-types - Get transmission types
 * - GET /api/vin-decode/:vin - Decode VIN
 */

// Get all vehicles
router.get("/vehicles", isAuthenticated, async (req, res) => {
  try {
    const { garage_id, customerId } = req.query;
    const vehicles = await storage.getVehicles(
      garage_id as string,
      customerId as string
    );
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// Create new vehicle
router.post("/vehicles", isAuthenticated, async (req, res) => {
  try {
    const { customerId, make, model, year, licensePlate, vin, color, garageId } = req.body;

    if (!customerId || !make || !model || !garageId) {
      return res
        .status(400)
        .json({
          message: "Customer, make, model, and garage are required",
        });
    }

    const vehicle = await storage.createVehicle({
      customerId,
      make,
      model,
      year: year || null,
      licensePlate: licensePlate || null,
      vin: vin || null,
      color: color || null,
      garageId,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
});

// Get vehicle by ID
router.get("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await storage.getVehicle(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ message: "Failed to fetch vehicle" });
  }
});

// Update vehicle
router.patch("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, licensePlate, vin, color } = req.body;

    const updatedVehicle = await storage.updateVehicle(id, {
      make: make || undefined,
      model: model || undefined,
      year: year || undefined,
      licensePlate: licensePlate || undefined,
      vin: vin || undefined,
      color: color || undefined,
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: "Failed to update vehicle" });
  }
});

// Delete vehicle
router.delete("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteVehicle(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Failed to delete vehicle" });
  }
});

// Get service history
router.get(
  "/vehicles/:id/service-history",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getVehicleServiceHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching service history:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  }
);

// Add service history entry
router.post(
  "/vehicles/:id/service-history",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || "default-user";
      const { date, description, cost, mileage } = req.body;

      const entry = await storage.createServiceHistoryEntry({
        vehicleId: id,
        date,
        description,
        cost: cost || 0,
        mileage: mileage || null,
        createdBy: userId,
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating service history entry:", error);
      res
        .status(500)
        .json({ message: "Failed to create service history entry" });
    }
  }
);

// Delete service history entry
router.delete(
  "/service-history/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceHistoryEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service history entry:", error);
      res
        .status(500)
        .json({ message: "Failed to delete service history entry" });
    }
  }
);

// Get maintenance schedules
router.get(
  "/vehicles/:id/maintenance-schedules",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const schedules = await storage.getMaintenanceSchedules(id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch maintenance schedules" });
    }
  }
);

// Create maintenance schedule
router.post(
  "/vehicles/:id/maintenance-schedules",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { serviceName, dueDate, mileage, notes } = req.body;

      const schedule = await storage.createMaintenanceSchedule({
        vehicleId: id,
        serviceName,
        dueDate,
        mileage: mileage || null,
        notes: notes || null,
      });

      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      res
        .status(500)
        .json({ message: "Failed to create maintenance schedule" });
    }
  }
);

// Update maintenance schedule
router.patch(
  "/maintenance-schedules/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { serviceName, dueDate, mileage, notes, completed } = req.body;

      const schedule = await storage.updateMaintenanceSchedule(id, {
        serviceName: serviceName || undefined,
        dueDate: dueDate || undefined,
        mileage: mileage || undefined,
        notes: notes || undefined,
        completed: completed || undefined,
      });

      res.json(schedule);
    } catch (error) {
      console.error("Error updating maintenance schedule:", error);
      res
        .status(500)
        .json({ message: "Failed to update maintenance schedule" });
    }
  }
);

// Delete maintenance schedule
router.delete(
  "/maintenance-schedules/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaintenanceSchedule(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error);
      res
        .status(500)
        .json({ message: "Failed to delete maintenance schedule" });
    }
  }
);

// Get service reminders
router.get(
  "/vehicles/:id/service-reminders",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const reminders = await storage.getServiceReminders(id);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching service reminders:", error);
      res.status(500).json({ message: "Failed to fetch service reminders" });
    }
  }
);

// Create service reminder
router.post(
  "/vehicles/:id/service-reminders",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reminderDate, service, contactMethod } = req.body;

      const reminder = await storage.createServiceReminder({
        vehicleId: id,
        reminderDate,
        service,
        contactMethod: contactMethod || "email",
      });

      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating service reminder:", error);
      res
        .status(500)
        .json({ message: "Failed to create service reminder" });
    }
  }
);

// Update service reminder
router.patch(
  "/service-reminders/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reminderDate, service, contactMethod, sent } = req.body;

      const reminder = await storage.updateServiceReminder(id, {
        reminderDate: reminderDate || undefined,
        service: service || undefined,
        contactMethod: contactMethod || undefined,
        sent: sent || undefined,
      });

      res.json(reminder);
    } catch (error) {
      console.error("Error updating service reminder:", error);
      res
        .status(500)
        .json({ message: "Failed to update service reminder" });
    }
  }
);

// Delete service reminder
router.delete(
  "/service-reminders/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceReminder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service reminder:", error);
      res
        .status(500)
        .json({ message: "Failed to delete service reminder" });
    }
  }
);

// Vehicle Catalog Endpoints

// Get vehicle makes
router.get(
  "/catalogs/vehicle-makes",
  isAuthenticated,
  async (req, res) => {
    try {
      const { vehicleMakes } = await import("@shared/vehicleCatalogs");
      res.json(vehicleMakes);
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
      res.status(500).json({ message: "Failed to fetch vehicle makes" });
    }
  }
);

// Get vehicle models
router.get(
  "/catalogs/vehicle-models",
  isAuthenticated,
  async (req, res) => {
    try {
      const { makeId } = req.query;
      const { vehicleModels, getModelsForMake } = await import(
        "@shared/vehicleCatalogs"
      );
      if (makeId) {
        res.json(getModelsForMake(makeId as string));
      } else {
        res.json(vehicleModels);
      }
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      res.status(500).json({ message: "Failed to fetch vehicle models" });
    }
  }
);

// Get nationalities
router.get(
  "/catalogs/nationalities",
  isAuthenticated,
  async (req, res) => {
    try {
      const { nationalities } = await import("@shared/vehicleCatalogs");
      res.json(nationalities);
    } catch (error) {
      console.error("Error fetching nationalities:", error);
      res.status(500).json({ message: "Failed to fetch nationalities" });
    }
  }
);

// Get years
router.get(
  "/catalogs/years",
  isAuthenticated,
  async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
      res.json(years);
    } catch (error) {
      console.error("Error fetching years:", error);
      res.status(500).json({ message: "Failed to fetch years" });
    }
  }
);

// Get colors
router.get(
  "/catalogs/colors",
  isAuthenticated,
  async (req, res) => {
    try {
      const colors = [
        "Black",
        "White",
        "Silver",
        "Gray",
        "Red",
        "Blue",
        "Green",
        "Yellow",
        "Brown",
        "Orange",
        "Purple",
      ];
      res.json(colors);
    } catch (error) {
      console.error("Error fetching colors:", error);
      res.status(500).json({ message: "Failed to fetch colors" });
    }
  }
);

// Get engine types
router.get(
  "/catalogs/engine-types",
  isAuthenticated,
  async (req, res) => {
    try {
      const engineTypes = [
        "Petrol",
        "Diesel",
        "Hybrid",
        "Electric",
        "LPG",
      ];
      res.json(engineTypes);
    } catch (error) {
      console.error("Error fetching engine types:", error);
      res.status(500).json({ message: "Failed to fetch engine types" });
    }
  }
);

// Get transmission types
router.get(
  "/catalogs/transmission-types",
  isAuthenticated,
  async (req, res) => {
    try {
      const transmissionTypes = [
        "Manual",
        "Automatic",
        "CVT",
        "Semi-Automatic",
      ];
      res.json(transmissionTypes);
    } catch (error) {
      console.error("Error fetching transmission types:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch transmission types" });
    }
  }
);

// Decode VIN
router.get(
  "/vin-decode/:vin",
  isAuthenticated,
  async (req, res) => {
    try {
      const { vin } = req.params;
      if (!vin || vin.length < 9) {
        return res.status(400).json({ message: "Invalid VIN" });
      }

      // Basic VIN decoding (simplified version)
      const decodedData = {
        vin: vin,
        worldManufacturerCode: vin.substring(0, 3),
        vehicleDescriptorSection: vin.substring(3, 9),
        vehicleIdentifierSection: vin.substring(9, 17),
        checkDigit: vin.charAt(8),
        modelYear: vin.charAt(9),
        plantCode: vin.charAt(10),
        serialNumber: vin.substring(11, 17),
      };

      res.json(decodedData);
    } catch (error) {
      console.error("Error decoding VIN:", error);
      res.status(500).json({ message: "Failed to decode VIN" });
    }
  }
);

export const vehicleRoutes = router;
