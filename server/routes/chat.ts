import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { getChatWebSocketServer } from "../websocket";

const router = Router();

// ---------------------------------------------------------------------------
// Chat Conversations
// ---------------------------------------------------------------------------

router.get("/chat/conversations", isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || "default-user";
    const conversations = await storage.getChatConversations(userGarageId, userId);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

router.get("/chat/conversations/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const conversation = await storage.getChatConversation(id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
});

router.post("/chat/conversations", isAuthenticated, async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || "default-user";
    const { title, type, participantIds } = req.body;

    const conversation = await storage.createChatConversation({
      garageId: userGarageId,
      title,
      type: type || "direct",
      createdBy: userId,
    });

    // Add creator as participant
    await storage.addChatParticipant({
      conversationId: conversation.id,
      userId,
      role: "admin",
    });

    // Add other participants
    if (participantIds && Array.isArray(participantIds)) {
      for (const participantId of participantIds) {
        if (participantId !== userId) {
          await storage.addChatParticipant({
            conversationId: conversation.id,
            userId: participantId,
            role: "member",
          });
        }
      }
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
});

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------

router.get("/chat/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const messages = await storage.getChatMessages(
      id,
      limit ? parseInt(limit as string) : 100
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

router.post("/chat/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "default-user";
    const { content, messageType, replyToId, attachments } = req.body;

    const message = await storage.createChatMessage({
      conversationId: id,
      senderId: userId,
      content,
      messageType: messageType || "text",
      replyToId,
      attachments,
    });

    // Broadcast message to all participants via WebSocket
    const participants = await storage.getChatParticipants(id);
    const participantIds = participants.map(p => p.userId);

    const wsServer = getChatWebSocketServer();
    if (wsServer) {
      wsServer.broadcastNewMessage(id, message, participantIds);
    }

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.patch("/chat/messages/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await storage.updateChatMessage(id, { content });
    res.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Failed to update message" });
  }
});

router.delete("/chat/messages/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteChatMessage(id);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

// ---------------------------------------------------------------------------
// Chat Participants
// ---------------------------------------------------------------------------

router.get("/chat/conversations/:id/participants", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const participants = await storage.getChatParticipants(id);
    res.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

router.post("/chat/conversations/:id/participants", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    const participant = await storage.addChatParticipant({
      conversationId: id,
      userId,
      role: role || "member",
    });

    res.json(participant);
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ message: "Failed to add participant" });
  }
});

router.post("/chat/conversations/:id/read", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "default-user";

    await storage.markMessagesAsRead(id, userId);
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
});

router.get("/chat/unread-count", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || "default-user";
    const { conversationId } = req.query;

    const count = await storage.getUnreadMessageCount(
      userId,
      conversationId as string | undefined
    );

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
});

// ---------------------------------------------------------------------------
// Chat Attachments
// ---------------------------------------------------------------------------

router.post("/chat/messages/:id/attachments", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "default-user";
    const { fileName, fileUrl, fileSize, fileType, thumbnailUrl } = req.body;

    // Validate required fields
    if (!fileName || !fileUrl || !fileSize || !fileType) {
      return res.status(400).json({ message: "Missing required fields: fileName, fileUrl, fileSize, fileType" });
    }

    // Validate file size (max 50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
    if (fileSize > maxFileSize) {
      return res.status(400).json({ message: "File size exceeds maximum limit of 50MB" });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain", "text/csv",
      "video/mp4", "video/quicktime",
      "application/zip"
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        message: "File type not allowed. Supported types: images, PDF, documents, videos, and ZIP files"
      });
    }

    const attachment = await storage.createChatAttachment({
      messageId: id,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      thumbnailUrl,
      uploadedBy: userId,
    });

    res.json(attachment);
  } catch (error) {
    console.error("Error creating attachment:", error);
    res.status(500).json({ message: "Failed to create attachment" });
  }
});

router.get("/chat/messages/:id/attachments", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const attachments = await storage.getChatAttachments(id);
    res.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.status(500).json({ message: "Failed to fetch attachments" });
  }
});

router.delete("/chat/attachments/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteChatAttachment(id);
    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
});

// ---------------------------------------------------------------------------
// Chat Reactions
// ---------------------------------------------------------------------------

router.post("/chat/messages/:id/reactions", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "default-user";
    const { reaction } = req.body;

    if (!reaction) {
      return res.status(400).json({ message: "Reaction is required" });
    }

    const reactionObj = await storage.addMessageReaction({
      messageId: id,
      userId,
      reaction,
    });

    // Broadcast reaction via WebSocket
    const message = await storage.getChatMessage(id);
    if (message) {
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        const participants = await storage.getChatParticipants(message.conversationId);
        const participantIds = participants.map(p => p.userId);
        wsServer.broadcastNewMessage(message.conversationId, {
          type: "message_reaction_added",
          messageId: id,
          userId,
          reaction,
        } as any, participantIds);
      }
    }

    res.json(reactionObj);
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Failed to add reaction" });
  }
});

router.delete("/chat/messages/:id/reactions", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || "default-user";

    await storage.removeMessageReaction(id, userId);

    // Broadcast reaction removal via WebSocket
    const message = await storage.getChatMessage(id);
    if (message) {
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        const participants = await storage.getChatParticipants(message.conversationId);
        const participantIds = participants.map(p => p.userId);
        wsServer.broadcastNewMessage(message.conversationId, {
          type: "message_reaction_removed",
          messageId: id,
          userId,
        } as any, participantIds);
      }
    }

    res.json({ message: "Reaction removed successfully" });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({ message: "Failed to remove reaction" });
  }
});

router.get("/chat/messages/:id/reactions", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const reactions = await storage.getMessageReactions(id);
    res.json(reactions);
  } catch (error) {
    console.error("Error fetching reactions:", error);
    res.status(500).json({ message: "Failed to fetch reactions" });
  }
});

export const chatRoutes = router;
