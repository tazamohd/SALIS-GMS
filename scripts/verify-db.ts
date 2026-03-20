/**
 * Verify database schema — checks that all expected tables exist.
 * Run with: npx tsx scripts/verify-db.ts
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

const CORE_TABLES = [
  "garages",
  "users",
  "roles",
  "customers",
  "vehicles",
  "job_cards",
  "job_card_parts",
  "job_card_tasks",
  "invoices",
  "invoice_items",
  "estimates",
  "estimate_items",
  "payments",
  "spare_parts",
  "spare_part_inventories",
  "stock_alerts",
  "appointments",
  "feature_flags",
  "vehicle_service_history",
  "vehicle_maintenance_schedules",
  "customer_notes",
  "permissions",
];

async function main() {
  console.log("Verifying database schema...\n");

  const result = await db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );

  const existingTables = new Set(
    (result.rows as { table_name: string }[]).map((r) => r.table_name)
  );

  console.log(`Total tables in database: ${existingTables.size}\n`);

  let missing = 0;
  for (const table of CORE_TABLES) {
    const exists = existingTables.has(table);
    console.log(`  ${exists ? "OK" : "MISSING"}  ${table}`);
    if (!exists) missing++;
  }

  console.log(
    `\n${CORE_TABLES.length - missing}/${CORE_TABLES.length} core tables present.`
  );
  if (missing > 0) {
    console.error(`\n${missing} core table(s) missing — run 'npm run db:push' first.`);
    process.exit(1);
  }

  console.log("\nAll core tables verified.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Verification failed:", err.message);
  process.exit(1);
});
