import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the fleet-management CRUD surface. Phase E extracted
 * the 25 handlers (groups / vehicles / contracts / pricing-tiers / maintenance-
 * schedules) out of the monolith into a layered module
 * (`server/modules/fleet-management`). Behavioral coverage lives in
 * `server/modules/fleet-management/__tests__/fleet-management.service.test.ts`;
 * the ownership guards are exercised end-to-end by
 * `server/__tests__/h1-loyalty-fleet-ownership.test.ts`.
 */
describe('Fleet-management extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/fleet-management/index.ts');
  const repositorySource = read('server/modules/fleet-management/repositories/fleet-management.repository.ts');

  it('mounts the fleet-management module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import fleetManagementRoutes from ["']\.\.\/modules\/fleet-management["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*fleetManagementRoutes\)/);
  });

  it('removes all 5 fleet-management aggregates from the legacy monolith', () => {
    for (const p of ['groups', 'contracts', 'pricing-tiers', 'maintenance-schedules']) {
      expect(legacyRoutesSource).not.toMatch(new RegExp(`app\\.(get|post|patch|delete)\\(['"]/api/fleet/${p}`));
    }
    // fleet-management vehicles (create + by-id + group list) are gone...
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/fleet\/vehicles['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/fleet\/vehicles\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/fleet\/vehicles\/group\/:fleetGroupId['"]/);
  });

  it('does not own the fleet-tracking vehicle-location reads (a separate module)', () => {
    // Fleet-tracking (locations/geofences/routes) is its own module; the
    // fleet-management module must not register the telemetry reads.
    const moduleIndexSource = read('server/modules/fleet-management/index.ts');
    expect(moduleIndexSource).not.toMatch(/\/fleet\/vehicles\/:vehicleId\/locations/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/fleet\/vehicles\/:vehicleId\/locations['"]/);
  });

  it('registers group-scoped list routes before the /:id routes', () => {
    for (const p of ['vehicles', 'contracts', 'maintenance-schedules']) {
      const groupIdx = moduleIndexSource.indexOf(`/fleet/${p}/group/:fleetGroupId`);
      const byIdIdx = moduleIndexSource.indexOf(`/fleet/${p}/:id`);
      expect(groupIdx).toBeGreaterThan(-1);
      expect(byIdIdx).toBeGreaterThan(-1);
      expect(groupIdx).toBeLessThan(byIdIdx);
    }
  });

  it('preserves the parent-scoped and idParam ownership guards', () => {
    expect(moduleIndexSource).toMatch(/table: 'fleet_vehicles',\s*parent: \{ table: 'fleet_groups', fk: 'fleet_group_id' \}/);
    expect(moduleIndexSource).toMatch(/table: 'fleet_contracts',\s*parent: \{ table: 'fleet_groups', fk: 'fleet_group_id' \}/);
    expect(moduleIndexSource).toMatch(/table: 'fleet_maintenance_schedules',\s*parent: \{ table: 'fleet_groups', fk: 'fleet_group_id' \}/);
    expect(moduleIndexSource).toMatch(/table: 'fleet_groups', idParam: 'fleetGroupId'/);
    expect(moduleIndexSource).toMatch(/table: 'fleet_pricing_tiers'/);
  });

  it('routes all data access through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
