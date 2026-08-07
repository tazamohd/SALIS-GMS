/**
 * Job card request validators (Phase E9). Permissive to preserve current
 * behavior during migration.
 */

import { z } from 'zod';

export const jobCardIdParamSchema = z.object({
  id: z.string().min(1, 'job card id is required'),
});

export const jobCardSubResourceParamSchema = z.object({
  jobCardId: z.string().min(1, 'job card id is required'),
});

export const jobCardListQuerySchema = z
  .object({
    garage_id: z.string().optional(),
    assigned_to: z.string().optional(),
  })
  .passthrough();

export type JobCardListQueryInput = z.infer<typeof jobCardListQuerySchema>;
