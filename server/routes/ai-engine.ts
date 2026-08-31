// @ts-nocheck
/**
 * SALIS AUTO — AI Engine Routes
 *
 * Extracted from the monolith (server/routes.ts):
 *   Block 1 (Module 32): /api/ai/estimate-job, /api/ai/job-estimations,
 *     /api/ai/predict-maintenance, /api/ai/predictive-diagnostics,
 *     /api/ai/maintenance-predictions, /api/ai/recommend-parts,
 *     /api/ai/parts-recommendations, /api/ai/optimize-schedule,
 *     /api/ai/schedule-optimizations, /api/ai/chat, /api/ai/chat-conversations
 *   Block 2 (Phase 1): /api/ai-chat-conversations, /api/ai-chat-messages,
 *     /api/ai-chat/send, /api/ai-maintenance/predict,
 *     /api/ai-maintenance/predictions, /api/ai-parts/recommend,
 *     /api/ai-parts/recommendations, /api/ai-ocr/process,
 *     /api/ai-ocr/documents, /api/ai-service/suggest
 */

import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import { requireRole } from '../middleware/requireRole';
import { storage } from '../storage';
import {
  estimateJobTime,
  predictMaintenance,
  recommendParts,
  optimizeSchedule,
  chatWithCustomer,
} from '../ai';
import {
  insertAIJobEstimationSchema,
  insertAIPartsRecommendationSchema,
  insertAIScheduleOptimizationSchema,
  insertAIChatConversationSchema,
} from '@shared/schema';

const router = Router();

const AI_ROLES = ['ADMIN', 'MANAGER', 'ADVISOR'] as const;

// ---------------------------------------------------------------------------
// Helper — mirrors sanitizeZodError from the monolith
// ---------------------------------------------------------------------------
function sanitizeZodError(error: z.ZodError) {
  return {
    message: 'Validation failed',
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

// ===========================================================================
// BLOCK 1 — Module 32: AI Automation (was lines ~6247-6918 in monolith)
// ===========================================================================

// ---- Job Time Estimation ------------------------------------------------

router.post('/ai/estimate-job', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { serviceType, vehicleId, jobCardId, vehicleMake, vehicleModel, vehicleYear, historicalJobs } = req.body;

    const aiResult = await estimateJobTime({
      serviceType: serviceType || '',
      vehicleMake,
      vehicleModel,
      vehicleYear,
      historicalJobs,
    });

    const estimationData = {
      garageId: userGarageId,
      serviceType,
      vehicleId,
      jobCardId,
      estimatedHours: aiResult.estimatedHours?.toString(),
      estimatedCost: aiResult.estimatedCost?.toString(),
      confidence: aiResult.confidence?.toString(),
      reasoning: aiResult.reasoning,
    };

    const estimation = await storage.createAIJobEstimation(estimationData);
    res.json(estimation);
  } catch (error: any) {
    console.error('Error creating job estimation:', error);
    res.status(500).json({ message: 'Failed to create job estimation', error: error.message });
  }
});

router.get('/ai/job-estimations', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId } = req.query;

    const estimations = await storage.getAIJobEstimations(userGarageId, vehicleId as string);
    res.json(estimations);
  } catch (error) {
    console.error('Error fetching job estimations:', error);
    res.status(500).json({ message: 'Failed to fetch job estimations' });
  }
});

router.get('/ai/job-estimations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const estimation = await storage.getAIJobEstimation(req.params.id);

    if (!estimation) {
      return res.status(404).json({ message: 'Job estimation not found' });
    }

    if (estimation.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(estimation);
  } catch (error) {
    console.error('Error fetching job estimation:', error);
    res.status(500).json({ message: 'Failed to fetch job estimation' });
  }
});

router.patch('/ai/job-estimations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAIJobEstimation(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Job estimation not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertAIJobEstimationSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const estimation = await storage.updateAIJobEstimation(req.params.id, validated.data);
    res.json(estimation);
  } catch (error) {
    console.error('Error updating job estimation:', error);
    res.status(500).json({ message: 'Failed to update job estimation' });
  }
});

// ---- Maintenance Predictions -------------------------------------------

