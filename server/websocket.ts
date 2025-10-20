import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  garageId?: string;
  isAlive?: boolean;
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
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleAuth(ws: AuthenticatedWebSocket, data: { userId: string; garageId: string }) {
    const { userId, garageId } = data;
    
    if (!userId || !garageId) {
      this.sendError(ws, 'Invalid authentication data');
      return;
    }

    ws.userId = userId;
    ws.garageId = garageId;

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);

    this.send(ws, { type: 'auth_success', data: { userId, garageId } });
    console.log(`User ${userId} authenticated`);
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
