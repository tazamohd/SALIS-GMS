import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the delivery read surface. Phase E migrated the
 * extracted router into the procurement module (`server/modules/procurement`);
 * assertions target the module's controller/service/repository. Behavioral
 * coverage lives in `server/modules/procurement/__tests__/procurement.service.test.ts`.
 */
describe('Delivery read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/procurement/index.ts');
  const serviceSource = read('server/modules/procurement/services/delivery.service.ts');
  const repositorySource = read('server/modules/procurement/repositories/delivery.repository.ts');

  it('mounts the procurement module (which now owns the delivery reads)', () => {
    expect(hybridRoutesSource).toMatch(/import purchaseOrderRoutes from ['"]\.\.\/modules\/procurement['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*purchaseOrderRoutes\)/);
    // The standalone delivery router is retired.
    expect(hybridRoutesSource).not.toMatch(/deliveryRoutes/);
  });

  it('removes active delivery read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/deliveries['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/deliveries\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/deliveries\/:id\/items['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/deliveries\/:id\/timeline['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/deliveries\/:id\/live['"]/);
  });

  it('leaves mutating delivery handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/deliveries['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/deliveries\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/deliveries\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/deliveries\/:id\/timeline['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/deliveries\/:id\/live['"]/);
  });

  it('preserves delivery list, detail, items, timeline, and live status reads', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/deliveries['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/deliveries\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/deliveries\/:id\/items['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/deliveries\/:id\/timeline['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/deliveries\/:id\/live['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.getDeliveries\(/);
    expect(repositorySource).toMatch(/storage\.getDelivery\(/);
    expect(repositorySource).toMatch(/storage\.getDeliveryItems\(/);
    expect(repositorySource).toMatch(/storage\.getDeliveryTimeline\(/);
    expect(repositorySource).toMatch(/storage\.getLiveDeliveryStatus\(/);
    expect(serviceSource).toMatch(/Delivery not found/);
    expect(serviceSource).toMatch(/Live status not found/);
  });
});
