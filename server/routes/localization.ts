import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertLocaleSchema, insertTranslationResourceSchema } from "../../shared/schema";

const router = Router();

// ── Locales ────────────────────────────────────────────────────────────

router.post("/locales", isAuthenticated, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const data = insertLocaleSchema.parse(req.body);
    const locale = await storage.createLocale(data);
    res.status(201).json(locale);
  } catch (error: any) {
    console.error("Error creating locale:", error);
    res.status(400).json({ error: error.message || "Failed to create locale" });
  }
});

router.get("/locales", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (_req: Request, res: Response) => {
  try {
    const locales = await storage.getLocales();
    res.json(locales);
  } catch (error) {
    console.error("Error fetching locales:", error);
    res.status(500).json({ error: "Failed to fetch locales" });
  }
});

router.get("/locales/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const locale = await storage.getLocaleById(req.params.id);
    if (!locale) return res.status(404).json({ error: "Locale not found" });
    res.json(locale);
  } catch (error) {
    console.error("Error fetching locale:", error);
    res.status(500).json({ error: "Failed to fetch locale" });
  }
});

router.patch("/locales/:id", isAuthenticated, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const updated = await storage.updateLocale(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating locale:", error);
    res.status(400).json({ error: error.message || "Failed to update locale" });
  }
});

router.delete("/locales/:id", isAuthenticated, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    await storage.deleteLocale(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting locale:", error);
    res.status(500).json({ error: "Failed to delete locale" });
  }
});

// ── Translation Resources ──────────────────────────────────────────────

router.post("/translation-resources", isAuthenticated, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const data = insertTranslationResourceSchema.parse(req.body);
    const resource = await storage.createTranslationResource(data);
    res.status(201).json(resource);
  } catch (error: any) {
    console.error("Error creating translation resource:", error);
    res.status(400).json({ error: error.message || "Failed to create translation resource" });
  }
});

router.get("/translation-resources", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const { localeId, namespace } = req.query;
    if (!localeId) return res.status(400).json({ error: "localeId is required" });
    const resources = await storage.getTranslationResources(localeId as string, {
      namespace: namespace as string | undefined,
    });
    res.json(resources);
  } catch (error) {
    console.error("Error fetching translation resources:", error);
    res.status(500).json({ error: "Failed to fetch translation resources" });
  }
});

router.get("/translation-resources/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const resource = await storage.getTranslationResourceById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Translation resource not found" });
    res.json(resource);
  } catch (error) {
    console.error("Error fetching translation resource:", error);
    res.status(500).json({ error: "Failed to fetch translation resource" });
  }
});

router.patch("/translation-resources/:id", isAuthenticated, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const updated = await storage.updateTranslationResource(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating translation resource:", error);
    res.status(400).json({ error: error.message || "Failed to update translation resource" });
  }
});

router.delete("/translation-resources/:id", isAuthenticated, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    await storage.deleteTranslationResource(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting translation resource:", error);
    res.status(500).json({ error: "Failed to delete translation resource" });
  }
});

export const localizationRoutes = router;
