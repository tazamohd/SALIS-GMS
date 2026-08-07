/**
 * Fleet service (Phase E5 — Domain Services).
 *
 * Owns the fleet-accounts read model: account enrichment, the tenant-scope
 * filter (fleet_account_vehicles / maintenance entries have no garage_id, so
 * they are restricted to the caller's own accounts — audit medium #5), the
 * create defaults, and the analytics roll-ups. Behavior mirrors the legacy
 * `server/routes/fleet.ts` handlers exactly; data access flows through the
 * injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IFleetRepository } from '../repositories/fleet.repository';
import { enrichAccount, viewVehicle, buildCostTrend } from '../domain/fleet.types';

export interface CreateFleetAccountBody {
  companyName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  discountPercentage?: number;
  paymentTerms?: string;
  notes?: string;
}

export class FleetService {
  constructor(private readonly repository: IFleetRepository) {}

  async listAccounts(garageId?: string) {
    const [accounts, vehicles] = await Promise.all([
      this.repository.listAccounts(garageId),
      this.repository.listVehicles(),
    ]);
    return { accounts: accounts.map((a) => enrichAccount(a, vehicles)) };
  }

  async accountDetail(id: string, garageId?: string) {
    const account = await this.repository.getAccount(id, garageId);
    if (!account) throw new NotFoundError('Fleet account not found', { context: { id } });
    const [vehicles, upcoming] = await Promise.all([
      this.repository.listVehicles(account.id),
      this.repository.listMaintenance(account.id),
    ]);
    return {
      account: enrichAccount(account, vehicles),
      vehicles: vehicles.map((v) => viewVehicle(v, account)),
      upcomingMaintenance: upcoming,
    };
  }

  async createAccount(garageId: string | undefined, body: CreateFleetAccountBody) {
    const created = await this.repository.createAccount({
      garageId,
      companyName: body.companyName,
      contactPerson: body.contactPerson || '',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      contractStatus: 'pending',
      contractStart: null,
      contractEnd: null,
      monthlySpend: '0',
      totalSpend: '0',
      discountPercentage: typeof body.discountPercentage === 'number' ? body.discountPercentage : 0,
      paymentTerms: body.paymentTerms || 'Net 30',
      notes: body.notes || '',
    } as any);
    return { account: enrichAccount(created, []) };
  }

  async listVehicles(garageId: string | undefined, accountId?: string) {
    const [vehicles, accounts] = await Promise.all([
      this.repository.listVehicles(accountId),
      this.repository.listAccounts(garageId),
    ]);
    // Tenant scope (audit medium #5): restrict to vehicles whose fleet account
    // belongs to the caller's garage.
    const ownAccountIds = new Set(accounts.map((a) => a.id));
    const enriched = vehicles
      .filter((v) => ownAccountIds.has(v.fleetAccountId))
      .map((v) => viewVehicle(v, accounts.find((a) => a.id === v.fleetAccountId)));
    return { vehicles: enriched };
  }

  async maintenanceSchedule(garageId: string | undefined, accountId?: string) {
    const [entries, vehicles, accounts] = await Promise.all([
      this.repository.listMaintenance(accountId),
      this.repository.listVehicles(),
      this.repository.listAccounts(garageId),
    ]);
    const ownAccountIds = new Set(accounts.map((a) => a.id));
    const enriched = entries
      .filter((e) => ownAccountIds.has(e.fleetAccountId))
      .map((entry) => {
        const vehicle = vehicles.find((v) => v.id === entry.vehicleId);
        const account = accounts.find((a) => a.id === entry.fleetAccountId);
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
    return { schedule: enriched };
  }

  async analytics(garageId?: string) {
    const [accounts, vehicles, entries] = await Promise.all([
      this.repository.listAccounts(garageId),
      this.repository.listVehicles(),
      this.repository.listMaintenance(),
    ]);

    const revenuePerAccount = accounts.map((a) => {
      const own = vehicles.filter((v) => v.fleetAccountId === a.id);
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

    const costTrend = buildCostTrend();

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
    const inService = vehicles.filter((v) => v.status === 'in_service').length;
    const totalRevenue = vehicles.reduce((s, v) => s + (Number(v.totalSpend) || 0), 0);
    const avgCostPerVehicle = totalVehicles > 0 ? Math.round(totalRevenue / totalVehicles) : 0;
    const avgMileage =
      totalVehicles > 0
        ? Math.round(vehicles.reduce((s, v) => s + (v.mileage || 0), 0) / totalVehicles)
        : 0;
    const overdueCount = entries.filter((m) => m.status === 'overdue').length;

    return {
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
    };
  }
}
