import { db } from './db';
import {
  garages, branches, users, customerProfiles, technicianProfiles,
  vehicles, jobCards, appointments, spareParts, sparePartInventories,
  invoices, payments, estimates, serviceReminders, maintenanceSchedules,
  vehicleServiceHistory, purchaseOrders, taskAssignments, commissionRules,
  commissions, employeeAttendance, shiftTemplates, shiftAssignments,
  performanceReviews, trainings, employeeTrainings, stockAlerts,
  paymentPlans, installments, taxConfigurations, discountsPromotions,
  savedFilterPresets, notifications, roles, featureFlags
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
