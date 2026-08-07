import { describe, it, expect, vi } from 'vitest';
import { ReportsService } from '../services/reports.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    revenue: vi.fn(async () => [{ period: '2026-01', revenue: 100 }]),
    technicianPerformance: vi.fn(async () => [{ id: 't1' }]),
    inventoryTurnover: vi.fn(async () => [{ name: 'pad' }]),
    customerAnalytics: vi.fn(async () => [{ id: 'c1' }]),
    summaryRows: vi.fn(async () => ({
      revenue: [{ total: '1500.5' }],
      jobs: [{ total: '10', completed: '7' }],
      customers: [{ total: '20' }],
      inventory: [{ total: '30', lowStock: '4' }],
    })),
    ...o,
  };
}

describe('ReportsService', () => {
  it('maps groupBy to the correct TO_CHAR period format', async () => {
    const r = repo();
    const s = new ReportsService(r as never);
    await s.revenue('g1', 'day');
    expect(r.revenue).toHaveBeenLastCalledWith('g1', 'YYYY-MM-DD');
    await s.revenue('g1', 'week');
    expect(r.revenue).toHaveBeenLastCalledWith('g1', 'IYYY-IW');
    const out = await s.revenue('g1', 'month');
    expect(r.revenue).toHaveBeenLastCalledWith('g1', 'YYYY-MM');
    expect(out).toEqual({ data: [{ period: '2026-01', revenue: 100 }], groupBy: 'month' });
  });

  it('wraps the pass-through reports in a { data } envelope', async () => {
    const s = new ReportsService(repo() as never);
    expect(await s.technicianPerformance('g1')).toEqual({ data: [{ id: 't1' }] });
    expect(await s.inventoryTurnover('g1')).toEqual({ data: [{ name: 'pad' }] });
    expect(await s.customerAnalytics('g1')).toEqual({ data: [{ id: 'c1' }] });
  });

  it('coerces the executive-summary counts to numbers', async () => {
    const out = await new ReportsService(repo() as never).summary('g1');
    expect(out).toEqual({
      totalRevenue: 1500.5,
      totalJobs: 10,
      completedJobs: 7,
      totalCustomers: 20,
      totalParts: 30,
      lowStockParts: 4,
    });
  });

  it('defaults summary fields to 0 when a query returns no rows', async () => {
    const out = await new ReportsService(
      repo({ summaryRows: vi.fn(async () => ({ revenue: [], jobs: [], customers: [], inventory: [] })) }) as never,
    ).summary('g1');
    expect(out).toEqual({
      totalRevenue: 0, totalJobs: 0, completedJobs: 0, totalCustomers: 0, totalParts: 0, lowStockParts: 0,
    });
  });
});
