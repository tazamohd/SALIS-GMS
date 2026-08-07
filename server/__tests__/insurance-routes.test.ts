import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the insurance-claims surface. Phase E extracted the
 * four monolith handlers into a layered module (`server/modules/insurance`);
 * assertions target the module's controller / service / repository. Behavioral
 * coverage lives in `server/modules/insurance/__tests__/insurance.service.test.ts`.
 */
describe('Insurance route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/insurance/index.ts');
  const controllerSource = read('server/modules/insurance/controllers/insurance.controller.ts');
  const repositorySource = read('server/modules/insurance/repositories/insurance.repository.ts');

  it('mounts the insurance module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import insuranceRoutes from ["']\.\.\/modules\/insurance["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*insuranceRoutes\)/);
  });

  it('removes the insurance-claims handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/insurance\/claims['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/insurance\/claims['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.patch\(['"]\/api\/insurance\/claims\/:id\/status['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/insurance\/claims\/analytics['"]/);
  });

  it('preserves the four routes incl. the ownership-guarded status update', () => {
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/insurance\/claims['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/insurance\/claims['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/insurance\/claims\/:id\/status['"]/);
    expect(moduleIndexSource).toMatch(/requireResourceOwnership\(\{\s*table:\s*['"]insurance_claims['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/insurance\/claims\/analytics['"],\s*isAuthenticated/);
  });

  it('keeps the validation boundary in the controller and data access in the repository', () => {
    expect(controllerSource).toMatch(/validatePatchBody\(req, res, createInsuranceClaimSchema\)/);
    expect(controllerSource).toMatch(/validatePatchBody\(req, res, updateInsuranceClaimSchema\)/);
    expect(controllerSource).not.toMatch(/phase6-compliance-service/);
    expect(repositorySource).toMatch(/phase6-compliance-service/);
  });
});
