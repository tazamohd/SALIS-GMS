/**
 * Supplier DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { Supplier } from '../domain/supplier.types';

export type SupplierDTO = Supplier;

export function toSupplierDTO(supplier: Supplier): SupplierDTO {
  return supplier;
}
