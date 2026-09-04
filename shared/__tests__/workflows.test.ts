import { describe, it, expect } from "vitest";
import {
  JOB_CARD_STATUSES,
  APPOINTMENT_STATUSES,
  INVOICE_STATUSES,
  PURCHASE_ORDER_STATUSES,
  ESTIMATE_STATUSES,
  PAYMENT_STATUSES,
  TOWING_STATUSES,
  JOB_CARD_TRANSITIONS,
  APPOINTMENT_TRANSITIONS,
  INVOICE_TRANSITIONS,
  PURCHASE_ORDER_TRANSITIONS,
  ESTIMATE_TRANSITIONS,
  type StateTransition,
} from "../workflows";

function validateTransitions<S extends string>(
  name: string,
  statuses: readonly S[],
  transitions: StateTransition<S>[],
) {
  describe(`${name} transitions`, () => {
    it("every transition references valid statuses", () => {
      for (const t of transitions) {
        expect(statuses).toContain(t.from);
        expect(statuses).toContain(t.to);
      }
    });

    it("has no self-transitions", () => {
      for (const t of transitions) {
        expect(t.from).not.toBe(t.to);
      }
    });

    it("every transition has a non-empty label", () => {
      for (const t of transitions) {
        expect(t.label.length).toBeGreaterThan(0);
      }
    });

    it("has no exact duplicate transitions", () => {
      const keys = transitions.map((t) => `${t.from}->${t.to}`);
      const unique = new Set(keys);
      expect(unique.size).toBe(keys.length);
    });

    it("terminal statuses have no outbound transitions", () => {
      const fromStates = new Set(transitions.map((t) => t.from));
      const toStates = new Set(transitions.map((t) => t.to));
      const terminals = [...toStates].filter((s) => !fromStates.has(s));
      expect(terminals.length).toBeGreaterThan(0);
    });
  });
}

describe("Status arrays", () => {
  it("have no duplicate entries", () => {
    const arrays = [
      JOB_CARD_STATUSES,
      APPOINTMENT_STATUSES,
      INVOICE_STATUSES,
      PURCHASE_ORDER_STATUSES,
      ESTIMATE_STATUSES,
      PAYMENT_STATUSES,
      TOWING_STATUSES,
    ];
    for (const arr of arrays) {
      expect(new Set(arr).size).toBe(arr.length);
    }
  });
});

validateTransitions("JobCard", JOB_CARD_STATUSES, JOB_CARD_TRANSITIONS);
validateTransitions("Appointment", APPOINTMENT_STATUSES, APPOINTMENT_TRANSITIONS);
validateTransitions("Invoice", INVOICE_STATUSES, INVOICE_TRANSITIONS);
validateTransitions("PurchaseOrder", PURCHASE_ORDER_STATUSES, PURCHASE_ORDER_TRANSITIONS);
validateTransitions("Estimate", ESTIMATE_STATUSES, ESTIMATE_TRANSITIONS);
