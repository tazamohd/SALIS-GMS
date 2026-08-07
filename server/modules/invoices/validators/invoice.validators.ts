/**
 * Invoice request validators (Phase E9 — Shared Validation Layer).
 *
 * Re-exports the canonical insert schemas so the invoice write endpoints
 * validate against the same definitions as the rest of the app. The item schema
 * drops `invoiceId` (assigned server-side after the parent is created).
 */

import { insertInvoiceSchema, insertInvoiceItemSchema } from '@shared/schema';

export const invoiceInsertSchema = insertInvoiceSchema;
export const invoiceUpdateSchema = insertInvoiceSchema.partial();
export const invoiceItemInsertSchema = insertInvoiceItemSchema.omit({ invoiceId: true });

/** Allowed invoice status transitions (business workflow). */
export const INVOICE_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['draft', 'sent', 'cancelled'],
  sent: ['sent', 'paid', 'overdue', 'cancelled'],
  paid: ['paid', 'cancelled'],
  overdue: ['overdue', 'paid', 'cancelled'],
  cancelled: ['cancelled'],
};
