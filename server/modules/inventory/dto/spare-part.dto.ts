/**
 * Spare part DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { SparePart } from '../domain/spare-part.types';

export type SparePartDTO = SparePart;

export function toSparePartDTO(part: SparePart): SparePartDTO {
  return part;
}
