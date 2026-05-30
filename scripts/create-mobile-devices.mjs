// One-off migration: create mobile_devices table directly.
// Drizzle-kit push is interactive in this repo because of unrelated schema drift;
// this script applies just the mobile_devices DDL.

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const SQL = `
CREATE TABLE IF NOT EXISTS mobile_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid NOT NULL REFERENCES garages(id),
  device_name varchar(200) NOT NULL,
  device_type varchar(30) NOT NULL,
  assigned_to varchar REFERENCES users(id),
  status varchar(20) NOT NULL DEFAULT 'active',
  battery_level integer,
  last_sync timestamp,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_garage ON mobile_devices(garage_id);
`;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing — cannot run migration.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  await pool.query(SQL);
  console.log('✅ mobile_devices table is present (created or already existed).');
} catch (err) {
  console.error('❌ Migration failed:', err);
  process.exit(1);
} finally {
  await pool.end();
}
