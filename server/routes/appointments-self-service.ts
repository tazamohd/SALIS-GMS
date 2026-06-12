import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import {
  rescheduleRequestSchema,
  type RescheduleErrorCode,
} from "@shared/schemas/appointmentReschedule";
import { RESCHEDULABLE_STATUSES } from "../utils/appointmentEligibility";

const router = Router();

/**
 * Feature 001 — Customer Self-Service Appointment Rescheduling (US1).
 *
 * Customer-facing portal endpoints. Every request is scoped server-side to the
 * session user's id (ownership) and garageId (tenant isolation); a non-owned or
 * cross-garage appointment returns 404 and discloses nothing (FR-004).
 *
 *   GET  /api/portal/appointments/:id/available-slots
 *   POST /api/portal/appointments/:id/reschedule
 */

// Default English messages; the client localizes per error code (FR-014).
const ERROR_MESSAGES: Record<RescheduleErrorCode, string> = {
  inside_cutoff: "This appointment is too close to its start time to change online. Please contact the garage.",
  limit_reached: "This appointment has already been rescheduled the maximum number of times.",
  slot_taken: "That time slot is no longer available. Please choose another.",
  ineligible_status: "This appointment can no longer be rescheduled.",
  not_owner: "Appointment not found.",
  validation_error: "The request was invalid.",
};

function errorBody(code: RescheduleErrorCode) {
  return { error: { code, message: ERROR_MESSAGES[code] } };
}

// HTTP status per error code. not_owner is 404 (never disclose existence).
function statusForCode(code: RescheduleErrorCode): number {
  if (code === "not_owner") return 404;
  if (code === "validation_error") return 400;
  return 409;
}

router.get(
  "/portal/appointments/:id/available-slots",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const appt = await storage.getAppointment(req.params.id);
      if (
        !appt ||
        appt.customerId !== req.user?.id ||
        appt.garageId !== req.user?.garageId
      ) {
        return res.status(404).json(errorBody("not_owner"));
      }
      if (!RESCHEDULABLE_STATUSES.includes(appt.status as any)) {
        return res.status(409).json(errorBody("ineligible_status"));
      }
      const slots = await storage.getRescheduleAvailability(
        appt.garageId,
        appt.duration ?? 60,
        new Date(),
      );
      res.json({ slots });
    } catch (error) {
      console.error("Error fetching reschedule availability:", error);
      res.status(500).json({ message: "Failed to fetch available slots" });
    }
  },
);

router.post(
  "/portal/appointments/:id/reschedule",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const parsed = rescheduleRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json(errorBody("validation_error"));
      }

      const result = await storage.rescheduleAppointmentForCustomer({
        appointmentId: req.params.id,
        customerId: req.user?.id,
        garageId: req.user?.garageId,
        newSlotStart: new Date(parsed.data.newSlotStart),
        reason: parsed.data.reason,
        now: new Date(),
      });

      if (!result.ok) {
        return res.status(statusForCode(result.code)).json(errorBody(result.code));
      }

      res.json({
        appointmentId: result.appointment.id,
        newSlotStart: new Date(
          result.appointment.appointmentDate as any,
        ).toISOString(),
        rescheduleCount: result.appointment.rescheduleCount ?? 0,
      });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      res.status(500).json({ message: "Failed to reschedule appointment" });
    }
  },
);

export const appointmentsSelfServiceRoutes = router;
