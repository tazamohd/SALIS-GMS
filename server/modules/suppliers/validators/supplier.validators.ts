/**
 * Supplier request validators (Phase E9). Permissive to preserve current
 * behavior during migration.
 */

import { z } from 'zod';

export const supplierIdParamSchema = z.object({
  id: z.string().min(1, 'supplier id is required'),
});

export const priceListQuerySchema = z
  .object({
    supplierId: z.string().optional(),
    sparePartId: z.string().optional(),
  })
  .passthrough();
