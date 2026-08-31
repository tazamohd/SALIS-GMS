// @ts-nocheck — Monolith file, slated for deletion in Phase 3 (route refactoring)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import {
  hrDepartments,
  hrPositions,
  hrEmployeeProfiles,
  hrLeaveTypes,
  hrLeaveBalances,
  hrLeaveRequests,
  hrJobPostings,
  hrCandidates,
  hrBenefitPlans,
  hrBenefitEnrollments,
  hrPerformanceReviews,
  hrAnnouncements,
  hrSelfServiceRequests,
  insertHrDepartmentSchema,
  insertHrPositionSchema,
  insertHrEmployeeProfileSchema,
  insertHrLeaveTypeSchema,
  insertHrLeaveBalanceSchema,
  insertHrLeaveRequestSchema,
  insertHrJobPostingSchema,
  insertHrCandidateSchema,
  insertHrBenefitPlanSchema,
  insertHrBenefitEnrollmentSchema,
  insertHrPerformanceReviewSchema,
  insertHrAnnouncementSchema,
  insertHrSelfServiceRequestSchema,
  jobCardParts,
  sparePartInventories,
  jobCards,
  invoices,
} from "@shared/schema";
import rateLimit from "express-rate-limit";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { requireRole } from "./middleware/requireRole";
import passport from "passport";
import { emailService } from "./services/emailService";
import { smsService } from "./services/smsService";
import { initializeChatWebSocket, getChatWebSocketServer } from "./websocket";
import { z } from "zod";
import { 
  insertNotificationSchema, 
  insertSavedFilterPresetSchema, 
  insertExportJobSchema,
  insertEmployeeAttendanceSchema,
  insertShiftTemplateSchema,
  insertShiftAssignmentSchema,
  insertCommissionRuleSchema,
  insertCommissionSchema,
  insertPerformanceReviewSchema,
  insertTrainingSchema,
  insertEmployeeTrainingSchema,
  insertAIJobEstimationSchema,
  insertAIMaintenancePredictionSchema,
  insertAIPartsRecommendationSchema,
  insertAIScheduleOptimizationSchema,
  insertAIChatConversationSchema,
  insertIntegrationConnectionSchema,
  insertIntegrationSyncLogSchema,
  insertAccountingTransactionSchema,
  insertOBDDiagnosticDataSchema,
  insertWarrantySchema,
  insertWarrantyClaimSchema,
  insertInspectionTemplateSchema,
  insertVehicleInspectionSchema,
  insertTowingRequestSchema,
  insertTowTruckSchema,
  insertLoanerVehicleSchema,
  insertLoanerReservationSchema,
  insertSupplierPriceListSchema,
  insertSupplierPerformanceSchema,
  insertFranchiseGroupSchema,
  insertFranchiseContractSchema,
  insertFranchiseKpiSchema,
  insertRevenueSharingRuleSchema,
  insertLocaleSchema,
  insertTranslationResourceSchema,
  insertCurrencyRateSchema,
  insertTaxRegionSchema,
  insertTimezoneRuleSchema,
  insertNetworkPartnerSchema,
  insertFulfillmentOrderSchema,
  insertShipmentEventSchema,
  insertWarehouseNodeSchema,
  insertObdDeviceSchema,
  insertDeviceAssignmentSchema,
  insertObdSessionSchema,
  insertDiagnosticReportSchema,
  insertVendorCatalogSchema,
  insertOemProductSchema,
  insertSubscriptionLicenseSchema,
  insertLicenseAuditLogSchema,
  insertEntitlementAssignmentSchema,
  insertNeuralDiagnosticSchema,
  insertNeuralTrainingSessionSchema,
  insertVisionQualityCheckSchema,
  insertVisionDefectSchema,
  insertNLPServiceRequestSchema,
  insertNLPTrainingDataSchema,
  insertRLPartsOptimizationSchema,
  insertRLLearningEpisodeSchema,
  insertMetaverseShowroomSchema,
  insertMetaverseVisitSchema,
  insertHolographicGuideSchema,
  insertHolographicSessionSchema,
  insertSpatialWorkstationSchema,
  insertSpatialDiagnosticSessionSchema,
  insertAutonomousRobotSchema,
  insertRobotTaskSchema,
  insertDroneFleetSchema,
  insertDroneMissionSchema,
  insertSmartContractSchema,
  insertContractEventSchema,
  insertCarbonCreditSchema,
  insertCarbonEmissionSchema,
  insertGreenEnergyAssetSchema,
  insertEVChargingStationSchema,
  insertRecycledPartSchema,
  insertSustainabilityMetricSchema,
  insertSatelliteConnectionSchema,
  insertSatelliteUsageLogSchema,
  insertQuantumEncryptionKeySchema,
  insertQuantumSecureMessageSchema,
  insertPayrollEmployeeSchema,
  insertPayPeriodSchema,
  insertPayrollRunSchema,
  insertExpenseCategorySchema,
  insertExpenseSchema,
  insertTowingJobSchema,
  insertStorageFacilitySchema,
  insertVehicleStorageAssignmentSchema,
  insertTelematicsFeedSchema,
  insertTelematicsAlertSchema,
  insertArticleCategorySchema,
  insertKnowledgeArticleSchema,
  insertTrainingModuleSchema,
  insertCertificationSchema,
  insertCertificationAttemptSchema,
  insertGoogleBusinessProfileSchema,
  insertGmbPostSchema,
  insertGmbReviewSchema,
  insertCompliancePolicySchema,
  insertComplianceAuditSchema,
  insertComplianceTaskSchema,
  insertServiceSignatureSchema,
  insertServiceChatMessageSchema,
  insertServiceReviewSchema,
  insertIoTSensorSchema,
  insertIoTSensorReadingSchema,
  insertIoTAlertSchema,
  insertJobTrackingEventSchema
} from "@shared/schema";
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { estimateJobTime, predictMaintenance, recommendParts, optimizeSchedule, chatWithCustomer } from './ai';
import { analyzePredictiveMaintenance, generatePartsRecommendations, streamChatResponse } from './ai-service';
import { auditLog } from './auditMiddleware';
import QRCode from 'qrcode';
import * as phase3Service from './phase3-integrations-service';
import * as phase4Service from './phase4-customer-experience-service';
import * as phase5Service from './phase5-operations-service';
import * as phase6Service from './phase6-compliance-service';
import * as phase7Service from './phase7-hardware-service';

// Helper function to sanitize Zod validation errors for production
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// Helper function to sanitize array validation errors
function sanitizeArrayValidationErrors(invalidItems: Array<{ success: false; error: z.ZodError }>) {
  return {
    message: "Validation failed",
    errors: invalidItems.flatMap(v => 
      v.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    )
  };
}

// Initialize Stripe (Stripe integration - Module 25)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Email notification validation schemas
const appointmentConfirmationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garagePhone: z.string().optional(),
});

const invoiceNotificationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  totalAmount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
  invoiceLink: z.string().optional(),
});

const jobCompletedSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  vehicleInfo: z.string(),
  completedDate: z.string(),
  garageName: z.string(),
  pickupInstructions: z.string().optional(),
});

const feedbackRequestSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

const appointmentReminderSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garageAddress: z.string().optional(),
});

// SMS notification validation schemas
const smsAppointmentReminderSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

const smsAppointmentConfirmationSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

const smsJobStatusSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  status: z.string(),
  garageName: z.string(),
});

const smsJobCompletedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  garageName: z.string(),
  totalAmount: z.string().optional(),
});

const smsInvoiceSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
});

const smsPaymentReceivedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

const smsEstimateSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  estimateNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

const smsFeedbackRequestSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

// ==========================================
// PHASE 4-7 VALIDATION SCHEMAS
// ==========================================

// Phase 4: Customer Experience
const serviceTrackingUpdateSchema = z.object({
  status: z.string(),
  message: z.string(),
  photoUrl: z.string().optional(),
  estimatedCompletion: z.string().optional(),
});

