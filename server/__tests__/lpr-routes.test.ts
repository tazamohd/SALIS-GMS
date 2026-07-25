import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('LPR read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const lprRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/lpr.ts'), 'utf-8');

  it('mounts the extracted LPR router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import lprRoutes from ['"]\.\/lpr['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*lprRoutes\)/);
  });

  it('removes active LPR read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/lpr\/scans['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/lpr\/entry-logs['"]/);
  });

  it('leaves the LPR scan writer in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/lpr\/scan['"]/);
    expect(legacyRoutesSource).toMatch(/licensePlateScanSchema\.parse\(req\.body\)/);
    expect(legacyRoutesSource).toMatch(/phase7Service\.recordLicensePlateScan\(scanData\)/);
  });

  it('preserves license plate scan listing garage scope and limit default', () => {
    expect(lprRoutesSource).toMatch(/router\.get\(['"]\/lpr\/scans['"],\s*isAuthenticated/);
    expect(lprRoutesSource).toMatch(/const garageId = req\.user\?\.garageId/);
    expect(lprRoutesSource).toMatch(/const \{ limit \} = req\.query/);
    expect(lprRoutesSource).toMatch(/phase7Service\.getLicensePlateScans\(garageId,\s*limit \? parseInt\(limit\) : 100\)/);
  });

  it('preserves entry log status filtering', () => {
    expect(lprRoutesSource).toMatch(/router\.get\(['"]\/lpr\/entry-logs['"],\s*isAuthenticated/);
    expect(lprRoutesSource).toMatch(/const \{ status \} = req\.query/);
    expect(lprRoutesSource).toMatch(/phase7Service\.getVehicleEntryLogs\(garageId,\s*status as string\)/);
    expect(lprRoutesSource).toMatch(/res\.json\(logs\)/);
  });
});
