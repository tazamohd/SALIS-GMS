/**
 * AI OCR-document repository (Phase E4). The only data-layer access for the AI
 * OCR-document surface: the `storage` CRUD for persisted documents plus the
 * mock-extraction generator that stands in for the external OCR service
 * (Google Cloud Vision / AWS Textract in production). Extracted from the
 * monolith `/api/ai/ocr-documents*` handlers. The non-deterministic mock
 * (date / random ids) is isolated here at the external-integration seam.
 */

import { storage } from '../../../storage';

// storage rows are loosely typed at the seam.
type Any = any;

export interface IAiOcrDocumentRepository {
  list(garageId: string, status?: string): Promise<Any[]>;
  create(data: Any): Promise<Any>;
  getById(id: string): Promise<Any | undefined>;
  update(id: string, data: Any): Promise<Any>;
  /** Placeholder OCR extraction — replaced by a real OCR service in production. */
  mockExtraction(): Any;
}

export class AiOcrDocumentRepository implements IAiOcrDocumentRepository {
  list(garageId: string, status?: string) { return storage.getOCRDocuments(garageId, status); }
  create(data: Any) { return storage.createOCRDocument(data); }
  getById(id: string) { return storage.getOCRDocument(id); }
  update(id: string, data: Any) { return storage.updateOCRDocument(id, data); }

  mockExtraction(): Any {
    return {
      vendor: 'Auto Parts Supplier Inc.',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
      total: (Math.random() * 1000 + 100).toFixed(2),
      items: [
        { description: 'Oil Filter', quantity: 2, unitPrice: 15.99, amount: 31.98 },
        { description: 'Air Filter', quantity: 1, unitPrice: 22.50, amount: 22.50 },
        { description: 'Spark Plugs', quantity: 4, unitPrice: 8.75, amount: 35.00 },
      ],
      notes: 'Automatically extracted via AI OCR',
    };
  }
}
