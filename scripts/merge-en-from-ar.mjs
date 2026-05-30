#!/usr/bin/env node
/**
 * Merge en.json structure to match ar.json (source-of-truth EN file).
 *
 *  - Preserves every value that already exists in en.json.
 *  - For each leaf present in ar.json but missing in en.json, derives an English
 *    label by humanising the leaf key (snake_case / camelCase / kebab-case)
 *    and applying a curated phrase-override map for entries where humanisation
 *    would be wrong (full sentences, brand names, acronyms, etc.).
 *  - Preserves ar.json's key order so the two files can be diffed side-by-side.
 *
 *  Usage:  node scripts/merge-en-from-ar.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const AR_PATH = path.join(ROOT, "client/src/i18n/locales/ar.json");
const EN_PATH = path.join(ROOT, "client/src/i18n/locales/en.json");

const ar = JSON.parse(fs.readFileSync(AR_PATH, "utf8"));
const en = JSON.parse(fs.readFileSync(EN_PATH, "utf8"));

// ---------- humanisation helpers ----------

const ACRONYMS = new Set([
  "ai", "api", "ar", "bi", "cdn", "ceo", "cfo", "cms", "co2", "crm", "css",
  "csv", "cv", "db", "dj", "dms", "dns", "doc", "ein", "eml", "eom", "erp",
  "etl", "faq", "ftp", "gdpr", "gps", "gsm", "html", "http", "https", "iam",
  "id", "ids", "iot", "ip", "iso", "json", "kpi", "kyc", "lms", "ltv", "ml",
  "mvp", "nlp", "ocr", "oem", "obd", "ocr", "okr", "pdf", "po", "pos", "qr",
  "rfid", "roi", "rss", "sdk", "seo", "sms", "smtp", "sop", "sql", "ssl",
  "ssn", "sso", "tts", "uat", "ui", "url", "usd", "ux", "vat", "vin", "vip",
  "vm", "vpn", "vr", "wifi", "xml", "zatca", "qrcode", "ux",
]);

const SPECIAL_WORDS = {
  obd: "OBD",
  ai: "AI",
  ml: "ML",
  vr: "VR",
  vat: "VAT",
  vin: "VIN",
  kpi: "KPI",
  iot: "IoT",
  oem: "OEM",
  iso: "ISO",
  ocr: "OCR",
  ltv: "LTV",
  pdf: "PDF",
  sms: "SMS",
  url: "URL",
  api: "API",
  crm: "CRM",
  hr: "HR",
  qc: "QC",
  qr: "QR",
  lms: "LMS",
  bi: "BI",
  rfid: "RFID",
  zatca: "ZATCA",
  gosi: "GOSI",
  ksa: "KSA",
  uae: "UAE",
  saas: "SaaS",
  // brand / proper-noun forms used in the app
  paypal: "PayPal",
  stripe: "Stripe",
  whatsapp: "WhatsApp",
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  android: "Android",
  ios: "iOS",
};

function splitWords(key) {
  // first split on common separators
  let parts = key.split(/[_\-/\s]+/).filter(Boolean);
  // then split camelCase boundaries inside each part
  const out = [];
  for (const p of parts) {
    const sub = p
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .split(/\s+/);
    out.push(...sub);
  }
  return out.filter(Boolean);
}

function titleCase(word) {
  const lc = word.toLowerCase();
  if (SPECIAL_WORDS[lc]) return SPECIAL_WORDS[lc];
  if (ACRONYMS.has(lc)) return lc.toUpperCase();
  // plural acronyms like KPIs, IDs, APIs, OEMs
  if (lc.endsWith("s") && ACRONYMS.has(lc.slice(0, -1))) {
    return lc.slice(0, -1).toUpperCase() + "s";
  }
  if (/^\d/.test(lc)) return lc;
  return lc[0].toUpperCase() + lc.slice(1);
}

function humanize(key) {
  const words = splitWords(key);
  if (!words.length) return key;
  // pattern: "...Success" → "... successfully"
  if (words.length >= 2 && words[words.length - 1].toLowerCase() === "success") {
    const head = words.slice(0, -1).map(titleCase).join(" ");
    return head + " successfully";
  }
  // pattern: "...Failed" → "... failed"
  if (words.length >= 2 && words[words.length - 1].toLowerCase() === "failed") {
    const head = words.slice(0, -1).map(titleCase).join(" ");
    return head + " failed";
  }
  return words.map(titleCase).join(" ");
}

// ---------- phrase overrides ----------
// Keyed by full dotted path. Use sparingly: only where humanisation produces
// a wrong, awkward, or incomplete English label.

const OVERRIDES = {
  // app
  "app.name": "SALIS AUTO",
  "app.tagline": "Integrated automotive workshop management system",
  "app.copyright": "All rights reserved",
  "app.dashboard_overview": "Dashboard & Overview",
  "app.customer_intake_appointments": "Customer Intake & Appointments",
  "app.vehicle_management": "Vehicle Management",
  "app.inspection_check-in": "Inspection & Check-in",
  "app.diagnostics_assessment": "Diagnostics & Assessment",
  "app.service_planning_scheduling": "Service Planning & Scheduling",
  "app.parts_inventory": "Parts & Inventory",
  "app.service_execution": "Service Execution & Operations",
  "app.quality_delivery": "Quality & Delivery",
  "app.billing_payments": "Billing & Payments",
  "app.analytics_business_intelligence": "Analytics & Business Intelligence",
  "app.customer_experience_growth": "Customer Experience & Growth",
  "app.team_hr_management": "Team & HR Management",
  "app.compliance_safety": "Compliance & Safety",
  "app.enterprise_franchise": "Enterprise & Franchise",
  "app.emerging_technologies": "Emerging Technologies",
  "app.ai_automation_hub": "AI & Automation Hub",
  "app.system_settings": "System & Settings",
  "app.finance_accounting": "Finance & Accounting",

  // common (extras that humanisation would mangle)
  "common.welcome": "Welcome to SALIS AUTO Management System",
  "common.loading": "Loading...",
  "common.search": "Search...",

  // auth
  "auth.forgotPassword": "Forgot password?",
  "auth.emailPlaceholder": "your@email.com",
  "auth.signingIn": "Signing in...",
  "auth.welcomeBack": "Welcome back",
  "auth.creatingAccount": "Creating account...",
  "auth.alreadyHaveAccount": "Already have an account?",
  "auth.dontHaveAccount": "Don't have an account?",
  "auth.invalidCredentials": "Invalid credentials",
  "auth.sessionExpired": "Session expired",
  "auth.enterCredentials": "Enter your credentials to access your account",
  "auth.loggedInSuccessfully": "Logged in successfully",
  "auth.fillAllFields": "Please fill in all fields",
  "auth.fillRequiredFields": "Please fill in all required fields",
  "auth.accountCreated": "Account created successfully",
  "auth.failedToCreateAccount": "Failed to create account",
  "auth.registerToGetStarted": "Register to get started with SALIS AUTO",
  "auth.fullNamePlaceholder": "Enter your full name",

  // welcome
  "welcome.welcomeBack": "Welcome back",
  "welcome.loggedInAs": "Logged in as",
  "welcome.redirecting": "Redirecting to your portal...",
  "welcome.takingYouTo": "Taking you to",

  // nav — group titles
  "nav.dashboard_overview": "Dashboard & Overview",
  "nav.customer_intake_appointments": "Customer Intake & Appointments",
  "nav.vehicle_management": "Vehicle Management",
  "nav.inspection_check-in": "Inspection & Check-in",
  "nav.diagnostics_assessment": "Diagnostics & Assessment",
  "nav.service_planning_scheduling": "Service Planning & Scheduling",
  "nav.parts_inventory": "Parts & Inventory",
  "nav.service_execution": "Service Execution",
  "nav.quality_delivery": "Quality & Delivery",
  "nav.billing_payments": "Billing & Payments",
  "nav.analytics_business_intelligence": "Analytics & Business Intelligence",
  "nav.finance_accounting": "Finance & Accounting",
  "nav.customer_experience_growth": "Customer Experience & Growth",
  "nav.team_hr_management": "Team & HR Management",
  "nav.compliance_safety": "Compliance & Safety",
  "nav.enterprise_franchise": "Enterprise & Franchise",
  "nav.emerging_technologies": "Emerging Technologies",
  "nav.ai_automation_hub": "AI & Automation Hub",
  "nav.system_settings": "System & Settings",
  "nav.calendar": "Calendar & Scheduling",
  "nav.kpi_dashboard": "KPI Dashboard",
  "nav.kpiDashboard": "KPI Dashboard",
  "nav.diagnostics_obd": "Diagnostics & OBD",
  "nav.diagnosticsHub": "Diagnostics Hub",
  "nav.obdHub": "OBD Hub",
  "nav.oem_software": "OEM Software",
  "nav.oemSoftware": "OEM Software",
  "nav.parts_auto-reorder": "Parts Auto-Reorder",
  "nav.ai_chatbot": "AI Chatbot",
  "nav.ai_chatbot_assistant": "AI Chatbot Assistant",
  "nav.ai_service_advisor": "AI Service Advisor",
  "nav.aiChatbot": "AI Chatbot",
  "nav.aiServiceAdvisor": "AI Service Advisor",
  "nav.ai_parts_recommender": "AI Parts Recommender",
  "nav.aiAutomation": "AI Automation",
  "nav.ai_automation": "AI Automation",
  "nav.ai_scheduling": "AI Scheduling",
  "nav.ml_fraud_detection": "ML Fraud Detection",
  "nav.mlFraudDetection": "ML Fraud Detection",
  "nav.ar_repair_guide": "AR Repair Guide",
  "nav.ar_overlay": "AR Overlay",
  "nav.vr_showroom": "VR Showroom",
  "nav.vin_decoder": "VIN Decoder",
  "nav.customer_ltv_analysis": "Customer LTV Analysis",
  "nav.customerLTVAnalysis": "Customer LTV Analysis",
  "nav.computer_vision_qc": "Computer Vision QC",
  "nav.vision_qc": "Vision QC",
  "nav.iot_dashboard": "IoT Dashboard",
  "nav.iso_quality": "ISO Quality",
  "nav.timeclock/payroll": "Timeclock / Payroll",
  "nav.timeclockPayroll": "Timeclock / Payroll",
  "nav.data_import/export": "Data Import / Export",
  "nav.dataImportExport": "Data Import / Export",
  "nav.trainingLMS": "Training LMS",
  "nav.training_lms": "Training LMS",
  "nav.stripePayments": "Stripe Payments",
  "nav.paypalPayments": "PayPal Payments",
  "nav.googleMyBusiness": "Google My Business",
  "nav.google_my_business": "Google My Business",
  "nav.smartPartsRecommendations": "Smart Parts Recommendations",
  "nav.smart_damage_assessment": "Smart Damage Assessment",
  "nav.smartDamageAssessment": "Smart Damage Assessment",
  "nav.partners_account": "Partners Account",
  "nav.partnersCurrentAccount": "Partners Current Account",
  "nav.intelligent_price_optimizer": "Intelligent Price Optimizer",
  "nav.intelligentPriceOptimizer": "Intelligent Price Optimizer",
  "nav.view_manage_invoices": "View and manage your service invoices",
  "nav.invoices_awaiting_payment": "Invoices awaiting payment",
  "nav.complete_invoice_history": "Complete invoice history",
  "nav.displays_mobile_sidebar": "Displays the mobile sidebar.",
  "nav.pick_a_date": "Pick a date",
  "nav.pay_now": "Pay Now",
  "nav.total_label": "Total:",
  "nav.no_invoices_yet": "No invoices yet",
  "nav.no_upcoming_services": "No upcoming services",
  "nav.no_active_reminders": "No active reminders",
  "nav.no_upcoming_appointments": "No upcoming appointments",
  "nav.no_past_appointments": "No past appointments",
  "nav.unknown_vehicle": "Unknown Vehicle",

  // currency
  "currency.SAR": "SAR",
  "currency.USD": "USD",
  "currency.EUR": "EUR",
  "currency.AED": "AED",
  "currency.GBP": "GBP",
  "currency.symbol_SAR": "﷼",
  "currency.symbol_USD": "$",
  "currency.symbol_EUR": "€",
  "currency.symbol_AED": "د.إ",
  "currency.symbol_GBP": "£",

  // days / months — keep as humanised but ensure proper capitalisation
  "days.sun": "Sun",
  "days.mon": "Mon",
  "days.tue": "Tue",
  "days.wed": "Wed",
  "days.thu": "Thu",
  "days.fri": "Fri",
  "days.sat": "Sat",
  "months.jan": "Jan",
  "months.feb": "Feb",
  "months.mar": "Mar",
  "months.apr": "Apr",
  "months.may": "May",
  "months.jun": "Jun",
  "months.jul": "Jul",
  "months.aug": "Aug",
  "months.sep": "Sep",
  "months.oct": "Oct",
  "months.nov": "Nov",
  "months.dec": "Dec",

  // page subtitles
  "jobCards.subtitle": "Manage work orders and services",
  "customers.subtitle": "Manage customer records",
  "vehicles.subtitle": "Manage vehicle records",
  "inventory.subtitle": "Manage spare parts and inventory",
  "invoices.subtitle": "Manage invoices and payments",
  "payments.subtitle": "Process payments",
  "reports.subtitle": "Business reports and analytics",
  "settings.subtitle": "System settings and preferences",
  "technicians.subtitle": "Manage the technician team",
  "appointments.subtitle": "Manage customer appointments",

  // descriptions & placeholders
  "accounting.autoSyncInvoicesDesc": "Automatically sync new invoices",
  "accounting.autoSyncPaymentsDesc": "Automatically sync payment records",
  "accounting.autoSyncCustomersDesc": "Keep customer data in sync",
  "accounting.autoSyncExpensesDesc": "Sync supplier bills and expenses",
  "aiAutomation.serviceTypePlaceholder": "e.g. oil change, brake repair",
  "aiAutomation.mileagePlaceholder": "e.g. 50000",
  "aiAutomation.partsServiceTypePlaceholder": "e.g. brake service",
  "aiChatbot.alwaysAvailableDesc": "Always available",
  "aiServiceAdvisor.inputPlaceholder": "Describe your issue or ask a question...",
  "arRepairGuide.steps.safetyCheckDesc": "Make sure the vehicle is on level ground with the parking brake engaged",
  "arRepairGuide.steps.locateOilFilterDesc": "Locate the oil filter underneath the vehicle near the engine block",
  "arRepairGuide.steps.removeFilterDesc": "Use a filter wrench to loosen and remove the old filter",
  "arRepairGuide.steps.installNewFilterDesc": "Apply oil to the gasket and hand-tighten the new filter",
  "arRepairGuide.steps.addFreshOilDesc": "Pour the specified amount of oil into the engine",
  "vehicleHealth.lowTirePressureDesc": "Right rear tire at 28 PSI (recommended: 32-35 PSI)",
  "vehicleHealth.engineTempRisingDesc": "Currently at 210°F, approaching the 220°F upper limit",
  "vehicleHealth.oilChangeDueDesc": "Next service in 450 miles or two weeks",
  "vinDecoder.enterVinPlaceholder": "Enter the 17-character VIN",
  "telematics.alertDescriptionPlaceholder": "Alert description...",
  "smartParts.vehicleMakePlaceholder": "e.g. Toyota",
  "smartParts.vehicleModelPlaceholder": "e.g. Camry",
  "smartParts.yearPlaceholder": "e.g. 2020",
  "smartParts.symptomsPlaceholder": "Describe any specific symptoms or issues...",
  "videoConsultations.searchPlaceholder": "Search consultations...",
  "videoConsultations.noConsultationsDesc": "No video consultations have been scheduled yet.",
  "videoEstimates.estimateApprovedDesc": "The video estimate has been approved.",
  "videoEstimates.searchPlaceholder": "Search estimates...",
  "videoEstimates.noEstimatesDesc": "No video estimates available.",
  "voiceCommands.searchCustomerDesc": "Search for a customer by name",
  "partsAvailability.searchPlaceholder": "Enter part name, SKU or number...",
  "taskManagement.searchPlaceholder": "Search tasks...",

  // currency long names
  "currency.title": "Currencies",
  "currency.sar": "Saudi Riyal",
  "currency.aed": "UAE Dirham",
  "currency.bhd": "Bahraini Dinar",
  "currency.kwd": "Kuwaiti Dinar",
  "currency.omr": "Omani Rial",
  "currency.qar": "Qatari Riyal",
  "currency.usd": "US Dollar",
  "currency.eur": "Euro",
  "currency.gbp": "British Pound",

  // compliance — keep Saudi-specific proper nouns recognisable
  "compliance.zatca": "ZATCA (Zakat, Tax and Customs Authority)",
  "compliance.vat": "VAT",
  "compliance.vatNumber": "VAT Number",
  "compliance.zakat": "Zakat",
  "compliance.trn": "Tax Registration Number",
  "compliance.crNumber": "Commercial Registration Number",

  // errors / messages — full sentences
  "errors.required": "This field is required",
  "errors.invalidEmail": "Invalid email address",
  "errors.invalidPhone": "Invalid phone number",
  "errors.minLength": "Must be at least {{min}} characters",
  "errors.maxLength": "Must be no more than {{max}} characters",
  "errors.passwordMismatch": "Passwords do not match",
  "errors.serverError": "A server error occurred",
  "errors.networkError": "Network connection error",
  "errors.unauthorized": "You are not authorized to perform this action",
  "errors.notFound": "The requested item was not found",
  "errors.invalidData": "Invalid input data",
  "errors.pageNotFound": "404 Page Not Found",
  "errors.pageNotFoundMessage": "Did you forget to add the page to the router?",

  "success.saved": "Saved successfully",
  "success.created": "Created successfully",
  "success.updated": "Updated successfully",
  "success.deleted": "Deleted successfully",
  "success.sent": "Sent successfully",
  "success.copied": "Copied successfully",
  "success.imported": "Imported successfully",
  "success.exported": "Exported successfully",

  "confirm.delete": "Are you sure you want to delete this?",
  "confirm.cancel": "Are you sure you want to cancel?",
  "confirm.discard": "Discard changes?",
  "confirm.logout": "Are you sure you want to log out?",
  "confirm.action": "Are you sure about this action?",

  // time
  "time.today": "Today",
  "time.yesterday": "Yesterday",
  "time.tomorrow": "Tomorrow",
  "time.thisWeek": "This Week",
  "time.lastWeek": "Last Week",
  "time.thisMonth": "This Month",
  "time.lastMonth": "Last Month",
  "time.thisYear": "This Year",
  "time.lastYear": "Last Year",
  "time.ago": "ago",
  "time.in": "in",

  // roles
  "roles.admin": "System Administrator",
  "roles.advisor": "Service Advisor",
  "roles.receptionist": "Receptionist",

  // landing
  "landing.welcomeTitle": "Welcome to SALIS AUTO",
  "landing.signInPrompt": "Sign in to access your dashboard and manage your workshop operations efficiently.",

  // kiosk — full sentences
  "kiosk.title": "🖥️ Kiosk Check-in",
  "kiosk.description": "Self-service customer check-in system",
  "kiosk.interfaceDemo": "Kiosk Interface Demo",
  "kiosk.todaysCheckIns": "Today's Check-ins",
  "kiosk.withAppointment": "With Appointment",
  "kiosk.walkIns": "Walk-ins",
  "kiosk.avgTimeSec": "Average Time (sec)",
  "kiosk.welcomeToSalis": "Welcome to SALIS AUTO",
  "kiosk.tapToBegin": "Tap to begin check-in",
  "kiosk.startCheckIn": "Start Check-in",
  "kiosk.enterPhoneNumber": "Enter phone number",
  "kiosk.selectVehicle": "Select vehicle",
  "kiosk.confirmCheckIn": "Confirm Check-in",
  "kiosk.oilChangeInspection": "Oil Change & Inspection",
  "kiosk.checkInComplete": "Check-in complete!",
  "kiosk.pleaseHaveASeat": "Please have a seat. A technician will be with you shortly.",
  "kiosk.newCheckIn": "New Check-in",
  "kiosk.recentCheckIns": "Recent Check-ins",
  "kiosk.loadingCheckIns": "Loading check-ins...",
  "kiosk.noCheckInsYet": "No check-ins yet.",
  "kiosk.unknownCustomer": "Unknown Customer",
  "kiosk.appointment": "Appointment",
  "kiosk.walkIn": "Walk-in",
  "kiosk.checkInCompleted": "Check-in completed successfully",
  "kiosk.checkInFailed": "Check-in failed",

  // franchise — descriptions and lookups that humanisation can't synthesise
  "franchise.franchiseCommandCenterDescription": "Manage franchise groups, contracts, KPIs and revenue sharing across your network",
  "franchise.trackFranchisePerformance": "Track franchise performance across key metrics",
  "franchise.manageRevenueSharingAgreements": "Manage revenue sharing agreements between franchisor and franchisees",
  "franchise.selectBranchToViewKpi": "Select a branch to view KPI reports",
  "franchise.noRevenueSharingRulesConfigured": "No revenue sharing rules configured",

  // page titles (where humanisation would lose the actual page name)
  "jobCards.title": "Job Cards",
  "jobCards.description": "Job description",
  "customers.title": "Customers",
  "vehicles.title": "Vehicles",
  "inventory.title": "Inventory",
  "inventory.description": "Description",
  "invoices.title": "Invoices",
  "payments.title": "Payments",
  "reports.title": "Reports",
  "settings.title": "Settings",
  "security.title": "Security & Compliance",
  "security.twoFactor.title": "Two-Factor Authentication (2FA)",
  "security.twoFactor.description": "Add an extra layer of security to your account",
  "security.auditLogs.title": "Audit Logs",
  "security.auditLogs.description": "Track all system activities and changes",
  "security.backup.title": "Backup & Restore",
  "security.backup.description": "Create and manage data backups",
  "security.gdpr.title": "GDPR Compliance",
  "security.gdpr.description": "Manage data subject rights requests",
  "security.consents.title": "User Consents",
  "security.consents.description": "Manage user consent preferences",
  "security.permissions.title": "Permission Overrides",
  "security.permissions.description": "Grant or restrict specific permissions for users",
  "backup.title": "Data Backup & Restore",
  "widgets.title": "Dashboard Widgets",
  "technicians.title": "Technicians",
  "appointments.title": "Appointments",
  "notifications.title": "Notifications",
  "compliance.title": "Compliance",
  "accounting.title": "💼 Accounting Integration",
  "accounting.description": "Sync with QuickBooks and Xero for automated accounting",
  "aiAutomation.title": "AI Automation Hub",
  "aiAutomation.description": "Use AI to automate and optimize workshop operations",
  "aiChatbot.title": "AI Service Assistant",
  "aiChatbot.description": "Ask questions, book services, or get vehicle diagnostics",
  "aiScheduling.title": "🤖 AI-Powered Scheduling",
  "aiScheduling.description": "Automatically optimize technician schedules",
  "aiServiceAdvisor.title": "AI Service Advisor",
  "aiServiceAdvisor.description": "Natural-language service recommendations powered by advanced AI",
  "arRepairGuide.title": "AR Repair Guide Viewer",
  "arRepairGuide.description": "Step-by-step augmented-reality repair instructions with annotations",
  "diagnosticsOBD.title": "Diagnostics & OBD Hub",
  "digitalTwin.title": "3D Digital Twin Viewer",
  "digitalTwin.description": "Interactive 3D vehicle visualization with real-time sensor data and diagnostic overlays",
  "vrShowroom.title": "VR Showroom",
  "vrShowroom.description": "Interactive virtual vehicle showroom",
  "vehicleHealth.title": "Real-time Vehicle Health Monitoring",
  "vehicleHealth.description": "IoT sensor integration with predictive maintenance alerts",
  "vinDecoder.title": "VIN Decoder",
  "vinDecoder.description": "Decode Vehicle Identification Numbers to retrieve vehicle specs and recall information",
  "telematics.title": "Telematics Integration",
  "telematics.description": "Real-time vehicle tracking, telemetry feeds, and alerts",
  "tireManagement.title": "Tire Management System",
  "tireManagement.description": "Complete tire inventory, services, rotation scheduling, and seasonal storage",
  "smartAssignment.title": "Smart Work Assignment",
  "smartAssignment.description": "AI-powered technician recommendations for optimal work assignment",
  "smartParts.title": "Smart Parts Recommender",
  "smartParts.description": "AI-powered parts recommendations using GPT-5 analysis and vehicle compatibility data",
  "smartDamage.title": "Smart Damage Assessment",
  "smartDamage.description": "AI-powered vehicle damage detection with instant cost estimation",
  "smartInventory.title": "Smart Inventory Forecasting",
  "smartInventory.description": "Machine-learning demand forecasting with automated reorder recommendations",
  "videoConsultations.title": "Video Consultations",
  "videoConsultations.description": "Remote vehicle diagnostics and customer consultations",
  "videoEstimates.title": "Video Estimates",
  "videoEstimates.description": "Visual repair estimates with video walkthroughs",
  "voiceCommands.title": "Voice Commands",
  "voiceCommands.description": "Hands-free operations using voice recognition",
  "partsAvailability.title": "Parts Availability Tracker",
  "partsAvailability.description": "Real-time parts availability across multiple suppliers",
  "partsAutoReorder.title": "Parts Auto Reorder",
  "partsAutoReorder.description": "Automatically replenish inventory",
  "taskManagement.title": "Task Management",
  "taskManagement.description": "Manage and track all service tasks and assignments",
  "taskManagement.noTasksDescription": "No tasks available right now.",

  "dashboard.scenarioADescription": "Manager assigns the job card, required tools, and technician team in a single workflow",
  "dashboard.scenarioBDescription": "Technicians can assign assistants to their tasks and manage subtasks independently",
  "dashboard.scenarioCDescription": "Real-time task reassignment based on priority changes and resource availability",

  "auth.twoFactorAuth": "Two-Factor Authentication",
  "compliance.eInvoicing": "E-Invoicing",
  "franchise.enterDescription": "Enter description",
  "diagnosticsOBD.pageDescription": "Manage OBD diagnostic devices, real-time vehicle monitoring, and diagnostic reports",
  "voiceCommands.interfaceDescription": "Control the system using voice commands",
  "partsAvailability.searchDescription": "Search for parts across all suppliers",
};

// ---------- merge ----------

function deepGet(obj, parts) {
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function merge(arNode, enNode, pathParts) {
  if (arNode == null || typeof arNode !== "object" || Array.isArray(arNode)) {
    // leaf
    const dotted = pathParts.join(".");
    const existing = enNode;
    if (existing !== undefined && existing !== null && typeof existing !== "object") {
      return existing;
    }
    if (OVERRIDES[dotted] !== undefined) return OVERRIDES[dotted];
    const leaf = pathParts[pathParts.length - 1] ?? "";
    return humanize(leaf);
  }
  // object — preserve ar key order
  const out = {};
  for (const key of Object.keys(arNode)) {
    const childPath = [...pathParts, key];
    const childEn = enNode && typeof enNode === "object" ? enNode[key] : undefined;
    out[key] = merge(arNode[key], childEn, childPath);
  }
  // also preserve any extra en-only keys at this level (don't drop them)
  if (enNode && typeof enNode === "object" && !Array.isArray(enNode)) {
    for (const key of Object.keys(enNode)) {
      if (!(key in out)) out[key] = enNode[key];
    }
  }
  return out;
}

const merged = merge(ar, en, []);

// Sanity check — no value should be undefined
function checkLeaves(obj, prefix = "") {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) checkLeaves(v, p);
    else if (v === undefined || v === null) console.error("EMPTY:", p);
  }
}
checkLeaves(merged);

fs.writeFileSync(EN_PATH, JSON.stringify(merged, null, 2) + "\n");
console.log("Wrote", EN_PATH);

// Stats
function countLeaves(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) n += countLeaves(v);
    else n += 1;
  }
  return n;
}
console.log("Leaves:", countLeaves(merged));
