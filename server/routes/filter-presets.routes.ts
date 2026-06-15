import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";
import { insertSavedFilterPresetSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId/userId.
const presetBody = insertSavedFilterPresetSchema.omit({ garageId: true, userId: true });

// Presets can be global (garage-shared), so ownership is scoped to the garage.
async function loadOwnedPreset(req: any, res: any, id: string) {
  const preset = await storage.getSavedFilterPreset(id);
  if (!preset || preset.garageId !== req.user?.garageId) {
    res.status(404).json({ message: "Filter preset not found" });
    return null;
  }
  return preset;
}

// GET /api/filter-presets — scoped to the caller's garage + user (not query params)
router.get("/filter-presets", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(
      await storage.getSavedFilterPresets(
        garageId,
        req.user?.id,
        req.query.module as string | undefined,
      ),
    );
  } catch (error) {
    console.error("Error getting filter presets:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to get filter presets" });
  }
});

router.post("/filter-presets", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = presetBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const preset = await storage.createSavedFilterPreset({
      ...parsed.data,
      garageId,
      userId: req.user?.id,
    });
    res.status(201).json(preset);
  } catch (error) {
    console.error("Error creating filter preset:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to create filter preset" });
  }
});

router.put("/filter-presets/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedPreset(req, res, req.params.id))) return;
    const parsed = presetBody.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.json(await storage.updateSavedFilterPreset(req.params.id, parsed.data));
  } catch (error) {
    console.error("Error updating filter preset:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to update filter preset" });
  }
});

router.delete("/filter-presets/:id", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedPreset(req, res, req.params.id))) return;
    await storage.deleteSavedFilterPreset(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting filter preset:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to delete filter preset" });
  }
});

export const filterPresetsRoutes = router;
