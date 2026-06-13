import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { insertTimeClockEntrySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

// Body fields the client may supply when clocking in; server controls garageId/employeeId
// (insertTimeClockEntrySchema already omits id + createdAt). clockInTime defaults to now.
const createTimeClockEntrySchema = insertTimeClockEntrySchema
  .omit({ garageId: true, employeeId: true })
  .partial({ clockInTime: true });

// Get all technicians
router.get("/technicians", isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const technicians = await storage.getTechnicians(garage_id as string);
    res.json(technicians);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    res.status(500).json({ message: "Failed to fetch technicians" });
  }
});

// Create technician
router.post("/technicians", isAuthenticated, async (req, res) => {
  try {
    const technicianData = {
      ...req.body,
      userType: "technician",
      isActive: true,
    };
    const technician = await storage.createUser(technicianData);
    res.status(201).json(technician);
  } catch (error) {
    console.error("Error creating technician:", error);
    res.status(500).json({ message: "Failed to create technician" });
  }
});

// Delete technician
router.delete("/technicians/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting technician:", error);
    res.status(500).json({ message: "Failed to delete technician" });
  }
});

// Get technician profile
router.get("/technician-profiles/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await storage.getTechnicianProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Technician profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error fetching technician profile:", error);
    res.status(500).json({ message: "Failed to fetch technician profile" });
  }
});

// Create technician profile
router.post("/technician-profiles", isAuthenticated, async (req, res) => {
  try {
    const profile = await storage.createTechnicianProfile(req.body);
    res.status(201).json(profile);
  } catch (error) {
    console.error("Error creating technician profile:", error);
    res.status(500).json({ message: "Failed to create technician profile" });
  }
});

// Update technician profile
router.patch("/technician-profiles/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await storage.updateTechnicianProfile(userId, req.body);
    res.json(profile);
  } catch (error) {
    console.error("Error updating technician profile:", error);
    res.status(500).json({ message: "Failed to update technician profile" });
  }
});

// Get technician's job cards
router.get("/technicians/:technicianId/job-cards", isAuthenticated, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const jobCards = await storage.getTechnicianJobCards(technicianId);
    res.json(jobCards);
  } catch (error) {
    console.error("Error fetching technician job cards:", error);
    res.status(500).json({ message: "Failed to fetch job cards" });
  }
});

// Get technician's time clock entries (tenant-scoped)
router.get("/technicians/:technicianId/time-clock", isAuthenticated, async (req: any, res) => {
  try {
    const { technicianId } = req.params;
    const garageId = req.user?.garageId;
    const entries = await storage.getTechnicianTimeClockEntries(technicianId, garageId);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching time clock entries:", error);
    res.status(500).json({ message: "Failed to fetch time clock entries" });
  }
});

// POST clock in — creates a new open time clock entry for the technician
router.post("/technicians/:technicianId/time-clock", isAuthenticated, async (req: any, res) => {
  try {
    const { technicianId } = req.params;
    const garageId = req.user?.garageId;
    if (!garageId) {
      return res.status(400).json({ message: "User has no garage assigned" });
    }

    const parsed = createTimeClockEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(sanitizeZodError(parsed.error));
    }

    // Prevent a second clock-in while a shift is already open.
    const open = await storage.getOpenTimeClockEntry(technicianId, garageId);
    if (open) {
      return res
        .status(409)
        .json({ message: "Technician is already clocked in", entry: open });
    }

    const entry = await storage.createTimeClockEntry({
      ...parsed.data,
      employeeId: technicianId,
      garageId,
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating time clock entry:", error);
    res.status(500).json({ message: "Failed to create time clock entry" });
  }
});

// PATCH clock out — stamps clock-out time and computes total/overtime hours (tenant-scoped)
router.patch(
  "/technicians/:technicianId/time-clock/:entryId/clock-out",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { entryId } = req.params;
      const garageId = req.user?.garageId;
      const updated = await storage.clockOutTimeClockEntry(entryId, garageId);
      if (!updated) {
        return res.status(404).json({ message: "Time clock entry not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error clocking out time clock entry:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  },
);

export const technicianRoutes = router;
