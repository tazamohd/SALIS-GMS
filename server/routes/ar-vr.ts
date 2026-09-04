// @ts-nocheck
/**
 * SALIS AUTO - AR/VR & Video Routes
 *
 * Extracted from server/routes.ts (monolith).
 * Covers AR overlay instructions, sessions, device pairings,
 * video consultations, and video estimates.
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import * as phase3Service from '../phase3-integrations-service';
import * as phase4Service from '../phase4-customer-experience-service';

const router = Router();

// ==========================================
// AR Work Instructions
// ==========================================

// GET /api/ar-instructions
router.get('/ar-instructions', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    const instructions = await storage.getArWorkInstructions(garageId as string);
    res.json(instructions);
  } catch (error: any) {
    console.error("Error fetching AR instructions:", error);
    res.status(500).json({ message: "Failed to fetch AR instructions" });
  }
});

// GET /api/ar-instructions/:id
router.get('/ar-instructions/:id', isAuthenticated, async (req: any, res) => {
  try {
    const instruction = await storage.getArWorkInstruction(req.params.id);
    if (!instruction) return res.status(404).json({ message: "Instruction not found" });
    res.json(instruction);
  } catch (error: any) {
    console.error("Error fetching AR instruction:", error);
    res.status(500).json({ message: "Failed to fetch AR instruction" });
  }
});

// POST /api/ar-instructions
router.post('/ar-instructions', isAuthenticated, async (req: any, res) => {
  try {
    const instruction = await storage.createArWorkInstruction(req.body);
    res.status(201).json(instruction);
  } catch (error: any) {
    console.error("Error creating AR instruction:", error);
    res.status(500).json({ message: "Failed to create AR instruction" });
  }
});

// PATCH /api/ar-instructions/:id
router.patch('/ar-instructions/:id', isAuthenticated, async (req: any, res) => {
  try {
    const instruction = await storage.updateArWorkInstruction(req.params.id, req.body);
    res.json(instruction);
  } catch (error: any) {
    console.error("Error updating AR instruction:", error);
    res.status(500).json({ message: "Failed to update AR instruction" });
  }
});

// DELETE /api/ar-instructions/:id
router.delete('/ar-instructions/:id', isAuthenticated, async (req: any, res) => {
  try {
    await storage.deleteArWorkInstruction(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting AR instruction:", error);
    res.status(500).json({ message: "Failed to delete AR instruction" });
  }
});

// ==========================================
// AR Sessions
// ==========================================

// GET /api/ar-sessions
router.get('/ar-sessions', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, technicianId } = req.query;
    if (!garageId) return res.status(400).json({ message: "garageId is required" });
    const sessions = await storage.getArSessionLogs(garageId as string, technicianId as string);
    res.json(sessions);
  } catch (error: any) {
    console.error("Error fetching AR sessions:", error);
    res.status(500).json({ message: "Failed to fetch AR sessions" });
  }
});

// POST /api/ar-sessions
router.post('/ar-sessions', isAuthenticated, async (req: any, res) => {
  try {
    const session = await storage.createArSessionLog(req.body);
    res.status(201).json(session);
  } catch (error: any) {
    console.error("Error creating AR session:", error);
    res.status(500).json({ message: "Failed to create AR session" });
  }
});

// PATCH /api/ar-sessions/:id
router.patch('/ar-sessions/:id', isAuthenticated, async (req: any, res) => {
  try {
    const session = await storage.updateArSessionLog(req.params.id, req.body);
    res.json(session);
  } catch (error: any) {
    console.error("Error updating AR session:", error);
    res.status(500).json({ message: "Failed to update AR session" });
  }
});

// ==========================================
// AR Devices
// ==========================================

// GET /api/ar-devices
router.get('/ar-devices', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    if (!garageId) return res.status(400).json({ message: "garageId is required" });
    const devices = await storage.getArDevicePairings(garageId as string);
    res.json(devices);
  } catch (error: any) {
    console.error("Error fetching AR devices:", error);
    res.status(500).json({ message: "Failed to fetch AR devices" });
  }
});

// POST /api/ar-devices
router.post('/ar-devices', isAuthenticated, async (req: any, res) => {
  try {
    const device = await storage.createArDevicePairing(req.body);
    res.status(201).json(device);
  } catch (error: any) {
    console.error("Error creating AR device pairing:", error);
    res.status(500).json({ message: "Failed to create AR device pairing" });
  }
});

// PATCH /api/ar-devices/:id
router.patch('/ar-devices/:id', isAuthenticated, async (req: any, res) => {
  try {
    const device = await storage.updateArDevicePairing(req.params.id, req.body);
    res.json(device);
  } catch (error: any) {
    console.error("Error updating AR device:", error);
    res.status(500).json({ message: "Failed to update AR device" });
  }
});

// DELETE /api/ar-devices/:id
router.delete('/ar-devices/:id', isAuthenticated, async (req: any, res) => {
  try {
    await storage.deleteArDevicePairing(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting AR device:", error);
    res.status(500).json({ message: "Failed to delete AR device" });
  }
});

// ==========================================
// Video Consultations
// ==========================================

// POST /api/video/consultations
router.post('/video/consultations', isAuthenticated, async (req: any, res) => {
  try {
    const { customerId, technicianId, scheduledFor, duration, purpose } = req.body;
    const consultation = await phase3Service.scheduleVideoConsultation({
      garageId: req.user?.garageId,
      customerId,
      technicianId,
      scheduledFor: new Date(scheduledFor),
      duration,
      purpose
    });
    res.status(201).json(consultation);
  } catch (error: any) {
    console.error("Error creating consultation:", error);
    res.status(500).json({ message: error.message || "Failed to create consultation" });
  }
});

// POST /api/video/consultations/:id/start
router.post('/video/consultations/:id/start', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const result = await phase3Service.startVideoConsultation(id);
    res.json(result);
  } catch (error: any) {
    console.error("Error starting consultation:", error);
    res.status(500).json({ message: error.message || "Failed to start consultation" });
  }
});

// POST /api/video/consultations/:id/end
router.post('/video/consultations/:id/end', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { notes, recordingUrl } = req.body;
    const result = await phase3Service.endVideoConsultation(id, notes, recordingUrl);
    res.json(result);
  } catch (error: any) {
    console.error("Error ending consultation:", error);
    res.status(500).json({ message: error.message || "Failed to end consultation" });
  }
});

// ==========================================
// Video Estimates
// ==========================================

// GET /api/video-estimates
router.get('/video-estimates', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    res.json([]);
  } catch (error) {
    console.error("Error fetching video estimates:", error);
    res.status(500).json({ message: "Failed to fetch video estimates" });
  }
});

// POST /api/video-estimates
router.post('/video-estimates', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { customerId, vehicleId, estimatedCost } = req.body;

    const estimate = {
      id: Math.random().toString(36).substring(7),
      garageId,
      customerId,
      vehicleId,
      technicianId: userId,
      estimatedCost,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    res.json(estimate);
  } catch (error) {
    console.error("Error creating video estimate:", error);
    res.status(500).json({ message: "Failed to create video estimate" });
  }
});

// POST /api/video-estimates/:id/send
router.post('/video-estimates/:id/send', isAuthenticated, async (req: any, res) => {
  try {
    res.json({ success: true, message: "Video estimate sent to customer" });
  } catch (error) {
    console.error("Error sending video estimate:", error);
    res.status(500).json({ message: "Failed to send video estimate" });
  }
});

// GET /api/video-estimates/customer/:customerId
router.get('/video-estimates/customer/:customerId', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const estimates = await phase4Service.getVideoEstimates(customerId);
    res.json(estimates);
  } catch (error) {
    console.error("Error fetching video estimates:", error);
    res.status(500).json({ message: "Failed to fetch video estimates" });
  }
});

// PATCH /api/video-estimates/:id/approve
router.patch('/video-estimates/:id/approve', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const estimate = await phase4Service.approveVideoEstimate(id);
    res.json(estimate);
  } catch (error) {
    console.error("Error approving video estimate:", error);
    res.status(500).json({ message: "Failed to approve video estimate" });
  }
});

export default router;
