import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { insertDiscountPromotionSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId/createdBy. Dates are
// coerced so ISO-string payloads (the existing contract) keep working.
const discountBody = insertDiscountPromotionSchema
  .omit({ garageId: true, createdBy: true })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  });
const manager = requireRole(["ADMIN", "MANAGER"]);

async function loadOwnedDiscount(req: any, res: any, id: string) {
  const discount = await storage.getDiscount(id);
  if (!discount || discount.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Discount not found" });
    return null;
  }
  return discount;
}

// GET /api/discounts — scoped to the caller's garage (not a query param)
router.get("/discounts", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    const isActive =
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    res.json(await storage.getDiscounts(garageId, isActive));
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ message: "Failed to fetch discounts" });
  }
});

// Validate a code at checkout — garage taken from the session, not the body.
router.post("/discounts/validate", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const { code, amount } = req.body;
    const result = await storage.validateDiscount(code, garageId, req.user?.id, amount);
    res.json(result);
  } catch (error) {
    console.error("Error validating discount:", error);
    res.status(500).json({ message: "Failed to validate discount" });
  }
});

router.get("/discounts/:id", isAuthenticated, async (req: any, res) => {
  try {
    const discount = await loadOwnedDiscount(req, res, req.params.id);
    if (!discount) return;
    res.json(discount);
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({ message: "Failed to fetch discount" });
  }
});

router.post("/discounts", isAuthenticated, manager, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = discountBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const discount = await storage.createDiscount({
      ...parsed.data,
      garageId,
      createdBy: req.user?.id,
    });
    res.status(201).json(discount);
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ message: "Failed to create discount" });
  }
});

router.patch("/discounts/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedDiscount(req, res, req.params.id))) return;
    const parsed = discountBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateDiscount(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Failed to update discount" });
  }
});

router.delete("/discounts/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedDiscount(req, res, req.params.id))) return;
    await storage.deleteDiscount(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ message: "Failed to delete discount" });
  }
});

export const discountsRoutes = router;
