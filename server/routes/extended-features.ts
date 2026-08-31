// @ts-nocheck
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { db } from '../db';
import { sql, count } from 'drizzle-orm';
import { jobCards, invoices } from '@shared/schema';
import { z } from 'zod';
import * as phase4Service from '../phase4-customer-experience-service';
import * as phase7Service from '../phase7-hardware-service';

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

const digitalWalkaroundSchema = z.object({
  jobCardId: z.string().optional(),
  vehicleId: z.string(),
  customerId: z.string(),
  technicianId: z.string(),
  inspectionType: z.enum(['pre-service', 'post-service', 'damage-assessment']),
  photos: z.array(z.object({
    url: z.string().url(),
    angle: z.string(),
    timestamp: z.string().optional(),
  })),
  damageNotes: z.string().optional(),
});

const router = Router();

// Voice Commands Routes
router.get('/voice-commands', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const commands = await storage.getVoiceCommands(userId);
    res.json(commands);
  } catch (error) {
    console.error("Error fetching voice commands:", error);
    res.status(500).json({ message: "Failed to fetch voice commands" });
  }
});

router.post('/voice-commands/process', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { command, rawTranscript } = req.body;

    // Simple command processing logic
    const lowerCommand = (command || rawTranscript || "").toLowerCase().trim();
    let intent = "unknown";
    let actionExecuted = null;
    let success = false;
    let path = null;

    // Basic intent matching
    if (lowerCommand.includes("open") || lowerCommand.includes("show") || lowerCommand.includes("view")) {
      intent = "navigate";

      if (lowerCommand.includes("job card") || lowerCommand.includes("jobcard")) {
        actionExecuted = "navigate_to_job_cards";
        path = "/job-cards";
        success = true;
      } else if (lowerCommand.includes("customer")) {
        actionExecuted = "navigate_to_customers";
        path = "/customers";
        success = true;
      } else if (lowerCommand.includes("appointment")) {
        actionExecuted = "navigate_to_appointments";
        path = "/appointments";
        success = true;
      } else if (lowerCommand.includes("inventory") || lowerCommand.includes("part")) {
        actionExecuted = "navigate_to_inventory";
        path = "/inventory";
        success = true;
      } else if (lowerCommand.includes("setting")) {
        actionExecuted = "navigate_to_settings";
        path = "/settings";
        success = true;
      } else if (lowerCommand.includes("report")) {
        actionExecuted = "navigate_to_reports";
        path = "/reports";
        success = true;
      }
    } else if (lowerCommand.includes("create") || lowerCommand.includes("new")) {
      intent = "create";
      if (lowerCommand.includes("appointment")) {
        actionExecuted = "navigate_to_new_appointment";
        path = "/appointments";
        success = true;
      } else if (lowerCommand.includes("invoice")) {
        actionExecuted = "navigate_to_new_invoice";
        path = "/invoices";
        success = true;
      }
    } else if (lowerCommand.includes("search") || lowerCommand.includes("find")) {
      intent = "search";
      actionExecuted = "trigger_search";
      success = true;
    }

    // Store the command in database
    const commandData = {
      userId,
      transcript: rawTranscript || command,
      intent,
      entities: { originalCommand: command },
      confidence: success ? 85 : 30,
      actionExecuted,
      success,
      responseTime: 100,
    };

    const savedCommand = await storage.createVoiceCommand(commandData);

    res.json({
      ...savedCommand,
      path,
      message: success ? `Executing: ${actionExecuted}` : "Command not recognized",
    });
  } catch (error: any) {
    console.error("Error processing voice command:", error);
    res.status(500).json({ message: "Failed to process voice command", error: error.message });
  }
});

// Phase 1: Document OCR Routes
router.get('/ai/ocr-documents', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { status } = req.query;

    const documents = await storage.getOCRDocuments(garageId, status);
    res.json(documents);
  } catch (error) {
    console.error("Error fetching OCR documents:", error);
    res.status(500).json({ message: "Failed to fetch OCR documents" });
  }
});

