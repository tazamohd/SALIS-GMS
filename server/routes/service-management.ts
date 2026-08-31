// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";
import * as phase4Service from "../phase4-customer-experience-service";

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

// Validation schema (extracted from routes.ts inline definitions)
const serviceTrackingUpdateSchema = z.object({
  status: z.string(),
  message: z.string(),
  photoUrl: z.string().optional(),
  estimatedCompletion: z.string().optional(),
});

// ==========================================
// SERVICE TRACKING ROUTES
// ==========================================

// Get active service tracking
router.get('/service-tracking/active', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    res.json([]);
  } catch (error) {
    console.error("Error fetching service tracking:", error);
    res.status(500).json({ message: "Failed to fetch service tracking data" });
  }
});

// Get service tracking timeline for a job card
router.get('/service-tracking/:jobCardId', isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const timeline = await phase4Service.getServiceTrackingTimeline(jobCardId);
    res.json(timeline);
  } catch (error) {
    console.error("Error fetching service tracking timeline:", error);
    res.status(500).json({ message: "Failed to fetch service tracking timeline" });
  }
});

// Post a service tracking update
router.post('/service-tracking/:jobCardId/update', isAuthenticated, async (req: any, res) => {
  try {
    const { jobCardId } = req.params;
    const userId = req.user?.id || 'default-user';

    const validated = serviceTrackingUpdateSchema.parse(req.body);

    const updateData = {
      jobCardId,
      userId,
      status: validated.status,
      message: validated.message,
      photoUrl: validated.photoUrl,
      estimatedCompletion: validated.estimatedCompletion ? new Date(validated.estimatedCompletion) : undefined,
    };
    const update = await phase4Service.postServiceUpdate(updateData);
    res.status(201).json(update);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error posting service update:", error);
    res.status(500).json({ message: "Failed to post service update" });
  }
});

// ==========================================
// SERVICE BAY DASHBOARD ROUTES
// ==========================================

// List service bays
router.get('/service-bays', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    const bays = await storage.getServiceBays(garageId as string);
    res.json(bays);
  } catch (error: any) {
    console.error("Error fetching service bays:", error);
    res.status(500).json({ message: "Failed to fetch service bays" });
  }
});

// List service bays with sessions
router.get('/service-bays/with-sessions', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    const baysWithSessions = await storage.getServiceBaysWithSessions(garageId as string);
    res.json(baysWithSessions);
  } catch (error: any) {
    console.error("Error fetching service bays with sessions:", error);
    res.status(500).json({ message: "Failed to fetch service bays with sessions" });
  }
});

// Get service bay statistics
router.get('/service-bays/statistics', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    const statistics = await storage.getServiceBayStatistics(garageId as string);
    res.json(statistics);
  } catch (error: any) {
    console.error("Error fetching service bay statistics:", error);
    res.status(500).json({ message: "Failed to fetch service bay statistics" });
  }
});

// Create service bay
router.post('/service-bays', isAuthenticated, async (req: any, res) => {
  try {
    const bay = await storage.createServiceBay(req.body);
    res.status(201).json(bay);
  } catch (error: any) {
    console.error("Error creating service bay:", error);
    res.status(500).json({ message: "Failed to create service bay" });
  }
});

// Update service bay status
router.patch('/service-bays/:id/status', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bay = await storage.updateServiceBayStatus(id, status);
    if (!bay) {
      return res.status(404).json({ message: "Service bay not found" });
    }
    res.json(bay);
  } catch (error: any) {
    console.error("Error updating service bay status:", error);
    res.status(500).json({ message: "Failed to update service bay status" });
  }
});

// Start a bay session
router.post('/service-bays/:bayId/sessions', isAuthenticated, async (req: any, res) => {
  try {
    const { bayId } = req.params;
    const { vehicleId, jobCardId } = req.body;
    const session = await storage.startBaySession(bayId, vehicleId, jobCardId);
    res.status(201).json(session);
  } catch (error: any) {
    console.error("Error starting bay session:", error);
    res.status(500).json({ message: "Failed to start bay session" });
  }
});

// End a bay session
router.patch('/service-bays/sessions/:sessionId/end', isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const session = await storage.endBaySession(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (error: any) {
    console.error("Error ending bay session:", error);
    res.status(500).json({ message: "Failed to end bay session" });
  }
});

// ==========================================
// SERVICE REMINDER TEMPLATES ROUTES
// ==========================================

// List service reminder templates
router.get('/service-reminder-templates', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const templates = await storage.getServiceReminderTemplates(garageId);
    res.json(templates);
  } catch (error: any) {
    console.error("Error fetching reminder templates:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single service reminder template
router.get('/service-reminder-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const template = await storage.getServiceReminderTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a service reminder template
router.post('/service-reminder-templates', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const template = await storage.createServiceReminderTemplate({ ...req.body, garageId });
    res.status(201).json(template);
  } catch (error: any) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update a service reminder template
router.patch('/service-reminder-templates/:id', isAuthenticated, async (req, res) => {
  try {
    const template = await storage.updateServiceReminderTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error: any) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a service reminder template
router.delete('/service-reminder-templates/:id', isAuthenticated, async (req, res) => {
  try {
    await storage.deleteServiceReminderTemplate(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
