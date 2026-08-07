/**
 * Invoice domain types (Phase E2 — domain layer).
 */

import type { Invoice, InvoiceItem } from '../../../../shared/schema';

export type { Invoice, InvoiceItem };

export interface InvoiceAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface InvoiceListParams {
  auth: InvoiceAuthContext;
  garageIdParam?: string;
  status?: string;
  limit: number;
  offset: number;
}

export interface InvoiceListResult {
  rows: Invoice[];
  total: number;
}

/** Result of the server-side "invoice from job card" calculation. */
export interface InvoiceFromJobResult {
  invoice: Invoice;
  breakdown: {
    laborCost: string;
    laborMinutes: number;
    laborRate: number;
    partsCost: string;
    partsCount: number;
    subtotal: string;
    taxRate: number;
    taxRatePercent: string;
    taxAmount: string;
    totalAmount: string;
    configSource: { taxRateSource: string; laborRateSource: string };
  };
  items: unknown[];
}
