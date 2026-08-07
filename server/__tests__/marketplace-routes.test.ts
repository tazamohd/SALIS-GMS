import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the public marketplace provider-discovery surface.
 * Phase E extracted these reads out of the monolith into a layered module
 * (`server/modules/marketplace`); assertions target the module's controller /
 * service / repository. Behavioral coverage lives in
 * `server/modules/marketplace/__tests__/marketplace.service.test.ts`.
 */
describe('Marketplace provider-discovery extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/marketplace/index.ts');
  const controllerSource = read('server/modules/marketplace/controllers/marketplace.controller.ts');
  const repositorySource = read('server/modules/marketplace/repositories/marketplace.repository.ts');

  it('mounts the marketplace module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import marketplaceRoutes from ["']\.\.\/modules\/marketplace["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*marketplaceRoutes\)/);
  });

  it('removes the provider-discovery reads from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/marketplace\/providers['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/marketplace\/providers\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/marketplace\/find['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/marketplace\/providers\/:id\/reviews['"]/);
  });

  it('leaves the authenticated parts-marketplace routes in the monolith', () => {
    // Scope guard: only the public provider-discovery reads moved.
    expect(legacyRoutesSource).toMatch(/app\.get\(['"]\/api\/marketplace\/search['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/marketplace\/orders['"]/);
  });

  it('registers the four public reads without an auth guard', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/providers['"],\s*asyncHandler/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/providers\/:id['"],\s*asyncHandler/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/find['"],\s*asyncHandler/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/providers\/:id\/reviews['"],\s*asyncHandler/);
    // These routes are intentionally public — no isAuthenticated in the module.
    expect(moduleIndexSource).not.toMatch(/isAuthenticated/);
  });

  it('keeps the find min-length 400 / provider 404 in the controller and data access in the repository', () => {
    expect(controllerSource).toMatch(/Search query must be at least 2 characters/);
    expect(controllerSource).toMatch(/Provider not found/);
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
