import { describe, it, expect, vi } from 'vitest';
import { NextGenService } from '../services/nextgen.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    list: vi.fn(async () => [{ id: 'x1' }]),
    create: vi.fn(async () => ({ id: 'qc1' })),
    ...o,
  };
}

describe('NextGenService — generic resource dispatch', () => {
  it('lists a resource by path via the repository', async () => {
    const r = repo();
    await new NextGenService(r as never).list('carbon-credits', 'g1');
    expect(r.list).toHaveBeenCalledWith('carbon-credits', 'g1');
  });
  it('creates a resource by path via the repository', async () => {
    const r = repo();
    await new NextGenService(r as never).create('drone-fleets', { droneName: 'x' });
    expect(r.create).toHaveBeenCalledWith('drone-fleets', { droneName: 'x' });
  });
  it('lists quality checks off the vision-quality-checks resource (raw)', async () => {
    const r = repo();
    await new NextGenService(r as never).listQualityChecks('g1');
    expect(r.list).toHaveBeenCalledWith('vision-quality-checks', 'g1');
  });
});

describe('NextGenService — analyzeImage', () => {
  it('persists a quality check then a defect row per finding and returns the summary', async () => {
    const r = repo();
    const out = await new NextGenService(r as never).analyzeImage('g1', 'u1', { checkType: 'paint', vehicleId: 'v1' });
    // first create is always the quality check
    expect(r.create.mock.calls[0][0]).toBe('vision-quality-checks');
    expect(out.checkId).toBe('qc1');
    expect(out.qualityScore).toBeGreaterThanOrEqual(75);
    expect(out.qualityScore).toBeLessThan(95);
    // the number of vision-defects creates matches the returned defect count
    const defectCreates = r.create.mock.calls.filter((c: unknown[]) => c[0] === 'vision-defects').length;
    expect(defectCreates).toBe(out.defects.length);
    // banding is consistent with the score
    const expected = out.qualityScore >= 90 ? 'excellent' : out.qualityScore >= 80 ? 'good' : 'needs_attention';
    expect(out.overallQuality).toBe(expected);
    expect(out.recommendations).toHaveLength(3);
  });
});
