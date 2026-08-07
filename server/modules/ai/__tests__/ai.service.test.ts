import { describe, it, expect, vi } from 'vitest';
import { AiService, parseTimeRange } from '../services/ai.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    businessInsights: vi.fn(async () => [{ id: 'i1' }]),
    revenueForecast: vi.fn(async () => [{ month: 'Jan', value: 100 }]),
    demandPredictions: vi.fn(async () => [{ service: 'oil' }]),
    dailyJobCounts: vi.fn(async () => [
      { day: 'Mon', isoDate: '2026-01-05', count: 4 },
      { day: 'Mon', isoDate: '2026-01-12', count: 6 },
      { day: 'Tue', isoDate: '2026-01-06', count: 2 },
    ]),
    partsForecast: vi.fn(async () => [{ part: 'pad', current: 3, forecasted: 8, reorderPoint: 5 }]),
    getVehicle: vi.fn(async () => ({ year: 2020, make: 'Toyota', model: 'Hilux' })),
    repairGuideCompletion: vi.fn(async () => JSON.stringify({ steps: [{ id: 1, title: 'Do it', description: 'now' }] })),
    ...o,
  };
}

describe('parseTimeRange', () => {
  it('maps tokens to days (default 7)', () => {
    expect([parseTimeRange('30d'), parseTimeRange('1y'), parseTimeRange('x')]).toEqual([30, 365, 7]);
  });
});

describe('AiService', () => {
  it('passes business insights and forecasts through', async () => {
    const s = new AiService(repo() as never);
    expect(await s.insights('g1')).toEqual([{ id: 'i1' }]);
    expect(await s.demandForecast('g1')).toEqual([{ service: 'oil' }]);
  });

  it('predictions: parts branch maps forecasted→forecast', async () => {
    const out = await new AiService(repo() as never).predictions('g1', 'parts', 7);
    expect(out).toEqual({ type: 'parts', data: [{ part: 'pad', current: 3, forecast: 8 }] });
  });

  it('predictions: revenue branch wraps the forecast', async () => {
    const out = await new AiService(repo() as never).predictions('g1', 'revenue', 7);
    expect(out).toEqual({ type: 'revenue', data: [{ month: 'Jan', value: 100 }] });
  });

  it('predictions: demand branch builds a day-of-week moving-average series', async () => {
    const out = await new AiService(repo() as never).predictions('g1', 'demand', 30);
    expect(out.type).toBe('demand');
    // Mon baseline = round((4+6)/2) = 5; each Mon row predicts 5.
    const mon = (out.data as Array<{ day: string; predicted: number }>).filter((d) => d.day === 'Mon');
    expect(mon.every((d) => d.predicted === 5)).toBe(true);
  });

  it('accuracy: computes MAPE-derived overall score with category deltas', async () => {
    const out = await new AiService(repo() as never).accuracy('g1');
    expect(out.overall).toBeGreaterThanOrEqual(0);
    expect(out.overall).toBeLessThanOrEqual(100);
    expect(out.byCategory.partsForecast).toBe(out.overall ? Math.max(0, out.overall - 2) : 0);
    expect(out.samples).toBeGreaterThan(0);
  });

  it('repair guide: preset when no AI key, assembling vehicleInfo from the vehicle', async () => {
    const r = repo();
    const out = await new AiService(r as never).repairGuide('v1', 'Oil Change', false);
    expect(out.source).toBe('preset');
    expect(out.vehicleInfo).toBe('2020 Toyota Hilux');
    expect(r.repairGuideCompletion).not.toHaveBeenCalled();
    expect(out.steps[0]).toMatchObject({ id: 1, completed: false });
  });

  it('repair guide: maps LLM steps when an AI key is present', async () => {
    const out = await new AiService(repo() as never).repairGuide('v1', 'Brake Replacement', true);
    expect(out.source).toBe('ai');
    expect(out.steps).toEqual([{ id: 1, title: 'Do it', description: 'now', completed: false }]);
  });

  it('repair guide: falls back to a preset when the LLM call throws', async () => {
    const r = repo({ repairGuideCompletion: vi.fn(async () => { throw new Error('boom'); }) });
    const out = await new AiService(r as never).repairGuide('v1', 'Tire Rotation', true);
    expect(out.source).toBe('preset');
    expect(out.steps.length).toBeGreaterThan(0);
  });
});
