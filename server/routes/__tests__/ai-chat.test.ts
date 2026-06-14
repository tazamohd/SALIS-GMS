import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  agent = (await loginAsAdmin(app)).agent;
});

describe("AI chat persistence", () => {
  it("persists user + assistant messages and lists them", async () => {
    const send = await agent.post("/api/ai-chat/send").send({ message: "hello assistant" });
    expect(send.status).toBe(200);

    const match = send.text.match(/"conversationId":"([^"]+)"/);
    expect(match).toBeTruthy();
    const conversationId = match![1];

    const list = await agent.get(`/api/ai-chat-messages?conversationId=${conversationId}`);
    expect(list.status).toBe(200);
    // user message + assistant (demo) response both stored
    expect(list.body.length).toBeGreaterThanOrEqual(2);
    expect(list.body[0].role).toBe("user");
    expect(list.body[0].content).toBe("hello assistant");
    expect(list.body.some((m: any) => m.role === "assistant")).toBe(true);
  });

  it("returns 404 for a conversation outside the caller's garage", async () => {
    const res = await agent.get(
      "/api/ai-chat-messages?conversationId=00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });

  it("requires a message body", async () => {
    const res = await agent.post("/api/ai-chat/send").send({});
    expect(res.status).toBe(400);
  });
});
