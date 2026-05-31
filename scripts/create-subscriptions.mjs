// One-off migration: create subscriptions table directly.
// Idempotent CREATE TABLE / INDEX IF NOT EXISTS; safe to re-run.
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const SQL = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid NOT NULL REFERENCES garages(id),
  plan varchar(20) NOT NULL DEFAULT 'STARTER',
  status varchar(20) NOT NULL DEFAULT 'active',
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at timestamp,
  canceled_at timestamp,
  stripe_subscription_id varchar(120) UNIQUE,
  stripe_customer_id varchar(120),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  CONSTRAINT subscriptions_garage_unique UNIQUE (garage_id)
);
CREATE INDEX IF NOT EXISTS subscriptions_garage_idx ON subscriptions(garage_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_idx ON subscriptions(stripe_subscription_id);
`;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing — cannot run migration.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(SQL);
  console.log("✅ subscriptions table is present (created or already existed).");
} catch (err) {
  console.error("❌ Migration failed:", err);
  process.exit(1);
} finally {
  await pool.end();
}
