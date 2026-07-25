import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Scheduling read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const schedulingRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/scheduling.ts'), 'utf-8');

  it('mounts the extracted scheduling router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import schedulingRoutes from ['"]\.\/scheduling['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*schedulingRoutes\)/);
  });

  it('removes active scheduling read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(["']\/api\/scheduling\/rules["']/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(["']\/api\/scheduling\/history["']/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(["']\/api\/scheduling\/optimizations["']/);
  });

  it('leaves scheduling optimization mutations in legacy routes for a later action slice', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(["']\/api\/scheduling\/optimize["']/);
    expect(legacyRoutesSource).toMatch(/phase5Service\.runSchedulingOptimization\(garageId\)/);
  });

  it('preserves service-backed scheduling reads and the legacy optimizations alias', () => {
    expect(schedulingRoutesSource).toMatch(/router\.get\(['"]\/scheduling\/rules['"],\s*isAuthenticated/);
    expect(schedulingRoutesSource).toMatch(/phase5Service\.getSchedulingRules\(garageId\)/);
    expect(schedulingRoutesSource).toMatch(/router\.get\(['"]\/scheduling\/history['"],\s*isAuthenticated/);
    expect(schedulingRoutesSource).toMatch(/phase5Service\.getSchedulingHistory\(garageId,\s*parseLimit\(limit,\s*30\)\)/);
    expect(schedulingRoutesSource).toMatch(/router\.get\(['"]\/scheduling\/optimizations['"],\s*isAuthenticated/);
    expect(schedulingRoutesSource).toMatch(/const optimizations = await phase5Service\.getSchedulingHistory\(garageId,\s*parseLimit\(limit,\s*30\)\)/);
    expect(schedulingRoutesSource).toMatch(/Failed to fetch scheduling rules/);
    expect(schedulingRoutesSource).toMatch(/Failed to fetch scheduling history/);
    expect(schedulingRoutesSource).toMatch(/Failed to fetch scheduling optimizations/);
  });
});
