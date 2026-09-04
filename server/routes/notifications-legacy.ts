import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { emailService } from "../services/emailService";
import { smsService } from "../services/smsService";
import { z } from "zod";
import type { InsertNotification } from "@shared/schema";

const router = Router();

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

// Email notification validation schemas
const appointmentConfirmationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garagePhone: z.string().optional(),
});

const invoiceNotificationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  totalAmount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
  invoiceLink: z.string().optional(),
});

const jobCompletedSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  vehicleInfo: z.string(),
  completedDate: z.string(),
  garageName: z.string(),
  pickupInstructions: z.string().optional(),
});

const feedbackRequestSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

const appointmentReminderSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garageAddress: z.string().optional(),
});

// SMS notification validation schemas
const smsAppointmentReminderSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

const smsAppointmentConfirmationSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

const smsJobStatusSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  status: z.string(),
  garageName: z.string(),
});

const smsJobCompletedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  garageName: z.string(),
  totalAmount: z.string().optional(),
});

const smsInvoiceSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
});

const smsPaymentReceivedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

const smsEstimateSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  estimateNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

const smsFeedbackRequestSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

// ==========================================
// NOTIFICATION CRUD ROUTES (Module 21)
// ==========================================

router.get('/notifications/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await storage.getNotification(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ message: "Failed to fetch notification" });
  }
});

router.post('/notifications', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userId = user?.id || 'default-user';
    const notificationData = {
      ...req.body,
      status: req.body.status || 'pending'
    };

    const notification = await storage.createNotification(notificationData);
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

router.patch('/notifications/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await storage.updateNotification(id, req.body);
    res.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
});

router.patch('/notifications/:id/read', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await storage.markNotificationAsRead(id);
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// Test notification endpoint - Feature #4
router.post('/notifications/test', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userId = user?.id || 'default-user';
    const userGarageId = user?.garageId;

    const testNotification: InsertNotification = {
      type: 'in-app',
      category: 'general',
      status: 'delivered',
      recipientId: userId,
      garageId: userGarageId || undefined,
      title: 'Test Notification',
      message: `This is a test notification sent at ${new Date().toLocaleString()}`,
      metadata: { test: true, timestamp: new Date().toISOString() },
      sentAt: new Date(),
    };

    const notification = await storage.createNotification(testNotification);
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({ message: "Failed to create test notification" });
  }
});

// ==========================================
// EMAIL NOTIFICATION ROUTES (Module 21)
// ==========================================

router.post('/notifications/email/appointment-confirmation', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = appointmentConfirmationSchema.parse(req.body);
    const { customerEmail, recipientId, garageId, ...params } = validatedData;
    const template = emailService.appointmentConfirmation(params);

    await emailService.sendEmail({
      to: customerEmail,
      recipientId,
      garageId,
      template,
      category: 'appointment',
      metadata: { type: 'confirmation', ...params }
    });

    res.json({ message: 'Appointment confirmation sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending appointment confirmation:", error);
    res.status(500).json({ message: "Failed to send appointment confirmation" });
  }
});

router.post('/notifications/email/invoice', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = invoiceNotificationSchema.parse(req.body);
    const { customerEmail, recipientId, garageId, ...params } = validatedData;
    const template = emailService.invoiceNotification(params);

    await emailService.sendEmail({
      to: customerEmail,
      recipientId,
      garageId,
      template,
      category: 'invoice',
      metadata: { type: 'invoice', ...params }
    });

    res.json({ message: 'Invoice notification sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending invoice notification:", error);
    res.status(500).json({ message: "Failed to send invoice notification" });
  }
});

router.post('/notifications/email/job-completed', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = jobCompletedSchema.parse(req.body);
    const { customerEmail, recipientId, garageId, ...params } = validatedData;
    const template = emailService.jobCompletedNotification(params);

    await emailService.sendEmail({
      to: customerEmail,
      recipientId,
      garageId,
      template,
      category: 'job_completed',
      metadata: { type: 'job_completed', ...params }
    });

    res.json({ message: 'Job completion notification sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending job completion notification:", error);
    res.status(500).json({ message: "Failed to send job completion notification" });
  }
});

