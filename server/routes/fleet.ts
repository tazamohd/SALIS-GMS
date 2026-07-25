import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Helper: shape an account row + computed counts into the JSON the UI expects.
function enrichAccount(account: any, vehicles: any[]) {
  const own = vehicles.filter((v: any) => v.fleetAccountId === account.id);
  const activeJobs = own.filter((v: any) => v.status === 'in_service' || v.status === 'scheduled').length;
  return {
    id: account.id,
    companyName: account.companyName,
    contactPerson: account.contactPerson,
    contactEmail: account.contactEmail,
    contactPhone: account.contactPhone,
    contractStatus: account.contractStatus,
    contractStart: account.contractStart,
    contractEnd: account.contractEnd,
    monthlySpend: Number(account.monthlySpend) || 0,
    totalSpend: Number(account.totalSpend) || 0,
    discountPercentage: account.discountPercentage,
    paymentTerms: account.paymentTerms,
    notes: account.notes,
    createdAt: account.createdAt instanceof Date ? account.createdAt.toISOString() : account.createdAt,
    vehicleCount: own.length,
    activeJobs,
  };
}

function viewVehicle(v: any, account?: any) {
  return {
    id: v.id,
    fleetAccountId: v.fleetAccountId,
    plateNumber: v.plateNumber,
    make: v.make,
    model: v.model,
    year: v.year,
    vin: v.vin,
    status: v.status,
    mileage: v.mileage,
    lastServiceDate: v.lastServiceDate,
    lastServiceType: v.lastServiceType,
    nextServiceDue: v.nextServiceDue,
    nextServiceType: v.nextServiceType,
    avgMonthlyCost: Number(v.avgMonthlyCost) || 0,
    totalSpend: Number(v.totalSpend) || 0,
    companyName: account?.companyName || 'Unknown',
  };
}

// GET /api/fleet/accounts — List all fleet accounts
router.get('/fleet/accounts', async (_req, res) => {
  try {
    const [accounts, vehicles] = await Promise.all([
      storage.listFleetAccounts(),
      storage.listFleetAccountVehicles(),
    ]);
    res.json({ accounts: accounts.map(a => enrichAccount(a, vehicles)) });
  } catch (err) {
    console.error('Fleet accounts list error:', err);
    res.status(500).json({ message: 'Failed to load fleet accounts' });
  }
});

// GET /api/fleet/accounts/:id — Fleet account detail with vehicles
router.get('/fleet/accounts/:id', async (req, res) => {
  try {
    const account = await storage.getFleetAccount(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Fleet account not found' });
    }
    const [vehicles, upcoming] = await Promise.all([
      storage.listFleetAccountVehicles(account.id),
      storage.listFleetMaintenanceEntries(account.id),
    ]);
    res.json({
      account: enrichAccount(account, vehicles),
      vehicles: vehicles.map(v => viewVehicle(v, account)),
      upcomingMaintenance: upcoming,
    });
  } catch (err) {
    console.error('Fleet account detail error:', err);
    res.status(500).json({ message: 'Failed to load fleet account' });
  }
});

// POST /api/fleet/accounts — Create fleet account
router.post('/fleet/accounts', async (req, res) => {
  const { companyName, contactPerson, contactEmail, contactPhone, discountPercentage, paymentTerms, notes } = req.body;
  if (!companyName) {
    return res.status(400).json({ message: 'companyName is required' });
  }
  try {
    const created = await storage.createFleetAccount({
      companyName,
      contactPerson: contactPerson || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      contractStatus: 'pending',
      contractStart: null,
      contractEnd: null,
      monthlySpend: '0',
      totalSpend: '0',
      discountPercentage: typeof discountPercentage === 'number' ? discountPercentage : 0,
      paymentTerms: paymentTerms || 'Net 30',
      notes: notes || '',
    });
    res.status(201).json({ account: enrichAccount(created, []) });
  } catch (err) {
    console.error('Fleet account create error:', err);
    res.status(500).json({ message: 'Failed to create fleet account' });
  }
});

