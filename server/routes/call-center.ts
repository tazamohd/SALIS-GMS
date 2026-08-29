import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Helper function to sanitize Zod validation errors for production
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

// Rate limiter for Call Center endpoints (100 req/15min per IP)
const callCenterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------------
// Call Queues
// ---------------------------------------------------------------------------

// GET /api/call-center/queues
router.get(
  "/call-center/queues",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const userGarageId = (req as any).user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { active } = req.query;
      const queues = await storage.listCallQueues(
        userGarageId,
        active === "true" ? true : active === "false" ? false : undefined
      );
      res.json(queues);
    } catch (error) {
      console.error("Error fetching call queues:", error);
      res.status(500).json({ message: "Failed to fetch call queues" });
    }
  }
);

// POST /api/call-center/queues
router.post(
  "/call-center/queues",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertCallQueueSchema } = await import("@shared/schema");
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const validationResult = insertCallQueueSchema.safeParse({
        ...req.body,
        garageId: userGarageId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const queue = await storage.createCallQueue(validationResult.data);

      const { getChatWebSocketServer } = await import("../websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer && userGarageId) {
        wsServer.broadcastCallQueueUpdate(userGarageId, queue);
      }

      res.status(201).json(queue);
    } catch (error) {
      console.error("Error creating call queue:", error);
      res.status(500).json({ message: "Failed to create call queue" });
    }
  }
);

// GET /api/call-center/queues/:id
router.get(
  "/call-center/queues/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const queue = await storage.getCallQueue(id, userGarageId);
      if (!queue) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      res.json(queue);
    } catch (error) {
      console.error("Error fetching call queue:", error);
      res.status(500).json({ message: "Failed to fetch call queue" });
    }
  }
);

// PATCH /api/call-center/queues/:id
router.patch(
  "/call-center/queues/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { garageId: _, ...safeBody } = req.body;

      const updated = await storage.updateCallQueue(id, userGarageId, safeBody);
      if (!updated) {
        return res.status(404).json({ message: "Call queue not found" });
      }

      const { getChatWebSocketServer } = await import("../websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastCallQueueUpdate(userGarageId, updated);
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating call queue:", error);
      res.status(500).json({ message: "Failed to update call queue" });
    }
  }
);

// DELETE /api/call-center/queues/:id
router.delete(
  "/call-center/queues/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const deleted = await storage.deleteCallQueue(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting call queue:", error);
      res.status(500).json({ message: "Failed to delete call queue" });
    }
  }
);

// GET /api/call-center/queues/:id/with-members
router.get(
  "/call-center/queues/:id/with-members",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const result = await storage.getCallQueueWithMembers(id, userGarageId);
      if (!result) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching queue with members:", error);
      res.status(500).json({ message: "Failed to fetch queue with members" });
    }
  }
);

// ---------------------------------------------------------------------------
// Queue Members
// ---------------------------------------------------------------------------

// POST /api/call-center/queues/:queueId/members
router.post(
  "/call-center/queues/:queueId/members",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertCallQueueMemberSchema } = await import("@shared/schema");
      const { queueId } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const validationResult = insertCallQueueMemberSchema.safeParse({
        ...req.body,
        queueId,
        garageId: userGarageId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const member = await storage.addQueueMember(validationResult.data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding queue member:", error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to add queue member",
      });
    }
  }
);

// GET /api/call-center/queues/:queueId/members
router.get(
  "/call-center/queues/:queueId/members",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { queueId } = req.params;
      const { active } = req.query;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const members = await storage.listQueueMembers(
        queueId,
        userGarageId,
        active === "true" ? true : active === "false" ? false : undefined
      );
      res.json(members);
    } catch (error) {
      console.error("Error fetching queue members:", error);
      res.status(500).json({ message: "Failed to fetch queue members" });
    }
  }
);

// PATCH /api/call-center/queue-members/:id
router.patch(
  "/call-center/queue-members/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { garageId: _, queueId: __, ...safeBody } = req.body;

      const updated = await storage.updateQueueMember(
        id,
        userGarageId,
        safeBody
      );
      if (!updated) {
        return res.status(404).json({ message: "Queue member not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating queue member:", error);
      res.status(500).json({ message: "Failed to update queue member" });
    }
  }
);

