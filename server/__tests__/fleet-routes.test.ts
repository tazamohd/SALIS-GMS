import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the fleet-accounts surface. Phase E migrated the
 * standalone `server/routes/fleet.ts` router into a layered module
 * (`server/modules/fleet`); assertions target the module's controller / service /
 * repository. Behavioral coverage lives in
 * `server/modules/fleet/__tests__/fleet.service.test.ts`.
 */
describe('Fleet route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/fleet/index.ts');
  const controllerSource = read('server/modules/fleet/controllers/fleet.controller.ts');
  const serviceSource = read('server/modules/fleet/services/fleet.service.ts');
  const repositorySource = read('server/modules/fleet/repositories/fleet.repository.ts');

  it('mounts the fleet module from the hybrid router and retires the legacy file', () => {
    expect(hybridRoutesSource).toMatch(/import fleetAccountRoutes from ["']\.\.\/modules\/fleet["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*fleetAccountRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/fleet.ts'))).toBe(false);
  });

  it('preserves the six fleet routes, incl. the validated create', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/accounts['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/accounts\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/fleet\/accounts['"]/);
    expect(moduleIndexSource).toMatch(/validate\(createFleetAccountSchema\)/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/vehicles['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/maintenance-schedule['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/fleet\/analytics['"],\s*isAuthenticated/);
  });

  it('keeps garage scoping / 404 in the controller and tenant scoping in the service', () => {
    expect(controllerSource).toMatch(/resolveGarageScope\(req\)/);
    expect(controllerSource).toMatch(/Fleet account not found/);
    expect(controllerSource).toMatch(/companyName is required/);
    // The vehicle/maintenance tenant-scope filter lives in the service.
    expect(serviceSource).toMatch(/ownAccountIds\.has/);
  });

  it('routes all data access through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(controllerSource).not.toMatch(/from '.*\/storage'/);
    expect(serviceSource).not.toMatch(/from '.*\/storage'/);
  });
});
