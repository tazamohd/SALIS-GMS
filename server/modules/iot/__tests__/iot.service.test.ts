import { describe, it, expect, vi } from 'vitest';
import { IotService } from '../services/iot.service';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getVehicles: vi.fn(async () => [{ id: 'v1' }, { id: 'v2' }]),
    getVehicle: vi.fn(async () => ({ id: 'v1', garageId: 'g1' })),
    getJobCard: vi.fn(async () => ({ id: 'jc1', garageId: 'g1' })),
    getIotSensors: vi.fn(async () => [{ id: 's1', vehicleId: 'v1', sensorType: 'temp', status: 'active' }, { id: 's2', vehicleId: 'other', sensorType: 'psi', status: 'inactive' }]),
    getIotSensor: vi.fn(async () => ({ id: 's1', vehicleId: 'v1' })),
    createIotSensor: vi.fn(async (d: Record<string, unknown>) => ({ id: 's1', ...d })),
    updateIotSensor: vi.fn(async () => ({ id: 's1', status: 'inactive' })),
    deleteIotSensor: vi.fn(async () => undefined),
    recordSensorReading: vi.fn(async () => ({ id: 'r1' })),
    getSensorReadings: vi.fn(async () => [{ id: 'r1', value: 42 }]),
    getRecentAnomalies: vi.fn(async () => [{ id: 'an1' }]),
    getIotAlerts: vi.fn(async () => [{ id: 'a1', vehicleId: 'v1', status: 'active', severity: 'critical' }, { id: 'a2', vehicleId: 'other', status: 'resolved', severity: 'low' }]),
    getIotAlert: vi.fn(async () => ({ id: 'a1', vehicleId: 'v1' })),
    acknowledgeIotAlert: vi.fn(async () => ({ id: 'a1', status: 'acknowledged' })),
    resolveIotAlert: vi.fn(async () => ({ id: 'a1', status: 'resolved' })),
    ...o,
  };
}

describe('IotService — sensors + ownership', () => {
  it('filters sensors to the caller garage vehicles', async () => {
    const sensors = await new IotService(repo() as never).listSensors('g1');
    expect(sensors.map((s: { id: string }) => s.id)).toEqual(['s1']);
  });
  it('403s a sensor list filtered to a vehicle outside the garage', async () => {
    await expect(new IotService(repo() as never).listSensors('g1', 'notmine')).rejects.toBeInstanceOf(AuthorizationError);
  });
  it('404s a missing sensor and 403s a cross-garage sensor on get', async () => {
    await expect(new IotService(repo({ getIotSensor: vi.fn(async () => undefined) }) as never).getSensor('s1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new IotService(repo({ getVehicle: vi.fn(async () => ({ id: 'v1', garageId: 'other' })) }) as never).getSensor('s1', 'g1'))
      .rejects.toBeInstanceOf(AuthorizationError);
  });
  it('403s a create when the target vehicle is not owned', async () => {
    await expect(new IotService(repo({ getVehicle: vi.fn(async () => ({ id: 'v1', garageId: 'other' })) }) as never).createSensor('g1', { vehicleId: 'v1' }))
      .rejects.toBeInstanceOf(AuthorizationError);
  });
  it('deletes an owned sensor with the legacy message', async () => {
    expect(await new IotService(repo() as never).deleteSensor('s1', 'g1')).toEqual({ message: 'Sensor deleted successfully' });
  });
});

describe('IotService — readings', () => {
  it('404s a reading for a missing sensor', async () => {
    await expect(new IotService(repo({ getIotSensor: vi.fn(async () => undefined) }) as never).recordReading({ sensorId: 's1' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it('400s an invalid start/end date on readings', async () => {
    await expect(new IotService(repo() as never).getReadings('s1', 'g1', 'not-a-date'))
      .rejects.toBeInstanceOf(ValidationError);
    await expect(new IotService(repo() as never).getReadings('s1', 'g1', undefined, 'nope'))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it('builds a latest-readings map keyed by sensorType', async () => {
    const latest = await new IotService(repo() as never).latestReadings('v1', 'g1');
    expect(latest).toHaveProperty('temp');
  });
});

describe('IotService — alerts', () => {
  it('filters alerts to the garage vehicles', async () => {
    const alerts = await new IotService(repo() as never).listAlerts('g1');
    expect(alerts.map((a: { id: string }) => a.id)).toEqual(['a1']);
  });
  it('acknowledge 404s a missing alert, else delegates', async () => {
    await expect(new IotService(repo({ getIotAlert: vi.fn(async () => undefined) }) as never).acknowledgeAlert('a1', 'g1', 'u1'))
      .rejects.toBeInstanceOf(NotFoundError);
    const r = repo();
    await new IotService(r as never).acknowledgeAlert('a1', 'g1', 'u1');
    expect(r.acknowledgeIotAlert).toHaveBeenCalledWith('a1', 'u1');
  });
  it('resolve requires resolution text, rejects a foreign job card, else resolves', async () => {
    await expect(new IotService(repo() as never).resolveAlert('a1', 'g1', 'u1', {})).rejects.toBeInstanceOf(ValidationError);
    await expect(new IotService(repo({ getJobCard: vi.fn(async () => ({ id: 'jc1', garageId: 'other' })) }) as never)
      .resolveAlert('a1', 'g1', 'u1', { resolution: 'fixed', jobCardId: 'jc1' })).rejects.toBeInstanceOf(AuthorizationError);
    const r = repo();
    await new IotService(r as never).resolveAlert('a1', 'g1', 'u1', { resolution: 'fixed' });
    expect(r.resolveIotAlert).toHaveBeenCalledWith('a1', 'u1', 'fixed', undefined);
  });
});

describe('IotService — dashboard', () => {
  it('aggregates sensors + alerts for the garage vehicles', async () => {
    const summary = await new IotService(repo() as never).dashboardSummary('g1');
    expect(summary).toMatchObject({ totalSensors: 1, activeSensors: 1, totalAlerts: 1, activeAlerts: 1, criticalAlerts: 1 });
  });
});
