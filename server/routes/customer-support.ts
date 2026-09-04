// @ts-nocheck
/**
 * Customer self-service, support, and communication routes — extracted from the monolith (routes.ts).
 *
 * Covers:
 *   /api/customer/appointments             (GET)
 *   /api/customer/invoices                 (GET)
 *   /api/customer/vehicles                 (GET)
 *   /api/customer/job-cards                (GET)
 *   /api/customer/communications           (GET)
 *   /api/customer/book-appointment         (POST)
 *   /api/customer/profile                  (GET)
 *
 *   /api/support/tickets                   (GET, POST)
 *   /api/support/tickets/:id              (GET)
 *   /api/support/tickets/:id/status       (PATCH)
 *   /api/support/tickets/:id/assign       (POST)
 *   /api/support/tickets/:id/events       (GET)
 *
 *   /api/chatbot/conversation              (POST)
 *   /api/chatbot/message                   (POST)
 *   /api/chatbot/booking-intent            (POST)
 *   /api/chatbot/diagnose                  (POST)
 *   /api/chatbot/conversations             (GET)
 *
 *   /api/reviews                           (GET, POST)
 *   /api/reviews/:id/respond              (POST)
 *
 *   /api/customer-reviews                  (GET)
 *   /api/customer-reviews/:id/respond     (POST)
 *
 *   /api/referrals                         (GET, POST)
 *   /api/referrals/generate-code           (POST)
 *   /api/referrals/apply                   (POST)
 *   /api/referrals/analytics               (GET)
 *
 *   /api/email/campaigns                   (POST)
 *   /api/email/campaigns/:id/send         (POST)
 *   /api/email/campaigns/:id/track        (POST)
 *
 *   /api/push-subscriptions                (GET, POST)
 *   /api/push-subscriptions/:id           (DELETE)
 *
 *   /api/push-notifications                (GET, POST)
 *   /api/push-notifications/unread-count  (GET)
 *   /api/push-notifications/:id/read      (PATCH)
 *   /api/push-notifications/:id/clicked   (PATCH)
 *   /api/push-notifications/:id/send      (POST)
 *
 *   /api/notification-preferences          (GET, POST, PUT)
 *
 *   /api/customers/:customerId/service-reminders   (GET, POST)
 *   /api/customers/:customerId/reviews             (GET, POST)
 *   /api/customers/:customerId/signatures          (GET, POST)
 *
 *   /api/customer-portal/login             (POST)
 *   /api/customer-portal/logout            (POST)
 *   /api/customer-portal/me                (GET)
 *   /api/customer-portal/appointments      (GET)
 *   /api/customer-portal/vehicles          (GET)
 *   /api/customer-portal/service-history   (GET)
 *   /api/customer-portal/estimates         (GET)
 *   /api/customer-portal/estimates/:id/approve (POST)
 *   /api/customer-portal/invoices          (GET)
 *   /api/customer-portal/payments          (GET)
 */
import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";
import { getChatWebSocketServer } from "../websocket";
import * as phase3Service from "../phase3-integrations-service";
import * as phase4Service from "../phase4-customer-experience-service";

const router = Router();

// Helper function to sanitize Zod validation errors
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// Validation schemas for reviews & referrals
const customerReviewSchema = z.object({
  customerId: z.string(),
  jobCardId: z.string().optional(),
  platform: z.enum(['google', 'facebook', 'yelp', 'internal']),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  reviewUrl: z.string().url().optional(),
});

const reviewResponseSchema = z.object({
  response: z.string().min(1),
});

const generateReferralCodeSchema = z.object({
  customerId: z.string(),
});

const applyReferralCodeSchema = z.object({
  referralCode: z.string(),
  newCustomerId: z.string(),
});

// ==================== Notification Preferences (Module 24) ====================

router.get('/notification-preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const preferences = await storage.getNotificationPreferencesSimple(userId);
    res.json(preferences || { userId, eventMap: '{}', channel: 'all', isLockedByAdmin: false });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ message: "Failed to fetch notification preferences" });
  }
});

