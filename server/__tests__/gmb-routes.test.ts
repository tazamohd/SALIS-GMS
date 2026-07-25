import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('GMB read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const gmbRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/gmb.ts'), 'utf-8');

  it('mounts the extracted GMB router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import gmbRoutes from ['"]\.\/gmb['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*gmbRoutes\)/);
  });

  it('removes active GMB read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/gmb\/profiles['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/gmb\/posts['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/gmb\/reviews['"]/);
  });

  it('leaves GMB mutation and action handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/gmb\/profiles['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/gmb\/posts['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/gmb\/posts\/:id\/publish['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/gmb\/reviews['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/gmb\/reviews\/:id\/respond['"]/);
  });

  it('preserves GMB profile garage scoping', () => {
    expect(gmbRoutesSource).toMatch(/router\.get\(['"]\/gmb\/profiles['"],\s*isAuthenticated/);
    expect(gmbRoutesSource).toMatch(/storage\.getGoogleBusinessProfiles\(req\.user\?\.garageId\)/);
    expect(gmbRoutesSource).toMatch(/res\.json\(\{ data: profiles \}\)/);
  });

  it('preserves GMB post and review query filters', () => {
    expect(gmbRoutesSource).toMatch(/router\.get\(['"]\/gmb\/posts['"],\s*isAuthenticated/);
    expect(gmbRoutesSource).toMatch(/storage\.getGmbPosts\(req\.query\.profileId as string,\s*req\.query\.status as string\)/);
    expect(gmbRoutesSource).toMatch(/router\.get\(['"]\/gmb\/reviews['"],\s*isAuthenticated/);
    expect(gmbRoutesSource).toMatch(/storage\.getGmbReviews\(req\.query\.profileId as string\)/);
  });
});
