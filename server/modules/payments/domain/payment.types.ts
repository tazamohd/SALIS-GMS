/**
 * Payment domain types (Phase E2 — domain layer).
 */

import type { Payment } from '../../../../shared/schema';

export type { Payment };

export interface PaymentAuthContext {
  userId?: string;
  role?: string;
  /** Session garage; `null`/`undefined` denotes a platform-level (garage-less) user. */
  garageId?: string | null;
}

export interface PaymentListFilters {
  invoiceId?: string;
  method?: string;
}

/** A payment row joined with its invoice number and customer name (list view). */
export interface PaymentListRow {
  id: string;
  invoiceId: string | null;
  paymentDate: Date | null;
  amount: string | null;
  paymentMethod: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date | null;
  invoiceNumber: string | null;
  customerName: string | null;
}
