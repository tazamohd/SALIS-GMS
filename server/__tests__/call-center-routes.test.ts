import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the call-center extraction (Phase E). The 25
 * `/api/call-center/*` handlers (queues, queue-members, sessions + assign/notes/
 * recordings, disposition-codes, agent-performance) moved from the monolith into
 * `server/modules/call-center`, preserving the ownership guards + rate limiter.
 * Behavioral coverage: the module service tests + the h1-central-guard-rollout
 * integration suite (cross-tenant 404 on /call-center/sessions/:id).
 */
describe('Call-center extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/call-center/index.ts');
  const service = read('server/modules/call-center/services/call-center.service.ts');
  const repository = read('server/modules/call-center/repositories/call-center.repository.ts');
  const controller = read('server/modules/call-center/controllers/call-center.controller.ts');

  it('mounts the call-center module from the hybrid router', () => {
    expect(hybrid).toMatch(/import callCenterRoutes from ["']\.\.\/modules\/call-center["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*callCenterRoutes\)/);
  });

  it('removes every /api/call-center/* handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/call-center\//);
  });

  it('registers the 25 routes and keeps the rate limiter in the module', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(25);
    expect(moduleIndex).toMatch(/rateLimit\(/);
    expect(moduleIndex).toMatch(/import rateLimit from 'express-rate-limit'/);
  });

  it('preserves the tenant-scoped requireResourceOwnership guards', () => {
    expect(moduleIndex).toMatch(/table: 'call_queues'/);
    expect(moduleIndex).toMatch(/table: 'call_queue_members', idParam: 'queueId'/);
    expect(moduleIndex).toMatch(/table: 'call_sessions', idParam: 'sessionId'/);
    expect(moduleIndex).toMatch(/table: 'call_disposition_codes'/);
  });

  it('keeps 404s + broadcasts in the service, storage/ws in the repository, and Zod at the controller boundary', () => {
    expect(service).toMatch(/NotFoundError/);
    expect(service).toMatch(/broadcastSessionUpdate/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(repository).toMatch(/getChatWebSocketServer/);
    expect(controller).toMatch(/sanitizeZodError/);
    expect(controller).toMatch(/User garage ID is required/);
  });
});
