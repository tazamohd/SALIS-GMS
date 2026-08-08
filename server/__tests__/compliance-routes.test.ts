import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the compliance extraction (Phase E). The 10
 * `/api/compliance/*` handlers (environmental create/list/analytics +
 * policies/audits/tasks) moved from the monolith into
 * `server/modules/compliance` — a non-contiguous removal across two blocks,
 * dropping the inline `complianceRecordSchema` + the three orphaned insert
 * imports. Behavioral coverage: the module service tests.
 */
describe('Compliance extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/compliance/index.ts');
  const controller = read('server/modules/compliance/controllers/compliance.controller.ts');
  const repository = read('server/modules/compliance/repositories/compliance.repository.ts');

  it('mounts the compliance module from the hybrid router', () => {
    expect(hybrid).toMatch(/import complianceRoutes from ["']\.\.\/modules\/compliance["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*complianceRoutes\)/);
  });

  it('removes every /api/compliance/* handler and the orphaned schemas from the monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/compliance\//);
    expect(legacy).not.toMatch(/complianceRecordSchema/);
    expect(legacy).not.toMatch(/insertCompliancePolicySchema/);
    expect(legacy).not.toMatch(/insertComplianceAuditSchema/);
    expect(legacy).not.toMatch(/insertComplianceTaskSchema/);
  });

  it('registers the 10 routes and preserves the tasks/:id/complete guard', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(10);
    expect(moduleIndex).toMatch(/table: 'compliance_tasks'/);
  });

  it('preserves both legacy response conventions in the controller', () => {
    // environmental: { message } 500s + 201 create
    expect(controller).toMatch(/Failed to create compliance record/);
    expect(controller).toMatch(/status\(201\)/);
    // policies/audits/tasks: { data } envelope + { error } 500s
    expect(controller).toMatch(/\{ data:/);
    expect(controller).toMatch(/error: \(error as Error\)\.message/);
  });

  it('keeps the phase6 + storage seams in the repository', () => {
    expect(repository).toMatch(/phase6-compliance-service/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
