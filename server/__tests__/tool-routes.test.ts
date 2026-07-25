import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tool read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const toolRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/tools.ts'), 'utf-8');

  it('mounts the extracted tool router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import toolRoutes from ['"]\.\/tools['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*toolRoutes\)/);
  });

  it('removes active tool read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/tools['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/tools\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/tool-availability['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/tools\/:toolId\/usage['"]/);
  });

  it('leaves mutating tool handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/tools['"]/);
    expect(legacyRoutesSource).toMatch(/app\.put\(['"]\/api\/tools\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/tool-availability['"]/);
    expect(legacyRoutesSource).toMatch(/app\.put\(['"]\/api\/tool-availability\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/tool-usage['"]/);
  });

  it('preserves all extracted route paths and authentication middleware', () => {
    const routePatterns = [
      /router\.get\(['"]\/tools['"],\s*isAuthenticated/,
      /router\.get\(['"]\/tools\/:id['"],\s*isAuthenticated/,
      /router\.get\(['"]\/tool-availability['"],\s*isAuthenticated/,
      /router\.get\(['"]\/tools\/:toolId\/usage['"],\s*isAuthenticated/,
    ];

    for (const pattern of routePatterns) {
      expect(toolRoutesSource).toMatch(pattern);
    }
  });

  it('preserves tool availability garage_id validation', () => {
    expect(toolRoutesSource).toMatch(/if \(!garage_id\)/);
    expect(toolRoutesSource).toMatch(/garage_id is required/);
    expect(toolRoutesSource).toMatch(/storage\.getToolAvailability\(/);
  });
});
