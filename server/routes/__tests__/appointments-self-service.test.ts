import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { Client } from "pg";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin, loginAsUser } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;
let userId: string;

// A future UTC slot aligned to the availability grid (09:00–16:00, next 7 days).
function futureSlot(daysAhead: number, hour: number): Date {
  const n = new Date();
  return new Date(
    Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + daysAhead, hour, 0, 0),
  );
}

async function createAppointment(
  ownerId: string,
  when: Date,
  bookingAgent: supertest.Agent = agent,
): Promise<string> {
  const res = await bookingAgent.post("/api/appointments").send({
    garageId,
    customerId: ownerId,
    customerName: "Reschedule Test Customer",
    customerPhone: "+966500000010",
    vehicleInfo: { make: "Toyota", model: "Corolla", year: 2024, licensePlate: "RSC-001" },
    serviceType: "maintenance",
    appointmentDate: when.toISOString(),
    duration: 60,
    status: "scheduled",
  });
  expect([200, 201]).toContain(res.status);
  return res.body.id;
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
  const me = await agent.get("/api/user");
  userId = me.body.id;
  expect(userId).toBeTruthy();
});

describe("Self-service reschedule — availability & ownership (T010)", () => {
  it("returns available slots for an owned, eligible appointment", async () => {
    const id = await createAppointment(userId, futureSlot(3, 9));
    const res = await agent.get(`/api/portal/appointments/${id}/available-slots`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(res.body.slots.length).toBeGreaterThan(0);
    expect(res.body.slots[0]).toHaveProperty("available");
  });

  it("returns 404 for a non-existent appointment without disclosing anything", async () => {
    const res = await agent.get(
      "/api/portal/appointments/00000000-0000-0000-0000-000000000000/available-slots",
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_owner");
  });

  it("returns 404 when the appointment belongs to another customer (tenant/ownership isolation)", async () => {
    const other = await loginAsUser(app);
    const otherMe = await other.agent.get("/api/user");
    const otherId = await createAppointment(otherMe.body.id, futureSlot(3, 11), other.agent);
    // Admin agent must not see another customer's appointment.
    const res = await agent.get(`/api/portal/appointments/${otherId}/available-slots`);
    expect(res.status).toBe(404);
  });
});

describe("Self-service reschedule — happy path & audit (T011)", () => {
  it("moves the appointment, increments rescheduleCount, and writes an audit row", async () => {
    const id = await createAppointment(userId, futureSlot(3, 9));
    const target = futureSlot(5, 13);

    const res = await agent
      .post(`/api/portal/appointments/${id}/reschedule`)
      .send({ newSlotStart: target.toISOString(), reason: "Customer prefers afternoon" });

    expect(res.status).toBe(200);
    expect(res.body.appointmentId).toBe(id);
    expect(new Date(res.body.newSlotStart).toISOString()).toBe(target.toISOString());
    expect(res.body.rescheduleCount).toBe(1);

    // The appointment reflects the new slot.
    const after = await agent.get(`/api/appointments/${id}`);
    expect(new Date(after.body.appointmentDate).toISOString()).toBe(target.toISOString());

    // An immutable audit row exists with the old → new slot.
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const log = await client.query(
        `SELECT action, new_slot, reason FROM appointment_change_log WHERE appointment_id = $1`,
        [id],
      );
      expect(log.rowCount).toBe(1);
      expect(log.rows[0].action).toBe("reschedule");
      expect(log.rows[0].reason).toBe("Customer prefers afternoon");
    } finally {
      await client.end();
    }
  });

  it("blocks rescheduling inside the cutoff window", async () => {
    // 2 hours out → inside the default 24h cutoff.
    const soon = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const id = await createAppointment(userId, soon);
    const res = await agent
      .post(`/api/portal/appointments/${id}/reschedule`)
      .send({ newSlotStart: futureSlot(5, 15).toISOString() });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("inside_cutoff");
  });
});

describe("Self-service reschedule — concurrency / no double-booking (T012)", () => {
  it("grants a contended slot to exactly one of two simultaneous reschedules", async () => {
    const a1 = await createAppointment(userId, futureSlot(3, 9));
    const a2 = await createAppointment(userId, futureSlot(3, 10));
    const contended = futureSlot(6, 14).toISOString();

    const [r1, r2] = await Promise.all([
      agent.post(`/api/portal/appointments/${a1}/reschedule`).send({ newSlotStart: contended }),
      agent.post(`/api/portal/appointments/${a2}/reschedule`).send({ newSlotStart: contended }),
    ]);

    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([200, 409]);

    const winner = r1.status === 200 ? r1 : r2;
    const loser = r1.status === 200 ? r2 : r1;
    expect(new Date(winner.body.newSlotStart).toISOString()).toBe(contended);
    expect(loser.body.error.code).toBe("slot_taken");
  });
});
