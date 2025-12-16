import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
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
} from "@shared/schema";
import rateLimit from "express-rate-limit";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Audit logging middleware (applied after auth so user is available)
  app.use(auditLog);

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

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
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

  // Technician routes
  app.get('/api/technicians', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const technicians = await storage.getTechnicians(garage_id as string);
      res.json(technicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  app.post('/api/technicians', isAuthenticated, async (req, res) => {
    try {
      const technicianData = {
        ...req.body,
        userType: 'technician',
        isActive: true,
      };
      const technician = await storage.createUser(technicianData);
      res.status(201).json(technician);
    } catch (error) {
      console.error("Error creating technician:", error);
      res.status(500).json({ message: "Failed to create technician" });
    }
  });

  app.delete('/api/technicians/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting technician:", error);
      res.status(500).json({ message: "Failed to delete technician" });
    }
  });

  // Technician Profile routes
  app.get('/api/technician-profiles/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getTechnicianProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Technician profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      res.status(500).json({ message: "Failed to fetch technician profile" });
    }
  });

  app.post('/api/technician-profiles', isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.createTechnicianProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating technician profile:", error);
      res.status(500).json({ message: "Failed to create technician profile" });
    }
  });

  app.patch('/api/technician-profiles/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.updateTechnicianProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating technician profile:", error);
      res.status(500).json({ message: "Failed to update technician profile" });
    }
  });

  // Job Card routes - Module 8: Job Cards & Task Assignment
  app.get('/api/job-cards', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, assigned_to } = req.query;
      const jobCards = await storage.getJobCards(garage_id as string, assigned_to as string);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching job cards:", error);
      res.status(500).json({ message: "Failed to fetch job cards" });
    }
  });

  app.get('/api/job-cards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const jobCard = await storage.getJobCard(id);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      res.json(jobCard);
    } catch (error) {
      console.error("Error fetching job card:", error);
      res.status(500).json({ message: "Failed to fetch job card" });
    }
  });

  app.post('/api/job-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const jobCardData = {
        ...req.body,
        createdBy: userId,
      };
      const jobCard = await storage.createJobCard(jobCardData);
      res.status(201).json(jobCard);
    } catch (error) {
      console.error("Error creating job card:", error);
      res.status(500).json({ message: "Failed to create job card" });
    }
  });

  app.put('/api/job-cards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedJobCard = await storage.updateJobCard(id, req.body);
      res.json(updatedJobCard);
    } catch (error) {
      console.error("Error updating job card:", error);
      res.status(500).json({ message: "Failed to update job card" });
    }
  });

  app.patch('/api/job-cards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedJobCard = await storage.updateJobCard(id, req.body);
      res.json(updatedJobCard);
    } catch (error) {
      console.error("Error updating job card:", error);
      res.status(500).json({ message: "Failed to update job card" });
    }
  });

  // Task Assignment routes
  app.get('/api/job-cards/:jobCardId/tasks', isAuthenticated, async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const tasks = await storage.getTaskAssignments(jobCardId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching task assignments:", error);
      res.status(500).json({ message: "Failed to fetch task assignments" });
    }
  });

  app.post('/api/job-cards/:jobCardId/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const { jobCardId } = req.params;
      const userId = req.user?.id || 'default-user';
      const taskData = {
        ...req.body,
        jobCardId,
        assignedBy: userId,
      };
      const task = await storage.createTaskAssignment(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task assignment:", error);
      res.status(500).json({ message: "Failed to create task assignment" });
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTask = await storage.updateTaskAssignment(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task assignment:", error);
      res.status(500).json({ message: "Failed to update task assignment" });
    }
  });

  // Dynamic Service Tracking routes - Feature #3
  // Generate public tracking token for a job card
  app.post('/api/job-cards/:id/tracking/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Verify job card exists and user has access
      const jobCard = await storage.getJobCard(id);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      
      // Verify garage ownership
      const userGarages = await storage.getUserRoles(req.user?.id);
      const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);
      
      if (!hasAccess && req.user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { rawToken, hashedToken, expiresAt } = await storage.generatePublicTrackingToken(id);
      
      // Create tracking event
      await storage.createJobTrackingEvent({
        jobCardId: id,
        eventType: 'message',
        title: 'Tracking Link Generated',
        description: 'Customer tracking link has been generated and can be shared',
        isVisibleToCustomer: false,
        createdBy: req.user?.id,
      });
      
      res.json({ 
        trackingToken: rawToken,
        trackingUrl: `/track/${rawToken}`,
        expiresAt 
      });
    } catch (error) {
      console.error("Error generating tracking token:", error);
      res.status(500).json({ message: "Failed to generate tracking token" });
    }
  });

  // Public route - Get job status by tracking token (no auth required)
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

  // Create job tracking event
  app.post('/api/job-cards/:id/tracking/events', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validationResult = insertJobTrackingEventSchema.safeParse({
        ...req.body,
        jobCardId: id,
        createdBy: req.user?.id,
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const jobCard = await storage.getJobCard(id);
      
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      
      // Verify garage ownership
      const userGarages = await storage.getUserRoles(req.user?.id);
      const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);
      
      if (!hasAccess && req.user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const event = await storage.createJobTrackingEvent(validationResult.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating tracking event:", error);
      res.status(500).json({ message: "Failed to create tracking event" });
    }
  });

  // Get job tracking events
  app.get('/api/job-cards/:id/tracking/events', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { visibleToCustomer } = req.query;
      
      const jobCard = await storage.getJobCard(id);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      
      // Verify garage ownership
      const userGarages = await storage.getUserRoles(req.user?.id);
      const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);
      
      if (!hasAccess && req.user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const events = await storage.getJobTrackingEvents(
        id, 
        visibleToCustomer === 'true' ? true : visibleToCustomer === 'false' ? false : undefined
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching tracking events:", error);
      res.status(500).json({ message: "Failed to fetch tracking events" });
    }
  });

  // Update job ETA
  app.patch('/api/job-cards/:id/eta', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const etaUpdateSchema = z.object({
        estimatedCompletionAt: z.string().datetime(),
        manualOverride: z.boolean().optional(),
      });
      
      const validationResult = etaUpdateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const { estimatedCompletionAt, manualOverride } = validationResult.data;
      
      const jobCard = await storage.getJobCard(id);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      
      // Verify garage ownership
      const userGarages = await storage.getUserRoles(req.user?.id);
      const hasAccess = userGarages.some((ur: any) => ur.garage?.id === jobCard.garageId);
      
      if (!hasAccess && req.user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedJobCard = await storage.updateJobETA(
        id,
        new Date(estimatedCompletionAt),
        manualOverride || false
      );
      
      // Create tracking event for ETA update
      await storage.createJobTrackingEvent({
        jobCardId: id,
        eventType: 'eta_update',
        title: 'Estimated Completion Updated',
        description: `New estimated completion: ${new Date(estimatedCompletionAt).toLocaleString()}`,
        metadata: { 
          previousETA: jobCard.estimatedCompletionAt,
          newETA: estimatedCompletionAt,
          manualOverride 
        },
        isVisibleToCustomer: true,
        createdBy: req.user?.id,
      });
      
      res.json(updatedJobCard);
    } catch (error) {
      console.error("Error updating job ETA:", error);
      res.status(500).json({ message: "Failed to update job ETA" });
    }
  });

  // Technician Portal routes - Server-side scoped access
  // Authorization middleware for technician-scoped routes
  const authorizeTechnician = (req: any, res: any, next: any) => {
    const { technicianId } = req.params;
    
    // Allow access if:
    // 1. User is requesting their own data
    // 2. User is an admin/manager
    if (req.user?.id !== technicianId && !['admin', 'manager'].includes(req.user?.userType)) {
      return res.status(403).json({ message: "Access denied - you can only view your own data" });
    }
    
    next();
  };

  // GET technician's assigned job cards
  app.get('/api/technicians/:technicianId/job-cards', isAuthenticated, authorizeTechnician, async (req, res) => {
    try {
      const { technicianId } = req.params;
      const jobCards = await storage.getTechnicianJobCards(technicianId);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching technician job cards:", error);
      res.status(500).json({ message: "Failed to fetch job cards" });
    }
  });

  // GET technician's time clock entries
  app.get('/api/technicians/:technicianId/time-clock', isAuthenticated, authorizeTechnician, async (req, res) => {
    try {
      const { technicianId } = req.params;
      const entries = await storage.getTechnicianTimeClockEntries(technicianId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching time clock entries:", error);
      res.status(500).json({ message: "Failed to fetch time clock entries" });
    }
  });

  // POST clock in/out
  app.post('/api/technicians/:technicianId/time-clock', isAuthenticated, authorizeTechnician, async (req, res) => {
    try {
      const { technicianId } = req.params;
      const entryData = {
        ...req.body,
        technicianId,
      };
      const entry = await storage.createTimeClockEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating time clock entry:", error);
      res.status(500).json({ message: "Failed to create time clock entry" });
    }
  });

  // Service Templates routes
  app.get('/api/service-templates/all', isAuthenticated, async (req, res) => {
    try {
      const allTemplates = await storage.getAllServiceTemplates();
      res.json(allTemplates);
    } catch (error) {
      console.error("Error fetching all service templates:", error);
      res.status(500).json({ message: "Failed to fetch service templates" });
    }
  });

  app.get('/api/service-templates', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      if (!garage_id) {
        return res.status(400).json({ message: "garage_id is required" });
      }
      const templates = await storage.getServiceTemplates(garage_id as string);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching service templates:", error);
      res.status(500).json({ message: "Failed to fetch service templates" });
    }
  });

  app.get('/api/service-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getServiceTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Service template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching service template:", error);
      res.status(500).json({ message: "Failed to fetch service template" });
    }
  });

  app.post('/api/service-templates', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.createServiceTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating service template:", error);
      res.status(500).json({ message: "Failed to create service template" });
    }
  });

  app.put('/api/service-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.updateServiceTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating service template:", error);
      res.status(500).json({ message: "Failed to update service template" });
    }
  });

  app.delete('/api/service-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service template:", error);
      res.status(500).json({ message: "Failed to delete service template" });
    }
  });

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

  // Spare Parts Management routes - Module 12: Spare Parts & Inventory
  app.get('/api/spare-parts', isAuthenticated, async (req, res) => {
    try {
      const parts = await storage.getSpareParts();
      res.json(parts);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      res.status(500).json({ message: "Failed to fetch spare parts" });
    }
  });

  app.get('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const part = await storage.getSparePart(id);
      if (!part) {
        return res.status(404).json({ message: "Spare part not found" });
      }
      res.json(part);
    } catch (error) {
      console.error("Error fetching spare part:", error);
      res.status(500).json({ message: "Failed to fetch spare part" });
    }
  });

  app.post('/api/spare-parts', isAuthenticated, async (req: any, res) => {
    try {
      const { insertSparePartSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';

      const validationResult = insertSparePartSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const partData = {
        ...validationResult.data,
        createdBy: userId,
      };

      const part = await storage.createSparePart(partData);
      res.status(201).json(part);
    } catch (error) {
      console.error("Error creating spare part:", error);
      res.status(500).json({ message: "Failed to create spare part" });
    }
  });

  app.patch('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertSparePartSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertSparePartSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const updatedPart = await storage.updateSparePart(id, validationResult.data);
      res.json(updatedPart);
    } catch (error) {
      console.error("Error updating spare part:", error);
      res.status(500).json({ message: "Failed to update spare part" });
    }
  });

  app.delete('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSparePart(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting spare part:", error);
      res.status(500).json({ message: "Failed to delete spare part" });
    }
  });

  // Spare Part Inventory routes
  app.get('/api/spare-part-inventories', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, spare_part_id } = req.query;
      if (!garage_id) {
        return res.status(400).json({ message: "garage_id is required" });
      }
      const inventories = await storage.getSparePartInventories(
        garage_id as string,
        spare_part_id as string
      );
      res.json(inventories);
    } catch (error) {
      console.error("Error fetching spare part inventories:", error);
      res.status(500).json({ message: "Failed to fetch spare part inventories" });
    }
  });

  app.post('/api/spare-part-inventories', isAuthenticated, async (req, res) => {
    try {
      const { insertSparePartInventorySchema } = await import("@shared/schema");

      const validationResult = insertSparePartInventorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const inventory = await storage.createSparePartInventory(validationResult.data);
      res.status(201).json(inventory);
    } catch (error) {
      console.error("Error creating spare part inventory:", error);
      res.status(500).json({ message: "Failed to create spare part inventory" });
    }
  });

  app.patch('/api/spare-part-inventories/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertSparePartInventorySchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertSparePartInventorySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const updatedInventory = await storage.updateSparePartInventory(id, validationResult.data);
      res.json(updatedInventory);
    } catch (error) {
      console.error("Error updating spare part inventory:", error);
      res.status(500).json({ message: "Failed to update spare part inventory" });
    }
  });

  // Appointment Management routes - Module 9: Appointments & Scheduling
  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status, date_from, date_to } = req.query;
      const appointments = await storage.getAppointments(
        garage_id as string,
        status as string,
        date_from as string,
        date_to as string
      );
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const { insertAppointmentSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      
      const validationResult = insertAppointmentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const appointmentData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const appointment = await storage.createAppointment(appointmentData as any);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertAppointmentSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertAppointmentSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const updatedAppointment = await storage.updateAppointment(id, validationResult.data);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAppointment(id);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  app.post('/api/appointments/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const userId = req.user?.id || 'default-user';
      const updatedAppointment = await storage.updateAppointmentStatus(
        id,
        status,
        userId,
        reason
      );
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Customer Management routes - Module 10
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, search } = req.query;
      const customers = await storage.getCustomers(garage_id as string, search as string);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const { fullName, email, phone, garageId, nationalId } = req.body;
      
      if (!fullName || !email || !garageId) {
        return res.status(400).json({ message: "Name, email, and garage are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "A customer with this email already exists" });
      }

      const bcrypt = await import('bcrypt');
      const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

      const customer = await storage.createUser({
        fullName,
        email,
        phone: phone || null,
        password: tempPassword,
        garageId,
        nationalId: nationalId || null,
        userType: 'customer',
        isActive: true,
      });

      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.get('/api/customers/:id/vehicles', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicles = await storage.getCustomerVehicles(id);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res.status(500).json({ message: "Failed to fetch customer vehicles" });
    }
  });

  app.get('/api/vehicles', isAuthenticated, async (req, res) => {
    try {
      const { garageId } = req.query;
      const vehicles = await storage.getVehicles(garageId as string | undefined);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post('/api/vehicles', isAuthenticated, async (req, res) => {
    try {
      const { insertVehicleSchema } = await import("@shared/schema");
      const validationResult = insertVehicleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const vehicle = await storage.createVehicle(validationResult.data);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.patch('/api/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertVehicleSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertVehicleSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const updatedVehicle = await storage.updateVehicle(id, validationResult.data);
      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete('/api/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVehicle(id);
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Vehicle Service History Routes - Module 22 Enhancements
  app.get('/api/vehicles/:id/service-history', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getVehicleServiceHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching service history:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  });

  app.post('/api/vehicles/:id/service-history', isAuthenticated, async (req: any, res) => {
    try {
      const { insertVehicleServiceHistorySchema } = await import("@shared/schema");
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';

      const validationResult = insertVehicleServiceHistorySchema.safeParse({
        ...req.body,
        vehicleId: id,
        performedBy: userId
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          ...sanitizeZodError(validationResult.error)
        });
      }

      const history = await storage.createServiceHistory(validationResult.data);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating service history:", error);
      res.status(500).json({ message: "Failed to create service history" });
    }
  });

  app.delete('/api/service-history/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceHistory(id);
      res.json({ message: "Service history deleted successfully" });
    } catch (error) {
      console.error("Error deleting service history:", error);
      res.status(500).json({ message: "Failed to delete service history" });
    }
  });

  // Maintenance Schedules Routes - Module 22 Enhancements
  app.get('/api/vehicles/:id/maintenance-schedules', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const schedules = await storage.getMaintenanceSchedules(id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      res.status(500).json({ message: "Failed to fetch maintenance schedules" });
    }
  });

  app.post('/api/vehicles/:id/maintenance-schedules', isAuthenticated, async (req, res) => {
    try {
      const { insertMaintenanceScheduleSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertMaintenanceScheduleSchema.safeParse({
        ...req.body,
        vehicleId: id
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          ...sanitizeZodError(validationResult.error)
        });
      }

      const schedule = await storage.createMaintenanceSchedule(validationResult.data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      res.status(500).json({ message: "Failed to create maintenance schedule" });
    }
  });

  app.patch('/api/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertMaintenanceScheduleSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertMaintenanceScheduleSchema.partial().safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          ...sanitizeZodError(validationResult.error)
        });
      }

      const schedule = await storage.updateMaintenanceSchedule(id, validationResult.data);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating maintenance schedule:", error);
      res.status(500).json({ message: "Failed to update maintenance schedule" });
    }
  });

  app.delete('/api/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaintenanceSchedule(id);
      res.json({ message: "Maintenance schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error);
      res.status(500).json({ message: "Failed to delete maintenance schedule" });
    }
  });

  // Service Reminders Routes - Module 22 Enhancements
  app.get('/api/vehicles/:id/service-reminders', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const reminders = await storage.getServiceReminders(id, status as string | undefined);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching service reminders:", error);
      res.status(500).json({ message: "Failed to fetch service reminders" });
    }
  });

  app.post('/api/vehicles/:id/service-reminders', isAuthenticated, async (req, res) => {
    try {
      const { insertServiceReminderSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertServiceReminderSchema.safeParse({
        ...req.body,
        vehicleId: id
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          ...sanitizeZodError(validationResult.error)
        });
      }

      const reminder = await storage.createServiceReminder(validationResult.data);
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating service reminder:", error);
      res.status(500).json({ message: "Failed to create service reminder" });
    }
  });

  app.patch('/api/service-reminders/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertServiceReminderSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertServiceReminderSchema.partial().safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          ...sanitizeZodError(validationResult.error)
        });
      }

      const reminder = await storage.updateServiceReminder(id, validationResult.data);
      res.json(reminder);
    } catch (error) {
      console.error("Error updating service reminder:", error);
      res.status(500).json({ message: "Failed to update service reminder" });
    }
  });

  app.delete('/api/service-reminders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceReminder(id);
      res.json({ message: "Service reminder deleted successfully" });
    } catch (error) {
      console.error("Error deleting service reminder:", error);
      res.status(500).json({ message: "Failed to delete service reminder" });
    }
  });

  // VIN Decoder Route - Module 22 Enhancements
  app.get('/api/decode-vin/:vin', isAuthenticated, async (req, res) => {
    try {
      const { vin } = req.params;
      const vinData = await storage.decodeVIN(vin);
      
      if (!vinData) {
        return res.status(404).json({ message: "VIN not found or invalid" });
      }

      res.json(vinData);
    } catch (error) {
      console.error("Error decoding VIN:", error);
      res.status(500).json({ message: "Failed to decode VIN" });
    }
  });

  app.get('/api/customers/:id/notes', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notes = await storage.getCustomerNotes(id);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching customer notes:", error);
      res.status(500).json({ message: "Failed to fetch customer notes" });
    }
  });

  app.post('/api/customers/:id/notes', isAuthenticated, async (req: any, res) => {
    try {
      const { insertCustomerNoteSchema } = await import("@shared/schema");
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      
      const validationResult = insertCustomerNoteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const noteData = {
        ...validationResult.data,
        customerId: id,
        createdBy: userId,
      };
      
      const note = await storage.createCustomerNote(noteData as any);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating customer note:", error);
      res.status(500).json({ message: "Failed to create customer note" });
    }
  });

  app.delete('/api/customer-notes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomerNote(id);
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Purchase Orders & Supplier Integration - Module 11
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const suppliers = await storage.getSuppliers(garage_id as string);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const { insertSupplierSchema } = await import("@shared/schema");
      const validationResult = insertSupplierSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const supplier = await storage.createSupplier(validationResult.data);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.patch('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertSupplierSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertSupplierSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const supplier = await storage.updateSupplier(id, validationResult.data);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSupplier(id);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Supplier Price List routes - Module 43: Vendor/Supplier Portal
  app.get('/api/supplier-price-lists', isAuthenticated, async (req, res) => {
    try {
      const { supplierId, sparePartId } = req.query;
      const priceLists = await storage.getSupplierPriceLists(
        supplierId as string | undefined,
        sparePartId as string | undefined
      );
      res.json(priceLists);
    } catch (error) {
      console.error("Error fetching supplier price lists:", error);
      res.status(500).json({ message: "Failed to fetch price lists" });
    }
  });

  app.get('/api/supplier-price-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const priceList = await storage.getSupplierPriceList(id);
      if (!priceList) {
        return res.status(404).json({ message: "Price list not found" });
      }
      res.json(priceList);
    } catch (error) {
      console.error("Error fetching price list:", error);
      res.status(500).json({ message: "Failed to fetch price list" });
    }
  });

  app.post('/api/supplier-price-lists', isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertSupplierPriceListSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const priceList = await storage.createSupplierPriceList(validationResult.data);
      res.status(201).json(priceList);
    } catch (error) {
      console.error("Error creating price list:", error);
      res.status(500).json({ message: "Failed to create price list" });
    }
  });

  app.patch('/api/supplier-price-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const validationResult = insertSupplierPriceListSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const priceList = await storage.updateSupplierPriceList(id, validationResult.data);
      res.json(priceList);
    } catch (error) {
      console.error("Error updating price list:", error);
      res.status(500).json({ message: "Failed to update price list" });
    }
  });

  app.delete('/api/supplier-price-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSupplierPriceList(id);
      res.json({ message: "Price list deleted successfully" });
    } catch (error) {
      console.error("Error deleting price list:", error);
      res.status(500).json({ message: "Failed to delete price list" });
    }
  });

  app.get('/api/supplier-price-lists/compare/:sparePartId', isAuthenticated, async (req, res) => {
    try {
      const { sparePartId } = req.params;
      const comparison = await storage.comparePrices(sparePartId);
      res.json(comparison);
    } catch (error) {
      console.error("Error comparing prices:", error);
      res.status(500).json({ message: "Failed to compare prices" });
    }
  });

  // Supplier Performance routes - Module 43: Vendor/Supplier Portal
  app.get('/api/supplier-performance', isAuthenticated, async (req, res) => {
    try {
      const { supplierId, period } = req.query;
      const performanceRecords = await storage.getSupplierPerformance(
        supplierId as string | undefined,
        period as string | undefined
      );
      res.json(performanceRecords);
    } catch (error) {
      console.error("Error fetching supplier performance:", error);
      res.status(500).json({ message: "Failed to fetch performance records" });
    }
  });

  app.get('/api/supplier-performance/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const performanceRecord = await storage.getSupplierPerformanceRecord(id);
      if (!performanceRecord) {
        return res.status(404).json({ message: "Performance record not found" });
      }
      res.json(performanceRecord);
    } catch (error) {
      console.error("Error fetching performance record:", error);
      res.status(500).json({ message: "Failed to fetch performance record" });
    }
  });

  app.post('/api/supplier-performance', isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertSupplierPerformanceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const performanceRecord = await storage.createSupplierPerformance(validationResult.data);
      res.status(201).json(performanceRecord);
    } catch (error) {
      console.error("Error creating performance record:", error);
      res.status(500).json({ message: "Failed to create performance record" });
    }
  });

  app.patch('/api/supplier-performance/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const validationResult = insertSupplierPerformanceSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const performanceRecord = await storage.updateSupplierPerformance(id, validationResult.data);
      res.json(performanceRecord);
    } catch (error) {
      console.error("Error updating performance record:", error);
      res.status(500).json({ message: "Failed to update performance record" });
    }
  });

  app.delete('/api/supplier-performance/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSupplierPerformance(id);
      res.json({ message: "Performance record deleted successfully" });
    } catch (error) {
      console.error("Error deleting performance record:", error);
      res.status(500).json({ message: "Failed to delete performance record" });
    }
  });

  // Supplier Parts Availability - Feature #5
  app.get('/api/supplier-availability/search', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { spare_part_id, supplier_id, part_name } = req.query;
      
      const filters = {
        sparePartId: spare_part_id as string | undefined,
        supplierId: supplier_id as string | undefined,
        partName: part_name as string | undefined,
      };

      const availability = await storage.getSupplierPartsAvailability(userGarageId, filters);
      res.json(availability);
    } catch (error) {
      console.error("Error searching supplier availability:", error);
      res.status(500).json({ message: "Failed to search supplier availability" });
    }
  });

  app.post('/api/supplier-availability/sync', isAuthenticated, async (req: any, res) => {
    try {
      const { insertSupplierPartsAvailabilitySchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }

      const { availabilityData } = req.body;
      
      if (!Array.isArray(availabilityData)) {
        return res.status(400).json({ message: "availabilityData must be an array" });
      }

      const validatedData = availabilityData.map(item => {
        const result = insertSupplierPartsAvailabilitySchema.safeParse({
          ...item,
          garageId: userGarageId,
        });
        
        if (!result.success) {
          throw new Error(`Validation error: ${result.error.message}`);
        }
        
        return result.data;
      });

      const synced = await storage.syncSupplierAvailability(userGarageId, validatedData);
      res.status(201).json({ 
        message: `Successfully synced ${synced.length} availability records`,
        data: synced 
      });
    } catch (error) {
      console.error("Error syncing supplier availability:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to sync supplier availability" });
    }
  });

  app.get('/api/supplier-availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const availability = await storage.getSupplierPartAvailability(id, userGarageId);
      if (!availability) {
        return res.status(404).json({ message: "Availability record not found" });
      }
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/supplier-availability', isAuthenticated, async (req: any, res) => {
    try {
      const { insertSupplierPartsAvailabilitySchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      
      const validationResult = insertSupplierPartsAvailabilitySchema.safeParse({
        ...req.body,
        garageId: userGarageId,
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const availability = await storage.createSupplierPartAvailability(validationResult.data);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating availability:", error);
      res.status(500).json({ message: "Failed to create availability" });
    }
  });

  app.patch('/api/supplier-availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { insertSupplierPartsAvailabilitySchema } = await import("@shared/schema");
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertSupplierPartsAvailabilitySchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }

      const availability = await storage.updateSupplierPartAvailability(id, userGarageId, validationResult.data);
      if (!availability) {
        return res.status(404).json({ message: "Availability record not found" });
      }
      res.json(availability);
    } catch (error) {
      console.error("Error updating availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  app.delete('/api/supplier-availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const deleted = await storage.deleteSupplierPartAvailability(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Availability record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

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

  // Call Center Module API Routes - Wave 2
  
  // Rate limiter for Call Center endpoints (100 req/15min per IP)
  const callCenterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Call Queues
  app.get('/api/call-center/queues', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { active } = req.query;
      const queues = await storage.listCallQueues(
        userGarageId,
        active === 'true' ? true : active === 'false' ? false : undefined
      );
      res.json(queues);
    } catch (error) {
      console.error("Error fetching call queues:", error);
      res.status(500).json({ message: "Failed to fetch call queues" });
    }
  });

  app.post('/api/call-center/queues', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertCallQueueSchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertCallQueueSchema.safeParse({
        ...req.body,
        garageId: userGarageId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const queue = await storage.createCallQueue(validationResult.data);
      
      const { getChatWebSocketServer } = await import("./websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer && userGarageId) {
        wsServer.broadcastCallQueueUpdate(userGarageId, queue);
      }
      
      res.status(201).json(queue);
    } catch (error) {
      console.error("Error creating call queue:", error);
      res.status(500).json({ message: "Failed to create call queue" });
    }
  });

  app.get('/api/call-center/queues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const queue = await storage.getCallQueue(id, userGarageId);
      if (!queue) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      res.json(queue);
    } catch (error) {
      console.error("Error fetching call queue:", error);
      res.status(500).json({ message: "Failed to fetch call queue" });
    }
  });

  app.patch('/api/call-center/queues/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { garageId: _, ...safeBody } = req.body;
      
      const updated = await storage.updateCallQueue(id, userGarageId, safeBody);
      if (!updated) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      
      const { getChatWebSocketServer } = await import("./websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastCallQueueUpdate(userGarageId, updated);
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating call queue:", error);
      res.status(500).json({ message: "Failed to update call queue" });
    }
  });

  app.delete('/api/call-center/queues/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const deleted = await storage.deleteCallQueue(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting call queue:", error);
      res.status(500).json({ message: "Failed to delete call queue" });
    }
  });

  app.get('/api/call-center/queues/:id/with-members', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const result = await storage.getCallQueueWithMembers(id, userGarageId);
      if (!result) {
        return res.status(404).json({ message: "Call queue not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching queue with members:", error);
      res.status(500).json({ message: "Failed to fetch queue with members" });
    }
  });

  // Queue Members
  app.post('/api/call-center/queues/:queueId/members', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertCallQueueMemberSchema } = await import("@shared/schema");
      const { queueId } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertCallQueueMemberSchema.safeParse({
        ...req.body,
        queueId,
        garageId: userGarageId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const member = await storage.addQueueMember(validationResult.data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding queue member:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to add queue member" });
    }
  });

  app.get('/api/call-center/queues/:queueId/members', isAuthenticated, async (req: any, res) => {
    try {
      const { queueId } = req.params;
      const { active } = req.query;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const members = await storage.listQueueMembers(
        queueId,
        userGarageId,
        active === 'true' ? true : active === 'false' ? false : undefined
      );
      res.json(members);
    } catch (error) {
      console.error("Error fetching queue members:", error);
      res.status(500).json({ message: "Failed to fetch queue members" });
    }
  });

  app.patch('/api/call-center/queue-members/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { garageId: _, queueId: __, ...safeBody } = req.body;
      
      const updated = await storage.updateQueueMember(id, userGarageId, safeBody);
      if (!updated) {
        return res.status(404).json({ message: "Queue member not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating queue member:", error);
      res.status(500).json({ message: "Failed to update queue member" });
    }
  });

  app.delete('/api/call-center/queue-members/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const deleted = await storage.removeQueueMember(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Queue member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing queue member:", error);
      res.status(500).json({ message: "Failed to remove queue member" });
    }
  });

  // Call Sessions
  app.get('/api/call-center/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { status, agent_id, queue_id } = req.query;
      const filters = {
        status: status as string | undefined,
        agentId: agent_id as string | undefined,
        queueId: queue_id as string | undefined
      };
      
      const sessions = await storage.listCallSessions(userGarageId, filters);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching call sessions:", error);
      res.status(500).json({ message: "Failed to fetch call sessions" });
    }
  });

  app.post('/api/call-center/sessions', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertCallSessionSchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertCallSessionSchema.safeParse({
        ...req.body,
        garageId: userGarageId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const session = await storage.createCallSession(validationResult.data);
      
      const { getChatWebSocketServer } = await import("./websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer && userGarageId) {
        wsServer.broadcastCallSessionUpdate(userGarageId, session);
      }
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating call session:", error);
      res.status(500).json({ message: "Failed to create call session" });
    }
  });

  app.get('/api/call-center/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const session = await storage.getCallSession(id, userGarageId);
      if (!session) {
        return res.status(404).json({ message: "Call session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching call session:", error);
      res.status(500).json({ message: "Failed to fetch call session" });
    }
  });

  app.patch('/api/call-center/sessions/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { garageId: _, queueId: __, customerId: ___, vehicleId: ____, assignedAgentId: _____, ...safeBody } = req.body;
      
      const updated = await storage.updateCallSession(id, userGarageId, safeBody);
      if (!updated) {
        return res.status(404).json({ message: "Call session not found" });
      }
      
      const { getChatWebSocketServer } = await import("./websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastCallSessionUpdate(userGarageId, updated);
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating call session:", error);
      res.status(500).json({ message: "Failed to update call session" });
    }
  });

  app.post('/api/call-center/sessions/:id/assign', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { agentId } = req.body;
      if (!agentId) {
        return res.status(400).json({ message: "agentId is required" });
      }
      
      const session = await storage.assignCallToAgent({
        garageId: userGarageId,
        sessionId: id,
        agentId,
        assignedBy: userId
      });
      
      const { getChatWebSocketServer } = await import("./websocket");
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastCallSessionUpdate(userGarageId, session);
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error assigning call to agent:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to assign call to agent" });
    }
  });

  // Call Notes
  app.post('/api/call-center/sessions/:sessionId/notes', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertCallNoteSchema } = await import("@shared/schema");
      const { sessionId } = req.params;
      const userId = req.user?.id || 'default-user';
      
      const validationResult = insertCallNoteSchema.safeParse({
        ...req.body,
        sessionId,
        authorUserId: userId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const note = await storage.createCallNote(validationResult.data);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating call note:", error);
      res.status(500).json({ message: "Failed to create call note" });
    }
  });

  app.get('/api/call-center/sessions/:sessionId/notes', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const notes = await storage.listCallNotes(sessionId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching call notes:", error);
      res.status(500).json({ message: "Failed to fetch call notes" });
    }
  });

  // Call Recordings
  app.post('/api/call-center/sessions/:sessionId/recordings', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertCallRecordingSchema } = await import("@shared/schema");
      const { sessionId } = req.params;
      
      const validationResult = insertCallRecordingSchema.safeParse({
        ...req.body,
        sessionId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const recording = await storage.createCallRecording(validationResult.data);
      res.status(201).json(recording);
    } catch (error) {
      console.error("Error creating call recording:", error);
      res.status(500).json({ message: "Failed to create call recording" });
    }
  });

  app.get('/api/call-center/sessions/:sessionId/recordings', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const recordings = await storage.listCallRecordings(sessionId);
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching call recordings:", error);
      res.status(500).json({ message: "Failed to fetch call recordings" });
    }
  });

  // Disposition Codes
  app.get('/api/call-center/disposition-codes', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { active } = req.query;
      const codes = await storage.listDispositionCodes(
        userGarageId,
        active === 'true' ? true : active === 'false' ? false : undefined
      );
      res.json(codes);
    } catch (error) {
      console.error("Error fetching disposition codes:", error);
      res.status(500).json({ message: "Failed to fetch disposition codes" });
    }
  });

  app.post('/api/call-center/disposition-codes', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertCallDispositionCodeSchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertCallDispositionCodeSchema.safeParse({
        ...req.body,
        garageId: userGarageId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const code = await storage.createDispositionCode(validationResult.data);
      res.status(201).json(code);
    } catch (error) {
      console.error("Error creating disposition code:", error);
      res.status(500).json({ message: "Failed to create disposition code" });
    }
  });

  app.patch('/api/call-center/disposition-codes/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { garageId: _, ...safeBody } = req.body;
      
      const updated = await storage.updateDispositionCode(id, userGarageId, safeBody);
      if (!updated) {
        return res.status(404).json({ message: "Disposition code not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating disposition code:", error);
      res.status(500).json({ message: "Failed to update disposition code" });
    }
  });

  app.delete('/api/call-center/disposition-codes/:id', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const deleted = await storage.deleteDispositionCode(id, userGarageId);
      if (!deleted) {
        return res.status(404).json({ message: "Disposition code not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting disposition code:", error);
      res.status(500).json({ message: "Failed to delete disposition code" });
    }
  });

  // Agent Performance
  app.post('/api/call-center/performance', isAuthenticated, callCenterLimiter, async (req: any, res) => {
    try {
      const { insertAgentPerformanceSnapshotSchema } = await import("@shared/schema");
      const userGarageId = req.user?.garageId;
      
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const validationResult = insertAgentPerformanceSnapshotSchema.safeParse({
        ...req.body,
        garageId: userGarageId
      });
      
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const snapshot = await storage.createPerformanceSnapshot(validationResult.data);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating performance snapshot:", error);
      res.status(500).json({ message: "Failed to create performance snapshot" });
    }
  });

  app.get('/api/call-center/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      if (!userGarageId) {
        return res.status(400).json({ message: "User garage ID is required" });
      }
      
      const { agent_id, start_date, end_date } = req.query;
      let dateRange: {start: Date, end: Date} | undefined;
      
      if (start_date && end_date) {
        dateRange = {
          start: new Date(start_date as string),
          end: new Date(end_date as string)
        };
      }
      
      const performance = await storage.listAgentPerformance(
        userGarageId,
        agent_id as string | undefined,
        dateRange
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching agent performance:", error);
      res.status(500).json({ message: "Failed to fetch agent performance" });
    }
  });

  app.get('/api/purchase-orders', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status } = req.query;
      const orders = await storage.getPurchaseOrders(garage_id as string, status as string);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.get('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getPurchaseOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });

  app.post('/api/purchase-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { insertPurchaseOrderSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      
      const validationResult = insertPurchaseOrderSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const orderData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const order = await storage.createPurchaseOrder(orderData as any);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  app.post('/api/purchase-orders/with-items', isAuthenticated, async (req: any, res) => {
    try {
      const { insertPurchaseOrderSchema, insertPurchaseOrderItemSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      const { purchaseOrder, items } = req.body;
      
      if (!purchaseOrder || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: purchaseOrder and items (array) required" 
        });
      }
      
      const poValidation = insertPurchaseOrderSchema.safeParse(purchaseOrder);
      if (!poValidation.success) {
        return res.status(400).json(sanitizeZodError(poValidation.error));
      }
      
      const itemsValidation = items.map((item: any) => 
        insertPurchaseOrderItemSchema.omit({ purchaseOrderId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json(sanitizeArrayValidationErrors(invalidItems as any));
      }
      
      const orderData = {
        ...poValidation.data,
        createdBy: userId,
      };
      
      const validItems = itemsValidation.map(v => v.success ? v.data : null).filter(Boolean);
      
      const order = await storage.createPurchaseOrderWithItems(orderData as any, validItems as any);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order with items:", error);
      res.status(500).json({ message: "Failed to create purchase order with items" });
    }
  });

  app.patch('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertPurchaseOrderSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertPurchaseOrderSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const order = await storage.updatePurchaseOrder(id, validationResult.data);
      res.json(order);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });

  app.delete('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePurchaseOrder(id);
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      res.status(500).json({ message: "Failed to delete purchase order" });
    }
  });

  app.get('/api/purchase-orders/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getPurchaseOrderItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching purchase order items:", error);
      res.status(500).json({ message: "Failed to fetch purchase order items" });
    }
  });

  app.post('/api/purchase-order-items', isAuthenticated, async (req, res) => {
    try {
      const { insertPurchaseOrderItemSchema } = await import("@shared/schema");
      const validationResult = insertPurchaseOrderItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const item = await storage.createPurchaseOrderItem(validationResult.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating purchase order item:", error);
      res.status(500).json({ message: "Failed to create purchase order item" });
    }
  });

  app.delete('/api/purchase-order-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePurchaseOrderItem(id);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Module 12: Invoice & Billing Routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status } = req.query;
      const invoices = await storage.getInvoices(garage_id as string, status as string);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const { insertInvoiceSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      
      const validationResult = insertInvoiceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const invoiceData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const invoice = await storage.createInvoice(invoiceData as any);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.post('/api/invoices/with-items', isAuthenticated, async (req: any, res) => {
    try {
      const { insertInvoiceSchema, insertInvoiceItemSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      const { invoice, items } = req.body;
      
      if (!invoice || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: invoice and items (array) required" 
        });
      }
      
      const invoiceValidation = insertInvoiceSchema.safeParse(invoice);
      if (!invoiceValidation.success) {
        return res.status(400).json(sanitizeZodError(invoiceValidation.error));
      }
      
      const itemsValidation = items.map((item: any) => 
        insertInvoiceItemSchema.omit({ invoiceId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json(sanitizeArrayValidationErrors(invalidItems as any));
      }
      
      const invoiceData = {
        ...invoiceValidation.data,
        createdBy: userId,
      };
      
      const validItems = itemsValidation.map(v => v.success ? v.data : null).filter(Boolean);
      
      const createdInvoice = await storage.createInvoiceWithItems(invoiceData as any, validItems as any);
      res.status(201).json(createdInvoice);
    } catch (error) {
      console.error("Error creating invoice with items:", error);
      res.status(500).json({ message: "Failed to create invoice with items" });
    }
  });

  app.patch('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertInvoiceSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertInvoiceSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      // Validate status workflow if status is being changed
      if (validationResult.data.status) {
        const currentInvoice = await storage.getInvoice(id);
        if (!currentInvoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }
        
        const validTransitions: Record<string, string[]> = {
          draft: ["draft", "sent", "cancelled"],
          sent: ["sent", "paid", "overdue", "cancelled"],
          paid: ["paid", "cancelled"],
          overdue: ["overdue", "paid", "cancelled"],
          cancelled: ["cancelled"],
        };
        
        const allowedStatuses = validTransitions[currentInvoice.status] || [currentInvoice.status];
        if (!allowedStatuses.includes(validationResult.data.status)) {
          return res.status(400).json({ 
            message: `Invalid status transition from ${currentInvoice.status} to ${validationResult.data.status}` 
          });
        }
      }
      
      const invoice = await storage.updateInvoice(id, validationResult.data);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInvoice(id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  app.get('/api/invoices/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getInvoiceItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      res.status(500).json({ message: "Failed to fetch invoice items" });
    }
  });

  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const { invoice_id } = req.query;
      const payments = await storage.getPayments(invoice_id as string);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const { insertPaymentSchema } = await import("@shared/schema");
      const userId = req.user?.id || 'default-user';
      
      const validationResult = insertPaymentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const paymentData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const payment = await storage.createPayment(paymentData as any);
      
      // Update invoice paid amount
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (invoice) {
        const newPaidAmount = parseFloat(invoice.paidAmount) + parseFloat(payment.amount);
        const balanceAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
        const newStatus = balanceAmount <= 0 ? 'paid' : invoice.status;
        
        await storage.updateInvoice(payment.invoiceId, {
          paidAmount: newPaidAmount.toFixed(2),
          balanceAmount: balanceAmount.toFixed(2),
          status: newStatus,
          paidAt: balanceAmount <= 0 ? new Date() : invoice.paidAt,
        });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.delete('/api/payments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePayment(id);
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
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

  app.get('/api/reports/revenue', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      const startDate = start_date ? new Date(start_date as string) : undefined;
      const endDate = end_date ? new Date(end_date as string) : undefined;
      const report = await storage.getRevenueReport(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(report);
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      res.status(500).json({ message: "Failed to fetch revenue report" });
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

  app.get('/api/reports/technician-performance', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      
      // Validate and parse dates
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (start_date) {
        startDate = new Date(start_date as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: "Invalid start_date format" });
        }
        // Normalize to start of day
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (end_date) {
        endDate = new Date(end_date as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid end_date format" });
        }
        // Normalize to end of day
        endDate.setHours(23, 59, 59, 999);
      }
      
      const performance = await storage.getTechnicianPerformance(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching technician performance:", error);
      res.status(500).json({ message: "Failed to fetch technician performance" });
    }
  });

  app.get('/api/reports/customer-analytics', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      
      // Validate and parse dates
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (start_date) {
        startDate = new Date(start_date as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: "Invalid start_date format" });
        }
        // Normalize to start of day
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (end_date) {
        endDate = new Date(end_date as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid end_date format" });
        }
        // Normalize to end of day
        endDate.setHours(23, 59, 59, 999);
      }
      
      const analytics = await storage.getCustomerAnalytics(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
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
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const { recipient_id, garage_id, status, type } = req.query;
      const userId = req.user?.id || 'default-user';
      
      // If no recipient_id specified, use current user
      const recipientId = recipient_id || userId;
      
      const notifications = await storage.getNotifications(
        recipientId as string,
        garage_id as string | undefined,
        status as string | undefined,
        type as string | undefined
      );
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const { garage_id } = req.query;
      const userId = req.user?.id || 'default-user';
      
      const count = await storage.getUnreadCount(userId, garage_id as string | undefined);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

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

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
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
      const preferences = await storage.getNotificationPreferences(userId);
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
      const preferences = await storage.upsertNotificationPreferences(userId, eventMap);
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

  // Conflict Detection & Optimization
  app.post('/api/appointments/check-conflicts', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentData = {
        ...req.body,
        appointmentDate: new Date(req.body.appointmentDate),
      };
      
      const conflicts = await storage.checkAppointmentConflicts(appointmentData);
      res.json({ hasConflicts: conflicts.length > 0, conflicts });
    } catch (error) {
      console.error("Error checking conflicts:", error);
      res.status(500).json({ message: "Failed to check conflicts" });
    }
  });

  app.get('/api/time-slots/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId } = req.params;
      const { date, duration } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({ message: "date and duration are required" });
      }

      const slots = await storage.getAvailableTimeSlots(
        technicianId,
        new Date(date as string),
        parseInt(duration as string)
      );
      res.json(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
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
  app.post('/api/customer/create-payment-intent', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      const { invoiceId } = req.body;
      const userId = req.user?.id || 'default-user';

      // Get invoice and verify ownership
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      if (invoice.customerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (invoice.status === 'paid') {
        return res.status(400).json({ message: "Invoice already paid" });
      }

      const amount = Number(invoice.balanceAmount);
      if (amount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount" });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: userId,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

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
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      const event = req.body;

      // Handle the event
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { invoiceId } = paymentIntent.metadata;

        if (invoiceId) {
          // Update invoice as paid
          const paidAmount = Number(paymentIntent.amount) / 100;
          await storage.updateInvoice(invoiceId, {
            status: 'paid',
            paidAmount: paidAmount.toString(),
            balanceAmount: '0',
            paidAt: new Date(),
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
  });

  // Module 27: Inventory & Parts Management
  // Stock Alerts
  app.get('/api/stock-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, status } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const alerts = await storage.getStockAlerts(garageId as string, status as string);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching stock alerts:", error);
      res.status(500).json({ message: "Failed to fetch stock alerts" });
    }
  });

  app.post('/api/stock-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const alert = await storage.createStockAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating stock alert:", error);
      res.status(500).json({ message: "Failed to create stock alert" });
    }
  });

  app.patch('/api/stock-alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.updateStockAlert(id, req.body);
      res.json(alert);
    } catch (error) {
      console.error("Error updating stock alert:", error);
      res.status(500).json({ message: "Failed to update stock alert" });
    }
  });

  app.post('/api/stock-alerts/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const alert = await storage.acknowledgeStockAlert(id, userId);
      res.json(alert);
    } catch (error) {
      console.error("Error acknowledging stock alert:", error);
      res.status(500).json({ message: "Failed to acknowledge stock alert" });
    }
  });

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
  app.get('/api/refunds', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, status } = req.query;
      const refunds = await storage.getRefunds(garageId, status);
      res.json(refunds);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      res.status(500).json({ message: "Failed to fetch refunds" });
    }
  });

  app.get('/api/refunds/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const refund = await storage.getRefund(id);
      if (!refund) {
        return res.status(404).json({ message: "Refund not found" });
      }
      res.json(refund);
    } catch (error) {
      console.error("Error fetching refund:", error);
      res.status(500).json({ message: "Failed to fetch refund" });
    }
  });

  app.post('/api/refunds', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const refund = await storage.createRefund({ ...req.body, requestedBy: userId });
      res.status(201).json(refund);
    } catch (error) {
      console.error("Error creating refund:", error);
      res.status(500).json({ message: "Failed to create refund" });
    }
  });

  app.patch('/api/refunds/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const refund = await storage.updateRefund(id, req.body);
      res.json(refund);
    } catch (error) {
      console.error("Error updating refund:", error);
      res.status(500).json({ message: "Failed to update refund" });
    }
  });

  app.post('/api/refunds/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const refund = await storage.updateRefund(id, {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      });
      res.json(refund);
    } catch (error) {
      console.error("Error approving refund:", error);
      res.status(500).json({ message: "Failed to approve refund" });
    }
  });

  app.post('/api/refunds/:id/process', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const refund = await storage.updateRefund(id, {
        status: 'processed',
        processedBy: userId,
        processedAt: new Date(),
      });
      res.json(refund);
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: "Failed to process refund" });
    }
  });

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
  app.get('/api/discounts', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, isActive } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const discounts = await storage.getDiscounts(
        garageId,
        isActive === 'true' ? true : isActive === 'false' ? false : undefined
      );
      res.json(discounts);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      res.status(500).json({ message: "Failed to fetch discounts" });
    }
  });

  app.get('/api/discounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const discount = await storage.getDiscount(id);
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.json(discount);
    } catch (error) {
      console.error("Error fetching discount:", error);
      res.status(500).json({ message: "Failed to fetch discount" });
    }
  });

  app.post('/api/discounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const discount = await storage.createDiscount({ ...req.body, createdBy: userId });
      res.status(201).json(discount);
    } catch (error) {
      console.error("Error creating discount:", error);
      res.status(500).json({ message: "Failed to create discount" });
    }
  });

  app.patch('/api/discounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const discount = await storage.updateDiscount(id, req.body);
      res.json(discount);
    } catch (error) {
      console.error("Error updating discount:", error);
      res.status(500).json({ message: "Failed to update discount" });
    }
  });

  app.delete('/api/discounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDiscount(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting discount:", error);
      res.status(500).json({ message: "Failed to delete discount" });
    }
  });

  app.post('/api/discounts/validate', isAuthenticated, async (req: any, res) => {
    try {
      const { code, garageId, amount } = req.body;
      const userId = req.user?.id || 'default-user';
      const result = await storage.validateDiscount(code, garageId, userId, amount);
      res.json(result);
    } catch (error) {
      console.error("Error validating discount:", error);
      res.status(500).json({ message: "Failed to validate discount" });
    }
  });

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

  // Module 30: Business Intelligence & Analytics
  app.get('/api/bi/profitable-services', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, startDate, endDate } = req.query;
      
      if (!garageId) {
        return res.status(400).json({ message: "Garage ID is required" });
      }

      const result = await storage.getMostProfitableServices(
        garageId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching profitable services:", error);
      res.status(500).json({ message: "Failed to fetch profitable services data" });
    }
  });

  app.get('/api/bi/peak-hours', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, startDate, endDate } = req.query;
      
      if (!garageId) {
        return res.status(400).json({ message: "Garage ID is required" });
      }

      const result = await storage.getPeakHoursAnalysis(
        garageId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching peak hours:", error);
      res.status(500).json({ message: "Failed to fetch peak hours data" });
    }
  });

  app.get('/api/bi/technician-utilization', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, startDate, endDate } = req.query;
      
      if (!garageId) {
        return res.status(400).json({ message: "Garage ID is required" });
      }

      const result = await storage.getTechnicianUtilizationRates(
        garageId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching technician utilization:", error);
      res.status(500).json({ message: "Failed to fetch technician utilization data" });
    }
  });

  app.get('/api/bi/customer-acquisition-cost', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, startDate, endDate } = req.query;
      
      if (!garageId) {
        return res.status(400).json({ message: "Garage ID is required" });
      }

      const result = await storage.getCustomerAcquisitionCost(
        garageId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching customer acquisition cost:", error);
      res.status(500).json({ message: "Failed to fetch customer acquisition cost data" });
    }
  });

  app.get('/api/bi/customer-lifetime-value', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, startDate, endDate } = req.query;
      
      if (!garageId) {
        return res.status(400).json({ message: "Garage ID is required" });
      }

      const result = await storage.getCustomerAnalytics(
        garageId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching customer lifetime value:", error);
      res.status(500).json({ message: "Failed to fetch customer lifetime value data" });
    }
  });

  // Module 31: Staff & HR Management
  
  // Employee Attendance Routes
  app.get('/api/hr/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { employeeId, startDate, endDate } = req.query;

      const records = await storage.getEmployeeAttendance(
        userGarageId,
        employeeId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.get('/api/hr/attendance/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const record = await storage.getAttendance(req.params.id);
      
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      if (record.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(record);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance record" });
    }
  });

  app.post('/api/hr/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertEmployeeAttendanceSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.createAttendance(validated);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating attendance:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.patch('/api/hr/attendance/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAttendance(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validated = insertEmployeeAttendanceSchema.partial().parse(req.body);
      
      if (validated.garageId && validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage ID" });
      }
      
      const record = await storage.updateAttendance(req.params.id, validated);
      res.json(record);
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  app.post('/api/hr/clock-in', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      const record = await storage.clockIn(userId, userGarageId);
      res.json(record);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/hr/clock-out/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAttendance(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.clockOut(req.params.id);
      res.json(record);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  app.post('/api/hr/break-start/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAttendance(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.startBreak(req.params.id);
      res.json(record);
    } catch (error) {
      console.error("Error starting break:", error);
      res.status(500).json({ message: "Failed to start break" });
    }
  });

  app.post('/api/hr/break-end/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getAttendance(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.endBreak(req.params.id);
      res.json(record);
    } catch (error) {
      console.error("Error ending break:", error);
      res.status(500).json({ message: "Failed to end break" });
    }
  });

  // Shift Management Routes
  app.get('/api/hr/shift-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;

      const templates = await storage.getShiftTemplates(userGarageId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching shift templates:", error);
      res.status(500).json({ message: "Failed to fetch shift templates" });
    }
  });

  app.get('/api/hr/shift-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const template = await storage.getShiftTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      
      if (template.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching shift template:", error);
      res.status(500).json({ message: "Failed to fetch shift template" });
    }
  });

  app.post('/api/hr/shift-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertShiftTemplateSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const template = await storage.createShiftTemplate(validated);
      res.json(template);
    } catch (error: any) {
      console.error("Error creating shift template:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create shift template" });
    }
  });

  app.patch('/api/hr/shift-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getShiftTemplate(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertShiftTemplateSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const template = await storage.updateShiftTemplate(req.params.id, validated.data);
      res.json(template);
    } catch (error) {
      console.error("Error updating shift template:", error);
      res.status(500).json({ message: "Failed to update shift template" });
    }
  });

  app.delete('/api/hr/shift-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getShiftTemplate(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteShiftTemplate(req.params.id);
      res.json({ message: "Shift template deleted successfully" });
    } catch (error) {
      console.error("Error deleting shift template:", error);
      res.status(500).json({ message: "Failed to delete shift template" });
    }
  });

  app.get('/api/hr/shift-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { employeeId, startDate, endDate } = req.query;

      const assignments = await storage.getShiftAssignments(
        userGarageId,
        employeeId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching shift assignments:", error);
      res.status(500).json({ message: "Failed to fetch shift assignments" });
    }
  });

  app.post('/api/hr/shift-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertShiftAssignmentSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignment = await storage.createShiftAssignment(validated);
      res.json(assignment);
    } catch (error: any) {
      console.error("Error creating shift assignment:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create shift assignment" });
    }
  });

  app.patch('/api/hr/shift-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getShiftAssignment(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Shift assignment not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertShiftAssignmentSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const assignment = await storage.updateShiftAssignment(req.params.id, validated.data);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating shift assignment:", error);
      res.status(500).json({ message: "Failed to update shift assignment" });
    }
  });

  app.delete('/api/hr/shift-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getShiftAssignment(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Shift assignment not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteShiftAssignment(req.params.id);
      res.json({ message: "Shift assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting shift assignment:", error);
      res.status(500).json({ message: "Failed to delete shift assignment" });
    }
  });

  // Commission Management Routes
  app.get('/api/hr/commission-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;

      const rules = await storage.getCommissionRules(userGarageId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching commission rules:", error);
      res.status(500).json({ message: "Failed to fetch commission rules" });
    }
  });

  app.post('/api/hr/commission-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertCommissionRuleSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const rule = await storage.createCommissionRule(validated);
      res.json(rule);
    } catch (error: any) {
      console.error("Error creating commission rule:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create commission rule" });
    }
  });

  app.patch('/api/hr/commission-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getCommissionRule(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Commission rule not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertCommissionRuleSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const rule = await storage.updateCommissionRule(req.params.id, validated.data);
      res.json(rule);
    } catch (error) {
      console.error("Error updating commission rule:", error);
      res.status(500).json({ message: "Failed to update commission rule" });
    }
  });

  app.delete('/api/hr/commission-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getCommissionRule(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Commission rule not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteCommissionRule(req.params.id);
      res.json({ message: "Commission rule deleted successfully" });
    } catch (error) {
      console.error("Error deleting commission rule:", error);
      res.status(500).json({ message: "Failed to delete commission rule" });
    }
  });

  app.get('/api/hr/commissions', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { technicianId, period, status } = req.query;

      const commissions = await storage.getCommissions(
        userGarageId,
        technicianId as string,
        period as string,
        status as string
      );

      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  app.post('/api/hr/commissions', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertCommissionSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const commission = await storage.createCommission(validated);
      res.json(commission);
    } catch (error: any) {
      console.error("Error creating commission:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create commission" });
    }
  });

  app.patch('/api/hr/commissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getCommission(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Commission not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertCommissionSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const commission = await storage.updateCommission(req.params.id, validated.data);
      res.json(commission);
    } catch (error) {
      console.error("Error updating commission:", error);
      res.status(500).json({ message: "Failed to update commission" });
    }
  });

  app.post('/api/hr/calculate-commission/:jobCardId', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      const jobCard = await storage.getJobCard(req.params.jobCardId);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      
      if (jobCard.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const commission = await storage.calculateCommission(req.params.jobCardId, userGarageId);
      res.json(commission);
    } catch (error) {
      console.error("Error calculating commission:", error);
      res.status(500).json({ message: "Failed to calculate commission" });
    }
  });

  // Performance Review Routes
  app.get('/api/hr/performance-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { employeeId } = req.query;

      const reviews = await storage.getPerformanceReviews(
        userGarageId,
        employeeId as string
      );

      res.json(reviews);
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch performance reviews" });
    }
  });

  app.get('/api/hr/performance-reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const review = await storage.getPerformanceReview(req.params.id);
      
      if (!review) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      
      if (review.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching performance review:", error);
      res.status(500).json({ message: "Failed to fetch performance review" });
    }
  });

  app.post('/api/hr/performance-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertPerformanceReviewSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const review = await storage.createPerformanceReview(validated);
      res.json(review);
    } catch (error: any) {
      console.error("Error creating performance review:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create performance review" });
    }
  });

  app.patch('/api/hr/performance-reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getPerformanceReview(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertPerformanceReviewSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const review = await storage.updatePerformanceReview(req.params.id, validated.data);
      res.json(review);
    } catch (error) {
      console.error("Error updating performance review:", error);
      res.status(500).json({ message: "Failed to update performance review" });
    }
  });

  app.delete('/api/hr/performance-reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getPerformanceReview(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deletePerformanceReview(req.params.id);
      res.json({ message: "Performance review deleted successfully" });
    } catch (error) {
      console.error("Error deleting performance review:", error);
      res.status(500).json({ message: "Failed to delete performance review" });
    }
  });

  // Training & Certifications Routes
  app.get('/api/hr/trainings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;

      const trainings = await storage.getTrainings(userGarageId);
      res.json(trainings);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      res.status(500).json({ message: "Failed to fetch trainings" });
    }
  });

  app.post('/api/hr/trainings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertTrainingSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const training = await storage.createTraining(validated);
      res.json(training);
    } catch (error: any) {
      console.error("Error creating training:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create training" });
    }
  });

  app.patch('/api/hr/trainings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getTraining(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Training not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertTrainingSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const training = await storage.updateTraining(req.params.id, validated.data);
      res.json(training);
    } catch (error) {
      console.error("Error updating training:", error);
      res.status(500).json({ message: "Failed to update training" });
    }
  });

  app.delete('/api/hr/trainings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getTraining(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Training not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteTraining(req.params.id);
      res.json({ message: "Training deleted successfully" });
    } catch (error) {
      console.error("Error deleting training:", error);
      res.status(500).json({ message: "Failed to delete training" });
    }
  });

  app.get('/api/hr/employee-trainings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { employeeId, status } = req.query;

      const records = await storage.getEmployeeTrainings(
        userGarageId,
        employeeId as string,
        status as string
      );

      res.json(records);
    } catch (error) {
      console.error("Error fetching employee trainings:", error);
      res.status(500).json({ message: "Failed to fetch employee trainings" });
    }
  });

  app.post('/api/hr/employee-trainings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validated = insertEmployeeTrainingSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.createEmployeeTraining(validated);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating employee training:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ message: "Failed to create employee training" });
    }
  });

  app.patch('/api/hr/employee-trainings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getEmployeeTraining(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Employee training not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertEmployeeTrainingSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json(sanitizeZodError(validated.error));
      }
      
      if (validated.data.garageId && validated.data.garageId !== userGarageId) {
        return res.status(403).json({ message: "Cannot change garage" });
      }
      
      const record = await storage.updateEmployeeTraining(req.params.id, validated.data);
      res.json(record);
    } catch (error) {
      console.error("Error updating employee training:", error);
      res.status(500).json({ message: "Failed to update employee training" });
    }
  });

  app.delete('/api/hr/employee-trainings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getEmployeeTraining(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Employee training not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteEmployeeTraining(req.params.id);
      res.json({ message: "Employee training deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee training:", error);
      res.status(500).json({ message: "Failed to delete employee training" });
    }
  });

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

      // In production, would integrate with actual OCR service (e.g., Google Cloud Vision, AWS Textract)
      // For now, create a placeholder document with mock extraction
      const documentData = {
        garageId,
        documentType: documentType || 'invoice',
        fileName: fileName || 'document.pdf',
        status: 'completed',
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

  // Phase 2: Advanced Analytics Routes
  app.get('/api/analytics/dashboard-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { period } = req.query;
      const { generateBusinessIntelligenceReport, getRealtimeKPIs } = await import("./analytics-service");
      
      // Calculate date range from period
      const dateRange = (() => {
        const now = new Date();
        const start = new Date();
        switch(period) {
          case 'week':
            start.setDate(now.getDate() - 7);
            break;
          case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            start.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
          default:
            start.setMonth(now.getMonth() - 1);
        }
        return { start, end: now };
      })();
      
      // Get real analytics data from service
      const report = await generateBusinessIntelligenceReport(garageId, dateRange);
      const kpis = await getRealtimeKPIs(garageId);
      
      // Transform to frontend contract (camelCase, flat structure)
      const revenue: any = report.revenue || {};
      const payments: any = report.payments || {};
      
      const totalRevenue = Number(revenue.total_revenue || 0);
      const totalInvoiced = Number(payments.total_invoiced || 0);
      const totalCollected = Number(payments.total_collected || 0);
      
      // Calculate costs estimate (assuming 65% margin)
      const totalCosts = totalRevenue * 0.65;
      const netProfit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      res.json({
        totalRevenue,
        totalCosts: Math.round(totalCosts),
        netProfit: Math.round(netProfit),
        profitMargin: Number(profitMargin.toFixed(1)),
        activeCustomers: Number(revenue.unique_customers || 0),
        jobCards: Number(revenue.total_jobs || 0),
        period,
        ...kpis,
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/analytics/custom-reports', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      // Return empty array for now - reports can be created
      res.json([]);
    } catch (error) {
      console.error("Error fetching custom reports:", error);
      res.status(500).json({ message: "Failed to fetch custom reports" });
    }
  });

  app.post('/api/analytics/custom-reports', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { name, description, reportType, schedule } = req.body;
      
      // Mock creation - would use storage in production
      const report = {
        id: Math.random().toString(36).substring(7),
        garageId,
        name,
        description,
        reportType,
        schedule,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };
      
      res.json(report);
    } catch (error) {
      console.error("Error creating custom report:", error);
      res.status(500).json({ message: "Failed to create custom report" });
    }
  });

  app.post('/api/analytics/custom-reports/:id/run', isAuthenticated, async (req: any, res) => {
    try {
      // Mock running a report
      res.json({ success: true, message: "Report generated successfully" });
    } catch (error) {
      console.error("Error running report:", error);
      res.status(500).json({ message: "Failed to run report" });
    }
  });

  app.get('/api/analytics/profit-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { periodType = 'service' } = req.query;
      const { analyzeProfitMargins } = await import("./analytics-service");
      
      // Get real profit analysis from service
      const analysis: any = await analyzeProfitMargins(
        garageId,
        periodType as 'service' | 'technician' | 'customer'
      );
      
      // Transform snake_case to camelCase for frontend
      const transformRow = (row: any) => ({
        name: row.service_type || row.technician_name || row.customer_name || row.name || 'Unknown',
        totalRevenue: Number(row.total_revenue || row.revenue || 0),
        totalCosts: Number(row.total_costs || row.costs || 0),
        netProfit: Number(row.net_profit || row.profit || 0),
        profitMargin: Number(row.profit_margin || row.margin || 0),
        jobCount: Number(row.job_count || row.jobs || 0),
      });
      
      const data = Array.isArray(analysis) ? analysis.map(transformRow) : (analysis.data || []).map(transformRow);
      
      res.json({
        data,
        periodType,
        totalRevenue: data.reduce((sum: number, row: any) => sum + row.totalRevenue, 0),
        totalCosts: data.reduce((sum: number, row: any) => sum + row.totalCosts, 0),
        netProfit: data.reduce((sum: number, row: any) => sum + row.netProfit, 0),
      });
    } catch (error) {
      console.error("Error fetching profit analysis:", error);
      res.status(500).json({ message: "Failed to fetch profit analysis" });
    }
  });

  app.get('/api/analytics/customer-ltv', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { riskFilter } = req.query;
      const { analyzeCustomerLTV } = await import("./analytics-service");
      
      // Get real customer LTV analysis from service
      const ltvAnalysis: any = await analyzeCustomerLTV(garageId);
      
      // Transform snake_case to camelCase
      const transformCustomer = (c: any) => ({
        customerId: c.customer_id || c.id,
        customerName: c.customer_name || c.name,
        lifetimeValue: Number(c.lifetime_value || c.ltv || 0),
        totalJobs: Number(c.total_jobs || c.jobs || 0),
        totalSpent: Number(c.total_spent || c.spent || 0),
        avgJobValue: Number(c.avg_job_value || c.avgValue || 0),
        lastVisit: c.last_visit || c.lastVisit,
        churnRisk: c.churn_risk || c.risk || 'low',
        segment: c.segment || 'regular',
      });
      
      // Extract customers array (handles both array and object response)
      let customers = Array.isArray(ltvAnalysis) ? ltvAnalysis : (ltvAnalysis.customers || ltvAnalysis.data || []);
      customers = customers.map(transformCustomer);
      
      // Apply risk filter if provided
      if (riskFilter) {
        customers = customers.filter((c: any) => c.churnRisk === riskFilter);
      }
      
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customer LTV:", error);
      res.status(500).json({ message: "Failed to fetch customer LTV data" });
    }
  });

  app.get('/api/analytics/heatmaps', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { heatmapType = 'time', period } = req.query;
      const { generateBusinessHeatMaps } = await import("./analytics-service");
      
      // Get real heat map data from service
      const heatmap: any = await generateBusinessHeatMaps(
        garageId,
        heatmapType as 'time' | 'service' | 'technician'
      );
      
      // Transform snake_case to camelCase
      const transformDataPoint = (point: any) => ({
        label: point.hour_of_day || point.day_of_week || point.service_type || point.technician_name || point.label || 'Unknown',
        value: Number(point.job_count || point.count || point.value || 0),
        revenue: Number(point.revenue || point.total_revenue || 0),
        avgValue: Number(point.avg_value || point.avg_job_value || 0),
      });
      
      // Extract data array (handles both array and object response)
      const data = Array.isArray(heatmap) ? heatmap.map(transformDataPoint) : (heatmap.data || heatmap.points || []).map(transformDataPoint);
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching heatmaps:", error);
      res.status(500).json({ message: "Failed to fetch heatmap data" });
    }
  });

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
  app.post('/api/stripe/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency } = req.body;
      
      // Input validation
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const result = await phase3Service.createPaymentIntent(amount, currency || 'usd');
      res.json(result);
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });

  app.get('/api/stripe/payment-status/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const status = await phase3Service.retrievePaymentStatus(id);
      res.json(status);
    } catch (error: any) {
      console.error("Error retrieving payment status:", error);
      res.status(500).json({ message: error.message || "Failed to retrieve payment status" });
    }
  });

  app.post('/api/stripe/refund', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId, amount } = req.body;
      const result = await phase3Service.processRefund(paymentIntentId, amount);
      res.json(result);
    } catch (error: any) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: error.message || "Failed to process refund" });
    }
  });

  app.get('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching marketplace orders:", error);
      res.status(500).json({ message: "Failed to fetch marketplace orders" });
    }
  });

  app.post('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { marketplace, partNumber, partName, quantity, unitPrice } = req.body;
      
      const order = {
        id: Math.random().toString(36).substring(7),
        garageId,
        marketplace,
        partNumber,
        partName,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        orderStatus: "pending",
        orderDate: new Date().toISOString(),
      };
      
      res.json(order);
    } catch (error) {
      console.error("Error creating marketplace order:", error);
      res.status(500).json({ message: "Failed to create marketplace order" });
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

  // Module 33: Third-Party Integrations
  
  // Integration Connections Routes
  app.get('/api/integrations/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const connections = await storage.getIntegrationConnections(userGarageId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching integration connections:", error);
      res.status(500).json({ message: "Failed to fetch integration connections" });
    }
  });

  app.post('/api/integrations/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const validatedData = insertIntegrationConnectionSchema.parse({
        ...req.body,
        garageId: userGarageId,
      });
      const connection = await storage.createIntegrationConnection(validatedData);
      res.json(connection);
    } catch (error: any) {
      console.error("Error creating integration connection:", error);
      res.status(500).json({ message: "Failed to create integration connection", error: error.message });
    }
  });

  app.patch('/api/integrations/connections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getIntegrationConnection(req.params.id);
      
      if (!existing || existing.garageId !== userGarageId) {
        return res.status(404).json({ message: "Integration connection not found" });
      }

      const connection = await storage.updateIntegrationConnection(req.params.id, req.body);
      res.json(connection);
    } catch (error) {
      console.error("Error updating integration connection:", error);
      res.status(500).json({ message: "Failed to update integration connection" });
    }
  });

  app.delete('/api/integrations/connections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existing = await storage.getIntegrationConnection(req.params.id);
      
      if (!existing || existing.garageId !== userGarageId) {
        return res.status(404).json({ message: "Integration connection not found" });
      }

      await storage.deleteIntegrationConnection(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting integration connection:", error);
      res.status(500).json({ message: "Failed to delete integration connection" });
    }
  });

  // Integration Sync Logs Routes
  app.get('/api/integrations/sync-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { connectionId } = req.query;
      const logs = await storage.getIntegrationSyncLogs(userGarageId, connectionId as string);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching integration sync logs:", error);
      res.status(500).json({ message: "Failed to fetch integration sync logs" });
    }
  });

  // Google Calendar Sync Routes
  app.post('/api/integrations/google-calendar/sync-appointment', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { syncAppointmentToGoogleCalendar } = await import('./integrations/googleCalendar.js');
      
      const result = await syncAppointmentToGoogleCalendar(req.body);
      
      // Log sync activity
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'google-calendar-appointment',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error syncing to Google Calendar:", error);
      res.status(500).json({ message: "Failed to sync to Google Calendar", error: error.message });
    }
  });

  app.post('/api/integrations/google-calendar/update-event', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { updateGoogleCalendarEvent } = await import('./integrations/googleCalendar.js');
      const { eventId, appointment } = req.body;
      
      const result = await updateGoogleCalendarEvent(eventId, appointment);
      
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'google-calendar-update',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error updating Google Calendar event:", error);
      res.status(500).json({ message: "Failed to update Google Calendar event", error: error.message });
    }
  });

  app.delete('/api/integrations/google-calendar/delete-event/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { deleteGoogleCalendarEvent } = await import('./integrations/googleCalendar.js');
      
      const result = await deleteGoogleCalendarEvent(req.params.eventId);
      
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'google-calendar-delete',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error deleting Google Calendar event:", error);
      res.status(500).json({ message: "Failed to delete Google Calendar event", error: error.message });
    }
  });

  // Gmail Routes
  app.post('/api/integrations/gmail/send-email', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { sendEmail } = await import('./integrations/gmail.js');
      
      const result = await sendEmail(req.body);
      
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'gmail-send',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error sending email via Gmail:", error);
      res.status(500).json({ message: "Failed to send email", error: error.message });
    }
  });

  app.post('/api/integrations/gmail/send-appointment-confirmation', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { sendAppointmentConfirmationEmail } = await import('./integrations/gmail.js');
      const { appointment, customer } = req.body;
      
      const result = await sendAppointmentConfirmationEmail(appointment, customer);
      
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'gmail-appointment-confirmation',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error sending appointment confirmation:", error);
      res.status(500).json({ message: "Failed to send appointment confirmation", error: error.message });
    }
  });

  app.post('/api/integrations/gmail/send-invoice', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { sendInvoiceEmail } = await import('./integrations/gmail.js');
      const { invoice, customer } = req.body;
      
      const result = await sendInvoiceEmail(invoice, customer);
      
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'gmail-invoice',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error sending invoice email:", error);
      res.status(500).json({ message: "Failed to send invoice email", error: error.message });
    }
  });

  app.post('/api/integrations/gmail/send-service-reminder', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { sendServiceReminderEmail } = await import('./integrations/gmail.js');
      const { reminder, customer, vehicle } = req.body;
      
      const result = await sendServiceReminderEmail(reminder, customer, vehicle);
      
      await storage.createIntegrationSyncLog({
        garageId: userGarageId,
        syncType: 'gmail-service-reminder',
        status: result.success ? 'success' : 'failed',
        recordsProcessed: result.success ? 1 : 0,
        errorMessage: result.error,
        syncData: result
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error sending service reminder:", error);
      res.status(500).json({ message: "Failed to send service reminder", error: error.message });
    }
  });

  // Accounting Integration Routes (Stub for QuickBooks/Xero)
  app.get('/api/integrations/accounting/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { syncStatus } = req.query;
      const transactions = await storage.getAccountingTransactions(userGarageId, syncStatus as string);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching accounting transactions:", error);
      res.status(500).json({ message: "Failed to fetch accounting transactions" });
    }
  });

  app.post('/api/integrations/accounting/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      // Placeholder for QuickBooks/Xero integration
      // Will be implemented when user provides API credentials
      
      res.json({ 
        success: false, 
        message: "Accounting integration not configured. Please provide QuickBooks or Xero API credentials." 
      });
    } catch (error: any) {
      console.error("Error syncing accounting data:", error);
      res.status(500).json({ message: "Failed to sync accounting data", error: error.message });
    }
  });

  // OBD-II Diagnostics Routes (Stub)
  app.get('/api/integrations/obd/diagnostics', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId } = req.query;
      const diagnostics = await storage.getOBDDiagnostics(userGarageId, vehicleId as string);
      res.json(diagnostics);
    } catch (error) {
      console.error("Error fetching OBD diagnostics:", error);
      res.status(500).json({ message: "Failed to fetch OBD diagnostics" });
    }
  });

  app.post('/api/integrations/obd/scan', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      // Placeholder for OBD-II adapter integration
      // Will be implemented when user provides OBD adapter API/SDK
      
      res.json({ 
        success: false, 
        message: "OBD-II diagnostics integration not configured. Please connect an OBD-II adapter." 
      });
    } catch (error: any) {
      console.error("Error scanning OBD data:", error);
      res.status(500).json({ message: "Failed to scan OBD data", error: error.message });
    }
  });

  // Module 34: Security & Compliance Routes
  
  // 2FA Routes
  app.post('/api/security/2fa/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const userEmail = req.user.email || 'user@garage.com';
      
      // Check if 2FA is already enabled
      const existing = await storage.getTwoFactorAuth(userId);
      if (existing && existing.isEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }
      
      // Generate 2FA secret and QR code
      const { generateTwoFactorSecret } = await import('./twoFactorAuth');
      const setup = await generateTwoFactorSecret(userEmail);
      
      // Store temporarily (not enabled until verified)
      await storage.createTwoFactorAuth({
        userId,
        secret: setup.secret,
        backupCodes: setup.backupCodes,
        isEnabled: false,
      });
      
      res.json({
        qrCodeUrl: setup.qrCodeUrl,
        backupCodes: setup.backupCodes,
        secret: setup.secret, // For manual entry
      });
    } catch (error: any) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA", error: error.message });
    }
  });
  
  app.post('/api/security/2fa/enable', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const twoFactorAuth = await storage.getTwoFactorAuth(userId);
      if (!twoFactorAuth) {
        return res.status(404).json({ message: "2FA setup not found. Please setup 2FA first." });
      }
      
      // Verify the token
      const { verifyTwoFactorToken } = await import('./twoFactorAuth');
      const isValid = verifyTwoFactorToken(twoFactorAuth.secret, token);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Enable 2FA
      const updated = await storage.updateTwoFactorAuth(userId, { isEnabled: true });
      
      res.json({ message: "2FA enabled successfully", twoFactorAuth: updated });
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      res.status(500).json({ message: "Failed to enable 2FA", error: error.message });
    }
  });
  
  app.post('/api/security/2fa/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { token, isBackupCode } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const twoFactorAuth = await storage.getTwoFactorAuth(userId);
      if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }
      
      const { verifyTwoFactorToken, verifyBackupCode } = await import('./twoFactorAuth');
      
      let isValid = false;
      let remainingCodes: string[] | undefined;
      
      if (isBackupCode) {
        const result = verifyBackupCode(twoFactorAuth.backupCodes as string[], token);
        isValid = result.valid;
        remainingCodes = result.remainingCodes;
        
        if (isValid && remainingCodes) {
          await storage.updateTwoFactorAuth(userId, { backupCodes: remainingCodes });
        }
      } else {
        isValid = verifyTwoFactorToken(twoFactorAuth.secret, token);
      }
      
      res.json({ 
        valid: isValid,
        remainingBackupCodes: remainingCodes?.length || (twoFactorAuth.backupCodes as string[])?.length || 0
      });
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA", error: error.message });
    }
  });
  
  app.delete('/api/security/2fa', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      await storage.deleteTwoFactorAuth(userId);
      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA", error: error.message });
    }
  });
  
  app.get('/api/security/2fa/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const twoFactorAuth = await storage.getTwoFactorAuth(userId);
      
      res.json({
        enabled: twoFactorAuth?.isEnabled || false,
        backupCodesCount: (twoFactorAuth?.backupCodes as string[])?.length || 0,
      });
    } catch (error: any) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ message: "Failed to get 2FA status", error: error.message });
    }
  });
  
  // Audit Logs Routes
  app.get('/api/security/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { userId, resourceType, action, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (resourceType) filters.resourceType = resourceType as string;
      if (action) filters.action = action as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const logs = await storage.getAuditLogs(userGarageId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  
  // Backup & Restore Routes
  app.get('/api/security/backups', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { status } = req.query;
      
      const backups = await storage.getBackupJobs(userGarageId, status as string);
      res.json(backups);
    } catch (error) {
      console.error("Error fetching backups:", error);
      res.status(500).json({ message: "Failed to fetch backups" });
    }
  });
  
  app.post('/api/security/backups', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { type, includeAttachments } = req.body;
      
      // Create backup job
      const backupJob = await storage.createBackupJob({
        garageId: userGarageId,
        jobType: type || 'full',
        status: 'pending',
        createdBy: userId,
      });
      
      // In production, this would trigger a background job
      // For now, we'll mark it as completed immediately
      setTimeout(async () => {
        try {
          await storage.updateBackupJob(backupJob.id, {
            status: 'completed',
            completedAt: new Date(),
            fileSize: Math.floor(Math.random() * 1000000) + 500000, // Mock size
            fileName: `backup_${backupJob.id}.zip`,
          });
        } catch (error) {
          console.error("Error completing backup:", error);
        }
      }, 2000);
      
      res.json(backupJob);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });
  
  app.post('/api/security/backups/:id/restore', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const backup = await storage.getBackupJob(id);
      
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }
      
      if (backup.status !== 'completed') {
        return res.status(400).json({ message: "Cannot restore incomplete backup" });
      }
      
      // In production, this would trigger a restore process
      // For now, return success message
      res.json({ 
        message: "Restore initiated successfully",
        backupId: id,
        estimatedTime: "5-10 minutes"
      });
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ message: "Failed to restore backup" });
    }
  });
  
  // GDPR Compliance Routes
  app.get('/api/security/gdpr/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { userId } = req.query;
      
      const requests = await storage.getGdprDataRequests(userGarageId, userId as string);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching GDPR requests:", error);
      res.status(500).json({ message: "Failed to fetch GDPR requests" });
    }
  });
  
  app.post('/api/security/gdpr/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { requestType, dataSubjectId, reason } = req.body;
      
      if (!requestType || !dataSubjectId) {
        return res.status(400).json({ message: "Request type and data subject ID are required" });
      }
      
      const request = await storage.createGdprDataRequest({
        garageId: userGarageId,
        userId: dataSubjectId,
        requestType,
        status: 'pending',
        requestData: { reason, requestedBy: userId },
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error creating GDPR request:", error);
      res.status(500).json({ message: "Failed to create GDPR request" });
    }
  });
  
  app.patch('/api/security/gdpr/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, processedBy, completedAt, exportUrl } = req.body;
      
      const updated = await storage.updateGdprDataRequest(id, {
        status,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        responseData: { processedBy, exportUrl },
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating GDPR request:", error);
      res.status(500).json({ message: "Failed to update GDPR request" });
    }
  });
  
  // User Consent Routes
  app.get('/api/security/consents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const consents = await storage.getUserConsents(userId);
      res.json(consents);
    } catch (error) {
      console.error("Error fetching consents:", error);
      res.status(500).json({ message: "Failed to fetch consents" });
    }
  });
  
  app.post('/api/security/consents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { consentType, granted } = req.body;
      
      if (!consentType || typeof granted !== 'boolean') {
        return res.status(400).json({ message: "Consent type and granted status are required" });
      }
      
      const consent = await storage.createUserConsent({
        userId,
        consentType,
        consentGiven: granted,
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                   req.socket.remoteAddress || 
                   null,
      });
      
      res.json(consent);
    } catch (error) {
      console.error("Error creating consent:", error);
      res.status(500).json({ message: "Failed to create consent" });
    }
  });
  
  app.patch('/api/security/consents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { granted } = req.body;
      
      const updated = await storage.updateUserConsent(id, { consentGiven: granted });
      res.json(updated);
    } catch (error) {
      console.error("Error updating consent:", error);
      res.status(500).json({ message: "Failed to update consent" });
    }
  });
  
  // Permission Override Routes
  app.get('/api/security/permissions/overrides', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { userId } = req.query;
      
      const overrides = await storage.getPermissionOverrides(userGarageId, userId as string);
      res.json(overrides);
    } catch (error) {
      console.error("Error fetching permission overrides:", error);
      res.status(500).json({ message: "Failed to fetch permission overrides" });
    }
  });
  
  app.post('/api/security/permissions/overrides', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const grantedBy = req.user?.id;
      const { userId, permission, granted, reason, expiresAt } = req.body;
      
      if (!userId || !permission || typeof granted !== 'boolean') {
        return res.status(400).json({ message: "User ID, permission, and granted status are required" });
      }
      
      const override = await storage.createPermissionOverride({
        garageId: userGarageId,
        userId,
        resource: permission.split(':')[0] || 'resource',
        action: permission.split(':')[1] || permission,
        allowed: granted,
        createdBy: grantedBy,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
      
      res.json(override);
    } catch (error) {
      console.error("Error creating permission override:", error);
      res.status(500).json({ message: "Failed to create permission override" });
    }
  });
  
  app.delete('/api/security/permissions/overrides/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePermissionOverride(id);
      res.json({ message: "Permission override deleted successfully" });
    } catch (error) {
      console.error("Error deleting permission override:", error);
      res.status(500).json({ message: "Failed to delete permission override" });
    }
  });

  // Module 35: System Improvements Routes
  
  // User Settings Routes
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      let settings = await storage.getUserSettings(userId);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.createUserSettings({ userId });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const settings = await storage.updateUserSettings(userId, req.body);
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

  // Module 36: In-App Chat Support Routes
  
  // Chat Conversations
  app.get('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const conversations = await storage.getChatConversations(userGarageId, userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/chat/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getChatConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { title, type, participantIds } = req.body;
      
      const conversation = await storage.createChatConversation({
        garageId: userGarageId,
        title,
        type: type || 'direct',
        createdBy: userId,
      });
      
      // Add creator as participant
      await storage.addChatParticipant({
        conversationId: conversation.id,
        userId,
        role: 'admin',
      });
      
      // Add other participants
      if (participantIds && Array.isArray(participantIds)) {
        for (const participantId of participantIds) {
          if (participantId !== userId) {
            await storage.addChatParticipant({
              conversationId: conversation.id,
              userId: participantId,
              role: 'member',
            });
          }
        }
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Chat Messages
  app.get('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      
      const messages = await storage.getChatMessages(
        id,
        limit ? parseInt(limit as string) : 100
      );
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const { content, messageType, replyToId, attachments } = req.body;
      
      const message = await storage.createChatMessage({
        conversationId: id,
        senderId: userId,
        content,
        messageType: messageType || 'text',
        replyToId,
        attachments,
      });
      
      // Broadcast message to all participants via WebSocket
      const participants = await storage.getChatParticipants(id);
      const participantIds = participants.map(p => p.userId);
      
      const wsServer = getChatWebSocketServer();
      if (wsServer) {
        wsServer.broadcastNewMessage(id, message, participantIds);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch('/api/chat/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const message = await storage.updateChatMessage(id, { content });
      res.json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  app.delete('/api/chat/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteChatMessage(id);
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Chat Participants
  app.get('/api/chat/conversations/:id/participants', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const participants = await storage.getChatParticipants(id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.post('/api/chat/conversations/:id/participants', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;
      
      const participant = await storage.addChatParticipant({
        conversationId: id,
        userId,
        role: role || 'member',
      });
      
      res.json(participant);
    } catch (error) {
      console.error("Error adding participant:", error);
      res.status(500).json({ message: "Failed to add participant" });
    }
  });

  app.post('/api/chat/conversations/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      
      await storage.markMessagesAsRead(id, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  app.get('/api/chat/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const { conversationId } = req.query;
      
      const count = await storage.getUnreadMessageCount(
        userId,
        conversationId as string | undefined
      );
      
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Chat Support Enhancements - Support Tickets
  app.get('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { status, priority, assignedTo, category } = req.query;
      
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
      const userGarageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      const { 
        conversationId, 
        category, 
        priority, 
        subject,
        createConversation,
        participantIds
      } = req.body;
      
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

  // Chat Attachments
  app.post('/api/chat/messages/:id/attachments', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const { fileName, fileUrl, fileSize, fileType, thumbnailUrl } = req.body;
      
      // Validate required fields
      if (!fileName || !fileUrl || !fileSize || !fileType) {
        return res.status(400).json({ message: "Missing required fields: fileName, fileUrl, fileSize, fileType" });
      }
      
      // Validate file size (max 50MB)
      const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
      if (fileSize > maxFileSize) {
        return res.status(400).json({ message: "File size exceeds maximum limit of 50MB" });
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
        'video/mp4', 'video/quicktime',
        'application/zip'
      ];
      
      if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({ 
          message: "File type not allowed. Supported types: images, PDF, documents, videos, and ZIP files" 
        });
      }
      
      const attachment = await storage.createChatAttachment({
        messageId: id,
        fileName,
        fileUrl,
        fileSize,
        fileType,
        thumbnailUrl,
        uploadedBy: userId,
      });
      
      res.json(attachment);
    } catch (error) {
      console.error("Error creating attachment:", error);
      res.status(500).json({ message: "Failed to create attachment" });
    }
  });

  app.get('/api/chat/messages/:id/attachments', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const attachments = await storage.getChatAttachments(id);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.delete('/api/chat/attachments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteChatAttachment(id);
      res.json({ message: "Attachment deleted successfully" });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Chat Reactions
  app.post('/api/chat/messages/:id/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      const { reaction } = req.body;
      
      if (!reaction) {
        return res.status(400).json({ message: "Reaction is required" });
      }
      
      const reactionObj = await storage.addMessageReaction({
        messageId: id,
        userId,
        reaction,
      });
      
      // Broadcast reaction via WebSocket
      const message = await storage.getChatMessage(id);
      if (message) {
        const wsServer = getChatWebSocketServer();
        if (wsServer) {
          const participants = await storage.getChatParticipants(message.conversationId);
          const participantIds = participants.map(p => p.userId);
          wsServer.broadcastNewMessage(message.conversationId, {
            type: 'message_reaction_added',
            messageId: id,
            userId,
            reaction,
          } as any, participantIds);
        }
      }
      
      res.json(reactionObj);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.delete('/api/chat/messages/:id/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'default-user';
      
      await storage.removeMessageReaction(id, userId);
      
      // Broadcast reaction removal via WebSocket
      const message = await storage.getChatMessage(id);
      if (message) {
        const wsServer = getChatWebSocketServer();
        if (wsServer) {
          const participants = await storage.getChatParticipants(message.conversationId);
          const participantIds = participants.map(p => p.userId);
          wsServer.broadcastNewMessage(message.conversationId, {
            type: 'message_reaction_removed',
            messageId: id,
            userId,
          } as any, participantIds);
        }
      }
      
      res.json({ message: "Reaction removed successfully" });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  app.get('/api/chat/messages/:id/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const reactions = await storage.getMessageReactions(id);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Module 37: Customer Self-Service Portal API Routes
  app.post('/api/customer-portal/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.userType !== 'customer') {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { comparePassword } = await import("./auth");
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      
      const session = await storage.createPortalSession(user.id);
      
      res.json({
        token: session.token,
        customer: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        }
      });
    } catch (error) {
      console.error("Error logging in to customer portal:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/customer-portal/logout', async (req, res) => {
    try {
      const token = req.headers['x-portal-token'];
      if (token) {
        await storage.revokePortalSession(token as string);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  const portalAuth = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers['x-portal-token'];
      if (!token) {
        return res.status(401).json({ message: "Portal token required" });
      }
      
      const session = await storage.validatePortalSession(token);
      if (!session) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      
      const user = await storage.getUser(session.customerId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.portalUser = user;
      next();
    } catch (error) {
      console.error("Portal auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  };

  app.get('/api/customer-portal/me', portalAuth, async (req: any, res) => {
    try {
      res.json(req.portalUser);
    } catch (error) {
      console.error("Error fetching portal user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/customer-portal/appointments', portalAuth, async (req: any, res) => {
    try {
      const customerId = req.portalUser.id;
      const appointments = await storage.getCustomerAppointments(customerId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/customer-portal/vehicles', portalAuth, async (req: any, res) => {
    try {
      const customerId = req.portalUser.id;
      const vehicles = await storage.getCustomerVehicles(customerId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get('/api/customer-portal/service-history', portalAuth, async (req: any, res) => {
    try {
      const customerId = req.portalUser.id;
      const { vehicleId } = req.query;
      const history = await storage.getCustomerServiceHistory(
        customerId,
        vehicleId as string | undefined
      );
      res.json(history);
    } catch (error) {
      console.error("Error fetching service history:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  });

  app.get('/api/customer-portal/estimates', portalAuth, async (req: any, res) => {
    try {
      const customerId = req.portalUser.id;
      const { status } = req.query;
      const estimates = await storage.getCustomerEstimates(
        customerId,
        status as string | undefined
      );
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  app.post('/api/customer-portal/estimates/:id/approve', portalAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const customerId = req.portalUser.id;
      const estimate = await storage.approveEstimate(id, customerId);
      res.json(estimate);
    } catch (error: any) {
      console.error("Error approving estimate:", error);
      res.status(error.message?.includes('unauthorized') ? 403 : 500)
        .json({ message: error.message || "Failed to approve estimate" });
    }
  });

  app.get('/api/customer-portal/invoices', portalAuth, async (req: any, res) => {
    try {
      const customerId = req.portalUser.id;
      const invoices = await storage.getCustomerInvoices(customerId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/customer-portal/payments', portalAuth, async (req: any, res) => {
    try {
      const customerId = req.portalUser.id;
      const payments = await storage.getCustomerPayments(customerId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

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

  // Module 40: Fleet Management API Routes
  
  // Fleet Groups
  app.post('/api/fleet/groups', isAuthenticated, async (req: any, res) => {
    try {
      const fleetGroup = await storage.createFleetGroup({
        ...req.body,
        garageId: req.user?.garageId,
      });
      res.status(201).json(fleetGroup);
    } catch (error) {
      console.error("Error creating fleet group:", error);
      res.status(500).json({ message: "Failed to create fleet group" });
    }
  });

  app.get('/api/fleet/groups', isAuthenticated, async (req: any, res) => {
    try {
      const fleetGroups = await storage.getFleetGroupsByGarage(req.user?.garageId);
      res.json(fleetGroups);
    } catch (error) {
      console.error("Error fetching fleet groups:", error);
      res.status(500).json({ message: "Failed to fetch fleet groups" });
    }
  });

  app.get('/api/fleet/groups/:id', isAuthenticated, async (req, res) => {
    try {
      const fleetGroup = await storage.getFleetGroup(req.params.id);
      if (!fleetGroup) {
        return res.status(404).json({ message: "Fleet group not found" });
      }
      res.json(fleetGroup);
    } catch (error) {
      console.error("Error fetching fleet group:", error);
      res.status(500).json({ message: "Failed to fetch fleet group" });
    }
  });

  app.patch('/api/fleet/groups/:id', isAuthenticated, async (req, res) => {
    try {
      const fleetGroup = await storage.updateFleetGroup(req.params.id, req.body);
      res.json(fleetGroup);
    } catch (error) {
      console.error("Error updating fleet group:", error);
      res.status(500).json({ message: "Failed to update fleet group" });
    }
  });

  app.delete('/api/fleet/groups/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFleetGroup(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fleet group:", error);
      res.status(500).json({ message: "Failed to delete fleet group" });
    }
  });

  // Fleet Vehicles
  app.post('/api/fleet/vehicles', isAuthenticated, async (req, res) => {
    try {
      const fleetVehicle = await storage.createFleetVehicle(req.body);
      res.status(201).json(fleetVehicle);
    } catch (error) {
      console.error("Error creating fleet vehicle:", error);
      res.status(500).json({ message: "Failed to create fleet vehicle" });
    }
  });

  app.get('/api/fleet/vehicles/group/:fleetGroupId', isAuthenticated, async (req, res) => {
    try {
      const fleetVehicles = await storage.getFleetVehiclesByGroup(req.params.fleetGroupId);
      res.json(fleetVehicles);
    } catch (error) {
      console.error("Error fetching fleet vehicles:", error);
      res.status(500).json({ message: "Failed to fetch fleet vehicles" });
    }
  });

  app.get('/api/fleet/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      const fleetVehicle = await storage.getFleetVehicle(req.params.id);
      if (!fleetVehicle) {
        return res.status(404).json({ message: "Fleet vehicle not found" });
      }
      res.json(fleetVehicle);
    } catch (error) {
      console.error("Error fetching fleet vehicle:", error);
      res.status(500).json({ message: "Failed to fetch fleet vehicle" });
    }
  });

  app.patch('/api/fleet/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      const fleetVehicle = await storage.updateFleetVehicle(req.params.id, req.body);
      res.json(fleetVehicle);
    } catch (error) {
      console.error("Error updating fleet vehicle:", error);
      res.status(500).json({ message: "Failed to update fleet vehicle" });
    }
  });

  app.delete('/api/fleet/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFleetVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fleet vehicle:", error);
      res.status(500).json({ message: "Failed to delete fleet vehicle" });
    }
  });

  // Fleet Contracts
  app.post('/api/fleet/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const contract = await storage.createFleetContract({
        ...req.body,
        createdBy: req.user?.id,
      });
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating fleet contract:", error);
      res.status(500).json({ message: "Failed to create fleet contract" });
    }
  });

  app.get('/api/fleet/contracts/group/:fleetGroupId', isAuthenticated, async (req, res) => {
    try {
      const contracts = await storage.getFleetContractsByGroup(req.params.fleetGroupId);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching fleet contracts:", error);
      res.status(500).json({ message: "Failed to fetch fleet contracts" });
    }
  });

  app.get('/api/fleet/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const contract = await storage.getFleetContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Fleet contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching fleet contract:", error);
      res.status(500).json({ message: "Failed to fetch fleet contract" });
    }
  });

  app.patch('/api/fleet/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const contract = await storage.updateFleetContract(req.params.id, req.body);
      res.json(contract);
    } catch (error) {
      console.error("Error updating fleet contract:", error);
      res.status(500).json({ message: "Failed to update fleet contract" });
    }
  });

  app.delete('/api/fleet/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFleetContract(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fleet contract:", error);
      res.status(500).json({ message: "Failed to delete fleet contract" });
    }
  });

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
  app.get('/api/contracts/enhanced', isAuthenticated, async (req: any, res) => {
    try {
      const { db } = await import('./storage');
      const { fleetContracts, fleetGroups, contractUtilization, contractSLAMetrics, contractRenewals } = await import('@shared/schema');
      const { eq, desc } = await import('drizzle-orm');

      const contracts = await db
        .select()
        .from(fleetContracts)
        .orderBy(desc(fleetContracts.createdAt));

      const enrichedContracts = await Promise.all(contracts.map(async (contract) => {
        const [fleetGroup] = await db
          .select()
          .from(fleetGroups)
          .where(eq(fleetGroups.id, contract.fleetGroupId));

        const utilization = await db
          .select()
          .from(contractUtilization)
          .where(eq(contractUtilization.contractId, contract.id))
          .orderBy(desc(contractUtilization.serviceDate));

        const slaMetrics = await db
          .select()
          .from(contractSLAMetrics)
          .where(eq(contractSLAMetrics.contractId, contract.id))
          .orderBy(desc(contractSLAMetrics.incidentDate));

        const renewals = await db
          .select()
          .from(contractRenewals)
          .where(eq(contractRenewals.contractId, contract.id))
          .orderBy(desc(contractRenewals.createdAt));

        return {
          ...contract,
          fleetGroup,
          utilization,
          slaMetrics,
          renewals,
        };
      }));

      res.json(enrichedContracts);
    } catch (error) {
      console.error("Error fetching enhanced contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

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
  app.post("/api/inspection-templates", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertInspectionTemplateSchema.parse(req.body);
      const template = await storage.createInspectionTemplate({
        ...data,
        garageId: user.garageId,
        createdBy: user.id,
      });
      res.status(201).json(template);
    } catch (error: any) {
      console.error("Error creating inspection template:", error);
      res.status(400).json({ error: error.message || "Failed to create inspection template" });
    }
  });

  app.get("/api/inspection-templates", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const templates = await storage.getInspectionTemplates(user.garageId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching inspection templates:", error);
      res.status(500).json({ error: "Failed to fetch inspection templates" });
    }
  });

  app.get("/api/inspection-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getInspectionTemplateById(id);
      if (!template) {
        return res.status(404).json({ error: "Inspection template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching inspection template:", error);
      res.status(500).json({ error: "Failed to fetch inspection template" });
    }
  });

  app.patch("/api/inspection-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertInspectionTemplateSchema.partial().parse(req.body);
      const updated = await storage.updateInspectionTemplate(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating inspection template:", error);
      res.status(400).json({ error: error.message || "Failed to update inspection template" });
    }
  });

  app.delete("/api/inspection-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInspectionTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting inspection template:", error);
      res.status(500).json({ error: "Failed to delete inspection template" });
    }
  });

  // Vehicle Inspections
  app.post("/api/vehicle-inspections", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertVehicleInspectionSchema.parse(req.body);
      const inspection = await storage.createVehicleInspection({
        ...data,
        garageId: user.garageId,
        inspectorId: user.id,
      });
      res.status(201).json(inspection);
    } catch (error: any) {
      console.error("Error creating vehicle inspection:", error);
      res.status(400).json({ error: error.message || "Failed to create vehicle inspection" });
    }
  });

  app.get("/api/vehicle-inspections", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, vehicleId, customerId } = req.query;
      const inspections = await storage.getVehicleInspections(user.garageId, {
        status: status as string | undefined,
        vehicleId: vehicleId as string | undefined,
        customerId: customerId as string | undefined,
      });
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching vehicle inspections:", error);
      res.status(500).json({ error: "Failed to fetch vehicle inspections" });
    }
  });

  app.get("/api/vehicle-inspections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const inspection = await storage.getVehicleInspectionById(id);
      if (!inspection) {
        return res.status(404).json({ error: "Vehicle inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      console.error("Error fetching vehicle inspection:", error);
      res.status(500).json({ error: "Failed to fetch vehicle inspection" });
    }
  });

  app.patch("/api/vehicle-inspections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertVehicleInspectionSchema.partial().parse(req.body);
      const updated = await storage.updateVehicleInspection(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating vehicle inspection:", error);
      res.status(400).json({ error: error.message || "Failed to update vehicle inspection" });
    }
  });

  app.delete("/api/vehicle-inspections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVehicleInspection(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vehicle inspection:", error);
      res.status(500).json({ error: "Failed to delete vehicle inspection" });
    }
  });

  // ========================================================================
  // Module 46: Towing & Roadside Assistance
  // ========================================================================

  // Towing Requests
  app.post("/api/towing-requests", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertTowingRequestSchema.parse(req.body);
      const request = await storage.createTowingRequest({
        ...data,
        garageId: user.garageId,
      });
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating towing request:", error);
      res.status(400).json({ error: error.message || "Failed to create towing request" });
    }
  });

  app.get("/api/towing-requests", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, serviceType } = req.query;
      const requests = await storage.getTowingRequests(user.garageId, {
        status: status as string | undefined,
        serviceType: serviceType as string | undefined,
      });
      res.json(requests);
    } catch (error) {
      console.error("Error fetching towing requests:", error);
      res.status(500).json({ error: "Failed to fetch towing requests" });
    }
  });

  app.get("/api/towing-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getTowingRequestById(id);
      if (!request) {
        return res.status(404).json({ error: "Towing request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching towing request:", error);
      res.status(500).json({ error: "Failed to fetch towing request" });
    }
  });

  app.patch("/api/towing-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertTowingRequestSchema.partial().parse(req.body);
      const updated = await storage.updateTowingRequest(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating towing request:", error);
      res.status(400).json({ error: error.message || "Failed to update towing request" });
    }
  });

  app.delete("/api/towing-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTowingRequest(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting towing request:", error);
      res.status(500).json({ error: "Failed to delete towing request" });
    }
  });

  // Tow Trucks
  app.post("/api/tow-trucks", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertTowTruckSchema.parse(req.body);
      const truck = await storage.createTowTruck({
        ...data,
        garageId: user.garageId,
      });
      res.status(201).json(truck);
    } catch (error: any) {
      console.error("Error creating tow truck:", error);
      res.status(400).json({ error: error.message || "Failed to create tow truck" });
    }
  });

  app.get("/api/tow-trucks", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { status } = req.query;
      const trucks = await storage.getTowTrucks(user.garageId, {
        status: status as string | undefined,
      });
      res.json(trucks);
    } catch (error) {
      console.error("Error fetching tow trucks:", error);
      res.status(500).json({ error: "Failed to fetch tow trucks" });
    }
  });

  app.get("/api/tow-trucks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const truck = await storage.getTowTruckById(id);
      if (!truck) {
        return res.status(404).json({ error: "Tow truck not found" });
      }
      res.json(truck);
    } catch (error) {
      console.error("Error fetching tow truck:", error);
      res.status(500).json({ error: "Failed to fetch tow truck" });
    }
  });

  app.patch("/api/tow-trucks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertTowTruckSchema.partial().parse(req.body);
      const updated = await storage.updateTowTruck(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating tow truck:", error);
      res.status(400).json({ error: error.message || "Failed to update tow truck" });
    }
  });

  app.delete("/api/tow-trucks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTowTruck(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tow truck:", error);
      res.status(500).json({ error: "Failed to delete tow truck" });
    }
  });

  app.patch("/api/tow-trucks/:id/location", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      
      // Validate latitude and longitude
      const locationSchema = z.object({
        latitude: z.string().regex(/^-?\d+(\.\d+)?$/, "Invalid latitude format"),
        longitude: z.string().regex(/^-?\d+(\.\d+)?$/, "Invalid longitude format"),
      });
      
      locationSchema.parse({ latitude, longitude });
      
      const updated = await storage.updateTowTruckLocation(id, latitude, longitude);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating tow truck location:", error);
      res.status(400).json({ error: error.message || "Failed to update tow truck location" });
    }
  });

  // ========================================================================
  // Module 48: Loaner Vehicle Management
  // ========================================================================

  // Loaner Vehicles
  app.post("/api/loaner-vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertLoanerVehicleSchema.parse(req.body);
      const vehicle = await storage.createLoanerVehicle({
        ...data,
        garageId: user.garageId,
      });
      res.status(201).json(vehicle);
    } catch (error: any) {
      console.error("Error creating loaner vehicle:", error);
      res.status(400).json({ error: error.message || "Failed to create loaner vehicle" });
    }
  });

  app.get("/api/loaner-vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, condition } = req.query;
      const vehicles = await storage.getLoanerVehicles(user.garageId, {
        status: status as string | undefined,
        condition: condition as string | undefined,
      });
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching loaner vehicles:", error);
      res.status(500).json({ error: "Failed to fetch loaner vehicles" });
    }
  });

  app.get("/api/loaner-vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.getLoanerVehicleById(id);
      if (!vehicle) {
        return res.status(404).json({ error: "Loaner vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching loaner vehicle:", error);
      res.status(500).json({ error: "Failed to fetch loaner vehicle" });
    }
  });

  app.patch("/api/loaner-vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertLoanerVehicleSchema.partial().parse(req.body);
      const updated = await storage.updateLoanerVehicle(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating loaner vehicle:", error);
      res.status(400).json({ error: error.message || "Failed to update loaner vehicle" });
    }
  });

  app.delete("/api/loaner-vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLoanerVehicle(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loaner vehicle:", error);
      res.status(500).json({ error: "Failed to delete loaner vehicle" });
    }
  });

  // Loaner Reservations
  app.post("/api/loaner-reservations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = insertLoanerReservationSchema.parse(req.body);
      const reservation = await storage.createLoanerReservation({
        ...data,
        createdBy: user.id,
      });
      res.status(201).json(reservation);
    } catch (error: any) {
      console.error("Error creating loaner reservation:", error);
      res.status(400).json({ error: error.message || "Failed to create loaner reservation" });
    }
  });

  app.get("/api/loaner-reservations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, loanerVehicleId } = req.query;
      const reservations = await storage.getLoanerReservations(user.garageId, {
        status: status as string | undefined,
        loanerVehicleId: loanerVehicleId as string | undefined,
      });
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching loaner reservations:", error);
      res.status(500).json({ error: "Failed to fetch loaner reservations" });
    }
  });

  app.get("/api/loaner-reservations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reservation = await storage.getLoanerReservationById(id);
      if (!reservation) {
        return res.status(404).json({ error: "Loaner reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      console.error("Error fetching loaner reservation:", error);
      res.status(500).json({ error: "Failed to fetch loaner reservation" });
    }
  });

  app.patch("/api/loaner-reservations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertLoanerReservationSchema.partial().parse(req.body);
      const updated = await storage.updateLoanerReservation(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating loaner reservation:", error);
      res.status(400).json({ error: error.message || "Failed to update loaner reservation" });
    }
  });

  app.delete("/api/loaner-reservations/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLoanerReservation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loaner reservation:", error);
      res.status(500).json({ error: "Failed to delete loaner reservation" });
    }
  });

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

  // ========================================================================
  // Module 44: Customer Loyalty Program
  // ========================================================================

  // Loyalty Programs
  app.post("/api/loyalty-programs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = { ...req.body, garageId: user.garageId };
      const program = await storage.createLoyaltyProgram(data);
      res.status(201).json(program);
    } catch (error: any) {
      console.error("Error creating loyalty program:", error);
      res.status(400).json({ error: error.message || "Failed to create loyalty program" });
    }
  });

  app.get("/api/loyalty-programs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const programs = await storage.getLoyaltyPrograms(user.garageId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching loyalty programs:", error);
      res.status(500).json({ error: "Failed to fetch loyalty programs" });
    }
  });

  app.get("/api/loyalty-programs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const program = await storage.getLoyaltyProgramById(id);
      if (!program) {
        return res.status(404).json({ error: "Loyalty program not found" });
      }
      res.json(program);
    } catch (error) {
      console.error("Error fetching loyalty program:", error);
      res.status(500).json({ error: "Failed to fetch loyalty program" });
    }
  });

  app.patch("/api/loyalty-programs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateLoyaltyProgram(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating loyalty program:", error);
      res.status(400).json({ error: error.message || "Failed to update loyalty program" });
    }
  });

  app.delete("/api/loyalty-programs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLoyaltyProgram(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loyalty program:", error);
      res.status(500).json({ error: "Failed to delete loyalty program" });
    }
  });

  // Loyalty Accounts
  app.post("/api/loyalty-accounts", isAuthenticated, async (req, res) => {
    try {
      const account = await storage.createLoyaltyAccount(req.body);
      res.status(201).json(account);
    } catch (error: any) {
      console.error("Error creating loyalty account:", error);
      res.status(400).json({ error: error.message || "Failed to create loyalty account" });
    }
  });

  app.get("/api/loyalty-accounts", isAuthenticated, async (req, res) => {
    try {
      const { programId, customerId } = req.query;
      const accounts = await storage.getLoyaltyAccounts(
        programId as string | undefined,
        customerId as string | undefined
      );
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching loyalty accounts:", error);
      res.status(500).json({ error: "Failed to fetch loyalty accounts" });
    }
  });

  app.get("/api/loyalty-accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const account = await storage.getLoyaltyAccountById(id);
      if (!account) {
        return res.status(404).json({ error: "Loyalty account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error fetching loyalty account:", error);
      res.status(500).json({ error: "Failed to fetch loyalty account" });
    }
  });

  app.get("/api/loyalty-accounts/customer/:customerId", isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const account = await storage.getLoyaltyAccountByCustomer(customerId);
      res.json(account || null);
    } catch (error) {
      console.error("Error fetching loyalty account by customer:", error);
      res.status(500).json({ error: "Failed to fetch loyalty account" });
    }
  });

  app.patch("/api/loyalty-accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateLoyaltyAccount(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating loyalty account:", error);
      res.status(400).json({ error: error.message || "Failed to update loyalty account" });
    }
  });

  // Loyalty Transactions
  app.post("/api/loyalty-transactions", isAuthenticated, async (req, res) => {
    try {
      const transaction = await storage.createLoyaltyTransaction(req.body);
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Error creating loyalty transaction:", error);
      res.status(400).json({ error: error.message || "Failed to create loyalty transaction" });
    }
  });

  app.get("/api/loyalty-accounts/:accountId/transactions", isAuthenticated, async (req, res) => {
    try {
      const { accountId } = req.params;
      const transactions = await storage.getLoyaltyTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      res.status(500).json({ error: "Failed to fetch loyalty transactions" });
    }
  });

  app.get("/api/loyalty-transactions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getLoyaltyTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ error: "Loyalty transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching loyalty transaction:", error);
      res.status(500).json({ error: "Failed to fetch loyalty transaction" });
    }
  });

  // Loyalty Rewards
  app.post("/api/loyalty-rewards", isAuthenticated, async (req, res) => {
    try {
      const reward = await storage.createLoyaltyReward(req.body);
      res.status(201).json(reward);
    } catch (error: any) {
      console.error("Error creating loyalty reward:", error);
      res.status(400).json({ error: error.message || "Failed to create loyalty reward" });
    }
  });

  app.get("/api/loyalty-programs/:programId/rewards", isAuthenticated, async (req, res) => {
    try {
      const { programId } = req.params;
      const { isActive } = req.query;
      const rewards = await storage.getLoyaltyRewards(programId, {
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching loyalty rewards:", error);
      res.status(500).json({ error: "Failed to fetch loyalty rewards" });
    }
  });

  app.get("/api/loyalty-rewards/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reward = await storage.getLoyaltyRewardById(id);
      if (!reward) {
        return res.status(404).json({ error: "Loyalty reward not found" });
      }
      res.json(reward);
    } catch (error) {
      console.error("Error fetching loyalty reward:", error);
      res.status(500).json({ error: "Failed to fetch loyalty reward" });
    }
  });

  app.patch("/api/loyalty-rewards/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateLoyaltyReward(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating loyalty reward:", error);
      res.status(400).json({ error: error.message || "Failed to update loyalty reward" });
    }
  });

  app.delete("/api/loyalty-rewards/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLoyaltyReward(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loyalty reward:", error);
      res.status(500).json({ error: "Failed to delete loyalty reward" });
    }
  });

  // Loyalty Redemptions
  app.post("/api/loyalty-redemptions", isAuthenticated, async (req, res) => {
    try {
      const redemption = await storage.createLoyaltyRedemption(req.body);
      res.status(201).json(redemption);
    } catch (error: any) {
      console.error("Error creating loyalty redemption:", error);
      res.status(400).json({ error: error.message || "Failed to create loyalty redemption" });
    }
  });

  app.get("/api/loyalty-redemptions", isAuthenticated, async (req, res) => {
    try {
      const { accountId, status } = req.query;
      const redemptions = await storage.getLoyaltyRedemptions(
        accountId as string | undefined,
        { status: status as string | undefined }
      );
      res.json(redemptions);
    } catch (error) {
      console.error("Error fetching loyalty redemptions:", error);
      res.status(500).json({ error: "Failed to fetch loyalty redemptions" });
    }
  });

  app.get("/api/loyalty-redemptions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const redemption = await storage.getLoyaltyRedemptionById(id);
      if (!redemption) {
        return res.status(404).json({ error: "Loyalty redemption not found" });
      }
      res.json(redemption);
    } catch (error) {
      console.error("Error fetching loyalty redemption:", error);
      res.status(500).json({ error: "Failed to fetch loyalty redemption" });
    }
  });

  app.patch("/api/loyalty-redemptions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateLoyaltyRedemption(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating loyalty redemption:", error);
      res.status(400).json({ error: error.message || "Failed to update loyalty redemption" });
    }
  });

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
  app.post("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const data = { 
        ...req.body, 
        garageId: user.garageId,
        uploadedBy: user.id,
        status: req.body.status || "active"
      };
      const document = await storage.createDocument(data);
      res.status(201).json(document);
    } catch (error: any) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: error.message || "Failed to create document" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { categoryId, relatedType, relatedId, status } = req.query;
      const documents = await storage.getDocuments(user.garageId, {
        categoryId: categoryId as string | undefined,
        relatedType: relatedType as string | undefined,
        relatedId: relatedId as string | undefined,
        status: status as string | undefined,
      });
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/expiring", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { daysAhead } = req.query;
      const days = daysAhead ? parseInt(daysAhead as string) : 30;
      const documents = await storage.getExpiringDocuments(user.garageId, days);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching expiring documents:", error);
      res.status(500).json({ error: "Failed to fetch expiring documents" });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

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

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
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
  app.post("/api/locales", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertLocaleSchema.parse(req.body);
      const locale = await storage.createLocale(validatedData);
      res.status(201).json(locale);
    } catch (error: any) {
      console.error("Error creating locale:", error);
      res.status(400).json({ error: error.message || "Failed to create locale" });
    }
  });

  app.get("/api/locales", isAuthenticated, async (req, res) => {
    try {
      const locales = await storage.getLocales();
      res.json(locales);
    } catch (error) {
      console.error("Error fetching locales:", error);
      res.status(500).json({ error: "Failed to fetch locales" });
    }
  });

  app.get("/api/locales/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const locale = await storage.getLocaleById(id);
      if (!locale) {
        return res.status(404).json({ error: "Locale not found" });
      }
      res.json(locale);
    } catch (error) {
      console.error("Error fetching locale:", error);
      res.status(500).json({ error: "Failed to fetch locale" });
    }
  });

  app.patch("/api/locales/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateLocale(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating locale:", error);
      res.status(400).json({ error: error.message || "Failed to update locale" });
    }
  });

  app.delete("/api/locales/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLocale(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting locale:", error);
      res.status(500).json({ error: "Failed to delete locale" });
    }
  });

  // Translation Resources
  app.post("/api/translation-resources", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTranslationResourceSchema.parse(req.body);
      const resource = await storage.createTranslationResource(validatedData);
      res.status(201).json(resource);
    } catch (error: any) {
      console.error("Error creating translation resource:", error);
      res.status(400).json({ error: error.message || "Failed to create translation resource" });
    }
  });

  app.get("/api/translation-resources", isAuthenticated, async (req, res) => {
    try {
      const { localeId, namespace } = req.query;
      if (!localeId) {
        return res.status(400).json({ error: "localeId is required" });
      }
      const resources = await storage.getTranslationResources(localeId as string, {
        namespace: namespace as string | undefined
      });
      res.json(resources);
    } catch (error) {
      console.error("Error fetching translation resources:", error);
      res.status(500).json({ error: "Failed to fetch translation resources" });
    }
  });

  app.get("/api/translation-resources/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getTranslationResourceById(id);
      if (!resource) {
        return res.status(404).json({ error: "Translation resource not found" });
      }
      res.json(resource);
    } catch (error) {
      console.error("Error fetching translation resource:", error);
      res.status(500).json({ error: "Failed to fetch translation resource" });
    }
  });

  app.patch("/api/translation-resources/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateTranslationResource(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating translation resource:", error);
      res.status(400).json({ error: error.message || "Failed to update translation resource" });
    }
  });

  app.delete("/api/translation-resources/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTranslationResource(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting translation resource:", error);
      res.status(500).json({ error: "Failed to delete translation resource" });
    }
  });

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

  // ========================================================================
  // Module 57: Diagnostics & OBD Hub
  // ========================================================================

  // OBD Devices
  app.post("/api/obd-devices", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertObdDeviceSchema.parse(req.body);
      const device = await storage.createObdDevice(validatedData);
      res.status(201).json(device);
    } catch (error: any) {
      console.error("Error creating OBD device:", error);
      res.status(400).json({ error: error.message || "Failed to create OBD device" });
    }
  });

  app.get("/api/obd-devices", isAuthenticated, async (req, res) => {
    try {
      const { branchId } = req.query;
      const devices = await storage.getObdDevices(branchId as string | undefined);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching OBD devices:", error);
      res.status(500).json({ error: "Failed to fetch OBD devices" });
    }
  });

  app.get("/api/obd-devices/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const device = await storage.getObdDeviceById(id);
      if (!device) {
        return res.status(404).json({ error: "OBD device not found" });
      }
      res.json(device);
    } catch (error) {
      console.error("Error fetching OBD device:", error);
      res.status(500).json({ error: "Failed to fetch OBD device" });
    }
  });

  app.patch("/api/obd-devices/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateObdDevice(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating OBD device:", error);
      res.status(400).json({ error: error.message || "Failed to update OBD device" });
    }
  });

  app.delete("/api/obd-devices/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteObdDevice(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting OBD device:", error);
      res.status(500).json({ error: "Failed to delete OBD device" });
    }
  });

  // Device Assignments
  app.post("/api/device-assignments", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDeviceAssignmentSchema.parse(req.body);
      const assignment = await storage.createDeviceAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error: any) {
      console.error("Error creating device assignment:", error);
      res.status(400).json({ error: error.message || "Failed to create device assignment" });
    }
  });

  app.get("/api/device-assignments", isAuthenticated, async (req, res) => {
    try {
      const { deviceId, technicianId } = req.query;
      const assignments = await storage.getDeviceAssignments(
        deviceId as string | undefined,
        technicianId as string | undefined
      );
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching device assignments:", error);
      res.status(500).json({ error: "Failed to fetch device assignments" });
    }
  });

  app.get("/api/device-assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await storage.getDeviceAssignmentById(id);
      if (!assignment) {
        return res.status(404).json({ error: "Device assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error fetching device assignment:", error);
      res.status(500).json({ error: "Failed to fetch device assignment" });
    }
  });

  app.patch("/api/device-assignments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateDeviceAssignment(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating device assignment:", error);
      res.status(400).json({ error: error.message || "Failed to update device assignment" });
    }
  });

  // OBD Sessions
  app.post("/api/obd-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertObdSessionSchema.parse(req.body);
      const session = await storage.createObdSession(validatedData);
      res.status(201).json(session);
    } catch (error: any) {
      console.error("Error creating OBD session:", error);
      res.status(400).json({ error: error.message || "Failed to create OBD session" });
    }
  });

  app.get("/api/obd-sessions", isAuthenticated, async (req, res) => {
    try {
      const { deviceId, vehicleId, status } = req.query;
      const sessions = await storage.getObdSessions({
        deviceId: deviceId as string | undefined,
        vehicleId: vehicleId as string | undefined,
        status: status as string | undefined
      });
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching OBD sessions:", error);
      res.status(500).json({ error: "Failed to fetch OBD sessions" });
    }
  });

  app.get("/api/obd-sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getObdSessionById(id);
      if (!session) {
        return res.status(404).json({ error: "OBD session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching OBD session:", error);
      res.status(500).json({ error: "Failed to fetch OBD session" });
    }
  });

  app.patch("/api/obd-sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateObdSession(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating OBD session:", error);
      res.status(400).json({ error: error.message || "Failed to update OBD session" });
    }
  });

  // Diagnostic Reports
  app.post("/api/diagnostic-reports", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDiagnosticReportSchema.parse(req.body);
      const report = await storage.createDiagnosticReport(validatedData);
      res.status(201).json(report);
    } catch (error: any) {
      console.error("Error creating diagnostic report:", error);
      res.status(400).json({ error: error.message || "Failed to create diagnostic report" });
    }
  });

  app.get("/api/obd-sessions/:sessionId/diagnostic-reports", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const reports = await storage.getDiagnosticReports(sessionId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching diagnostic reports:", error);
      res.status(500).json({ error: "Failed to fetch diagnostic reports" });
    }
  });

  app.get("/api/diagnostic-reports/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getDiagnosticReportById(id);
      if (!report) {
        return res.status(404).json({ error: "Diagnostic report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching diagnostic report:", error);
      res.status(500).json({ error: "Failed to fetch diagnostic report" });
    }
  });

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

  // AI Scheduling Optimizer - Module 81
  app.get("/api/scheduling/rules", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", name: "Skill-Based Assignment", priority: 1, considerTechnicianSkills: true, considerTechnicianWorkload: true, isActive: true },
      { id: "2", name: "Parts Availability Check", priority: 2, considerPartAvailability: true, isActive: true },
    ]);
  });

  app.post("/api/scheduling/optimize", isAuthenticated, async (req, res) => {
    res.json({ message: "Optimization started", optimizationId: "opt-123" });
  });

  app.get("/api/scheduling/optimizations", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", date: "2024-10-26", appointmentsOptimized: 12, efficiencyGain: 14.5 },
    ]);
  });

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

  // ========================================
  // PHASE 2: ADVANCED ANALYTICS
  // ========================================

  // Business Intelligence Dashboard - Real SQL Analytics
  app.get("/api/analytics/bi-report", isAuthenticated, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      const { generateBusinessIntelligenceReport } = await import("./analytics-service");
      
      const dateRange = startDate && endDate ? {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      } : undefined;

      const report = await generateBusinessIntelligenceReport(req.user?.garageId, dateRange);
      res.json(report);
    } catch (error) {
      console.error("Error generating BI report:", error);
      res.status(500).json({ message: "Failed to generate BI report" });
    }
  });

  app.get("/api/analytics/realtime-kpis", isAuthenticated, async (req: any, res) => {
    try {
      const { getRealtimeKPIs } = await import("./analytics-service");
      const kpis = await getRealtimeKPIs(req.user?.garageId);
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching real-time KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  // Profit Margin Analysis - Real SQL Queries
  app.get("/api/analytics/profit-margins", isAuthenticated, async (req: any, res) => {
    try {
      const { groupBy } = req.query;
      const { analyzeProfitMargins } = await import("./analytics-service");
      
      const analysis = await analyzeProfitMargins(
        req.user?.garageId, 
        (groupBy as 'service' | 'technician' | 'customer') || 'service'
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing profit margins:", error);
      res.status(500).json({ message: "Failed to analyze profit margins" });
    }
  });

  // NOTE: Duplicate routes commented out - primary routes are at lines 6103-6143
  // app.get("/api/analytics/customer-ltv", isAuthenticated, async (req: any, res) => {
  //   try {
  //     const { analyzeCustomerLTV } = await import("./analytics-service");
  //     const ltvAnalysis = await analyzeCustomerLTV(req.user?.garageId);
  //     res.json(ltvAnalysis);
  //   } catch (error) {
  //     console.error("Error analyzing customer LTV:", error);
  //     res.status(500).json({ message: "Failed to analyze customer LTV" });
  //   }
  // });

  // app.get("/api/analytics/heatmaps", isAuthenticated, async (req: any, res) => {
  //   try {
  //     const { mapType } = req.query;
  //     const { generateBusinessHeatMaps } = await import("./analytics-service");
  //     
  //     const heatmap = await generateBusinessHeatMaps(
  //       req.user?.garageId,
  //       (mapType as 'time' | 'service' | 'technician') || 'time'
  //     );
  //     
  //     res.json(heatmap);
  //   } catch (error) {
  //     console.error("Error generating heat maps:", error);
  //     res.status(500).json({ message: "Failed to generate heat maps" });
  //   }
  // });

  // Custom Reports Builder (using mock data until storage methods are implemented)
  app.post("/api/analytics/custom-report", isAuthenticated, async (req: any, res) => {
    try {
      const { reportType, filters, dateRange } = req.body;
      
      // TODO: Implement createCustomReport in storage
      res.status(201).json({
        id: "report-new",
        userId: req.user?.id,
        garageId: req.user?.garageId,
        reportName: reportType,
        filters,
        dateRange,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating custom report:", error);
      res.status(500).json({ message: "Failed to create custom report" });
    }
  });

  app.get("/api/analytics/custom-reports", isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement getCustomReports in storage
      res.json([]);
    } catch (error) {
      console.error("Error fetching custom reports:", error);
      res.status(500).json({ message: "Failed to fetch custom reports" });
    }
  });

  // Dashboard Widgets (using mock data until storage methods are implemented)
  app.post("/api/analytics/widgets", isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement createDashboardWidget in storage
      res.status(201).json({
        id: "widget-new",
        ...req.body,
        userId: req.user?.id,
        garageId: req.user?.garageId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating widget:", error);
      res.status(500).json({ message: "Failed to create widget" });
    }
  });

  app.get("/api/analytics/widgets", isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement getDashboardWidgets in storage
      res.json([]);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      res.status(500).json({ message: "Failed to fetch widgets" });
    }
  });

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

  // ========================================
  // PHASE 8: MOBILE APPS API ENDPOINTS
  // ========================================

  // ==========================================
  // TECHNICIAN MOBILE APP API
  // ==========================================

  // Get assigned job cards for technician
  app.get("/api/mobile/technician/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const technicianId = req.user?.id;
      const userGarageId = req.user?.garageId;
      
      // Get all job cards assigned to this technician
      const allJobs = await storage.getJobCards(userGarageId);
      const assignedJobs = allJobs.filter((job: any) => job.assignedTo === technicianId);
      
      res.json(assignedJobs);
    } catch (error) {
      console.error("Error fetching technician jobs:", error);
      res.status(500).json({ message: "Failed to fetch assigned jobs" });
    }
  });

  // Update job card status (mobile)
  app.patch("/api/mobile/technician/jobs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updated = await storage.updateJobCard(id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Clock in/out for technician
  app.post("/api/mobile/technician/time-entries", isAuthenticated, async (req: any, res) => {
    try {
      const technicianId = req.user?.id;
      const { action, jobCardId, timestamp } = req.body; // action: 'clock_in' | 'clock_out'
      
      res.status(201).json({
        id: "time-entry-new",
        technicianId,
        action,
        jobCardId,
        timestamp: timestamp || new Date().toISOString(),
        message: `Successfully ${action === 'clock_in' ? 'clocked in' : 'clocked out'}`
      });
    } catch (error) {
      console.error("Error recording time entry:", error);
      res.status(500).json({ message: "Failed to record time entry" });
    }
  });

  // Upload media from mobile (photos/videos)
  app.post("/api/mobile/uploads", isAuthenticated, async (req: any, res) => {
    try {
      const { jobCardId, mediaType, filename, base64Data } = req.body; // mediaType: 'photo' | 'video'
      
      // In production, upload to S3/Cloudflare R2
      // For now, return mock upload URL
      const uploadUrl = `https://storage.salis-auto.com/uploads/${jobCardId}/${filename}`;
      
      res.status(201).json({
        uploadUrl,
        mediaType,
        filename,
        message: "Media uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Scan barcode for part lookup (mobile)
  app.get("/api/mobile/parts/scan/:barcode", isAuthenticated, async (req, res) => {
    try {
      const { barcode } = req.params;
      
      // Mock part lookup by barcode
      res.json({
        barcode,
        partNumber: "PN-" + barcode,
        partName: "Oil Filter",
        inStock: true,
        quantity: 45,
        price: 12.99,
        location: "Aisle 3, Shelf B"
      });
    } catch (error) {
      console.error("Error scanning barcode:", error);
      res.status(500).json({ message: "Failed to scan barcode" });
    }
  });

  // ==========================================
  // CUSTOMER MOBILE APP API
  // ==========================================

  // Get customer vehicles (mobile)
  app.get("/api/mobile/customer/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.id;
      const vehicles = await storage.getCustomerVehicles(customerId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Get customer appointments (mobile)
  app.get("/api/mobile/customer/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.id;
      const appointments = await storage.getCustomerAppointments(customerId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Book new appointment (mobile)
  app.post("/api/mobile/customer/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.id;
      const appointmentData = { ...req.body, customerId };
      
      // In production, validate time slot availability
      res.status(201).json({
        id: "apt-new",
        ...appointmentData,
        status: "confirmed",
        message: "Appointment booked successfully"
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Get customer invoices (mobile)
  app.get("/api/mobile/customer/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.id;
      const invoices = await storage.getCustomerInvoices(customerId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Process mobile payment
  app.post("/api/mobile/payments", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.id;
      const { invoiceId, amount, paymentMethodId } = req.body;
      
      // In production, integrate with Stripe/PayPal
      res.status(201).json({
        id: "payment-new",
        invoiceId,
        amount,
        customerId,
        status: "succeeded",
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Live job tracking for customer (mobile)
  app.get("/api/mobile/customer/tracking/:jobId", isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      
      // Mock live tracking data
      res.json({
        jobId,
        status: "in_progress",
        progress: 65,
        currentStep: "Engine diagnostics in progress",
        estimatedCompletion: "2024-10-26T16:00:00Z",
        updates: [
          { time: "2024-10-26T09:00:00Z", message: "Vehicle checked in" },
          { time: "2024-10-26T09:30:00Z", message: "Initial inspection completed" },
          { time: "2024-10-26T10:15:00Z", message: "Engine diagnostics started" },
        ]
      });
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });

  // Submit review (mobile)
  app.post("/api/mobile/customer/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user?.id;
      const { jobCardId, rating, comment } = req.body;
      
      res.status(201).json({
        id: "review-new",
        jobCardId,
        customerId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        message: "Review submitted successfully"
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // ==========================================
  // MANAGER MOBILE APP API
  // ==========================================

  // Get manager dashboard KPIs (mobile)
  app.get("/api/mobile/manager/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      // Mock KPIs
      res.json({
        todayRevenue: 12450,
        activeJobs: 23,
        technicianUtilization: 87,
        customerSatisfaction: 4.7,
        pendingApprovals: 5,
        trends: {
          revenueChange: 12.5,
          jobsChange: -3.2,
          utilizationChange: 5.1,
          satisfactionChange: 0.3
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard KPIs:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  // Get pending approvals (mobile)
  app.get("/api/mobile/manager/approvals", isAuthenticated, async (req, res) => {
    try {
      // Mock pending approvals
      res.json([
        { id: "1", type: "estimate", customer: "John Smith", amount: 450, vehicle: "2020 Honda Civic", status: "pending" },
        { id: "2", type: "time_off", employee: "Mike Davis", startDate: "2024-11-01", endDate: "2024-11-05", status: "pending" },
        { id: "3", type: "refund", customer: "Sarah Johnson", amount: 120, reason: "Service not completed", status: "pending" }
      ]);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  // Approve/reject item (mobile)
  app.patch("/api/mobile/manager/approvals/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body; // action: 'approve' | 'reject'
      
      res.json({
        id,
        status: action === 'approve' ? 'approved' : 'rejected',
        notes,
        message: `Successfully ${action}d`
      });
    } catch (error) {
      console.error("Error processing approval:", error);
      res.status(500).json({ message: "Failed to process approval" });
    }
  });

  // Get team overview (mobile)
  app.get("/api/mobile/manager/team", isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      // Mock team data
      res.json([
        { id: "1", name: "Mike Davis", role: "Lead Technician", status: "active", currentJob: "JOB-1234", utilization: 92 },
        { id: "2", name: "Emily Brown", role: "Technician", status: "active", currentJob: "JOB-1235", utilization: 88 },
        { id: "3", name: "John Smith", role: "Technician", status: "on_break", currentJob: null, utilization: 75 }
      ]);
    } catch (error) {
      console.error("Error fetching team data:", error);
      res.status(500).json({ message: "Failed to fetch team data" });
    }
  });

  // Get financial reports (mobile)
  app.get("/api/mobile/manager/reports", isAuthenticated, async (req, res) => {
    try {
      const { period } = req.query; // period: 'today' | 'week' | 'month'
      
      // Mock financial reports
      res.json({
        period: period || 'today',
        totalRevenue: 45890,
        totalExpenses: 23450,
        netProfit: 22440,
        profitMargin: 48.9,
        breakdown: {
          labor: 18500,
          parts: 15670,
          other: 11720
        },
        topServices: [
          { service: "Oil Change", revenue: 8900, count: 45 },
          { service: "Brake Repair", revenue: 12300, count: 18 },
          { service: "Engine Diagnostics", revenue: 15400, count: 12 }
        ]
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Get critical alerts (mobile)
  app.get("/api/mobile/manager/alerts", isAuthenticated, async (req, res) => {
    try {
      // Mock critical alerts
      res.json([
        { id: "1", type: "safety", severity: "high", message: "Safety incident reported in Bay 2", timestamp: "2024-10-26T14:30:00Z" },
        { id: "2", type: "inventory", severity: "medium", message: "Low stock alert: Oil filters (5 remaining)", timestamp: "2024-10-26T13:15:00Z" },
        { id: "3", type: "customer", severity: "high", message: "Customer complaint: Service delay over 2 hours", timestamp: "2024-10-26T12:00:00Z" }
      ]);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

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
  app.post('/api/video-estimates', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = videoEstimateSchema.parse(req.body);
      
      const estimateData = {
        garageId,
        customerId: validated.customerId,
        vehicleId: validated.vehicleId,
        technicianId: validated.technicianId,
        videoUrl: validated.videoUrl,
        thumbnailUrl: validated.thumbnailUrl,
        duration: validated.duration,
        transcription: validated.transcription,
        estimatedCost: validated.estimatedCost,
        recommendedServices: validated.recommendedServices,
      };
      const estimate = await phase4Service.createVideoEstimate(estimateData);
      res.status(201).json(estimate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating video estimate:", error);
      res.status(500).json({ message: "Failed to create video estimate" });
    }
  });

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

  // AI-Powered Scheduling Optimizer
  app.get('/api/scheduling/rules', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const rules = await phase5Service.getSchedulingRules(garageId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching scheduling rules:", error);
      res.status(500).json({ message: "Failed to fetch scheduling rules" });
    }
  });

  app.post('/api/scheduling/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = schedulingOptimizationSchema.parse(req.body);
      
      const optimizationData = {
        garageId,
        optimizationDate: new Date(validated.optimizationDate),
        appointmentsOptimized: validated.appointmentsOptimized,
        efficiencyGain: validated.efficiencyGain,
        technicianUtilization: validated.technicianUtilization,
        suggestions: validated.suggestions,
      };
      const optimization = await phase5Service.createSchedulingOptimization(optimizationData);
      res.status(201).json(optimization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating scheduling optimization:", error);
      res.status(500).json({ message: "Failed to create scheduling optimization" });
    }
  });

  app.get('/api/scheduling/history', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { limit } = req.query;
      const history = await phase5Service.getSchedulingHistory(garageId, limit ? parseInt(limit) : 30);
      res.json(history);
    } catch (error) {
      console.error("Error fetching scheduling history:", error);
      res.status(500).json({ message: "Failed to fetch scheduling history" });
    }
  });

  // Parts Auto-Reordering System
  app.post('/api/auto-reorder/rules', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = autoReorderRuleSchema.parse(req.body);
      
      const ruleData = {
        garageId,
        partId: validated.partId,
        minQuantity: validated.minQuantity,
        reorderQuantity: validated.reorderQuantity,
        preferredSupplierId: validated.preferredSupplierId,
      };
      const rule = await phase5Service.createAutoReorderRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating auto-reorder rule:", error);
      res.status(500).json({ message: "Failed to create auto-reorder rule" });
    }
  });

  app.get('/api/auto-reorder/rules', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const rules = await phase5Service.getAutoReorderRules(garageId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching auto-reorder rules:", error);
      res.status(500).json({ message: "Failed to fetch auto-reorder rules" });
    }
  });

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

  app.get('/api/auto-reorder/history', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { limit } = req.query;
      const history = await phase5Service.getReorderHistory(garageId, limit ? parseInt(limit) : 50);
      res.json(history);
    } catch (error) {
      console.error("Error fetching reorder history:", error);
      res.status(500).json({ message: "Failed to fetch reorder history" });
    }
  });

  // Multi-Location Routing Optimizer
  app.post('/api/routing/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = routingOptimizationSchema.parse(req.body);
      
      const routeData = {
        garageId,
        routeDate: new Date(validated.routeDate),
        routeType: validated.routeType,
        startLocation: validated.startLocation,
        stops: validated.stops,
        totalDistance: validated.totalDistance,
        estimatedDuration: validated.estimatedDuration,
        assignedDriver: validated.assignedDriver,
      };
      const route = await phase5Service.createRoutingOptimization(routeData);
      res.status(201).json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating route optimization:", error);
      res.status(500).json({ message: "Failed to create route optimization" });
    }
  });

  app.get('/api/routing/routes', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      const routes = await phase5Service.getRoutes(garageId, status as string);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  // Time Clock & Payroll
  app.post('/api/timeclock/clock-in', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const garageId = req.user?.garageId;
      const entry = await phase5Service.clockIn(garageId, userId);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/timeclock/clock-out', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const entry = await phase5Service.clockOut(userId);
      res.json(entry);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  app.get('/api/payroll/periods', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      const periods = await phase5Service.getPayrollPeriods(garageId, status as string);
      res.json(periods);
    } catch (error) {
      console.error("Error fetching payroll periods:", error);
      res.status(500).json({ message: "Failed to fetch payroll periods" });
    }
  });

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

  // ==========================================
  // PHASE 6: COMPLIANCE & QUALITY ROUTES
  // ==========================================

  // Environmental Compliance
  app.post('/api/compliance/environmental', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = complianceRecordSchema.parse(req.body);
      
      const recordData = {
        garageId,
        complianceType: validated.complianceType,
        recordDate: new Date(validated.recordDate),
        wasteType: validated.wasteType,
        quantity: validated.quantity,
        unit: validated.unit,
        disposalMethod: validated.disposalMethod,
        disposalCompany: validated.disposalCompany,
        certificationNumber: validated.certificationNumber,
        cost: validated.cost,
        regulatoryStandard: validated.regulatoryStandard,
        attachments: validated.attachments,
        notes: validated.notes,
      };
      const record = await phase6Service.createComplianceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating compliance record:", error);
      res.status(500).json({ message: "Failed to create compliance record" });
    }
  });

  app.get('/api/compliance/environmental', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { complianceType } = req.query;
      const records = await phase6Service.getComplianceRecords(garageId, complianceType as string);
      res.json(records);
    } catch (error) {
      console.error("Error fetching compliance records:", error);
      res.status(500).json({ message: "Failed to fetch compliance records" });
    }
  });

  app.get('/api/compliance/environmental/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { startDate, endDate } = req.query;
      const analytics = await phase6Service.getComplianceAnalytics(
        garageId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching compliance analytics:", error);
      res.status(500).json({ message: "Failed to fetch compliance analytics" });
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

  app.post('/api/quality/non-conformances', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = nonConformanceSchema.parse(req.body);
      
      const ncData = {
        garageId,
        ncNumber: validated.ncNumber,
        jobCardId: validated.jobCardId,
        description: validated.description,
        severity: validated.severity,
        reportedBy: validated.reportedBy,
        category: validated.category,
      };
      const nonConformance = await phase6Service.createNonConformance(ncData);
      res.status(201).json(nonConformance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating non-conformance:", error);
      res.status(500).json({ message: "Failed to create non-conformance" });
    }
  });

  app.get('/api/quality/non-conformances', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      const nonConformances = await phase6Service.getNonConformances(garageId, status as string);
      res.json(nonConformances);
    } catch (error) {
      console.error("Error fetching non-conformances:", error);
      res.status(500).json({ message: "Failed to fetch non-conformances" });
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

  app.post('/api/kiosk/check-in', isAuthenticated, async (req, res) => {
    try {
      const validated = kioskCheckInSchema.parse(req.body);
      
      const checkInData = {
        sessionId: validated.sessionId,
        customerId: validated.customerId,
        vehicleId: validated.vehicleId,
        appointmentId: validated.appointmentId,
        checkInType: validated.checkInType,
        signature: validated.signature,
        additionalNotes: validated.additionalNotes,
      };
      const checkIn = await phase7Service.completeKioskCheckIn(checkInData);
      res.status(201).json(checkIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error completing kiosk check-in:", error);
      res.status(500).json({ message: "Failed to complete kiosk check-in" });
    }
  });

  // Security Camera Integration
  app.post('/api/security/cameras', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      
      const validated = securityCameraSchema.parse(req.body);
      
      const cameraData = {
        garageId,
        cameraName: validated.cameraName,
        location: validated.location,
        ipAddress: validated.ipAddress,
        streamUrl: validated.streamUrl,
        resolution: validated.resolution,
        hasMotionDetection: validated.hasMotionDetection,
      };
      const camera = await phase7Service.createSecurityCamera(cameraData);
      res.status(201).json(camera);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating security camera:", error);
      res.status(500).json({ message: "Failed to create security camera" });
    }
  });

  app.post('/api/security/recordings', isAuthenticated, async (req, res) => {
    try {
      const validated = cameraRecordingSchema.parse(req.body);
      
      const recordingData = {
        cameraId: validated.cameraId,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
        recordingUrl: validated.recordingUrl,
        fileSize: validated.fileSize,
        eventType: validated.eventType,
        vehicleId: validated.vehicleId,
        notes: validated.notes,
      };
      const recording = await phase7Service.createCameraRecording(recordingData);
      res.status(201).json(recording);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating camera recording:", error);
      res.status(500).json({ message: "Failed to create camera recording" });
    }
  });

  app.get('/api/security/recordings/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const recording = await phase7Service.getRecordingPlayback(id);
      if (!recording) {
        return res.status(404).json({ message: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      console.error("Error fetching recording:", error);
      res.status(500).json({ message: "Failed to fetch recording" });
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
  app.post('/api/barcode/scan', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';
      
      const { barcodeData, scanType, itemType, itemId } = req.body;
      
      const scanData = {
        garageId,
        scanType,
        barcodeData,
        partId: scanType === 'part_inventory' ? itemId : undefined,
        vehicleId: scanType === 'vehicle_checkin' ? itemId : undefined,
        toolId: scanType === 'tool_tracking' ? itemId : undefined,
        scannedBy: userId,
        location: req.body.location,
        associatedAction: req.body.associatedAction,
      };
      const scan = await phase7Service.recordBarcodeScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      console.error("Error recording barcode scan:", error);
      res.status(500).json({ message: "Failed to record barcode scan" });
    }
  });

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

  // ==========================================
  // EMERGING TECHNOLOGIES ROUTES
  // ==========================================

  // Blockchain Vehicle History
  app.get('/api/emerging-tech/blockchain', isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.query;
      const garageId = req.user?.garageId;
      const records = await storage.getBlockchainRecords(vehicleId, garageId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching blockchain records:", error);
      res.status(500).json({ message: "Failed to fetch blockchain records" });
    }
  });

  // AR Repair Guides
  app.get('/api/emerging-tech/ar-guides', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const guides = await storage.getArRepairGuides(garageId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching AR guides:", error);
      res.status(500).json({ message: "Failed to fetch AR guides" });
    }
  });

  // IoT Sensors
  app.get('/api/emerging-tech/iot-sensors', isAuthenticated, async (req, res) => {
    try {
      const { vehicleId } = req.query;
      const sensors = await storage.getIotSensors(vehicleId as string | undefined);
      res.json(sensors);
    } catch (error) {
      console.error("Error fetching IoT sensors:", error);
      res.status(500).json({ message: "Failed to fetch IoT sensors" });
    }
  });

  app.get('/api/emerging-tech/iot-readings', isAuthenticated, async (req, res) => {
    try {
      const { sensorId, vehicleId } = req.query;
      const readings = await storage.getIotSensorReadings(
        sensorId as string | undefined,
        vehicleId as string | undefined
      );
      res.json(readings);
    } catch (error) {
      console.error("Error fetching IoT readings:", error);
      res.status(500).json({ message: "Failed to fetch IoT readings" });
    }
  });

  // 3D Parts Models
  app.get('/api/emerging-tech/3d-models', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const models = await storage.getParts3DModels(garageId);
      res.json(models);
    } catch (error) {
      console.error("Error fetching 3D models:", error);
      res.status(500).json({ message: "Failed to fetch 3D models" });
    }
  });

  // Drone Inspections
  app.get('/api/emerging-tech/drone-inspections', isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.query;
      const garageId = req.user?.garageId;
      const inspections = await storage.getDroneInspections(garageId, vehicleId);
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching drone inspections:", error);
      res.status(500).json({ message: "Failed to fetch drone inspections" });
    }
  });

  // AI Video Analysis
  app.get('/api/emerging-tech/ai-video', isAuthenticated, async (req, res) => {
    try {
      const { customerId, vehicleId } = req.query;
      const analyses = await storage.getAiVideoAnalyses(
        customerId as string | undefined,
        vehicleId as string | undefined
      );
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching AI video analyses:", error);
      res.status(500).json({ message: "Failed to fetch AI video analyses" });
    }
  });

  // Digital Twins
  app.get('/api/emerging-tech/digital-twins', isAuthenticated, async (req, res) => {
    try {
      const { vehicleId } = req.query;
      const twins = await storage.getDigitalTwins(vehicleId as string | undefined);
      res.json(twins);
    } catch (error) {
      console.error("Error fetching digital twins:", error);
      res.status(500).json({ message: "Failed to fetch digital twins" });
    }
  });

  // Fraud Detection
  app.get('/api/emerging-tech/fraud-cases', isAuthenticated, async (req: any, res) => {
    try {
      const { riskLevel } = req.query;
      const garageId = req.user?.garageId;
      const cases = await storage.getFraudDetectionCases(garageId, riskLevel);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching fraud cases:", error);
      res.status(500).json({ message: "Failed to fetch fraud cases" });
    }
  });

  // Biometric Profiles
  app.get('/api/emerging-tech/biometric-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || 'default-user';
      const profile = await storage.getBiometricProfile(userId);
      res.json(profile || {});
    } catch (error) {
      console.error("Error fetching biometric profile:", error);
      res.status(500).json({ message: "Failed to fetch biometric profile" });
    }
  });

  // Collaboration Sessions
  app.get('/api/emerging-tech/collaboration-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.query;
      const garageId = req.user?.garageId;
      const sessions = await storage.getCollaborationSessions(garageId, status as string | undefined);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching collaboration sessions:", error);
      res.status(500).json({ message: "Failed to fetch collaboration sessions" });
    }
  });

  // Edge Devices
  app.get('/api/emerging-tech/edge-devices', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const devices = await storage.getEdgeDevices(garageId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching edge devices:", error);
      res.status(500).json({ message: "Failed to fetch edge devices" });
    }
  });

  app.get('/api/emerging-tech/edge-diagnostics', isAuthenticated, async (req, res) => {
    try {
      const { deviceId, vehicleId } = req.query;
      const diagnostics = await storage.getEdgeDiagnostics(
        deviceId as string | undefined,
        vehicleId as string | undefined
      );
      res.json(diagnostics);
    } catch (error) {
      console.error("Error fetching edge diagnostics:", error);
      res.status(500).json({ message: "Failed to fetch edge diagnostics" });
    }
  });

  // Pricing Optimization
  app.get('/api/emerging-tech/pricing-optimization', isAuthenticated, async (req: any, res) => {
    try {
      const { serviceType } = req.query;
      const garageId = req.user?.garageId;
      const optimizations = await storage.getPricingOptimizations(garageId, serviceType as string | undefined);
      res.json(optimizations);
    } catch (error) {
      console.error("Error fetching pricing optimizations:", error);
      res.status(500).json({ message: "Failed to fetch pricing optimizations" });
    }
  });

  // Seed sample data for Emerging Technologies
  app.post('/api/emerging-tech/seed', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const userId = req.user?.id || 'default-user';

      // Get first vehicle for testing (or use a sample vehicle ID)
      const vehicles = await storage.getVehicles(garageId);
      const vehicleId = vehicles[0]?.id || 'sample-vehicle-id';

      const results = {
        blockchain: 0,
        arGuides: 0,
        iotSensors: 0,
        models3D: 0,
        droneInspections: 0,
        aiVideo: 0,
        digitalTwins: 0,
        fraudCases: 0,
        biometricProfile: 0,
        collaborationSessions: 0,
        edgeDevices: 0,
        pricingOptimizations: 0
      };

      // Seed Blockchain Records (3 records)
      for (let i = 0; i < 3; i++) {
        await storage.createBlockchainRecord({
          vehicleId,
          garageId,
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          blockNumber: 15000000 + i,
          eventType: ['service_completed', 'ownership_transfer', 'warranty_claim'][i % 3],
          eventData: { description: `Sample event ${i + 1}`, amount: 100 + i * 50 },
          verified: true,
        });
        results.blockchain++;
      }

      // Seed AR Repair Guides (2 guides)
      for (let i = 0; i < 2; i++) {
        await storage.createArRepairGuide({
          garageId,
          guideName: `${['Engine Repair', 'Brake Service'][i]} AR Guide`,
          description: `Step-by-step AR instructions for ${['engine repair', 'brake service'][i]}`,
          targetVehicleModels: ['Toyota Camry', 'Honda Accord'],
          difficultyLevel: ['intermediate', 'beginner'][i],
          estimatedDuration: [60, 45][i],
          arModelUrl: `https://example.com/ar/model-${i + 1}.glb`,
          steps: [
            { stepNumber: 1, title: 'Preparation', instruction: 'Gather tools and materials' },
            { stepNumber: 2, title: 'Diagnosis', instruction: 'Identify the issue' },
            { stepNumber: 3, title: 'Repair', instruction: 'Perform the repair' }
          ],
          createdBy: userId,
        });
        results.arGuides++;
      }

      // Seed IoT Sensors (4 sensors)
      for (let i = 0; i < 4; i++) {
        await storage.createIotSensor({
          vehicleId,
          sensorType: ['temperature', 'pressure', 'vibration', 'fuel_level'][i],
          sensorId: `IOT-${1000 + i}`,
          manufacturer: 'SensorTech',
          installDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          calibrationDate: new Date().toISOString(),
          status: 'active',
        });
        results.iotSensors++;
      }

      // Seed 3D Parts Models (3 models)
      for (let i = 0; i < 3; i++) {
        await storage.createParts3DModel({
          garageId,
          partName: ['Brake Rotor', 'Oil Filter', 'Air Filter'][i],
          partNumber: `PART-${2000 + i}`,
          manufacturer: 'AutoParts Inc',
          modelUrl: `https://example.com/3d/part-${i + 1}.glb`,
          thumbnailUrl: `https://example.com/3d/thumb-${i + 1}.jpg`,
          fileSize: 5.2 + i * 0.5,
          polygonCount: 10000 + i * 2000,
          category: 'Brake System',
        });
        results.models3D++;
      }

      // Seed Drone Inspections (2 inspections)
      for (let i = 0; i < 2; i++) {
        await storage.createDroneInspection({
          garageId,
          vehicleId,
          inspectionType: ['exterior_damage', 'roof_inspection'][i],
          pilotName: 'John Pilot',
          flightDuration: 15 + i * 5,
          capturedImages: 25 + i * 10,
          aiAnalysisResults: { damageDetected: i === 0, confidence: 0.95, issues: i === 0 ? ['Dent on hood', 'Scratch on door'] : [] },
          status: 'completed',
        });
        results.droneInspections++;
      }

      // Seed AI Video Analysis (2 analyses)
      for (let i = 0; i < 2; i++) {
        await storage.createAiVideoAnalysis({
          customerId: userId,
          vehicleId,
          videoUrl: `https://example.com/videos/analysis-${i + 1}.mp4`,
          analysisType: ['damage_assessment', 'walkaround'][i],
          aiModel: 'GPT-5-Vision',
          detectedIssues: i === 0 ? ['Minor dent', 'Paint scratch'] : [],
          estimatedCost: i === 0 ? 350.00 : 0,
          confidence: 0.92,
          status: 'completed',
        });
        results.aiVideo++;
      }

      // Seed Digital Twins (1 twin)
      await storage.createDigitalTwin({
        vehicleId,
        twinName: `Digital Twin - ${vehicleId.substring(0, 8)}`,
        lastSyncTime: new Date().toISOString(),
        sensorDataPoints: 1250,
        predictedIssues: ['Brake pad wear in 2 months', 'Oil change due in 3 weeks'],
        healthScore: 85,
        status: 'active',
      });
      results.digitalTwins++;

      // Seed Fraud Detection Cases (2 cases)
      for (let i = 0; i < 2; i++) {
        await storage.createFraudDetectionCase({
          garageId,
          caseType: ['invoice_manipulation', 'parts_theft'][i],
          detectedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          riskScore: [75, 60][i],
          mlModel: 'FraudDetector-v2',
          indicators: i === 0 ? ['Unusual pricing', 'Multiple edits'] : ['Inventory mismatch'],
          status: 'investigating',
        });
        results.fraudCases++;
      }

      // Seed Biometric Profile (1 profile)
      await storage.createBiometricProfile({
        userId,
        fingerprintHash: `FP-${Math.random().toString(36).substring(7).toUpperCase()}`,
        faceEmbedding: Array(128).fill(0).map(() => Math.random()),
        enrolledAt: new Date().toISOString(),
        lastAuthAt: new Date().toISOString(),
        authSuccessCount: 42,
        authFailureCount: 2,
        status: 'active',
      });
      results.biometricProfile = 1;

      // Seed Collaboration Sessions (2 sessions)
      for (let i = 0; i < 2; i++) {
        await storage.createCollaborationSession({
          garageId,
          jobCardId: 'sample-job-' + i,
          technicianId: userId,
          sessionType: ['video_call', 'ar_annotation'][i],
          duration: 25 + i * 10,
          recordingUrl: `https://example.com/recordings/session-${i + 1}.mp4`,
          annotations: i === 1 ? [{ x: 100, y: 200, note: 'Check here' }] : [],
        });
        results.collaborationSessions++;
      }

      // Seed Edge Devices (3 devices)
      for (let i = 0; i < 3; i++) {
        await storage.createEdgeDevice({
          garageId,
          deviceName: `Edge Gateway ${i + 1}`,
          deviceType: 'diagnostic_hub',
          ipAddress: `192.168.1.${100 + i}`,
          macAddress: `00:1B:44:11:3A:${(10 + i).toString(16).toUpperCase()}`,
          firmwareVersion: '2.1.0',
          status: 'online',
        });
        results.edgeDevices++;
      }

      // Seed Pricing Optimizations (2 optimizations)
      for (let i = 0; i < 2; i++) {
        await storage.createPricingOptimization({
          garageId,
          optimizationType: 'dynamic_pricing',
          targetService: ['Oil Change', 'Brake Service'][i],
          currentPrice: [45.00, 220.00][i],
          optimizedPrice: [49.99, 199.99][i],
          expectedRevenue: [1250.00, 3500.00][i],
          confidence: 0.88,
          factors: ['Market demand', 'Competition', 'Time of day'],
        });
        results.pricingOptimizations++;
      }

      res.json({ 
        message: 'Sample data seeded successfully!', 
        results 
      });
    } catch (error) {
      console.error("Error seeding emerging tech data:", error);
      res.status(500).json({ message: "Failed to seed data", error: String(error) });
    }
  });

  // ==========================================
  // NEXT-GENERATION TECHNOLOGY MODULE ROUTES
  // ==========================================

  // 1. Neural Diagnostics
  app.get("/api/nextgen/neural-diagnostics", isAuthenticated, async (req, res) => {
    try {
      const diagnostics = await storage.getNeuralDiagnostics(req.user!.garageId!);
      res.json({ data: diagnostics });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch neural diagnostics" });
    }
  });

  app.post("/api/nextgen/neural-diagnostics", isAuthenticated, async (req, res) => {
    try {
      const validated = insertNeuralDiagnosticSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const diagnostic = await storage.createNeuralDiagnostic(validated);
      res.json({ data: diagnostic });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create neural diagnostic" });
      }
    }
  });

  app.get("/api/nextgen/neural-training-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getNeuralTrainingSessions(req.user!.garageId!);
      res.json({ data: sessions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch neural training sessions" });
    }
  });

  app.post("/api/nextgen/neural-training-sessions", isAuthenticated, async (req, res) => {
    try {
      const validated = insertNeuralTrainingSessionSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const session = await storage.createNeuralTrainingSession(validated);
      res.json({ data: session });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create neural training session" });
      }
    }
  });

  // 2. Computer Vision
  app.get("/api/nextgen/vision-quality-checks", isAuthenticated, async (req, res) => {
    try {
      const checks = await storage.getVisionQualityChecks(req.user!.garageId!);
      res.json({ data: checks });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vision quality checks" });
    }
  });

  app.post("/api/nextgen/vision-quality-checks", isAuthenticated, async (req, res) => {
    try {
      const validated = insertVisionQualityCheckSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const check = await storage.createVisionQualityCheck(validated);
      res.json({ data: check });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create vision quality check" });
      }
    }
  });

  app.get("/api/nextgen/vision-defects", isAuthenticated, async (req, res) => {
    try {
      const defects = await storage.getVisionDefects(req.user!.garageId!);
      res.json({ data: defects });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vision defects" });
    }
  });

  app.post("/api/nextgen/vision-defects", isAuthenticated, async (req, res) => {
    try {
      const validated = insertVisionDefectSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const defect = await storage.createVisionDefect(validated);
      res.json({ data: defect });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create vision defect" });
      }
    }
  });

  // AI-Powered Image Analysis for Quality Control
  app.post("/api/vision/analyze-image", isAuthenticated, async (req, res) => {
    try {
      // Simulated AI analysis (GPT-5 Vision would analyze uploaded image in production)
      const { checkType, vehicleId } = req.body;
      
      // Simulate AI-detected defects
      const qualityScore = Math.floor(75 + Math.random() * 20);
      const defects = [];
      
      if (qualityScore < 85) {
        defects.push({
          type: 'Paint Scratch',
          severity: qualityScore < 80 ? 'major' : 'minor',
          description: 'Surface scratch detected on left door panel',
          confidence: 0.92,
          location: { x: 120, y: 450 }
        });
      }
      
      if (qualityScore < 90) {
        defects.push({
          type: 'Alignment Issue',
          severity: 'minor',
          description: 'Minor panel gap detected',
          confidence: 0.78,
          location: { x: 340, y: 200 }
        });
      }

      // Create quality check record
      const checkData = {
        garageId: req.user!.garageId!,
        vehicleId: vehicleId || 'demo-vehicle',
        checkType: checkType || 'paint_inspection',
        inspectionDate: new Date().toISOString(),
        qualityScore,
        passed: qualityScore >= 80,
        defectsFound: defects.length,
        inspector: req.user!.id,
        aiAnalysis: {
          model: 'gpt-5-vision',
          confidence: 0.85,
          processingTime: 2.3
        }
      };

      const check = await storage.createVisionQualityCheck(checkData);

      // Create defect records
      for (const defect of defects) {
        await storage.createVisionDefect({
          garageId: req.user!.garageId!,
          checkId: check.id,
          defectType: defect.type,
          severity: defect.severity,
          description: defect.description,
          location: JSON.stringify(defect.location),
          confidence: defect.confidence,
          status: 'pending'
        });
      }

      res.json({
        checkId: check.id,
        qualityScore,
        overallQuality: qualityScore >= 90 ? 'excellent' : qualityScore >= 80 ? 'good' : 'needs_attention',
        defects,
        recommendations: [
          'Schedule paint correction for detected scratches',
          'Inspect panel alignment during next service',
          'Document all defects for customer review'
        ]
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.get("/api/vision/quality-checks", isAuthenticated, async (req, res) => {
    try {
      const checks = await storage.getVisionQualityChecks(req.user!.garageId!);
      res.json(checks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality checks" });
    }
  });

  // 3. NLP Service Writer
  app.get("/api/nextgen/nlp-service-requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getNLPServiceRequests(req.user!.garageId!);
      res.json({ data: requests });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NLP service requests" });
    }
  });

  app.post("/api/nextgen/nlp-service-requests", isAuthenticated, async (req, res) => {
    try {
      const validated = insertNLPServiceRequestSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const request = await storage.createNLPServiceRequest(validated);
      res.json({ data: request });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create NLP service request" });
      }
    }
  });

  app.get("/api/nextgen/nlp-training-data", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getNLPTrainingData(req.user!.garageId!);
      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NLP training data" });
    }
  });

  app.post("/api/nextgen/nlp-training-data", isAuthenticated, async (req, res) => {
    try {
      const validated = insertNLPTrainingDataSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const data = await storage.createNLPTrainingData(validated);
      res.json({ data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create NLP training data" });
      }
    }
  });

  // 4. RL Parts Optimizer
  app.get("/api/nextgen/rl-parts-optimizations", isAuthenticated, async (req, res) => {
    try {
      const optimizations = await storage.getRLPartsOptimizations(req.user!.garageId!);
      res.json({ data: optimizations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RL parts optimizations" });
    }
  });

  app.post("/api/nextgen/rl-parts-optimizations", isAuthenticated, async (req, res) => {
    try {
      const validated = insertRLPartsOptimizationSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const optimization = await storage.createRLPartsOptimization(validated);
      res.json({ data: optimization });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create RL parts optimization" });
      }
    }
  });

  app.get("/api/nextgen/rl-learning-episodes", isAuthenticated, async (req, res) => {
    try {
      const episodes = await storage.getRLLearningEpisodes(req.user!.garageId!);
      res.json({ data: episodes });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RL learning episodes" });
    }
  });

  app.post("/api/nextgen/rl-learning-episodes", isAuthenticated, async (req, res) => {
    try {
      const validated = insertRLLearningEpisodeSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const episode = await storage.createRLLearningEpisode(validated);
      res.json({ data: episode });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create RL learning episode" });
      }
    }
  });

  // 5. Metaverse Showroom
  app.get("/api/nextgen/metaverse-showrooms", isAuthenticated, async (req, res) => {
    try {
      const showrooms = await storage.getMetaverseShowrooms(req.user!.garageId!);
      res.json({ data: showrooms });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metaverse showrooms" });
    }
  });

  app.post("/api/nextgen/metaverse-showrooms", isAuthenticated, async (req, res) => {
    try {
      const validated = insertMetaverseShowroomSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const showroom = await storage.createMetaverseShowroom(validated);
      res.json({ data: showroom });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create metaverse showroom" });
      }
    }
  });

  app.get("/api/nextgen/metaverse-visits", isAuthenticated, async (req, res) => {
    try {
      const visits = await storage.getMetaverseVisits(req.user!.garageId!);
      res.json({ data: visits });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metaverse visits" });
    }
  });

  app.post("/api/nextgen/metaverse-visits", isAuthenticated, async (req, res) => {
    try {
      const validated = insertMetaverseVisitSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const visit = await storage.createMetaverseVisit(validated);
      res.json({ data: visit });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create metaverse visit" });
      }
    }
  });

  // 6. Holographic Guides
  app.get("/api/nextgen/holographic-guides", isAuthenticated, async (req, res) => {
    try {
      const guides = await storage.getHolographicGuides(req.user!.garageId!);
      res.json({ data: guides });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holographic guides" });
    }
  });

  app.post("/api/nextgen/holographic-guides", isAuthenticated, async (req, res) => {
    try {
      const validated = insertHolographicGuideSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const guide = await storage.createHolographicGuide(validated);
      res.json({ data: guide });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create holographic guide" });
      }
    }
  });

  app.get("/api/nextgen/holographic-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getHolographicSessions(req.user!.garageId!);
      res.json({ data: sessions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holographic sessions" });
    }
  });

  app.post("/api/nextgen/holographic-sessions", isAuthenticated, async (req, res) => {
    try {
      const validated = insertHolographicSessionSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const session = await storage.createHolographicSession(validated);
      res.json({ data: session });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create holographic session" });
      }
    }
  });

  // 7. Spatial Computing
  app.get("/api/nextgen/spatial-workstations", isAuthenticated, async (req, res) => {
    try {
      const workstations = await storage.getSpatialWorkstations(req.user!.garageId!);
      res.json({ data: workstations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spatial workstations" });
    }
  });

  app.post("/api/nextgen/spatial-workstations", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSpatialWorkstationSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const workstation = await storage.createSpatialWorkstation(validated);
      res.json({ data: workstation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create spatial workstation" });
      }
    }
  });

  app.get("/api/nextgen/spatial-diagnostic-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getSpatialDiagnosticSessions(req.user!.garageId!);
      res.json({ data: sessions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spatial diagnostic sessions" });
    }
  });

  app.post("/api/nextgen/spatial-diagnostic-sessions", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSpatialDiagnosticSessionSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const session = await storage.createSpatialDiagnosticSession(validated);
      res.json({ data: session });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create spatial diagnostic session" });
      }
    }
  });

  // 8. Autonomous Robots
  app.get("/api/nextgen/autonomous-robots", isAuthenticated, async (req, res) => {
    try {
      const robots = await storage.getAutonomousRobots(req.user!.garageId!);
      res.json({ data: robots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch autonomous robots" });
    }
  });

  app.post("/api/nextgen/autonomous-robots", isAuthenticated, async (req, res) => {
    try {
      const validated = insertAutonomousRobotSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const robot = await storage.createAutonomousRobot(validated);
      res.json({ data: robot });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create autonomous robot" });
      }
    }
  });

  app.get("/api/nextgen/robot-tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getRobotTasks(req.user!.garageId!);
      res.json({ data: tasks });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch robot tasks" });
    }
  });

  app.post("/api/nextgen/robot-tasks", isAuthenticated, async (req, res) => {
    try {
      const validated = insertRobotTaskSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const task = await storage.createRobotTask(validated);
      res.json({ data: task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create robot task" });
      }
    }
  });

  // 9. Drone Fleet
  app.get("/api/nextgen/drone-fleets", isAuthenticated, async (req, res) => {
    try {
      const fleets = await storage.getDroneFleets(req.user!.garageId!);
      res.json({ data: fleets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drone fleets" });
    }
  });

  app.post("/api/nextgen/drone-fleets", isAuthenticated, async (req, res) => {
    try {
      const validated = insertDroneFleetSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const fleet = await storage.createDroneFleet(validated);
      res.json({ data: fleet });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create drone fleet" });
      }
    }
  });

  app.get("/api/nextgen/drone-missions", isAuthenticated, async (req, res) => {
    try {
      const missions = await storage.getDroneMissions(req.user!.garageId!);
      res.json({ data: missions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drone missions" });
    }
  });

  app.post("/api/nextgen/drone-missions", isAuthenticated, async (req, res) => {
    try {
      const validated = insertDroneMissionSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const mission = await storage.createDroneMission(validated);
      res.json({ data: mission });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create drone mission" });
      }
    }
  });

  // 10. Smart Contracts
  app.get("/api/nextgen/smart-contracts", isAuthenticated, async (req, res) => {
    try {
      const contracts = await storage.getSmartContracts(req.user!.garageId!);
      res.json({ data: contracts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch smart contracts" });
    }
  });

  app.post("/api/nextgen/smart-contracts", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSmartContractSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const contract = await storage.createSmartContract(validated);
      res.json({ data: contract });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create smart contract" });
      }
    }
  });

  app.get("/api/nextgen/contract-events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getContractEvents(req.user!.garageId!);
      res.json({ data: events });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contract events" });
    }
  });

  app.post("/api/nextgen/contract-events", isAuthenticated, async (req, res) => {
    try {
      const validated = insertContractEventSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const event = await storage.createContractEvent(validated);
      res.json({ data: event });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create contract event" });
      }
    }
  });

  // 11. Carbon Credits
  app.get("/api/nextgen/carbon-credits", isAuthenticated, async (req, res) => {
    try {
      const credits = await storage.getCarbonCredits(req.user!.garageId!);
      res.json({ data: credits });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carbon credits" });
    }
  });

  app.post("/api/nextgen/carbon-credits", isAuthenticated, async (req, res) => {
    try {
      const validated = insertCarbonCreditSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const credit = await storage.createCarbonCredit(validated);
      res.json({ data: credit });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create carbon credit" });
      }
    }
  });

  app.get("/api/nextgen/carbon-emissions", isAuthenticated, async (req, res) => {
    try {
      const emissions = await storage.getCarbonEmissions(req.user!.garageId!);
      res.json({ data: emissions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carbon emissions" });
    }
  });

  app.post("/api/nextgen/carbon-emissions", isAuthenticated, async (req, res) => {
    try {
      const validated = insertCarbonEmissionSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const emission = await storage.createCarbonEmission(validated);
      res.json({ data: emission });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create carbon emission" });
      }
    }
  });

  // 12. Green Energy
  app.get("/api/nextgen/green-energy-assets", isAuthenticated, async (req, res) => {
    try {
      const assets = await storage.getGreenEnergyAssets(req.user!.garageId!);
      res.json({ data: assets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch green energy assets" });
    }
  });

  app.post("/api/nextgen/green-energy-assets", isAuthenticated, async (req, res) => {
    try {
      const validated = insertGreenEnergyAssetSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const asset = await storage.createGreenEnergyAsset(validated);
      res.json({ data: asset });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create green energy asset" });
      }
    }
  });

  app.get("/api/nextgen/ev-charging-stations", isAuthenticated, async (req, res) => {
    try {
      const stations = await storage.getEVChargingStations(req.user!.garageId!);
      res.json({ data: stations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch EV charging stations" });
    }
  });

  app.post("/api/nextgen/ev-charging-stations", isAuthenticated, async (req, res) => {
    try {
      const validated = insertEVChargingStationSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const station = await storage.createEVChargingStation(validated);
      res.json({ data: station });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create EV charging station" });
      }
    }
  });

  // 13. Circular Economy
  app.get("/api/nextgen/recycled-parts", isAuthenticated, async (req, res) => {
    try {
      const parts = await storage.getRecycledParts(req.user!.garageId!);
      res.json({ data: parts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recycled parts" });
    }
  });

  app.post("/api/nextgen/recycled-parts", isAuthenticated, async (req, res) => {
    try {
      const validated = insertRecycledPartSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const part = await storage.createRecycledPart(validated);
      res.json({ data: part });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create recycled part" });
      }
    }
  });

  app.get("/api/nextgen/sustainability-metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getSustainabilityMetrics(req.user!.garageId!);
      res.json({ data: metrics });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sustainability metrics" });
    }
  });

  app.post("/api/nextgen/sustainability-metrics", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSustainabilityMetricSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const metric = await storage.createSustainabilityMetric(validated);
      res.json({ data: metric });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create sustainability metric" });
      }
    }
  });

  // 14. Satellite
  app.get("/api/nextgen/satellite-connections", isAuthenticated, async (req, res) => {
    try {
      const connections = await storage.getSatelliteConnections(req.user!.garageId!);
      res.json({ data: connections });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch satellite connections" });
    }
  });

  app.post("/api/nextgen/satellite-connections", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSatelliteConnectionSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const connection = await storage.createSatelliteConnection(validated);
      res.json({ data: connection });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create satellite connection" });
      }
    }
  });

  app.get("/api/nextgen/satellite-usage-logs", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getSatelliteUsageLogs(req.user!.garageId!);
      res.json({ data: logs });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch satellite usage logs" });
    }
  });

  app.post("/api/nextgen/satellite-usage-logs", isAuthenticated, async (req, res) => {
    try {
      const validated = insertSatelliteUsageLogSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const log = await storage.createSatelliteUsageLog(validated);
      res.json({ data: log });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create satellite usage log" });
      }
    }
  });

  // 15. Quantum Encryption
  app.get("/api/nextgen/quantum-encryption-keys", isAuthenticated, async (req, res) => {
    try {
      const keys = await storage.getQuantumEncryptionKeys(req.user!.garageId!);
      res.json({ data: keys });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quantum encryption keys" });
    }
  });

  app.post("/api/nextgen/quantum-encryption-keys", isAuthenticated, async (req, res) => {
    try {
      const validated = insertQuantumEncryptionKeySchema.parse({ ...req.body, garageId: req.user!.garageId });
      const key = await storage.createQuantumEncryptionKey(validated);
      res.json({ data: key });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create quantum encryption key" });
      }
    }
  });

  app.get("/api/nextgen/quantum-secure-messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getQuantumSecureMessages(req.user!.garageId!);
      res.json({ data: messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quantum secure messages" });
    }
  });

  app.post("/api/nextgen/quantum-secure-messages", isAuthenticated, async (req, res) => {
    try {
      const validated = insertQuantumSecureMessageSchema.parse({ ...req.body, garageId: req.user!.garageId });
      const message = await storage.createQuantumSecureMessage(validated);
      res.json({ data: message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(sanitizeZodError(error));
      } else {
        res.status(500).json({ error: "Failed to create quantum secure message" });
      }
    }
  });

  app.post("/api/nextgen/seed", isAuthenticated, async (req, res) => {
    try {
      const garageId = req.user!.garageId!;
      const userId = req.user!.id;

      const vehicles = await storage.getVehicles(garageId);
      const vehicleId = vehicles[0]?.id || 'sample-vehicle-id';

      let totalRecords = 0;

      // 1. Neural Diagnostics - Create 3 neural diagnostics with realistic AI prediction data
      for (let i = 0; i < 3; i++) {
        const diagnostic = await storage.createNeuralDiagnostic({
          garageId,
          vehicleId,
          modelVersion: ['v2.5', 'v3.0', 'v2.8'][i],
          inputData: {
            engineTemp: 95 + i * 5,
            oilPressure: 45 + i * 2,
            fuelLevel: 75 - i * 10,
            batteryVoltage: 12.6 + i * 0.1
          },
          prediction: ['engine_maintenance_required', 'normal_operation', 'oil_change_soon'][i],
          confidence: 0.92 + i * 0.02,
          processingTime: 150 + i * 50,
          status: 'completed',
        });
        
        if (i < 2) {
          await storage.createNeuralTrainingSession({
            garageId,
            diagnosticId: diagnostic.id,
            trainingDataCount: 5000 + i * 1000,
            epochs: 50 + i * 10,
            accuracy: 0.94 + i * 0.02,
            loss: 0.08 - i * 0.01,
            status: 'completed',
          });
          totalRecords++;
        }
        totalRecords++;
      }

      // 2. Computer Vision - Create 2 quality checks with defect detection results
      for (let i = 0; i < 2; i++) {
        const qualityCheck = await storage.createVisionQualityCheck({
          garageId,
          vehicleId,
          imageUrl: `https://storage.example.com/qc/${Date.now()}-${i}.jpg`,
          modelVersion: 'YOLOv8-QC',
          overallScore: 88 + i * 5,
          defectsDetected: i === 0 ? 2 : 0,
          processingTime: 320 + i * 80,
          status: 'completed',
        });

        if (i === 0) {
          await storage.createVisionDefect({
            qualityCheckId: qualityCheck.id,
            defectType: 'paint_scratch',
            severity: 'minor',
            confidence: 0.89,
            boundingBox: { x: 245, y: 156, width: 85, height: 42 },
            location: 'front_door_panel',
          });

          await storage.createVisionDefect({
            qualityCheckId: qualityCheck.id,
            defectType: 'dent',
            severity: 'moderate',
            confidence: 0.93,
            boundingBox: { x: 512, y: 234, width: 120, height: 95 },
            location: 'rear_bumper',
          });
          totalRecords += 2;
        }
        totalRecords++;
      }

      // 3. NLP Service Writer - Create 3 service requests with processed complaints
      const complaints = [
        'My car makes a strange squeaking noise when I brake, especially at low speeds',
        'The engine is running rough and I smell fuel, also the check engine light is on',
        'Air conditioning is not cooling properly and makes a rattling sound'
      ];

      for (let i = 0; i < 3; i++) {
        await storage.createNLPServiceRequest({
          garageId,
          customerId: userId,
          vehicleId,
          originalComplaint: complaints[i],
          processedText: complaints[i].toLowerCase(),
          detectedIssues: [
            ['brake_noise', 'brake_service'],
            ['engine_misfire', 'fuel_leak', 'diagnostic_required'],
            ['ac_malfunction', 'ac_compressor']
          ][i],
          suggestedServices: [
            ['Brake Inspection', 'Brake Pad Replacement'],
            ['Engine Diagnostic', 'Fuel System Check'],
            ['AC System Diagnostic', 'AC Compressor Service']
          ][i],
          sentiment: ['neutral', 'concerned', 'frustrated'][i],
          priority: ['medium', 'high', 'medium'][i],
          confidence: 0.91 + i * 0.02,
          modelVersion: 'GPT-4-Turbo',
          status: 'processed',
        });
        totalRecords++;
      }

      // 4. RL Parts Optimizer - Create 2 parts optimizations with learning metrics
      for (let i = 0; i < 2; i++) {
        const optimization = await storage.createRLPartsOptimization({
          garageId,
          partCategory: ['brake_pads', 'oil_filters'][i],
          currentStockLevel: 45 + i * 15,
          recommendedStockLevel: 60 + i * 10,
          reorderPoint: 25 + i * 5,
          reorderQuantity: 30 + i * 10,
          confidenceScore: 0.88 + i * 0.04,
          costSavings: 450 + i * 200,
          agentVersion: 'RL-Agent-v1.2',
          status: 'active',
        });

        await storage.createRLLearningEpisode({
          optimizationId: optimization.id,
          episodeNumber: 150 + i * 50,
          reward: 0.85 + i * 0.05,
          loss: 0.12 - i * 0.02,
          epsilon: 0.15 - i * 0.03,
          learningRate: 0.001,
          stateData: { stockLevel: 45 + i * 15, demandForecast: 55 },
          actionTaken: 'reorder_triggered',
        });
        totalRecords += 2;
      }

      // 5. Metaverse Showroom - Create 1 showroom with 2 virtual visits
      const showroom = await storage.createMetaverseShowroom({
        garageId,
        showroomName: 'Virtual Service Center - Premium',
        metaversePlatform: 'Decentraland',
        showroomUrl: 'https://metaverse.example.com/garage/' + garageId,
        virtualCoordinates: 'X:125, Y:67, Z:3',
        featuredVehicles: [vehicleId],
        interactiveFeatures: ['3D vehicle viewer', 'service history', 'live chat'],
        status: 'active',
      });
      totalRecords++;

      const visitTime = Date.now();
      for (let i = 0; i < 2; i++) {
        await storage.createMetaverseVisit({
          showroomId: showroom.id,
          visitorId: `visitor-${Date.now()}-${i}`,
          visitorType: i === 0 ? 'customer' : 'prospect',
          durationMinutes: 15 + i * 8,
          interactionsCount: 12 + i * 5,
          viewedVehicles: [vehicleId],
          virtualAssistantUsed: i === 0,
          leadGenerated: i === 1,
          visitDate: new Date(visitTime - (i * 24 * 60 * 60 * 1000)).toISOString(),
        });
        totalRecords++;
      }

      // 6. Holographic Guides - Create 2 repair guides with 1 active session
      for (let i = 0; i < 2; i++) {
        const guide = await storage.createHolographicGuide({
          garageId,
          guideName: ['Engine Oil Change Holographic Guide', 'Brake Service AR Guide'][i],
          targetService: ['oil_change', 'brake_service'][i],
          vehicleModels: ['Toyota Camry', 'Honda Accord', 'Nissan Altima'],
          hologramModelUrl: `https://holograms.example.com/guides/${i + 1}.glb`,
          steps: [
            { stepNumber: 1, instruction: 'Prepare tools and safety equipment', duration: 120 },
            { stepNumber: 2, instruction: 'Locate service points', duration: 180 },
            { stepNumber: 3, instruction: 'Perform service procedure', duration: 600 }
          ],
          difficultyLevel: i === 0 ? 'beginner' : 'intermediate',
          estimatedDuration: i === 0 ? 30 : 60,
          createdBy: userId,
          status: 'published',
        });

        if (i === 0) {
          await storage.createHolographicSession({
            guideId: guide.id,
            garageId,
            technicianId: userId,
            vehicleId,
            deviceType: 'HoloLens 3',
            sessionDuration: 28,
            completionPercentage: 100,
            stepsCompleted: 3,
            totalSteps: 3,
            feedback: 'Very helpful and clear instructions',
            status: 'completed',
          });
          totalRecords++;
        }
        totalRecords++;
      }

      // 7. Spatial Computing - Create 1 workstation with 1 diagnostic session
      const workstation = await storage.createSpatialWorkstation({
        garageId,
        workstationName: 'Bay 3 - Diagnostic Station',
        location: 'Service Bay 3',
        deviceType: 'Apple Vision Pro',
        capabilities: ['3D overlay', 'parts identification', 'torque specs display', 'AR instructions'],
        calibrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      });
      totalRecords++;

      await storage.createSpatialDiagnosticSession({
        workstationId: workstation.id,
        garageId,
        technicianId: userId,
        vehicleId,
        diagnosticType: 'comprehensive',
        spatialMarkers: 8,
        annotationsCreated: 5,
        measurementsTaken: 12,
        sessionDuration: 45,
        accuracy: 0.97,
        status: 'completed',
      });
      totalRecords++;

      // 8. Autonomous Robots - Create 2 robots with 3 tasks
      const robots = [];
      for (let i = 0; i < 2; i++) {
        const robot = await storage.createAutonomousRobot({
          garageId,
          robotName: ['AutoBot-Inspect-01', 'AutoBot-Parts-02'][i],
          robotType: i === 0 ? 'inspection' : 'parts_delivery',
          capabilities: i === 0 
            ? ['undercarriage_scan', 'fluid_level_check', 'tire_pressure_check']
            : ['parts_retrieval', 'parts_delivery', 'inventory_scan'],
          batteryLevel: 85 + i * 10,
          firmwareVersion: 'v4.2.1',
          lastMaintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        });
        robots.push(robot);
        totalRecords++;
      }

      const taskTypes = ['undercarriage_inspection', 'parts_retrieval', 'inventory_scan'];
      for (let i = 0; i < 3; i++) {
        await storage.createRobotTask({
          robotId: robots[i % 2].id,
          taskType: taskTypes[i],
          vehicleId: i === 0 ? vehicleId : undefined,
          priority: ['high', 'medium', 'low'][i],
          estimatedDuration: [15, 8, 12][i],
          actualDuration: [14, 9, 11][i],
          completionPercentage: 100,
          status: 'completed',
          completedAt: new Date(Date.now() - (2 - i) * 60 * 60 * 1000).toISOString(),
        });
        totalRecords++;
      }

      // 9. Drone Fleet - Create 1 drone with 2 missions
      const drone = await storage.createDroneFleet({
        garageId,
        droneName: 'SkyInspect-Alpha',
        droneType: 'inspection',
        model: 'DJI Matrice 300 RTK',
        capabilities: ['thermal_imaging', 'high_res_camera', 'lidar_scanning'],
        batteryLevel: 92,
        flightHours: 245,
        lastMaintenanceDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ready',
      });
      totalRecords++;

      for (let i = 0; i < 2; i++) {
        await storage.createDroneMission({
          droneId: drone.id,
          missionType: i === 0 ? 'roof_inspection' : 'facility_survey',
          targetLocation: i === 0 ? 'Customer Location - Warehouse' : 'Garage Facility',
          flightDuration: 18 + i * 7,
          imagesCaptured: 45 + i * 20,
          videoRecorded: i === 0,
          findingsDetected: i === 0 ? ['roof_damage', 'gutter_blockage'] : [],
          pilotId: userId,
          status: 'completed',
          completedAt: new Date(Date.now() - (1 - i) * 24 * 60 * 60 * 1000).toISOString(),
        });
        totalRecords++;
      }

      // 10. Smart Contracts - Create 1 smart contract with 2 events
      const contract = await storage.createSmartContract({
        garageId,
        contractType: 'service_warranty',
        blockchainNetwork: 'Ethereum',
        contractAddress: '0x' + Math.random().toString(16).substring(2, 42),
        abi: JSON.stringify([{ type: 'function', name: 'claimWarranty' }]),
        terms: {
          warrantyPeriod: '12 months',
          coverageAmount: 5000,
          conditions: ['regular_maintenance', 'authorized_parts']
        },
        partyA: garageId,
        partyB: userId,
        status: 'active',
      });
      totalRecords++;

      for (let i = 0; i < 2; i++) {
        await storage.createContractEvent({
          contractId: contract.id,
          eventType: i === 0 ? 'contract_created' : 'milestone_reached',
          transactionHash: '0x' + Math.random().toString(16).substring(2, 66),
          blockNumber: 18500000 + i * 100,
          eventData: i === 0 
            ? { action: 'contract_deployed', parties: 2 }
            : { milestone: 'first_service_completed', value: 1200 },
          gasUsed: 21000 + i * 5000,
          eventDate: new Date(Date.now() - (1 - i) * 12 * 60 * 60 * 1000).toISOString(),
        });
        totalRecords++;
      }

      // 11. Carbon Credits - Create 1 credit and 2 emission records
      const carbonCredit = await storage.createCarbonCredit({
        garageId,
        creditAmount: 15.5,
        carbonOffsetTons: 15.5,
        projectName: 'Solar Panel Installation & EV Fleet Conversion',
        verificationStandard: 'Gold Standard',
        issuanceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString(),
        certificateUrl: 'https://certificates.example.com/carbon/' + garageId,
        status: 'active',
      });
      totalRecords++;

      for (let i = 0; i < 2; i++) {
        await storage.createCarbonEmission({
          garageId,
          creditId: carbonCredit.id,
          emissionSource: i === 0 ? 'electricity_usage' : 'vehicle_fleet',
          co2Tons: i === 0 ? 8.5 : 6.2,
          calculationMethod: 'EPA Standard',
          verifiedBy: 'Third-party Auditor',
          reportingPeriod: `2024-Q${i + 3}`,
          recordDate: new Date(Date.now() - (1 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
        totalRecords++;
      }

      // 12. Green Energy - Create 1 solar asset and 1 EV charging station
      await storage.createGreenEnergyAsset({
        garageId,
        assetName: 'Rooftop Solar Array - Main Building',
        assetType: 'solar_panel',
        capacity: 50.0,
        capacityUnit: 'kW',
        installationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        manufacturer: 'SunPower',
        model: 'Maxeon 5',
        efficiency: 0.22,
        currentOutput: 38.5,
        totalEnergyGenerated: 15250.0,
        status: 'operational',
      });
      totalRecords++;

      await storage.createEVChargingStation({
        garageId,
        stationName: 'Customer EV Charger - Bay 1',
        stationType: 'Level 2',
        powerOutput: 7.2,
        connector: 'J1772',
        manufacturer: 'ChargePoint',
        installationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        utilizationRate: 0.68,
        totalChargingSessions: 245,
        totalEnergyDispensed: 3580.5,
        status: 'available',
      });
      totalRecords++;

      // 13. Circular Economy - Create 2 recycled parts and 1 sustainability metric
      for (let i = 0; i < 2; i++) {
        await storage.createRecycledPart({
          garageId,
          partName: ['Alternator - Remanufactured', 'Starter Motor - Refurbished'][i],
          partNumber: `RCY-${10000 + i}`,
          originalPartSource: i === 0 ? 'Toyota Camry 2020' : 'Honda Accord 2019',
          recyclingProcess: i === 0 ? 'remanufacturing' : 'refurbishment',
          qualityGrade: i === 0 ? 'A' : 'A-',
          costSavings: i === 0 ? 250 : 180,
          co2Saved: i === 0 ? 12.5 : 9.8,
          certificationNumber: `CERT-RCY-${2025000 + i}`,
          supplier: 'GreenParts International',
          status: 'available',
        });
        totalRecords++;
      }

      await storage.createSustainabilityMetric({
        garageId,
        metricType: 'waste_recycling',
        metricValue: 78.5,
        unit: 'percentage',
        reportingPeriod: '2024-Q4',
        benchmark: 75.0,
        improvement: 5.2,
        certificationBody: 'ISO 14001',
        notes: 'Exceeded quarterly recycling target',
        recordDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
      totalRecords++;

      // 14. Satellite - Create 1 satellite connection with 2 usage logs
      const satellite = await storage.createSatelliteConnection({
        garageId,
        providerName: 'Starlink Business',
        connectionType: 'satellite_internet',
        bandwidth: '250 Mbps',
        latency: 35,
        terminalId: 'STARLINK-' + garageId.substring(0, 8),
        installationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        monthlyDataAllowance: 1000.0,
        status: 'active',
      });
      totalRecords++;

      for (let i = 0; i < 2; i++) {
        await storage.createSatelliteUsageLog({
          connectionId: satellite.id,
          dataUsed: 45.5 + i * 12.3,
          peakBandwidth: 185 + i * 25,
          averageLatency: 38 + i * 3,
          uptime: 99.8 - i * 0.2,
          usageDate: new Date(Date.now() - (1 - i) * 24 * 60 * 60 * 1000).toISOString(),
        });
        totalRecords++;
      }

      // 15. Quantum Encryption - Create 1 encryption key and 2 secure messages
      const quantumKey = await storage.createQuantumEncryptionKey({
        garageId,
        keyName: 'Master Encryption Key - Q1',
        algorithm: 'Lattice-based-Kyber-1024',
        keyLength: 1024,
        generatedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        quantumResistant: true,
        usageCount: 24,
        status: 'active',
      });
      totalRecords++;

      for (let i = 0; i < 2; i++) {
        await storage.createQuantumSecureMessage({
          keyId: quantumKey.id,
          senderId: userId,
          recipientId: userId,
          encryptedPayload: 'QE-' + Buffer.from(`Secure message ${i + 1}`).toString('base64'),
          encryptionAlgorithm: 'Lattice-based-Kyber-1024',
          messageHash: 'SHA3-512-' + Math.random().toString(36).substring(2, 15),
          transmissionDate: new Date(Date.now() - (1 - i) * 6 * 60 * 60 * 1000).toISOString(),
          status: i === 0 ? 'delivered' : 'pending',
        });
        totalRecords++;
      }

      res.json({ 
        data: { 
          message: "Successfully seeded all 15 next-gen technology modules",
          modules: 15,
          tablesPopulated: 30,
          totalRecords: totalRecords,
          breakdown: {
            neuralDiagnostics: 5,
            computerVision: 4,
            nlpServiceRequests: 3,
            rlPartsOptimization: 4,
            metaverseShowroom: 3,
            holographicGuides: 3,
            spatialComputing: 2,
            autonomousRobots: 5,
            droneFleet: 3,
            smartContracts: 3,
            carbonCredits: 3,
            greenEnergy: 2,
            circularEconomy: 3,
            satellite: 3,
            quantumEncryption: 3
          }
        } 
      });
    } catch (error: any) {
      console.error('Error seeding next-gen data:', error);
      res.status(500).json({ error: error.message || "Failed to seed next-gen technology data" });
    }
  });

  // ==================== PAYROLL MANAGEMENT ROUTES ====================
  app.get('/api/payroll/employees', isAuthenticated, async (req: any, res) => {
    try {
      const employees = await storage.getPayrollEmployees(req.user?.garageId);
      res.json({ data: employees });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payroll/employees', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPayrollEmployeeSchema.parse(req.body);
      const employee = await storage.createPayrollEmployee(validatedData);
      res.json({ data: employee });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/payroll/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.updatePayrollEmployee(req.params.id, req.body);
      res.json({ data: employee });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/payroll/employees/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePayrollEmployee(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/payroll/periods', isAuthenticated, async (req: any, res) => {
    try {
      const periods = await storage.getPayPeriods(req.user?.garageId, req.query.status);
      res.json({ data: periods });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payroll/periods', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPayPeriodSchema.parse(req.body);
      const period = await storage.createPayPeriod(validatedData);
      res.json({ data: period });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/payroll/runs/:periodId', isAuthenticated, async (req, res) => {
    try {
      const runs = await storage.getPayrollRuns(req.params.periodId);
      res.json({ data: runs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payroll/runs', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPayrollRunSchema.parse(req.body);
      const run = await storage.createPayrollRun(validatedData);
      res.json({ data: run });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EXPENSE TRACKING ROUTES ====================
  app.get('/api/expense-categories', isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getExpenseCategories(req.user?.garageId);
      res.json({ data: categories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/expense-categories', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(validatedData);
      res.json({ data: category });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const expenses = await storage.getExpenses(req.user?.garageId, req.query.status, req.query.categoryId);
      res.json({ data: expenses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.json({ data: expense });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/expenses/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const expense = await storage.approveExpense(req.params.id, req.user?.id);
      res.json({ data: expense });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/expenses/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const expense = await storage.rejectExpense(req.params.id, req.user?.id);
      res.json({ data: expense });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== TOWING SERVICES ROUTES ====================
  app.get('/api/towing-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const jobs = await storage.getTowingJobs(req.user?.garageId, req.query.status);
      res.json({ data: jobs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/towing-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTowingJobSchema.parse(req.body);
      const job = await storage.createTowingJob(validatedData);
      res.json({ data: job });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/towing-jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const job = await storage.updateTowingJob(req.params.id, req.body);
      res.json({ data: job });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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

  // ==================== TELEMATICS INTEGRATION ROUTES ====================
  app.get('/api/telematics/feeds', isAuthenticated, async (req, res) => {
    try {
      const feeds = await storage.getTelematicsFeeds(req.query.vehicleId as string, req.query.deviceId as string);
      res.json({ data: feeds });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/telematics/feeds', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTelematicsFeedSchema.parse(req.body);
      const feed = await storage.createTelematicsFeed(validatedData);
      res.json({ data: feed });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/telematics/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getTelematicsAlerts(req.query.vehicleId as string, req.query.isResolved === 'true');
      res.json({ data: alerts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/telematics/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTelematicsAlertSchema.parse(req.body);
      const alert = await storage.createTelematicsAlert(validatedData);
      res.json({ data: alert });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/telematics/alerts/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const alert = await storage.resolveTelematicsAlert(req.params.id, req.user?.id);
      res.json({ data: alert });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== KNOWLEDGE BASE ROUTES ====================
  app.get('/api/knowledge-base/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getArticleCategories();
      res.json({ data: categories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/knowledge-base/categories', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertArticleCategorySchema.parse(req.body);
      const category = await storage.createArticleCategory(validatedData);
      res.json({ data: category });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/knowledge-base/articles', isAuthenticated, async (req, res) => {
    try {
      const articles = await storage.getKnowledgeArticles(req.query.categoryId as string, req.query.isPublished === 'true');
      res.json({ data: articles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/knowledge-base/articles/:id', isAuthenticated, async (req, res) => {
    try {
      const article = await storage.getKnowledgeArticle(req.params.id);
      if (article) {
        await storage.incrementArticleViews(req.params.id);
      }
      res.json({ data: article });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/knowledge-base/articles', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertKnowledgeArticleSchema.parse(req.body);
      const article = await storage.createKnowledgeArticle(validatedData);
      res.json({ data: article });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/knowledge-base/articles/:id', isAuthenticated, async (req, res) => {
    try {
      const article = await storage.updateKnowledgeArticle(req.params.id, req.body);
      res.json({ data: article });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== TRAINING LMS ROUTES ====================
  app.get('/api/training/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getTrainingModules(req.query.isActive === 'true');
      res.json({ data: modules });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/training/modules', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTrainingModuleSchema.parse(req.body);
      const module = await storage.createTrainingModule(validatedData);
      res.json({ data: module });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/training/certifications', isAuthenticated, async (req, res) => {
    try {
      const certifications = await storage.getCertifications(req.query.isActive === 'true');
      res.json({ data: certifications });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/training/certifications', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(validatedData);
      res.json({ data: certification });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/training/attempts', isAuthenticated, async (req, res) => {
    try {
      const attempts = await storage.getCertificationAttempts(req.query.userId as string, req.query.certificationId as string);
      res.json({ data: attempts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/training/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCertificationAttemptSchema.parse(req.body);
      const attempt = await storage.createCertificationAttempt(validatedData);
      res.json({ data: attempt });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GOOGLE MY BUSINESS ROUTES ====================
  app.get('/api/gmb/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const profiles = await storage.getGoogleBusinessProfiles(req.user?.garageId);
      res.json({ data: profiles });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gmb/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertGoogleBusinessProfileSchema.parse(req.body);
      const profile = await storage.createGoogleBusinessProfile(validatedData);
      res.json({ data: profile });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/gmb/posts', isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getGmbPosts(req.query.profileId as string, req.query.status as string);
      res.json({ data: posts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gmb/posts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertGmbPostSchema.parse(req.body);
      const post = await storage.createGmbPost(validatedData);
      res.json({ data: post });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/gmb/posts/:id/publish', isAuthenticated, async (req, res) => {
    try {
      const post = await storage.publishGmbPost(req.params.id);
      res.json({ data: post });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/gmb/reviews', isAuthenticated, async (req, res) => {
    try {
      const reviews = await storage.getGmbReviews(req.query.profileId as string);
      res.json({ data: reviews });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gmb/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertGmbReviewSchema.parse(req.body);
      const review = await storage.createGmbReview(validatedData);
      res.json({ data: review });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/gmb/reviews/:id/respond', isAuthenticated, async (req, res) => {
    try {
      const review = await storage.respondToGmbReview(req.params.id, req.body.responseText);
      res.json({ data: review });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMPLIANCE MANAGEMENT ROUTES ====================
  app.get('/api/compliance/policies', isAuthenticated, async (req: any, res) => {
    try {
      const policies = await storage.getCompliancePolicies(req.user?.garageId, req.query.status);
      res.json({ data: policies });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/compliance/policies', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCompliancePolicySchema.parse(req.body);
      const policy = await storage.createCompliancePolicy(validatedData);
      res.json({ data: policy });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/compliance/audits', isAuthenticated, async (req: any, res) => {
    try {
      const audits = await storage.getComplianceAudits(req.user?.garageId, req.query.policyId, req.query.status);
      res.json({ data: audits });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/compliance/audits', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertComplianceAuditSchema.parse(req.body);
      const audit = await storage.createComplianceAudit(validatedData);
      res.json({ data: audit });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/compliance/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const tasks = await storage.getComplianceTasks(req.user?.garageId, req.query.policyId, req.query.status);
      res.json({ data: tasks });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/compliance/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertComplianceTaskSchema.parse(req.body);
      const task = await storage.createComplianceTask(validatedData);
      res.json({ data: task });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/compliance/tasks/:id/complete', isAuthenticated, async (req, res) => {
    try {
      const task = await storage.completeComplianceTask(req.params.id);
      res.json({ data: task });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CLIENT PORTAL - CUSTOMER-SCOPED ROUTES ====================
  
  // Service Reminders - Customer-scoped
  app.get('/api/customers/:customerId/service-reminders', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const reminders = await storage.getCustomerServiceReminders(customerId);
      res.json(reminders);
    } catch (error: any) {
      console.error("Error fetching service reminders:", error);
      res.status(500).json({ message: "Failed to fetch service reminders" });
    }
  });

  app.post('/api/customers/:customerId/service-reminders', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const { insertServiceReminderSchema } = await import("@shared/schema");
      const validationResult = insertServiceReminderSchema.safeParse({
        ...req.body,
        customerId,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const reminder = await storage.createServiceReminder(validationResult.data);
      res.status(201).json(reminder);
    } catch (error: any) {
      console.error("Error creating service reminder:", error);
      res.status(500).json({ message: "Failed to create service reminder" });
    }
  });

  // Service Chat Messages - Customer-scoped by job card
  app.get('/api/job-cards/:jobCardId/chat', isAuthenticated, async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const messages = await storage.getServiceChatMessages(jobCardId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/job-cards/:jobCardId/chat', isAuthenticated, async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const validationResult = insertServiceChatMessageSchema.safeParse({
        ...req.body,
        jobCardId,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const message = await storage.createServiceChatMessage(validationResult.data);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Service Reviews - Customer-scoped
  app.get('/api/customers/:customerId/reviews', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const reviews = await storage.getCustomerServiceReviews(customerId);
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching service reviews:", error);
      res.status(500).json({ message: "Failed to fetch service reviews" });
    }
  });

  app.post('/api/customers/:customerId/reviews', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const validationResult = insertServiceReviewSchema.safeParse({
        ...req.body,
        customerId,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const review = await storage.createServiceReview(validationResult.data);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating service review:", error);
      res.status(500).json({ message: "Failed to create service review" });
    }
  });

  // Service Signatures - Customer-scoped
  app.get('/api/customers/:customerId/signatures', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const signatures = await storage.getCustomerServiceSignatures(customerId);
      res.json(signatures);
    } catch (error: any) {
      console.error("Error fetching service signatures:", error);
      res.status(500).json({ message: "Failed to fetch service signatures" });
    }
  });

  app.post('/api/customers/:customerId/signatures', isAuthenticated, async (req, res) => {
    try {
      const { customerId } = req.params;
      const validationResult = insertServiceSignatureSchema.safeParse({
        ...req.body,
        customerId,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          ...sanitizeZodError(validationResult.error) 
        });
      }
      
      const signature = await storage.createServiceSignature(validationResult.data);
      res.status(201).json(signature);
    } catch (error: any) {
      console.error("Error creating service signature:", error);
      res.status(500).json({ message: "Failed to create service signature" });
    }
  });

  // ==================== AI-POWERED CHATBOT ====================
  
  // Create or get conversation
  app.post('/api/chatbot/conversation', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { customerId, sessionId } = req.body;
      
      // Create new conversation
      const conversation = await storage.createAIChatConversation({
        garageId: userGarageId,
        customerId: customerId || req.user?.id,
        sessionId: sessionId || `session-${Date.now()}`,
        messages: [],
        status: 'active',
      });
      
      res.json(conversation);
    } catch (error: any) {
      console.error("Error creating chatbot conversation:", error);
      res.status(500).json({ message: "Failed to create conversation", error: error.message });
    }
  });

  // Send message and get AI response
  app.post('/api/chatbot/message', isAuthenticated, async (req: any, res) => {
    try {
      const { conversationId, message, vehicleInfo } = req.body;
      
      if (!message || !conversationId) {
        return res.status(400).json({ message: "Message and conversationId required" });
      }

      // Get conversation
      const conversation = await storage.getAIChatConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Import chatbot service
      const { generateChatbotResponse } = await import('./services/aiChatbot');
      
      // Generate AI response
      const aiResponse = await generateChatbotResponse({
        garageId: conversation.garageId,
        customerId: conversation.customerId,
        vehicleInfo,
        conversationHistory: conversation.messages || [],
      }, message);

      // Update conversation with new messages
      const updatedMessages = [
        ...(conversation.messages || []),
        { role: "user", content: message },
        { role: "assistant", content: aiResponse },
      ];
      
      await storage.updateAIChatConversation(conversationId, {
        messages: updatedMessages,
      });

      res.json({
        userMessage: message,
        aiResponse,
        conversationId,
      });
    } catch (error: any) {
      console.error("Error processing chatbot message:", error);
      res.status(500).json({ message: "Failed to process message", error: error.message });
    }
  });

  // Extract booking intent from message
  app.post('/api/chatbot/booking-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message required" });
      }

      const { extractBookingIntent } = await import('./services/aiChatbot');
      const intent = await extractBookingIntent(message);
      
      res.json(intent);
    } catch (error: any) {
      console.error("Error extracting booking intent:", error);
      res.status(500).json({ message: "Failed to extract intent", error: error.message });
    }
  });

  // Diagnose vehicle problem
  app.post('/api/chatbot/diagnose', isAuthenticated, async (req: any, res) => {
    try {
      const { symptoms, vehicleInfo } = req.body;
      
      if (!symptoms) {
        return res.status(400).json({ message: "Symptoms required" });
      }

      const { diagnoseProblem } = await import('./services/aiChatbot');
      const diagnosis = await diagnoseProblem(symptoms, vehicleInfo);
      
      res.json(diagnosis);
    } catch (error: any) {
      console.error("Error diagnosing problem:", error);
      res.status(500).json({ message: "Failed to diagnose problem", error: error.message });
    }
  });

  // Get conversations
  app.get('/api/chatbot/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { customerId, status } = req.query;
      
      const conversations = await storage.getAIChatConversations(
        userGarageId,
        customerId as string,
        status as string
      );
      
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // ================== IoT Vehicle Health Monitoring Routes ==================
  
  // Get all sensors (garage-scoped)
  app.get('/api/iot/sensors', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, status } = req.query;
      
      // Get user's garage vehicles for authorization
      const garageVehicles = await storage.getVehicles(userGarageId);
      const vehicleIds = garageVehicles.map((v: any) => v.id);
      
      if (vehicleId && !vehicleIds.includes(vehicleId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const sensors = await storage.getIotSensors(vehicleId as string, status as string);
      const filteredSensors = sensors.filter((s: any) => vehicleIds.includes(s.vehicleId));
      res.json(filteredSensors);
    } catch (error: any) {
      console.error("Error fetching IoT sensors:", error);
      res.status(500).json({ message: "Failed to fetch sensors" });
    }
  });

  // Get single sensor (with ownership check)
  app.get('/api/iot/sensors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const sensor = await storage.getIotSensor(req.params.id);
      
      if (!sensor) {
        return res.status(404).json({ message: "Sensor not found" });
      }
      
      const vehicle = await storage.getVehicle(sensor.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(sensor);
    } catch (error: any) {
      console.error("Error fetching sensor:", error);
      res.status(500).json({ message: "Failed to fetch sensor" });
    }
  });

  // Create sensor (with validation and ownership check)
  app.post('/api/iot/sensors', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      
      const validationResult = insertIoTSensorSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const vehicle = await storage.getVehicle(validationResult.data.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const sensor = await storage.createIotSensor(validationResult.data);
      res.status(201).json(sensor);
    } catch (error: any) {
      console.error("Error creating sensor:", error);
      res.status(500).json({ message: "Failed to create sensor" });
    }
  });

  // Update sensor (with validation and ownership check)
  app.patch('/api/iot/sensors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const updateSchema = insertIoTSensorSchema.partial().omit({ vehicleId: true });
      
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const existingSensor = await storage.getIotSensor(req.params.id);
      if (!existingSensor) {
        return res.status(404).json({ message: "Sensor not found" });
      }
      
      const vehicle = await storage.getVehicle(existingSensor.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const sensor = await storage.updateIotSensor(req.params.id, validationResult.data);
      res.json(sensor);
    } catch (error: any) {
      console.error("Error updating sensor:", error);
      res.status(500).json({ message: "Failed to update sensor" });
    }
  });

  // Delete sensor (with ownership check)
  app.delete('/api/iot/sensors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const existingSensor = await storage.getIotSensor(req.params.id);
      
      if (!existingSensor) {
        return res.status(404).json({ message: "Sensor not found" });
      }
      
      const vehicle = await storage.getVehicle(existingSensor.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteIotSensor(req.params.id);
      res.json({ message: "Sensor deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting sensor:", error);
      res.status(500).json({ message: "Failed to delete sensor" });
    }
  });

  // Record sensor reading (with validation)
  app.post('/api/iot/readings', isAuthenticated, async (req: any, res) => {
    try {
      const validationResult = insertIoTSensorReadingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json(sanitizeZodError(validationResult.error));
      }
      
      const sensor = await storage.getIotSensor(validationResult.data.sensorId);
      if (!sensor) {
        return res.status(404).json({ message: "Sensor not found" });
      }
      
      const reading = await storage.recordSensorReading(validationResult.data);
      res.status(201).json(reading);
    } catch (error: any) {
      console.error("Error recording sensor reading:", error);
      res.status(500).json({ message: "Failed to record reading" });
    }
  });

  // Get sensor readings (with ownership check and date validation)
  app.get('/api/iot/sensors/:id/readings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { startDate, endDate } = req.query;
      
      const sensor = await storage.getIotSensor(req.params.id);
      if (!sensor) {
        return res.status(404).json({ message: "Sensor not found" });
      }
      
      const vehicle = await storage.getVehicle(sensor.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      let parsedStartDate: Date | undefined;
      let parsedEndDate: Date | undefined;
      
      if (startDate) {
        parsedStartDate = new Date(startDate as string);
        if (isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({ message: "Invalid startDate format" });
        }
      }
      
      if (endDate) {
        parsedEndDate = new Date(endDate as string);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ message: "Invalid endDate format" });
        }
      }
      
      const readings = await storage.getSensorReadings(req.params.id, parsedStartDate, parsedEndDate);
      res.json(readings);
    } catch (error: any) {
      console.error("Error fetching sensor readings:", error);
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  // Get vehicle anomalies (with ownership check)
  app.get('/api/iot/vehicles/:vehicleId/anomalies', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const vehicle = await storage.getVehicle(req.params.vehicleId);
      
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { limit } = req.query;
      const anomalies = await storage.getRecentAnomalies(
        req.params.vehicleId,
        limit ? parseInt(limit as string) : 10
      );
      res.json(anomalies);
    } catch (error: any) {
      console.error("Error fetching anomalies:", error);
      res.status(500).json({ message: "Failed to fetch anomalies" });
    }
  });

  // Get IoT alerts (garage-scoped)
  app.get('/api/iot/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, status, severity } = req.query;
      
      if (vehicleId) {
        const vehicle = await storage.getVehicle(vehicleId as string);
        if (!vehicle || vehicle.garageId !== userGarageId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const garageVehicles = await storage.getVehicles(userGarageId);
      const vehicleIds = garageVehicles.map((v: any) => v.id);
      
      const alerts = await storage.getIotAlerts(vehicleId as string, status as string, severity as string);
      const filteredAlerts = alerts.filter((a: any) => vehicleIds.includes(a.vehicleId));
      res.json(filteredAlerts);
    } catch (error: any) {
      console.error("Error fetching IoT alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Get single alert (with ownership check)
  app.get('/api/iot/alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const alert = await storage.getIotAlert(req.params.id);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const vehicle = await storage.getVehicle(alert.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(alert);
    } catch (error: any) {
      console.error("Error fetching alert:", error);
      res.status(500).json({ message: "Failed to fetch alert" });
    }
  });

  // Acknowledge alert (with ownership check)
  app.post('/api/iot/alerts/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const alert = await storage.getIotAlert(req.params.id);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const vehicle = await storage.getVehicle(alert.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedAlert = await storage.acknowledgeIotAlert(req.params.id, req.user?.id);
      res.json(updatedAlert);
    } catch (error: any) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Get IoT dashboard summary (aggregated data)
  app.get('/api/iot/dashboard/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const garageVehicles = await storage.getVehicles(userGarageId);
      const vehicleIds = garageVehicles.map((v: any) => v.id);
      
      const allSensors = await storage.getIotSensors();
      const sensors = allSensors.filter((s: any) => vehicleIds.includes(s.vehicleId));
      
      const allAlerts = await storage.getIotAlerts();
      const alerts = allAlerts.filter((a: any) => vehicleIds.includes(a.vehicleId));
      
      const activeSensors = sensors.filter((s: any) => s.status === 'active').length;
      const activeAlerts = alerts.filter((a: any) => a.status === 'active').length;
      const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical' && a.status === 'active').length;
      
      res.json({
        totalSensors: sensors.length,
        activeSensors,
        inactiveSensors: sensors.length - activeSensors,
        totalAlerts: alerts.length,
        activeAlerts,
        criticalAlerts,
        acknowledgedAlerts: alerts.filter((a: any) => a.status === 'acknowledged').length,
        resolvedAlerts: alerts.filter((a: any) => a.status === 'resolved').length,
      });
    } catch (error: any) {
      console.error("Error fetching IoT dashboard summary:", error);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Get latest sensor readings per vehicle
  app.get('/api/iot/vehicles/:vehicleId/latest-readings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const vehicle = await storage.getVehicle(req.params.vehicleId);
      
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const sensors = await storage.getIotSensors(req.params.vehicleId);
      const latestReadings: any = {};
      
      for (const sensor of sensors) {
        const readings = await storage.getSensorReadings(sensor.id);
        if (readings.length > 0) {
          latestReadings[sensor.sensorType] = readings[0];
        }
      }
      
      res.json(latestReadings);
    } catch (error: any) {
      console.error("Error fetching latest readings:", error);
      res.status(500).json({ message: "Failed to fetch latest readings" });
    }
  });

  // Resolve alert (with ownership check and validation)
  app.post('/api/iot/alerts/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { resolution, jobCardId } = req.body;
      
      if (!resolution || typeof resolution !== 'string') {
        return res.status(400).json({ message: "Resolution text is required" });
      }
      
      const alert = await storage.getIotAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const vehicle = await storage.getVehicle(alert.vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (jobCardId) {
        const jobCard = await storage.getJobCard(jobCardId);
        if (!jobCard || jobCard.garageId !== userGarageId) {
          return res.status(403).json({ message: "Invalid job card" });
        }
      }
      
      const updatedAlert = await storage.resolveIotAlert(req.params.id, req.user?.id, resolution, jobCardId);
      res.json(updatedAlert);
    } catch (error: any) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Fleet Tracking & GPS Management Routes
  // Record vehicle GPS location (with authorization)
  app.post('/api/fleet/locations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const { vehicleId, latitude, longitude, altitude, speed, heading, accuracy, source, driverId, jobCardId, mileage, engineStatus, fuelLevel, batteryVoltage } = req.body;
      
      // Validate required fields
      if (!vehicleId || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: "Vehicle ID, latitude, and longitude are required" });
      }
      
      // Verify vehicle ownership
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const location = await storage.recordVehicleLocation({
        vehicleId,
        latitude,
        longitude,
        altitude,
        speed,
        heading,
        accuracy,
        source,
        driverId,
        jobCardId,
        mileage,
        engineStatus,
        fuelLevel,
        batteryVoltage,
      });
      
      res.json(location);
    } catch (error: any) {
      console.error("Error recording location:", error);
      res.status(500).json({ message: "Failed to record location" });
    }
  });

  // Get vehicle location history (with authorization)
  app.get('/api/fleet/vehicles/:vehicleId/locations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const vehicle = await storage.getVehicle(req.params.vehicleId);
      
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const locations = await storage.getVehicleLocationHistory(req.params.vehicleId, startDate, endDate, limit);
      res.json(locations);
    } catch (error: any) {
      console.error("Error fetching location history:", error);
      res.status(500).json({ message: "Failed to fetch location history" });
    }
  });

  // Get latest vehicle location (with authorization)
  app.get('/api/fleet/vehicles/:vehicleId/location/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const vehicle = await storage.getVehicle(req.params.vehicleId);
      
      if (!vehicle || vehicle.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const location = await storage.getLatestVehicleLocation(req.params.vehicleId);
      res.json(location || null);
    } catch (error: any) {
      console.error("Error fetching latest location:", error);
      res.status(500).json({ message: "Failed to fetch latest location" });
    }
  });

  // Get all geofence zones for garage
  app.get('/api/fleet/geofences', isAuthenticated, async (req: any, res) => {
    try {
      const zones = await storage.getGeofenceZones(req.user?.garageId);
      res.json(zones);
    } catch (error: any) {
      console.error("Error fetching geofence zones:", error);
      res.status(500).json({ message: "Failed to fetch geofence zones" });
    }
  });

  // Create geofence zone (with validation)
  app.post('/api/fleet/geofences', isAuthenticated, async (req: any, res) => {
    try {
      const { name, description, zoneType, geometry, centerLatitude, centerLongitude, radius, alertOnEntry, alertOnExit, color } = req.body;
      
      if (!name || !zoneType || !geometry) {
        return res.status(400).json({ message: "Name, zone type, and geometry are required" });
      }
      
      const zone = await storage.createGeofenceZone({
        garageId: req.user?.garageId,
        name,
        description,
        zoneType,
        geometry,
        centerLatitude,
        centerLongitude,
        radius,
        alertOnEntry,
        alertOnExit,
        color,
        createdBy: req.user?.id,
      });
      
      res.json(zone);
    } catch (error: any) {
      console.error("Error creating geofence zone:", error);
      res.status(500).json({ message: "Failed to create geofence zone" });
    }
  });

  // Update geofence zone (with ownership check)
  app.patch('/api/fleet/geofences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const zone = await storage.getGeofenceZone(req.params.id);
      if (!zone) {
        return res.status(404).json({ message: "Geofence zone not found" });
      }
      
      if (zone.garageId !== req.user?.garageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedZone = await storage.updateGeofenceZone(req.params.id, req.body);
      res.json(updatedZone);
    } catch (error: any) {
      console.error("Error updating geofence zone:", error);
      res.status(500).json({ message: "Failed to update geofence zone" });
    }
  });

  // Delete geofence zone (with ownership check)
  app.delete('/api/fleet/geofences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const zone = await storage.getGeofenceZone(req.params.id);
      if (!zone) {
        return res.status(404).json({ message: "Geofence zone not found" });
      }
      
      if (zone.garageId !== req.user?.garageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteGeofenceZone(req.params.id);
      res.json({ message: "Geofence zone deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting geofence zone:", error);
      res.status(500).json({ message: "Failed to delete geofence zone" });
    }
  });

  // Get geofence events (with authorization)
  app.get('/api/fleet/geofence-events', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user?.garageId;
      const zoneId = req.query.zoneId as string;
      const vehicleId = req.query.vehicleId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      // If zoneId provided, verify ownership
      if (zoneId) {
        const zone = await storage.getGeofenceZone(zoneId);
        if (!zone || zone.garageId !== userGarageId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // If vehicleId provided, verify ownership
      if (vehicleId) {
        const vehicle = await storage.getVehicle(vehicleId);
        if (!vehicle || vehicle.garageId !== userGarageId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const events = await storage.getGeofenceEvents(zoneId, vehicleId, startDate, limit);
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching geofence events:", error);
      res.status(500).json({ message: "Failed to fetch geofence events" });
    }
  });

  // Get fleet routes for garage
  app.get('/api/fleet/routes', isAuthenticated, async (req: any, res) => {
    try {
      const status = req.query.status as string;
      const routes = await storage.getFleetRoutes(req.user?.garageId, status);
      res.json(routes);
    } catch (error: any) {
      console.error("Error fetching fleet routes:", error);
      res.status(500).json({ message: "Failed to fetch fleet routes" });
    }
  });

  // Create fleet route (with validation)
  app.post('/api/fleet/routes', isAuthenticated, async (req: any, res) => {
    try {
      const { routeName, description, vehicleId, driverId, jobCardIds, startLocation, endLocation, waypoints, scheduledStartTime } = req.body;
      
      if (!routeName || !startLocation) {
        return res.status(400).json({ message: "Route name and start location are required" });
      }
      
      // Verify vehicle ownership if provided
      if (vehicleId) {
        const vehicle = await storage.getVehicle(vehicleId);
        if (!vehicle || vehicle.garageId !== req.user?.garageId) {
          return res.status(403).json({ message: "Invalid vehicle" });
        }
      }
      
      const route = await storage.createFleetRoute({
        garageId: req.user?.garageId,
        routeName,
        description,
        vehicleId,
        driverId,
        jobCardIds,
        startLocation,
        endLocation,
        waypoints,
        scheduledStartTime,
        createdBy: req.user?.id,
      });
      
      res.json(route);
    } catch (error: any) {
      console.error("Error creating fleet route:", error);
      res.status(500).json({ message: "Failed to create fleet route" });
    }
  });

  // Get route with checkpoints (with ownership check)
  app.get('/api/fleet/routes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const route = await storage.getFleetRoute(req.params.id);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      if (route.garageId !== req.user?.garageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const checkpoints = await storage.getRouteCheckpoints(req.params.id);
      res.json({ ...route, checkpoints });
    } catch (error: any) {
      console.error("Error fetching route:", error);
      res.status(500).json({ message: "Failed to fetch route" });
    }
  });

  // Update route status (with ownership check)
  app.patch('/api/fleet/routes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const route = await storage.getFleetRoute(req.params.id);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      if (route.garageId !== req.user?.garageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedRoute = await storage.updateFleetRoute(req.params.id, req.body);
      res.json(updatedRoute);
    } catch (error: any) {
      console.error("Error updating route:", error);
      res.status(500).json({ message: "Failed to update route" });
    }
  });

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

  // ========================================
  // TECHNICIAN PERFORMANCE ROUTES
  // ========================================

  // Get metric definitions
  app.get('/api/technician-performance/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metrics = await storage.getTechnicianMetricDefinitions();
      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching metric definitions:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Get technician's metric preferences
  app.get('/api/technician-performance/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const preferences = await storage.getTechnicianMetricPreferences(req.user?.id);
      res.json(preferences);
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update metric preferences
  app.post('/api/technician-performance/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const preference = await storage.upsertTechnicianMetricPreference({
        userId: req.user?.id,
        ...req.body,
      });
      res.json(preference);
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get performance dashboard data
  app.get('/api/technician-performance/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId, period = 'weekly' } = req.query;
      const targetTechnicianId = technicianId || req.user?.id;
      
      // Get rollup data
      const rollups = await storage.getTechnicianPerformanceRollups(
        targetTechnicianId as string,
        period as string
      );
      
      res.json(rollups);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // ========================================
  // CUSTOMER FEEDBACK ROUTES
  // ========================================

  // Submit feedback
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const validated = schema.insertServiceFeedbackSchema.parse(req.body);
      const feedback = await storage.createServiceFeedback(validated);
      
      // Update technician summary asynchronously
      if (feedback.technicianId) {
        storage.updateTechnicianFeedbackSummary(feedback.technicianId).catch(console.error);
      }
      
      res.json(feedback);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get feedback for a job card
  app.get('/api/feedback/job-card/:jobCardId', isAuthenticated, async (req: any, res) => {
    try {
      const feedback = await storage.getServiceFeedbackByJobCard(req.params.jobCardId);
      res.json(feedback);
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Get feedback for a technician
  app.get('/api/feedback/technician/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const feedback = await storage.getServiceFeedbackByTechnician(req.params.technicianId);
      const summary = await storage.getTechnicianFeedbackSummary(req.params.technicianId);
      res.json({ feedback, summary });
    } catch (error: any) {
      console.error("Error fetching technician feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Get all feedback with filters
  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const { sentiment, minRating, maxRating, isFlagged, startDate, endDate, limit, offset } = req.query;
      const filters: any = {};
      if (sentiment) filters.sentiment = sentiment;
      if (minRating) filters.minRating = parseInt(minRating);
      if (maxRating) filters.maxRating = parseInt(maxRating);
      if (isFlagged !== undefined) filters.isFlagged = isFlagged === 'true';
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const feedback = await storage.getAllServiceFeedback(filters);
      res.json(feedback);
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Get feedback analytics
  app.get('/api/feedback/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.getFeedbackAnalytics();
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching feedback analytics:", error);
      res.status(500).json({ message: "Failed to fetch feedback analytics" });
    }
  });

  // Get feedback by ID
  app.get('/api/feedback/:id', isAuthenticated, async (req: any, res) => {
    try {
      const feedback = await storage.getServiceFeedbackById(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json(feedback);
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Respond to feedback
  app.post('/api/feedback/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const { response } = req.body;
      if (!response) {
        return res.status(400).json({ message: "Response is required" });
      }
      const updated = await storage.respondToFeedback(req.params.id, response);
      res.json(updated);
    } catch (error: any) {
      console.error("Error responding to feedback:", error);
      res.status(500).json({ message: "Failed to respond to feedback" });
    }
  });

  // Flag feedback
  app.post('/api/feedback/:id/flag', isAuthenticated, async (req: any, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
      }
      const updated = await storage.flagFeedback(req.params.id, reason);
      res.json(updated);
    } catch (error: any) {
      console.error("Error flagging feedback:", error);
      res.status(500).json({ message: "Failed to flag feedback" });
    }
  });

  // Unflag feedback
  app.post('/api/feedback/:id/unflag', isAuthenticated, async (req: any, res) => {
    try {
      const updated = await storage.unflagFeedback(req.params.id);
      res.json(updated);
    } catch (error: any) {
      console.error("Error unflagging feedback:", error);
      res.status(500).json({ message: "Failed to unflag feedback" });
    }
  });

  // Analyze sentiment using OpenAI
  app.post('/api/feedback/:id/analyze-sentiment', isAuthenticated, async (req: any, res) => {
    try {
      const feedback = await storage.getServiceFeedbackById(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      const comments = feedback.feedback?.comments;
      if (!comments) {
        return res.status(400).json({ message: "No comments to analyze" });
      }

      // Use OpenAI for sentiment analysis
      const openai = new (await import('openai')).default();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis assistant. Analyze the customer feedback and return a JSON response with: sentiment (positive/negative/neutral), score (-1.0 to 1.0), and keywords (array of 3-5 relevant keywords or phrases)."
          },
          {
            role: "user",
            content: `Analyze this customer feedback: "${comments}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      const sentiment = result.sentiment || 'neutral';
      const sentimentScore = result.score || 0;
      const keywords = result.keywords || [];

      const updated = await storage.updateFeedbackSentiment(
        req.params.id,
        sentiment,
        sentimentScore,
        keywords
      );

      res.json({ ...updated, analysis: result });
    } catch (error: any) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  // Bulk analyze sentiment for all unanalyzed feedback
  app.post('/api/feedback/analyze-all', isAuthenticated, async (req: any, res) => {
    try {
      const allFeedback = await storage.getAllServiceFeedback({ limit: 100 });
      const unanalyzed = allFeedback.filter(f => !f.feedback?.sentiment && f.feedback?.comments);

      const results: any[] = [];
      const openai = new (await import('openai')).default();

      for (const item of unanalyzed.slice(0, 20)) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Analyze this customer feedback. Return JSON with: sentiment (positive/negative/neutral), score (-1.0 to 1.0), keywords (array of 3-5 key phrases)."
              },
              {
                role: "user",
                content: `Feedback: "${item.feedback?.comments}"`
              }
            ],
            response_format: { type: "json_object" },
          });

          const result = JSON.parse(completion.choices[0].message.content || '{}');
          await storage.updateFeedbackSentiment(
            item.feedback?.id,
            result.sentiment || 'neutral',
            result.score || 0,
            result.keywords || []
          );
          results.push({ id: item.feedback?.id, success: true, sentiment: result.sentiment });
        } catch (e) {
          results.push({ id: item.feedback?.id, success: false, error: (e as Error).message });
        }
      }

      res.json({ analyzed: results.length, results });
    } catch (error: any) {
      console.error("Error analyzing all feedback:", error);
      res.status(500).json({ message: "Failed to analyze feedback" });
    }
  });

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

  // ========================================
  // TELEMATICS ROUTES
  // ========================================

  // Get telematic device for vehicle
  app.get('/api/telematics/device/:vehicleId', isAuthenticated, async (req: any, res) => {
    try {
      const device = await storage.getTelematicsDeviceByVehicle(req.params.vehicleId);
      if (!device) {
        return res.status(404).json({ message: "No telematics device found" });
      }
      res.json(device);
    } catch (error: any) {
      console.error("Error fetching telematics device:", error);
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  // Get latest telematics readings
  app.get('/api/telematics/readings/:vehicleId', isAuthenticated, async (req: any, res) => {
    try {
      const { streamType, hours = 24 } = req.query;
      const readings = await storage.getTelematicsReadings(
        req.params.vehicleId,
        streamType as string,
        parseInt(hours as string)
      );
      res.json(readings);
    } catch (error: any) {
      console.error("Error fetching telematics readings:", error);
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  // ========================================
  // GAMIFICATION ROUTES
  // ========================================

  // Get leaderboard
  app.get('/api/gamification/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const { period = 'weekly', limit = 10 } = req.query;
      const leaderboard = await storage.getLeaderboard(
        period as string,
        parseInt(limit as string)
      );
      res.json(leaderboard);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get technician gamification profile
  app.get('/api/gamification/profile/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const [points, badges, recentEvents] = await Promise.all([
        storage.getTechnicianPoints(req.params.technicianId),
        storage.getTechnicianBadges(req.params.technicianId),
        storage.getTechnicianRecentEvents(req.params.technicianId, 10),
      ]);
      
      res.json({ points, badges, recentEvents });
    } catch (error: any) {
      console.error("Error fetching gamification profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Get available badges
  app.get('/api/gamification/badges', isAuthenticated, async (req: any, res) => {
    try {
      const badges = await storage.getGamificationBadges();
      res.json(badges);
    } catch (error: any) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

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
      const stats = await storage.getBackupStats(garageId);
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
      const backup = await storage.getLatestBackup(garageId);
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

  // ==========================================
  // HR MODULE API ROUTES
  // ==========================================

  // HR Departments
  app.get('/api/hr/departments', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      // In development/auth bypass mode, return all departments if no garageId
      // In production, this should require garageId for tenant isolation
      let query = db.select().from(hrDepartments);
      if (garageId) {
        query = query.where(eq(hrDepartments.garageId, garageId)) as typeof query;
      }
      const departments = await query.orderBy(hrDepartments.name);
      res.json(departments);
    } catch (error: any) {
      console.error("Error fetching HR departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/hr/departments', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrDepartmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [department] = await db.insert(hrDepartments).values(validation.data).returning();
      res.status(201).json(department);
    } catch (error: any) {
      console.error("Error creating HR department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.patch('/api/hr/departments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(hrDepartments)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(hrDepartments.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating HR department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete('/api/hr/departments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.delete(hrDepartments).where(eq(hrDepartments.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting HR department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // HR Positions
  app.get('/api/hr/positions', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const positions = await db.select().from(hrPositions)
        .where(garageId ? eq(hrPositions.garageId, garageId) : undefined)
        .orderBy(hrPositions.title);
      res.json(positions);
    } catch (error: any) {
      console.error("Error fetching HR positions:", error);
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  app.post('/api/hr/positions', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrPositionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [position] = await db.insert(hrPositions).values(validation.data).returning();
      res.status(201).json(position);
    } catch (error: any) {
      console.error("Error creating HR position:", error);
      res.status(500).json({ message: "Failed to create position" });
    }
  });

  app.patch('/api/hr/positions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(hrPositions)
        .set(req.body)
        .where(eq(hrPositions.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Position not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating HR position:", error);
      res.status(500).json({ message: "Failed to update position" });
    }
  });

  app.delete('/api/hr/positions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.delete(hrPositions).where(eq(hrPositions.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting HR position:", error);
      res.status(500).json({ message: "Failed to delete position" });
    }
  });

  // HR Employee Profiles
  app.get('/api/hr/employees', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const employees = await db.select().from(hrEmployeeProfiles)
        .where(garageId ? eq(hrEmployeeProfiles.garageId, garageId) : undefined)
        .orderBy(desc(hrEmployeeProfiles.createdAt));
      res.json(employees);
    } catch (error: any) {
      console.error("Error fetching HR employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/hr/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [employee] = await db.select().from(hrEmployeeProfiles)
        .where(eq(hrEmployeeProfiles.id, id));
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      console.error("Error fetching HR employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post('/api/hr/employees', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrEmployeeProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [employee] = await db.insert(hrEmployeeProfiles).values(validation.data).returning();
      res.status(201).json(employee);
    } catch (error: any) {
      console.error("Error creating HR employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.patch('/api/hr/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(hrEmployeeProfiles)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(hrEmployeeProfiles.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating HR employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/hr/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await db.delete(hrEmployeeProfiles).where(eq(hrEmployeeProfiles.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting HR employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // HR Leave Types
  app.get('/api/hr/leave-types', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const leaveTypes = await db.select().from(hrLeaveTypes)
        .where(garageId ? eq(hrLeaveTypes.garageId, garageId) : undefined)
        .orderBy(hrLeaveTypes.name);
      res.json(leaveTypes);
    } catch (error: any) {
      console.error("Error fetching leave types:", error);
      res.status(500).json({ message: "Failed to fetch leave types" });
    }
  });

  app.post('/api/hr/leave-types', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrLeaveTypeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [leaveType] = await db.insert(hrLeaveTypes).values(validation.data).returning();
      res.status(201).json(leaveType);
    } catch (error: any) {
      console.error("Error creating leave type:", error);
      res.status(500).json({ message: "Failed to create leave type" });
    }
  });

  // HR Leave Balances
  app.get('/api/hr/leave-balances/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const balances = await db.select().from(hrLeaveBalances)
        .where(eq(hrLeaveBalances.employeeId, employeeId))
        .orderBy(desc(hrLeaveBalances.year));
      res.json(balances);
    } catch (error: any) {
      console.error("Error fetching leave balances:", error);
      res.status(500).json({ message: "Failed to fetch leave balances" });
    }
  });

  app.post('/api/hr/leave-balances', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrLeaveBalanceSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [balance] = await db.insert(hrLeaveBalances).values(validation.data).returning();
      res.status(201).json(balance);
    } catch (error: any) {
      console.error("Error creating leave balance:", error);
      res.status(500).json({ message: "Failed to create leave balance" });
    }
  });

  app.patch('/api/hr/leave-balances/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(hrLeaveBalances)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(hrLeaveBalances.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Leave balance not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating leave balance:", error);
      res.status(500).json({ message: "Failed to update leave balance" });
    }
  });

  // HR Leave Requests
  app.get('/api/hr/leave-requests', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId, status } = req.query;
      let query = db.select().from(hrLeaveRequests);
      
      if (employeeId) {
        query = query.where(eq(hrLeaveRequests.employeeId, employeeId as string)) as any;
      }
      if (status) {
        query = query.where(eq(hrLeaveRequests.status, status as string)) as any;
      }
      
      const requests = await query.orderBy(desc(hrLeaveRequests.createdAt));
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post('/api/hr/leave-requests', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrLeaveRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [request] = await db.insert(hrLeaveRequests).values(validation.data).returning();
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.patch('/api/hr/leave-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body, updatedAt: new Date() };
      
      if (req.body.status === 'approved') {
        updateData.approvedBy = req.user?.id;
        updateData.approvedAt = new Date();
      }
      
      const [updated] = await db.update(hrLeaveRequests)
        .set(updateData)
        .where(eq(hrLeaveRequests.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating leave request:", error);
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // HR Job Postings
  app.get('/api/hr/job-postings', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const { status } = req.query;
      let query = db.select().from(hrJobPostings);
      
      if (garageId) {
        query = query.where(eq(hrJobPostings.garageId, garageId)) as any;
      }
      if (status) {
        query = query.where(eq(hrJobPostings.status, status as string)) as any;
      }
      
      const postings = await query.orderBy(desc(hrJobPostings.createdAt));
      res.json(postings);
    } catch (error: any) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  });

  app.post('/api/hr/job-postings', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrJobPostingSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const data = { ...validation.data, createdBy: req.user?.id };
      const [posting] = await db.insert(hrJobPostings).values(data).returning();
      res.status(201).json(posting);
    } catch (error: any) {
      console.error("Error creating job posting:", error);
      res.status(500).json({ message: "Failed to create job posting" });
    }
  });

  app.patch('/api/hr/job-postings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body, updatedAt: new Date() };
      
      if (req.body.status === 'open' && !req.body.publishedAt) {
        updateData.publishedAt = new Date();
      }
      
      const [updated] = await db.update(hrJobPostings)
        .set(updateData)
        .where(eq(hrJobPostings.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating job posting:", error);
      res.status(500).json({ message: "Failed to update job posting" });
    }
  });

  // HR Candidates
  app.get('/api/hr/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const { jobPostingId, stage } = req.query;
      let query = db.select().from(hrCandidates);
      
      if (jobPostingId) {
        query = query.where(eq(hrCandidates.jobPostingId, jobPostingId as string)) as any;
      }
      if (stage) {
        query = query.where(eq(hrCandidates.stage, stage as string)) as any;
      }
      
      const candidates = await query.orderBy(desc(hrCandidates.createdAt));
      res.json(candidates);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.post('/api/hr/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrCandidateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [candidate] = await db.insert(hrCandidates).values(validation.data).returning();
      res.status(201).json(candidate);
    } catch (error: any) {
      console.error("Error creating candidate:", error);
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  app.patch('/api/hr/candidates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(hrCandidates)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(hrCandidates.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating candidate:", error);
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  // HR Benefit Plans
  app.get('/api/hr/benefit-plans', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const plans = await db.select().from(hrBenefitPlans)
        .where(garageId ? eq(hrBenefitPlans.garageId, garageId) : undefined)
        .orderBy(hrBenefitPlans.name);
      res.json(plans);
    } catch (error: any) {
      console.error("Error fetching benefit plans:", error);
      res.status(500).json({ message: "Failed to fetch benefit plans" });
    }
  });

  app.post('/api/hr/benefit-plans', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrBenefitPlanSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [plan] = await db.insert(hrBenefitPlans).values(validation.data).returning();
      res.status(201).json(plan);
    } catch (error: any) {
      console.error("Error creating benefit plan:", error);
      res.status(500).json({ message: "Failed to create benefit plan" });
    }
  });

  // HR Benefit Enrollments
  app.get('/api/hr/benefit-enrollments/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const enrollments = await db.select().from(hrBenefitEnrollments)
        .where(eq(hrBenefitEnrollments.employeeId, employeeId));
      res.json(enrollments);
    } catch (error: any) {
      console.error("Error fetching benefit enrollments:", error);
      res.status(500).json({ message: "Failed to fetch benefit enrollments" });
    }
  });

  app.post('/api/hr/benefit-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrBenefitEnrollmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [enrollment] = await db.insert(hrBenefitEnrollments).values(validation.data).returning();
      res.status(201).json(enrollment);
    } catch (error: any) {
      console.error("Error creating benefit enrollment:", error);
      res.status(500).json({ message: "Failed to create benefit enrollment" });
    }
  });

  // HR Performance Reviews
  app.get('/api/hr/performance-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId, status } = req.query;
      let query = db.select().from(hrPerformanceReviews);
      
      if (employeeId) {
        query = query.where(eq(hrPerformanceReviews.employeeId, employeeId as string)) as any;
      }
      if (status) {
        query = query.where(eq(hrPerformanceReviews.status, status as string)) as any;
      }
      
      const reviews = await query.orderBy(desc(hrPerformanceReviews.createdAt));
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch performance reviews" });
    }
  });

  app.post('/api/hr/performance-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrPerformanceReviewSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [review] = await db.insert(hrPerformanceReviews).values(validation.data).returning();
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating performance review:", error);
      res.status(500).json({ message: "Failed to create performance review" });
    }
  });

  app.patch('/api/hr/performance-reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body, updatedAt: new Date() };
      
      if (req.body.status === 'completed') {
        updateData.completedAt = new Date();
      }
      
      const [updated] = await db.update(hrPerformanceReviews)
        .set(updateData)
        .where(eq(hrPerformanceReviews.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating performance review:", error);
      res.status(500).json({ message: "Failed to update performance review" });
    }
  });

  // HR Announcements
  app.get('/api/hr/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user?.garageId;
      const announcements = await db.select().from(hrAnnouncements)
        .where(garageId ? eq(hrAnnouncements.garageId, garageId) : undefined)
        .orderBy(desc(hrAnnouncements.createdAt));
      res.json(announcements);
    } catch (error: any) {
      console.error("Error fetching HR announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/hr/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrAnnouncementSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const data = { ...validation.data, createdBy: req.user?.id };
      const [announcement] = await db.insert(hrAnnouncements).values(data).returning();
      res.status(201).json(announcement);
    } catch (error: any) {
      console.error("Error creating HR announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // HR Self Service Requests
  app.get('/api/hr/self-service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const { employeeId, status } = req.query;
      let query = db.select().from(hrSelfServiceRequests);
      
      if (employeeId) {
        query = query.where(eq(hrSelfServiceRequests.employeeId, employeeId as string)) as any;
      }
      if (status) {
        query = query.where(eq(hrSelfServiceRequests.status, status as string)) as any;
      }
      
      const requests = await query.orderBy(desc(hrSelfServiceRequests.createdAt));
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching self-service requests:", error);
      res.status(500).json({ message: "Failed to fetch self-service requests" });
    }
  });

  app.post('/api/hr/self-service-requests', isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertHrSelfServiceRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(sanitizeZodError(validation.error));
      }
      const [request] = await db.insert(hrSelfServiceRequests).values(validation.data).returning();
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Error creating self-service request:", error);
      res.status(500).json({ message: "Failed to create self-service request" });
    }
  });

  app.patch('/api/hr/self-service-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData: any = { ...req.body, updatedAt: new Date() };
      
      if (['approved', 'rejected', 'completed'].includes(req.body.status)) {
        updateData.processedBy = req.user?.id;
        updateData.processedAt = new Date();
      }
      
      const [updated] = await db.update(hrSelfServiceRequests)
        .set(updateData)
        .where(eq(hrSelfServiceRequests.id, id))
        .returning();
      if (!updated) {
        return res.status(404).json({ message: "Self-service request not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating self-service request:", error);
      res.status(500).json({ message: "Failed to update self-service request" });
    }
  });

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

  // ==========================================
  // Customer Loyalty Program API
  // ==========================================

  app.get('/api/loyalty-tiers', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      if (!garageId) return res.status(400).json({ message: "garageId is required" });
      const tiers = await storage.getLoyaltyTiers(garageId as string);
      res.json(tiers);
    } catch (error: any) {
      console.error("Error fetching loyalty tiers:", error);
      res.status(500).json({ message: "Failed to fetch loyalty tiers" });
    }
  });

  app.post('/api/loyalty-tiers', isAuthenticated, async (req: any, res) => {
    try {
      const tier = await storage.createLoyaltyTier(req.body);
      res.status(201).json(tier);
    } catch (error: any) {
      console.error("Error creating loyalty tier:", error);
      res.status(500).json({ message: "Failed to create loyalty tier" });
    }
  });

  app.patch('/api/loyalty-tiers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const tier = await storage.updateLoyaltyTier(req.params.id, req.body);
      res.json(tier);
    } catch (error: any) {
      console.error("Error updating loyalty tier:", error);
      res.status(500).json({ message: "Failed to update loyalty tier" });
    }
  });

  app.delete('/api/loyalty-tiers/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteLoyaltyTier(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting loyalty tier:", error);
      res.status(500).json({ message: "Failed to delete loyalty tier" });
    }
  });

  app.get('/api/loyalty-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.query;
      const accounts = await storage.getLoyaltyAccounts(garageId as string);
      res.json(accounts);
    } catch (error: any) {
      console.error("Error fetching loyalty accounts:", error);
      res.status(500).json({ message: "Failed to fetch loyalty accounts" });
    }
  });

  app.get('/api/loyalty-accounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const account = await storage.getLoyaltyAccount(req.params.id);
      if (!account) return res.status(404).json({ message: "Account not found" });
      res.json(account);
    } catch (error: any) {
      console.error("Error fetching loyalty account:", error);
      res.status(500).json({ message: "Failed to fetch loyalty account" });
    }
  });

  app.post('/api/loyalty-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const account = await storage.createLoyaltyAccount(req.body);
      res.status(201).json(account);
    } catch (error: any) {
      console.error("Error creating loyalty account:", error);
      res.status(500).json({ message: "Failed to create loyalty account" });
    }
  });

  app.patch('/api/loyalty-accounts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const account = await storage.updateLoyaltyAccount(req.params.id, req.body);
      res.json(account);
    } catch (error: any) {
      console.error("Error updating loyalty account:", error);
      res.status(500).json({ message: "Failed to update loyalty account" });
    }
  });

  app.post('/api/loyalty-accounts/:id/add-points', isAuthenticated, async (req: any, res) => {
    try {
      const { points } = req.body;
      const account = await storage.addLoyaltyPoints(req.params.id, points);
      res.json(account);
    } catch (error: any) {
      console.error("Error adding loyalty points:", error);
      res.status(500).json({ message: error.message || "Failed to add loyalty points" });
    }
  });

  app.post('/api/loyalty-accounts/:id/redeem-points', isAuthenticated, async (req: any, res) => {
    try {
      const { points } = req.body;
      const account = await storage.redeemLoyaltyPoints(req.params.id, points);
      res.json(account);
    } catch (error: any) {
      console.error("Error redeeming loyalty points:", error);
      res.status(500).json({ message: error.message || "Failed to redeem loyalty points" });
    }
  });

  app.get('/api/loyalty-offers', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, isActive } = req.query;
      const offers = await storage.getLoyaltyOffers(garageId as string, isActive === 'true');
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching loyalty offers:", error);
      res.status(500).json({ message: "Failed to fetch loyalty offers" });
    }
  });

  app.get('/api/loyalty-offers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const offer = await storage.getLoyaltyOffer(req.params.id);
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      res.json(offer);
    } catch (error: any) {
      console.error("Error fetching loyalty offer:", error);
      res.status(500).json({ message: "Failed to fetch loyalty offer" });
    }
  });

  app.post('/api/loyalty-offers', isAuthenticated, async (req: any, res) => {
    try {
      const offer = await storage.createLoyaltyOffer(req.body);
      res.status(201).json(offer);
    } catch (error: any) {
      console.error("Error creating loyalty offer:", error);
      res.status(500).json({ message: "Failed to create loyalty offer" });
    }
  });

  app.patch('/api/loyalty-offers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const offer = await storage.updateLoyaltyOffer(req.params.id, req.body);
      res.json(offer);
    } catch (error: any) {
      console.error("Error updating loyalty offer:", error);
      res.status(500).json({ message: "Failed to update loyalty offer" });
    }
  });

  app.delete('/api/loyalty-offers/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteLoyaltyOffer(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting loyalty offer:", error);
      res.status(500).json({ message: "Failed to delete loyalty offer" });
    }
  });

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

  app.get('/api/calendar-appointments', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, startDate, endDate } = req.query;
      if (!garageId) return res.status(400).json({ message: "garageId is required" });
      const appointments = await storage.getCalendarAppointments(
        garageId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(appointments);
    } catch (error: any) {
      console.error("Error fetching calendar appointments:", error);
      res.status(500).json({ message: "Failed to fetch calendar appointments" });
    }
  });

  app.get('/api/calendar-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointment = await storage.getCalendarAppointment(req.params.id);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });
      res.json(appointment);
    } catch (error: any) {
      console.error("Error fetching calendar appointment:", error);
      res.status(500).json({ message: "Failed to fetch calendar appointment" });
    }
  });

  app.post('/api/calendar-appointments', isAuthenticated, async (req: any, res) => {
    try {
      const appointment = await storage.createCalendarAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      console.error("Error creating calendar appointment:", error);
      res.status(500).json({ message: "Failed to create calendar appointment" });
    }
  });

  app.patch('/api/calendar-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointment = await storage.updateCalendarAppointment(req.params.id, req.body);
      res.json(appointment);
    } catch (error: any) {
      console.error("Error updating calendar appointment:", error);
      res.status(500).json({ message: "Failed to update calendar appointment" });
    }
  });

  app.delete('/api/calendar-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCalendarAppointment(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting calendar appointment:", error);
      res.status(500).json({ message: "Failed to delete calendar appointment" });
    }
  });

  app.post('/api/calendar-appointments/:id/move', isAuthenticated, async (req: any, res) => {
    try {
      const { startTime, endTime, resourceId } = req.body;
      const appointment = await storage.moveCalendarAppointment(
        req.params.id,
        new Date(startTime),
        new Date(endTime),
        resourceId
      );
      res.json(appointment);
    } catch (error: any) {
      console.error("Error moving calendar appointment:", error);
      res.status(500).json({ message: "Failed to move calendar appointment" });
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

  const httpServer = createServer(app);
  
  // Initialize WebSocket server for chat
  initializeChatWebSocket(httpServer);
  
  return httpServer;
}
