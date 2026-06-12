import { describe, it, expect } from "vitest";
import {
  checkRescheduleEligibility,
  checkCancelEligibility,
  DEFAULT_MIN_NOTICE_HOURS,
  DEFAULT_MAX_RESCHEDULES,
} from "../appointmentEligibility";

const policy = {
  minNoticeHours: DEFAULT_MIN_NOTICE_HOURS,
  maxReschedules: DEFAULT_MAX_RESCHEDULES,
};
const now = new Date("2026-06-12T10:00:00.000Z");
const farFuture = new Date("2026-06-20T10:00:00.000Z"); // 8 days out

describe("checkRescheduleEligibility (T013)", () => {
  it("allows an eligible future appointment", () => {
    expect(
      checkRescheduleEligibility({
        status: "confirmed",
        appointmentDate: farFuture,
        rescheduleCount: 0,
        policy,
        now,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects a non-reschedulable status", () => {
    for (const status of ["in_progress", "completed", "cancelled", "no_show"]) {
      expect(
        checkRescheduleEligibility({
          status,
          appointmentDate: farFuture,
          rescheduleCount: 0,
          policy,
          now,
        }),
      ).toEqual({ ok: false, code: "ineligible_status" });
    }
  });

  it("rejects inside the cutoff window (boundary)", () => {
    // Exactly 23h59m out → inside a 24h cutoff.
    const justInside = new Date(now.getTime() + (24 * 60 - 1) * 60 * 1000);
    expect(
      checkRescheduleEligibility({
        status: "scheduled",
        appointmentDate: justInside,
        rescheduleCount: 0,
        policy,
        now,
      }),
    ).toEqual({ ok: false, code: "inside_cutoff" });

    // Exactly 24h out → outside the cutoff.
    const exactlyAtCutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    expect(
      checkRescheduleEligibility({
        status: "scheduled",
        appointmentDate: exactlyAtCutoff,
        rescheduleCount: 0,
        policy,
        now,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects when the reschedule limit is reached (boundary)", () => {
    expect(
      checkRescheduleEligibility({
        status: "confirmed",
        appointmentDate: farFuture,
        rescheduleCount: DEFAULT_MAX_RESCHEDULES,
        policy,
        now,
      }),
    ).toEqual({ ok: false, code: "limit_reached" });

    expect(
      checkRescheduleEligibility({
        status: "confirmed",
        appointmentDate: farFuture,
        rescheduleCount: DEFAULT_MAX_RESCHEDULES - 1,
        policy,
        now,
      }),
    ).toEqual({ ok: true });
  });
});

describe("checkCancelEligibility (T013)", () => {
  it("allows cancel regardless of reschedule count, but enforces status + cutoff", () => {
    expect(
      checkCancelEligibility({
        status: "confirmed",
        appointmentDate: farFuture,
        policy,
        now,
      }),
    ).toEqual({ ok: true });

    const justInside = new Date(now.getTime() + 60 * 60 * 1000); // 1h out
    expect(
      checkCancelEligibility({
        status: "confirmed",
        appointmentDate: justInside,
        policy,
        now,
      }),
    ).toEqual({ ok: false, code: "inside_cutoff" });
  });
});