router.post('/ai/predict-maintenance', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, vehicleMake, vehicleModel, vehicleYear, mileage, serviceHistory } = req.body;

    const aiResult = await predictMaintenance({
      vehicleMake,
      vehicleModel,
      vehicleYear,
      mileage,
      serviceHistory: serviceHistory || [],
    });

    const predictionData = {
      garageId: userGarageId,
      vehicleId,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      mileage,
      serviceHistory: serviceHistory || [],
      predictions: aiResult.predictions,
      status: 'pending',
    };

    const prediction = await storage.createAIMaintenancePrediction(predictionData);
    res.json(prediction);
  } catch (error: any) {
    console.error('Error creating maintenance prediction:', error);
    res.status(500).json({ message: 'Failed to create maintenance prediction', error: error.message });
  }
});

router.post('/ai/predictive-diagnostics', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const {
      vehicleId,
      mileage,
      engineTemperature,
      oilPressure,
      brakePadWear,
      batteryVoltage,
      tireCondition,
      lastServiceDate,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      fuelLevel,
      checkEngineLightOn,
      unusualNoises,
      additionalSymptoms,
    } = req.body;

    // Import the predictive diagnostics service
    const { generatePredictiveDiagnostic } = await import('../services/predictiveDiagnostics');

    const aiResult = await generatePredictiveDiagnostic({
      vehicleId,
      mileage,
      engineTemperature,
      oilPressure,
      brakePadWear,
      batteryVoltage,
      tireCondition,
      lastServiceDate,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      fuelLevel,
      checkEngineLightOn,
      unusualNoises,
      additionalSymptoms,
    });

    // Save prediction to database
    const predictionData = {
      garageId: userGarageId,
      vehicleId,
      predictedIssue: aiResult.predictedIssue,
      severity: aiResult.severity,
      recommendedAction: aiResult.recommendedAction,
      estimatedTimeframe: aiResult.estimatedTimeframe,
      confidence: aiResult.confidence,
      basedOnData: {
        mileage,
        engineTemperature,
        oilPressure,
        brakePadWear,
        batteryVoltage,
        tireCondition,
        vehicleInfo: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
        checkEngineLightOn,
        unusualNoises,
        additionalSymptoms,
        riskLevel: aiResult.riskLevel,
      },
      status: 'pending',
    };

    const prediction = await storage.createAIMaintenancePrediction(predictionData);

    res.json({
      ...prediction,
      riskLevel: aiResult.riskLevel,
      additionalDetails: aiResult.additionalDetails,
    });
  } catch (error: any) {
    console.error('Error creating predictive diagnostic:', error);
    res.status(500).json({ message: 'Failed to create predictive diagnostic', error: error.message });
  }
});

router.get('/ai/maintenance-predictions', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, status } = req.query;

    const predictions = await storage.getAIMaintenancePredictions(
      userGarageId,
      vehicleId as string,
      status as string,
    );
    res.json(predictions);
  } catch (error) {
    console.error('Error fetching maintenance predictions:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance predictions' });
  }
});

router.get('/ai/maintenance-predictions/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const prediction = await storage.getAIMaintenancePrediction(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: 'Maintenance prediction not found' });
    }

    if (prediction.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prediction);
  } catch (error) {
    console.error('Error fetching maintenance prediction:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance prediction' });
  }
});

router.post('/ai/maintenance-predictions/:id/acknowledge', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAIMaintenancePrediction(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Maintenance prediction not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prediction = await storage.updateAIMaintenancePrediction(req.params.id, {
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
    });
    res.json(prediction);
  } catch (error) {
    console.error('Error acknowledging maintenance prediction:', error);
    res.status(500).json({ message: 'Failed to acknowledge maintenance prediction' });
  }
});

