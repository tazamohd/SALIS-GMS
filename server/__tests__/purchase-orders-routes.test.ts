import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Purchase order and task read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const purchaseRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/purchase-orders.ts'), 'utf-8');

  it('mounts the extracted purchase order router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import purchaseOrderRoutes from ['"]\.\/purchase-orders['"]/);
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

  it('leaves mutating purchase order, item, and task handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/purchase-orders['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/purchase-orders\/with-items['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/purchase-orders\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/purchase-orders\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/purchase-order-items['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/purchase-order-items\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/purchase-tasks['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/purchase-tasks\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/purchase-tasks\/:id['"]/);
  });

  it('preserves purchase order list, detail, and item read behavior', () => {
    expect(purchaseRoutesSource).toMatch(/router\.get\(['"]\/purchase-orders['"],\s*isAuthenticated/);
    expect(purchaseRoutesSource).toMatch(/const \{ garage_id,\s*status \} = req\.query/);
    expect(purchaseRoutesSource).toMatch(/storage\.getPurchaseOrders\(garage_id as string,\s*status as string\)/);
    expect(purchaseRoutesSource).toMatch(/router\.get\(['"]\/purchase-orders\/:id['"],\s*isAuthenticated/);
    expect(purchaseRoutesSource).toMatch(/storage\.getPurchaseOrder\(id\)/);
    expect(purchaseRoutesSource).toMatch(/Purchase order not found/);
    expect(purchaseRoutesSource).toMatch(/router\.get\(['"]\/purchase-orders\/:id\/items['"],\s*isAuthenticated/);
    expect(purchaseRoutesSource).toMatch(/storage\.getPurchaseOrderItems\(id\)/);
  });

  it('preserves purchase task list, detail, and parts read behavior', () => {
    expect(purchaseRoutesSource).toMatch(/router\.get\(['"]\/purchase-tasks['"],\s*isAuthenticated/);
    expect(purchaseRoutesSource).toMatch(/const \{ garage_id,\s*status,\s*priority \} = req\.query/);
    expect(purchaseRoutesSource).toMatch(/storage\.getPurchaseTasks\(\s*garage_id as string,\s*status as string,\s*priority as string,\s*\)/);
    expect(purchaseRoutesSource).toMatch(/router\.get\(['"]\/purchase-tasks\/:id['"],\s*isAuthenticated/);
    expect(purchaseRoutesSource).toMatch(/storage\.getPurchaseTask\(id\)/);
    expect(purchaseRoutesSource).toMatch(/Task not found/);
    expect(purchaseRoutesSource).toMatch(/router\.get\(['"]\/purchase-tasks\/:id\/parts['"],\s*isAuthenticated/);
    expect(purchaseRoutesSource).toMatch(/storage\.getPurchaseTaskParts\(id\)/);
  });
});
