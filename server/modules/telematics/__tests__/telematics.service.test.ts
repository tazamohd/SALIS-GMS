import { describe, it, expect, vi } from 'vitest';
import { TelematicsService } from '../services/telematics.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getTelematicsFeeds: vi.fn(async () => [{ id: 'f1' }]),
    createTelematicsFeed: vi.fn(async (d: Record<string, unknown>) => ({ id: 'f1', ...d })),
    getTelematicsAlerts: vi.fn(async () => [{ id: 'a1' }]),
    createTelematicsAlert: vi.fn(async (d: Record<string, unknown>) => ({ id: 'a1', ...d })),
    resolveTelematicsAlert: vi.fn(async () => ({ id: 'a1', isResolved: true })),
    getTelematicsDeviceByVehicle: vi.fn(async () => ({ id: 'd1' })),
    getTelematicsReadings: vi.fn(async () => [{ id: 'r1' }]),
    ...o,
  };
}

describe('TelematicsService — feeds + alerts', () => {
  it('passes the feed vehicle/device filters through', async () => {
    const r = repo();
    await new TelematicsService(r as never).listFeeds('v1', 'dev1');
    expect(r.getTelematicsFeeds).toHaveBeenCalledWith('v1', 'dev1');
  });
  it('passes the alert vehicle/isResolved filters through', async () => {
    const r = repo();
    await new TelematicsService(r as never).listAlerts('v1', true);
    expect(r.getTelematicsAlerts).toHaveBeenCalledWith('v1', true);
  });
  it('resolves an alert with the caller id', async () => {
    const r = repo();
    await new TelematicsService(r as never).resolveAlert('a1', 'u1');
    expect(r.resolveTelematicsAlert).toHaveBeenCalledWith('a1', 'u1');
  });
});

describe('TelematicsService — device + readings', () => {
  it('404s when the vehicle has no telematics device, else returns it', async () => {
    await expect(new TelematicsService(repo({ getTelematicsDeviceByVehicle: vi.fn(async () => null) }) as never).getDevice('v1'))
      .rejects.toBeInstanceOf(NotFoundError);
    expect(await new TelematicsService(repo() as never).getDevice('v1')).toEqual({ id: 'd1' });
  });
  it('defaults the readings window to 24h and forwards streamType', async () => {
    const r = repo();
    const svc = new TelematicsService(r as never);
    await svc.getReadings('v1', 'speed');
    expect(r.getTelematicsReadings).toHaveBeenCalledWith('v1', 'speed', 24);
    await svc.getReadings('v1', 'rpm', 48);
    expect(r.getTelematicsReadings).toHaveBeenCalledWith('v1', 'rpm', 48);
  });
});
