import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertTowingRequestSchema, insertTowTruckSchema } from "../../shared/schema";

const router = Router();

// ── Towing Requests ────────────────────────────────────────────────────

router.post("/towing-requests", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = insertTowingRequestSchema.parse(req.body);
    const request = await storage.createTowingRequest({ ...data, garageId: user.garageId });
    res.status(201).json(request);
  } catch (error: any) {
    console.error("Error creating towing request:", error);
    res.status(400).json({ error: error.message || "Failed to create towing request" });
  }
});

router.get("/towing-requests", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, serviceType } = req.query;
    const requests = await storage.getTowingRequests(user.garageId, {
      status: status as string | undefined,
      serviceType: serviceType as string | undefined,
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching towing requests:", error);
    res.status(500).json({ error: "Failed to fetch towing requests" });
  }
});

router.get("/towing-requests/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const request = await storage.getTowingRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: "Towing request not found" });
    res.json(request);
  } catch (error) {
    console.error("Error fetching towing request:", error);
    res.status(500).json({ error: "Failed to fetch towing request" });
  }
});

router.patch("/towing-requests/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const data = insertTowingRequestSchema.partial().parse(req.body);
    const updated = await storage.updateTowingRequest(req.params.id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating towing request:", error);
    res.status(400).json({ error: error.message || "Failed to update towing request" });
  }
});

router.delete("/towing-requests/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    await storage.deleteTowingRequest(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting towing request:", error);
    res.status(500).json({ error: "Failed to delete towing request" });
  }
});

// ── Tow Trucks ─────────────────────────────────────────────────────────

router.post("/tow-trucks", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = insertTowTruckSchema.parse(req.body);
    const truck = await storage.createTowTruck({ ...data, garageId: user.garageId });
    res.status(201).json(truck);
  } catch (error: any) {
    console.error("Error creating tow truck:", error);
    res.status(400).json({ error: error.message || "Failed to create tow truck" });
  }
});

router.get("/tow-trucks", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.query;
    const trucks = await storage.getTowTrucks(user.garageId, {
      status: status as string | undefined,
    });
    res.json(trucks);
  } catch (error) {
    console.error("Error fetching tow trucks:", error);
    res.status(500).json({ error: "Failed to fetch tow trucks" });
  }
});

router.get("/tow-trucks/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const truck = await storage.getTowTruckById(req.params.id);
    if (!truck) return res.status(404).json({ error: "Tow truck not found" });
    res.json(truck);
  } catch (error) {
    console.error("Error fetching tow truck:", error);
    res.status(500).json({ error: "Failed to fetch tow truck" });
  }
});

router.patch("/tow-trucks/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const data = insertTowTruckSchema.partial().parse(req.body);
    const updated = await storage.updateTowTruck(req.params.id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating tow truck:", error);
    res.status(400).json({ error: error.message || "Failed to update tow truck" });
  }
});

router.delete("/tow-trucks/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    await storage.deleteTowTruck(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting tow truck:", error);
    res.status(500).json({ error: "Failed to delete tow truck" });
  }
});

const locationSchema = z.object({
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/, "Invalid latitude format"),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/, "Invalid longitude format"),
});

router.patch("/tow-trucks/:id/location", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = locationSchema.parse(req.body);
    const updated = await storage.updateTowTruckLocation(req.params.id, latitude, longitude);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating tow truck location:", error);
    res.status(400).json({ error: error.message || "Failed to update tow truck location" });
  }
});

export const towingRoutes = router;
