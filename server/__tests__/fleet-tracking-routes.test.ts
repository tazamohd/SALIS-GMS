import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the fleet-tracking surface. Phase E extracted the
 * 12 handlers (vehicle telemetry, geofences, geofence-events, routes) out of the
 * monolith into a layered module (`server/modules/fleet-tracking`). Behavioral
 * coverage lives in `server/modules/fleet-tracking/__tests__/fleet-tracking.service.test.ts`.
 */
describe('Fleet-tracking extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/fleet-tracking/index.ts');
  const serviceSource = read('server/modules/fleet-tracking/services/fleet-tracking.service.ts');
  const repositorySource = read('server/modules/fleet-tracking/repositories/fleet-tracking.repository.ts');

  it('mounts the fleet-tracking module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import fleetTrackingRoutes from ["']\.\.\/modules\/fleet-tracking["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*fleetTrackingRoutes\)/);
  });

  it('removes the fleet-tracking handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/fleet\/locations['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/fleet\/vehicles\/:vehicleId\/locations['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/fleet\/geofences['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/fleet\/geofence-events['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.(get|post)\(['"]\/api\/fleet\/routes['"]/);
  });

  it('registers all 12 routes with the geofence/route ownership guards', () => {
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/fleet\/locations['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/vehicles\/:vehicleId\/locations['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/vehicles\/:vehicleId\/location\/latest['"]/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/fleet\/geofences\/:id['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/geofence-events['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/routes\/:id['"]/);
    expect(moduleIndexSource).toMatch(/table: 'geofence_zones'/);
    expect(moduleIndexSource).toMatch(/table: 'fleet_routes'/);
  });

  it('keeps the tenant-ownership + existence rules in the service (403/404 via domain errors)', () => {
    expect(serviceSource).toMatch(/AuthorizationError/);
    expect(serviceSource).toMatch(/NotFoundError/);
    expect(serviceSource).toMatch(/Access denied/);
    expect(serviceSource).toMatch(/Invalid vehicle/);
    expect(serviceSource).toMatch(/Route not found/);
    expect(serviceSource).toMatch(/Geofence zone not found/);
  });

  it('routes all data access through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(serviceSource).not.toMatch(/from '.*\/storage'/);
  });
});
