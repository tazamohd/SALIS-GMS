/**
 * Payment repository (Phase E4 — Repository Pattern).
 *
 * The only place in the payment module that touches the data layer. The list
 * owns its garage-scoped join (payments ⋈ invoices ⋈ users — previously inlined
 * in the route); the money-movement operations delegate to the atomic
 * `storage.recordPayment` / `storage.reversePayment` (each a single locking
 * transaction). Keeping every query here preserves the module's single
 * data-access boundary.
 */

import { eq, desc } from 'drizzle-orm';
import { payments, invoices, users } from '@shared/schema';
import { db } from '../../../db';
import { storage } from '../../../storage';
import type { PaymentListRow } from '../domain/payment.types';

export interface IPaymentRepository {
  listForGarage(garageId: string | undefined): Promise<PaymentListRow[]>;
  record(
    data: Parameters<typeof storage.recordPayment>[0],
    garageId?: string,
  ): ReturnType<typeof storage.recordPayment>;
  reverse(id: string, garageId?: string): Promise<boolean>;
}

export class PaymentRepository implements IPaymentRepository {
  listForGarage(garageId: string | undefined): Promise<PaymentListRow[]> {
    // Payments are scoped to the caller's garage via the joined invoice —
    // without this every tenant saw all garages' payments.
    return db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        paymentDate: payments.paymentDate,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        referenceNumber: payments.referenceNumber,
        notes: payments.notes,
        createdBy: payments.createdBy,
        createdAt: payments.createdAt,
        invoiceNumber: invoices.invoiceNumber,
        customerName: users.fullName,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(users, eq(invoices.customerId, users.id))
      .where(garageId ? eq(invoices.garageId, garageId) : undefined)
      .orderBy(desc(payments.paymentDate)) as Promise<PaymentListRow[]>;
  }

  record(data: Parameters<typeof storage.recordPayment>[0], garageId?: string) {
    return storage.recordPayment(data, garageId);
  }

  reverse(id: string, garageId?: string): Promise<boolean> {
    return storage.reversePayment(id, garageId);
  }
}
