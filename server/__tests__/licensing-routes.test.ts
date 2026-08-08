import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the internal license-management subsystem (Phase
 * D.1). A new `licensing` module — NOT a monolith extraction — issuing signed,
 * offline-verifiable license keys that complement the SaaS `subscriptions`
 * entitlement model. Behavioral coverage lives in the service + signing tests.
 */
describe('Licensing subsystem (Phase D.1 module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/licensing/index.ts');
  const service = read('server/modules/licensing/services/licensing.service.ts');
  const repository = read('server/modules/licensing/repositories/licensing.repository.ts');
  const controller = read('server/modules/licensing/controllers/licensing.controller.ts');
  const schema = read('shared/schema.ts');

  it('mounts the licensing module from the hybrid router', () => {
    expect(hybrid).toMatch(/import licensingRoutes from ["']\.\.\/modules\/licensing["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*licensingRoutes\)/);
  });

  it('gates admin license administration behind requirePlatformAdmin + auditLog', () => {
    expect(moduleIndex).toMatch(/router\.post\(\s*'\/licenses',\s*requirePlatformAdmin,\s*auditLog/);
    expect(moduleIndex).toMatch(/router\.post\(\s*'\/licenses\/:id\/revoke',\s*requirePlatformAdmin,\s*auditLog/);
    expect(moduleIndex).toMatch(/router\.get\(\s*'\/licenses',\s*requirePlatformAdmin/);
  });

  it('exposes tenant activate/validate behind isAuthenticated (fixed paths before :id)', () => {
    expect(moduleIndex).toMatch(/router\.post\(\s*'\/licenses\/activate',\s*isAuthenticated/);
    expect(moduleIndex).toMatch(/router\.post\(\s*'\/licenses\/validate',\s*isAuthenticated/);
    const activateAt = moduleIndex.indexOf("'/licenses/activate'");
    const idAt = moduleIndex.indexOf("'/licenses/:id'");
    expect(activateAt).toBeGreaterThan(-1);
    expect(idAt).toBeGreaterThan(activateAt); // fixed path registered first
  });

  it('reuses @shared/plans for entitlement limits in the service', () => {
    expect(service).toMatch(/from '@shared\/plans'/);
    expect(service).toMatch(/entitlements/);
  });

  it('keeps signing/data access in the repository, not the service', () => {
    expect(repository).toMatch(/license-key/); // signing seam
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(service).not.toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    // Domain errors own the transitions.
    expect(service).toMatch(/ConflictError/);
    expect(controller).toMatch(/status\(201\)/);
  });

  it('declares the licenses + license_activations tables with a generated migration', () => {
    expect(schema).toMatch(/export const licenses = pgTable\("licenses"/);
    expect(schema).toMatch(/export const licenseActivations = pgTable\("license_activations"/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'migrations/0003_licensing_tables.sql'))).toBe(true);
  });
});