router.post('/ai/maintenance-predictions/analyze', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;

    // Import analyzePredictiveMaintenance from ai-service
    const { analyzePredictiveMaintenance } = await import('../ai-service');

    // Get all vehicles and their service history for this garage
    const vehicles = await storage.getVehicles(userGarageId);
    const predictions: any[] = [];

    for (const vehicle of vehicles) {
      // Get service history for the vehicle - filter by garage, then by vehicle
      const allJobCards = await storage.getJobCards(userGarageId);
      // Match by VIN in vehicleInfo JSONB field
      const jobCards = allJobCards.filter((jc: any) => {
        const info = jc.vehicleInfo as any;
        return info?.vin === vehicle.vin;
      });

      if (jobCards.length > 0) {
        // Use AI to analyze service patterns and predict maintenance needs
        const serviceHistory = jobCards.map((jc: any) => ({
          date: jc.createdAt,
          description: jc.description || 'Service performed',
          mileage: jc.mileage || vehicle.mileage,
          cost: jc.totalCost || 0,
        }));

        const aiPredictions = await analyzePredictiveMaintenance({
          vehicleId: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage || 50000,
          serviceHistory,
        });

        // Store AI predictions in database
        for (const aiPred of aiPredictions) {
          const predictionData = {
            garageId: userGarageId,
            vehicleId: vehicle.id,
            predictedIssue: aiPred.issue || `Maintenance needed for ${vehicle.make} ${vehicle.model}`,
            severity: aiPred.severity || 'medium',
            recommendedAction: aiPred.recommendation || 'Schedule inspection',
            estimatedTimeframe: `Around ${aiPred.estimatedMiles || vehicle.mileage + 1000} miles`,
            confidence: Math.round((aiPred.probability || 0.75) * 100),
            basedOnData: {
              serviceHistory: serviceHistory.slice(-3),
              totalServices: jobCards.length,
              vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              currentMileage: vehicle.mileage || 50000,
              aiAnalysis: true,
            },
            status: 'pending',
          };

          const prediction = await storage.createAIMaintenancePrediction(predictionData);
          predictions.push(prediction);
        }
      }
    }

    res.json({
      message: `AI analysis complete. Generated ${predictions.length} new predictions.`,
      predictions,
    });
  } catch (error: any) {
    console.error('Error running AI maintenance analysis:', error);
    res.status(500).json({ message: 'Failed to run AI maintenance analysis', error: error.message });
  }
});

// ---- Parts Recommendations ---------------------------------------------

router.post('/ai/recommend-parts', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, serviceType, vehicleMake, vehicleModel, vehicleYear, description, jobCardId } = req.body;

    const aiResult = await recommendParts({
      serviceType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      description: description || undefined,
    });

    const recommendationData = {
      garageId: userGarageId,
      vehicleId,
      serviceType,
      jobCardId,
      recommendedParts: aiResult.parts,
      totalEstimatedCost: aiResult.totalEstimatedCost,
      reasoning: aiResult.reasoning,
      confidence: aiResult.confidence,
      status: 'pending',
    };

    const recommendation = await storage.createAIPartsRecommendation(recommendationData);
    res.json(recommendation);
  } catch (error: any) {
    console.error('Error creating parts recommendation:', error);
    res.status(500).json({ message: 'Failed to create parts recommendation', error: error.message });
  }
});

router.get('/ai/parts-recommendations', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, status } = req.query;

    const recommendations = await storage.getAIPartsRecommendations(
      userGarageId,
      vehicleId as string,
      status as string,
    );
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching parts recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch parts recommendations' });
  }
});

router.get('/ai/parts-recommendations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const recommendation = await storage.getAIPartsRecommendation(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Parts recommendation not found' });
    }

    if (recommendation.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error fetching parts recommendation:', error);
    res.status(500).json({ message: 'Failed to fetch parts recommendation' });
  }
});

router.patch('/ai/parts-recommendations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAIPartsRecommendation(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Parts recommendation not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertAIPartsRecommendationSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const recommendation = await storage.updateAIPartsRecommendation(req.params.id, validated.data);
    res.json(recommendation);
  } catch (error) {
    console.error('Error updating parts recommendation:', error);
    res.status(500).json({ message: 'Failed to update parts recommendation' });
  }
});

// ---- Schedule Optimization ---------------------------------------------

router.post('/ai/optimize-schedule', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { appointments, technicians } = req.body;

    const aiResult = await optimizeSchedule({
      appointments: appointments || [],
      technicians: technicians || [],
    });

    const optimizationData = {
      garageId: userGarageId,
      conflicts: aiResult.conflicts,
      suggestions: aiResult.suggestions,
      potentialTimeSaved: aiResult.totalPotentialTimeSaved,
      reasoning: aiResult.reasoning,
      status: 'pending',
    };

    const optimization = await storage.createAIScheduleOptimization(optimizationData);
    res.json(optimization);
  } catch (error: any) {
    console.error('Error creating schedule optimization:', error);
    res.status(500).json({ message: 'Failed to create schedule optimization', error: error.message });
  }
});

