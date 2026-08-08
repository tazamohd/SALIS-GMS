import { describe, it, expect, vi } from 'vitest';
import { AiJobEstimationService } from '../services/ai-job-estimation.service';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    estimate: vi.fn(async () => ({ estimatedHours: 2.5, estimatedCost: 400, confidence: 0.9, reasoning: 'because' })),
    create: vi.fn(async (d: Record<string, unknown>) => ({ id: 'e1', ...d })),
    listByGarage: vi.fn(async () => [{ id: 'e1' }]),
    getById: vi.fn(async () => ({ id: 'e1', garageId: 'g1' })),
    update: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'e1', garageId: 'g1', ...d })),
    ...o,
  };
}

describe('AiJobEstimationService', () => {
  it('estimate runs the LLM helper and persists a garage-scoped row with stringified numbers', async () => {
    const r = repo();
    await new AiJobEstimationService(r as never).estimate('g1', { serviceType: 'brakes', vehicleId: 'v1' });
    expect(r.estimate).toHaveBeenCalled();
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      garageId: 'g1',
      serviceType: 'brakes',
      vehicleId: 'v1',
      estimatedHours: '2.5',
      estimatedCost: '400',
      confidence: '0.9',
      reasoning: 'because',
    }));
  });

  it('list passes the garage + optional vehicle filter through', async () => {
    const r = repo();
    await new AiJobEstimationService(r as never).list('g1', 'v9');
    expect(r.listByGarage).toHaveBeenCalledWith('g1', 'v9');
  });

  it('get returns the row for the owning garage', async () => {
    expect(await new AiJobEstimationService(repo() as never).get('e1', 'g1')).toMatchObject({ id: 'e1' });
  });

  it('get throws NotFoundError when missing and AuthorizationError cross-garage', async () => {
    await expect(new AiJobEstimationService(repo({ getById: vi.fn(async () => undefined) }) as never).get('e1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new AiJobEstimationService(repo({ getById: vi.fn(async () => ({ id: 'e1', garageId: 'other' })) }) as never).get('e1', 'g1'))
      .rejects.toBeInstanceOf(AuthorizationError);
  });

  it('update rejects a garage-change attempt with AuthorizationError', async () => {
    await expect(new AiJobEstimationService(repo() as never).update('e1', 'g1', { garageId: 'g2' }))
      .rejects.toThrow(/Cannot change garage/);
  });

  it('update applies the patch for the owning garage', async () => {
    const r = repo();
    await new AiJobEstimationService(r as never).update('e1', 'g1', { serviceType: 'oil' });
    expect(r.update).toHaveBeenCalledWith('e1', { serviceType: 'oil' });
  });
});
