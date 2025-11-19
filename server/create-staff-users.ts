import { db } from './db';
import { users, roles, userRoleBranch, branches, garages } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

async function createStaffUsers() {
  console.log('👥 Creating staff users for all roles...\n');

  // Get all roles, branches, and garages
  const allRoles = await db.select().from(roles);
  const allBranches = await db.select().from(branches);
  const allGarages = await db.select().from(garages);

  const roleMap = new Map(allRoles.map(r => [r.name, r]));
  
  // Define staff to create
  const staffRoles = [
    { role: 'Service Advisor', count: 4, scope: 'branch' },
    { role: 'Service Manager', count: 2, scope: 'branch' },
    { role: 'Parts Manager', count: 2, scope: 'branch' },
    { role: 'Call Center Agent', count: 3, scope: 'branch' },
    { role: 'Accountant', count: 2, scope: 'garage' },
    { role: 'Marketing Manager', count: 2, scope: 'garage' },
    { role: 'Finance Manager', count: 2, scope: 'garage' },
    { role: 'HR Manager', count: 2, scope: 'garage' },
    { role: 'Receptionist', count: 2, scope: 'branch' },
    { role: 'Quality Control Inspector', count: 2, scope: 'branch' },
    { role: 'Customer Service Representative', count: 3, scope: 'branch' },
    { role: 'Warehouse Manager', count: 2, scope: 'garage' },
    { role: 'Business Analyst', count: 1, scope: 'garage' },
    { role: 'General Manager', count: 2, scope: 'garage' },
    { role: 'Business Owner', count: 2, scope: 'garage' },
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  let totalCreated = 0;

  for (const staffDef of staffRoles) {
    const role = roleMap.get(staffDef.role);
    if (!role) {
      console.warn(`⚠️  Role "${staffDef.role}" not found, skipping...`);
      continue;
    }

    console.log(`\n📋 Creating ${staffDef.count} ${staffDef.role}(s)...`);

    for (let i = 0; i < staffDef.count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@salisauto.com`;
      
      // Select garage (alternate between garages)
      const garage = allGarages[i % allGarages.length];
      
      // Select branch for this garage
      const garageBranches = allBranches.filter(b => b.garageId === garage.id);
      const branch = garageBranches[i % garageBranches.length];

      try {
        // Check if user already exists
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        let user;
        if (existing.length > 0) {
          user = existing[0];
          console.log(`  ⏭️  ${fullName} (${email}) - already exists`);
        } else {
          const inserted = await db.insert(users).values({
            fullName,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            garageId: garage.id,
            userType: 'staff',
            isActive: true,
            phone: faker.phone.number(),
          }).returning();
          user = inserted[0];
          console.log(`  ✅ ${fullName} (${email})`);
        }

        // Assign role
        const existingRole = await db
          .select()
          .from(userRoleBranch)
          .where(eq(userRoleBranch.userId, user.id))
          .limit(1);

        if (existingRole.length === 0) {
          await db.insert(userRoleBranch).values({
            userId: user.id,
            roleId: role.id,
            branchId: branch.id,
            isPrimaryRole: true,
          });
        }
        
        totalCreated++;
      } catch (error) {
        console.error(`  ❌ Error creating ${fullName}:`, error);
      }
    }
  }

  console.log(`\n✅ Total staff users created/assigned: ${totalCreated}\n`);

  // Show summary
  const summary = await db.execute(`
    SELECT r.name as role_name, r.scope, COUNT(DISTINCT urb.user_id) as user_count
    FROM roles r
    LEFT JOIN user_role_branch urb ON r.id = urb.role_id
    WHERE r.name != 'Super Admin'
    GROUP BY r.id, r.name, r.scope
    HAVING COUNT(DISTINCT urb.user_id) > 0
    ORDER BY user_count DESC, r.name
  `);

  console.log('📊 User Distribution by Role:');
  console.log('─'.repeat(60));
  for (const row of summary.rows) {
    console.log(`  ${String(row.role_name).padEnd(35)} ${String(row.user_count).padStart(3)} users  (${row.scope})`);
  }
  console.log('─'.repeat(60));
}

createStaffUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
