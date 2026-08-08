import { describe, it, expect, vi } from 'vitest';
import { FeedbackService } from '../services/feedback.service';
import { ValidationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    createServiceFeedback: vi.fn(async (d: Record<string, unknown>) => ({ id: 'fb1', ...d })),
    updateTechnicianFeedbackSummary: vi.fn(async () => undefined),
    getServiceFeedbackByJobCard: vi.fn(async () => [{ id: 'fb1' }]),
    getServiceFeedbackByTechnician: vi.fn(async () => [{ id: 'fb1' }]),
    getTechnicianFeedbackSummary: vi.fn(async () => ({ avg: 4.5 })),
    getAllServiceFeedback: vi.fn(async () => [{ id: 'fb1' }]),
    getFeedbackAnalytics: vi.fn(async () => ({ total: 1 })),
    getServiceFeedbackById: vi.fn(async () => ({ id: 'fb1', feedback: { id: 'fb1', comments: 'great', sentiment: null } })),
    respondToFeedback: vi.fn(async () => ({ id: 'fb1', response: 'thanks' })),
    flagFeedback: vi.fn(async () => ({ id: 'fb1', isFlagged: true })),
    unflagFeedback: vi.fn(async () => ({ id: 'fb1', isFlagged: false })),
    updateFeedbackSentiment: vi.fn(async () => ({ id: 'fb1', sentiment: 'positive' })),
    analyzeSentiment: vi.fn(async () => ({ sentiment: 'positive', score: 0.9, keywords: ['fast'] })),
    ...o,
  };
}

describe('FeedbackService — submit + lookups', () => {
  it('creates feedback and fires the technician-summary refresh when present', async () => {
    const r = repo({ createServiceFeedback: vi.fn(async () => ({ id: 'fb1', technicianId: 't1' })) });
    await new FeedbackService(r as never).createFeedback({} as never);
    expect(r.updateTechnicianFeedbackSummary).toHaveBeenCalledWith('t1');
  });
  it('does not refresh the summary when there is no technician', async () => {
    const r = repo({ createServiceFeedback: vi.fn(async () => ({ id: 'fb1' })) });
    await new FeedbackService(r as never).createFeedback({} as never);
    expect(r.updateTechnicianFeedbackSummary).not.toHaveBeenCalled();
  });
  it('bundles feedback + summary for a technician', async () => {
    const out = await new FeedbackService(repo() as never).byTechnician('t1');
    expect(out).toEqual({ feedback: [{ id: 'fb1' }], summary: { avg: 4.5 } });
  });
  it('404s a missing feedback on getById', async () => {
    await expect(new FeedbackService(repo({ getServiceFeedbackById: vi.fn(async () => null) }) as never).getById('fb1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('FeedbackService — respond / flag / unflag', () => {
  it('400s respond without a response body, else delegates', async () => {
    await expect(new FeedbackService(repo() as never).respond('fb1', undefined)).rejects.toBeInstanceOf(ValidationError);
    const r = repo();
    await new FeedbackService(r as never).respond('fb1', 'thanks');
    expect(r.respondToFeedback).toHaveBeenCalledWith('fb1', 'thanks');
  });
  it('400s flag without a reason, else delegates', async () => {
    await expect(new FeedbackService(repo() as never).flag('fb1', '')).rejects.toBeInstanceOf(ValidationError);
    const r = repo();
    await new FeedbackService(r as never).flag('fb1', 'spam');
    expect(r.flagFeedback).toHaveBeenCalledWith('fb1', 'spam');
  });
});

describe('FeedbackService — sentiment analysis', () => {
  it('404s a missing feedback and 400s one with no comments', async () => {
    await expect(new FeedbackService(repo({ getServiceFeedbackById: vi.fn(async () => null) }) as never).analyzeSentiment('fb1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new FeedbackService(repo({ getServiceFeedbackById: vi.fn(async () => ({ feedback: { id: 'fb1', comments: '' } })) }) as never).analyzeSentiment('fb1'))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it('persists the analysed sentiment and returns it under analysis', async () => {
    const r = repo();
    const out = await new FeedbackService(r as never).analyzeSentiment('fb1');
    expect(r.updateFeedbackSentiment).toHaveBeenCalledWith('fb1', 'positive', 0.9, ['fast']);
    expect(out).toMatchObject({ analysis: { sentiment: 'positive', score: 0.9, keywords: ['fast'] } });
  });
  it('bulk-analyses only unanalysed feedback with comments, capped at 20', async () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({ feedback: { id: `f${i}`, comments: 'x', sentiment: null } }));
    rows.push({ feedback: { id: 'skip', comments: 'y', sentiment: 'positive' } } as never); // already analysed
    const r = repo({ getAllServiceFeedback: vi.fn(async () => rows) });
    const out = await new FeedbackService(r as never).analyzeAll();
    expect(out.analyzed).toBe(20);
    expect(r.updateFeedbackSentiment).toHaveBeenCalledTimes(20);
  });
  it('records a per-item failure without aborting the bulk run', async () => {
    const rows = [
      { feedback: { id: 'a', comments: 'x', sentiment: null } },
      { feedback: { id: 'b', comments: 'x', sentiment: null } },
    ];
    const analyze = vi.fn()
      .mockResolvedValueOnce({ sentiment: 'positive', score: 1, keywords: [] })
      .mockRejectedValueOnce(new Error('rate limit'));
    const r = repo({ getAllServiceFeedback: vi.fn(async () => rows), analyzeSentiment: analyze });
    const out = await new FeedbackService(r as never).analyzeAll();
    expect(out.results).toEqual([
      { id: 'a', success: true, sentiment: 'positive' },
      { id: 'b', success: false, error: 'rate limit' },
    ]);
  });
});
