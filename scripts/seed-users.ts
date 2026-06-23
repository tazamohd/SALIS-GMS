/**
 * @deprecated Superseded by server/seed-demo.ts.
 *
 * This script previously hardcoded plaintext demo passwords (admin123, etc.) in
 * source. Demo accounts are now created by the canonical, env-gated demo seed
 * with a shared password sourced from DEMO_SEED_PASSWORD.
 *
 * Run instead:  npm run db:seed:demo
 */
import { seedDemo } from "../server/seed-demo";

seedDemo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
  });
