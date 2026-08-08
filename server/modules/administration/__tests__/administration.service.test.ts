import { describe, it, expect, vi } from 'vitest';
import { AdministrationService } from '../services/administration.service';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getStatsData: vi.fn(async () => ({
      totalGarages: 10,
      activeGarages: 8,
      totalUsers: 50,
      totalSuppliers: 5,
      supportTickets: 3,
      pendingApplications: 2,
      pendingSubscriptionRequests: 1,
      planMix: [{ plan: 'PRO', count: 4 }, { plan: 'STARTER', count: 6 }],
      roleCounts: [{ role: 'ADMIN', count: 10 }],
    })),
    uptimeSeconds: vi.fn(() => 123),
    listGarages: vi.fn(async () => [{ id: 'g1' }]),
    findGarageByName: vi.fn(async () => false),
    createGarage: vi.fn(async (i: Record<string, unknown>) => ({ id: 'gNew', ...i })),
    setGarageActive: vi.fn(async () => undefined),
    listSuppliers: vi.fn(async () => [{ id: 's1' }]),
    listSupportTickets: vi.fn(async () => [{ id: 't1' }]),
    updateSupportTicket: vi.fn(async () => ({ id: 't1', status: 'resolved' })),
    probeDbHealth: vi.fn(async () => ({ dbOk: true, dbLatencyMs: 4, dbConnections: 7 })),
    systemMetrics: vi.fn(() => ({ uptimeSeconds: 123, memoryRssMb: 100, memoryHeapUsedMb: 50, nodeVersion: 'v20' })),
    integrationConfig: vi.fn((dbOk: boolean) => [{ name: 'PostgreSQL Database', configured: true, operational: dbOk }]),
    listGarageApplications: vi.fn(async () => [{ id: 'a1' }]),
    getGarageApplication: vi.fn(async () => ({ id: 'a1', email: 'o@x.sa', status: 'pending', ownerPasswordHash: 'hash' })),
    approveGarageApplication: vi.fn(async () => ({ application: { id: 'a1' }, garageId: 'gNew' })),
    rejectGarageApplication: vi.fn(async () => ({ id: 'a1', status: 'rejected' })),
    mintTempCredential: vi.fn(async () => ({ plaintext: 'temp-pw', hash: 'temp-hash' })),
    listSubscriptionRequests: vi.fn(async () => [{ id: 'r1' }]),
    approveSubscriptionRequest: vi.fn(async () => ({ id: 'r1', status: 'approved' })),
    rejectSubscriptionRequest: vi.fn(async () => ({ id: 'r1', status: 'rejected' })),
    ...o,
  };
}

describe('AdministrationService — stats', () => {
  it('computes MRR from the live plan mix and appends uptime', async () => {
    // Prices come from @shared/plans; assert MRR is a finite number and shape holds.
    const r = repo();
    const stats = await new AdministrationService(r as never).getStats();
    expect(stats).toMatchObject({ totalGarages: 10, activeGarages: 8, totalUsers: 50, uptimeSeconds: 123 });
    expect(typeof stats.monthlyRevenue).toBe('number');
    expect(stats.planMix).toEqual([{ plan: 'PRO', count: 4 }, { plan: 'STARTER', count: 6 }]);
    expect(r.uptimeSeconds).toHaveBeenCalled();
  });
});

