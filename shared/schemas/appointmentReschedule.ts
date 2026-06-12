import { z } from "zod";

/**
 * Feature 001 — Customer Self-Service Appointment Rescheduling.
 *
 * Shared request/response contracts defined ONCE here and reused on both the
 * Express handlers (server/routes/appointments-self-service.ts) and the React
 * client (client/src/pages/CustomerAppointmentReschedule.tsx), per the project
 * constitution (Principle I — Type Safety & Shared Contracts).
 */

// Discriminated set of reasons a self-service action can be blocked. The client
// maps each code to a localized message (FR-014).
export const rescheduleErrorCodes = [
  "inside_cutoff",
  "limit_reached",
  "slot_taken",
  "ineligible_status",
  "not_owner",
  "validation_error",
] as const;
export type RescheduleErrorCode = (typeof rescheduleErrorCodes)[number];

// ── Requests ────────────────────────────────────────────────────────────────

export const rescheduleRequestSchema = z.object({
  newSlotStart: z.string().datetime(),
  reason: z.string().max(500).optional(),
});
export type RescheduleRequest = z.infer<typeof rescheduleRequestSchema>;

export const cancelRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelRequest = z.infer<typeof cancelRequestSchema>;

// ── Responses ───────────────────────────────────────────────────────────────

export const availableSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  available: z.boolean(),
});
export type AvailableSlot = z.infer<typeof availableSlotSchema>;

export const availableSlotsResponseSchema = z.object({
  slots: z.array(availableSlotSchema),
});
export type AvailableSlotsResponse = z.infer<
  typeof availableSlotsResponseSchema
>;

export const rescheduleResultSchema = z.object({
  appointmentId: z.string(),
  newSlotStart: z.string().datetime(),
  rescheduleCount: z.number().int(),
});
export type RescheduleResult = z.infer<typeof rescheduleResultSchema>;

export const cancelResultSchema = z.object({
  appointmentId: z.string(),
  status: z.literal("cancelled"),
});
export type CancelResult = z.infer<typeof cancelResultSchema>;

export const rescheduleErrorSchema = z.object({
  error: z.object({
    code: z.enum(rescheduleErrorCodes),
    message: z.string(),
  }),
});
export type RescheduleError = z.infer<typeof rescheduleErrorSchema>;
