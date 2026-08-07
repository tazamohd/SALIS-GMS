import { describe, it, expect, vi } from 'vitest';
import { AnalyticsService, parseTimeRange } from '../services/analytics.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    revenueByMonth: vi.fn(async () => [{ month: 'Jan', revenue: 100 }, { month: 'Feb', revenue: 200 }]),
    technicianStats: vi.fn(async () => [{ name: 'Ali', efficiency: 90, jobs: 5, extra: 'x' }]),
    serviceDistribution: vi.fn(async () => [{ label: 'oil', value: 3 }]),
    performanceKpis: vi.fn(async () => ({ jobs: 4, paidRevenue: 800, avgHours: 2.5 })),
    retention: vi.fn(async () => ({ repeat_count: 3, total_count: 6 })),
    biReport: vi.fn(async () => ({ revenue: { total_revenue: 1000, unique_customers: 8, total_jobs: 12 } })),
    realtimeKPIs: vi.fn(async () => ({ live: 1 })),
    profitMargins: vi.fn(async () => [{ service_type: 'brake', total_revenue: 500, total_costs: 200, net_profit: 300, profit_margin: 60, job_count: 5 }]),
    customerLTV: vi.fn(async () => [{ customer_id: 'c1', customer_name: 'Ali', lifetime_value: 900, churn_risk: 'high' }, { customer_id: 'c2', customer_name: 'Sara', churn_risk: 'low' }]),
    heatMaps: vi.fn(async () => [{ hour_of_day: '9', job_count: 7, revenue: 400 }]),
    ...o,
  };
}

describe('parseTimeRange', () => {
  it('maps range tokens to day counts (default 30)', () => {
    expect([parseTimeRange('7d'), parseTimeRange('90d'), parseTimeRange('1y'), parseTimeRange('x')]).toEqual([7, 90, 365, 30]);
  });
});

describe('AnalyticsService', () => {
  it('builds the performance report with targets, retention %, MoM growth and KPIs', async () => {
    const out = await new AnalyticsService(repo() as never).performance('g1', '30d');
    expect(out.revenueByMonth[0].target).toBe(95); // first: revenue*0.95
    expect(out.revenueByMonth[1].target).toBe(107); // prior 100 * 1.07
    expect(out.technicianStats[0]).toEqual({ name: 'Ali', efficiency: 90, jobs: 5 }); // trimmed
    expect(out.kpis.customerRetentionPct).toBe(50); // 3/6
    expect(out.kpis.momGrowthPct).toBe(100); // (200-100)/100
    expect(out.kpis.avgRevenuePerJob).toBe(200); // 800/4
    expect(out.kpis.avgTurnaroundHours).toBe('2.5');
  });

  it('rolls dashboard metrics up with the 65% margin assumption', async () => {
    const out = await new AnalyticsService(repo() as never).dashboardMetrics('g1', 'month', new Date('2026-02-01T00:00:00Z'));
    expect(out).toMatchObject({
      totalRevenue: 1000, totalCosts: 650, netProfit: 350, profitMargin: 35,
      activeCustomers: 8, jobCards: 12, period: 'month', live: 1,
    });
  });

  it('transforms + totals the profit analysis', async () => {
    const out = await new AnalyticsService(repo() as never).profitAnalysis('g1', 'service');
    expect(out.data[0]).toEqual({ name: 'brake', totalRevenue: 500, totalCosts: 200, netProfit: 300, profitMargin: 60, jobCount: 5 });
    expect(out).toMatchObject({ periodType: 'service', totalRevenue: 500, totalCosts: 200, netProfit: 300 });
  });

  it('transforms customer LTV and applies the risk filter', async () => {
    const all = await new AnalyticsService(repo() as never).customerLTV('g1');
    expect(all).toHaveLength(2);
    expect(all[0]).toMatchObject({ customerId: 'c1', customerName: 'Ali', lifetimeValue: 900, churnRisk: 'high', segment: 'regular' });
    const high = await new AnalyticsService(repo() as never).customerLTV('g1', 'high');
    expect(high).toHaveLength(1);
    expect(high[0].customerId).toBe('c1');
  });

  it('transforms heat-map points', async () => {
    const out = await new AnalyticsService(repo() as never).heatmaps('g1', 'time');
    expect(out[0]).toEqual({ label: '9', value: 7, revenue: 400, avgValue: 0 });
  });

  it('returns the custom-report stubs deterministically', () => {
    const s = new AnalyticsService(repo() as never);
    expect(s.customReports()).toEqual([]);
    expect(s.runCustomReport()).toEqual({ success: true, message: 'Report generated successfully' });
    const rep = s.createCustomReport('g1', 'u1', { name: 'R', reportType: 'sales' }, 'abc123', new Date(0));
    expect(rep).toMatchObject({ id: 'abc123', garageId: 'g1', name: 'R', reportType: 'sales', createdBy: 'u1', createdAt: new Date(0).toISOString() });
  });
});
