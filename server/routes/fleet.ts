import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { requireRole } from '../middleware/requireRole';

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
router.get('/fleet/accounts', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (_req, res) => {
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
router.get('/fleet/accounts/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req, res) => {
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
router.post('/fleet/accounts', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req, res) => {
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
router.get('/fleet/vehicles', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req, res) => {
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
router.get('/fleet/maintenance-schedule', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (req, res) => {
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
router.get('/fleet/analytics', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR']), async (_req, res) => {
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

// ─── Block 1: Fleet Groups CRUD ───────────────────────────────────────────────

router.post('/fleet/groups', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const fleetGroup = await storage.createFleetGroup({
      ...req.body,
      garageId: req.user?.garageId,
    });
    res.status(201).json(fleetGroup);
  } catch (error) {
    console.error("Error creating fleet group:", error);
    res.status(500).json({ message: "Failed to create fleet group" });
  }
});

router.get('/fleet/groups', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const fleetGroups = await storage.getFleetGroupsByGarage(req.user?.garageId);
    res.json(fleetGroups);
  } catch (error) {
    console.error("Error fetching fleet groups:", error);
    res.status(500).json({ message: "Failed to fetch fleet groups" });
  }
});

router.get('/fleet/groups/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const fleetGroup = await storage.getFleetGroup(req.params.id);
    if (!fleetGroup) {
      return res.status(404).json({ message: "Fleet group not found" });
    }
    res.json(fleetGroup);
  } catch (error) {
    console.error("Error fetching fleet group:", error);
    res.status(500).json({ message: "Failed to fetch fleet group" });
  }
});

router.patch('/fleet/groups/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const fleetGroup = await storage.updateFleetGroup(req.params.id, req.body);
    res.json(fleetGroup);
  } catch (error) {
    console.error("Error updating fleet group:", error);
    res.status(500).json({ message: "Failed to update fleet group" });
  }
});

router.delete('/fleet/groups/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    await storage.deleteFleetGroup(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting fleet group:", error);
    res.status(500).json({ message: "Failed to delete fleet group" });
  }
});

// ─── Block 1: Fleet Vehicles CRUD ─────────────────────────────────────────────

router.post('/fleet/vehicles', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const fleetVehicle = await storage.createFleetVehicle(req.body);
    res.status(201).json(fleetVehicle);
  } catch (error) {
    console.error("Error creating fleet vehicle:", error);
    res.status(500).json({ message: "Failed to create fleet vehicle" });
  }
});

router.get('/fleet/vehicles/group/:fleetGroupId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const fleetVehicles = await storage.getFleetVehiclesByGroup(req.params.fleetGroupId);
    res.json(fleetVehicles);
  } catch (error) {
    console.error("Error fetching fleet vehicles:", error);
    res.status(500).json({ message: "Failed to fetch fleet vehicles" });
  }
});

router.get('/fleet/vehicles/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const fleetVehicle = await storage.getFleetVehicle(req.params.id);
    if (!fleetVehicle) {
      return res.status(404).json({ message: "Fleet vehicle not found" });
    }
    res.json(fleetVehicle);
  } catch (error) {
    console.error("Error fetching fleet vehicle:", error);
    res.status(500).json({ message: "Failed to fetch fleet vehicle" });
  }
});

router.patch('/fleet/vehicles/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const fleetVehicle = await storage.updateFleetVehicle(req.params.id, req.body);
    res.json(fleetVehicle);
  } catch (error) {
    console.error("Error updating fleet vehicle:", error);
    res.status(500).json({ message: "Failed to update fleet vehicle" });
  }
});

router.delete('/fleet/vehicles/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    await storage.deleteFleetVehicle(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting fleet vehicle:", error);
    res.status(500).json({ message: "Failed to delete fleet vehicle" });
  }
});

// ─── Block 1: Fleet Contracts CRUD ────────────────────────────────────────────

router.post('/fleet/contracts', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const contract = await storage.createFleetContract({
      ...req.body,
      createdBy: req.user?.id,
    });
    res.status(201).json(contract);
  } catch (error) {
    console.error("Error creating fleet contract:", error);
    res.status(500).json({ message: "Failed to create fleet contract" });
  }
});

router.get('/fleet/contracts/group/:fleetGroupId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const contracts = await storage.getFleetContractsByGroup(req.params.fleetGroupId);
    res.json(contracts);
  } catch (error) {
    console.error("Error fetching fleet contracts:", error);
    res.status(500).json({ message: "Failed to fetch fleet contracts" });
  }
});

router.get('/fleet/contracts/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const contract = await storage.getFleetContract(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: "Fleet contract not found" });
    }
    res.json(contract);
  } catch (error) {
    console.error("Error fetching fleet contract:", error);
    res.status(500).json({ message: "Failed to fetch fleet contract" });
  }
});

