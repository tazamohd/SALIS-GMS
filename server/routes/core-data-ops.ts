// @ts-nocheck
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';
import {
  insertExportJobSchema,
  insertStorageFacilitySchema,
  insertVehicleStorageAssignmentSchema,
} from '@shared/schema';
import * as phase5Service from '../phase5-operations-service';
import { smsService } from '../services/smsService';

// Helper function to sanitize Zod validation errors for production
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

const calibrationRecordSchema = z.object({
  equipmentId: z.string(),
  equipmentName: z.string(),
  calibrationDate: z.string(),
  nextDueDate: z.string(),
  calibratedBy: z.string(),
  certificationNumber: z.string().optional(),
  notes: z.string().optional(),
});

const router = Router();

// Pricing History
router.get('/pricing-history/:sparePartId', isAuthenticated, async (req: any, res) => {
  try {
    const { sparePartId } = req.params;
    const history = await storage.getPricingHistory(sparePartId);
    res.json(history);
  } catch (error) {
    console.error("Error fetching pricing history:", error);
    res.status(500).json({ message: "Failed to fetch pricing history" });
  }
});

router.post('/pricing-history', isAuthenticated, async (req: any, res) => {
  try {
    const history = await storage.createPricingHistory(req.body);
    res.status(201).json(history);
  } catch (error) {
    console.error("Error creating pricing history:", error);
    res.status(500).json({ message: "Failed to create pricing history" });
  }
});

// Inventory Audit Trail
router.get('/inventory-audit-trail', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, sparePartId, limit } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const trail = await storage.getInventoryAuditTrail(
      garageId as string,
      sparePartId as string,
      limit ? parseInt(limit as string) : 100
    );
    res.json(trail);
  } catch (error) {
    console.error("Error fetching inventory audit trail:", error);
    res.status(500).json({ message: "Failed to fetch inventory audit trail" });
  }
});

router.post('/inventory-audit-trail', isAuthenticated, async (req: any, res) => {
  try {
    const entry = await storage.createAuditTrailEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating audit trail entry:", error);
    res.status(500).json({ message: "Failed to create audit trail entry" });
  }
});

// TecDoc Integration
router.post('/tecdoc/search', isAuthenticated, async (req: any, res) => {
  try {
    const { query, searchType } = req.body;
    if (!query || !searchType) {
      return res.status(400).json({ message: "query and searchType are required" });
    }
    const results = await storage.searchTecDoc(query, searchType);
    res.json(results);
  } catch (error: any) {
    console.error("Error searching TecDoc:", error);
    res.status(500).json({ message: error.message || "Failed to search TecDoc" });
  }
});

// Installments
router.get('/installments', isAuthenticated, async (req: any, res) => {
  try {
    const { paymentPlanId } = req.query;
    if (!paymentPlanId) {
      return res.status(400).json({ message: "paymentPlanId is required" });
    }
    const installments = await storage.getInstallments(paymentPlanId);
    res.json(installments);
  } catch (error) {
    console.error("Error fetching installments:", error);
    res.status(500).json({ message: "Failed to fetch installments" });
  }
});

router.patch('/installments/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const installment = await storage.updateInstallment(id, req.body);
    res.json(installment);
  } catch (error) {
    console.error("Error updating installment:", error);
    res.status(500).json({ message: "Failed to update installment" });
  }
});

// Tax Calculation
router.post('/calculate-tax', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, amount, category } = req.body;
    const result = await storage.calculateTax(garageId, amount, category);
    res.json(result);
  } catch (error) {
    console.error("Error calculating tax:", error);
    res.status(500).json({ message: "Failed to calculate tax" });
  }
});

// Global Search
router.get('/global-search', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, query, modules } = req.query;

    if (!garageId || !query) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const modulesList = modules ? modules.split(',') : undefined;
    const results = await storage.globalSearch(garageId, query, modulesList);
    res.json(results);
  } catch (error) {
    console.error("Error in global search:", error);
    res.status(500).json({ message: "Failed to search" });
  }
});

// Export Jobs
router.get('/export-jobs', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    const userId = req.user?.id || 'default-user';
    const jobs = await storage.getExportJobs(garageId, userId);
    res.json(jobs);
  } catch (error) {
    console.error("Error getting export jobs:", error);
    res.status(500).json({ message: "Failed to get export jobs" });
  }
});

