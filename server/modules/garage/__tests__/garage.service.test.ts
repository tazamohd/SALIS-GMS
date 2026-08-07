import { describe, it, expect, vi } from 'vitest';
import { GarageService } from '../services/garage.service';
import type { IGarageRepository } from '../repositories/garage.repository';
import type { Garage } from '../domain/garage.types';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function garage(id: string): Garage {
  return { id } as unknown as Garage;
}

function makeRepo(overrides: Partial<IGarageRepository> = {}): IGarageRepository {
  return {
    listPaginated: vi.fn(async () => [] as never),
    count: vi.fn(async () => 0),
    getById: vi.fn(async () => undefined),
    getBranches: vi.fn(async () => [] as never),
    getRoles: vi.fn(async () => [] as never),
    getUserRoles: vi.fn(async () => [] as never),
    ...overrides,
  };
}

describe('GarageService', () => {
  it('lists garages globally (no tenant scoping) with a total', async () => {
    const repo = makeRepo({
      listPaginated: vi.fn(async () => [garage('g1')] as never),
      count: vi.fn(async () => 9),
    });
    const service = new GarageService(repo);
    const result = await service.list({ limit: 25, offset: 50 });
    expect(repo.listPaginated).toHaveBeenCalledWith(25, 50);
    expect(result).toEqual({ rows: [garage('g1')], total: 9 });
  });

  it('returns a garage by id', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => garage('g1')) });
    const service = new GarageService(repo);
    await expect(service.getById('g1')).resolves.toMatchObject({ id: 'g1' });
  });

  it('throws NotFound for a missing garage', async () => {
    const service = new GarageService(makeRepo());
    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('delegates branch, role, and user-role reads to the repository', async () => {
    const repo = makeRepo({
      getBranches: vi.fn(async () => [{ id: 'b1' }] as never),
      getRoles: vi.fn(async () => [{ id: 'r1' }] as never),
      getUserRoles: vi.fn(async () => [{ id: 'ur1' }] as never),
    });
    const service = new GarageService(repo);
    expect(await service.branches('g1')).toEqual([{ id: 'b1' }]);
    expect(await service.roles()).toEqual([{ id: 'r1' }]);
    expect(await service.userRoles('u1')).toEqual([{ id: 'ur1' }]);
    expect(repo.getBranches).toHaveBeenCalledWith('g1');
    expect(repo.getUserRoles).toHaveBeenCalledWith('u1');
  });
});
