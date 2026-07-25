import { Express } from "express";
import { Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { setupAuth } from "../auth";
import { loadUserPermissions } from "../rbac-middleware";
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
import garageRoutes from "./garages";
import technicianRoutes from "./technicians";
import vinRoutes from "./vin";
import catalogRoutes from "./catalogs";
import serviceTemplateRoutes from "./service-templates";
import sparePartRoutes from "./spare-parts";
import appointmentRoutes from "./appointments";
import toolRoutes from "./tools";
import vehicleMaintenanceRoutes from "./vehicle-maintenance";
import supplierRoutes from "./suppliers";
import customerRoutes from "./customers";
import serviceChatRoutes from "./service-chat";
import jobCardRoutes from "./job-cards";
import serviceBayRoutes from "./service-bays";
import gamificationRoutes from "./gamification";
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
import vehicleRoutes from "./vehicles";
import purchaseOrderRoutes from "./purchase-orders";
import quotationRoutes from "./quotations";
import supplierPaymentRoutes from "./supplier-payments";
import deliveryRoutes from "./deliveries";
import schedulingRoutes from "./scheduling";
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

  // Vehicle maintenance read routes
  app.use("/api", vehicleMaintenanceRoutes);
  console.log("Vehicle Maintenance Routes Loaded");

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

  // Service bay read routes
  app.use("/api", serviceBayRoutes);
  console.log("Service Bay Routes Loaded");

  // Gamification read routes
  app.use("/api", gamificationRoutes);
  console.log("Gamification Routes Loaded");

  // Dashboard widget read routes
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
  app.use("/api", deliveryRoutes);
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

  // Load legacy routes (they will skip setupAuth since it's already done)
  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");
  
  return server;
}
