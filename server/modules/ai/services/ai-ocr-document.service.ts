/**
 * AI OCR-document service (Phase E5 — business layer). Owns the OCR-document
 * assembly (mock extraction → persisted record with the legacy defaults), the
 * tenant-scoped list, the not-found rule on read, and the update defaults.
 * Per-garage ownership on the `:id` routes is enforced by the route-level
 * parent-scoped `requireResourceOwnership` guard (unchanged). No HTTP, no
 * data-layer access.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IAiOcrDocumentRepository } from '../repositories/ai-ocr-document.repository';

// storage rows are loosely typed at the seam.
type Any = any;

export class AiOcrDocumentService {
  constructor(private readonly repo: IAiOcrDocumentRepository) {}

  list(garageId: string, status?: string) {
    return this.repo.list(garageId, status);
  }

  upload(garageId: string, documentType?: string, fileName?: string) {
    // In production this would call a real OCR service; the mock extraction is
    // produced by the repository (the external-integration seam).
    return this.repo.create({
      garageId,
      documentType: documentType || 'invoice',
      fileName: fileName || 'document.pdf',
      status: 'completed',
      extractedData: this.repo.mockExtraction(),
      confidence: 92,
    });
  }

  async get(id: string) {
    const document = await this.repo.getById(id);
    if (!document) throw new NotFoundError('Document not found');
    return document;
  }

  update(id: string, extractedData: Any, status?: string) {
    return this.repo.update(id, {
      extractedData,
      status: status || 'approved',
    });
  }
}