router.post('/notification-preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { eventMap } = req.body;
    const preferences = await storage.upsertNotificationPreferencesSimple(userId, eventMap);
    res.json(preferences);
  } catch (error) {
    console.error("Error saving notification preferences:", error);
    res.status(500).json({ message: "Failed to save notification preferences" });
  }
});

router.put('/notification-preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const prefs = await storage.upsertNotificationPreferences({ ...req.body, userId });
    res.json(prefs);
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== Customer Self-Service (Module 25) ====================

router.get('/customer/appointments', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const appointments = await storage.getCustomerAppointments(userId);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.get('/customer/invoices', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const invoices = await storage.getCustomerInvoices(userId);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

router.get('/customer/vehicles', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const vehicles = await storage.getCustomerVehicles(userId);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

router.get('/customer/job-cards', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const jobCards = await storage.getCustomerJobCards(userId);
    res.json(jobCards);
  } catch (error) {
    console.error("Error fetching customer job cards:", error);
    res.status(500).json({ message: "Failed to fetch service history" });
  }
});

router.get('/customer/communications', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const communications = await storage.getCustomerNotes(userId);
    res.json(communications);
  } catch (error) {
    console.error("Error fetching customer communications:", error);
    res.status(500).json({ message: "Failed to fetch communications" });
  }
});

router.post('/customer/book-appointment', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { insertAppointmentSchema } = await import("@shared/schema");
    const validatedData = insertAppointmentSchema.parse(req.body);

    // Ensure customerId is set to logged-in user
    const appointmentData = {
      ...validatedData,
      customerId: userId,
      createdBy: userId,
      status: 'scheduled'
    };

    const appointment = await storage.createAppointment(appointmentData);
    res.json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Failed to book appointment" });
  }
});

router.get('/customer/profile', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const user = await storage.getUser(userId);
    const profile = await storage.getCustomerProfile(userId);
    res.json({ ...user, profile });
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ==================== Support Tickets ====================

router.get('/support/tickets', isAuthenticated, async (req: any, res) => {
  try {
    const { status, priority, assignedTo, category, garageId } = req.query;
    // Use garageId from query or user context, with fallback for dev mode
    const userGarageId = req.user?.garageId || garageId;

    const tickets = await storage.getSupportTickets(userGarageId, {
      status: status as string,
      priority: priority as string,
      assignedTo: assignedTo as string,
      category: category as string,
    });

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ message: "Failed to fetch support tickets" });
  }
});

router.get('/support/tickets/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const ticket = await storage.getSupportTicket(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

router.post('/support/tickets', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const {
      conversationId,
      category,
      priority,
      subject,
      createConversation,
      participantIds,
      garageId
    } = req.body;
    // Use garageId from request body as fallback for development mode
    const userGarageId = req.user?.garageId || garageId || 1;

    // Validate required fields
    if (!subject || !category) {
      return res.status(400).json({ message: "Subject and category are required" });
    }

    // Validate conversation source - must provide either existing conversationId or createConversation flag
    if (!conversationId && !createConversation) {
      return res.status(400).json({
        message: "Either conversationId or createConversation must be provided"
      });
    }

    // Validate category and priority values
    const validCategories = ['technical', 'billing', 'general', 'feature_request'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }

    let finalConversationId = conversationId;

    // Create new conversation if needed
    if (createConversation && !conversationId) {
      const conversation = await storage.createChatConversation({
        garageId: userGarageId,
        title: subject,
        type: 'support',
        createdBy: userId,
      });

      // Add creator as participant
      await storage.addChatParticipant({
        conversationId: conversation.id,
        userId,
        role: 'member',
      });

      // Add other participants (support agents)
      if (participantIds && Array.isArray(participantIds)) {
        for (const participantId of participantIds) {
          if (participantId !== userId) {
            await storage.addChatParticipant({
              conversationId: conversation.id,
              userId: participantId,
              role: 'admin',
            });
          }
        }
      }

      finalConversationId = conversation.id;
    }

    // Create support ticket
    const ticket = await storage.createSupportTicket({
      garageId: userGarageId,
      conversationId: finalConversationId!,
      category,
      priority: priority || 'medium',
      subject,
      status: 'open',
      createdBy: userId,
    });

    res.json(ticket);
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ message: "Failed to create support ticket" });
  }
});

