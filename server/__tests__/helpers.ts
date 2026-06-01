import type { Express } from "express";
import supertest from "supertest";
import { Client } from "pg";

const TEST_ADMIN = {
  email: `admin-test-${Date.now()}@slis.sa`,
  password: "TestPass123!",
  fullName: "Test Admin",
  phone: "+966500000001",
};

const TEST_USER = {
  email: `user-test-${Date.now()}@slis.sa`,
  password: "TestPass123!",
  fullName: "Test User",
  phone: "+966500000002",
};

export { TEST_ADMIN, TEST_USER };

function getTestGarageId(): string {
  return process.env.TEST_GARAGE_ID || "";
}

/**
 * The `/api/register` endpoint does not accept garageId, but most tenant-scoped
 * routes pull garageId off `req.user`. Wire the freshly registered user to the
 * seeded test garage by patching the row directly, then re-login so the new
 * session deserializes the updated garageId.
 */
async function attachUserToGarage(email: string, garageId: string, role = "ADMIN") {
  const url = process.env.DATABASE_URL;
  if (!url || !garageId) return;
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(
      `UPDATE users SET garage_id = $1, role = $2 WHERE email = $3`,
      [garageId, role, email],
    );
  } finally {
    await client.end();
  }
}

export async function loginAsAdmin(app: Express) {
  const agent = supertest.agent(app);
  const garageId = getTestGarageId();

  // Register (accept 200 or 400 if already exists)
  await agent.post("/api/register").send(TEST_ADMIN).expect((res) => {
    if (res.status !== 200 && res.status !== 400 && res.status !== 500) {
      throw new Error(`Register failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });

  // Attach the test admin to the seeded garage *before* login so the session
  // user object has the garageId. passport.deserializeUser re-reads users on
  // every request, so subsequent calls will also see it.
  await attachUserToGarage(TEST_ADMIN.email, garageId, "ADMIN");

  const loginRes = await agent.post("/api/login").send({
    email: TEST_ADMIN.email,
    password: TEST_ADMIN.password,
  });
  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }

  return { agent, user: loginRes.body, garageId };
}

export async function loginAsUser(app: Express) {
  const agent = supertest.agent(app);
  const garageId = getTestGarageId();
  await agent.post("/api/register").send(TEST_USER).expect((res) => {
    if (res.status !== 200 && res.status !== 400 && res.status !== 500) {
      throw new Error(`Register failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  });
  await attachUserToGarage(TEST_USER.email, garageId, "ADVISOR");
  const loginRes = await agent.post("/api/login").send({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }
  return { agent, user: loginRes.body, garageId };
}

export function unauthenticatedAgent(app: Express) {
  return supertest.agent(app);
}

export async function seedCustomer(agent: supertest.Agent, garageId?: string) {
  const gId = garageId || getTestGarageId();
  const res = await agent.post("/api/customers").send({
    fullName: `Test Customer ${Date.now()}`,
    email: `customer-${Date.now()}@test.sa`,
    phone: "+966500000003",
    address: "123 Test Street, Riyadh",
    garageId: gId,
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Seed customer failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

export async function seedVehicle(agent: supertest.Agent, customerId: string, garageId?: string) {
  const gId = garageId || getTestGarageId();
  const res = await agent.post("/api/vehicles").send({
    customerId,
    garageId: gId,
    make: "Toyota",
    model: "Camry",
    year: 2024,
    vin: `TESTVHCL${Date.now()}`,
    licensePlate: `V-${Date.now().toString().slice(-4)}`,
    color: "White",
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Seed vehicle failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

export async function seedJobCard(agent: supertest.Agent, vehicleId: string, customerId: string, garageId?: string) {
  const gId = garageId || getTestGarageId();
  const ts = Date.now();
  const res = await agent.post("/api/job-cards").send({
    jobNumber: `JOB-TEST-${ts}`,
    garageId: gId,
    customerId,
    vehicleInfo: { make: "Toyota", model: "Camry", year: 2024, licensePlate: "TEST-001" },
    serviceType: "maintenance",
    description: "Test job card - oil change and inspection",
    priority: "medium",
    status: "pending",
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Seed job card failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body;
}