router.post('/export', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { garageId, module, format, filterConfig } = req.body;

    const validated = insertExportJobSchema.parse({
      garageId,
      userId,
      module,
      format,
      filterConfig,
      status: 'processing',
    });

    const job = await storage.createExportJob(validated);

    // Start async export process (simplified - in production, use a queue)
    (async () => {
      try {
        let data: any[] = [];

        // Fetch data based on module
        switch (module) {
          case 'jobCards':
            data = await storage.getJobCards(garageId);
            break;
          case 'customers':
            data = await storage.getCustomers(garageId);
            break;
          case 'vehicles':
            data = await storage.getVehicles(garageId);
            break;
          case 'invoices':
            data = await storage.getInvoices(garageId);
            break;
          case 'estimates':
            data = await storage.getEstimates(garageId);
            break;
          default:
            throw new Error(`Export not supported for module: ${module}`);
        }

        // Generate export file content
        let fileContent = '';
        const fileName = `${module}-export-${Date.now()}.${format}`;

        if (format === 'csv') {
          if (data.length > 0) {
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).join(','));
            fileContent = [headers, ...rows].join('\n');
          }
        } else if (format === 'json') {
          fileContent = JSON.stringify(data, null, 2);
        }

        // Update job with completion status
        await storage.updateExportJob(job.id, {
          status: 'completed',
          fileName,
          fileUrl: `/exports/${fileName}`, // In production, upload to S3
          recordCount: data.length,
          completedAt: new Date(),
        });
      } catch (error: any) {
        await storage.updateExportJob(job.id, {
          status: 'failed',
          errorMessage: error.message,
        });
      }
    })();

    res.status(202).json(job);
  } catch (error: any) {
    console.error("Error creating export:", error);
    if (error.errors) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: "Failed to create export" });
  }
});

router.get('/export-jobs/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const job = await storage.getExportJob(id);

    if (!job) {
      return res.status(404).json({ message: "Export job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error getting export job:", error);
    res.status(500).json({ message: "Failed to get export job" });
  }
});

// Bulk Operations
router.post('/bulk-delete', isAuthenticated, async (req: any, res) => {
  try {
    const { module, ids } = req.body;

    if (!module || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const result = await storage.bulkDelete(module, ids);
    res.json(result);
  } catch (error: any) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({ message: error.message || "Failed to delete items" });
  }
});

router.post('/bulk-update', isAuthenticated, async (req: any, res) => {
  try {
    const { module, ids, data } = req.body;

    if (!module || !ids || !Array.isArray(ids) || ids.length === 0 || !data) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const result = await storage.bulkUpdate(module, ids, data);
    res.json(result);
  } catch (error: any) {
    console.error("Error in bulk update:", error);
    res.status(500).json({ message: error.message || "Failed to update items" });
  }
});

// Data Import
router.post('/import', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, module, data, conflictResolution = 'skip' } = req.body;
    const userId = req.user?.id || 'default-user';

    if (!garageId) {
      return res.status(400).json({ message: "Garage ID is required" });
    }

    if (!module || !data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid import data" });
    }

    const results = { imported: 0, skipped: 0, errors: [] as any[] };

    for (const item of data) {
      try {
        switch (module) {
          case 'customers':
            await storage.createUser({ ...item, garageId, createdBy: userId });
            results.imported++;
            break;
          case 'vehicles':
            await storage.createVehicle({ ...item, garageId });
            results.imported++;
            break;
          case 'spareParts':
            await storage.createSparePart({ ...item, garageId });
            results.imported++;
            break;
          case 'jobCards':
            await storage.createJobCard({ ...item, garageId });
            results.imported++;
            break;
          case 'invoices':
            await storage.createInvoice({ ...item, garageId });
            results.imported++;
            break;
          case 'estimates':
            await storage.createEstimate({ ...item, garageId });
            results.imported++;
            break;
          default:
            results.errors.push({ item, error: `Import not supported for module: ${module}` });
        }
      } catch (error: any) {
        if (conflictResolution === 'skip') {
          results.skipped++;
        } else {
          results.errors.push({ item, error: error.message });
        }
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ message: "Failed to import data" });
  }
});

// User Settings
router.patch('/settings', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    // Upsert: update if a row exists, otherwise create one so the response is
    // always a populated settings object (callers rely on this).
    let settings = await storage.updateUserSettings(userId, req.body);
    if (!settings) {
      settings = await storage.createUserSettings({ userId, ...req.body });
    }
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// Action History (Undo/Redo)
router.post('/action-history', isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { actionType, actionDescription, metadata } = req.body;

    const history = await storage.createActionHistory({
      garageId: userGarageId,
      userId,
      actionType,
      resourceType: actionDescription || 'general',
      previousState: metadata?.previousState,
      newState: metadata?.newState,
    });
    res.json(history);
  } catch (error) {
    console.error("Error creating action history:", error);
    res.status(500).json({ message: "Failed to create action history" });
  }
});

// Protected route example
router.get("/protected", isAuthenticated, async (req: any, res) => {
  const userId = req.user?.id || 'default-user';
  res.json({ message: "This is a protected route", userId });
});

