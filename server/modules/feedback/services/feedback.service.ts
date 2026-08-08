/**
 * Feedback service (Phase E — Domain Services).
 *
 * Owns the feedback domain rules: the async technician-summary refresh after a
 * submission, the not-found 404s, the response/reason-required 400s, the
 * no-comments-to-analyze 400, and the single + bulk sentiment-analysis
 * orchestration (call the OpenAI seam → persist sentiment). Zod body validation
 * stays at the controller boundary; all data / external access flows through the
 * repository.
 */

import { ValidationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { FeedbackRepository } from '../repositories/feedback.repository';

interface FeedbackRow {
  feedback?: { id?: string; comments?: string; sentiment?: string | null };
}

export class FeedbackService {
  constructor(private readonly repository: FeedbackRepository) {}

  async createFeedback(validated: Parameters<FeedbackRepository['createServiceFeedback']>[0]) {
    const feedback = await this.repository.createServiceFeedback(validated);
    // Refresh the technician's rolling summary asynchronously (best effort).
    if (feedback.technicianId) {
      this.repository.updateTechnicianFeedbackSummary(feedback.technicianId).catch(console.error);
    }
    return feedback;
  }

  byJobCard(jobCardId: string) {
    return this.repository.getServiceFeedbackByJobCard(jobCardId);
  }

  async byTechnician(technicianId: string) {
    const feedback = await this.repository.getServiceFeedbackByTechnician(technicianId);
    const summary = await this.repository.getTechnicianFeedbackSummary(technicianId);
    return { feedback, summary };
  }

  list(filters: Parameters<FeedbackRepository['getAllServiceFeedback']>[0]) {
    return this.repository.getAllServiceFeedback(filters);
  }

  analytics() {
    return this.repository.getFeedbackAnalytics();
  }

  async getById(id: string) {
    const feedback = await this.repository.getServiceFeedbackById(id);
    if (!feedback) throw new NotFoundError('Feedback not found');
    return feedback;
  }

  async respond(id: string, response: unknown) {
    if (!response) throw new ValidationError('Response is required');
    return this.repository.respondToFeedback(id, response as string);
  }

  async flag(id: string, reason: unknown) {
    if (!reason) throw new ValidationError('Reason is required');
    return this.repository.flagFeedback(id, reason as string);
  }

  unflag(id: string) {
    return this.repository.unflagFeedback(id);
  }

  async analyzeSentiment(id: string) {
    const feedback = (await this.repository.getServiceFeedbackById(id)) as FeedbackRow | null;
    if (!feedback) throw new NotFoundError('Feedback not found');

    const comments = feedback.feedback?.comments;
    if (!comments) throw new ValidationError('No comments to analyze');

    const result = await this.repository.analyzeSentiment(comments);
    const updated = await this.repository.updateFeedbackSentiment(
      id,
      result.sentiment || 'neutral',
      result.score || 0,
      result.keywords || [],
    );
    return { ...updated, analysis: result };
  }

  async analyzeAll() {
    const allFeedback = (await this.repository.getAllServiceFeedback({ limit: 100 })) as FeedbackRow[];
    const unanalyzed = allFeedback.filter((f) => !f.feedback?.sentiment && f.feedback?.comments);

    const results: Array<Record<string, unknown>> = [];
    for (const item of unanalyzed.slice(0, 20)) {
      try {
        const result = await this.repository.analyzeSentiment(item.feedback?.comments as string);
        await this.repository.updateFeedbackSentiment(
          item.feedback?.id as string,
          result.sentiment || 'neutral',
          result.score || 0,
          result.keywords || [],
        );
        results.push({ id: item.feedback?.id, success: true, sentiment: result.sentiment });
      } catch (e) {
        results.push({ id: item.feedback?.id, success: false, error: (e as Error).message });
      }
    }
    return { analyzed: results.length, results };
  }
}
