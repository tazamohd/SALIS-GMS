/**
 * Customer DTO mappers (Phase E9/E10 — DTO boundary).
 *
 * Maps domain entities to the shape returned over the wire. Today this is a
 * passthrough of `SafeUser` (password already stripped in storage) to preserve
 * the exact current response contract. Narrowing the public field set is a
 * breaking change to be introduced behind API versioning, not silently here —
 * so the seam exists, but the shape is unchanged.
 */

import type { Customer } from '../domain/customer.types';

export type CustomerDTO = Customer;

export function toCustomerDTO(customer: Customer): CustomerDTO {
  return customer;
}

export function toCustomerListDTO(customers: Customer[]): CustomerDTO[] {
  return customers.map(toCustomerDTO);
}
