/**
 * Spare part request validators (Phase E9). Permissive to preserve current
 * behavior during migration.
 */

import { z } from 'zod';

export const sparePartIdParamSchema = z.object({
  id: z.string().min(1, 'spare part id is required'),
});

export const sparePartInventoriesQuerySchema = z
  .object({
    garage_id: z.string().optional(),
    spare_part_id: z.string().optional(),
  })
  .passthrough();
