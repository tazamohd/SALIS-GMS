/**
 * Durable isolation-leak audit (Story 5.1 / FR-9).
 * Verifies that a detected cross-tenant attempt is written to the audit_log.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "pg";
import { createTestApp } from "./setup";
import { writeIsolationLeakAudit } from "../tenancy/audit-sink";
import { runWithTenantScope } from "../tenancy/tenant-context";

beforeAll(async () => {
  await createTestApp(); // ensures DB schema is pushed
});

describe("isolation-leak audit", () => {
  it("persists an ISOLATION_LEAK_ATTEMPT row attributed to the acting user + garage", async () => {
    const garageId = process.env.TEST_GARAGE_ID || "test-garage";
    const marker = `tester-${Date.now()}`;

    await runWithTenantScope(
      { userId: marker, garageId, branchIds: [], isBranchRestricted: false, isPlatformPrincipal: false },
      async () => {
        await writeIsolationLeakAudit({
          action: "create",
          table: "invoices",
          suppliedGarageId: "some-other-garage",
          scopedGarageId: garageId,
        });
      },
    );

    const client = new Client({ connectionString: process.env.DATABASE_URL! });
    await client.connect();
    try {
      const r = await client.query(
        `SELECT * FROM audit_log WHERE action = 'ISOLATION_LEAK_ATTEMPT' AND user_id = $1 LIMIT 1`,
        [marker],
      );
      expect(r.rows.length).toBe(1);
      expect(r.rows[0].resource).toBe("invoices");
      expect(r.rows[0].garage_id).toBe(garageId);
      expect(r.rows[0].severity).toBe("high");
    } finally {
      await client.end();
    }
  });
});
