import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import { requireRole } from '../middleware/requireRole';
import { storage } from '../storage';
import * as phase7Service from '../phase7-hardware-service';

const requireAdmin = requireRole(['ADMIN']);

// ---------- Zod schemas ----------

const securityCameraSchema = z.object({
  cameraName: z.string(),
  location: z.string(),
  ipAddress: z.string().optional(),
  streamUrl: z.string().url().optional(),
  resolution: z.string(),
  hasMotionDetection: z.boolean().optional(),
});

const cameraRecordingSchema = z.object({
  cameraId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  recordingUrl: z.string().url(),
  fileSize: z.number().int().positive(),
  eventType: z.enum(['motion', 'manual', 'scheduled', 'alarm']),
  vehicleId: z.string().optional(),
  notes: z.string().optional(),
});

// ---------- helpers ----------

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

// ---------- router ----------

const router = Router();

// ===== 2FA Routes =====

// POST /security/2fa/setup
router.post('/security/2fa/setup', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    const userEmail = req.user.email || 'user@garage.com';

    // Check if 2FA is already enabled
    const existing = await storage.getTwoFactorAuth(userId);
    if (existing && existing.isEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    // Generate 2FA secret and QR code
    const { generateTwoFactorSecret } = await import('../twoFactorAuth');
    const setup = await generateTwoFactorSecret(userEmail);

    // Store temporarily (not enabled until verified)
    await storage.createTwoFactorAuth({
      userId,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      isEnabled: false,
    });

    res.json({
      qrCodeUrl: setup.qrCodeUrl,
      backupCodes: setup.backupCodes,
      secret: setup.secret, // For manual entry
    });
  } catch (error: any) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({ message: "Failed to setup 2FA", error: error.message });
  }
});

// POST /security/2fa/enable
router.post('/security/2fa/enable', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const twoFactorAuth = await storage.getTwoFactorAuth(userId);
    if (!twoFactorAuth) {
      return res.status(404).json({ message: "2FA setup not found. Please setup 2FA first." });
    }

    // Verify the token
    const { verifyTwoFactorToken } = await import('../twoFactorAuth');
    const isValid = verifyTwoFactorToken(twoFactorAuth.secret, token);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Enable 2FA
    const updated = await storage.updateTwoFactorAuth(userId, { isEnabled: true });

    res.json({ message: "2FA enabled successfully", twoFactorAuth: updated });
  } catch (error: any) {
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ message: "Failed to enable 2FA", error: error.message });
  }
});

// POST /security/2fa/verify
router.post('/security/2fa/verify', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { token, isBackupCode } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const twoFactorAuth = await storage.getTwoFactorAuth(userId);
    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    const {
      verifyTwoFactorToken,
      verifyBackupCode,
      is2FALockedOut,
      record2FAFailure,
      clear2FAAttempts,
    } = await import('../twoFactorAuth');

    if (is2FALockedOut(userId)) {
      return res.status(429).json({ message: "Too many failed attempts. Try again in 15 minutes." });
    }

    let isValid = false;
    let remainingCodes: string[] | undefined;

    if (isBackupCode) {
      const result = verifyBackupCode(twoFactorAuth.backupCodes as string[], token);
      isValid = result.valid;
      remainingCodes = result.remainingCodes;

      if (isValid && remainingCodes) {
        await storage.updateTwoFactorAuth(userId, { backupCodes: remainingCodes });
      }
    } else {
      isValid = verifyTwoFactorToken(twoFactorAuth.secret, token);
    }

    if (isValid) {
      clear2FAAttempts(userId);
    } else {
      const nowLocked = record2FAFailure(userId);
      if (nowLocked) {
        return res.status(429).json({ message: "Too many failed attempts. Try again in 15 minutes." });
      }
    }

    res.json({
      valid: isValid,
      remainingBackupCodes: remainingCodes?.length || (twoFactorAuth.backupCodes as string[])?.length || 0,
    });
  } catch (error: any) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ message: "Failed to verify 2FA", error: error.message });
  }
});

// DELETE /security/2fa
router.delete('/security/2fa', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    await storage.deleteTwoFactorAuth(userId);
    res.json({ message: "2FA disabled successfully" });
  } catch (error: any) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ message: "Failed to disable 2FA", error: error.message });
  }
});

