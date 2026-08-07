import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the customer notes read route. Phase E moved the
 * read into `server/modules/customers`; assertions target the module's route
 * surface and repository binding. Mutating note handlers remain in the legacy
 * monolith until those write paths are migrated.
 */
describe('Customer notes read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/customers/index.ts');
  const controllerSource = read('server/modules/customers/controllers/customer.controller.ts');
  const repositorySource = read('server/modules/customers/repositories/customer.repository.ts');

  it('mounts the customer module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import customerRoutes from ['"]\.\.\/modules\/customers['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*customerRoutes\)/);
  });

  it('removes the active customer notes read handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id\/notes['"]/);
  });

  it('leaves mutating customer note handlers in legacy routes for existing write behavior', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers\/:id\/notes['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/customer-notes\/:id['"]/);
  });

  it('preserves customer note lookup behavior', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:id\/notes['"],\s*isAuthenticated/);
    expect(controllerSource).toMatch(/service\.notes\(req\.params\.id,\s*authOf\(req\)\)/);
    expect(repositorySource).toMatch(/storage\.getCustomerNotes\(/);
  });
});
