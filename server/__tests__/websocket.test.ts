import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import type { Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { createTestApp } from "./setup";
import WebSocket from "ws";
import { ChatWebSocketServer } from "../websocket";

let app: Express;
let server: Server;
let port: number;
let openSockets: WebSocket[] = [];

/**
 * Helper: create a WebSocket connected to our test server, track it for cleanup.
 */
function connectWS(path = "/ws/chat"): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}${path}`);
    openSockets.push(ws);
    ws.on("open", () => resolve(ws));
    ws.on("error", (err) => reject(err));
    setTimeout(() => reject(new Error("WS connect timeout")), 5000);
  });
}

/**
 * Helper: wait for the next message on a WebSocket (parsed JSON).
 */
function waitForMessage(ws: WebSocket, timeoutMs = 3000): Promise<any> {
  return new Promise((resolve) => {
    const onMsg = (data: Buffer) => {
      clearTimeout(timer);
      ws.off("message", onMsg);
      resolve(JSON.parse(data.toString()));
    };
    const timer = setTimeout(() => {
      ws.off("message", onMsg);
      resolve(null);
    }, timeoutMs);
    ws.on("message", onMsg);
  });
}

/**
 * Helper: collect messages until timeout or socket close.
 */
function collectMessages(ws: WebSocket, timeoutMs = 2000): Promise<any[]> {
  return new Promise((resolve) => {
    const messages: any[] = [];
    const onMsg = (data: Buffer) => {
      messages.push(JSON.parse(data.toString()));
    };
    ws.on("message", onMsg);
    const done = () => {
      ws.off("message", onMsg);
      ws.off("close", done);
      clearTimeout(timer);
      resolve(messages);
    };
    ws.on("close", done);
    const timer = setTimeout(done, timeoutMs);
  });
}

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;

  // Create a dedicated HTTP server for WebSocket testing.
  // We instantiate ChatWebSocketServer directly (not via initializeChatWebSocket)
  // to avoid the module-level singleton, which may already be bound to a different server.
  server = createServer(app);
  new ChatWebSocketServer(server);

  // Start server on a random available port
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      port = typeof addr === "object" && addr ? addr.port : 0;
      resolve();
    });
  });
});

afterEach(() => {
  // Close any WebSockets opened during the test
  for (const ws of openSockets) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
  openSockets = [];
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe("WebSocket - Chat Server", () => {
  it("should accept WebSocket connections on /ws/chat", async () => {
    const ws = await connectWS();
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  it("should respond to ping messages with pong", async () => {
    const ws = await connectWS();
    ws.send(JSON.stringify({ type: "ping" }));

    const response = await waitForMessage(ws);
    expect(response).toBeTruthy();
    expect(response.type).toBe("pong");
  });

  it("should reject typing indicator without auth", async () => {
    const ws = await connectWS();
    ws.send(
      JSON.stringify({
        type: "typing",
        data: { conversationId: "test", isTyping: true },
      })
    );

    const response = await waitForMessage(ws);
    expect(response).toBeTruthy();
    expect(response.type).toBe("error");
    expect(response.data.message).toBe("Not authenticated");
  });

  it("should reject presence update without auth", async () => {
    const ws = await connectWS();
    ws.send(
      JSON.stringify({ type: "presence", data: { status: "online" } })
    );

    const response = await waitForMessage(ws);
    expect(response).toBeTruthy();
    expect(response.type).toBe("error");
    expect(response.data.message).toBe("Not authenticated");
  });

  it("should handle invalid JSON gracefully", async () => {
    const ws = await connectWS();
    ws.send("not valid json {{{");

    const response = await waitForMessage(ws);
    expect(response).toBeTruthy();
    expect(response.type).toBe("error");
  });

  it("should reject call-center join without auth", async () => {
    const ws = await connectWS();

    // Collect all messages — handleJoinCallCenter sends error then closes the socket
    const messagesPromise = collectMessages(ws, 3000);
    ws.send(JSON.stringify({ type: "join-call-center" }));

    const messages = await messagesPromise;

    const errorMsg = messages.find((r) => r.type === "error");
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.data.message).toBe("Not authenticated");
  });
});
