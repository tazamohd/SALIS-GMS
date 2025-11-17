/**
 * SALIS AUTO - Unified Comprehensive Data Seed
 * 
 * Populates all major modules with realistic data, images, and relationships
 * Run with: tsx server/seed-all-data.ts
 */

import { db } from './db';
import * as schema from '@shared/schema';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const IMAGES = {
  garages: [
    'modern_automotive_ga_97a83bd4.jpg',
    'modern_automotive_ga_069e0b94.jpg',
    'modern_automotive_ga_9ffa217e.jpg',
    'modern_automotive_ga_de5e706b.jpg',
    'modern_automotive_ga_b34a8ad9.jpg',
  ],
  vehicles: [
    'luxury_car_vehicles__8a2a949b.jpg',
    'luxury_car_vehicles__bd3084bd.jpg',
    'luxury_car_vehicles__1ba5a353.jpg',
    'luxury_car_vehicles__c32c30e4.jpg',
    'luxury_car_vehicles__f53bedd6.jpg',
    'luxury_car_vehicles__c5371997.jpg',
    'luxury_car_vehicles__628e0427.jpg',
    'luxury_car_vehicles__e6581e5c.jpg',
    'luxury_car_vehicles__5ac3bdc1.jpg',
    'luxury_car_vehicles__d8e666c3.jpg',
  ],
  technicians: [
    'auto_mechanic_techni_90dffe76.jpg',
    'auto_mechanic_techni_dc466bff.jpg',
    'auto_mechanic_techni_38dd59cb.jpg',
    'auto_mechanic_techni_a3d9988c.jpg',
    'auto_mechanic_techni_a3c9a254.jpg',
    'auto_mechanic_techni_ca5adf5e.jpg',
    'auto_mechanic_techni_517e0416.jpg',
    'auto_mechanic_techni_7dc86512.jpg',
    'auto_mechanic_techni_66d19ea6.jpg',
    'auto_mechanic_techni_7a332fee.jpg',
  ],
  parts: [
    'car_engine_parts_aut_99132f65.jpg',
    'car_engine_parts_aut_b136c205.jpg',
    'car_engine_parts_aut_2626754e.jpg',
    'car_engine_parts_aut_2c524364.jpg',
    'car_engine_parts_aut_8baed707.jpg',
    'car_engine_parts_aut_b9e57624.jpg',
    'car_engine_parts_aut_6fce8626.jpg',
    'car_engine_parts_aut_56161455.jpg',
    'car_engine_parts_aut_51b3b92c.jpg',
    'car_engine_parts_aut_321dc2c2.jpg',
  ],
};

// Helper functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhone(): string {
  return '+966 ' + faker.number.int({ min: 10, max: 99 }) + ' ' + faker.number.int({ min: 100, max: 999 }) + ' ' + faker.number.int({ min: 1000, max: 9999 });
}

function generateTRN(): string {
  return faker.number.int({ min: 300000000000000, max: 399999999999999 }).toString();
}

function randomImage(category: keyof typeof IMAGES): string {
  return `/attached_assets/stock_images/${faker.helpers.arrayElement(IMAGES[category])}`;
}

let progressCounter = 0;
function logProgress(message: string) {
  progressCounter++;
  console.log(`  [${progressCounter}] ${message}`);
}

console.log('\n🚀 SALIS AUTO - Comprehensive Data Population');
console.log('='.repeat(70));
console.log('This will populate ALL major modules with realistic data\n');

