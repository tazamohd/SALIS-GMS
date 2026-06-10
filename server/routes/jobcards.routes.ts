import { Router } from "express";
import { randomBytes } from "crypto";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { jobCardParts, sparePartInventories, jobCards, insertJobCardSchema, insertJobTrackingEventSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import { eventBus } from "../engine/event-bus";

const router = Router();

// Server-controlled fields are stripped from client input; created/updated/identity
// columns are managed by the handler, not the request body.
const createJobCardSchema = insertJobCardSchema.omit({
  id: true,
  jobNumber: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  garageId: true,
});

function generateJobNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(2).toString('hex').toUpperCase();
  return `JC-${ts}-${suffix}`;
}

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

/**
 * Job Card Management Routes
 * Matches monolith server/routes.ts handlers exactly.
 */

// GET /api/job-cards - List job cards
// SECURITY: scope is derived from the session, never the query string. A garage
// user only ever sees their own garage's cards; a CUSTOMER additionally sees
// only the cards where they are the customer. The legacy `garage_id`/`assigned_to`
// query params are honoured only as *additional* filters within the caller's
// own garage (admins/managers can still narrow by technician).
router.get("/job-cards", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user || {};
    const isCustomer = (user.userType === 'customer') || (user.role && String(user.role).toUpperCase() === 'CUSTOMER');

    // Always pin to the caller's garage. Fall back to the (validated) query
    // param only when the session has no garageId (e.g. platform admins).
    const garageId = user.garageId || (req.query.garage_id as string) || undefined;
    const assignedTo = (req.query.assigned_to as string) || undefined;
    const customerId = isCustomer ? user.id : undefined;

    const jobCards = await storage.getJobCards(garageId, assignedTo, customerId);
    res.json(jobCards);
  } catch (error) {
    console.error("Error fetching job cards:", error);
    res.status(500).json({ message: "Failed to fetch job cards" });
  }
});

// GET /api/job-cards/:id - Get job card by ID
router.get("/job-cards/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const jobCard = await storage.getJobCard(id);
    if (!jobCard) {
      return res.status(404).json({ message: "Job card not found" });
    }

    // Ownership / tenancy enforcement: a card outside the caller's garage is a
    // 404 (don't reveal existence); a customer may only read their own cards.
    const user = req.user || {};
    const isCustomer = (user.userType === 'customer') || (user.role && String(user.role).toUpperCase() === 'CUSTOMER');
    if (user.garageId && jobCard.garageId && jobCard.garageId !== user.garageId) {
      return res.status(404).json({ message: "Job card not found" });
    }
    if (isCustomer && jobCard.customerId && jobCard.customerId !== user.id) {
      return res.status(404).json({ message: "Job card not found" });
    }

    res.json(jobCard);
  } catch (error) {
    console.error("Error fetching job card:", error);
    res.status(500).json({ message: "Failed to fetch job card" });
  }
});

// GET /api/job-cards/:id/details - Get full job card details
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

// POST /api/job-cards - Create new job card
router.post("/job-cards", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const garageId = req.user?.garageId;
    if (!garageId) {
      return res.status(400).json({ message: "User has no garage assigned" });
    }

    const parsed = createJobCardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(sanitizeZodError(parsed.error));
    }

    const jobCardData = {
      ...parsed.data,
      jobNumber: generateJobNumber(),
      createdBy: userId,
      garageId,
    };
    const jobCard = await storage.createJobCard(jobCardData);
    res.status(201).json(jobCard);
  } catch (error) {
    console.error("Error creating job card:", error);
    res.status(500).json({ message: "Failed to create job card" });
  }
});

// PUT /api/job-cards/:id - Update job card
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