router.patch('/support/tickets/:id/status', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';
    const { status, notes } = req.body;

    // Validate status value
    const validStatuses = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const ticket = await storage.updateTicketStatus(id, status, userId, notes);

    // Broadcast status change via WebSocket
    const wsServer = getChatWebSocketServer();
    if (wsServer && ticket.conversationId) {
      const participants = await storage.getChatParticipants(ticket.conversationId);
      const participantIds = participants.map(p => p.userId);
      wsServer.broadcastNewMessage(ticket.conversationId, {
        type: 'ticket_status_changed',
        ticketId: id,
        status,
        updatedBy: userId,
      } as any, participantIds);
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

router.post('/support/tickets/:id/assign', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';
    const { assignTo } = req.body;

    const ticket = await storage.assignTicket(id, assignTo, userId);

    // Broadcast assignment via WebSocket
    const wsServer = getChatWebSocketServer();
    if (wsServer && ticket.conversationId) {
      const participants = await storage.getChatParticipants(ticket.conversationId);
      const participantIds = participants.map(p => p.userId);
      wsServer.broadcastNewMessage(ticket.conversationId, {
        type: 'ticket_assigned',
        ticketId: id,
        assignedTo: assignTo,
        assignedBy: userId,
      } as any, participantIds);
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error assigning ticket:", error);
    res.status(500).json({ message: "Failed to assign ticket" });
  }
});

router.get('/support/tickets/:id/events', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const events = await storage.getSupportTicketEvents(id);
    res.json(events);
  } catch (error) {
    console.error("Error fetching ticket events:", error);
    res.status(500).json({ message: "Failed to fetch ticket events" });
  }
});

// ==================== Customer Self-Service Portal (Module 37) ====================

