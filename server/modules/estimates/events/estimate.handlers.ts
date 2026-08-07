/**
 * Estimate event handlers (Phase E7). Subscribers registered at composition
 * time. The audit handler records recent conversions in a capped in-memory ring
 * buffer (a durable sink can replace it later) — demonstrating idempotent,
 * retry-backed, fire-and-forget delivery on the write path.
 */

import type { EventBus } from '../../../infrastructure/events/event-bus';
import {
  EstimateEventTypes,
  type EstimateConvertedToInvoicePayload,
  type EstimateConvertedToJobCardPayload,
} from './estimate.events';

const MAX_AUDIT_ENTRIES = 500;

export interface EstimateConversionAudit {
  type: string;
  estimateId: string;
  targetId: string;
  garageId: string | null;
  at: string;
}

const recentConversions: EstimateConversionAudit[] = [];

export function getRecentEstimateConversions(): readonly EstimateConversionAudit[] {
  return [...recentConversions];
}

function record(entry: EstimateConversionAudit): void {
  recentConversions.push(entry);
  if (recentConversions.length > MAX_AUDIT_ENTRIES) {
    recentConversions.splice(0, recentConversions.length - MAX_AUDIT_ENTRIES);
  }
}

export function registerEstimateEventHandlers(bus: EventBus): void {
  bus.subscribe<EstimateConvertedToJobCardPayload>(
    EstimateEventTypes.ConvertedToJobCard,
    (event) => {
      record({
        type: event.type,
        estimateId: event.payload.estimateId,
        targetId: event.payload.jobCardId,
        garageId: event.payload.garageId,
        at: event.occurredAt,
      });
    },
    { name: 'estimate.converted_to_job_card:audit' },
  );

  bus.subscribe<EstimateConvertedToInvoicePayload>(
    EstimateEventTypes.ConvertedToInvoice,
    (event) => {
      record({
        type: event.type,
        estimateId: event.payload.estimateId,
        targetId: event.payload.invoiceId,
        garageId: event.payload.garageId,
        at: event.occurredAt,
      });
    },
    { name: 'estimate.converted_to_invoice:audit' },
  );
}