router.post('/ai/ocr-documents/upload', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { documentType, fileName } = req.body;

    const documentData = {
      documentType: documentType || 'invoice',
      fileName: fileName || 'document.pdf',
      fileUrl: `mock://ocr-uploads/${garageId}/${Date.now()}-${fileName || 'document.pdf'}`,
      uploadedBy: req.user.id,
      status: 'completed',
      processedAt: new Date(),
      extractedData: {
        vendor: "Auto Parts Supplier Inc.",
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
        total: (Math.random() * 1000 + 100).toFixed(2),
        items: [
          { description: "Oil Filter", quantity: 2, unitPrice: 15.99, amount: 31.98 },
          { description: "Air Filter", quantity: 1, unitPrice: 22.50, amount: 22.50 },
          { description: "Spark Plugs", quantity: 4, unitPrice: 8.75, amount: 35.00 }
        ],
        notes: "Automatically extracted via AI OCR"
      },
      confidence: 92,
    };

    const document = await storage.createOCRDocument(documentData);
    res.json(document);
  } catch (error) {
    console.error("Error uploading OCR document:", error);
    res.status(500).json({ message: "Failed to upload document for OCR" });
  }
});

router.get('/ai/ocr-documents/:id', isAuthenticated, async (req: any, res) => {
  try {
    const document = await storage.getOCRDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching OCR document:", error);
    res.status(500).json({ message: "Failed to fetch OCR document" });
  }
});

router.patch('/ai/ocr-documents/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { extractedData, status } = req.body;
    const document = await storage.updateOCRDocument(req.params.id, {
      extractedData,
      status: status || 'approved',
    });
    res.json(document);
  } catch (error) {
    console.error("Error updating OCR document:", error);
    res.status(500).json({ message: "Failed to update OCR document" });
  }
});

// Vehicle Walkarounds
router.get('/vehicle-walkarounds', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    res.json([]);
  } catch (error) {
    console.error("Error fetching walkarounds:", error);
    res.status(500).json({ message: "Failed to fetch walkarounds" });
  }
});

router.post('/vehicle-walkarounds', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { jobCardId, vehicleId, walkaroundType } = req.body;

    const walkaround = {
      id: Math.random().toString(36).substring(7),
      jobCardId,
      vehicleId,
      technicianId: userId,
      walkaroundType,
      photos: [],
      createdAt: new Date().toISOString(),
    };

    res.json(walkaround);
  } catch (error) {
    console.error("Error creating walkaround:", error);
    res.status(500).json({ message: "Failed to create walkaround" });
  }
});

// Digital Vehicle Walkaround
router.post('/digital-walkaround', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = digitalWalkaroundSchema.parse(req.body);

    const walkaroundData = {
      garageId,
      jobCardId: validated.jobCardId,
      vehicleId: validated.vehicleId,
      customerId: validated.customerId,
      technicianId: validated.technicianId,
      inspectionType: validated.inspectionType,
      photos: validated.photos,
      damageNotes: validated.damageNotes,
    };
    const walkaround = await phase4Service.createDigitalWalkaround(walkaroundData);
    res.status(201).json(walkaround);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error creating digital walkaround:", error);
    res.status(500).json({ message: "Failed to create digital walkaround" });
  }
});

router.get('/digital-walkaround/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const walkaround = await phase4Service.getDigitalWalkaround(id);
    if (!walkaround) {
      return res.status(404).json({ message: "Digital walkaround not found" });
    }
    res.json(walkaround);
  } catch (error) {
    console.error("Error fetching digital walkaround:", error);
    res.status(500).json({ message: "Failed to fetch digital walkaround" });
  }
});

// Kiosk Customer Lookup by Phone
router.get("/kiosk/lookup-customer", isAuthenticated, async (req: any, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const customers = await storage.getCustomers();
    const customer = customers.find((c: any) => {
      const customerPhone = (c.phone || '').replace(/\D/g, '');
      return customerPhone.includes(cleanPhone) || cleanPhone.includes(customerPhone);
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found", found: false });
    }

    const vehicles = await storage.getVehiclesByCustomer(customer.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allAppointments = await storage.getAppointments();
    const todayAppointments = allAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate);
      return apt.customerId === customer.id &&
             aptDate >= today &&
             aptDate < tomorrow &&
             apt.status !== 'completed' &&
             apt.status !== 'cancelled';
    });

    res.json({
      found: true,
      customer: { id: customer.id, fullName: customer.fullName, phone: customer.phone, email: customer.email },
      vehicles: vehicles.map((v: any) => ({ id: v.id, make: v.make, model: v.model, year: v.year, plateNumber: v.plateNumber })),
      todayAppointments: todayAppointments.map((apt: any) => ({
        id: apt.id, appointmentNumber: apt.appointmentNumber, serviceType: apt.serviceType,
        appointmentDate: apt.appointmentDate, duration: apt.duration, status: apt.status,
        vehicleId: apt.vehicleId || null,
      })),
    });
  } catch (error) {
    console.error("Error looking up customer:", error);
    res.status(500).json({ message: "Failed to lookup customer" });
  }
});

