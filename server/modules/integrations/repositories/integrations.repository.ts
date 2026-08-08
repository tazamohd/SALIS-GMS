/**
 * Integrations repository (Phase E). The only data-layer / external-service
 * access for the integrations domain: the `storage` integration-connection +
 * sync-log + accounting/OBD reads, and the Google-Calendar / Gmail provider
 * seams (dynamically imported, matching the monolith). Delegation only.
 */

import { storage } from '../../../storage';

export class IntegrationsRepository {
  // Storage
  getConnections(garageId?: string) {
    return storage.getIntegrationConnections(garageId as never);
  }
  createConnection(data: Parameters<typeof storage.createIntegrationConnection>[0]) {
    return storage.createIntegrationConnection(data);
  }
  getConnection(id: string) {
    return storage.getIntegrationConnection(id);
  }
  updateConnection(id: string, body: Parameters<typeof storage.updateIntegrationConnection>[1]) {
    return storage.updateIntegrationConnection(id, body);
  }
  deleteConnection(id: string) {
    return storage.deleteIntegrationConnection(id);
  }
  getSyncLogs(garageId?: string, connectionId?: string) {
    return storage.getIntegrationSyncLogs(garageId as never, connectionId as never);
  }
  createSyncLog(data: Parameters<typeof storage.createIntegrationSyncLog>[0]) {
    return storage.createIntegrationSyncLog(data);
  }
  getAccountingTransactions(garageId?: string, syncStatus?: string) {
    return storage.getAccountingTransactions(garageId as never, syncStatus as never);
  }
  getOBDDiagnostics(garageId?: string, vehicleId?: string) {
    return storage.getOBDDiagnostics(garageId as never, vehicleId as never);
  }

  // Google Calendar seam (dynamic import — matches the legacy handlers).
  async gcSyncAppointment(body: unknown) {
    const { syncAppointmentToGoogleCalendar } = await import('../../../integrations/googleCalendar.js');
    return syncAppointmentToGoogleCalendar(body as never);
  }
  async gcUpdateEvent(eventId: string, appointment: unknown) {
    const { updateGoogleCalendarEvent } = await import('../../../integrations/googleCalendar.js');
    return updateGoogleCalendarEvent(eventId, appointment as never);
  }
  async gcDeleteEvent(eventId: string) {
    const { deleteGoogleCalendarEvent } = await import('../../../integrations/googleCalendar.js');
    return deleteGoogleCalendarEvent(eventId);
  }

  // Gmail seam (dynamic import).
  async gmailSend(body: unknown) {
    const { sendEmail } = await import('../../../integrations/gmail.js');
    return sendEmail(body as never);
  }
  async gmailAppointmentConfirmation(appointment: unknown, customer: unknown) {
    const { sendAppointmentConfirmationEmail } = await import('../../../integrations/gmail.js');
    return sendAppointmentConfirmationEmail(appointment as never, customer as never);
  }
  async gmailInvoice(invoice: unknown, customer: unknown) {
    const { sendInvoiceEmail } = await import('../../../integrations/gmail.js');
    return sendInvoiceEmail(invoice as never, customer as never);
  }
  async gmailServiceReminder(reminder: unknown, customer: unknown, vehicle: unknown) {
    const { sendServiceReminderEmail } = await import('../../../integrations/gmail.js');
    return sendServiceReminderEmail(reminder as never, customer as never, vehicle as never);
  }
}

export type IIntegrationsRepository = IntegrationsRepository;
