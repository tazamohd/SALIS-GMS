/**
 * Google My Business live-sync routes (key-deferred).
 *
 * Local GMB CRUD (/api/gmb/profiles|posts|reviews) lives in the monolith and is
 * always available. These endpoints add the live pull-down from the Google
 * Business Profile API, which no-ops with { configured: false } until
 * GOOGLE_GMB_* credentials are supplied.
 *
 *   GET  /api/gmb/sync/status            — is live sync configured + per-profile last sync
 *   POST /api/gmb/sync                    — sync reviews for all active profiles in the garage
 *   POST /api/gmb/sync/:profileId         — sync a single profile (tenant-scoped)
 *
 * All routes are tenant-scoped to the caller's garage.
 */
import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import { googleBusinessProfiles } from "@shared/schema";
import { logger } from "../logger";
import { isGmbConfigured, syncProfileReviews, type GmbSyncResult } from "../services/gmb-sync";

const router = Router();

// GET /api/gmb/sync/status — whether live sync is configured + per-profile last sync.
router.get("/gmb/sync/status", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(403).json({ message: "No garage associated with user" });

    const profiles = await db
      .select({
        id: googleBusinessProfiles.id,
        businessName: googleBusinessProfiles.businessName,
        isActive: googleBusinessProfiles.isActive,
        lastSyncedAt: googleBusinessProfiles.lastSyncedAt,
      })
      .from(googleBusinessProfiles)
      .where(eq(googleBusinessProfiles.garageId, garageId));

    res.json({ configured: isGmbConfigured(), profiles });
  } catch (error: any) {
    logger.error("gmb sync status failed", { error: String(error) });
    res.status(500).json({ message: "Failed to get GMB sync status" });
  }
});

// POST /api/gmb/sync — sync reviews for every active profile in the garage.
router.post("/gmb/sync", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(403).json({ message: "No garage associated with user" });

    if (!isGmbConfigured()) {
      return res.json({
        configured: false,
        synced: [],
        message: "GMB live sync not configured — set GOOGLE_GMB_* credentials to enable.",
      });
    }

    const profiles = await db
      .select()
      .from(googleBusinessProfiles)
      .where(
        and(
          eq(googleBusinessProfiles.garageId, garageId),
          eq(googleBusinessProfiles.isActive, true),
        ),
      );

    const synced: GmbSyncResult[] = [];
    for (const p of profiles) {
      try {
        synced.push(
          await syncProfileReviews({ id: p.id, accountId: p.accountId, locationId: p.locationId }),
        );
      } catch (e: any) {
        synced.push({ configured: true, profileId: p.id, error: String(e) });
      }
    }

    res.json({ configured: true, synced });
  } catch (error: any) {
    logger.error("gmb sync failed", { error: String(error) });
    res.status(500).json({ message: "Failed to sync GMB" });
  }
});

// POST /api/gmb/sync/:profileId — sync a single profile, scoped to the garage.
router.post("/gmb/sync/:profileId", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(403).json({ message: "No garage associated with user" });

    const [profile] = await db
      .select()
      .from(googleBusinessProfiles)
      .where(
        and(
          eq(googleBusinessProfiles.id, req.params.profileId),
          eq(googleBusinessProfiles.garageId, garageId),
        ),
      )
      .limit(1);

    if (!profile) return res.status(404).json({ message: "GMB profile not found" });

    const result = await syncProfileReviews({
      id: profile.id,
      accountId: profile.accountId,
      locationId: profile.locationId,
    });
    res.json(result);
  } catch (error: any) {
    logger.error("gmb single sync failed", { error: String(error) });
    res.status(500).json({ message: "Failed to sync GMB profile" });
  }
});

export default router;
