import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service template read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const serviceTemplateRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/service-templates.ts'), 'utf-8');

  it('mounts the extracted service template router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import serviceTemplateRoutes from ['"]\.\/service-templates['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*serviceTemplateRoutes\)/);
  });

  it('removes active service template read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-templates\/all['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-templates['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-templates\/:id['"]/);
  });

  it('leaves mutating service template handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/service-templates['"]/);
    expect(legacyRoutesSource).toMatch(/app\.put\(['"]\/api\/service-templates\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/service-templates\/:id['"]/);
  });

  it('preserves route order, auth, garage_id validation, and storage calls', () => {
    const allIndex = serviceTemplateRoutesSource.indexOf("router.get('/service-templates/all'");
    const byIdIndex = serviceTemplateRoutesSource.indexOf("router.get('/service-templates/:id'");

    expect(allIndex).toBeGreaterThanOrEqual(0);
    expect(byIdIndex).toBeGreaterThan(allIndex);
    expect(serviceTemplateRoutesSource).toMatch(/router\.get\(['"]\/service-templates\/all['"],\s*isAuthenticated/);
    expect(serviceTemplateRoutesSource).toMatch(/router\.get\(['"]\/service-templates['"],\s*isAuthenticated/);
    expect(serviceTemplateRoutesSource).toMatch(/router\.get\(['"]\/service-templates\/:id['"],\s*isAuthenticated/);
    expect(serviceTemplateRoutesSource).toMatch(/if \(!garage_id\)/);
    expect(serviceTemplateRoutesSource).toMatch(/garage_id is required/);
    expect(serviceTemplateRoutesSource).toMatch(/storage\.getAllServiceTemplates\(\)/);
    expect(serviceTemplateRoutesSource).toMatch(/storage\.getServiceTemplates\(garage_id as string\)/);
    expect(serviceTemplateRoutesSource).toMatch(/storage\.getServiceTemplate\(id\)/);
  });
});
