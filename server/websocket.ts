import { WebSocketServer, WebSocket } from 'ws';
import type { Server, IncomingMessage } from 'http';
import { parse as parseCookie } from 'cookie';
import type { SessionStore } from 'express-session';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  garageId?: string;
  isAlive?: boolean;
}

interface SessionData {
  passport?: {
    user: string;
  };
  cookie: any;
}

interface WebSocketMessage {
  type: string;
  data: any;
}

export class ChatWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws/chat' });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      console.log('New WebSocket connection');

      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as AuthenticatedWebSocket;
        
        if (client.isAlive === false) {
          this.removeClient(client);
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'auth':
        this.handleAuth(ws, message.data);
        break;
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;
      case 'typing':
        this.handleTypingIndicator(ws, message.data);
        break;
      case 'presence':
        this.handlePresenceUpdate(ws, message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private async handleTypingIndicator(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    // Validate payload structure
    if (!data || typeof data !== 'object' || !data.conversationId || typeof data.isTyping !== 'boolean') {
      this.sendError(ws, 'Invalid typing indicator payload');
      return;
    }

    const { conversationId, isTyping } = data;

    // Derive participant IDs server-side from conversation membership
    // This prevents clients from spoofing participant lists
    try {
      const { storage } = await import('./storage');
      const participants = await storage.getChatParticipants(conversationId);
      
      if (!participants.find(p => p.userId === ws.userId)) {
        this.sendError(ws, 'Not a participant of this conversation');
        return;
      }

      const participantIds = participants.map(p => p.userId);
      this.notifyTyping(conversationId, ws.userId, isTyping, participantIds);
    } catch (error) {
      console.error('Error handling typing indicator:', error);
      this.sendError(ws, 'Failed to process typing indicator');
    }
  }

  private handlePresenceUpdate(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    // Validate payload structure and status value
    if (!data || typeof data !== 'object' || !data.status) {
      this.sendError(ws, 'Invalid presence update payload');
      return;
    }

    // Whitelist valid presence statuses
    const validStatuses = ['online', 'away', 'busy', 'offline'];
    if (!validStatuses.includes(data.status)) {
      this.sendError(ws, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      return;
    }

    const payload = {
      type: 'presence_update',
      data: {
        userId: ws.userId,
        status: data.status,
        timestamp: Date.now(),
      },
    };

    // Broadcast presence only to users in the same garage (server-side scoped)
    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.garageId === ws.garageId && authClient !== ws && authClient.userId) {
        this.send(authClient, payload);
      }
    });
  }

  private async handleAuth(ws: AuthenticatedWebSocket, data: { sessionId?: string; userId?: string; garageId?: string }) {
    // ⚠️ SECURITY WARNING - DEVELOPMENT MODE ONLY ⚠️
    // 
    // This WebSocket authentication method is NOT suitable for production use.
    // It validates that userId/garageId exist in the database but does NOT verify 
    // the caller's actual identity, allowing user impersonation attacks.
    //
    // PRODUCTION REQUIREMENTS:
    // 1. Implement session-based or JWT authentication
    // 2. Derive userId/garageId from verified session/token on server-side
    // 3. Never trust client-supplied identity claims
    // 
    // IMPLEMENTATION GUIDE FOR PRODUCTION:
    // - Pass HTTP session cookie or JWT in WebSocket connection URL/headers
    // - Verify session/token signature server-side
    // - Extract userId/garageId from verified session data
    // - Reject connections with invalid/expired sessions
    //
    // Example production flow:
    //   const sessionId = extractSessionFromWsRequest(req);
    //   const session = await verifySession(sessionId);
    //   if (!session || session.isExpired()) return reject();
    //   ws.userId = session.userId;  // Derived from verified session
    //   ws.garageId = session.garageId;  // Not from client claim
    
    try {
      let userId: string;
      let garageId: string;

      if (data.sessionId) {
        // Production path: verify session and derive user info
        const { storage } = await import('./storage');
        // TODO: Implement session verification
        // const session = await storage.getSessionById(data.sessionId);
        // if (!session || session.isExpired()) {
        //   this.sendError(ws, 'Invalid or expired session');
        //   return;
        // }
        // userId = session.userId;
        // garageId = session.garageId;
        this.sendError(ws, 'Session-based auth not yet implemented');
        return;
      } else if (data.userId && data.garageId) {
        // ⚠️ DEVELOPMENT ONLY: Validates user exists but doesn't verify caller identity
        const { storage } = await import('./storage');
        const user = await storage.getUser(data.userId);
        
        if (!user || user.garageId !== data.garageId) {
          this.sendError(ws, 'Invalid user credentials');
          return;
        }
        
        userId = data.userId;
        garageId = data.garageId;
      } else {
        this.sendError(ws, 'Authentication requires either sessionId or userId+garageId');
        return;
      }

      // Set authenticated user info
      ws.userId = userId;
      ws.garageId = garageId;

      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      this.send(ws, { type: 'auth_success', data: { userId, garageId } });
      console.log(`User ${userId} authenticated via WebSocket`);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      this.sendError(ws, 'Authentication failed');
    }
  }

  private removeClient(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }
  }

  private send(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.send(ws, { type: 'error', data: { message: error } });
  }

  public broadcastNewMessage(conversationId: string, message: any, participantIds: string[]) {
    const payload = {
      type: 'new_message',
      data: {
        conversationId,
        message,
      },
    };

    participantIds.forEach(userId => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        userClients.forEach(ws => {
          this.send(ws, payload);
        });
      }
    });
  }

  public broadcastMessageUpdate(messageId: string, message: any, participantIds: string[]) {
    const payload = {
      type: 'message_updated',
      data: {
        messageId,
        message,
      },
    };

    participantIds.forEach(userId => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        userClients.forEach(ws => {
          this.send(ws, payload);
        });
      }
    });
  }

  public broadcastMessageDelete(messageId: string, conversationId: string, participantIds: string[]) {
    const payload = {
      type: 'message_deleted',
      data: {
        messageId,
        conversationId,
      },
    };

    participantIds.forEach(userId => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        userClients.forEach(ws => {
          this.send(ws, payload);
        });
      }
    });
  }

  public notifyTyping(conversationId: string, userId: string, isTyping: boolean, participantIds: string[]) {
    const payload = {
      type: 'typing',
      data: {
        conversationId,
        userId,
        isTyping,
      },
    };

    participantIds.forEach(participantId => {
      if (participantId !== userId) {
        const userClients = this.clients.get(participantId);
        if (userClients) {
          userClients.forEach(ws => {
            this.send(ws, payload);
          });
        }
      }
    });
  }

  public getConnectedUserCount(userId: string): number {
    const userClients = this.clients.get(userId);
    return userClients ? userClients.size : 0;
  }

  public isUserOnline(userId: string): boolean {
    return this.clients.has(userId) && this.clients.get(userId)!.size > 0;
  }
}

let chatWebSocketServer: ChatWebSocketServer | null = null;

export function initializeChatWebSocket(server: Server): ChatWebSocketServer {
  if (!chatWebSocketServer) {
    chatWebSocketServer = new ChatWebSocketServer(server);
  }
  return chatWebSocketServer;
}

export function getChatWebSocketServer(): ChatWebSocketServer | null {
  return chatWebSocketServer;
}