// Portal auth middleware
const portalAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers['x-portal-token'];
    if (!token) {
      return res.status(401).json({ message: "Portal token required" });
    }

    const session = await storage.validatePortalSession(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await storage.getUser(session.customerId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.portalUser = user;
    next();
  } catch (error) {
    console.error("Portal auth error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

router.post('/customer-portal/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user || user.userType !== 'customer') {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { comparePassword } = await import("../auth");
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const session = await storage.createPortalSession(user.id);

    res.json({
      token: session.token,
      customer: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error("Error logging in to customer portal:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.post('/customer-portal/logout', async (req, res) => {
  try {
    const token = req.headers['x-portal-token'];
    if (token) {
      await storage.revokePortalSession(token as string);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

router.get('/customer-portal/me', portalAuth, async (req: any, res) => {
  try {
    res.json(req.portalUser);
  } catch (error) {
    console.error("Error fetching portal user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.get('/customer-portal/appointments', portalAuth, async (req: any, res) => {
  try {
    const customerId = req.portalUser.id;
    const appointments = await storage.getCustomerAppointments(customerId);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.get('/customer-portal/vehicles', portalAuth, async (req: any, res) => {
  try {
    const customerId = req.portalUser.id;
    const vehicles = await storage.getCustomerVehicles(customerId);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

router.get('/customer-portal/service-history', portalAuth, async (req: any, res) => {
  try {
    const customerId = req.portalUser.id;
    const { vehicleId } = req.query;
    const history = await storage.getCustomerServiceHistory(
      customerId,
      vehicleId as string | undefined
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching service history:", error);
    res.status(500).json({ message: "Failed to fetch service history" });
  }
});

router.get('/customer-portal/estimates', portalAuth, async (req: any, res) => {
  try {
    const customerId = req.portalUser.id;
    const { status } = req.query;
    const estimates = await storage.getCustomerEstimates(
      customerId,
      status as string | undefined
    );
    res.json(estimates);
  } catch (error) {
    console.error("Error fetching estimates:", error);
    res.status(500).json({ message: "Failed to fetch estimates" });
  }
});

router.post('/customer-portal/estimates/:id/approve', portalAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const customerId = req.portalUser.id;
    const estimate = await storage.approveEstimate(id, customerId);
    res.json(estimate);
  } catch (error: any) {
    console.error("Error approving estimate:", error);
    res.status(error.message?.includes('unauthorized') ? 403 : 500)
      .json({ message: error.message || "Failed to approve estimate" });
  }
});

router.get('/customer-portal/invoices', portalAuth, async (req: any, res) => {
  try {
    const customerId = req.portalUser.id;
    const invoices = await storage.getCustomerInvoices(customerId);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

router.get('/customer-portal/payments', portalAuth, async (req: any, res) => {
  try {
    const customerId = req.portalUser.id;
    const payments = await storage.getCustomerPayments(customerId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

// ==================== Email Marketing Campaigns ====================

router.post('/email/campaigns', isAuthenticated, async (req: any, res) => {
  try {
    const { campaignName, subject, content, recipientSegment, scheduledFor } = req.body;
    const campaign = await phase3Service.createEmailCampaign({
      garageId: req.user?.garageId,
      campaignName,
      subject,
      content,
      recipientSegment,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    });
    res.status(201).json(campaign);
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ message: error.message || "Failed to create campaign" });
  }
});

router.post('/email/campaigns/:id/send', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const result = await phase3Service.sendEmailCampaign(id);
    res.json(result);
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    res.status(500).json({ message: error.message || "Failed to send campaign" });
  }
});

router.post('/email/campaigns/:id/track', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const result = await phase3Service.trackEmailEngagement(id, action);
    res.json(result);
  } catch (error: any) {
    console.error("Error tracking engagement:", error);
    res.status(500).json({ message: error.message || "Failed to track engagement" });
  }
});

// ==================== Customer Reviews (legacy stub) ====================

router.get('/customer-reviews', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    res.json([]);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post('/customer-reviews/:id/respond', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || 'default-user';
    const { responseText } = req.body;

    res.json({
      success: true,
      responseText,
      respondedBy: userId,
      respondedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error responding to review:", error);
    res.status(500).json({ message: "Failed to respond to review" });
  }
});

// ==================== Referrals (legacy stub) ====================

router.get('/referrals', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    res.json([]);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
});

router.post('/referrals', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';
    const { refereeEmail, refereeName, refereePhone } = req.body;

    const referral = {
      id: Math.random().toString(36).substring(7),
      referrerId: userId,
      refereeEmail,
      refereeName,
      refereePhone,
      referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    res.json(referral);
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ message: "Failed to create referral" });
  }
});

// ==================== Reviews (Phase 4) ====================

router.post('/reviews', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = customerReviewSchema.parse(req.body);

    const reviewData = {
      garageId,
      customerId: validated.customerId,
      jobCardId: validated.jobCardId,
      platform: validated.platform,
      rating: validated.rating,
      reviewText: validated.reviewText,
      reviewUrl: validated.reviewUrl,
    };
    const review = await phase4Service.postCustomerReview(reviewData);
    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error posting customer review:", error);
    res.status(500).json({ message: "Failed to post customer review" });
  }
});

router.get('/reviews', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { platform } = req.query;
    const reviews = await phase4Service.getReviewsByPlatform(garageId, platform as string);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post('/reviews/:id/respond', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default-user';

    const validated = reviewResponseSchema.parse(req.body);

    const review = await phase4Service.respondToReview(id, validated.response, userId);
    res.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error responding to review:", error);
    res.status(500).json({ message: "Failed to respond to review" });
  }
});

// ==================== Referral Program (Phase 4) ====================

router.post('/referrals/generate-code', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = generateReferralCodeSchema.parse(req.body);

    const code = await phase4Service.generateReferralCode(garageId, validated.customerId);
    res.json({ code });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error generating referral code:", error);
    res.status(500).json({ message: "Failed to generate referral code" });
  }
});

router.post('/referrals/apply', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    const validated = applyReferralCodeSchema.parse(req.body);

    const result = await phase4Service.applyReferralCode(garageId, validated.referralCode, validated.newCustomerId);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    console.error("Error applying referral code:", error);
    res.status(500).json({ message: "Failed to apply referral code" });
  }
});

router.get('/referrals/analytics', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const analytics = await phase4Service.getReferralAnalytics(garageId);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching referral analytics:", error);
    res.status(500).json({ message: "Failed to fetch referral analytics" });
  }
});

// ==================== Customer-Scoped Routes (Client Portal) ====================

router.get('/customers/:customerId/service-reminders', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const reminders = await storage.getCustomerServiceReminders(customerId);
    res.json(reminders);
  } catch (error: any) {
    console.error("Error fetching service reminders:", error);
    res.status(500).json({ message: "Failed to fetch service reminders" });
  }
});

router.post('/customers/:customerId/service-reminders', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { insertServiceReminderSchema } = await import("@shared/schema");
    const validationResult = insertServiceReminderSchema.safeParse({
      ...req.body,
      customerId,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error)
      });
    }

    const reminder = await storage.createServiceReminder(validationResult.data);
    res.status(201).json(reminder);
  } catch (error: any) {
    console.error("Error creating service reminder:", error);
    res.status(500).json({ message: "Failed to create service reminder" });
  }
});