describe('AdministrationService — garages', () => {
  it('rejects a duplicate garage name with ValidationError', async () => {
    const r = repo({ findGarageByName: vi.fn(async () => true) });
    await expect(new AdministrationService(r as never).createGarage({ name: 'Dup' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('composes the address from address/city/country on create', async () => {
    const r = repo();
    await new AdministrationService(r as never).createGarage({
      name: 'Acme', address: '1 St', city: 'Riyadh', country: 'SA', phone: '5', email: 'a@x.sa',
    });
    expect(r.createGarage).toHaveBeenCalledWith(expect.objectContaining({ name: 'Acme', address: '1 St, Riyadh, SA' }));
  });

  it('maps status=active to isActive true', async () => {
    const r = repo();
    expect(await new AdministrationService(r as never).setGarageStatus('g1', 'active')).toEqual({ success: true });
    expect(r.setGarageActive).toHaveBeenCalledWith('g1', true);
  });

  it('maps any non-active status to isActive false', async () => {
    const r = repo();
    await new AdministrationService(r as never).setGarageStatus('g1', 'suspended');
    expect(r.setGarageActive).toHaveBeenCalledWith('g1', false);
  });
});

describe('AdministrationService — support tickets', () => {
  it('400s when no allow-listed field is present', async () => {
    await expect(new AdministrationService(repo() as never).updateSupportTicket('t1', { note: 'x' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('passes only allow-listed string fields through', async () => {
    const r = repo();
    await new AdministrationService(r as never).updateSupportTicket('t1', {
      status: 'resolved', priority: 'high', assignedTo: 'u1', bogus: 1,
    });
    expect(r.updateSupportTicket).toHaveBeenCalledWith('t1', { status: 'resolved', priority: 'high', assignedTo: 'u1' });
  });

  it('404s a ticket that does not update', async () => {
    const r = repo({ updateSupportTicket: vi.fn(async () => undefined) });
    await expect(new AdministrationService(r as never).updateSupportTicket('t1', { status: 'x' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('AdministrationService — system health', () => {
  it('assembles the measured probes into the health payload', async () => {
    const health = await new AdministrationService(repo() as never).getSystemHealth();
    expect(health).toMatchObject({
      uptimeSeconds: 123, dbOk: true, dbLatencyMs: 4, dbConnections: 7,
      memoryRssMb: 100, nodeVersion: 'v20',
    });
    expect(health.integrations[0]).toMatchObject({ name: 'PostgreSQL Database', operational: true });
  });
});

describe('AdministrationService — garage applications', () => {
  it('404s an unknown application on approve', async () => {
    const r = repo({ getGarageApplication: vi.fn(async () => undefined) });
    await expect(new AdministrationService(r as never).approveGarageApplication('a1', 'admin'))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('409s an already-rejected application on approve', async () => {
    const r = repo({ getGarageApplication: vi.fn(async () => ({ id: 'a1', status: 'rejected' })) });
    await expect(new AdministrationService(r as never).approveGarageApplication('a1', 'admin'))
      .rejects.toBeInstanceOf(ConflictError);
  });

  it('does NOT mint a temp password when the applicant already set one', async () => {
    const r = repo();
    const out = await new AdministrationService(r as never).approveGarageApplication('a1', 'admin');
    expect(r.mintTempCredential).not.toHaveBeenCalled();
    expect(r.approveGarageApplication).toHaveBeenCalledWith('a1', 'admin', { hashedPassword: undefined });
    expect(out).not.toHaveProperty('tempPassword');
    expect(out).toMatchObject({ garageId: 'gNew', ownerEmail: 'o@x.sa' });
  });

  it('mints + returns a one-time temp password when the applicant has none', async () => {
    const r = repo({ getGarageApplication: vi.fn(async () => ({ id: 'a1', email: 'o@x.sa', status: 'pending', ownerPasswordHash: null })) });
    const out = await new AdministrationService(r as never).approveGarageApplication('a1', 'admin');
    expect(r.mintTempCredential).toHaveBeenCalled();
    expect(r.approveGarageApplication).toHaveBeenCalledWith('a1', 'admin', { hashedPassword: 'temp-hash' });
    expect(out).toMatchObject({ tempPassword: 'temp-pw' });
  });

  it('404s a non-pending application on reject', async () => {
    const r = repo({ rejectGarageApplication: vi.fn(async () => undefined) });
    await expect(new AdministrationService(r as never).rejectGarageApplication('a1', 'admin', 'nope'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('AdministrationService — subscription requests', () => {
  it('404s an unknown request on approve', async () => {
    const r = repo({ approveSubscriptionRequest: vi.fn(async () => undefined) });
    await expect(new AdministrationService(r as never).approveSubscriptionRequest('r1', 'admin'))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('translates an "already ..." storage error into ConflictError', async () => {
    const r = repo({ approveSubscriptionRequest: vi.fn(async () => { throw new Error('already approved'); }) });
    await expect(new AdministrationService(r as never).approveSubscriptionRequest('r1', 'admin'))
      .rejects.toBeInstanceOf(ConflictError);
  });

  it('rethrows a non-"already" storage error unchanged', async () => {
    const r = repo({ approveSubscriptionRequest: vi.fn(async () => { throw new Error('db down'); }) });
    await expect(new AdministrationService(r as never).approveSubscriptionRequest('r1', 'admin'))
      .rejects.toThrow('db down');
  });

  it('404s a non-pending request on reject', async () => {
    const r = repo({ rejectSubscriptionRequest: vi.fn(async () => undefined) });
    await expect(new AdministrationService(r as never).rejectSubscriptionRequest('r1', 'admin', 'nope'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});
