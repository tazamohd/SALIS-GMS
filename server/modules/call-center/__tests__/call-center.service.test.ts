import { describe, it, expect, vi } from 'vitest';
import { CallCenterService } from '../services/call-center.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    listQueues: vi.fn(async () => [{ id: 'q1' }]),
    createQueue: vi.fn(async (d: Record<string, unknown>) => ({ id: 'q1', ...d })),
    getQueue: vi.fn(async () => ({ id: 'q1' })),
    updateQueue: vi.fn(async () => ({ id: 'q1', name: 'X' })),
    deleteQueue: vi.fn(async () => true),
    getQueueWithMembers: vi.fn(async () => ({ id: 'q1', members: [] })),
    addQueueMember: vi.fn(async () => ({ id: 'm1' })),
    listQueueMembers: vi.fn(async () => [{ id: 'm1' }]),
    updateQueueMember: vi.fn(async () => ({ id: 'm1' })),
    removeQueueMember: vi.fn(async () => true),
    listSessions: vi.fn(async () => [{ id: 's1' }]),
    createSession: vi.fn(async () => ({ id: 's1' })),
    getSession: vi.fn(async () => ({ id: 's1' })),
    updateSession: vi.fn(async () => ({ id: 's1' })),
    assignCall: vi.fn(async () => ({ id: 's1', assignedAgentId: 'a1' })),
    createNote: vi.fn(async () => ({ id: 'n1' })),
    listNotes: vi.fn(async () => [{ id: 'n1' }]),
    createRecording: vi.fn(async () => ({ id: 'r1' })),
    listRecordings: vi.fn(async () => [{ id: 'r1' }]),
    listDispositionCodes: vi.fn(async () => [{ id: 'd1' }]),
    createDispositionCode: vi.fn(async () => ({ id: 'd1' })),
    updateDispositionCode: vi.fn(async () => ({ id: 'd1' })),
    deleteDispositionCode: vi.fn(async () => true),
    createPerformanceSnapshot: vi.fn(async () => ({ id: 'p1' })),
    listAgentPerformance: vi.fn(async () => [{ id: 'p1' }]),
    broadcastQueueUpdate: vi.fn(async () => undefined),
    broadcastSessionUpdate: vi.fn(async () => undefined),
    ...o,
  };
}

describe('CallCenterService — queues', () => {
  it('creates a queue and broadcasts the update', async () => {
    const r = repo();
    await new CallCenterService(r as never).createQueue('g1', { name: 'Sales' } as never);
    expect(r.createQueue).toHaveBeenCalled();
    expect(r.broadcastQueueUpdate).toHaveBeenCalledWith('g1', expect.objectContaining({ id: 'q1' }));
  });
  it('404s a missing queue on get', async () => {
    const r = repo({ getQueue: vi.fn(async () => undefined) });
    await expect(new CallCenterService(r as never).getQueue('q1', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });
  it('404s a queue that does not update, else broadcasts', async () => {
    await expect(new CallCenterService(repo({ updateQueue: vi.fn(async () => undefined) }) as never).updateQueue('q1', 'g1', {} as never))
      .rejects.toBeInstanceOf(NotFoundError);
    const r = repo();
    await new CallCenterService(r as never).updateQueue('q1', 'g1', {} as never);
    expect(r.broadcastQueueUpdate).toHaveBeenCalled();
  });
  it('404s a queue that does not delete', async () => {
    await expect(new CallCenterService(repo({ deleteQueue: vi.fn(async () => false) }) as never).deleteQueue('q1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it('404s when queue-with-members is missing', async () => {
    await expect(new CallCenterService(repo({ getQueueWithMembers: vi.fn(async () => undefined) }) as never).getQueueWithMembers('q1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CallCenterService — queue members', () => {
  it('404s a member that does not update / remove', async () => {
    await expect(new CallCenterService(repo({ updateQueueMember: vi.fn(async () => undefined) }) as never).updateQueueMember('m1', 'g1', {} as never))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new CallCenterService(repo({ removeQueueMember: vi.fn(async () => false) }) as never).removeQueueMember('m1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CallCenterService — sessions', () => {
  it('creates a session and broadcasts', async () => {
    const r = repo();
    await new CallCenterService(r as never).createSession('g1', {} as never);
    expect(r.broadcastSessionUpdate).toHaveBeenCalledWith('g1', expect.objectContaining({ id: 's1' }));
  });
  it('404s a missing session on get/update', async () => {
    await expect(new CallCenterService(repo({ getSession: vi.fn(async () => undefined) }) as never).getSession('s1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new CallCenterService(repo({ updateSession: vi.fn(async () => undefined) }) as never).updateSession('s1', 'g1', {} as never))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it('assigns a call and broadcasts', async () => {
    const r = repo();
    await new CallCenterService(r as never).assignCall('g1', { garageId: 'g1', sessionId: 's1', agentId: 'a1', assignedBy: 'u1' } as never);
    expect(r.assignCall).toHaveBeenCalled();
    expect(r.broadcastSessionUpdate).toHaveBeenCalled();
  });
});

describe('CallCenterService — disposition codes', () => {
  it('404s a code that does not update / delete', async () => {
    await expect(new CallCenterService(repo({ updateDispositionCode: vi.fn(async () => undefined) }) as never).updateDispositionCode('d1', 'g1', {} as never))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new CallCenterService(repo({ deleteDispositionCode: vi.fn(async () => false) }) as never).deleteDispositionCode('d1', 'g1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CallCenterService — passthrough surfaces', () => {
  it('delegates the read/list + notes/recordings/performance surfaces', async () => {
    const r = repo();
    const s = new CallCenterService(r as never);
    await s.listQueues('g1', true);
    await s.listSessions('g1', {} as never);
    await s.listNotes('s1');
    await s.createRecording({} as never);
    await s.listAgentPerformance('g1');
    expect(r.listQueues).toHaveBeenCalledWith('g1', true);
    expect(r.listNotes).toHaveBeenCalledWith('s1');
    expect(r.createRecording).toHaveBeenCalled();
    expect(r.listAgentPerformance).toHaveBeenCalledWith('g1', undefined, undefined);
  });
});
