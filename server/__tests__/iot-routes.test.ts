import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the IoT extraction (Phase E). The 14 `/api/iot/*`
 * handlers (sensors CRUD, readings, anomalies, alerts, dashboard) moved from the
 * monolith into `server/modules/iot`, preserving the parent-scoped ownership
 * guards. Behavioral coverage: the module service tests.
 */
describe('IoT extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/iot/index.ts');
  const service = read('server/modules/iot/services/iot.service.ts');
  const repository = read('server/modules/iot/repositories/iot.repository.ts');

  it('mounts the iot module from the hybrid router', () => {
    expect(hybrid).toMatch(/import iotRoutes from ["']\.\.\/modules\/iot["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*iotRoutes\)/);
  });

  it('removes every /api/iot/* handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/iot\//);
  });

  it('registers the 14 routes and preserves the parent-scoped ownership guards', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(14);
    expect(moduleIndex).toMatch(/table: 'iot_sensors', parent: \{ table: 'vehicles', fk: 'vehicle_id' \}/);
    expect(moduleIndex).toMatch(/table: 'iot_alerts', parent: \{ table: 'vehicles', fk: 'vehicle_id' \}/);
    expect(moduleIndex).toMatch(/table: 'vehicles', idParam: 'vehicleId'/);
  });

  it('centralizes the ownership 403 + not-found 404 in the service, storage in the repository', () => {
    expect(service).toMatch(/AuthorizationError\('Access denied'\)/);
    expect(service).toMatch(/NotFoundError/);
    expect(service).toMatch(/assertVehicleOwned/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
