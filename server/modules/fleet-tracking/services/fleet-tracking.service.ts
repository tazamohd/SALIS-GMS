/**
 * Fleet-tracking service (Phase E5 — Domain Services).
 *
 * Owns the fleet-tracking domain rules: per-vehicle tenant-ownership checks
 * before any telemetry read/write, the geofence/route ownership + existence
 * rules, and the create/list/update compositions. Ownership failures surface as
 * an AuthorizationError (→ 403) and missing geofences/routes as a NotFoundError
 * (→ 404); the controller maps both to the legacy wire messages. Data access
 * flows through the injected repository.
 */

import { AuthorizationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IFleetTrackingRepository } from '../repositories/fleet-tracking.repository';

type Any = Record<string, unknown>;

export class FleetTrackingService {
  constructor(private readonly repository: IFleetTrackingRepository) {}

  /** A vehicle must exist and belong to the caller's garage, else 403. */
  private async assertVehicleOwned(vehicleId: string, garageId: string | undefined, denyMessage = 'Access denied') {
    const vehicle = await this.repository.getVehicle(vehicleId);
    if (!vehicle || (vehicle as { garageId?: string }).garageId !== garageId) {
      throw new AuthorizationError(denyMessage);
    }
    return vehicle;
  }

  /** Geofence lookup for events: a missing OR foreign zone is a 403 (legacy). */
  private async assertGeofenceOwned(zoneId: string, garageId: string | undefined) {
    const zone = await this.repository.getGeofence(zoneId);
    if (!zone || (zone as { garageId?: string }).garageId !== garageId) {
      throw new AuthorizationError('Access denied');
    }
    return zone;
  }

  /** Geofence lookup for update/delete: missing → 404, foreign → 403 (legacy). */
  private async getOwnedGeofence(id: string, garageId: string | undefined) {
    const zone = await this.repository.getGeofence(id);
    if (!zone) throw new NotFoundError('Geofence zone not found', { context: { id } });
    if ((zone as { garageId?: string }).garageId !== garageId) throw new AuthorizationError('Access denied');
    return zone;
  }

  private async getOwnedRoute(id: string, garageId: string | undefined) {
    const route = await this.repository.getRoute(id);
    if (!route) throw new NotFoundError('Route not found', { context: { id } });
    if ((route as { garageId?: string }).garageId !== garageId) throw new AuthorizationError('Access denied');
    return route;
  }

  // --- Locations ---
  async recordLocation(garageId: string | undefined, vehicleId: string, data: Any) {
    await this.assertVehicleOwned(vehicleId, garageId);
    return this.repository.recordLocation({ vehicleId, ...data });
  }

  async locationHistory(garageId: string | undefined, vehicleId: string, startDate?: Date, endDate?: Date, limit = 100) {
    await this.assertVehicleOwned(vehicleId, garageId);
    return this.repository.locationHistory(vehicleId, startDate, endDate, limit);
  }

  async latestLocation(garageId: string | undefined, vehicleId: string) {
    await this.assertVehicleOwned(vehicleId, garageId);
    return (await this.repository.latestLocation(vehicleId)) || null;
  }

  // --- Geofences ---
  listGeofences(garageId: string | undefined) {
    return this.repository.listGeofences(garageId);
  }

  createGeofence(data: Any) {
    return this.repository.createGeofence(data);
  }

  async updateGeofence(id: string, garageId: string | undefined, data: Any) {
    await this.getOwnedGeofence(id, garageId);
    return this.repository.updateGeofence(id, data);
  }

  async deleteGeofence(id: string, garageId: string | undefined) {
    await this.getOwnedGeofence(id, garageId);
    return this.repository.deleteGeofence(id);
  }

  async geofenceEvents(
    garageId: string | undefined,
    opts: { zoneId?: string; vehicleId?: string; startDate?: Date; limit?: number },
  ) {
    if (opts.zoneId) await this.assertGeofenceOwned(opts.zoneId, garageId);
    if (opts.vehicleId) await this.assertVehicleOwned(opts.vehicleId, garageId);
    return this.repository.geofenceEvents(opts.zoneId, opts.vehicleId, opts.startDate, opts.limit ?? 100);
  }

  // --- Routes ---
  listRoutes(garageId: string | undefined, status?: string) {
    return this.repository.listRoutes(garageId, status);
  }

  async createRoute(garageId: string | undefined, data: Any & { vehicleId?: string }) {
    if (data.vehicleId) await this.assertVehicleOwned(data.vehicleId, garageId, 'Invalid vehicle');
    return this.repository.createRoute(data);
  }

  async getRouteWithCheckpoints(id: string, garageId: string | undefined) {
    const route = await this.getOwnedRoute(id, garageId);
    const checkpoints = await this.repository.routeCheckpoints(id);
    return { ...(route as object), checkpoints };
  }

  async updateRoute(id: string, garageId: string | undefined, data: Any) {
    await this.getOwnedRoute(id, garageId);
    return this.repository.updateRoute(id, data);
  }
}
