import { describe, it, expect, vi } from 'vitest';
import { AiChatService } from '../services/ai-chat.service';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';

const NOW = '2026-05-01T00:00:00.000Z';
// garageId is validated as a uuid by insertAIChatConversationSchema on the create path.
const GID = '11111111-1111-1111-1111-111111111111';

function repo(o: Record<string, unknown> = {}) {
  return {
    chat: vi.fn(async () => ({ response: 'hello there', shouldHandoff: false })),
    getConversation: vi.fn(async () => ({ id: 'c1', garageId: GID, messages: [{ role: 'user', content: 'hi' }] })),
    createConversation: vi.fn(async (d: Record<string, unknown>) => ({ id: 'cNew', ...d })),
    updateConversation: vi.fn(async (id: string, d: Record<string, unknown>) => ({ id, garageId: GID, ...d })),
    listConversations: vi.fn(async () => [{ id: 'c1' }]),
    ...o,
  };
}

const base = { garageId: GID, message: 'need help', nowIso: NOW };

describe('AiChatService', () => {
  it('continues an existing conversation: appends turns and keeps status active', async () => {
    const r = repo();
    const out = await new AiChatService(r as never).chat({ ...base, conversationId: 'c1' });
    expect(r.chat).toHaveBeenCalledWith('need help', [{ role: 'user', content: 'hi' }], { garageName: 'Our Garage' });
    const patch = r.updateConversation.mock.calls[0][1] as { messages: unknown[]; status: string };
    expect(patch.messages).toHaveLength(3); // 1 prior + user + assistant
    expect(patch.status).toBe('active');
    expect(out).toMatchObject({ response: 'hello there', shouldHandoff: false });
  });

  it('creates a new conversation when no conversationId is given', async () => {
    const r = repo();
    await new AiChatService(r as never).chat({ ...base, customerId: 'cust1' });
    expect(r.createConversation).toHaveBeenCalled();
    // history starts empty → 2 messages appended
    const patch = r.updateConversation.mock.calls[0][1] as { messages: unknown[] };
    expect(patch.messages).toHaveLength(2);
  });

  it('sets pending_handoff status when the LLM signals a handoff', async () => {
    const r = repo({ chat: vi.fn(async () => ({ response: 'let me get someone', shouldHandoff: true })) });
    const out = await new AiChatService(r as never).chat({ ...base, conversationId: 'c1' });
    expect((r.updateConversation.mock.calls[0][1] as { status: string }).status).toBe('pending_handoff');
    expect(out.shouldHandoff).toBe(true);
  });

  it('rejects an existing conversation that is missing (404) or cross-garage (403)', async () => {
    await expect(new AiChatService(repo({ getConversation: vi.fn(async () => undefined) }) as never).chat({ ...base, conversationId: 'c1' }))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new AiChatService(repo({ getConversation: vi.fn(async () => ({ id: 'c1', garageId: 'other' })) }) as never).chat({ ...base, conversationId: 'c1' }))
      .rejects.toBeInstanceOf(AuthorizationError);
  });

  it('get enforces ownership (404 missing / 403 cross-garage)', async () => {
    expect(await new AiChatService(repo() as never).get('c1', GID)).toMatchObject({ id: 'c1' });
    await expect(new AiChatService(repo({ getConversation: vi.fn(async () => undefined) }) as never).get('c1', GID))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('handoff sets the handed_off status + assignee + timestamp', async () => {
    const r = repo();
    await new AiChatService(r as never).handoff('c1', GID, 'tech-9', NOW);
    expect(r.updateConversation).toHaveBeenCalledWith('c1', { status: 'handed_off', handoffTo: 'tech-9', handoffAt: NOW });
  });

  it('handoff rejects a cross-garage conversation with 403', async () => {
    await expect(new AiChatService(repo({ getConversation: vi.fn(async () => ({ id: 'c1', garageId: 'other' })) }) as never).handoff('c1', GID, 'tech-9', NOW))
      .rejects.toBeInstanceOf(AuthorizationError);
  });

  it('list forwards the garage + optional customer/status filters', async () => {
    const r = repo();
    await new AiChatService(r as never).list('g1', 'cust1', 'active');
    expect(r.listConversations).toHaveBeenCalledWith('g1', 'cust1', 'active');
  });
});
