import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seedUsers() {
  console.log("🌱 Starting User Seeding Process...");

  const usersToCreate = [
    { 
      email: "admin@salisauto.com", 
      password: "admin123", 
      fullName: "System Administrator",
      userType: "admin"
    },
    { 
      email: "tech@salisauto.com", 
      password: "tech123", 
      fullName: "Senior Technician",
      userType: "technician"
    },
    { 
      email: "client@salisauto.com", 
      password: "client123", 
      fullName: "Valued Customer",
      userType: "customer"
    },
    { 
      email: "agent@salisauto.com", 
      password: "agent123", 
      fullName: "Inventory Agent",
      userType: "purchase_agent"
    }
  ];

  for (const u of usersToCreate) {
    try {
      const existingUser = await db.select().from(users).where(eq(users.email, u.email));
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User '${u.email}' already exists. Skipping.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);

      await db.insert(users).values({
        email: u.email,
        password: hashedPassword,
        fullName: u.fullName,
        userType: u.userType,
        isActive: true
      });

      console.log(`✅ Created user: ${u.email} (Type: ${u.userType})`);
    } catch (error) {
      console.error(`❌ Failed to create ${u.email}:`, error);
    }
  }

  console.log("\n🎉 Seeding Complete! You can now login.");
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
