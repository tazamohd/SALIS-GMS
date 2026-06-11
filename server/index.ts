// Validate environment variables on startup (fails fast if required vars missing)
import "./config";
// Sentry error tracking (no-op unless SENTRY_DSN is set). Imported right after
// config so dotenv has populated the env.
import { sentryEnabled, Sentry } from "./instrument";

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { initializeChatWebSocket } from "./websocket";
import { initializeEngine } from "./engine";
import rateLimit from "express-rate-limit";
import { requestId } from "./middleware/requestId";

const app = express();
app.use(requestId);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Security headers via helmet — replaces hand-rolled X-*-Options below and
// adds a CSP. The CSP allows the Vite HMR client and inline styles needed by
// Tailwind utilities; production tightens this further by serving pre-built
// static assets without HMR. `unsafe-inline` for style-src is unavoidable
// while we ship Tailwind class-based styling without nonce extraction.
const isProd = process.env.NODE_ENV === 'production';
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'wasm-unsafe-eval'", ...(isProd ? [] : ["'unsafe-inline'", "'unsafe-eval'"])],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      // Sentry browser SDK posts events to *.sentry.io; allow it so the client
      // error tracker isn't blocked by CSP when VITE_SENTRY_DSN is configured.
      connectSrc: ["'self'", "https://*.sentry.io", ...(isProd ? [] : ["ws:", "wss:", "http://localhost:*"])],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // breaks Vite asset loading in dev
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Permissions-Policy is not yet set by helmet's defaults in the way we want
app.use((_req, res, next) => {
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
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

  // Load VAT/GOSI rates from the DB into the in-process cache (fail-soft).
  void import("./services/tax-config").then((m) => m.loadTaxConfig()).catch(() => {});

  // Sentry Express error handler — must be registered after routes and before
  // our own error middleware. No-op unless SENTRY_DSN was set.
  if (sentryEnabled) {
    try { Sentry.setupExpressErrorHandler(app); } catch (e) { console.error("Sentry express handler setup failed", e); }
  }

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    // Surface the request-id in both the log line and the response body so a
    // user-reported 500 can be located in server logs by a single grep.
    const requestId = (req as any).requestId || req.headers["x-request-id"] || "no-rid";
    console.error(`[ERROR] [rid=${requestId}] ${status} - ${err.message}`, isDev ? err.stack : '');
    const body: { message: string; requestId?: string } = {
      message: status >= 500
        ? (isDev ? err.message : "Internal Server Error")
        : (err.message || "Request Error"),
      requestId: String(requestId),
    };
    res.status(status).json(body);
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
