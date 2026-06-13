// Validate environment variables on startup (fails fast if required vars missing)
import "./config";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { initializeChatWebSocket } from "./websocket";
import { initializeEngine } from "./engine";
import rateLimit from "express-rate-limit";
import { requestId } from "./middleware/requestId";

const app = express();
app.use(requestId);
// Capture the raw request body so the Stripe webhook can verify its signature
// (signature verification needs the exact bytes, not the re-serialized JSON).
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Strict auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
// Cover the modular auth + customer-portal login entry points too, so they
// aren't left with only the looser global limiter.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/customer-portal/login', authLimiter);

// Response bodies for auth/security/payment endpoints can contain user
// objects, tokens, 2FA secrets, etc. — never echo them to the logs.
const SENSITIVE_LOG_PATHS = [
  "/api/login",
  "/api/register",
  "/api/auth",
  "/api/customer-portal/login",
  "/api/security",
  "/api/stripe",
  "/paypal",
];

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const isSensitive = SENSITIVE_LOG_PATHS.some((p) => path.startsWith(p));

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    if (!isSensitive) {
      capturedJsonResponse = bodyJson;
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Initialize WebSocket server for real-time chat
  initializeChatWebSocket(server);
  log("WebSocket server initialized");

  // Initialize Workflow Engine (state machines, event bus, cross-module triggers)
  initializeEngine();
  log("Workflow Engine initialized");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    console.error(`[ERROR] ${status} - ${err.message}`, isDev ? err.stack : '');
    if (status >= 500) {
      res.status(status).json({ message: isDev ? err.message : "Internal Server Error" });
    } else {
      res.status(status).json({ message: err.message || "Request Error" });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
