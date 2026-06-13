# Vertical-slice templates

Copy-paste starting points for each layer, drawn from the real conventions in
this repo. The running example is a `toolCheckouts` resource — a log of which
technician borrowed which shop tool and whether it's been returned. Replace
names to taste, but keep the shape.

> **Before you paste: confirm the resource doesn't already exist.** This repo
> has 104+ modules and a 22k-line monolith, so obvious names are frequently
> already taken (`serviceBays`, `loanerVehicles`, and many more all exist). A
> verbatim paste of a colliding name creates a duplicate table and shadowed
> routes. Run the step-0 greps from `SKILL.md` first. `toolCheckouts` is used
> here precisely because it does **not** currently exist — treat every name
> below as a placeholder you've verified is free.

Read the nearest real sibling alongside these templates — e.g.
`server/routes/customers.routes.ts` for routes,
`server/routes/__tests__/technician.test.ts` for tests — so you match whatever
local nuances exist.

## Table of contents

1. [Layer 1 — Schema (`shared/schema.ts`)](#layer-1--schema)
2. [Layer 2 — Storage (`server/storage.ts`)](#layer-2--storage)
3. [Layer 3 — Route (`server/routes/{domain}.routes.ts`)](#layer-3--route)
4. [Layer 4 — Mounting (`server/routes/index.ts`)](#layer-4--mounting)
5. [Layer 5 — Test (`server/routes/__tests__/{domain}.test.ts`)](#layer-5--test)

---

## Layer 1 — Schema

In `shared/schema.ts`. Tables use `uuid` primary keys defaulted to
`gen_random_uuid()`, `varchar` foreign keys with `.references(() => ...)`, and a
`createdAt` timestamp. Tenant-scoped tables carry a `garageId`. Column helpers
(`uuid`, `varchar`, `text`, `boolean`, `timestamp`, `integer`, `decimal`,
`jsonb`, …) are already imported at the top of the file.

```typescript
export const toolCheckouts = pgTable("tool_checkouts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: varchar("garage_id")
    .notNull()
    .references(() => garages.id),
  toolName: varchar("tool_name", { length: 100 }).notNull(),
  technicianId: varchar("technician_id")
    .notNull()
    .references(() => users.id),
  checkedOutAt: timestamp("checked_out_at").defaultNow(),
  expectedReturn: timestamp("expected_return"),
  isReturned: boolean("is_returned").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validation schema for inserts — omit everything the server controls so a
// client can't spoof an id, a timestamp, or the owning garage when that's
// derived from the session.
export const insertToolCheckoutSchema = createInsertSchema(toolCheckouts).omit({
  id: true,
  createdAt: true,
});

export type ToolCheckout = typeof toolCheckouts.$inferSelect;
export type InsertToolCheckout = typeof toolCheckouts.$inferInsert;
```

Apply the change to the database:

```bash
npm run db:push
```

## Layer 2 — Storage

In `server/storage.ts`. Add the signature to the `IStorage` interface
(grep for `export interface IStorage`), then implement it in the
`DatabaseStorage` class (grep for `class DatabaseStorage`). The file is ~12k
lines — search for those symbols rather than scrolling. The query helpers `eq`,
`and`, `or`, `ilike`, `desc` are imported from `drizzle-orm` at the top of the
file; `db` is the Drizzle client.

Interface (in `IStorage`):

```typescript
  // Tool Checkouts
  getToolCheckouts(garageId?: string): Promise<ToolCheckout[]>;
  getToolCheckout(id: string): Promise<ToolCheckout | undefined>;
  createToolCheckout(data: InsertToolCheckout): Promise<ToolCheckout>;
  updateToolCheckout(id: string, data: Partial<ToolCheckout>): Promise<ToolCheckout>;
  deleteToolCheckout(id: string): Promise<void>;
```

Implementation (in `DatabaseStorage`). Note the tenant filter and the
`orderBy(desc(...))` convention used across the codebase:

```typescript
  async getToolCheckouts(garageId?: string): Promise<ToolCheckout[]> {
    const conditions = [];
    if (garageId) {
      conditions.push(eq(toolCheckouts.garageId, garageId));
    }
    const query = conditions.length
      ? db.select().from(toolCheckouts).where(and(...conditions))
      : db.select().from(toolCheckouts);
    return await query.orderBy(desc(toolCheckouts.createdAt));
  }

  async getToolCheckout(id: string): Promise<ToolCheckout | undefined> {
    const [row] = await db.select().from(toolCheckouts).where(eq(toolCheckouts.id, id));
    return row;
  }

  async createToolCheckout(data: InsertToolCheckout): Promise<ToolCheckout> {
    const [row] = await db.insert(toolCheckouts).values(data).returning();
    return row;
  }

  async updateToolCheckout(id: string, data: Partial<ToolCheckout>): Promise<ToolCheckout> {
    const [row] = await db
      .update(toolCheckouts)
      .set(data)
      .where(eq(toolCheckouts.id, id))
      .returning();
    return row;
  }

  async deleteToolCheckout(id: string): Promise<void> {
    await db.delete(toolCheckouts).where(eq(toolCheckouts.id, id));
  }
```

Import the new table/types in `storage.ts` if its schema import list is explicit
(check the top of the file — it imports from `@shared/schema`).

## Layer 3 — Route

A new file `server/routes/tool-checkouts.routes.ts`. Every handler is wrapped in
try/catch, logs with `console.error`, and returns `res.status(...).json({
message })` on error. Authenticated routes use `isAuthenticated`; pull the
tenant off `req.user`. Export the router as `export const {domain}Routes`.

```typescript
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// List tool checkouts (scoped to the caller's garage)
router.get("/tool-checkouts", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = (req.query.garage_id as string) || req.user?.garageId;
    const rows = await storage.getToolCheckouts(garageId);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching tool checkouts:", error);
    res.status(500).json({ message: "Failed to fetch tool checkouts" });
  }
});

// Get one
router.get("/tool-checkouts/:id", isAuthenticated, async (req, res) => {
  try {
    const row = await storage.getToolCheckout(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Tool checkout not found" });
    }
    res.json(row);
  } catch (error) {
    console.error("Error fetching tool checkout:", error);
    res.status(500).json({ message: "Failed to fetch tool checkout" });
  }
});

// Create — validate with the schema's own Zod, then set server-owned fields
router.post("/tool-checkouts", isAuthenticated, async (req: any, res) => {
  try {
    const { insertToolCheckoutSchema } = await import("@shared/schema");
    const garageId = req.body.garageId || req.user?.garageId;

    const result = insertToolCheckoutSchema.safeParse({ ...req.body, garageId });
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const row = await storage.createToolCheckout(result.data);
    res.status(201).json(row);
  } catch (error) {
    console.error("Error creating tool checkout:", error);
    res.status(500).json({ message: "Failed to create tool checkout" });
  }
});

// Update
router.patch("/tool-checkouts/:id", isAuthenticated, async (req, res) => {
  try {
    const row = await storage.updateToolCheckout(req.params.id, req.body);
    res.json(row);
  } catch (error) {
    console.error("Error updating tool checkout:", error);
    res.status(500).json({ message: "Failed to update tool checkout" });
  }
});

// Delete
router.delete("/tool-checkouts/:id", isAuthenticated, async (req, res) => {
  try {
    await storage.deleteToolCheckout(req.params.id);
    res.json({ message: "Tool checkout deleted successfully" });
  } catch (error) {
    console.error("Error deleting tool checkout:", error);
    res.status(500).json({ message: "Failed to delete tool checkout" });
  }
});

export const toolCheckoutRoutes = router;
```

## Layer 4 — Mounting

In `server/routes/index.ts`, import the router and mount it under `/api`. Keep
the `console.log("✅ …")` line — every module logs on load, which makes the
boot sequence readable.

```typescript
import { toolCheckoutRoutes } from "./tool-checkouts.routes";
// ...
  app.use("/api", toolCheckoutRoutes);
  console.log("✅ Tool Checkouts Routes Loaded");
```

**Before mounting, confirm you're not shadowing the legacy monolith.** Grep
`server/routes.ts` for the path you're about to serve:

```bash
grep -n '"/api/tool-checkouts' server/routes.ts
```

If the monolith already serves it with real (DB-backed) logic, do not blindly
add a parallel router. You have two safe options:

1. **Extend the monolith handler** instead of mounting a second one, or
2. **Mount a fully DB-backed router *before* the legacy fallback** so yours takes
   precedence — but then watch for sub-path capture: a `GET /tool-checkouts/:id`
   will swallow sibling literal paths the monolith owns (e.g.
   `/tool-checkouts/statistics`). Guard those by calling `next()` for reserved
   segments so the monolith still serves them:
   ```typescript
   const RESERVED = new Set(["statistics", "with-sessions"]); // literals the monolith owns
   router.get("/tool-checkouts/:id", isAuthenticated, async (req, res, next) => {
     if (RESERVED.has(req.params.id)) return next();
     // ...normal get-by-id...
   });
   ```

Never mount a stub that returns empty arrays over a working endpoint. See the
"intentionally NOT imported" comment blocks already in `index.ts`
(`estimates`, `supplier-portal`, `misc.routes`) for precedent.

## Layer 5 — Test

In `server/routes/__tests__/tool-checkouts.test.ts`. Use the shared
`createTestApp` and `loginAsAdmin` helpers; drive the API with the returned
supertest `agent`.

```typescript
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
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe("Tool Checkouts API", () => {
  it("lists tool checkouts for the authenticated garage", async () => {
    const res = await agent.get("/api/tool-checkouts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rejects an invalid create payload with 400", async () => {
    const res = await agent.post("/api/tool-checkouts").send({ toolName: "" });
    expect(res.status).toBe(400);
  });

  it("creates a tool checkout", async () => {
    const res = await agent.post("/api/tool-checkouts").send({
      toolName: "Torque wrench",
      technicianId: "<a valid user id>",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
```

For a route you own and just mounted, assert concrete statuses (200/201/400) as
above. The `expect([200, 404]).toContain(res.status)` pattern you'll see in some
existing tests is only for endpoints that may be unmounted by design — don't
copy it onto your own working route, or the test won't actually prove anything.

**DB-backed tests need a real Postgres.** `globalSetup.ts` seeds a test garage;
if the sandbox's embedded Postgres can't start, point `TEST_DATABASE_URL` at a
local Postgres instance (the suite's documented escape hatch) rather than
reporting a false pass.

Run it:

```bash
npx vitest run server/routes/__tests__/tool-checkouts.test.ts
```
