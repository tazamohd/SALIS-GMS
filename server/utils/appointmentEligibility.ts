import type { RescheduleErrorCode } from "@shared/schemas/appointmentReschedule";

/**
 * Feature 001 — pure eligibility logic for customer self-service reschedule/cancel.
 *
 * Kept free of DB/IO so it is fully unit-testable (constitution Principle III).
 */

// Statuses from which a customer may still reschedule/cancel (FR-015).
export const RESCHEDULABLE_STATUSES = ["scheduled", "confirmed"] as const;

// Documented per-garage defaults used when a garage has no reschedule policy row.
export const DEFAULT_MIN_NOTICE_HOURS = 24;
export const DEFAULT_MAX_RESCHEDULES = 3;

export interface ReschedulePolicyInput {
  minNoticeHours: number;
  maxReschedules: number;
}

export interface EligibilityInput {
  status: string;
  appointmentDate: Date;
  rescheduleCount: number;
  policy: ReschedulePolicyInput;
  now: Date;
}

export type EligibilityResult =
  | { ok: true }
  | { ok: false; code: Extract<
      RescheduleErrorCode,
      "inside_cutoff" | "limit_reached" | "ineligible_status"
    > };

/**
 * Determine whether a customer may reschedule the appointment. Cancellation
 * uses the same status + cutoff gates but ignores the reschedule limit
 * (a customer may always cancel an otherwise-eligible appointment).
 */
export function checkRescheduleEligibility(
  input: EligibilityInput,
): EligibilityResult {
  const { status, appointmentDate, rescheduleCount, policy, now } = input;

  if (!RESCHEDULABLE_STATUSES.includes(status as any)) {
    return { ok: false, code: "ineligible_status" };
  }

  const msUntil = appointmentDate.getTime() - now.getTime();
  const hoursUntil = msUntil / (1000 * 60 * 60);
  if (hoursUntil < policy.minNoticeHours) {
    return { ok: false, code: "inside_cutoff" };
  }

  if (rescheduleCount >= policy.maxReschedules) {
    return { ok: false, code: "limit_reached" };
  }

  return { ok: true };
}

export function checkCancelEligibility(
  input: Omit<EligibilityInput, "rescheduleCount">,
): EligibilityResult {
  const { status, appointmentDate, policy, now } = input;

  if (!RESCHEDULABLE_STATUSES.includes(status as any)) {
    return { ok: false, code: "ineligible_status" };
  }

  const hoursUntil =
    (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntil < policy.minNoticeHours) {
    return { ok: false, code: "inside_cutoff" };
  }

  return { ok: true };
}
