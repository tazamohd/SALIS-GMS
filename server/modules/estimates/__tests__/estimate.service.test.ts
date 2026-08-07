import { describe, it, expect, vi } from 'vitest';
import { EstimateService } from '../services/estimate.service';
import type { IEstimateRepository } from '../repositories/estimate.repository';
import type { Estimate } from '../domain/estimate.types';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { EventBus } from '../../../infrastructure/events/event-bus';
import { EstimateEventTypes } from '../events/estimate.events';

function estimate(overrides: Partial<Estimate> = {}): Estimate {
  return {
    id: 'e1',
    garageId: 'g1',
    customerId: 'c1',
    vehicleId: 'v1',
    title: 'Brakes',
    description: 'desc',
    subtotal: '100.00',
    taxAmount: '15.00',
    discountAmount: '0.00',
    totalAmount: '115.00',
    notes: null,
    convertedToJobCardId: null,
    convertedToInvoiceId: null,
    ...overrides,
  } as unknown as Estimate;
}

const item = { itemType: 'part', description: 'pad', quantity: '2', unitPrice: '50', lineTotal: '100' };

function makeRepo(overrides: Partial<IEstimateRepository> = {}): IEstimateRepository {
  return {
    listPaginated: vi.fn(async () => [] as never),
    count: vi.fn(async () => 0),
    getById: vi.fn(async () => undefined),
    getItems: vi.fn(async () => [] as never),
    createWithItems: vi.fn(async () => estimate()),
    update: vi.fn(async () => estimate()),
    delete: vi.fn(async () => undefined),
    getStatsRaw: vi.fn(async () => ({ agg: undefined, byStatus: [] })),
    createJobCard: vi.fn(async () => ({ id: 'jc1' }) as never),
    createTaskAssignment: vi.fn(async () => ({ id: 'ta1' }) as never),
    createInvoice: vi.fn(async () => ({ id: 'inv1' }) as never),
    createInvoiceItem: vi.fn(async () => ({ id: 'ii1' }) as never),
    ...overrides,
  };
}

function makeBus() {
  return { publish: vi.fn(async () => undefined) } as unknown as EventBus & {
    publish: ReturnType<typeof vi.fn>;
  };
}

describe('EstimateService.list', () => {
  it('prefers ?garage_id over session garage (legacy behavior) and threads status', async () => {
    const repo = makeRepo({ listPaginated: vi.fn(async () => [estimate()]), count: vi.fn(async () => 1) });
    const service = new EstimateService(repo);
    await service.list({ auth: { garageId: 'g1' }, garageIdParam: 'g2', status: 'sent', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', 'sent', 25, 0);
    expect(repo.count).toHaveBeenCalledWith('g2', 'sent');
  });
});

describe('EstimateService.getVisible', () => {
  it('throws NotFound on cross-garage access', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => estimate({ garageId: 'g2' })) });
    const service = new EstimateService(repo);
    await expect(service.getVisible('e1', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('EstimateService.stats', () => {
  it('returns zeroed stats when the caller has no garage', async () => {
    const repo = makeRepo();
    const stats = await new EstimateService(repo).stats(null);
    expect(stats.totalEstimates).toBe(0);
    expect(stats.funnel).toEqual({ created: 0, sent: 0, approved: 0, converted: 0 });
    expect(repo.getStatsRaw).not.toHaveBeenCalled();
  });

  it('computes conversion rate and funnel from raw aggregates', async () => {
    const repo = makeRepo({
      getStatsRaw: vi.fn(async () => ({
        agg: { total: 10, created: 4, sent: 3, approved: 1, converted: 2, pending: 7, avg_value: 250 },
        byStatus: [{ status: 'sent', count: 3 }],
      })),
    });
    const stats = await new EstimateService(repo).stats('g1');
    expect(stats.totalEstimates).toBe(10);
    expect(stats.conversionRate).toBe(20); // 2/10 * 100
    expect(stats.avgValue).toBe(250);
    expect(stats.byStatus).toEqual({ sent: 3 });
  });
});

describe('EstimateService.convertToJobCard', () => {
  it('creates a job card + task assignments, marks converted, and emits an event', async () => {
    const bus = makeBus();
    const repo = makeRepo({
      getById: vi.fn(async () => estimate()),
      getItems: vi.fn(async () => [item, item] as never),
    });
    const service = new EstimateService(repo, bus);
    const jobCard = await service.convertToJobCard('e1', { garageId: 'g1', userId: 'u1' });
    expect(jobCard).toEqual({ id: 'jc1' });
    expect(repo.createTaskAssignment).toHaveBeenCalledTimes(2);
    expect(repo.update).toHaveBeenCalledWith('e1', { status: 'converted', convertedToJobCardId: 'jc1' });
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: EstimateEventTypes.ConvertedToJobCard,
      payload: { estimateId: 'e1', jobCardId: 'jc1' },
    });
  });

  it('rejects a re-conversion with a 400-mapped ValidationError', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => estimate({ convertedToJobCardId: 'jc-old' })) });
    const service = new EstimateService(repo);
    await expect(service.convertToJobCard('e1', { garageId: 'g1' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.createJobCard).not.toHaveBeenCalled();
  });
});

describe('EstimateService.convertToInvoice', () => {
  it('creates an invoice + items, marks converted, and emits an event', async () => {
    const bus = makeBus();
    const repo = makeRepo({
      getById: vi.fn(async () => estimate()),
      getItems: vi.fn(async () => [item] as never),
    });
    const service = new EstimateService(repo, bus);
    const invoice = await service.convertToInvoice('e1', { garageId: 'g1', userId: 'u1' });
    expect(invoice).toEqual({ id: 'inv1' });
    expect(repo.createInvoiceItem).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('e1', { status: 'converted', convertedToInvoiceId: 'inv1' });
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: EstimateEventTypes.ConvertedToInvoice,
      payload: { estimateId: 'e1', invoiceId: 'inv1' },
    });
  });

  it('rejects a re-conversion', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => estimate({ convertedToInvoiceId: 'inv-old' })) });
    const service = new EstimateService(repo);
    await expect(service.convertToInvoice('e1', { garageId: 'g1' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.createInvoice).not.toHaveBeenCalled();
  });
});
