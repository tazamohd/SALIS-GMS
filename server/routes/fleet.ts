import { Router } from 'express';

const router = Router();

// ── In-memory demo data ──

interface FleetAccount {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contractStatus: 'active' | 'pending' | 'expired';
  contractStart: string;
  contractEnd: string;
  monthlySpend: number;
  totalSpend: number;
  discountPercentage: number;
  paymentTerms: string;
  notes: string;
  createdAt: string;
}

interface FleetVehicle {
  id: string;
  fleetAccountId: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: 'active' | 'in_service' | 'scheduled' | 'inactive';
  mileage: number;
  lastServiceDate: string;
  lastServiceType: string;
  nextServiceDue: string;
  nextServiceType: string;
  avgMonthlyCost: number;
  totalSpend: number;
}

interface MaintenanceEntry {
  id: string;
  vehicleId: string;
  fleetAccountId: string;
  serviceType: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  estimatedCost: number;
  notes: string;
}

const fleetAccounts: FleetAccount[] = [
  {
    id: 'fa-001',
    companyName: 'Al Rajhi Logistics',
    contactPerson: 'Ahmed Al-Rashid',
    contactEmail: 'ahmed@alrajhi-logistics.sa',
    contactPhone: '+966 50 123 4567',
    contractStatus: 'active',
    contractStart: '2025-01-01',
    contractEnd: '2026-12-31',
    monthlySpend: 45200,
    totalSpend: 542400,
    discountPercentage: 15,
    paymentTerms: 'Net 30',
    notes: 'Premium fleet client, priority service',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'fa-002',
    companyName: 'Saudi Express Delivery',
    contactPerson: 'Khalid bin Saeed',
    contactEmail: 'khalid@saudiexpress.sa',
    contactPhone: '+966 55 987 6543',
    contractStatus: 'active',
    contractStart: '2025-03-15',
    contractEnd: '2027-03-14',
    monthlySpend: 28750,
    totalSpend: 287500,
    discountPercentage: 10,
    paymentTerms: 'Net 15',
    notes: 'Delivery fleet, high-mileage vehicles',
    createdAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 'fa-003',
    companyName: 'Gulf Construction Co.',
    contactPerson: 'Omar Al-Farsi',
    contactEmail: 'omar@gulfconstruction.sa',
    contactPhone: '+966 54 456 7890',
    contractStatus: 'pending',
    contractStart: '2026-04-01',
    contractEnd: '2028-03-31',
    monthlySpend: 0,
    totalSpend: 0,
    discountPercentage: 12,
    paymentTerms: 'Net 30',
    notes: 'Heavy-duty fleet, construction vehicles',
    createdAt: '2026-02-20T00:00:00Z',
  },
];

