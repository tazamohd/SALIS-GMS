// @ts-nocheck
import { db } from "./db";
import { users, roles, garages, branches, userRoleBranch } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  userType: string;
  roleName: string;
}

const testUsers: TestUser[] = [
  {
    email: "admin@salisauto.com",
    password: "motaz@6646",
    fullName: "Admin User",
    userType: "admin",
    roleName: "Super Admin"
  },
  {
    email: "testuser@salisauto.com",
    password: "1234abcd",
    fullName: "Test User",
    userType: "manager",
    roleName: "Garage Manager"
  },
  {
    email: "manager@salisauto.com",
    password: "Manager123!",
    fullName: "James Wilson",
    userType: "manager",
    roleName: "Garage Manager"
  },
  {
    email: "branchmanager@salisauto.com",
    password: "Branch123!",
    fullName: "Sarah Johnson",
    userType: "branch_manager",
    roleName: "Branch Manager"
  },
  {
    email: "leadtech@salisauto.com",
    password: "Lead123!",
    fullName: "Michael Brown",
    userType: "lead_technician",
    roleName: "Lead Technician"
  },
  {
    email: "technician@salisauto.com",
    password: "Tech123!",
    fullName: "David Martinez",
    userType: "technician",
    roleName: "Technician"
  },
  {
    email: "assistant@salisauto.com",
    password: "Assist123!",
    fullName: "Emily Davis",
    userType: "assistant",
    roleName: "Assistant"
  }
];

export async function seedUsers() {
  try {
    console.log("Starting user seeding...");

    // Get or create a default garage
    let [garage] = await db.select().from(garages).limit(1);
    if (!garage) {
      console.log("Creating default garage...");
      [garage] = await db
        .insert(garages)
        .values({
          name: "SALIS AUTO Main Garage",
          country: "USA",
          city: "New York",
          licenseNumber: "GAR-001",
          isActive: true,
        })
        .returning();
    }

    // Get or create a default branch
    let [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.garageId, garage.id))
      .limit(1);
    
    if (!branch) {
      console.log("Creating default branch...");
      [branch] = await db
        .insert(branches)
        .values({
          garageId: garage.id,
          name: "Main Branch",
          location: "New York, NY",
        })
        .returning();
    }

    // Get all roles
    const allRoles = await db.select().from(roles);
    const roleMap = new Map(allRoles.map(r => [r.name, r]));

    console.log(`\nCreating ${testUsers.length} test users...\n`);

    for (const testUser of testUsers) {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, testUser.email));

      let user;
      if (existingUser) {
        console.log(`Updating existing user: ${testUser.email}`);
        const hashedPassword = await hashPassword(testUser.password);
        [user] = await db
          .update(users)
          .set({
            password: hashedPassword,
            fullName: testUser.fullName,
            userType: testUser.userType,
            garageId: garage.id,
            isActive: true,
          })
          .where(eq(users.id, existingUser.id))
          .returning();
      } else {
        console.log(`Creating new user: ${testUser.email}`);
        const hashedPassword = await hashPassword(testUser.password);
        [user] = await db
          .insert(users)
          .values({
            email: testUser.email,
            password: hashedPassword,
            fullName: testUser.fullName,
            userType: testUser.userType,
            garageId: garage.id,
            isActive: true,
          })
          .returning();
      }

      // Assign role
      const role = roleMap.get(testUser.roleName);
      if (role) {
        // Delete existing role assignments
        await db
          .delete(userRoleBranch)
          .where(eq(userRoleBranch.userId, user.id));

        // Assign new role
        await db.insert(userRoleBranch).values({
          userId: user.id,
          roleId: role.id,
          branchId: branch.id,
          isPrimaryRole: true,
        });
        console.log(`  ✓ Assigned role: ${testUser.roleName}`);
      }
    }

    console.log("\n✅ User seeding completed successfully!\n");
    console.log("User credentials have been created. Check user_credentials.csv for details.\n");
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Run the seeding
seedUsers()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