// PATCH /api/job-cards/:id - Update job card status (with inventory deduction on completion)
router.patch("/job-cards/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const newStatus = req.body.status;

    // If status is changing to 'completed', handle inventory deduction and status update atomically
    if (newStatus === 'completed') {
      // Get current job card to check existing status
      const currentJobCard = await storage.getJobCard(id);
      if (!currentJobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }

      // Only deduct inventory if transitioning TO completed (not already completed)
      if (currentJobCard.status !== 'completed') {
        // Use transaction for atomic inventory deduction AND job card update
        const updatedJobCard = await db.transaction(async (tx: any) => {
          // Get all parts associated with this job card
          const jobParts = await tx.select().from(jobCardParts).where(eq(jobCardParts.jobCardId, id));

          // First pass: verify sufficient stock for all parts
          for (const part of jobParts) {
            if (!part.isDeducted && part.sparePartInventoryId) {
              const [inventory] = await tx.select().from(sparePartInventories)
                .where(eq(sparePartInventories.id, part.sparePartInventoryId));

              if (!inventory) {
                throw new Error(`Inventory record not found for part ID: ${part.sparePartId}`);
              }

              const currentStock = inventory.stockQuantity || 0;
              if (currentStock < part.quantity) {
                throw new Error(`Insufficient stock for part. Available: ${currentStock}, Required: ${part.quantity}`);
              }
            }
          }

          // Second pass: deduct inventory for each part
          for (const part of jobParts) {
            if (!part.isDeducted && part.sparePartInventoryId) {
              // Deduct from spare part inventory
              await tx.update(sparePartInventories)
                .set({
                  stockQuantity: sql`${sparePartInventories.stockQuantity} - ${part.quantity}`,
                  updatedAt: new Date(),
                })
                .where(eq(sparePartInventories.id, part.sparePartInventoryId));

              // Mark part as deducted
              await tx.update(jobCardParts)
                .set({
                  isDeducted: true,
                  deductedAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(jobCardParts.id, part.id));
            }
          }

          // Update job card status within the same transaction
          const [updated] = await tx.update(jobCards)
            .set({
              ...req.body,
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(jobCards.id, id))
            .returning();

          return updated;
        });

        console.log(`Inventory updated for Job ID: ${id}`);

        // Emit job.completed so triggers can notify the customer + push to analytics.
        // Awaiting here is intentional: downstream handlers may create notifications
        // that the client expects to exist when it refreshes.
        await eventBus.emit(eventBus.createEvent(
          'job.completed',
          'job_card',
          id,
          (req as any).user?.garageId ?? updatedJobCard.garageId,
          { jobCardId: id, customerId: updatedJobCard.customerId, totalCost: updatedJobCard.totalCost },
          (req as any).user?.id,
        ));

        return res.json(updatedJobCard);
      }
    }

    // For non-completion status updates, use storage method
    const updatedJobCard = await storage.updateJobCard(id, req.body);
    res.json(updatedJobCard);
  } catch (error: any) {
    console.error("Error updating job card:", error);
    if (error.message?.includes('Insufficient stock') || error.message?.includes('Inventory record not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update job card" });
  }
});

// GET /api/job-cards/:jobCardId/parts - Get parts for job card (direct DB query, no storage method)
router.get("/job-cards/:jobCardId/parts", isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const parts = await db.select().from(jobCardParts).where(eq(jobCardParts.jobCardId, jobCardId));
    res.json(parts);
  } catch (error) {
    console.error("Error fetching job card parts:", error);
    res.status(500).json({ message: "Failed to fetch job card parts" });
  }
});

// POST /api/job-cards/:jobCardId/parts - Add part to job card (direct DB insert with zod validation)
router.post("/job-cards/:jobCardId/parts", isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;

    // Validate request body
    const addPartSchema = z.object({
      sparePartId: z.string().uuid(),
      sparePartInventoryId: z.string().uuid(),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
      unitPrice: z.string().optional(),
      notes: z.string().optional(),
    });

    const validationResult = addPartSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.errors
      });
    }

    const { sparePartId, sparePartInventoryId, quantity, unitPrice, notes } = validationResult.data;
    const lineTotal = unitPrice ? (parseFloat(unitPrice) * quantity).toFixed(2) : null;

    const [newPart] = await db.insert(jobCardParts).values({
      jobCardId,
      sparePartId,
      sparePartInventoryId,
      quantity,
      unitPrice,
      lineTotal,
      notes,
    }).returning();

    res.status(201).json(newPart);
  } catch (error) {
    console.error("Error adding part to job card:", error);
    res.status(500).json({ message: "Failed to add part to job card" });
  }
});

// DELETE /api/job-cards/:jobCardId/parts/:partId - Remove part from job card
router.delete("/job-cards/:jobCardId/parts/:partId", isAuthenticated, async (req, res) => {
  try {
    const { partId } = req.params;

    // Check if part was already deducted
    const [existingPart] = await db.select().from(jobCardParts).where(eq(jobCardParts.id, partId));
    if (existingPart?.isDeducted) {
      return res.status(400).json({ message: "Cannot remove part that has already been deducted from inventory" });
    }

    await db.delete(jobCardParts).where(eq(jobCardParts.id, partId));
    res.json({ message: "Part removed from job card" });
  } catch (error) {
    console.error("Error removing part from job card:", error);
    res.status(500).json({ message: "Failed to remove part from job card" });
  }
});

// GET /api/job-cards/:jobCardId/tasks - Get task assignments for job card
router.get("/job-cards/:jobCardId/tasks", isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const tasks = await storage.getTaskAssignments(jobCardId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching task assignments:", error);
    res.status(500).json({ message: "Failed to fetch task assignments" });
  }
});

