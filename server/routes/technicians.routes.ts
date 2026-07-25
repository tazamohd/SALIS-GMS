import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { resolveGarageScope } from "../middleware/garageScope";

const router = Router();

// Get all technicians
router.get("/technicians", isAuthenticated, async (req, res) => {
  try {
    // Scope to the caller's garage; ignore client-supplied garage_id.
    const garageId = resolveGarageScope(req);
    const technicians = await storage.getTechnicians(garageId as string);
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

// Get technician's time clock entries
router.get("/technicians/:technicianId/time-clock", isAuthenticated, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const entries = await storage.getTechnicianTimeClockEntries(technicianId);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching time clock entries:", error);
    res.status(500).json({ message: "Failed to fetch time clock entries" });
  }
});

// POST clock in/out
router.post("/technicians/:technicianId/time-clock", isAuthenticated, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const entryData = {
      ...req.body,
      technicianId,
    };
    const entry = await storage.createTimeClockEntry(entryData);
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating time clock entry:", error);
    res.status(500).json({ message: "Failed to create time clock entry" });
  }
});

export const technicianRoutes = router;
