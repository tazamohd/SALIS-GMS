import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Auto-reorder route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const autoReorderRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/auto-reorder.ts'), 'utf-8');
  const phase5ServiceSource = fs.readFileSync(path.resolve(process.cwd(), 'server/phase5-operations-service.ts'), 'utf-8');

  it('mounts the extracted auto-reorder router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import autoReorderRoutes from ['"]\.\/auto-reorder['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*autoReorderRoutes\)/);
  });

  it('removes active auto-reorder handlers and placeholders from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(["']\/api\/auto-reorder\/rules["']/);
    expect(legacyRoutesSource).not.toMatch(/app\.post\(["']\/api\/auto-reorder\/rules["']/);
    expect(legacyRoutesSource).not.toMatch(/app\.post\(["']\/api\/auto-reorder\/check["']/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(["']\/api\/auto-reorder\/history["']/);
    expect(legacyRoutesSource).not.toMatch(/partName: ["']Oil Filter["'],\s*partNumber: ["']OF-123["']/);
    expect(legacyRoutesSource).not.toMatch(/AutoParts Plus/);
  });

  it('preserves service-backed auto-reorder list, check, and history behavior', () => {
    expect(autoReorderRoutesSource).toMatch(/router\.get\(['"]\/auto-reorder\/rules['"],\s*isAuthenticated/);
    expect(autoReorderRoutesSource).toMatch(/phase5Service\.getAutoReorderRules\(garageId\)/);
    expect(autoReorderRoutesSource).toMatch(/router\.post\(['"]\/auto-reorder\/check['"],\s*isAuthenticated/);
    expect(autoReorderRoutesSource).toMatch(/phase5Service\.checkAndTriggerReorders\(garageId\)/);
    expect(autoReorderRoutesSource).toMatch(/res\.json\(\{\s*triggered: triggeredOrders\.length,\s*orders: triggeredOrders\s*\}\)/);
    expect(autoReorderRoutesSource).toMatch(/router\.get\(['"]\/auto-reorder\/history['"],\s*isAuthenticated/);
    expect(autoReorderRoutesSource).toMatch(/phase5Service\.getReorderHistory\(garageId,\s*parseLimit\(limit,\s*50\)\)/);
    expect(autoReorderRoutesSource).toMatch(/Failed to fetch auto-reorder rules/);
    expect(autoReorderRoutesSource).toMatch(/Failed to check auto-reorders/);
    expect(autoReorderRoutesSource).toMatch(/Failed to fetch reorder history/);
  });

  it('replaces fake create-rule behavior with a real service-backed rule creation route', () => {
    expect(autoReorderRoutesSource).toMatch(/router\.post\(['"]\/auto-reorder\/rules['"],\s*isAuthenticated/);
    expect(autoReorderRoutesSource).toMatch(/autoReorderRuleSchema\.parse\(req\.body\)/);
    expect(autoReorderRoutesSource).toMatch(/phase5Service\.createAutoReorderRule\(\{/);
    expect(autoReorderRoutesSource).toMatch(/reorderPoint: validated\.reorderPoint \?\? validated\.minQuantity/);
    expect(autoReorderRoutesSource).toMatch(/preferredSupplier: validated\.preferredSupplier \?\? validated\.preferredSupplierId/);
    expect(autoReorderRoutesSource).toMatch(/res\.status\(201\)\.json\(rule\)/);
    expect(autoReorderRoutesSource).not.toMatch(/id: ['"]new['"]/);
  });

  it('adds the missing auto-reorder create service contract used by the route', () => {
    expect(phase5ServiceSource).toMatch(/export async function createAutoReorderRule\(data:/);
    expect(phase5ServiceSource).toMatch(/\.insert\(autoReorderRules\)/);
    expect(phase5ServiceSource).toMatch(/reorderPoint,\s*reorderQuantity: data\.reorderQuantity/);
    expect(phase5ServiceSource).toMatch(/preferredSupplier: data\.preferredSupplier \?\? data\.preferredSupplierId/);
    expect(phase5ServiceSource).toMatch(/Failed to create auto-reorder rule/);
  });
});
