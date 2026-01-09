import { db } from "../db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";
import { USER_ROLES } from "@shared/rbac";

const DEFAULT_PASSWORD = "Password123!";

interface SeedUser {
  email: string;
  fullName: string;
  role: string;
  department?: string;
  subscriptionPlan?: string;
}

const SEED_USERS: SeedUser[] = [
  { email: "admin@salisauto.com", fullName: "System Administrator", role: USER_ROLES.SYSTEM_ADMINISTRATOR, subscriptionPlan: "enterprise" },
  { email: "owner@salisauto.com", fullName: "Khalid Al-Rashid", role: USER_ROLES.BUSINESS_OWNER, subscriptionPlan: "enterprise" },
  
  { email: "gm@salisauto.com", fullName: "Mohammed Al-Fayez", role: USER_ROLES.GENERAL_MANAGER, department: "Management" },
  { email: "service.manager@salisauto.com", fullName: "Ahmed Hassan", role: USER_ROLES.SERVICE_MANAGER, department: "Service" },
  { email: "service.manager2@salisauto.com", fullName: "Youssef Al-Qahtani", role: USER_ROLES.SERVICE_MANAGER, department: "Service" },
  
  { email: "advisor1@salisauto.com", fullName: "Omar Al-Zahrani", role: USER_ROLES.SERVICE_ADVISOR, department: "Service" },
  { email: "advisor2@salisauto.com", fullName: "Sami Al-Otaibi", role: USER_ROLES.SERVICE_ADVISOR, department: "Service" },
  { email: "advisor3@salisauto.com", fullName: "Tariq Al-Ghamdi", role: USER_ROLES.SERVICE_ADVISOR, department: "Service" },
  { email: "advisor4@salisauto.com", fullName: "Faisal Al-Harbi", role: USER_ROLES.SERVICE_ADVISOR, department: "Service" },
  
  { email: "parts.manager@salisauto.com", fullName: "Saleh Al-Dossari", role: USER_ROLES.PARTS_MANAGER, department: "Inventory" },
  
  { email: "lead.tech@salisauto.com", fullName: "Ahmed Al-Rashid", role: USER_ROLES.LEAD_TECHNICIAN, department: "Workshop" },
  { email: "lead.tech2@salisauto.com", fullName: "Khaled Al-Mutairi", role: USER_ROLES.LEAD_TECHNICIAN, department: "Workshop" },
  
  { email: "tech1@salisauto.com", fullName: "Mohammed Hassan", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech2@salisauto.com", fullName: "Khalid Al-Saeed", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech3@salisauto.com", fullName: "Youssef Al-Fayez", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech4@salisauto.com", fullName: "Omar Al-Zahrani", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech5@salisauto.com", fullName: "Saad Al-Shehri", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech6@salisauto.com", fullName: "Bandar Al-Qahtani", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech7@salisauto.com", fullName: "Nawaf Al-Anazi", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech8@salisauto.com", fullName: "Fahad Al-Subaie", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech9@salisauto.com", fullName: "Sultan Al-Otaibi", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech10@salisauto.com", fullName: "Turki Al-Ghamdi", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  
  { email: "finance@salisauto.com", fullName: "Ibrahim Al-Dosari", role: USER_ROLES.FINANCE_MANAGER, department: "Finance" },
  { email: "accountant1@salisauto.com", fullName: "Rashed Al-Tamimi", role: USER_ROLES.ACCOUNTANT, department: "Finance" },
  { email: "accountant2@salisauto.com", fullName: "Majed Al-Harbi", role: USER_ROLES.ACCOUNTANT, department: "Finance" },
  { email: "accountant3@salisauto.com", fullName: "Nasser Al-Shammari", role: USER_ROLES.ACCOUNTANT, department: "Finance" },
  
  { email: "hr@salisauto.com", fullName: "Salma Al-Rashid", role: USER_ROLES.HR_MANAGER, department: "HR" },
  
  { email: "marketing@salisauto.com", fullName: "Noura Al-Fayez", role: USER_ROLES.MARKETING_MANAGER, department: "Marketing" },
  
  { email: "csr1@salisauto.com", fullName: "Fatima Al-Hassan", role: USER_ROLES.CUSTOMER_SERVICE_REP, department: "Customer Service" },
  { email: "csr2@salisauto.com", fullName: "Amal Al-Zahrani", role: USER_ROLES.CUSTOMER_SERVICE_REP, department: "Customer Service" },
  { email: "csr3@salisauto.com", fullName: "Huda Al-Otaibi", role: USER_ROLES.CUSTOMER_SERVICE_REP, department: "Customer Service" },
  
  { email: "reception1@salisauto.com", fullName: "Maha Al-Ghamdi", role: USER_ROLES.RECEPTIONIST, department: "Reception" },
  { email: "reception2@salisauto.com", fullName: "Sara Al-Harbi", role: USER_ROLES.RECEPTIONIST, department: "Reception" },
  
  { email: "callcenter1@salisauto.com", fullName: "Reem Al-Dossari", role: USER_ROLES.CALL_CENTER_AGENT, department: "Call Center" },
  { email: "callcenter2@salisauto.com", fullName: "Layla Al-Mutairi", role: USER_ROLES.CALL_CENTER_AGENT, department: "Call Center" },
  { email: "callcenter3@salisauto.com", fullName: "Noor Al-Saeed", role: USER_ROLES.CALL_CENTER_AGENT, department: "Call Center" },
  
  { email: "bdc1@salisauto.com", fullName: "Dana Al-Anazi", role: USER_ROLES.BDC_SPECIALIST, department: "BDC" },
  { email: "bdc2@salisauto.com", fullName: "Ghada Al-Subaie", role: USER_ROLES.BDC_SPECIALIST, department: "BDC" },
  
  { email: "compliance@salisauto.com", fullName: "Abdullah Al-Qahtani", role: USER_ROLES.COMPLIANCE_OFFICER, department: "Compliance" },
  
  { email: "qc1@salisauto.com", fullName: "Mansour Al-Ghamdi", role: USER_ROLES.QUALITY_CONTROL_INSPECTOR, department: "Quality" },
  { email: "qc2@salisauto.com", fullName: "Waleed Al-Harbi", role: USER_ROLES.QUALITY_CONTROL_INSPECTOR, department: "Quality" },
  
  { email: "inventory1@salisauto.com", fullName: "Hamad Al-Dossari", role: USER_ROLES.INVENTORY_CONTROLLER, department: "Inventory" },
  { email: "inventory2@salisauto.com", fullName: "Mishal Al-Mutairi", role: USER_ROLES.INVENTORY_CONTROLLER, department: "Inventory" },
  
  { email: "fleet@salisauto.com", fullName: "Abdulrahman Al-Saeed", role: USER_ROLES.FLEET_MANAGER, department: "Fleet" },
  
  { email: "purchase1@salisauto.com", fullName: "Fayez Al-Anazi", role: USER_ROLES.PURCHASE_AGENT, department: "Purchasing" },
  { email: "purchase2@salisauto.com", fullName: "Badr Al-Subaie", role: USER_ROLES.PURCHASE_AGENT, department: "Purchasing" },
  { email: "agent@salisauto.com", fullName: "Purchase Agent Demo", role: USER_ROLES.PURCHASE_AGENT, department: "Purchasing" },
  
  { email: "analyst1@salisauto.com", fullName: "Hussain Al-Qahtani", role: USER_ROLES.DATA_ANALYST, department: "Analytics" },
  { email: "analyst2@salisauto.com", fullName: "Yazeed Al-Ghamdi", role: USER_ROLES.DATA_ANALYST, department: "Analytics" },
  
  { email: "ai.specialist@salisauto.com", fullName: "Mohannad Al-Harbi", role: USER_ROLES.AI_AUTOMATION_SPECIALIST, department: "Technology" },
  
  { email: "csm1@salisauto.com", fullName: "Dalal Al-Dossari", role: USER_ROLES.CUSTOMER_SUCCESS_MANAGER, department: "Customer Success" },
  { email: "csm2@salisauto.com", fullName: "Lama Al-Mutairi", role: USER_ROLES.CUSTOMER_SUCCESS_MANAGER, department: "Customer Success" },
  
  { email: "tech@salisauto.com", fullName: "Technician Demo", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "client@salisauto.com", fullName: "Customer Demo", role: USER_ROLES.CUSTOMER },
  { email: "customer1@example.com", fullName: "Ali Al-Rashid", role: USER_ROLES.CUSTOMER },
  { email: "customer2@example.com", fullName: "Samir Hassan", role: USER_ROLES.CUSTOMER },
  { email: "customer3@example.com", fullName: "Nadia Al-Fayez", role: USER_ROLES.CUSTOMER },
  { email: "customer4@example.com", fullName: "Rania Al-Qahtani", role: USER_ROLES.CUSTOMER },
  { email: "customer5@example.com", fullName: "Kareem Al-Zahrani", role: USER_ROLES.CUSTOMER },
  
  { email: "tech11@salisauto.com", fullName: "Abdulaziz Al-Harbi", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "tech12@salisauto.com", fullName: "Hamza Al-Dossari", role: USER_ROLES.TECHNICIAN, department: "Workshop" },
  { email: "advisor5@salisauto.com", fullName: "Nayef Al-Mutairi", role: USER_ROLES.SERVICE_ADVISOR, department: "Service" },
  { email: "advisor6@salisauto.com", fullName: "Rashid Al-Saeed", role: USER_ROLES.SERVICE_ADVISOR, department: "Service" },
  { email: "csr4@salisauto.com", fullName: "Wafa Al-Anazi", role: USER_ROLES.CUSTOMER_SERVICE_REP, department: "Customer Service" },
  { email: "csr5@salisauto.com", fullName: "Asma Al-Subaie", role: USER_ROLES.CUSTOMER_SERVICE_REP, department: "Customer Service" },
  { email: "callcenter4@salisauto.com", fullName: "Hanan Al-Qahtani", role: USER_ROLES.CALL_CENTER_AGENT, department: "Call Center" },
  { email: "callcenter5@salisauto.com", fullName: "Maryam Al-Ghamdi", role: USER_ROLES.CALL_CENTER_AGENT, department: "Call Center" },
  { email: "qc3@salisauto.com", fullName: "Saud Al-Harbi", role: USER_ROLES.QUALITY_CONTROL_INSPECTOR, department: "Quality" },
  { email: "inventory3@salisauto.com", fullName: "Talal Al-Dossari", role: USER_ROLES.INVENTORY_CONTROLLER, department: "Inventory" },
  { email: "purchase3@salisauto.com", fullName: "Mazen Al-Mutairi", role: USER_ROLES.PURCHASE_AGENT, department: "Purchasing" },
  { email: "customer6@example.com", fullName: "Layla Al-Saeed", role: USER_ROLES.CUSTOMER },
  { email: "customer7@example.com", fullName: "Faris Al-Anazi", role: USER_ROLES.CUSTOMER },
  { email: "customer8@example.com", fullName: "Hadeel Al-Subaie", role: USER_ROLES.CUSTOMER },
  { email: "customer9@example.com", fullName: "Yaser Al-Qahtani", role: USER_ROLES.CUSTOMER },
  { email: "customer10@example.com", fullName: "Maha Al-Ghamdi", role: USER_ROLES.CUSTOMER },
];

export async function seedUsers() {
  console.log("🌱 Starting user seed...");
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
  let created = 0;
  let skipped = 0;
  
  for (const seedUser of SEED_USERS) {
    try {
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, seedUser.email),
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await db.insert(users).values({
        email: seedUser.email,
        password: hashedPassword,
        fullName: seedUser.fullName,
        role: seedUser.role,
        subscriptionPlan: seedUser.subscriptionPlan || "starter",
        isActive: true,
      });
      
      created++;
      console.log(`✅ Created user: ${seedUser.email} (${seedUser.role})`);
    } catch (error) {
      console.error(`❌ Failed to create user ${seedUser.email}:`, error);
    }
  }
  
  console.log(`\n🌱 User seed complete: ${created} created, ${skipped} skipped (already exist)`);
  return { created, skipped };
}

export const DEMO_CREDENTIALS = [
  { email: "admin@salisauto.com", password: DEFAULT_PASSWORD, role: "System Administrator" },
  { email: "owner@salisauto.com", password: DEFAULT_PASSWORD, role: "Business Owner" },
  { email: "gm@salisauto.com", password: DEFAULT_PASSWORD, role: "General Manager" },
  { email: "service.manager@salisauto.com", password: DEFAULT_PASSWORD, role: "Service Manager" },
  { email: "tech@salisauto.com", password: DEFAULT_PASSWORD, role: "Technician" },
  { email: "client@salisauto.com", password: DEFAULT_PASSWORD, role: "Customer" },
  { email: "agent@salisauto.com", password: DEFAULT_PASSWORD, role: "Purchase Agent" },
  { email: "finance@salisauto.com", password: DEFAULT_PASSWORD, role: "Finance Manager" },
  { email: "hr@salisauto.com", password: DEFAULT_PASSWORD, role: "HR Manager" },
];
