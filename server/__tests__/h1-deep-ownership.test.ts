/**
 * H-1 deep guards — the tenant is reached only through a 2-hop parent chain,
 * or (inventory transfers) through either of two garage columns.
 *
 *   - 2-hop:  chat_attachments -> chat_messages -> chat_conversations(garage)
 *   - dual-garage: inventory_transfers.from_garage_id / to_garage_id — visible
 *     to either party, but an unrelated garage must still 404.
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
let attachmentId: string;
let transferId: string;

async function ins(q: any): Promise<string> {
  return (await db.execute(q)).rows[0].id as string;
}

beforeAll(async () => {
  const r = await createTestApp();
  app = r.app;
  const a = await loginAsAdmin(app);
  adminA = a.agent;
  garageA = a.garageId;
  const adminAId = a.user.id;
  adminB = (await createSecondGarageAdmin(app)).agent;

  // 2-hop: conversation(garageA) -> message -> attachment
  const convId = await ins(sql`INSERT INTO chat_conversations (id, garage_id, created_by, created_at)
    VALUES (gen_random_uuid(), ${garageA}, ${adminAId}, NOW()) RETURNING id`);
  const msgId = await ins(sql`INSERT INTO chat_messages (id, conversation_id, sender_id, content, created_at)
    VALUES (gen_random_uuid(), ${convId}, ${adminAId}, 'hi', NOW()) RETURNING id`);
  attachmentId = await ins(sql`INSERT INTO chat_attachments (id, message_id, file_name, file_type, file_size, file_url, uploaded_by, created_at)
    VALUES (gen_random_uuid(), ${msgId}, 'a.pdf', 'application/pdf', 100, 'http://x/a.pdf', ${adminAId}, NOW()) RETURNING id`);

  // dual-garage: an intra-garage-A transfer (from A -> A). An unrelated garage B
  // is neither party, so it must 404.
  const partId = await ins(sql`INSERT INTO spare_parts (id, name, category, sku, created_by, created_at)
    VALUES (gen_random_uuid(), 'Filter', 'engine', ${'SKU-' + Date.now()}, ${adminAId}, NOW()) RETURNING id`);
  transferId = await ins(sql`INSERT INTO inventory_transfers (id, transfer_number, spare_part_id, from_garage_id, to_garage_id, quantity, requested_by, created_at)
    VALUES (gen_random_uuid(), ${'TR-' + Date.now()}, ${partId}, ${garageA}, ${garageA}, 1, ${adminAId}, NOW()) RETURNING id`);
});

describe("2-hop parent chain (chat_attachments -> messages -> conversation)", () => {
  it("garage B cannot delete an attachment two hops inside garage A", async () => {
    expect((await adminB.delete(`/api/chat/attachments/${attachmentId}`)).status).toBe(404);
  });
});

describe("dual-garage tenant columns (inventory_transfers)", () => {
  it("owner (a party to the transfer) reads; an unrelated garage 404s", async () => {
    expect((await adminA.get(`/api/inventory-transfers/${transferId}`)).status).toBe(200);
    expect((await adminB.get(`/api/inventory-transfers/${transferId}`)).status).toBe(404);
    expect((await adminB.patch(`/api/inventory-transfers/${transferId}`).send({ quantity: 99 })).status).toBe(404);
    expect((await adminB.post(`/api/inventory-transfers/${transferId}/approve`)).status).toBe(404);
  });
});
