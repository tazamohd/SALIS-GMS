/**
 * Invoice DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { Invoice } from '../domain/invoice.types';

export type InvoiceDTO = Invoice;

export function toInvoiceDTO(invoice: Invoice): InvoiceDTO {
  return invoice;
}
