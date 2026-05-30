// One-off migration: apply the composite indexes added in the review follow-up.
// All idempotent (IF NOT EXISTS), safe to re-run.
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const SQL = `
CREATE INDEX IF NOT EXISTS job_cards_garage_created_idx   ON job_cards   (garage_id, created_at);
CREATE INDEX IF NOT EXISTS job_cards_garage_completed_idx ON job_cards   (garage_id, completed_at);
CREATE INDEX IF NOT EXISTS job_cards_garage_status_idx    ON job_cards   (garage_id, status);
CREATE INDEX IF NOT EXISTS invoices_garage_status_invoice_date_idx ON invoices (garage_id, status, invoice_date);
CREATE INDEX IF NOT EXISTS mobile_devices_garage_idx ON mobile_devices (garage_id);
`;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing — cannot run migration.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(SQL);
  console.log('✅ Performance indexes applied (created or already existed).');
} catch (err) {
  console.error('❌ Migration failed:', err);
  process.exit(1);
} finally {
  await pool.end();
}
