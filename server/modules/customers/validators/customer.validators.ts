/**
 * Customer request validators (Phase E9 — Shared Validation Layer).
 *
 * Zod schemas are the single definition of valid customer inputs, reusable by
 * the API, workers, and imports. They are intentionally permissive here to
 * preserve current endpoint behavior during migration (the legacy routes did
 * no param/query validation); tightening is a forward, coordinated change.
 */

import { z } from 'zod';

export const customerIdParamSchema = z.object({
  id: z.string().min(1, 'customer id is required'),
});

export const customerSubResourceParamSchema = z.object({
  customerId: z.string().min(1, 'customer id is required'),
});

export const customerListQuerySchema = z
  .object({
    garage_id: z.string().optional(),
    search: z.string().optional(),
  })
  .passthrough();

export type CustomerListQueryInput = z.infer<typeof customerListQuerySchema>;
