import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Gamification read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const gamificationRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/gamification.ts'), 'utf-8');

  it('mounts the extracted gamification router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import gamificationRoutes from ['"]\.\/gamification['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*gamificationRoutes\)/);
  });

  it('removes active gamification read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/gamification\/leaderboard['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/gamification\/profile\/:technicianId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/gamification\/badges['"]/);
  });

  it('preserves leaderboard defaults and storage lookup', () => {
    expect(gamificationRoutesSource).toMatch(/router\.get\(['"]\/gamification\/leaderboard['"],\s*isAuthenticated/);
    expect(gamificationRoutesSource).toMatch(/const \{ period = ['"]weekly['"],\s*limit = 10 \} = req\.query/);
    expect(gamificationRoutesSource).toMatch(/storage\.getLeaderboard\(\s*period as string,\s*parseInt\(limit as string\),\s*\)/);
  });

  it('preserves technician profile and badge read contracts', () => {
    expect(gamificationRoutesSource).toMatch(/router\.get\(['"]\/gamification\/profile\/:technicianId['"],\s*isAuthenticated/);
    expect(gamificationRoutesSource).toMatch(/storage\.getTechnicianPoints\(req\.params\.technicianId\)/);
    expect(gamificationRoutesSource).toMatch(/storage\.getTechnicianBadges\(req\.params\.technicianId\)/);
    expect(gamificationRoutesSource).toMatch(/storage\.getTechnicianRecentEvents\(req\.params\.technicianId,\s*10\)/);
    expect(gamificationRoutesSource).toMatch(/res\.json\(\{ points,\s*badges,\s*recentEvents \}\)/);
    expect(gamificationRoutesSource).toMatch(/router\.get\(['"]\/gamification\/badges['"],\s*isAuthenticated/);
    expect(gamificationRoutesSource).toMatch(/storage\.getGamificationBadges\(\)/);
  });
});