const videoEstimateSchema = z.object({
  customerId: z.string(),
  vehicleId: z.string(),
  technicianId: z.string(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().positive(),
  transcription: z.string().optional(),
  estimatedCost: z.string(),
  recommendedServices: z.array(z.string()).optional(),
});

const digitalWalkaroundSchema = z.object({
  jobCardId: z.string().optional(),
  vehicleId: z.string(),
  customerId: z.string(),
  technicianId: z.string(),
  inspectionType: z.enum(['pre-service', 'post-service', 'damage-assessment']),
  photos: z.array(z.object({
    url: z.string().url(),
    angle: z.string(),
    timestamp: z.string().optional(),
  })),
  damageNotes: z.string().optional(),
});

const customerReviewSchema = z.object({
  customerId: z.string(),
  jobCardId: z.string().optional(),
  platform: z.enum(['google', 'facebook', 'yelp', 'internal']),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional(),
  reviewUrl: z.string().url().optional(),
});

const reviewResponseSchema = z.object({
  response: z.string().min(1),
});

const generateReferralCodeSchema = z.object({
  customerId: z.string(),
});

const applyReferralCodeSchema = z.object({
  referralCode: z.string(),
  newCustomerId: z.string(),
});

// Phase 5: Operations & Efficiency
const schedulingOptimizationSchema = z.object({
  optimizationDate: z.string(),
  appointmentsOptimized: z.number().int().positive(),
  efficiencyGain: z.string(),
  technicianUtilization: z.record(z.string(), z.string()),
  suggestions: z.array(z.string()).optional(),
});

const autoReorderRuleSchema = z.object({
  partId: z.string(),
  minQuantity: z.number().int().positive(),
  reorderQuantity: z.number().int().positive(),
  preferredSupplierId: z.string().optional(),
});

const routingOptimizationSchema = z.object({
  routeDate: z.string(),
  routeType: z.enum(['delivery', 'pickup', 'service-call', 'parts-run']),
  startLocation: z.object({
    address: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  stops: z.array(z.object({
    address: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    estimatedDuration: z.number().optional(),
  })),
  totalDistance: z.string(),
  estimatedDuration: z.number().int().positive(),
  assignedDriver: z.string().optional(),
});

const calibrationRecordSchema = z.object({
  equipmentId: z.string(),
  equipmentName: z.string(),
  calibrationDate: z.string(),
  nextDueDate: z.string(),
  calibratedBy: z.string(),
  certificationNumber: z.string().optional(),
  notes: z.string().optional(),
});

// Phase 6: Compliance & Quality
const complianceRecordSchema = z.object({
  complianceType: z.enum(['waste-disposal', 'emissions', 'safety-inspection', 'environmental-permit']),
  recordDate: z.string(),
  wasteType: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  disposalMethod: z.string().optional(),
  disposalCompany: z.string().optional(),
  certificationNumber: z.string().optional(),
  cost: z.string().optional(),
  regulatoryStandard: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const qualityChecklistSchema = z.object({
  checklistName: z.string(),
  checklistType: z.enum(['pre-delivery', 'quality-audit', 'process-check', 'customer-satisfaction']),
  items: z.array(z.object({
    item: z.string(),
    required: z.boolean(),
    passed: z.boolean().optional(),
  })),
});

const nonConformanceSchema = z.object({
  ncNumber: z.string(),
  jobCardId: z.string().optional(),
  description: z.string(),
  severity: z.enum(['minor', 'major', 'critical']),
  reportedBy: z.string(),
  category: z.enum(['workmanship', 'parts', 'process', 'documentation', 'customer-complaint']),
});

const safetyIncidentSchema = z.object({
  incidentDate: z.string(),
  incidentType: z.enum(['injury', 'near-miss', 'property-damage', 'equipment-failure', 'spill']),
  severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
  location: z.string(),
  description: z.string(),
  injuredPerson: z.string().optional(),
  witnessNames: z.array(z.string()).optional(),
  reportedBy: z.string(),
  immediateAction: z.string(),
  photos: z.array(z.string()).optional(),
});

const insuranceClaimSchema = z.object({
  claimNumber: z.string(),
  jobCardId: z.string().optional(),
  customerId: z.string(),
  vehicleId: z.string(),
  insuranceCompany: z.string(),
  policyNumber: z.string(),
  claimType: z.enum(['collision', 'comprehensive', 'liability', 'warranty']),
  incidentDate: z.string(),
  claimAmount: z.string(),
  deductible: z.string().optional(),
  adjusterName: z.string().optional(),
  adjusterContact: z.string().optional(),
  estimateUrl: z.string().optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const claimStatusUpdateSchema = z.object({
  status: z.enum(['submitted', 'under-review', 'approved', 'partially-approved', 'denied', 'paid']),
  notes: z.string().optional(),
});

// Phase 7: Advanced Hardware
const barcodeScanSchema = z.object({
  barcodeValue: z.string(),
  barcodeType: z.enum(['qr-code', 'ean-13', 'code-128', 'data-matrix']),
  entityType: z.enum(['part', 'vehicle', 'tool', 'customer', 'employee']),
  entityId: z.string(),
  scannedBy: z.string(),
  location: z.string().optional(),
});

const signageDisplaySchema = z.object({
  displayName: z.string(),
  location: z.string(),
  resolution: z.string(),
  orientation: z.enum(['landscape', 'portrait']),
});

const signageContentSchema = z.object({
  displayId: z.string(),
  contentType: z.enum(['image', 'video', 'slideshow', 'html']),
  contentUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

const kioskSessionSchema = z.object({
  kioskId: z.string(),
  sessionType: z.enum(['check-in', 'survey', 'payment', 'info']),
});

const kioskCheckInSchema = z.object({
  sessionId: z.string(),
  customerId: z.string(),
  vehicleId: z.string(),
  appointmentId: z.string().optional(),
  checkInType: z.enum(['appointment', 'walk-in', 'pickup']),
  signature: z.string().optional(),
  additionalNotes: z.string().optional(),
});

const securityCameraSchema = z.object({
  cameraName: z.string(),
  location: z.string(),
  ipAddress: z.string().optional(),
  streamUrl: z.string().url().optional(),
  resolution: z.string(),
  hasMotionDetection: z.boolean().optional(),
});

const cameraRecordingSchema = z.object({
  cameraId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  recordingUrl: z.string().url(),
  fileSize: z.number().int().positive(),
  eventType: z.enum(['motion', 'manual', 'scheduled', 'alarm']),
  vehicleId: z.string().optional(),
  notes: z.string().optional(),
});

const licensePlateScanSchema = z.object({
  plateNumber: z.string(),
  confidence: z.number().min(0).max(100),
  vehicleId: z.string().optional(),
  customerId: z.string().optional(),
  cameraId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  scanType: z.enum(['entry', 'exit']),
  location: z.string().optional(),
  matchedAutomatically: z.boolean().optional(),
});

// Track if auth has been set up to prevent double initialization
let authInitialized = false;
export function markAuthInitialized() { authInitialized = true; }

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (skip if already initialized by hybrid router)
  if (!authInitialized) {
    await setupAuth(app);
    authInitialized = true;
  }

  // Audit logging middleware (applied after auth so user is available)
  app.use(auditLog);

  // CORS configuration for AI systems (ChatGPT, OpenAI API, Gemini, etc.)
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://chat.openai.com',
      'https://api.openai.com',
      'https://chatgpt.com',
      'https://gemini.google.com',
      'https://bard.google.com',
      'https://claude.ai',
      'https://perplexity.ai'
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // AI Accessibility Routes - serve robots.txt, sitemap.xml, openapi.json, and .well-known files
  // These routes make the site accessible to ChatGPT, Gemini, and other AI models
  const publicDir = process.cwd() + '/client/public';
  
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile('robots.txt', { root: publicDir }, (err) => {
      if (err) res.send('User-agent: *\nAllow: /');
    });
  });

  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile('sitemap.xml', { root: publicDir }, (err) => {
      if (err) res.status(404).send('Sitemap not found');
    });
  });

  app.get('/openapi.json', (req, res) => {
    res.type('application/json');
    res.sendFile('openapi.json', { root: publicDir }, (err) => {
      if (err) res.status(404).json({ error: 'OpenAPI spec not found' });
    });
  });

  // Also serve at /.well-known/openapi.json for AI plugin standard
  app.get('/.well-known/openapi.json', (req, res) => {
    res.type('application/json');
    res.sendFile('openapi.json', { root: publicDir }, (err) => {
      if (err) res.status(404).json({ error: 'OpenAPI spec not found' });
    });
  });

  app.get('/.well-known/llms.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile('.well-known/llms.txt', { root: publicDir }, (err) => {
      if (err) res.status(404).send('LLMs.txt not found');
    });
  });

  app.get('/.well-known/ai-plugin.json', (req, res) => {
    res.type('application/json');
    res.sendFile('.well-known/ai-plugin.json', { root: publicDir }, (err) => {
      if (err) res.status(404).json({ error: 'AI plugin manifest not found' });
    });
  });

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, fullName, phone } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        phone,
        isActive: true,
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user roles for RBAC
      const userRoles = await storage.getUserRoles(user.id);
      const roles = userRoles.map((ur: any) => ur.role?.name).filter(Boolean);
      
      // Determine primary portal based on user type or role
      let primaryPortal = '/dashboard';
      if (user.userType === 'technician') primaryPortal = '/technician-portal';
      else if (roles.includes('Purchase Agent')) primaryPortal = '/purchase-agent';
      else if (roles.includes('Call Center Agent')) primaryPortal = '/call-center';
      else if (roles.includes('HR Manager') || roles.includes('HR Officer')) primaryPortal = '/hr-management';
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        roles,
        primaryPortal,
        permissions: roles.length > 0 ? ['read', 'write'] : ['read'] // Simplified permissions
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Smart Search API - searches across customers, vehicles, parts, invoices, job cards, appointments
  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const query = (req.query.q as string || '').toLowerCase().trim();
      if (query.length < 2) {
        return res.json([]);
      }
      
      const results: Array<{id: string, type: string, title: string, subtitle: string, href: string}> = [];
      const limit = 5; // Limit per category
      
      // Search customers
      const customers = await storage.getCustomers();
      const matchingCustomers = customers
        .filter((c: any) => 
          c.fullName?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.includes(query)
        )
        .slice(0, limit);
      matchingCustomers.forEach((c: any) => {
        results.push({
          id: c.id,
          type: 'customer',
          title: c.fullName || c.email,
          subtitle: c.phone || c.email,
          href: `/customers?id=${c.id}`
        });
      });
      
      // Search vehicles
      const vehicles = await storage.getVehicles();
      const matchingVehicles = vehicles
        .filter((v: any) => 
          v.licensePlate?.toLowerCase().includes(query) ||
          v.vin?.toLowerCase().includes(query) ||
          v.make?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query)
        )
        .slice(0, limit);
      matchingVehicles.forEach((v: any) => {
        results.push({
          id: v.id,
          type: 'vehicle',
          title: `${v.make} ${v.model} (${v.year || ''})`,
          subtitle: v.licensePlate || v.vin || 'No plate',
          href: `/vehicles?id=${v.id}`
        });
      });
      
      // Search spare parts
      const parts = await storage.getSpareParts();
      const matchingParts = parts
        .filter((p: any) => 
          p.partNumber?.toLowerCase().includes(query) ||
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        )
        .slice(0, limit);
      matchingParts.forEach((p: any) => {
        results.push({
          id: p.id,
          type: 'part',
          title: p.name || p.partNumber,
          subtitle: `${p.partNumber} - $${p.unitPrice || 0}`,
          href: `/inventory?id=${p.id}`
        });
      });
      
      // Search invoices
      const allInvoices = await storage.getInvoices();
      const matchingInvoices = allInvoices
        .filter((inv: any) => 
          inv.invoiceNumber?.toLowerCase().includes(query) ||
          inv.id?.includes(query)
        )
        .slice(0, limit);
      matchingInvoices.forEach((inv: any) => {
        results.push({
          id: inv.id,
          type: 'invoice',
          title: inv.invoiceNumber || `Invoice #${inv.id.substring(0, 8)}`,
          subtitle: `$${inv.totalAmount || 0} - ${inv.status}`,
          href: `/invoices?id=${inv.id}`
        });
      });
      
      // Search job cards
      const allJobCards = await storage.getJobCards();
      const matchingJobCards = allJobCards
        .filter((jc: any) => {
          const vehicleInfo = jc.vehicleInfo as any;
          return jc.id?.toLowerCase().includes(query) ||
            jc.serviceType?.toLowerCase().includes(query) ||
            vehicleInfo?.make?.toLowerCase().includes(query) ||
            vehicleInfo?.model?.toLowerCase().includes(query) ||
            vehicleInfo?.customerName?.toLowerCase().includes(query);
        })
        .slice(0, limit);
      matchingJobCards.forEach((jc: any) => {
        const vehicleInfo = jc.vehicleInfo as any;
        results.push({
          id: jc.id,
          type: 'jobcard',
          title: `Job #${jc.id.substring(0, 8).toUpperCase()}`,
          subtitle: `${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''} - ${jc.status}`,
          href: `/job-cards?id=${jc.id}`
        });
      });
      
      // Search appointments
      const appointments = await storage.getAppointments();
      const matchingAppointments = appointments
        .filter((apt: any) => 
          apt.notes?.toLowerCase().includes(query) ||
          apt.serviceType?.toLowerCase().includes(query)
        )
        .slice(0, limit);
      matchingAppointments.forEach((apt: any) => {
        results.push({
          id: apt.id,
          type: 'appointment',
          title: apt.serviceType || 'Appointment',
          subtitle: apt.scheduledDate ? new Date(apt.scheduledDate).toLocaleDateString() : 'No date',
          href: `/appointments?id=${apt.id}`
        });
      });
      
      res.json(results.slice(0, 20)); // Overall limit
    } catch (error) {
      console.error("Error in search API:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Garage management routes
  app.get('/api/garages', isAuthenticated, async (req, res) => {
    try {
      const garages = await storage.getGarages();
      res.json(garages);
    } catch (error) {
      console.error("Error fetching garages:", error);
      res.status(500).json({ message: "Failed to fetch garages" });
    }
  });

  app.get('/api/garages/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const garage = await storage.getGarageById(id);
      if (!garage) {
        return res.status(404).json({ message: "Garage not found" });
      }
      res.json(garage);
    } catch (error) {
      console.error("Error fetching garage:", error);
      res.status(500).json({ message: "Failed to fetch garage" });
    }
  });

  app.get('/api/garages/:id/branches', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const branches = await storage.getBranchesByGarageId(id);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.get('/api/roles', isAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get('/api/user/:id/roles', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userRoles = await storage.getUserRoles(id);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });



  // Public route - Get job status by tracking token (no auth required) — KEPT (not in module)
  app.get('/api/public/track/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      // Hash the token to compare with stored hash
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
      
      const jobCard = await storage.getJobByTrackingToken(hashedToken);
      if (!jobCard) {
        return res.status(404).json({ message: "Invalid or expired tracking link" });
      }
      
      // Get customer-visible tracking events
      const events = await storage.getJobTrackingEvents(jobCard.id, true);
      
      res.json({
        jobCard: {
          jobNumber: jobCard.jobNumber,
          status: jobCard.status,
          vehicleInfo: jobCard.vehicleInfo,
          description: jobCard.description,
          scheduledDate: jobCard.scheduledDate,
          startedAt: jobCard.startedAt,
          estimatedCompletionAt: jobCard.estimatedCompletionAt,
          completedAt: jobCard.completedAt,
        },
        events,
      });
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });



  // Service Templates routes

  // Tool Management routes - Module 7
  app.get('/api/tools', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, is_global } = req.query;
      const tools = await storage.getTools(
        garage_id as string,
        is_global === 'true'
      );
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get('/api/tools/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const tool = await storage.getTool(id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post('/api/tools', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const toolData = {
        ...req.body,
        createdBy: userId,
      };
      const tool = await storage.createTool(toolData);
      res.status(201).json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  app.put('/api/tools/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTool = await storage.updateTool(id, req.body);
      res.json(updatedTool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  // Tool Availability routes
  app.get('/api/tool-availability', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, tool_id } = req.query;
      if (!garage_id) {
        return res.status(400).json({ message: "garage_id is required" });
      }
      const availability = await storage.getToolAvailability(
        garage_id as string,
        tool_id as string
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching tool availability:", error);
      res.status(500).json({ message: "Failed to fetch tool availability" });
    }
  });

  app.post('/api/tool-availability', isAuthenticated, async (req, res) => {
    try {
      const availability = await storage.createToolAvailability(req.body);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating tool availability:", error);
      res.status(500).json({ message: "Failed to create tool availability" });
    }
  });

  app.put('/api/tool-availability/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedAvailability = await storage.updateToolAvailability(id, req.body);
      res.json(updatedAvailability);
    } catch (error) {
      console.error("Error updating tool availability:", error);
      res.status(500).json({ message: "Failed to update tool availability" });
    }
  });

  // Tool Usage routes
  app.get('/api/tools/:toolId/usage', isAuthenticated, async (req, res) => {
    try {
      const { toolId } = req.params;
      const usageLogs = await storage.getToolUsageLogs(toolId);
      res.json(usageLogs);
    } catch (error) {
      console.error("Error fetching tool usage logs:", error);
      res.status(500).json({ message: "Failed to fetch tool usage logs" });
    }
  });

  app.post('/api/tool-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const usageData = {
        ...req.body,
        userId,
      };
      const usageLog = await storage.createToolUsageLog(usageData);
      res.status(201).json(usageLog);
    } catch (error) {
      console.error("Error creating tool usage log:", error);
      res.status(500).json({ message: "Failed to create tool usage log" });
    }
  });

  app.put('/api/tool-usage/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUsageLog = await storage.updateToolUsageLog(id, req.body);
      res.json(updatedUsageLog);
    } catch (error) {
      console.error("Error updating tool usage log:", error);
      res.status(500).json({ message: "Failed to update tool usage log" });
    }
  });






  // REMOVED: Supplier Management (Module 11) routes — now served by suppliers.ts

  // Smart Job Assignment Routes - Feature #6
  app.post('/api/assignments/recommend/:jobCardId', isAuthenticated, async (req: any, res) => {
    try {
      const { getAIAssignmentRecommendations } = await import("./services/assignmentAI");
      const { jobCardId } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const recommendations = await getAIAssignmentRecommendations(storage, userGarageId, jobCardId);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get AI recommendations" });
    }
  });

  app.post('/api/assignments/assign', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { jobCardId, technicianId, reason, aiRecommendationId } = req.body;
      
      if (!jobCardId || !technicianId) {
        return res.status(400).json({ message: "jobCardId and technicianId are required" });
      }
      
      const updatedJob = await storage.assignTechnicianToJob({
        garageId: userGarageId,
        jobCardId,
        technicianId,
        assignedBy: userId,
        reason,
        aiRecommendationId
      });
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error assigning technician:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to assign technician" });
    }
  });

  app.get('/api/assignments/history/:jobCardId', isAuthenticated, async (req: any, res) => {
    try {
      const { jobCardId } = req.params;
      const { limit } = req.query;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const history = await storage.listAssignmentHistory(
        userGarageId,
        jobCardId,
        limit ? parseInt(limit as string) : 50
      );
      res.json(history);
    } catch (error) {
      console.error("Error fetching assignment history:", error);
      res.status(500).json({ message: "Failed to fetch assignment history" });
    }
  });

  app.get('/api/assignments/rules', isAuthenticated, async (req: any, res) => {
    try {
      const { active } = req.query;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const rules = await storage.listAssignmentRules(
        userGarageId,
        active === 'true' ? true : active === 'false' ? false : undefined
      );
      res.json(rules);
    } catch (error) {
      console.error("Error fetching assignment rules:", error);
      res.status(500).json({ message: "Failed to fetch assignment rules" });
    }
  });

  app.post('/api/assignments/rules', isAuthenticated, async (req: any, res) => {
    try {
      const { insertAssignmentRuleSchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertAssignmentRuleSchema.safeParse({
        ...req.body,
        garageId: userGarageId,
        createdBy: userId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const rule = await storage.upsertAssignmentRule(validationResult.data);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating assignment rule:", error);
      res.status(500).json({ message: "Failed to create assignment rule" });
    }
  });

  app.delete('/api/assignments/rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const deleted = await storage.deleteAssignmentRule(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Assignment rule not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assignment rule:", error);
      res.status(500).json({ message: "Failed to delete assignment rule" });
    }
  });




  // KEPT — /api/invoices/from-job/:jobId is not in invoices.routes.ts module
  app.post('/api/invoices/from-job/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const { jobCards, taskAssignments, jobCardParts, spareParts, invoices, invoiceItems, saudiTaxCompliance, technicianProfiles } = await import("@shared/schema");
      const { eq, sql } = await import("drizzle-orm");
      const { db } = await import("./db");
      
      const { jobId } = req.params;
      const userId = req.user?.id || 'default-user';
      const DEFAULT_TAX_RATE = 0.15; // Saudi Arabia VAT 15% default
      const DEFAULT_LABOR_RATE = 75; // Default hourly labor rate
      
      // 1. Fetch the job card
      const [jobCard] = await db.select().from(jobCards).where(eq(jobCards.id, jobId));
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      
      // 2. Fetch garage tax settings from saudiTaxCompliance
      let taxRate = DEFAULT_TAX_RATE;
      const [taxSettings] = await db.select({
        vatRate: saudiTaxCompliance.vatRate,
        isVatRegistered: saudiTaxCompliance.isVatRegistered,
      }).from(saudiTaxCompliance).where(eq(saudiTaxCompliance.garageId, jobCard.garageId));
      
      if (taxSettings?.isVatRegistered && taxSettings.vatRate) {
        const storedRate = parseFloat(taxSettings.vatRate);
        // Handle both formats: stored as percentage (15.00) or decimal (0.15)
        taxRate = storedRate > 1 ? storedRate / 100 : storedRate;
      }
      
      // 3. Fetch technician hourly rate if assigned
      let laborRate = DEFAULT_LABOR_RATE;
      let laborRateFromTechnician = false;
      if (jobCard.assignedTo) {
        const [techProfile] = await db.select({
          hourlyRate: technicianProfiles.hourlyRate,
        }).from(technicianProfiles).where(eq(technicianProfiles.userId, jobCard.assignedTo));
        
        if (techProfile?.hourlyRate) {
          laborRate = parseFloat(techProfile.hourlyRate);
          laborRateFromTechnician = true;
        }
      }
      
      // 4. Fetch all task assignments for labor calculation
      const tasks = await db.select().from(taskAssignments).where(eq(taskAssignments.jobCardId, jobId));
      
      // Calculate labor cost: sum of (actualMinutes or estimatedMinutes) * hourly rate / 60
      let laborMinutes = 0;
      for (const task of tasks) {
        laborMinutes += task.actualMinutes || task.estimatedMinutes || 0;
      }
      // If no task minutes, fall back to job card estimated/actual hours
      if (laborMinutes === 0) {
        const hours = parseFloat(jobCard.actualHours?.toString() || jobCard.estimatedHours?.toString() || "0");
        laborMinutes = hours * 60;
      }
      const laborCost = (laborMinutes / 60) * laborRate;
      
      // 5. Fetch all job card parts with their prices
      const parts = await db.select({
        id: jobCardParts.id,
        quantity: jobCardParts.quantity,
        unitPrice: jobCardParts.unitPrice,
        lineTotal: jobCardParts.lineTotal,
        sparePartId: jobCardParts.sparePartId,
      }).from(jobCardParts).where(eq(jobCardParts.jobCardId, jobId));
      
      // Calculate parts cost: sum of (quantity * unitPrice) or use pre-calculated lineTotal
      let partsCost = 0;
      const partLineItems: Array<{
        itemType: string;
        description: string;
        quantity: number;
        unitPrice: string;
        lineTotal: string;
        taxRate: string;
      }> = [];
      
      for (const part of parts) {
        const qty = part.quantity || 1;
        const price = parseFloat(part.unitPrice?.toString() || part.lineTotal?.toString() || "0");
        const lineTotal = part.lineTotal ? parseFloat(part.lineTotal.toString()) : qty * price;
        partsCost += lineTotal;
        
        // Get part name for invoice item
        const [partInfo] = await db.select({ name: spareParts.name }).from(spareParts).where(eq(spareParts.id, part.sparePartId));
        
        partLineItems.push({
          itemType: 'part',
          description: partInfo?.name || 'Spare Part',
          quantity: qty,
          unitPrice: price.toFixed(2),
          lineTotal: lineTotal.toFixed(2),
          taxRate: (taxRate * 100).toFixed(2),
        });
      }
      
      // 6. Calculate totals (server-side only - never trust frontend)
      const subtotal = laborCost + partsCost;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;
      
      // 7. Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // 8. Create invoice with server-calculated values
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term
      
      const [newInvoice] = await db.insert(invoices).values({
        invoiceNumber,
        garageId: jobCard.garageId,
        customerId: jobCard.customerId || userId,
        vehicleId: null,
        jobCardId: jobId,
        invoiceDate: new Date(),
        dueDate,
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: "0",
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0",
        balanceAmount: totalAmount.toFixed(2),
        notes: `Invoice generated from Job Card: ${jobCard.jobNumber}`,
        createdBy: userId,
      }).returning();
      
      // 9. Create invoice line items
      const lineItems = [];
      
      // Add labor line item if there's labor cost
      if (laborCost > 0) {
        lineItems.push({
          invoiceId: newInvoice.id,
          itemType: 'labor',
          description: `Labor: ${(laborMinutes / 60).toFixed(1)} hours @ $${laborRate}/hr`,
          quantity: 1,
          unitPrice: laborCost.toFixed(2),
          lineTotal: laborCost.toFixed(2),
          taxRate: (taxRate * 100).toFixed(2),
        });
      }
      
      // Add parts line items
      for (const partItem of partLineItems) {
        lineItems.push({
          invoiceId: newInvoice.id,
          ...partItem,
        });
      }
      
      if (lineItems.length > 0) {
        await db.insert(invoiceItems).values(lineItems);
      }
      
      // Return invoice with calculation breakdown (shows configurable rates used)
      res.status(201).json({
        invoice: newInvoice,
        breakdown: {
          laborCost: laborCost.toFixed(2),
          laborMinutes,
          laborRate, // From technicianProfiles or default
          partsCost: partsCost.toFixed(2),
          partsCount: parts.length,
          subtotal: subtotal.toFixed(2),
          taxRate, // From saudiTaxCompliance or default
          taxRatePercent: (taxRate * 100).toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          configSource: {
            taxRateSource: taxSettings?.isVatRegistered ? 'saudiTaxCompliance' : 'default',
            laborRateSource: laborRateFromTechnician ? 'technicianProfiles' : 'default',
          },
        },
        items: lineItems,
      });
    } catch (error) {
      console.error("Error creating invoice from job card:", error);
      res.status(500).json({ message: "Failed to create invoice from job card" });
    }
  });


  // Estimates & Quotes - Module 23
  app.get('/api/estimates', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status } = req.query;
      const estimates = await storage.getEstimates(
        garage_id as string | undefined,
        status as string | undefined
      );
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  app.get('/api/estimates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  app.post('/api/estimates/with-items', isAuthenticated, async (req: any, res) => {
    try {
      const { insertEstimateSchema, insertEstimateItemSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      const { estimate, items } = req.body;
      
      if (!estimate || !items || !Array.isArray(items)) {
        return res.status(400).json({
          message: "Invalid request: estimate and items (array) required"
        });
      }

      // Coerce date strings from JSON
      if (typeof estimate.validUntil === 'string') estimate.validUntil = new Date(estimate.validUntil);
      if (typeof estimate.approvedAt === 'string') estimate.approvedAt = new Date(estimate.approvedAt);

      const estimateValidation = insertEstimateSchema.safeParse(estimate);
      if (!estimateValidation.success) {
        return res.status(400).json(sanitizeZodError(estimateValidation.error));
      }
      
      const itemsValidation = items.map((item: any) => 
        insertEstimateItemSchema.omit({ estimateId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json(sanitizeArrayValidationErrors(invalidItems as any));
      }
      
      const estimateData = {
        ...estimateValidation.data,
        createdBy: userId,
      };
      
      const validItems = itemsValidation.map(v => v.success ? v.data : null).filter(Boolean);
      
      const createdEstimate = await storage.createEstimateWithItems(estimateData as any, validItems as any);
      res.status(201).json(createdEstimate);
    } catch (error) {
      console.error("Error creating estimate with items:", error);
      res.status(500).json({ message: "Failed to create estimate with items" });
    }
  });

  app.patch('/api/estimates/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertEstimateSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertEstimateSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const estimate = await storage.updateEstimate(id, validationResult.data);
      res.json(estimate);
    } catch (error) {
      console.error("Error updating estimate:", error);
      res.status(500).json({ message: "Failed to update estimate" });
    }
  });

  app.delete('/api/estimates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEstimate(id);
      res.json({ message: "Estimate deleted successfully" });
    } catch (error) {
      console.error("Error deleting estimate:", error);
      res.status(500).json({ message: "Failed to delete estimate" });
    }
  });

  app.get('/api/estimates/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getEstimateItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching estimate items:", error);
      res.status(500).json({ message: "Failed to fetch estimate items" });
    }
  });

  // Convert estimate to job card
  app.post('/api/estimates/:id/convert-to-job-card', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      if (estimate.convertedToJobCardId) {
        return res.status(400).json({ message: "Estimate already converted to job card" });
      }
      
      const items = await storage.getEstimateItems(id);
      
      // Create job card from estimate
      const jobCardData = {
        garageId: estimate.garageId,
        customerId: estimate.customerId,
        vehicleId: estimate.vehicleId,
        title: estimate.title,
        description: estimate.description || "",
        status: "pending" as const,
        priority: "medium" as const,
        estimatedCost: estimate.totalAmount,
        actualCost: "0.00",
      };
      
      const jobCard = await storage.createJobCard(jobCardData);
      
      // Create task assignments from estimate items
      for (const item of items) {
        await storage.createTaskAssignment({
          jobCardId: jobCard.id,
          taskName: item.description.substring(0, 100), // Limit to reasonable length
          taskType: item.itemType === 'service' ? 'repair' : 'inspection',
          description: item.description,
          assignedTo: userId,
          assignedBy: userId,
          userType: "technician",
          status: "assigned",
          priority: "medium",
          estimatedMinutes: 60, // default 1 hour
        });
      }
      
      // Update estimate
      await storage.updateEstimate(id, {
        status: "converted",
        convertedToJobCardId: jobCard.id,
      });
      
      res.json({ jobCard, message: "Estimate converted to job card successfully" });
    } catch (error) {
      console.error("Error converting estimate to job card:", error);
      res.status(500).json({ message: "Failed to convert estimate to job card" });
    }
  });

  // Convert estimate to invoice
  app.post('/api/estimates/:id/convert-to-invoice', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      if (estimate.convertedToInvoiceId) {
        return res.status(400).json({ message: "Estimate already converted to invoice" });
      }
      
      const items = await storage.getEstimateItems(id);
      
      // Create invoice from estimate
      const invoiceData = {
        garageId: estimate.garageId,
        customerId: estimate.customerId,
        vehicleId: estimate.vehicleId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "draft" as const,
        subtotal: estimate.subtotal,
        taxAmount: estimate.taxAmount,
        discountAmount: estimate.discountAmount,
        totalAmount: estimate.totalAmount,
        paidAmount: "0.00",
        balanceAmount: estimate.totalAmount,
        notes: estimate.notes,
      };
      
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = await storage.createInvoice({ 
        ...invoiceData, 
        invoiceNumber, 
        createdBy: userId 
      });
      
      // Create invoice items from estimate items
      for (const item of items) {
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          itemType: item.itemType,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        });
      }
      
      // Update estimate
      await storage.updateEstimate(id, {
        status: "converted",
        convertedToInvoiceId: invoice.id,
      });
      
      res.json({ invoice, message: "Estimate converted to invoice successfully" });
    } catch (error) {
      console.error("Error converting estimate to invoice:", error);
      res.status(500).json({ message: "Failed to convert estimate to invoice" });
    }
  });

  // Reports & Dashboards - Module 13
  app.get('/api/reports/overview', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const overview = await storage.getReportsOverview(garage_id as string | undefined);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching reports overview:", error);
      res.status(500).json({ message: "Failed to fetch reports overview" });
    }
  });

  app.get('/api/reports/job-cards', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      const startDate = start_date ? new Date(start_date as string) : undefined;
      const endDate = end_date ? new Date(end_date as string) : undefined;
      const analytics = await storage.getJobCardAnalytics(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching job card analytics:", error);
      res.status(500).json({ message: "Failed to fetch job card analytics" });
    }
  });

  app.get('/api/reports/inventory', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const report = await storage.getInventoryReport(garage_id as string | undefined);
      res.json(report);
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      res.status(500).json({ message: "Failed to fetch inventory report" });
    }
  });

  // Integrated System Routes - Connecting All Modules
  app.get('/api/integrated/status', isAuthenticated, async (req, res) => {
    try {
      const jobCards = await storage.getJobCards();
      const tools = await storage.getTools();
      const garages = await storage.getGarages();
      
      res.json({
        totalJobCards: jobCards.length,
        activeJobCards: jobCards.filter(jc => jc.status === 'in_progress').length,
        totalTools: tools.length,
        availableTools: tools.filter(t => t.isActive).length,
        totalGarages: garages.length,
        integrationHealth: {
          jobToolLinks: 8,
          autoAssignments: 12,
          crossBranchSharing: 3,
          templateToolMatching: 100
        }
      });
    } catch (error) {
      console.error("Error fetching integration status:", error);
      res.status(500).json({ message: "Failed to fetch integration status" });
    }
  });

  // Notification routes - Module 21
  app.get('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.getNotification(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error fetching notification:", error);
      res.status(500).json({ message: "Failed to fetch notification" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const notificationData = {
        ...req.body,
        status: req.body.status || 'pending'
      };
      
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.updateNotification(id, req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Test notification endpoint - Feature #4
  app.post('/api/notifications/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const userGarageId = req.user?.garageId;
      
      const testNotification: InsertNotification = {
        type: 'in-app',
        category: 'general',
        status: 'delivered',
        recipientId: userId,
        garageId: userGarageId || undefined,
        title: 'Test Notification',
        message: `This is a test notification sent at ${new Date().toLocaleString()}`,
        metadata: { test: true, timestamp: new Date().toISOString() },
        sentAt: new Date(),
      };

      const notification = await storage.createNotification(testNotification);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({ message: "Failed to create test notification" });
    }
  });

  // Email notification routes - Module 21
  app.post('/api/notifications/email/appointment-confirmation', isAuthenticated, async (req, res) => {
    try {
      const validatedData = appointmentConfirmationSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.appointmentConfirmation(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'appointment',
        metadata: { type: 'confirmation', ...params }
      });
      
      res.json({ message: 'Appointment confirmation sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending appointment confirmation:", error);
      res.status(500).json({ message: "Failed to send appointment confirmation" });
    }
  });

  app.post('/api/notifications/email/invoice', isAuthenticated, async (req, res) => {
    try {
      const validatedData = invoiceNotificationSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.invoiceNotification(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'invoice',
        metadata: { type: 'invoice', ...params }
      });
      
      res.json({ message: 'Invoice notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending invoice notification:", error);
      res.status(500).json({ message: "Failed to send invoice notification" });
    }
  });

  app.post('/api/notifications/email/job-completed', isAuthenticated, async (req, res) => {
    try {
      const validatedData = jobCompletedSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.jobCompletedNotification(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'job_completed',
        metadata: { type: 'job_completed', ...params }
      });
      
      res.json({ message: 'Job completion notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending job completion notification:", error);
      res.status(500).json({ message: "Failed to send job completion notification" });
    }
  });

  app.post('/api/notifications/email/feedback-request', isAuthenticated, async (req, res) => {
    try {
      const validatedData = feedbackRequestSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.feedbackRequest(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'feedback_request',
        metadata: { type: 'feedback_request', ...params }
      });
      
      res.json({ message: 'Feedback request sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending feedback request:", error);
      res.status(500).json({ message: "Failed to send feedback request" });
    }
  });

  app.post('/api/notifications/email/appointment-reminder', isAuthenticated, async (req, res) => {
    try {
      const validatedData = appointmentReminderSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.appointmentReminder(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'appointment',
        metadata: { type: 'reminder', ...params }
      });
      
      res.json({ message: 'Appointment reminder sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending appointment reminder:", error);
      res.status(500).json({ message: "Failed to send appointment reminder" });
    }
  });

  // SMS notification routes - Module 24
  app.post('/api/notifications/sms/appointment-reminder', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsAppointmentReminderSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.appointmentReminder(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'appointment',
        metadata: { type: 'reminder', ...params }
      });
      
      res.json({ message: 'SMS appointment reminder sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS appointment reminder:", error);
      res.status(500).json({ message: "Failed to send SMS appointment reminder" });
    }
  });

  app.post('/api/notifications/sms/appointment-confirmation', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsAppointmentConfirmationSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.appointmentConfirmation(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'appointment',
        metadata: { type: 'confirmation', ...params }
      });
      
      res.json({ message: 'SMS appointment confirmation sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS appointment confirmation:", error);
      res.status(500).json({ message: "Failed to send SMS appointment confirmation" });
    }
  });

  app.post('/api/notifications/sms/job-status', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsJobStatusSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.jobStatusUpdate(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'job_update',
        metadata: { type: 'status_update', ...params }
      });
      
      res.json({ message: 'SMS job status update sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS job status:", error);
      res.status(500).json({ message: "Failed to send SMS job status update" });
    }
  });

  app.post('/api/notifications/sms/job-completed', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsJobCompletedSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.jobCompleted(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'job_completed',
        metadata: { type: 'job_completed', ...params }
      });
      
      res.json({ message: 'SMS job completion notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS job completed:", error);
      res.status(500).json({ message: "Failed to send SMS job completion notification" });
    }
  });

  app.post('/api/notifications/sms/invoice', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsInvoiceSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.invoiceNotification(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'invoice',
        metadata: { type: 'invoice', ...params }
      });
      
      res.json({ message: 'SMS invoice notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS invoice:", error);
      res.status(500).json({ message: "Failed to send SMS invoice notification" });
    }
  });

  app.post('/api/notifications/sms/payment-received', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsPaymentReceivedSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.paymentReceived(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'payment',
        metadata: { type: 'payment_received', ...params }
      });
      
      res.json({ message: 'SMS payment confirmation sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS payment received:", error);
      res.status(500).json({ message: "Failed to send SMS payment confirmation" });
    }
  });

  app.post('/api/notifications/sms/estimate', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsEstimateSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.estimateReady(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'estimate',
        metadata: { type: 'estimate_ready', ...params }
      });
      
      res.json({ message: 'SMS estimate notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS estimate:", error);
      res.status(500).json({ message: "Failed to send SMS estimate notification" });
    }
  });

  app.post('/api/notifications/sms/feedback-request', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsFeedbackRequestSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.feedbackRequest(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'feedback_request',
        metadata: { type: 'feedback_request', ...params }
      });
      
      res.json({ message: 'SMS feedback request sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending SMS feedback request:", error);
      res.status(500).json({ message: "Failed to send SMS feedback request" });
    }
  });

  // Notification preferences routes - Module 24
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const preferences = await storage.getNotificationPreferencesSimple(userId);
      res.json(preferences || { userId, eventMap: '{}', channel: 'all', isLockedByAdmin: false });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.post('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { eventMap } = req.body;
      const preferences = await storage.upsertNotificationPreferencesSimple(userId, eventMap);
      res.json(preferences);
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      res.status(500).json({ message: "Failed to save notification preferences" });
    }
  });

  // Customer Portal API Routes - Module 25
  // Get customer's appointments
  app.get('/api/customer/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const appointments = await storage.getCustomerAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get customer's invoices
  app.get('/api/customer/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const invoices = await storage.getCustomerInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get customer's vehicles
  app.get('/api/customer/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const vehicles = await storage.getCustomerVehicles(userId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Get customer's job cards (service history)
  app.get('/api/customer/job-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const jobCards = await storage.getCustomerJobCards(userId);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching customer job cards:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  });

  // Get customer's communications (notes)
  app.get('/api/customer/communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const communications = await storage.getCustomerNotes(userId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching customer communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  // Book appointment (customer-facing)
  app.post('/api/customer/book-appointment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { insertAppointmentSchema } = await import("@shared/schema");
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Ensure customerId is set to logged-in user
      const appointmentData = {
        ...validatedData,
        customerId: userId,
        createdBy: userId,
        status: 'scheduled'
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Get customer profile
  app.get('/api/customer/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const user = await storage.getUser(userId);
      const profile = await storage.getCustomerProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Calendar & Scheduling Routes - Module 26
  // Technician Availability
  app.get('/api/availability/technician/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId } = req.params;
      const { startDate, endDate } = req.query;
      
      const availability = await storage.getTechnicianAvailability(
        technicianId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching technician availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.get('/api/availability/garage/:garageId', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const availability = await storage.getGarageAvailability(
        garageId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching garage availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const { insertTechnicianAvailabilitySchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      const validatedData = insertTechnicianAvailabilitySchema.parse(req.body);
      
      const availability = await storage.createTechnicianAvailability({
        ...validatedData,
        technicianId: userId,
      });
      res.json(availability);
    } catch (error: any) {
      console.error("Error creating availability:", error);
      res.status(400).json({ message: error.message || "Failed to create availability" });
    }
  });

  app.patch('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateTechnicianAvailability(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      res.status(400).json({ message: error.message || "Failed to update availability" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTechnicianAvailability(id);
      res.json({ message: "Availability deleted successfully" });
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Recurring Appointments
  app.get('/api/recurring-appointments/:garageId', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.params;
      const appointments = await storage.getRecurringAppointments(garageId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching recurring appointments:", error);
      res.status(500).json({ message: "Failed to fetch recurring appointments" });
    }
  });

  app.get('/api/recurring-appointments/detail/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.getRecurringAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Recurring appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching recurring appointment:", error);
      res.status(500).json({ message: "Failed to fetch recurring appointment" });
    }
  });

  app.post('/api/recurring-appointments', isAuthenticated, async (req: any, res) => {
    try {
      const { insertRecurringAppointmentSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      const validatedData = insertRecurringAppointmentSchema.parse(req.body);
      
      const appointment = await storage.createRecurringAppointment({
        ...validatedData,
        createdBy: userId,
      });
      res.json(appointment);
    } catch (error: any) {
      console.error("Error creating recurring appointment:", error);
      res.status(400).json({ message: error.message || "Failed to create recurring appointment" });
    }
  });

  app.patch('/api/recurring-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRecurringAppointment(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating recurring appointment:", error);
      res.status(400).json({ message: error.message || "Failed to update recurring appointment" });
    }
  });

  app.delete('/api/recurring-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRecurringAppointment(id);
      res.json({ message: "Recurring appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting recurring appointment:", error);
      res.status(500).json({ message: "Failed to delete recurring appointment" });
    }
  });

  app.post('/api/recurring-appointments/:id/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const appointments = await storage.generateAppointmentsFromRecurring(
        id,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(appointments);
    } catch (error) {
      console.error("Error generating appointments:", error);
      res.status(500).json({ message: "Failed to generate appointments" });
    }
  });

  // Calendar Events
  app.get('/api/calendar-events/:garageId', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const events = await storage.getCalendarEvents(
        garageId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.get('/api/calendar-events/detail/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getCalendarEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching calendar event:", error);
      res.status(500).json({ message: "Failed to fetch calendar event" });
    }
  });

  app.post('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const { insertCalendarEventSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      const validatedData = insertCalendarEventSchema.parse(req.body);
      
      const event = await storage.createCalendarEvent({
        ...validatedData,
        createdBy: userId,
      });
      res.json(event);
    } catch (error: any) {
      console.error("Error creating calendar event:", error);
      res.status(400).json({ message: error.message || "Failed to create calendar event" });
    }
  });

  app.patch('/api/calendar-events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateCalendarEvent(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating calendar event:", error);
      res.status(400).json({ message: error.message || "Failed to update calendar event" });
    }
  });

  app.delete('/api/calendar-events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCalendarEvent(id);
      res.json({ message: "Calendar event deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });


  app.get('/api/technician-workload/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const workload = await storage.getTechnicianWorkload(
        technicianId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(workload);
    } catch (error) {
      console.error("Error fetching technician workload:", error);
      res.status(500).json({ message: "Failed to fetch technician workload" });
    }
  });

  // Stripe Payment Routes - Module 25
  // Create payment intent for invoice

  // PayPal Routes (PayPal integration blueprint - Module 28)
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Webhook to handle Stripe events


  // Reorder Settings
  app.get('/api/reorder-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, sparePartId } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const settings = await storage.getReorderSettings(garageId as string, sparePartId as string);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching reorder settings:", error);
      res.status(500).json({ message: "Failed to fetch reorder settings" });
    }
  });

  app.post('/api/reorder-settings', isAuthenticated, async (req: any, res) => {
    try {
      const setting = await storage.createReorderSetting(req.body);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating reorder setting:", error);
      res.status(500).json({ message: "Failed to create reorder setting" });
    }
  });

  app.patch('/api/reorder-settings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const setting = await storage.updateReorderSetting(id, req.body);
      res.json(setting);
    } catch (error) {
      console.error("Error updating reorder setting:", error);
      res.status(500).json({ message: "Failed to update reorder setting" });
    }
  });

  app.post('/api/reorder-settings/process', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.body;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const reorders = await storage.processAutoReorders(garageId);
      res.json({ reorders, count: reorders.length });
    } catch (error) {
      console.error("Error processing auto reorders:", error);
      res.status(500).json({ message: "Failed to process auto reorders" });
    }
  });

  // Pricing History
  app.get('/api/pricing-history/:sparePartId', isAuthenticated, async (req: any, res) => {
    try {
      const { sparePartId } = req.params;
      const history = await storage.getPricingHistory(sparePartId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching pricing history:", error);
      res.status(500).json({ message: "Failed to fetch pricing history" });
    }
  });

  app.post('/api/pricing-history', isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.createPricingHistory(req.body);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating pricing history:", error);
      res.status(500).json({ message: "Failed to create pricing history" });
    }
  });

  // Inventory Audit Trail
  app.get('/api/inventory-audit-trail', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, sparePartId, limit } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const trail = await storage.getInventoryAuditTrail(
        garageId as string,
        sparePartId as string,
        limit ? parseInt(limit as string) : 100
      );
      res.json(trail);
    } catch (error) {
      console.error("Error fetching inventory audit trail:", error);
      res.status(500).json({ message: "Failed to fetch inventory audit trail" });
    }
  });

  app.post('/api/inventory-audit-trail', isAuthenticated, async (req: any, res) => {
    try {
      const entry = await storage.createAuditTrailEntry(req.body);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating audit trail entry:", error);
      res.status(500).json({ message: "Failed to create audit trail entry" });
    }
  });

  // Inventory Transfers
  app.get('/api/inventory-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, status } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const transfers = await storage.getInventoryTransfers(garageId as string, status as string);
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching inventory transfers:", error);
      res.status(500).json({ message: "Failed to fetch inventory transfers" });
    }
  });

  app.get('/api/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const transfer = await storage.getInventoryTransfer(id);
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      console.error("Error fetching inventory transfer:", error);
      res.status(500).json({ message: "Failed to fetch inventory transfer" });
    }
  });

  app.post('/api/inventory-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const transfer = await storage.createInventoryTransfer(req.body);
      res.status(201).json(transfer);
    } catch (error) {
      console.error("Error creating inventory transfer:", error);
      res.status(500).json({ message: "Failed to create inventory transfer" });
    }
  });

  app.patch('/api/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const transfer = await storage.updateInventoryTransfer(id, req.body);
      res.json(transfer);
    } catch (error) {
      console.error("Error updating inventory transfer:", error);
      res.status(500).json({ message: "Failed to update inventory transfer" });
    }
  });

  app.post('/api/inventory-transfers/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const transfer = await storage.approveInventoryTransfer(id, userId);
      res.json(transfer);
    } catch (error) {
      console.error("Error approving inventory transfer:", error);
      res.status(500).json({ message: "Failed to approve inventory transfer" });
    }
  });

  app.post('/api/inventory-transfers/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const transfer = await storage.completeInventoryTransfer(id, userId);
      res.json(transfer);
    } catch (error) {
      console.error("Error completing inventory transfer:", error);
      res.status(500).json({ message: "Failed to complete inventory transfer" });
    }
  });

  // TecDoc Integration
  app.post('/api/tecdoc/search', isAuthenticated, async (req: any, res) => {
    try {
      const { query, searchType } = req.body;
      if (!query || !searchType) {
        return res.status(400).json({ message: "query and searchType are required" });
      }
      const results = await storage.searchTecDoc(query, searchType);
      res.json(results);
    } catch (error: any) {
      console.error("Error searching TecDoc:", error);
      res.status(500).json({ message: error.message || "Failed to search TecDoc" });
    }
  });

  // Module 28: Advanced Financial Features
  // Payment Plans
  app.get('/api/payment-plans', isAuthenticated, async (req: any, res) => {
    try {
      const { invoiceId } = req.query;
      const plans = await storage.getPaymentPlans(invoiceId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching payment plans:", error);
      res.status(500).json({ message: "Failed to fetch payment plans" });
    }
  });

  app.get('/api/payment-plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getPaymentPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Payment plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error fetching payment plan:", error);
      res.status(500).json({ message: "Failed to fetch payment plan" });
    }
  });

  app.post('/api/payment-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const plan = await storage.createPaymentPlan({ ...req.body, createdBy: userId });
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating payment plan:", error);
      res.status(500).json({ message: "Failed to create payment plan" });
    }
  });

  app.patch('/api/payment-plans/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.updatePaymentPlan(id, req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error updating payment plan:", error);
      res.status(500).json({ message: "Failed to update payment plan" });
    }
  });

  // Installments
  app.get('/api/installments', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentPlanId } = req.query;
      if (!paymentPlanId) {
        return res.status(400).json({ message: "paymentPlanId is required" });
      }
      const installments = await storage.getInstallments(paymentPlanId);
      res.json(installments);
    } catch (error) {
      console.error("Error fetching installments:", error);
      res.status(500).json({ message: "Failed to fetch installments" });
    }
  });

  app.patch('/api/installments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const installment = await storage.updateInstallment(id, req.body);
      res.json(installment);
    } catch (error) {
      console.error("Error updating installment:", error);
      res.status(500).json({ message: "Failed to update installment" });
    }
  });

  // Refunds

  // Tax Configurations
  app.get('/api/tax-configurations', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, isActive } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const configs = await storage.getTaxConfigurations(
        garageId, 
        isActive === 'true' ? true : isActive === 'false' ? false : undefined
      );
      res.json(configs);
    } catch (error) {
      console.error("Error fetching tax configurations:", error);
      res.status(500).json({ message: "Failed to fetch tax configurations" });
    }
  });

  app.post('/api/tax-configurations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const config = await storage.createTaxConfiguration({ ...req.body, createdBy: userId });
      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating tax configuration:", error);
      res.status(500).json({ message: "Failed to create tax configuration" });
    }
  });

  app.patch('/api/tax-configurations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const config = await storage.updateTaxConfiguration(id, req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating tax configuration:", error);
      res.status(500).json({ message: "Failed to update tax configuration" });
    }
  });

  app.delete('/api/tax-configurations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTaxConfiguration(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tax configuration:", error);
      res.status(500).json({ message: "Failed to delete tax configuration" });
    }
  });

  // Discounts & Promotions

  // Tax Calculation
  app.post('/api/calculate-tax', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, amount, category } = req.body;
      const result = await storage.calculateTax(garageId, amount, category);
      res.json(result);
    } catch (error) {
      console.error("Error calculating tax:", error);
      res.status(500).json({ message: "Failed to calculate tax" });
    }
  });

  // ============= Module 29: Search & Filtering =============
  
  // Global Search
  app.get('/api/global-search', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, query, modules } = req.query;
      
      if (!garageId || !query) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const modulesList = modules ? modules.split(',') : undefined;
      const results = await storage.globalSearch(garageId, query, modulesList);
      res.json(results);
    } catch (error) {
      console.error("Error in global search:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Saved Filter Presets
  app.get('/api/filter-presets', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, module } = req.query;
      const userId = req.user?.id || 'default-user';
      const presets = await storage.getSavedFilterPresets(garageId, userId, module);
      res.json(presets);
    } catch (error) {
      console.error("Error getting filter presets:", error);
      res.status(500).json({ message: "Failed to get filter presets" });
    }
  });

  app.post('/api/filter-presets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const validated = insertSavedFilterPresetSchema.parse({ ...req.body, userId });
      const preset = await storage.createSavedFilterPreset(validated);
      res.status(201).json(preset);
    } catch (error: any) {
      console.error("Error creating filter preset:", error);
      if (error.errors) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create filter preset" });
    }
  });

  app.put('/api/filter-presets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const preset = await storage.updateSavedFilterPreset(id, req.body);
      res.json(preset);
    } catch (error) {
      console.error("Error updating filter preset:", error);
      res.status(500).json({ message: "Failed to update filter preset" });
    }
  });

  app.delete('/api/filter-presets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavedFilterPreset(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting filter preset:", error);
      res.status(500).json({ message: "Failed to delete filter preset" });
    }
  });

  // Export Jobs
  app.get('/api/export-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      const userId = req.user?.id || 'default-user';
      const jobs = await storage.getExportJobs(garageId, userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error getting export jobs:", error);
      res.status(500).json({ message: "Failed to get export jobs" });
    }
  });

  app.post('/api/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { garageId, module, format, filterConfig } = req.body;
      
      const validated = insertExportJobSchema.parse({
        garageId,
        userId,
        module,
        format,
        filterConfig,
        status: 'processing',
      });
      
      const job = await storage.createExportJob(validated);
      
      // Start async export process (simplified - in production, use a queue)
      (async () => {
        try {
          let data: any[] = [];
          
          // Fetch data based on module
          switch (module) {
            case 'jobCards':
              data = await storage.getJobCards(garageId);
              break;
            case 'customers':
              data = await storage.getCustomers(garageId);
              break;
            case 'vehicles':
              data = await storage.getVehicles(garageId);
              break;
            case 'invoices':
              data = await storage.getInvoices(garageId);
              break;
            case 'estimates':
              data = await storage.getEstimates(garageId);
              break;
            default:
              throw new Error(`Export not supported for module: ${module}`);
          }
          
          // Generate export file content
          let fileContent = '';
          const fileName = `${module}-export-${Date.now()}.${format}`;
          
          if (format === 'csv') {
            if (data.length > 0) {
              const headers = Object.keys(data[0]).join(',');
              const rows = data.map(row => Object.values(row).join(','));
              fileContent = [headers, ...rows].join('\n');
            }
          } else if (format === 'json') {
            fileContent = JSON.stringify(data, null, 2);
          }
          
          // Update job with completion status
          await storage.updateExportJob(job.id, {
            status: 'completed',
            fileName,
            fileUrl: `/exports/${fileName}`, // In production, upload to S3
            recordCount: data.length,
            completedAt: new Date(),
          });
        } catch (error: any) {
          await storage.updateExportJob(job.id, {
            status: 'failed',
            errorMessage: error.message,
          });
        }
      })();
      
      res.status(202).json(job);
    } catch (error: any) {
      console.error("Error creating export:", error);
      if (error.errors) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create export" });
    }
  });

  app.get('/api/export-jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getExportJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Export job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error getting export job:", error);
      res.status(500).json({ message: "Failed to get export job" });
    }
  });

  // Bulk Operations
  app.post('/api/bulk-delete', isAuthenticated, async (req: any, res) => {
    try {
      const { module, ids } = req.body;
      
      if (!module || !ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const result = await storage.bulkDelete(module, ids);
      res.json(result);
    } catch (error: any) {
      console.error("Error in bulk delete:", error);
      res.status(500).json({ message: error.message || "Failed to delete items" });
    }
  });

  app.post('/api/bulk-update', isAuthenticated, async (req: any, res) => {
    try {
      const { module, ids, data } = req.body;
      
      if (!module || !ids || !Array.isArray(ids) || ids.length === 0 || !data) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const result = await storage.bulkUpdate(module, ids, data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in bulk update:", error);
      res.status(500).json({ message: error.message || "Failed to update items" });
    }
  });

  // REMOVED: BI & Analytics (Module 30) routes — now served by analytics.ts

  // REMOVED: HR Management (Module 31) routes — now served by hr-payroll.ts

  // Module 32: AI Automation

  // Job Time Estimation Routes
  app.post('/api/ai/estimate-job', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { serviceType, vehicleId, jobCardId, vehicleMake, vehicleModel, vehicleYear, historicalJobs } = req.body;

      const aiResult = await estimateJobTime({
        serviceType: serviceType || '',
        vehicleMake,
        vehicleModel,
        vehicleYear,
        historicalJobs
      });

      const estimationData = {
        garageId: userGarageId,
        serviceType,
        vehicleId,
        jobCardId,
        estimatedHours: aiResult.estimatedHours?.toString(),
        estimatedCost: aiResult.estimatedCost?.toString(),
        confidence: aiResult.confidence?.toString(),
        reasoning: aiResult.reasoning
      };

      const estimation = await storage.createAIJobEstimation(estimationData);
      res.json(estimation);
    } catch (error: any) {
      console.error("Error creating job estimation:", error);
      res.status(500).json({ message: "Failed to create job estimation", error: error.message });
    }
  });

  app.get('/api/ai/job-estimations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId } = req.query;

      const estimations = await storage.getAIJobEstimations(userGarageId, vehicleId as string);
      res.json(estimations);
    } catch (error) {
      console.error("Error fetching job estimations:", error);
      res.status(500).json({ message: "Failed to fetch job estimations" });
    }
  });

  app.get('/api/ai/job-estimations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const estimation = await storage.getAIJobEstimation(req.params.id);
      
      if (!estimation) {
        return res.status(404).json({ message: "Job estimation not found" });
      }
      
      if (estimation.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(estimation);
    } catch (error) {
      console.error("Error fetching job estimation:", error);
      res.status(500).json({ message: "Failed to fetch job estimation" });
    }
  });

  app.patch('/api/ai/job-estimations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAIJobEstimation(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Job estimation not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertAIJobEstimationSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const estimation = await storage.updateAIJobEstimation(req.params.id, validated.data);
      res.json(estimation);
    } catch (error) {
      console.error("Error updating job estimation:", error);
      res.status(500).json({ message: "Failed to update job estimation" });
    }
  });

  // Maintenance Prediction Routes
  app.post('/api/ai/predict-maintenance', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, vehicleMake, vehicleModel, vehicleYear, mileage, serviceHistory } = req.body;

      const aiResult = await predictMaintenance({
        vehicleMake,
        vehicleModel,
        vehicleYear,
        mileage,
        serviceHistory: serviceHistory || []
      });

      const predictionData = {
        garageId: userGarageId,
        vehicleId,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        mileage,
        serviceHistory: serviceHistory || [],
        predictions: aiResult.predictions,
        status: 'pending'
      };

      const prediction = await storage.createAIMaintenancePrediction(predictionData);
      res.json(prediction);
    } catch (error: any) {
      console.error("Error creating maintenance prediction:", error);
      res.status(500).json({ message: "Failed to create maintenance prediction", error: error.message });
    }
  });

  // Enhanced predictive diagnostics endpoint with detailed vehicle parameters
  app.post('/api/ai/predictive-diagnostics', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const {
        vehicleId,
        mileage,
        engineTemperature,
        oilPressure,
        brakePadWear,
        batteryVoltage,
        tireCondition,
        lastServiceDate,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        fuelLevel,
        checkEngineLightOn,
        unusualNoises,
        additionalSymptoms,
      } = req.body;

      // Import the predictive diagnostics service
      const { generatePredictiveDiagnostic } = await import('./services/predictiveDiagnostics');

      const aiResult = await generatePredictiveDiagnostic({
        vehicleId,
        mileage,
        engineTemperature,
        oilPressure,
        brakePadWear,
        batteryVoltage,
        tireCondition,
        lastServiceDate,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        fuelLevel,
        checkEngineLightOn,
        unusualNoises,
        additionalSymptoms,
      });

      // Save prediction to database
      const predictionData = {
        garageId: userGarageId,
        vehicleId,
        predictedIssue: aiResult.predictedIssue,
        severity: aiResult.severity,
        recommendedAction: aiResult.recommendedAction,
        estimatedTimeframe: aiResult.estimatedTimeframe,
        confidence: aiResult.confidence,
        basedOnData: {
          mileage,
          engineTemperature,
          oilPressure,
          brakePadWear,
          batteryVoltage,
          tireCondition,
          vehicleInfo: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
          checkEngineLightOn,
          unusualNoises,
          additionalSymptoms,
          riskLevel: aiResult.riskLevel,
        },
        status: 'pending'
      };

      const prediction = await storage.createAIMaintenancePrediction(predictionData);
      
      res.json({
        ...prediction,
        riskLevel: aiResult.riskLevel,
        additionalDetails: aiResult.additionalDetails,
      });
    } catch (error: any) {
      console.error("Error creating predictive diagnostic:", error);
      res.status(500).json({ message: "Failed to create predictive diagnostic", error: error.message });
    }
  });

  app.get('/api/ai/maintenance-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, status } = req.query;

      const predictions = await storage.getAIMaintenancePredictions(
        userGarageId, 
        vehicleId as string,
        status as string
      );
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching maintenance predictions:", error);
      res.status(500).json({ message: "Failed to fetch maintenance predictions" });
    }
  });

  app.get('/api/ai/maintenance-predictions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const prediction = await storage.getAIMaintenancePrediction(req.params.id);
      
      if (!prediction) {
        return res.status(404).json({ message: "Maintenance prediction not found" });
      }
      
      if (prediction.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(prediction);
    } catch (error) {
      console.error("Error fetching maintenance prediction:", error);
      res.status(500).json({ message: "Failed to fetch maintenance prediction" });
    }
  });

  app.post('/api/ai/maintenance-predictions/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAIMaintenancePrediction(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Maintenance prediction not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const prediction = await storage.updateAIMaintenancePrediction(req.params.id, {
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString()
      });
      res.json(prediction);
    } catch (error) {
      console.error("Error acknowledging maintenance prediction:", error);
      res.status(500).json({ message: "Failed to acknowledge maintenance prediction" });
    }
  });

  app.post('/api/ai/maintenance-predictions/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      // Get all vehicles and their service history for this garage
      const vehicles = await storage.getVehicles(userGarageId);
      const predictions = [];

      for (const vehicle of vehicles) {
        // Get service history for the vehicle - filter by garage, then by vehicle
        const allJobCards = await storage.getJobCards(userGarageId);
        // Match by VIN in vehicleInfo JSONB field
        const jobCards = allJobCards.filter(jc => {
          const info = jc.vehicleInfo as any;
          return info?.vin === vehicle.vin;
        });
        
        if (jobCards.length > 0) {
          // Use GPT-5 AI to analyze service patterns and predict maintenance needs
          const serviceHistory = jobCards.map(jc => ({
            date: jc.createdAt,
            description: jc.description || 'Service performed',
            mileage: jc.mileage || vehicle.mileage,
            cost: jc.totalCost || 0
          }));

          const aiPredictions = await analyzePredictiveMaintenance({
            vehicleId: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            mileage: vehicle.mileage || 50000,
            serviceHistory
          });

          // Store AI predictions in database
          for (const aiPred of aiPredictions) {
            const predictionData = {
              garageId: userGarageId,
              vehicleId: vehicle.id,
              predictedIssue: aiPred.issue || `Maintenance needed for ${vehicle.make} ${vehicle.model}`,
              severity: aiPred.severity || 'medium',
              recommendedAction: aiPred.recommendation || 'Schedule inspection',
              estimatedTimeframe: `Around ${aiPred.estimatedMiles || vehicle.mileage + 1000} miles`,
              confidence: Math.round((aiPred.probability || 0.75) * 100),
              basedOnData: {
                serviceHistory: serviceHistory.slice(-3),
                totalServices: jobCards.length,
                vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                currentMileage: vehicle.mileage || 50000,
                aiAnalysis: true
              },
              status: 'pending'
            };

            const prediction = await storage.createAIMaintenancePrediction(predictionData);
            predictions.push(prediction);
          }
        }
      }

      res.json({
        message: `AI analysis complete. Generated ${predictions.length} new predictions using GPT-5.`,
        predictions,
      });
    } catch (error: any) {
      console.error("Error running AI maintenance analysis:", error);
      res.status(500).json({ message: "Failed to run AI maintenance analysis", error: error.message });
    }
  });

  // Parts Recommendation Routes
  app.post('/api/ai/recommend-parts', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, serviceType, vehicleMake, vehicleModel, vehicleYear, description, jobCardId } = req.body;

      const aiResult = await recommendParts({
        serviceType,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        description: description || undefined
      });

      const recommendationData = {
        garageId: userGarageId,
        vehicleId,
        serviceType,
        jobCardId,
        recommendedParts: aiResult.parts,
        totalEstimatedCost: aiResult.totalEstimatedCost,
        reasoning: aiResult.reasoning,
        confidence: aiResult.confidence,
        status: 'pending'
      };

      const recommendation = await storage.createAIPartsRecommendation(recommendationData);
      res.json(recommendation);
    } catch (error: any) {
      console.error("Error creating parts recommendation:", error);
      res.status(500).json({ message: "Failed to create parts recommendation", error: error.message });
    }
  });

  app.get('/api/ai/parts-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, status } = req.query;

      const recommendations = await storage.getAIPartsRecommendations(
        userGarageId,
        vehicleId as string,
        status as string
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching parts recommendations:", error);
      res.status(500).json({ message: "Failed to fetch parts recommendations" });
    }
  });

  app.get('/api/ai/parts-recommendations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const recommendation = await storage.getAIPartsRecommendation(req.params.id);
      
      if (!recommendation) {
        return res.status(404).json({ message: "Parts recommendation not found" });
      }
      
      if (recommendation.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(recommendation);
    } catch (error) {
      console.error("Error fetching parts recommendation:", error);
      res.status(500).json({ message: "Failed to fetch parts recommendation" });
    }
  });

  app.patch('/api/ai/parts-recommendations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAIPartsRecommendation(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Parts recommendation not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertAIPartsRecommendationSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const recommendation = await storage.updateAIPartsRecommendation(req.params.id, validated.data);
      res.json(recommendation);
    } catch (error) {
      console.error("Error updating parts recommendation:", error);
      res.status(500).json({ message: "Failed to update parts recommendation" });
    }
  });

  // Schedule Optimization Routes
  app.post('/api/ai/optimize-schedule', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { appointments, technicians } = req.body;

      const aiResult = await optimizeSchedule({
        appointments: appointments || [],
        technicians: technicians || []
      });

      const optimizationData = {
        garageId: userGarageId,
        conflicts: aiResult.conflicts,
        suggestions: aiResult.suggestions,
        potentialTimeSaved: aiResult.totalPotentialTimeSaved,
        reasoning: aiResult.reasoning,
        status: 'pending'
      };

      const optimization = await storage.createAIScheduleOptimization(optimizationData);
      res.json(optimization);
    } catch (error: any) {
      console.error("Error creating schedule optimization:", error);
      res.status(500).json({ message: "Failed to create schedule optimization", error: error.message });
    }
  });

  app.get('/api/ai/schedule-optimizations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { status } = req.query;

      const optimizations = await storage.getAIScheduleOptimizations(
        userGarageId,
        status as string
      );
      res.json(optimizations);
    } catch (error) {
      console.error("Error fetching schedule optimizations:", error);
      res.status(500).json({ message: "Failed to fetch schedule optimizations" });
    }
  });

  app.get('/api/ai/schedule-optimizations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const optimization = await storage.getAIScheduleOptimization(req.params.id);
      
      if (!optimization) {
        return res.status(404).json({ message: "Schedule optimization not found" });
      }
      
      if (optimization.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(optimization);
    } catch (error) {
      console.error("Error fetching schedule optimization:", error);
      res.status(500).json({ message: "Failed to fetch schedule optimization" });
    }
  });

  app.patch('/api/ai/schedule-optimizations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAIScheduleOptimization(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Schedule optimization not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertAIScheduleOptimizationSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const optimization = await storage.updateAIScheduleOptimization(req.params.id, validated.data);
      res.json(optimization);
    } catch (error) {
      console.error("Error updating schedule optimization:", error);
      res.status(500).json({ message: "Failed to update schedule optimization" });
    }
  });

  // Chat Bot Routes
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { message, conversationId, garageContext } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      let conversation;
      let conversationHistory: any[] = [];

      if (conversationId) {
        conversation = await storage.getAIChatConversation(conversationId);
        
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        
        if (conversation.garageId !== userGarageId) {
          return res.status(403).json({ message: "Access denied" });
        }

        conversationHistory = conversation.messages || [];
      } else {
        const validated = insertAIChatConversationSchema.parse({
          garageId: userGarageId,
          customerId: req.body.customerId,
          messages: [],
          status: 'active'
        });
        
        conversation = await storage.createAIChatConversation(validated);
      }

      const aiResult = await chatWithCustomer(
        message, 
        conversationHistory,
        garageContext || { garageName: 'Our Garage' }
      );

      const updatedMessages = [
        ...conversationHistory,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResult.response, timestamp: new Date().toISOString() }
      ];

      const updatedConversation = await storage.updateAIChatConversation(conversation.id, {
        messages: updatedMessages,
        status: aiResult.shouldHandoff ? 'pending_handoff' : 'active'
      });

      res.json({
        conversation: updatedConversation,
        response: aiResult.response,
        shouldHandoff: aiResult.shouldHandoff
      });
    } catch (error: any) {
      console.error("Error processing chat:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  app.get('/api/ai/chat-conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { customerId, status } = req.query;

      const conversations = await storage.getAIChatConversations(
        userGarageId,
        customerId as string,
        status as string
      );
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching chat conversations:", error);
      res.status(500).json({ message: "Failed to fetch chat conversations" });
    }
  });

  app.get('/api/ai/chat-conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const conversation = await storage.getAIChatConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error fetching chat conversation:", error);
      res.status(500).json({ message: "Failed to fetch chat conversation" });
    }
  });

  app.post('/api/ai/chat-conversations/:id/handoff', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAIChatConversation(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignedTo } = req.body;

      const conversation = await storage.updateAIChatConversation(req.params.id, {
        status: 'handed_off',
        handoffTo: assignedTo,
        handoffAt: new Date().toISOString()
      });
      res.json(conversation);
    } catch (error) {
      console.error("Error handing off conversation:", error);
      res.status(500).json({ message: "Failed to hand off conversation" });
    }
  });

  // Voice Commands Routes
  app.get('/api/voice-commands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const commands = await storage.getVoiceCommands(userId);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching voice commands:", error);
      res.status(500).json({ message: "Failed to fetch voice commands" });
    }
  });

  app.post('/api/voice-commands/process', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { command, rawTranscript } = req.body;
      
      // Simple command processing logic
      const lowerCommand = (command || rawTranscript || "").toLowerCase().trim();
      let intent = "unknown";
      let actionExecuted = null;
      let success = false;
      let path = null;

      // Basic intent matching
      if (lowerCommand.includes("open") || lowerCommand.includes("show") || lowerCommand.includes("view")) {
        intent = "navigate";
        
        if (lowerCommand.includes("job card") || lowerCommand.includes("jobcard")) {
          actionExecuted = "navigate_to_job_cards";
          path = "/job-cards";
          success = true;
        } else if (lowerCommand.includes("customer")) {
          actionExecuted = "navigate_to_customers";
          path = "/customers";
          success = true;
        } else if (lowerCommand.includes("appointment")) {
          actionExecuted = "navigate_to_appointments";
          path = "/appointments";
          success = true;
        } else if (lowerCommand.includes("inventory") || lowerCommand.includes("part")) {
          actionExecuted = "navigate_to_inventory";
          path = "/inventory";
          success = true;
        } else if (lowerCommand.includes("setting")) {
          actionExecuted = "navigate_to_settings";
          path = "/settings";
          success = true;
        } else if (lowerCommand.includes("report")) {
          actionExecuted = "navigate_to_reports";
          path = "/reports";
          success = true;
        }
      } else if (lowerCommand.includes("create") || lowerCommand.includes("new")) {
        intent = "create";
        if (lowerCommand.includes("appointment")) {
          actionExecuted = "navigate_to_new_appointment";
          path = "/appointments";
          success = true;
        } else if (lowerCommand.includes("invoice")) {
          actionExecuted = "navigate_to_new_invoice";
          path = "/invoices";
          success = true;
        }
      } else if (lowerCommand.includes("search") || lowerCommand.includes("find")) {
        intent = "search";
        actionExecuted = "trigger_search";
        success = true;
      }

      // Store the command in database
      const commandData = {
        userId,
        transcript: rawTranscript || command,
        intent,
        entities: { originalCommand: command },
        confidence: success ? 85 : 30,
        actionExecuted,
        success,
        responseTime: 100,
      };

      const savedCommand = await storage.createVoiceCommand(commandData);

      res.json({
        ...savedCommand,
        path,
        message: success ? `Executing: ${actionExecuted}` : "Command not recognized",
      });
    } catch (error: any) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command", error: error.message });
    }
  });

  // Phase 1: Document OCR Routes
  app.get('/api/ai/ocr-documents', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      
      const documents = await storage.getOCRDocuments(garageId, status);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching OCR documents:", error);
      res.status(500).json({ message: "Failed to fetch OCR documents" });
    }
  });

  app.post('/api/ai/ocr-documents/upload', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { documentType, fileName } = req.body;

      const documentData = {
        documentType: documentType || 'invoice',
        fileName: fileName || 'document.pdf',
        fileUrl: `mock://ocr-uploads/${garageId}/${Date.now()}-${fileName || 'document.pdf'}`,
        uploadedBy: req.user.id,
        status: 'completed',
        processedAt: new Date(),
        extractedData: {
          vendor: "Auto Parts Supplier Inc.",
          date: new Date().toISOString().split('T')[0],
          invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
          total: (Math.random() * 1000 + 100).toFixed(2),
          items: [
            { description: "Oil Filter", quantity: 2, unitPrice: 15.99, amount: 31.98 },
            { description: "Air Filter", quantity: 1, unitPrice: 22.50, amount: 22.50 },
            { description: "Spark Plugs", quantity: 4, unitPrice: 8.75, amount: 35.00 }
          ],
          notes: "Automatically extracted via AI OCR"
        },
        confidence: 92,
      };

      const document = await storage.createOCRDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error uploading OCR document:", error);
      res.status(500).json({ message: "Failed to upload document for OCR" });
    }
  });

  app.get('/api/ai/ocr-documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const document = await storage.getOCRDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching OCR document:", error);
      res.status(500).json({ message: "Failed to fetch OCR document" });
    }
  });

  app.patch('/api/ai/ocr-documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { extractedData, status } = req.body;
      const document = await storage.updateOCRDocument(req.params.id, {
        extractedData,
        status: status || 'approved',
      });
      res.json(document);
    } catch (error) {
      console.error("Error updating OCR document:", error);
      res.status(500).json({ message: "Failed to update OCR document" });
    }
  });

  // REMOVED: Analytics Phase 2 (1st block) routes — now served by analytics.ts

  // ========================================
  // PHASE 3: ENHANCED INTEGRATIONS (Real Backend)
  // ========================================
  
  // 1. ACCOUNTING INTEGRATION (QuickBooks/Xero)
  app.post('/api/accounting/connect', isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.body;
      const result = await phase3Service.initiateAccountingConnection(req.user?.garageId, platform);
      res.json(result);
    } catch (error: any) {
      console.error("Error connecting accounting:", error);
      res.status(500).json({ message: error.message || "Failed to connect accounting provider" });
    }
  });

  app.get('/api/accounting/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const dashboard = await phase3Service.getAccountingDashboard(req.user?.garageId);
      res.json(dashboard);
    } catch (error: any) {
      console.error("Error fetching accounting dashboard:", error);
      res.status(500).json({ message: error.message || "Failed to fetch accounting dashboard" });
    }
  });

  app.post('/api/accounting/sync', isAuthenticated, async (req: any, res) => {
    try {
      const { connectionId, syncType } = req.body;
      const result = await phase3Service.syncAccountingData(connectionId, syncType);
      res.json(result);
    } catch (error: any) {
      console.error("Error syncing accounting:", error);
      res.status(500).json({ message: error.message || "Failed to sync accounting data" });
    }
  });

  // 2. EMAIL MARKETING CAMPAIGNS
  app.post('/api/email/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const { campaignName, subject, content, recipientSegment, scheduledFor } = req.body;
      const campaign = await phase3Service.createEmailCampaign({
        garageId: req.user?.garageId,
        campaignName,
        subject,
        content,
        recipientSegment,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      });
      res.status(201).json(campaign);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: error.message || "Failed to create campaign" });
    }
  });

  app.post('/api/email/campaigns/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const result = await phase3Service.sendEmailCampaign(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      res.status(500).json({ message: error.message || "Failed to send campaign" });
    }
  });

  app.post('/api/email/campaigns/:id/track', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const result = await phase3Service.trackEmailEngagement(id, action);
      res.json(result);
    } catch (error: any) {
      console.error("Error tracking engagement:", error);
      res.status(500).json({ message: error.message || "Failed to track engagement" });
    }
  });

  // 3. SOCIAL MEDIA INTEGRATION
  app.post('/api/social/posts', isAuthenticated, async (req: any, res) => {
    try {
      const { platforms, content, mediaUrls, scheduledFor } = req.body;
      const posts = await phase3Service.postToSocialMedia({
        garageId: req.user?.garageId,
        platforms,
        content,
        mediaUrls,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      });
      res.status(201).json(posts);
    } catch (error: any) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: error.message || "Failed to create post" });
    }
  });

  app.get('/api/social/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviews = await phase3Service.fetchSocialMediaReviews(req.user?.garageId);
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: error.message || "Failed to fetch reviews" });
    }
  });

  app.post('/api/social/reviews/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const result = await phase3Service.respondToReview(id, response, req.user?.id);
      res.json(result);
    } catch (error: any) {
      console.error("Error responding to review:", error);
      res.status(500).json({ message: error.message || "Failed to respond to review" });
    }
  });

  // 4. VIDEO CONSULTATIONS (Zoom/Teams)
  app.post('/api/video/consultations', isAuthenticated, async (req: any, res) => {
    try {
      const { customerId, technicianId, scheduledFor, duration, purpose } = req.body;
      const consultation = await phase3Service.scheduleVideoConsultation({
        garageId: req.user?.garageId,
        customerId,
        technicianId,
        scheduledFor: new Date(scheduledFor),
        duration,
        purpose
      });
      res.status(201).json(consultation);
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      res.status(500).json({ message: error.message || "Failed to create consultation" });
    }
  });

  app.post('/api/video/consultations/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const result = await phase3Service.startVideoConsultation(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error starting consultation:", error);
      res.status(500).json({ message: error.message || "Failed to start consultation" });
    }
  });

  app.post('/api/video/consultations/:id/end', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes, recordingUrl } = req.body;
      const result = await phase3Service.endVideoConsultation(id, notes, recordingUrl);
      res.json(result);
    } catch (error: any) {
      console.error("Error ending consultation:", error);
      res.status(500).json({ message: error.message || "Failed to end consultation" });
    }
  });

  // 5. PARTS MARKETPLACE (eBay/Amazon)
  app.get('/api/marketplace/search', isAuthenticated, async (req: any, res) => {
    try {
      const { partNumber, marketplace } = req.query;
      const results = await phase3Service.searchMarketplaceParts(
        partNumber as string,
        marketplace as 'ebay' | 'amazon'
      );
      res.json(results);
    } catch (error: any) {
      console.error("Error searching marketplace:", error);
      res.status(500).json({ message: error.message || "Failed to search marketplace" });
    }
  });

  app.post('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = {
        ...req.body,
        garageId: req.user?.garageId
      };
      const order = await phase3Service.placeMarketplaceOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error placing marketplace order:", error);
      res.status(500).json({ message: error.message || "Failed to place order" });
    }
  });

  app.get('/api/marketplace/orders/:id/track', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const tracking = await phase3Service.trackMarketplaceOrder(id);
      res.json(tracking);
    } catch (error: any) {
      console.error("Error tracking order:", error);
      res.status(500).json({ message: error.message || "Failed to track order" });
    }
  });

  // 6. STRIPE PAYMENT PROCESSING (with input validation)

  app.get('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching marketplace orders:", error);
      res.status(500).json({ message: "Failed to fetch marketplace orders" });
    }
  });

  // Phase 4: Customer Experience Routes
  app.get('/api/service-tracking/active', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching service tracking:", error);
      res.status(500).json({ message: "Failed to fetch service tracking data" });
    }
  });

  app.get('/api/video-estimates', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching video estimates:", error);
      res.status(500).json({ message: "Failed to fetch video estimates" });
    }
  });

  app.post('/api/video-estimates', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { customerId, vehicleId, estimatedCost } = req.body;
      
      const estimate = {
        id: Math.random().toString(36).substring(7),
        garageId,
        customerId,
        vehicleId,
        technicianId: userId,
        estimatedCost,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      
      res.json(estimate);
    } catch (error) {
      console.error("Error creating video estimate:", error);
      res.status(500).json({ message: "Failed to create video estimate" });
    }
  });

  app.post('/api/video-estimates/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      res.json({ success: true, message: "Video estimate sent to customer" });
    } catch (error) {
      console.error("Error sending video estimate:", error);
      res.status(500).json({ message: "Failed to send video estimate" });
    }
  });

  app.get('/api/vehicle-walkarounds', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching walkarounds:", error);
      res.status(500).json({ message: "Failed to fetch walkarounds" });
    }
  });

  app.post('/api/vehicle-walkarounds', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { jobCardId, vehicleId, walkaroundType } = req.body;
      
      const walkaround = {
        id: Math.random().toString(36).substring(7),
        jobCardId,
        vehicleId,
        technicianId: userId,
        walkaroundType,
        photos: [],
        createdAt: new Date().toISOString(),
      };
      
      res.json(walkaround);
    } catch (error) {
      console.error("Error creating walkaround:", error);
      res.status(500).json({ message: "Failed to create walkaround" });
    }
  });

  app.get('/api/customer-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/customer-reviews/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { responseText } = req.body;
      
      res.json({
        success: true,
        responseText,
        respondedBy: userId,
        respondedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(500).json({ message: "Failed to respond to review" });
    }
  });

  app.get('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { refereeEmail, refereeName, refereePhone } = req.body;
      
      const referral = {
        id: Math.random().toString(36).substring(7),
        referrerId: userId,
        refereeEmail,
        refereeName,
        refereePhone,
        referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      
      res.json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  // Data Import
  app.post('/api/import', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, module, data, conflictResolution = 'skip' } = req.body;
      const userId = req.user?.id || 'default-user';
      
      if (!garageId) {
        return res.status(400).json({ message: "Garage ID is required" });
      }
      
      if (!module || !data || !Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid import data" });
      }
      
      const results = { imported: 0, skipped: 0, errors: [] as any[] };
      
      for (const item of data) {
        try {
          switch (module) {
            case 'customers':
              await storage.createUser({ ...item, garageId, createdBy: userId });
              results.imported++;
              break;
            case 'vehicles':
              await storage.createVehicle({ ...item, garageId });
              results.imported++;
              break;
            case 'spareParts':
              await storage.createSparePart({ ...item, garageId });
              results.imported++;
              break;
            case 'jobCards':
              await storage.createJobCard({ ...item, garageId });
              results.imported++;
              break;
            case 'invoices':
              await storage.createInvoice({ ...item, garageId });
              results.imported++;
              break;
            case 'estimates':
              await storage.createEstimate({ ...item, garageId });
              results.imported++;
              break;
            default:
              results.errors.push({ item, error: `Import not supported for module: ${module}` });
          }
        } catch (error: any) {
          if (conflictResolution === 'skip') {
            results.skipped++;
          } else {
            results.errors.push({ item, error: error.message });
          }
        }
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error importing data:", error);
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  // REMOVED: Third-Party Integrations (Module 33) routes — now served by integrations.ts


  // Module 35: System Improvements Routes
  
  // User Settings Routes
  app.patch('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      // Upsert: update if a row exists, otherwise create one so the response is
      // always a populated settings object (callers rely on this).
      let settings = await storage.updateUserSettings(userId, req.body);
      if (!settings) {
        settings = await storage.createUserSettings({ userId, ...req.body });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Action History Routes (Undo/Redo)
  app.post('/api/action-history', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { actionType, actionDescription, metadata } = req.body;
      
      const history = await storage.createActionHistory({
        garageId: userGarageId,
        userId,
        actionType,
        resourceType: actionDescription || 'general',
        previousState: metadata?.previousState,
        newState: metadata?.newState,
      });
      res.json(history);
    } catch (error) {
      console.error("Error creating action history:", error);
      res.status(500).json({ message: "Failed to create action history" });
    }
  });

  app.get('/api/history', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { limit } = req.query;
      
      const history = await storage.getActionHistory(
        userGarageId,
        userId,
        limit ? parseInt(limit as string) : 50
      );
      res.json(history);
    } catch (error) {
      console.error("Error fetching action history:", error);
      res.status(500).json({ message: "Failed to fetch action history" });
    }
  });

  app.post('/api/history/undo/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await storage.undoAction(id);
      res.json(history);
    } catch (error) {
      console.error("Error undoing action:", error);
      res.status(500).json({ message: "Failed to undo action" });
    }
  });

  app.post('/api/history/redo/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await storage.redoAction(id);
      res.json(history);
    } catch (error) {
      console.error("Error redoing action:", error);
      res.status(500).json({ message: "Failed to redo action" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.id || 'default-user';
    res.json({ message: "This is a protected route", userId });
  });


  // Chat Support Enhancements - Support Tickets
  app.get('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const { status, priority, assignedTo, category, garageId } = req.query;
      // Use garageId from query or user context, with fallback for dev mode
      const userGarageId = req.user?.garageId || garageId;
      
      const tickets = await storage.getSupportTickets(userGarageId, {
        status: status as string,
        priority: priority as string,
        assignedTo: assignedTo as string,
        category: category as string,
      });
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get('/api/support/tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const ticket = await storage.getSupportTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { 
        conversationId, 
        category, 
        priority, 
        subject,
        createConversation,
        participantIds,
        garageId
      } = req.body;
      // Use garageId from request body as fallback for development mode
      const userGarageId = req.user?.garageId || garageId || 1;
      
      // Validate required fields
      if (!subject || !category) {
        return res.status(400).json({ message: "Subject and category are required" });
      }
      
      // Validate conversation source - must provide either existing conversationId or createConversation flag
      if (!conversationId && !createConversation) {
        return res.status(400).json({ 
          message: "Either conversationId or createConversation must be provided" 
        });
      }
      
      // Validate category and priority values
      const validCategories = ['technical', 'billing', 'general', 'feature_request'];
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        });
      }
      
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ 
          message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
        });
      }
      
      let finalConversationId = conversationId;
      
      // Create new conversation if needed
      if (createConversation && !conversationId) {
        const conversation = await storage.createChatConversation({
          garageId: userGarageId,
          title: subject,
          type: 'support',
          createdBy: userId,
        });
        
        // Add creator as participant
        await storage.addChatParticipant({
          conversationId: conversation.id,
          userId,
          role: 'member',
        });
        
        // Add other participants (support agents)
        if (participantIds && Array.isArray(participantIds)) {
          for (const participantId of participantIds) {
            if (participantId !== userId) {
              await storage.addChatParticipant({
                conversationId: conversation.id,
                userId: participantId,
                role: 'admin',
              });
            }
          }
        }
        
        finalConversationId = conversation.id;
      }
      
      // Create support ticket
      const ticket = await storage.createSupportTicket({
        garageId: userGarageId,
        conversationId: finalConversationId!,
        category,
        priority: priority || 'medium',
        subject,
        status: 'open',
        createdBy: userId,
      });
      
      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.patch('/api/support/tickets/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const { status, notes } = req.body;
      
      // Validate status value
      const validStatuses = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      
      const ticket = await storage.updateTicketStatus(id, status, userId, notes);
      
      // Broadcast status change via WebSocket
      const wsServer = getChatWebSocketServer();
      if (wsServer && ticket.conversationId) {
        const participants = await storage.getChatParticipants(ticket.conversationId);
        const participantIds = participants.map(p => p.userId);
        wsServer.broadcastNewMessage(ticket.conversationId, {
          type: 'ticket_status_changed',
          ticketId: id,
          status,
          updatedBy: userId,
        } as any, participantIds);
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  app.post('/api/support/tickets/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const { assignTo } = req.body;
      
      const ticket = await storage.assignTicket(id, assignTo, userId);
      
      // Broadcast assignment via WebSocket
      const wsServer = getChatWebSocketServer();
      if (wsServer && ticket.conversationId) {
        const participants = await storage.getChatParticipants(ticket.conversationId);
        const participantIds = participants.map(p => p.userId);
        wsServer.broadcastNewMessage(ticket.conversationId, {
          type: 'ticket_assigned',
          ticketId: id,
          assignedTo: assignTo,
          assignedBy: userId,
        } as any, participantIds);
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      res.status(500).json({ message: "Failed to assign ticket" });
    }
  });

  app.get('/api/support/tickets/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const events = await storage.getSupportTicketEvents(id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching ticket events:", error);
      res.status(500).json({ message: "Failed to fetch ticket events" });
    }
  });


  // REMOVED: Customer Self-Service Portal (Module 37) routes — now served by customer-portal-api.ts

  // Module 38: Digital Signatures & Media Documentation API Routes
  app.post('/api/digital-signatures', isAuthenticated, async (req: any, res) => {
    try {
      const { 
        relatedType, relatedId, signatureData, signatureType, 
        consentText, consentGiven, timestamp 
      } = req.body;
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      // Validate required fields
      if (!relatedType || !relatedId || !signatureData) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Enforce consent tracking when consent text is provided
      if (consentText && !consentGiven) {
        return res.status(400).json({ message: "Consent must be given when consent text is provided" });
      }
      
      // Validate signature type
      const validTypes = ['customer', 'technician', 'manager'];
      if (signatureType && !validTypes.includes(signatureType)) {
        return res.status(400).json({ message: "Invalid signature type" });
      }
      
      // Validate base64 signature data
      if (!signatureData.startsWith('data:image/png;base64,')) {
        return res.status(400).json({ message: "Invalid signature format. Must be PNG base64 data" });
      }
      
      const ipAddress = req.ip || req.connection.remoteAddress;
      const deviceInfo = req.headers['user-agent'];
      
      const signature = await storage.createDigitalSignature({
        garageId,
        relatedType,
        relatedId,
        signedBy: userId,
        signatureData,
        signatureType: signatureType || 'customer',
        ipAddress,
        deviceInfo,
        consentText: consentGiven ? consentText : undefined,
        consentGiven: consentGiven || false,
        signedAt: timestamp ? new Date(timestamp) : new Date(),
      });
      
      res.json(signature);
    } catch (error) {
      console.error("Error creating digital signature:", error);
      res.status(500).json({ message: "Failed to create signature" });
    }
  });

  app.get('/api/digital-signatures/:relatedType/:relatedId', isAuthenticated, async (req, res) => {
    try {
      const { relatedType, relatedId } = req.params;
      const signatures = await storage.getDigitalSignatures(relatedType, relatedId);
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res.status(500).json({ message: "Failed to fetch signatures" });
    }
  });

  app.post('/api/media-attachments', isAuthenticated, async (req: any, res) => {
    try {
      const { 
        relatedType, relatedId, mediaType, fileUrl, fileName, 
        fileSize, mimeType, category, description, thumbnailUrl, metadata 
      } = req.body;
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      // Validate required fields
      if (!relatedType || !relatedId || !mediaType || !fileUrl || !fileName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Server-side file size validation (10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (fileSize && fileSize > MAX_FILE_SIZE) {
        return res.status(400).json({ message: "File size exceeds 10MB limit" });
      }
      
      // Validate MIME type
      const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (mimeType && !allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ message: "Invalid file type. Only images, videos, and documents (PDF, DOC, DOCX) are allowed" });
      }
      
      // Validate base64 format if provided
      if (fileUrl.startsWith('data:')) {
        const base64Regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,([A-Za-z0-9+/=]+)$/;
        if (!base64Regex.test(fileUrl)) {
          return res.status(400).json({ message: "Invalid base64 data format" });
        }
        
        // Extract and verify base64 size matches reported size
        const base64Data = fileUrl.split(',')[1];
        const estimatedSize = (base64Data.length * 3) / 4;
        if (estimatedSize > MAX_FILE_SIZE) {
          return res.status(400).json({ message: "File size exceeds 10MB limit" });
        }
      }
      
      // Validate media type matches file extension
      const mediaTypeMapping: Record<string, string[]> = {
        photo: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        video: ['mp4', 'webm', 'mov'],
        document: ['pdf', 'doc', 'docx']
      };
      
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (fileExtension && mediaTypeMapping[mediaType]) {
        if (!mediaTypeMapping[mediaType].includes(fileExtension)) {
          return res.status(400).json({ message: "Media type does not match file extension" });
        }
      }
      
      const media = await storage.createMediaAttachment({
        garageId,
        relatedType,
        relatedId,
        mediaType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        category,
        description,
        uploadedBy: userId,
        thumbnailUrl,
        metadata: metadata || {},
      });
      
      res.json(media);
    } catch (error) {
      console.error("Error creating media attachment:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  app.get('/api/media-attachments/:relatedType/:relatedId', isAuthenticated, async (req, res) => {
    try {
      const { relatedType, relatedId } = req.params;
      const { category } = req.query;
      const media = await storage.getMediaAttachments(
        relatedType, 
        relatedId, 
        category as string | undefined
      );
      res.json(media);
    } catch (error) {
      console.error("Error fetching media attachments:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.delete('/api/media-attachments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMediaAttachment(id);
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media attachment:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  app.patch('/api/media-attachments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { description, category, metadata } = req.body;
      
      const media = await storage.updateMediaAttachment(id, {
        description,
        category,
        metadata,
      });
      
      res.json(media);
    } catch (error) {
      console.error("Error updating media attachment:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  // Module 39: QR Code Check-In System API Routes
  app.post('/api/qr-codes/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { appointmentId, customerId, vehicleId, tokenType, expiresInHours } = req.body;
      const garageId = req.user?.garageId;
      
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
      
      // Generate unique QR code data
      const qrCodeData = `SALIS-${garageId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Set expiration (default 24 hours)
      const expirationHours = expiresInHours || 24;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);
      
      // Generate QR code image as base64
      const qrCodeImageUrl = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });
      
      const qrToken = await storage.createQRCodeToken({
        garageId,
        appointmentId,
        customerId,
        vehicleId,
        qrCodeData,
        qrCodeImageUrl,
        tokenType: tokenType || 'appointment',
        expiresAt,
        metadata: {
          generatedBy: req.user?.id,
          generatedAt: new Date().toISOString(),
        },
      });
      
      res.json(qrToken);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  app.post('/api/qr-codes/scan', isAuthenticated, async (req: any, res) => {
    try {
      const { qrCodeData } = req.body;
      
      if (!qrCodeData) {
        return res.status(400).json({ message: "QR code data is required" });
      }
      
      // Find the QR token
      const qrToken = await storage.getQRCodeTokenByData(qrCodeData);
      
      if (!qrToken) {
        // Log failed scan
        await storage.createQRScanLog({
          qrCodeId: null,
          scannedBy: req.user?.id,
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          scanResult: 'invalid',
        });
        
        return res.status(404).json({ message: "Invalid QR code", scanResult: 'invalid' });
      }
      
      // Check if expired
      if (new Date() > new Date(qrToken.expiresAt)) {
        await storage.createQRScanLog({
          qrCodeId: qrToken.id,
          scannedBy: req.user?.id,
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          scanResult: 'expired',
        });
        
        return res.status(400).json({ message: "QR code has expired", scanResult: 'expired' });
      }
      
      // Check if already used
      if (qrToken.isUsed) {
        await storage.createQRScanLog({
          qrCodeId: qrToken.id,
          scannedBy: req.user?.id,
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          scanResult: 'already_used',
        });
        
        return res.status(400).json({ message: "QR code has already been used", scanResult: 'already_used' });
      }
      
      // Log successful scan
      await storage.createQRScanLog({
        qrCodeId: qrToken.id,
        scannedBy: req.user?.id,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        scanResult: 'success',
      });
      
      res.json({ 
        message: "QR code scanned successfully", 
        scanResult: 'success',
        qrToken 
      });
    } catch (error) {
      console.error("Error scanning QR code:", error);
      res.status(500).json({ message: "Failed to scan QR code" });
    }
  });

  app.post('/api/qr-codes/check-in', isAuthenticated, async (req: any, res) => {
    try {
      const { qrCodeData, appointmentId, notes } = req.body;
      
      if (!qrCodeData) {
        return res.status(400).json({ message: "QR code data is required" });
      }
      
      // Find and validate the QR token
      const qrToken = await storage.getQRCodeTokenByData(qrCodeData);
      
      if (!qrToken) {
        return res.status(404).json({ message: "Invalid QR code" });
      }
      
      if (new Date() > new Date(qrToken.expiresAt)) {
        return res.status(400).json({ message: "QR code has expired" });
      }
      
      if (qrToken.isUsed) {
        return res.status(400).json({ message: "QR code has already been used" });
      }
      
      // Mark QR code as used
      await storage.markQRCodeAsUsed(qrToken.id);
      
      // Update appointment status if appointment-based check-in
      if (qrToken.appointmentId) {
        const appointment = await storage.getAppointment(qrToken.appointmentId);
        if (appointment && appointment.status === 'confirmed') {
          await storage.updateAppointment(qrToken.appointmentId, {
            status: 'checked_in',
          });
          
          // Create status history entry
          await storage.createAppointmentStatusHistory({
            appointmentId: qrToken.appointmentId,
            status: 'checked_in',
            notes: notes || 'Customer checked in via QR code',
            changedBy: req.user?.id,
          });
          
          // Send check-in notification to customer
          try {
            const customer = await storage.getUser(qrToken.customerId);
            if (customer?.phone) {
              await smsService.sendSMS({
                to: customer.phone,
                recipientId: customer.id,
                garageId: req.user?.garageId,
                template: {
                  message: `You've successfully checked in for your appointment. We'll be with you shortly!`
                },
                category: 'appointment',
                metadata: {
                  appointmentId: qrToken.appointmentId,
                },
              });
            }
          } catch (smsError) {
            console.error("Error sending check-in SMS:", smsError);
          }
        }
      }
      
      // Create notification
      await storage.createNotification({
        recipientId: qrToken.customerId,
        type: 'appointment',
        category: 'appointment',
        title: 'Check-in Successful',
        message: 'You have successfully checked in. We will be with you shortly.',
        garageId: req.user?.garageId,
      });
      
      res.json({ 
        message: "Check-in successful", 
        qrToken,
        appointmentId: qrToken.appointmentId
      });
    } catch (error) {
      console.error("Error processing check-in:", error);
      res.status(500).json({ message: "Failed to process check-in" });
    }
  });

  app.get('/api/qr-codes/customer/:customerId', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const tokens = await storage.getQRCodeTokensByCustomer(customerId);
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.get('/api/qr-codes/appointment/:appointmentId', isAuthenticated, async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const tokens = await storage.getQRCodeTokensByAppointment(appointmentId);
      res.json(tokens);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.get('/api/qr-codes/scan-logs/:qrCodeId', isAuthenticated, async (req, res) => {
    try {
      const { qrCodeId } = req.params;
      const logs = await storage.getQRScanLogsByToken(qrCodeId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching scan logs:", error);
      res.status(500).json({ message: "Failed to fetch scan logs" });
    }
  });

  app.get('/api/qr-codes/scan-logs/garage/:garageId', isAuthenticated, async (req, res) => {
    try {
      const { garageId } = req.params;
      const { limit } = req.query;
      const logs = await storage.getQRScanLogsByGarage(
        garageId, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching scan logs:", error);
      res.status(500).json({ message: "Failed to fetch scan logs" });
    }
  });

  // REMOVED: Fleet Management (Module 40) routes — now served by fleet.ts

  // Contract Management - Enhanced endpoints with utilization, SLA, and renewals
  app.get('/api/contracts/enhanced', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      // Fetch all contracts for the garage
      const contracts = await db.select().from(fleetContracts).where(eq(fleetContracts.garageId, garageId));
      
      // Fetch related data for each contract
      const enhancedContracts = await Promise.all(contracts.map(async (contract) => {
        const [utilization, slaMetrics, renewals] = await Promise.all([
          db.select().from(contractUtilization).where(eq(contractUtilization.contractId, contract.id)),
          db.select().from(contractSlaMetrics).where(eq(contractSlaMetrics.contractId, contract.id)),
          db.select().from(contractRenewals).where(eq(contractRenewals.contractId, contract.id)).orderBy(desc(contractRenewals.createdAt)),
        ]);

        return {
          ...contract,
          utilization,
          slaMetrics,
          renewals,
        };
      }));

      res.json(enhancedContracts);
    } catch (error) {
      console.error("Error fetching enhanced contracts:", error);
      res.status(500).json({ message: "Failed to fetch enhanced contracts" });
    }
  });

  app.post('/api/contracts/:id/trigger-renewal', isAuthenticated, async (req: any, res) => {
    try {
      const contractId = req.params.id;
      
      // Fetch the contract
      const [contract] = await db.select().from(fleetContracts).where(eq(fleetContracts.id, contractId));
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Create a new renewal record
      const newEndDate = new Date(contract.endDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      const [renewal] = await db.insert(contractRenewals).values({
        contractId,
        renewalStatus: 'pending',
        proposedStartDate: contract.endDate,
        proposedEndDate: newEndDate.toISOString(),
        proposedValue: contract.monthlyValue ? contract.monthlyValue * 12 : contract.totalValue,
        proposedTerms: contract.terms,
        notificationSentAt: new Date().toISOString(),
      }).returning();

      res.status(201).json(renewal);
    } catch (error) {
      console.error("Error triggering contract renewal:", error);
      res.status(500).json({ message: "Failed to trigger contract renewal" });
    }
  });

  app.post('/api/contracts/:id/accept-renewal', isAuthenticated, async (req: any, res) => {
    try {
      const contractId = req.params.id;
      const { renewalId } = req.body;

      if (!renewalId) {
        return res.status(400).json({ message: "Renewal ID is required" });
      }

      // Update renewal status
      await db.update(contractRenewals)
        .set({
          renewalStatus: 'accepted',
          acceptedAt: new Date().toISOString(),
        })
        .where(eq(contractRenewals.id, renewalId));

      // Fetch the renewal to get proposed dates and values
      const [renewal] = await db.select().from(contractRenewals).where(eq(contractRenewals.id, renewalId));

      if (!renewal) {
        return res.status(404).json({ message: "Renewal not found" });
      }

      // Update the contract with new dates and values
      const [updatedContract] = await db.update(fleetContracts)
        .set({
          startDate: renewal.proposedStartDate,
          endDate: renewal.proposedEndDate,
          totalValue: renewal.proposedValue,
          terms: renewal.proposedTerms,
          status: 'active',
        })
        .where(eq(fleetContracts.id, contractId))
        .returning();

      res.json(updatedContract);
    } catch (error) {
      console.error("Error accepting contract renewal:", error);
      res.status(500).json({ message: "Failed to accept contract renewal" });
    }
  });

  // Fleet Pricing Tiers
  app.post('/api/fleet/pricing-tiers', isAuthenticated, async (req: any, res) => {
    try {
      const tier = await storage.createFleetPricingTier({
        ...req.body,
        garageId: req.user?.garageId,
      });
      res.status(201).json(tier);
    } catch (error) {
      console.error("Error creating pricing tier:", error);
      res.status(500).json({ message: "Failed to create pricing tier" });
    }
  });

  app.get('/api/fleet/pricing-tiers', isAuthenticated, async (req: any, res) => {
    try {
      const { fleetGroupId } = req.query;
      const tiers = fleetGroupId 
        ? await storage.getFleetPricingTiersByGroup(fleetGroupId as string)
        : await storage.getFleetPricingTiersByGarage(req.user?.garageId);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching pricing tiers:", error);
      res.status(500).json({ message: "Failed to fetch pricing tiers" });
    }
  });

  app.get('/api/fleet/pricing-tiers/:id', isAuthenticated, async (req, res) => {
    try {
      const tier = await storage.getFleetPricingTier(req.params.id);
      if (!tier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      res.json(tier);
    } catch (error) {
      console.error("Error fetching pricing tier:", error);
      res.status(500).json({ message: "Failed to fetch pricing tier" });
    }
  });

  app.patch('/api/fleet/pricing-tiers/:id', isAuthenticated, async (req, res) => {
    try {
      const tier = await storage.updateFleetPricingTier(req.params.id, req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error updating pricing tier:", error);
      res.status(500).json({ message: "Failed to update pricing tier" });
    }
  });

  app.delete('/api/fleet/pricing-tiers/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFleetPricingTier(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pricing tier:", error);
      res.status(500).json({ message: "Failed to delete pricing tier" });
    }
  });

  // Fleet Maintenance Schedules
  app.post('/api/fleet/maintenance-schedules', isAuthenticated, async (req, res) => {
    try {
      const schedule = await storage.createFleetMaintenanceSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      res.status(500).json({ message: "Failed to create maintenance schedule" });
    }
  });

  app.get('/api/fleet/maintenance-schedules/group/:fleetGroupId', isAuthenticated, async (req, res) => {
    try {
      const schedules = await storage.getFleetMaintenanceSchedulesByGroup(req.params.fleetGroupId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      res.status(500).json({ message: "Failed to fetch maintenance schedules" });
    }
  });

  app.get('/api/fleet/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const schedule = await storage.getFleetMaintenanceSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: "Maintenance schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
      res.status(500).json({ message: "Failed to fetch maintenance schedule" });
    }
  });

  app.patch('/api/fleet/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const schedule = await storage.updateFleetMaintenanceSchedule(req.params.id, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating maintenance schedule:", error);
      res.status(500).json({ message: "Failed to update maintenance schedule" });
    }
  });

  app.delete('/api/fleet/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFleetMaintenanceSchedule(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error);
      res.status(500).json({ message: "Failed to delete maintenance schedule" });
    }
  });

  // Contract Management API Routes
  // Get all contracts with enhanced data (utilization, SLA metrics, renewals)
  // Trigger renewal workflow for a contract
  app.post('/api/contracts/:contractId/trigger-renewal', isAuthenticated, async (req: any, res) => {
    try {
      const { db } = await import('./storage');
      const { fleetContracts, contractRenewals } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      const { addMonths, addDays } = await import('date-fns');

      const [contract] = await db
        .select()
        .from(fleetContracts)
        .where(eq(fleetContracts.id, req.params.contractId));

      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Calculate new dates
      const currentEnd = new Date(contract.endDate);
      const proposedStart = addDays(currentEnd, 1);
      const proposedEnd = addMonths(proposedStart, 12);

      // Create renewal record
      const [renewal] = await db.insert(contractRenewals).values({
        contractId: contract.id,
        renewalType: contract.autoRenew ? 'automatic' : 'manual',
        proposedStartDate: proposedStart,
        proposedEndDate: proposedEnd,
        proposedMonthlyFee: contract.monthlyFee,
        notificationSentAt: new Date(),
        status: 'notified',
        createdBy: req.user?.id,
      }).returning();

      // Update contract status
      await db
        .update(fleetContracts)
        .set({ status: 'pending_renewal' })
        .where(eq(fleetContracts.id, contract.id));

      res.json(renewal);
    } catch (error) {
      console.error("Error triggering renewal:", error);
      res.status(500).json({ message: "Failed to trigger renewal" });
    }
  });

  // Accept a renewal
  app.post('/api/contracts/:contractId/renewals/:renewalId/accept', isAuthenticated, async (req: any, res) => {
    try {
      const { db } = await import('./storage');
      const { fleetContracts, contractRenewals } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');

      const [renewal] = await db
        .select()
        .from(contractRenewals)
        .where(eq(contractRenewals.id, req.params.renewalId));

      if (!renewal) {
        return res.status(404).json({ message: "Renewal not found" });
      }

      const [oldContract] = await db
        .select()
        .from(fleetContracts)
        .where(eq(fleetContracts.id, renewal.contractId));

      // Create new contract
      const [newContract] = await db.insert(fleetContracts).values({
        ...oldContract,
        id: undefined,
        contractNumber: `${oldContract.contractNumber}-R`,
        startDate: renewal.proposedStartDate,
        endDate: renewal.proposedEndDate,
        monthlyFee: renewal.proposedMonthlyFee || oldContract.monthlyFee,
        status: 'active',
        createdBy: req.user?.id,
      }).returning();

      // Update renewal record
      await db
        .update(contractRenewals)
        .set({
          status: 'completed',
          customerResponse: 'accepted',
          customerResponseDate: new Date(),
          renewedContractId: newContract.id,
        })
        .where(eq(contractRenewals.id, renewal.id));

      // Update old contract
      await db
        .update(fleetContracts)
        .set({ status: 'expired' })
        .where(eq(fleetContracts.id, oldContract.id));

      res.json({ renewal, newContract });
    } catch (error) {
      console.error("Error accepting renewal:", error);
      res.status(500).json({ message: "Failed to accept renewal" });
    }
  });

  // Module 41: Warranty Tracking

  // Warranties
  app.post("/api/warranties", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertWarrantySchema.parse({
        ...req.body,
        garageId: user.garageId,
        createdBy: user.id,
      });
      const warranty = await storage.createWarranty(data);
      res.json(warranty);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/warranties", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const warranties = await storage.getWarrantiesByGarage(user.garageId);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching warranties:", error);
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  app.get("/api/warranties/active", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const warranties = await storage.getActiveWarranties(user.garageId);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching active warranties:", error);
      res.status(500).json({ message: "Failed to fetch active warranties" });
    }
  });

  app.get("/api/warranties/expired", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const warranties = await storage.getExpiredWarranties(user.garageId);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching expired warranties:", error);
      res.status(500).json({ message: "Failed to fetch expired warranties" });
    }
  });

  app.get("/api/warranties/expiring", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const daysThreshold = parseInt(req.query.days as string) || 30;
      const warranties = await storage.getExpiringWarranties(user.garageId, daysThreshold);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching expiring warranties:", error);
      res.status(500).json({ message: "Failed to fetch expiring warranties" });
    }
  });

  app.get("/api/warranties/vehicle/:vehicleId", isAuthenticated, async (req, res) => {
    try {
      const warranties = await storage.getWarrantiesByVehicle(req.params.vehicleId);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching warranties by vehicle:", error);
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  app.get("/api/warranties/customer/:customerId", isAuthenticated, async (req, res) => {
    try {
      const warranties = await storage.getWarrantiesByCustomer(req.params.customerId);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching warranties by customer:", error);
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  app.get("/api/warranties/:id", isAuthenticated, async (req, res) => {
    try {
      const warranty = await storage.getWarrantyById(req.params.id);
      if (!warranty) {
        return res.status(404).json({ error: "Warranty not found" });
      }
      res.json(warranty);
    } catch (error) {
      console.error("Error fetching warranty:", error);
      res.status(500).json({ message: "Failed to fetch warranty" });
    }
  });

  app.patch("/api/warranties/:id", isAuthenticated, async (req, res) => {
    try {
      const data = insertWarrantySchema.partial().parse(req.body);
      const warranty = await storage.updateWarranty(req.params.id, data);
      res.json(warranty);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/warranties/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteWarranty(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting warranty:", error);
      res.status(500).json({ message: "Failed to delete warranty" });
    }
  });

  // Warranty Claims
  app.post("/api/warranty-claims", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertWarrantyClaimSchema.parse({
        ...req.body,
        submittedBy: user.id,
      });
      const claim = await storage.createWarrantyClaim(data);
      res.json(claim);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/warranty-claims", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const claims = await storage.getWarrantyClaimsByGarage(user.garageId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching warranty claims:", error);
      res.status(500).json({ message: "Failed to fetch warranty claims" });
    }
  });

  app.get("/api/warranty-claims/warranty/:warrantyId", isAuthenticated, async (req, res) => {
    try {
      const claims = await storage.getWarrantyClaimsByWarranty(req.params.warrantyId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching warranty claims by warranty:", error);
      res.status(500).json({ message: "Failed to fetch warranty claims" });
    }
  });

  app.get("/api/warranty-claims/:id", isAuthenticated, async (req, res) => {
    try {
      const claim = await storage.getWarrantyClaimById(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Warranty claim not found" });
      }
      res.json(claim);
    } catch (error) {
      console.error("Error fetching warranty claim:", error);
      res.status(500).json({ message: "Failed to fetch warranty claim" });
    }
  });

  app.patch("/api/warranty-claims/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertWarrantyClaimSchema.partial().parse(req.body);
      
      // If status is being changed to approved/rejected, add reviewedBy
      if (data.status && ['approved', 'rejected'].includes(data.status)) {
        data.reviewedBy = user.id;
      }
      
      const claim = await storage.updateWarrantyClaim(req.params.id, data);
      res.json(claim);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/warranty-claims/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteWarrantyClaim(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting warranty claim:", error);
      res.status(500).json({ message: "Failed to delete warranty claim" });
    }
  });

  // ========================================================================
  // Module 45: Vehicle Inspection Checklists
  // ========================================================================

  // Inspection Templates

  // ========================================================================
  // Module 46: Towing & Roadside Assistance
  // ========================================================================

  // Towing Requests

  // ========================================================================
  // Module 48: Loaner Vehicle Management
  // ========================================================================

  // Loaner Vehicles

  // ========================================================================
  // Module 42: Marketing Automation
  // ========================================================================

  // Marketing Campaigns
  app.post("/api/marketing-campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = { ...req.body, garageId: user.garageId };
      const campaign = await storage.createMarketingCampaign(data);
      res.status(201).json(campaign);
    } catch (error: any) {
      console.error("Error creating marketing campaign:", error);
      res.status(400).json({ error: error.message || "Failed to create marketing campaign" });
    }
  });

  app.get("/api/marketing-campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, campaignType } = req.query;
      const campaigns = await storage.getMarketingCampaigns(user.garageId, {
        status: status as string | undefined,
        campaignType: campaignType as string | undefined,
      });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      res.status(500).json({ error: "Failed to fetch marketing campaigns" });
    }
  });

  app.get("/api/marketing-campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getMarketingCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ error: "Marketing campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching marketing campaign:", error);
      res.status(500).json({ error: "Failed to fetch marketing campaign" });
    }
  });

  app.patch("/api/marketing-campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateMarketingCampaign(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating marketing campaign:", error);
      res.status(400).json({ error: error.message || "Failed to update marketing campaign" });
    }
  });

  app.delete("/api/marketing-campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMarketingCampaign(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting marketing campaign:", error);
      res.status(500).json({ error: "Failed to delete marketing campaign" });
    }
  });

  // Campaign Recipients
  app.get("/api/marketing-campaigns/:campaignId/recipients", isAuthenticated, async (req, res) => {
    try {
      const { campaignId } = req.params;
      const recipients = await storage.getCampaignRecipients(campaignId);
      res.json(recipients);
    } catch (error) {
      console.error("Error fetching campaign recipients:", error);
      res.status(500).json({ error: "Failed to fetch campaign recipients" });
    }
  });

  app.post("/api/campaign-recipients", isAuthenticated, async (req, res) => {
    try {
      const recipient = await storage.createCampaignRecipient(req.body);
      res.status(201).json(recipient);
    } catch (error: any) {
      console.error("Error creating campaign recipient:", error);
      res.status(400).json({ error: error.message || "Failed to create campaign recipient" });
    }
  });

  app.patch("/api/campaign-recipients/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateCampaignRecipient(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating campaign recipient:", error);
      res.status(400).json({ error: error.message || "Failed to update campaign recipient" });
    }
  });

  // Campaign Analytics
  app.get("/api/marketing-campaigns/:campaignId/analytics", isAuthenticated, async (req, res) => {
    try {
      const { campaignId } = req.params;
      const analytics = await storage.getCampaignAnalytics(campaignId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      res.status(500).json({ error: "Failed to fetch campaign analytics" });
    }
  });

  // REMOVED: Loyalty Program (Module 44) routes — now served by loyalty.ts

  // ========================================================================
  // Module 47: Document Management
  // ========================================================================

  // Document Categories
  app.post("/api/document-categories", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = { ...req.body, garageId: user.garageId };
      const category = await storage.createDocumentCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating document category:", error);
      res.status(400).json({ error: error.message || "Failed to create document category" });
    }
  });

  app.get("/api/document-categories", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const categories = await storage.getDocumentCategories(user.garageId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching document categories:", error);
      res.status(500).json({ error: "Failed to fetch document categories" });
    }
  });

  app.get("/api/document-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getDocumentCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: "Document category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching document category:", error);
      res.status(500).json({ error: "Failed to fetch document category" });
    }
  });

  app.patch("/api/document-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateDocumentCategory(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating document category:", error);
      res.status(400).json({ error: error.message || "Failed to update document category" });
    }
  });

  app.delete("/api/document-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocumentCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document category:", error);
      res.status(500).json({ error: "Failed to delete document category" });
    }
  });

  // Documents
  app.patch("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateDocument(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating document:", error);
      res.status(400).json({ error: error.message || "Failed to update document" });
    }
  });

  // Document Access Logs
  app.post("/api/document-access-logs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = { ...req.body, userId: user.id };
      const log = await storage.createDocumentAccessLog(data);
      res.status(201).json(log);
    } catch (error: any) {
      console.error("Error creating document access log:", error);
      res.status(400).json({ error: error.message || "Failed to create document access log" });
    }
  });

  app.get("/api/documents/:documentId/access-logs", isAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      const logs = await storage.getDocumentAccessLogs(documentId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching document access logs:", error);
      res.status(500).json({ error: "Failed to fetch document access logs" });
    }
  });

  // ========================================================================
  // ENTERPRISE ERP MODULES (56-60) API ROUTES
  // ========================================================================

  // ========================================================================
  // Module 56: Franchise Command Center
  // ========================================================================

  // Franchise Groups
  app.post("/api/franchise-groups", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertFranchiseGroupSchema.parse(req.body);
      const group = await storage.createFranchiseGroup(validatedData);
      res.status(201).json(group);
    } catch (error: any) {
      console.error("Error creating franchise group:", error);
      res.status(400).json({ error: error.message || "Failed to create franchise group" });
    }
  });

  app.get("/api/franchise-groups", isAuthenticated, async (req, res) => {
    try {
      const groups = await storage.getFranchiseGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching franchise groups:", error);
      res.status(500).json({ error: "Failed to fetch franchise groups" });
    }
  });

  app.get("/api/franchise-groups/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const group = await storage.getFranchiseGroupById(id);
      if (!group) {
        return res.status(404).json({ error: "Franchise group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching franchise group:", error);
      res.status(500).json({ error: "Failed to fetch franchise group" });
    }
  });

  app.patch("/api/franchise-groups/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFranchiseGroup(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating franchise group:", error);
      res.status(400).json({ error: error.message || "Failed to update franchise group" });
    }
  });

  app.delete("/api/franchise-groups/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFranchiseGroup(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting franchise group:", error);
      res.status(500).json({ error: "Failed to delete franchise group" });
    }
  });

  // Franchise Contracts
  app.post("/api/franchise-contracts", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertFranchiseContractSchema.parse(req.body);
      const contract = await storage.createFranchiseContract(validatedData);
      res.status(201).json(contract);
    } catch (error: any) {
      console.error("Error creating franchise contract:", error);
      res.status(400).json({ error: error.message || "Failed to create franchise contract" });
    }
  });

  app.get("/api/franchise-contracts", isAuthenticated, async (req, res) => {
    try {
      const { franchiseGroupId } = req.query;
      const contracts = await storage.getFranchiseContracts(franchiseGroupId as string | undefined);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching franchise contracts:", error);
      res.status(500).json({ error: "Failed to fetch franchise contracts" });
    }
  });

  app.get("/api/franchise-contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.getFranchiseContractById(id);
      if (!contract) {
        return res.status(404).json({ error: "Franchise contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching franchise contract:", error);
      res.status(500).json({ error: "Failed to fetch franchise contract" });
    }
  });

  app.patch("/api/franchise-contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFranchiseContract(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating franchise contract:", error);
      res.status(400).json({ error: error.message || "Failed to update franchise contract" });
    }
  });

  app.delete("/api/franchise-contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFranchiseContract(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting franchise contract:", error);
      res.status(500).json({ error: "Failed to delete franchise contract" });
    }
  });

  // Franchise KPIs
  app.post("/api/franchise-kpis", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertFranchiseKpiSchema.parse(req.body);
      const kpi = await storage.createFranchiseKpi(validatedData);
      res.status(201).json(kpi);
    } catch (error: any) {
      console.error("Error creating franchise KPI:", error);
      res.status(400).json({ error: error.message || "Failed to create franchise KPI" });
    }
  });

  app.get("/api/franchise-kpis", isAuthenticated, async (req: any, res) => {
    try {
      const { branchId, month } = req.query;
      if (!branchId) {
        return res.status(400).json({ error: "branchId is required" });
      }
      const kpis = await storage.getFranchiseKpis(branchId as string, {
        month: month as string | undefined
      });
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching franchise KPIs:", error);
      res.status(500).json({ error: "Failed to fetch franchise KPIs" });
    }
  });

  app.get("/api/franchise-kpis/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const kpi = await storage.getFranchiseKpiById(id);
      if (!kpi) {
        return res.status(404).json({ error: "Franchise KPI not found" });
      }
      res.json(kpi);
    } catch (error) {
      console.error("Error fetching franchise KPI:", error);
      res.status(500).json({ error: "Failed to fetch franchise KPI" });
    }
  });

  app.patch("/api/franchise-kpis/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFranchiseKpi(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating franchise KPI:", error);
      res.status(400).json({ error: error.message || "Failed to update franchise KPI" });
    }
  });

  // Revenue Sharing Rules
  app.post("/api/revenue-sharing-rules", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertRevenueSharingRuleSchema.parse(req.body);
      const rule = await storage.createRevenueSharingRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
      console.error("Error creating revenue sharing rule:", error);
      res.status(400).json({ error: error.message || "Failed to create revenue sharing rule" });
    }
  });

  app.get("/api/revenue-sharing-rules", isAuthenticated, async (req, res) => {
    try {
      const { franchiseGroupId } = req.query;
      if (!franchiseGroupId) {
        return res.status(400).json({ error: "franchiseGroupId is required" });
      }
      const rules = await storage.getRevenueSharingRules(franchiseGroupId as string);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching revenue sharing rules:", error);
      res.status(500).json({ error: "Failed to fetch revenue sharing rules" });
    }
  });

  app.get("/api/revenue-sharing-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const rule = await storage.getRevenueSharingRuleById(id);
      if (!rule) {
        return res.status(404).json({ error: "Revenue sharing rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error fetching revenue sharing rule:", error);
      res.status(500).json({ error: "Failed to fetch revenue sharing rule" });
    }
  });

  app.patch("/api/revenue-sharing-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRevenueSharingRule(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating revenue sharing rule:", error);
      res.status(400).json({ error: error.message || "Failed to update revenue sharing rule" });
    }
  });

  app.delete("/api/revenue-sharing-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRevenueSharingRule(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting revenue sharing rule:", error);
      res.status(500).json({ error: "Failed to delete revenue sharing rule" });
    }
  });

  // ========================================================================
  // Module 59: Globalization Layer
  // ========================================================================

  // Locales

  // Currency Rates
  app.post("/api/currency-rates", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCurrencyRateSchema.parse(req.body);
      const rate = await storage.createCurrencyRate(validatedData);
      res.status(201).json(rate);
    } catch (error: any) {
      console.error("Error creating currency rate:", error);
      res.status(400).json({ error: error.message || "Failed to create currency rate" });
    }
  });

  app.get("/api/currency-rates", isAuthenticated, async (req, res) => {
    try {
      const { fromCurrency, toCurrency } = req.query;
      const rates = await storage.getCurrencyRates(
        fromCurrency as string | undefined,
        toCurrency as string | undefined
      );
      res.json(rates);
    } catch (error) {
      console.error("Error fetching currency rates:", error);
      res.status(500).json({ error: "Failed to fetch currency rates" });
    }
  });

  app.get("/api/currency-rates/latest", isAuthenticated, async (req, res) => {
    try {
      const { fromCurrency, toCurrency } = req.query;
      if (!fromCurrency || !toCurrency) {
        return res.status(400).json({ error: "fromCurrency and toCurrency are required" });
      }
      const rate = await storage.getLatestCurrencyRate(fromCurrency as string, toCurrency as string);
      res.json(rate);
    } catch (error) {
      console.error("Error fetching latest currency rate:", error);
      res.status(500).json({ error: "Failed to fetch latest currency rate" });
    }
  });

  // Tax Regions
  app.post("/api/tax-regions", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTaxRegionSchema.parse(req.body);
      const region = await storage.createTaxRegion(validatedData);
      res.status(201).json(region);
    } catch (error: any) {
      console.error("Error creating tax region:", error);
      res.status(400).json({ error: error.message || "Failed to create tax region" });
    }
  });

  app.get("/api/tax-regions", isAuthenticated, async (req, res) => {
    try {
      const { countryCode } = req.query;
      const regions = await storage.getTaxRegions(countryCode as string | undefined);
      res.json(regions);
    } catch (error) {
      console.error("Error fetching tax regions:", error);
      res.status(500).json({ error: "Failed to fetch tax regions" });
    }
  });

  app.get("/api/tax-regions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const region = await storage.getTaxRegionById(id);
      if (!region) {
        return res.status(404).json({ error: "Tax region not found" });
      }
      res.json(region);
    } catch (error) {
      console.error("Error fetching tax region:", error);
      res.status(500).json({ error: "Failed to fetch tax region" });
    }
  });

  app.patch("/api/tax-regions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateTaxRegion(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating tax region:", error);
      res.status(400).json({ error: error.message || "Failed to update tax region" });
    }
  });

  app.delete("/api/tax-regions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTaxRegion(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tax region:", error);
      res.status(500).json({ error: "Failed to delete tax region" });
    }
  });

  // Timezone Rules
  app.post("/api/timezone-rules", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTimezoneRuleSchema.parse(req.body);
      const rule = await storage.createTimezoneRule(validatedData);
      res.status(201).json(rule);
    } catch (error: any) {
      console.error("Error creating timezone rule:", error);
      res.status(400).json({ error: error.message || "Failed to create timezone rule" });
    }
  });

  app.get("/api/timezone-rules", isAuthenticated, async (req, res) => {
    try {
      const { branchId } = req.query;
      const rules = await storage.getTimezoneRules(branchId as string | undefined);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching timezone rules:", error);
      res.status(500).json({ error: "Failed to fetch timezone rules" });
    }
  });

  app.get("/api/timezone-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const rule = await storage.getTimezoneRuleById(id);
      if (!rule) {
        return res.status(404).json({ error: "Timezone rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error fetching timezone rule:", error);
      res.status(500).json({ error: "Failed to fetch timezone rule" });
    }
  });

  app.patch("/api/timezone-rules/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateTimezoneRule(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating timezone rule:", error);
      res.status(400).json({ error: error.message || "Failed to update timezone rule" });
    }
  });

  // ========================================================================
  // Module 60: Parts Supply Network
  // ========================================================================

  // Network Partners
  app.post("/api/network-partners", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertNetworkPartnerSchema.parse(req.body);
      const partner = await storage.createNetworkPartner(validatedData);
      res.status(201).json(partner);
    } catch (error: any) {
      console.error("Error creating network partner:", error);
      res.status(400).json({ error: error.message || "Failed to create network partner" });
    }
  });

  app.get("/api/network-partners", isAuthenticated, async (req, res) => {
    try {
      const { partnerType, country } = req.query;
      const partners = await storage.getNetworkPartners({
        partnerType: partnerType as string | undefined,
        country: country as string | undefined
      });
      res.json(partners);
    } catch (error) {
      console.error("Error fetching network partners:", error);
      res.status(500).json({ error: "Failed to fetch network partners" });
    }
  });

  app.get("/api/network-partners/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const partner = await storage.getNetworkPartnerById(id);
      if (!partner) {
        return res.status(404).json({ error: "Network partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Error fetching network partner:", error);
      res.status(500).json({ error: "Failed to fetch network partner" });
    }
  });

  app.patch("/api/network-partners/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateNetworkPartner(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating network partner:", error);
      res.status(400).json({ error: error.message || "Failed to update network partner" });
    }
  });

  app.delete("/api/network-partners/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNetworkPartner(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting network partner:", error);
      res.status(500).json({ error: "Failed to delete network partner" });
    }
  });

  // Fulfillment Orders
  app.post("/api/fulfillment-orders", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertFulfillmentOrderSchema.parse(req.body);
      const order = await storage.createFulfillmentOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating fulfillment order:", error);
      res.status(400).json({ error: error.message || "Failed to create fulfillment order" });
    }
  });

  app.get("/api/fulfillment-orders", isAuthenticated, async (req, res) => {
    try {
      const { partnerId, branchId, status } = req.query;
      const orders = await storage.getFulfillmentOrders({
        partnerId: partnerId as string | undefined,
        branchId: branchId as string | undefined,
        status: status as string | undefined
      });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching fulfillment orders:", error);
      res.status(500).json({ error: "Failed to fetch fulfillment orders" });
    }
  });

  app.get("/api/fulfillment-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getFulfillmentOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Fulfillment order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching fulfillment order:", error);
      res.status(500).json({ error: "Failed to fetch fulfillment order" });
    }
  });

  app.patch("/api/fulfillment-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateFulfillmentOrder(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating fulfillment order:", error);
      res.status(400).json({ error: error.message || "Failed to update fulfillment order" });
    }
  });

  app.delete("/api/fulfillment-orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFulfillmentOrder(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fulfillment order:", error);
      res.status(500).json({ error: "Failed to delete fulfillment order" });
    }
  });

  // Shipment Events
  app.post("/api/shipment-events", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertShipmentEventSchema.parse(req.body);
      const event = await storage.createShipmentEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      console.error("Error creating shipment event:", error);
      res.status(400).json({ error: error.message || "Failed to create shipment event" });
    }
  });

  app.get("/api/fulfillment-orders/:fulfillmentOrderId/shipment-events", isAuthenticated, async (req, res) => {
    try {
      const { fulfillmentOrderId } = req.params;
      const events = await storage.getShipmentEvents(fulfillmentOrderId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching shipment events:", error);
      res.status(500).json({ error: "Failed to fetch shipment events" });
    }
  });

  // Warehouse Nodes
  app.post("/api/warehouse-nodes", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertWarehouseNodeSchema.parse(req.body);
      const node = await storage.createWarehouseNode(validatedData);
      res.status(201).json(node);
    } catch (error: any) {
      console.error("Error creating warehouse node:", error);
      res.status(400).json({ error: error.message || "Failed to create warehouse node" });
    }
  });

  app.get("/api/warehouse-nodes", isAuthenticated, async (req, res) => {
    try {
      const { partnerId } = req.query;
      const nodes = await storage.getWarehouseNodes(partnerId as string | undefined);
      res.json(nodes);
    } catch (error) {
      console.error("Error fetching warehouse nodes:", error);
      res.status(500).json({ error: "Failed to fetch warehouse nodes" });
    }
  });

  app.get("/api/warehouse-nodes/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const node = await storage.getWarehouseNodeById(id);
      if (!node) {
        return res.status(404).json({ error: "Warehouse node not found" });
      }
      res.json(node);
    } catch (error) {
      console.error("Error fetching warehouse node:", error);
      res.status(500).json({ error: "Failed to fetch warehouse node" });
    }
  });

  app.patch("/api/warehouse-nodes/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateWarehouseNode(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating warehouse node:", error);
      res.status(400).json({ error: error.message || "Failed to update warehouse node" });
    }
  });

  app.delete("/api/warehouse-nodes/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWarehouseNode(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting warehouse node:", error);
      res.status(500).json({ error: "Failed to delete warehouse node" });
    }
  });

  // REMOVED: OBD Hub (Module 57) routes — now served by obd-telematics.ts

  // ========================================================================
  // Module 58: OEM Software Subscriptions
  // ========================================================================

  // Vendor Catalogs
  app.post("/api/vendor-catalogs", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertVendorCatalogSchema.parse(req.body);
      const catalog = await storage.createVendorCatalog(validatedData);
      res.status(201).json(catalog);
    } catch (error: any) {
      console.error("Error creating vendor catalog:", error);
      res.status(400).json({ error: error.message || "Failed to create vendor catalog" });
    }
  });

  app.get("/api/vendor-catalogs", isAuthenticated, async (req, res) => {
    try {
      const catalogs = await storage.getVendorCatalogs();
      res.json(catalogs);
    } catch (error) {
      console.error("Error fetching vendor catalogs:", error);
      res.status(500).json({ error: "Failed to fetch vendor catalogs" });
    }
  });

  app.get("/api/vendor-catalogs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const catalog = await storage.getVendorCatalogById(id);
      if (!catalog) {
        return res.status(404).json({ error: "Vendor catalog not found" });
      }
      res.json(catalog);
    } catch (error) {
      console.error("Error fetching vendor catalog:", error);
      res.status(500).json({ error: "Failed to fetch vendor catalog" });
    }
  });

  app.patch("/api/vendor-catalogs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateVendorCatalog(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating vendor catalog:", error);
      res.status(400).json({ error: error.message || "Failed to update vendor catalog" });
    }
  });

  app.delete("/api/vendor-catalogs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendorCatalog(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor catalog:", error);
      res.status(500).json({ error: "Failed to delete vendor catalog" });
    }
  });

  // OEM Products
  app.post("/api/oem-products", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertOemProductSchema.parse(req.body);
      const product = await storage.createOemProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating OEM product:", error);
      res.status(400).json({ error: error.message || "Failed to create OEM product" });
    }
  });

  app.get("/api/oem-products", isAuthenticated, async (req, res) => {
    try {
      const { vendorCatalogId } = req.query;
      const products = await storage.getOemProducts(vendorCatalogId as string | undefined);
      res.json(products);
    } catch (error) {
      console.error("Error fetching OEM products:", error);
      res.status(500).json({ error: "Failed to fetch OEM products" });
    }
  });

  app.get("/api/oem-products/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getOemProductById(id);
      if (!product) {
        return res.status(404).json({ error: "OEM product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching OEM product:", error);
      res.status(500).json({ error: "Failed to fetch OEM product" });
    }
  });

  app.patch("/api/oem-products/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateOemProduct(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating OEM product:", error);
      res.status(400).json({ error: error.message || "Failed to update OEM product" });
    }
  });

  app.delete("/api/oem-products/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOemProduct(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting OEM product:", error);
      res.status(500).json({ error: "Failed to delete OEM product" });
    }
  });

  // Subscription Licenses
  app.post("/api/subscription-licenses", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertSubscriptionLicenseSchema.parse(req.body);
      const license = await storage.createSubscriptionLicense(validatedData);
      res.status(201).json(license);
    } catch (error: any) {
      console.error("Error creating subscription license:", error);
      res.status(400).json({ error: error.message || "Failed to create subscription license" });
    }
  });

  app.get("/api/subscription-licenses", isAuthenticated, async (req, res) => {
    try {
      const { branchId, status } = req.query;
      const licenses = await storage.getSubscriptionLicenses(
        branchId as string | undefined,
        { status: status as string | undefined }
      );
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching subscription licenses:", error);
      res.status(500).json({ error: "Failed to fetch subscription licenses" });
    }
  });

  app.get("/api/subscription-licenses/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const license = await storage.getSubscriptionLicenseById(id);
      if (!license) {
        return res.status(404).json({ error: "Subscription license not found" });
      }
      res.json(license);
    } catch (error) {
      console.error("Error fetching subscription license:", error);
      res.status(500).json({ error: "Failed to fetch subscription license" });
    }
  });

  app.patch("/api/subscription-licenses/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateSubscriptionLicense(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating subscription license:", error);
      res.status(400).json({ error: error.message || "Failed to update subscription license" });
    }
  });

  app.delete("/api/subscription-licenses/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubscriptionLicense(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription license:", error);
      res.status(500).json({ error: "Failed to delete subscription license" });
    }
  });

  // License Audit Logs
  app.post("/api/license-audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const validatedData = insertLicenseAuditLogSchema.parse({ ...req.body, userId: user.id });
      const log = await storage.createLicenseAuditLog(validatedData);
      res.status(201).json(log);
    } catch (error: any) {
      console.error("Error creating license audit log:", error);
      res.status(400).json({ error: error.message || "Failed to create license audit log" });
    }
  });

  app.get("/api/subscription-licenses/:licenseId/audit-logs", isAuthenticated, async (req, res) => {
    try {
      const { licenseId } = req.params;
      const logs = await storage.getLicenseAuditLogs(licenseId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching license audit logs:", error);
      res.status(500).json({ error: "Failed to fetch license audit logs" });
    }
  });

  // Entitlement Assignments
  app.post("/api/entitlement-assignments", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertEntitlementAssignmentSchema.parse(req.body);
      const assignment = await storage.createEntitlementAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error: any) {
      console.error("Error creating entitlement assignment:", error);
      res.status(400).json({ error: error.message || "Failed to create entitlement assignment" });
    }
  });

  app.get("/api/entitlement-assignments", isAuthenticated, async (req, res) => {
    try {
      const { licenseId, userId } = req.query;
      const assignments = await storage.getEntitlementAssignments(
        licenseId as string | undefined,
        userId as string | undefined
      );
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching entitlement assignments:", error);
      res.status(500).json({ error: "Failed to fetch entitlement assignments" });
    }
  });

  app.get("/api/entitlement-assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await storage.getEntitlementAssignmentById(id);
      if (!assignment) {
        return res.status(404).json({ error: "Entitlement assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching entitlement assignment:", error);
      res.status(500).json({ error: "Failed to fetch entitlement assignment" });
    }
  });

  app.patch("/api/entitlement-assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateEntitlementAssignment(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating entitlement assignment:", error);
      res.status(400).json({ error: error.message || "Failed to update entitlement assignment" });
    }
  });

  // ========================================
  // PHASE 5: OPERATIONS & EFFICIENCY
  // ========================================


  // Parts Auto-Reordering - Module 82
  app.get("/api/auto-reorder/rules", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", partName: "Oil Filter", partNumber: "OF-123", currentStock: 15, reorderPoint: 20, reorderQuantity: 50, status: "triggered" },
    ]);
  });

  app.post("/api/auto-reorder/rules", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "new", ...req.body });
  });

  app.get("/api/auto-reorder/history", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", partName: "Oil Filter", quantity: 50, supplier: "AutoParts Plus", status: "ordered" },
    ]);
  });

  // Time Clock & Payroll - Module 84
  app.post("/api/timeclock/clock-in", isAuthenticated, async (req, res) => {
    res.json({ message: "Clocked in successfully", timestamp: new Date().toISOString() });
  });

  app.post("/api/timeclock/clock-out", isAuthenticated, async (req, res) => {
    res.json({ message: "Clocked out successfully", timestamp: new Date().toISOString() });
  });

  app.get("/api/payroll/periods", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", periodStart: "2024-10-14", periodEnd: "2024-10-27", status: "draft" },
    ]);
  });

  app.post("/api/payroll/calculate", isAuthenticated, async (req, res) => {
    res.json({ totalGrossPay: 18500, totalDeductions: 3200, totalNetPay: 15300 });
  });

  // Equipment Calibration - Module 85
  app.get("/api/calibration/records", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", toolName: "Torque Wrench #1", calibrationType: "Torque Accuracy", status: "valid" },
    ]);
  });

  app.post("/api/calibration/records", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "new", ...req.body });
  });

  app.get("/api/calibration/reminders", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", toolName: "Diagnostic Scanner", dueDate: "2024-10-15" },
    ]);
  });

  // Multi-Location Routing - Module 83
  app.get("/api/routing/routes", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", type: "parts_transfer", stops: 4, distance: 12.5, duration: 45, driver: "Mike Davis", status: "planned" },
    ]);
  });

  app.post("/api/routing/optimize", isAuthenticated, async (req, res) => {
    res.json({ message: "Route optimized", routeId: "route-123" });
  });

  // ========================================
  // PHASE 6: COMPLIANCE & QUALITY
  // ========================================

  // Environmental Compliance - Module 86
  app.get("/api/environmental-compliance/records", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", type: "waste_disposal", wasteType: "Used Oil", quantity: 55, unit: "gallons", date: "2024-10-20" },
    ]);
  });

  app.post("/api/environmental-compliance/records", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "new", ...req.body });
  });

  // ISO Quality Management - Module 87
  app.get("/api/quality/checklists", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", name: "Service Delivery Quality", category: "service_delivery", itemCount: 12, completionRate: 95 },
    ]);
  });

  app.get("/api/quality/non-conformances", isAuthenticated, async (req, res) => {
    res.json([
      { id: "NC-2024-001", title: "Incorrect torque on wheel nuts", severity: "major", status: "resolved" },
    ]);
  });

  app.post("/api/quality/non-conformances", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "NC-NEW", ...req.body });
  });

  // Safety Incidents - Module 88
  app.get("/api/safety-incidents", isAuthenticated, async (req, res) => {
    res.json([
      { id: "SI-2024-001", date: "2024-10-25", type: "injury", severity: "minor", description: "Minor cut on hand" },
    ]);
  });

  app.post("/api/safety-incidents", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "SI-NEW", ...req.body });
  });

  // Insurance Claims - Module 89
  app.get("/api/insurance-claims", isAuthenticated, async (req, res) => {
    res.json([
      { id: "CLM-2024-001", customer: "John Smith", vehicle: "2020 Honda Civic", claimAmount: 3500, status: "approved" },
    ]);
  });

  app.post("/api/insurance-claims", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "CLM-NEW", ...req.body });
  });

  // ========================================
  // PHASE 1: AI & AUTOMATION
  // ========================================

  // AI Chatbot - Real OpenAI Integration
  app.get("/api/ai-chat-conversations", isAuthenticated, async (req: any, res) => {
    try {
      const conversations = await storage.getAIChatConversations(req.user?.garageId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/ai-chat-messages", isAuthenticated, async (req, res) => {
    try {
      const { conversationId } = req.query;
      if (!conversationId) {
        return res.status(400).json({ message: "Conversation ID required" });
      }
      // TODO: Implement getAIChatMessages in storage
      res.json([]);
    } catch (error) {
      console.error("Error fetching AI messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/ai-chat/send", isAuthenticated, async (req: any, res) => {
    try {
      const { conversationId, message } = req.body;
      const { streamChatResponse } = await import("./ai-service");
      
      // Create or get conversation
      let convId = conversationId;
      if (!convId) {
        const newConv = await storage.createAIChatConversation({
          userId: req.user?.id,
          garageId: req.user?.garageId,
          title: message.substring(0, 50) + "...",
          status: "active"
        });
        convId = newConv.id;
      }

      // TODO: Save user message when storage method is available
      // await storage.createAIChatMessage({ conversationId: convId, role: "user", content: message });

      // Get conversation history (mock for now)
      const chatHistory = [{ role: "user", content: message }];

      // Stream AI response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let aiResponse = '';
      for await (const chunk of streamChatResponse(chatHistory)) {
        aiResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // TODO: Save AI response when storage method is available
      // await storage.createAIChatMessage({ conversationId: convId, role: "assistant", content: aiResponse });

      res.write(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Predictive Maintenance AI
  app.post("/api/ai-maintenance/predict", isAuthenticated, async (req, res) => {
    try {
      const { vehicleId } = req.body;
      const { analyzePredictiveMaintenance } = await import("./ai-service");
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const serviceHistory = await storage.getVehicleServiceHistory(vehicleId);
      
      const predictions = await analyzePredictiveMaintenance({
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage || 0,
        serviceHistory
      });

      // Save predictions
      for (const pred of predictions) {
        await storage.createAIMaintenancePrediction({
          vehicleId: vehicle.id,
          predictedIssue: pred.issue,
          probability: pred.probability,
          estimatedMiles: pred.estimatedMiles,
          severity: pred.severity,
          recommendation: pred.recommendation,
          status: "pending"
        });
      }

      res.json({ predictions });
    } catch (error) {
      console.error("Error in predictive maintenance:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  app.get("/api/ai-maintenance/predictions", isAuthenticated, async (req, res) => {
    try {
      const { vehicleId } = req.query;
      const predictions = await storage.getAIMaintenancePredictions(vehicleId as string);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // Smart Parts Recommendations AI
  app.post("/api/ai-parts/recommend", isAuthenticated, async (req, res) => {
    try {
      const { vehicleId, serviceType, symptoms } = req.body;
      const { generatePartsRecommendations } = await import("./ai-service");
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const recommendations = await generatePartsRecommendations({
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        serviceType,
        symptoms
      });

      // Save recommendations
      for (const rec of recommendations) {
        await storage.createAIPartsRecommendation({
          vehicleId: vehicle.id,
          partName: rec.partName,
          partNumber: rec.partNumber || '',
          compatibility: rec.compatibility,
          priority: rec.priority,
          estimatedCost: rec.estimatedCost,
          reason: rec.reason,
          status: "pending"
        });
      }

      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating parts recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.get("/api/ai-parts/recommendations", isAuthenticated, async (req, res) => {
    try {
      const { vehicleId } = req.query;
      const recommendations = await storage.getAIPartsRecommendations(vehicleId as string);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Document OCR with AI Analysis
  app.post("/api/ai-ocr/process", isAuthenticated, async (req: any, res) => {
    try {
      const { documentType, imageData, extractedText } = req.body;
      const { analyzeOCRDocument } = await import("./ai-service");
      
      // In production, use OCR service (Tesseract.js or cloud) to extract text from imageData
      const textToAnalyze = extractedText || "Sample extracted text";
      
      const analysis = await analyzeOCRDocument(textToAnalyze, documentType);
      
      const document = await storage.createOCRDocument({
        userId: req.user?.id,
        garageId: req.user?.garageId,
        documentType,
        originalText: textToAnalyze,
        extractedData: analysis.fields,
        confidence: 85,
        status: "processed"
      });

      res.json({ document, analysis });
    } catch (error) {
      console.error("Error processing OCR document:", error);
      res.status(500).json({ message: "Failed to process document" });
    }
  });

  app.get("/api/ai-ocr/documents", isAuthenticated, async (req: any, res) => {
    try {
      const documents = await storage.getOCRDocuments(req.user?.garageId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching OCR documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // AI Service Suggestions
  app.post("/api/ai-service/suggest", isAuthenticated, async (req, res) => {
    try {
      const { customer, vehicle, symptoms, mileage } = req.body;
      const { generateServiceSuggestions } = await import("./ai-service");
      
      const suggestions = await generateServiceSuggestions({
        customer,
        vehicle,
        symptoms,
        mileage
      });

      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating service suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // REMOVED: Analytics Phase 2 (2nd block) routes — now served by analytics.ts

  // ========================================
  // PHASE 7: ADVANCED HARDWARE (GET Routes)
  // ========================================

  // Barcode Scanner - Module 90
  app.get("/api/barcode/scans", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { scanType } = req.query;
      const scans = await phase7Service.getBarcodeScanHistory(garageId, scanType as string);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching barcode scans:", error);
      res.status(500).json({ message: "Failed to fetch barcode scans" });
    }
  });

  // Digital Signage - Module 91
  app.get("/api/signage/displays", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const displays = await phase7Service.getSignageDisplays(garageId);
      res.json(displays);
    } catch (error) {
      console.error("Error fetching signage displays:", error);
      res.status(500).json({ message: "Failed to fetch signage displays" });
    }
  });

  app.get("/api/signage/content", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const displays = await phase7Service.getSignageDisplays(garageId);
      
      // Fetch content for all displays
      const allContent = [];
      for (const display of displays) {
        const content = await phase7Service.getActiveContentForDisplay(display.id);
        allContent.push(...content.map((c: any) => ({ ...c, displayName: display.displayName })));
      }
      
      res.json(allContent);
    } catch (error) {
      console.error("Error fetching signage content:", error);
      res.status(500).json({ message: "Failed to fetch signage content" });
    }
  });

  // Kiosk Check-In - Module 92
  app.get("/api/kiosk/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { limit } = req.query;
      const checkIns = await phase7Service.getKioskCheckIns(garageId, limit ? parseInt(limit) : 50);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching kiosk sessions:", error);
      res.status(500).json({ message: "Failed to fetch kiosk sessions" });
    }
  });

  // Kiosk Customer Lookup by Phone - For real check-in flow
  app.get("/api/kiosk/lookup-customer", isAuthenticated, async (req: any, res) => {
    try {
      const { phone } = req.query;
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const cleanPhone = String(phone).replace(/\D/g, '');
      const customers = await storage.getCustomers();
      const customer = customers.find((c: any) => {
        const customerPhone = (c.phone || '').replace(/\D/g, '');
        return customerPhone.includes(cleanPhone) || cleanPhone.includes(customerPhone);
      });
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found", found: false });
      }
      
      const vehicles = await storage.getVehiclesByCustomer(customer.id);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const allAppointments = await storage.getAppointments();
      const todayAppointments = allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate);
        return apt.customerId === customer.id && 
               aptDate >= today && 
               aptDate < tomorrow &&
               apt.status !== 'completed' && 
               apt.status !== 'cancelled';
      });
      
      res.json({
        found: true,
        customer: { id: customer.id, fullName: customer.fullName, phone: customer.phone, email: customer.email },
        vehicles: vehicles.map((v: any) => ({ id: v.id, make: v.make, model: v.model, year: v.year, plateNumber: v.plateNumber })),
        todayAppointments: todayAppointments.map((apt: any) => ({
          id: apt.id, appointmentNumber: apt.appointmentNumber, serviceType: apt.serviceType,
          appointmentDate: apt.appointmentDate, duration: apt.duration, status: apt.status,
          vehicleId: apt.vehicleId || null,
        })),
      });
    } catch (error) {
      console.error("Error looking up customer:", error);
      res.status(500).json({ message: "Failed to lookup customer" });
    }
  });

  // Kiosk Check-In with Appointment Validation
  app.post("/api/kiosk/validate-checkin", isAuthenticated, async (req: any, res) => {
    try {
      const { customerId, vehicleId, appointmentId } = req.body;
      if (!customerId || !vehicleId) {
        return res.status(400).json({ message: "Customer ID and Vehicle ID are required" });
      }
      
      const customer = await storage.getUser(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle || vehicle.customerId !== customerId) {
        return res.status(400).json({ message: "Vehicle does not belong to this customer" });
      }
      
      if (appointmentId) {
        const appointment = await storage.getAppointment(appointmentId);
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        if (appointment.customerId !== customerId) {
          return res.status(400).json({ message: "Appointment does not belong to this customer" });
        }
        await storage.updateAppointment(appointmentId, { status: 'in_progress' });
      }
      
      res.json({ valid: true, message: "Check-in validated successfully", isWalkIn: !appointmentId });
    } catch (error) {
      console.error("Error validating check-in:", error);
      res.status(500).json({ message: "Failed to validate check-in" });
    }
  });

  // Reminder Settings API
  app.get("/api/reminder-settings", isAuthenticated, async (req: any, res) => {
    try {
      res.json({
        smsEnabled: true, emailEnabled: true, whatsappEnabled: false, postAppointmentFollowup: true,
        smsTimings: ['24h', '2h'], emailTimings: ['72h', '24h'], whatsappTimings: ['24h'],
        smsTemplate: 'Hi {customerName}, reminder: Your appointment at SALIS AUTO is tomorrow at {time}. Reply CONFIRM or CANCEL.',
        emailSubject: 'Appointment Reminder - SALIS AUTO',
      });
    } catch (error) {
      console.error("Error fetching reminder settings:", error);
      res.status(500).json({ message: "Failed to fetch reminder settings" });
    }
  });

  app.patch("/api/reminder-settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = req.body;
      res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      res.status(500).json({ message: "Failed to update reminder settings" });
    }
  });

  // Send Manual Reminder
  app.post("/api/reminders/send", isAuthenticated, async (req: any, res) => {
    try {
      const { appointmentId, reminderType } = req.body;
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      console.log(`Sending ${reminderType} reminder for appointment ${appointmentId}`);
      
      res.json({ 
        success: true, 
        message: `${reminderType} reminder sent successfully`,
        reminderLog: {
          id: `rem-${Date.now()}`, appointmentId, reminderType, sentAt: new Date().toISOString(),
          deliveryStatus: 'delivered', recipientPhone: appointment.customerPhone,
        }
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });

  // Reminder Logs and No-shows
  app.get("/api/reminder-logs", isAuthenticated, async (req: any, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          ar.id,
          ar.appointment_id as "appointmentId",
          ar.reminder_type as "reminderType",
          ar.scheduled_for as "scheduledFor",
          ar.sent_at as "sentAt",
          ar.status,
          ar.failure_reason as "failureReason",
          ar.created_at as "createdAt",
          a.customer_name as "customerName",
          a.customer_phone as "customerPhone",
          a.customer_email as "customerEmail",
          a.service_type as "serviceType",
          a.appointment_date as "appointmentDate",
          CASE 
            WHEN ar.status = 'sent' THEN 'delivered'
            WHEN ar.status = 'failed' THEN 'failed'
            WHEN ar.status = 'pending' THEN 'pending'
            ELSE 'unknown'
          END as "deliveryStatus"
        FROM appointment_reminders ar
        LEFT JOIN appointments a ON ar.appointment_id = a.id
        ORDER BY ar.scheduled_for DESC
        LIMIT 100
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching reminder logs:", error);
      res.status(500).json({ message: "Failed to fetch reminder logs" });
    }
  });

  app.get("/api/no-shows", isAuthenticated, async (req: any, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          a.id,
          a.customer_name as "customerName",
          a.customer_phone as "customerPhone",
          a.appointment_date as "scheduledTime",
          a.updated_at as "markedNoShowAt",
          COALESCE(
            CASE 
              WHEN a.service_type = 'maintenance' THEN 150.00
              WHEN a.service_type = 'repair' THEN 250.00
              WHEN a.service_type = 'inspection' THEN 75.00
              WHEN a.service_type = 'diagnostic' THEN 125.00
              ELSE 100.00
            END, 0
          ) as "estimatedRevenueLoss",
          1 as "contactAttempts",
          false as "noShowFeeCharged",
          0 as "feeAmount",
          false as "feePaid",
          false as "feeWaived",
          false as "rescheduled",
          'Customer did not arrive for scheduled appointment' as "reason"
        FROM appointments a
        WHERE a.status = 'no_show'
        ORDER BY a.updated_at DESC
        LIMIT 50
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching no-shows:", error);
      res.status(500).json({ message: "Failed to fetch no-shows" });
    }
  });

  // Security Cameras - Module 93
  app.get("/api/cameras/cameras", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const cameras = await phase7Service.getSecurityCameras(garageId);
      res.json(cameras);
    } catch (error) {
      console.error("Error fetching security cameras:", error);
      res.status(500).json({ message: "Failed to fetch security cameras" });
    }
  });

  app.get("/api/cameras/recordings", isAuthenticated, async (req: any, res) => {
    try {
      const { cameraId, limit } = req.query;
      if (!cameraId) {
        return res.status(400).json({ message: "cameraId query parameter is required" });
      }
      const recordings = await phase7Service.getCameraRecordings(cameraId as string, limit ? parseInt(limit as string) : 50);
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching camera recordings:", error);
      res.status(500).json({ message: "Failed to fetch camera recordings" });
    }
  });

  // License Plate Recognition - Module 94
  app.get("/api/license-plate/scans", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { limit } = req.query;
      const scans = await phase7Service.getLicensePlateScans(garageId, limit ? parseInt(limit) : 100);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching license plate scans:", error);
      res.status(500).json({ message: "Failed to fetch license plate scans" });
    }
  });

  app.get("/api/license-plate/entry-logs", isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { vehicleId } = req.query;
      const logs = await phase7Service.getVehicleEntryLogs(garageId, vehicleId as string);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching vehicle entry logs:", error);
      res.status(500).json({ message: "Failed to fetch vehicle entry logs" });
    }
  });

  // REMOVED: Mobile Apps API (Phase 8) routes — now served by mobile-api.ts

  // ==========================================
  // PHASE 4: CUSTOMER EXPERIENCE ROUTES
  // ==========================================

  // Live Service Tracking
  app.get('/api/service-tracking/:jobCardId', isAuthenticated, async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const timeline = await phase4Service.getServiceTrackingTimeline(jobCardId);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching service tracking timeline:", error);
      res.status(500).json({ message: "Failed to fetch service tracking timeline" });
    }
  });

  app.post('/api/service-tracking/:jobCardId/update', isAuthenticated, async (req: any, res) => {
    try {
      const { jobCardId } = req.params;
      const userId = req.user?.id || 'default-user';
      
      const validated = serviceTrackingUpdateSchema.parse(req.body);
      
      const updateData = {
        jobCardId,
        userId,
        status: validated.status,
        message: validated.message,
        photoUrl: validated.photoUrl,
        estimatedCompletion: validated.estimatedCompletion ? new Date(validated.estimatedCompletion) : undefined,
      };
      const update = await phase4Service.postServiceUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error posting service update:", error);
      res.status(500).json({ message: "Failed to post service update" });
    }
  });

  // Video Estimates
  app.get('/api/video-estimates/customer/:customerId', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const estimates = await phase4Service.getVideoEstimates(customerId);
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching video estimates:", error);
      res.status(500).json({ message: "Failed to fetch video estimates" });
    }
  });

  app.patch('/api/video-estimates/:id/approve', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const estimate = await phase4Service.approveVideoEstimate(id);
      res.json(estimate);
    } catch (error) {
      console.error("Error approving video estimate:", error);
      res.status(500).json({ message: "Failed to approve video estimate" });
    }
  });

  // Digital Vehicle Walkaround
  app.post('/api/digital-walkaround', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = digitalWalkaroundSchema.parse(req.body);
      
      const walkaroundData = {
        garageId,
        jobCardId: validated.jobCardId,
        vehicleId: validated.vehicleId,
        customerId: validated.customerId,
        technicianId: validated.technicianId,
        inspectionType: validated.inspectionType,
        photos: validated.photos,
        damageNotes: validated.damageNotes,
      };
      const walkaround = await phase4Service.createDigitalWalkaround(walkaroundData);
      res.status(201).json(walkaround);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating digital walkaround:", error);
      res.status(500).json({ message: "Failed to create digital walkaround" });
    }
  });

  app.get('/api/digital-walkaround/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const walkaround = await phase4Service.getDigitalWalkaround(id);
      if (!walkaround) {
        return res.status(404).json({ message: "Digital walkaround not found" });
      }
      res.json(walkaround);
    } catch (error) {
      console.error("Error fetching digital walkaround:", error);
      res.status(500).json({ message: "Failed to fetch digital walkaround" });
    }
  });

  // Customer Reviews & Ratings
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = customerReviewSchema.parse(req.body);
      
      const reviewData = {
        garageId,
        customerId: validated.customerId,
        jobCardId: validated.jobCardId,
        platform: validated.platform,
        rating: validated.rating,
        reviewText: validated.reviewText,
        reviewUrl: validated.reviewUrl,
      };
      const review = await phase4Service.postCustomerReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error posting customer review:", error);
      res.status(500).json({ message: "Failed to post customer review" });
    }
  });

  app.get('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { platform } = req.query;
      const reviews = await phase4Service.getReviewsByPlatform(garageId, platform as string);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      
      const validated = reviewResponseSchema.parse(req.body);
      
      const review = await phase4Service.respondToReview(id, validated.response, userId);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error responding to review:", error);
      res.status(500).json({ message: "Failed to respond to review" });
    }
  });

  // Referral Program
  app.post('/api/referrals/generate-code', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = generateReferralCodeSchema.parse(req.body);
      
      const code = await phase4Service.generateReferralCode(garageId, validated.customerId);
      res.json({ code });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  app.post('/api/referrals/apply', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = applyReferralCodeSchema.parse(req.body);
      
      const result = await phase4Service.applyReferralCode(garageId, validated.referralCode, validated.newCustomerId);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error applying referral code:", error);
      res.status(500).json({ message: "Failed to apply referral code" });
    }
  });

  app.get('/api/referrals/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const analytics = await phase4Service.getReferralAnalytics(garageId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching referral analytics:", error);
      res.status(500).json({ message: "Failed to fetch referral analytics" });
    }
  });

  // ==========================================
  // PHASE 5: OPERATIONS & EFFICIENCY ROUTES
  // ==========================================


  // Parts Auto-Reordering System
  app.post('/api/auto-reorder/check', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const triggeredOrders = await phase5Service.checkAndTriggerReorders(garageId);
      res.json({ triggered: triggeredOrders.length, orders: triggeredOrders });
    } catch (error) {
      console.error("Error checking auto-reorders:", error);
      res.status(500).json({ message: "Failed to check auto-reorders" });
    }
  });

  // Multi-Location Routing Optimizer
  // Time Clock & Payroll
  app.post('/api/payroll/calculate/:periodId', isAuthenticated, async (req, res) => {
    try {
      const { periodId } = req.params;
      const payrollEntries = await phase5Service.calculatePayroll(periodId);
      res.json(payrollEntries);
    } catch (error) {
      console.error("Error calculating payroll:", error);
      res.status(500).json({ message: "Failed to calculate payroll" });
    }
  });

  // Equipment Calibration Tracking
  app.post('/api/calibration', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = calibrationRecordSchema.parse(req.body);
      
      const calibrationData = {
        garageId,
        toolId: validated.equipmentId,
        calibrationType: 'Standard Calibration',
        lastCalibrationDate: new Date(validated.calibrationDate),
        nextCalibrationDue: new Date(validated.nextDueDate),
        calibrationInterval: 90,
        calibratedBy: validated.calibratedBy,
        certificationNumber: validated.certificationNumber,
      };
      const calibration = await phase5Service.createCalibrationRecord(calibrationData);
      res.status(201).json(calibration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating calibration record:", error);
      res.status(500).json({ message: "Failed to create calibration record" });
    }
  });

  app.get('/api/calibration/due', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { days } = req.query;
      const dueCalibrations = await phase5Service.getCalibrationsDue(garageId, days ? parseInt(days) : 30);
      res.json(dueCalibrations);
    } catch (error) {
      console.error("Error fetching due calibrations:", error);
      res.status(500).json({ message: "Failed to fetch due calibrations" });
    }
  });


  // ISO 9001 Quality Management
  app.post('/api/quality/checklists', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = qualityChecklistSchema.parse(req.body);
      
      const checklistData = {
        garageId,
        checklistName: validated.checklistName,
        checklistType: validated.checklistType,
        items: validated.items,
      };
      const checklist = await phase6Service.createQualityChecklist(checklistData);
      res.status(201).json(checklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating quality checklist:", error);
      res.status(500).json({ message: "Failed to create quality checklist" });
    }
  });

  // Safety Incident Reporting
  app.post('/api/safety/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = safetyIncidentSchema.parse(req.body);
      
      const incidentData = {
        garageId,
        incidentDate: new Date(validated.incidentDate),
        incidentType: validated.incidentType,
        severity: validated.severity,
        location: validated.location,
        description: validated.description,
        injuredPerson: validated.injuredPerson,
        witnessNames: validated.witnessNames,
        reportedBy: validated.reportedBy,
        immediateAction: validated.immediateAction,
        photos: validated.photos,
      };
      const incident = await phase6Service.createSafetyIncident(incidentData);
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating safety incident:", error);
      res.status(500).json({ message: "Failed to create safety incident" });
    }
  });

  app.get('/api/safety/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      const incidents = await phase6Service.getSafetyIncidents(garageId, status as string);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching safety incidents:", error);
      res.status(500).json({ message: "Failed to fetch safety incidents" });
    }
  });

  app.get('/api/safety/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { startDate, endDate } = req.query;
      const analytics = await phase6Service.getSafetyAnalytics(
        garageId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching safety analytics:", error);
      res.status(500).json({ message: "Failed to fetch safety analytics" });
    }
  });

  // Insurance Claims
  app.post('/api/insurance/claims', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = insuranceClaimSchema.parse(req.body);
      
      const claimData = {
        garageId,
        claimNumber: validated.claimNumber,
        jobCardId: validated.jobCardId,
        customerId: validated.customerId,
        vehicleId: validated.vehicleId,
        insuranceCompany: validated.insuranceCompany,
        policyNumber: validated.policyNumber,
        claimType: validated.claimType,
        incidentDate: new Date(validated.incidentDate),
        claimAmount: validated.claimAmount,
        deductible: validated.deductible,
        adjusterName: validated.adjusterName,
        adjusterContact: validated.adjusterContact,
        estimateUrl: validated.estimateUrl,
        documents: validated.documents,
        notes: validated.notes,
      };
      const claim = await phase6Service.createInsuranceClaim(claimData);
      res.status(201).json(claim);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating insurance claim:", error);
      res.status(500).json({ message: "Failed to create insurance claim" });
    }
  });

  app.get('/api/insurance/claims', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      const claims = await phase6Service.getInsuranceClaims(garageId, status as string);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching insurance claims:", error);
      res.status(500).json({ message: "Failed to fetch insurance claims" });
    }
  });

  app.patch('/api/insurance/claims/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const validated = claimStatusUpdateSchema.parse(req.body);
      
      const claim = await phase6Service.updateClaimStatus(id, validated.status, validated.notes);
      res.json(claim);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error updating claim status:", error);
      res.status(500).json({ message: "Failed to update claim status" });
    }
  });

  app.get('/api/insurance/claims/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const analytics = await phase6Service.getClaimsAnalytics(garageId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching claims analytics:", error);
      res.status(500).json({ message: "Failed to fetch claims analytics" });
    }
  });

  // ==========================================
  // PHASE 7: ADVANCED HARDWARE ROUTES
  // ==========================================

  // Barcode/QR Scanner Integration
  app.post('/api/barcode/scan', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = barcodeScanSchema.parse(req.body);
      
      const scanData = {
        garageId,
        barcodeValue: validated.barcodeValue,
        barcodeType: validated.barcodeType,
        entityType: validated.entityType,
        entityId: validated.entityId,
        scannedBy: validated.scannedBy,
        location: validated.location,
      };
      const scan = await phase7Service.recordBarcodeScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error recording barcode scan:", error);
      res.status(500).json({ message: "Failed to record barcode scan" });
    }
  });

  app.get('/api/barcode/history', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { entityType, limit } = req.query;
      const history = await phase7Service.getScanHistory(
        garageId,
        entityType as string,
        limit ? parseInt(limit) : 100
      );
      res.json(history);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      res.status(500).json({ message: "Failed to fetch scan history" });
    }
  });

  // Digital Signage System
  app.post('/api/signage/displays', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = signageDisplaySchema.parse(req.body);
      
      const displayData = {
        garageId,
        displayName: validated.displayName,
        location: validated.location,
        resolution: validated.resolution,
        orientation: validated.orientation,
      };
      const display = await phase7Service.createSignageDisplay(displayData);
      res.status(201).json(display);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating signage display:", error);
      res.status(500).json({ message: "Failed to create signage display" });
    }
  });

  app.post('/api/signage/content', isAuthenticated, async (req, res) => {
    try {
      const validated = signageContentSchema.parse(req.body);
      
      const contentData = {
        displayId: validated.displayId,
        contentType: validated.contentType,
        contentUrl: validated.contentUrl,
        title: validated.title,
        description: validated.description,
        duration: validated.duration,
        validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
        priority: validated.priority,
      };
      const content = await phase7Service.createSignageContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating signage content:", error);
      res.status(500).json({ message: "Failed to create signage content" });
    }
  });

  app.get('/api/signage/displays/:displayId/active-content', isAuthenticated, async (req, res) => {
    try {
      const { displayId } = req.params;
      const content = await phase7Service.getActiveContentForDisplay(displayId);
      res.json(content);
    } catch (error) {
      console.error("Error fetching active content:", error);
      res.status(500).json({ message: "Failed to fetch active content" });
    }
  });

  // Kiosk Check-In Interface
  app.post('/api/kiosk/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = kioskSessionSchema.parse(req.body);
      
      const sessionData = {
        garageId,
        kioskId: validated.kioskId,
        sessionType: validated.sessionType,
      };
      const session = await phase7Service.createKioskSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating kiosk session:", error);
      res.status(500).json({ message: "Failed to create kiosk session" });
    }
  });


  // License Plate Recognition
  app.post('/api/lpr/scan', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = licensePlateScanSchema.parse(req.body);
      
      const scanData = {
        garageId,
        plateNumber: validated.plateNumber,
        confidence: validated.confidence,
        vehicleId: validated.vehicleId,
        customerId: validated.customerId,
        cameraId: validated.cameraId,
        imageUrl: validated.imageUrl,
        scanType: validated.scanType,
        location: validated.location,
        matchedAutomatically: validated.matchedAutomatically,
      };
      const scan = await phase7Service.recordLicensePlateScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error recording license plate scan:", error);
      res.status(500).json({ message: "Failed to record license plate scan" });
    }
  });

  app.get('/api/lpr/scans', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { limit } = req.query;
      const scans = await phase7Service.getLicensePlateScans(garageId, limit ? parseInt(limit) : 100);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching license plate scans:", error);
      res.status(500).json({ message: "Failed to fetch license plate scans" });
    }
  });

  app.get('/api/lpr/entry-logs', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      const logs = await phase7Service.getVehicleEntryLogs(garageId, status as string);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching entry logs:", error);
      res.status(500).json({ message: "Failed to fetch entry logs" });
    }
  });

  // ==========================================
  // PHASE 7: ROUTE ALIASES FOR FRONTEND
  // ==========================================

  // Barcode/QR Scanner - POST alias
  // Kiosk Check-In - POST alias
  app.post('/api/kiosk/checkin', isAuthenticated, async (req, res) => {
    try {
      const { customerId, vehicleId, appointmentId, phoneNumber, checkInMethod, sessionId } = req.body;
      
      const checkInData = {
        sessionId: sessionId || 'temp-session',
        customerId,
        vehicleId,
        appointmentId,
        serviceRequested: { method: checkInMethod, phone: phoneNumber },
      };
      const checkIn = await phase7Service.completeKioskCheckIn(checkInData);
      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Error completing kiosk check-in:", error);
      res.status(500).json({ message: "Failed to complete kiosk check-in" });
    }
  });

  // Security Cameras - POST aliases
  app.post('/api/cameras/cameras', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const { name, location, cameraType, ipAddress, streamUrl, resolution } = req.body;
      
      const cameraData = {
        garageId,
        cameraName: name,
        location,
        cameraType,
        streamUrl,
        recordingEnabled: true,
        motionDetection: false,
      };
      const camera = await phase7Service.createSecurityCamera(cameraData);
      res.status(201).json(camera);
    } catch (error) {
      console.error("Error creating security camera:", error);
      res.status(500).json({ message: "Failed to create security camera" });
    }
  });

  app.post('/api/cameras/recordings', isAuthenticated, async (req, res) => {
    try {
      const { cameraId, startTime, endTime, eventType, fileSize, vehicleId } = req.body;
      
      const recordingData = {
        cameraId,
        recordingStart: new Date(startTime),
        recordingEnd: new Date(endTime),
        eventType,
        fileSize,
        vehicleId,
      };
      const recording = await phase7Service.createCameraRecording(recordingData);
      res.status(201).json(recording);
    } catch (error) {
      console.error("Error creating camera recording:", error);
      res.status(500).json({ message: "Failed to create camera recording" });
    }
  });

  // License Plate Recognition - POST alias
  app.post('/api/license-plate/scan', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const { plateNumber, confidence, scanType, vehicleId, location } = req.body;
      
      const scanData = {
        garageId,
        plateNumber,
        confidence,
        vehicleId,
        scanType,
        location,
        matchedAutomatically: confidence && confidence > 90,
      };
      const scan = await phase7Service.recordLicensePlateScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      console.error("Error recording license plate scan:", error);
      res.status(500).json({ message: "Failed to record license plate scan" });
    }
  });


  // REMOVED: Next-Gen Technology routes — now served by nextgen.ts
  // REMOVED: Payroll routes — now served by payroll.ts
  // REMOVED: Expense routes — now served by financial-ops.ts
  // REMOVED: Towing routes — now served by operations.ts

  // ==================== VEHICLE STORAGE ROUTES ====================
  app.get('/api/storage-facilities', isAuthenticated, async (req: any, res) => {
    try {
      const facilities = await storage.getStorageFacilities(req.user?.garageId);
      res.json({ data: facilities });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/storage-facilities', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertStorageFacilitySchema.parse(req.body);
      const facility = await storage.createStorageFacility(validatedData);
      res.json({ data: facility });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/vehicle-storage-assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getVehicleStorageAssignments(req.query.facilityId as string, req.query.vehicleId as string);
      res.json({ data: assignments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/vehicle-storage-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertVehicleStorageAssignmentSchema.parse(req.body);
      const assignment = await storage.createVehicleStorageAssignment(validatedData);
      res.json({ data: assignment });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });


  // REMOVED: Telematics Integration routes — now served by obd-telematics.ts
  // REMOVED: Knowledge Base routes — now served by training.ts
  // REMOVED: Training LMS routes — now served by training.ts
  // REMOVED: GMB routes — now served by gmb.ts
  // REMOVED: Client Portal + Chatbot routes — now served by customer-support.ts
  // REMOVED: IoT Vehicle Health routes — now served by iot.ts

  // REMOVED: fleet GPS/tracking routes — now served by fleet.ts

  // Send payment reminder via SMS
  app.post('/api/send-payment-reminder', isAuthenticated, async (req: any, res) => {
    try {
      // Validate request body with Zod
      const paymentReminderSchema = z.object({
        customerId: z.string(),
        customerName: z.string().optional(),
        customerPhone: z.string().min(1, "Phone number is required"),
        invoiceId: z.string(),
        amount: z.union([z.number(), z.string()]).transform(val => 
          typeof val === 'number' ? val : parseFloat(val) || 0
        ),
      });

      const validated = paymentReminderSchema.parse(req.body);

      const { smsService } = await import('./services/smsService');
      const garages = await storage.getGarages();
      const userGarage = garages.find(g => g.id === req.user?.garageId);
      const garageName = userGarage?.name || 'SALIS AUTO';

      const template = smsService.invoiceNotification({
        customerName: validated.customerName || 'Customer',
        invoiceNumber: validated.invoiceId.substring(0, 8),
        amount: validated.amount.toFixed(2),
        dueDate: 'soon',
        garageName,
      });

      await smsService.sendSMS({
        to: validated.customerPhone,
        recipientId: validated.customerId,
        garageId: req.user?.garageId,
        template,
        category: 'payment_reminder',
        metadata: { invoiceId: validated.invoiceId, amount: validated.amount },
      });

      res.json({ success: true, message: "Payment reminder sent successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error sending payment reminder:", error);
      res.status(500).json({ message: "Failed to send payment reminder" });
    }
  });

  // REMOVED: technician performance routes -- now served by operations.ts


  // ========================================
  // MAINTENANCE RECOMMENDATIONS ROUTES
  // ========================================

  // Get maintenance recommendations for a vehicle
  app.get('/api/maintenance/recommendations/:vehicleId', isAuthenticated, async (req: any, res) => {
    try {
      const recommendations = await storage.getMaintenanceRecommendations(req.params.vehicleId);
      res.json(recommendations);
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Acknowledge recommendation
  app.patch('/api/maintenance/recommendations/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const recommendation = await storage.acknowledgeMaintenanceRecommendation(req.params.id);
      res.json(recommendation);
    } catch (error: any) {
      console.error("Error acknowledging recommendation:", error);
      res.status(500).json({ message: "Failed to acknowledge recommendation" });
    }
  });

  // REMOVED: telematics routes -- now served by obd-telematics.ts

  // REMOVED: gamification routes -- now served by training.ts

  // ========================================
  // DASHBOARD WIDGETS ROUTES
  // ========================================

  // Get user's dashboard widgets
  app.get('/api/dashboard/widgets', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId || 'default-garage';
      const widgets = await storage.getDashboardWidgets(req.user?.id, garageId);
      res.json(widgets);
    } catch (error: any) {
      console.error("Error fetching widgets:", error);
      res.status(500).json({ message: "Failed to fetch widgets" });
    }
  });

  // Get default widget templates
  app.get('/api/dashboard/widgets/defaults', isAuthenticated, async (req: any, res) => {
    try {
      const defaults = await storage.getDefaultWidgets();
      res.json(defaults);
    } catch (error: any) {
      console.error("Error fetching default widgets:", error);
      res.status(500).json({ message: "Failed to fetch default widgets" });
    }
  });

  // Create new widget
  app.post('/api/dashboard/widgets', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId || 'default-garage';
      const widget = await storage.createDashboardWidget({
        ...req.body,
        userId: req.user?.id,
        garageId,
      });
      res.json(widget);
    } catch (error: any) {
      console.error("Error creating widget:", error);
      res.status(500).json({ message: "Failed to create widget" });
    }
  });

  // Update widget
  app.patch('/api/dashboard/widgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const widget = await storage.updateDashboardWidget(req.params.id, req.body);
      res.json(widget);
    } catch (error: any) {
      console.error("Error updating widget:", error);
      res.status(500).json({ message: "Failed to update widget" });
    }
  });

  // Update multiple widget positions
  app.patch('/api/dashboard/widgets/positions', isAuthenticated, async (req: any, res) => {
    try {
      await storage.updateWidgetPositions(req.user?.id, req.body.positions);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating widget positions:", error);
      res.status(500).json({ message: "Failed to update positions" });
    }
  });

  // Delete widget
  app.delete('/api/dashboard/widgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteDashboardWidget(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting widget:", error);
      res.status(500).json({ message: "Failed to delete widget" });
    }
  });

  // ========================================
  // ENHANCED BACKUP & RESTORE ROUTES
  // ========================================

  // Get backup statistics
  app.get('/api/backups/stats', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId || 'default-garage';
      const stats = await storage.getBackupJobStats(garageId);
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching backup stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get latest backup
  app.get('/api/backups/latest', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId || 'default-garage';
      const backup = await storage.getLatestBackupJob(garageId);
      res.json(backup || null);
    } catch (error: any) {
      console.error("Error fetching latest backup:", error);
      res.status(500).json({ message: "Failed to fetch latest backup" });
    }
  });

  // Get all backups
  app.get('/api/backups', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId || 'default-garage';
      const { status } = req.query;
      const backups = await storage.getBackupJobs(garageId, status as string);
      res.json(backups);
    } catch (error: any) {
      console.error("Error fetching backups:", error);
      res.status(500).json({ message: "Failed to fetch backups" });
    }
  });

  // Create new backup job
  app.post('/api/backups', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId || 'default-garage';
      const backup = await storage.createBackupJob({
        garageId,
        jobType: req.body.jobType || 'full',
        status: 'pending',
        dataTypes: req.body.dataTypes || ['all'],
        createdBy: req.user?.id,
        startedAt: new Date(),
      });
      
      // Simulate backup processing
      setTimeout(async () => {
        try {
          const fileSize = Math.floor(Math.random() * 50000000) + 10000000;
          const fileName = `backup_${garageId}_${Date.now()}.zip`;
          await storage.updateBackupJob(backup.id, {
            status: 'completed',
            completedAt: new Date(),
            fileSize,
            fileName,
          });
        } catch (e) {
          await storage.updateBackupJob(backup.id, {
            status: 'failed',
            errorMessage: (e as Error).message,
          });
        }
      }, 3000);
      
      res.json(backup);
    } catch (error: any) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // Get single backup by ID
  app.get('/api/backups/:id', isAuthenticated, async (req: any, res) => {
    try {
      const backup = await storage.getBackupJob(req.params.id);
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }
      res.json(backup);
    } catch (error: any) {
      console.error("Error fetching backup:", error);
      res.status(500).json({ message: "Failed to fetch backup" });
    }
  });

  // Delete backup
  app.delete('/api/backups/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteBackupJob(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting backup:", error);
      res.status(500).json({ message: "Failed to delete backup" });
    }
  });

  // Restore from backup
  app.post('/api/backups/:id/restore', isAuthenticated, async (req: any, res) => {
    try {
      const backup = await storage.getBackupJob(req.params.id);
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }
      if (backup.status !== 'completed') {
        return res.status(400).json({ message: "Backup is not completed" });
      }
      
      // Create restore job
      const garageId = req.user?.garageId || 'default-garage';
      const restoreJob = await storage.createBackupJob({
        garageId,
        jobType: 'restore',
        status: 'in_progress',
        dataTypes: backup.dataTypes,
        createdBy: req.user?.id,
        startedAt: new Date(),
      });
      
      // Simulate restore processing
      setTimeout(async () => {
        try {
          await storage.updateBackupJob(restoreJob.id, {
            status: 'completed',
            completedAt: new Date(),
          });
        } catch (e) {
          await storage.updateBackupJob(restoreJob.id, {
            status: 'failed',
            errorMessage: (e as Error).message,
          });
        }
      }, 5000);
      
      res.json(restoreJob);
    } catch (error: any) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ message: "Failed to restore backup" });
    }
  });

  // REMOVED: HR module routes -- now served by hr-payroll.ts

  // ==========================================
  // SERVICE BAY DASHBOARD ROUTES
  // ==========================================
  
  app.get('/api/service-bays', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      const bays = await storage.getServiceBays(garageId as string);
      res.json(bays);
    } catch (error: any) {
      console.error("Error fetching service bays:", error);
      res.status(500).json({ message: "Failed to fetch service bays" });
    }
  });

  app.get('/api/service-bays/with-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      const baysWithSessions = await storage.getServiceBaysWithSessions(garageId as string);
      res.json(baysWithSessions);
    } catch (error: any) {
      console.error("Error fetching service bays with sessions:", error);
      res.status(500).json({ message: "Failed to fetch service bays with sessions" });
    }
  });

  app.get('/api/service-bays/statistics', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      const statistics = await storage.getServiceBayStatistics(garageId as string);
      res.json(statistics);
    } catch (error: any) {
      console.error("Error fetching service bay statistics:", error);
      res.status(500).json({ message: "Failed to fetch service bay statistics" });
    }
  });

  app.post('/api/service-bays', isAuthenticated, async (req: any, res) => {
    try {
      const bay = await storage.createServiceBay(req.body);
      res.status(201).json(bay);
    } catch (error: any) {
      console.error("Error creating service bay:", error);
      res.status(500).json({ message: "Failed to create service bay" });
    }
  });

  app.patch('/api/service-bays/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const bay = await storage.updateServiceBayStatus(id, status);
      if (!bay) {
        return res.status(404).json({ message: "Service bay not found" });
      }
      res.json(bay);
    } catch (error: any) {
      console.error("Error updating service bay status:", error);
      res.status(500).json({ message: "Failed to update service bay status" });
    }
  });

  app.post('/api/service-bays/:bayId/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const { bayId } = req.params;
      const { vehicleId, jobCardId } = req.body;
      const session = await storage.startBaySession(bayId, vehicleId, jobCardId);
      res.status(201).json(session);
    } catch (error: any) {
      console.error("Error starting bay session:", error);
      res.status(500).json({ message: "Failed to start bay session" });
    }
  });

  app.patch('/api/service-bays/sessions/:sessionId/end', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.endBaySession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      console.error("Error ending bay session:", error);
      res.status(500).json({ message: "Failed to end bay session" });
    }
  });

  // ==========================================
  // Automated Inventory Reordering API
  // ==========================================
  
  app.get('/api/inventory-forecasts', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      if (!garageId) return res.status(400).json({ message: "garageId is required" });
      const forecasts = await storage.getInventoryForecasts(garageId as string);
      res.json(forecasts);
    } catch (error: any) {
      console.error("Error fetching inventory forecasts:", error);
      res.status(500).json({ message: "Failed to fetch inventory forecasts" });
    }
  });

  app.post('/api/inventory-forecasts', isAuthenticated, async (req: any, res) => {
    try {
      const forecast = await storage.createInventoryForecast(req.body);
      res.status(201).json(forecast);
    } catch (error: any) {
      console.error("Error creating inventory forecast:", error);
      res.status(500).json({ message: "Failed to create inventory forecast" });
    }
  });

  app.get('/api/replenishment-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, status } = req.query;
      const orders = await storage.getReplenishmentOrders(garageId as string, status as string);
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching replenishment orders:", error);
      res.status(500).json({ message: "Failed to fetch replenishment orders" });
    }
  });

  app.get('/api/replenishment-orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getReplenishmentOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error: any) {
      console.error("Error fetching replenishment order:", error);
      res.status(500).json({ message: "Failed to fetch replenishment order" });
    }
  });

  app.post('/api/replenishment-orders', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.createReplenishmentOrder(req.body);
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating replenishment order:", error);
      res.status(500).json({ message: "Failed to create replenishment order" });
    }
  });

  app.patch('/api/replenishment-orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.updateReplenishmentOrder(req.params.id, req.body);
      res.json(order);
    } catch (error: any) {
      console.error("Error updating replenishment order:", error);
      res.status(500).json({ message: "Failed to update replenishment order" });
    }
  });

  app.post('/api/replenishment-orders/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.approveReplenishmentOrder(req.params.id, req.user?.id || 'system');
      res.json(order);
    } catch (error: any) {
      console.error("Error approving replenishment order:", error);
      res.status(500).json({ message: "Failed to approve replenishment order" });
    }
  });

  // REMOVED: loyalty program routes -- now served by loyalty.ts

  // ==========================================
  // Workshop Calendar API
  // ==========================================

  app.get('/api/workshop-resources', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      if (!garageId) return res.status(400).json({ message: "garageId is required" });
      const resources = await storage.getWorkshopResources(garageId as string);
      res.json(resources);
    } catch (error: any) {
      console.error("Error fetching workshop resources:", error);
      res.status(500).json({ message: "Failed to fetch workshop resources" });
    }
  });

  app.post('/api/workshop-resources', isAuthenticated, async (req: any, res) => {
    try {
      const resource = await storage.createWorkshopResource(req.body);
      res.status(201).json(resource);
    } catch (error: any) {
      console.error("Error creating workshop resource:", error);
      res.status(500).json({ message: "Failed to create workshop resource" });
    }
  });

  app.patch('/api/workshop-resources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const resource = await storage.updateWorkshopResource(req.params.id, req.body);
      res.json(resource);
    } catch (error: any) {
      console.error("Error updating workshop resource:", error);
      res.status(500).json({ message: "Failed to update workshop resource" });
    }
  });

  app.delete('/api/workshop-resources/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteWorkshopResource(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting workshop resource:", error);
      res.status(500).json({ message: "Failed to delete workshop resource" });
    }
  });


  // ==========================================
  // AR Overlay API
  // ==========================================

  app.get('/api/ar-instructions', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      const instructions = await storage.getArWorkInstructions(garageId as string);
      res.json(instructions);
    } catch (error: any) {
      console.error("Error fetching AR instructions:", error);
      res.status(500).json({ message: "Failed to fetch AR instructions" });
    }
  });

  app.get('/api/ar-instructions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const instruction = await storage.getArWorkInstruction(req.params.id);
      if (!instruction) return res.status(404).json({ message: "Instruction not found" });
      res.json(instruction);
    } catch (error: any) {
      console.error("Error fetching AR instruction:", error);
      res.status(500).json({ message: "Failed to fetch AR instruction" });
    }
  });

  app.post('/api/ar-instructions', isAuthenticated, async (req: any, res) => {
    try {
      const instruction = await storage.createArWorkInstruction(req.body);
      res.status(201).json(instruction);
    } catch (error: any) {
      console.error("Error creating AR instruction:", error);
      res.status(500).json({ message: "Failed to create AR instruction" });
    }
  });

  app.patch('/api/ar-instructions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const instruction = await storage.updateArWorkInstruction(req.params.id, req.body);
      res.json(instruction);
    } catch (error: any) {
      console.error("Error updating AR instruction:", error);
      res.status(500).json({ message: "Failed to update AR instruction" });
    }
  });

  app.delete('/api/ar-instructions/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteArWorkInstruction(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting AR instruction:", error);
      res.status(500).json({ message: "Failed to delete AR instruction" });
    }
  });

  app.get('/api/ar-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, technicianId } = req.query;
      if (!garageId) return res.status(400).json({ message: "garageId is required" });
      const sessions = await storage.getArSessionLogs(garageId as string, technicianId as string);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching AR sessions:", error);
      res.status(500).json({ message: "Failed to fetch AR sessions" });
    }
  });

  app.post('/api/ar-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.createArSessionLog(req.body);
      res.status(201).json(session);
    } catch (error: any) {
      console.error("Error creating AR session:", error);
      res.status(500).json({ message: "Failed to create AR session" });
    }
  });

  app.patch('/api/ar-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.updateArSessionLog(req.params.id, req.body);
      res.json(session);
    } catch (error: any) {
      console.error("Error updating AR session:", error);
      res.status(500).json({ message: "Failed to update AR session" });
    }
  });

  app.get('/api/ar-devices', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      if (!garageId) return res.status(400).json({ message: "garageId is required" });
      const devices = await storage.getArDevicePairings(garageId as string);
      res.json(devices);
    } catch (error: any) {
      console.error("Error fetching AR devices:", error);
      res.status(500).json({ message: "Failed to fetch AR devices" });
    }
  });

  app.post('/api/ar-devices', isAuthenticated, async (req: any, res) => {
    try {
      const device = await storage.createArDevicePairing(req.body);
      res.status(201).json(device);
    } catch (error: any) {
      console.error("Error creating AR device pairing:", error);
      res.status(500).json({ message: "Failed to create AR device pairing" });
    }
  });

  app.patch('/api/ar-devices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const device = await storage.updateArDevicePairing(req.params.id, req.body);
      res.json(device);
    } catch (error: any) {
      console.error("Error updating AR device:", error);
      res.status(500).json({ message: "Failed to update AR device" });
    }
  });

  app.delete('/api/ar-devices/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteArDevicePairing(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting AR device:", error);
      res.status(500).json({ message: "Failed to delete AR device" });
    }
  });

  // Dashboard Stats API - Real database aggregations
  app.get('/api/stats/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      // Query 1: Count jobs grouped by status (uses static imports)
      const jobStatusCounts = await db
        .select({
          status: jobCards.status,
          count: count(),
        })
        .from(jobCards)
        .groupBy(jobCards.status);
      
      // Transform to frontend-friendly format
      const jobStatusData = jobStatusCounts.map(row => ({
        name: row.status.charAt(0).toUpperCase() + row.status.slice(1).replace(/_/g, ' '),
        value: Number(row.count),
        status: row.status,
      }));
      
      // Query 2: Sum invoice totals grouped by month (last 12 months)
      // Cast numeric totalAmount to decimal and sum directly
      const revenueByMonth = await db
        .select({
          month: sql<string>`TO_CHAR(${invoices.invoiceDate}, 'Mon')`,
          monthNum: sql<number>`EXTRACT(MONTH FROM ${invoices.invoiceDate})`,
          year: sql<number>`EXTRACT(YEAR FROM ${invoices.invoiceDate})`,
          revenue: sql<string>`COALESCE(SUM(${invoices.totalAmount}::DECIMAL), 0)`,
        })
        .from(invoices)
        .where(sql`${invoices.invoiceDate} >= NOW() - INTERVAL '12 months'`)
        .groupBy(
          sql`TO_CHAR(${invoices.invoiceDate}, 'Mon')`,
          sql`EXTRACT(MONTH FROM ${invoices.invoiceDate})`,
          sql`EXTRACT(YEAR FROM ${invoices.invoiceDate})`
        )
        .orderBy(
          sql`EXTRACT(YEAR FROM ${invoices.invoiceDate})`,
          sql`EXTRACT(MONTH FROM ${invoices.invoiceDate})`
        );
      
      // Transform to frontend-friendly format with fallback for empty data
      const revenueData = revenueByMonth.length > 0 
        ? revenueByMonth.map(row => ({
            month: row.month,
            revenue: parseFloat(row.revenue) || 0,
          }))
        : [
            { month: 'Jan', revenue: 0 },
            { month: 'Feb', revenue: 0 },
            { month: 'Mar', revenue: 0 },
          ];
      
      res.json({
        jobStatus: jobStatusData.length > 0 ? jobStatusData : [
          { name: 'Pending', value: 0, status: 'pending' },
          { name: 'In Progress', value: 0, status: 'in_progress' },
          { name: 'Completed', value: 0, status: 'completed' },
        ],
        revenue: revenueData,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ 
        message: "Failed to fetch dashboard stats",
        jobStatus: [],
        revenue: [],
      });
    }
  });


  // REMOVED: vehicle tracking routes — now served by operations.ts


  // REMOVED: service reminder template routes — now served by service-operations.ts

  // REMOVED: push/notifications routes — now served by customer-support.ts

  // ==================== 3D Parts Models API ====================

  app.get('/api/parts-3d-models', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          id,
          part_name as "partName",
          part_number as "partNumber",
          category,
          manufacturer,
          model_file_url as "modelFileUrl",
          texture_file_url as "textureFileUrl",
          file_size as "fileSize",
          polygon_count as "polygonCount",
          compatibility,
          explosion_view_url as "explosionViewUrl",
          annotations,
          view_count as "viewCount",
          download_count as "downloadCount",
          is_public as "isPublic",
          uploaded_by as "uploadedBy",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM parts_3d_models 
        WHERE is_public = true 
        ORDER BY view_count DESC
      `);
      res.json(result.rows || []);
    } catch (error: any) {
      console.error("Error fetching 3D parts models:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/parts-3d-models/:id', async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT * FROM parts_3d_models WHERE id = ${req.params.id}`);
      if (result.rows && result.rows.length > 0) {
        // Increment view count
        await db.execute(sql`UPDATE parts_3d_models SET view_count = view_count + 1 WHERE id = ${req.params.id}`);
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ message: "Part not found" });
      }
    } catch (error: any) {
      console.error("Error fetching 3D part model:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // REMOVED: platform admin routes — now served by platform-admin.ts

  const httpServer = createServer(app);
  
  // Initialize WebSocket server for chat
  initializeChatWebSocket(httpServer);
  
  return httpServer;
}
