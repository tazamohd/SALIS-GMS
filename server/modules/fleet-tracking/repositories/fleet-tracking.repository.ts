/**
 * Fleet-tracking repository (Phase E4). The only data-layer access for the
 * fleet-tracking domain — vehicle telemetry, geofence zones/events, and route
 * planning. Delegates to the legacy `storage` facade (strangler seam).
 */

import { storage } from '../../../storage';

// storage telemetry methods are loosely typed; `Any` keeps the seam readable.
type Any = any;

export interface IFleetTrackingRepository {
  getVehicle(id: string): Promise<Any>;
  recordLocation(data: Any): Promise<Any>;
  locationHistory(vehicleId: string, startDate: Date | undefined, endDate: Date | undefined, limit: number): Promise<Any[]>;
  latestLocation(vehicleId: string): Promise<Any>;
  listGeofences(garageId: string | undefined): Promise<Any[]>;
  createGeofence(data: Any): Promise<Any>;
  getGeofence(id: string): Promise<Any>;
  updateGeofence(id: string, data: Any): Promise<Any>;
  deleteGeofence(id: string): Promise<void>;
  geofenceEvents(zoneId: string | undefined, vehicleId: string | undefined, startDate: Date | undefined, limit: number): Promise<Any[]>;
  listRoutes(garageId: string | undefined, status: string | undefined): Promise<Any[]>;
  createRoute(data: Any): Promise<Any>;
  getRoute(id: string): Promise<Any>;
  routeCheckpoints(routeId: string): Promise<Any[]>;
  updateRoute(id: string, data: Any): Promise<Any>;
}

export class FleetTrackingRepository implements IFleetTrackingRepository {
  getVehicle(id: string) { return storage.getVehicle(id); }
  recordLocation(data: Any) { return storage.recordVehicleLocation(data); }
  locationHistory(vehicleId: string, startDate: Date | undefined, endDate: Date | undefined, limit: number) {
    return storage.getVehicleLocationHistory(vehicleId, startDate, endDate, limit);
  }
  latestLocation(vehicleId: string) { return storage.getLatestVehicleLocation(vehicleId); }
  listGeofences(garageId: string | undefined) { return storage.getGeofenceZones(garageId as string); }
  createGeofence(data: Any) { return storage.createGeofenceZone(data); }
  getGeofence(id: string) { return storage.getGeofenceZone(id); }
  updateGeofence(id: string, data: Any) { return storage.updateGeofenceZone(id, data); }
  deleteGeofence(id: string) { return storage.deleteGeofenceZone(id); }
  geofenceEvents(zoneId: string | undefined, vehicleId: string | undefined, startDate: Date | undefined, limit: number) {
    return storage.getGeofenceEvents(zoneId, vehicleId, startDate, limit);
  }
  listRoutes(garageId: string | undefined, status: string | undefined) {
    return storage.getFleetRoutes(garageId as string, status);
  }
  createRoute(data: Any) { return storage.createFleetRoute(data); }
  getRoute(id: string) { return storage.getFleetRoute(id); }
  routeCheckpoints(routeId: string) { return storage.getRouteCheckpoints(routeId); }
  updateRoute(id: string, data: Any) { return storage.updateFleetRoute(id, data); }
}
