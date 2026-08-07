/**
 * Payment DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { Payment } from '../domain/payment.types';

export type PaymentDTO = Payment;

export function toPaymentDTO(payment: Payment): PaymentDTO {
  return payment;
}
