import { describe, it, expect, vi } from 'vitest';
import { VehicleService } from '../services/vehicle.service';
import type { IVehicleRepository } from '../repositories/vehicle.repository';

function makeRepo(overrides: Partial<IVehicleRepository> = {}): IVehicleRepository {
  return {
    listPaginated: vi.fn(async () => [] as never),
    count: vi.fn(async () => 0),
    getServiceHistory: vi.fn(async () => [] as never),
    getMaintenanceSchedules: vi.fn(async () => [] as never),
    getServiceReminders: vi.fn(async () => [] as never),
    ...overrides,
  };
}

describe('VehicleService.list', () => {
  it('pins to the session garage and ignores ?garageId for a tenant user', async () => {
    const repo = makeRepo({
      listPaginated: vi.fn(async () => [{ id: 'v1' }] as never),
      count: vi.fn(async () => 3),
    });
    const service = new VehicleService(repo);
    const result = await service.list({
      auth: { garageId: 'g1' },
      garageIdParam: 'g2',
      limit: 50,
      offset: 0,
    });
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 50, 0);
    expect(repo.count).toHaveBeenCalledWith('g1');
    expect(result).toEqual({ rows: [{ id: 'v1' }], total: 3 });
  });

  it('honors ?garageId for a platform (garage-less) user', async () => {
    const repo = makeRepo();
    const service = new VehicleService(repo);
    await service.list({ auth: { garageId: null }, garageIdParam: 'g2', limit: 25, offset: 10 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', 25, 10);
  });
});

describe('VehicleService sub-resource reads', () => {
  it('delegates service history to the repository', async () => {
    const repo = makeRepo({ getServiceHistory: vi.fn(async () => [{ id: 'h1' }] as never) });
    const service = new VehicleService(repo);
    expect(await service.serviceHistory('v1')).toEqual([{ id: 'h1' }]);
    expect(repo.getServiceHistory).toHaveBeenCalledWith('v1');
  });

  it('delegates maintenance schedules to the repository', async () => {
    const repo = makeRepo({ getMaintenanceSchedules: vi.fn(async () => [{ id: 's1' }] as never) });
    const service = new VehicleService(repo);
    expect(await service.maintenanceSchedules('v1')).toEqual([{ id: 's1' }]);
    expect(repo.getMaintenanceSchedules).toHaveBeenCalledWith('v1');
  });

  it('threads the status filter into service reminders', async () => {
    const repo = makeRepo({ getServiceReminders: vi.fn(async () => [{ id: 'r1' }] as never) });
    const service = new VehicleService(repo);
    await service.serviceReminders('v1', 'due');
    expect(repo.getServiceReminders).toHaveBeenCalledWith('v1', 'due');
  });
});
