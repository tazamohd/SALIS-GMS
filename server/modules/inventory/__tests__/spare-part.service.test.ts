import { describe, it, expect, vi } from 'vitest';
import { SparePartService } from '../services/spare-part.service';
import type { ISparePartRepository } from '../repositories/spare-part.repository';
import type { SparePart } from '../domain/spare-part.types';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';

function part(id: string): SparePart {
  return { id } as unknown as SparePart;
}

function makeRepo(overrides: Partial<ISparePartRepository> = {}): ISparePartRepository {
  return {
    listPaginated: vi.fn(async () => [] as never),
    count: vi.fn(async () => 0),
    getById: vi.fn(async () => undefined),
    getInventories: vi.fn(async () => [] as never),
    ...overrides,
  };
}

describe('SparePartService.list', () => {
  it('pins to the session garage and ignores ?garageId for a tenant user', async () => {
    const repo = makeRepo({ listPaginated: vi.fn(async () => [part('sp1')]), count: vi.fn(async () => 5) });
    const service = new SparePartService(repo);
    const result = await service.list({ auth: { garageId: 'g1' }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 25, 0);
    expect(result.total).toBe(5);
  });

  it('honors ?garageId for a platform (garage-less) user', async () => {
    const repo = makeRepo();
    await new SparePartService(repo).list({ auth: { garageId: null }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', 25, 0);
  });
});

describe('SparePartService.getById', () => {
  it('returns the part when it exists (no cross-garage check, per legacy)', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => part('sp1')) });
    await expect(new SparePartService(repo).getById('sp1')).resolves.toMatchObject({ id: 'sp1' });
  });

  it('throws NotFound when missing', async () => {
    await expect(new SparePartService(makeRepo()).getById('x')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('SparePartService.inventories', () => {
  it('requires an effective garage (400-mapped ValidationError)', async () => {
    const repo = makeRepo();
    expect(() => new SparePartService(repo).inventories({ garageId: null }, undefined, undefined)).toThrow(
      ValidationError,
    );
    expect(repo.getInventories).not.toHaveBeenCalled();
  });

  it('queries inventories for the effective garage and spare part filter', async () => {
    const repo = makeRepo({ getInventories: vi.fn(async () => [{ id: 'inv1' }] as never) });
    const service = new SparePartService(repo);
    const rows = await service.inventories({ garageId: 'g1' }, 'g2', 'sp1');
    expect(repo.getInventories).toHaveBeenCalledWith('g1', 'sp1'); // session garage wins
    expect(rows).toEqual([{ id: 'inv1' }]);
  });
});
