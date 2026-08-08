import { describe, it, expect, vi } from 'vitest';
import { IntegrationsService } from '../services/integrations.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getConnections: vi.fn(async () => [{ id: 'c1' }]),
    createConnection: vi.fn(async (d: Record<string, unknown>) => ({ id: 'c1', ...d })),
    getConnection: vi.fn(async () => ({ id: 'c1', garageId: 'g1' })),
    updateConnection: vi.fn(async () => ({ id: 'c1', status: 'active' })),
    deleteConnection: vi.fn(async () => undefined),
    getSyncLogs: vi.fn(async () => [{ id: 'l1' }]),
    createSyncLog: vi.fn(async () => ({ id: 'l1' })),
    getAccountingTransactions: vi.fn(async () => [{ id: 't1' }]),
    getOBDDiagnostics: vi.fn(async () => [{ id: 'd1' }]),
    gcSyncAppointment: vi.fn(async () => ({ success: true, eventId: 'e1' })),
    gcUpdateEvent: vi.fn(async () => ({ success: true })),
    gcDeleteEvent: vi.fn(async () => ({ success: true })),
    gmailSend: vi.fn(async () => ({ success: true })),
    gmailAppointmentConfirmation: vi.fn(async () => ({ success: true })),
    gmailInvoice: vi.fn(async () => ({ success: true })),
    gmailServiceReminder: vi.fn(async () => ({ success: false, error: 'no creds' })),
    ...o,
  };
}

describe('IntegrationsService — connections', () => {
  it('404s an update on a missing or cross-garage connection', async () => {
    await expect(new IntegrationsService(repo({ getConnection: vi.fn(async () => undefined) }) as never).updateConnection('c1', 'g1', {}))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new IntegrationsService(repo({ getConnection: vi.fn(async () => ({ id: 'c1', garageId: 'other' })) }) as never).updateConnection('c1', 'g1', {}))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it('deletes an owned connection and returns success', async () => {
    const r = repo();
    expect(await new IntegrationsService(r as never).deleteConnection('c1', 'g1')).toEqual({ success: true });
    expect(r.deleteConnection).toHaveBeenCalledWith('c1');
  });
  it('404s a delete on a cross-garage connection', async () => {
    await expect(new IntegrationsService(repo({ getConnection: vi.fn(async () => ({ id: 'c1', garageId: 'other' })) }) as never).deleteConnection('c1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('IntegrationsService — sync orchestration', () => {
  it('writes a success sync-log after a Google Calendar sync', async () => {
    const r = repo();
    const result = await new IntegrationsService(r as never).syncGoogleAppointment('g1', { id: 'a1' });
    expect(result).toMatchObject({ success: true });
    expect(r.createSyncLog).toHaveBeenCalledWith(expect.objectContaining({
      garageId: 'g1', syncType: 'google-calendar-appointment', status: 'success', recordsProcessed: 1,
    }));
  });
  it('records a failed sync-log with recordsProcessed 0 + the error', async () => {
    const r = repo();
    await new IntegrationsService(r as never).gmailServiceReminder('g1', {}, {}, {});
    expect(r.createSyncLog).toHaveBeenCalledWith(expect.objectContaining({
      syncType: 'gmail-service-reminder', status: 'failed', recordsProcessed: 0, errorMessage: 'no creds',
    }));
  });
  it('tags each provider call with its own syncType', async () => {
    const r = repo();
    const s = new IntegrationsService(r as never);
    await s.updateGoogleEvent('g1', 'e1', {});
    await s.deleteGoogleEvent('g1', 'e1');
    await s.gmailSend('g1', {});
    await s.gmailInvoice('g1', {}, {});
    const types = r.createSyncLog.mock.calls.map((c) => (c[0] as { syncType: string }).syncType);
    expect(types).toEqual(['google-calendar-update', 'google-calendar-delete', 'gmail-send', 'gmail-invoice']);
  });
});

describe('IntegrationsService — accounting + OBD', () => {
  it('returns the not-configured stubs', () => {
    const s = new IntegrationsService(repo() as never);
    expect(s.accountingSyncStub()).toMatchObject({ success: false });
    expect(s.accountingSyncStub().message).toMatch(/QuickBooks or Xero/);
    expect(s.obdScanStub()).toMatchObject({ success: false });
    expect(s.obdScanStub().message).toMatch(/OBD-II/);
  });
  it('passes the accounting/OBD read filters through', async () => {
    const r = repo();
    const s = new IntegrationsService(r as never);
    await s.getAccountingTransactions('g1', 'pending');
    await s.getOBDDiagnostics('g1', 'v1');
    expect(r.getAccountingTransactions).toHaveBeenCalledWith('g1', 'pending');
    expect(r.getOBDDiagnostics).toHaveBeenCalledWith('g1', 'v1');
  });
});
