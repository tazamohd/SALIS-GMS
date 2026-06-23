/**
 * @deprecated Superseded by server/seed-demo.ts.
 *
 * This script previously hardcoded plaintext demo passwords in source (a
 * security smell) and referenced a generated user_credentials.csv. It now
 * delegates to the canonical, env-gated demo seed, which creates one account
 * per RBAC role with a shared password sourced from DEMO_SEED_PASSWORD.
 *
 * Run instead:  npm run db:seed:demo
 */
import { pathToFileURL } from "url";
import { seedDemo } from "./seed-demo";

export { seedDemo as seedUsers };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDemo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed:", error);
      process.exit(1);
    });
}
