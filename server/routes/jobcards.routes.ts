// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { jobCardParts, sparePartInventories, jobCards } from "@shared/schema";
import QRCode from "qrcode";

const router = Router();

/**
 * Job Card Management Routes
 * - GET /api/job-cards - List job cards
 * - POST /api/job-cards - Create job card
 * - GET /api/job-cards/:id - Get job card details
 * - GET /api/job-cards/:id/details - Get full job card details
 * - PUT /api/job-cards/:id - Update job card
 * - PATCH /api/job-cards/:id - Update job card status
 * - GET /api/job-cards/:jobCardId/parts - Get job card parts
 * - POST /api/job-cards/:jobCardId/parts - Add part to job card
 * - DELETE /api/job-cards/:jobCardId/parts/:partId - Remove part from job card
 * - GET /api/job-cards/:jobCardId/tasks - Get job card tasks
 * - POST /api/job-cards/:jobCardId/tasks - Create task for job card
 * - PUT /api/tasks/:id - Update task
 * - POST /api/job-cards/:id/tracking/generate - Generate tracking token
 * - GET /api/job-cards/:id/tracking/events - Get tracking events
 * - POST /api/job-cards/:id/tracking/events - Add tracking event
 * - PATCH /api/job-cards/:id/eta - Update ETA
 */

// Get all job cards
router.get("/job-cards", isAuthenticated, async (req, res) => {
  try {
    const { garage_id, assigned_to } = req.query;
    const jobCards = await storage.getJobCards(
      garage_id as string,
      assigned_to as string
    );
    res.json(jobCards);
  } catch (error) {
    console.error("Error fetching job cards:", error);
    res.status(500).json({ message: "Failed to fetch job cards" });
  }
});

// Get job card by ID
router.get("/job-cards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const jobCard = await storage.getJobCard(id);
    if (!jobCard) {
      return res.status(404).json({ message: "Job card not found" });
    }
    res.json(jobCard);
  } catch (error) {
    console.error("Error fetching job card:", error);
    res.status(500).json({ message: "Failed to fetch job card" });
  }
});

// Get job card with full details
router.get("/job-cards/:id/details", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const jobCardDetails = await storage.getJobCardWithDetails(id);
    if (!jobCardDetails) {
      return res.status(404).json({ message: "Job card not found" });
    }
    res.json(jobCardDetails);
  } catch (error) {
    console.error("Error fetching job card details:", error);
    res.status(500).json({ message: "Failed to fetch job card details" });
  }
});

// Create new job card
router.post("/job-cards", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || "default-user";
    const jobCardData = {
      ...req.body,
      createdBy: userId,
    };
    const jobCard = await storage.createJobCard(jobCardData);
    res.status(201).json(jobCard);
  } catch (error) {
    console.error("Error creating job card:", error);
    res.status(500).json({ message: "Failed to create job card" });
  }
});

// Update job card
router.put("/job-cards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJobCard = await storage.updateJobCard(id, req.body);
    res.json(updatedJobCard);
  } catch (error) {
    console.error("Error updating job card:", error);
    res.status(500).json({ message: "Failed to update job card" });
  }
});

// Update job card status (with inventory deduction)
router.patch("/job-cards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const newStatus = req.body.status;

    if (newStatus === "completed") {
      const currentJobCard = await storage.getJobCard(id);
      if (!currentJobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }

      if (currentJobCard.status !== "completed") {
        const updatedJobCard = await db.transaction(async (tx) => {
          const jobParts = await tx
            .select()
            .from(jobCardParts)
            .where(eq(jobCardParts.jobCardId, id));

          for (const part of jobParts) {
            if (!part.isDeducted && part.sparePartInventoryId) {
              const [inventory] = await tx
                .select()
                .from(sparePartInventories)
                .where(
                  eq(sparePartInventories.id, part.sparePartInventoryId)
                );

              if (!inventory) {
                throw new Error(
                  `Inventory record not found for part ID: ${part.sparePartId}`
                );
              }

              const currentStock = inventory.stockQuantity || 0;
              if (currentStock < part.quantity) {
                throw new Error(
                  `Insufficient stock for part. Available: ${currentStock}, Required: ${part.quantity}`
                );
              }
            }
          }

          for (const part of jobParts) {
            if (!part.isDeducted && part.sparePartInventoryId) {
              const newStock = (part.quantity || 0) * -1;
              await tx
                .update(sparePartInventories)
                .set({
                  stockQuantity: newStock,
                })
                .where(
                  eq(sparePartInventories.id, part.sparePartInventoryId)
                );

              await tx
                .update(jobCardParts)
                .set({ isDeducted: true })
                .where(eq(jobCardParts.id, part.id));
            }
          }

          const [updated] = await tx
            .update(jobCards)
            .set({ status: "completed" })
            .where(eq(jobCards.id, id))
            .returning();

          return updated;
        });

        return res.json(updatedJobCard);
      }
    }

    const updatedJobCard = await storage.updateJobCard(id, {
      status: newStatus,
    });
    res.json(updatedJobCard);
  } catch (error) {
    console.error("Error updating job card status:", error);
    res.status(500).json({ message: "Failed to update job card status" });
  }
});

