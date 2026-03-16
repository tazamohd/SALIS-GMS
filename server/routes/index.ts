import { Express } from "express";
import { Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { setupAuth } from "../auth";
import { authRoutes } from "./auth";
import publicRoutes from "./public";
import healthRouter from "./health";
import commandCenterRouter from "./command-center";
import workflowRouter from "./workflow";
import aiInsightsRouter from "./ai-insights";
import financialRouter from "./financial";
import workflowHooksRouter from "./workflow-hooks";
import saudiRouter from "./saudi";
import iotRouter from "./iot";
import customerPortalRouter from "./customer-portal";
import franchiseRouter from "./franchise";
import { generateCsrfToken, validateCsrfToken } from "../middleware/csrf";
import { registerRoutes as registerLegacyRoutes, markAuthInitialized } from "../routes";

// Import domain-based route modules
import { technicianRoutes } from "./technicians.routes";
import { jobCardsRoutes } from "./jobcards.routes";
import { customerRoutes } from "./customers.routes";
import { vehicleRoutes } from "./vehicles.routes";
import { inventoryRoutes } from "./inventory.routes";
import { invoiceRoutes } from "./invoices.routes";
import { schedulingRoutes } from "./scheduling.routes";
import { fleetRoutes } from "./fleet.routes";
import { reportsRoutes } from "./reports.routes";
import { settingsRoutes } from "./settings.routes";
import { miscRoutes } from "./misc.routes";
import technicianMobileRouter from "./technician-mobile";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔄 Initializing Hybrid Router...");

  // Health check endpoints (no auth required)
  app.use(healthRouter);
  console.log("✅ Health Check Routes Loaded");

  // Serve static public directory for landing page assets
  const publicPath = path.join(process.cwd(), "public");
  if (fs.existsSync(publicPath)) {
    app.use("/public", express.static(publicPath));
  }

  // Public API routes (no auth required) - mounted at /api/public
  app.use("/api/public", publicRoutes);
  console.log("✅ Public API Routes Loaded");

  // Serve landing page for bots/crawlers at /landing (SSR endpoint)
  app.get("/landing", (req, res) => {
    const htmlPath = path.join(process.cwd(), "public", "index.html");
    if (fs.existsSync(htmlPath)) {
      res.setHeader("Content-Type", "text/html");
      res.sendFile(htmlPath);
    } else {
      res.status(404).send("Landing page not found");
    }
  });

  // SSR middleware for bots on root - runs before Vite takes over
  app.use((req, res, next) => {
    if (req.path !== "/" && req.path !== "") {
      return next();
    }

    const userAgent = req.headers["user-agent"] || "";
    const isBot = /bot|crawl|spider|scrape|gptbot|chatgpt|anthropic|claude|perplexity|bingbot|googlebot|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot/i.test(userAgent);
    const forceSSR = req.query.ssr === "true";

    // Serve static HTML for bots only
    if (isBot || forceSSR) {
      const htmlPath = path.join(process.cwd(), "public", "index.html");
      if (fs.existsSync(htmlPath)) {
        res.setHeader("Content-Type", "text/html");
        res.setHeader("X-Robots-Tag", "index, follow");
        return res.sendFile(htmlPath);
      }
    }
    next();
  });

  // Set up authentication middleware first (session, passport)
  await setupAuth(app);
  markAuthInitialized();
  console.log("✅ Auth Middleware Initialized");

  // CSRF protection (after auth so session is available)
  app.get("/api/csrf-token", generateCsrfToken);
  app.use("/api", validateCsrfToken);
  console.log("✅ CSRF Protection Enabled");

  // Load new modular routes with priority
  app.use("/api", authRoutes);
  console.log("✅ Auth Module Loaded");

  // Command Center, Workflow Engine & AI Intelligence routes
  app.use("/api", commandCenterRouter);
  app.use("/api", workflowRouter);
  app.use("/api", aiInsightsRouter);
  app.use("/api", financialRouter);
  app.use("/api", workflowHooksRouter);
  app.use("/api", saudiRouter);
  app.use("/api", iotRouter);
  console.log("✅ Command Center, Workflow Engine, AI Intelligence, Financial, Workflow Hooks, Saudi Compliance & IoT Loaded");

  // Load domain-based route modules
  app.use("/api", technicianRoutes);
  console.log("✅ Technician Management Routes Loaded");

  app.use("/api", jobCardsRoutes);
  console.log("✅ Job Cards Routes Loaded");

  app.use("/api", customerRoutes);
  console.log("✅ Customer Management Routes Loaded");

  app.use("/api", vehicleRoutes);
  console.log("✅ Vehicle Management Routes Loaded");

  app.use("/api", inventoryRoutes);
  console.log("✅ Inventory Management Routes Loaded");

  app.use("/api", invoiceRoutes);
  console.log("✅ Invoice & Payment Routes Loaded");

  app.use("/api", schedulingRoutes);
  console.log("✅ Scheduling & Appointments Routes Loaded");

  app.use("/api", fleetRoutes);
  console.log("✅ Fleet Management Routes Loaded");

  app.use("/api", reportsRoutes);
  console.log("✅ Reports & Analytics Routes Loaded");

  app.use("/api", settingsRoutes);
  console.log("✅ Settings & Configuration Routes Loaded");

  app.use("/api", miscRoutes);
  console.log("✅ Miscellaneous Routes Loaded");

  app.use("/api", customerPortalRouter);
  console.log("✅ Customer Portal Self-Service Routes Loaded");

  app.use("/api", franchiseRouter);
  console.log("✅ Franchise Management Routes Loaded");

  app.use("/api", technicianMobileRouter);
  console.log("✅ Technician Mobile App Routes Loaded");

  // Load legacy routes (they will skip setupAuth since it's already done)
  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");

  return server;
}