// GET /security/2fa/status
router.get('/security/2fa/status', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    const twoFactorAuth = await storage.getTwoFactorAuth(userId);

    res.json({
      enabled: twoFactorAuth?.isEnabled || false,
      backupCodesCount: (twoFactorAuth?.backupCodes as string[])?.length || 0,
    });
  } catch (error: any) {
    console.error("Error getting 2FA status:", error);
    res.status(500).json({ message: "Failed to get 2FA status", error: error.message });
  }
});

// ===== Audit Logs =====

// GET /security/audit-logs
router.get('/security/audit-logs', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const { userId, resourceType, action, startDate, endDate } = req.query;

    const filters: any = {};
    if (userId) filters.userId = userId as string;
    if (resourceType) filters.resourceType = resourceType as string;
    if (action) filters.action = action as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const logs = await storage.getAuditLogs(userGarageId, filters);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// ===== Backup & Restore =====

// GET /security/backups
router.get('/security/backups', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const { status } = req.query;

    const backups = await storage.getBackupJobs(userGarageId, status as string);
    res.json(backups);
  } catch (error) {
    console.error("Error fetching backups:", error);
    res.status(500).json({ message: "Failed to fetch backups" });
  }
});

// POST /security/backups
router.post('/security/backups', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { type, includeAttachments } = req.body;

    // Create backup job
    const backupJob = await storage.createBackupJob({
      garageId: userGarageId,
      jobType: type || 'full',
      status: 'pending',
      createdBy: userId,
    });

    // In production, this would trigger a background job
    // For now, we'll mark it as completed immediately
    setTimeout(async () => {
      try {
        await storage.updateBackupJob(backupJob.id, {
          status: 'completed',
          completedAt: new Date(),
          fileSize: Math.floor(Math.random() * 1000000) + 500000, // Mock size
          fileName: `backup_${backupJob.id}.zip`,
        });
      } catch (error) {
        console.error("Error completing backup:", error);
      }
    }, 2000);

    res.json(backupJob);
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ message: "Failed to create backup" });
  }
});

// POST /security/backups/:id/restore
router.post('/security/backups/:id/restore', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const backup = await storage.getBackupJob(id);

    if (!backup) {
      return res.status(404).json({ message: "Backup not found" });
    }

    if (backup.status !== 'completed') {
      return res.status(400).json({ message: "Cannot restore incomplete backup" });
    }

    // In production, this would trigger a restore process
    // For now, return success message
    res.json({
      message: "Restore initiated successfully",
      backupId: id,
      estimatedTime: "5-10 minutes",
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    res.status(500).json({ message: "Failed to restore backup" });
  }
});

// ===== GDPR Compliance =====

// GET /security/gdpr/requests
router.get('/security/gdpr/requests', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const { userId } = req.query;

    const requests = await storage.getGdprDataRequests(userGarageId, userId as string);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching GDPR requests:", error);
    res.status(500).json({ message: "Failed to fetch GDPR requests" });
  }
});

// POST /security/gdpr/requests
router.post('/security/gdpr/requests', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { requestType, dataSubjectId, reason } = req.body;

    if (!requestType || !dataSubjectId) {
      return res.status(400).json({ message: "Request type and data subject ID are required" });
    }

    const request = await storage.createGdprDataRequest({
      garageId: userGarageId,
      userId: dataSubjectId,
      requestType,
      status: 'pending',
      requestData: { reason, requestedBy: userId },
    });

    res.json(request);
  } catch (error) {
    console.error("Error creating GDPR request:", error);
    res.status(500).json({ message: "Failed to create GDPR request" });
  }
});

// PATCH /security/gdpr/requests/:id
router.patch('/security/gdpr/requests/:id', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, processedBy, completedAt, exportUrl } = req.body;

    const updated = await storage.updateGdprDataRequest(id, {
      status,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      responseData: { processedBy, exportUrl },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating GDPR request:", error);
    res.status(500).json({ message: "Failed to update GDPR request" });
  }
});

// ===== User Consents =====

// GET /security/consents
router.get('/security/consents', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    const consents = await storage.getUserConsents(userId);
    res.json(consents);
  } catch (error) {
    console.error("Error fetching consents:", error);
    res.status(500).json({ message: "Failed to fetch consents" });
  }
});