router.patch('/fleet/contracts/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const contract = await storage.updateFleetContract(req.params.id, req.body);
    res.json(contract);
  } catch (error) {
    console.error("Error updating fleet contract:", error);
    res.status(500).json({ message: "Failed to update fleet contract" });
  }
});

router.delete('/fleet/contracts/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    await storage.deleteFleetContract(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting fleet contract:", error);
    res.status(500).json({ message: "Failed to delete fleet contract" });
  }
});

// ─── Block 2: Fleet Pricing Tiers CRUD ────────────────────────────────────────

router.post('/fleet/pricing-tiers', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const tier = await storage.createFleetPricingTier({
      ...req.body,
      garageId: req.user?.garageId,
    });
    res.status(201).json(tier);
  } catch (error) {
    console.error("Error creating pricing tier:", error);
    res.status(500).json({ message: "Failed to create pricing tier" });
  }
});

router.get('/fleet/pricing-tiers', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { fleetGroupId } = req.query;
    const tiers = fleetGroupId
      ? await storage.getFleetPricingTiersByGroup(fleetGroupId as string)
      : await storage.getFleetPricingTiersByGarage(req.user?.garageId);
    res.json(tiers);
  } catch (error) {
    console.error("Error fetching pricing tiers:", error);
    res.status(500).json({ message: "Failed to fetch pricing tiers" });
  }
});

router.get('/fleet/pricing-tiers/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const tier = await storage.getFleetPricingTier(req.params.id);
    if (!tier) {
      return res.status(404).json({ message: "Pricing tier not found" });
    }
    res.json(tier);
  } catch (error) {
    console.error("Error fetching pricing tier:", error);
    res.status(500).json({ message: "Failed to fetch pricing tier" });
  }
});

router.patch('/fleet/pricing-tiers/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const tier = await storage.updateFleetPricingTier(req.params.id, req.body);
    res.json(tier);
  } catch (error) {
    console.error("Error updating pricing tier:", error);
    res.status(500).json({ message: "Failed to update pricing tier" });
  }
});

router.delete('/fleet/pricing-tiers/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    await storage.deleteFleetPricingTier(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting pricing tier:", error);
    res.status(500).json({ message: "Failed to delete pricing tier" });
  }
});

// ─── Block 2: Fleet Maintenance Schedules CRUD ───────────────────────────────

router.post('/fleet/maintenance-schedules', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schedule = await storage.createFleetMaintenanceSchedule(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    res.status(500).json({ message: "Failed to create maintenance schedule" });
  }
});

router.get('/fleet/maintenance-schedules/group/:fleetGroupId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schedules = await storage.getFleetMaintenanceSchedulesByGroup(req.params.fleetGroupId);
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    res.status(500).json({ message: "Failed to fetch maintenance schedules" });
  }
});

router.get('/fleet/maintenance-schedules/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schedule = await storage.getFleetMaintenanceSchedule(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Maintenance schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    console.error("Error fetching maintenance schedule:", error);
    res.status(500).json({ message: "Failed to fetch maintenance schedule" });
  }
});

router.patch('/fleet/maintenance-schedules/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const schedule = await storage.updateFleetMaintenanceSchedule(req.params.id, req.body);
    res.json(schedule);
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    res.status(500).json({ message: "Failed to update maintenance schedule" });
  }
});

router.delete('/fleet/maintenance-schedules/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    await storage.deleteFleetMaintenanceSchedule(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    res.status(500).json({ message: "Failed to delete maintenance schedule" });
  }
});

// ─── Block 3: Fleet Tracking & GPS — Locations ───────────────────────────────

router.post('/fleet/locations', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, latitude, longitude, altitude, speed, heading, accuracy, source, driverId, jobCardId, mileage, engineStatus, fuelLevel, batteryVoltage } = req.body;

    // Validate required fields
    if (!vehicleId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Vehicle ID, latitude, and longitude are required" });
    }

    // Verify vehicle ownership
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const location = await storage.recordVehicleLocation({
      vehicleId,
      latitude,
      longitude,
      altitude,
      speed,
      heading,
      accuracy,
      source,
      driverId,
      jobCardId,
      mileage,
      engineStatus,
      fuelLevel,
      batteryVoltage,
    });

    res.json(location);
  } catch (error: any) {
    console.error("Error recording location:", error);
    res.status(500).json({ message: "Failed to record location" });
  }
});

router.get('/fleet/vehicles/:vehicleId/locations', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const vehicle = await storage.getVehicle(req.params.vehicleId);

    if (!vehicle || vehicle.garageId !== userGarageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const locations = await storage.getVehicleLocationHistory(req.params.vehicleId, startDate, endDate, limit);
    res.json(locations);
  } catch (error: any) {
    console.error("Error fetching location history:", error);
    res.status(500).json({ message: "Failed to fetch location history" });
  }
});

router.get('/fleet/vehicles/:vehicleId/location/latest', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const vehicle = await storage.getVehicle(req.params.vehicleId);

    if (!vehicle || vehicle.garageId !== userGarageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const location = await storage.getLatestVehicleLocation(req.params.vehicleId);
    res.json(location || null);
  } catch (error: any) {
    console.error("Error fetching latest location:", error);
    res.status(500).json({ message: "Failed to fetch latest location" });
  }
});

