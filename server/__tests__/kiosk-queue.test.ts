import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import { createTestApp } from "./setup";
import supertest from "supertest";

let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("Kiosk Queue (DB-backed)", () => {
  it("POST /api/kiosk/walk-in creates and GET /api/kiosk/queue lists it", async () => {
    const ts = Date.now();
    const phone = `0599${String(ts).slice(-7)}`;
    const create = await supertest(app).post("/api/kiosk/walk-in").send({
      name: "Test Walk-in",
      phone,
      vehiclePlate: `TST ${String(ts).slice(-4)}`,
      vehicleInfo: "Test Camry",
      serviceType: "Oil Change",
    });
    expect(create.status).toBe(200);
    expect(create.body.success).toBe(true);
    expect(create.body.ticket?.ticketId).toBeDefined();
    expect(create.body.ticket.status).toBe("waiting");

    const queue = await supertest(app).get("/api/kiosk/queue");
    expect(queue.status).toBe(200);
    expect(Array.isArray(queue.body.queue)).toBe(true);
    const ids = queue.body.queue.map((t: any) => t.ticketId);
    expect(ids).toContain(create.body.ticket.ticketId);
  });

  it("POST /api/kiosk/walk-in rejects missing fields", async () => {
    const res = await supertest(app).post("/api/kiosk/walk-in").send({ name: "Incomplete" });
    expect(res.status).toBe(400);
  });

  it("GET /api/kiosk/services returns the service catalog", async () => {
    const res = await supertest(app).get("/api/kiosk/services");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(res.body.services.length).toBeGreaterThanOrEqual(5);
  });
});
