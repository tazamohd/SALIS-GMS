import { Express } from "express";
import { Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { setupAuth } from "../auth";
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
import qualityControlRoutes from "./quality-control";
import warrantyRoutes from "./warranty";
import kioskRoutes from "./kiosk";
import estimatesRoutes from "./estimates";
import fleetManagementRoutes from "./fleet";
import whatsappRoutes from "./whatsapp";
import smsCampaignRoutes from "./sms-campaigns";
import documentRoutes from "./documents";
import supplierPortalRoutes from "./supplier-portal";
import currencyRoutes from "./currency";
import apiDocsRoutes from "./api-docs";
import backupRoutes from "./backup";
import exportRoutes from "./export";
import healthRoutes from "./health";
import { customerRoutes } from "./customers.routes";
import { schedulingRoutes } from "./scheduling.routes";
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

  // Marketing Hub routes
  app.use("/api", marketingRoutes);
  console.log("✅ Marketing Hub Routes Loaded");

  // CRM & Loyalty Program routes
  app.use("/api", crmRoutes);
  console.log("✅ CRM & Loyalty Routes Loaded");

  // HR & Payroll routes
  app.use("/api", hrPayrollRoutes);
  console.log("✅ HR & Payroll Routes Loaded");

  // Inventory & Supply Chain Management routes
  app.use("/api", inventoryManagementRoutes);
  console.log("✅ Inventory Management Routes Loaded");

  // Dashboard aggregation routes
  app.use("/api", dashboardRoutes);
  console.log("✅ Dashboard Routes Loaded");

  // Quality Control & Inspections routes
  app.use("/api/qc", qualityControlRoutes);
  console.log("✅ Quality Control Routes Loaded");

  // Warranty & Service Contracts routes
  app.use("/api", warrantyRoutes);
  console.log("✅ Warranty & Service Contracts Routes Loaded");

  // Self-Service Kiosk routes
  app.use("/api", kioskRoutes);
  console.log("✅ Self-Service Kiosk Routes Loaded");

  // Estimates & Quotations routes
  app.use("/api", estimatesRoutes);
  console.log("✅ Estimates & Quotations Routes Loaded");

  // Fleet Management routes
  app.use("/api", fleetManagementRoutes);
  console.log("✅ Fleet Management Routes Loaded");

  // WhatsApp Business Integration routes
  app.use("/api", whatsappRoutes);
  console.log("✅ WhatsApp Business Routes Loaded");

  // SMS Campaign Management routes
  app.use("/api", smsCampaignRoutes);
  console.log("✅ SMS Campaign Routes Loaded");

  // Document Management routes
  app.use("/api", documentRoutes);
  console.log("✅ Document Management Routes Loaded");

  // Supplier Portal routes
  app.use("/api", supplierPortalRoutes);
  console.log("✅ Supplier Portal Routes Loaded");

  // Multi-Currency Management routes
  app.use("/api", currencyRoutes);
  console.log("✅ Multi-Currency Routes Loaded");

  // API Documentation routes
  app.use("/api", apiDocsRoutes);
  console.log("✅ API Documentation Routes Loaded");

  // Data Backup routes
  app.use("/api", backupRoutes);
  console.log("✅ Data Backup Routes Loaded");

  // Data Export routes
  app.use("/api", exportRoutes);
  console.log("✅ Data Export Routes Loaded");

  // Core domain routes (extracted from monolith)
  app.use("/api", customerRoutes);
  console.log("✅ Customer Routes Loaded");

  app.use("/api", schedulingRoutes);
  console.log("✅ Scheduling Routes Loaded");

  // Load legacy routes (they will skip setupAuth since it's already done)
  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");
  
  return server;
}
