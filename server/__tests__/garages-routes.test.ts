import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the garage + role read surface. Phase E migrated the
 * extracted router into a layered module (`server/modules/garage`); assertions
 * target the module's controller/service/repository. Behavioral coverage lives
 * in `server/modules/garage/__tests__/garage.service.test.ts`.
 */
describe('Garage and role route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/garage/index.ts');
  const controllerSource = read('server/modules/garage/controllers/garage.controller.ts');
  const repositorySource = read('server/modules/garage/repositories/garage.repository.ts');

  it('mounts the garage module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import garageRoutes from ['"]\.\.\/modules\/garage['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*garageRoutes\)/);
  });

  it('removes the active garage and role handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/garages['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/garages\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/garages\/:id\/branches['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/roles['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/user\/:id\/roles['"]/);
  });

  it('preserves all extracted route paths, authentication, and RBAC middleware', () => {
    const routePatterns = [
      /router\.get\(\s*['"]\/garages['"],\s*isAuthenticated/,
      /router\.get\(\s*['"]\/garages\/:id['"],\s*isAuthenticated/,
      /router\.get\(\s*['"]\/garages\/:id\/branches['"],\s*isAuthenticated/,
      /router\.get\(\s*['"]\/roles['"],\s*isAuthenticated,\s*requireManagerOrAbove/,
      /router\.get\(\s*['"]\/user\/:id\/roles['"],\s*isAuthenticated/,
    ];
    for (const pattern of routePatterns) {
      expect(moduleIndexSource).toMatch(pattern);
    }
    // The /user/:id/roles ownership guard is preserved.
    expect(moduleIndexSource).toMatch(/requireResourceOwnership\(\{\s*table:\s*['"]users['"]\s*\}\)/);
  });

  it('keeps pagination behavior for garage listings (via the module)', () => {
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    expect(repositorySource).toMatch(/storage\.getGaragesPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countGarages\(\)/);
  });
});
