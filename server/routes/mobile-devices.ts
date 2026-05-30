// @ts-nocheck
/**
 * Mobile Device Management — backs /api/mobile-devices.
 * CRUD for tablets/phones/scanners assigned to technicians within a garage.
 */
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertMobileDeviceSchema } from "../../shared/schema";

const router = Router();

const patchSchema = z.object({
  deviceName: z.string().min(1).optional(),
  deviceType: z.enum(["tablet", "phone", "scanner"]).optional(),
  assignedTo: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional(),
  batteryLevel: z.number().int().min(0).max(100).nullable().optional(),
  lastSync: z.coerce.date().nullable().optional(),
});

router.get("/mobile-devices", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const devices = await storage.getMobileDevices(user.garageId);
    res.json(devices);
  } catch (err) {
    console.error("[mobile-devices] list error:", err);
    res.status(500).json({ message: "Failed to fetch mobile devices" });
  }
});

router.post("/mobile-devices", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = insertMobileDeviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid device payload", errors: parsed.error.flatten() });
  try {
    const created = await storage.createMobileDevice(user.garageId, parsed.data);
    res.status(201).json(created);
  } catch (err) {
    console.error("[mobile-devices] create error:", err);
    res.status(500).json({ message: "Failed to create mobile device" });
  }
});

router.patch("/mobile-devices/:id", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid patch", errors: parsed.error.flatten() });
  try {
    const updated = await storage.updateMobileDevice(req.params.id, user.garageId, parsed.data);
    if (!updated) return res.status(404).json({ message: "Device not found" });
    res.json(updated);
  } catch (err) {
    console.error("[mobile-devices] update error:", err);
    res.status(500).json({ message: "Failed to update mobile device" });
  }
});

router.delete("/mobile-devices/:id", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const removed = await storage.deleteMobileDevice(req.params.id, user.garageId);
    if (!removed) return res.status(404).json({ message: "Device not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[mobile-devices] delete error:", err);
    res.status(500).json({ message: "Failed to delete mobile device" });
  }
});

export const mobileDevicesRoutes = router;
