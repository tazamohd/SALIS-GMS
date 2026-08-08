import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the dynamic-pricing extraction (Phase E). The 16
 * `/api/dynamic-pricing/*` handlers (market-data, vehicle-factors, suggestions
 * CRUD, calculate, service-types, vehicle-classes) moved from the monolith into
 * `server/modules/dynamic-pricing`, preserving the `:id` ownership guards.
 * Behavioral coverage: the module service tests.
 */
describe('Dynamic-pricing extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/dynamic-pricing/index.ts');
  const service = read('server/modules/dynamic-pricing/services/dynamic-pricing.service.ts');
  const repository = read('server/modules/dynamic-pricing/repositories/dynamic-pricing.repository.ts');

  it('mounts the dynamic-pricing module from the hybrid router', () => {
    expect(hybrid).toMatch(/import dynamicPricingRoutes from ["']\.\.\/modules\/dynamic-pricing["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*dynamicPricingRoutes\)/);
  });

  it('removes every /api/dynamic-pricing/* handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/dynamic-pricing\//);
  });

  it('registers the 16 routes and preserves the :id ownership guards', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(16);
    expect(moduleIndex).toMatch(/table: 'market_pricing_data'/);
    expect(moduleIndex).toMatch(/table: 'vehicle_pricing_factors'/);
    expect(moduleIndex).toMatch(/table: 'dynamic_pricing_suggestions'/);
  });

  it('centralizes the domain rules in the service, storage in the repository', () => {
    expect(service).toMatch(/ValidationError\('Garage ID is required'\)/);
    expect(service).toMatch(/ValidationError\('Service type is required'\)/);
    expect(service).toMatch(/NotFoundError\('Pricing suggestion not found'\)/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
