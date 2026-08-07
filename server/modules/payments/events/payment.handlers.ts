/**
 * Payment event handlers (Phase E7). The audit handler records recent payment
 * activity (received / reversed) in a capped in-memory ring buffer — a durable
 * sink can replace it later — demonstrating idempotent, retry-backed,
 * fire-and-forget delivery on the money-movement path.
 */

import type { EventBus } from '../../../infrastructure/events/event-bus';
import {
  PaymentEventTypes,
  type PaymentReceivedPayload,
  type PaymentReversedPayload,
} from './payment.events';

const MAX_AUDIT_ENTRIES = 500;

export interface PaymentAudit {
  type: string;
  paymentId: string;
  garageId: string | null;
  at: string;
}

const recentPayments: PaymentAudit[] = [];

export function getRecentPaymentActivity(): readonly PaymentAudit[] {
  return [...recentPayments];
}

function record(entry: PaymentAudit): void {
  recentPayments.push(entry);
  if (recentPayments.length > MAX_AUDIT_ENTRIES) {
    recentPayments.splice(0, recentPayments.length - MAX_AUDIT_ENTRIES);
  }
}

export function registerPaymentEventHandlers(bus: EventBus): void {
  bus.subscribe<PaymentReceivedPayload>(
    PaymentEventTypes.Received,
    (event) => {
      record({
        type: event.type,
        paymentId: event.payload.paymentId,
        garageId: event.payload.garageId,
        at: event.occurredAt,
      });
    },
    { name: 'payment.received:audit' },
  );

  bus.subscribe<PaymentReversedPayload>(
    PaymentEventTypes.Reversed,
    (event) => {
      record({
        type: event.type,
        paymentId: event.payload.paymentId,
        garageId: event.payload.garageId,
        at: event.occurredAt,
      });
    },
    { name: 'payment.reversed:audit' },
  );
}