// ─── Block 3: Geofences CRUD ─────────────────────────────────────────────────

router.get('/fleet/geofences', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const zones = await storage.getGeofenceZones(req.user?.garageId);
    res.json(zones);
  } catch (error: any) {
    console.error("Error fetching geofence zones:", error);
    res.status(500).json({ message: "Failed to fetch geofence zones" });
  }
});

router.post('/fleet/geofences', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { name, description, zoneType, geometry, centerLatitude, centerLongitude, radius, alertOnEntry, alertOnExit, color } = req.body;

    if (!name || !zoneType || !geometry) {
      return res.status(400).json({ message: "Name, zone type, and geometry are required" });
    }

    const zone = await storage.createGeofenceZone({
      garageId: req.user?.garageId,
      name,
      description,
      zoneType,
      geometry,
      centerLatitude,
      centerLongitude,
      radius,
      alertOnEntry,
      alertOnExit,
      color,
      createdBy: req.user?.id,
    });

    res.json(zone);
  } catch (error: any) {
    console.error("Error creating geofence zone:", error);
    res.status(500).json({ message: "Failed to create geofence zone" });
  }
});

router.patch('/fleet/geofences/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const zone = await storage.getGeofenceZone(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: "Geofence zone not found" });
    }

    if (zone.garageId !== req.user?.garageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedZone = await storage.updateGeofenceZone(req.params.id, req.body);
    res.json(updatedZone);
  } catch (error: any) {
    console.error("Error updating geofence zone:", error);
    res.status(500).json({ message: "Failed to update geofence zone" });
  }
});

router.delete('/fleet/geofences/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const zone = await storage.getGeofenceZone(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: "Geofence zone not found" });
    }

    if (zone.garageId !== req.user?.garageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await storage.deleteGeofenceZone(req.params.id);
    res.json({ message: "Geofence zone deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting geofence zone:", error);
    res.status(500).json({ message: "Failed to delete geofence zone" });
  }
});

// ─── Block 3: Geofence Events ────────────────────────────────────────────────

router.get('/fleet/geofence-events', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const zoneId = req.query.zoneId as string;
    const vehicleId = req.query.vehicleId as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    // If zoneId provided, verify ownership
    if (zoneId) {
      const zone = await storage.getGeofenceZone(zoneId);
      if (!zone || zone.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // If vehicleId provided, verify ownership
    if (vehicleId) {
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const events = await storage.getGeofenceEvents(zoneId, vehicleId, startDate, limit);
    res.json(events);
  } catch (error: any) {
    console.error("Error fetching geofence events:", error);
    res.status(500).json({ message: "Failed to fetch geofence events" });
  }
});

// ─── Block 3: Fleet Routes CRUD ──────────────────────────────────────────────

router.get('/fleet/routes', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const status = req.query.status as string;
    const routes = await storage.getFleetRoutes(req.user?.garageId, status);
    res.json(routes);
  } catch (error: any) {
    console.error("Error fetching fleet routes:", error);
    res.status(500).json({ message: "Failed to fetch fleet routes" });
  }
});

router.post('/fleet/routes', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { routeName, description, vehicleId, driverId, jobCardIds, startLocation, endLocation, waypoints, scheduledStartTime } = req.body;

    if (!routeName || !startLocation) {
      return res.status(400).json({ message: "Route name and start location are required" });
    }

    // Verify vehicle ownership if provided
    if (vehicleId) {
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle || vehicle.garageId !== req.user?.garageId) {
        return res.status(403).json({ message: "Invalid vehicle" });
      }
    }

    const route = await storage.createFleetRoute({
      garageId: req.user?.garageId,
      routeName,
      description,
      vehicleId,
      driverId,
      jobCardIds,
      startLocation,
      endLocation,
      waypoints,
      scheduledStartTime,
      createdBy: req.user?.id,
    });

    res.json(route);
  } catch (error: any) {
    console.error("Error creating fleet route:", error);
    res.status(500).json({ message: "Failed to create fleet route" });
  }
});

router.get('/fleet/routes/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const route = await storage.getFleetRoute(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    if (route.garageId !== req.user?.garageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const checkpoints = await storage.getRouteCheckpoints(req.params.id);
    res.json({ ...route, checkpoints });
  } catch (error: any) {
    console.error("Error fetching route:", error);
    res.status(500).json({ message: "Failed to fetch route" });
  }
});

router.patch('/fleet/routes/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const route = await storage.getFleetRoute(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    if (route.garageId !== req.user?.garageId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedRoute = await storage.updateFleetRoute(req.params.id, req.body);
    res.json(updatedRoute);
  } catch (error: any) {
    console.error("Error updating route:", error);
    res.status(500).json({ message: "Failed to update route" });
  }
});

export default router;