router.get('/customers/:customerId/reviews', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const reviews = await storage.getCustomerServiceReviews(customerId);
    res.json(reviews);
  } catch (error: any) {
    console.error("Error fetching service reviews:", error);
    res.status(500).json({ message: "Failed to fetch service reviews" });
  }
});

router.post('/customers/:customerId/reviews', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { insertServiceReviewSchema } = await import("@shared/schema");
    const validationResult = insertServiceReviewSchema.safeParse({
      ...req.body,
      customerId,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error)
      });
    }

    const review = await storage.createServiceReview(validationResult.data);
    res.status(201).json(review);
  } catch (error: any) {
    console.error("Error creating service review:", error);
    res.status(500).json({ message: "Failed to create service review" });
  }
});

router.get('/customers/:customerId/signatures', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const signatures = await storage.getCustomerServiceSignatures(customerId);
    res.json(signatures);
  } catch (error: any) {
    console.error("Error fetching service signatures:", error);
    res.status(500).json({ message: "Failed to fetch service signatures" });
  }
});

router.post('/customers/:customerId/signatures', isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { insertServiceSignatureSchema } = await import("@shared/schema");
    const validationResult = insertServiceSignatureSchema.safeParse({
      ...req.body,
      customerId,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        ...sanitizeZodError(validationResult.error)
      });
    }

    const signature = await storage.createServiceSignature(validationResult.data);
    res.status(201).json(signature);
  } catch (error: any) {
    console.error("Error creating service signature:", error);
    res.status(500).json({ message: "Failed to create service signature" });
  }
});

// ==================== AI-Powered Chatbot ====================

router.post('/chatbot/conversation', isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { customerId, sessionId } = req.body;

    // Create new conversation
    const conversation = await storage.createAIChatConversation({
      garageId: userGarageId,
      customerId: customerId || req.user?.id,
      sessionId: sessionId || `session-${Date.now()}`,
      messages: [],
      status: 'active',
    });

    res.json(conversation);
  } catch (error: any) {
    console.error("Error creating chatbot conversation:", error);
    res.status(500).json({ message: "Failed to create conversation", error: error.message });
  }
});

