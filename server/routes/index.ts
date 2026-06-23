import { Express } from "express";
import { Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { setupAuth } from "../auth";
import { requireAuthByDefault } from "../middleware/defaultAuth";
import { enforceGarageScopeOnQuery } from "../middleware/garageScope";
import { authRoutes } from "./auth";
import publicRoutes from "./public";
import predictiveMaintenanceRoutes from "./predictive-maintenance";
import partsRecommendationsRoutes from "./parts-recommendations";
import reportsRoutes from "./reports";
import notificationCenterRoutes from "./notifications";
import auditRoutes from "./audit";
import marketingRoutes from "./marketing";
import crmRoutes from "./crm";
import hrPayrollRoutes from "./hr-payroll";
import inventoryManagementRoutes from "./inventory-management";
import dashboardRoutes from "./dashboard";
import demoRoutes from "./demo";
import qualityControlRoutes from "./quality-control";
import warrantyRoutes from "./warranty";
import kioskRoutes from "./kiosk";
import fleetManagementRoutes from "./fleet";
import whatsappRoutes from "./whatsapp";
import smsCampaignRoutes from "./sms-campaigns";
import documentRoutes from "./documents";
import uploadsRoutes from "./uploads";
import currencyRoutes from "./currency";
import apiDocsRoutes from "./api-docs";
import backupRoutes from "./backup";
import exportRoutes from "./export";
import featureFlagRoutes from "./feature-flags";
import healthRoutes from "./health";
import { customerRoutes } from "./customers.routes";
import { schedulingRoutes } from "./scheduling.routes";
import { inventoryRoutes } from "./inventory.routes";
import { technicianRoutes } from "./technicians.routes";
import { vehicleRoutes } from "./vehicles.routes";
import { jobCardsRoutes } from "./jobcards.routes";
import { invoiceRoutes } from "./invoices.routes";
import { settingsRoutes } from "./settings.routes";
import paymentsGatewayRoutes from "./payments-gateway.routes";
import taxConfigRoutes from "./tax-config.routes";
import trainingLmsRoutes from "./training-lms.routes";
import gatePassRoutes from "./gate-pass.routes";
import quickActionsRoutes from "./quick-actions.routes";
import { mobileDevicesRoutes } from "./mobile-devices";
import { smartContractsRoutes } from "./smart-contracts";
import { aiRepairGuideRoutes } from "./ai-repair-guide";
import { aiPredictionsRoutes } from "./ai-predictions";
import { analyticsPerformanceRoutes } from "./analytics-performance";
import { forecastingDemandRoutes } from "./forecasting-demand";
import { productivityRoutes } from "./productivity";
import { obdDiagnosticsRoutes } from "./obd-diagnostics";
import { subscriptionsRoutes } from "./subscriptions";
import { registerRoutes as registerLegacyRoutes, markAuthInitialized } from "../routes";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔄 Initializing Hybrid Router...");

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

  // Health check routes (no auth required, mounted before auth middleware)
  app.use("/api", healthRoutes);
  console.log("✅ Health Check Routes Loaded");

  // Set up authentication middleware first (session, passport)
  await setupAuth(app);
  markAuthInitialized();
  console.log("✅ Auth Middleware Initialized");

  // Default-deny on /api: every route below this line requires an authenticated
  // session unless its path matches the PUBLIC_ROUTES allow-list in
  // server/middleware/defaultAuth.ts. Per-route `isAuthenticated` guards remain
  // as belt-and-braces for routes that compose extra checks (roles, garage scope).
  app.use(requireAuthByDefault);
  console.log("🔒 Default-deny /api auth gate active");

  // Defense-in-depth tenant scoping: pin ?garage_id/?garageId to the caller's
  // own garage for ordinary staff (platform admins + customers exempt), so no
  // legacy handler can be tricked into returning another garage's data.
  app.use(enforceGarageScopeOnQuery);
  console.log("🔒 Garage-scope query guard active");

  // Load new modular routes with priority
  app.use("/api", authRoutes);
  console.log("✅ Auth Module Loaded");

  // Predictive maintenance routes
  app.use("/api", predictiveMaintenanceRoutes);
  console.log("✅ Predictive Maintenance Routes Loaded");

  // Smart Parts Recommendations routes
  app.use("/api", partsRecommendationsRoutes);
  console.log("✅ Parts Recommendations Routes Loaded");

  // Advanced Reports routes
  app.use("/api", reportsRoutes);
  console.log("✅ Advanced Reports Routes Loaded");

  // Notification Center routes
  app.use("/api/notification-center", notificationCenterRoutes);
  console.log("✅ Notification Center Routes Loaded");

  // Audit Trail routes
  app.use("/api", auditRoutes);
  console.log("✅ Audit Trail Routes Loaded");

  app.use("/api", marketingRoutes);
  console.log("✅ Marketing Hub Routes Loaded");

  app.use("/api", crmRoutes);
  console.log("✅ CRM & Loyalty Routes Loaded");

  app.use("/api", hrPayrollRoutes);
  console.log("✅ HR & Payroll Routes Loaded");

  app.use("/api", inventoryManagementRoutes);
  console.log("✅ Inventory Management Routes Loaded");

  app.use("/api", dashboardRoutes);
  console.log("✅ Dashboard Routes Loaded");

  app.use("/api", demoRoutes);
  console.log("✅ Demo Access Routes Loaded");

  app.use("/api/qc", qualityControlRoutes);
  console.log("✅ Quality Control Routes Loaded");

  app.use("/api", warrantyRoutes);
  console.log("✅ Warranty & Service Contracts Routes Loaded");

  app.use("/api", kioskRoutes);
  console.log("✅ Self-Service Kiosk Routes Loaded");

  app.use("/api", fleetManagementRoutes);
  console.log("✅ Fleet Management Routes Loaded");

  app.use("/api", whatsappRoutes);
  console.log("✅ WhatsApp Business Routes Loaded");

  app.use("/api", smsCampaignRoutes);
  console.log("✅ SMS Campaign Routes Loaded");

  app.use("/api", documentRoutes);
  console.log("✅ Document Management Routes Loaded");

  app.use("/api", uploadsRoutes);
  console.log("✅ Uploads Routes Loaded");

  app.use("/api", currencyRoutes);
  console.log("✅ Multi-Currency Routes Loaded");

  app.use("/api", apiDocsRoutes);
  console.log("✅ API Documentation Routes Loaded");

  app.use("/api", backupRoutes);
  console.log("✅ Data Backup Routes Loaded");

  app.use("/api", exportRoutes);
  console.log("✅ Data Export Routes Loaded");

  app.use("/api", featureFlagRoutes);
  console.log("✅ Feature Flags Routes Loaded");

  app.use("/api", customerRoutes);
  console.log("✅ Customer Routes Loaded");

  app.use("/api", schedulingRoutes);
  console.log("✅ Scheduling Routes Loaded");

  app.use("/api", inventoryRoutes);
  console.log("✅ Inventory Routes Loaded");

  app.use("/api", technicianRoutes);
  console.log("✅ Technician Routes Loaded");

  app.use("/api", vehicleRoutes);
  console.log("✅ Vehicle Routes Loaded");

  app.use("/api", jobCardsRoutes);
  console.log("✅ Job Cards Routes Loaded");

  app.use("/api", invoiceRoutes);
  console.log("✅ Invoice Routes Loaded");

  app.use("/api", settingsRoutes);
  console.log("✅ Settings Routes Loaded");

  app.use("/api", paymentsGatewayRoutes);
  console.log("✅ Payment Gateway Routes Loaded");

  app.use("/api", taxConfigRoutes);
  console.log("✅ Tax Config Routes Loaded");

  app.use("/api", trainingLmsRoutes);
  console.log("✅ Training / LMS Routes Loaded");

  app.use("/api", gatePassRoutes);
  console.log("✅ Gate Pass Routes Loaded");

  app.use("/api", quickActionsRoutes);
  console.log("✅ Quick Actions Routes Loaded");

  app.use("/api", mobileDevicesRoutes);
  console.log("✅ Mobile Devices Routes Loaded");
  app.use("/api", smartContractsRoutes);
  console.log("✅ Smart Contracts Routes Loaded");
  app.use("/api", aiRepairGuideRoutes);
  console.log("✅ AI Repair Guide Routes Loaded");
  app.use("/api", aiPredictionsRoutes);
  console.log("✅ AI Predictions Routes Loaded");
  app.use("/api", analyticsPerformanceRoutes);
  console.log("✅ Performance Analytics Routes Loaded");
  app.use("/api", forecastingDemandRoutes);
  console.log("✅ Demand Forecasting Routes Loaded");
  app.use("/api", productivityRoutes);
  console.log("✅ Productivity Routes Loaded");
  app.use("/api", obdDiagnosticsRoutes);
  console.log("✅ OBD Diagnostics Routes Loaded");
  app.use("/api", subscriptionsRoutes);
  console.log("✅ Subscriptions Routes Loaded");

  // Load legacy routes (they will skip setupAuth since it's already done)
  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");
  
  return server;
}
