import { WebSocketServer, WebSocket } from 'ws';
import type { Server, IncomingMessage } from 'http';
import { parse as parseCookie } from 'cookie';
import { unsign } from 'cookie-signature';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  garageId?: string;
  isAlive?: boolean;
  req?: IncomingMessage;
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
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      console.log('New WebSocket connection');

      ws.isAlive = true;
      ws.req = req; // Store upgrade request for session validation

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
      case 'join-call-center':
        this.handleJoinCallCenter(ws);
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

  private async handleAuth(ws: AuthenticatedWebSocket, data: any) {
    try {
      // Extract session cookie from WebSocket upgrade request
      if (!ws.req || !ws.req.headers.cookie) {
        this.sendError(ws, 'No session cookie found');
        console.log('WebSocket auth failed: No cookie header');
        ws.close(4001, 'Authentication required');
        return;
      }

      const cookies = parseCookie(ws.req.headers.cookie);
      const sessionCookie = cookies['connect.sid'];
      
      if (!sessionCookie) {
        this.sendError(ws, 'No session ID found in cookies');
        console.log('WebSocket auth failed: No connect.sid cookie');
        ws.close(4001, 'Authentication required');
        return;
      }

      // Unsign and validate the session cookie
      const sessionSecret = process.env.SESSION_SECRET;
      if (!sessionSecret) {
        console.error('SESSION_SECRET not configured');
        this.sendError(ws, 'Server configuration error');
        ws.close(4002, 'Server error');
        return;
      }

      // Unsign the cookie (format is "s:sessionId.signature")
      let sessionId: string | false;
      if (sessionCookie.startsWith('s:')) {
        const cookieValue = sessionCookie.slice(2); // Remove 's:' prefix
        sessionId = unsign(cookieValue, sessionSecret);
      } else {
        sessionId = unsign(sessionCookie, sessionSecret);
      }

      if (sessionId === false) {
        this.sendError(ws, 'Invalid session signature');
        console.log('WebSocket auth failed: Cookie signature invalid');
        ws.close(4003, 'Invalid session');
        return;
      }

      console.log(`Validating session: ${sessionId.substring(0, 8)}...`);

      // Query session from database using pool.query for raw SQL
      const { pool } = await import('./db');
      const sessionData = await pool.query(
        `SELECT sess FROM sessions WHERE sid = $1 AND expire > NOW()`,
        [sessionId]
      );

      if (!sessionData.rows || sessionData.rows.length === 0) {
        this.sendError(ws, 'Invalid or expired session');
        console.log('WebSocket auth failed: Session not found or expired');
        ws.close(4003, 'Invalid session');
        return;
      }

      const session = sessionData.rows[0].sess as any;
      
      // Extract user ID from Passport session
      if (!session.passport || !session.passport.user) {
        this.sendError(ws, 'No user in session');
        console.log('WebSocket auth failed: No passport user in session');
        ws.close(4004, 'Invalid session data');
        return;
      }

      const userId = session.passport.user;
      console.log(`Session validated for user: ${userId}`);

      // Get user from storage to derive garageId
      const { storage } = await import('./storage');
      const user = await storage.getUser(userId);

      if (!user || !user.isActive || !user.garageId) {
        this.sendError(ws, 'User not found, inactive, or missing garage');
        console.log(`WebSocket auth failed: User ${userId} invalid state`);
        ws.close(4005, 'User invalid');
        return;
      }

      // Set authenticated user info (server-derived, never from client)
      ws.userId = user.id;
      ws.garageId = user.garageId; // Now guaranteed to be non-null

      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(ws);

      this.send(ws, { type: 'auth_success', data: { userId: user.id, garageId: user.garageId } });
      console.log(`✅ User ${user.id} authenticated via WebSocket (session-based)`);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      this.sendError(ws, 'Authentication failed');
      ws.close(4000, 'Authentication failed');
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

  public broadcastNotification(userId: string, notification: any) {
    const payload = {
      type: 'notification',
      notification,
    };

    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(ws => {
        this.send(ws, payload);
      });
    }
  }

  public broadcastNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.broadcastNotification(userId, notification);
    });
  }

  private handleJoinCallCenter(ws: AuthenticatedWebSocket) {
    if (!ws.userId || !ws.garageId) {
      this.sendError(ws, 'Not authenticated');
      console.log('Call-center join rejected: not authenticated');
      ws.close(4003, 'Not authenticated');
      return;
    }
    
    this.send(ws, { 
      type: 'call-center.joined', 
      data: { garageId: ws.garageId } 
    });
    console.log(`User ${ws.userId} joined call-center for garage ${ws.garageId}`);
  }

  public broadcastCallSessionUpdate(garageId: string, session: any) {
    const payload = {
      type: 'call-center.session.updated',
      data: { session },
    };
    
    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.garageId === garageId && authClient.userId) {
        this.send(authClient, payload);
      }
    });
  }

  public broadcastCallQueueUpdate(garageId: string, queue: any) {
    const payload = {
      type: 'call-center.queue.updated',
      data: { queue },
    };
    
    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.garageId === garageId && authClient.userId) {
        this.send(authClient, payload);
      }
    });
  }

  public broadcastSupportChatMessage(garageId: string, conversationId: string, message: any, participantIds: string[]) {
    const payload = {
      type: 'support_chat.new_message',
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

    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.garageId === garageId && authClient.userId) {
        this.send(authClient, payload);
      }
    });
  }

  public broadcastSupportTicketUpdate(garageId: string, ticket: any) {
    const payload = {
      type: 'support_chat.ticket_updated',
      data: { ticket },
    };
    
    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.garageId === garageId && authClient.userId) {
        this.send(authClient, payload);
      }
    });
  }

  public broadcastNewSupportTicket(garageId: string, ticket: any) {
    const payload = {
      type: 'support_chat.new_ticket',
      data: { ticket },
    };
    
    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.garageId === garageId && authClient.userId) {
        this.send(authClient, payload);
      }
    });
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
