import { describe, it, expect, vi } from 'vitest';
import { CrmService } from '../services/crm.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    customerList: vi.fn(async () => [{ id: 'c1' }]),
    customerBase: vi.fn(async () => undefined),
    customerJobs: vi.fn(async () => []),
    customerInvoices: vi.fn(async () => []),
    customerAppointments: vi.fn(async () => []),
    segments: vi.fn(async () => []),
    loyaltyMembers: vi.fn(async () => 0),
    loyaltyRevenue: vi.fn(async () => 0),
    loyaltyTiers: vi.fn(async () => []),
    retentionRepeat: vi.fn(async () => ({})),
    retentionLtv: vi.fn(async () => ({})),
    retentionChurnRisk: vi.fn(async () => []),
    retentionTrend: vi.fn(async () => []),
    ...o,
  };
}

describe('CrmService', () => {
  it('passes the search term through to the customer list', async () => {
    const r = repo();
    const s = new CrmService(r as never);
    expect(await s.customerList('g1', 'ali')).toEqual({ customers: [{ id: 'c1' }] });
    expect(r.customerList).toHaveBeenCalledWith('g1', 'ali');
  });

  it('404s a missing customer detail', async () => {
    const s = new CrmService(repo() as never);
    await expect(s.customerDetail('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('aggregates spend, visits, last visit, and tier for a customer', async () => {
    const r = repo({
      customerBase: vi.fn(async () => ({ id: 'c1', fullName: 'Ali' })),
      customerJobs: vi.fn(async () => [{ id: 'j1', completedAt: '2026-01-02' }, { id: 'j2' }]),
      customerInvoices: vi.fn(async () => [{ totalAmount: '6000' }, { totalAmount: '1000' }]),
    });
    const detail = await new CrmService(r as never).customerDetail('g1', 'c1');
    expect(detail.customer.totalSpend).toBe(7000);
    expect(detail.customer.visitCount).toBe(2);
    expect(detail.customer.lastVisit).toBe('2026-01-02');
    expect(detail.customer.loyaltyTier).toBe('Gold'); // 7000 → Gold
  });

  it('computes segment percentages against the total', async () => {
    const r = repo({ segments: vi.fn(async () => [{ segment: 'VIP', count: 3 }, { segment: 'New', count: 1 }]) });
    const out = await new CrmService(r as never).segments('g1');
    expect(out.total).toBe(4);
    expect(out.segments[0]).toEqual({ segment: 'VIP', count: 3, percentage: 75 });
    expect(out.segments[1].percentage).toBe(25);
  });

  it('models loyalty points as 1/SAR issued and 15% redeemed', async () => {
    const r = repo({ loyaltyMembers: vi.fn(async () => 42), loyaltyRevenue: vi.fn(async () => 1000) });
    const out = await new CrmService(r as never).loyaltySummary('g1');
    expect(out).toMatchObject({ totalMembers: 42, pointsIssued: 1000, pointsRedeemed: 150, activeCampaigns: 3 });
  });

  it('derives retention repeat/churn rates from job counts', async () => {
    const r = repo({
      retentionRepeat: vi.fn(async () => ({ total_customers: 10, repeat_customers: 4, avg_visits: 2.5 })),
      retentionLtv: vi.fn(async () => ({ avg_ltv: 1200, max_ltv: 9000 })),
    });
    const out = await new CrmService(r as never).retention('g1');
    expect(out.repeatRate).toBe(40);
    expect(out.churnRate).toBe(60);
    expect(out.avgLifetimeValue).toBe(1200);
    expect(out.avgVisits).toBe(2.5);
  });

  it('acknowledges an award without persisting and coerces points to a number', () => {
    const out = new CrmService(repo() as never).awardPoints({ customerId: 'c1', points: '50' }, 0);
    expect(out).toEqual({
      success: true,
      customerId: 'c1',
      pointsAwarded: 50,
      reason: 'Manual award',
      awardedAt: new Date(0).toISOString(),
    });
  });

  it('returns the four static campaigns', async () => {
    const out = await new CrmService(repo() as never).campaigns(0);
    expect(out.campaigns).toHaveLength(4);
    expect(out.campaigns[0].name).toBe('Summer Service Special');
  });
});