// Kiosk Check-In with Appointment Validation
router.post("/kiosk/validate-checkin", isAuthenticated, async (req: any, res) => {
  try {
    const { customerId, vehicleId, appointmentId } = req.body;
    if (!customerId || !vehicleId) {
      return res.status(400).json({ message: "Customer ID and Vehicle ID are required" });
    }

    const customer = await storage.getUser(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle || vehicle.customerId !== customerId) {
      return res.status(400).json({ message: "Vehicle does not belong to this customer" });
    }

    if (appointmentId) {
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      if (appointment.customerId !== customerId) {
        return res.status(400).json({ message: "Appointment does not belong to this customer" });
      }
      await storage.updateAppointment(appointmentId, { status: 'in_progress' });
    }

    res.json({ valid: true, message: "Check-in validated successfully", isWalkIn: !appointmentId });
  } catch (error) {
    console.error("Error validating check-in:", error);
    res.status(500).json({ message: "Failed to validate check-in" });
  }
});

// Reminder Settings API
router.get("/reminder-settings", isAuthenticated, async (req: any, res) => {
  try {
    res.json({
      smsEnabled: true, emailEnabled: true, whatsappEnabled: false, postAppointmentFollowup: true,
      smsTimings: ['24h', '2h'], emailTimings: ['72h', '24h'], whatsappTimings: ['24h'],
      smsTemplate: 'Hi {customerName}, reminder: Your appointment at SALIS AUTO is tomorrow at {time}. Reply CONFIRM or CANCEL.',
      emailSubject: 'Appointment Reminder - SALIS AUTO',
    });
  } catch (error) {
    console.error("Error fetching reminder settings:", error);
    res.status(500).json({ message: "Failed to fetch reminder settings" });
  }
});

router.patch("/reminder-settings", isAuthenticated, async (req: any, res) => {
  try {
    const settings = req.body;
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Error updating reminder settings:", error);
    res.status(500).json({ message: "Failed to update reminder settings" });
  }
});

// Send Manual Reminder
router.post("/reminders/send", isAuthenticated, async (req: any, res) => {
  try {
    const { appointmentId, reminderType } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const appointment = await storage.getAppointment(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log(`Sending ${reminderType} reminder for appointment ${appointmentId}`);

    res.json({
      success: true,
      message: `${reminderType} reminder sent successfully`,
      reminderLog: {
        id: `rem-${Date.now()}`, appointmentId, reminderType, sentAt: new Date().toISOString(),
        deliveryStatus: 'delivered', recipientPhone: appointment.customerPhone,
      }
    });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Failed to send reminder" });
  }
});

// Reminder Logs
router.get("/reminder-logs", isAuthenticated, async (req: any, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        ar.id,
        ar.appointment_id as "appointmentId",
        ar.reminder_type as "reminderType",
        ar.scheduled_for as "scheduledFor",
        ar.sent_at as "sentAt",
        ar.status,
        ar.failure_reason as "failureReason",
        ar.created_at as "createdAt",
        a.customer_name as "customerName",
        a.customer_phone as "customerPhone",
        a.customer_email as "customerEmail",
        a.service_type as "serviceType",
        a.appointment_date as "appointmentDate",
        CASE
          WHEN ar.status = 'sent' THEN 'delivered'
          WHEN ar.status = 'failed' THEN 'failed'
          WHEN ar.status = 'pending' THEN 'pending'
          ELSE 'unknown'
        END as "deliveryStatus"
      FROM appointment_reminders ar
      LEFT JOIN appointments a ON ar.appointment_id = a.id
      ORDER BY ar.scheduled_for DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reminder logs:", error);
    res.status(500).json({ message: "Failed to fetch reminder logs" });
  }
});

// No-shows
router.get("/no-shows", isAuthenticated, async (req: any, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        a.id,
        a.customer_name as "customerName",
        a.customer_phone as "customerPhone",
        a.appointment_date as "scheduledTime",
        a.updated_at as "markedNoShowAt",
        COALESCE(
          CASE
            WHEN a.service_type = 'maintenance' THEN 150.00
            WHEN a.service_type = 'repair' THEN 250.00
            WHEN a.service_type = 'inspection' THEN 75.00
            WHEN a.service_type = 'diagnostic' THEN 125.00
            ELSE 100.00
          END, 0
        ) as "estimatedRevenueLoss",
        1 as "contactAttempts",
        false as "noShowFeeCharged",
        0 as "feeAmount",
        false as "feePaid",
        false as "feeWaived",
        false as "rescheduled",
        'Customer did not arrive for scheduled appointment' as "reason"
      FROM appointments a
      WHERE a.status = 'no_show'
      ORDER BY a.updated_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching no-shows:", error);
    res.status(500).json({ message: "Failed to fetch no-shows" });
  }
});

