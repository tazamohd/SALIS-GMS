/**
 * Contract tests for audit logging (SA-008)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Audit logging for platform-admin (SA-008)', () => {
  const middlewarePath = path.resolve(process.cwd(), 'server/auditMiddleware.ts');
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const middleware = fs.readFileSync(middlewarePath, 'utf-8');
  const routes = fs.readFileSync(routesPath, 'utf-8');

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
    expect(routes).toMatch(/app\.post\('\/api\/platform-admin\/garages',\s*requireAdmin,\s*auditLog/);
    expect(routes).toMatch(/app\.post\('\/api\/platform-admin\/suppliers',\s*requireAdmin,\s*auditLog/);
    expect(routes).toMatch(/app\.post\('\/api\/platform-admin\/stores',\s*requireAdmin,\s*auditLog/);
  });

  it('all platform-admin PATCH routes use auditLog middleware', () => {
    expect(routes).toMatch(/app\.patch\('\/api\/platform-admin\/garages\/:id\/status',\s*requireAdmin,\s*auditLog/);
    expect(routes).toMatch(/app\.patch\('\/api\/platform-admin\/support-tickets\/:id',\s*requireAdmin,\s*auditLog/);
  });

  it('platform-admin GET routes do not use auditLog (read-only)', () => {
    const getRoutes = routes.match(/app\.get\('\/api\/platform-admin[^']*',\s*requireAdmin[^\n]*/g) || [];
    expect(getRoutes.length).toBeGreaterThanOrEqual(4);
    getRoutes.forEach(r => {
      expect(r).not.toMatch(/auditLog/);
    });
  });
});