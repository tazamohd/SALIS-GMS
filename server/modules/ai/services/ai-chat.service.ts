/**
 * AI chat service (Phase E5 — business layer). Owns the chat orchestration:
 * resolve an existing conversation (with ownership rules) or create a new one,
 * run `chatWithCustomer`, append the user + assistant turns, and set the
 * handoff status. Also the tenant-scoped conversation reads and the handoff
 * transition. Ownership failures surface as `NotFoundError` (404) /
 * `AuthorizationError` (403); the new-conversation `insertAIChatConversationSchema`
 * parse throws a `ZodError` that the controller maps to 400. No HTTP, no
 * data-layer access.
 */

import { insertAIChatConversationSchema } from '@shared/schema';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { IAiChatRepository } from '../repositories/ai-chat.repository';

// storage rows / LLM payloads are loosely typed at the seam.
type Any = any;

export interface ChatInput {
  garageId: string;
  message: string;
  conversationId?: string;
  customerId?: string;
  garageContext?: Any;
  nowIso: string;
}

export class AiChatService {
  constructor(private readonly repo: IAiChatRepository) {}

  async chat(input: ChatInput) {
    const { garageId, message, conversationId, customerId, garageContext, nowIso } = input;

    let conversation: Any;
    let history: Any[] = [];

    if (conversationId) {
      conversation = await this.repo.getConversation(conversationId);
      if (!conversation) throw new NotFoundError('Conversation not found');
      if (conversation.garageId !== garageId) throw new AuthorizationError('Access denied');
      history = conversation.messages || [];
    } else {
      const validated = insertAIChatConversationSchema.parse({
        garageId,
        customerId,
        messages: [],
        status: 'active',
      });
      conversation = await this.repo.createConversation(validated);
    }

    const aiResult = await this.repo.chat(
      message,
      history,
      garageContext || { garageName: 'Our Garage' },
    );

    const updatedMessages = [
      ...history,
      { role: 'user', content: message, timestamp: nowIso },
      { role: 'assistant', content: aiResult.response, timestamp: nowIso },
    ];

    const updatedConversation = await this.repo.updateConversation(conversation.id, {
      messages: updatedMessages,
      status: aiResult.shouldHandoff ? 'pending_handoff' : 'active',
    });

    return {
      conversation: updatedConversation,
      response: aiResult.response,
      shouldHandoff: aiResult.shouldHandoff,
    };
  }

  list(garageId: string, customerId?: string, status?: string) {
    return this.repo.listConversations(garageId, customerId, status);
  }

  async get(id: string, garageId: string) {
    const conversation = await this.repo.getConversation(id);
    if (!conversation) throw new NotFoundError('Conversation not found');
    if (conversation.garageId !== garageId) throw new AuthorizationError('Access denied');
    return conversation;
  }

  async handoff(id: string, garageId: string, assignedTo: string | undefined, nowIso: string) {
    const existing = await this.repo.getConversation(id);
    if (!existing) throw new NotFoundError('Conversation not found');
    if (existing.garageId !== garageId) throw new AuthorizationError('Access denied');
    return this.repo.updateConversation(id, {
      status: 'handed_off',
      handoffTo: assignedTo,
      handoffAt: nowIso,
    });
  }
}
