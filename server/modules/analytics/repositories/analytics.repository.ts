/**
 * Analytics repository (Phase E4). The only data-layer access for the analytics
 * domain. Delegates to the existing `analytics-service` and
 * `ai/business-intelligence` facades (which own the heavy aggregate SQL) and
 * runs the two direct performance queries (KPI window + retention) that backed
 * `server/routes/analytics-performance.ts`.
 */

import { db } from '../../../db';
import { and, eq, gte, sql, count } from 'drizzle-orm';
import { jobCards, invoices } from '../../../../shared/schema';
import {
  generateBusinessIntelligenceReport,
  getRealtimeKPIs,
  analyzeProfitMargins,
  analyzeCustomerLTV,
  generateBusinessHeatMaps,
} from '../../../analytics-service';
import {
  getRevenueByMonth,
  getTechnicianStats,
  getServiceDistribution,
} from '../../../ai/business-intelligence';

// The BI facades are loosely typed; `Any` keeps this seam readable.
type Any = any;

export interface IAnalyticsRepository {
  biReport(garageId: string, dateRange: { start: Date; end: Date }): Promise<Any>;
  realtimeKPIs(garageId: string): Promise<Any>;
  profitMargins(garageId: string, groupBy: 'service' | 'technician' | 'customer'): Promise<Any>;
  customerLTV(garageId: string): Promise<Any>;
  heatMaps(garageId: string, mapType: 'time' | 'service' | 'technician'): Promise<Any>;
  revenueByMonth(garageId: string, months: number): Promise<Any>;
  technicianStats(garageId: string, days: number, limit: number): Promise<Any>;
  serviceDistribution(garageId: string, days: number): Promise<Any>;
  performanceKpis(garageId: string, days: number): Promise<Any>;
  retention(garageId: string, days: number): Promise<Any>;
}

export class AnalyticsRepository implements IAnalyticsRepository {
  biReport(garageId: string, dateRange: { start: Date; end: Date }) {
    return generateBusinessIntelligenceReport(garageId, dateRange);
  }
  realtimeKPIs(garageId: string) {
    return getRealtimeKPIs(garageId);
  }
  profitMargins(garageId: string, groupBy: 'service' | 'technician' | 'customer') {
    return analyzeProfitMargins(garageId, groupBy);
  }
  customerLTV(garageId: string) {
    return analyzeCustomerLTV(garageId);
  }
  heatMaps(garageId: string, mapType: 'time' | 'service' | 'technician') {
    return generateBusinessHeatMaps(garageId, mapType);
  }
  revenueByMonth(garageId: string, months: number) {
    return getRevenueByMonth(garageId, months);
  }
  technicianStats(garageId: string, days: number, limit: number) {
    return getTechnicianStats(garageId, days, limit);
  }
  serviceDistribution(garageId: string, days: number) {
    return getServiceDistribution(garageId, days);
  }

  async performanceKpis(garageId: string, days: number) {
    const rows = await db
      .select({
        jobs: count(),
        paidRevenue: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric) FILTER (WHERE ${invoices.status} = 'paid'), 0)`,
        avgHours: sql<number>`COALESCE(AVG(${jobCards.actualHours}::numeric), 0)`,
      })
      .from(jobCards)
      .leftJoin(invoices, eq(invoices.jobCardId, jobCards.id))
      .where(
        and(
          eq(jobCards.garageId, garageId),
          gte(jobCards.createdAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`),
        ),
      );
    return rows[0] || {};
  }

  async retention(garageId: string, days: number) {
    const result = await db.execute(sql`
      WITH visits AS (
        SELECT ${jobCards.customerId} AS cid, COUNT(*) AS n
        FROM ${jobCards}
        WHERE ${jobCards.garageId} = ${garageId}
          AND ${jobCards.createdAt} >= NOW() - (${days}::int * INTERVAL '1 day')
        GROUP BY ${jobCards.customerId}
      )
      SELECT
        COUNT(*) FILTER (WHERE n > 1) AS repeat_count,
        COUNT(*) AS total_count
      FROM visits;
    `);
    return (result as Any).rows?.[0] || (result as Any)[0] || {};
  }
}
