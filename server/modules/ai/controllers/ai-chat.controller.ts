/**
 * AI chat controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract of the
 * `/api/ai/chat*` handlers: the message-required 400, the `ZodError`
 * (new-conversation parse) → 400 via `sanitizeZodError`, the ownership failures
 * surfaced from the service as `NotFoundError` (404) / `AuthorizationError` (403),
 * and the exact per-handler `{ message }` 500 bodies. Runtime timestamps are
 * supplied here. Route-level ownership guards remain on the routes.
 */

import type { Request, Response } from 'express';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError, AuthorizationError } from '../../../infrastructure/errors/domain-errors';
import type { AiChatService } from '../services/ai-chat.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function isZodError(error: unknown): boolean {
  return !!error && (error as { name?: string }).name === 'ZodError';
}

export function makeAiChatController(service: AiChatService) {
  return {
    async chat(req: Request, res: Response): Promise<void> {
      const { message, conversationId, customerId, garageContext } = req.body ?? {};
      if (!message) {
        res.status(400).json({ message: 'Message is required' });
        return;
      }
      try {
        res.json(await service.chat({
          garageId: garageOf(req),
          message,
          conversationId,
          customerId,
          garageContext,
          nowIso: new Date().toISOString(),
        }));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error processing chat:', error);
        if (isZodError(error)) { res.status(400).json(sanitizeZodError(error as never)); return; }
        res.status(500).json({ message: 'Failed to process chat' });
      }
    },

    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list(garageOf(req), str(req.query.customerId), str(req.query.status)));
      } catch (error) {
        console.error('Error fetching chat conversations:', error);
        res.status(500).json({ message: 'Failed to fetch chat conversations' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id, garageOf(req)));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error fetching chat conversation:', error);
        res.status(500).json({ message: 'Failed to fetch chat conversation' });
      }
    },

    async handoff(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.handoff(req.params.id, garageOf(req), req.body?.assignedTo, new Date().toISOString()));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        if (error instanceof AuthorizationError) { res.status(403).json({ message: error.message }); return; }
        console.error('Error handing off conversation:', error);
        res.status(500).json({ message: 'Failed to hand off conversation' });
      }
    },
  };
}

export type AiChatController = ReturnType<typeof makeAiChatController>;
