import { describe, it, expect, vi } from 'vitest';
import { AiPartsRecommendationService } from '../services/ai-parts-recommendation.service';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    recommend: vi.fn(async () => ({ parts: [{ name: 'pad' }], totalEstimatedCost: 300, reasoning: 'wear', confidence: 0.85 })),
    create: vi.fn(async (d: Record<string, unknown>) => ({ id: 'r1', ...d })),
    list: vi.fn(async () => [{ id: 'r1' }]),
    getById: vi.fn(async () => ({ id: 'r1', garageId: 'g1' })),
    update: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'r1', garageId: 'g1', ...d })),
    ...o,
  };
}

describe('AiPartsRecommendationService', () => {
  it('recommend runs the LLM helper and persists a pending, garage-scoped row', async () => {
    const r = repo();
    await new AiPartsRecommendationService(r as never).recommend('g1', { serviceType: 'brakes', vehicleId: 'v1', jobCardId: 'jc1' });
    expect(r.recommend).toHaveBeenCalled();
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      garageId: 'g1',
      vehicleId: 'v1',
      serviceType: 'brakes',
      jobCardId: 'jc1',
      recommendedParts: [{ name: 'pad' }],
      totalEstimatedCost: 300,
      confidence: 0.85,
      status: 'pending',
    }));
  });

  it('list forwards the garage + optional vehicle/status filters', async () => {
    const r = repo();
    await new AiPartsRecommendationService(r as never).list('g1', 'v1', 'pending');
    expect(r.list).toHaveBeenCalledWith('g1', 'v1', 'pending');
  });

  it('get enforces ownership (404 missing / 403 cross-garage)', async () => {
    expect(await new AiPartsRecommendationService(repo() as never).get('r1', 'g1')).toMatchObject({ id: 'r1' });
    await expect(new AiPartsRecommendationService(repo({ getById: vi.fn(async () => undefined) }) as never).get('r1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new AiPartsRecommendationService(repo({ getById: vi.fn(async () => ({ id: 'r1', garageId: 'z' })) }) as never).get('r1', 'g1'))
      .rejects.toBeInstanceOf(AuthorizationError);
  });

  it('update rejects a garage-change attempt with AuthorizationError', async () => {
    await expect(new AiPartsRecommendationService(repo() as never).update('r1', 'g1', { garageId: 'g2' }))
      .rejects.toThrow(/Cannot change garage/);
  });

  it('update applies the patch for the owning garage', async () => {
    const r = repo();
    await new AiPartsRecommendationService(r as never).update('r1', 'g1', { status: 'accepted' });
    expect(r.update).toHaveBeenCalledWith('r1', { status: 'accepted' });
  });
});
