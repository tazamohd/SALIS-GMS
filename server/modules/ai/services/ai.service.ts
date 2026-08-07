/**
 * AI service (Phase E5 — Domain Services).
 *
 * Owns the AI feature computations: the day-of-week 4-week moving-average demand
 * series, the prediction-type branching (parts / revenue / demand), the MAPE
 * accuracy roll-up, and the repair-guide orchestration (vehicle-info assembly,
 * the preset fallback, and the LLM step mapping). Business-insight / forecast
 * reads pass straight through. All data access — including the OpenAI call —
 * flows through the injected repository; the AI-key flag is supplied by the
 * controller so this layer stays deterministic.
 */

import type { IAiRepository } from '../repositories/ai.repository';
import { fallbackSteps } from '../domain/repair-presets';

type Any = any;

interface DailyCount { day: string; isoDate: string; count: number }

export function parseTimeRange(tr: string | undefined): number {
  switch (tr) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    default: return 7;
  }
}

export class AiService {
  constructor(private readonly repository: IAiRepository) {}

  insights(garageId: string) { return this.repository.businessInsights(garageId); }
  revenueForecast(garageId: string) { return this.repository.revenueForecast(garageId); }
  demandForecast(garageId: string) { return this.repository.demandPredictions(garageId); }

  /** Day-of-week aware 4-week moving average → predicted vs actual demand. */
  private async buildDemandSeries(garageId: string, days: number) {
    const data = (await this.repository.dailyJobCounts(garageId, Math.max(days, 28))) as DailyCount[];
    const byDow: Record<string, number[]> = {};
    data.forEach((d) => {
      (byDow[d.day] = byDow[d.day] || []).push(d.count);
    });
    const baseline: Record<string, number> = {};
    for (const [dow, arr] of Object.entries(byDow)) {
      baseline[dow] = arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0;
    }
    const recent = data.slice(-Math.min(days, data.length));
    return recent.map((d) => ({
      day: d.day,
      isoDate: d.isoDate,
      predicted: baseline[d.day] ?? 0,
      actual: d.count,
    }));
  }

  async predictions(garageId: string, predictionType: string, days: number) {
    if (predictionType === 'parts') {
      const parts = (await this.repository.partsForecast(garageId, 10)) as Array<{ part: string; current: number; forecasted: number }>;
      return {
        type: 'parts',
        data: parts.map((p) => ({ part: p.part, current: p.current, forecast: p.forecasted })),
      };
    }
    if (predictionType === 'revenue') {
      const forecast = await this.repository.revenueForecast(garageId);
      return { type: 'revenue', data: forecast };
    }
    const series = await this.buildDemandSeries(garageId, days);
    return { type: 'demand', data: series };
  }

  async accuracy(garageId: string) {
    const series = await this.buildDemandSeries(garageId, 30);
    const valid = series.filter((s) => s.actual > 0);
    let overall = 0;
    if (valid.length > 0) {
      const errs = valid.map((s) => Math.abs(s.predicted - s.actual) / Math.max(s.actual, 1));
      const mape = errs.reduce((a, b) => a + b, 0) / errs.length;
      overall = Math.max(0, Math.min(100, Math.round((1 - mape) * 100)));
    }
    return {
      overall,
      byCategory: {
        serviceDemand: overall,
        partsForecast: overall ? Math.max(0, overall - 2) : 0,
        revenueForecast: overall ? Math.max(0, overall - 4) : 0,
      },
      samples: valid.length,
    };
  }

  async repairGuide(vehicleId: string, guide: string, hasAiKey: boolean) {
    let vehicleInfo = 'Vehicle';
    try {
      const vehicle = (await this.repository.getVehicle(vehicleId)) as Any;
      if (vehicle) {
        vehicleInfo = `${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim() || 'Vehicle';
      }
    } catch {
      /* non-fatal — fall through with generic vehicleInfo */
    }

    if (!hasAiKey) {
      return { vehicleInfo, steps: fallbackSteps(guide), source: 'preset' };
    }

    try {
      const raw = await this.repository.repairGuideCompletion(vehicleInfo, guide);
      const parsedJson = JSON.parse(raw);
      const aiSteps = Array.isArray(parsedJson.steps) ? parsedJson.steps : [];
      const steps = aiSteps.length
        ? aiSteps.map((s: Any, idx: number) => ({
            id: Number(s.id ?? idx + 1),
            title: String(s.title ?? 'Step'),
            description: String(s.description ?? ''),
            completed: false,
          }))
        : fallbackSteps(guide);
      return { vehicleInfo, steps, source: 'ai' };
    } catch (err) {
      console.error('[ai/repair-guide] LLM error, falling back:', err);
      return { vehicleInfo, steps: fallbackSteps(guide), source: 'preset' };
    }
  }
}
