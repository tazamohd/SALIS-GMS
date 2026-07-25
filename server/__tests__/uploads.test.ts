/**
 * M3.1 — Real file uploads (/api/uploads).
 *
 * Covers:
 *  - POST /api/uploads (multipart) stores the file + returns metadata
 *  - GET  /api/uploads/:id streams the file back (download)
 *  - Tenant isolation: a user from another garage cannot fetch the file
 *  - Rejects files over 10MB
 *  - Rejects disallowed extensions (allowlist: images / pdf / office docs)
 *  - Requires authentication
 */
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin, unauthenticatedAgent, createSecondGarageAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;

const PDF_BYTES = Buffer.from("%PDF-1.4\n%test-fixture\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n");

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

async function uploadFixture(
  uploadAgent: supertest.Agent,
  overrides?: { buffer?: Buffer; filename?: string; category?: string },
) {
  return uploadAgent
    .post("/api/uploads")
    .field("name", `Upload Test ${Date.now()}`)
    .field("category", overrides?.category ?? "invoices")
    .field("description", "Created by uploads integration test")
    .field("tags", "test,uploads")
    .attach("file", overrides?.buffer ?? PDF_BYTES, overrides?.filename ?? "fixture.pdf");
}

describe("POST /api/uploads", () => {
  it("stores a multipart file and returns metadata", async () => {
    const res = await uploadFixture(agent);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.fileName).toBe("fixture.pdf");
    expect(res.body.size).toBe(PDF_BYTES.length); // real size, not Math.random()
    expect(res.body.mimeType).toBeDefined();
    expect(res.body.category).toBe("invoices");
    expect(res.body.downloadUrl).toBe(`/api/uploads/${res.body.id}`);
    // The stored filename must never echo the client-supplied name (path traversal).
    expect(JSON.stringify(res.body)).not.toContain("..");
  });

  it("rejects a request with no file attached", async () => {
    const res = await agent
      .post("/api/uploads")
      .field("name", "No file")
      .field("category", "invoices");
    expect(res.status).toBe(400);
  });

  it("rejects an invalid category", async () => {
    const res = await uploadFixture(agent, { category: "not-a-category" });
    expect(res.status).toBe(400);
  });

  it("rejects disallowed extensions (.exe)", async () => {
    const res = await uploadFixture(agent, {
      buffer: Buffer.from("MZ-fake-binary"),
      filename: "malware.exe",
    });
    expect(res.status).toBe(400);
  });

  it("rejects path-traversal filenames", async () => {
    const res = await uploadFixture(agent, {
      filename: "../../etc/passwd.pdf",
    });
    // Either rejected outright or sanitized — but never stored under the raw name.
    if (res.status === 201) {
      expect(res.body.fileName).not.toContain("..");
      expect(res.body.fileName).not.toContain("/");
    } else {
      expect(res.status).toBe(400);
    }
  });

  it("rejects files larger than 10MB", async () => {
    const big = Buffer.alloc(10 * 1024 * 1024 + 1, 0x61);
    const res = await uploadFixture(agent, { buffer: big, filename: "big.pdf" });
    expect([400, 413]).toContain(res.status);
  });

  it("requires authentication", async () => {
    const anon = unauthenticatedAgent(app);
    const res = await anon
      .post("/api/uploads")
      .field("category", "invoices")
      .attach("file", PDF_BYTES, "fixture.pdf");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/uploads/:id", () => {
  it("downloads the previously uploaded file", async () => {
    const created = await uploadFixture(agent);
    expect(created.status).toBe(201);

    const res = await agent
      .get(`/api/uploads/${created.body.id}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(Buffer.compare(res.body as Buffer, PDF_BYTES)).toBe(0);
    expect(res.headers["content-disposition"]).toContain("fixture.pdf");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await agent.get("/api/uploads/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("returns 400 for a non-uuid id", async () => {
    const res = await agent.get("/api/uploads/not-a-uuid");
    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const created = await uploadFixture(agent);
    const anon = unauthenticatedAgent(app);
    const res = await anon.get(`/api/uploads/${created.body.id}`);
    expect(res.status).toBe(401);
  });
});

describe("tenant isolation", () => {
  it("a user from another garage cannot fetch the file", async () => {
    const created = await uploadFixture(agent);
    expect(created.status).toBe(201);

    const garageB = await createSecondGarageAdmin(app);
    const res = await garageB.agent.get(`/api/uploads/${created.body.id}`);
    // Cross-tenant access must look like the resource does not exist.
    expect(res.status).toBe(404);
  });
});
