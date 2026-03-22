import { Router, Request, Response } from "express";
import { db } from "../db";
import { featureFlags } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// List all flags for the authenticated user's garage
router.get("/feature-flags", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const garageId = (req.user as any).garageId;
    const flags = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.garageId, garageId));
    res.json(flags);
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    res.status(500).json({ message: "Failed to fetch feature flags" });
  }
});

// Get a single flag by ID
router.get("/feature-flags/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const garageId = (req.user as any).garageId;
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(
        and(
          eq(featureFlags.id, req.params.id),
          eq(featureFlags.garageId, garageId)
        )
      );
    if (!flag) {
      return res.status(404).json({ message: "Feature flag not found" });
    }
    res.json(flag);
  } catch (error) {
    console.error("Error fetching feature flag:", error);
    res.status(500).json({ message: "Failed to fetch feature flag" });
  }
});

// Create a new feature flag
router.post("/feature-flags", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const garageId = (req.user as any).garageId;
    const { flagName, isEnabled, source } = req.body;
    if (!flagName) {
      return res.status(400).json({ message: "flagName is required" });
    }
    const [flag] = await db
      .insert(featureFlags)
      .values({
        garageId,
        flagName,
        isEnabled: isEnabled ?? false,
        source: source ?? null,
      })
      .returning();
    res.status(201).json(flag);
  } catch (error) {
    console.error("Error creating feature flag:", error);
    res.status(500).json({ message: "Failed to create feature flag" });
  }
});

// Update a feature flag
router.patch("/feature-flags/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const garageId = (req.user as any).garageId;
    const { isEnabled } = req.body;
    const [flag] = await db
      .update(featureFlags)
      .set({ isEnabled })
      .where(
        and(
          eq(featureFlags.id, req.params.id),
          eq(featureFlags.garageId, garageId)
        )
      )
      .returning();
    if (!flag) {
      return res.status(404).json({ message: "Feature flag not found" });
    }
    res.json(flag);
  } catch (error) {
    console.error("Error updating feature flag:", error);
    res.status(500).json({ message: "Failed to update feature flag" });
  }
});

// Delete a feature flag
router.delete("/feature-flags/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const garageId = (req.user as any).garageId;
    const [flag] = await db
      .delete(featureFlags)
      .where(
        and(
          eq(featureFlags.id, req.params.id),
          eq(featureFlags.garageId, garageId)
        )
      )
      .returning();
    if (!flag) {
      return res.status(404).json({ message: "Feature flag not found" });
    }
    res.json({ message: "Feature flag deleted", flag });
  } catch (error) {
    console.error("Error deleting feature flag:", error);
    res.status(500).json({ message: "Failed to delete feature flag" });
  }
});

export default router;
