import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the provider marketplace surface. Phase E extracted
 * the twelve `/api/provider/*` handlers (bookings, offerings, profile, orders,
 * quotes) out of the monolith into a layered module (`server/modules/provider`);
 * assertions target the module's controller / service / repository + the mount.
 * Behavioral coverage lives in the module's service tests and the existing
 * provider-offerings / marketplace-bookings integration suites.
 */
describe('Provider marketplace extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/provider/index.ts');
  const controllerSource = read('server/modules/provider/controllers/provider.controller.ts');
  const serviceSource = read('server/modules/provider/services/provider.service.ts');
  const repositorySource = read('server/modules/provider/repositories/provider.repository.ts');

  it('mounts the provider module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import providerRoutes from ["']\.\.\/modules\/provider["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*providerRoutes\)/);
  });

  it('removes every /api/provider/* handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/provider\//);
  });

  it('drops the provider-only notifyCustomer helper from the monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/const notifyCustomer\s*=/);
    // The customer-side notifyProviderAdmins helper stays in the monolith.
    expect(legacyRoutesSource).toMatch(/const notifyProviderAdmins\s*=/);
  });

  it('registers all twelve routes behind isAuthenticated', () => {
    for (const [method, route] of [
      ['get', '/provider/bookings'],
      ['patch', '/provider/bookings/:id'],
      ['get', '/provider/offerings'],
      ['post', '/provider/offerings'],
      ['patch', '/provider/offerings/:id'],
      ['delete', '/provider/offerings/:id'],
      ['get', '/provider/profile'],
      ['patch', '/provider/profile'],
      ['get', '/provider/orders'],
      ['patch', '/provider/orders/:id'],
      ['get', '/provider/quotes'],
      ['post', '/provider/quotes/:id/respond'],
    ] as const) {
      const re = new RegExp(`router\\.${method}\\(\\s*['"]${route.replace(/[/:]/g, '\\$&')}['"],\\s*isAuthenticated`);
      expect(moduleIndexSource).toMatch(re);
    }
  });

  it('preserves the tenant-scoped requireResourceOwnership guards on the :id mutations', () => {
    expect(moduleIndexSource).toMatch(/marketplace_bookings['"],\s*tenantColumn:\s*['"]provider_id/);
    expect(moduleIndexSource).toMatch(/provider_offerings['"],\s*tenantColumn:\s*['"]provider_id/);
    expect(moduleIndexSource).toMatch(/provider_orders['"],\s*tenantColumn:\s*['"]provider_id/);
  });

  it('keeps the guard/validation shapes in the service, the Zod boundary in the controller, and data access in the repository', () => {
    // Domain errors own the 403 / 400 / 404 rules.
    expect(serviceSource).toMatch(/No provider account associated/);
    expect(serviceSource).toMatch(/status must be accepted, declined or completed/);
    expect(serviceSource).toMatch(/quotedPremium is required to quote/);
    // Zod offering validation at the controller boundary.
    expect(controllerSource).toMatch(/insertProviderOfferingSchema/);
    expect(controllerSource).toMatch(/sanitizeZodError/);
    // Data access only in the repository.
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
