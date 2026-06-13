# Vertical-slice templates

Copy-paste starting points for each layer, drawn from the real conventions in
this repo. The running example is a fictional `serviceBays` resource (a garage
has physical service bays). Replace names to taste, but keep the shape.

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
export const serviceBays = pgTable("service_bays", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  garageId: varchar("garage_id")
    .notNull()
    .references(() => garages.id),
  name: varchar("name", { length: 100 }).notNull(),
  bayType: varchar("bay_type", { length: 50 }).notNull(), // "lift", "alignment", "detailing"
  isOccupied: boolean("is_occupied").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validation schema for inserts — omit everything the server controls so a
// client can't spoof an id, a timestamp, or the owning garage when that's
// derived from the session.
export const insertServiceBaySchema = createInsertSchema(serviceBays).omit({
  id: true,
  createdAt: true,
});

export type ServiceBay = typeof serviceBays.$inferSelect;
export type InsertServiceBay = typeof serviceBays.$inferInsert;
```

Apply the change to the database:

```bash
npm run db:push
```

## Layer 2 — Storage

In `server/storage.ts`. Add the signature to the `IStorage` interface
(near the related domain section), then implement it in the `DatabaseStorage`
class. The query helpers `eq`, `and`, `or`, `ilike`, `desc` are imported from
`drizzle-orm` at the top of the file; `db` is the Drizzle client.

Interface (in `IStorage`):

```typescript
  // Service Bays
  getServiceBays(garageId?: string): Promise<ServiceBay[]>;
  getServiceBay(id: string): Promise<ServiceBay | undefined>;
  createServiceBay(data: InsertServiceBay): Promise<ServiceBay>;
  updateServiceBay(id: string, data: Partial<ServiceBay>): Promise<ServiceBay>;
  deleteServiceBay(id: string): Promise<void>;
```

Implementation (in `DatabaseStorage`). Note the tenant filter and the
`orderBy(desc(...))` convention used across the codebase:

```typescript
  async getServiceBays(garageId?: string): Promise<ServiceBay[]> {
    const conditions = [];
    if (garageId) {
      conditions.push(eq(serviceBays.garageId, garageId));
    }
    const query = conditions.length
      ? db.select().from(serviceBays).where(and(...conditions))
      : db.select().from(serviceBays);
    return await query.orderBy(desc(serviceBays.createdAt));
  }

  async getServiceBay(id: string): Promise<ServiceBay | undefined> {
    const [bay] = await db.select().from(serviceBays).where(eq(serviceBays.id, id));
    return bay;
  }

  async createServiceBay(data: InsertServiceBay): Promise<ServiceBay> {
    const [bay] = await db.insert(serviceBays).values(data).returning();
    return bay;
  }

  async updateServiceBay(id: string, data: Partial<ServiceBay>): Promise<ServiceBay> {
    const [bay] = await db
      .update(serviceBays)
      .set(data)
      .where(eq(serviceBays.id, id))
      .returning();
    return bay;
  }

  async deleteServiceBay(id: string): Promise<void> {
    await db.delete(serviceBays).where(eq(serviceBays.id, id));
  }
```

Import the new table/types in `storage.ts` if its schema import list is explicit
(check the top of the file — it imports from `@shared/schema`).

## Layer 3 — Route

A new file `server/routes/service-bays.routes.ts`. Every handler is wrapped in
try/catch, logs with `console.error`, and returns `res.status(...).json({
message })` on error. Authenticated routes use `isAuthenticated`; pull the
tenant off `req.user`. Export the router as `export const {domain}Routes`.

```typescript
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// List service bays (scoped to the caller's garage)
router.get("/service-bays", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = (req.query.garage_id as string) || req.user?.garageId;
    const bays = await storage.getServiceBays(garageId);
    res.json(bays);
  } catch (error) {
    console.error("Error fetching service bays:", error);
    res.status(500).json({ message: "Failed to fetch service bays" });
  }
});

// Get one
router.get("/service-bays/:id", isAuthenticated, async (req, res) => {
  try {
    const bay = await storage.getServiceBay(req.params.id);
    if (!bay) {
      return res.status(404).json({ message: "Service bay not found" });
    }
    res.json(bay);
  } catch (error) {
    console.error("Error fetching service bay:", error);
    res.status(500).json({ message: "Failed to fetch service bay" });
  }
});

// Create — validate with the schema's own Zod, then set server-owned fields
router.post("/service-bays", isAuthenticated, async (req: any, res) => {
  try {
    const { insertServiceBaySchema } = await import("@shared/schema");
    const garageId = req.body.garageId || req.user?.garageId;

    const result = insertServiceBaySchema.safeParse({ ...req.body, garageId });
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const bay = await storage.createServiceBay(result.data);
    res.status(201).json(bay);
  } catch (error) {
    console.error("Error creating service bay:", error);
    res.status(500).json({ message: "Failed to create service bay" });
  }
});

// Update
router.patch("/service-bays/:id", isAuthenticated, async (req, res) => {
  try {
    const bay = await storage.updateServiceBay(req.params.id, req.body);
    res.json(bay);
  } catch (error) {
    console.error("Error updating service bay:", error);
    res.status(500).json({ message: "Failed to update service bay" });
  }
});

// Delete
router.delete("/service-bays/:id", isAuthenticated, async (req, res) => {
  try {
    await storage.deleteServiceBay(req.params.id);
    res.json({ message: "Service bay deleted successfully" });
  } catch (error) {
    console.error("Error deleting service bay:", error);
    res.status(500).json({ message: "Failed to delete service bay" });
  }
});

export const serviceBayRoutes = router;
```

## Layer 4 — Mounting

In `server/routes/index.ts`, import the router and mount it under `/api`. Keep
the `console.log("✅ …")` line — every module logs on load, which makes the
boot sequence readable.

```typescript
import { serviceBayRoutes } from "./service-bays.routes";
// ...
  app.use("/api", serviceBayRoutes);
  console.log("✅ Service Bays Routes Loaded");
```

**Before mounting, confirm you're not shadowing the legacy monolith.** Grep
`server/routes.ts` for the path you're about to serve:

```bash
grep -n '"/api/service-bays' server/routes.ts
```

If the monolith already serves it with real (DB-backed) logic, do not mount a
parallel router — extend the monolith handler instead, or fully port it to
`storage.*` first. See the "intentionally NOT imported" comment blocks already
in `index.ts` for precedent (`estimates`, `supplier-portal`, `misc.routes`).

## Layer 5 — Test

In `server/routes/__tests__/service-bays.test.ts`. Use the shared `createTestApp`
and `loginAsAdmin` helpers; drive the API with the returned supertest `agent`.

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

describe("Service Bays API", () => {
  it("lists service bays for the authenticated garage", async () => {
    const res = await agent.get("/api/service-bays");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rejects an invalid create payload with 400", async () => {
    const res = await agent.post("/api/service-bays").send({ name: "" });
    expect(res.status).toBe(400);
  });

  it("creates a service bay", async () => {
    const res = await agent.post("/api/service-bays").send({
      name: "Bay 1",
      bayType: "lift",
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

Run it:

```bash
npx vitest run server/routes/__tests__/service-bays.test.ts
```
