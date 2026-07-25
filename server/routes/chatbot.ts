import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import {
  validatePatchBody,
  chatbotMessageSchema,
  chatbotDiagnoseSchema,
  chatbotConversationSchema,
  chatbotBookingIntentSchema,
} from './validators';
import {
  generateChatbotResponse,
  extractBookingIntent,
  diagnoseProblem,
} from '../services/aiChatbot';

const router = Router();

router.post('/chatbot/conversation', isAuthenticated, async (req: any, res) => {
  try {
    const validated = validatePatchBody(req, res, chatbotConversationSchema);
    if (!validated.ok) return;

    const userGarageId = req.user?.garageId;
    const { customerId, sessionId } = validated.data;

    const conversation = await storage.createAIChatConversation({
      garageId: userGarageId,
      customerId: customerId || req.user?.id,
      sessionId: sessionId || `session-${Date.now()}`,
      messages: [],
      status: 'active',
    });

    res.json(conversation);
  } catch (error: any) {
    console.error('Error creating chatbot conversation:', error);
    res.status(500).json({ message: 'Failed to create conversation', error: error.message });
  }
});

router.post('/chatbot/message', isAuthenticated, async (req: any, res) => {
  try {
    const validated = validatePatchBody(req, res, chatbotMessageSchema);
    if (!validated.ok) return;

    const { conversationId, message, vehicleInfo } = validated.data;
    const conversation = await storage.getAIChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.garageId !== req.user?.garageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const normalizedVehicleInfo = vehicleInfo?.make && vehicleInfo?.model && vehicleInfo?.year
      ? {
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          year: vehicleInfo.year,
          mileage: vehicleInfo.mileage,
          vin: vehicleInfo.vin,
        }
      : undefined;

    const aiResponse = await generateChatbotResponse({
      garageId: conversation.garageId,
      customerId: conversation.customerId,
      vehicleInfo: normalizedVehicleInfo,
      conversationHistory: conversation.messages || [],
    }, message);

    const updatedMessages = [
      ...(conversation.messages || []),
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse },
    ];

    await storage.updateAIChatConversation(conversationId, {
      messages: updatedMessages,
    });

    res.json({
      userMessage: message,
      aiResponse,
      conversationId,
    });
  } catch (error: any) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ message: 'Failed to process message', error: error.message });
  }
});

router.post('/chatbot/booking-intent', isAuthenticated, async (req: any, res) => {
  try {
    const validated = validatePatchBody(req, res, chatbotBookingIntentSchema);
    if (!validated.ok) return;

    const intent = await extractBookingIntent(validated.data.message);
    res.json(intent);
  } catch (error: any) {
    console.error('Error extracting booking intent:', error);
    res.status(500).json({ message: 'Failed to extract intent', error: error.message });
  }
});

router.post('/chatbot/diagnose', isAuthenticated, async (req: any, res) => {
  try {
    const validated = validatePatchBody(req, res, chatbotDiagnoseSchema);
    if (!validated.ok) return;

    let vehicleInfo;
    if (validated.data.vehicleId) {
      const vehicle = await storage.getVehicle(validated.data.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      if (vehicle.garageId !== req.user?.garageId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      vehicleInfo = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage ?? undefined,
      };
    }

    const diagnosis = await diagnoseProblem(validated.data.symptoms, vehicleInfo);
    res.json(diagnosis);
  } catch (error: any) {
    console.error('Error diagnosing problem:', error);
    res.status(500).json({ message: 'Failed to diagnose problem', error: error.message });
  }
});

router.get('/chatbot/conversations', isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { customerId, status } = req.query;

    const conversations = await storage.getAIChatConversations(
      userGarageId,
      customerId as string,
      status as string
    );

    res.json(conversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

export default router;
