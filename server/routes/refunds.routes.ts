import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { insertRefundSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId/requestedBy.
const refundBody = insertRefundSchema.omit({ garageId: true, requestedBy: true });
const manager = requireRole(["ADMIN", "MANAGER"]);

async function loadOwnedRefund(req: any, res: any, id: string) {
  const refund = await storage.getRefund(id);
  if (!refund || refund.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Refund not found" });
    return null;
  }
  return refund;
}

// GET /api/refunds — scoped to the caller's garage (not a query param)
router.get("/refunds", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getRefunds(garageId, req.query.status as string | undefined));
  } catch (error) {
    console.error("Error fetching refunds:", error);
    res.status(500).json({ message: "Failed to fetch refunds" });
  }
});

router.get("/refunds/:id", isAuthenticated, async (req: any, res) => {
  try {
    const refund = await loadOwnedRefund(req, res, req.params.id);
    if (!refund) return;
    res.json(refund);
  } catch (error) {
    console.error("Error fetching refund:", error);
    res.status(500).json({ message: "Failed to fetch refund" });
  }
});

// Any authenticated staff member can request a refund.
router.post("/refunds", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = refundBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    // refundNumber is generated inside storage.createRefund.
    const refund = await storage.createRefund({
      ...parsed.data,
      garageId,
      requestedBy: req.user?.id,
    } as any);
    res.status(201).json(refund);
  } catch (error) {
    console.error("Error creating refund:", error);
    res.status(500).json({ message: "Failed to create refund" });
  }
});

router.patch("/refunds/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedRefund(req, res, req.params.id))) return;
    const parsed = refundBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateRefund(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating refund:", error);
    res.status(500).json({ message: "Failed to update refund" });
  }
});

router.post("/refunds/:id/approve", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedRefund(req, res, req.params.id))) return;
    res.json(
      await storage.updateRefund(req.params.id, {
        status: "approved",
        approvedBy: req.user?.id,
        approvedAt: new Date(),
      }),
    );
  } catch (error) {
    console.error("Error approving refund:", error);
    res.status(500).json({ message: "Failed to approve refund" });
  }
});

router.post("/refunds/:id/process", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedRefund(req, res, req.params.id))) return;
    res.json(
      await storage.updateRefund(req.params.id, {
        status: "processed",
        processedBy: req.user?.id,
        processedAt: new Date(),
      }),
    );
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ message: "Failed to process refund" });
  }
});

export const refundsRoutes = router;
