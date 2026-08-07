/**
 * Garage request validators (Phase E9). Permissive to preserve current behavior
 * during migration.
 */

import { z } from 'zod';

export const garageIdParamSchema = z.object({
  id: z.string().min(1, 'garage id is required'),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'user id is required'),
});
