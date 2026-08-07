import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the supplier read surface. Phase E migrated the
 * extracted router into a layered module (`server/modules/suppliers`); assertions
 * target the module's controller/service/repository. Behavioral coverage lives
 * in `server/modules/suppliers/__tests__/supplier.service.test.ts`.
 */
describe('Supplier read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/suppliers/index.ts');
  const controllerSource = read('server/modules/suppliers/controllers/supplier.controller.ts');
  const serviceSource = read('server/modules/suppliers/services/supplier.service.ts');
  const repositorySource = read('server/modules/suppliers/repositories/supplier.repository.ts');

  it('mounts the supplier module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import supplierRoutes from ['"]\.\.\/modules\/suppliers['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*supplierRoutes\)/);
  });

  it('removes active supplier read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/suppliers['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/suppliers\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/supplier-price-lists['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/supplier-price-lists\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/supplier-price-lists\/compare\/:sparePartId['"]/);
  });

  it('leaves mutating supplier and price-list handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/suppliers['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/suppliers\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/suppliers\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/supplier-price-lists['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/supplier-price-lists\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/supplier-price-lists\/:id['"]/);
  });

  it('preserves supplier list pagination, garage scoping, detail lookup, and price-list reads', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/suppliers['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/suppliers\/:id['"],\s*isAuthenticated/);
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    // Session garage takes precedence over ?garage_id (tenant isolation).
    expect(serviceSource).toMatch(/auth\.garageId \?\? garageIdParam/);
    expect(serviceSource).toMatch(/Supplier not found/);
    expect(serviceSource).toMatch(/Price list not found/);
    expect(repositorySource).toMatch(/storage\.getSuppliersPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countSuppliers\(/);
    expect(repositorySource).toMatch(/storage\.getSupplier\(/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/supplier-price-lists['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.getSupplierPriceLists\(/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/supplier-price-lists\/:id['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.getSupplierPriceList\(/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/supplier-price-lists\/compare\/:sparePartId['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.comparePrices\(/);
  });
});
