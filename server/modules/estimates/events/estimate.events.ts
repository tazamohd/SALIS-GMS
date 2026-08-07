/**
 * Estimate domain events (Phase E7 — Event-Driven Architecture).
 *
 * Published when an estimate is converted into a downstream document. These are
 * the first write-path events in the migration: the conversion succeeds and its
 * primary records are committed, then the event fires fire-and-forget so
 * audit/analytics/notification handlers can react without adding latency or
 * affecting the response.
 */

export const EstimateEventTypes = {
  Created: 'estimate.created',
  ConvertedToJobCard: 'estimate.converted_to_job_card',
  ConvertedToInvoice: 'estimate.converted_to_invoice',
} as const;

export type EstimateEventType = (typeof EstimateEventTypes)[keyof typeof EstimateEventTypes];

export interface EstimateConvertedToJobCardPayload {
  estimateId: string;
  jobCardId: string;
  garageId: string | null;
  convertedByUserId?: string;
}

export interface EstimateConvertedToInvoicePayload {
  estimateId: string;
  invoiceId: string;
  garageId: string | null;
  convertedByUserId?: string;
}
