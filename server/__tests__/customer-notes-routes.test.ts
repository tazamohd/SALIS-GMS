import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Customer notes read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const customerRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/customers.ts'), 'utf-8');

  it('mounts the extracted customer router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import customerRoutes from ['"]\.\/customers['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*customerRoutes\)/);
  });

  it('removes the active customer notes read handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id\/notes['"]/);
  });

  it('leaves mutating customer note handlers in legacy routes for existing write behavior', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers\/:id\/notes['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/customer-notes\/:id['"]/);
  });

  it('preserves customer note lookup behavior and failure response', () => {
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:id\/notes['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/const \{ id \} = req\.params/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerNotes\(id\)/);
    expect(customerRoutesSource).toMatch(/res\.json\(notes\)/);
    expect(customerRoutesSource).toMatch(/Failed to fetch customer notes/);
  });
});
