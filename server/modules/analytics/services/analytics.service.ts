/**
 * Analytics service (Phase E5 — Domain Services).
 *
 * Owns the analytics read-model computation: the performance report (target
 * synthesis, KPI aggregation, retention %, MoM growth), the dashboard-metrics
 * margin roll-up, the profit-analysis / customer-LTV / heat-map snake→camel
 * transforms, and the custom-report stubs. Runtime values (the current time, a
 * generated id) are passed in by the controller so the layer stays
 * deterministic. All data access flows through the injected repository; the
 * numbers mirror the legacy handlers exactly.
 */

import type { IAnalyticsRepository } from '../repositories/analytics.repository';

type Any = Record<string, unknown>;
const n = (v: unknown) => Number(v || 0);

export function parseTimeRange(tr: string | undefined): number {
  switch (tr) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    default: return 30;
  }
}

export class AnalyticsService {
  constructor(private readonly repository: IAnalyticsRepository) {}

  async performance(garageId: string, timeRange: string) {
    const days = parseTimeRange(timeRange);
    const [revenueByMonth, technicianStats, serviceDistribution] = await Promise.all([
      this.repository.revenueByMonth(garageId, 6),
      this.repository.technicianStats(garageId, days, 6),
      this.repository.serviceDistribution(garageId, days),
    ]);

    const rbm = revenueByMonth as Array<{ month: string; revenue: number }>;
    const withTargets = rbm.map((m, idx) => ({
      month: m.month,
      revenue: m.revenue,
      target: idx > 0 ? Math.round(rbm[idx - 1].revenue * 1.07) : Math.round(m.revenue * 0.95),
    }));

    const k = (await this.repository.performanceKpis(garageId, days)) as Any;
    const jobs = n(k.jobs);
    const paid = n(k.paidRevenue);

    const retentionRow = (await this.repository.retention(garageId, days)) as Any;
    const total = n(retentionRow.total_count);
    const repeats = n(retentionRow.repeat_count);
    const customerRetentionPct = total > 0 ? Math.round((repeats / total) * 100) : 0;

    let momGrowthPct = 0;
    if (rbm.length >= 2) {
      const last = rbm[rbm.length - 1].revenue;
      const prev = rbm[rbm.length - 2].revenue;
      if (prev > 0) momGrowthPct = Math.round(((last - prev) / prev) * 100);
    }

    return {
      revenueByMonth: withTargets,
      technicianStats: (technicianStats as Array<{ name: string; efficiency: number; jobs: number }>).map((t) => ({
        name: t.name,
        efficiency: t.efficiency,
        jobs: t.jobs,
      })),
      serviceDistribution,
      kpis: {
        avgRevenuePerJob: jobs > 0 ? Math.round(paid / jobs) : 0,
        avgTurnaroundHours: Number(k.avgHours).toFixed(1),
        customerRetentionPct,
        momGrowthPct,
      },
    };
  }

  private dateRangeFor(period: unknown, now: Date) {
    const start = new Date(now);
    switch (period) {
      case 'week': start.setDate(now.getDate() - 7); break;
      case 'month': start.setMonth(now.getMonth() - 1); break;
      case 'quarter': start.setMonth(now.getMonth() - 3); break;
      case 'year': start.setFullYear(now.getFullYear() - 1); break;
      default: start.setMonth(now.getMonth() - 1);
    }
    return { start, end: now };
  }

  async dashboardMetrics(garageId: string, period: unknown, now: Date) {
    const report = (await this.repository.biReport(garageId, this.dateRangeFor(period, now))) as Any;
    const kpis = (await this.repository.realtimeKPIs(garageId)) as Any;
    const revenue = (report.revenue || {}) as Any;

    const totalRevenue = n(revenue.total_revenue);
    const totalCosts = totalRevenue * 0.65; // assume 65% margin
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCosts: Math.round(totalCosts),
      netProfit: Math.round(netProfit),
      profitMargin: Number(profitMargin.toFixed(1)),
      activeCustomers: n(revenue.unique_customers),
      jobCards: n(revenue.total_jobs),
      period,
      ...kpis,
    };
  }

  customReports() {
    return [];
  }

  createCustomReport(
    garageId: string,
    userId: string,
    body: { name?: unknown; description?: unknown; reportType?: unknown; schedule?: unknown },
    id: string,
    now: Date,
  ) {
    return {
      id,
      garageId,
      name: body.name,
      description: body.description,
      reportType: body.reportType,
      schedule: body.schedule,
      createdBy: userId,
      createdAt: now.toISOString(),
    };
  }

  runCustomReport() {
    return { success: true, message: 'Report generated successfully' };
  }

  async profitAnalysis(garageId: string, periodType: 'service' | 'technician' | 'customer') {
    const analysis = (await this.repository.profitMargins(garageId, periodType)) as Any;
    const transformRow = (row: Any) => ({
      name: row.service_type || row.technician_name || row.customer_name || row.name || 'Unknown',
      totalRevenue: n(row.total_revenue || row.revenue),
      totalCosts: n(row.total_costs || row.costs),
      netProfit: n(row.net_profit || row.profit),
      profitMargin: n(row.profit_margin || row.margin),
      jobCount: n(row.job_count || row.jobs),
    });
    const data = Array.isArray(analysis)
      ? analysis.map(transformRow)
      : ((analysis.data as Any[]) || []).map(transformRow);
    return {
      data,
      periodType,
      totalRevenue: data.reduce((s, r) => s + r.totalRevenue, 0),
      totalCosts: data.reduce((s, r) => s + r.totalCosts, 0),
      netProfit: data.reduce((s, r) => s + r.netProfit, 0),
    };
  }

  async customerLTV(garageId: string, riskFilter?: string) {
    const ltvAnalysis = (await this.repository.customerLTV(garageId)) as Any;
    const transformCustomer = (c: Any) => ({
      customerId: c.customer_id || c.id,
      customerName: c.customer_name || c.name,
      lifetimeValue: n(c.lifetime_value || c.ltv),
      totalJobs: n(c.total_jobs || c.jobs),
      totalSpent: n(c.total_spent || c.spent),
      avgJobValue: n(c.avg_job_value || c.avgValue),
      lastVisit: c.last_visit || c.lastVisit,
      churnRisk: c.churn_risk || c.risk || 'low',
      segment: c.segment || 'regular',
    });
    let customers = (Array.isArray(ltvAnalysis)
      ? ltvAnalysis
      : (ltvAnalysis.customers as Any[]) || (ltvAnalysis.data as Any[]) || []).map(transformCustomer);
    if (riskFilter) customers = customers.filter((c) => c.churnRisk === riskFilter);
    return customers;
  }

  async heatmaps(garageId: string, heatmapType: 'time' | 'service' | 'technician') {
    const heatmap = (await this.repository.heatMaps(garageId, heatmapType)) as Any;
    const transformDataPoint = (point: Any) => ({
      label: point.hour_of_day || point.day_of_week || point.service_type || point.technician_name || point.label || 'Unknown',
      value: n(point.job_count || point.count || point.value),
      revenue: n(point.revenue || point.total_revenue),
      avgValue: n(point.avg_value || point.avg_job_value),
    });
    return Array.isArray(heatmap)
      ? heatmap.map(transformDataPoint)
      : ((heatmap.data as Any[]) || (heatmap.points as Any[]) || []).map(transformDataPoint);
  }
}
