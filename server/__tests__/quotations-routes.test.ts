import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Quotation read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const quotationRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/quotations.ts'), 'utf-8');

  it('mounts the extracted quotation router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import quotationRoutes from ['"]\.\/quotations['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*quotationRoutes\)/);
  });

  it('removes active quotation read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/quotation-requests['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/quotation-requests\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/quotation-requests\/:id\/quotations['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/supplier-quotations\/:id\/items['"]/);
  });

  it('leaves mutating quotation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/quotation-requests['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/quotation-requests\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/quotation-requests\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/supplier-quotations['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/supplier-quotations\/:id['"]/);
  });

  it('preserves quotation request and supplier quotation read behavior', () => {
    expect(quotationRoutesSource).toMatch(/router\.get\(['"]\/quotation-requests['"],\s*isAuthenticated/);
    // B11: list scopes to the session garage, not a client-supplied query param.
    expect(quotationRoutesSource).not.toMatch(/getQuotationRequests\(garage_id/);
    expect(quotationRoutesSource).toMatch(/storage\.getQuotationRequests\(req\.user\.garageId,\s*status as string\)/);
    expect(quotationRoutesSource).toMatch(/router\.get\(['"]\/quotation-requests\/:id['"],\s*isAuthenticated/);
    expect(quotationRoutesSource).toMatch(/storage\.getQuotationRequest\(req\.params\.id,\s*req\.user\.garageId\)/);
    expect(quotationRoutesSource).toMatch(/Quotation request not found/);
    expect(quotationRoutesSource).toMatch(/router\.get\(['"]\/quotation-requests\/:id\/quotations['"],\s*isAuthenticated/);
    expect(quotationRoutesSource).toMatch(/storage\.getSupplierQuotations\(req\.params\.id\)/);
    expect(quotationRoutesSource).toMatch(/router\.get\(['"]\/supplier-quotations\/:id\/items['"],\s*isAuthenticated/);
    expect(quotationRoutesSource).toMatch(/storage\.getQuotationItems\(req\.params\.id\)/);
  });
});
