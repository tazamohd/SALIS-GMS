/**
 * Call-center repository (Phase E). The only data-layer / infra access for the
 * call-center domain: the `storage` CRUD for queues, queue-members, sessions,
 * notes, recordings, disposition-codes and agent-performance, plus the
 * websocket broadcast seam (queue/session live updates). Delegation only.
 */

import { storage } from '../../../storage';

export class CallCenterRepository {
  // Queues
  listQueues(garageId: string, active?: boolean) {
    return storage.listCallQueues(garageId, active);
  }
  createQueue(data: Parameters<typeof storage.createCallQueue>[0]) {
    return storage.createCallQueue(data);
  }
  getQueue(id: string, garageId: string) {
    return storage.getCallQueue(id, garageId);
  }
  updateQueue(id: string, garageId: string, body: Parameters<typeof storage.updateCallQueue>[2]) {
    return storage.updateCallQueue(id, garageId, body);
  }
  deleteQueue(id: string, garageId: string) {
    return storage.deleteCallQueue(id, garageId);
  }
  getQueueWithMembers(id: string, garageId: string) {
    return storage.getCallQueueWithMembers(id, garageId);
  }

  // Queue members
  addQueueMember(data: Parameters<typeof storage.addQueueMember>[0]) {
    return storage.addQueueMember(data);
  }
  listQueueMembers(queueId: string, garageId: string, active?: boolean) {
    return storage.listQueueMembers(queueId, garageId, active);
  }
  updateQueueMember(id: string, garageId: string, body: Parameters<typeof storage.updateQueueMember>[2]) {
    return storage.updateQueueMember(id, garageId, body);
  }
  removeQueueMember(id: string, garageId: string) {
    return storage.removeQueueMember(id, garageId);
  }

  // Sessions
  listSessions(garageId: string, filters: Parameters<typeof storage.listCallSessions>[1]) {
    return storage.listCallSessions(garageId, filters);
  }
  createSession(data: Parameters<typeof storage.createCallSession>[0]) {
    return storage.createCallSession(data);
  }
  getSession(id: string, garageId: string) {
    return storage.getCallSession(id, garageId);
  }
  updateSession(id: string, garageId: string, body: Parameters<typeof storage.updateCallSession>[2]) {
    return storage.updateCallSession(id, garageId, body);
  }
  assignCall(data: Parameters<typeof storage.assignCallToAgent>[0]) {
    return storage.assignCallToAgent(data);
  }

  // Notes
  createNote(data: Parameters<typeof storage.createCallNote>[0]) {
    return storage.createCallNote(data);
  }
  listNotes(sessionId: string) {
    return storage.listCallNotes(sessionId);
  }

  // Recordings
  createRecording(data: Parameters<typeof storage.createCallRecording>[0]) {
    return storage.createCallRecording(data);
  }
  listRecordings(sessionId: string) {
    return storage.listCallRecordings(sessionId);
  }

  // Disposition codes
  listDispositionCodes(garageId: string, active?: boolean) {
    return storage.listDispositionCodes(garageId, active);
  }
  createDispositionCode(data: Parameters<typeof storage.createDispositionCode>[0]) {
    return storage.createDispositionCode(data);
  }
  updateDispositionCode(id: string, garageId: string, body: Parameters<typeof storage.updateDispositionCode>[2]) {
    return storage.updateDispositionCode(id, garageId, body);
  }
  deleteDispositionCode(id: string, garageId: string) {
    return storage.deleteDispositionCode(id, garageId);
  }

  // Agent performance
  createPerformanceSnapshot(data: Parameters<typeof storage.createPerformanceSnapshot>[0]) {
    return storage.createPerformanceSnapshot(data);
  }
  listAgentPerformance(
    garageId: string,
    agentId?: string,
    dateRange?: { start: Date; end: Date },
  ) {
    return storage.listAgentPerformance(garageId, agentId, dateRange);
  }

  // Websocket broadcast seam — best-effort live updates (never fail the request).
  async broadcastQueueUpdate(garageId: string, queue: unknown): Promise<void> {
    const { getChatWebSocketServer } = await import('../../../websocket');
    const ws = getChatWebSocketServer();
    if (ws && garageId) ws.broadcastCallQueueUpdate(garageId, queue as never);
  }
  async broadcastSessionUpdate(garageId: string, session: unknown): Promise<void> {
    const { getChatWebSocketServer } = await import('../../../websocket');
    const ws = getChatWebSocketServer();
    if (ws && garageId) ws.broadcastCallSessionUpdate(garageId, session as never);
  }
}

export type ICallCenterRepository = CallCenterRepository;
