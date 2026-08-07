/**
 * Payment request validators (Phase E9 — Shared Validation Layer).
 *
 * Re-exports the canonical insert schema so payment creation validates against
 * the same definition as the rest of the app.
 */

import { insertPaymentSchema } from '@shared/schema';

export const paymentInsertSchema = insertPaymentSchema;
