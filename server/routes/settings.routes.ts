import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { insertUserSettingsSchema } from "@shared/schema";

const router = Router();

/**
 * Settings & Configuration Routes
 * - GET   /api/settings        Get the authenticated user's settings (created on first access)
 * - PATCH /api/settings        Update the authenticated user's settings
 *
 * Note: /api/feature-flags is served by ./feature-flags (do not duplicate here).
 */

// userId is taken from the session, never the request body.
const updateSettingsSchema = insertUserSettingsSchema.partial().omit({ userId: true });

// Return the user's settings row, creating a default one if none exists yet.
async function ensureSettings(userId: string) {
  const existing = await storage.getUserSettings(userId);
  if (existing) return existing;
  return storage.createUserSettings({ userId });
}

// GET /api/settings
router.get("/settings", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const settings = await ensureSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// PATCH /api/settings
router.patch("/settings", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    await ensureSettings(userId);
    const updated = await storage.updateUserSettings(userId, parsed.data);
    res.json(updated);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export const settingsRoutes = router;
