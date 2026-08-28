import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = Router();

router.get("/discounts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { garageId, isActive } = req.query;
    if (!garageId) return res.status(400).json({ message: "garageId is required" });
    const discounts = await storage.getDiscounts(
      garageId as string,
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    );
    res.json(discounts);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ message: "Failed to fetch discounts" });
  }
});

router.get("/discounts/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const discount = await storage.getDiscount(req.params.id);
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    res.json(discount);
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({ message: "Failed to fetch discount" });
  }
});

router.post("/discounts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "default-user";
    const discount = await storage.createDiscount({ ...req.body, createdBy: userId });
    res.status(201).json(discount);
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ message: "Failed to create discount" });
  }
});

router.patch("/discounts/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const discount = await storage.updateDiscount(req.params.id, req.body);
    res.json(discount);
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Failed to update discount" });
  }
});

router.delete("/discounts/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    await storage.deleteDiscount(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ message: "Failed to delete discount" });
  }
});

router.post("/discounts/validate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { code, garageId, amount } = req.body;
    const userId = (req as any).user?.id || "default-user";
    const result = await storage.validateDiscount(code, garageId, userId, amount);
    res.json(result);
  } catch (error) {
    console.error("Error validating discount:", error);
    res.status(500).json({ message: "Failed to validate discount" });
  }
});

export const discountRoutes = router;
