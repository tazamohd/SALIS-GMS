import { db } from './db';
import { users, roles, userRoleBranch, branches } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function assignUserRoles() {
  console.log('🎭 Assigning users to roles...\n');

  // Get all roles
  const allRoles = await db.select().from(roles);
  const roleMap = new Map(allRoles.map(r => [r.name, r]));
  
  // Get first branch of each garage for role assignment
  const garagesBranches = await db.select().from(branches);
  
  // Get all users
  const allUsers = await db.select().from(users);
  
  console.log(`Found ${allUsers.length} users to process`);
  console.log(`Found ${allRoles.length} roles: ${allRoles.map(r => r.name).join(', ')}\n`);
  
  const assignmentsToCreate: Array<typeof userRoleBranch.$inferInsert> = [];
  
  for (const user of allUsers) {
    let roleName: string | null = null;
    
    // Determine role based on user_type
    if (user.userType === 'technician') {
      roleName = 'Technician';
    } else if (user.userType === 'customer') {
      // Skip customers for now - they don't need roles in the system
      continue;
    } else if (user.userType === 'manager') {
      roleName = 'Garage Manager';
    } else if (user.userType === 'admin') {
      roleName = 'Super Admin';
    }
    
    if (!roleName) continue;
    
    const role = roleMap.get(roleName);
    if (!role) {
      console.warn(`Role ${roleName} not found`);
      continue;
    }
    
    // Find a branch for this user's garage
    const userBranch = garagesBranches.find(b => b.garageId === user.garageId);
    if (!userBranch) {
      console.warn(`No branch found for garage ${user.garageId}`);
      continue;
    }
    
    assignmentsToCreate.push({
      userId: user.id,
      roleId: role.id,
      branchId: userBranch.id,
      isPrimaryRole: true,
    });
  }
  
  console.log(`📝 Creating ${assignmentsToCreate.length} role assignments...`);
  
  // Bulk insert with onConflictDoNothing
  if (assignmentsToCreate.length > 0) {
    await db.insert(userRoleBranch).values(assignmentsToCreate).onConflictDoNothing();
  }
  
  console.log(`✅ Successfully assigned roles to users`);
  
  // Show summary with proper aggregation
  const summaryQuery = await db.execute(sql`
    SELECT r.name as role_name, COUNT(DISTINCT urb.user_id) as user_count
    FROM roles r
    LEFT JOIN user_role_branch urb ON r.id = urb.role_id
    GROUP BY r.id, r.name
    ORDER BY user_count DESC
  `);
  
  console.log('\n📊 Role Assignment Summary:');
  for (const row of summaryQuery.rows) {
    console.log(`  ${row.role_name}: ${row.user_count} users`);
  }
}

assignUserRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
