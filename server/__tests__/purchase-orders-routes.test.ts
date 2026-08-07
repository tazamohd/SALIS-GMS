import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the purchase-order / purchase-task read surface.
 * Phase E migrated the extracted router into the procurement module
 * (`server/modules/procurement`); assertions target the module's
 * controller/service/repository. Behavioral coverage lives in
 * `server/modules/procurement/__tests__/procurement.service.test.ts`.
 */
describe('Purchase order and task read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/procurement/index.ts');
  const serviceSource = read('server/modules/procurement/services/purchase.service.ts');
  const repositorySource = read('server/modules/procurement/repositories/purchase.repository.ts');

  it('mounts the procurement module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import purchaseOrderRoutes from ['"]\.\.\/modules\/procurement['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*purchaseOrderRoutes\)/);
  });

  it('removes active purchase read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/purchase-orders['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/purchase-orders\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/purchase-orders\/:id\/items['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/purchase-tasks['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/purchase-tasks\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/purchase-tasks\/:id\/parts['"]/);
  });

  it('moves purchase order, item, and task write handlers into the procurement module', () => {
    // The mutating handlers are retired from the legacy monolith...
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/purchase-orders['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/purchase-orders\/with-items['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.patch\(['"]\/api\/purchase-orders\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.delete\(['"]\/api\/purchase-orders\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/purchase-order-items['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.delete\(['"]\/api\/purchase-order-items\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.post\(['"]\/api\/purchase-tasks['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.patch\(['"]\/api\/purchase-tasks\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.delete\(['"]\/api\/purchase-tasks\/:id['"]/);
    // ...and now live on the procurement module router.
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/purchase-orders['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/purchase-orders\/with-items['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/purchase-orders\/:id['"]/);
    expect(moduleIndexSource).toMatch(/router\.delete\(\s*['"]\/purchase-orders\/:id['"]/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/purchase-order-items['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.delete\(\s*['"]\/purchase-order-items\/:id['"]/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/purchase-tasks['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/purchase-tasks\/:id['"]/);
    expect(moduleIndexSource).toMatch(/router\.delete\(\s*['"]\/purchase-tasks\/:id['"]/);
    // The parent-scoped ownership guard survives on the item delete.
    expect(moduleIndexSource).toMatch(/table:\s*['"]purchase_order_items['"],\s*parent:/);
  });

  it('preserves purchase order list, detail, and item read behavior', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/purchase-orders['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/purchase-orders\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/purchase-orders\/:id\/items['"],\s*isAuthenticated/);
    // B11: list scopes to the session garage (controller reads req.user.garageId).
    expect(repositorySource).toMatch(/storage\.getPurchaseOrders\(/);
    expect(repositorySource).toMatch(/storage\.getPurchaseOrder\(/);
    expect(repositorySource).toMatch(/storage\.getPurchaseOrderItems\(/);
    expect(serviceSource).toMatch(/Purchase order not found/);
  });

  it('preserves purchase task list, detail, and parts read behavior', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/purchase-tasks['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/purchase-tasks\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/purchase-tasks\/:id\/parts['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.getPurchaseTasks\(/);
    expect(repositorySource).toMatch(/storage\.getPurchaseTask\(/);
    expect(repositorySource).toMatch(/storage\.getPurchaseTaskParts\(/);
    expect(serviceSource).toMatch(/Task not found/);
  });
});
