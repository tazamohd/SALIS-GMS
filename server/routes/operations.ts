// @ts-nocheck
/**
 * SALIS AUTO — Miscellaneous Operations Routes
 *
 * Extracted from the monolith (server/routes.ts).
 * Covers: marketplace, social, signage, LPR, safety, history,
 * garages, tools, tool-availability, tool-usage, technician-performance,
 * vehicle-tracking, reorder-settings, replenishment-orders,
 * inventory-transfers, towing-jobs, backups (plural), safety-incidents stubs.
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';

// Phase service imports (namespace re-exports from the monolith)
import * as phase3Service from '../phase3-integrations-service';
import * as phase6Service from '../phase6-compliance-service';
import * as phase7Service from '../phase7-hardware-service';

// Schema import for towing-jobs validation
import { insertTowingJobSchema } from '@shared/schema';

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
// Zod schemas (copied from monolith — local to this module)
// ---------------------------------------------------------------------------
const safetyIncidentSchema = z.object({
  incidentDate: z.string(),
  incidentType: z.enum(['injury', 'near-miss', 'property-damage', 'equipment-failure', 'spill']),
  severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
  location: z.string(),
  description: z.string(),
  injuredPerson: z.string().optional(),
  witnessNames: z.array(z.string()).optional(),
  reportedBy: z.string(),
  immediateAction: z.string(),
  photos: z.array(z.string()).optional(),
});

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

// =========================================================================
// GARAGE MANAGEMENT  (3 routes)
// =========================================================================

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

// =========================================================================
// TOOL MANAGEMENT  (5 routes)
// =========================================================================

router.get('/tools', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, is_global } = req.query;
    const tools = await storage.getTools(
      garage_id as string,
      is_global === 'true'
    );
    res.json(tools);
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ message: "Failed to fetch tools" });
  }
});

router.get('/tools/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await storage.getTool(id);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }
    res.json(tool);
  } catch (error) {
    console.error("Error fetching tool:", error);
    res.status(500).json({ message: "Failed to fetch tool" });
  }
});

router.post('/tools', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const toolData = {
      ...req.body,
      createdBy: userId,
    };
    const tool = await storage.createTool(toolData);
    res.status(201).json(tool);
  } catch (error) {
    console.error("Error creating tool:", error);
    res.status(500).json({ message: "Failed to create tool" });
  }
});

router.put('/tools/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTool = await storage.updateTool(id, req.body);
    res.json(updatedTool);
  } catch (error) {
    console.error("Error updating tool:", error);
    res.status(500).json({ message: "Failed to update tool" });
  }
});

router.get('/tools/:toolId/usage', isAuthenticated, async (req, res) => {
  try {
    const { toolId } = req.params;
    const usageLogs = await storage.getToolUsageLogs(toolId);
    res.json(usageLogs);
  } catch (error) {
    console.error("Error fetching tool usage logs:", error);
    res.status(500).json({ message: "Failed to fetch tool usage logs" });
  }
});

// =========================================================================
// TOOL USAGE  (2 routes)
// =========================================================================

router.post('/tool-usage', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const usageData = {
      ...req.body,
      userId,
    };
    const usageLog = await storage.createToolUsageLog(usageData);
    res.status(201).json(usageLog);
  } catch (error) {
    console.error("Error creating tool usage log:", error);
    res.status(500).json({ message: "Failed to create tool usage log" });
  }
});

router.put('/tool-usage/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUsageLog = await storage.updateToolUsageLog(id, req.body);
    res.json(updatedUsageLog);
  } catch (error) {
    console.error("Error updating tool usage log:", error);
    res.status(500).json({ message: "Failed to update tool usage log" });
  }
});

// =========================================================================
// TOOL AVAILABILITY  (3 routes)
// =========================================================================

router.get('/tool-availability', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, tool_id } = req.query;
    if (!garage_id) {
      return res.status(400).json({ message: "garage_id is required" });
    }
    const availability = await storage.getToolAvailability(
      garage_id as string,
      tool_id as string
    );
    res.json(availability);
  } catch (error) {
    console.error("Error fetching tool availability:", error);
    res.status(500).json({ message: "Failed to fetch tool availability" });
  }
});

router.post('/tool-availability', isAuthenticated, async (req, res) => {
  try {
    const availability = await storage.createToolAvailability(req.body);
    res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating tool availability:", error);
    res.status(500).json({ message: "Failed to create tool availability" });
  }
});

router.put('/tool-availability/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAvailability = await storage.updateToolAvailability(id, req.body);
    res.json(updatedAvailability);
  } catch (error) {
    console.error("Error updating tool availability:", error);
    res.status(500).json({ message: "Failed to update tool availability" });
  }
});

// =========================================================================
// REORDER SETTINGS  (4 routes)
// =========================================================================

router.get('/reorder-settings', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, sparePartId } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const settings = await storage.getReorderSettings(garageId as string, sparePartId as string);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching reorder settings:", error);
    res.status(500).json({ message: "Failed to fetch reorder settings" });
  }
});

router.post('/reorder-settings', isAuthenticated, async (req: any, res) => {
  try {
    const setting = await storage.createReorderSetting(req.body);
    res.status(201).json(setting);
  } catch (error) {
    console.error("Error creating reorder setting:", error);
    res.status(500).json({ message: "Failed to create reorder setting" });
  }
});

router.patch('/reorder-settings/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const setting = await storage.updateReorderSetting(id, req.body);
    res.json(setting);
  } catch (error) {
    console.error("Error updating reorder setting:", error);
    res.status(500).json({ message: "Failed to update reorder setting" });
  }
});

router.post('/reorder-settings/process', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.body;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const reorders = await storage.processAutoReorders(garageId);
    res.json({ reorders, count: reorders.length });
  } catch (error) {
    console.error("Error processing auto reorders:", error);
    res.status(500).json({ message: "Failed to process auto reorders" });
  }
});

// =========================================================================
// INVENTORY TRANSFERS  (6 routes)
// =========================================================================

router.get('/inventory-transfers', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, status } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const transfers = await storage.getInventoryTransfers(garageId as string, status as string);
    res.json(transfers);
  } catch (error) {
    console.error("Error fetching inventory transfers:", error);
    res.status(500).json({ message: "Failed to fetch inventory transfers" });
  }
});

router.get('/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const transfer = await storage.getInventoryTransfer(id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }
    res.json(transfer);
  } catch (error) {
    console.error("Error fetching inventory transfer:", error);
    res.status(500).json({ message: "Failed to fetch inventory transfer" });
  }
});

router.post('/inventory-transfers', isAuthenticated, async (req: any, res) => {
  try {
    const transfer = await storage.createInventoryTransfer(req.body);
    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error creating inventory transfer:", error);
    res.status(500).json({ message: "Failed to create inventory transfer" });
  }
});

router.patch('/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const transfer = await storage.updateInventoryTransfer(id, req.body);
    res.json(transfer);
  } catch (error) {
    console.error("Error updating inventory transfer:", error);
    res.status(500).json({ message: "Failed to update inventory transfer" });
  }
});

router.post('/inventory-transfers/:id/approve', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';
    const transfer = await storage.approveInventoryTransfer(id, userId);
    res.json(transfer);
  } catch (error) {
    console.error("Error approving inventory transfer:", error);
    res.status(500).json({ message: "Failed to approve inventory transfer" });
  }
});

router.post('/inventory-transfers/:id/complete', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';
    const transfer = await storage.completeInventoryTransfer(id, userId);
    res.json(transfer);
  } catch (error) {
    console.error("Error completing inventory transfer:", error);
    res.status(500).json({ message: "Failed to complete inventory transfer" });
  }
});

// =========================================================================
// SOCIAL MEDIA INTEGRATION  (3 routes)
// =========================================================================

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

// =========================================================================
// PARTS MARKETPLACE  (4 routes)
// =========================================================================

router.get('/marketplace/search', isAuthenticated, async (req: any, res) => {
  try {
    const { partNumber, marketplace } = req.query;
    const results = await phase3Service.searchMarketplaceParts(
      partNumber as string,
      marketplace as 'ebay' | 'amazon'
    );
    res.json(results);
  } catch (error: any) {
    console.error("Error searching marketplace:", error);
    res.status(500).json({ message: error.message || "Failed to search marketplace" });
  }
});

router.post('/marketplace/orders', isAuthenticated, async (req: any, res) => {
  try {
    const orderData = {
      ...req.body,
      garageId: req.user?.garageId
    };
    const order = await phase3Service.placeMarketplaceOrder(orderData);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Error placing marketplace order:", error);
    res.status(500).json({ message: error.message || "Failed to place order" });
  }
});

router.get('/marketplace/orders/:id/track', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const tracking = await phase3Service.trackMarketplaceOrder(id);
    res.json(tracking);
  } catch (error: any) {
    console.error("Error tracking order:", error);
    res.status(500).json({ message: error.message || "Failed to track order" });
  }
});

router.get('/marketplace/orders', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    res.json([]);
  } catch (error) {
    console.error("Error fetching marketplace orders:", error);
    res.status(500).json({ message: "Failed to fetch marketplace orders" });
  }
});

// =========================================================================
// ACTION HISTORY  (3 routes)
// =========================================================================

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

// =========================================================================
// SAFETY INCIDENTS (stub routes)  (2 routes)
// =========================================================================

router.get('/safety-incidents', isAuthenticated, async (req, res) => {
  res.json([
    { id: "SI-2024-001", date: "2024-10-25", type: "injury", severity: "minor", description: "Minor cut on hand" },
  ]);
});

router.post('/safety-incidents', isAuthenticated, async (req, res) => {
  res.status(201).json({ id: "SI-NEW", ...req.body });
});

// =========================================================================
// SAFETY (Phase 6 — compliance service)  (3 routes)
// =========================================================================

router.post('/safety/incidents', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = safetyIncidentSchema.parse(req.body);

    const incidentData = {
      garageId,
      incidentDate: new Date(validated.incidentDate),
      incidentType: validated.incidentType,
      severity: validated.severity,
      location: validated.location,
      description: validated.description,
      injuredPerson: validated.injuredPerson,
      witnessNames: validated.witnessNames,
      reportedBy: validated.reportedBy,
      immediateAction: validated.immediateAction,
      photos: validated.photos,
    };
    const incident = await phase6Service.createSafetyIncident(incidentData);
    res.status(201).json(incident);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating safety incident:", error);
    res.status(500).json({ message: "Failed to create safety incident" });
  }
});

router.get('/safety/incidents', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { status } = req.query;
    const incidents = await phase6Service.getSafetyIncidents(garageId, status as string);
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching safety incidents:", error);
    res.status(500).json({ message: "Failed to fetch safety incidents" });
  }
});

router.get('/safety/analytics', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { startDate, endDate } = req.query;
    const analytics = await phase6Service.getSafetyAnalytics(
      garageId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching safety analytics:", error);
    res.status(500).json({ message: "Failed to fetch safety analytics" });
  }
});

// =========================================================================
// DIGITAL SIGNAGE (Phase 7 — read + create)  (5 routes)
// =========================================================================

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

// =========================================================================
// LICENSE PLATE RECOGNITION  (3 routes)
// =========================================================================

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

// =========================================================================
// TOWING JOBS  (3 routes — distinct from /api/towing-requests)
// =========================================================================

router.get('/towing-jobs', isAuthenticated, async (req: any, res) => {
  try {
    const jobs = await storage.getTowingJobs(req.user?.garageId, req.query.status);
    res.json({ data: jobs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/towing-jobs', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertTowingJobSchema.parse(req.body);
    const job = await storage.createTowingJob(validatedData);
    res.json({ data: job });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.patch('/towing-jobs/:id', isAuthenticated, async (req, res) => {
  try {
    const job = await storage.updateTowingJob(req.params.id, req.body);
    res.json({ data: job });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// TECHNICIAN PERFORMANCE  (4 routes)
// =========================================================================

router.get('/technician-performance/metrics', isAuthenticated, async (req: any, res) => {
  try {
    const metrics = await storage.getTechnicianMetricDefinitions();
    res.json(metrics);
  } catch (error: any) {
    console.error("Error fetching metric definitions:", error);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

router.get('/technician-performance/preferences', isAuthenticated, async (req: any, res) => {
  try {
    const preferences = await storage.getTechnicianMetricPreferences(req.user?.id);
    res.json(preferences);
  } catch (error: any) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
});

router.post('/technician-performance/preferences', isAuthenticated, async (req: any, res) => {
  try {
    const preference = await storage.upsertTechnicianMetricPreference({
      userId: req.user?.id,
      ...req.body,
    });
    res.json(preference);
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

router.get('/technician-performance/dashboard', isAuthenticated, async (req: any, res) => {
  try {
    const { technicianId, period = 'weekly' } = req.query;
    const targetTechnicianId = technicianId || req.user?.id;

    // Get rollup data
    const rollups = await storage.getTechnicianPerformanceRollups(
      targetTechnicianId as string,
      period as string
    );

    res.json(rollups);
  } catch (error: any) {
    console.error("Error fetching performance dashboard:", error);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

// =========================================================================
// ENHANCED BACKUP & RESTORE (plural /backups)  (7 routes)
// =========================================================================

router.get('/backups/stats', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId || 'default-garage';
    const stats = await storage.getBackupJobStats(garageId);
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching backup stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.get('/backups/latest', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId || 'default-garage';
    const backup = await storage.getLatestBackupJob(garageId);
    res.json(backup || null);
  } catch (error: any) {
    console.error("Error fetching latest backup:", error);
    res.status(500).json({ message: "Failed to fetch latest backup" });
  }
});

router.get('/backups', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId || 'default-garage';
    const { status } = req.query;
    const backups = await storage.getBackupJobs(garageId, status as string);
    res.json(backups);
  } catch (error: any) {
    console.error("Error fetching backups:", error);
    res.status(500).json({ message: "Failed to fetch backups" });
  }
});

router.post('/backups', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId || 'default-garage';
    const backup = await storage.createBackupJob({
      garageId,
      jobType: req.body.jobType || 'full',
      status: 'pending',
      dataTypes: req.body.dataTypes || ['all'],
      createdBy: req.user?.id,
      startedAt: new Date(),
    });

    // Simulate backup processing
    setTimeout(async () => {
      try {
        const fileSize = Math.floor(Math.random() * 50000000) + 10000000;
        const fileName = `backup_${garageId}_${Date.now()}.zip`;
        await storage.updateBackupJob(backup.id, {
          status: 'completed',
          completedAt: new Date(),
          fileSize,
          fileName,
        });
      } catch (e) {
        await storage.updateBackupJob(backup.id, {
          status: 'failed',
          errorMessage: (e as Error).message,
        });
      }
    }, 3000);

    res.json(backup);
  } catch (error: any) {
    console.error("Error creating backup:", error);
    res.status(500).json({ message: "Failed to create backup" });
  }
});

router.get('/backups/:id', isAuthenticated, async (req: any, res) => {
  try {
    const backup = await storage.getBackupJob(req.params.id);
    if (!backup) {
      return res.status(404).json({ message: "Backup not found" });
    }
    res.json(backup);
  } catch (error: any) {
    console.error("Error fetching backup:", error);
    res.status(500).json({ message: "Failed to fetch backup" });
  }
});

router.delete('/backups/:id', isAuthenticated, async (req: any, res) => {
  try {
    await storage.deleteBackupJob(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting backup:", error);
    res.status(500).json({ message: "Failed to delete backup" });
  }
});

router.post('/backups/:id/restore', isAuthenticated, async (req: any, res) => {
  try {
    const backup = await storage.getBackupJob(req.params.id);
    if (!backup) {
      return res.status(404).json({ message: "Backup not found" });
    }
    if (backup.status !== 'completed') {
      return res.status(400).json({ message: "Backup is not completed" });
    }

    // Create restore job
    const garageId = req.user?.garageId || 'default-garage';
    const restoreJob = await storage.createBackupJob({
      garageId,
      jobType: 'restore',
      status: 'in_progress',
      dataTypes: backup.dataTypes,
      createdBy: req.user?.id,
      startedAt: new Date(),
    });

    // Simulate restore processing
    setTimeout(async () => {
      try {
        await storage.updateBackupJob(restoreJob.id, {
          status: 'completed',
          completedAt: new Date(),
        });
      } catch (e) {
        await storage.updateBackupJob(restoreJob.id, {
          status: 'failed',
          errorMessage: (e as Error).message,
        });
      }
    }, 5000);

    res.json(restoreJob);
  } catch (error: any) {
    console.error("Error restoring backup:", error);
    res.status(500).json({ message: "Failed to restore backup" });
  }
});

// =========================================================================
// REPLENISHMENT ORDERS  (5 routes)
// =========================================================================

router.get('/replenishment-orders', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, status } = req.query;
    const orders = await storage.getReplenishmentOrders(garageId as string, status as string);
    res.json(orders);
  } catch (error: any) {
    console.error("Error fetching replenishment orders:", error);
    res.status(500).json({ message: "Failed to fetch replenishment orders" });
  }
});

router.get('/replenishment-orders/:id', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.getReplenishmentOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error: any) {
    console.error("Error fetching replenishment order:", error);
    res.status(500).json({ message: "Failed to fetch replenishment order" });
  }
});

router.post('/replenishment-orders', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.createReplenishmentOrder(req.body);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Error creating replenishment order:", error);
    res.status(500).json({ message: "Failed to create replenishment order" });
  }
});

router.patch('/replenishment-orders/:id', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.updateReplenishmentOrder(req.params.id, req.body);
    res.json(order);
  } catch (error: any) {
    console.error("Error updating replenishment order:", error);
    res.status(500).json({ message: "Failed to update replenishment order" });
  }
});

router.post('/replenishment-orders/:id/approve', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.approveReplenishmentOrder(req.params.id, req.user?.id || 'system');
    res.json(order);
  } catch (error: any) {
    console.error("Error approving replenishment order:", error);
    res.status(500).json({ message: "Failed to approve replenishment order" });
  }
});

// =========================================================================
// VEHICLE TRACKING  (4 routes)
// =========================================================================

router.get('/vehicle-tracking', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const data = await storage.getVehicleTrackingData(garageId);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching vehicle tracking data:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/vehicle-tracking/:vehicleId', isAuthenticated, async (req, res) => {
  try {
    const data = await storage.getVehicleTrackingByVehicleId(req.params.vehicleId);
    if (!data) {
      return res.status(404).json({ message: "No tracking data found for this vehicle" });
    }
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching vehicle tracking:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/vehicle-tracking', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { vehicleId, latitude, longitude, speed, heading, engineStatus, fuelLevel, odometer, isMoving, deviceId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: "Vehicle ID is required" });
    }

    const data = await storage.upsertVehicleTracking(vehicleId, {
      garageId,
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
      engineStatus,
      fuelLevel,
      odometer,
      isMoving,
      deviceId,
    });

    await storage.createVehicleTrackingHistory({
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
      engineStatus,
      odometer,
      eventType: isMoving ? 'moving' : 'stationary',
    });

    res.json(data);
  } catch (error: any) {
    console.error("Error updating vehicle tracking:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/vehicle-tracking/:vehicleId/history', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = await storage.getVehicleTrackingHistory(req.params.vehicleId, limit);
    res.json(history);
  } catch (error: any) {
    console.error("Error fetching tracking history:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
