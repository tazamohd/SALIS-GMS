/**
 * Runtime companion to raw-sql-column-naming: hits the raw-SQL-heavy read
 * endpoints against the real (schema-pushed) test DB and asserts that none
 * of their queries throws a schema error — column/table/relation "does not
 * exist" or a SQL syntax error.
 *
 * The static lint catches quoted-camelCase; this catches the class it can't
 * — a plausible but wrong snake_case column (the CRM `scheduled_date` bug)
 * or a join on a relationship the schema lacks. Crucially it also catches
 * SILENT failures: the broken modules all `console.error(err)` before
 * returning an empty fallback, so we spy on console.error and fail if any
 * schema error surfaces even when the HTTP status is 200.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let admin: supertest.Agent;
const DUMMY_UUID = "00000000-0000-0000-0000-000000000000";

// Read endpoints whose handlers run raw SQL. :id routes use a dummy uuid —
// the query still executes (0 rows) and would throw on a bad column/table.
const ENDPOINTS: string[] = [
  "/api/crm/customers",
  `/api/crm/customers/${DUMMY_UUID}`,
  "/api/crm/segments",
  "/api/crm/loyalty/summary",
  "/api/crm/retention",
  "/api/reports/revenue",
  "/api/reports/technician-performance",
  "/api/reports/inventory-turnover",
  "/api/reports/customer-analytics",
  "/api/reports/summary",
  "/api/dashboard/summary",
  "/api/dashboard/recent-activity",
  "/api/dashboard/trends",
  "/api/franchise/locations",
  "/api/franchise/analytics",
  "/api/franchise/performance",
  "/api/predictive-maintenance/predictions",
  "/api/predictive-maintenance/stats",
  "/api/ai/parts-recommendations?serviceType=brake%20service",
  "/api/hr/employees",
  `/api/hr/employees/${DUMMY_UUID}`,
  "/api/hr/attendance",
  "/api/hr/payroll/summary",
  `/api/hr/payroll/slip/${DUMMY_UUID}`,
  "/api/analytics/dashboard-metrics",
  "/api/analytics/profit-analysis?groupBy=service",
  "/api/analytics/customer-ltv",
  "/api/analytics/heatmaps?type=time",
  "/api/analytics/bi-report",
  "/api/accounting/dashboard",
];

const SCHEMA_ERROR = /does not exist|relation ".*" does not exist|column .* does not exist|syntax error at/i;

let captured: string[] = [];
const originalError = console.error;

beforeAll(async () => {
  app = (await createTestApp()).app;
  admin = (await loginAsAdmin(app)).agent;
  captured = [];
  console.error = (...args: any[]) => {
    captured.push(args.map((a) => (a instanceof Error ? `${a.message}` : String(a))).join(" "));
  };
}, 60000);

afterAll(() => {
  console.error = originalError;
});

describe("raw-SQL read endpoints execute without schema errors", () => {
  it("no endpoint returns a 5xx", async () => {
    const failures: string[] = [];
    for (const ep of ENDPOINTS) {
      const res = await admin.get(ep);
      if (res.status >= 500) failures.push(`${ep} -> ${res.status}`);
    }
    expect(failures, `5xx responses:\n${failures.join("\n")}`).toEqual([]);
  });

  it("no query logged a schema error (catches silent, swallowed failures)", () => {
    const schemaErrors = captured.filter((m) => SCHEMA_ERROR.test(m));
    expect(
      schemaErrors,
      `Schema errors surfaced from raw SQL (a column/table/relation is wrong):\n${schemaErrors.join("\n")}`,
    ).toEqual([]);
  });
});
