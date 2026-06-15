import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";
import { insertLoyaltyTierSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId.
const tierBodySchema = insertLoyaltyTierSchema.omit({ garageId: true });

async function loadOwnedTier(req: any, res: any, id: string) {
  const tier = await storage.getLoyaltyTier(id);
  if (!tier || tier.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Tier not found" });
    return null;
  }
  return tier;
}

// GET /api/loyalty-tiers — scoped to the caller's garage (not a query param)
router.get("/loyalty-tiers", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getLoyaltyTiers(garageId));
  } catch (error) {
    console.error("Error fetching loyalty tiers:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch loyalty tiers" });
  }
});

router.get("/loyalty-tiers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const tier = await loadOwnedTier(req, res, req.params.id);
    if (!tier) return;
    res.json(tier);
  } catch (error) {
    console.error("Error fetching loyalty tier:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch loyalty tier" });
  }
});

router.post(
  "/loyalty-tiers",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
      const parsed = tierBodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      const tier = await storage.createLoyaltyTier({ ...parsed.data, garageId });
      res.status(201).json(tier);
    } catch (error) {
      console.error("Error creating loyalty tier:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to create loyalty tier" });
    }
  },
);

router.patch(
  "/loyalty-tiers/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedTier(req, res, req.params.id))) return;
      const parsed = tierBodySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      const tier = await storage.updateLoyaltyTier(req.params.id, parsed.data);
      res.json(tier);
    } catch (error) {
      console.error("Error updating loyalty tier:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to update loyalty tier" });
    }
  },
);

router.delete(
  "/loyalty-tiers/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedTier(req, res, req.params.id))) return;
      await storage.deleteLoyaltyTier(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting loyalty tier:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to delete loyalty tier" });
    }
  },
);

export const loyaltyTiersRoutes = router;
