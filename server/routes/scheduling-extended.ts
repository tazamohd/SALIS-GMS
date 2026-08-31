// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Scheduling Extended Routes
 *
 * Covers calendar, availability, recurring-appointment, assignment, and
 * workshop-resource endpoints that live outside the core scheduling module
 * (scheduling.routes.ts).
 *
 * Route groups (26 routes total):
 *   /api/recurring-appointments*  (6 routes)
 *   /api/calendar-events*         (5 routes)
 *   /api/availability*            (5 routes)
 *   /api/assignments*             (6 routes)
 *   /api/workshop-resources*      (4 routes)
 */

// ─── Recurring Appointments ─────────────────────────────────────────

// GET /api/recurring-appointments/:garageId
router.get('/recurring-appointments/:garageId', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.params;
    const appointments = await storage.getRecurringAppointments(garageId);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching recurring appointments:", error);
    res.status(500).json({ message: "Failed to fetch recurring appointments" });
  }
});

// GET /api/recurring-appointments/detail/:id
router.get('/recurring-appointments/detail/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const appointment = await storage.getRecurringAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: "Recurring appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching recurring appointment:", error);
    res.status(500).json({ message: "Failed to fetch recurring appointment" });
  }
});

// POST /api/recurring-appointments
router.post('/recurring-appointments', isAuthenticated, async (req: any, res) => {
  try {
    const { insertRecurringAppointmentSchema } = await import("@shared/schema");
    const userId = req.user?.id || 'default-user';
    const validatedData = insertRecurringAppointmentSchema.parse(req.body);

    const appointment = await storage.createRecurringAppointment({
      ...validatedData,
      createdBy: userId,
    });
    res.json(appointment);
  } catch (error: any) {
    console.error("Error creating recurring appointment:", error);
    res.status(400).json({ message: error.message || "Failed to create recurring appointment" });
  }
});

// PATCH /api/recurring-appointments/:id
router.patch('/recurring-appointments/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateRecurringAppointment(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating recurring appointment:", error);
    res.status(400).json({ message: error.message || "Failed to update recurring appointment" });
  }
});

// DELETE /api/recurring-appointments/:id
router.delete('/recurring-appointments/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteRecurringAppointment(id);
    res.json({ message: "Recurring appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting recurring appointment:", error);
    res.status(500).json({ message: "Failed to delete recurring appointment" });
  }
});

// POST /api/recurring-appointments/:id/generate
router.post('/recurring-appointments/:id/generate', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const appointments = await storage.generateAppointmentsFromRecurring(
      id,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(appointments);
  } catch (error) {
    console.error("Error generating appointments:", error);
    res.status(500).json({ message: "Failed to generate appointments" });
  }
});

// ─── Calendar Events ────────────────────────────────────────────────

// GET /api/calendar-events/:garageId
router.get('/calendar-events/:garageId', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const events = await storage.getCalendarEvents(
      garageId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
});

// GET /api/calendar-events/detail/:id
router.get('/calendar-events/detail/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const event = await storage.getCalendarEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Calendar event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    res.status(500).json({ message: "Failed to fetch calendar event" });
  }
});

// POST /api/calendar-events
router.post('/calendar-events', isAuthenticated, async (req: any, res) => {
  try {
    const { insertCalendarEventSchema } = await import("@shared/schema");
    const userId = req.user?.id || 'default-user';
    const validatedData = insertCalendarEventSchema.parse(req.body);

    const event = await storage.createCalendarEvent({
      ...validatedData,
      createdBy: userId,
    });
    res.json(event);
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    res.status(400).json({ message: error.message || "Failed to create calendar event" });
  }
});

// PATCH /api/calendar-events/:id
router.patch('/calendar-events/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateCalendarEvent(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating calendar event:", error);
    res.status(400).json({ message: error.message || "Failed to update calendar event" });
  }
});

// DELETE /api/calendar-events/:id
router.delete('/calendar-events/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteCalendarEvent(id);
    res.json({ message: "Calendar event deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({ message: "Failed to delete calendar event" });
  }
});

// ─── Availability ───────────────────────────────────────────────────