// Digital Signatures
router.post('/digital-signatures', isAuthenticated, async (req: any, res) => {
  try {
    const {
      relatedType, relatedId, signatureData, signatureType,
      consentText, consentGiven, timestamp
    } = req.body;
    const garageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';

    // Validate required fields
    if (!relatedType || !relatedId || !signatureData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Enforce consent tracking when consent text is provided
    if (consentText && !consentGiven) {
      return res.status(400).json({ message: "Consent must be given when consent text is provided" });
    }

    // Validate signature type
    const validTypes = ['customer', 'technician', 'manager'];
    if (signatureType && !validTypes.includes(signatureType)) {
      return res.status(400).json({ message: "Invalid signature type" });
    }

    // Validate base64 signature data
    if (!signatureData.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ message: "Invalid signature format. Must be PNG base64 data" });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.headers['user-agent'];

    const signature = await storage.createDigitalSignature({
      garageId,
      relatedType,
      relatedId,
      signedBy: userId,
      signatureData,
      signatureType: signatureType || 'customer',
      ipAddress,
      deviceInfo,
      consentText: consentGiven ? consentText : undefined,
      consentGiven: consentGiven || false,
      signedAt: timestamp ? new Date(timestamp) : new Date(),
    });

    res.json(signature);
  } catch (error) {
    console.error("Error creating digital signature:", error);
    res.status(500).json({ message: "Failed to create signature" });
  }
});

router.get('/digital-signatures/:relatedType/:relatedId', isAuthenticated, async (req, res) => {
  try {
    const { relatedType, relatedId } = req.params;
    const signatures = await storage.getDigitalSignatures(relatedType, relatedId);
    res.json(signatures);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    res.status(500).json({ message: "Failed to fetch signatures" });
  }
});

// Send payment reminder via SMS
router.post('/send-payment-reminder', isAuthenticated, async (req: any, res) => {
  try {
    // Validate request body with Zod
    const paymentReminderSchema = z.object({
      customerId: z.string(),
      customerName: z.string().optional(),
      customerPhone: z.string().min(1, "Phone number is required"),
      invoiceId: z.string(),
      amount: z.union([z.number(), z.string()]).transform(val =>
        typeof val === 'number' ? val : parseFloat(val) || 0
      ),
    });

    const validated = paymentReminderSchema.parse(req.body);

    const { smsService } = await import('../services/smsService');
    const garages = await storage.getGarages();
    const userGarage = garages.find(g => g.id === req.user?.garageId);
    const garageName = userGarage?.name || 'SALIS AUTO';

    const template = smsService.invoiceNotification({
      customerName: validated.customerName || 'Customer',
      invoiceNumber: validated.invoiceId.substring(0, 8),
      amount: validated.amount.toFixed(2),
      dueDate: 'soon',
      garageName,
    });

    await smsService.sendSMS({
      to: validated.customerPhone,
      recipientId: validated.customerId,
      garageId: req.user?.garageId,
      template,
      category: 'payment_reminder',
      metadata: { invoiceId: validated.invoiceId, amount: validated.amount },
    });

    res.json({ success: true, message: "Payment reminder sent successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending payment reminder:", error);
    res.status(500).json({ message: "Failed to send payment reminder" });
  }
});

// Inventory Forecasts
router.get('/inventory-forecasts', isAuthenticated, async (req: any, res) => {
  try {
    const { garageId } = req.query;
    if (!garageId) return res.status(400).json({ message: "garageId is required" });
    const forecasts = await storage.getInventoryForecasts(garageId as string);
    res.json(forecasts);
  } catch (error: any) {
    console.error("Error fetching inventory forecasts:", error);
    res.status(500).json({ message: "Failed to fetch inventory forecasts" });
  }
});

router.post('/inventory-forecasts', isAuthenticated, async (req: any, res) => {
  try {
    const forecast = await storage.createInventoryForecast(req.body);
    res.status(201).json(forecast);
  } catch (error: any) {
    console.error("Error creating inventory forecast:", error);
    res.status(500).json({ message: "Failed to create inventory forecast" });
  }
});

// Parts Auto-Reordering - Module 82
router.get("/auto-reorder/rules", isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", partName: "Oil Filter", partNumber: "OF-123", currentStock: 15, reorderPoint: 20, reorderQuantity: 50, status: "triggered" },
  ]);
});

router.post("/auto-reorder/rules", isAuthenticated, async (req, res) => {
  res.status(201).json({ id: "new", ...req.body });
});

router.get("/auto-reorder/history", isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", partName: "Oil Filter", quantity: 50, supplier: "AutoParts Plus", status: "ordered" },
  ]);
});