router.post('/notifications/email/feedback-request', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = feedbackRequestSchema.parse(req.body);
    const { customerEmail, recipientId, garageId, ...params } = validatedData;
    const template = emailService.feedbackRequest(params);

    await emailService.sendEmail({
      to: customerEmail,
      recipientId,
      garageId,
      template,
      category: 'feedback_request',
      metadata: { type: 'feedback_request', ...params }
    });

    res.json({ message: 'Feedback request sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending feedback request:", error);
    res.status(500).json({ message: "Failed to send feedback request" });
  }
});

router.post('/notifications/email/appointment-reminder', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = appointmentReminderSchema.parse(req.body);
    const { customerEmail, recipientId, garageId, ...params } = validatedData;
    const template = emailService.appointmentReminder(params);

    await emailService.sendEmail({
      to: customerEmail,
      recipientId,
      garageId,
      template,
      category: 'appointment',
      metadata: { type: 'reminder', ...params }
    });

    res.json({ message: 'Appointment reminder sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending appointment reminder:", error);
    res.status(500).json({ message: "Failed to send appointment reminder" });
  }
});

// ==========================================
// SMS NOTIFICATION ROUTES (Module 24)
// ==========================================

router.post('/notifications/sms/appointment-reminder', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsAppointmentReminderSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.appointmentReminder(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'appointment',
      metadata: { type: 'reminder', ...params }
    });

    res.json({ message: 'SMS appointment reminder sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS appointment reminder:", error);
    res.status(500).json({ message: "Failed to send SMS appointment reminder" });
  }
});

router.post('/notifications/sms/appointment-confirmation', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsAppointmentConfirmationSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.appointmentConfirmation(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'appointment',
      metadata: { type: 'confirmation', ...params }
    });

    res.json({ message: 'SMS appointment confirmation sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS appointment confirmation:", error);
    res.status(500).json({ message: "Failed to send SMS appointment confirmation" });
  }
});

router.post('/notifications/sms/job-status', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsJobStatusSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.jobStatusUpdate(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'job_update',
      metadata: { type: 'status_update', ...params }
    });

    res.json({ message: 'SMS job status update sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS job status:", error);
    res.status(500).json({ message: "Failed to send SMS job status update" });
  }
});

router.post('/notifications/sms/job-completed', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsJobCompletedSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.jobCompleted(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'job_completed',
      metadata: { type: 'job_completed', ...params }
    });

    res.json({ message: 'SMS job completion notification sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS job completed:", error);
    res.status(500).json({ message: "Failed to send SMS job completion notification" });
  }
});

router.post('/notifications/sms/invoice', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsInvoiceSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.invoiceNotification(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'invoice',
      metadata: { type: 'invoice', ...params }
    });

    res.json({ message: 'SMS invoice notification sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS invoice:", error);
    res.status(500).json({ message: "Failed to send SMS invoice notification" });
  }
});

router.post('/notifications/sms/payment-received', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsPaymentReceivedSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.paymentReceived(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'payment',
      metadata: { type: 'payment_received', ...params }
    });

    res.json({ message: 'SMS payment confirmation sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS payment received:", error);
    res.status(500).json({ message: "Failed to send SMS payment confirmation" });
  }
});

router.post('/notifications/sms/estimate', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsEstimateSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.estimateReady(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'estimate',
      metadata: { type: 'estimate_ready', ...params }
    });

    res.json({ message: 'SMS estimate notification sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS estimate:", error);
    res.status(500).json({ message: "Failed to send SMS estimate notification" });
  }
});

router.post('/notifications/sms/feedback-request', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req: Request, res: Response) => {
  try {
    const validatedData = smsFeedbackRequestSchema.parse(req.body);
    const { customerPhone, recipientId, garageId, ...params } = validatedData;
    const template = smsService.feedbackRequest(params);

    await smsService.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category: 'feedback_request',
      metadata: { type: 'feedback_request', ...params }
    });

    res.json({ message: 'SMS feedback request sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error sending SMS feedback request:", error);
    res.status(500).json({ message: "Failed to send SMS feedback request" });
  }
});

export const notificationsLegacyRoutes = router;
