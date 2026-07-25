import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supplier payment read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const supplierPaymentRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/supplier-payments.ts'), 'utf-8');

  it('mounts the extracted supplier payment router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import supplierPaymentRoutes from ['"]\.\/supplier-payments['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*supplierPaymentRoutes\)/);
  });

  it('removes active supplier payment read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/supplier-payments['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/supplier-payments\/:id['"]/);
  });

  it('leaves mutating supplier payment handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/supplier-payments['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/supplier-payments\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/supplier-payments\/:id['"]/);
  });

  it('preserves supplier payment list and detail behavior', () => {
    expect(supplierPaymentRoutesSource).toMatch(/router\.get\(['"]\/supplier-payments['"],\s*isAuthenticated/);
    expect(supplierPaymentRoutesSource).toMatch(/const \{ garage_id,\s*status \} = req\.query/);
    expect(supplierPaymentRoutesSource).toMatch(/storage\.getSupplierPayments\(garage_id as string,\s*status as string\)/);
    expect(supplierPaymentRoutesSource).toMatch(/router\.get\(['"]\/supplier-payments\/:id['"],\s*isAuthenticated/);
    expect(supplierPaymentRoutesSource).toMatch(/storage\.getSupplierPayment\(id\)/);
    expect(supplierPaymentRoutesSource).toMatch(/Payment not found/);
  });
});
