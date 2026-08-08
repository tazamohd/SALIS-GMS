/**
 * AI OCR-document controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy monolith contract of the
 * `/api/ai/ocr-documents*` handlers: the not-found surfaced from the service as
 * `NotFoundError` (→ 404 "Document not found") and the exact per-handler
 * `{ message }` 500 bodies. The parent-scoped `requireResourceOwnership` guard
 * stays on the `:id` routes. No business rules, no data access.
 */

import type { Request, Response } from 'express';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { AiOcrDocumentService } from '../services/ai-ocr-document.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string } | undefined)?.garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeAiOcrDocumentController(service: AiOcrDocumentService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list(garageOf(req), str(req.query.status)));
      } catch (error) {
        console.error('Error fetching OCR documents:', error);
        res.status(500).json({ message: 'Failed to fetch OCR documents' });
      }
    },

    async upload(req: Request, res: Response): Promise<void> {
      try {
        const { documentType, fileName } = req.body ?? {};
        res.json(await service.upload(garageOf(req), documentType, fileName));
      } catch (error) {
        console.error('Error uploading OCR document:', error);
        res.status(500).json({ message: 'Failed to upload document for OCR' });
      }
    },

    async get(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.get(req.params.id));
      } catch (error) {
        if (error instanceof NotFoundError) { res.status(404).json({ message: error.message }); return; }
        console.error('Error fetching OCR document:', error);
        res.status(500).json({ message: 'Failed to fetch OCR document' });
      }
    },

    async update(req: Request, res: Response): Promise<void> {
      try {
        const { extractedData, status } = req.body ?? {};
        res.json(await service.update(req.params.id, extractedData, status));
      } catch (error) {
        console.error('Error updating OCR document:', error);
        res.status(500).json({ message: 'Failed to update OCR document' });
      }
    },
  };
}

export type AiOcrDocumentController = ReturnType<typeof makeAiOcrDocumentController>;