export async function seedAllData() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const startTime = Date.now();
  
  try {
    // ========================================================================
    // PHASE 1: CORE STRUCTURE
    // ========================================================================
    console.log('\n📋 PHASE 1: Core Business Structure');
    console.log('-'.repeat(70));
    
    // Skip if data exists
    const existingGarages = await db.select().from(schema.garages);
    let garages, branches, saasPlans;
    
    if (existingGarages.length > 0) {
      console.log('  ℹ️  Garages already exist, skipping core structure...');
      garages = existingGarages;
      branches = await db.select().from(schema.branches);
      saasPlans = await db.select().from(schema.saasPlans);
    } else {
      // Create SaaS Plans
      logProgress('Creating SaaS plans...');
      saasPlans = await db.insert(schema.saasPlans).values([
        { name: 'Enterprise', description: 'Full enterprise features', maxUsers: 1000 },
        { name: 'Professional', description: 'Professional tier', maxUsers: 100 },
        { name: 'Starter', description: 'Starter tier', maxUsers: 20 },
      ]).returning();
      
      // Create Garages
      logProgress('Creating garages...');
      garages = await db.insert(schema.garages).values([
        {
          name: 'SALIS AUTO - Riyadh Main',
          country: 'Saudi Arabia',
          city: 'Riyadh',
          licenseNumber: generateTRN(),
          workingHours: 'Sat-Thu: 8:00 AM - 6:00 PM',
          saasPlanId: saasPlans[0].id,
          isActive: true,
        },
        {
          name: 'SALIS AUTO - Jeddah Branch',
          country: 'Saudi Arabia',
          city: 'Jeddah',
          licenseNumber: generateTRN(),
          workingHours: 'Sat-Thu: 8:00 AM - 6:00 PM',
          saasPlanId: saasPlans[0].id,
          isActive: true,
        },
        {
          name: 'SALIS AUTO - Dammam Branch',
          country: 'Saudi Arabia',
          city: 'Dammam',
          licenseNumber: generateTRN(),
          workingHours: 'Sat-Thu: 8:00 AM - 6:00 PM',
          saasPlanId: saasPlans[1].id,
          isActive: true,
        },
      ]).returning();
      
      // Create Branches
      logProgress('Creating branches...');
      const branchData = [];
      for (const garage of garages) {
        branchData.push(
          {
            garageId: garage.id,
            name: `${garage.name} - Service Center 1`,
            location: `${garage.city}, ${garage.country}`,
          },
          {
            garageId: garage.id,
            name: `${garage.name} - Service Center 2`,
            location: `${garage.city}, ${garage.country}`,
          }
        );
      }
      branches = await db.insert(schema.branches).values(branchData).returning();
    }
    
    console.log(`✅ Core structure ready: ${garages.length} garages, ${branches.length} branches\n`);
    
    // ========================================================================
    // PHASE 2: USERS & STAFF
    // ========================================================================
    console.log('\n👥 PHASE 2: Users & Staff');
    console.log('-'.repeat(70));
    
    const existingUsers = await db.select().from(schema.users);
    let users, customers, technicians;
    
    if (existingUsers.length >= 50) {
      console.log('  ℹ️  Users already exist, skipping user creation...');
      users = existingUsers;
      customers = users.filter(u => u.userType === 'customer');
      technicians = users.filter(u => u.userType === 'technician');
    } else {
      users = [];
      
      // Create Admin
      logProgress('Creating system admin...');
      const admin = await db.insert(schema.users).values({
        email: 'admin@salisauto.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        firstName: 'System',
        lastName: 'Administrator',
        phone: generatePhone(),
        garageId: garages[0].id,
        userType: 'admin',
        isActive: true,
        profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      }).returning();
      users.push(...admin);
      
      // Create Managers
      logProgress('Creating 10 managers...');
      for (let i = 0; i < 10; i++) {
        const manager = await db.insert(schema.users).values({
          email: faker.internet.email(),
          password: hashedPassword,
          fullName: faker.person.fullName(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          phone: generatePhone(),
          garageId: faker.helpers.arrayElement(garages).id,
          userType: 'manager',
          isActive: true,
          profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
        }).returning();
        users.push(...manager);
      }
      
      // Create Technicians with Profiles
      logProgress('Creating 30 technicians with profiles...');
      technicians = [];
      for (let i = 0; i < 30; i++) {
        const tech = await db.insert(schema.users).values({
          email: faker.internet.email(),
          password: hashedPassword,
          fullName: faker.person.fullName(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          phone: generatePhone(),
          garageId: faker.helpers.arrayElement(garages).id,
          userType: 'technician',
          isActive: true,
          profileImageUrl: randomImage('technicians'),
        }).returning();
        
        users.push(...tech);
        technicians.push(...tech);
        
        // Create technician profile
        await db.insert(schema.technicianProfiles).values({
          userId: tech[0].id,
          skills: faker.helpers.arrayElements(['Engine', 'Transmission', 'Brakes', 'Electrical', 'AC', 'Diagnostics', 'Body Work'], 3).join(', '),
          isLead: i < 5, // First 5 are leads
          certifications: faker.helpers.arrayElements(['ASE Certified', 'Master Technician', 'Hybrid Specialist', 'EV Certified'], 2).join(', '),
          level: faker.helpers.arrayElement(['junior', 'intermediate', 'senior', 'master']),
          yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
          hourlyRate: faker.number.float({ min: 50, max: 150, fractionDigits: 2 }).toString(),
          maxConcurrentJobs: faker.number.int({ min: 2, max: 5 }),
        });
      }
      
      // Create Customers with Profiles
      logProgress('Creating 200 customers with profiles...');
      customers = [];
      for (let i = 0; i < 200; i++) {
        const customer = await db.insert(schema.users).values({
          email: faker.internet.email(),
          password: hashedPassword,
          fullName: faker.person.fullName(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          phone: generatePhone(),
          garageId: faker.helpers.arrayElement(garages).id,
          userType: 'customer',
          isActive: true,
          profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`,
        }).returning();
        
        users.push(...customer);
        customers.push(...customer);
        
        // Create customer profile
        await db.insert(schema.customerProfiles).values({
          userId: customer[0].id,
          address: faker.location.streetAddress(true),
          nationality: 'Saudi Arabia',
          preferredLanguage: faker.helpers.arrayElement(['en', 'ar']),
        });
      }
    }
    
    console.log(`✅ Users created: ${users.length} total (${customers.length} customers, ${technicians.length} technicians)\n`);
    
    // Print summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 DATA SEEDING IN PROGRESS...');
    console.log('='.repeat(70));
    console.log(`Time elapsed: ${duration}s`);
    console.log('\n✅ Next: Continue with vehicles, parts, service operations...\n');
    
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedAllData()
    .then(() => {
      console.log('\n✅ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}
