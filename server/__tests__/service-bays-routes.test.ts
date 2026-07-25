import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service bay read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const serviceBayRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/service-bays.ts'), 'utf-8');

  it('mounts the extracted service bay router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import serviceBayRoutes from ['"]\.\/service-bays['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*serviceBayRoutes\)/);
  });

  it('removes active service bay read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-bays['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-bays\/with-sessions['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-bays\/statistics['"]/);
  });

  it('leaves service bay write and session handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/service-bays['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/service-bays\/:id\/status['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/service-bays\/:bayId\/sessions['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/service-bays\/sessions\/:sessionId\/end['"]/);
  });

  it('preserves service bay read contracts and garage filtering', () => {
    expect(serviceBayRoutesSource).toMatch(/router\.get\(['"]\/service-bays['"],\s*isAuthenticated/);
    expect(serviceBayRoutesSource).toMatch(/const \{ garageId \} = req\.query/);
    expect(serviceBayRoutesSource).toMatch(/storage\.getServiceBays\(garageId as string\)/);
    expect(serviceBayRoutesSource).toMatch(/router\.get\(['"]\/service-bays\/with-sessions['"],\s*isAuthenticated/);
    expect(serviceBayRoutesSource).toMatch(/storage\.getServiceBaysWithSessions\(garageId as string\)/);
    expect(serviceBayRoutesSource).toMatch(/router\.get\(['"]\/service-bays\/statistics['"],\s*isAuthenticated/);
    expect(serviceBayRoutesSource).toMatch(/storage\.getServiceBayStatistics\(garageId as string\)/);
  });
});
