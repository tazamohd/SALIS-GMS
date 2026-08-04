// Load + validate environment FIRST (dotenv.config lives in ./config). Nothing
// above this import may read process.env for required vars. This also fixes the
// audit finding that config.ts (the only dotenv loader) was imported by no boot
// file, so a .env-based deploy never loaded its variables.
import "./config";
// Sentry (no-op without SENTRY_DSN) — must load before the rest of the app so
// platform-wide errors are captured.
import { sentryEnabled, Sentry } from "./instrument";

if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
}

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { initializeChatWebSocket } from "./websocket";

const app = express();

// Behind a TLS-terminating proxy: trust the first hop so secure cookies work
// and express-rate-limit reads the real client IP (not the proxy's).
app.set("trust proxy", 1);

// Security headers (HSTS, X-Frame-Options, noSniff, etc.). CSP is disabled here
// because the SPA/Vite manage their own asset origins; enabling helmet's default
// CSP would break the client. HSTS only takes effect over HTTPS.
app.use(helmet({ contentSecurityPolicy: false }));

// Brute-force / credential-stuffing protection. Strict limiter on the session-
// creating auth endpoints; generous global limiter as a backstop. Webhooks and
// non-/api paths are exempt (gateway retries, static assets).
// Both limits are env-tunable: a busy garage office shares one NAT IP (so a
// deployment may need RATE_LIMIT_MAX raised), and load tests need it lifted
// without a code change.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many attempts, please try again later." },
});
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX ?? 2000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.startsWith("/api") || req.path.includes("/webhook"),
});
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/customer-portal/login", authLimiter);
app.use(globalLimiter);

// Capture raw body for webhook signature verification (Stripe, etc.)
// We use the `verify` hook to store the raw Buffer before JSON parsing.
app.use(
  express.json({
    verify: (req: any, _res, buf: Buffer) => {
      // Only capture raw body for webhook endpoints (saves memory for other requests)
      if (req.path?.includes('/webhook')) {
        req.rawBody = buf.toString('utf8');
      }
    },
  }),
);
app.use(express.urlencoded({ extended: false, verify: (req: any, _res, buf: Buffer) => {
  if (req.path?.includes('/webhook')) {
    req.rawBody = buf.toString('utf8');
  }
} }));

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
      // Log status + timing only. Response bodies were being serialized here,
      // leaking customer/financial PII into stdout (and truncation corrupted it).
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Initialize WebSocket server for real-time chat
  initializeChatWebSocket(server);
  log("WebSocket server initialized");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error but do NOT re-throw: throwing after the response is sent, in
    // the terminal handler, produced an uncaughtException that could crash the
    // process on ordinary 4xx/5xx.
    if (status >= 500) {
      console.error("Unhandled error:", err);
      if (sentryEnabled) Sentry.captureException(err);
    }
    res.status(status).json({ message });
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
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