const fleetVehicles: FleetVehicle[] = [
  // Al Rajhi Logistics vehicles
  { id: 'fv-001', fleetAccountId: 'fa-001', plateNumber: 'RYD 1234', make: 'Toyota', model: 'Hilux', year: 2024, vin: 'JTFBT4K38N1000001', status: 'active', mileage: 45200, lastServiceDate: '2026-02-15', lastServiceType: 'Oil Change', nextServiceDue: '2026-04-15', nextServiceType: 'Full Service', avgMonthlyCost: 1200, totalSpend: 14400 },
  { id: 'fv-002', fleetAccountId: 'fa-001', plateNumber: 'RYD 5678', make: 'Toyota', model: 'Land Cruiser', year: 2023, vin: 'JTFBT4K38N1000002', status: 'in_service', mileage: 78300, lastServiceDate: '2026-03-10', lastServiceType: 'Brake Replacement', nextServiceDue: '2026-05-10', nextServiceType: 'Oil Change', avgMonthlyCost: 1850, totalSpend: 22200 },
  { id: 'fv-003', fleetAccountId: 'fa-001', plateNumber: 'RYD 9012', make: 'Isuzu', model: 'NPR', year: 2024, vin: 'JTFBT4K38N1000003', status: 'active', mileage: 32100, lastServiceDate: '2026-01-20', lastServiceType: 'Tire Rotation', nextServiceDue: '2026-03-25', nextServiceType: 'Oil Change', avgMonthlyCost: 980, totalSpend: 11760 },
  { id: 'fv-004', fleetAccountId: 'fa-001', plateNumber: 'RYD 3456', make: 'Mitsubishi', model: 'Canter', year: 2023, vin: 'JTFBT4K38N1000004', status: 'scheduled', mileage: 56700, lastServiceDate: '2025-12-05', lastServiceType: 'Transmission Service', nextServiceDue: '2026-03-22', nextServiceType: 'Full Service', avgMonthlyCost: 1450, totalSpend: 17400 },
  // Saudi Express Delivery vehicles
  { id: 'fv-005', fleetAccountId: 'fa-002', plateNumber: 'JED 2345', make: 'Nissan', model: 'Urvan', year: 2024, vin: 'JTFBT4K38N1000005', status: 'active', mileage: 67800, lastServiceDate: '2026-03-01', lastServiceType: 'Oil Change', nextServiceDue: '2026-04-01', nextServiceType: 'Tire Replacement', avgMonthlyCost: 890, totalSpend: 10680 },
  { id: 'fv-006', fleetAccountId: 'fa-002', plateNumber: 'JED 6789', make: 'Toyota', model: 'Hiace', year: 2023, vin: 'JTFBT4K38N1000006', status: 'active', mileage: 92100, lastServiceDate: '2026-02-20', lastServiceType: 'Full Service', nextServiceDue: '2026-04-20', nextServiceType: 'Oil Change', avgMonthlyCost: 1100, totalSpend: 13200 },
  { id: 'fv-007', fleetAccountId: 'fa-002', plateNumber: 'JED 0123', make: 'Hyundai', model: 'H-1', year: 2024, vin: 'JTFBT4K38N1000007', status: 'in_service', mileage: 41500, lastServiceDate: '2026-03-18', lastServiceType: 'Suspension Repair', nextServiceDue: '2026-05-18', nextServiceType: 'Oil Change', avgMonthlyCost: 750, totalSpend: 9000 },
  { id: 'fv-008', fleetAccountId: 'fa-002', plateNumber: 'JED 4567', make: 'Ford', model: 'Transit', year: 2023, vin: 'JTFBT4K38N1000008', status: 'active', mileage: 55300, lastServiceDate: '2026-01-15', lastServiceType: 'Battery Replacement', nextServiceDue: '2026-03-28', nextServiceType: 'Oil Change', avgMonthlyCost: 920, totalSpend: 11040 },
  // Gulf Construction Co. vehicles
  { id: 'fv-009', fleetAccountId: 'fa-003', plateNumber: 'DMM 7890', make: 'Toyota', model: 'Land Cruiser Pickup', year: 2024, vin: 'JTFBT4K38N1000009', status: 'active', mileage: 28400, lastServiceDate: '2026-02-28', lastServiceType: 'Oil Change', nextServiceDue: '2026-04-28', nextServiceType: 'Full Service', avgMonthlyCost: 1350, totalSpend: 16200 },
  { id: 'fv-010', fleetAccountId: 'fa-003', plateNumber: 'DMM 1234', make: 'Mitsubishi', model: 'L200', year: 2023, vin: 'JTFBT4K38N1000010', status: 'active', mileage: 61200, lastServiceDate: '2026-03-05', lastServiceType: 'Tire Replacement', nextServiceDue: '2026-05-05', nextServiceType: 'Oil Change', avgMonthlyCost: 1080, totalSpend: 12960 },
  { id: 'fv-011', fleetAccountId: 'fa-003', plateNumber: 'DMM 5678', make: 'Isuzu', model: 'D-Max', year: 2024, vin: 'JTFBT4K38N1000011', status: 'scheduled', mileage: 19800, lastServiceDate: '2026-01-10', lastServiceType: 'Brake Inspection', nextServiceDue: '2026-03-24', nextServiceType: 'Oil Change', avgMonthlyCost: 680, totalSpend: 8160 },
  { id: 'fv-012', fleetAccountId: 'fa-003', plateNumber: 'DMM 9012', make: 'Ford', model: 'Ranger', year: 2023, vin: 'JTFBT4K38N1000012', status: 'inactive', mileage: 105600, lastServiceDate: '2025-11-20', lastServiceType: 'Engine Overhaul', nextServiceDue: '2026-05-20', nextServiceType: 'Full Inspection', avgMonthlyCost: 2200, totalSpend: 26400 },
];

