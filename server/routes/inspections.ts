import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertInspectionTemplateSchema, insertVehicleInspectionSchema } from "../../shared/schema";

const router = Router();

// ── Inspection Templates ───────────────────────────────────────────────

router.post("/inspection-templates", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = insertInspectionTemplateSchema.parse(req.body);
    const template = await storage.createInspectionTemplate({
      ...data,
      garageId: user.garageId,
      createdBy: user.id,
    });
    res.status(201).json(template);
  } catch (error: any) {
    console.error("Error creating inspection template:", error);
    res.status(400).json({ error: error.message || "Failed to create inspection template" });
  }
});

router.get("/inspection-templates", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const templates = await storage.getInspectionTemplates(user.garageId);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching inspection templates:", error);
    res.status(500).json({ error: "Failed to fetch inspection templates" });
  }
});

router.get("/inspection-templates/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const template = await storage.getInspectionTemplateById(req.params.id);
    if (!template) return res.status(404).json({ error: "Inspection template not found" });
    res.json(template);
  } catch (error) {
    console.error("Error fetching inspection template:", error);
    res.status(500).json({ error: "Failed to fetch inspection template" });
  }
});

router.patch("/inspection-templates/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const data = insertInspectionTemplateSchema.partial().parse(req.body);
    const updated = await storage.updateInspectionTemplate(req.params.id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating inspection template:", error);
    res.status(400).json({ error: error.message || "Failed to update inspection template" });
  }
});

router.delete("/inspection-templates/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    await storage.deleteInspectionTemplate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting inspection template:", error);
    res.status(500).json({ error: "Failed to delete inspection template" });
  }
});

// ── Vehicle Inspections ────────────────────────────────────────────────

router.post("/vehicle-inspections", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = insertVehicleInspectionSchema.parse(req.body);
    const inspection = await storage.createVehicleInspection({
      ...data,
      garageId: user.garageId,
      inspectorId: user.id,
    });
    res.status(201).json(inspection);
  } catch (error: any) {
    console.error("Error creating vehicle inspection:", error);
    res.status(400).json({ error: error.message || "Failed to create vehicle inspection" });
  }
});

router.get("/vehicle-inspections", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, vehicleId, customerId } = req.query;
    const inspections = await storage.getVehicleInspections(user.garageId, {
      status: status as string | undefined,
      vehicleId: vehicleId as string | undefined,
      customerId: customerId as string | undefined,
    });
    res.json(inspections);
  } catch (error) {
    console.error("Error fetching vehicle inspections:", error);
    res.status(500).json({ error: "Failed to fetch vehicle inspections" });
  }
});

router.get("/vehicle-inspections/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const inspection = await storage.getVehicleInspectionById(req.params.id);
    if (!inspection) return res.status(404).json({ error: "Vehicle inspection not found" });
    res.json(inspection);
  } catch (error) {
    console.error("Error fetching vehicle inspection:", error);
    res.status(500).json({ error: "Failed to fetch vehicle inspection" });
  }
});

router.patch("/vehicle-inspections/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const data = insertVehicleInspectionSchema.partial().parse(req.body);
    const updated = await storage.updateVehicleInspection(req.params.id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating vehicle inspection:", error);
    res.status(400).json({ error: error.message || "Failed to update vehicle inspection" });
  }
});

router.delete("/vehicle-inspections/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    await storage.deleteVehicleInspection(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehicle inspection:", error);
    res.status(500).json({ error: "Failed to delete vehicle inspection" });
  }
});

export const inspectionRoutes = router;
