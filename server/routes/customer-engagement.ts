// @ts-nocheck
/**
 * SALIS AUTO — Customer Engagement Routes
 *
 * Extracted from the monolith (server/routes.ts).
 * Covers: history (undo/redo), garages, social media, digital signage, LPR.
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';
import * as phase3Service from '../phase3-integrations-service';
import * as phase7Service from '../phase7-hardware-service';

const router = Router();

// ---------------------------------------------------------------------------
// Helper — sanitise Zod errors for production responses
// ---------------------------------------------------------------------------
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

// ---------------------------------------------------------------------------
// Validation schemas (extracted from routes.ts inline definitions)
// ---------------------------------------------------------------------------
const signageDisplaySchema = z.object({
  displayName: z.string(),
  location: z.string(),
  resolution: z.string(),
  orientation: z.enum(['landscape', 'portrait']),
});

const signageContentSchema = z.object({
  displayId: z.string(),
  contentType: z.enum(['image', 'video', 'slideshow', 'html']),
  contentUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

const licensePlateScanSchema = z.object({
  plateNumber: z.string(),
  confidence: z.number().min(0).max(100),
  vehicleId: z.string().optional(),
  customerId: z.string().optional(),
  cameraId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  scanType: z.enum(['entry', 'exit']),
  location: z.string().optional(),
  matchedAutomatically: z.boolean().optional(),
});

// ==========================================
// HISTORY (UNDO/REDO) ROUTES — 3 routes
// ==========================================

router.get('/history', isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { limit } = req.query;

    const history = await storage.getActionHistory(
      userGarageId,
      userId,
      limit ? parseInt(limit as string) : 50
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching action history:", error);
    res.status(500).json({ message: "Failed to fetch action history" });
  }
});

router.post('/history/undo/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const history = await storage.undoAction(id);
    res.json(history);
  } catch (error) {
    console.error("Error undoing action:", error);
    res.status(500).json({ message: "Failed to undo action" });
  }
});

router.post('/history/redo/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const history = await storage.redoAction(id);
    res.json(history);
  } catch (error) {
    console.error("Error redoing action:", error);
    res.status(500).json({ message: "Failed to redo action" });
  }
});

// ==========================================
// GARAGES ROUTES — 3 routes
// ==========================================

router.get('/garages', isAuthenticated, async (req, res) => {
  try {
    const garages = await storage.getGarages();
    res.json(garages);
  } catch (error) {
    console.error("Error fetching garages:", error);
    res.status(500).json({ message: "Failed to fetch garages" });
  }
});

router.get('/garages/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const garage = await storage.getGarageById(id);
    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }
    res.json(garage);
  } catch (error) {
    console.error("Error fetching garage:", error);
    res.status(500).json({ message: "Failed to fetch garage" });
  }
});

router.get('/garages/:id/branches', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const branches = await storage.getBranchesByGarageId(id);
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
});

// ==========================================
// SOCIAL MEDIA ROUTES — 3 routes
// ==========================================

router.post('/social/posts', isAuthenticated, async (req: any, res) => {
  try {
    const { platforms, content, mediaUrls, scheduledFor } = req.body;
    const posts = await phase3Service.postToSocialMedia({
      garageId: req.user?.garageId,
      platforms,
      content,
      mediaUrls,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    });
    res.status(201).json(posts);
  } catch (error: any) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: error.message || "Failed to create post" });
  }
});

router.get('/social/reviews', isAuthenticated, async (req: any, res) => {
  try {
    const reviews = await phase3Service.fetchSocialMediaReviews(req.user?.garageId);
    res.json(reviews);
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: error.message || "Failed to fetch reviews" });
  }
});

router.post('/social/reviews/:id/respond', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const result = await phase3Service.respondToReview(id, response, req.user?.id);
    res.json(result);
  } catch (error: any) {
    console.error("Error responding to review:", error);
    res.status(500).json({ message: error.message || "Failed to respond to review" });
  }
});

// ==========================================
// DIGITAL SIGNAGE ROUTES — 5 routes
// ==========================================

router.get('/signage/displays', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const displays = await phase7Service.getSignageDisplays(garageId);
    res.json(displays);
  } catch (error) {
    console.error("Error fetching signage displays:", error);
    res.status(500).json({ message: "Failed to fetch signage displays" });
  }
});

router.get('/signage/content', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const displays = await phase7Service.getSignageDisplays(garageId);

    // Fetch content for all displays
    const allContent = [];
    for (const display of displays) {
      const content = await phase7Service.getActiveContentForDisplay(display.id);
      allContent.push(...content.map((c: any) => ({ ...c, displayName: display.displayName })));
    }

    res.json(allContent);
  } catch (error) {
    console.error("Error fetching signage content:", error);
    res.status(500).json({ message: "Failed to fetch signage content" });
  }
});

router.post('/signage/displays', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = signageDisplaySchema.parse(req.body);

    const displayData = {
      garageId,
      displayName: validated.displayName,
      location: validated.location,
      resolution: validated.resolution,
      orientation: validated.orientation,
    };
    const display = await phase7Service.createSignageDisplay(displayData);
    res.status(201).json(display);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating signage display:", error);
    res.status(500).json({ message: "Failed to create signage display" });
  }
});

router.post('/signage/content', isAuthenticated, async (req, res) => {
  try {
    const validated = signageContentSchema.parse(req.body);

    const contentData = {
      displayId: validated.displayId,
      contentType: validated.contentType,
      contentUrl: validated.contentUrl,
      title: validated.title,
      description: validated.description,
      duration: validated.duration,
      validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
      validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
      priority: validated.priority,
    };
    const content = await phase7Service.createSignageContent(contentData);
    res.status(201).json(content);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating signage content:", error);
    res.status(500).json({ message: "Failed to create signage content" });
  }
});

router.get('/signage/displays/:displayId/active-content', isAuthenticated, async (req, res) => {
  try {
    const { displayId } = req.params;
    const content = await phase7Service.getActiveContentForDisplay(displayId);
    res.json(content);
  } catch (error) {
    console.error("Error fetching active content:", error);
    res.status(500).json({ message: "Failed to fetch active content" });
  }
});

// ==========================================
// LICENSE PLATE RECOGNITION (LPR) ROUTES — 3 routes
// ==========================================

router.post('/lpr/scan', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = licensePlateScanSchema.parse(req.body);

    const scanData = {
      garageId,
      plateNumber: validated.plateNumber,
      confidence: validated.confidence,
      vehicleId: validated.vehicleId,
      customerId: validated.customerId,
      cameraId: validated.cameraId,
      imageUrl: validated.imageUrl,
      scanType: validated.scanType,
      location: validated.location,
      matchedAutomatically: validated.matchedAutomatically,
    };
    const scan = await phase7Service.recordLicensePlateScan(scanData);
    res.status(201).json(scan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error recording license plate scan:", error);
    res.status(500).json({ message: "Failed to record license plate scan" });
  }
});

router.get('/lpr/scans', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const scans = await phase7Service.getLicensePlateScans(garageId, limit ? parseInt(limit) : 100);
    res.json(scans);
  } catch (error) {
    console.error("Error fetching license plate scans:", error);
    res.status(500).json({ message: "Failed to fetch license plate scans" });
  }
});

router.get('/lpr/entry-logs', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { status } = req.query;
    const logs = await phase7Service.getVehicleEntryLogs(garageId, status as string);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching entry logs:", error);
    res.status(500).json({ message: "Failed to fetch entry logs" });
  }
});

export default router;