// DELETE /api/call-center/queue-members/:id
router.delete(
  "/call-center/queue-members/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const deleted = await storage.removeQueueMember(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Queue member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing queue member:", error);
      res.status(500).json({ message: "Failed to remove queue member" });
    }
  }
);

// ---------------------------------------------------------------------------
// Call Sessions
// ---------------------------------------------------------------------------

// GET /api/call-center/sessions
router.get(
  "/call-center/sessions",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userGarageId = (req as any).user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { status, agent_id, queue_id } = req.query;
      const filters = {
        status: status as string | undefined,
        agentId: agent_id as string | undefined,
        queueId: queue_id as string | undefined,
      };

      const sessions = await storage.listCallSessions(userGarageId, filters);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching call sessions:", error);
      res.status(500).json({ message: "Failed to fetch call sessions" });
    }
  }
);

// POST /api/call-center/sessions
router.post(
  "/call-center/sessions",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertCallSessionSchema } = await import("@shared/schema");
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const validationResult = insertCallSessionSchema.safeParse({
        ...req.body,
        garageId: userGarageId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const session = await storage.createCallSession(validationResult.data);

      const { getChatWebSocketServer } = await import("../websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer && userGarageId) {
        wsServer.broadcastCallSessionUpdate(userGarageId, session);
      }

      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating call session:", error);
      res.status(500).json({ message: "Failed to create call session" });
    }
  }
);

// GET /api/call-center/sessions/:id
router.get(
  "/call-center/sessions/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const session = await storage.getCallSession(id, userGarageId);
      if (!session) {
        return res.status(404).json({ message: "Call session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching call session:", error);
      res.status(500).json({ message: "Failed to fetch call session" });
    }
  }
);

// PATCH /api/call-center/sessions/:id
router.patch(
  "/call-center/sessions/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const {
        garageId: _,
        queueId: __,
        customerId: ___,
        vehicleId: ____,
        assignedAgentId: _____,
        ...safeBody
      } = req.body;

      const updated = await storage.updateCallSession(
        id,
        userGarageId,
        safeBody
      );
      if (!updated) {
        return res.status(404).json({ message: "Call session not found" });
      }

      const { getChatWebSocketServer } = await import("../websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastCallSessionUpdate(userGarageId, updated);
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating call session:", error);
      res.status(500).json({ message: "Failed to update call session" });
    }
  }
);

// POST /api/call-center/sessions/:id/assign
router.post(
  "/call-center/sessions/:id/assign",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;
      const userId = (req as any).user?.id || "default-user";

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { agentId } = req.body;
      if (!agentId) {
        return res.status(400).json({ message: "agentId is required" });
      }

      const session = await storage.assignCallToAgent({
        garageId: userGarageId,
        sessionId: id,
        agentId,
        assignedBy: userId,
      });

      const { getChatWebSocketServer } = await import("../websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastCallSessionUpdate(userGarageId, session);
      }

      res.json(session);
    } catch (error) {
      console.error("Error assigning call to agent:", error);
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to assign call to agent",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Call Notes
// ---------------------------------------------------------------------------

// POST /api/call-center/sessions/:sessionId/notes
router.post(
  "/call-center/sessions/:sessionId/notes",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertCallNoteSchema } = await import("@shared/schema");
      const { sessionId } = req.params;
      const userId = (req as any).user?.id || "default-user";

      const validationResult = insertCallNoteSchema.safeParse({
        ...req.body,
        sessionId,
        authorUserId: userId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const note = await storage.createCallNote(validationResult.data);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating call note:", error);
      res.status(500).json({ message: "Failed to create call note" });
    }
  }
);

// GET /api/call-center/sessions/:sessionId/notes
router.get(
  "/call-center/sessions/:sessionId/notes",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const notes = await storage.listCallNotes(sessionId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching call notes:", error);
      res.status(500).json({ message: "Failed to fetch call notes" });
    }
  }
);

// ---------------------------------------------------------------------------
// Call Recordings
// ---------------------------------------------------------------------------

