/**
 * Call-center module assembly (Phase E1/E2). Wires the call-center domain —
 * queues, queue-members, sessions (+ assign/notes/recordings), disposition
 * codes and agent-performance — into an Express router via DI. Every route keeps
 * its `isAuthenticated` + tenant-scoped `requireResourceOwnership` guards and the
 * per-route `callCenterLimiter` rate limit, exactly as in the monolith.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { CALL_CENTER_SERVICE } from '../../infrastructure/di/tokens';
import { makeCallCenterController } from './controllers/call-center.controller';
import type { CallCenterService } from './services/call-center.service';

export interface CallCenterModuleDeps {
  service?: CallCenterService;
}

export function createCallCenterModule(deps: CallCenterModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(CALL_CENTER_SERVICE);
  const c = makeCallCenterController(service);
  const router = Router();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  const ownQueue = requireResourceOwnership({ table: 'call_queues' });
  const ownQueueMember = requireResourceOwnership({ table: 'call_queue_members' });
  const ownQueueByQueueId = requireResourceOwnership({ table: 'call_queue_members', idParam: 'queueId' });
  const ownSession = requireResourceOwnership({ table: 'call_sessions' });
  const ownSessionBySessionId = requireResourceOwnership({ table: 'call_sessions', idParam: 'sessionId' });
  const ownDisposition = requireResourceOwnership({ table: 'call_disposition_codes' });

  // Queues
  router.get('/call-center/queues', isAuthenticated, limiter, asyncHandler(c.listQueues));
  router.post('/call-center/queues', isAuthenticated, limiter, asyncHandler(c.createQueue));
  router.get('/call-center/queues/:id', isAuthenticated, ownQueue, asyncHandler(c.getQueue));
  router.patch('/call-center/queues/:id', isAuthenticated, ownQueue, limiter, asyncHandler(c.updateQueue));
  router.delete('/call-center/queues/:id', isAuthenticated, ownQueue, limiter, asyncHandler(c.deleteQueue));
  router.get('/call-center/queues/:id/with-members', isAuthenticated, ownQueue, asyncHandler(c.getQueueWithMembers));

  // Queue members
  router.post('/call-center/queues/:queueId/members', isAuthenticated, ownQueueByQueueId, limiter, asyncHandler(c.addQueueMember));
  router.get('/call-center/queues/:queueId/members', isAuthenticated, ownQueueByQueueId, asyncHandler(c.listQueueMembers));
  router.patch('/call-center/queue-members/:id', isAuthenticated, ownQueueMember, limiter, asyncHandler(c.updateQueueMember));
  router.delete('/call-center/queue-members/:id', isAuthenticated, ownQueueMember, limiter, asyncHandler(c.removeQueueMember));

  // Sessions
  router.get('/call-center/sessions', isAuthenticated, asyncHandler(c.listSessions));
  router.post('/call-center/sessions', isAuthenticated, limiter, asyncHandler(c.createSession));
  router.get('/call-center/sessions/:id', isAuthenticated, ownSession, asyncHandler(c.getSession));
  router.patch('/call-center/sessions/:id', isAuthenticated, ownSession, limiter, asyncHandler(c.updateSession));
  router.post('/call-center/sessions/:id/assign', isAuthenticated, ownSession, limiter, asyncHandler(c.assignCall));

  // Notes + recordings (parent-scoped to the owning session)
  router.post('/call-center/sessions/:sessionId/notes', isAuthenticated, ownSessionBySessionId, limiter, asyncHandler(c.createNote));
  router.get('/call-center/sessions/:sessionId/notes', isAuthenticated, ownSessionBySessionId, asyncHandler(c.listNotes));
  router.post('/call-center/sessions/:sessionId/recordings', isAuthenticated, ownSessionBySessionId, limiter, asyncHandler(c.createRecording));
  router.get('/call-center/sessions/:sessionId/recordings', isAuthenticated, ownSessionBySessionId, asyncHandler(c.listRecordings));

  // Disposition codes
  router.get('/call-center/disposition-codes', isAuthenticated, asyncHandler(c.listDispositionCodes));
  router.post('/call-center/disposition-codes', isAuthenticated, limiter, asyncHandler(c.createDispositionCode));
  router.patch('/call-center/disposition-codes/:id', isAuthenticated, ownDisposition, limiter, asyncHandler(c.updateDispositionCode));
  router.delete('/call-center/disposition-codes/:id', isAuthenticated, ownDisposition, limiter, asyncHandler(c.deleteDispositionCode));

  // Agent performance
  router.post('/call-center/performance', isAuthenticated, limiter, asyncHandler(c.createPerformance));
  router.get('/call-center/performance', isAuthenticated, asyncHandler(c.listPerformance));

  return router;
}

export default createCallCenterModule();
