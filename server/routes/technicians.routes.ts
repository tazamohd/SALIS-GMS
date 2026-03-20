// @ts-nocheck
import { Router } from "express";
import type { Express } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Technician Management Routes
 * - GET /api/technicians - List all technicians
 * - POST /api/technicians - Create new technician
 * - DELETE /api/technicians/:id - Delete technician
 * - GET /api/technician-profiles/:userId - Get technician profile
 * - POST /api/technician-profiles - Create technician profile
 * - PATCH /api/technician-profiles/:userId - Update technician profile
 * - GET /api/technicians/:technicianId/job-cards - Get technician's job cards
 * - GET /api/technicians/:technicianId/time-clock - Get technician time clock
 * - POST /api/technicians/:technicianId/time-clock - Record time clock entry
 */

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

// Create new technician
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
router.get(
  "/technician-profiles/:userId",
  isAuthenticated,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getTechnicianProfile(userId);
      if (!profile) {
        return res
          .status(404)
          .json({ message: "Technician profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      res.status(500).json({ message: "Failed to fetch technician profile" });
    }
  }
);

// Create technician profile
router.post(
  "/technician-profiles",
  isAuthenticated,
  async (req, res) => {
    try {
      const profile = await storage.createTechnicianProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating technician profile:", error);
      res
        .status(500)
        .json({ message: "Failed to create technician profile" });
    }
  }
);

// Update technician profile
router.patch(
  "/technician-profiles/:userId",
  isAuthenticated,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.updateTechnicianProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating technician profile:", error);
      res
        .status(500)
        .json({ message: "Failed to update technician profile" });
    }
  }
);

// Get technician's job cards
router.get(
  "/technicians/:technicianId/job-cards",
  isAuthenticated,
  async (req, res) => {
    try {
      const { technicianId } = req.params;
      const jobCards = await storage.getTechnicianJobCards(technicianId);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching technician job cards:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch technician job cards" });
    }
  }
);

// Get technician time clock
router.get(
  "/technicians/:technicianId/time-clock",
  isAuthenticated,
  async (req, res) => {
    try {
      const { technicianId } = req.params;
      const { date } = req.query;
      const timeClock = await storage.getTechnicianTimeClock(
        technicianId,
        date as string
      );
      res.json(timeClock);
    } catch (error) {
      console.error("Error fetching technician time clock:", error);
      res.status(500).json({ message: "Failed to fetch time clock data" });
    }
  }
);

// Record time clock entry
router.post(
  "/technicians/:technicianId/time-clock",
  isAuthenticated,
  async (req, res) => {
    try {
      const { technicianId } = req.params;
      const { action, timestamp } = req.body;
      const timeClock = await storage.recordTechnicianTimeClock(
        technicianId,
        action,
        timestamp
      );
      res.status(201).json(timeClock);
    } catch (error) {
      console.error("Error recording time clock entry:", error);
      res
        .status(500)
        .json({ message: "Failed to record time clock entry" });
    }
  }
);

export const technicianRoutes = router;