router.post('/chatbot/message', isAuthenticated, async (req: any, res) => {
  try {
    const { conversationId, message, vehicleInfo } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({ message: "Message and conversationId required" });
    }

    // Get conversation
    const conversation = await storage.getAIChatConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Import chatbot service
    const { generateChatbotResponse } = await import('../services/aiChatbot');

    // Generate AI response
    const aiResponse = await generateChatbotResponse({
      garageId: conversation.garageId,
      customerId: conversation.customerId,
      vehicleInfo,
      conversationHistory: conversation.messages || [],
    }, message);

    // Update conversation with new messages
    const updatedMessages = [
      ...(conversation.messages || []),
      { role: "user", content: message },
      { role: "assistant", content: aiResponse },
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
    console.error("Error processing chatbot message:", error);
    res.status(500).json({ message: "Failed to process message", error: error.message });
  }
});

router.post('/chatbot/booking-intent', isAuthenticated, async (req: any, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const { extractBookingIntent } = await import('../services/aiChatbot');
    const intent = await extractBookingIntent(message);

    res.json(intent);
  } catch (error: any) {
    console.error("Error extracting booking intent:", error);
    res.status(500).json({ message: "Failed to extract intent", error: error.message });
  }
});

router.post('/chatbot/diagnose', isAuthenticated, async (req: any, res) => {
  try {
    const { symptoms, vehicleInfo } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Symptoms required" });
    }

    const { diagnoseProblem } = await import('../services/aiChatbot');
    const diagnosis = await diagnoseProblem(symptoms, vehicleInfo);

    res.json(diagnosis);
  } catch (error: any) {
    console.error("Error diagnosing problem:", error);
    res.status(500).json({ message: "Failed to diagnose problem", error: error.message });
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
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

// ==================== Push Subscriptions ====================

router.get('/push-subscriptions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const subscriptions = await storage.getPushSubscriptions(userId);
    res.json(subscriptions);
  } catch (error: any) {
    console.error("Error fetching push subscriptions:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/push-subscriptions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { endpoint, p256dh, auth, deviceType, deviceName, browserInfo } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: "Endpoint is required" });
    }

    const subscription = await storage.createPushSubscription({
      userId,
      endpoint,
      p256dh,
      auth,
      deviceType,
      deviceName,
      browserInfo,
    });
    res.status(201).json(subscription);
  } catch (error: any) {
    console.error("Error creating push subscription:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/push-subscriptions/:id', isAuthenticated, async (req, res) => {
  try {
    await storage.deletePushSubscription(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting push subscription:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== Push Notifications ====================

router.get('/push-notifications', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { status, type } = req.query;
    const notifications = await storage.getPushNotifications({
      userId,
      status: status as string,
      type: type as string
    });
    res.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/push-notifications/unread-count', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const count = await storage.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/push-notifications', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { title, body, notificationType, userId, customerId, priority, data, relatedEntityType, relatedEntityId } = req.body;

    if (!title || !body || !notificationType) {
      return res.status(400).json({ message: "Title, body, and notification type are required" });
    }

    const notification = await storage.createPushNotification({
      garageId,
      userId,
      customerId,
      title,
      body,
      notificationType,
      priority: priority || 'normal',
      data,
      relatedEntityType,
      relatedEntityId,
    });
    res.status(201).json(notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/push-notifications/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notification = await storage.markPushNotificationAsRead(req.params.id);
    res.json(notification);
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/push-notifications/:id/clicked', isAuthenticated, async (req, res) => {
  try {
    const notification = await storage.markNotificationAsClicked(req.params.id);
    res.json(notification);
  } catch (error: any) {
    console.error("Error marking notification as clicked:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/push-notifications/:id/send', isAuthenticated, async (req, res) => {
  try {
    const notification = await storage.sendPushNotification(req.params.id);
    res.json(notification);
  } catch (error: any) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
