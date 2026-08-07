/**
 * AI repository (Phase E4). The only data-layer access for the AI feature set —
 * delegates to the `ai/business-intelligence` statistical helpers, the vehicle
 * lookup, and the OpenAI chat completion behind the repair-guide. External
 * integrations are treated as the data layer here (strangler seam).
 */

import { storage } from '../../../storage';
import {
  generateBusinessInsights,
  generateRevenueForecast,
  generateDemandPredictions,
  getDailyJobCounts,
  getPartsForecastSnapshot,
} from '../../../ai/business-intelligence';
import { openai, AI_MODEL } from '../../../ai';

// The BI helpers and OpenAI SDK are loosely typed; `Any` keeps the seam readable.
type Any = any;

export interface IAiRepository {
  businessInsights(garageId: string): Promise<Any>;
  revenueForecast(garageId: string): Promise<Any>;
  demandPredictions(garageId: string): Promise<Any>;
  dailyJobCounts(garageId: string, days: number): Promise<Any>;
  partsForecast(garageId: string, limit: number): Promise<Any>;
  getVehicle(id: string): Promise<Any>;
  /** Raw JSON content string from the repair-guide LLM completion. */
  repairGuideCompletion(vehicleInfo: string, guide: string): Promise<string>;
}

export class AiRepository implements IAiRepository {
  businessInsights(garageId: string) { return generateBusinessInsights(garageId); }
  revenueForecast(garageId: string) { return generateRevenueForecast(garageId); }
  demandPredictions(garageId: string) { return generateDemandPredictions(garageId); }
  dailyJobCounts(garageId: string, days: number) { return getDailyJobCounts(garageId, days); }
  partsForecast(garageId: string, limit: number) { return getPartsForecastSnapshot(garageId, limit); }
  getVehicle(id: string) { return storage.getVehicle(id); }

  async repairGuideCompletion(vehicleInfo: string, guide: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert automotive technician. Produce a JSON object with key `steps` containing an ordered array of 5-10 repair steps. Each step has `id` (number), `title` (short imperative), and `description` (one sentence). Be specific to the vehicle and procedure. Respond with ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `Vehicle: ${vehicleInfo}\nRepair procedure: ${guide}`,
        },
      ],
      max_completion_tokens: 1500,
    });
    return completion.choices[0]?.message?.content?.trim() || '{}';
  }
}
