import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";
import { storage } from "../../storage";

/**
 * Kiosk check-in now looks up real appointments from the DB (previously it
 * matched against a hardcoded demoAppointments array). These tests seed a real
 * appointment and exercise the public POST /api/kiosk/check-in handler by phone
 * and by plate — without authenticating, since a lobby kiosk is public by design.
 */

let app: Express;
const PHONE = "0501239999";
const PLATE = "TST 7788";

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const { user, garageId } = await loginAsAdmin(app);

  await storage.createAppointment({
    garageId,
    customerId: null,
    customerName: "Kiosk Test Customer",
    customerPhone: PHONE,
    customerEmail: "kiosk-test@slis.sa",
    vehicleInfo: { make: "Toyota", model: "Corolla", year: 2023, licensePlate: PLATE },
    serviceType: "Oil Change",
    appointmentDate: new Date(Date.now() + 60 * 60 * 1000),
    status: "confirmed",
    createdBy: user.id,
  } as any);
});

describe("POST /api/kiosk/check-in (DB-backed appointment lookup)", () => {
  it("finds an active appointment by phone and creates a queue ticket", async () => {
    const res = await supertest(app).post("/api/kiosk/check-in").send({ phone: PHONE });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.found || res.body.alreadyCheckedIn).toBe(true);
    expect(res.body.ticket).toBeTruthy();
    expect(res.body.ticket.customerName).toBe("Kiosk Test Customer");
    expect(res.body.ticket.vehiclePlate).toBe(PLATE);
  });

  it("resolves the same appointment by plate number", async () => {
    const res = await supertest(app).post("/api/kiosk/check-in").send({ plateNumber: PLATE });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // The phone test above already created the ticket for this appointment.
    expect(res.body.alreadyCheckedIn || res.body.found).toBe(true);
  });

  it("returns found:false for a phone with no matching appointment", async () => {
    const res = await supertest(app).post("/api/kiosk/check-in").send({ phone: "0539999999" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.found).toBe(false);
  });

  it("400s when neither phone nor plate is provided", async () => {
    const res = await supertest(app).post("/api/kiosk/check-in").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
