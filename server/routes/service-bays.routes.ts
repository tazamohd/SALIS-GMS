import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";
import { insertServiceBaySchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId.
const bayBody = insertServiceBaySchema.omit({ garageId: true });

async function loadOwnedBay(req: any, res: any, id: string) {
  const bay = await storage.getServiceBay(id);
  if (!bay || bay.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Service bay not found" });
    return null;
  }
  return bay;
}

// GET /api/service-bays — scoped to the caller's garage (not a query param)
router.get("/service-bays", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getServiceBays(garageId));
  } catch (error) {
    console.error("Error fetching service bays:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch service bays" });
  }
});

// Static sub-paths must be declared before any "/service-bays/:id" route.
router.get("/service-bays/with-sessions", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getServiceBaysWithSessions(garageId));
  } catch (error) {
    console.error("Error fetching service bays with sessions:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch service bays with sessions" });
  }
});

router.get("/service-bays/statistics", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) {
      return res.json({
        totalBays: 0,
        occupiedBays: 0,
        availableBays: 0,
        maintenanceBays: 0,
        avgSessionDuration: 0,
        todayCompletedSessions: 0,
      });
    }
    res.json(await storage.getServiceBayStatistics(garageId));
  } catch (error) {
    console.error("Error fetching service bay statistics:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch service bay statistics" });
  }
});

// Creating a bay is configuration → ADMIN/MANAGER.
router.post(
  "/service-bays",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
      const parsed = bayBody.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      res.status(201).json(await storage.createServiceBay({ ...parsed.data, garageId }));
    } catch (error) {
      console.error("Error creating service bay:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to create service bay" });
    }
  },
);

// Status changes and sessions are operational → authenticated, but garage-scoped.
const statusSchema = z.object({ status: z.string().min(1) });

router.patch("/service-bays/:id/status", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedBay(req, res, req.params.id))) return;
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const bay = await storage.updateServiceBayStatus(req.params.id, parsed.data.status);
    res.json(bay);
  } catch (error) {
    console.error("Error updating service bay status:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to update service bay status" });
  }
});

const startSessionSchema = z.object({
  vehicleId: z.string().optional(),
  jobCardId: z.string().optional(),
});

router.post("/service-bays/:bayId/sessions", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedBay(req, res, req.params.bayId))) return;
    const parsed = startSessionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const session = await storage.startBaySession(
      req.params.bayId,
      parsed.data.vehicleId,
      parsed.data.jobCardId,
    );
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting bay session:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to start bay session" });
  }
});

router.patch("/service-bays/sessions/:sessionId/end", isAuthenticated, async (req: any, res) => {
  try {
    const session = await storage.getBaySession(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    // Verify the session's bay belongs to the caller's garage before ending it.
    if (!(await loadOwnedBay(req, res, session.bayId))) return;
    res.json(await storage.endBaySession(req.params.sessionId));
  } catch (error) {
    console.error("Error ending bay session:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to end bay session" });
  }
});

export const serviceBaysRoutes = router;