// GET /api/fleet/vehicles — All fleet vehicles
router.get('/fleet/vehicles', async (req, res) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const [vehicles, accounts] = await Promise.all([
      storage.listFleetAccountVehicles(accountId),
      storage.listFleetAccounts(),
    ]);
    const enriched = vehicles.map(v => viewVehicle(v, accounts.find(a => a.id === v.fleetAccountId)));
    res.json({ vehicles: enriched });
  } catch (err) {
    console.error('Fleet vehicles list error:', err);
    res.status(500).json({ message: 'Failed to load fleet vehicles' });
  }
});

// GET /api/fleet/maintenance-schedule — Upcoming maintenance
router.get('/fleet/maintenance-schedule', async (req, res) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const [entries, vehicles, accounts] = await Promise.all([
      storage.listFleetMaintenanceEntries(accountId),
      storage.listFleetAccountVehicles(),
      storage.listFleetAccounts(),
    ]);
    const enriched = entries.map(entry => {
      const vehicle = vehicles.find(v => v.id === entry.vehicleId);
      const account = accounts.find(a => a.id === entry.fleetAccountId);
      return {
        id: entry.id,
        vehicleId: entry.vehicleId,
        fleetAccountId: entry.fleetAccountId,
        serviceType: entry.serviceType,
        scheduledDate: entry.scheduledDate,
        status: entry.status,
        estimatedCost: Number(entry.estimatedCost) || 0,
        notes: entry.notes,
        plateNumber: vehicle?.plateNumber || '',
        vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : '',
        companyName: account?.companyName || '',
      };
    });
    res.json({ schedule: enriched });
  } catch (err) {
    console.error('Fleet maintenance schedule error:', err);
    res.status(500).json({ message: 'Failed to load maintenance schedule' });
  }
});

// GET /api/fleet/analytics — Fleet analytics
router.get('/fleet/analytics', async (_req, res) => {
  try {
    const [accounts, vehicles, entries] = await Promise.all([
      storage.listFleetAccounts(),
      storage.listFleetAccountVehicles(),
      storage.listFleetMaintenanceEntries(),
    ]);

    const revenuePerAccount = accounts.map(a => {
      const own = vehicles.filter(v => v.fleetAccountId === a.id);
      const totalRevenue = own.reduce((sum, v) => sum + (Number(v.totalSpend) || 0), 0);
      return {
        accountId: a.id,
        companyName: a.companyName,
        totalRevenue,
        vehicleCount: own.length,
        avgCostPerVehicle: own.length > 0 ? Math.round(totalRevenue / own.length) : 0,
      };
    });

    const makeMap = new Map<string, { count: number; totalCost: number }>();
    for (const v of vehicles) {
      const entry = makeMap.get(v.make) || { count: 0, totalCost: 0 };
      entry.count += 1;
      entry.totalCost += Number(v.totalSpend) || 0;
      makeMap.set(v.make, entry);
    }
    const serviceByMake = Array.from(makeMap.entries()).map(([make, data]) => ({
      make,
      vehicleCount: data.count,
      totalCost: data.totalCost,
      avgCost: data.count > 0 ? Math.round(data.totalCost / data.count) : 0,
    }));

    // Monthly cost trend (simulated last 6 months — kept deterministic by index)
    const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
    const costTrend = months.map((month, i) => ({
      month,
      totalCost: Math.round(18000 + i * 1500),
      vehiclesServiced: 4 + i,
    }));

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const inService = vehicles.filter(v => v.status === 'in_service').length;
    const totalRevenue = vehicles.reduce((s, v) => s + (Number(v.totalSpend) || 0), 0);
    const avgCostPerVehicle = totalVehicles > 0 ? Math.round(totalRevenue / totalVehicles) : 0;
    const avgMileage = totalVehicles > 0 ? Math.round(vehicles.reduce((s, v) => s + (v.mileage || 0), 0) / totalVehicles) : 0;
    const overdueCount = entries.filter(m => m.status === 'overdue').length;

    res.json({
      summary: {
        totalAccounts: accounts.length,
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
  } catch (err) {
    console.error('Fleet analytics error:', err);
    res.status(500).json({ message: 'Failed to compute fleet analytics' });
  }
});

export default router;
