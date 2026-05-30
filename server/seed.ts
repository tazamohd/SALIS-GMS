import { db } from './db';
import {
  garages, branches, users, customerProfiles, technicianProfiles,
  vehicles, jobCards, appointments, spareParts, sparePartInventories,
  invoices, payments, estimates, serviceReminders, maintenanceSchedules,
  vehicleServiceHistory, purchaseOrders, taskAssignments, commissionRules,
  commissions, employeeAttendance, shiftTemplates, shiftAssignments,
  performanceReviews, trainings, employeeTrainings, stockAlerts,
  paymentPlans, installments, taxConfigurations, discountsPromotions,
  savedFilterPresets, notifications, roles, featureFlags,
  hrLeaveRequestEntries,
  qcInspections, qcDefects,
  documentLibraryItems,
  currencyTransactions,
  fleetAccounts as fleetAccountsTable,
  fleetAccountVehicles,
  fleetMaintenanceEntries,
} from '@shared/schema';
import { sql, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// ── Feature flag definitions ───────────────────────────────────────
const CORE_FLAGS = [
  'job_cards', 'customers', 'vehicles', 'invoices', 'estimates',
  'appointments', 'inventory', 'payments', 'reports', 'fleet',
  'technicians', 'settings',
];
const EXPERIMENTAL_FLAGS = [
  'ai_features', 'iot_dashboard', 'blockchain', 'ar_vr',
  'advanced_finance', 'hr_module', 'call_center', 'marketing',
  'emerging_tech', 'digital_twin', 'franchise', 'supplier_portal',
];

// ── System roles ───────────────────────────────────────────────────
const SYSTEM_ROLES = [
  { name: 'admin', scope: 'global' },
  { name: 'manager', scope: 'garage' },
  { name: 'technician', scope: 'garage' },
  { name: 'receptionist', scope: 'garage' },
  { name: 'accountant', scope: 'garage' },
  { name: 'customer', scope: 'self' },
];

async function seed() {
  console.log('Starting database seeding...\n');

  try {
    // ── Step 0: Seed system roles ──────────────────────────────────
    for (const role of SYSTEM_ROLES) {
      const existing = await db.select().from(roles).where(eq(roles.name, role.name));
      if (existing.length === 0) {
        await db.insert(roles).values({ name: role.name, scope: role.scope, isSystemRole: true });
        console.log(`  Created role: ${role.name}`);
      }
    }

    // Get or create garage
    const [garage] = await db.select().from(garages).limit(1);
    const garageId = garage?.id || (await db.insert(garages).values({
      name: 'SLIS Garage',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      licenseNumber: 'GAR-2025-001',
      workingHours: '8:00 AM - 6:00 PM',
      isActive: true,
      subscriptionPlan: 'PROFESSIONAL',
    }).returning())[0].id;

    // ── Seed feature flags ─────────────────────────────────────────
    const existingFlags = await db.select().from(featureFlags).where(eq(featureFlags.garageId, garageId));
    const existingFlagNames = new Set(existingFlags.map((f: any) => f.flagName));
    const allFlags = [
      ...CORE_FLAGS.map(f => ({ flagName: f, isEnabled: true })),
      ...EXPERIMENTAL_FLAGS.map(f => ({ flagName: f, isEnabled: false })),
    ];
    let flagsCreated = 0;
    for (const flag of allFlags) {
      if (!existingFlagNames.has(flag.flagName)) {
        await db.insert(featureFlags).values({ garageId, flagName: flag.flagName, isEnabled: flag.isEnabled, source: 'seed' });
        flagsCreated++;
      }
    }
    console.log(`  Feature flags: ${flagsCreated} created, ${existingFlagNames.size} already existed`);

    console.log('✅ Garage created/found:', garageId);

    // Get or create branch
    const [branch] = await db.select().from(branches).where(sql`${branches.garageId} = ${garageId}`).limit(1);
    const branchId = branch?.id || (await db.insert(branches).values({
      garageId,
      name: 'Main Branch',
      location: '123 Main St, Los Angeles, CA 90001',
    }).returning())[0].id;

    console.log('✅ Branch created/found:', branchId);

    // Create or find admin user
    const adminEmail = 'admin@slis.sa';
    let [currentUser] = await db.select().from(users).where(eq(users.email, adminEmail));
    if (!currentUser) {
      const hashedPassword = await bcrypt.hash('Admin@2024!', 10);
      [currentUser] = await db.insert(users).values({
        email: adminEmail,
        password: hashedPassword,
        fullName: 'System Administrator',
        userType: 'admin',
        role: 'ADMIN',
        garageId,
        isActive: true,
      }).returning();
      console.log(`  Created admin user: ${adminEmail}`);
    } else {
      console.log(`  Admin user '${adminEmail}' already exists`);
    }
    const userId = currentUser.id;

    console.log('✅ Current user:', userId);

    // Shared placeholder hash for non-login demo users (customers, technicians).
    // The users.password column is NOT NULL but these accounts don't authenticate.
    const demoUserPassword = await bcrypt.hash('Demo@2024!', 10);

    // Create customers
    const customerData = [
      { fullName: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-0101', userType: 'customer' },
      { fullName: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1-555-0102', userType: 'customer' },
      { fullName: 'Michael Chen', email: 'michael.c@example.com', phone: '+1-555-0103', userType: 'customer' },
      { fullName: 'Emily Davis', email: 'emily.d@example.com', phone: '+1-555-0104', userType: 'customer' },
      { fullName: 'David Wilson', email: 'david.w@example.com', phone: '+1-555-0105', userType: 'customer' },
      { fullName: 'Jessica Brown', email: 'jessica.b@example.com', phone: '+1-555-0106', userType: 'customer' },
      { fullName: 'Robert Taylor', email: 'robert.t@example.com', phone: '+1-555-0107', userType: 'customer' },
      { fullName: 'Lisa Anderson', email: 'lisa.a@example.com', phone: '+1-555-0108', userType: 'customer' },
    ];

    const customers = [];
    for (const customer of customerData) {
      const [existing] = await db.select().from(users).where(sql`${users.email} = ${customer.email}`).limit(1);
      if (!existing) {
        const [newCustomer] = await db.insert(users).values({
          ...customer,
          password: demoUserPassword,
          garageId,
          isActive: true,
        }).returning();
        
        await db.insert(customerProfiles).values({
          userId: newCustomer.id,
          address: `${Math.floor(Math.random() * 1000)} ${['Oak', 'Maple', 'Pine', 'Elm'][Math.floor(Math.random() * 4)]} St, Los Angeles, CA`,
          nationality: 'USA',
          preferredLanguage: 'en',
        });
        
        customers.push(newCustomer);
      } else {
        customers.push(existing);
      }
    }

    console.log(`✅ Created ${customers.length} customers`);

    // Create technicians
    const technicianData = [
      { fullName: 'Tom Martinez', email: 'tom.m@autocare.com', phone: '+1-555-0201', userType: 'technician', skills: 'Engine Repair, Diagnostics', level: 'senior', hourlyRate: '75.00' },
      { fullName: 'Alex Rivera', email: 'alex.r@autocare.com', phone: '+1-555-0202', userType: 'technician', skills: 'Electrical Systems, AC Repair', level: 'intermediate', hourlyRate: '55.00' },
      { fullName: 'Maria Garcia', email: 'maria.g@autocare.com', phone: '+1-555-0203', userType: 'technician', skills: 'Brake Systems, Transmission', level: 'senior', hourlyRate: '70.00' },
      { fullName: 'James Kim', email: 'james.k@autocare.com', phone: '+1-555-0204', userType: 'technician', skills: 'Body Work, Paint', level: 'junior', hourlyRate: '45.00' },
    ];

    const technicians = [];
    for (const tech of technicianData) {
      const [existing] = await db.select().from(users).where(sql`${users.email} = ${tech.email}`).limit(1);
      if (!existing) {
        const [newTech] = await db.insert(users).values({
          fullName: tech.fullName,
          email: tech.email,
          phone: tech.phone,
          userType: tech.userType,
          password: demoUserPassword,
          garageId,
          isActive: true,
        }).returning();
        
        await db.insert(technicianProfiles).values({
          userId: newTech.id,
          skills: tech.skills,
          level: tech.level,
          hourlyRate: tech.hourlyRate,
          yearsOfExperience: tech.level === 'senior' ? 10 : tech.level === 'intermediate' ? 5 : 2,
          isLead: tech.level === 'senior',
          maxConcurrentJobs: 3,
        });
        
        technicians.push(newTech);
      } else {
        technicians.push(existing);
      }
    }

    console.log(`✅ Created ${technicians.length} technicians`);

    // Create vehicles for customers
    const vehicleData = [
      { make: 'Toyota', model: 'Camry', year: 2020, licensePlate: 'ABC-1234', color: 'Silver', engineType: 'gasoline', mileage: 45000 },
      { make: 'Honda', model: 'Civic', year: 2019, licensePlate: 'XYZ-5678', color: 'Blue', engineType: 'gasoline', mileage: 52000 },
      { make: 'Tesla', model: 'Model 3', year: 2022, licensePlate: 'EV-9999', color: 'White', engineType: 'electric', mileage: 15000 },
      { make: 'Ford', model: 'F-150', year: 2021, licensePlate: 'TRK-2468', color: 'Black', engineType: 'diesel', mileage: 38000 },
      { make: 'BMW', model: '3 Series', year: 2020, licensePlate: 'BMW-7890', color: 'Gray', engineType: 'gasoline', mileage: 41000 },
      { make: 'Mercedes-Benz', model: 'C-Class', year: 2021, licensePlate: 'MBZ-4567', color: 'Black', engineType: 'gasoline', mileage: 28000 },
      { make: 'Chevrolet', model: 'Silverado', year: 2019, licensePlate: 'CHV-1357', color: 'Red', engineType: 'diesel', mileage: 67000 },
      { make: 'Nissan', model: 'Altima', year: 2020, licensePlate: 'NSN-2468', color: 'White', engineType: 'gasoline', mileage: 49000 },
    ];

    const createdVehicles = [];
    for (let i = 0; i < Math.min(vehicleData.length, customers.length); i++) {
      const [vehicle] = await db.insert(vehicles).values({
        ...vehicleData[i],
        customerId: customers[i].id,
        garageId,
        vin: `VIN${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
        transmissionType: Math.random() > 0.5 ? 'automatic' : 'manual',
        isActive: true,
      }).returning();
      createdVehicles.push(vehicle);
    }

    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    // Create spare parts
    const partsData = [
      { name: 'Engine Oil 5W-30', category: 'fluids', sku: 'OIL-5W30-001', barcode: '123456789001', brand: 'Mobil 1', unitOfMeasure: 'liters' },
      { name: 'Brake Pads Front', category: 'brakes', sku: 'BRK-PAD-F001', barcode: '123456789002', brand: 'Brembo', unitOfMeasure: 'pcs' },
      { name: 'Air Filter', category: 'filters', sku: 'FLT-AIR-001', barcode: '123456789003', brand: 'K&N', unitOfMeasure: 'pcs' },
      { name: 'Spark Plugs', category: 'engine', sku: 'SPK-PLG-001', barcode: '123456789004', brand: 'NGK', unitOfMeasure: 'pcs' },
      { name: 'Battery 12V', category: 'electrical', sku: 'BAT-12V-001', barcode: '123456789005', brand: 'DieHard', unitOfMeasure: 'pcs' },
      { name: 'Transmission Fluid', category: 'fluids', sku: 'TRN-FLD-001', barcode: '123456789006', brand: 'Valvoline', unitOfMeasure: 'liters' },
      { name: 'Brake Rotors Front', category: 'brakes', sku: 'BRK-ROT-F001', barcode: '123456789007', brand: 'Brembo', unitOfMeasure: 'pcs' },
      { name: 'Cabin Air Filter', category: 'filters', sku: 'FLT-CAB-001', barcode: '123456789008', brand: 'Fram', unitOfMeasure: 'pcs' },
      { name: 'Coolant', category: 'fluids', sku: 'CLT-001', barcode: '123456789009', brand: 'Prestone', unitOfMeasure: 'liters' },
      { name: 'Wiper Blades', category: 'accessories', sku: 'WPR-BLD-001', barcode: '123456789010', brand: 'Bosch', unitOfMeasure: 'pcs' },
    ];

    const createdParts = [];
    for (const part of partsData) {
      const [existing] = await db.select().from(spareParts).where(sql`${spareParts.sku} = ${part.sku}`).limit(1);
      if (!existing) {
        const [newPart] = await db.insert(spareParts).values({
          ...part,
          description: `High-quality ${part.name} for various vehicle models`,
          partType: 'generic',
          createdBy: userId,
          isActive: true,
        }).returning();
        
        // Create inventory for the part
        await db.insert(sparePartInventories).values({
          sparePartId: newPart.id,
          garageId,
          branchId,
          stockQuantity: Math.floor(Math.random() * 50) + 10,
          minThreshold: 5,
          purchasePrice: (Math.random() * 50 + 10).toFixed(2),
          sellingPrice: (Math.random() * 80 + 20).toFixed(2),
          costPrice: (Math.random() * 45 + 8).toFixed(2),
          currency: 'USD',
          location: `Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 20) + 1}`,
          isEnabled: true,
        });
        
        createdParts.push(newPart);
      } else {
        createdParts.push(existing);
      }
    }

    console.log(`✅ Created ${createdParts.length} spare parts with inventory`);

    // Create job cards
    const serviceTypes = ['maintenance', 'repair', 'diagnostic', 'inspection'];
    const statuses = ['pending', 'assigned', 'in_progress', 'completed'];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    const createdJobCards = [];
    const timestamp = Date.now();
    for (let i = 0; i < 15; i++) {
      const vehicle = createdVehicles[i % createdVehicles.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const [jobCard] = await db.insert(jobCards).values({
        jobNumber: `JOB-${timestamp}-${String(i).padStart(4, '0')}`,
        garageId,
        branchId,
        customerId: vehicle.customerId,
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vin: vehicle.vin,
        },
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        description: `${['Oil change', 'Brake repair', 'Engine diagnostic', 'Transmission service', 'AC repair'][i % 5]} for ${vehicle.make} ${vehicle.model}`,
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        estimatedHours: (Math.random() * 4 + 1).toFixed(2),
        actualHours: status === 'completed' ? (Math.random() * 4 + 1).toFixed(2) : null,
        totalCost: (Math.random() * 800 + 200).toFixed(2),
        createdBy: userId,
        assignedTo: technicians[i % technicians.length].id,
        scheduledDate: new Date(Date.now() + (i - 7) * 24 * 60 * 60 * 1000),
        startedAt: status !== 'pending' ? new Date(Date.now() + (i - 7) * 24 * 60 * 60 * 1000) : null,
        completedAt: status === 'completed' ? new Date(Date.now() + (i - 6) * 24 * 60 * 60 * 1000) : null,
        notes: `Customer reported ${['unusual noise', 'warning light', 'poor performance', 'scheduled maintenance'][i % 4]}`,
      }).returning();
      createdJobCards.push(jobCard);
    }

    console.log(`✅ Created ${createdJobCards.length} job cards`);

    // Create appointments
    const appointmentStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    for (let i = 0; i < 20; i++) {
      const vehicle = createdVehicles[i % createdVehicles.length];
      const customer = customers.find(c => c.id === vehicle.customerId);
      const appointmentDate = new Date(Date.now() + (i - 10) * 24 * 60 * 60 * 1000);
      appointmentDate.setHours(9 + (i % 8), 0, 0, 0);
      
      await db.insert(appointments).values({
        appointmentNumber: `APT-${timestamp}-${String(i).padStart(4, '0')}`,
        garageId,
        branchId,
        customerId: vehicle.customerId,
        customerName: customer?.fullName || 'Unknown Customer',
        customerPhone: customer?.phone || '+1-555-0000',
        customerEmail: customer?.email || null,
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
        },
        serviceType: ['maintenance', 'repair', 'diagnostic', 'inspection'][i % 4],
        description: `Appointment for ${['routine maintenance', 'brake inspection', 'engine diagnostic', 'general inspection'][i % 4]}`,
        appointmentDate,
        duration: 60 + (i % 3) * 30,
        status: appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)],
        assignedTo: technicians[i % technicians.length].id,
        createdBy: userId,
        reminderSent: Math.random() > 0.5,
        notes: i % 3 === 0 ? 'Customer prefers morning appointments' : null,
      });
    }

    console.log('✅ Created 20 appointments');

    // Create invoices
    const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue'];
    const createdInvoices = [];
    for (let i = 0; i < 12; i++) {
      const jobCard = createdJobCards[i];
      const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
      const subtotal = parseFloat(jobCard.totalCost || '500');
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      
      const [invoice] = await db.insert(invoices).values({
        invoiceNumber: `INV-${timestamp}-${String(i).padStart(4, '0')}`,
        garageId,
        customerId: jobCard.customerId,
        jobCardId: jobCard.id,
        status,
        subtotal: subtotal.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: total.toFixed(2),
        paidAmount: status === 'paid' ? total.toFixed(2) : '0.00',
        balanceAmount: status === 'paid' ? '0.00' : total.toFixed(2),
        issueDate: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + (i - 2) * 24 * 60 * 60 * 1000),
        paidDate: status === 'paid' ? new Date() : null,
        paymentMethod: status === 'paid' ? ['card', 'cash', 'bank_transfer'][i % 3] : null,
        notes: i % 2 === 0 ? '10% discount applied for loyal customer' : null,
        createdBy: userId,
      }).returning();
      createdInvoices.push(invoice);
      
      // Create payment if invoice is paid
      if (status === 'paid') {
        await db.insert(payments).values({
          invoiceId: invoice.id,
          paymentDate: new Date(),
          amount: total.toFixed(2),
          paymentMethod: ['cash', 'card', 'transfer'][i % 3],
          referenceNumber: i % 3 === 0 ? `REF-${Math.random().toString(36).substring(7).toUpperCase()}` : null,
          notes: 'Payment processed successfully',
          createdBy: userId,
        });
      }
    }

    console.log(`✅ Created ${createdInvoices.length} invoices`);

    // Create estimates
    const estimateStatuses = ['draft', 'sent', 'approved', 'rejected', 'expired'];
    for (let i = 0; i < 10; i++) {
      const vehicle = createdVehicles[i % createdVehicles.length];
      const status = estimateStatuses[Math.floor(Math.random() * estimateStatuses.length)];
      const subtotal = Math.random() * 1000 + 300;
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      
      await db.insert(estimates).values({
        estimateNumber: `EST-${timestamp}-${String(i).padStart(4, '0')}`,
        garageId,
        customerId: vehicle.customerId,
        vehicleId: vehicle.id,
        title: `${vehicle.make} ${vehicle.model} - ${['Brake Service', 'Oil Change', 'Transmission Repair', 'Engine Diagnostic'][i % 4]}`,
        description: `Estimated cost for ${['brake pad replacement and rotor resurfacing', 'full synthetic oil change and filter', 'transmission fluid change and inspection', 'comprehensive engine diagnostic'][i % 4]}`,
        status,
        subtotal: subtotal.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: total.toFixed(2),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lineItems: [
          { description: 'Labor', quantity: 2, unitPrice: (subtotal * 0.6).toFixed(2), total: (subtotal * 0.6).toFixed(2) },
          { description: 'Parts', quantity: 1, unitPrice: (subtotal * 0.4).toFixed(2), total: (subtotal * 0.4).toFixed(2) },
        ],
        createdBy: userId,
        approvedAt: status === 'approved' ? new Date() : null,
        approvedBy: status === 'approved' ? vehicle.customerId : null,
        notes: i % 2 === 0 ? 'Price includes warranty on parts' : null,
      });
    }

    console.log('✅ Created 10 estimates');

    // Create maintenance schedules for vehicles
    for (let i = 0; i < Math.min(5, createdVehicles.length); i++) {
      const vehicle = createdVehicles[i];
      await db.insert(maintenanceSchedules).values({
        vehicleId: vehicle.id,
        serviceName: 'Oil Change',
        description: 'Regular oil and filter change',
        intervalType: 'mileage',
        intervalMileage: 5000,
        lastServiceMileage: vehicle.mileage - 3000,
        nextDueMileage: vehicle.mileage + 2000,
        isActive: true,
      });
      
      await db.insert(maintenanceSchedules).values({
        vehicleId: vehicle.id,
        serviceName: 'Tire Rotation',
        description: 'Rotate tires for even wear',
        intervalType: 'both',
        intervalMileage: 7500,
        intervalMonths: 6,
        lastServiceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastServiceMileage: vehicle.mileage - 5000,
        nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        nextDueMileage: vehicle.mileage + 2500,
        isActive: true,
      });
    }

    console.log('✅ Created maintenance schedules');

    // Create service reminders
    for (let i = 0; i < Math.min(5, createdVehicles.length); i++) {
      const vehicle = createdVehicles[i];
      await db.insert(serviceReminders).values({
        vehicleId: vehicle.id,
        reminderType: 'mileage',
        reminderTitle: 'Upcoming Oil Change',
        reminderMessage: `Your ${vehicle.make} ${vehicle.model} is due for an oil change soon.`,
        triggerMileage: vehicle.mileage + 500,
        advanceMiles: 500,
        status: 'pending',
        isActive: true,
      });
    }

    console.log('✅ Created service reminders');

    // Create commission rules
    const [commissionRule] = await db.insert(commissionRules).values({
      garageId,
      name: 'Standard Technician Commission',
      description: 'Base commission for all completed jobs',
      ruleType: 'percentage',
      basePercentage: '10.00',
      isActive: true,
    }).returning();

    // Create commissions for completed job cards
    for (const jobCard of createdJobCards.filter(j => j.status === 'completed')) {
      const baseAmount = parseFloat(jobCard.totalCost || '0');
      const commissionAmount = baseAmount * 0.10;
      
      await db.insert(commissions).values({
        garageId,
        technicianId: jobCard.assignedTo!,
        jobCardId: jobCard.id,
        commissionRuleId: commissionRule.id,
        baseAmount: baseAmount.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        commissionRate: '10.00',
        period: '2025-01',
        status: 'pending',
      });
    }

    console.log('✅ Created commission rules and commissions');

    // Create tax configurations (Saudi VAT 15%)
    await db.insert(taxConfigurations).values({
      garageId,
      taxName: 'Saudi VAT',
      taxType: 'percentage',
      taxRate: '15.00',
      isDefault: true,
      applicableCategories: ['service', 'parts', 'labor'],
      isActive: true,
      createdBy: userId,
    });

    console.log('✅ Created tax configurations');

    // Create discounts/promotions
    const [existingDiscount] = await db.select().from(discountsPromotions).where(sql`${discountsPromotions.code} = 'SPRING2025'`).limit(1);
    if (!existingDiscount) {
      await db.insert(discountsPromotions).values({
        garageId,
        code: 'SPRING2025',
        name: 'Spring Service Special',
        description: '15% off all services',
        discountType: 'percentage',
        discountValue: '15.00',
        minPurchaseAmount: '100.00',
        applicableCategories: ['service'],
        usageLimit: 100,
        usageCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: userId,
      });
    }

    console.log('✅ Created/found discounts/promotions');

    // Create shift templates
    const [morningShift] = await db.insert(shiftTemplates).values({
      garageId,
      name: 'Morning Shift',
      startTime: '08:00',
      endTime: '16:00',
      breakDuration: 60,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      isActive: true,
    }).returning();

    const [eveningShift] = await db.insert(shiftTemplates).values({
      garageId,
      name: 'Evening Shift',
      startTime: '16:00',
      endTime: '00:00',
      breakDuration: 60,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      isActive: true,
    }).returning();

    console.log('✅ Created shift templates');

    // Create shift assignments for technicians
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() + (i - 3) * 24 * 60 * 60 * 1000);
      for (const tech of technicians.slice(0, 2)) {
        const shift = i % 2 === 0 ? morningShift : eveningShift;
        const startTime = new Date(date);
        const [hours, minutes] = shift.startTime.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const endTime = new Date(date);
        const [endHours, endMinutes] = shift.endTime.split(':');
        endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
        
        await db.insert(shiftAssignments).values({
          garageId,
          employeeId: tech.id,
          shiftTemplateId: shift.id,
          date,
          startTime,
          endTime,
          status: i < 3 ? 'completed' : 'scheduled',
          createdBy: userId,
        });
      }
    }

    console.log('✅ Created shift assignments');

    // Create employee attendance records
    for (let i = 0; i < 5; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      for (const tech of technicians) {
        const clockIn = new Date(date);
        clockIn.setHours(8, Math.floor(Math.random() * 30), 0, 0);
        const clockOut = new Date(date);
        clockOut.setHours(17, Math.floor(Math.random() * 30), 0, 0);
        const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        
        await db.insert(employeeAttendance).values({
          garageId,
          employeeId: tech.id,
          date,
          clockIn,
          clockOut,
          totalHours: totalHours.toFixed(2),
          overtimeHours: totalHours > 8 ? (totalHours - 8).toFixed(2) : '0.00',
          status: 'present',
        });
      }
    }

    console.log('✅ Created employee attendance records');

    // Create notifications
    for (const customer of customers.slice(0, 5)) {
      await db.insert(notifications).values({
        type: 'in-app',
        category: 'appointment',
        status: 'sent',
        recipientId: customer.id,
        garageId,
        title: 'Appointment Reminder',
        message: 'Your vehicle service appointment is tomorrow at 10:00 AM',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
      });
    }

    console.log('✅ Created notifications');

    // Create stock alerts for low inventory
    const lowStockParts = await db.select()
      .from(sparePartInventories)
      .where(sql`${sparePartInventories.stockQuantity} < ${sparePartInventories.minThreshold}`)
      .limit(3);

    for (const inv of lowStockParts) {
      await db.insert(stockAlerts).values({
        sparePartInventoryId: inv.id,
        alertType: 'low_stock',
        currentStock: inv.stockQuantity,
        threshold: inv.minThreshold,
        severity: 'high',
        status: 'active',
      });
    }

    console.log('✅ Created stock alerts');

    // Create task assignments
    const taskStatuses = ['assigned', 'accepted', 'in_progress', 'completed'];
    const taskTypes = ['diagnostic', 'repair', 'assembly', 'disassembly', 'cleaning', 'inspection'];
    const taskPriorities = ['low', 'medium', 'high', 'urgent'];
    const taskNames = [
      'Replace engine oil and filter',
      'Inspect brake system',
      'Test battery and charging system',
      'Rotate tires and check alignment',
      'Check and top up all fluids',
      'Inspect suspension components',
      'Test drive and verify repairs',
      'Clean and organize work area',
      'Order replacement parts',
      'Update customer on progress',
      'Perform diagnostic scan',
      'Replace air filter',
      'Inspect exhaust system',
      'Check tire pressure and condition',
      'Lubricate door hinges and locks'
    ];

    const createdTasks = [];
    for (let i = 0; i < 25; i++) {
      const jobCard = createdJobCards[i % createdJobCards.length];
      const tech = technicians[i % technicians.length];
      const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const dueDate = new Date(Date.now() + (i - 12) * 24 * 60 * 60 * 1000);
      
      const [task] = await db.insert(taskAssignments).values({
        jobCardId: jobCard.id,
        taskName: taskNames[i % taskNames.length],
        taskType,
        description: `Complete ${taskNames[i % taskNames.length].toLowerCase()} for ${jobCard.vehicleInfo.make} ${jobCard.vehicleInfo.model}`,
        assignedTo: tech.id,
        assignedBy: userId,
        userType: 'technician',
        status,
        priority: taskPriorities[Math.floor(Math.random() * taskPriorities.length)],
        estimatedMinutes: Math.floor(Math.random() * 180 + 30),
        actualMinutes: status === 'completed' ? Math.floor(Math.random() * 180 + 30) : null,
        dueDate,
        startedAt: status !== 'assigned' ? new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000) : null,
        completedAt: status === 'completed' ? new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000) : null,
        notes: i % 3 === 0 ? 'Customer waiting - high priority' : null,
      }).returning();
      createdTasks.push(task);
    }

    console.log(`✅ Created ${createdTasks.length} task assignments`);

    // ── Step N: HR leave request entries (demo) ────────────────────
    const existingLeaves = await db.select().from(hrLeaveRequestEntries).limit(1);
    if (existingLeaves.length === 0) {
      await db.insert(hrLeaveRequestEntries).values([
        { employeeId: '1', employeeName: 'Ahmed Al-Rashid', type: 'annual', startDate: '2026-04-01', endDate: '2026-04-05', days: 5, reason: 'Family vacation', status: 'pending' },
        { employeeId: '2', employeeName: 'Khalid Hassan', type: 'sick', startDate: '2026-03-18', endDate: '2026-03-19', days: 2, reason: 'Medical appointment', status: 'approved', approvedBy: 'Manager' },
        { employeeId: '3', employeeName: 'Sara Mohammed', type: 'annual', startDate: '2026-03-25', endDate: '2026-03-28', days: 4, reason: 'Personal leave', status: 'rejected' },
      ]);
      console.log('✅ Seeded 3 HR leave request entries');
    }

    // ── Step N+1: QC inspections + defects (demo) ──────────────────
    const existingQc = await db.select().from(qcInspections).limit(1);
    if (existingQc.length === 0) {
      const now = new Date();
      const ago = (h: number) => new Date(now.getTime() - h * 3600 * 1000);
      const seeded = await db.insert(qcInspections).values([
        { jobCardRef: 'JC-2026-0142', vehicleInfo: '2024 Toyota Camry (ABC-1234)', serviceType: 'Oil Change', inspector: 'Ahmed Al-Rashid', inspectorId: '1', result: 'pass', notes: 'All items verified.', checklistId: 'CL-001', completedItems: 8, totalItems: 8, inspectionTimeMinutes: 12, createdAt: ago(2), updatedAt: ago(2) },
        { jobCardRef: 'JC-2026-0139', vehicleInfo: '2023 Honda Accord (DEF-5678)', serviceType: 'Brake Service', inspector: 'Mohammed Al-Fahad', inspectorId: '2', result: 'fail', notes: 'Brake fluid low; caliper under-torqued.', checklistId: 'CL-002', completedItems: 6, totalItems: 9, inspectionTimeMinutes: 25, createdAt: ago(5), updatedAt: ago(4) },
        { jobCardRef: 'JC-2026-0137', vehicleInfo: '2022 Nissan Patrol (GHI-9012)', serviceType: 'AC Service', inspector: 'Ahmed Al-Rashid', inspectorId: '1', result: 'conditional', notes: 'Cabin filter shows early wear.', checklistId: 'CL-003', completedItems: 6, totalItems: 7, inspectionTimeMinutes: 18, createdAt: ago(24), updatedAt: ago(23) },
        { jobCardRef: 'JC-2026-0144', vehicleInfo: '2024 Lexus ES (STU-5678)', serviceType: 'Oil Change', inspector: 'Khalid Bin Saeed', inspectorId: '3', result: 'pending', notes: '', checklistId: 'CL-001', completedItems: 0, totalItems: 8, inspectionTimeMinutes: 0, createdAt: ago(0.5), updatedAt: ago(0.5) },
      ]).returning();
      const failed = seeded.find((s: any) => s.result === 'fail');
      const passed = seeded.find((s: any) => s.result === 'pass');
      if (failed && passed) {
        await db.insert(qcDefects).values([
          { inspectionId: failed.id, jobCardRef: failed.jobCardRef, description: 'Left front caliper bolt under-torqued', severity: 'high', category: 'Torque Specification', status: 'in_progress', reportedBy: 'Mohammed Al-Fahad' },
          { inspectionId: failed.id, jobCardRef: failed.jobCardRef, description: 'Brake fluid level below MIN line', severity: 'critical', category: 'Fluid Levels', status: 'resolved', resolutionNotes: 'Topped up and bled.', reportedBy: 'Mohammed Al-Fahad', resolvedAt: ago(3) },
          { inspectionId: passed.id, jobCardRef: passed.jobCardRef, description: 'Minor oil residue around drain plug', severity: 'low', category: 'Workmanship', status: 'resolved', resolutionNotes: 'Cleaned.', reportedBy: 'Ahmed Al-Rashid', resolvedAt: ago(1.5) },
        ]);
      }
      console.log('✅ Seeded QC inspections and defects');
    }

    // ── Step N+2: Document library (demo) ──────────────────────────
    const existingDocs = await db.select().from(documentLibraryItems).limit(1);
    if (existingDocs.length === 0) {
      await db.insert(documentLibraryItems).values([
        { name: 'Invoice #2024-0156', type: 'pdf', category: 'invoices', size: 245_760, uploadedBy: 'Ahmed Al-Rashid', tags: ['customer', 'toyota', 'service'], description: 'Service invoice for Toyota Camry brake replacement' },
        { name: 'Supplier Agreement - AutoParts Co', type: 'docx', category: 'contracts', size: 1_048_576, uploadedBy: 'Fatima Hassan', tags: ['supplier', 'agreement', 'parts'], description: 'Annual supply agreement with AutoParts Co for OEM parts' },
        { name: 'Workshop Insurance Policy', type: 'pdf', category: 'insurance', size: 3_145_728, uploadedBy: 'Mohammed Saleh', tags: ['insurance', 'annual', 'workshop'], description: 'Comprehensive workshop insurance policy 2026' },
        { name: 'Vehicle Registration - Fleet #12', type: 'pdf', category: 'vehicle-docs', size: 512_000, uploadedBy: 'Khalid Nasser', tags: ['fleet', 'registration', 'van'], description: 'Registration renewal for fleet service van #12' },
        { name: 'Employee Onboarding - Ali Khan', type: 'pdf', category: 'employee-docs', size: 768_000, uploadedBy: 'HR Department', tags: ['onboarding', 'technician', 'new-hire'], description: 'Complete onboarding package for new technician Ali Khan' },
        { name: 'Environmental Compliance Certificate', type: 'pdf', category: 'compliance', size: 409_600, uploadedBy: 'Mohammed Saleh', tags: ['environment', 'certificate', 'annual'], description: 'Annual environmental compliance certification for waste disposal' },
        { name: 'Invoice #2024-0187', type: 'pdf', category: 'invoices', size: 198_656, uploadedBy: 'Ahmed Al-Rashid', tags: ['customer', 'nissan', 'oil-change'], description: 'Nissan Patrol full service with oil and filter change' },
        { name: 'Lease Agreement - Workshop B', type: 'docx', category: 'contracts', size: 2_097_152, uploadedBy: 'Fatima Hassan', tags: ['lease', 'property', 'workshop'], description: 'Commercial lease agreement for Workshop B expansion' },
        { name: 'Vehicle Inspection Report - BMW X5', type: 'xlsx', category: 'vehicle-docs', size: 348_160, uploadedBy: 'Technician Omar', tags: ['inspection', 'bmw', 'detailed'], description: 'Pre-purchase multi-point inspection report for BMW X5 2024' },
        { name: 'Safety Training Certificate', type: 'pdf', category: 'employee-docs', size: 614_400, uploadedBy: 'HR Department', tags: ['safety', 'training', 'certificate'], description: 'Workshop safety training completion certificate for Q1 2026' },
        { name: 'Fire Safety Compliance Report', type: 'pdf', category: 'compliance', size: 921_600, uploadedBy: 'Safety Officer', tags: ['fire-safety', 'inspection', 'compliance'], description: 'Annual fire safety inspection and compliance report' },
        { name: 'Fleet Insurance Renewal', type: 'pdf', category: 'insurance', size: 1_536_000, uploadedBy: 'Fatima Hassan', tags: ['fleet', 'insurance', 'renewal'], description: 'Fleet vehicle comprehensive insurance renewal documentation' },
      ]);
      console.log('✅ Seeded 12 document library items');
    }

    // ── Step N+3: Currency transactions (demo) ─────────────────────
    const existingCurTx = await db.select().from(currencyTransactions).limit(1);
    if (existingCurTx.length === 0) {
      await db.insert(currencyTransactions).values([
        { txDate: new Date('2026-03-19T14:30:00Z'), description: 'Full service — Toyota Camry', originalAmount: '450.00', originalCurrency: 'USD', rateUsed: '3.7536', sarEquivalent: '1689.12', type: 'invoice', reference: 'INV-2026-0412', customerName: 'James Wilson' },
        { txDate: new Date('2026-03-19T11:15:00Z'), description: 'Brake pad replacement', originalAmount: '320.00', originalCurrency: 'EUR', rateUsed: '4.0816', sarEquivalent: '1306.11', type: 'invoice', reference: 'INV-2026-0411', customerName: 'Hans Mueller' },
        { txDate: new Date('2026-03-18T16:45:00Z'), description: 'Engine diagnostics', originalAmount: '180.00', originalCurrency: 'GBP', rateUsed: '4.7506', sarEquivalent: '855.11', type: 'payment', reference: 'PAY-2026-0298', customerName: 'Oliver Smith' },
        { txDate: new Date('2026-03-18T10:00:00Z'), description: 'Oil change service', originalAmount: '350.00', originalCurrency: 'AED', rateUsed: '1.0204', sarEquivalent: '357.14', type: 'payment', reference: 'PAY-2026-0297', customerName: 'Mohammed Al-Maktoum' },
        { txDate: new Date('2026-03-17T09:20:00Z'), description: 'Transmission repair', originalAmount: '120.00', originalCurrency: 'KWD', rateUsed: '12.1655', sarEquivalent: '1459.85', type: 'invoice', reference: 'INV-2026-0408', customerName: 'Abdullah Al-Sabah' },
        { txDate: new Date('2026-03-17T13:00:00Z'), description: 'Refund — incorrect part charged', originalAmount: '85.00', originalCurrency: 'USD', rateUsed: '3.7536', sarEquivalent: '319.06', type: 'refund', reference: 'REF-2026-0045', customerName: 'James Wilson' },
        { txDate: new Date('2026-03-16T15:30:00Z'), description: 'AC compressor parts import', originalAmount: '2200.00', originalCurrency: 'USD', rateUsed: '3.7536', sarEquivalent: '8257.92', type: 'expense', reference: 'EXP-2026-0189', customerName: 'AutoParts International' },
        { txDate: new Date('2026-03-16T08:45:00Z'), description: 'Suspension overhaul', originalAmount: '75.00', originalCurrency: 'BHD', rateUsed: '9.9304', sarEquivalent: '744.78', type: 'invoice', reference: 'INV-2026-0405', customerName: 'Ali Al-Khalifa' },
        { txDate: new Date('2026-03-15T12:00:00Z'), description: 'Windshield replacement', originalAmount: '8500.00', originalCurrency: 'EGP', rateUsed: '0.2841', sarEquivalent: '2414.77', type: 'payment', reference: 'PAY-2026-0291', customerName: 'Ahmed Mostafa' },
        { txDate: new Date('2026-03-15T09:00:00Z'), description: 'Annual inspection fee', originalAmount: '45.00', originalCurrency: 'JOD', rateUsed: '5.2770', sarEquivalent: '237.47', type: 'payment', reference: 'PAY-2026-0290', customerName: 'Faisal Al-Hashemi' },
      ]);
      console.log('✅ Seeded 10 currency transactions');
    }

    // ── Step N+4: Fleet accounts/vehicles/maintenance (demo) ───────
    const existingFleet = await db.select().from(fleetAccountsTable).limit(1);
    if (existingFleet.length === 0) {
      const insertedAccounts = await db.insert(fleetAccountsTable).values([
        { externalRef: 'fa-001', companyName: 'Al Rajhi Logistics', contactPerson: 'Ahmed Al-Rashid', contactEmail: 'ahmed@alrajhi-logistics.sa', contactPhone: '+966 50 123 4567', contractStatus: 'active', contractStart: '2025-01-01', contractEnd: '2026-12-31', monthlySpend: '45200', totalSpend: '542400', discountPercentage: 15, paymentTerms: 'Net 30', notes: 'Premium fleet client, priority service' },
        { externalRef: 'fa-002', companyName: 'Saudi Express Delivery', contactPerson: 'Khalid bin Saeed', contactEmail: 'khalid@saudiexpress.sa', contactPhone: '+966 55 987 6543', contractStatus: 'active', contractStart: '2025-03-15', contractEnd: '2027-03-14', monthlySpend: '28750', totalSpend: '287500', discountPercentage: 10, paymentTerms: 'Net 15', notes: 'Delivery fleet, high-mileage vehicles' },
        { externalRef: 'fa-003', companyName: 'Gulf Construction Co.', contactPerson: 'Omar Al-Farsi', contactEmail: 'omar@gulfconstruction.sa', contactPhone: '+966 54 456 7890', contractStatus: 'pending', contractStart: '2026-04-01', contractEnd: '2028-03-31', monthlySpend: '0', totalSpend: '0', discountPercentage: 12, paymentTerms: 'Net 30', notes: 'Heavy-duty fleet, construction vehicles' },
      ]).returning();
      const accountByRef = new Map(insertedAccounts.map((a: any) => [a.externalRef, a.id]));

      const insertedVehicles = await db.insert(fleetAccountVehicles).values([
        { externalRef: 'fv-001', fleetAccountId: accountByRef.get('fa-001')!, plateNumber: 'RYD 1234', make: 'Toyota', model: 'Hilux', year: 2024, vin: 'JTFBT4K38N1000001', status: 'active', mileage: 45200, lastServiceDate: '2026-02-15', lastServiceType: 'Oil Change', nextServiceDue: '2026-04-15', nextServiceType: 'Full Service', avgMonthlyCost: '1200', totalSpend: '14400' },
        { externalRef: 'fv-002', fleetAccountId: accountByRef.get('fa-001')!, plateNumber: 'RYD 5678', make: 'Toyota', model: 'Land Cruiser', year: 2023, vin: 'JTFBT4K38N1000002', status: 'in_service', mileage: 78300, lastServiceDate: '2026-03-10', lastServiceType: 'Brake Replacement', nextServiceDue: '2026-05-10', nextServiceType: 'Oil Change', avgMonthlyCost: '1850', totalSpend: '22200' },
        { externalRef: 'fv-003', fleetAccountId: accountByRef.get('fa-001')!, plateNumber: 'RYD 9012', make: 'Isuzu', model: 'NPR', year: 2024, vin: 'JTFBT4K38N1000003', status: 'active', mileage: 32100, lastServiceDate: '2026-01-20', lastServiceType: 'Tire Rotation', nextServiceDue: '2026-03-25', nextServiceType: 'Oil Change', avgMonthlyCost: '980', totalSpend: '11760' },
        { externalRef: 'fv-004', fleetAccountId: accountByRef.get('fa-001')!, plateNumber: 'RYD 3456', make: 'Mitsubishi', model: 'Canter', year: 2023, vin: 'JTFBT4K38N1000004', status: 'scheduled', mileage: 56700, lastServiceDate: '2025-12-05', lastServiceType: 'Transmission Service', nextServiceDue: '2026-03-22', nextServiceType: 'Full Service', avgMonthlyCost: '1450', totalSpend: '17400' },
        { externalRef: 'fv-005', fleetAccountId: accountByRef.get('fa-002')!, plateNumber: 'JED 2345', make: 'Nissan', model: 'Urvan', year: 2024, vin: 'JTFBT4K38N1000005', status: 'active', mileage: 67800, lastServiceDate: '2026-03-01', lastServiceType: 'Oil Change', nextServiceDue: '2026-04-01', nextServiceType: 'Tire Replacement', avgMonthlyCost: '890', totalSpend: '10680' },
        { externalRef: 'fv-006', fleetAccountId: accountByRef.get('fa-002')!, plateNumber: 'JED 6789', make: 'Toyota', model: 'Hiace', year: 2023, vin: 'JTFBT4K38N1000006', status: 'active', mileage: 92100, lastServiceDate: '2026-02-20', lastServiceType: 'Full Service', nextServiceDue: '2026-04-20', nextServiceType: 'Oil Change', avgMonthlyCost: '1100', totalSpend: '13200' },
        { externalRef: 'fv-007', fleetAccountId: accountByRef.get('fa-002')!, plateNumber: 'JED 0123', make: 'Hyundai', model: 'H-1', year: 2024, vin: 'JTFBT4K38N1000007', status: 'in_service', mileage: 41500, lastServiceDate: '2026-03-18', lastServiceType: 'Suspension Repair', nextServiceDue: '2026-05-18', nextServiceType: 'Oil Change', avgMonthlyCost: '750', totalSpend: '9000' },
        { externalRef: 'fv-008', fleetAccountId: accountByRef.get('fa-002')!, plateNumber: 'JED 4567', make: 'Ford', model: 'Transit', year: 2023, vin: 'JTFBT4K38N1000008', status: 'active', mileage: 55300, lastServiceDate: '2026-01-15', lastServiceType: 'Battery Replacement', nextServiceDue: '2026-03-28', nextServiceType: 'Oil Change', avgMonthlyCost: '920', totalSpend: '11040' },
        { externalRef: 'fv-009', fleetAccountId: accountByRef.get('fa-003')!, plateNumber: 'DMM 7890', make: 'Toyota', model: 'Land Cruiser Pickup', year: 2024, vin: 'JTFBT4K38N1000009', status: 'active', mileage: 28400, lastServiceDate: '2026-02-28', lastServiceType: 'Oil Change', nextServiceDue: '2026-04-28', nextServiceType: 'Full Service', avgMonthlyCost: '1350', totalSpend: '16200' },
        { externalRef: 'fv-010', fleetAccountId: accountByRef.get('fa-003')!, plateNumber: 'DMM 1234', make: 'Mitsubishi', model: 'L200', year: 2023, vin: 'JTFBT4K38N1000010', status: 'active', mileage: 61200, lastServiceDate: '2026-03-05', lastServiceType: 'Tire Replacement', nextServiceDue: '2026-05-05', nextServiceType: 'Oil Change', avgMonthlyCost: '1080', totalSpend: '12960' },
        { externalRef: 'fv-011', fleetAccountId: accountByRef.get('fa-003')!, plateNumber: 'DMM 5678', make: 'Isuzu', model: 'D-Max', year: 2024, vin: 'JTFBT4K38N1000011', status: 'scheduled', mileage: 19800, lastServiceDate: '2026-01-10', lastServiceType: 'Brake Inspection', nextServiceDue: '2026-03-24', nextServiceType: 'Oil Change', avgMonthlyCost: '680', totalSpend: '8160' },
        { externalRef: 'fv-012', fleetAccountId: accountByRef.get('fa-003')!, plateNumber: 'DMM 9012', make: 'Ford', model: 'Ranger', year: 2023, vin: 'JTFBT4K38N1000012', status: 'inactive', mileage: 105600, lastServiceDate: '2025-11-20', lastServiceType: 'Engine Overhaul', nextServiceDue: '2026-05-20', nextServiceType: 'Full Inspection', avgMonthlyCost: '2200', totalSpend: '26400' },
      ]).returning();
      const vehicleByRef = new Map(insertedVehicles.map((v: any) => [v.externalRef, v.id]));

      await db.insert(fleetMaintenanceEntries).values([
        { externalRef: 'ms-001', vehicleId: vehicleByRef.get('fv-001')!, fleetAccountId: accountByRef.get('fa-001')!, serviceType: 'Full Service', scheduledDate: '2026-04-15', status: 'scheduled', estimatedCost: '1800', notes: 'Includes oil, filters, and inspection' },
        { externalRef: 'ms-002', vehicleId: vehicleByRef.get('fv-003')!, fleetAccountId: accountByRef.get('fa-001')!, serviceType: 'Oil Change', scheduledDate: '2026-03-25', status: 'overdue', estimatedCost: '350', notes: 'Standard oil change' },
        { externalRef: 'ms-003', vehicleId: vehicleByRef.get('fv-004')!, fleetAccountId: accountByRef.get('fa-001')!, serviceType: 'Full Service', scheduledDate: '2026-03-22', status: 'scheduled', estimatedCost: '2200', notes: 'Full service with transmission check' },
        { externalRef: 'ms-004', vehicleId: vehicleByRef.get('fv-005')!, fleetAccountId: accountByRef.get('fa-002')!, serviceType: 'Tire Replacement', scheduledDate: '2026-04-01', status: 'scheduled', estimatedCost: '2400', notes: 'Replace all 4 tires' },
        { externalRef: 'ms-005', vehicleId: vehicleByRef.get('fv-008')!, fleetAccountId: accountByRef.get('fa-002')!, serviceType: 'Oil Change', scheduledDate: '2026-03-28', status: 'scheduled', estimatedCost: '320', notes: 'Synthetic oil change' },
        { externalRef: 'ms-006', vehicleId: vehicleByRef.get('fv-009')!, fleetAccountId: accountByRef.get('fa-003')!, serviceType: 'Full Service', scheduledDate: '2026-04-28', status: 'scheduled', estimatedCost: '1950', notes: 'Major service at 30k km' },
        { externalRef: 'ms-007', vehicleId: vehicleByRef.get('fv-011')!, fleetAccountId: accountByRef.get('fa-003')!, serviceType: 'Oil Change', scheduledDate: '2026-03-24', status: 'scheduled', estimatedCost: '300', notes: 'Regular maintenance' },
        { externalRef: 'ms-008', vehicleId: vehicleByRef.get('fv-002')!, fleetAccountId: accountByRef.get('fa-001')!, serviceType: 'Oil Change', scheduledDate: '2026-05-10', status: 'scheduled', estimatedCost: '400', notes: 'Post brake replacement checkup' },
        { externalRef: 'ms-009', vehicleId: vehicleByRef.get('fv-006')!, fleetAccountId: accountByRef.get('fa-002')!, serviceType: 'Oil Change', scheduledDate: '2026-04-20', status: 'scheduled', estimatedCost: '350', notes: 'High-mileage vehicle check' },
        { externalRef: 'ms-010', vehicleId: vehicleByRef.get('fv-010')!, fleetAccountId: accountByRef.get('fa-003')!, serviceType: 'Oil Change', scheduledDate: '2026-05-05', status: 'scheduled', estimatedCost: '320', notes: 'Standard interval service' },
        { externalRef: 'ms-011', vehicleId: vehicleByRef.get('fv-007')!, fleetAccountId: accountByRef.get('fa-002')!, serviceType: 'Oil Change', scheduledDate: '2026-05-18', status: 'scheduled', estimatedCost: '300', notes: 'After suspension repair follow-up' },
        { externalRef: 'ms-012', vehicleId: vehicleByRef.get('fv-012')!, fleetAccountId: accountByRef.get('fa-003')!, serviceType: 'Full Inspection', scheduledDate: '2026-05-20', status: 'scheduled', estimatedCost: '1500', notes: 'Post-overhaul comprehensive inspection' },
      ]);
      console.log('✅ Seeded 3 fleet accounts, 12 fleet vehicles, 12 maintenance entries');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${customers.length} customers`);
    console.log(`   - ${technicians.length} technicians`);
    console.log(`   - ${createdVehicles.length} vehicles`);
    console.log(`   - ${createdParts.length} spare parts`);
    console.log(`   - ${createdJobCards.length} job cards`);
    console.log(`   - ${createdTasks.length} task assignments`);
    console.log(`   - 20 appointments`);
    console.log(`   - ${createdInvoices.length} invoices`);
    console.log(`   - 10 estimates`);
    console.log(`   - Commission rules and calculations`);
    console.log(`   - Shift schedules and attendance`);
    console.log(`   - Service reminders and maintenance schedules`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