// POST /api/call-center/sessions/:sessionId/recordings
router.post(
  "/call-center/sessions/:sessionId/recordings",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertCallRecordingSchema } = await import("@shared/schema");
      const { sessionId } = req.params;

      const validationResult = insertCallRecordingSchema.safeParse({
        ...req.body,
        sessionId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const recording = await storage.createCallRecording(
        validationResult.data
      );
      res.status(201).json(recording);
    } catch (error) {
      console.error("Error creating call recording:", error);
      res.status(500).json({ message: "Failed to create call recording" });
    }
  }
);

// GET /api/call-center/sessions/:sessionId/recordings
router.get(
  "/call-center/sessions/:sessionId/recordings",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const recordings = await storage.listCallRecordings(sessionId);
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching call recordings:", error);
      res.status(500).json({ message: "Failed to fetch call recordings" });
    }
  }
);

// ---------------------------------------------------------------------------
// Disposition Codes
// ---------------------------------------------------------------------------

// GET /api/call-center/disposition-codes
router.get(
  "/call-center/disposition-codes",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userGarageId = (req as any).user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { active } = req.query;
      const codes = await storage.listDispositionCodes(
        userGarageId,
        active === "true" ? true : active === "false" ? false : undefined
      );
      res.json(codes);
    } catch (error) {
      console.error("Error fetching disposition codes:", error);
      res.status(500).json({ message: "Failed to fetch disposition codes" });
    }
  }
);

// POST /api/call-center/disposition-codes
router.post(
  "/call-center/disposition-codes",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertCallDispositionCodeSchema } = await import(
        "@shared/schema"
      );
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const validationResult = insertCallDispositionCodeSchema.safeParse({
        ...req.body,
        garageId: userGarageId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const code = await storage.createDispositionCode(validationResult.data);
      res.status(201).json(code);
    } catch (error) {
      console.error("Error creating disposition code:", error);
      res.status(500).json({ message: "Failed to create disposition code" });
    }
  }
);

// PATCH /api/call-center/disposition-codes/:id
router.patch(
  "/call-center/disposition-codes/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { garageId: _, ...safeBody } = req.body;

      const updated = await storage.updateDispositionCode(
        id,
        userGarageId,
        safeBody
      );
      if (!updated) {
        return res
          .status(404)
          .json({ message: "Disposition code not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating disposition code:", error);
      res.status(500).json({ message: "Failed to update disposition code" });
    }
  }
);

// DELETE /api/call-center/disposition-codes/:id
router.delete(
  "/call-center/disposition-codes/:id",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const deleted = await storage.deleteDispositionCode(id, userGarageId);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Disposition code not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting disposition code:", error);
      res.status(500).json({ message: "Failed to delete disposition code" });
    }
  }
);

// ---------------------------------------------------------------------------
// Agent Performance
// ---------------------------------------------------------------------------

// POST /api/call-center/performance
router.post(
  "/call-center/performance",
  isAuthenticated,
  callCenterLimiter,
  async (req: Request, res: Response) => {
    try {
      const { insertAgentPerformanceSnapshotSchema } = await import(
        "@shared/schema"
      );
      const userGarageId = (req as any).user?.garageId;

      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const validationResult = insertAgentPerformanceSnapshotSchema.safeParse({
        ...req.body,
        garageId: userGarageId,
      });

      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const snapshot = await storage.createPerformanceSnapshot(
        validationResult.data
      );
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating performance snapshot:", error);
      res
        .status(500)
        .json({ message: "Failed to create performance snapshot" });
    }
  }
);

// GET /api/call-center/performance
router.get(
  "/call-center/performance",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userGarageId = (req as any).user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { agent_id, start_date, end_date } = req.query;
      let dateRange: { start: Date; end: Date } | undefined;

      if (start_date && end_date) {
        dateRange = {
          start: new Date(start_date as string),
          end: new Date(end_date as string),
        };
      }

      const performance = await storage.listAgentPerformance(
        userGarageId,
        agent_id as string | undefined,
        dateRange
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching agent performance:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch agent performance" });
    }
  }
);

export const callCenterRoutes = router;
