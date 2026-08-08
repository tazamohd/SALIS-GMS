/**
 * Contract tests for audit logging (SA-008)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Audit logging for platform-admin (SA-008)', () => {
  const middlewarePath = path.resolve(process.cwd(), 'server/auditMiddleware.ts');
  // Phase E moved the platform-admin routes into the administration module; the
  // audit-logging contract now targets the module router (mount-relative paths).
  const modulePath = path.resolve(process.cwd(), 'server/modules/administration/index.ts');
  const middleware = fs.readFileSync(middlewarePath, 'utf-8');
  const routes = fs.readFileSync(modulePath, 'utf-8');

  it('recognizes platform-admin in resource type patterns', () => {
    expect(middleware).toMatch(/['"]\/api\/platform-admin['"]\s*:\s*['"]platform_admin['"]/);
  });

  it('handles platform-admin with null garageId', () => {
    expect(middleware).toMatch(/resourceType\s*===\s*['"]platform_admin['"]/);
    expect(middleware).toMatch(/platformAdminLog[\s\S]*?garageId:\s*null/);
  });

  it('includes admin actor email in platform-admin log details', () => {
    expect(middleware).toMatch(/adminEmail:\s*user\.email/);
  });

  it('all platform-admin POST routes use auditLog middleware', () => {
    expect(routes).toMatch(/router\.post\(\s*'\/platform-admin\/garages',\s*requirePlatformAdmin,\s*auditLog/);
    const platformPosts = routes.match(/router\.post\(\s*'\/platform-admin[^']*',[^\n]*/g) || [];
    expect(platformPosts.length).toBeGreaterThanOrEqual(4);
    platformPosts.forEach(r => {
      expect(r, `platform-admin POST must audit-log: ${r}`).toMatch(/auditLog/);
    });
  });

  it('all platform-admin PATCH routes use auditLog middleware', () => {
    expect(routes).toMatch(/router\.patch\(\s*'\/platform-admin\/garages\/:id\/status',\s*requirePlatformAdmin,\s*auditLog/);
    expect(routes).toMatch(/router\.patch\(\s*'\/platform-admin\/support-tickets\/:id',\s*requirePlatformAdmin,\s*auditLog/);
  });

  it('platform-admin GET routes do not use auditLog (read-only)', () => {
    const getRoutes = routes.match(/router\.get\(\s*'\/platform-admin[^']*',\s*requirePlatformAdmin[^\n]*/g) || [];
    expect(getRoutes.length).toBeGreaterThanOrEqual(4);
    getRoutes.forEach(r => {
      expect(r).not.toMatch(/auditLog/);
    });
  });
});