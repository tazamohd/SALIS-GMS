/**
 * Fleet-tracking controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapters preserving the legacy monolith contract: the field
 * validation 400s, the garage-scoped create payloads, and the exact
 * per-handler `{ message }` 500 bodies. Ownership/existence failures come back
 * from the service as AuthorizationError (→ 403) / NotFoundError (→ 404) and are
 * rendered with their legacy messages. No business rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { AuthorizationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { FleetTrackingService } from '../services/fleet-tracking.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function userIdOf(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function dateParam(v: unknown): Date | undefined {
  return typeof v === 'string' ? new Date(v) : undefined;
}
function limitParam(v: unknown): number {
  return typeof v === 'string' ? parseInt(v, 10) : 100;
}

export function makeFleetTrackingController(service: FleetTrackingService) {
  const guard = (fn: (req: Request, res: Response) => Promise<void>, failMsg: string) =>
    async (req: Request, res: Response): Promise<void> => {
      try {
        await fn(req, res);
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        if (error instanceof AuthorizationError) {
          res.status(403).json({ message: error.message });
          return;
        }
        console.error(`${failMsg}:`, error);
        res.status(500).json({ message: failMsg });
      }
    };

  return {
    // --- Locations ---
    recordLocation: guard(async (req, res) => {
      const {
        vehicleId, latitude, longitude, altitude, speed, heading, accuracy,
        source, driverId, jobCardId, mileage, engineStatus, fuelLevel, batteryVoltage,
      } = req.body ?? {};
      if (!vehicleId || latitude === undefined || longitude === undefined) {
        res.status(400).json({ message: 'Vehicle ID, latitude, and longitude are required' });
        return;
      }
      const location = await service.recordLocation(garageOf(req), vehicleId, {
        latitude, longitude, altitude, speed, heading, accuracy,
        source, driverId, jobCardId, mileage, engineStatus, fuelLevel, batteryVoltage,
      });
      res.json(location);
    }, 'Failed to record location'),

    locationHistory: guard(async (req, res) => {
      const locations = await service.locationHistory(
        garageOf(req),
        req.params.vehicleId,
        dateParam(req.query.startDate),
        dateParam(req.query.endDate),
        limitParam(req.query.limit),
      );
      res.json(locations);
    }, 'Failed to fetch location history'),

    latestLocation: guard(async (req, res) => {
      res.json(await service.latestLocation(garageOf(req), req.params.vehicleId));
    }, 'Failed to fetch latest location'),

    // --- Geofences ---
    listGeofences: guard(async (req, res) => {
      res.json(await service.listGeofences(garageOf(req)));
    }, 'Failed to fetch geofence zones'),

    createGeofence: guard(async (req, res) => {
      const {
        name, description, zoneType, geometry, centerLatitude, centerLongitude,
        radius, alertOnEntry, alertOnExit, color,
      } = req.body ?? {};
      if (!name || !zoneType || !geometry) {
        res.status(400).json({ message: 'Name, zone type, and geometry are required' });
        return;
      }
      const zone = await service.createGeofence({
        garageId: garageOf(req),
        name, description, zoneType, geometry, centerLatitude, centerLongitude,
        radius, alertOnEntry, alertOnExit, color,
        createdBy: userIdOf(req),
      });
      res.json(zone);
    }, 'Failed to create geofence zone'),

    updateGeofence: guard(async (req, res) => {
      res.json(await service.updateGeofence(req.params.id, garageOf(req), req.body));
    }, 'Failed to update geofence zone'),

    deleteGeofence: guard(async (req, res) => {
      await service.deleteGeofence(req.params.id, garageOf(req));
      res.json({ message: 'Geofence zone deleted successfully' });
    }, 'Failed to delete geofence zone'),

    geofenceEvents: guard(async (req, res) => {
      const events = await service.geofenceEvents(garageOf(req), {
        zoneId: str(req.query.zoneId),
        vehicleId: str(req.query.vehicleId),
        startDate: dateParam(req.query.startDate),
        limit: limitParam(req.query.limit),
      });
      res.json(events);
    }, 'Failed to fetch geofence events'),

    // --- Routes ---
    listRoutes: guard(async (req, res) => {
      res.json(await service.listRoutes(garageOf(req), str(req.query.status)));
    }, 'Failed to fetch fleet routes'),

    createRoute: guard(async (req, res) => {
      const {
        routeName, description, vehicleId, driverId, jobCardIds,
        startLocation, endLocation, waypoints, scheduledStartTime,
      } = req.body ?? {};
      if (!routeName || !startLocation) {
        res.status(400).json({ message: 'Route name and start location are required' });
        return;
      }
      const route = await service.createRoute(garageOf(req), {
        garageId: garageOf(req),
        routeName, description, vehicleId, driverId, jobCardIds,
        startLocation, endLocation, waypoints, scheduledStartTime,
        createdBy: userIdOf(req),
      });
      res.json(route);
    }, 'Failed to create fleet route'),

    getRoute: guard(async (req, res) => {
      res.json(await service.getRouteWithCheckpoints(req.params.id, garageOf(req)));
    }, 'Failed to fetch route'),

    updateRoute: guard(async (req, res) => {
      res.json(await service.updateRoute(req.params.id, garageOf(req), req.body));
    }, 'Failed to update route'),
  };
}

export type FleetTrackingController = ReturnType<typeof makeFleetTrackingController>;
