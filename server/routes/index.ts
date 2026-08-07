import { Express } from "express";
import { Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { setupAuth } from "../auth";
import { loadUserPermissions } from "../rbac-middleware";
import { requireAuthByDefault } from "../middleware/defaultAuth";
import { requireStaffByDefault } from "../middleware/requireStaff";
import { enforceGarageScopeOnQuery, enforceTenantOnBody } from "../middleware/garageScope";
import { generateCsrfToken, csrfTokenRoute, enforceCsrf } from "../middleware/csrf";
import { authRoutes } from "./auth";
import publicRoutes from "./public";
import predictiveMaintenanceRoutes from "./predictive-maintenance";
import partsRecommendationsRoutes from "./parts-recommendations";
import reportsRoutes from "./reports";
import notificationCenterRoutes from "./notifications";
import auditRoutes from "./audit";
import chatbotRoutes from "./chatbot";
import systemRoutes from "./system";
import searchRoutes from "./search";
import garageRoutes from "../modules/garage";
import technicianRoutes from "./technicians";
import vinRoutes from "./vin";
import catalogRoutes from "./catalogs";
import serviceTemplateRoutes from "./service-templates";
import sparePartRoutes from "../modules/inventory";
import appointmentRoutes from "../modules/appointments";
import toolRoutes from "./tools";
import supplierRoutes from "../modules/suppliers";
import customerRoutes from "../modules/customers";
import serviceChatRoutes from "./service-chat";
import jobCardRoutes from "../modules/jobcards";
import estimateRoutes from "../modules/estimates";
import invoiceRoutes from "../modules/invoices";
import paymentRoutes from "../modules/payments";
import serviceBayRoutes from "./service-bays";
import gamificationRoutes from "./gamification";
import dashboardRoutes from "./dashboard";
import dashboardWidgetRoutes from "./dashboard-widgets";
import assignmentRoutes from "./assignments";
import availabilityRoutes from "./availability";
import recurringAppointmentRoutes from "./recurring-appointments";
import calendarEventRoutes from "./calendar-events";
import knowledgeBaseRoutes from "./knowledge-base";
import gmbRoutes from "./gmb";
import trainingRoutes from "./training";
import supportTicketRoutes from "./support-tickets";
import vehicleTrackingRoutes from "./vehicle-tracking";
import lprRoutes from "./lpr";
import serviceReminderRoutes from "./service-reminders";
import serviceReminderTemplateRoutes from "./service-reminder-templates";
import pushSubscriptionRoutes from "./push-subscriptions";
import pushNotificationRoutes from "./push-notifications";
import vehicleRoutes from "../modules/vehicles";
import purchaseOrderRoutes from "../modules/procurement";
import quotationRoutes from "./quotations";
import supplierPaymentRoutes from "./supplier-payments";
import schedulingRoutes from "./scheduling";
import aiInsightsRoutes from "./ai-insights";
import apiDocsRoutes from "./api-docs";
import autoReorderRoutes from './auto-reorder';
import commandCenterRoutes from "./command-center";
import crmRoutes from "../modules/crm";
import customerPortalRoutes from "./customer-portal";
import docsRoutes from "./docs";
import exportRoutes from "./export";
import featureFlagRoutes from "./feature-flags";
import financialRoutes from "./financial";
import franchiseRoutes from "./franchise";
import saudiRoutes from "./saudi";
import smsCampaignRoutes from "./sms-campaigns";
import { subscriptionsRoutes } from "./subscriptions";
import supplierPortalRoutes from "./supplier-portal";
import warrantyRoutes from "./warranty";
import whatsappRoutes from "./whatsapp";
import backupRoutes from "./backup";
import currencyRoutes from "./currency";
import demoRoutes from "./demo";
import documentsRoutes from "./documents";
import fleetAccountRoutes from "./fleet";
import gatePassRoutes from "./gate-pass.routes";
import gmbSyncRoutes from "./gmb-sync.routes";
import hrPayrollRoutes from "./hr-payroll";
import kioskRoutes from "./kiosk";
import paymentsGatewayRoutes from "./payments-gateway.routes";
import qualityControlRoutes from "./quality-control";
import quickActionsRoutes from "./quick-actions.routes";
import taxConfigRoutes from "./tax-config.routes";
import trainingLmsRoutes from "./training-lms.routes";
import uploadRoutes from "./uploads";
import { aiPredictionsRoutes } from "./ai-predictions";
import { aiRepairGuideRoutes } from "./ai-repair-guide";
import { analyticsPerformanceRoutes } from "./analytics-performance";
import { forecastingDemandRoutes } from "./forecasting-demand";
import { mobileDevicesRoutes } from "./mobile-devices";
import { obdDiagnosticsRoutes } from "./obd-diagnostics";
import { productivityRoutes } from "./productivity";
import { smartContractsRoutes } from "./smart-contracts";
import { registerRoutes as registerLegacyRoutes, markAuthInitialized } from "../routes";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔄 Initializing Hybrid Router...");

  // Serve static public directory for landing page assets
  const publicPath = path.join(process.cwd(), "public");
  if (fs.existsSync(publicPath)) {
    app.use("/public", express.static(publicPath));
  }
  
  // Liveness/readiness probe for compose healthchecks and load balancers:
  // 200 with a live DB ping, 503 when the database is unreachable.
  app.get("/api/health", async (_req, res) => {
    try {
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`SELECT 1`);
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  // Public API routes (no auth required) - mounted at /api/public
  app.use("/api/public", publicRoutes);
  // Public system routes and AI discovery/CORS middleware
  app.use(systemRoutes);
  console.log("System Routes Loaded");
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

  // ── Security floor (mounted immediately after auth is available) ──────────
  // Previously written but never wired in (deep-audit blocker B1). Order:
  //  1. seed a per-session CSRF token + expose it at /api/csrf-token,
  //  2. default-deny: any /api route not in the PUBLIC_ROUTES allowlist now
  //     requires an authenticated session (401 otherwise),
  //  3. force ?garage_id to the caller's session garage for ordinary staff
  //     (closes the client-supplied cross-tenant class in one place).
  //  4. CSRF enforcement on mutating requests (request-time gated: ON in
  //     production / CSRF_ENFORCE=true, OFF in dev+test by default). The client
  //     apiRequest wrapper fetches /api/csrf-token and sends X-CSRF-Token;
  //     webhooks / sessionless public entry points are exempt inside the
  //     middleware.
  app.use(generateCsrfToken);
  app.get("/api/csrf-token", csrfTokenRoute);
  app.use(enforceCsrf);
  app.use(requireAuthByDefault);
  // C-1/C-2: after authentication, deny the staff API surface to customer
  // sessions (they may only reach the customer-facing namespaces). Runs before
  // tenant scoping because a customer must never reach a garage-scoped handler.
  app.use(requireStaffByDefault);
  app.use(enforceGarageScopeOnQuery);
  app.use(enforceTenantOnBody);
  console.log("✅ Security floor mounted (default-deny auth + staff lockout + tenant scope + CSRF)");

  // Wire RBAC: load user permissions on every authenticated request
  // This populates req.userPermissions for use by requirePermission() in handlers
  app.use(loadUserPermissions);
  console.log("✅ RBAC Permission Loader Wired");

  // Load new modular routes with priority
  app.use("/api", authRoutes);
  // Smart Search routes
  app.use("/api", searchRoutes);
  console.log("Smart Search Routes Loaded");

  // Garage and role lookup routes
  app.use("/api", garageRoutes);
  console.log("Garage Routes Loaded");

  // Technician read routes
  app.use("/api", technicianRoutes);
  console.log("Technician Routes Loaded");

  // VIN decode routes
  app.use("/api", vinRoutes);
  console.log("VIN Routes Loaded");

  // Vehicle catalog lookup routes
  app.use("/api", catalogRoutes);
  console.log("Vehicle Catalog Routes Loaded");

  // Service template read routes
  app.use("/api", serviceTemplateRoutes);
  console.log("Service Template Routes Loaded");

  // Spare part read routes
  app.use("/api", sparePartRoutes);
  console.log("Spare Part Routes Loaded");

  // Appointment read routes
  app.use("/api", appointmentRoutes);
  console.log("Appointment Routes Loaded");

  // Tool read routes
  app.use("/api", toolRoutes);
  console.log("Tool Routes Loaded");

  // Supplier read routes
  app.use("/api", supplierRoutes);
  console.log("Supplier Routes Loaded");

  // Customer read routes
  app.use("/api", customerRoutes);
  console.log("Customer Routes Loaded");

  // Service chat read routes
  app.use("/api", serviceChatRoutes);
  console.log("Service Chat Routes Loaded");

  // Job card read routes
  app.use("/api", jobCardRoutes);
  console.log("Job Card Routes Loaded");

  // Estimates (reads, writes, stats, conversions) — extracted from the monolith
  app.use("/api", estimateRoutes);
  console.log("Estimate Routes Loaded");

  // Invoices (reads, writes, from-job generation) — extracted from the monolith
  app.use("/api", invoiceRoutes);
  console.log("Invoice Routes Loaded");

  // Payments (list, record, reverse) — extracted from the monolith
  app.use("/api", paymentRoutes);
  console.log("Payment Routes Loaded");

  // Service bay read routes
  app.use("/api", serviceBayRoutes);
  console.log("Service Bay Routes Loaded");

  // Gamification read routes
  app.use("/api", gamificationRoutes);
  console.log("Gamification Routes Loaded");

  // Dashboard widget read routes
  // Dashboard KPI/trends/activity routes — existed unmounted; the
  // garage-scope suite specifies them.
  app.use("/api", dashboardRoutes);
  app.use("/api", dashboardWidgetRoutes);
  console.log("Dashboard Widget Routes Loaded");

  // Assignment read routes
  app.use("/api", assignmentRoutes);
  console.log("Assignment Routes Loaded");

  // Availability read routes
  app.use("/api", availabilityRoutes);
  console.log("Availability Routes Loaded");

  // Recurring appointment read routes
  app.use("/api", recurringAppointmentRoutes);
  console.log("Recurring Appointment Routes Loaded");

  // Calendar event read routes
  app.use("/api", calendarEventRoutes);
  console.log("Calendar Event Routes Loaded");

  // Knowledge base read routes
  app.use("/api", knowledgeBaseRoutes);
  console.log("Knowledge Base Routes Loaded");

  // Google My Business read routes
  app.use("/api", gmbRoutes);
  console.log("GMB Routes Loaded");

  // Training LMS read routes
  app.use("/api", trainingRoutes);
  console.log("Training Routes Loaded");

  // Support ticket read routes
  app.use("/api", supportTicketRoutes);
  console.log("Support Ticket Routes Loaded");

  // Vehicle tracking read routes
  app.use("/api", vehicleTrackingRoutes);
  console.log("Vehicle Tracking Routes Loaded");

  // License plate recognition read routes
  app.use("/api", lprRoutes);
  console.log("LPR Routes Loaded");

  // Direct service reminder read routes
  app.use("/api", serviceReminderRoutes);
  console.log("Service Reminder Routes Loaded");

  // Service reminder template read routes
  app.use("/api", serviceReminderTemplateRoutes);
  console.log("Service Reminder Template Routes Loaded");

  // Push subscription read routes
  app.use("/api", pushSubscriptionRoutes);
  console.log("Push Subscription Routes Loaded");

  // Push notification read routes
  app.use("/api", pushNotificationRoutes);
  console.log("Push Notification Routes Loaded");

  // Vehicle read routes
  app.use("/api", vehicleRoutes);
  console.log("Vehicle Routes Loaded");

  // Purchase order and task read routes
  app.use("/api", purchaseOrderRoutes);
  console.log("Purchase Order Routes Loaded");

  // Quotation read routes
  app.use("/api", quotationRoutes);
  console.log("Quotation Routes Loaded");

  // Supplier payment read routes
  app.use("/api", supplierPaymentRoutes);
  console.log("Supplier Payment Routes Loaded");

  // Delivery read routes
  console.log("Delivery Routes Loaded");

  // Scheduling read routes
  app.use("/api", schedulingRoutes);
  console.log("Scheduling Routes Loaded");
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

  // AI Chatbot routes
  app.use("/api", chatbotRoutes);
  console.log("AI Chatbot Routes Loaded");

  // Completed half-real page routes. These routers existed but were never
  // mounted, so their endpoints 404ed; the completed-pages test suites
  // specify them as live, auth-gated routes.
  app.use("/api", aiPredictionsRoutes);
  app.use("/api", aiRepairGuideRoutes);
  app.use("/api", analyticsPerformanceRoutes);
  app.use("/api", forecastingDemandRoutes);
  app.use("/api", mobileDevicesRoutes);
  app.use("/api", obdDiagnosticsRoutes);
  app.use("/api", productivityRoutes);
  app.use("/api", smartContractsRoutes);
  console.log("Completed-Pages Routes Loaded");

  // These routers also existed without a mount — every endpoint below 404ed
  // into the SPA catch-all while its integration suite specified it as live.
  app.use("/api", autoReorderRoutes);
  app.use("/api", backupRoutes);
  app.use("/api", currencyRoutes);
  app.use("/api", demoRoutes);
  app.use("/api", documentsRoutes);
  app.use("/api", fleetAccountRoutes);
  app.use("/api", gatePassRoutes);
  app.use("/api", gmbSyncRoutes);
  app.use("/api", hrPayrollRoutes);
  app.use("/api", kioskRoutes);
  app.use("/api", paymentsGatewayRoutes);
  // quality-control declares bare /inspections etc.; its public path is /api/qc.
  app.use("/api/qc", qualityControlRoutes);
  app.use("/api", quickActionsRoutes);
  app.use("/api", taxConfigRoutes);
  app.use("/api", trainingLmsRoutes);
  app.use("/api", uploadRoutes);
  console.log("Module Routes Loaded (auto-reorder, backup, currency, demo, documents, fleet, gate-pass, gmb-sync, hr, kiosk, payments, qc, quick-actions, tax, training, uploads)");

  // Feature routers the client already calls but which were never mounted —
  // financial statements, CRM, warranty, messaging campaigns, Saudi
  // compliance, portals, subscriptions, inventory overview, exports, flags,
  // franchise, command center, AI insights and API docs. Every route carries
  // isAuthenticated (added when these were wired up; most shipped with none).
  app.use("/api", aiInsightsRoutes);
  app.use("/api", apiDocsRoutes);
  app.use("/api", commandCenterRoutes);
  app.use("/api", crmRoutes);
  app.use("/api", customerPortalRoutes);
  app.use("/api", docsRoutes);
  app.use("/api", exportRoutes);
  app.use("/api", featureFlagRoutes);
  app.use("/api", financialRoutes);
  app.use("/api", franchiseRoutes);
  app.use("/api", saudiRoutes);
  app.use("/api", smsCampaignRoutes);
  app.use("/api", subscriptionsRoutes);
  app.use("/api", supplierPortalRoutes);
  app.use("/api", warrantyRoutes);
  app.use("/api", whatsappRoutes);
  console.log("Feature Routes Loaded (ai-insights, api-docs, command-center, crm, customer-portal, docs, export, feature-flags, financial, franchise, inventory-mgmt, saudi, sms, subscriptions, supplier-portal, warranty, whatsapp)");

  // Load legacy routes (they will skip setupAuth since it's already done)
  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");
  
  return server;
}
