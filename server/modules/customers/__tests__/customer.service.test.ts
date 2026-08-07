import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerService } from '../services/customer.service';
import type { ICustomerRepository } from '../repositories/customer.repository';
import type { Customer } from '../domain/customer.types';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { EventBus } from '../../../infrastructure/events/event-bus';
import { CustomerEventTypes } from '../events/customer.events';

function customer(id: string, garageId: string | null): Customer {
  return { id, garageId } as unknown as Customer;
}

function makeRepo(overrides: Partial<ICustomerRepository> = {}): ICustomerRepository {
  return {
    getById: vi.fn(async () => undefined),
    listPaginated: vi.fn(async () => []),
    count: vi.fn(async () => 0),
    search: vi.fn(async () => []),
    getVehicles: vi.fn(async () => [] as never),
    getJobCards: vi.fn(async () => [] as never),
    getInvoices: vi.fn(async () => [] as never),
    getPayments: vi.fn(async () => [] as never),
    getNotes: vi.fn(async () => [] as never),
    getServiceReminders: vi.fn(async () => [] as never),
    getReviews: vi.fn(async () => [] as never),
    getSignatures: vi.fn(async () => [] as never),
    ...overrides,
  };
}

function makeBus() {
  return { publish: vi.fn(async () => undefined) } as unknown as EventBus & {
    publish: ReturnType<typeof vi.fn>;
  };
}

describe('CustomerService.list', () => {
  it('uses the search path when the query is >= 2 chars, total = row count', async () => {
    const rows = [customer('1', 'g1'), customer('2', 'g1')];
    const repo = makeRepo({ search: vi.fn(async () => rows) });
    const service = new CustomerService(repo);
    const result = await service.list({
      auth: { garageId: 'g1' },
      search: 'jo',
      limit: 50,
      offset: 0,
    });
    expect(repo.search).toHaveBeenCalledWith('g1', '%jo%', 50);
    expect(result).toEqual({ rows, total: 2 });
  });

  it('falls back to pagination for a < 2 char search', async () => {
    const repo = makeRepo({
      listPaginated: vi.fn(async () => [customer('1', 'g1')]),
      count: vi.fn(async () => 7),
    });
    const service = new CustomerService(repo);
    const result = await service.list({ auth: { garageId: 'g1' }, search: 'j', limit: 25, offset: 0 });
    expect(repo.search).not.toHaveBeenCalled();
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 25, 0);
    expect(result.total).toBe(7);
  });

  it('pins to the session garage and ignores ?garage_id for a tenant user', async () => {
    const repo = makeRepo();
    const service = new CustomerService(repo);
    await service.list({ auth: { garageId: 'g1' }, garageIdParam: 'g2', limit: 50, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 50, 0);
  });

  it('honors ?garage_id for a platform (garage-less) user', async () => {
    const repo = makeRepo();
    const service = new CustomerService(repo);
    await service.list({ auth: { garageId: null }, garageIdParam: 'g2', limit: 50, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', 50, 0);
  });
});

describe('CustomerService.getVisible', () => {
  let bus: ReturnType<typeof makeBus>;
  beforeEach(() => {
    bus = makeBus();
  });

  it('returns the customer and emits a viewed event for a same-garage read', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => customer('7', 'g1')) });
    const service = new CustomerService(repo, bus);
    const result = await service.getVisible('7', { garageId: 'g1', userId: 'u1' });
    expect(result.id).toBe('7');
    expect(bus.publish).toHaveBeenCalledOnce();
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: CustomerEventTypes.Viewed,
      payload: { customerId: '7', viewedByGarageId: 'g1', viewedByUserId: 'u1' },
    });
  });

  it('throws NotFound when the customer does not exist', async () => {
    const service = new CustomerService(makeRepo(), bus);
    await expect(service.getVisible('x', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
    expect(bus.publish).not.toHaveBeenCalled();
  });

  it('throws NotFound (not 403) on cross-garage access', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => customer('7', 'g2')) });
    const service = new CustomerService(repo, bus);
    await expect(service.getVisible('7', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows a platform user to read across garages', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => customer('7', 'g2')) });
    const service = new CustomerService(repo, bus);
    await expect(service.getVisible('7', { garageId: null })).resolves.toMatchObject({ id: '7' });
  });
});

describe('CustomerService sub-resource visibility', () => {
  it('blocks a tenant user from a customer in another garage', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => customer('7', 'g2')) });
    const service = new CustomerService(repo);
    await expect(service.vehicles('7', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.getVehicles).not.toHaveBeenCalled();
  });

  it('returns sub-resources for a same-garage customer', async () => {
    const repo = makeRepo({
      getById: vi.fn(async () => customer('7', 'g1')),
      getVehicles: vi.fn(async () => [{ id: 'v1' }] as never),
    });
    const service = new CustomerService(repo);
    const vehicles = await service.vehicles('7', { garageId: 'g1' });
    expect(vehicles).toEqual([{ id: 'v1' }]);
  });

  it('skips the ownership lookup entirely for a platform user', async () => {
    const repo = makeRepo({ getVehicles: vi.fn(async () => [{ id: 'v9' }] as never) });
    const service = new CustomerService(repo);
    const vehicles = await service.vehicles('7', { garageId: null });
    expect(repo.getById).not.toHaveBeenCalled();
    expect(vehicles).toEqual([{ id: 'v9' }]);
  });
});
