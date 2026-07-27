import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Job card read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const jobCardRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/job-cards.ts'), 'utf-8');

  it('mounts the extracted job card router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import jobCardRoutes from ['"]\.\/job-cards['"]/);
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
    expect(jobCardRoutesSource).toMatch(/router\.get\(['"]\/job-cards['"],\s*isAuthenticated/);
    expect(jobCardRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(jobCardRoutesSource).toMatch(/const \{ garage_id,\s*assigned_to \} = req\.query/);
    // Session garage takes precedence over ?garage_id (tenant isolation).
    expect(jobCardRoutesSource).toMatch(/const gid = \(req\.user as any\)\?\.garageId \|\| \(garage_id as string\)/);
    expect(jobCardRoutesSource).toMatch(/const assignedTo = assigned_to as string \| undefined/);
    expect(jobCardRoutesSource).toMatch(/storage\.getJobCardsPaginated\(gid,\s*assignedTo,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(jobCardRoutesSource).toMatch(/storage\.countJobCards\(gid,\s*assignedTo\)/);
    expect(jobCardRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
  });

  it('preserves job card detail, details, parts, and task reads', () => {
    expect(jobCardRoutesSource).toMatch(/router\.get\(['"]\/job-cards\/:id['"],\s*isAuthenticated/);
    expect(jobCardRoutesSource).toMatch(/storage\.getJobCard\(id\)/);
    expect(jobCardRoutesSource).toMatch(/router\.get\(['"]\/job-cards\/:id\/details['"],\s*isAuthenticated/);
    expect(jobCardRoutesSource).toMatch(/storage\.getJobCardWithDetails\(id\)/);
    expect(jobCardRoutesSource).toMatch(/router\.get\(['"]\/job-cards\/:jobCardId\/parts['"],\s*isAuthenticated/);
    expect(jobCardRoutesSource).toMatch(/db\.select\(\)\.from\(jobCardParts\)\.where\(eq\(jobCardParts\.jobCardId,\s*jobCardId\)\)/);
    expect(jobCardRoutesSource).toMatch(/router\.get\(['"]\/job-cards\/:jobCardId\/tasks['"],\s*isAuthenticated/);
    expect(jobCardRoutesSource).toMatch(/storage\.getTaskAssignments\(jobCardId\)/);
  });
});
