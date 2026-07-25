import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vehicle read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const vehicleRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/vehicles.ts'), 'utf-8');

  it('mounts the extracted vehicle router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import vehicleRoutes from ['"]\.\/vehicles['"]/);
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
    expect(vehicleRoutesSource).toMatch(/router\.get\(['"]\/vehicles['"],\s*isAuthenticated/);
    expect(vehicleRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(vehicleRoutesSource).toMatch(/const gid = \(garageId as string\) \|\| \(req\.user as any\)\?\.garageId/);
    expect(vehicleRoutesSource).toMatch(/storage\.getVehiclesPaginated\(gid,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(vehicleRoutesSource).toMatch(/storage\.countVehicles\(gid\)/);
    expect(vehicleRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
  });
});
