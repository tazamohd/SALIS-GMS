import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LicensingService } from '../services/licensing.service';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/errors/domain-errors';

function lic(over: Record<string, unknown> = {}) {
  return {
    id: 'lic-1',
    licenseKey: 'SALIS.body.sig',
    plan: 'PRO',
    type: 'subscription',
    status: 'issued',
    maxUsers: null,
    maxBranches: null,
    maxGarages: null,
    maxVehicles: null,
    storageGb: null,
    apiQuotaPerDay: null,
    boundGarageId: null,
    activatedAt: null,
    expiresAt: null,
    offlineGraceDays: 7,
    ...over,
  };
}

function repo(o: Record<string, unknown> = {}) {
  return {
    newId: vi.fn(() => 'lic-1'),
    sign: vi.fn(() => 'SALIS.body.sig'),
    verify: vi.fn(() => ({ valid: true })),
    create: vi.fn(async (row: Record<string, unknown>) => ({ ...lic(), ...row })),
    getById: vi.fn(async () => lic()),
    getByKey: vi.fn(async () => lic()),
    list: vi.fn(async () => [lic()]),
    update: vi.fn(async (id: string, patch: Record<string, unknown>) => ({ ...lic(), id, ...patch })),
    recordActivation: vi.fn(async () => undefined),
    listActivations: vi.fn(async () => []),
    ...o,
  };
}

describe('LicensingService — issue', () => {
  it('rejects an invalid plan', async () => {
    await expect(new LicensingService(repo() as never).issue({ plan: 'GOLD' }, 'admin'))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('resolves limits from @shared/plans when not overridden, and signs the key', async () => {
    const r = repo();
    const out = await new LicensingService(r as never).issue({ plan: 'pro' }, 'admin');
    // PRO plan defaults: users 15, branches 3, storage 50.
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      plan: 'PRO', maxUsers: 15, maxBranches: 3, storageGb: 50, status: 'issued',
    }));
    expect(r.sign).toHaveBeenCalled();
    expect(out.licenseKey).toBe('SALIS.body.sig');
  });

  it('honors explicit overrides and unlimited (ENTERPRISE → null)', async () => {
    const r = repo();
    await new LicensingService(r as never).issue({ plan: 'ENTERPRISE', maxVehicles: 500 }, 'admin');
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({ maxUsers: null, maxVehicles: 500 }));
  });

  it('a bound issue is active and records an activation', async () => {
    const r = repo();
    await new LicensingService(r as never).issue({ plan: 'PRO', boundGarageId: 'g1' }, 'admin');
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'active', boundGarageId: 'g1' }));
    expect(r.recordActivation).toHaveBeenCalledWith(expect.objectContaining({ action: 'activated', garageId: 'g1' }));
  });
});

