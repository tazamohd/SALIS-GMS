import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Delivery read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const deliveryRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/deliveries.ts'), 'utf-8');

  it('mounts the extracted delivery router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import deliveryRoutes from ['"]\.\/deliveries['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*deliveryRoutes\)/);
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
    expect(deliveryRoutesSource).toMatch(/router\.get\(['"]\/deliveries['"],\s*isAuthenticated/);
    expect(deliveryRoutesSource).toMatch(/storage\.getDeliveries\(garage_id as string,\s*status as string\)/);
    expect(deliveryRoutesSource).toMatch(/router\.get\(['"]\/deliveries\/:id['"],\s*isAuthenticated/);
    expect(deliveryRoutesSource).toMatch(/storage\.getDelivery\(id\)/);
    expect(deliveryRoutesSource).toMatch(/Delivery not found/);
    expect(deliveryRoutesSource).toMatch(/router\.get\(['"]\/deliveries\/:id\/items['"],\s*isAuthenticated/);
    expect(deliveryRoutesSource).toMatch(/storage\.getDeliveryItems\(id\)/);
    expect(deliveryRoutesSource).toMatch(/router\.get\(['"]\/deliveries\/:id\/timeline['"],\s*isAuthenticated/);
    expect(deliveryRoutesSource).toMatch(/storage\.getDeliveryTimeline\(id\)/);
    expect(deliveryRoutesSource).toMatch(/router\.get\(['"]\/deliveries\/:id\/live['"],\s*isAuthenticated/);
    expect(deliveryRoutesSource).toMatch(/storage\.getLiveDeliveryStatus\(id\)/);
    expect(deliveryRoutesSource).toMatch(/Live status not found/);
  });
});
