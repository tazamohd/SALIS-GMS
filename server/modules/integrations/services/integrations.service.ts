/**
 * Integrations service (Phase E — Domain Services).
 *
 * Owns the integration-connection CRUD (with the garage-scoped not-found 404),
 * the Google-Calendar / Gmail sync orchestration (call the provider seam, then
 * write an integration sync-log recording the outcome), and the accounting/OBD
 * reads + not-configured stubs. Connection create keeps the legacy behavior of
 * letting a Zod parse error surface (the controller renders it as a 500). All
 * data / provider access flows through the repository.
 */

import { insertIntegrationConnectionSchema } from '@shared/schema';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IntegrationsRepository } from '../repositories/integrations.repository';

interface SyncResult {
  success?: boolean;
  error?: string;
  [k: string]: unknown;
}

export class IntegrationsService {
  constructor(private readonly repository: IntegrationsRepository) {}

  listConnections(garageId?: string) {
    return this.repository.getConnections(garageId);
  }
  /** Note: a Zod parse failure here propagates and is rendered as a 500 by the
   *  controller — preserving the legacy handler's behavior. */
  createConnection(garageId: string | undefined, body: Record<string, unknown>) {
    const data = insertIntegrationConnectionSchema.parse({ ...body, garageId });
    return this.repository.createConnection(data as never);
  }
  async updateConnection(id: string, garageId: string | undefined, body: Record<string, unknown>) {
    const existing = await this.repository.getConnection(id);
    if (!existing || existing.garageId !== garageId) throw new NotFoundError('Integration connection not found');
    return this.repository.updateConnection(id, body as never);
  }
  async deleteConnection(id: string, garageId: string | undefined) {
    const existing = await this.repository.getConnection(id);
    if (!existing || existing.garageId !== garageId) throw new NotFoundError('Integration connection not found');
    await this.repository.deleteConnection(id);
    return { success: true };
  }
  listSyncLogs(garageId?: string, connectionId?: string) {
    return this.repository.getSyncLogs(garageId, connectionId);
  }

  private async logSync(garageId: string | undefined, syncType: string, result: SyncResult) {
    await this.repository.createSyncLog({
      garageId,
      syncType,
      status: result.success ? 'success' : 'failed',
      recordsProcessed: result.success ? 1 : 0,
      errorMessage: result.error,
      syncData: result,
    } as never);
  }

  async syncGoogleAppointment(garageId: string | undefined, body: unknown) {
    const result = (await this.repository.gcSyncAppointment(body)) as SyncResult;
    await this.logSync(garageId, 'google-calendar-appointment', result);
    return result;
  }
  async updateGoogleEvent(garageId: string | undefined, eventId: string, appointment: unknown) {
    const result = (await this.repository.gcUpdateEvent(eventId, appointment)) as SyncResult;
    await this.logSync(garageId, 'google-calendar-update', result);
    return result;
  }
  async deleteGoogleEvent(garageId: string | undefined, eventId: string) {
    const result = (await this.repository.gcDeleteEvent(eventId)) as SyncResult;
    await this.logSync(garageId, 'google-calendar-delete', result);
    return result;
  }

  async gmailSend(garageId: string | undefined, body: unknown) {
    const result = (await this.repository.gmailSend(body)) as SyncResult;
    await this.logSync(garageId, 'gmail-send', result);
    return result;
  }
  async gmailAppointmentConfirmation(garageId: string | undefined, appointment: unknown, customer: unknown) {
    const result = (await this.repository.gmailAppointmentConfirmation(appointment, customer)) as SyncResult;
    await this.logSync(garageId, 'gmail-appointment-confirmation', result);
    return result;
  }
  async gmailInvoice(garageId: string | undefined, invoice: unknown, customer: unknown) {
    const result = (await this.repository.gmailInvoice(invoice, customer)) as SyncResult;
    await this.logSync(garageId, 'gmail-invoice', result);
    return result;
  }
  async gmailServiceReminder(garageId: string | undefined, reminder: unknown, customer: unknown, vehicle: unknown) {
    const result = (await this.repository.gmailServiceReminder(reminder, customer, vehicle)) as SyncResult;
    await this.logSync(garageId, 'gmail-service-reminder', result);
    return result;
  }

  getAccountingTransactions(garageId?: string, syncStatus?: string) {
    return this.repository.getAccountingTransactions(garageId, syncStatus);
  }
  accountingSyncStub() {
    return {
      success: false,
      message: 'Accounting integration not configured. Please provide QuickBooks or Xero API credentials.',
    };
  }
  getOBDDiagnostics(garageId?: string, vehicleId?: string) {
    return this.repository.getOBDDiagnostics(garageId, vehicleId);
  }
  obdScanStub() {
    return {
      success: false,
      message: 'OBD-II diagnostics integration not configured. Please connect an OBD-II adapter.',
    };
  }
}
