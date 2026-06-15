import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import {
  insertArWorkInstructionSchema,
  insertArSessionLogSchema,
  insertArDevicePairingSchema,
} from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Clients supply everything except the server-owned garageId.
const instructionBody = insertArWorkInstructionSchema.omit({ garageId: true });
const sessionBody = insertArSessionLogSchema.omit({ garageId: true });
const deviceBody = insertArDevicePairingSchema.omit({ garageId: true });

// ----------------------------------------------------------------------------
// AR work instructions (management-authored content → mutations are ADMIN/MANAGER)
// ----------------------------------------------------------------------------
async function loadOwnedInstruction(req: any, res: any, id: string) {
  const row = await storage.getArWorkInstruction(id);
  if (!row || row.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Instruction not found" });
    return null;
  }
  return row;
}

router.get("/ar-instructions", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getArWorkInstructions(garageId));
  } catch (error) {
    console.error("Error fetching AR instructions:", error);
    res.status(500).json({ message: "Failed to fetch AR instructions" });
  }
});

router.get("/ar-instructions/:id", isAuthenticated, async (req: any, res) => {
  try {
    const row = await loadOwnedInstruction(req, res, req.params.id);
    if (!row) return;
    res.json(row);
  } catch (error) {
    console.error("Error fetching AR instruction:", error);
    res.status(500).json({ message: "Failed to fetch AR instruction" });
  }
});

router.post(
  "/ar-instructions",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
      const parsed = instructionBody.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      res.status(201).json(await storage.createArWorkInstruction({ ...parsed.data, garageId }));
    } catch (error) {
      console.error("Error creating AR instruction:", error);
      res.status(500).json({ message: "Failed to create AR instruction" });
    }
  },
);

router.patch(
  "/ar-instructions/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedInstruction(req, res, req.params.id))) return;
      const parsed = instructionBody.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      res.json(await storage.updateArWorkInstruction(req.params.id, parsed.data));
    } catch (error) {
      console.error("Error updating AR instruction:", error);
      res.status(500).json({ message: "Failed to update AR instruction" });
    }
  },
);

router.delete(
  "/ar-instructions/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedInstruction(req, res, req.params.id))) return;
      await storage.deleteArWorkInstruction(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting AR instruction:", error);
      res.status(500).json({ message: "Failed to delete AR instruction" });
    }
  },
);

// ----------------------------------------------------------------------------
// AR session logs (created by technicians during work → authenticated only)
// ----------------------------------------------------------------------------
async function loadOwnedSession(req: any, res: any, id: string) {
  const row = await storage.getArSessionLog(id);
  if (!row || row.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Session not found" });
    return null;
  }
  return row;
}

router.get("/ar-sessions", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getArSessionLogs(garageId, req.query.technicianId as string | undefined));
  } catch (error) {
    console.error("Error fetching AR sessions:", error);
    res.status(500).json({ message: "Failed to fetch AR sessions" });
  }
});

router.post("/ar-sessions", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = sessionBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.status(201).json(await storage.createArSessionLog({ ...parsed.data, garageId }));
  } catch (error) {
    console.error("Error creating AR session:", error);
    res.status(500).json({ message: "Failed to create AR session" });
  }
});

router.patch("/ar-sessions/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedSession(req, res, req.params.id))) return;
    const parsed = sessionBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateArSessionLog(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating AR session:", error);
    res.status(500).json({ message: "Failed to update AR session" });
  }
});

// ----------------------------------------------------------------------------
// AR device pairings (technician self-service → authenticated only)
// ----------------------------------------------------------------------------
async function loadOwnedDevice(req: any, res: any, id: string) {
  const row = await storage.getArDevicePairing(id);
  if (!row || row.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Device not found" });
    return null;
  }
  return row;
}

router.get("/ar-devices", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getArDevicePairings(garageId));
  } catch (error) {
    console.error("Error fetching AR devices:", error);
    res.status(500).json({ message: "Failed to fetch AR devices" });
  }
});

router.get("/ar-devices/:id", isAuthenticated, async (req: any, res) => {
  try {
    const row = await loadOwnedDevice(req, res, req.params.id);
    if (!row) return;
    res.json(row);
  } catch (error) {
    console.error("Error fetching AR device:", error);
    res.status(500).json({ message: "Failed to fetch AR device" });
  }
});

router.post("/ar-devices", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = deviceBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.status(201).json(await storage.createArDevicePairing({ ...parsed.data, garageId }));
  } catch (error) {
    console.error("Error creating AR device pairing:", error);
    res.status(500).json({ message: "Failed to create AR device pairing" });
  }
});

router.patch("/ar-devices/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedDevice(req, res, req.params.id))) return;
    const parsed = deviceBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateArDevicePairing(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating AR device:", error);
    res.status(500).json({ message: "Failed to update AR device" });
  }
});

router.delete("/ar-devices/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedDevice(req, res, req.params.id))) return;
    await storage.deleteArDevicePairing(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting AR device:", error);
    res.status(500).json({ message: "Failed to delete AR device" });
  }
});

export const arRoutes = router;
