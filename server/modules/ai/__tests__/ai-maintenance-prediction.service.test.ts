import { describe, it, expect, vi } from 'vitest';
import { AiMaintenancePredictionService } from '../services/ai-maintenance-prediction.service';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    predict: vi.fn(async () => ({ predictions: [{ item: 'brakes' }] })),
    diagnose: vi.fn(async () => ({
      predictedIssue: 'worn pads', severity: 'high', recommendedAction: 'replace',
      estimatedTimeframe: 'soon', confidence: 0.8, riskLevel: 'elevated', additionalDetails: 'x',
    })),
    analyze: vi.fn(async () => [{ issue: 'belt', severity: 'low', recommendation: 'inspect', probability: 0.5, estimatedMiles: 2000 }]),
    create: vi.fn(async (d: Record<string, unknown>) => ({ id: 'p1', ...d })),
    list: vi.fn(async () => [{ id: 'p1' }]),
    getById: vi.fn(async () => ({ id: 'p1', garageId: 'g1', status: 'pending' })),
    update: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'p1', garageId: 'g1', ...d })),
    listVehicles: vi.fn(async () => [{ id: 'v1', vin: 'VIN1', make: 'Toyota', model: 'Hilux', year: 2020, mileage: 60000 }]),
    listJobCards: vi.fn(async () => [{ id: 'jc1', vehicleInfo: { vin: 'VIN1' }, description: 'oil', totalCost: 100, createdAt: 'd1' }]),
    ...o,
  };
}

describe('AiMaintenancePredictionService', () => {
  it('predict assembles a pending, garage-scoped row from the engine result', async () => {
    const r = repo();
    await new AiMaintenancePredictionService(r as never).predict('g1', { vehicleId: 'v1', mileage: 60000 });
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      garageId: 'g1', vehicleId: 'v1', predictions: [{ item: 'brakes' }], status: 'pending',
    }));
  });

  it('diagnose persists the diagnostic and merges riskLevel/additionalDetails into the response', async () => {
    const out = await new AiMaintenancePredictionService(repo() as never).diagnose('g1', { vehicleId: 'v1' });
    expect(out).toMatchObject({ id: 'p1', riskLevel: 'elevated', additionalDetails: 'x' });
  });

  it('list forwards the garage + optional vehicle/status filters', async () => {
    const r = repo();
    await new AiMaintenancePredictionService(r as never).list('g1', 'v1', 'pending');
    expect(r.list).toHaveBeenCalledWith('g1', 'v1', 'pending');
  });

  it('get enforces ownership (404 missing / 403 cross-garage)', async () => {
    expect(await new AiMaintenancePredictionService(repo() as never).get('p1', 'g1')).toMatchObject({ id: 'p1' });
    await expect(new AiMaintenancePredictionService(repo({ getById: vi.fn(async () => undefined) }) as never).get('p1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new AiMaintenancePredictionService(repo({ getById: vi.fn(async () => ({ id: 'p1', garageId: 'z' })) }) as never).get('p1', 'g1'))
      .rejects.toBeInstanceOf(AuthorizationError);
  });

  it('acknowledge stamps the status + timestamp for the owning garage', async () => {
    const r = repo();
    await new AiMaintenancePredictionService(r as never).acknowledge('p1', 'g1', '2026-05-01T00:00:00.000Z');
    expect(r.update).toHaveBeenCalledWith('p1', { status: 'acknowledged', acknowledgedAt: '2026-05-01T00:00:00.000Z' });
  });

  it('analyze walks vehicles, matches job cards by VIN, and stores mapped predictions', async () => {
    const r = repo();
    const out = await new AiMaintenancePredictionService(r as never).analyze('g1');
    expect(r.analyze).toHaveBeenCalled();
    expect(out.predictions).toHaveLength(1);
    expect(out.message).toMatch(/Generated 1 new predictions using GPT-5/);
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      predictedIssue: 'belt', severity: 'low', confidence: 50, status: 'pending',
    }));
  });

  it('analyze skips vehicles whose VIN matches no job cards', async () => {
    const r = repo({ listJobCards: vi.fn(async () => [{ id: 'jc9', vehicleInfo: { vin: 'OTHER' } }]) });
    const out = await new AiMaintenancePredictionService(r as never).analyze('g1');
    expect(out.predictions).toHaveLength(0);
    expect(r.analyze).not.toHaveBeenCalled();
  });
});
