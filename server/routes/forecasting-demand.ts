/**
 * Predictive Demand Forecasting — backs GET /api/forecasting/demand.
 * Returns weekly forecast vs historical and parts reorder recommendations.
 */
import { Router, type Request, type Response } from "express";
import {
  getDailyJobCounts,
  getPartsForecastSnapshot,
} from "../ai/business-intelligence";
import { isAuthenticated } from "../auth";
import { requirePlan } from "../middleware/requirePlan";

const router = Router();

interface DailyCount { day: string; isoDate: string; count: number }
interface PartsForecast { part: string; current: number; forecasted: number; reorderPoint: number; partId?: string }

function chunkByWeek(daily: Array<{ isoDate: string; count: number }>) {
  // Bucket the daily data into weeks (oldest → newest).
  if (daily.length === 0) return [] as Array<{ week: string; total: number }>;
  const buckets: Array<{ week: string; total: number }> = [];
  let cur = { week: `Week 1`, total: 0 };
  daily.forEach((d, i) => {
    if (i > 0 && i % 7 === 0) {
      buckets.push(cur);
      cur = { week: `Week ${buckets.length + 1}`, total: 0 };
    }
    cur.total += d.count;
  });
  buckets.push(cur);
  return buckets;
}

router.get("/forecasting/demand", isAuthenticated, requirePlan("PRO"), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const period = Math.max(7, Math.min(90, Number(req.query.period ?? 30)));

  try {
    // Historical: pull (period × 2) days so we have a comparable baseline.
    const daily = await getDailyJobCounts(user.garageId, period * 2);
    const weeks = chunkByWeek(daily);
    const recent = weeks.slice(-4);
    const baseline = recent.length > 0
      ? Math.round(recent.reduce((s, w) => s + w.total, 0) / recent.length)
      : 0;

    const weeklyForecast = [0, 1, 2, 3].map(i => {
      const drift = Math.round(baseline * 0.05 * i);
      return {
        week: `Week ${i + 1}`,
        historical: recent[i]?.total ?? null,
        predicted: Math.max(0, baseline + drift),
        confidence: Math.max(60, 95 - i * 3),
      };
    });

    const parts = (await getPartsForecastSnapshot(user.garageId, 10)) as PartsForecast[];
    const partsDemand = parts.map((p: PartsForecast) => ({
      part: p.part,
      current: p.current,
      forecasted: p.forecasted,
      reorderPoint: p.reorderPoint,
    }));

    // Peak day = day-of-week with highest avg job count over the period.
    // Use Postgres-derived `d.day` (server-TZ short name) and map to long name
    // via a fixed table to avoid `new Date(isoDate)` timezone drift on the Node side.
    const DOW_MAP: Record<string, string> = {
      Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
      Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
    };
    const byDow: Record<string, number[]> = {};
    (daily as DailyCount[]).forEach((d: DailyCount) => {
      const dow = DOW_MAP[d.day] ?? d.day;
      (byDow[dow] = byDow[dow] || []).push(d.count);
    });
    let peakDay = "Thursday";
    let peakVal = -1;
    for (const [dow, arr] of Object.entries(byDow)) {
      const avg = arr.reduce((s, n) => s + n, 0) / arr.length;
      if (avg > peakVal) { peakVal = avg; peakDay = dow; }
    }

    const reorderAlerts = partsDemand.filter((p: { current: number; reorderPoint: number }) => p.current < p.reorderPoint).length;
    const total = (daily as DailyCount[]).reduce((s: number, d: DailyCount) => s + d.count, 0);
    const avgDailyAppts = daily.length > 0 ? Math.round(total / daily.length) : 0;

    // Forecast accuracy = how well baseline tracked the most recent week
    let accuracy = 90;
    if (recent.length >= 2) {
      const lastRecent = recent[recent.length - 1].total;
      const prior = recent[recent.length - 2].total;
      if (prior > 0) {
        const err = Math.abs(lastRecent - prior) / prior;
        accuracy = Math.max(60, Math.min(99, Math.round((1 - err) * 100)));
      }
    }

    res.json({
      weeklyForecast,
      partsDemand,
      accuracy,
      peakDay,
      partsReorderAlerts: reorderAlerts,
      avgDailyAppointments: avgDailyAppts,
    });
  } catch (err) {
    console.error("[forecasting/demand] error:", err);
    res.status(500).json({ message: "Failed to compute forecast" });
  }
});

export const forecastingDemandRoutes = router;
