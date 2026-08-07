import { describe, it, expect, vi } from 'vitest';
import { FleetManagementService } from '../services/fleet-management.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    createGroup: vi.fn(async (d) => ({ id: 'g1', ...(d as object) })),
    listGroupsByGarage: vi.fn(async () => [{ id: 'g1' }]),
    getGroup: vi.fn(async () => undefined),
    updateGroup: vi.fn(async () => ({ id: 'g1' })),
    deleteGroup: vi.fn(async () => undefined),
    createVehicle: vi.fn(async (d) => ({ id: 'v1', ...(d as object) })),
    listVehiclesByGroup: vi.fn(async () => [{ id: 'v1' }]),
    getVehicle: vi.fn(async () => undefined),
    updateVehicle: vi.fn(async () => ({ id: 'v1' })),
    deleteVehicle: vi.fn(async () => undefined),
    createContract: vi.fn(async (d) => ({ id: 'c1', ...(d as object) })),
    listContractsByGroup: vi.fn(async () => [{ id: 'c1' }]),
    getContract: vi.fn(async () => undefined),
    updateContract: vi.fn(async () => ({ id: 'c1' })),
    deleteContract: vi.fn(async () => undefined),
    createPricingTier: vi.fn(async (d) => ({ id: 't1', ...(d as object) })),
    listPricingTiersByGroup: vi.fn(async () => [{ id: 't-group' }]),
    listPricingTiersByGarage: vi.fn(async () => [{ id: 't-garage' }]),
    getPricingTier: vi.fn(async () => undefined),
    updatePricingTier: vi.fn(async () => ({ id: 't1' })),
    deletePricingTier: vi.fn(async () => undefined),
    createMaintenanceSchedule: vi.fn(async (d) => ({ id: 'm1', ...(d as object) })),
    listMaintenanceSchedulesByGroup: vi.fn(async () => [{ id: 'm1' }]),
    getMaintenanceSchedule: vi.fn(async () => undefined),
    updateMaintenanceSchedule: vi.fn(async () => ({ id: 'm1' })),
    deleteMaintenanceSchedule: vi.fn(async () => undefined),
    ...o,
  };
}

describe('FleetManagementService', () => {
  it('404s each aggregate by-id with its legacy message', async () => {
    const s = new FleetManagementService(repo() as never);
    await expect(s.getGroup('x')).rejects.toThrow('Fleet group not found');
    await expect(s.getVehicle('x')).rejects.toThrow('Fleet vehicle not found');
    await expect(s.getContract('x')).rejects.toThrow('Fleet contract not found');
    await expect(s.getPricingTier('x')).rejects.toThrow('Pricing tier not found');
    await expect(s.getMaintenanceSchedule('x')).rejects.toThrow('Maintenance schedule not found');
  });

  it('by-id throws are NotFoundError instances (mapped to 404 by the controller)', async () => {
    await expect(new FleetManagementService(repo() as never).getGroup('x')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns an existing aggregate without throwing', async () => {
    const s = new FleetManagementService(repo({ getVehicle: vi.fn(async () => ({ id: 'v1' })) }) as never);
    expect(await s.getVehicle('v1')).toEqual({ id: 'v1' });
  });

  it('pricing-tier list branches on the fleetGroupId filter', async () => {
    const r = repo();
    const s = new FleetManagementService(r as never);
    expect(await s.listPricingTiers('g1', undefined)).toEqual([{ id: 't-garage' }]);
    expect(r.listPricingTiersByGarage).toHaveBeenCalledWith('g1');
    expect(await s.listPricingTiers('g1', 'grp1')).toEqual([{ id: 't-group' }]);
    expect(r.listPricingTiersByGroup).toHaveBeenCalledWith('grp1');
  });

  it('delegates create/list/update/delete to the repository', async () => {
    const r = repo();
    const s = new FleetManagementService(r as never);
    await s.createGroup({ name: 'A', garageId: 'g1' });
    expect(r.createGroup).toHaveBeenCalledWith({ name: 'A', garageId: 'g1' });
    await s.listVehiclesByGroup('grp1');
    expect(r.listVehiclesByGroup).toHaveBeenCalledWith('grp1');
    await s.updateContract('c1', { status: 'active' });
    expect(r.updateContract).toHaveBeenCalledWith('c1', { status: 'active' });
    await s.deleteMaintenanceSchedule('m1');
    expect(r.deleteMaintenanceSchedule).toHaveBeenCalledWith('m1');
  });
});
