import { describe, it, expect, vi } from 'vitest';
import { SubscriptionLicenseService } from '../services/subscription-license.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createLicense: vi.fn(async (d: Record<string, unknown>) => ({ id: 'l1', ...d })),
    getLicenses: vi.fn(async () => [{ id: 'l1' }]),
    getLicenseById: vi.fn(async () => ({ id: 'l1' })),
    updateLicense: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'l1', ...d })),
    deleteLicense: vi.fn(async () => undefined),
    getAuditLogs: vi.fn(async () => [{ id: 'log1' }]),
    ...o,
  };
}

describe('SubscriptionLicenseService', () => {
  it('forwards the optional branchId + status filters on list', async () => {
    const r = repo();
    const svc = new SubscriptionLicenseService(r as never);
    await svc.listLicenses('b1', { status: 'active' });
    expect(r.getLicenses).toHaveBeenCalledWith('b1', { status: 'active' });
    await svc.listLicenses();
    expect(r.getLicenses).toHaveBeenCalledWith(undefined, undefined);
  });

  it('passes create/update/delete straight through to the repository', async () => {
    const r = repo();
    const svc = new SubscriptionLicenseService(r as never);
    await svc.createLicense({ licenseKey: 'K-1', branchId: 'b1' } as never);
    await svc.updateLicense('l1', { maxSeats: 5 } as never);
    await svc.deleteLicense('l1');
    expect(r.createLicense).toHaveBeenCalledWith({ licenseKey: 'K-1', branchId: 'b1' });
    expect(r.updateLicense).toHaveBeenCalledWith('l1', { maxSeats: 5 });
    expect(r.deleteLicense).toHaveBeenCalledWith('l1');
  });

  it('returns the license row from getLicense (controller owns the 404)', async () => {
    expect(await new SubscriptionLicenseService(repo() as never).getLicense('l1')).toEqual({ id: 'l1' });
    expect(await new SubscriptionLicenseService(repo({ getLicenseById: vi.fn(async () => undefined) }) as never).getLicense('x')).toBeUndefined();
  });

  it('scopes audit-log lookups by licenseId', async () => {
    const r = repo();
    await new SubscriptionLicenseService(r as never).listAuditLogs('l1');
    expect(r.getAuditLogs).toHaveBeenCalledWith('l1');
  });
});
