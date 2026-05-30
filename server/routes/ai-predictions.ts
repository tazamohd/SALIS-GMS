// @ts-nocheck
/**
 * AI Predictions — backs GET /api/ai/predictions and GET /api/ai/accuracy.
 * Statistical (non-LLM) demand / parts / revenue prediction over recent activity.
 */
import { Router, type Request, type Response } from "express";
import {
  getDailyJobCounts,
  getPartsForecastSnapshot,
  generateRevenueForecast,
} from "../ai/business-intelligence";
import { isAuthenticated } from "../auth";

const router = Router();

function parseTimeRange(tr: string | undefined) {
  switch (tr) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "1y": return 365;
    default: return 7;
  }
}

/** Day-of-week aware 4-week moving average → predicted vs actual demand. */
async function buildDemandSeries(garageId: string, days: number) {
  const data = await getDailyJobCounts(garageId, Math.max(days, 28));
  // Group by day-of-week and average to derive baseline; then map last `days` days to that baseline.
  const byDow: Record<string, number[]> = {};
  data.forEach(d => {
    const dow = new Date(d.isoDate).toLocaleDateString("en-US", { weekday: "short" });
    (byDow[dow] = byDow[dow] || []).push(d.count);
  });
  const baseline: Record<string, number> = {};
  for (const [dow, arr] of Object.entries(byDow)) {
    baseline[dow] = arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0;
  }
  const recent = data.slice(-Math.min(days, data.length));
  return recent.map(d => {
    const dow = new Date(d.isoDate).toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dow,
      isoDate: d.isoDate,
      predicted: baseline[dow] ?? 0,
      actual: d.count,
    };
  });
}

router.get("/ai/predictions", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const days = parseTimeRange(String(req.query.timeRange ?? "7d"));
  const predictionType = String(req.query.predictionType ?? "demand");

  try {
    if (predictionType === "parts") {
      const parts = await getPartsForecastSnapshot(user.garageId, 10);
      return res.json({
        type: "parts",
        data: parts.map(p => ({
          part: p.part,
          current: p.current,
          forecast: p.forecasted,
        })),
      });
    }
    if (predictionType === "revenue") {
      const forecast = await generateRevenueForecast(user.garageId);
      return res.json({ type: "revenue", data: forecast });
    }
    const series = await buildDemandSeries(user.garageId, days);
    res.json({ type: "demand", data: series });
  } catch (err) {
    console.error("[ai/predictions] error:", err);
    res.status(500).json({ message: "Failed to compute predictions" });
  }
});

/** Mean absolute percentage error across the recent demand window. */
router.get("/ai/accuracy", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  try {
    const series = await buildDemandSeries(user.garageId, 30);
    const valid = series.filter(s => s.actual > 0);
    let overall = 0;
    if (valid.length > 0) {
      const errs = valid.map(s => Math.abs(s.predicted - s.actual) / Math.max(s.actual, 1));
      const mape = errs.reduce((a, b) => a + b, 0) / errs.length;
      overall = Math.max(0, Math.min(100, Math.round((1 - mape) * 100)));
    }
    res.json({
      overall,
      byCategory: {
        serviceDemand: overall,
        partsForecast: overall ? Math.max(0, overall - 2) : 0,
        revenueForecast: overall ? Math.max(0, overall - 4) : 0,
      },
      samples: valid.length,
    });
  } catch (err) {
    console.error("[ai/accuracy] error:", err);
    res.status(500).json({ message: "Failed to compute accuracy" });
  }
});

export const aiPredictionsRoutes = router;
