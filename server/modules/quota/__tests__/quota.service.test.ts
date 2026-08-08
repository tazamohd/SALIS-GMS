import { describe, it, expect, vi } from 'vitest';
import { QuotaService } from '../services/quota.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    activeLicense: vi.fn(async () => undefined),
    subscription: vi.fn(async () => ({ garageId: 'g1', plan: 'STARTER' })),
    usage: vi.fn(async () => ({ users: 1, vehicles: 0, jobsPerMonth: 0 })),
    ...o,
  };
}

describe('QuotaService — effective limits', () => {
  it('uses the subscription plan defaults from @shared/plans when no license', async () => {
    const s = new QuotaService(repo() as never);
    const st = await s.status('g1');
    // STARTER: users 3, branches 1, storage 5, jobs 200; vehicles/garages/api unlimited.
    expect(st.users).toMatchObject({ limit: 3, used: 1, remaining: 2, unlimited: false, tracked: true });
    expect(st.vehicles).toMatchObject({ limit: null, unlimited: true, tracked: true });
    expect(st.branches).toMatchObject({ limit: 1, used: null, tracked: false });
    expect(st.apiQuotaPerDay).toMatchObject({ limit: null, unlimited: true });
  });

  it('lets an active license override the plan default', async () => {
    const r = repo({
      activeLicense: vi.fn(async () => ({
        plan: 'PRO', maxUsers: null, maxBranches: null, maxVehicles: 100, maxGarages: null, storageGb: null, apiQuotaPerDay: 5000,
      })),
    });
    const st = await new QuotaService(r as never).status('g1');
    expect(st.users.limit).toBe(15); // PRO plan default (license maxUsers null)
    expect(st.vehicles.limit).toBe(100); // license override (plan has no vehicle limit)
    expect(st.apiQuotaPerDay.limit).toBe(5000); // license override
  });
});

describe('QuotaService — check (enforcement primitive)', () => {
  it('is ok (fail-open) for an unlimited resource', async () => {
    expect(await new QuotaService(repo() as never).check('vehicles', 'g1')).toMatchObject({ ok: true, limit: null });
  });

  it('is ok (fail-open) for an untracked resource even with a limit', async () => {
    // branches has a STARTER limit of 1 but usage is not tracked → never blocks.
    expect(await new QuotaService(repo() as never).check('branches', 'g1')).toMatchObject({ ok: true });
  });

  it('is ok while under a tracked limit', async () => {
    const r = repo({ usage: vi.fn(async () => ({ users: 2, vehicles: 0, jobsPerMonth: 0 })) });
    expect(await new QuotaService(r as never).check('users', 'g1')).toMatchObject({ ok: true, limit: 3, used: 2 });
  });

  it('blocks at or over a tracked limit', async () => {
    const r = repo({ usage: vi.fn(async () => ({ users: 3, vehicles: 0, jobsPerMonth: 0 })) });
    expect(await new QuotaService(r as never).check('users', 'g1')).toMatchObject({ ok: false, limit: 3, used: 3 });
  });

  it('enforces a license-set vehicle cap', async () => {
    const r = repo({
      activeLicense: vi.fn(async () => ({ plan: 'PRO', maxVehicles: 2, maxUsers: null, maxBranches: null, maxGarages: null, storageGb: null, apiQuotaPerDay: null })),
      usage: vi.fn(async () => ({ users: 0, vehicles: 2, jobsPerMonth: 0 })),
    });
    expect(await new QuotaService(r as never).check('vehicles', 'g1')).toMatchObject({ ok: false, limit: 2, used: 2 });
  });
});
