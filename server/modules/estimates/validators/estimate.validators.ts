/**
 * Estimate request validators (Phase E9 — Shared Validation Layer).
 *
 * Re-exports the canonical insert schemas from the shared schema so the estimate
 * write endpoints validate against the same definitions as the rest of the app.
 * The item schema drops `estimateId` (assigned server-side after the parent is
 * created), matching the legacy handler.
 */

import { z } from 'zod';
import { insertEstimateSchema, insertEstimateItemSchema } from '@shared/schema';

export const estimateInsertSchema = insertEstimateSchema;
export const estimateUpdateSchema = insertEstimateSchema.partial();
export const estimateItemInsertSchema = insertEstimateItemSchema.omit({ estimateId: true });

export const estimateIdParamSchema = z.object({
  id: z.string().min(1, 'estimate id is required'),
});
