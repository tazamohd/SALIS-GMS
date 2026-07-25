/**
 * SALIS AUTO - AI Business Intelligence API Routes
 */

import { Router, Request, Response } from 'express';
import {
  generateBusinessInsights,
  generateRevenueForecast,
  generateDemandPredictions,
} from '../ai/business-intelligence';

const router = Router();

// GET /api/ai/insights — Generate AI-powered business insights
router.get('/ai/insights', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated' });
    }
    const insights = await generateBusinessInsights(user.garageId);
    res.json(insights);
  } catch (error) {
    console.error('[AI Insights] Error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

// GET /api/ai/forecast/revenue — Revenue forecast
router.get('/ai/forecast/revenue', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated' });
    }
    const forecast = await generateRevenueForecast(user.garageId);
    res.json(forecast);
  } catch (error) {
    console.error('[AI Forecast] Error:', error);
    res.status(500).json({ message: 'Failed to generate forecast' });
  }
});

// GET /api/ai/forecast/demand — Service demand predictions
router.get('/ai/forecast/demand', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated' });
    }
    const predictions = await generateDemandPredictions(user.garageId);
    res.json(predictions);
  } catch (error) {
    console.error('[AI Demand] Error:', error);
    res.status(500).json({ message: 'Failed to generate predictions' });
  }
});

export default router;
