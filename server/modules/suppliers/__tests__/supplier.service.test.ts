import { describe, it, expect, vi } from 'vitest';
import { SupplierService } from '../services/supplier.service';
import type { ISupplierRepository } from '../repositories/supplier.repository';
import type { Supplier } from '../domain/supplier.types';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function supplier(id: string, garageId: string | null): Supplier {
  return { id, garageId } as unknown as Supplier;
}

function makeRepo(overrides: Partial<ISupplierRepository> = {}): ISupplierRepository {
  return {
    listPaginated: vi.fn(async () => [] as never),
    count: vi.fn(async () => 0),
    getById: vi.fn(async () => undefined),
    getPriceLists: vi.fn(async () => [] as never),
    getPriceListById: vi.fn(async () => undefined as never),
    comparePrices: vi.fn(async () => [] as never),
    ...overrides,
  };
}

describe('SupplierService.list', () => {
  it('pins to the session garage and ignores ?garage_id for a tenant user', async () => {
    const repo = makeRepo({ listPaginated: vi.fn(async () => [supplier('s1', 'g1')]), count: vi.fn(async () => 3) });
    const service = new SupplierService(repo);
    const result = await service.list({ auth: { garageId: 'g1' }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 25, 0);
    expect(result.total).toBe(3);
  });

  it('honors ?garage_id for a platform (garage-less) user', async () => {
    const repo = makeRepo();
    await new SupplierService(repo).list({ auth: { garageId: null }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', 25, 0);
  });
});

describe('SupplierService.getVisible', () => {
  it('returns a same-garage supplier', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => supplier('s1', 'g1')) });
    await expect(new SupplierService(repo).getVisible('s1', { garageId: 'g1' })).resolves.toMatchObject({ id: 's1' });
  });

  it('throws NotFound (not 403) on cross-garage access', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => supplier('s1', 'g2')) });
    await expect(new SupplierService(repo).getVisible('s1', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFound when missing', async () => {
    await expect(new SupplierService(makeRepo()).getVisible('x', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows a platform user to read across garages', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => supplier('s1', 'g2')) });
    await expect(new SupplierService(repo).getVisible('s1', { garageId: null })).resolves.toMatchObject({ id: 's1' });
  });
});

describe('SupplierService price lists', () => {
  it('lists price lists by supplier/part filters', async () => {
    const repo = makeRepo({ getPriceLists: vi.fn(async () => [{ id: 'pl1' }] as never) });
    const service = new SupplierService(repo);
    expect(await service.priceLists('s1', 'sp1')).toEqual([{ id: 'pl1' }]);
    expect(repo.getPriceLists).toHaveBeenCalledWith('s1', 'sp1');
  });

  it('404s a missing price list on by-id read', async () => {
    await expect(new SupplierService(makeRepo()).priceListById('x', { garageId: 'g1' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('delegates price comparison to the repository', async () => {
    const repo = makeRepo({ comparePrices: vi.fn(async () => [{ id: 'cmp' }] as never) });
    expect(await new SupplierService(repo).comparePrices('sp1')).toEqual([{ id: 'cmp' }]);
  });
});
