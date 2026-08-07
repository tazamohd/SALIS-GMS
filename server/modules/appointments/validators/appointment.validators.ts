/**
 * Appointment request validators (Phase E9). Permissive to preserve current
 * behavior during migration.
 */

import { z } from 'zod';

export const appointmentIdParamSchema = z.object({
  id: z.string().min(1, 'appointment id is required'),
});

export const appointmentListQuerySchema = z
  .object({
    garage_id: z.string().optional(),
  })
  .passthrough();

export type AppointmentListQueryInput = z.infer<typeof appointmentListQuerySchema>;
