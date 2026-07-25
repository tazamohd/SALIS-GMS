import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('VIN decode route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const vinRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/vin.ts'), 'utf-8');

  it('mounts the extracted VIN router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import vinRoutes from ['"]\.\/vin['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*vinRoutes\)/);
  });

  it('removes active VIN decode handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vin-decode\/:vin['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/decode-vin\/:vin['"]/);
    expect(legacyRoutesSource).not.toMatch(/function mapFuelType/);
    expect(legacyRoutesSource).not.toMatch(/function mapTransmission/);
  });

  it('preserves authentication, VIN validation, and NHTSA endpoint contract', () => {
    expect(vinRoutesSource).toMatch(/router\.get\(['"]\/vin-decode\/:vin['"],\s*isAuthenticated/);
    expect(vinRoutesSource).toMatch(/vin\.length !== 17/);
    expect(vinRoutesSource).toMatch(/vpic\.nhtsa\.dot\.gov\/api\/vehicles\/decodevin\/\$\{vin\}\?format=json/);
  });

  it('preserves the storage-backed VIN decode route contract', () => {
    expect(vinRoutesSource).toMatch(/router\.get\(['"]\/decode-vin\/:vin['"],\s*isAuthenticated/);
    expect(vinRoutesSource).toMatch(/storage\.decodeVIN\(vin\)/);
    expect(vinRoutesSource).toMatch(/VIN not found or invalid/);
    expect(vinRoutesSource).toMatch(/Failed to decode VIN/);
  });

  it('preserves decoded field mapping used by vehicle forms', () => {
    for (const field of [
      'make',
      'model',
      'year',
      'bodyClass',
      'engineType',
      'transmissionType',
      'color',
    ]) {
      expect(vinRoutesSource).toMatch(new RegExp(`${field}:`));
    }
  });
});
