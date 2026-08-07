/**
 * Customer event handlers (Phase E7). Subscribers for the module's domain
 * events, registered at composition time. The audit handler records recent
 * customer views in a capped in-memory ring buffer (a lightweight audit trail
 * that a durable sink can later replace) — demonstrating idempotent,
 * retry-backed, fire-and-forget delivery without any request-path cost.
 */

import type { EventBus } from '../../../infrastructure/events/event-bus';
import { CustomerEventTypes, type CustomerViewedPayload } from './customer.events';

const MAX_AUDIT_ENTRIES = 500;

export interface CustomerViewAudit {
  customerId: string;
  viewedByGarageId: string | null;
  viewedByUserId?: string;
  at: string;
}

const recentViews: CustomerViewAudit[] = [];

/** Observability accessor for the in-memory customer-view audit trail. */
export function getRecentCustomerViews(): readonly CustomerViewAudit[] {
  return [...recentViews];
}

/** Subscribe the customer module's event handlers to the bus. */
export function registerCustomerEventHandlers(bus: EventBus): void {
  bus.subscribe<CustomerViewedPayload>(
    CustomerEventTypes.Viewed,
    (event) => {
      recentViews.push({
        customerId: event.payload.customerId,
        viewedByGarageId: event.payload.viewedByGarageId,
        viewedByUserId: event.payload.viewedByUserId,
        at: event.occurredAt,
      });
      if (recentViews.length > MAX_AUDIT_ENTRIES) {
        recentViews.splice(0, recentViews.length - MAX_AUDIT_ENTRIES);
      }
    },
    { name: 'customer.viewed:audit' },
  );
}
