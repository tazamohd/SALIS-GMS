import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertLossEntrySchema } from "../../shared/schema";

const router = Router();

router.get("/loss-entries", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const entries = await storage.getLossEntries(user.garageId);
    res.json(entries);
  } catch (err) {
    console.error("[loss-entries] list error:", err);
    res.status(500).json({ message: "Failed to fetch loss entries" });
  }
});

router.post("/loss-entries", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const parsed = insertLossEntrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  try {
    const created = await storage.createLossEntry(user.garageId, parsed.data);
    res.status(201).json(created);
  } catch (err) {
    console.error("[loss-entries] create error:", err);
    res.status(500).json({ message: "Failed to create loss entry" });
  }
});

router.post("/loss-entries/:id/write-off", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const updated = await storage.writeOffLossEntry(req.params.id, user.garageId);
    if (!updated) return res.status(404).json({ message: "Loss entry not found" });
    res.json(updated);
  } catch (err) {
    console.error("[loss-entries] write-off error:", err);
    res.status(500).json({ message: "Failed to write off loss entry" });
  }
});

export const lossEntryRoutes = router;
