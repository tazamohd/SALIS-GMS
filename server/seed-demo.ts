/**
 * SALIS AUTO — Demo accounts seed.
 *
 * Creates one login per base RBAC role (see server/demo-config.ts) inside a
 * single demo garage/branch so every role can be explored end to end. Each user
 * gets a granular RBAC assignment (userRoleBranch → roles.name) AND a
 * guard-compatible `users.role`, so the simple route guards don't 403.
 *
 * Best-practice safeguards:
 *  - Refuses to run in production unless ALLOW_DEMO_SEED=true (demo accounts use
 *    a shared, well-known password and must never land in a real deployment).
 *  - No hardcoded secrets: the shared password comes from DEMO_SEED_PASSWORD
 *    (default "Demo123!"), surfaced once in the console summary, never written
 *    to a file.
 *  - Idempotent: re-running updates existing demo users in place.
 *
 * Run with:  npm run db:seed:demo
 */
// Load .env before importing ./db, which validates DATABASE_URL at import time.
// Running this script standalone (npm run db:seed:demo) does not go through the
// server bootstrap that normally calls dotenv, so load it here explicitly.
import "dotenv/config";
import { pathToFileURL } from "url";
import { db } from "./db";
import { users, roles, garages, branches, userRoleBranch } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { seedRBAC } from "./seed-rbac";
import { DEMO_ROLES, getDemoPassword, isDemoModeEnabled } from "./demo-config";

const SALT_ROUNDS = 10;
const DEMO_GARAGE_NAME = "SALIS AUTO Demo Garage";
const DEMO_BRANCH_NAME = "Demo Main Branch";

type UserRow = typeof users.$inferSelect;
type RoleRow = typeof roles.$inferSelect;

async function ensureDemoGarage() {
  const [existing] = await db
    .select()
    .from(garages)
    .where(eq(garages.name, DEMO_GARAGE_NAME))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(garages)
    .values({
      name: DEMO_GARAGE_NAME,
      country: "Saudi Arabia",
      city: "Riyadh",
      licenseNumber: "DEMO-GAR-001",
      isActive: true,
    })
    .returning();
  return created;
}

async function ensureDemoBranch(garageId: string) {
  const [existing] = await db
    .select()
    .from(branches)
    .where(and(eq(branches.garageId, garageId), eq(branches.name, DEMO_BRANCH_NAME)))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(branches)
    .values({
      garageId,
      name: DEMO_BRANCH_NAME,
      location: "Riyadh, Saudi Arabia",
    })
    .returning();
  return created;
}

export async function seedDemo(): Promise<void> {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Refusing to seed demo accounts in production. Set ALLOW_DEMO_SEED=true to override.",
    );
  }
  if (!isDemoModeEnabled()) {
    console.warn(
      "⚠️  DEMO_MODE is disabled — seeding accounts anyway, but the demo login endpoints will stay off until DEMO_MODE=true.",
    );
  }

  console.log("🚀 Seeding demo accounts...\n");

  // 1. Ensure the RBAC roles/permissions exist so userRoleBranch can link them.
  await seedRBAC();
  console.log("");

  // 2. Ensure a single demo garage + branch to scope all demo users.
  const garage = await ensureDemoGarage();
  const branch = await ensureDemoBranch(garage.id);
  console.log(`🏢 Demo garage: ${garage.name} (${garage.id})`);
  console.log(`📍 Demo branch: ${branch.name} (${branch.id})\n`);

  // 3. Build a name→role lookup for the RBAC assignment.
  const allRoles = await db.select().from(roles);
  const roleByName = new Map<string, RoleRow>(allRoles.map((r: RoleRow) => [r.name, r]));

  const password = getDemoPassword();
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  console.log(`👥 Creating/updating ${DEMO_ROLES.length} demo users...\n`);

  for (const spec of DEMO_ROLES) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, spec.email))
      .limit(1);

    let user: UserRow;
    const values = {
      email: spec.email,
      password: hashedPassword,
      fullName: `Demo ${spec.roleName}`,
      userType: spec.userType,
      role: spec.guardRole,
      garageId: garage.id,
      isActive: true,
    };

    if (existingUser) {
      [user] = await db
        .update(users)
        .set(values)
        .where(eq(users.id, existingUser.id))
        .returning();
    } else {
      [user] = await db.insert(users).values(values).returning();
    }

    // Assign the granular RBAC role (primary) for this demo user.
    const role = roleByName.get(spec.roleName);
    if (role) {
      await db.delete(userRoleBranch).where(eq(userRoleBranch.userId, user.id));
      await db.insert(userRoleBranch).values({
        userId: user.id,
        roleId: role.id,
        branchId: branch.id,
        isPrimaryRole: true,
      });
    } else {
      console.warn(`  ⚠️  RBAC role "${spec.roleName}" not found — granular assignment skipped.`);
    }

    console.log(
      `  ✓ ${spec.email.padEnd(36)} role=${spec.guardRole.padEnd(11)} rbac=${spec.roleName}`,
    );
  }

  // 4. A garageless PLATFORM_ADMIN (super admin) so the platform control plane
  //    (Approvals, subscriptions, provider management) is demoable out of the box.
  const platformAdminEmail = "platform_admin@demo.salisauto.com";
  const [existingPa] = await db.select().from(users).where(eq(users.email, platformAdminEmail)).limit(1);
  const paValues = {
    email: platformAdminEmail,
    password: hashedPassword,
    fullName: "Demo Platform Admin",
    userType: "platform_admin",
    role: "PLATFORM_ADMIN",
    garageId: null as any,
    isActive: true,
  };
  if (existingPa) {
    await db.update(users).set(paValues).where(eq(users.id, existingPa.id));
  } else {
    await db.insert(users).values(paValues);
  }
  console.log(`  ✓ ${platformAdminEmail.padEnd(36)} role=PLATFORM_ADMIN (super admin)`);

  console.log("\n✅ Demo seeding complete.");
  console.log(`   Shared password for every demo account: ${password}`);
  console.log("   Log in with any email above, or use the demo quick-pick on the login page.\n");
}

// Run when invoked directly (npm run db:seed:demo / tsx server/seed-demo.ts).
// pathToFileURL normalizes Windows paths so this matches cross-platform.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDemo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Demo seeding failed:", error);
      process.exit(1);
    });
}
