import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NEXTGEN_RESOURCES } from '../modules/nextgen/nextgen.resources';

/**
 * Source-contract tests for the next-gen extraction (Phase E). The 30
 * structurally-identical `/api/nextgen/*` resource pairs (list + create) plus
 * the two interleaved `/api/vision/*` handlers moved from the monolith into
 * `server/modules/nextgen`, driven by a resource catalogue. The
 * `/api/nextgen/seed` fixture endpoint stays in the monolith (follow-up).
 * Behavioral coverage: the module service tests.
 */
describe('Next-gen extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/nextgen/index.ts');
  const repository = read('server/modules/nextgen/repositories/nextgen.repository.ts');

  it('mounts the nextgen module from the hybrid router', () => {
    expect(hybrid).toMatch(/import nextgenRoutes from ["']\.\.\/modules\/nextgen["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*nextgenRoutes\)/);
  });

  it('describes the 30 showcase resources in the catalogue', () => {
    expect(NEXTGEN_RESOURCES).toHaveLength(30);
    // paths are unique
    expect(new Set(NEXTGEN_RESOURCES.map((r) => r.path)).size).toBe(30);
  });

  it('removes every /api/nextgen/* resource handler (seed stays) and both /api/vision/* handlers', () => {
    // only the seed POST remains under /api/nextgen/
    const nextgenHandlers = (legacy.match(/app\.(get|post)\("\/api\/nextgen\//g) || []).length;
    expect(nextgenHandlers).toBe(1);
    expect(legacy).toMatch(/app\.post\("\/api\/nextgen\/seed"/);
    expect(legacy).not.toMatch(/app\.(get|post)\("\/api\/vision\//);
  });

  it('drops the 30 orphaned nextgen insert-schema imports from the monolith', () => {
    for (const r of ['NeuralDiagnostic', 'QuantumSecureMessage', 'SmartContract', 'VisionDefect', 'AutonomousRobot']) {
      expect(legacy).not.toMatch(new RegExp(`insert${r}Schema`));
    }
  });

  it('generates the resource routes from the catalogue and keeps the vision routes; storage seam in the repository', () => {
    expect(moduleIndex).toMatch(/for \(const r of NEXTGEN_RESOURCES\)/);
    expect(moduleIndex).toMatch(/router\.get\(`\/nextgen\/\$\{r\.path\}`/);
    expect(moduleIndex).toMatch(/router\.post\(`\/nextgen\/\$\{r\.path\}`/);
    expect(moduleIndex).toMatch(/\/vision\/analyze-image/);
    expect(moduleIndex).toMatch(/\/vision\/quality-checks/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
