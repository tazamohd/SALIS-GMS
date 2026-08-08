import { describe, it, expect, vi } from 'vitest';
import { SubscriptionService } from '../services/subscription.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    ensure: vi.fn(async (garageId: string) => ({
      garageId, plan: 'STARTER', status: 'active',
      currentPeriodStart: new Date('2026-01-01'), currentPeriodEnd: new Date('2026-02-01'),
      cancelAt: null, canceledAt: null, stripeSubscriptionId: null, stripeCustomerId: null,
    })),
    update: vi.fn(async (_g: string, data: Record<string, unknown>) => ({ garageId: _g, ...data })),
    listAll: vi.fn(async () => [{ garageId: 'g1' }, { garageId: 'g2' }]),
    ...o,
  };
}

describe('SubscriptionService', () => {
  it('planCatalog exposes plans + category matrix + hierarchy', () => {
    const cat = new SubscriptionService(repo() as never).planCatalog();
    expect(cat.plans.length).toBe(3);
    expect(cat.hierarchy).toBeTruthy();
    expect(cat.categoryMinPlan).toBeTruthy();
  });

  it('current projects the subscription fields', async () => {
    const out = await new SubscriptionService(repo() as never).current('g1');
    expect(out).toMatchObject({ garageId: 'g1', plan: 'STARTER', status: 'active' });
    expect(Object.keys(out)).toContain('stripeCustomerId');
  });

  it('changePlan sets a one-month period and clears pending cancels', async () => {
    const r = repo();
    const now = new Date('2026-03-15T00:00:00Z');
    const out = await new SubscriptionService(r as never).changePlan('g1', 'PRO', now, false);
    const patch = r.update.mock.calls[0][1] as Record<string, unknown>;
    expect(patch.plan).toBe('PRO');
    expect(patch.status).toBe('active');
    expect(patch.cancelAt).toBeNull();
    expect((patch.currentPeriodEnd as Date).getMonth()).toBe(3); // April (0-indexed)
    expect(out.stripeReady).toBe(false);
    expect(out.note).toMatch(/not configured/);
  });

  it('changePlan marks stripeReady only for a paid plan when Stripe is configured', async () => {
    const pro = await new SubscriptionService(repo() as never).changePlan('g1', 'PRO', new Date(), true);
    const starter = await new SubscriptionService(repo() as never).changePlan('g1', 'STARTER', new Date(), true);
    expect(pro.stripeReady).toBe(true);
    expect(pro.note).toMatch(/Stripe is configured/);
    expect(starter.stripeReady).toBe(false); // STARTER never needs Stripe
  });

  it('cancel schedules cancelAt at the current period end', async () => {
    const r = repo();
    await new SubscriptionService(r as never).cancel('g1', new Date('2026-05-01'));
    expect((r.update.mock.calls[0][1] as Record<string, unknown>).cancelAt).toEqual(new Date('2026-02-01'));
  });

  it('cancel falls back to now when there is no period end', async () => {
    const r = repo({ ensure: vi.fn(async (g: string) => ({ garageId: g, currentPeriodEnd: null })) });
    const now = new Date('2026-05-01');
    await new SubscriptionService(r as never).cancel('g1', now);
    expect((r.update.mock.calls[0][1] as Record<string, unknown>).cancelAt).toBe(now);
  });

  it('resume clears cancels and reactivates', async () => {
    const r = repo();
    await new SubscriptionService(r as never).resume('g1');
    expect(r.update).toHaveBeenCalledWith('g1', { cancelAt: null, canceledAt: null, status: 'active' });
  });

  it('listAll passes through', async () => {
    expect(await new SubscriptionService(repo() as never).listAll()).toHaveLength(2);
  });

  it('adminPatch ensures then updates and wraps the result', async () => {
    const r = repo();
    const out = await new SubscriptionService(r as never).adminPatch('g9', { plan: 'ENTERPRISE' });
    expect(r.ensure).toHaveBeenCalledWith('g9');
    expect(r.update).toHaveBeenCalledWith('g9', { plan: 'ENTERPRISE' });
    expect(out.ok).toBe(true);
  });
});
