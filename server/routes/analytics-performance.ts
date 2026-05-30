// @ts-nocheck
/**
 * Performance Analytics — backs GET /api/analytics/performance.
 * Returns: revenueByMonth, technicianStats, serviceDistribution, kpis.
 */
import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { jobCards, invoices } from "../../shared/schema";
import { and, eq, gte, sql, count } from "drizzle-orm";
import {
  getRevenueByMonth,
  getTechnicianStats,
  getServiceDistribution,
} from "../ai/business-intelligence";
import { isAuthenticated } from "../auth";

const router = Router();

function parseTimeRange(tr: string | undefined) {
  switch (tr) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "1y": return 365;
    default: return 30;
  }
}

router.get("/analytics/performance", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const days = parseTimeRange(String(req.query.timeRange ?? "30d"));

  try {
    const [revenueByMonth, technicianStats, serviceDistribution] = await Promise.all([
      getRevenueByMonth(user.garageId, 6),
      getTechnicianStats(user.garageId, days, 6),
      getServiceDistribution(user.garageId, days),
    ]);

    // Synthesize per-month target as previous month × 1.07 (industry-style growth target).
    const withTargets = revenueByMonth.map((m, idx) => ({
      month: m.month,
      revenue: m.revenue,
      target: idx > 0 ? Math.round(revenueByMonth[idx - 1].revenue * 1.07) : Math.round(m.revenue * 0.95),
    }));

    // KPIs aggregated from the same window
    const kpiRows = await db.select({
      jobs: count(),
      paidRevenue: sql<number>`COALESCE(SUM(${invoices.totalAmount}::numeric) FILTER (WHERE ${invoices.status} = 'paid'), 0)`,
      avgHours: sql<number>`COALESCE(AVG(${jobCards.actualHours}::numeric), 0)`,
    })
      .from(jobCards)
      .leftJoin(invoices, eq(invoices.jobCardId, jobCards.id))
      .where(and(
        eq(jobCards.garageId, user.garageId),
        gte(jobCards.createdAt, sql`NOW() - (${days}::int * INTERVAL '1 day')`)
      ));

    const k = kpiRows[0] || {} as any;
    const jobs = Number(k.jobs) || 0;
    const paid = Number(k.paidRevenue) || 0;

    // Customer retention = repeat customers / total distinct customers in window
    const retentionRows = await db.execute(sql`
      WITH visits AS (
        SELECT ${jobCards.customerId} AS cid, COUNT(*) AS n
        FROM ${jobCards}
        WHERE ${jobCards.garageId} = ${user.garageId}
          AND ${jobCards.createdAt} >= NOW() - (${days}::int * INTERVAL '1 day')
        GROUP BY ${jobCards.customerId}
      )
      SELECT
        COUNT(*) FILTER (WHERE n > 1) AS repeat_count,
        COUNT(*) AS total_count
      FROM visits;
    `);
    const retentionRow: any = (retentionRows as any).rows?.[0] || (retentionRows as any)[0] || {};
    const total = Number(retentionRow.total_count) || 0;
    const repeats = Number(retentionRow.repeat_count) || 0;
    const customerRetentionPct = total > 0 ? Math.round((repeats / total) * 100) : 0;

    // MoM growth (last vs prior month from revenueByMonth)
    let momGrowthPct = 0;
    if (revenueByMonth.length >= 2) {
      const last = revenueByMonth[revenueByMonth.length - 1].revenue;
      const prev = revenueByMonth[revenueByMonth.length - 2].revenue;
      if (prev > 0) momGrowthPct = Math.round(((last - prev) / prev) * 100);
    }

    res.json({
      revenueByMonth: withTargets,
      technicianStats: technicianStats.map(t => ({
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
    });
  } catch (err) {
    console.error("[analytics/performance] error:", err);
    res.status(500).json({ message: "Failed to compute analytics" });
  }
});

export const analyticsPerformanceRoutes = router;
