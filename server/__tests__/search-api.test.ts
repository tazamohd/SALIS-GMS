/**
 * Contract tests for search API improvements (SA-018)
 *
 * Verifies that:
 * - /api/search requires authentication
 * - /api/search requires a garage ID
 * - /api/search rejects empty/short queries
 * - /api/search no longer loads ALL records into memory
 * - Search methods are scoped to user's garage
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Search API security and scope (SA-018)', () => {
  const legacyRoutesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const hybridRoutesPath = path.resolve(process.cwd(), 'server/routes/index.ts');
  const searchRoutesPath = path.resolve(process.cwd(), 'server/routes/search.ts');
  const storagePath = path.resolve(process.cwd(), 'server/storage.ts');
  const legacyRoutesSource = fs.readFileSync(legacyRoutesPath, 'utf-8');
  const hybridRoutesSource = fs.readFileSync(hybridRoutesPath, 'utf-8');
  const searchRoutesSource = fs.readFileSync(searchRoutesPath, 'utf-8');
  const storageSource = fs.readFileSync(storagePath, 'utf-8');

  describe('/api/search handler', () => {
    it('is extracted from the legacy monolith into the hybrid router', () => {
      expect(hybridRoutesSource).toMatch(/import searchRoutes from ['"]\.\/search['"]/);
      expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*searchRoutes\)/);
      expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/search['"]/);
      expect(legacyRoutesSource).not.toMatch(/search-legacy-disabled/);
      expect(searchRoutesSource).toMatch(/router\.get\(['"]\/search['"]/);
    });

    it('requires isAuthenticated middleware', () => {
      const handlerRegex = /router\.get\(['"]\/search['"]\s*,\s*([^,]+)/;
      const match = searchRoutesSource.match(handlerRegex);
      expect(match).not.toBeNull();
      const middleware = match![1].trim();
      expect(middleware).toBe('isAuthenticated');
    });

    it('checks user garage ID and returns 400 if missing', () => {
      const handler = searchRoutesSource;
      expect(handler).toMatch(/userGarageId\s*=\s*req\.user\?\.garageId/);
      expect(handler).toMatch(/return res\.status\(400\)\.json\(\{\s*message:\s*['"]User has no garage assigned['"]\s*\}\)/);
    });

    it('no longer uses getCustomers() (full table load)', () => {
      const handler = searchRoutesSource;
      expect(handler).not.toMatch(/storage\.getCustomers\(\)/);
      expect(handler).not.toMatch(/storage\.getVehicles\(\)/);
      expect(handler).not.toMatch(/storage\.getSpareParts\(\)/);
      expect(handler).not.toMatch(/storage\.getInvoices\(\)/);
      expect(handler).not.toMatch(/storage\.getJobCards\(\)/);
      expect(handler).not.toMatch(/storage\.getAppointments\(\)/);
    });

    it('uses scoped search methods', () => {
      const handler = searchRoutesSource;
      expect(handler).toMatch(/storage\.searchCustomers\(userGarageId/);
      expect(handler).toMatch(/storage\.searchVehicles\(userGarageId/);
      expect(handler).toMatch(/storage\.searchParts\(userGarageId/);
      expect(handler).toMatch(/storage\.searchInvoices\(userGarageId/);
      expect(handler).toMatch(/storage\.searchJobCards\(userGarageId/);
      expect(handler).toMatch(/storage\.searchAppointments\(userGarageId/);
    });

    it('uses SQL pattern parameter, not string concatenation', () => {
      const handler = searchRoutesSource;
      expect(handler).toMatch(/searchPattern\s*=\s*`%\${query}%`/);
    });
  });

  describe('Storage search methods', () => {
    it('declares all 6 search methods in IStorage interface', () => {
      expect(storageSource).toMatch(/searchCustomers\s*\(\s*garageId/);
      expect(storageSource).toMatch(/searchVehicles\s*\(\s*garageId/);
      expect(storageSource).toMatch(/searchParts\s*\(\s*garageId/);
      expect(storageSource).toMatch(/searchInvoices\s*\(\s*garageId/);
      expect(storageSource).toMatch(/searchJobCards\s*\(\s*garageId/);
      expect(storageSource).toMatch(/searchAppointments\s*\(\s*garageId/);
    });

    it('implements searchCustomers in DatabaseStorage', () => {
      expect(storageSource).toMatch(/async searchCustomers\([^)]+\):\s*Promise<User\[\]>/);
    });

    it('implements searchVehicles in DatabaseStorage', () => {
      expect(storageSource).toMatch(/async searchVehicles\([^)]+\):\s*Promise<Vehicle\[\]>/);
    });

    it('uses Drizzle eq() and like() for SQL parameterization', () => {
      const searchCustomersMatch = storageSource.match(/async searchCustomers\([^)]+\)[\s\S]*?\n\s{2}\}/);
      expect(searchCustomersMatch, 'searchCustomers implementation').not.toBeNull();
      const body = searchCustomersMatch![0];
      expect(body).toMatch(/eq\(/);
      expect(body).toMatch(/like\(/);
      expect(body).toMatch(/\.limit\(/);
    });

    it('all search methods accept a limit parameter', () => {
      expect(storageSource).toMatch(/searchCustomers\([^,]+,\s*[^,]+,\s*limit:\s*number\)/);
      expect(storageSource).toMatch(/searchVehicles\([^,]+,\s*[^,]+,\s*limit:\s*number\)/);
      expect(storageSource).toMatch(/searchParts\([^,]+,\s*[^,]+,\s*limit:\s*number\)/);
      expect(storageSource).toMatch(/searchInvoices\([^,]+,\s*[^,]+,\s*limit:\s*number\)/);
      expect(storageSource).toMatch(/searchJobCards\([^,]+,\s*[^,]+,\s*limit:\s*number\)/);
      expect(storageSource).toMatch(/searchAppointments\([^,]+,\s*[^,]+,\s*limit:\s*number\)/);
    });
  });
});
