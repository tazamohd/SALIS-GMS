import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.get("/service-templates/all", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (_req: Request, res: Response) => {
  try {
    const allTemplates = await storage.getAllServiceTemplates();
    res.json(allTemplates);
  } catch (error) {
    console.error("Error fetching all service templates:", error);
    res.status(500).json({ message: "Failed to fetch service templates" });
  }
});

router.get("/service-templates", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const { garage_id } = req.query;
    if (!garage_id) return res.status(400).json({ message: "garage_id is required" });
    const templates = await storage.getServiceTemplates(garage_id as string);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching service templates:", error);
    res.status(500).json({ message: "Failed to fetch service templates" });
  }
});

router.get("/service-templates/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const template = await storage.getServiceTemplate(req.params.id);
    if (!template) return res.status(404).json({ message: "Service template not found" });
    res.json(template);
  } catch (error) {
    console.error("Error fetching service template:", error);
    res.status(500).json({ message: "Failed to fetch service template" });
  }
});

router.post("/service-templates", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const template = await storage.createServiceTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating service template:", error);
    res.status(500).json({ message: "Failed to create service template" });
  }
});

router.put("/service-templates/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const template = await storage.updateServiceTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error) {
    console.error("Error updating service template:", error);
    res.status(500).json({ message: "Failed to update service template" });
  }
});

router.delete("/service-templates/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    await storage.deleteServiceTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting service template:", error);
    res.status(500).json({ message: "Failed to delete service template" });
  }
});

export const serviceTemplateRoutes = router;
