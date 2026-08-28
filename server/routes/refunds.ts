import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.get("/refunds", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { garageId, status } = req.query;
    const refunds = await storage.getRefunds(garageId as string, status as string);
    res.json(refunds);
  } catch (error) {
    console.error("Error fetching refunds:", error);
    res.status(500).json({ message: "Failed to fetch refunds" });
  }
});

router.get("/refunds/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const refund = await storage.getRefund(req.params.id);
    if (!refund) return res.status(404).json({ message: "Refund not found" });
    res.json(refund);
  } catch (error) {
    console.error("Error fetching refund:", error);
    res.status(500).json({ message: "Failed to fetch refund" });
  }
});

router.post("/refunds", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "default-user";
    const refund = await storage.createRefund({ ...req.body, requestedBy: userId });
    res.status(201).json(refund);
  } catch (error) {
    console.error("Error creating refund:", error);
    res.status(500).json({ message: "Failed to create refund" });
  }
});

router.patch("/refunds/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const refund = await storage.updateRefund(req.params.id, req.body);
    res.json(refund);
  } catch (error) {
    console.error("Error updating refund:", error);
    res.status(500).json({ message: "Failed to update refund" });
  }
});

router.post("/refunds/:id/approve", isAuthenticated, requireRole(["ADMIN", "MANAGER"]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "default-user";
    const refund = await storage.updateRefund(req.params.id, {
      status: "approved",
      approvedBy: userId,
      approvedAt: new Date(),
    });
    res.json(refund);
  } catch (error) {
    console.error("Error approving refund:", error);
    res.status(500).json({ message: "Failed to approve refund" });
  }
});

router.post("/refunds/:id/process", isAuthenticated, requireRole(["ADMIN", "MANAGER", "ACCOUNTANT"]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "default-user";
    const refund = await storage.updateRefund(req.params.id, {
      status: "processed",
      processedBy: userId,
      processedAt: new Date(),
    });
    res.json(refund);
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
});

export const refundRoutes = router;
