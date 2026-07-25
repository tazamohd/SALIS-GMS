import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service reminder template read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const templateRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/service-reminder-templates.ts'), 'utf-8');

  it('mounts the extracted service reminder template router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import serviceReminderTemplateRoutes from ['"]\.\/service-reminder-templates['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*serviceReminderTemplateRoutes\)/);
  });

  it('removes active service reminder template read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-reminder-templates['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-reminder-templates\/:id['"]/);
  });

  it('leaves service reminder template mutation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/service-reminder-templates['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.createServiceReminderTemplate\(\{ \.\.\.req\.body,\s*garageId \}\)/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/service-reminder-templates\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/service-reminder-templates\/:id['"]/);
  });

  it('preserves template list garage scoping', () => {
    expect(templateRoutesSource).toMatch(/router\.get\(['"]\/service-reminder-templates['"],\s*isAuthenticated/);
    expect(templateRoutesSource).toMatch(/const garageId = req\.user\?\.garageId/);
    expect(templateRoutesSource).toMatch(/storage\.getServiceReminderTemplates\(garageId\)/);
    expect(templateRoutesSource).toMatch(/res\.json\(templates\)/);
  });

  it('preserves template detail lookup and 404 behavior', () => {
    expect(templateRoutesSource).toMatch(/router\.get\(['"]\/service-reminder-templates\/:id['"],\s*isAuthenticated/);
    expect(templateRoutesSource).toMatch(/storage\.getServiceReminderTemplate\(req\.params\.id\)/);
    expect(templateRoutesSource).toMatch(/return res\.status\(404\)\.json\(\{ message: ['"]Template not found['"] \}\)/);
    expect(templateRoutesSource).toMatch(/res\.json\(template\)/);
  });
});