const maintenanceSchedule: MaintenanceEntry[] = [
  { id: 'ms-001', vehicleId: 'fv-001', fleetAccountId: 'fa-001', serviceType: 'Full Service', scheduledDate: '2026-04-15', status: 'scheduled', estimatedCost: 1800, notes: 'Includes oil, filters, and inspection' },
  { id: 'ms-002', vehicleId: 'fv-003', fleetAccountId: 'fa-001', serviceType: 'Oil Change', scheduledDate: '2026-03-25', status: 'overdue', estimatedCost: 350, notes: 'Standard oil change' },
  { id: 'ms-003', vehicleId: 'fv-004', fleetAccountId: 'fa-001', serviceType: 'Full Service', scheduledDate: '2026-03-22', status: 'scheduled', estimatedCost: 2200, notes: 'Full service with transmission check' },
  { id: 'ms-004', vehicleId: 'fv-005', fleetAccountId: 'fa-002', serviceType: 'Tire Replacement', scheduledDate: '2026-04-01', status: 'scheduled', estimatedCost: 2400, notes: 'Replace all 4 tires' },
  { id: 'ms-005', vehicleId: 'fv-008', fleetAccountId: 'fa-002', serviceType: 'Oil Change', scheduledDate: '2026-03-28', status: 'scheduled', estimatedCost: 320, notes: 'Synthetic oil change' },
  { id: 'ms-006', vehicleId: 'fv-009', fleetAccountId: 'fa-003', serviceType: 'Full Service', scheduledDate: '2026-04-28', status: 'scheduled', estimatedCost: 1950, notes: 'Major service at 30k km' },
  { id: 'ms-007', vehicleId: 'fv-011', fleetAccountId: 'fa-003', serviceType: 'Oil Change', scheduledDate: '2026-03-24', status: 'scheduled', estimatedCost: 300, notes: 'Regular maintenance' },
  { id: 'ms-008', vehicleId: 'fv-002', fleetAccountId: 'fa-001', serviceType: 'Oil Change', scheduledDate: '2026-05-10', status: 'scheduled', estimatedCost: 400, notes: 'Post brake replacement checkup' },
  { id: 'ms-009', vehicleId: 'fv-006', fleetAccountId: 'fa-002', serviceType: 'Oil Change', scheduledDate: '2026-04-20', status: 'scheduled', estimatedCost: 350, notes: 'High-mileage vehicle check' },
  { id: 'ms-010', vehicleId: 'fv-010', fleetAccountId: 'fa-003', serviceType: 'Oil Change', scheduledDate: '2026-05-05', status: 'scheduled', estimatedCost: 320, notes: 'Standard interval service' },
  { id: 'ms-011', vehicleId: 'fv-007', fleetAccountId: 'fa-002', serviceType: 'Oil Change', scheduledDate: '2026-05-18', status: 'scheduled', estimatedCost: 300, notes: 'After suspension repair follow-up' },
  { id: 'ms-012', vehicleId: 'fv-012', fleetAccountId: 'fa-003', serviceType: 'Full Inspection', scheduledDate: '2026-05-20', status: 'scheduled', estimatedCost: 1500, notes: 'Post-overhaul comprehensive inspection' },
];

// Helper: enrich account with computed fields
function enrichAccount(account: FleetAccount) {
  const vehicles = fleetVehicles.filter(v => v.fleetAccountId === account.id);
  const activeJobs = vehicles.filter(v => v.status === 'in_service' || v.status === 'scheduled').length;
  return {
    ...account,
    vehicleCount: vehicles.length,
    activeJobs,
  };
}

// ── Routes ──

// GET /api/fleet/accounts — List all fleet accounts
router.get('/fleet/accounts', (_req, res) => {
  const enriched = fleetAccounts.map(enrichAccount);
  res.json({ accounts: enriched });
});

// GET /api/fleet/accounts/:id — Fleet account detail with vehicles
router.get('/fleet/accounts/:id', (req, res) => {
  const account = fleetAccounts.find(a => a.id === req.params.id);
  if (!account) {
    return res.status(404).json({ message: 'Fleet account not found' });
  }
  const vehicles = fleetVehicles.filter(v => v.fleetAccountId === account.id);
  const upcoming = maintenanceSchedule.filter(m => m.fleetAccountId === account.id);
  res.json({
    account: enrichAccount(account),
    vehicles,
    upcomingMaintenance: upcoming,
  });
});

