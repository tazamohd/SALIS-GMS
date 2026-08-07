import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the job card read surface. Phase E migrated the
 * extracted router into a layered module (`server/modules/jobcards`); assertions
 * target the module's controller/service/repository. The `/parts` Drizzle query
 * (previously inlined in the route) now lives in the repository. Behavioral
 * coverage lives in `server/modules/jobcards/__tests__/jobcard.service.test.ts`.
 */
describe('Job card read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/jobcards/index.ts');
  const controllerSource = read('server/modules/jobcards/controllers/jobcard.controller.ts');
  const serviceSource = read('server/modules/jobcards/services/jobcard.service.ts');
  const repositorySource = read('server/modules/jobcards/repositories/jobcard.repository.ts');

  it('mounts the job card module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import jobCardRoutes from ['"]\.\.\/modules\/jobcards['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*jobCardRoutes\)/);
  });

  it('removes active plain job card read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/job-cards['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/job-cards\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/job-cards\/:id\/details['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/job-cards\/:jobCardId\/parts['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/job-cards\/:jobCardId\/tasks['"]/);
  });

  it('leaves job card writes and tracking reads in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/job-cards['"]/);
    expect(legacyRoutesSource).toMatch(/app\.put\(['"]\/api\/job-cards\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/job-cards\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/job-cards\/:jobCardId\/parts['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/job-cards\/:jobCardId\/parts\/:partId['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/job-cards\/:jobCardId\/tasks['"]/);
    expect(legacyRoutesSource).toMatch(/app\.get\(['"]\/api\/job-cards\/:id\/tracking\/events['"]/);
  });

  it('preserves job card list pagination and garage/assignment scoping', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/job-cards['"],\s*isAuthenticated/);
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/req\.query\.assigned_to/);
    // Session garage takes precedence over ?garage_id (tenant isolation).
    expect(serviceSource).toMatch(/auth\.garageId \?\? garageIdParam/);
    expect(repositorySource).toMatch(/storage\.getJobCardsPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countJobCards\(/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
  });

  it('preserves job card detail, details, parts, and task reads', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/job-cards\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/job-cards\/:id\/details['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/job-cards\/:jobCardId\/parts['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/job-cards\/:jobCardId\/tasks['"],\s*isAuthenticated/);
    expect(serviceSource).toMatch(/Job card not found/);
    expect(repositorySource).toMatch(/storage\.getJobCard\(/);
    expect(repositorySource).toMatch(/storage\.getJobCardWithDetails\(/);
    // The parts Drizzle query moved into the repository.
    expect(repositorySource).toMatch(/db\.select\(\)\.from\(jobCardParts\)\.where\(eq\(jobCardParts\.jobCardId,\s*jobCardId\)\)/);
    expect(repositorySource).toMatch(/storage\.getTaskAssignments\(/);
  });
});
