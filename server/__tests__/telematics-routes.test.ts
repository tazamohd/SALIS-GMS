import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the telematics extraction (Phase E). The 7
 * `/api/telematics/*` handlers (integration feeds/alerts + resolve, and the
 * per-vehicle device/readings) moved from the monolith — a non-contiguous
 * removal across two blocks, dropping the two orphaned insert schemas.
 * Behavioral coverage: the module service tests.
 */
describe('Telematics extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/telematics/index.ts');
  const controller = read('server/modules/telematics/controllers/telematics.controller.ts');
  const repository = read('server/modules/telematics/repositories/telematics.repository.ts');

  it('mounts the telematics module from the hybrid router', () => {
    expect(hybrid).toMatch(/import telematicsRoutes from ["']\.\.\/modules\/telematics["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*telematicsRoutes\)/);
  });

  it('removes every /api/telematics/* handler and both orphaned schemas from the monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/telematics\//);
    expect(legacy).not.toMatch(/insertTelematicsFeedSchema/);
    expect(legacy).not.toMatch(/insertTelematicsAlertSchema/);
  });

  it('registers the 7 routes and preserves the ownership guards', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(7);
    expect(moduleIndex).toMatch(/table: 'telematics_alerts', parent: \{ table: 'vehicles', fk: 'vehicle_id' \}/);
    expect(moduleIndex).toMatch(/table: 'vehicles', idParam: 'vehicleId'/);
  });

  it('preserves both legacy response conventions + the device 404', () => {
    // feeds/alerts: { data } envelope + { error } 500s
    expect(controller).toMatch(/\{ data:/);
    expect(controller).toMatch(/error: \(error as Error\)\.message/);
    // device/readings: { message } 500s + 404
    expect(controller).toMatch(/Failed to fetch device/);
    expect(controller).toMatch(/Failed to fetch readings/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
