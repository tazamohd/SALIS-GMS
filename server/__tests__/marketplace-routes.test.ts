import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the marketplace module. Phase E extracted the public
 * provider-discovery reads AND the authenticated write-path (eBay/Amazon parts
 * search / orders / tracking + the `/my/reviews` submission) out of the monolith
 * into a layered module (`server/modules/marketplace`); assertions target the
 * module's controllers / services / repositories. Behavioral coverage lives in
 * the module's `__tests__/*.service.test.ts` files.
 */
describe('Marketplace extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/marketplace/index.ts');
  const controllerSource = read('server/modules/marketplace/controllers/marketplace.controller.ts');
  const repositorySource = read('server/modules/marketplace/repositories/marketplace.repository.ts');
  const writesControllerSource = read(
    'server/modules/marketplace/controllers/marketplace-writes.controller.ts',
  );
  const writesRepositorySource = read(
    'server/modules/marketplace/repositories/marketplace-writes.repository.ts',
  );

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

  it('removes the authenticated parts-marketplace + review write-path from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/marketplace\/search['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.(get|post)\(['"]\/api\/marketplace\/orders['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/marketplace\/orders\/:id\/track['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/my\/reviews['"]/);
  });

  it('registers the four public reads without an auth guard', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/providers['"],\s*asyncHandler/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/providers\/:id['"],\s*asyncHandler/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/find['"],\s*asyncHandler/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/providers\/:id\/reviews['"],\s*asyncHandler/);
  });

  it('registers the authenticated write-path behind isAuthenticated', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/search['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/orders['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/marketplace\/orders['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/marketplace\/orders\/:id\/track['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/my\/reviews['"],\s*isAuthenticated/);
  });

  it('keeps the find min-length 400 / provider 404 in the controller and data access in the repository', () => {
    expect(controllerSource).toMatch(/Search query must be at least 2 characters/);
    expect(controllerSource).toMatch(/Provider not found/);
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });

  it('keeps the review guard status mapping in the write-path controller and data/external access in the repository', () => {
    // Legacy wire shapes preserved: 400 / 404 / 403 mapping + the exact 500 bodies.
    expect(writesControllerSource).toMatch(/ValidationError/);
    expect(writesControllerSource).toMatch(/AuthorizationError/);
    expect(writesControllerSource).toMatch(/Failed to search marketplace/);
    expect(writesControllerSource).toMatch(/Failed to place order/);
    expect(writesControllerSource).toMatch(/Failed to submit review/);
    // Data / external-service access only in the repository.
    expect(writesRepositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(writesRepositorySource).toMatch(/phase3-integrations-service/);
  });
});