// Get parts for job card
router.get(
  "/job-cards/:jobCardId/parts",
  isAuthenticated,
  async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const parts = await storage.getJobCardParts(jobCardId);
      res.json(parts);
    } catch (error) {
      console.error("Error fetching job card parts:", error);
      res.status(500).json({ message: "Failed to fetch job card parts" });
    }
  }
);

// Add part to job card
router.post(
  "/job-cards/:jobCardId/parts",
  isAuthenticated,
  async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const { sparePartId, quantity, unitCost } = req.body;

      if (!sparePartId || !quantity) {
        return res
          .status(400)
          .json({ message: "Spare part ID and quantity are required" });
      }

      const part = await storage.createJobCardPart({
        jobCardId,
        sparePartId,
        quantity,
        unitCost: unitCost || 0,
      });

      res.status(201).json(part);
    } catch (error) {
      console.error("Error adding part to job card:", error);
      res.status(500).json({ message: "Failed to add part to job card" });
    }
  }
);

// Remove part from job card
router.delete(
  "/job-cards/:jobCardId/parts/:partId",
  isAuthenticated,
  async (req, res) => {
    try {
      const { partId } = req.params;
      await storage.deleteJobCardPart(partId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing part from job card:", error);
      res
        .status(500)
        .json({ message: "Failed to remove part from job card" });
    }
  }
);

// Get tasks for job card
router.get(
  "/job-cards/:jobCardId/tasks",
  isAuthenticated,
  async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const tasks = await storage.getJobCardTasks(jobCardId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching job card tasks:", error);
      res.status(500).json({ message: "Failed to fetch job card tasks" });
    }
  }
);

// Create task for job card
router.post(
  "/job-cards/:jobCardId/tasks",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { jobCardId } = req.params;
      const userId = req.user?.id || "default-user";
      const taskData = {
        ...req.body,
        jobCardId,
        createdBy: userId,
      };
      const task = await storage.createJobCardTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating job card task:", error);
      res.status(500).json({ message: "Failed to create job card task" });
    }
  }
);

// Update task
router.put("/tasks/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await storage.updateJobCardTask(id, req.body);
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Generate tracking token
router.post(
  "/job-cards/:id/tracking/generate",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const jobCard = await storage.getJobCard(id);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }

      const token = require("crypto").randomBytes(32).toString("hex");
      await storage.createJobCardTracking({
        jobCardId: id,
        trackingToken: token,
        createdAt: new Date().toISOString(),
      });

      const qrCode = await QRCode.toDataURL(
        `${process.env.APP_URL || "http://localhost"}/track/${token}`
      );

      res.json({
        trackingToken: token,
        qrCode: qrCode,
        trackingUrl: `${process.env.APP_URL || "http://localhost"}/track/${token}`,
      });
    } catch (error) {
      console.error("Error generating tracking token:", error);
      res
        .status(500)
        .json({ message: "Failed to generate tracking token" });
    }
  }
);

// Get tracking events
router.get(
  "/job-cards/:id/tracking/events",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const events = await storage.getJobCardTrackingEvents(id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching tracking events:", error);
      res.status(500).json({ message: "Failed to fetch tracking events" });
    }
  }
);

// Add tracking event
router.post(
  "/job-cards/:id/tracking/events",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const event = await storage.createJobCardTrackingEvent({
        jobCardId: id,
        status,
        notes: notes || null,
        createdAt: new Date().toISOString(),
      });
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating tracking event:", error);
      res.status(500).json({ message: "Failed to create tracking event" });
    }
  }
);

// Update ETA
router.patch(
  "/job-cards/:id/eta",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const { eta } = req.body;

      if (!eta) {
        return res.status(400).json({ message: "ETA is required" });
      }

      const updatedJobCard = await storage.updateJobCard(id, { eta });
      res.json(updatedJobCard);
    } catch (error) {
      console.error("Error updating ETA:", error);
      res.status(500).json({ message: "Failed to update ETA" });
    }
  }
);

export const jobCardsRoutes = router;
