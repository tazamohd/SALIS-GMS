import { describe, it, expect, vi } from 'vitest';
import { AiScheduleOptimizationService } from '../services/ai-schedule-optimization.service';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    optimize: vi.fn(async () => ({
      conflicts: [{ a: 1 }], suggestions: [{ s: 1 }], totalPotentialTimeSaved: 45, reasoning: 'packed',
    })),
    create: vi.fn(async (d: Record<string, unknown>) => ({ id: 'o1', ...d })),
    list: vi.fn(async () => [{ id: 'o1' }]),
    getById: vi.fn(async () => ({ id: 'o1', garageId: 'g1' })),
    update: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'o1', garageId: 'g1', ...d })),
    ...o,
  };
}

describe('AiScheduleOptimizationService', () => {
  it('optimize runs the LLM helper and persists a pending, garage-scoped row', async () => {
    const r = repo();
    await new AiScheduleOptimizationService(r as never).optimize('g1', { appointments: [{ id: 'a1' }], technicians: [{ id: 't1' }] });
    expect(r.optimize).toHaveBeenCalledWith({ appointments: [{ id: 'a1' }], technicians: [{ id: 't1' }] });
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      garageId: 'g1',
      conflicts: [{ a: 1 }],
      suggestions: [{ s: 1 }],
      potentialTimeSaved: 45,
      reasoning: 'packed',
      status: 'pending',
    }));
  });

  it('optimize defaults appointments/technicians to empty arrays', async () => {
    const r = repo();
    await new AiScheduleOptimizationService(r as never).optimize('g1', {});
    expect(r.optimize).toHaveBeenCalledWith({ appointments: [], technicians: [] });
  });

  it('list forwards the garage + optional status filter', async () => {
    const r = repo();
    await new AiScheduleOptimizationService(r as never).list('g1', 'applied');
    expect(r.list).toHaveBeenCalledWith('g1', 'applied');
  });

  it('get enforces ownership (404 missing / 403 cross-garage)', async () => {
    expect(await new AiScheduleOptimizationService(repo() as never).get('o1', 'g1')).toMatchObject({ id: 'o1' });
    await expect(new AiScheduleOptimizationService(repo({ getById: vi.fn(async () => undefined) }) as never).get('o1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new AiScheduleOptimizationService(repo({ getById: vi.fn(async () => ({ id: 'o1', garageId: 'z' })) }) as never).get('o1', 'g1'))
      .rejects.toBeInstanceOf(AuthorizationError);
  });

  it('update rejects a garage-change attempt with AuthorizationError', async () => {
    await expect(new AiScheduleOptimizationService(repo() as never).update('o1', 'g1', { garageId: 'g2' }))
      .rejects.toThrow(/Cannot change garage/);
  });

  it('update applies the patch for the owning garage', async () => {
    const r = repo();
    await new AiScheduleOptimizationService(r as never).update('o1', 'g1', { status: 'applied' });
    expect(r.update).toHaveBeenCalledWith('o1', { status: 'applied' });
  });
});
