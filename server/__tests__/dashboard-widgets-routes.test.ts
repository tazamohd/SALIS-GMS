import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dashboard widget read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const dashboardWidgetRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/dashboard-widgets.ts'), 'utf-8');

  it('mounts the extracted dashboard widget router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import dashboardWidgetRoutes from ['"]\.\/dashboard-widgets['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*dashboardWidgetRoutes\)/);
  });

  it('removes active dashboard widget read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/dashboard\/widgets['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/dashboard\/widgets\/defaults['"]/);
  });

  it('leaves dashboard widget mutations in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/dashboard\/widgets['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/dashboard\/widgets\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/dashboard\/widgets\/positions['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/dashboard\/widgets\/:id['"]/);
  });

  it('preserves dashboard widget user and garage scoping', () => {
    expect(dashboardWidgetRoutesSource).toMatch(/router\.get\(['"]\/dashboard\/widgets['"],\s*isAuthenticated/);
    expect(dashboardWidgetRoutesSource).toMatch(/const garageId = \(req\.user as any\)\?\.garageId \|\| ['"]default-garage['"]/);
    expect(dashboardWidgetRoutesSource).toMatch(/storage\.getDashboardWidgets\(\(req\.user as any\)\?\.id,\s*garageId\)/);
    expect(dashboardWidgetRoutesSource).toMatch(/router\.get\(['"]\/dashboard\/widgets\/defaults['"],\s*isAuthenticated/);
    expect(dashboardWidgetRoutesSource).toMatch(/storage\.getDefaultWidgets\(\)/);
  });
});
