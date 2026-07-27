import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Customer read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const customerRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/customers.ts'), 'utf-8');

  it('mounts the extracted customer router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import customerRoutes from ['"]\.\/customers['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*customerRoutes\)/);
  });

  it('removes active customer read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id\/vehicles['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id\/job-cards['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id\/invoices['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:id\/payments['"]/);
  });

  it('leaves mutating customer and customer note handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers\/:id\/notes['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/customer-notes\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers\/:customerId\/service-reminders['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers\/:customerId\/reviews['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/customers\/:customerId\/signatures['"]/);
  });

  it('preserves customer list pagination, search, and garage scoping', () => {
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(customerRoutesSource).toMatch(/const \{ garage_id,\s*search \} = req\.query/);
    // Session garage takes precedence over ?garage_id — the reverse order was
    // a cross-tenant read (see tenant-isolation.test.ts).
    expect(customerRoutesSource).toMatch(/storage\.searchCustomers\(\s*\(req\.user as any\)\?\.garageId \|\| \(garage_id as string\),\s*searchPattern,\s*pagination\.limit,\s*\)/);
    expect(customerRoutesSource).toMatch(/const garageId = \(req\.user as any\)\?\.garageId \|\| \(garage_id as string\)/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomersPaginated\(garageId,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(customerRoutesSource).toMatch(/storage\.countCustomers\(garageId\)/);
    expect(customerRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
  });

  it('preserves customer detail and related reads', () => {
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:id['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomer\(id\)/);
    expect(customerRoutesSource).toMatch(/Customer not found/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:id\/vehicles['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerVehicles\(id\)/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:id\/job-cards['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerJobCards\(id\)/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:id\/invoices['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerInvoices\(id\)/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:id\/payments['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerPayments\(id\)/);
  });

  it('preserves customer-scoped service reminder, review, and signature reads', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:customerId\/service-reminders['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:customerId\/reviews['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:customerId\/signatures['"]/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:customerId\/service-reminders['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerServiceReminders\(customerId\)/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:customerId\/reviews['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerServiceReviews\(customerId\)/);
    expect(customerRoutesSource).toMatch(/router\.get\(['"]\/customers\/:customerId\/signatures['"],\s*isAuthenticated/);
    expect(customerRoutesSource).toMatch(/storage\.getCustomerServiceSignatures\(customerId\)/);
  });
});
