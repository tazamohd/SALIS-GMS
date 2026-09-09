/**
 * Staff access — the two ways an employee gets a login, and the guarantee that
 * neither lets the applicant choose their own privileges:
 *   - invite: the business issues a code carrying a role; redeeming it creates
 *     the account with THAT role and signs the person in.
 *   - apply:  anyone with the workplace code can file a request, which grants
 *     nothing until the business approves it and names the role.
 * Also covers the anonymity of the public half and the tenant boundary on the
 * management half.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import supertestLib from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, unauthenticatedAgent } from "./helpers";

let app: Express;
let admin: supertest.Agent;

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  admin = (await loginAsAdmin(app)).agent;
});

describe("staff invites", () => {
  it("redeems an invite into an account with the invited role", async () => {
    const created = await admin.post("/api/staff/invites").send({ roleKey: "TECHNICIAN" });
    expect(created.status).toBe(201);
    const code: string = created.body.code;
    expect(code).toMatch(/^[A-Z2-9]{8}$/);

    // The invite is inspectable anonymously — that is how the joiner sees which
    // workplace and role they are accepting.
    const anon = unauthenticatedAgent(app);
    const preview = await anon.get(`/api/staff/public/invite/${code}`);
    expect(preview.status).toBe(200);
    expect(preview.body.valid).toBe(true);
    expect(preview.body.roleKey).toBe("TECHNICIAN");

    const email = `tech-${uniq()}@test.sa`;
    const join = await anon.post("/api/staff/public/join").send({
      code,
      fullName: "Nasser Tech",
      email,
      password: "JoinPass123!",
    });
    expect(join.status).toBe(201);
    expect(join.body.role).toBe("TECHNICIAN");
    expect(join.body.garageId).toBeTruthy();
    expect(join.body.password).toBeUndefined();

    // And the account works.
    const relogin = supertestLib.agent(app);
    const login = await relogin.post("/api/login").send({ email, password: "JoinPass123!" });
    expect(login.status).toBe(200);
    expect(login.body.role).toBe("TECHNICIAN");
  });

  it("refuses a single-use invite the second time", async () => {
    const created = await admin.post("/api/staff/invites").send({ roleKey: "SERVICE_ADVISOR", maxUses: 1 });
    const code: string = created.body.code;

    const first = await unauthenticatedAgent(app).post("/api/staff/public/join").send({
      code, fullName: "First In", email: `first-${uniq()}@test.sa`, password: "JoinPass123!",
    });
    expect(first.status).toBe(201);

    const second = await unauthenticatedAgent(app).post("/api/staff/public/join").send({
      code, fullName: "Too Late", email: `late-${uniq()}@test.sa`, password: "JoinPass123!",
    });
    expect(second.status).toBe(400);
  });

  it("refuses an invite that was locked to a different email", async () => {
    const created = await admin.post("/api/staff/invites").send({
      roleKey: "TECHNICIAN",
      email: `intended-${uniq()}@test.sa`,
    });

    const res = await unauthenticatedAgent(app).post("/api/staff/public/join").send({
      code: created.body.code,
      fullName: "Someone Else",
      email: `someone-else-${uniq()}@test.sa`,
      password: "JoinPass123!",
    });
    expect(res.status).toBe(403);
  });

  it("refuses a revoked invite", async () => {
    const created = await admin.post("/api/staff/invites").send({ roleKey: "TECHNICIAN" });
    const revoke = await admin.post(`/api/staff/invites/${created.body.id}/revoke`);
    expect(revoke.status).toBe(200);

    const res = await unauthenticatedAgent(app).get(`/api/staff/public/invite/${created.body.code}`);
    expect(res.status).toBe(404);
  });

  it("will not hand out owner or system-admin roles", async () => {
    for (const roleKey of ["OWNER", "SYSTEM_ADMIN", "NOT_A_ROLE"]) {
      const res = await admin.post("/api/staff/invites").send({ roleKey });
      expect(res.status).toBe(400);
    }
  });

  it("keeps invite management behind a session", async () => {
    const anon = unauthenticatedAgent(app);
    expect((await anon.get("/api/staff/invites")).status).toBe(401);
    expect((await anon.post("/api/staff/invites").send({ roleKey: "TECHNICIAN" })).status).toBe(401);
  });
});

describe("workplace applications", () => {
  it("grants nothing until the business approves, and the business picks the role", async () => {
    const codeRes = await admin.get("/api/staff/join-code");
    expect(codeRes.status).toBe(200);
    const joinCode: string = codeRes.body.joinCode;
    expect(joinCode).toBeTruthy();

    const anon = unauthenticatedAgent(app);
    const workplace = await anon.get(`/api/staff/public/workplace/${joinCode}`);
    expect(workplace.status).toBe(200);
    expect(workplace.body.found).toBe(true);

    const email = `applicant-${uniq()}@test.sa`;
    const password = "ApplyPass123!";
    const applied = await anon.post("/api/staff/public/apply").send({
      joinCode,
      fullName: "Hopeful Applicant",
      email,
      // The applicant asks for a manager role; the approver below grants a
      // technician one instead. The request must not decide this.
      requestedRoleKey: "SERVICE_MANAGER",
      password,
    });
    expect(applied.status).toBe(201);
    expect(applied.body.status).toBe("pending");

    // No account exists yet.
    const early = await supertestLib.agent(app).post("/api/login").send({ email, password });
    expect(early.status).toBe(401);

    const pending = await admin.get("/api/staff/applications?status=pending");
    expect(pending.status).toBe(200);
    const row = pending.body.find((a: any) => a.email === email);
    expect(row).toBeTruthy();
    expect(row.passwordHash).toBeUndefined();

    const approve = await admin.post(`/api/staff/applications/${row.id}/approve`).send({ roleKey: "TECHNICIAN" });
    expect(approve.status).toBe(200);
    expect(approve.body.roleKey).toBe("TECHNICIAN");

    // Now the password they chose at application time works — with the role the
    // business granted, not the one they asked for.
    const login = await supertestLib.agent(app).post("/api/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.role).toBe("TECHNICIAN");
  });

  it("rejects an unknown workplace code", async () => {
    const anon = unauthenticatedAgent(app);
    expect((await anon.get("/api/staff/public/workplace/ZZZZZZ")).status).toBe(404);
    expect(
      (await anon.post("/api/staff/public/apply").send({
        joinCode: "ZZZZZZ",
        fullName: "Nobody",
        email: `nobody-${uniq()}@test.sa`,
        password: "ApplyPass123!",
      })).status,
    ).toBe(404);
  });

  it("keeps application review behind a session", async () => {
    const anon = unauthenticatedAgent(app);
    expect((await anon.get("/api/staff/applications")).status).toBe(401);
    expect((await anon.get("/api/staff/join-code")).status).toBe(401);
  });
});