// POST /api/fleet/accounts — Create fleet account
router.post('/fleet/accounts', (req, res) => {
  const { companyName, contactPerson, contactEmail, contactPhone, discountPercentage, paymentTerms, notes } = req.body;
  if (!companyName) {
    return res.status(400).json({ message: 'companyName is required' });
  }
  const newAccount: FleetAccount = {
    id: `fa-${String(fleetAccounts.length + 1).padStart(3, '0')}`,
    companyName,
    contactPerson: contactPerson || '',
    contactEmail: contactEmail || '',
    contactPhone: contactPhone || '',
    contractStatus: 'pending',
    contractStart: '',
    contractEnd: '',
    monthlySpend: 0,
    totalSpend: 0,
    discountPercentage: discountPercentage || 0,
    paymentTerms: paymentTerms || 'Net 30',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  fleetAccounts.push(newAccount);
  res.status(201).json({ account: enrichAccount(newAccount) });
});

// GET /api/fleet/vehicles — All fleet vehicles
router.get('/fleet/vehicles', (req, res) => {
  const accountId = req.query.accountId as string | undefined;
  let vehicles = fleetVehicles;
  if (accountId) {
    vehicles = vehicles.filter(v => v.fleetAccountId === accountId);
  }
  const enriched = vehicles.map(v => {
    const account = fleetAccounts.find(a => a.id === v.fleetAccountId);
    return { ...v, companyName: account?.companyName || 'Unknown' };
  });
  res.json({ vehicles: enriched });
});

// GET /api/fleet/maintenance-schedule — Upcoming maintenance
router.get('/fleet/maintenance-schedule', (req, res) => {
  const accountId = req.query.accountId as string | undefined;
  let schedule = maintenanceSchedule;
  if (accountId) {
    schedule = schedule.filter(m => m.fleetAccountId === accountId);
  }
  const enriched = schedule.map(entry => {
    const vehicle = fleetVehicles.find(v => v.id === entry.vehicleId);
    const account = fleetAccounts.find(a => a.id === entry.fleetAccountId);
    return {
      ...entry,
      plateNumber: vehicle?.plateNumber || '',
      vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : '',
      companyName: account?.companyName || '',
    };
  });
  // Sort by date
  enriched.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  res.json({ schedule: enriched });
});

// GET /api/fleet/analytics — Fleet analytics
router.get('/fleet/analytics', (_req, res) => {
  // Revenue per fleet account
  const revenuePerAccount = fleetAccounts.map(a => {
    const vehicles = fleetVehicles.filter(v => v.fleetAccountId === a.id);
    const totalRevenue = vehicles.reduce((sum, v) => sum + v.totalSpend, 0);
    return {
      accountId: a.id,
      companyName: a.companyName,
      totalRevenue,
      vehicleCount: vehicles.length,
      avgCostPerVehicle: vehicles.length > 0 ? Math.round(totalRevenue / vehicles.length) : 0,
    };
  });

  // Service frequency by vehicle type (make)
  const makeMap = new Map<string, { count: number; totalCost: number }>();
  for (const v of fleetVehicles) {
    const entry = makeMap.get(v.make) || { count: 0, totalCost: 0 };
    entry.count += 1;
    entry.totalCost += v.totalSpend;
    makeMap.set(v.make, entry);
  }
  const serviceByMake = Array.from(makeMap.entries()).map(([make, data]) => ({
    make,
    vehicleCount: data.count,
    totalCost: data.totalCost,
    avgCost: Math.round(data.totalCost / data.count),
  }));

  // Monthly cost trend (simulated last 6 months)
  const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
  const costTrend = months.map((month, i) => ({
    month,
    totalCost: Math.round(18000 + Math.random() * 8000 + i * 1200),
    vehiclesServiced: Math.round(4 + Math.random() * 6),
  }));

  // Summary metrics
  const totalVehicles = fleetVehicles.length;
  const activeVehicles = fleetVehicles.filter(v => v.status === 'active').length;
  const inService = fleetVehicles.filter(v => v.status === 'in_service').length;
  const totalRevenue = fleetVehicles.reduce((s, v) => s + v.totalSpend, 0);
  const avgCostPerVehicle = Math.round(totalRevenue / totalVehicles);
  const avgMileage = Math.round(fleetVehicles.reduce((s, v) => s + v.mileage, 0) / totalVehicles);
  const overdueCount = maintenanceSchedule.filter(m => m.status === 'overdue').length;

  res.json({
    summary: {
      totalAccounts: fleetAccounts.length,
      totalVehicles,
      activeVehicles,
      inService,
      totalRevenue,
      avgCostPerVehicle,
      avgMileage,
      overdueMaintenanceCount: overdueCount,
    },
    revenuePerAccount,
    serviceByMake,
    costTrend,
  });
});

export default router;
