import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the spare-part (inventory items) read surface.
 * Phase E migrated the extracted router into a layered module
 * (`server/modules/inventory`); assertions target the module's
 * controller/service/repository. Behavioral coverage lives in
 * `server/modules/inventory/__tests__/spare-part.service.test.ts`.
 */
describe('Spare part read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/inventory/index.ts');
  const controllerSource = read('server/modules/inventory/controllers/spare-part.controller.ts');
  const serviceSource = read('server/modules/inventory/services/spare-part.service.ts');
  const repositorySource = read('server/modules/inventory/repositories/spare-part.repository.ts');

  it('mounts the inventory module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import sparePartRoutes from ['"]\.\.\/modules\/inventory['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*sparePartRoutes\)/);
  });

  it('removes active spare part read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/spare-parts['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/spare-parts\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/spare-part-inventories['"]/);
  });

  it('leaves mutating spare part handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/spare-parts['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/spare-parts\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/spare-parts\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/spare-part-inventories['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/spare-part-inventories\/:id['"]/);
  });

  it('preserves spare part list pagination, garage scoping, and detail lookup', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/spare-parts['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/spare-parts\/:id['"],\s*isAuthenticated/);
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    // Session garage takes precedence over ?garageId (tenant isolation).
    expect(serviceSource).toMatch(/auth\.garageId \?\? garageIdParam/);
    expect(serviceSource).toMatch(/Spare part not found/);
    expect(repositorySource).toMatch(/storage\.getSparePartsPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countSpareParts\(/);
    expect(repositorySource).toMatch(/storage\.getSparePart\(/);
  });

  it('preserves spare part inventory read validation and storage lookup', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/spare-part-inventories['"],\s*isAuthenticated/);
    expect(serviceSource).toMatch(/garage_id is required/);
    expect(repositorySource).toMatch(/storage\.getSparePartInventories\(/);
  });
});
