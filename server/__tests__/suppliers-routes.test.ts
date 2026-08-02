import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supplier read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const supplierRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/suppliers.ts'), 'utf-8');

  it('mounts the extracted supplier router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import supplierRoutes from ['"]\.\/suppliers['"]/);
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
    expect(supplierRoutesSource).toMatch(/router\.get\(['"]\/suppliers['"],\s*isAuthenticated/);
    expect(supplierRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(supplierRoutesSource).toMatch(/const gid = \(req\.user as any\)\?\.garageId \|\| \(garage_id as string\)/);
    expect(supplierRoutesSource).toMatch(/storage\.getSuppliersPaginated\(gid,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(supplierRoutesSource).toMatch(/storage\.countSuppliers\(gid\)/);
    expect(supplierRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    expect(supplierRoutesSource).toMatch(/router\.get\(['"]\/suppliers\/:id['"],\s*isAuthenticated/);
    expect(supplierRoutesSource).toMatch(/storage\.getSupplier\(id\)/);
    expect(supplierRoutesSource).toMatch(/Supplier not found/);
    expect(supplierRoutesSource).toMatch(/router\.get\(['"]\/supplier-price-lists['"],\s*isAuthenticated/);
    expect(supplierRoutesSource).toMatch(/const \{ supplierId,\s*sparePartId \} = req\.query/);
    expect(supplierRoutesSource).toMatch(/storage\.getSupplierPriceLists\(\s*supplierId as string \| undefined,\s*sparePartId as string \| undefined,\s*\)/);
    expect(supplierRoutesSource).toMatch(/router\.get\(['"]\/supplier-price-lists\/:id['"],\s*isAuthenticated/);
    expect(supplierRoutesSource).toMatch(/storage\.getSupplierPriceList\(id,/);
    expect(supplierRoutesSource).toMatch(/Price list not found/);
    expect(supplierRoutesSource).toMatch(/router\.get\(['"]\/supplier-price-lists\/compare\/:sparePartId['"],\s*isAuthenticated/);
    expect(supplierRoutesSource).toMatch(/storage\.comparePrices\(sparePartId\)/);
  });
});
