import { Router } from "express";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { insertServiceTemplateSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

// garageId is taken from the session, never the request body.
const createServiceTemplateSchema = insertServiceTemplateSchema.omit({ garageId: true });
const updateServiceTemplateSchema = createServiceTemplateSchema.partial();

function requireGarage(req: any, res: any): string | undefined {
  const garageId = req.user?.garageId;
  if (!garageId) {
    res.status(400).json({ message: "User has no garage assigned" });
    return undefined;
  }
  return garageId;
}

// GET /api/service-templates/all - all templates in the caller's garage.
// (Previously returned every garage's templates — now tenant-scoped.)
router.get("/service-templates/all", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = requireGarage(req, res);
    if (!garageId) return;
    res.json(await storage.getServiceTemplates(garageId));
  } catch (error) {
    console.error("Error fetching all service templates:", error);
    res.status(500).json({ message: "Failed to fetch service templates" });
  }
});

// GET /api/service-templates - templates for the caller's garage.
router.get("/service-templates", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = requireGarage(req, res);
    if (!garageId) return;
    res.json(await storage.getServiceTemplates(garageId));
  } catch (error) {
    console.error("Error fetching service templates:", error);
    res.status(500).json({ message: "Failed to fetch service templates" });
  }
});

// GET /api/service-templates/:id - single template (tenant-scoped).
router.get("/service-templates/:id", isAuthenticated, async (req: any, res) => {
  try {
    const template = await storage.getServiceTemplate(req.params.id);
    if (!template || (req.user?.garageId && template.garageId !== req.user.garageId)) {
      return res.status(404).json({ message: "Service template not found" });
    }
    res.json(template);
  } catch (error) {
    console.error("Error fetching service template:", error);
    res.status(500).json({ message: "Failed to fetch service template" });
  }
});

// POST /api/service-templates - create in the caller's garage.
router.post("/service-templates", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = requireGarage(req, res);
    if (!garageId) return;

    const parsed = createServiceTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(sanitizeZodError(parsed.error));
    }

    const template = await storage.createServiceTemplate({ ...parsed.data, garageId });
    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating service template:", error);
    res.status(500).json({ message: "Failed to create service template" });
  }
});

// PUT /api/service-templates/:id - update (tenant-scoped, garage immutable).
router.put("/service-templates/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await storage.getServiceTemplate(id);
    if (!existing || (req.user?.garageId && existing.garageId !== req.user.garageId)) {
      return res.status(404).json({ message: "Service template not found" });
    }

    const parsed = updateServiceTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(sanitizeZodError(parsed.error));
    }

    const template = await storage.updateServiceTemplate(id, parsed.data);
    res.json(template);
  } catch (error) {
    console.error("Error updating service template:", error);
    res.status(500).json({ message: "Failed to update service template" });
  }
});

// DELETE /api/service-templates/:id - delete (tenant-scoped).
router.delete("/service-templates/:id", isAuthenticated, requireRole(["ADMIN", "MANAGER"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await storage.getServiceTemplate(id);
    if (!existing || (req.user?.garageId && existing.garageId !== req.user.garageId)) {
      return res.status(404).json({ message: "Service template not found" });
    }
    await storage.deleteServiceTemplate(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting service template:", error);
    res.status(500).json({ message: "Failed to delete service template" });
  }
});

export const serviceTemplateRoutes = router;
