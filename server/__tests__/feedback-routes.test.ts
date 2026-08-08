import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the feedback extraction (Phase E). The 11
 * `/api/feedback/*` handlers (submit, per-job-card / per-technician / filtered
 * lookups, analytics, respond/flag/unflag, single + bulk sentiment analysis)
 * moved from the monolith into `server/modules/feedback`, preserving the
 * (parent-scoped) ownership guards. Behavioral coverage: the module service tests.
 */
describe('Feedback extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/feedback/index.ts');
  const service = read('server/modules/feedback/services/feedback.service.ts');
  const repository = read('server/modules/feedback/repositories/feedback.repository.ts');

  it('mounts the feedback module from the hybrid router', () => {
    expect(hybrid).toMatch(/import feedbackRoutes from ["']\.\.\/modules\/feedback["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*feedbackRoutes\)/);
  });

  it('removes every /api/feedback* handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/feedback/);
  });

  it('drops the now-orphaned insertServiceFeedbackSchema import from the monolith', () => {
    expect(legacy).not.toMatch(/insertServiceFeedbackSchema/);
  });

  it('registers the 11 routes with analytics before :id and preserves the ownership guards', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(11);
    expect(moduleIndex.indexOf("'/feedback/analytics'")).toBeLessThan(moduleIndex.indexOf("'/feedback/:id'"));
    expect(moduleIndex).toMatch(/table: 'job_cards', idParam: 'jobCardId'/);
    expect(moduleIndex).toMatch(/idParam: 'technicianId'/);
    expect(moduleIndex).toMatch(/table: 'service_feedback',\s*parent: \{ table: 'job_cards', fk: 'job_card_id' \}/);
  });

  it('keeps the OpenAI seam in the repository and the domain rules in the service', () => {
    expect(repository).toMatch(/import\('openai'\)/);
    expect(service).toMatch(/NotFoundError\('Feedback not found'\)/);
    expect(service).toMatch(/ValidationError\('Response is required'\)/);
    expect(service).toMatch(/ValidationError\('No comments to analyze'\)/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
