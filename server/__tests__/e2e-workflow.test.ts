import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import supertest from "supertest";
import { createTestApp } from "./setup";

let app: Express;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
});

describe("E2E Golden Path - Full Business Workflow", () => {
  let testAgent: supertest.Agent;
  let userId: string;
  let garageId: string;
  let customerId: string;
  let vehicleId: string;
  let jobCardId: string;
  let invoiceId: string;

  it("Step 1: Register a new garage admin", async () => {
    testAgent = supertest.agent(app);
    const res = await testAgent.post("/api/register").send({
      email: `e2e-admin-${Date.now()}@slis.sa`,
      password: "E2ETest123!",
      fullName: "E2E Test Admin",
      phone: "+966500000099",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    userId = res.body.id;

    garageId = process.env.TEST_GARAGE_ID || "";
    expect(garageId).toBeTruthy();
  });

  it("Step 2: Create a customer", async () => {
    const res = await testAgent.post("/api/customers").send({
      fullName: "E2E Customer - Ahmed",
      email: `e2e-customer-${Date.now()}@test.sa`,
      phone: "+966500000088",
      address: "E2E Test Street, Riyadh",
      garageId,
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    customerId = res.body.id;
  });

  it("Step 3: Create a vehicle for the customer", async () => {
    const res = await testAgent.post("/api/vehicles").send({
      customerId,
      garageId,
      make: "Toyota",
      model: "Camry",
      year: 2024,
      vin: `E2EVIN${Date.now()}`,
      licensePlate: `E2E-${Date.now().toString().slice(-4)}`,
      color: "White",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    vehicleId = res.body.id;
  });

  it("Step 4: Create a job card (oil change + brake inspection)", async () => {
    const ts = Date.now();
    const res = await testAgent.post("/api/job-cards").send({
      jobNumber: `E2E-JOB-${ts}`,
      garageId,
      customerId,
      vehicleInfo: { make: "Toyota", model: "Camry", year: 2024, licensePlate: `E2E-${ts.toString().slice(-4)}` },
      serviceType: "maintenance",
      description: "E2E: Engine oil change and brake inspection",
      priority: "high",
      status: "pending",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    jobCardId = res.body.id;
  });

  it("Step 5: Update job status to in_progress", async () => {
    expect(jobCardId).toBeTruthy();
    const res = await testAgent.patch(`/api/job-cards/${jobCardId}`).send({
      status: "in_progress",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("in_progress");
  });

  it("Step 6: Complete the job", async () => {
    expect(jobCardId).toBeTruthy();
    const res = await testAgent.patch(`/api/job-cards/${jobCardId}`).send({
      status: "completed",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
  });

  it("Step 7: Create an invoice", async () => {
    const res = await testAgent.post("/api/invoices").send({
      customerId,
      jobCardId,
      garageId,
      totalAmount: "350.00",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "draft",
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    invoiceId = res.body.id;
  });

  it("Step 8: Record a payment", async () => {
    const res = await testAgent.post("/api/payments").send({
      invoiceId,
      amount: "350.00",
      paymentMethod: "card",
    });
    expect([200, 201]).toContain(res.status);
  });

  it("Step 9: Verify dashboard reports", async () => {
    const res = await testAgent.get("/api/reports/overview");
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});
