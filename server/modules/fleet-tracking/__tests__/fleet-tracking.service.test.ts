import { describe, it, expect, vi } from 'vitest';
import { FleetTrackingService } from '../services/fleet-tracking.service';
import { AuthorizationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getVehicle: vi.fn(async () => ({ id: 'v1', garageId: 'g1' })),
    recordLocation: vi.fn(async (d) => ({ id: 'loc1', ...(d as object) })),
    locationHistory: vi.fn(async () => [{ id: 'loc1' }]),
    latestLocation: vi.fn(async () => undefined),
    listGeofences: vi.fn(async () => [{ id: 'z1' }]),
    createGeofence: vi.fn(async (d) => ({ id: 'z9', ...(d as object) })),
    getGeofence: vi.fn(async () => ({ id: 'z1', garageId: 'g1' })),
    updateGeofence: vi.fn(async () => ({ id: 'z1' })),
    deleteGeofence: vi.fn(async () => undefined),
    geofenceEvents: vi.fn(async () => [{ id: 'e1' }]),
    listRoutes: vi.fn(async () => [{ id: 'r1' }]),
    createRoute: vi.fn(async (d) => ({ id: 'r9', ...(d as object) })),
    getRoute: vi.fn(async () => ({ id: 'r1', garageId: 'g1' })),
    routeCheckpoints: vi.fn(async () => [{ id: 'cp1' }]),
    updateRoute: vi.fn(async () => ({ id: 'r1' })),
    ...o,
  };
}

describe('FleetTrackingService', () => {
  it('403s a location write for a missing or foreign vehicle', async () => {
    const s = new FleetTrackingService(repo({ getVehicle: vi.fn(async () => undefined) }) as never);
    await expect(s.recordLocation('g1', 'v1', { latitude: 1, longitude: 2 })).rejects.toBeInstanceOf(
      AuthorizationError,
    );
    const foreign = new FleetTrackingService(repo({ getVehicle: vi.fn(async () => ({ id: 'v1', garageId: 'other' })) }) as never);
    await expect(foreign.latestLocation('g1', 'v1')).rejects.toThrow('Access denied');
  });

  it('records a location (prefixing the verified vehicleId) and coalesces latest to null', async () => {
    const r = repo();
    const s = new FleetTrackingService(r as never);
    await s.recordLocation('g1', 'v1', { latitude: 1, longitude: 2, speed: 30 });
    expect(r.recordLocation).toHaveBeenCalledWith({ vehicleId: 'v1', latitude: 1, longitude: 2, speed: 30 });
    expect(await s.latestLocation('g1', 'v1')).toBeNull();
  });

  it('geofence update 404s a missing zone and 403s a foreign one', async () => {
    const missing = new FleetTrackingService(repo({ getGeofence: vi.fn(async () => undefined) }) as never);
    await expect(missing.updateGeofence('z1', 'g1', {})).rejects.toBeInstanceOf(NotFoundError);
    const foreign = new FleetTrackingService(repo({ getGeofence: vi.fn(async () => ({ id: 'z1', garageId: 'other' })) }) as never);
    await expect(foreign.deleteGeofence('z1', 'g1')).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('geofence-events 403 (not 404) when the referenced zone is missing', async () => {
    const s = new FleetTrackingService(repo({ getGeofence: vi.fn(async () => undefined) }) as never);
    await expect(s.geofenceEvents('g1', { zoneId: 'zX' })).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('geofence-events verifies both zone and vehicle ownership before querying', async () => {
    const r = repo();
    const s = new FleetTrackingService(r as never);
    await s.geofenceEvents('g1', { zoneId: 'z1', vehicleId: 'v1', limit: 25 });
    expect(r.getGeofence).toHaveBeenCalledWith('z1');
    expect(r.getVehicle).toHaveBeenCalledWith('v1');
    expect(r.geofenceEvents).toHaveBeenCalledWith('z1', 'v1', undefined, 25);
  });

  it('route create rejects a foreign vehicle with the "Invalid vehicle" message', async () => {
    const s = new FleetTrackingService(repo({ getVehicle: vi.fn(async () => ({ id: 'v1', garageId: 'other' })) }) as never);
    await expect(s.createRoute('g1', { routeName: 'R', vehicleId: 'v1' })).rejects.toThrow('Invalid vehicle');
  });

  it('route detail merges checkpoints after the ownership check; 404s a missing route', async () => {
    const s = new FleetTrackingService(repo() as never);
    expect(await s.getRouteWithCheckpoints('r1', 'g1')).toEqual({ id: 'r1', garageId: 'g1', checkpoints: [{ id: 'cp1' }] });
    const missing = new FleetTrackingService(repo({ getRoute: vi.fn(async () => undefined) }) as never);
    await expect(missing.getRouteWithCheckpoints('r1', 'g1')).rejects.toThrow('Route not found');
  });
});
