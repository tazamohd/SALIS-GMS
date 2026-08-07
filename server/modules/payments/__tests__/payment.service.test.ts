import { describe, it, expect, vi } from 'vitest';
import { PaymentService } from '../services/payment.service';
import type { IPaymentRepository } from '../repositories/payment.repository';
import type { PaymentListRow } from '../domain/payment.types';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { EventBus } from '../../../infrastructure/events/event-bus';
import { PaymentEventTypes } from '../events/payment.events';

function row(overrides: Partial<PaymentListRow> = {}): PaymentListRow {
  return {
    id: 'p1',
    invoiceId: 'inv1',
    paymentDate: null,
    amount: '100.00',
    paymentMethod: 'cash',
    referenceNumber: null,
    notes: null,
    createdBy: null,
    createdAt: null,
    invoiceNumber: 'INV-1',
    customerName: 'Acme',
    ...overrides,
  };
}

function makeRepo(overrides: Partial<IPaymentRepository> = {}): IPaymentRepository {
  return {
    listForGarage: vi.fn(async () => []),
    record: vi.fn(async () => undefined),
    reverse: vi.fn(async () => false),
    ...overrides,
  };
}

function makeBus() {
  return { publish: vi.fn(async () => undefined) } as unknown as EventBus & {
    publish: ReturnType<typeof vi.fn>;
  };
}

describe('PaymentService.list', () => {
  it('applies invoice_id and method filters over the garage-scoped rows', async () => {
    const rows = [
      row({ id: 'p1', invoiceId: 'inv1', paymentMethod: 'cash' }),
      row({ id: 'p2', invoiceId: 'inv2', paymentMethod: 'card' }),
      row({ id: 'p3', invoiceId: 'inv1', paymentMethod: 'card' }),
    ];
    const repo = makeRepo({ listForGarage: vi.fn(async () => rows) });
    const service = new PaymentService(repo);

    expect(await service.list({ garageId: 'g1' }, { invoiceId: 'inv1' })).toHaveLength(2);
    expect(await service.list({ garageId: 'g1' }, { method: 'card' })).toHaveLength(2);
    expect(await service.list({ garageId: 'g1' }, { method: 'all' })).toHaveLength(3);
    expect(await service.list({ garageId: 'g1' }, { invoiceId: 'inv1', method: 'card' })).toHaveLength(1);
  });
});

describe('PaymentService.create', () => {
  it('records the payment atomically and emits payment.received', async () => {
    const bus = makeBus();
    const repo = makeRepo({
      record: vi.fn(async () => ({
        payment: { id: 'p9', invoiceId: 'inv1', amount: '250.00' },
        invoice: { garageId: 'g1' },
      }) as never),
    });
    const service = new PaymentService(repo, bus);
    const payment = await service.create({ invoiceId: 'inv1', amount: '250.00' } as never, {
      garageId: 'g1',
      userId: 'u1',
    });
    expect(payment).toMatchObject({ id: 'p9' });
    expect(repo.record).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'inv1', createdBy: 'u1' }),
      'g1',
    );
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: PaymentEventTypes.Received,
      payload: { paymentId: 'p9', invoiceId: 'inv1', garageId: 'g1', amount: '250.00' },
    });
  });

  it('throws NotFound when the garage-scoped invoice does not exist', async () => {
    const bus = makeBus();
    const service = new PaymentService(makeRepo(), bus);
    await expect(service.create({ invoiceId: 'x' } as never, { garageId: 'g1' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(bus.publish).not.toHaveBeenCalled();
  });
});

describe('PaymentService.reverse', () => {
  it('reverses the payment and emits payment.reversed', async () => {
    const bus = makeBus();
    const repo = makeRepo({ reverse: vi.fn(async () => true) });
    const service = new PaymentService(repo, bus);
    await service.reverse('p1', { garageId: 'g1', userId: 'u1' });
    expect(repo.reverse).toHaveBeenCalledWith('p1', 'g1');
    expect(bus.publish.mock.calls[0][0]).toMatchObject({
      type: PaymentEventTypes.Reversed,
      payload: { paymentId: 'p1', garageId: 'g1' },
    });
  });

  it('throws NotFound when the payment is not found / not in scope', async () => {
    const service = new PaymentService(makeRepo({ reverse: vi.fn(async () => false) }));
    await expect(service.reverse('missing', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });
});
