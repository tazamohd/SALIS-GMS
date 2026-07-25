import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Assignment read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const assignmentRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/assignments.ts'), 'utf-8');

  it('mounts the extracted assignment router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import assignmentRoutes from ['"]\.\/assignments['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*assignmentRoutes\)/);
  });

  it('removes active assignment read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/assignments\/history\/:jobCardId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/assignments\/rules['"]/);
  });

  it('leaves assignment write and recommendation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/assignments\/recommend\/:jobCardId['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/assignments\/assign['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/assignments\/rules['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/assignments\/rules\/:id['"]/);
  });

  it('preserves assignment history garage guard and limit behavior', () => {
    expect(assignmentRoutesSource).toMatch(/router\.get\(['"]\/assignments\/history\/:jobCardId['"],\s*isAuthenticated/);
    expect(assignmentRoutesSource).toMatch(/const \{ jobCardId \} = req\.params/);
    expect(assignmentRoutesSource).toMatch(/const \{ limit \} = req\.query/);
    expect(assignmentRoutesSource).toMatch(/const userGarageId = \(req\.user as any\)\?\.garageId/);
    expect(assignmentRoutesSource).toMatch(/User garage ID is required/);
    expect(assignmentRoutesSource).toMatch(/storage\.listAssignmentHistory\(\s*userGarageId,\s*jobCardId,\s*limit \? parseInt\(limit as string\) : 50,\s*\)/);
  });

  it('preserves assignment rules active filtering and garage guard', () => {
    expect(assignmentRoutesSource).toMatch(/router\.get\(['"]\/assignments\/rules['"],\s*isAuthenticated/);
    expect(assignmentRoutesSource).toMatch(/const \{ active \} = req\.query/);
    expect(assignmentRoutesSource).toMatch(/storage\.listAssignmentRules\(\s*userGarageId,\s*active === ['"]true['"] \? true : active === ['"]false['"] \? false : undefined,\s*\)/);
    expect(assignmentRoutesSource).toMatch(/Failed to fetch assignment rules/);
  });
});
