import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { insertIntegrationConnectionSchema } from "@shared/schema";

const router = Router();

// ==========================================
// INTEGRATION CONNECTIONS ROUTES (Module 33)
// ==========================================

router.get('/integrations/connections', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const connections = await storage.getIntegrationConnections(userGarageId);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching integration connections:", error);
    res.status(500).json({ message: "Failed to fetch integration connections" });
  }
});

router.post('/integrations/connections', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const validatedData = insertIntegrationConnectionSchema.parse({
      ...req.body,
      garageId: userGarageId,
    });
    const connection = await storage.createIntegrationConnection(validatedData);
    res.json(connection);
  } catch (error: any) {
    console.error("Error creating integration connection:", error);
    res.status(500).json({ message: "Failed to create integration connection", error: error.message });
  }
});

router.patch('/integrations/connections/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const existing = await storage.getIntegrationConnection(req.params.id);

    if (!existing || existing.garageId !== userGarageId) {
      return res.status(404).json({ message: "Integration connection not found" });
    }

    const connection = await storage.updateIntegrationConnection(req.params.id, req.body);
    res.json(connection);
  } catch (error) {
    console.error("Error updating integration connection:", error);
    res.status(500).json({ message: "Failed to update integration connection" });
  }
});

router.delete('/integrations/connections/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const existing = await storage.getIntegrationConnection(req.params.id);

    if (!existing || existing.garageId !== userGarageId) {
      return res.status(404).json({ message: "Integration connection not found" });
    }

    await storage.deleteIntegrationConnection(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting integration connection:", error);
    res.status(500).json({ message: "Failed to delete integration connection" });
  }
});

// ==========================================
// INTEGRATION SYNC LOGS ROUTES
// ==========================================

router.get('/integrations/sync-logs', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { connectionId } = req.query;
    const logs = await storage.getIntegrationSyncLogs(userGarageId, connectionId as string);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching integration sync logs:", error);
    res.status(500).json({ message: "Failed to fetch integration sync logs" });
  }
});

// ==========================================
// GOOGLE CALENDAR SYNC ROUTES
// ==========================================

router.post('/integrations/google-calendar/sync-appointment', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { syncAppointmentToGoogleCalendar } = await import('../integrations/googleCalendar.js');

    const result = await syncAppointmentToGoogleCalendar(req.body);

    // Log sync activity
    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'google-calendar-appointment',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error syncing to Google Calendar:", error);
    res.status(500).json({ message: "Failed to sync to Google Calendar", error: error.message });
  }
});

router.post('/integrations/google-calendar/update-event', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { updateGoogleCalendarEvent } = await import('../integrations/googleCalendar.js');
    const { eventId, appointment } = req.body;

    const result = await updateGoogleCalendarEvent(eventId, appointment);

    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'google-calendar-update',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error updating Google Calendar event:", error);
    res.status(500).json({ message: "Failed to update Google Calendar event", error: error.message });
  }
});

router.delete('/integrations/google-calendar/delete-event/:eventId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { deleteGoogleCalendarEvent } = await import('../integrations/googleCalendar.js');

    const result = await deleteGoogleCalendarEvent(req.params.eventId);

    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'google-calendar-delete',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error deleting Google Calendar event:", error);
    res.status(500).json({ message: "Failed to delete Google Calendar event", error: error.message });
  }
});

// ==========================================
// GMAIL ROUTES
// ==========================================

router.post('/integrations/gmail/send-email', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { sendEmail } = await import('../integrations/gmail.js');

    const result = await sendEmail(req.body);

    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'gmail-send',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending email via Gmail:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

router.post('/integrations/gmail/send-appointment-confirmation', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { sendAppointmentConfirmationEmail } = await import('../integrations/gmail.js');
    const { appointment, customer } = req.body;

    const result = await sendAppointmentConfirmationEmail(appointment, customer);

    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'gmail-appointment-confirmation',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending appointment confirmation:", error);
    res.status(500).json({ message: "Failed to send appointment confirmation", error: error.message });
  }
});

router.post('/integrations/gmail/send-invoice', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { sendInvoiceEmail } = await import('../integrations/gmail.js');
    const { invoice, customer } = req.body;

    const result = await sendInvoiceEmail(invoice, customer);

    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'gmail-invoice',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    res.status(500).json({ message: "Failed to send invoice email", error: error.message });
  }
});

router.post('/integrations/gmail/send-service-reminder', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { sendServiceReminderEmail } = await import('../integrations/gmail.js');
    const { reminder, customer, vehicle } = req.body;

    const result = await sendServiceReminderEmail(reminder, customer, vehicle);

    await storage.createIntegrationSyncLog({
      garageId: userGarageId,
      syncType: 'gmail-service-reminder',
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending service reminder:", error);
    res.status(500).json({ message: "Failed to send service reminder", error: error.message });
  }
});

// ==========================================
// ACCOUNTING INTEGRATION ROUTES (Stub for QuickBooks/Xero)
// ==========================================

router.get('/integrations/accounting/transactions', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { syncStatus } = req.query;
    const transactions = await storage.getAccountingTransactions(userGarageId, syncStatus as string);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching accounting transactions:", error);
    res.status(500).json({ message: "Failed to fetch accounting transactions" });
  }
});

router.post('/integrations/accounting/sync', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;

    // Placeholder for QuickBooks/Xero integration
    // Will be implemented when user provides API credentials

    res.json({
      success: false,
      message: "Accounting integration not configured. Please provide QuickBooks or Xero API credentials."
    });
  } catch (error: any) {
    console.error("Error syncing accounting data:", error);
    res.status(500).json({ message: "Failed to sync accounting data", error: error.message });
  }
});

// ==========================================
// OBD-II DIAGNOSTICS ROUTES (Stub)
// ==========================================

router.get('/integrations/obd/diagnostics', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;
    const { vehicleId } = req.query;
    const diagnostics = await storage.getOBDDiagnostics(userGarageId, vehicleId as string);
    res.json(diagnostics);
  } catch (error) {
    console.error("Error fetching OBD diagnostics:", error);
    res.status(500).json({ message: "Failed to fetch OBD diagnostics" });
  }
});

router.post('/integrations/obd/scan', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;

    // Placeholder for OBD-II adapter integration
    // Will be implemented when user provides OBD adapter API/SDK

    res.json({
      success: false,
      message: "OBD-II diagnostics integration not configured. Please connect an OBD-II adapter."
    });
  } catch (error: any) {
    console.error("Error scanning OBD data:", error);
    res.status(500).json({ message: "Failed to scan OBD data", error: error.message });
  }
});

export const integrationsRoutes = router;