router.post('/auto-reorder/check', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const triggeredOrders = await phase5Service.checkAndTriggerReorders(garageId);
    res.json({ triggered: triggeredOrders.length, orders: triggeredOrders });
  } catch (error) {
    console.error("Error checking auto-reorders:", error);
    res.status(500).json({ message: "Failed to check auto-reorders" });
  }
});

// Time Clock & Payroll - Module 84
router.post("/timeclock/clock-in", isAuthenticated, async (req, res) => {
  res.json({ message: "Clocked in successfully", timestamp: new Date().toISOString() });
});

router.post("/timeclock/clock-out", isAuthenticated, async (req, res) => {
  res.json({ message: "Clocked out successfully", timestamp: new Date().toISOString() });
});

// Equipment Calibration - Module 85
router.get("/calibration/records", isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", toolName: "Torque Wrench #1", calibrationType: "Torque Accuracy", status: "valid" },
  ]);
});

router.post("/calibration/records", isAuthenticated, async (req, res) => {
  res.status(201).json({ id: "new", ...req.body });
});

router.get("/calibration/reminders", isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", toolName: "Diagnostic Scanner", dueDate: "2024-10-15" },
  ]);
});

router.post('/calibration', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = calibrationRecordSchema.parse(req.body);

    const calibrationData = {
      garageId,
      toolId: validated.equipmentId,
      calibrationType: 'Standard Calibration',
      lastCalibrationDate: new Date(validated.calibrationDate),
      nextCalibrationDue: new Date(validated.nextDueDate),
      calibrationInterval: 90,
      calibratedBy: validated.calibratedBy,
      certificationNumber: validated.certificationNumber,
    };
    const calibration = await phase5Service.createCalibrationRecord(calibrationData);
    res.status(201).json(calibration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating calibration record:", error);
    res.status(500).json({ message: "Failed to create calibration record" });
  }
});

router.get('/calibration/due', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { days } = req.query;
    const dueCalibrations = await phase5Service.getCalibrationsDue(garageId, days ? parseInt(days) : 30);
    res.json(dueCalibrations);
  } catch (error) {
    console.error("Error fetching due calibrations:", error);
    res.status(500).json({ message: "Failed to fetch due calibrations" });
  }
});

// Multi-Location Routing - Module 83
router.get("/routing/routes", isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", type: "parts_transfer", stops: 4, distance: 12.5, duration: 45, driver: "Mike Davis", status: "planned" },
  ]);
});

router.post("/routing/optimize", isAuthenticated, async (req, res) => {
  res.json({ message: "Route optimized", routeId: "route-123" });
});

// Environmental Compliance - Module 86
router.get("/environmental-compliance/records", isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", type: "waste_disposal", wasteType: "Used Oil", quantity: 55, unit: "gallons", date: "2024-10-20" },
  ]);
});

router.post("/environmental-compliance/records", isAuthenticated, async (req, res) => {
  res.status(201).json({ id: "new", ...req.body });
});

// Quality Non-Conformances
router.get("/quality/non-conformances", isAuthenticated, async (req, res) => {
  res.json([
    { id: "NC-2024-001", title: "Incorrect torque on wheel nuts", severity: "major", status: "resolved" },
  ]);
});

router.post("/quality/non-conformances", isAuthenticated, async (req, res) => {
  res.status(201).json({ id: "NC-NEW", ...req.body });
});

// Vehicle Storage
router.get('/storage-facilities', isAuthenticated, async (req: any, res) => {
  try {
    const facilities = await storage.getStorageFacilities(req.user?.garageId);
    res.json({ data: facilities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/storage-facilities', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertStorageFacilitySchema.parse(req.body);
    const facility = await storage.createStorageFacility(validatedData);
    res.json({ data: facility });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/vehicle-storage-assignments', isAuthenticated, async (req, res) => {
  try {
    const assignments = await storage.getVehicleStorageAssignments(req.query.facilityId as string, req.query.vehicleId as string);
    res.json({ data: assignments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vehicle-storage-assignments', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertVehicleStorageAssignmentSchema.parse(req.body);
    const assignment = await storage.createVehicleStorageAssignment(validatedData);
    res.json({ data: assignment });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// Maintenance Recommendations
router.get('/maintenance/recommendations/:vehicleId', isAuthenticated, async (req: any, res) => {
  try {
    const recommendations = await storage.getMaintenanceRecommendations(req.params.vehicleId);
    res.json(recommendations);
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

router.patch('/maintenance/recommendations/:id/acknowledge', isAuthenticated, async (req: any, res) => {
  try {
    const recommendation = await storage.acknowledgeMaintenanceRecommendation(req.params.id);
    res.json(recommendation);
  } catch (error: any) {
    console.error("Error acknowledging recommendation:", error);
    res.status(500).json({ message: "Failed to acknowledge recommendation" });
  }
});

export default router;
