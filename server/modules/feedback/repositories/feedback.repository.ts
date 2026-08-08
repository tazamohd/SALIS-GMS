/**
 * Feedback repository (Phase E). The only data / external-service access for the
 * feedback domain: the `storage` service-feedback CRUD + technician summaries,
 * plus the OpenAI sentiment-analysis seam. Delegation only.
 */

import { storage } from '../../../storage';

export interface SentimentResult {
  sentiment?: string;
  score?: number;
  keywords?: string[];
}

export class FeedbackRepository {
  // Service feedback CRUD
  createServiceFeedback(data: Parameters<typeof storage.createServiceFeedback>[0]) {
    return storage.createServiceFeedback(data);
  }
  updateTechnicianFeedbackSummary(technicianId: string) {
    return storage.updateTechnicianFeedbackSummary(technicianId);
  }
  getServiceFeedbackByJobCard(jobCardId: string) {
    return storage.getServiceFeedbackByJobCard(jobCardId);
  }
  getServiceFeedbackByTechnician(technicianId: string) {
    return storage.getServiceFeedbackByTechnician(technicianId);
  }
  getTechnicianFeedbackSummary(technicianId: string) {
    return storage.getTechnicianFeedbackSummary(technicianId);
  }
  getAllServiceFeedback(filters?: Parameters<typeof storage.getAllServiceFeedback>[0]) {
    return storage.getAllServiceFeedback(filters);
  }
  getFeedbackAnalytics() {
    return storage.getFeedbackAnalytics();
  }
  getServiceFeedbackById(id: string) {
    return storage.getServiceFeedbackById(id);
  }
  respondToFeedback(id: string, response: string) {
    return storage.respondToFeedback(id, response);
  }
  flagFeedback(id: string, reason: string) {
    return storage.flagFeedback(id, reason);
  }
  unflagFeedback(id: string) {
    return storage.unflagFeedback(id);
  }
  updateFeedbackSentiment(id: string, sentiment: string, score: number, keywords: string[]) {
    return storage.updateFeedbackSentiment(id, sentiment, score, keywords);
  }

  /**
   * External seam: OpenAI sentiment analysis. Returns the parsed JSON
   * (sentiment / score / keywords). The client is imported lazily so the
   * module loads without the SDK present.
   */
  async analyzeSentiment(comments: string): Promise<SentimentResult> {
    const openai = new (await import('openai')).default();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a sentiment analysis assistant. Analyze the customer feedback and return a JSON response with: sentiment (positive/negative/neutral), score (-1.0 to 1.0), and keywords (array of 3-5 relevant keywords or phrases).',
        },
        {
          role: 'user',
          content: `Analyze this customer feedback: "${comments}"`,
        },
      ],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(completion.choices[0].message.content || '{}');
  }
}
