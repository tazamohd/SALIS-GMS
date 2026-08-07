import { describe, it, expect, vi } from 'vitest';
import { InvoiceService } from '../services/invoice.service';
import type { IInvoiceRepository } from '../repositories/invoice.repository';
import type { Invoice } from '../domain/invoice.types';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { EventBus } from '../../../infrastructure/events/event-bus';
import { InvoiceEventTypes } from '../events/invoice.events';

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return { id: 'inv1', garageId: 'g1', status: 'draft', ...overrides } as unknown as Invoice;
}

function makeRepo(overrides: Partial<IInvoiceRepository> = {}): IInvoiceRepository {
  return {
    listPaginated: vi.fn(async () => [] as never),
    count: vi.fn(async () => 0),
    getById: vi.fn(async () => undefined),
    getItems: vi.fn(async () => [] as never),
    createInvoice: vi.fn(async () => invoice()),
    createWithItems: vi.fn(async () => invoice()),
    update: vi.fn(async () => invoice()),
    delete: vi.fn(async () => undefined),
    getJobCardRow: vi.fn(async () => undefined),
    getTaxSettings: vi.fn(async () => undefined),
    getTechnicianHourlyRate: vi.fn(async () => undefined),
    getTasksByJobCard: vi.fn(async () => [] as never),
    getJobCardParts: vi.fn(async () => [] as never),
    getSparePartName: vi.fn(async () => undefined),
    insertInvoiceRow: vi.fn(async () => invoice()),
    insertInvoiceItems: vi.fn(async () => undefined),
    ...overrides,
  };
}

function makeBus() {
  return { publish: vi.fn(async () => undefined) } as unknown as EventBus & {
    publish: ReturnType<typeof vi.fn>;
  };
}

describe('InvoiceService.create', () => {
  it('pins garageId to the session garage (never trusts the body) and emits invoice.created', async () => {
    const bus = makeBus();
    const captured = vi.fn(async () => invoice({ id: 'inv9', garageId: 'g1' }));
    const repo = makeRepo({ createInvoice: captured });
    const service = new InvoiceService(repo, bus);
    await service.create({ garageId: 'g2', totalAmount: '10' } as never, { garageId: 'g1', userId: 'u1' });
    expect(captured).toHaveBeenCalledWith(expect.objectContaining({ garageId: 'g1', createdBy: 'u1' }));
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: InvoiceEventTypes.Created,
      payload: { invoiceId: 'inv9', source: 'manual' },
    });
  });
});

describe('InvoiceService.getVisible', () => {
  it('throws NotFound on cross-garage access', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => invoice({ garageId: 'g2' })) });
    await expect(new InvoiceService(repo).getVisible('inv1', { garageId: 'g1' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe('InvoiceService.update (status workflow)', () => {
  it('allows a valid transition (draft → sent)', async () => {
    const repo = makeRepo({
      getById: vi.fn(async () => invoice({ status: 'draft' })),
      update: vi.fn(async () => invoice({ status: 'sent' })),
    });
    const result = await new InvoiceService(repo).update('inv1', { status: 'sent' } as never, { garageId: 'g1' });
    expect(result.status).toBe('sent');
  });

  it('rejects an invalid transition (paid → draft) with a 400-mapped ValidationError', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => invoice({ status: 'paid' })) });
    await expect(
      new InvoiceService(repo).update('inv1', { status: 'draft' } as never, { garageId: 'g1' }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe('InvoiceService.createFromJob', () => {
  it('throws NotFound for a missing job card', async () => {
    await expect(
      new InvoiceService(makeRepo()).createFromJob('jc-missing', { garageId: 'g1' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('computes labor + parts + tax server-side and emits invoice.created', async () => {
    const bus = makeBus();
    const insertRow = vi.fn(async (v: Record<string, unknown>) => invoice({ id: 'inv1', ...v }));
    const insertItems = vi.fn(async () => undefined);
    const repo = makeRepo({
      getJobCardRow: vi.fn(async () => ({
        id: 'jc1',
        garageId: 'g1',
        assignedTo: 'tech1',
        customerId: 'c1',
        jobNumber: 'JC-1',
        actualHours: null,
        estimatedHours: null,
      }) as never),
      getTaxSettings: vi.fn(async () => ({ isVatRegistered: true, vatRate: '15.00' })),
      getTechnicianHourlyRate: vi.fn(async () => ({ hourlyRate: '100' })),
      getTasksByJobCard: vi.fn(async () => [
        { actualMinutes: 60, estimatedMinutes: 0 },
        { actualMinutes: 0, estimatedMinutes: 30 },
      ] as never),
      getJobCardParts: vi.fn(async () => [
        { quantity: 2, unitPrice: '50', lineTotal: '100', sparePartId: 'sp1' },
      ] as never),
      getSparePartName: vi.fn(async () => ({ name: 'Brake Pad' })),
      insertInvoiceRow: insertRow,
      insertInvoiceItems: insertItems,
    });
    const result = await new InvoiceService(repo, bus).createFromJob('jc1', { garageId: 'g1', userId: 'u1' });

    // laborMinutes = 90 → laborCost = 90/60 * 100 = 150; partsCost = 100.
    expect(result.breakdown.laborCost).toBe('150.00');
    expect(result.breakdown.partsCost).toBe('100.00');
    expect(result.breakdown.subtotal).toBe('250.00');
    expect(result.breakdown.taxAmount).toBe('37.50'); // 250 * 0.15
    expect(result.breakdown.totalAmount).toBe('287.50');
    expect(result.breakdown.taxRate).toBe(0.15);
    expect(result.breakdown.laborRate).toBe(100);
    expect(insertRow).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: '250.00', totalAmount: '287.50', jobCardId: 'jc1' }),
    );
    // labor line + one part line
    expect(insertItems).toHaveBeenCalledTimes(1);
    expect(insertItems.mock.calls[0][0]).toHaveLength(2);
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: InvoiceEventTypes.Created,
      payload: { source: 'from-job' },
    });
  });
});
