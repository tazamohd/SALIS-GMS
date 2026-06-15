import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";
import { insertTaxConfigurationSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId/createdBy.
const configBody = insertTaxConfigurationSchema.omit({ garageId: true, createdBy: true });
const manager = requireRole(["ADMIN", "MANAGER"]);

async function loadOwnedConfig(req: any, res: any, id: string) {
  const config = await storage.getTaxConfiguration(id);
  if (!config || config.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Tax configuration not found" });
    return null;
  }
  return config;
}

// GET /api/tax-configurations — scoped to the caller's garage (not a query param)
router.get("/tax-configurations", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    const isActive =
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    res.json(await storage.getTaxConfigurations(garageId, isActive));
  } catch (error) {
    console.error("Error fetching tax configurations:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch tax configurations" });
  }
});

router.get("/tax-configurations/:id", isAuthenticated, async (req: any, res) => {
  try {
    const config = await loadOwnedConfig(req, res, req.params.id);
    if (!config) return;
    res.json(config);
  } catch (error) {
    console.error("Error fetching tax configuration:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to fetch tax configuration" });
  }
});

router.post("/tax-configurations", isAuthenticated, manager, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = configBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const config = await storage.createTaxConfiguration({
      ...parsed.data,
      garageId,
      createdBy: req.user?.id,
    });
    res.status(201).json(config);
  } catch (error) {
    console.error("Error creating tax configuration:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to create tax configuration" });
  }
});

router.patch("/tax-configurations/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedConfig(req, res, req.params.id))) return;
    const parsed = configBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateTaxConfiguration(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating tax configuration:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to update tax configuration" });
  }
});

router.delete("/tax-configurations/:id", isAuthenticated, manager, async (req: any, res) => {
  try {
    if (!(await loadOwnedConfig(req, res, req.params.id))) return;
    await storage.deleteTaxConfiguration(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting tax configuration:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to delete tax configuration" });
  }
});

export const taxConfigurationsRoutes = router;
