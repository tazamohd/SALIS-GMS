import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Training LMS read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const trainingRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/training.ts'), 'utf-8');

  it('mounts the extracted training router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import trainingRoutes from ['"]\.\/training['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*trainingRoutes\)/);
  });

  it('removes active training read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/training\/modules['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/training\/certifications['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/training\/attempts['"]/);
  });

  it('leaves training mutation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/training\/modules['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/training\/certifications['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/training\/attempts['"]/);
  });

  it('preserves active-status filters for modules and certifications', () => {
    expect(trainingRoutesSource).toMatch(/router\.get\(['"]\/training\/modules['"],\s*isAuthenticated/);
    // The filter only applies when ?isActive is present — a bare `=== 'true'`
    // turned an absent param into isActive=false and hid every active row.
    expect(trainingRoutesSource).toMatch(/storage\.getTrainingModules\(req\.query\.isActive === undefined \? undefined : req\.query\.isActive === ['"]true['"]\)/);
    expect(trainingRoutesSource).toMatch(/router\.get\(['"]\/training\/certifications['"],\s*isAuthenticated/);
    expect(trainingRoutesSource).toMatch(/storage\.getCertifications\(req\.query\.isActive === undefined \? undefined : req\.query\.isActive === ['"]true['"]\)/);
  });

  it('preserves certification attempt user and certification filters', () => {
    expect(trainingRoutesSource).toMatch(/router\.get\(['"]\/training\/attempts['"],\s*isAuthenticated/);
    expect(trainingRoutesSource).toMatch(/req\.query\.userId as string/);
    expect(trainingRoutesSource).toMatch(/req\.query\.certificationId as string/);
    expect(trainingRoutesSource).toMatch(/storage\.getCertificationAttempts\(/);
    expect(trainingRoutesSource).toMatch(/res\.json\(\{ data: attempts \}\)/);
  });
});
