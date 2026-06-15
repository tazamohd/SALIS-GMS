import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";
import { insertLoyaltyOfferSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId.
const offerBodySchema = insertLoyaltyOfferSchema.omit({ garageId: true });

async function loadOwnedOffer(req: any, res: any, id: string) {
  const offer = await storage.getLoyaltyOffer(id);
  if (!offer || offer.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Offer not found" });
    return null;
  }
  return offer;
}

// GET /api/loyalty-offers — scoped to the caller's garage (not a query param)
router.get("/loyalty-offers", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    const isActive =
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    res.json(await storage.getLoyaltyOffers(garageId, isActive));
  } catch (error) {
    console.error("Error fetching loyalty offers:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch loyalty offers" });
  }
});

router.get("/loyalty-offers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const offer = await loadOwnedOffer(req, res, req.params.id);
    if (!offer) return;
    res.json(offer);
  } catch (error) {
    console.error("Error fetching loyalty offer:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch loyalty offer" });
  }
});

router.post(
  "/loyalty-offers",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
      const parsed = offerBodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      const offer = await storage.createLoyaltyOffer({ ...parsed.data, garageId });
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating loyalty offer:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to create loyalty offer" });
    }
  },
);

router.patch(
  "/loyalty-offers/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedOffer(req, res, req.params.id))) return;
      const parsed = offerBodySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      const offer = await storage.updateLoyaltyOffer(req.params.id, parsed.data);
      res.json(offer);
    } catch (error) {
      console.error("Error updating loyalty offer:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to update loyalty offer" });
    }
  },
);

router.delete(
  "/loyalty-offers/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedOffer(req, res, req.params.id))) return;
      await storage.deleteLoyaltyOffer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting loyalty offer:", sanitizeForLog(error));
      res.status(500).json({ message: "Failed to delete loyalty offer" });
    }
  },
);

export const loyaltyOffersRoutes = router;