router.get('/ai/schedule-optimizations', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { status } = req.query;

    const optimizations = await storage.getAIScheduleOptimizations(
      userGarageId,
      status as string,
    );
    res.json(optimizations);
  } catch (error) {
    console.error('Error fetching schedule optimizations:', error);
    res.status(500).json({ message: 'Failed to fetch schedule optimizations' });
  }
});

router.get('/ai/schedule-optimizations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const optimization = await storage.getAIScheduleOptimization(req.params.id);

    if (!optimization) {
      return res.status(404).json({ message: 'Schedule optimization not found' });
    }

    if (optimization.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(optimization);
  } catch (error) {
    console.error('Error fetching schedule optimization:', error);
    res.status(500).json({ message: 'Failed to fetch schedule optimization' });
  }
});

router.patch('/ai/schedule-optimizations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAIScheduleOptimization(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Schedule optimization not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertAIScheduleOptimizationSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const optimization = await storage.updateAIScheduleOptimization(req.params.id, validated.data);
    res.json(optimization);
  } catch (error) {
    console.error('Error updating schedule optimization:', error);
    res.status(500).json({ message: 'Failed to update schedule optimization' });
  }
});

// ---- Chat Bot -----------------------------------------------------------

router.post('/ai/chat', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { message, conversationId, garageContext } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let conversation: any;
    let conversationHistory: any[] = [];

    if (conversationId) {
      conversation = await storage.getAIChatConversation(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (conversation.garageId !== userGarageId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      conversationHistory = conversation.messages || [];
    } else {
      const validated = insertAIChatConversationSchema.parse({
        garageId: userGarageId,
        customerId: req.body.customerId,
        messages: [],
        status: 'active',
      });

      conversation = await storage.createAIChatConversation(validated);
    }

    const aiResult = await chatWithCustomer(
      message,
      conversationHistory,
      garageContext || { garageName: 'Our Garage' },
    );

    const updatedMessages = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResult.response, timestamp: new Date().toISOString() },
    ];

    const updatedConversation = await storage.updateAIChatConversation(conversation.id, {
      messages: updatedMessages,
      status: aiResult.shouldHandoff ? 'pending_handoff' : 'active',
    });

    res.json({
      conversation: updatedConversation,
      response: aiResult.response,
      shouldHandoff: aiResult.shouldHandoff,
    });
  } catch (error: any) {
    console.error('Error processing chat:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to process chat' });
  }
});

router.get('/ai/chat-conversations', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const { customerId, status } = req.query;

    const conversations = await storage.getAIChatConversations(
      userGarageId,
      customerId as string,
      status as string,
    );
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching chat conversations:', error);
    res.status(500).json({ message: 'Failed to fetch chat conversations' });
  }
});

router.get('/ai/chat-conversations/:id', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const conversation = await storage.getAIChatConversation(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching chat conversation:', error);
    res.status(500).json({ message: 'Failed to fetch chat conversation' });
  }
});

router.post('/ai/chat-conversations/:id/handoff', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAIChatConversation(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { assignedTo } = req.body;

    const conversation = await storage.updateAIChatConversation(req.params.id, {
      status: 'handed_off',
      handoffTo: assignedTo,
      handoffAt: new Date().toISOString(),
    });
    res.json(conversation);
  } catch (error) {
    console.error('Error handing off conversation:', error);
    res.status(500).json({ message: 'Failed to hand off conversation' });
  }
});

// ===========================================================================
// BLOCK 2 — Phase 1: AI & Automation (was lines ~11350-11583 in monolith)
// ===========================================================================

// ---- AI Chatbot (Real OpenAI Integration) --------------------------------

