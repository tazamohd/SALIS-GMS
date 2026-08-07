import { describe, it, expect, vi } from 'vitest';
import { JobCardService } from '../services/jobcard.service';
import type { IJobCardRepository } from '../repositories/jobcard.repository';
import type { JobCard } from '../domain/jobcard.types';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function jobCard(id: string, garageId: string | null): JobCard {
  return { id, garageId } as unknown as JobCard;
}

function makeRepo(overrides: Partial<IJobCardRepository> = {}): IJobCardRepository {
  return {
    listPaginated: vi.fn(async () => []),
    count: vi.fn(async () => 0),
    getById: vi.fn(async () => undefined),
    getWithDetails: vi.fn(async () => undefined as never),
    getParts: vi.fn(async () => [] as never),
    getTasks: vi.fn(async () => [] as never),
    ...overrides,
  };
}

describe('JobCardService.list', () => {
  it('pins to the session garage and threads the assignedTo filter', async () => {
    const repo = makeRepo({ listPaginated: vi.fn(async () => [jobCard('j1', 'g1')]), count: vi.fn(async () => 2) });
    const service = new JobCardService(repo);
    const result = await service.list({
      auth: { garageId: 'g1' },
      garageIdParam: 'g2',
      assignedTo: 'tech-1',
      limit: 25,
      offset: 0,
    });
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 'tech-1', 25, 0);
    expect(repo.count).toHaveBeenCalledWith('g1', 'tech-1');
    expect(result.total).toBe(2);
  });

  it('honors ?garage_id for a platform (garage-less) user', async () => {
    const repo = makeRepo();
    const service = new JobCardService(repo);
    await service.list({ auth: { garageId: null }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', undefined, 25, 0);
  });
});

describe('JobCardService detail visibility', () => {
  it('returns a same-garage job card', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => jobCard('j1', 'g1')) });
    const service = new JobCardService(repo);
    await expect(service.getVisible('j1', { garageId: 'g1' })).resolves.toMatchObject({ id: 'j1' });
  });

  it('throws NotFound when missing', async () => {
    const service = new JobCardService(makeRepo());
    await expect(service.getVisible('x', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFound (not 403) on cross-garage access', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => jobCard('j1', 'g2')) });
    const service = new JobCardService(repo);
    await expect(service.getVisible('j1', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('applies the same visibility rule to details', async () => {
    const repo = makeRepo({ getWithDetails: vi.fn(async () => ({ id: 'j1', garageId: 'g2' }) as never) });
    const service = new JobCardService(repo);
    await expect(service.getDetailsVisible('j1', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('JobCardService sub-resource visibility', () => {
  it('blocks a tenant user from parts of a job card in another garage', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => jobCard('j1', 'g2')) });
    const service = new JobCardService(repo);
    await expect(service.parts('j1', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.getParts).not.toHaveBeenCalled();
  });

  it('returns parts and tasks for a same-garage job card', async () => {
    const repo = makeRepo({
      getById: vi.fn(async () => jobCard('j1', 'g1')),
      getParts: vi.fn(async () => [{ id: 'p1' }] as never),
      getTasks: vi.fn(async () => [{ id: 't1' }] as never),
    });
    const service = new JobCardService(repo);
    expect(await service.parts('j1', { garageId: 'g1' })).toEqual([{ id: 'p1' }]);
    expect(await service.tasks('j1', { garageId: 'g1' })).toEqual([{ id: 't1' }]);
  });

  it('skips the ownership lookup entirely for a platform user', async () => {
    const repo = makeRepo({ getParts: vi.fn(async () => [{ id: 'p9' }] as never) });
    const service = new JobCardService(repo);
    expect(await service.parts('j1', { garageId: null })).toEqual([{ id: 'p9' }]);
    expect(repo.getById).not.toHaveBeenCalled();
  });
});