// POST /security/consents
router.post('/security/consents', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { consentType, granted } = req.body;

    if (!consentType || typeof granted !== 'boolean') {
      return res.status(400).json({ message: "Consent type and granted status are required" });
    }

    const consent = await storage.createUserConsent({
      userId,
      consentType,
      consentGiven: granted,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                 req.socket.remoteAddress ||
                 null,
    });

    res.json(consent);
  } catch (error) {
    console.error("Error creating consent:", error);
    res.status(500).json({ message: "Failed to create consent" });
  }
});

// PATCH /security/consents/:id
router.patch('/security/consents/:id', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { granted } = req.body;

    const updated = await storage.updateUserConsent(id, { consentGiven: granted });
    res.json(updated);
  } catch (error) {
    console.error("Error updating consent:", error);
    res.status(500).json({ message: "Failed to update consent" });
  }
});

// ===== Permission Overrides =====

// GET /security/permissions/overrides
router.get('/security/permissions/overrides', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const { userId } = req.query;

    const overrides = await storage.getPermissionOverrides(userGarageId, userId as string);
    res.json(overrides);
  } catch (error) {
    console.error("Error fetching permission overrides:", error);
    res.status(500).json({ message: "Failed to fetch permission overrides" });
  }
});

// POST /security/permissions/overrides
router.post('/security/permissions/overrides', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const userGarageId = req.user?.garageId;
    const grantedBy = req.user?.id;
    const { userId, permission, granted, reason, expiresAt } = req.body;

    if (!userId || !permission || typeof granted !== 'boolean') {
      return res.status(400).json({ message: "User ID, permission, and granted status are required" });
    }

    const override = await storage.createPermissionOverride({
      garageId: userGarageId,
      userId,
      resource: permission.split(':')[0] || 'resource',
      action: permission.split(':')[1] || permission,
      allowed: granted,
      createdBy: grantedBy,
      reason,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.json(override);
  } catch (error) {
    console.error("Error creating permission override:", error);
    res.status(500).json({ message: "Failed to create permission override" });
  }
});

// DELETE /security/permissions/overrides/:id
router.delete('/security/permissions/overrides/:id', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deletePermissionOverride(id);
    res.json({ message: "Permission override deleted successfully" });
  } catch (error) {
    console.error("Error deleting permission override:", error);
    res.status(500).json({ message: "Failed to delete permission override" });
  }
});

// ===== Security Camera Integration =====

// POST /security/cameras
router.post('/security/cameras', isAuthenticated, requireAdmin, async (req: any, res: Response) => {
  try {
    const garageId = req.user?.garageId;

    const validated = securityCameraSchema.parse(req.body);

    const cameraData = {
      garageId,
      cameraName: validated.cameraName,
      location: validated.location,
      ipAddress: validated.ipAddress,
      streamUrl: validated.streamUrl,
      resolution: validated.resolution,
      hasMotionDetection: validated.hasMotionDetection,
    };
    const camera = await phase7Service.createSecurityCamera(cameraData);
    res.status(201).json(camera);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating security camera:", error);
    res.status(500).json({ message: "Failed to create security camera" });
  }
});

// POST /security/recordings
router.post('/security/recordings', isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const validated = cameraRecordingSchema.parse(req.body);

    const recordingData = {
      cameraId: validated.cameraId,
      recordingStart: new Date(validated.startTime),
      recordingEnd: new Date(validated.endTime),
      recordingUrl: validated.recordingUrl,
      fileSize: validated.fileSize,
      eventType: validated.eventType,
      vehicleId: validated.vehicleId,
      notes: validated.notes,
    };
    const recording = await phase7Service.createCameraRecording(recordingData);
    res.status(201).json(recording);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating camera recording:", error);
    res.status(500).json({ message: "Failed to create camera recording" });
  }
});

// GET /security/recordings/:id
router.get('/security/recordings/:id', isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recording = await (phase7Service as any).getRecordingPlayback(id);
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }
    res.json(recording);
  } catch (error) {
    console.error("Error fetching recording:", error);
    res.status(500).json({ message: "Failed to fetch recording" });
  }
});

export const securityRoutes = router;
