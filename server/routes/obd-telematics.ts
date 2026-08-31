// @ts-nocheck
/**
 * OBD & Telematics — modular router extracted from the monolith (routes.ts).
 *
 * Covers:
 *   - OBD Devices          CRUD   /obd-devices
 *   - Device Assignments    CRUD   /device-assignments
 *   - OBD Sessions          CRUD   /obd-sessions
 *   - Diagnostic Reports    CRUD   /diagnostic-reports, /obd-sessions/:sessionId/diagnostic-reports
 *   - Telematics Feeds      GET/POST /telematics/feeds
 *   - Telematics Alerts     GET/POST /telematics/alerts, PATCH /telematics/alerts/:id/resolve
 *   - Telematics Device     GET /telematics/device/:vehicleId
 *   - Telematics Readings   GET /telematics/readings/:vehicleId
 *
 * NOT covered (already in obd-diagnostics.ts):
 *   - GET  /diagnostics/obd/:vehicleId
 *   - POST /diagnostics/obd/:vehicleId
 */
import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import {
  insertObdDeviceSchema,
  insertDeviceAssignmentSchema,
  insertObdSessionSchema,
  insertDiagnosticReportSchema,
  insertTelematicsFeedSchema,
  insertTelematicsAlertSchema,
} from "../../shared/schema";

const router = Router();

// Helper function to sanitize Zod validation errors
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// ========================================================================
// OBD Devices
// ========================================================================

router.post("/obd-devices", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertObdDeviceSchema.parse(req.body);
    const device = await storage.createObdDevice(validatedData);
    res.status(201).json(device);
  } catch (error: any) {
    console.error("Error creating OBD device:", error);
    res.status(400).json({ error: error.message || "Failed to create OBD device" });
  }
});

router.get("/obd-devices", isAuthenticated, async (req, res) => {
  try {
    const { branchId } = req.query;
    const devices = await storage.getObdDevices(branchId as string | undefined);
    res.json(devices);
  } catch (error) {
    console.error("Error fetching OBD devices:", error);
    res.status(500).json({ error: "Failed to fetch OBD devices" });
  }
});

router.get("/obd-devices/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const device = await storage.getObdDeviceById(id);
    if (!device) {
      return res.status(404).json({ error: "OBD device not found" });
    }
    res.json(device);
  } catch (error) {
    console.error("Error fetching OBD device:", error);
    res.status(500).json({ error: "Failed to fetch OBD device" });
  }
});

router.patch("/obd-devices/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateObdDevice(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating OBD device:", error);
    res.status(400).json({ error: error.message || "Failed to update OBD device" });
  }
});

router.delete("/obd-devices/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteObdDevice(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting OBD device:", error);
    res.status(500).json({ error: "Failed to delete OBD device" });
  }
});

// ========================================================================
// Device Assignments
// ========================================================================

router.post("/device-assignments", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertDeviceAssignmentSchema.parse(req.body);
    const assignment = await storage.createDeviceAssignment(validatedData);
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error("Error creating device assignment:", error);
    res.status(400).json({ error: error.message || "Failed to create device assignment" });
  }
});

router.get("/device-assignments", isAuthenticated, async (req, res) => {
  try {
    const { deviceId, technicianId } = req.query;
    const assignments = await storage.getDeviceAssignments(
      deviceId as string | undefined,
      technicianId as string | undefined
    );
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching device assignments:", error);
    res.status(500).json({ error: "Failed to fetch device assignments" });
  }
});

router.get("/device-assignments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await storage.getDeviceAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({ error: "Device assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    console.error("Error fetching device assignment:", error);
    res.status(500).json({ error: "Failed to fetch device assignment" });
  }
});

router.patch("/device-assignments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateDeviceAssignment(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating device assignment:", error);
    res.status(400).json({ error: error.message || "Failed to update device assignment" });
  }
});

// ========================================================================
// OBD Sessions
// ========================================================================

router.post("/obd-sessions", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertObdSessionSchema.parse(req.body);
    const session = await storage.createObdSession(validatedData);
    res.status(201).json(session);
  } catch (error: any) {
    console.error("Error creating OBD session:", error);
    res.status(400).json({ error: error.message || "Failed to create OBD session" });
  }
});

