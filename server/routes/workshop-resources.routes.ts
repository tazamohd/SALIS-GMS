import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { insertWorkshopResourceSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId.
const resourceBodySchema = insertWorkshopResourceSchema.omit({ garageId: true });

async function loadOwnedResource(req: any, res: any, id: string) {
  const resource = await storage.getWorkshopResource(id);
  if (!resource || resource.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Resource not found" });
    return null;
  }
  return resource;
}

// GET /api/workshop-resources — scoped to the caller's garage (not a query param)
router.get("/workshop-resources", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getWorkshopResources(garageId));
  } catch (error) {
    console.error("Error fetching workshop resources:", error);
    res.status(500).json({ message: "Failed to fetch workshop resources" });
  }
});

router.get("/workshop-resources/:id", isAuthenticated, async (req: any, res) => {
  try {
    const resource = await loadOwnedResource(req, res, req.params.id);
    if (!resource) return;
    res.json(resource);
  } catch (error) {
    console.error("Error fetching workshop resource:", error);
    res.status(500).json({ message: "Failed to fetch workshop resource" });
  }
});

router.post(
  "/workshop-resources",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
      const parsed = resourceBodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      const resource = await storage.createWorkshopResource({ ...parsed.data, garageId });
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating workshop resource:", error);
      res.status(500).json({ message: "Failed to create workshop resource" });
    }
  },
);

router.patch(
  "/workshop-resources/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedResource(req, res, req.params.id))) return;
      const parsed = resourceBodySchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
      const resource = await storage.updateWorkshopResource(req.params.id, parsed.data);
      res.json(resource);
    } catch (error) {
      console.error("Error updating workshop resource:", error);
      res.status(500).json({ message: "Failed to update workshop resource" });
    }
  },
);

router.delete(
  "/workshop-resources/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: any, res) => {
    try {
      if (!(await loadOwnedResource(req, res, req.params.id))) return;
      await storage.deleteWorkshopResource(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting workshop resource:", error);
      res.status(500).json({ message: "Failed to delete workshop resource" });
    }
  },
);

export const workshopResourcesRoutes = router;
