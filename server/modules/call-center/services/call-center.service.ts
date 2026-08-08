/**
 * Call-center service (Phase E — Domain Services).
 *
 * Business rules for the call-center domain: the not-found 404s and the
 * live-update broadcasts fired after a queue/session mutation. Zod validation +
 * the garage-required 400 stay at the controller boundary; ownership is enforced
 * by the route guards. All data / infra access flows through the repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { CallCenterRepository } from '../repositories/call-center.repository';

export class CallCenterService {
  constructor(private readonly repository: CallCenterRepository) {}

  // Queues
  listQueues(garageId: string, active?: boolean) {
    return this.repository.listQueues(garageId, active);
  }
  async createQueue(garageId: string, data: Parameters<CallCenterRepository['createQueue']>[0]) {
    const queue = await this.repository.createQueue(data);
    await this.repository.broadcastQueueUpdate(garageId, queue);
    return queue;
  }
  async getQueue(id: string, garageId: string) {
    const queue = await this.repository.getQueue(id, garageId);
    if (!queue) throw new NotFoundError('Call queue not found');
    return queue;
  }
  async updateQueue(id: string, garageId: string, body: Parameters<CallCenterRepository['updateQueue']>[2]) {
    const updated = await this.repository.updateQueue(id, garageId, body);
    if (!updated) throw new NotFoundError('Call queue not found');
    await this.repository.broadcastQueueUpdate(garageId, updated);
    return updated;
  }
  async deleteQueue(id: string, garageId: string) {
    const deleted = await this.repository.deleteQueue(id, garageId);
    if (!deleted) throw new NotFoundError('Call queue not found');
  }
  async getQueueWithMembers(id: string, garageId: string) {
    const result = await this.repository.getQueueWithMembers(id, garageId);
    if (!result) throw new NotFoundError('Call queue not found');
    return result;
  }

  // Queue members
  addQueueMember(data: Parameters<CallCenterRepository['addQueueMember']>[0]) {
    return this.repository.addQueueMember(data);
  }
  listQueueMembers(queueId: string, garageId: string, active?: boolean) {
    return this.repository.listQueueMembers(queueId, garageId, active);
  }
  async updateQueueMember(id: string, garageId: string, body: Parameters<CallCenterRepository['updateQueueMember']>[2]) {
    const updated = await this.repository.updateQueueMember(id, garageId, body);
    if (!updated) throw new NotFoundError('Queue member not found');
    return updated;
  }
  async removeQueueMember(id: string, garageId: string) {
    const deleted = await this.repository.removeQueueMember(id, garageId);
    if (!deleted) throw new NotFoundError('Queue member not found');
  }

  // Sessions
  listSessions(garageId: string, filters: Parameters<CallCenterRepository['listSessions']>[1]) {
    return this.repository.listSessions(garageId, filters);
  }
  async createSession(garageId: string, data: Parameters<CallCenterRepository['createSession']>[0]) {
    const session = await this.repository.createSession(data);
    await this.repository.broadcastSessionUpdate(garageId, session);
    return session;
  }
  async getSession(id: string, garageId: string) {
    const session = await this.repository.getSession(id, garageId);
    if (!session) throw new NotFoundError('Call session not found');
    return session;
  }
  async updateSession(id: string, garageId: string, body: Parameters<CallCenterRepository['updateSession']>[2]) {
    const updated = await this.repository.updateSession(id, garageId, body);
    if (!updated) throw new NotFoundError('Call session not found');
    await this.repository.broadcastSessionUpdate(garageId, updated);
    return updated;
  }
  async assignCall(garageId: string, data: Parameters<CallCenterRepository['assignCall']>[0]) {
    const session = await this.repository.assignCall(data);
    await this.repository.broadcastSessionUpdate(garageId, session);
    return session;
  }

  // Notes
  createNote(data: Parameters<CallCenterRepository['createNote']>[0]) {
    return this.repository.createNote(data);
  }
  listNotes(sessionId: string) {
    return this.repository.listNotes(sessionId);
  }

  // Recordings
  createRecording(data: Parameters<CallCenterRepository['createRecording']>[0]) {
    return this.repository.createRecording(data);
  }
  listRecordings(sessionId: string) {
    return this.repository.listRecordings(sessionId);
  }

  // Disposition codes
  listDispositionCodes(garageId: string, active?: boolean) {
    return this.repository.listDispositionCodes(garageId, active);
  }
  createDispositionCode(data: Parameters<CallCenterRepository['createDispositionCode']>[0]) {
    return this.repository.createDispositionCode(data);
  }
  async updateDispositionCode(id: string, garageId: string, body: Parameters<CallCenterRepository['updateDispositionCode']>[2]) {
    const updated = await this.repository.updateDispositionCode(id, garageId, body);
    if (!updated) throw new NotFoundError('Disposition code not found');
    return updated;
  }
  async deleteDispositionCode(id: string, garageId: string) {
    const deleted = await this.repository.deleteDispositionCode(id, garageId);
    if (!deleted) throw new NotFoundError('Disposition code not found');
  }

  // Agent performance
  createPerformanceSnapshot(data: Parameters<CallCenterRepository['createPerformanceSnapshot']>[0]) {
    return this.repository.createPerformanceSnapshot(data);
  }
  listAgentPerformance(garageId: string, agentId?: string, dateRange?: { start: Date; end: Date }) {
    return this.repository.listAgentPerformance(garageId, agentId, dateRange);
  }
}
