import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the customer read surface. Phase E migrated the
 * extracted router into a layered module (`server/modules/customers`), so these
 * assertions now target the module's controller/service/repository — the same
 * guarantees, at their new homes. Behavioral coverage lives in
 * `server/modules/customers/__tests__/customer.service.test.ts`.
 */
describe('Customer read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/customers/index.ts');
  const controllerSource = read('server/modules/customers/controllers/customer.controller.ts');
  const serviceSource = read('server/modules/customers/services/customer.service.ts');
  const repositorySource = read('server/modules/customers/repositories/customer.repository.ts');

  it('mounts the customer module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import customerRoutes from ['"]\.\.\/modules\/customers['"]/);
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
    // Route surface (controller layer wired via DI).
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers['"],\s*isAuthenticated,\s*asyncHandler\(controller\.list\)\)/);
    // Controller preserves pagination parse + the shared paginated response shape.
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    // Service selects search vs. paginate and pins the tenant (session garage
    // takes precedence over ?garage_id — the reverse was a cross-tenant read).
    expect(serviceSource).toMatch(/auth\.garageId \?\? garageIdParam/);
    expect(serviceSource).toMatch(/this\.repository\.search\(/);
    expect(serviceSource).toMatch(/this\.repository\.listPaginated\(/);
    expect(serviceSource).toMatch(/this\.repository\.count\(/);
    // Repository is the only data-layer binding.
    expect(repositorySource).toMatch(/storage\.searchCustomers\(/);
    expect(repositorySource).toMatch(/storage\.getCustomersPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countCustomers\(/);
  });

  it('preserves customer detail and related reads', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:id\/vehicles['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:id\/job-cards['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:id\/invoices['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:id\/payments['"],\s*isAuthenticated/);
    expect(serviceSource).toMatch(/Customer not found/);
    expect(repositorySource).toMatch(/storage\.getCustomer\(/);
    expect(repositorySource).toMatch(/storage\.getCustomerVehicles\(/);
    expect(repositorySource).toMatch(/storage\.getCustomerJobCards\(/);
    expect(repositorySource).toMatch(/storage\.getCustomerInvoices\(/);
    expect(repositorySource).toMatch(/storage\.getCustomerPayments\(/);
  });

  it('preserves customer-scoped service reminder, review, and signature reads', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:customerId\/service-reminders['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:customerId\/reviews['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/customers\/:customerId\/signatures['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:customerId\/service-reminders['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:customerId\/reviews['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/customers\/:customerId\/signatures['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.getCustomerServiceReminders\(/);
    expect(repositorySource).toMatch(/storage\.getCustomerServiceReviews\(/);
    expect(repositorySource).toMatch(/storage\.getCustomerServiceSignatures\(/);
  });
});