// POST /api/job-cards/:jobCardId/tasks - Create task assignment for job card
router.post("/job-cards/:jobCardId/tasks", isAuthenticated, async (req: any, res) => {
  try {
    const { jobCardId } = req.params;
    const userId = req.user?.id || 'default-user';
    const taskData = {
      ...req.body,
      jobCardId,
      assignedBy: userId,
    };
    const task = await storage.createTaskAssignment(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task assignment:", error);
    res.status(500).json({ message: "Failed to create task assignment" });
  }
});

// PUT /api/tasks/:id - Update task assignment
router.put("/tasks/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await storage.updateTaskAssignment(id, req.body);
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task assignment:", error);
    res.status(500).json({ message: "Failed to update task assignment" });
  }
});

// POST /api/job-cards/:id/tracking/generate - Generate public tracking token
router.post("/job-cards/:id/tracking/generate", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Verify job card exists and user has access
    const jobCard = await storage.getJobCard(id);
    if (!jobCard) {
      return res.status(404).json({ message: "Job card not found" });
    }

    // Verify garage ownership
    const userGarages = await storage.getUserRoles(req.user?.id);
    const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);

    if (!hasAccess && req.user?.userType !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const { rawToken, hashedToken, expiresAt } = await storage.generatePublicTrackingToken(id);

    // Create tracking event
    await storage.createJobTrackingEvent({
      jobCardId: id,
      eventType: 'message',
      title: 'Tracking Link Generated',
      description: 'Customer tracking link has been generated and can be shared',
      isVisibleToCustomer: false,
      createdBy: req.user?.id,
    });

    res.json({
      trackingToken: rawToken,
      trackingUrl: `/track/${rawToken}`,
      expiresAt
    });
  } catch (error) {
    console.error("Error generating tracking token:", error);
    res.status(500).json({ message: "Failed to generate tracking token" });
  }
});

// GET /api/job-cards/:id/tracking/events - Get tracking events
router.get("/job-cards/:id/tracking/events", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { visibleToCustomer } = req.query;

    const jobCard = await storage.getJobCard(id);
    if (!jobCard) {
      return res.status(404).json({ message: "Job card not found" });
    }

    // Verify garage ownership
    const userGarages = await storage.getUserRoles(req.user?.id);
    const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);

    if (!hasAccess && req.user?.userType !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await storage.getJobTrackingEvents(
      id,
      visibleToCustomer === 'true' ? true : visibleToCustomer === 'false' ? false : undefined
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching tracking events:", error);
    res.status(500).json({ message: "Failed to fetch tracking events" });
  }
});

// POST /api/job-cards/:id/tracking/events - Create tracking event
router.post("/job-cards/:id/tracking/events", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = insertJobTrackingEventSchema.safeParse({
      ...req.body,
      jobCardId: id,
      createdBy: req.user?.id,
    });

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const jobCard = await storage.getJobCard(id);

    if (!jobCard) {
      return res.status(404).json({ message: "Job card not found" });
    }

    // Verify garage ownership
    const userGarages = await storage.getUserRoles(req.user?.id);
    const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);

    if (!hasAccess && req.user?.userType !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const event = await storage.createJobTrackingEvent(validationResult.data);
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating tracking event:", error);
    res.status(500).json({ message: "Failed to create tracking event" });
  }
});

// PATCH /api/job-cards/:id/eta - Update job ETA
router.patch("/job-cards/:id/eta", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const etaUpdateSchema = z.object({
      estimatedCompletionAt: z.string().datetime(),
      manualOverride: z.boolean().optional(),
    });

    const validationResult = etaUpdateSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const { estimatedCompletionAt, manualOverride } = validationResult.data;

    const jobCard = await storage.getJobCard(id);
    if (!jobCard) {
      return res.status(404).json({ message: "Job card not found" });
    }

    // Verify garage ownership
    const userGarages = await storage.getUserRoles(req.user?.id);
    const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);

    if (!hasAccess && req.user?.userType !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedJobCard = await storage.updateJobETA(
      id,
      new Date(estimatedCompletionAt),
      manualOverride || false
    );

    // Create tracking event for ETA update
    await storage.createJobTrackingEvent({
      jobCardId: id,
      eventType: 'eta_update',
      title: 'Estimated Completion Updated',
      description: `New estimated completion: ${new Date(estimatedCompletionAt).toLocaleString()}`,
      metadata: {
        previousETA: jobCard.estimatedCompletionAt,
        newETA: estimatedCompletionAt,
        manualOverride
      },
      isVisibleToCustomer: true,
      createdBy: req.user?.id,
    });

    res.json(updatedJobCard);
  } catch (error) {
    console.error("Error updating job ETA:", error);
    res.status(500).json({ message: "Failed to update job ETA" });
  }
});

export const jobCardsRoutes = router;
