/**
 * H-1 (documents/chat/marketing batch) via requireResourceOwnership.
 *
 * Covers a direct garage_id entity (chat_conversations, marketing_campaigns)
 * and a parent-join child (chat_messages, scoped through its conversation's
 * garage). Cross-tenant reads/writes by UUID must 404; the owner succeeds.
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, createSecondGarageAdmin } from "./helpers";
import { db } from "../db";
import { sql } from "drizzle-orm";

let app: Express;
let adminA: supertest.Agent;
let adminB: supertest.Agent;
let garageA: string;
let convId: string;
let msgId: string;
let campaignId: string;

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  const adminAId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  convId = (await db.execute(sql`
    INSERT INTO chat_conversations (id, garage_id, created_by, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${adminAId}, NOW()) RETURNING id`)).rows[0].id as string;

  msgId = (await db.execute(sql`
    INSERT INTO chat_messages (id, conversation_id, sender_id, content, created_at)
    VALUES (gen_random_uuid(), ${convId}, ${adminAId}, 'internal note', NOW()) RETURNING id`)).rows[0].id as string;

  campaignId = (await db.execute(sql`
    INSERT INTO marketing_campaigns (id, garage_id, campaign_name, campaign_type, created_at)
    VALUES (gen_random_uuid(), ${garageA}, 'Spring Sale', 'email', NOW()) RETURNING id`)).rows[0].id as string;
}, 60000);

describe("chat conversation — direct garage_id", () => {
  it("owner reads; garage B cannot read the conversation or its messages", async () => {
    expect((await adminA.get(`/api/chat/conversations/${convId}`)).status).toBe(200);
    expect((await adminB.get(`/api/chat/conversations/${convId}`)).status).toBe(404);
    expect((await adminB.get(`/api/chat/conversations/${convId}/messages`)).status).toBe(404);
    expect((await adminB.get(`/api/chat/conversations/${convId}/participants`)).status).toBe(404);
  });
});

describe("chat message — parent-join through conversation", () => {
  it("garage B cannot patch or delete garage A's message", async () => {
    expect((await adminB.patch(`/api/chat/messages/${msgId}`).send({ content: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/chat/messages/${msgId}`)).status).toBe(404);
    expect((await adminB.get(`/api/chat/messages/${msgId}/reactions`)).status).toBe(404);
  });
});

describe("marketing campaign — direct garage_id", () => {
  it("owner reads; garage B cannot read, patch or delete", async () => {
    expect((await adminA.get(`/api/marketing-campaigns/${campaignId}`)).status).toBe(200);
    expect((await adminB.get(`/api/marketing-campaigns/${campaignId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/marketing-campaigns/${campaignId}`).send({ campaignName: "hax" })).status).toBe(404);
    expect((await adminB.delete(`/api/marketing-campaigns/${campaignId}`)).status).toBe(404);
  });
});
