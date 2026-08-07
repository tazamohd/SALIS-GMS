/**
 * Vehicle request validators (Phase E9 — Shared Validation Layer).
 *
 * Permissive to preserve current endpoint behavior during migration; tightening
 * is a forward, coordinated change.
 */

import { z } from 'zod';

export const vehicleIdParamSchema = z.object({
  id: z.string().min(1, 'vehicle id is required'),
});

export const serviceRemindersQuerySchema = z
  .object({
    status: z.string().optional(),
  })
  .passthrough();

export type ServiceRemindersQueryInput = z.infer<typeof serviceRemindersQuerySchema>;
