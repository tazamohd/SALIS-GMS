import { describe, it, expect, vi } from 'vitest';
import { FleetService } from '../services/fleet.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    listAccounts: vi.fn(async () => [{ id: 'a1', companyName: 'Acme', monthlySpend: '100', totalSpend: '500' }]),
    getAccount: vi.fn(async () => undefined),
    createAccount: vi.fn(async (d: unknown) => ({ id: 'a9', ...(d as object) })),
    listVehicles: vi.fn(async () => []),
    listMaintenance: vi.fn(async () => []),
    ...o,
  };
}

describe('FleetService', () => {
  it('enriches accounts with per-account vehicle counts and active jobs', async () => {
    const r = repo({
      listVehicles: vi.fn(async () => [
        { id: 'v1', fleetAccountId: 'a1', status: 'in_service', make: 'Toyota', totalSpend: '200' },
        { id: 'v2', fleetAccountId: 'a1', status: 'active', make: 'Toyota', totalSpend: '0' },
        { id: 'v3', fleetAccountId: 'other', status: 'in_service', make: 'Ford', totalSpend: '0' },
      ]),
    });
    const out = await new FleetService(r as never).listAccounts('g1');
    expect(out.accounts[0].vehicleCount).toBe(2); // only a1's vehicles
    expect(out.accounts[0].activeJobs).toBe(1); // in_service counts, active does not
    expect(out.accounts[0].monthlySpend).toBe(100); // string → number
  });

  it('404s a missing account detail', async () => {
    await expect(new FleetService(repo() as never).accountDetail('x', 'g1')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('restricts fleet vehicles to the caller-owned accounts (tenant scope)', async () => {
    const r = repo({
      listAccounts: vi.fn(async () => [{ id: 'a1', companyName: 'Acme' }]),
      listVehicles: vi.fn(async () => [
        { id: 'v1', fleetAccountId: 'a1', make: 'Toyota', totalSpend: '10' },
        { id: 'v2', fleetAccountId: 'foreign', make: 'Ford', totalSpend: '10' },
      ]),
    });
    const out = await new FleetService(r as never).listVehicles('g1');
    expect(out.vehicles).toHaveLength(1);
    expect(out.vehicles[0].id).toBe('v1');
    expect(out.vehicles[0].companyName).toBe('Acme');
  });

  it('filters the maintenance schedule to owned accounts and joins vehicle/company', async () => {
    const r = repo({
      listAccounts: vi.fn(async () => [{ id: 'a1', companyName: 'Acme' }]),
      listVehicles: vi.fn(async () => [{ id: 'v1', fleetAccountId: 'a1', make: 'Toyota', model: 'Hilux', plateNumber: 'ABC' }]),
      listMaintenance: vi.fn(async () => [
        { id: 'm1', fleetAccountId: 'a1', vehicleId: 'v1', serviceType: 'oil', estimatedCost: '50', status: 'scheduled' },
        { id: 'm2', fleetAccountId: 'foreign', vehicleId: 'vx', serviceType: 'tires', estimatedCost: '80', status: 'scheduled' },
      ]),
    });
    const out = await new FleetService(r as never).maintenanceSchedule('g1');
    expect(out.schedule).toHaveLength(1);
    expect(out.schedule[0]).toMatchObject({ id: 'm1', plateNumber: 'ABC', vehicleName: 'Toyota Hilux', companyName: 'Acme', estimatedCost: 50 });
  });

  it('creates an account with the legacy defaults and returns the enriched shape', async () => {
    const r = repo();
    const out = await new FleetService(r as never).createAccount('g1', { companyName: 'NewCo' });
    const arg = r.createAccount.mock.calls[0][0] as Record<string, unknown>;
    expect(arg).toMatchObject({ garageId: 'g1', companyName: 'NewCo', contractStatus: 'pending', paymentTerms: 'Net 30', monthlySpend: '0' });
    expect(out.account.companyName).toBe('NewCo');
    expect(out.account.vehicleCount).toBe(0);
  });

  it('rolls up analytics summary, revenue-per-account, and service-by-make', async () => {
    const r = repo({
      listAccounts: vi.fn(async () => [{ id: 'a1', companyName: 'Acme' }]),
      listVehicles: vi.fn(async () => [
        { id: 'v1', fleetAccountId: 'a1', make: 'Toyota', status: 'active', totalSpend: '300', mileage: 1000 },
        { id: 'v2', fleetAccountId: 'a1', make: 'Toyota', status: 'in_service', totalSpend: '100', mileage: 3000 },
      ]),
      listMaintenance: vi.fn(async () => [{ status: 'overdue' }]),
    });
    const out = await new FleetService(r as never).analytics('g1');
    expect(out.summary).toMatchObject({ totalAccounts: 1, totalVehicles: 2, activeVehicles: 1, inService: 1, totalRevenue: 400, avgMileage: 2000, overdueMaintenanceCount: 1 });
    expect(out.revenuePerAccount[0]).toMatchObject({ accountId: 'a1', totalRevenue: 400, vehicleCount: 2, avgCostPerVehicle: 200 });
    expect(out.serviceByMake[0]).toMatchObject({ make: 'Toyota', vehicleCount: 2, totalCost: 400, avgCost: 200 });
    expect(out.costTrend).toHaveLength(6);
  });
});
