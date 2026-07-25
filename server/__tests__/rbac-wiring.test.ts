/**
 * Contract tests for RBAC middleware wiring (SA-026)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('RBAC wiring (SA-026)', () => {
  const routerPath = path.resolve(process.cwd(), 'server/routes/index.ts');
  const source = fs.readFileSync(routerPath, 'utf-8');

  it('imports loadUserPermissions from rbac-middleware', () => {
    expect(source).toMatch(/import\s*\{\s*loadUserPermissions\s*\}\s*from\s*['"]\.\.\/rbac-middleware['"]/);
  });

  it('registers loadUserPermissions as Express middleware', () => {
    expect(source).toMatch(/app\.use\(loadUserPermissions\)/);
  });

  it('wires RBAC after authentication middleware', () => {
    const authSetupIdx = source.indexOf('await setupAuth(app)');
    const rbacIdx = source.indexOf('app.use(loadUserPermissions)');
    expect(authSetupIdx).toBeGreaterThan(-1);
    expect(rbacIdx).toBeGreaterThan(-1);
    expect(rbacIdx).toBeGreaterThan(authSetupIdx);
  });
});