describe('LicensingService — activate', () => {
  it('400s without a garage', async () => {
    await expect(new LicensingService(repo() as never).activate('k', undefined, 'u'))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it('400s an invalid signature', async () => {
    const r = repo({ verify: vi.fn(() => ({ valid: false })) });
    await expect(new LicensingService(r as never).activate('k', 'g1', 'u')).rejects.toBeInstanceOf(ValidationError);
  });
  it('404s an unknown key', async () => {
    const r = repo({ getByKey: vi.fn(async () => undefined) });
    await expect(new LicensingService(r as never).activate('k', 'g1', 'u')).rejects.toBeInstanceOf(NotFoundError);
  });
  it('409s a revoked license', async () => {
    const r = repo({ getByKey: vi.fn(async () => lic({ status: 'revoked' })) });
    await expect(new LicensingService(r as never).activate('k', 'g1', 'u')).rejects.toBeInstanceOf(ConflictError);
  });
  it('409s a license bound to another tenant', async () => {
    const r = repo({ getByKey: vi.fn(async () => lic({ boundGarageId: 'other' })) });
    await expect(new LicensingService(r as never).activate('k', 'g1', 'u')).rejects.toBeInstanceOf(ConflictError);
  });
  it('binds the key and records an activation on success', async () => {
    const r = repo();
    const out = await new LicensingService(r as never).activate('k', 'g1', 'u');
    expect(r.update).toHaveBeenCalledWith('lic-1', expect.objectContaining({ status: 'active', boundGarageId: 'g1' }));
    expect(r.recordActivation).toHaveBeenCalledWith(expect.objectContaining({ action: 'activated', garageId: 'g1' }));
    expect(out.entitlements.plan).toBe('PRO');
  });
});

describe('LicensingService — validate (time-sensitive)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns valid=false on a bad signature', async () => {
    const r = repo({ verify: vi.fn(() => ({ valid: false, reason: 'signature mismatch' })) });
    expect(await new LicensingService(r as never).validate('k')).toMatchObject({ valid: false });
  });

  it('returns revoked=false for a revoked license', async () => {
    const r = repo({ getByKey: vi.fn(async () => lic({ status: 'revoked' })) });
    expect(await new LicensingService(r as never).validate('k')).toMatchObject({ valid: false, status: 'revoked' });
  });

  it('is valid+active before expiry', async () => {
    vi.setSystemTime(new Date('2026-06-01T00:00:00Z'));
    const r = repo({ getByKey: vi.fn(async () => lic({ expiresAt: new Date('2026-12-01T00:00:00Z') })) });
    expect(await new LicensingService(r as never).validate('k')).toMatchObject({ valid: true, status: 'active' });
  });

  it('is valid but in grace between expiry and grace-end', async () => {
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z')); // 2 days past expiry, grace 7
    const r = repo({ getByKey: vi.fn(async () => lic({ expiresAt: new Date('2026-06-01T00:00:00Z'), offlineGraceDays: 7 })) });
    const out = await new LicensingService(r as never).validate('k');
    expect(out).toMatchObject({ valid: true, status: 'grace' });
    expect(out.graceUntil).toBeTruthy();
  });

  it('is invalid + marks expired past the grace window', async () => {
    vi.setSystemTime(new Date('2026-06-20T00:00:00Z')); // 19 days past expiry, grace 7
    const r = repo({ getByKey: vi.fn(async () => lic({ expiresAt: new Date('2026-06-01T00:00:00Z'), offlineGraceDays: 7 })) });
    expect(await new LicensingService(r as never).validate('k')).toMatchObject({ valid: false, status: 'expired' });
    expect(r.update).toHaveBeenCalledWith('lic-1', expect.objectContaining({ status: 'expired' }));
  });
});

describe('LicensingService — renew / revoke / deactivate', () => {
  it('renew rejects a revoked license', async () => {
    const r = repo({ getById: vi.fn(async () => lic({ status: 'revoked' })) });
    await expect(new LicensingService(r as never).renew('lic-1', 30, 'u')).rejects.toBeInstanceOf(ConflictError);
  });
  it('renew extends and reactivates', async () => {
    const r = repo();
    await new LicensingService(r as never).renew('lic-1', 30, 'u');
    expect(r.update).toHaveBeenCalledWith('lic-1', expect.objectContaining({ status: 'active' }));
    expect(r.recordActivation).toHaveBeenCalledWith(expect.objectContaining({ action: 'renewed' }));
  });
  it('revoke 404s a missing license', async () => {
    const r = repo({ getById: vi.fn(async () => undefined) });
    await expect(new LicensingService(r as never).revoke('x', 'fraud', 'u')).rejects.toBeInstanceOf(NotFoundError);
  });
  it('revoke sets status revoked + audits', async () => {
    const r = repo();
    await new LicensingService(r as never).revoke('lic-1', 'fraud', 'u');
    expect(r.update).toHaveBeenCalledWith('lic-1', expect.objectContaining({ status: 'revoked', revokedReason: 'fraud' }));
    expect(r.recordActivation).toHaveBeenCalledWith(expect.objectContaining({ action: 'revoked' }));
  });
  it('deactivate rejects a revoked license and unbinds otherwise', async () => {
    await expect(new LicensingService(repo({ getById: vi.fn(async () => lic({ status: 'revoked' })) }) as never).deactivate('lic-1', 'u'))
      .rejects.toBeInstanceOf(ConflictError);
    const r = repo({ getById: vi.fn(async () => lic({ status: 'active', boundGarageId: 'g1' })) });
    await new LicensingService(r as never).deactivate('lic-1', 'u');
    expect(r.update).toHaveBeenCalledWith('lic-1', expect.objectContaining({ status: 'issued', boundGarageId: null }));
  });
});
