import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the vehicle list route. Phase E migrated the
 * extracted router into a layered module (`server/modules/vehicles`); assertions
 * target the module's controller/service/repository. Behavioral coverage lives
 * in `server/modules/vehicles/__tests__/vehicle.service.test.ts`.
 */
describe('Vehicle read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/vehicles/index.ts');
  const controllerSource = read('server/modules/vehicles/controllers/vehicle.controller.ts');
  const serviceSource = read('server/modules/vehicles/services/vehicle.service.ts');
  const repositorySource = read('server/modules/vehicles/repositories/vehicle.repository.ts');

  it('mounts the vehicle module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import vehicleRoutes from ['"]\.\.\/modules\/vehicles['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*vehicleRoutes\)/);
  });

  it('removes the active vehicle read handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicles['"]/);
  });

  it('leaves mutating vehicle handlers in legacy routes for existing write behavior', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/vehicles['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/vehicles\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/vehicles\/:id['"]/);
  });

  it('preserves paginated vehicle list behavior and garage scoping', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/vehicles['"],\s*isAuthenticated,\s*asyncHandler\(controller\.list\)\)/);
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    // Session garage takes precedence over ?garageId (tenant isolation).
    expect(serviceSource).toMatch(/auth\.garageId \?\? garageIdParam/);
    expect(repositorySource).toMatch(/storage\.getVehiclesPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countVehicles\(/);
  });
});
