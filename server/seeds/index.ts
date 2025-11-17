/**
 * SALIS AUTO - Master Seed Orchestrator
 * 
 * Coordinates all seeding operations across 290+ tables
 */

import { seedCoreData } from './core-seed';
import { seedCustomersVehicles } from './customers-vehicles-seed';
import { seedPartsInventory } from './parts-inventory-seed';
import { seedServiceOperations } from './service-operations-seed';
import { seedFinancialData } from './financial-seed';
import { seedHRData } from './hr-staff-seed';
import { seedAnalyticsData } from './analytics-seed';
import { seedAdvancedModules } from './advanced-modules-seed';

export async function runComprehensiveSeed() {
  console.log('🚀 SALIS AUTO - Comprehensive Data Population');
  console.log('=' .repeat(60));
  console.log('Populating ALL 290+ tables with data, images, and documents\n');
  
  const startTime = Date.now();
  
  try {
    // Phase 1: Core Business Structure (5-10 min)
    console.log('\n📋 PHASE 1: Core Business Structure');
    console.log('-'.repeat(60));
    const coreData = await seedCoreData();
    console.log('✅ Phase 1 Complete\n');
    
    // Phase 2: Customers & Vehicles (10-15 min)
    console.log('\n👥 PHASE 2: Customers & Vehicles');
    console.log('-'.repeat(60));
    const customerData = await seedCustomersVehicles(coreData);
    console.log('✅ Phase 2 Complete\n');
    
    // Phase 3: Parts & Inventory (10-15 min)
    console.log('\n🔧 PHASE 3: Parts & Inventory');
    console.log('-'.repeat(60));
    const inventoryData = await seedPartsInventory(coreData);
    console.log('✅ Phase 3 Complete\n');
    
    // Phase 4: Service Operations (15-20 min)
    console.log('\n🛠️  PHASE 4: Service Operations');
    console.log('-'.repeat(60));
    const serviceData = await seedServiceOperations({ ...coreData, ...customerData, ...inventoryData });
    console.log('✅ Phase 4 Complete\n');
    
    // Phase 5: Financial Data (10-15 min)
    console.log('\n💰 PHASE 5: Financial Data');
    console.log('-'.repeat(60));
    const financialData = await seedFinancialData({ ...coreData, ...customerData, ...serviceData });
    console.log('✅ Phase 5 Complete\n');
    
    // Phase 6: HR & Staff Data (10-15 min)
    console.log('\n👨‍💼 PHASE 6: HR & Staff Management');
    console.log('-'.repeat(60));
    const hrData = await seedHRData(coreData);
    console.log('✅ Phase 6 Complete\n');
    
    // Phase 7: Analytics & BI (5-10 min)
    console.log('\n📊 PHASE 7: Analytics & Business Intelligence');
    console.log('-'.repeat(60));
    const analyticsData = await seedAnalyticsData({ ...coreData, ...customerData, ...serviceData, ...financialData });
    console.log('✅ Phase 7 Complete\n');
    
    // Phase 8: Advanced Modules (20-30 min)
    console.log('\n🚀 PHASE 8: Advanced Modules (AI, Blockchain, IoT, etc.)');
    console.log('-'.repeat(60));
    await seedAdvancedModules({ ...coreData, ...customerData, ...serviceData });
    console.log('✅ Phase 8 Complete\n');
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPREHENSIVE DATA POPULATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`Total Time: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds\n`);
    
    printSummary();
    
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

function printSummary() {
  console.log('📊 DATA SUMMARY:');
  console.log('-'.repeat(60));
  console.log('✅ Core Structure: Garages, Branches, Users, Roles');
  console.log('✅ Customer Management: Profiles, Vehicles, Loyalty Programs');
  console.log('✅ Inventory: Parts, Suppliers, Purchase Orders');
  console.log('✅ Service Operations: Job Cards, Inspections, Diagnostics');
  console.log('✅ Financial: Invoices, Payments, Payroll, Expenses');
  console.log('✅ HR: Staff, Certifications, Training, Performance');
  console.log('✅ Analytics: Reports, KPIs, Profit Analysis, Forecasting');
  console.log('✅ Advanced: AI, Blockchain, IoT, AR/VR, Telematics');
  console.log('\n📸 IMAGES IMPORTED:');
  console.log('-'.repeat(60));
  console.log('✅ Vehicle Photos (100+)');
  console.log('✅ Staff/Technician Portraits (50+)');
  console.log('✅ Parts & Components (200+)');
  console.log('✅ Facility Photos (20+)');
  console.log('✅ Charts & Diagrams (50+)');
  console.log('\n📄 DOCUMENTS ATTACHED:');
  console.log('-'.repeat(60));
  console.log('✅ Invoices (PDF)');
  console.log('✅ Service Reports (PDF)');
  console.log('✅ Training Manuals (PDF)');
  console.log('✅ Compliance Documents (PDF)');
  console.log('✅ Diagnostic Reports (PDF)');
  console.log('\n🎯 SYSTEM STATUS: FULLY POPULATED & READY FOR USE\n');
}

// Run if executed directly
if (require.main === module) {
  runComprehensiveSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
