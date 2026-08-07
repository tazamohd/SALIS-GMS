/**
 * Payment domain events (Phase E7 — Event-Driven Architecture).
 *
 * `payment.received` and `payment.reversed` are published fire-and-forget after
 * the atomic money movement commits, feeding audit/analytics/notification
 * handlers. These extend the write-path event set toward the target
 * `PaymentReceived → …` workflows.
 */

export const PaymentEventTypes = {
  Received: 'payment.received',
  Reversed: 'payment.reversed',
} as const;

export type PaymentEventType = (typeof PaymentEventTypes)[keyof typeof PaymentEventTypes];

export interface PaymentReceivedPayload {
  paymentId: string;
  invoiceId: string | null;
  garageId: string | null;
  amount: string | null;
  receivedByUserId?: string;
}

export interface PaymentReversedPayload {
  paymentId: string;
  garageId: string | null;
  reversedByUserId?: string;
}
