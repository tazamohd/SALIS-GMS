/**
 * Payment service (Phase E5 — Domain Services).
 *
 * Owns the payment module's business rules: garage-scoped listing with in-memory
 * method/invoice filters, and the two money-movement operations. Recording and
 * reversing a payment go through the repository's atomic storage transactions
 * (which lock the invoice, move money, and update the balance in one step,
 * garage-scoped so a payment cannot target another tenant's invoice — B6/B7).
 * Each operation emits a fire-and-forget domain event (E7) after it commits.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import { EventBus, createEvent } from '../../../infrastructure/events/event-bus';
import type { IPaymentRepository } from '../repositories/payment.repository';
import { PaymentEventTypes } from '../events/payment.events';
import type {
  Payment,
  PaymentAuthContext,
  PaymentListFilters,
  PaymentListRow,
} from '../domain/payment.types';

export class PaymentService {
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly events?: EventBus,
  ) {}

  async list(auth: PaymentAuthContext, filters: PaymentListFilters): Promise<PaymentListRow[]> {
    let rows = await this.repository.listForGarage(auth.garageId ?? undefined);
    if (filters.invoiceId) {
      rows = rows.filter((p) => p.invoiceId === filters.invoiceId);
    }
    if (filters.method && filters.method !== 'all') {
      rows = rows.filter((p) => p.paymentMethod === filters.method);
    }
    return rows;
  }

  async create(
    data: Parameters<IPaymentRepository['record']>[0],
    auth: PaymentAuthContext,
  ): Promise<Payment> {
    const paymentData = { ...data, createdBy: auth.userId || 'default-user' };
    const result = await this.repository.record(paymentData as never, auth.garageId ?? undefined);
    if (!result) {
      throw new NotFoundError('Invoice not found');
    }
    this.emit(
      PaymentEventTypes.Received,
      {
        paymentId: result.payment.id,
        invoiceId: result.payment.invoiceId ?? null,
        garageId: result.invoice.garageId ?? auth.garageId ?? null,
        amount: result.payment.amount ?? null,
        receivedByUserId: auth.userId,
      },
    );
    return result.payment;
  }

  async reverse(id: string, auth: PaymentAuthContext): Promise<void> {
    const ok = await this.repository.reverse(id, auth.garageId ?? undefined);
    if (!ok) {
      throw new NotFoundError('Payment not found', { context: { id } });
    }
    this.emit(PaymentEventTypes.Reversed, {
      paymentId: id,
      garageId: auth.garageId ?? null,
      reversedByUserId: auth.userId,
    });
  }

  private emit(type: string, payload: Record<string, unknown>): void {
    if (!this.events) return;
    void this.events.publish(createEvent(type, payload)).catch(() => {
      /* delivery failures are handled by the bus (retry/DLQ). */
    });
  }
}