router.get('/ai-chat-conversations', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const conversations = await storage.getAIChatConversations(req.user?.garageId);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching AI conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

router.get('/ai-chat-messages', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID required' });
    }
    // TODO: Implement getAIChatMessages in storage
    res.json([]);
  } catch (error) {
    console.error('Error fetching AI messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

router.post('/ai-chat/send', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { conversationId, message } = req.body;
    const { streamChatResponse } = await import('../ai-service');

    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
      const newConv = await storage.createAIChatConversation({
        userId: req.user?.id,
        garageId: req.user?.garageId,
        title: message.substring(0, 50) + '...',
        status: 'active',
      });
      convId = newConv.id;
    }

    // TODO: Save user message when storage method is available
    // await storage.createAIChatMessage({ conversationId: convId, role: "user", content: message });

    // Get conversation history (mock for now)
    const chatHistory = [{ role: 'user', content: message }];

    // Stream AI response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let aiResponse = '';
    for await (const chunk of streamChatResponse(chatHistory)) {
      aiResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // TODO: Save AI response when storage method is available
    // await storage.createAIChatMessage({ conversationId: convId, role: "assistant", content: aiResponse });

    res.write(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ message: 'Failed to process chat message' });
  }
});

// ---- Predictive Maintenance AI ------------------------------------------

router.post('/ai-maintenance/predict', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { vehicleId } = req.body;
    const { analyzePredictiveMaintenance } = await import('../ai-service');

    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const serviceHistory = await storage.getVehicleServiceHistory(vehicleId);

    const predictions = await analyzePredictiveMaintenance({
      vehicleId: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage || 0,
      serviceHistory,
    });

    // Save predictions
    for (const pred of predictions) {
      await storage.createAIMaintenancePrediction({
        vehicleId: vehicle.id,
        predictedIssue: pred.issue,
        probability: pred.probability,
        estimatedMiles: pred.estimatedMiles,
        severity: pred.severity,
        recommendation: pred.recommendation,
        status: 'pending',
      });
    }

    res.json({ predictions });
  } catch (error) {
    console.error('Error in predictive maintenance:', error);
    res.status(500).json({ message: 'Failed to generate predictions' });
  }
});

router.get('/ai-maintenance/predictions', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { vehicleId } = req.query;
    const predictions = await storage.getAIMaintenancePredictions(vehicleId as string);
    res.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ message: 'Failed to fetch predictions' });
  }
});

// ---- Smart Parts Recommendations AI ------------------------------------

router.post('/ai-parts/recommend', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { vehicleId, serviceType, symptoms } = req.body;
    const { generatePartsRecommendations } = await import('../ai-service');

    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const recommendations = await generatePartsRecommendations({
      vehicleId: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      serviceType,
      symptoms,
    });

    // Save recommendations
    for (const rec of recommendations) {
      await storage.createAIPartsRecommendation({
        vehicleId: vehicle.id,
        partName: rec.partName,
        partNumber: rec.partNumber || '',
        compatibility: rec.compatibility,
        priority: rec.priority,
        estimatedCost: rec.estimatedCost,
        reason: rec.reason,
        status: 'pending',
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Error generating parts recommendations:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

router.get('/ai-parts/recommendations', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { vehicleId } = req.query;
    const recommendations = await storage.getAIPartsRecommendations(vehicleId as string);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// ---- Document OCR with AI Analysis -------------------------------------

router.post('/ai-ocr/process', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { documentType, imageData, extractedText } = req.body;
    const { analyzeOCRDocument } = await import('../ai-service');

    // In production, use OCR service (Tesseract.js or cloud) to extract text from imageData
    const textToAnalyze = extractedText || 'Sample extracted text';

    const analysis = await analyzeOCRDocument(textToAnalyze, documentType);

    const document = await storage.createOCRDocument({
      userId: req.user?.id,
      garageId: req.user?.garageId,
      documentType,
      originalText: textToAnalyze,
      extractedData: analysis.fields,
      confidence: 85,
      status: 'processed',
    });

    res.json({ document, analysis });
  } catch (error) {
    console.error('Error processing OCR document:', error);
    res.status(500).json({ message: 'Failed to process document' });
  }
});

router.get('/ai-ocr/documents', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const documents = await storage.getOCRDocuments(req.user?.garageId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching OCR documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// ---- AI Service Suggestions ---------------------------------------------

router.post('/ai-service/suggest', isAuthenticated, requireRole([...AI_ROLES]), async (req: any, res: any) => {
  try {
    const { customer, vehicle, symptoms, mileage } = req.body;
    const { generateServiceSuggestions } = await import('../ai-service');

    const suggestions = await generateServiceSuggestions({
      customer,
      vehicle,
      symptoms,
      mileage,
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating service suggestions:', error);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
});

// ---------------------------------------------------------------------------
export const aiEngineRoutes = router;