// GET /api/availability/technician/:technicianId
router.get('/availability/technician/:technicianId', isAuthenticated, async (req: any, res) => {
  try {
    const { technicianId } = req.params;
    const { startDate, endDate } = req.query;

    const availability = await storage.getTechnicianAvailability(
      technicianId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(availability);
  } catch (error) {
    console.error("Error fetching technician availability:", error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// GET /api/availability/garage/:garageId
router.get('/availability/garage/:garageId', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const availability = await storage.getGarageAvailability(
      garageId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(availability);
  } catch (error) {
    console.error("Error fetching garage availability:", error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// POST /api/availability
router.post('/availability', isAuthenticated, async (req: any, res) => {
  try {
    const { insertTechnicianAvailabilitySchema } = await import("@shared/schema");
    const userId = req.user?.id || 'default-user';
    const validatedData = insertTechnicianAvailabilitySchema.parse(req.body);

    const availability = await storage.createTechnicianAvailability({
      ...validatedData,
      technicianId: userId,
    });
    res.json(availability);
  } catch (error: any) {
    console.error("Error creating availability:", error);
    res.status(400).json({ message: error.message || "Failed to create availability" });
  }
});

// PATCH /api/availability/:id
router.patch('/availability/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateTechnicianAvailability(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating availability:", error);
    res.status(400).json({ message: error.message || "Failed to update availability" });
  }
});

// DELETE /api/availability/:id
router.delete('/availability/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteTechnicianAvailability(id);
    res.json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({ message: "Failed to delete availability" });
  }
});

// ─── Assignments (AI-powered technician assignment) ─────────────────

// Helper to sanitize Zod validation errors
function sanitizeZodError(error: any) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// POST /api/assignments/recommend/:jobCardId
router.post('/assignments/recommend/:jobCardId', isAuthenticated, async (req: any, res) => {
  try {
    const { getAIAssignmentRecommendations } = await import("../services/assignmentAI");
    const { jobCardId } = req.params;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const recommendations = await getAIAssignmentRecommendations(storage, userGarageId, jobCardId);
    res.json({ recommendations });
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get AI recommendations" });
  }
});

// POST /api/assignments/assign
router.post('/assignments/assign', isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const { jobCardId, technicianId, reason, aiRecommendationId } = req.body;

    if (!jobCardId || !technicianId) {
      return res.status(400).json({ message: "jobCardId and technicianId are required" });
    }

    const updatedJob = await storage.assignTechnicianToJob({
      garageId: userGarageId,
      jobCardId,
      technicianId,
      assignedBy: userId,
      reason,
      aiRecommendationId
    });

    res.json(updatedJob);
  } catch (error) {
    console.error("Error assigning technician:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Failed to assign technician" });
  }
});

// GET /api/assignments/history/:jobCardId
router.get('/assignments/history/:jobCardId', isAuthenticated, async (req: any, res) => {
  try {
    const { jobCardId } = req.params;
    const { limit } = req.query;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const history = await storage.listAssignmentHistory(
      userGarageId,
      jobCardId,
      limit ? parseInt(limit as string) : 50
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching assignment history:", error);
    res.status(500).json({ message: "Failed to fetch assignment history" });
  }
});

// GET /api/assignments/rules
router.get('/assignments/rules', isAuthenticated, async (req: any, res) => {
  try {
    const { active } = req.query;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const rules = await storage.listAssignmentRules(
      userGarageId,
      active === 'true' ? true : active === 'false' ? false : undefined
    );
    res.json(rules);
  } catch (error) {
    console.error("Error fetching assignment rules:", error);
    res.status(500).json({ message: "Failed to fetch assignment rules" });
  }
});

// POST /api/assignments/rules
router.post('/assignments/rules', isAuthenticated, async (req: any, res) => {
  try {
    const { insertAssignmentRuleSchema } = await import("@shared/schema");
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const validationResult = insertAssignmentRuleSchema.safeParse({
      ...req.body,
      garageId: userGarageId,
      createdBy: userId
    });

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const rule = await storage.upsertAssignmentRule(validationResult.data);
    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creating assignment rule:", error);
    res.status(500).json({ message: "Failed to create assignment rule" });
  }
});

// DELETE /api/assignments/rules/:id
router.delete('/assignments/rules/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userGarageId = req.user?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: "User garage ID is required" });
    }

    const deleted = await storage.deleteAssignmentRule(id, userGarageId);
    if (!deleted) {
      return res.status(404).json({ message: "Assignment rule not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting assignment rule:", error);
    res.status(500).json({ message: "Failed to delete assignment rule" });
  }
});

// ─── Workshop Resources ─────────────────────────────────────────────

// GET /api/workshop-resources
router.get('/workshop-resources', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    if (!garageId) return res.status(400).json({ message: "garageId is required" });
    const resources = await storage.getWorkshopResources(garageId as string);
    res.json(resources);
  } catch (error: any) {
    console.error("Error fetching workshop resources:", error);
    res.status(500).json({ message: "Failed to fetch workshop resources" });
  }
});

// POST /api/workshop-resources
router.post('/workshop-resources', isAuthenticated, async (req: any, res) => {
  try {
    const resource = await storage.createWorkshopResource(req.body);
    res.status(201).json(resource);
  } catch (error: any) {
    console.error("Error creating workshop resource:", error);
    res.status(500).json({ message: "Failed to create workshop resource" });
  }
});

// PATCH /api/workshop-resources/:id
router.patch('/workshop-resources/:id', isAuthenticated, async (req: any, res) => {
  try {
    const resource = await storage.updateWorkshopResource(req.params.id, req.body);
    res.json(resource);
  } catch (error: any) {
    console.error("Error updating workshop resource:", error);
    res.status(500).json({ message: "Failed to update workshop resource" });
  }
});

// DELETE /api/workshop-resources/:id
router.delete('/workshop-resources/:id', isAuthenticated, async (req: any, res) => {
  try {
    await storage.deleteWorkshopResource(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting workshop resource:", error);
    res.status(500).json({ message: "Failed to delete workshop resource" });
  }
});

export default router;
