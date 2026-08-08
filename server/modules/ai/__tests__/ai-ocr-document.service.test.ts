import { describe, it, expect, vi } from 'vitest';
import { AiOcrDocumentService } from '../services/ai-ocr-document.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    list: vi.fn(async () => [{ id: 'd1' }]),
    create: vi.fn(async (d: Record<string, unknown>) => ({ id: 'd1', ...d })),
    getById: vi.fn(async () => ({ id: 'd1', garageId: 'g1' })),
    update: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'd1', ...d })),
    mockExtraction: vi.fn(() => ({ vendor: 'Auto Parts Supplier Inc.', total: '123.45' })),
    ...o,
  };
}

describe('AiOcrDocumentService', () => {
  it('list forwards the garage + optional status filter', async () => {
    const r = repo();
    await new AiOcrDocumentService(r as never).list('g1', 'completed');
    expect(r.list).toHaveBeenCalledWith('g1', 'completed');
  });

  it('upload assembles the document with legacy defaults + the mock extraction', async () => {
    const r = repo();
    await new AiOcrDocumentService(r as never).upload('g1');
    expect(r.mockExtraction).toHaveBeenCalled();
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      garageId: 'g1',
      documentType: 'invoice',
      fileName: 'document.pdf',
      status: 'completed',
      confidence: 92,
      extractedData: { vendor: 'Auto Parts Supplier Inc.', total: '123.45' },
    }));
  });

  it('upload honors an explicit documentType / fileName', async () => {
    const r = repo();
    await new AiOcrDocumentService(r as never).upload('g1', 'receipt', 'scan.png');
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({ documentType: 'receipt', fileName: 'scan.png' }));
  });

  it('get returns the document, or throws NotFoundError when missing', async () => {
    expect(await new AiOcrDocumentService(repo() as never).get('d1')).toMatchObject({ id: 'd1' });
    await expect(new AiOcrDocumentService(repo({ getById: vi.fn(async () => undefined) }) as never).get('d1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('update applies the extractedData and defaults status to approved', async () => {
    const r = repo();
    await new AiOcrDocumentService(r as never).update('d1', { vendor: 'X' });
    expect(r.update).toHaveBeenCalledWith('d1', { extractedData: { vendor: 'X' }, status: 'approved' });
  });

  it('update honors an explicit status', async () => {
    const r = repo();
    await new AiOcrDocumentService(r as never).update('d1', { vendor: 'X' }, 'rejected');
    expect(r.update).toHaveBeenCalledWith('d1', { extractedData: { vendor: 'X' }, status: 'rejected' });
  });
});
