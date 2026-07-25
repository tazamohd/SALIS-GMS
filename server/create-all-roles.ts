import { db } from './db';
import { roles } from '@shared/schema';
import { STANDARD_ROLES } from './rbac-config';
import { eq } from 'drizzle-orm';

async function createAllRoles() {
  console.log('🎭 Creating all 18+ standard roles...\n');

  const rolesToCreate = Object.entries(STANDARD_ROLES);
  console.log(`Total roles to create: ${rolesToCreate.length}\n`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const [roleKey, roleData] of rolesToCreate) {
    try {
      // Check if role already exists
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️  ${roleData.name} - already exists`);
        skippedCount++;
      } else {
        await db.insert(roles).values({
          name: roleData.name,
          scope: roleData.scope.toUpperCase(),
          isSystemRole: roleData.isSystemRole,
        });
        console.log(`  ✅ ${roleData.name} - created`);
        createdCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error creating ${roleData.name}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${createdCount} new roles`);
  console.log(`  Skipped: ${skippedCount} existing roles`);
  console.log(`  Total: ${createdCount + skippedCount} roles in system\n`);

  // Show all roles
  const allRoles = await db.select().from(roles).orderBy(roles.name);
  console.log('📋 All Roles in System:');
  for (const role of allRoles) {
    console.log(`  - ${role.name} (${role.scope})`);
  }
}

createAllRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
