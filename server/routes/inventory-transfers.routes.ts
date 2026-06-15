import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";
import { insertInventoryTransferSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// A transfer has no single owner garage — it moves stock between fromGarageId and
// toGarageId. requestedBy is server-owned; the rest comes from the client.
const transferBody = insertInventoryTransferSchema.omit({ requestedBy: true });
const manager = requireRole(["ADMIN", "MANAGER"]);

// A transfer is visible to a garage if it is either the source or the destination.
async function loadOwnedTransfer(req: any, res: any, id: string) {
  const transfer = await storage.getInventoryTransfer(id);
  const garageId = req.user?.garageId;
  if (!transfer || (transfer.fromGarageId !== garageId && transfer.toGarageId !== garageId)) {
    res.status(404).json({ message: "Transfer not found" });
    return null;
  }
  return transfer;
}

// GET /api/inventory-transfers — scoped to the caller's garage (not a query param)
router.get("/inventory-transfers", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getInventoryTransfers(garageId, req.query.status as string | undefined));
  } catch (error) {
    console.error("Error fetching inventory transfers:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch inventory transfers" });
  }
});

router.get("/inventory-transfers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const transfer = await loadOwnedTransfer(req, res, req.params.id);
    if (!transfer) return;
    res.json(transfer);
  } catch (error) {
    console.error("Error fetching inventory transfer:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch inventory transfer" });
  }
});

// Any authenticated staff member can request a transfer.
router.post("/inventory-transfers", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = transferBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    // A user may only create transfers that involve their own garage.
    if (parsed.data.fromGarageId !== garageId && parsed.data.toGarageId !== garageId) {
      return res
        .status(403)
        .json({ message: "Transfer must involve your garage as source or destination" });
    }
    // transferNumber is generated inside storage.createInventoryTransfer.
    const transfer = await storage.createInventoryTransfer({
      ...parsed.data,
      requestedBy: req.user?.id,
    } as any);
    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error creating inventory transfer:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to create inventory transfer" });
  }
});

router.patch("/inventory-transfers/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedTransfer(req, res, req.params.id))) return;
    const parsed = transferBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateInventoryTransfer(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating inventory transfer:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to update inventory transfer" });
  }
});

router.post("/inventory-transfers/:id/approve", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedTransfer(req, res, req.params.id))) return;
    res.json(await storage.approveInventoryTransfer(req.params.id, req.user?.id || "system"));
  } catch (error) {
    console.error("Error approving inventory transfer:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to approve inventory transfer" });
  }
});

router.post("/inventory-transfers/:id/complete", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedTransfer(req, res, req.params.id))) return;
    res.json(await storage.completeInventoryTransfer(req.params.id, req.user?.id || "system"));
  } catch (error) {
    console.error("Error completing inventory transfer:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to complete inventory transfer" });
  }
});

export const inventoryTransfersRoutes = router;
