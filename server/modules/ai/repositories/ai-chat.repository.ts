/**
 * AI chat repository (Phase E4). The only data-layer access for the AI chat
 * surface: the `chatWithCustomer` LLM helper (external integration) and the
 * `storage` CRUD for chat conversations. Extracted from the monolith
 * `/api/ai/chat*` handlers.
 */

import { storage } from '../../../storage';
import { chatWithCustomer } from '../../../ai';

// storage rows and the LLM helper are loosely typed at the seam.
type Any = any;

export interface IAiChatRepository {
  chat(message: string, history: Any[], garageContext: Any): Promise<Any>;
  getConversation(id: string): Promise<Any | undefined>;
  createConversation(data: Any): Promise<Any>;
  updateConversation(id: string, data: Any): Promise<Any>;
  listConversations(garageId: string, customerId?: string, status?: string): Promise<Any[]>;
}

export class AiChatRepository implements IAiChatRepository {
  chat(message: string, history: Any[], garageContext: Any) {
    return chatWithCustomer(message, history, garageContext);
  }
  getConversation(id: string) { return storage.getAIChatConversation(id); }
  createConversation(data: Any) { return storage.createAIChatConversation(data); }
  updateConversation(id: string, data: Any) { return storage.updateAIChatConversation(id, data); }
  listConversations(garageId: string, customerId?: string, status?: string) {
    return storage.getAIChatConversations(garageId, customerId, status);
  }
}