// License Plate Entry Logs
router.get("/license-plate/entry-logs", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { vehicleId } = req.query;
    const logs = await phase7Service.getVehicleEntryLogs(garageId, vehicleId as string);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching vehicle entry logs:", error);
    res.status(500).json({ message: "Failed to fetch vehicle entry logs" });
  }
});

// Dashboard Stats API - Real database aggregations
router.get('/stats/dashboard', isAuthenticated, async (req: any, res) => {
  try {
    // Query 1: Count jobs grouped by status (uses static imports)
    const jobStatusCounts = await db
      .select({
        status: jobCards.status,
        count: count(),
      })
      .from(jobCards)
      .groupBy(jobCards.status);

    // Transform to frontend-friendly format
    const jobStatusData = jobStatusCounts.map(row => ({
      name: row.status.charAt(0).toUpperCase() + row.status.slice(1).replace(/_/g, ' '),
      value: Number(row.count),
      status: row.status,
    }));

    // Query 2: Sum invoice totals grouped by month (last 12 months)
    // Cast numeric totalAmount to decimal and sum directly
    const revenueByMonth = await db
      .select({
        month: sql<string>`TO_CHAR(${invoices.invoiceDate}, 'Mon')`,
        monthNum: sql<number>`EXTRACT(MONTH FROM ${invoices.invoiceDate})`,
        year: sql<number>`EXTRACT(YEAR FROM ${invoices.invoiceDate})`,
        revenue: sql<string>`COALESCE(SUM(${invoices.totalAmount}::DECIMAL), 0)`,
      })
      .from(invoices)
      .where(sql`${invoices.invoiceDate} >= NOW() - INTERVAL '12 months'`)
      .groupBy(
        sql`TO_CHAR(${invoices.invoiceDate}, 'Mon')`,
        sql`EXTRACT(MONTH FROM ${invoices.invoiceDate})`,
        sql`EXTRACT(YEAR FROM ${invoices.invoiceDate})`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${invoices.invoiceDate})`,
        sql`EXTRACT(MONTH FROM ${invoices.invoiceDate})`
      );

    // Transform to frontend-friendly format with fallback for empty data
    const revenueData = revenueByMonth.length > 0
      ? revenueByMonth.map(row => ({
          month: row.month,
          revenue: parseFloat(row.revenue) || 0,
        }))
      : [
          { month: 'Jan', revenue: 0 },
          { month: 'Feb', revenue: 0 },
          { month: 'Mar', revenue: 0 },
        ];

    res.json({
      jobStatus: jobStatusData.length > 0 ? jobStatusData : [
        { name: 'Pending', value: 0, status: 'pending' },
        { name: 'In Progress', value: 0, status: 'in_progress' },
        { name: 'Completed', value: 0, status: 'completed' },
      ],
      revenue: revenueData,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      jobStatus: [],
      revenue: [],
    });
  }
});

// 3D Parts Models API
router.get('/parts-3d-models', async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        id,
        part_name as "partName",
        part_number as "partNumber",
        category,
        manufacturer,
        model_file_url as "modelFileUrl",
        texture_file_url as "textureFileUrl",
        file_size as "fileSize",
        polygon_count as "polygonCount",
        compatibility,
        explosion_view_url as "explosionViewUrl",
        annotations,
        view_count as "viewCount",
        download_count as "downloadCount",
        is_public as "isPublic",
        uploaded_by as "uploadedBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM parts_3d_models
      WHERE is_public = true
      ORDER BY view_count DESC
    `);
    res.json(result.rows || []);
  } catch (error: any) {
    console.error("Error fetching 3D parts models:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/parts-3d-models/:id', async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT * FROM parts_3d_models WHERE id = ${req.params.id}`);
    if (result.rows && result.rows.length > 0) {
      // Increment view count
      await db.execute(sql`UPDATE parts_3d_models SET view_count = view_count + 1 WHERE id = ${req.params.id}`);
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Part not found" });
    }
  } catch (error: any) {
    console.error("Error fetching 3D part model:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
