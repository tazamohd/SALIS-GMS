/**
 * Invoice event handlers (Phase E7). The audit handler records recent invoice
 * creations in a capped in-memory ring buffer (a durable sink can replace it
 * later), demonstrating idempotent, retry-backed, fire-and-forget delivery on
 * the write path.
 */

import type { EventBus } from '../../../infrastructure/events/event-bus';
import { InvoiceEventTypes, type InvoiceCreatedPayload } from './invoice.events';

const MAX_AUDIT_ENTRIES = 500;

export interface InvoiceCreatedAudit {
  invoiceId: string;
  garageId: string | null;
  source: string;
  at: string;
}

const recentCreations: InvoiceCreatedAudit[] = [];

export function getRecentInvoiceCreations(): readonly InvoiceCreatedAudit[] {
  return [...recentCreations];
}

export function registerInvoiceEventHandlers(bus: EventBus): void {
  bus.subscribe<InvoiceCreatedPayload>(
    InvoiceEventTypes.Created,
    (event) => {
      recentCreations.push({
        invoiceId: event.payload.invoiceId,
        garageId: event.payload.garageId,
        source: event.payload.source,
        at: event.occurredAt,
      });
      if (recentCreations.length > MAX_AUDIT_ENTRIES) {
        recentCreations.splice(0, recentCreations.length - MAX_AUDIT_ENTRIES);
      }
    },
    { name: 'invoice.created:audit' },
  );
}
