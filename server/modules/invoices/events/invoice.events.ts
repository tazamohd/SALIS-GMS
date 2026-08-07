/**
 * Invoice domain events (Phase E7 — Event-Driven Architecture).
 *
 * `invoice.created` is published fire-and-forget after an invoice's records are
 * committed, regardless of how it was created (manual, with-items, or generated
 * from a job card — distinguished by `source`). This is the head of the
 * write-path chain the target architecture extends
 * (`InvoiceCreated → InventoryReserved → StockUpdated → AccountingPosted → …`).
 */

export const InvoiceEventTypes = {
  Created: 'invoice.created',
} as const;

export type InvoiceEventType = (typeof InvoiceEventTypes)[keyof typeof InvoiceEventTypes];

export type InvoiceCreationSource = 'manual' | 'with-items' | 'from-job';

export interface InvoiceCreatedPayload {
  invoiceId: string;
  garageId: string | null;
  source: InvoiceCreationSource;
  createdByUserId?: string;
}
