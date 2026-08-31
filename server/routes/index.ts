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
// estimatesRoutes (./estimates) intentionally NOT imported: its in-memory `demoEstimates`
// store shadowed the monolith's DB-backed /api/estimates CRUD (routes.ts:4418+). The
// monolith handler serves now; if a modular replacement is wanted, mount
// `./estimates.routes.ts` (DB-backed) instead of `./estimates`.
import fleetManagementRoutes from "./fleet";
import whatsappRoutes from "./whatsapp";
import smsCampaignRoutes from "./sms-campaigns";
import documentRoutes from "./documents";
// supplierPortalRoutes (./supplier-portal) intentionally NOT imported: its in-memory
// demoSuppliers/demoPurchaseOrders shadowed the monolith's DB-backed /api/suppliers
// CRUD (routes.ts:2648+). Re-mount only after the modular file uses storage.*.
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
// miscRoutes (./misc.routes) intentionally NOT imported: its handlers are all TODO
// stubs returning empty arrays/messages, shadowing real monolith handlers for
// /api/search, /api/tools, /api/service-templates, /api/notifications, /api/backup.

// Routes for the 8 completed "half-real" pages (mobile devices, smart contracts,
// AI repair guide, AI predictions, perf analytics, demand forecasting,
// productivity tracker, OBD diagnostic viewer).
import { mobileDevicesRoutes } from "./mobile-devices";
import { smartContractsRoutes } from "./smart-contracts";
import { aiRepairGuideRoutes } from "./ai-repair-guide";
import { aiPredictionsRoutes } from "./ai-predictions";
import { analyticsPerformanceRoutes } from "./analytics-performance";
import { forecastingDemandRoutes } from "./forecasting-demand";
import { productivityRoutes } from "./productivity";
import { obdDiagnosticsRoutes } from "./obd-diagnostics";
import { subscriptionsRoutes } from "./subscriptions";
import { bankAccountRoutes } from "./bank-accounts";
import { lossEntryRoutes } from "./loss-entries";
import { jobCardInvoiceRoutes } from "./job-card-invoice";
import { towingRoutes } from "./towing";
import { loanerVehicleRoutes } from "./loaner-vehicles";
import { localizationRoutes } from "./localization";
import { serviceTemplateRoutes } from "./service-templates";
import { discountRoutes } from "./discounts";
import { purchaseOrderRoutes } from "./purchase-orders";
import { catalogRoutes } from "./catalogs";
import { refundRoutes } from "./refunds";
import { inspectionRoutes } from "./inspections";
import { paymentRoutes } from "./payments";
import { callCenterRoutes } from "./call-center";
import { securityRoutes } from "./security";
import { chatRoutes } from "./chat";
import { dynamicPricingRoutes } from "./dynamic-pricing";
import { feedbackRoutes } from "./feedback";
import { complianceRoutes } from "./compliance";
import { emergingTechRoutes } from "./emerging-tech";
import { aiEngineRoutes } from "./ai-engine";
import { nextgenRoutes } from "./nextgen";
import { mobileApiRoutes } from "./mobile-api";
import { notificationsLegacyRoutes } from "./notifications-legacy";
import { integrationsRoutes } from "./integrations";
import { platformAdminRoutes } from "./platform-admin";
import { customerPortalApiRoutes } from "./customer-portal-api";
import iotRoutes from "./iot";
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

  // Estimates routes intentionally NOT mounted here — see import block comment.
  // Monolith serves /api/estimates with DB-backed CRUD (routes.ts:4418+).

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

  // Supplier Portal routes intentionally NOT mounted — see import block comment.
  // Monolith serves /api/suppliers, /api/supplier-price-lists, /api/supplier-performance
  // with DB-backed CRUD (routes.ts:2648+).

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

  // Feature Flags routes
  app.use("/api", featureFlagRoutes);
  console.log("✅ Feature Flags Routes Loaded");

  // Core domain routes (extracted from monolith)
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

  // Completed half-real page endpoints
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
  app.use("/api", bankAccountRoutes);
  console.log("✅ Bank Account Routes Loaded");
  app.use("/api", lossEntryRoutes);
  console.log("✅ Loss Entry Routes Loaded");
  app.use("/api", jobCardInvoiceRoutes);
  console.log("✅ Job Card → Invoice Routes Loaded");
  app.use("/api", towingRoutes);
  console.log("✅ Towing Routes Loaded");
  app.use("/api", loanerVehicleRoutes);
  console.log("✅ Loaner Vehicle Routes Loaded");
  app.use("/api", localizationRoutes);
  console.log("✅ Localization Routes Loaded");
  app.use("/api", serviceTemplateRoutes);
  console.log("✅ Service Template Routes Loaded");
  app.use("/api", discountRoutes);
  console.log("✅ Discount Routes Loaded");
  app.use("/api", purchaseOrderRoutes);
  console.log("✅ Purchase Order Routes Loaded");
  app.use("/api", catalogRoutes);
  console.log("✅ Catalog Routes Loaded");
  app.use("/api", refundRoutes);
  console.log("✅ Refund Routes Loaded");
  app.use("/api", inspectionRoutes);
  console.log("✅ Inspection Routes Loaded");
  app.use("/api", paymentRoutes);
  console.log("✅ Payment Routes Loaded");
  app.use("/api", callCenterRoutes);
  console.log("✅ Call Center Routes Loaded");
  app.use("/api", securityRoutes);
  console.log("✅ Security Routes Loaded");
  app.use("/api", chatRoutes);
  console.log("✅ Chat Routes Loaded");
  app.use("/api", dynamicPricingRoutes);
  console.log("✅ Dynamic Pricing Routes Loaded");
  app.use("/api", feedbackRoutes);
  console.log("✅ Feedback Routes Loaded");
  app.use("/api", complianceRoutes);
  console.log("✅ Compliance Routes Loaded");
  app.use("/api", emergingTechRoutes);
  console.log("✅ Emerging Tech Routes Loaded");
  app.use("/api", aiEngineRoutes);
  console.log("✅ AI Engine Routes Loaded");
  app.use("/api", nextgenRoutes);
  console.log("✅ Nextgen Routes Loaded");
  app.use("/api", mobileApiRoutes);
  console.log("✅ Mobile API Routes Loaded");
  app.use("/api", notificationsLegacyRoutes);
  console.log("✅ Notifications Legacy Routes Loaded");
  app.use("/api", integrationsRoutes);
  console.log("✅ Integrations Routes Loaded");
  app.use("/api", platformAdminRoutes);
  console.log("✅ Platform Admin Routes Loaded");
  app.use("/api", customerPortalApiRoutes);
  console.log("✅ Customer Portal API Routes Loaded");
  app.use("/api", iotRoutes);
  console.log("✅ IoT Routes Loaded");

  // Misc TODO-stub routes intentionally NOT mounted — see import block comment.

  // Load legacy routes (they will skip setupAuth since it's already done)
  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");
  
  return server;
}