router.get("/obd-sessions", isAuthenticated, async (req, res) => {
  try {
    const { deviceId, vehicleId, status } = req.query;
    const sessions = await storage.getObdSessions({
      deviceId: deviceId as string | undefined,
      vehicleId: vehicleId as string | undefined,
      status: status as string | undefined
    });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching OBD sessions:", error);
    res.status(500).json({ error: "Failed to fetch OBD sessions" });
  }
});

router.get("/obd-sessions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const session = await storage.getObdSessionById(id);
    if (!session) {
      return res.status(404).json({ error: "OBD session not found" });
    }
    res.json(session);
  } catch (error) {
    console.error("Error fetching OBD session:", error);
    res.status(500).json({ error: "Failed to fetch OBD session" });
  }
});

router.patch("/obd-sessions/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateObdSession(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating OBD session:", error);
    res.status(400).json({ error: error.message || "Failed to update OBD session" });
  }
});

// ========================================================================
// Diagnostic Reports
// ========================================================================

router.post("/diagnostic-reports", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertDiagnosticReportSchema.parse(req.body);
    const report = await storage.createDiagnosticReport(validatedData);
    res.status(201).json(report);
  } catch (error: any) {
    console.error("Error creating diagnostic report:", error);
    res.status(400).json({ error: error.message || "Failed to create diagnostic report" });
  }
});

router.get("/obd-sessions/:sessionId/diagnostic-reports", isAuthenticated, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const reports = await storage.getDiagnosticReports(sessionId);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching diagnostic reports:", error);
    res.status(500).json({ error: "Failed to fetch diagnostic reports" });
  }
});

router.get("/diagnostic-reports/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await storage.getDiagnosticReportById(id);
    if (!report) {
      return res.status(404).json({ error: "Diagnostic report not found" });
    }
    res.json(report);
  } catch (error) {
    console.error("Error fetching diagnostic report:", error);
    res.status(500).json({ error: "Failed to fetch diagnostic report" });
  }
});

// ========================================================================
// Telematics Integration
// ========================================================================

router.get('/telematics/feeds', isAuthenticated, async (req, res) => {
  try {
    const feeds = await storage.getTelematicsFeeds(req.query.vehicleId as string, req.query.deviceId as string);
    res.json({ data: feeds });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/telematics/feeds', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertTelematicsFeedSchema.parse(req.body);
    const feed = await storage.createTelematicsFeed(validatedData);
    res.json({ data: feed });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/telematics/alerts', isAuthenticated, async (req, res) => {
  try {
    const alerts = await storage.getTelematicsAlerts(req.query.vehicleId as string, req.query.isResolved === 'true');
    res.json({ data: alerts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/telematics/alerts', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertTelematicsAlertSchema.parse(req.body);
    const alert = await storage.createTelematicsAlert(validatedData);
    res.json({ data: alert });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.patch('/telematics/alerts/:id/resolve', isAuthenticated, async (req: any, res) => {
  try {
    const alert = await storage.resolveTelematicsAlert(req.params.id, req.user?.id);
    res.json({ data: alert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Telematics Device & Readings

router.get('/telematics/device/:vehicleId', isAuthenticated, async (req: any, res) => {
  try {
    const device = await storage.getTelematicsDeviceByVehicle(req.params.vehicleId);
    if (!device) {
      return res.status(404).json({ message: "No telematics device found" });
    }
    res.json(device);
  } catch (error: any) {
    console.error("Error fetching telematics device:", error);
    res.status(500).json({ message: "Failed to fetch device" });
  }
});

router.get('/telematics/readings/:vehicleId', isAuthenticated, async (req: any, res) => {
  try {
    const { streamType, hours = 24 } = req.query;
    const readings = await storage.getTelematicsReadings(
      req.params.vehicleId,
      streamType as string,
      parseInt(hours as string)
    );
    res.json(readings);
  } catch (error: any) {
    console.error("Error fetching telematics readings:", error);
    res.status(500).json({ message: "Failed to fetch readings" });
  }
});

export default router;
