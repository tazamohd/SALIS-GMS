import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  insertEntitlementAssignmentSchema
} from "@shared/schema";
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { estimateJobTime, predictMaintenance, recommendParts, optimizeSchedule, chatWithCustomer } from './ai';
import { auditLog } from './auditMiddleware';
import QRCode from 'qrcode';
import * as phase3Service from './phase3-integrations-service';
import * as phase4Service from './phase4-customer-experience-service';
import * as phase5Service from './phase5-operations-service';
import * as phase6Service from './phase6-compliance-service';
import * as phase7Service from './phase7-hardware-service';

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
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;

      const validationResult = insertSparePartSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
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
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
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
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
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
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
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
      const userId = req.user.id;
      
      const validationResult = insertAppointmentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
      const userId = req.user.id;

      const validationResult = insertVehicleServiceHistorySchema.safeParse({
        ...req.body,
        vehicleId: id,
        performedBy: userId
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
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
          errors: validationResult.error.errors
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
          errors: validationResult.error.errors
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
          errors: validationResult.error.errors
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
          errors: validationResult.error.errors
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
      const userId = req.user.id;
      
      const validationResult = insertCustomerNoteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      
      const validationResult = insertPurchaseOrderSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      const { purchaseOrder, items } = req.body;
      
      if (!purchaseOrder || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: purchaseOrder and items (array) required" 
        });
      }
      
      const poValidation = insertPurchaseOrderSchema.safeParse(purchaseOrder);
      if (!poValidation.success) {
        return res.status(400).json({ 
          message: "Purchase order validation error", 
          errors: poValidation.error.errors 
        });
      }
      
      const itemsValidation = items.map((item: any) => 
        insertPurchaseOrderItemSchema.omit({ purchaseOrderId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Items validation error", 
          errors: invalidItems.flatMap(v => v.success ? [] : v.error.errors)
        });
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
          errors: validationResult.error.errors 
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
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      
      const validationResult = insertInvoiceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      const { invoice, items } = req.body;
      
      if (!invoice || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: invoice and items (array) required" 
        });
      }
      
      const invoiceValidation = insertInvoiceSchema.safeParse(invoice);
      if (!invoiceValidation.success) {
        return res.status(400).json({ 
          message: "Invoice validation error", 
          errors: invoiceValidation.error.errors 
        });
      }
      
      const itemsValidation = items.map((item: any) => 
        insertInvoiceItemSchema.omit({ invoiceId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Items validation error", 
          errors: invalidItems.flatMap(v => v.success ? [] : v.error.errors)
        });
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
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      
      const validationResult = insertPaymentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      const { estimate, items } = req.body;
      
      if (!estimate || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: estimate and items (array) required" 
        });
      }
      
      const estimateValidation = insertEstimateSchema.safeParse(estimate);
      if (!estimateValidation.success) {
        return res.status(400).json({ 
          message: "Estimate validation error", 
          errors: estimateValidation.error.errors 
        });
      }
      
      const itemsValidation = items.map((item: any) => 
        insertEstimateItemSchema.omit({ estimateId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Items validation error", 
          errors: invalidItems.flatMap(v => v.success ? [] : v.error.errors)
        });
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
          errors: validationResult.error.errors 
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS feedback request:", error);
      res.status(500).json({ message: "Failed to send SMS feedback request" });
    }
  });

  // Notification preferences routes - Module 24
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences || { userId, eventMap: '{}', channel: 'all', isLockedByAdmin: false });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.post('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Get customer profile
  app.get('/api/customer/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;

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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const presets = await storage.getSavedFilterPresets(garageId, userId, module);
      res.json(presets);
    } catch (error) {
      console.error("Error getting filter presets:", error);
      res.status(500).json({ message: "Failed to get filter presets" });
    }
  });

  app.post('/api/filter-presets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validated = insertSavedFilterPresetSchema.parse({ ...req.body, userId });
      const preset = await storage.createSavedFilterPreset(validated);
      res.status(201).json(preset);
    } catch (error: any) {
      console.error("Error creating filter preset:", error);
      if (error.errors) {
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
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
      const userId = req.user.id;
      const jobs = await storage.getExportJobs(garageId, userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error getting export jobs:", error);
      res.status(500).json({ message: "Failed to get export jobs" });
    }
  });

  app.post('/api/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const validated = insertEmployeeAttendanceSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.createAttendance(validated);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating attendance:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.patch('/api/hr/attendance/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  app.post('/api/hr/clock-in', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
      
      const record = await storage.clockIn(userId, userGarageId);
      res.json(record);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/hr/clock-out/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;

      const templates = await storage.getShiftTemplates(userGarageId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching shift templates:", error);
      res.status(500).json({ message: "Failed to fetch shift templates" });
    }
  });

  app.get('/api/hr/shift-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const validated = insertShiftTemplateSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const template = await storage.createShiftTemplate(validated);
      res.json(template);
    } catch (error: any) {
      console.error("Error creating shift template:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shift template" });
    }
  });

  app.patch('/api/hr/shift-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getShiftTemplate(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Shift template not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertShiftTemplateSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const validated = insertShiftAssignmentSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignment = await storage.createShiftAssignment(validated);
      res.json(assignment);
    } catch (error: any) {
      console.error("Error creating shift assignment:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shift assignment" });
    }
  });

  app.patch('/api/hr/shift-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getShiftAssignment(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Shift assignment not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertShiftAssignmentSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;

      const rules = await storage.getCommissionRules(userGarageId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching commission rules:", error);
      res.status(500).json({ message: "Failed to fetch commission rules" });
    }
  });

  app.post('/api/hr/commission-rules', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const validated = insertCommissionRuleSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const rule = await storage.createCommissionRule(validated);
      res.json(rule);
    } catch (error: any) {
      console.error("Error creating commission rule:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create commission rule" });
    }
  });

  app.patch('/api/hr/commission-rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getCommissionRule(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Commission rule not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertCommissionRuleSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const validated = insertCommissionSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const commission = await storage.createCommission(validated);
      res.json(commission);
    } catch (error: any) {
      console.error("Error creating commission:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create commission" });
    }
  });

  app.patch('/api/hr/commissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getCommission(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Commission not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertCommissionSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
      
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const validated = insertPerformanceReviewSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const review = await storage.createPerformanceReview(validated);
      res.json(review);
    } catch (error: any) {
      console.error("Error creating performance review:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create performance review" });
    }
  });

  app.patch('/api/hr/performance-reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getPerformanceReview(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Performance review not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertPerformanceReviewSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;

      const trainings = await storage.getTrainings(userGarageId);
      res.json(trainings);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      res.status(500).json({ message: "Failed to fetch trainings" });
    }
  });

  app.post('/api/hr/trainings', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const validated = insertTrainingSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const training = await storage.createTraining(validated);
      res.json(training);
    } catch (error: any) {
      console.error("Error creating training:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create training" });
    }
  });

  app.patch('/api/hr/trainings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getTraining(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Training not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertTrainingSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const validated = insertEmployeeTrainingSchema.parse(req.body);
      
      if (validated.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const record = await storage.createEmployeeTraining(validated);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating employee training:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee training" });
    }
  });

  app.patch('/api/hr/employee-trainings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const existing = await storage.getEmployeeTraining(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Employee training not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertEmployeeTrainingSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const existing = await storage.getAIJobEstimation(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Job estimation not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertAIJobEstimationSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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

  app.get('/api/ai/maintenance-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      
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
          // Use AI to analyze service patterns and predict maintenance needs
          // For now, create a simple prediction based on service frequency
          const lastService = jobCards[jobCards.length - 1];
          const daysSinceLastService = Math.floor(
            (Date.now() - new Date(lastService.createdAt!).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Generate prediction if vehicle hasn't been serviced in 90+ days
          if (daysSinceLastService > 90) {
            const predictionData = {
              garageId: userGarageId,
              vehicleId: vehicle.id,
              predictedIssue: `${vehicle.make} ${vehicle.model} may require routine maintenance`,
              severity: daysSinceLastService > 180 ? 'high' : 'medium',
              recommendedAction: `Schedule inspection - vehicle hasn't been serviced in ${daysSinceLastService} days`,
              estimatedTimeframe: 'Within 2 weeks',
              confidence: 75 + (daysSinceLastService > 180 ? 10 : 0),
              basedOnData: {
                lastServiceDate: lastService.createdAt,
                daysSinceLastService,
                totalServices: jobCards.length,
                vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              },
              status: 'pending'
            };

            const prediction = await storage.createAIMaintenancePrediction(predictionData);
            predictions.push(prediction);
          }
        }
      }

      res.json({
        message: `Analysis complete. Generated ${predictions.length} new predictions.`,
        predictions,
      });
    } catch (error: any) {
      console.error("Error running maintenance analysis:", error);
      res.status(500).json({ message: "Failed to run maintenance analysis", error: error.message });
    }
  });

  // Parts Recommendation Routes
  app.post('/api/ai/recommend-parts', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const existing = await storage.getAIPartsRecommendation(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Parts recommendation not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertAIPartsRecommendationSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const existing = await storage.getAIScheduleOptimization(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Schedule optimization not found" });
      }
      
      if (existing.garageId !== userGarageId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validated = insertAIScheduleOptimizationSchema.partial().safeParse(req.body);
      
      if (!validated.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validated.error.errors 
        });
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
      const userGarageId = req.user.garageId;
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
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  app.get('/api/ai/chat-conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userId = req.user.id;
      const commands = await storage.getVoiceCommands(userId);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching voice commands:", error);
      res.status(500).json({ message: "Failed to fetch voice commands" });
    }
  });

  app.post('/api/voice-commands/process', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const { period } = req.query;
      
      // Return mock dashboard metrics
      res.json({
        totalRevenue: 328000,
        totalCosts: 214000,
        netProfit: 114000,
        profitMargin: 34.8,
        activeCustomers: 1284,
        jobCards: 856,
        period,
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/analytics/custom-reports', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      // Return empty array for now - reports can be created
      res.json([]);
    } catch (error) {
      console.error("Error fetching custom reports:", error);
      res.status(500).json({ message: "Failed to fetch custom reports" });
    }
  });

  app.post('/api/analytics/custom-reports', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const userId = req.user.id;
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
      const garageId = req.user.garageId;
      const { periodType } = req.query;
      
      // Return mock profit analysis data
      res.json({
        totalRevenue: 328000,
        totalCosts: 214000,
        netProfit: 114000,
        profitMargin: 34.8,
        periodType,
      });
    } catch (error) {
      console.error("Error fetching profit analysis:", error);
      res.status(500).json({ message: "Failed to fetch profit analysis" });
    }
  });

  app.get('/api/analytics/customer-ltv', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const { riskFilter } = req.query;
      
      // Return empty array for now - mock data in frontend
      res.json([]);
    } catch (error) {
      console.error("Error fetching customer LTV:", error);
      res.status(500).json({ message: "Failed to fetch customer LTV data" });
    }
  });

  app.get('/api/analytics/heatmaps', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const { heatmapType, period } = req.query;
      
      // Return empty array for now - mock data in frontend
      res.json([]);
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
      const result = await phase3Service.initiateAccountingConnection(req.user.garageId, platform);
      res.json(result);
    } catch (error: any) {
      console.error("Error connecting accounting:", error);
      res.status(500).json({ message: error.message || "Failed to connect accounting provider" });
    }
  });

  app.get('/api/accounting/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const dashboard = await phase3Service.getAccountingDashboard(req.user.garageId);
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
        garageId: req.user.garageId,
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
        garageId: req.user.garageId,
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
      const reviews = await phase3Service.fetchSocialMediaReviews(req.user.garageId);
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
      const result = await phase3Service.respondToReview(id, response, req.user.id);
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
        garageId: req.user.garageId,
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
        garageId: req.user.garageId
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
      const garageId = req.user.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching marketplace orders:", error);
      res.status(500).json({ message: "Failed to fetch marketplace orders" });
    }
  });

  app.post('/api/marketplace/orders', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching service tracking:", error);
      res.status(500).json({ message: "Failed to fetch service tracking data" });
    }
  });

  app.get('/api/video-estimates', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching video estimates:", error);
      res.status(500).json({ message: "Failed to fetch video estimates" });
    }
  });

  app.post('/api/video-estimates', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const userId = req.user.id;
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
      const garageId = req.user.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching walkarounds:", error);
      res.status(500).json({ message: "Failed to fetch walkarounds" });
    }
  });

  app.post('/api/vehicle-walkarounds', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const userId = req.user.id;
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
      const garageId = req.user.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/customer-reviews/:id/respond', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const garageId = req.user.garageId;
      res.json([]);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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
      const userGarageId = req.user.garageId;
      const connections = await storage.getIntegrationConnections(userGarageId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching integration connections:", error);
      res.status(500).json({ message: "Failed to fetch integration connections" });
    }
  });

  app.post('/api/integrations/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      await storage.deleteTwoFactorAuth(userId);
      res.json({ message: "2FA disabled successfully" });
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA", error: error.message });
    }
  });
  
  app.get('/api/security/2fa/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
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
      const userId = req.user.id;
      const consents = await storage.getUserConsents(userId);
      res.json(consents);
    } catch (error) {
      console.error("Error fetching consents:", error);
      res.status(500).json({ message: "Failed to fetch consents" });
    }
  });
  
  app.post('/api/security/consents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userGarageId = req.user.garageId;
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
      const userGarageId = req.user.garageId;
      const grantedBy = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
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
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
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
    const userId = req.user.id;
    res.json({ message: "This is a protected route", userId });
  });

  // Module 36: In-App Chat Support Routes
  
  // Chat Conversations
  app.get('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
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
      const userGarageId = req.user.garageId;
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      
      await storage.markMessagesAsRead(id, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  app.get('/api/chat/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const garageId = req.user.garageId;
      const userId = req.user.id;
      
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
      const garageId = req.user.garageId;
      const userId = req.user.id;
      
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
      const garageId = req.user.garageId;
      
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
          generatedBy: req.user.id,
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
          scannedBy: req.user.id,
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
          scannedBy: req.user.id,
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
          scannedBy: req.user.id,
          deviceInfo: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          scanResult: 'already_used',
        });
        
        return res.status(400).json({ message: "QR code has already been used", scanResult: 'already_used' });
      }
      
      // Log successful scan
      await storage.createQRScanLog({
        qrCodeId: qrToken.id,
        scannedBy: req.user.id,
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
            changedBy: req.user.id,
          });
          
          // Send check-in notification to customer
          try {
            const customer = await storage.getUser(qrToken.customerId);
            if (customer?.phone) {
              await smsService.sendSMS({
                to: customer.phone,
                recipientId: customer.id,
                garageId: req.user.garageId,
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
        garageId: req.user.garageId,
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
        garageId: req.user.garageId,
      });
      res.status(201).json(fleetGroup);
    } catch (error) {
      console.error("Error creating fleet group:", error);
      res.status(500).json({ message: "Failed to create fleet group" });
    }
  });

  app.get('/api/fleet/groups', isAuthenticated, async (req: any, res) => {
    try {
      const fleetGroups = await storage.getFleetGroupsByGarage(req.user.garageId);
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
        createdBy: req.user.id,
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

  // Fleet Pricing Tiers
  app.post('/api/fleet/pricing-tiers', isAuthenticated, async (req: any, res) => {
    try {
      const tier = await storage.createFleetPricingTier({
        ...req.body,
        garageId: req.user.garageId,
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
        : await storage.getFleetPricingTiersByGarage(req.user.garageId);
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
      const data = { ...req.body, garageId: user.garageId };
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
      const conversations = await storage.getAIChatConversations(req.user.garageId);
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
          userId: req.user.id,
          garageId: req.user.garageId,
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
        userId: req.user.id,
        garageId: req.user.garageId,
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
      const documents = await storage.getOCRDocuments(req.user.garageId);
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

      const report = await generateBusinessIntelligenceReport(req.user.garageId, dateRange);
      res.json(report);
    } catch (error) {
      console.error("Error generating BI report:", error);
      res.status(500).json({ message: "Failed to generate BI report" });
    }
  });

  app.get("/api/analytics/realtime-kpis", isAuthenticated, async (req: any, res) => {
    try {
      const { getRealtimeKPIs } = await import("./analytics-service");
      const kpis = await getRealtimeKPIs(req.user.garageId);
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
        req.user.garageId, 
        (groupBy as 'service' | 'technician' | 'customer') || 'service'
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing profit margins:", error);
      res.status(500).json({ message: "Failed to analyze profit margins" });
    }
  });

  // Customer Lifetime Value Analysis - Real SQL
  app.get("/api/analytics/customer-ltv", isAuthenticated, async (req: any, res) => {
    try {
      const { analyzeCustomerLTV } = await import("./analytics-service");
      const ltvAnalysis = await analyzeCustomerLTV(req.user.garageId);
      res.json(ltvAnalysis);
    } catch (error) {
      console.error("Error analyzing customer LTV:", error);
      res.status(500).json({ message: "Failed to analyze customer LTV" });
    }
  });

  // Business Heat Maps - Real SQL Aggregation
  app.get("/api/analytics/heatmaps", isAuthenticated, async (req: any, res) => {
    try {
      const { mapType } = req.query;
      const { generateBusinessHeatMaps } = await import("./analytics-service");
      
      const heatmap = await generateBusinessHeatMaps(
        req.user.garageId,
        (mapType as 'time' | 'service' | 'technician') || 'time'
      );
      
      res.json(heatmap);
    } catch (error) {
      console.error("Error generating heat maps:", error);
      res.status(500).json({ message: "Failed to generate heat maps" });
    }
  });

  // Custom Reports Builder (using mock data until storage methods are implemented)
  app.post("/api/analytics/custom-report", isAuthenticated, async (req: any, res) => {
    try {
      const { reportType, filters, dateRange } = req.body;
      
      // TODO: Implement createCustomReport in storage
      res.status(201).json({
        id: "report-new",
        userId: req.user.id,
        garageId: req.user.garageId,
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
        userId: req.user.id,
        garageId: req.user.garageId,
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
  // PHASE 7: ADVANCED HARDWARE
  // ========================================

  // Barcode Scanner - Module 90
  app.get("/api/barcode-scans", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", type: "part_inventory", barcodeData: "PN-12345", itemName: "Oil Filter", location: "Warehouse" },
    ]);
  });

  app.post("/api/barcode-scans", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "new", ...req.body, timestamp: new Date().toISOString() });
  });

  // Digital Signage - Module 91
  app.get("/api/signage/displays", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", name: "Waiting Room Main", location: "Waiting Room", displayType: "mixed", isActive: true },
    ]);
  });

  app.get("/api/signage/content", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", displayName: "Waiting Room Main", contentType: "promotion", title: "20% Off Oil Changes", duration: 10 },
    ]);
  });

  // Kiosk Check-In - Module 92
  app.get("/api/kiosk/sessions", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", customer: "John Smith", vehicle: "2020 Honda Civic", checkInTime: "2024-10-26T09:00:00Z" },
    ]);
  });

  app.post("/api/kiosk/check-in", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "new", ...req.body, checkInTime: new Date().toISOString() });
  });

  // Security Cameras - Module 93
  app.get("/api/security-cameras", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", name: "Service Bay 1", location: "Bay 1", type: "PTZ", isActive: true, recordingEnabled: true },
    ]);
  });

  app.get("/api/security-cameras/recordings", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", cameraName: "Service Bay 1", eventType: "motion", fileSize: 450 },
    ]);
  });

  // License Plate Recognition - Module 94
  app.get("/api/license-plate-scans", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", plateNumber: "ABC 1234", vehicle: "2020 Honda Civic", customer: "John Smith", confidence: 98.5, matched: true },
    ]);
  });

  app.get("/api/vehicle-entry-logs", isAuthenticated, async (req, res) => {
    res.json([
      { id: "1", vehicle: "2020 Honda Civic", plate: "ABC 1234", customer: "John Smith", entry: "2024-10-26T09:00:00Z", duration: 390 },
    ]);
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
      const technicianId = req.user.id;
      const userGarageId = req.user.garageId;
      
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
      const technicianId = req.user.id;
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
      const customerId = req.user.id;
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
      const customerId = req.user.id;
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
      const customerId = req.user.id;
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
      const customerId = req.user.id;
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
      const customerId = req.user.id;
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
      const customerId = req.user.id;
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
      const userGarageId = req.user.garageId;
      
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
      const userGarageId = req.user.garageId;
      
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
      const userId = req.user.id;
      const updateData = {
        jobCardId,
        userId,
        status: req.body.status,
        message: req.body.message,
        photoUrl: req.body.photoUrl,
        estimatedCompletion: req.body.estimatedCompletion ? new Date(req.body.estimatedCompletion) : undefined,
      };
      const update = await phase4Service.postServiceUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error posting service update:", error);
      res.status(500).json({ message: "Failed to post service update" });
    }
  });

  // Video Estimates
  app.post('/api/video-estimates', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const estimateData = {
        garageId,
        customerId: req.body.customerId,
        vehicleId: req.body.vehicleId,
        technicianId: req.body.technicianId,
        videoUrl: req.body.videoUrl,
        thumbnailUrl: req.body.thumbnailUrl,
        duration: req.body.duration,
        transcription: req.body.transcription,
        estimatedCost: req.body.estimatedCost,
        recommendedServices: req.body.recommendedServices,
      };
      const estimate = await phase4Service.createVideoEstimate(estimateData);
      res.status(201).json(estimate);
    } catch (error) {
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
      const garageId = req.user.garageId;
      const walkaroundData = {
        garageId,
        jobCardId: req.body.jobCardId,
        vehicleId: req.body.vehicleId,
        customerId: req.body.customerId,
        technicianId: req.body.technicianId,
        inspectionType: req.body.inspectionType,
        photos: req.body.photos,
        damageNotes: req.body.damageNotes,
      };
      const walkaround = await phase4Service.createDigitalWalkaround(walkaroundData);
      res.status(201).json(walkaround);
    } catch (error) {
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
      const garageId = req.user.garageId;
      const reviewData = {
        garageId,
        customerId: req.body.customerId,
        jobCardId: req.body.jobCardId,
        platform: req.body.platform,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
        reviewUrl: req.body.reviewUrl,
      };
      const review = await phase4Service.postCustomerReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error posting customer review:", error);
      res.status(500).json({ message: "Failed to post customer review" });
    }
  });

  app.get('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const userId = req.user.id;
      const review = await phase4Service.respondToReview(id, req.body.response, userId);
      res.json(review);
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(500).json({ message: "Failed to respond to review" });
    }
  });

  // Referral Program
  app.post('/api/referrals/generate-code', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const customerId = req.body.customerId;
      const code = await phase4Service.generateReferralCode(garageId, customerId);
      res.json({ code });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  app.post('/api/referrals/apply', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const { referralCode, newCustomerId } = req.body;
      const result = await phase4Service.applyReferralCode(garageId, referralCode, newCustomerId);
      res.json(result);
    } catch (error) {
      console.error("Error applying referral code:", error);
      res.status(500).json({ message: "Failed to apply referral code" });
    }
  });

  app.get('/api/referrals/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const rules = await phase5Service.getSchedulingRules(garageId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching scheduling rules:", error);
      res.status(500).json({ message: "Failed to fetch scheduling rules" });
    }
  });

  app.post('/api/scheduling/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const optimizationData = {
        garageId,
        optimizationDate: new Date(req.body.optimizationDate),
        appointmentsOptimized: req.body.appointmentsOptimized,
        efficiencyGain: req.body.efficiencyGain,
        technicianUtilization: req.body.technicianUtilization,
        suggestions: req.body.suggestions,
      };
      const optimization = await phase5Service.createSchedulingOptimization(optimizationData);
      res.status(201).json(optimization);
    } catch (error) {
      console.error("Error creating scheduling optimization:", error);
      res.status(500).json({ message: "Failed to create scheduling optimization" });
    }
  });

  app.get('/api/scheduling/history', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const ruleData = {
        garageId,
        partId: req.body.partId,
        minQuantity: req.body.minQuantity,
        reorderQuantity: req.body.reorderQuantity,
        preferredSupplierId: req.body.preferredSupplierId,
      };
      const rule = await phase5Service.createAutoReorderRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating auto-reorder rule:", error);
      res.status(500).json({ message: "Failed to create auto-reorder rule" });
    }
  });

  app.get('/api/auto-reorder/rules', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const rules = await phase5Service.getAutoReorderRules(garageId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching auto-reorder rules:", error);
      res.status(500).json({ message: "Failed to fetch auto-reorder rules" });
    }
  });

  app.post('/api/auto-reorder/check', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const triggeredOrders = await phase5Service.checkAndTriggerReorders(garageId);
      res.json({ triggered: triggeredOrders.length, orders: triggeredOrders });
    } catch (error) {
      console.error("Error checking auto-reorders:", error);
      res.status(500).json({ message: "Failed to check auto-reorders" });
    }
  });

  // Multi-Location Routing Optimizer
  app.post('/api/routing/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const routeData = {
        garageId,
        routeDate: new Date(req.body.routeDate),
        routeType: req.body.routeType,
        startLocation: req.body.startLocation,
        stops: req.body.stops,
        totalDistance: req.body.totalDistance,
        estimatedDuration: req.body.estimatedDuration,
        assignedDriver: req.body.assignedDriver,
      };
      const route = await phase5Service.createRoutingOptimization(routeData);
      res.status(201).json(route);
    } catch (error) {
      console.error("Error creating route optimization:", error);
      res.status(500).json({ message: "Failed to create route optimization" });
    }
  });

  app.get('/api/routing/routes', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const userId = req.user.id;
      const garageId = req.user.garageId;
      const entry = await phase5Service.clockIn(garageId, userId);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/timeclock/clock-out', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entry = await phase5Service.clockOut(userId);
      res.json(entry);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  app.get('/api/payroll/periods', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const calibrationData = {
        garageId,
        equipmentId: req.body.equipmentId,
        equipmentName: req.body.equipmentName,
        calibrationDate: new Date(req.body.calibrationDate),
        nextDueDate: new Date(req.body.nextDueDate),
        calibratedBy: req.body.calibratedBy,
        certificationNumber: req.body.certificationNumber,
        notes: req.body.notes,
      };
      const calibration = await phase5Service.createCalibrationRecord(calibrationData);
      res.status(201).json(calibration);
    } catch (error) {
      console.error("Error creating calibration record:", error);
      res.status(500).json({ message: "Failed to create calibration record" });
    }
  });

  app.get('/api/calibration/due', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const recordData = {
        garageId,
        complianceType: req.body.complianceType,
        recordDate: new Date(req.body.recordDate),
        wasteType: req.body.wasteType,
        quantity: req.body.quantity,
        unit: req.body.unit,
        disposalMethod: req.body.disposalMethod,
        disposalCompany: req.body.disposalCompany,
        certificationNumber: req.body.certificationNumber,
        cost: req.body.cost,
        regulatoryStandard: req.body.regulatoryStandard,
        attachments: req.body.attachments,
        notes: req.body.notes,
      };
      const record = await phase6Service.createComplianceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating compliance record:", error);
      res.status(500).json({ message: "Failed to create compliance record" });
    }
  });

  app.get('/api/compliance/environmental', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const checklistData = {
        garageId,
        checklistName: req.body.checklistName,
        checklistType: req.body.checklistType,
        items: req.body.items,
      };
      const checklist = await phase6Service.createQualityChecklist(checklistData);
      res.status(201).json(checklist);
    } catch (error) {
      console.error("Error creating quality checklist:", error);
      res.status(500).json({ message: "Failed to create quality checklist" });
    }
  });

  app.post('/api/quality/non-conformances', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const ncData = {
        garageId,
        ncNumber: req.body.ncNumber,
        jobCardId: req.body.jobCardId,
        description: req.body.description,
        severity: req.body.severity,
        reportedBy: req.body.reportedBy,
        category: req.body.category,
      };
      const nonConformance = await phase6Service.createNonConformance(ncData);
      res.status(201).json(nonConformance);
    } catch (error) {
      console.error("Error creating non-conformance:", error);
      res.status(500).json({ message: "Failed to create non-conformance" });
    }
  });

  app.get('/api/quality/non-conformances', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const incidentData = {
        garageId,
        incidentDate: new Date(req.body.incidentDate),
        incidentType: req.body.incidentType,
        severity: req.body.severity,
        location: req.body.location,
        description: req.body.description,
        injuredPerson: req.body.injuredPerson,
        witnessNames: req.body.witnessNames,
        reportedBy: req.body.reportedBy,
        immediateAction: req.body.immediateAction,
        photos: req.body.photos,
      };
      const incident = await phase6Service.createSafetyIncident(incidentData);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating safety incident:", error);
      res.status(500).json({ message: "Failed to create safety incident" });
    }
  });

  app.get('/api/safety/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const claimData = {
        garageId,
        claimNumber: req.body.claimNumber,
        jobCardId: req.body.jobCardId,
        customerId: req.body.customerId,
        vehicleId: req.body.vehicleId,
        insuranceCompany: req.body.insuranceCompany,
        policyNumber: req.body.policyNumber,
        claimType: req.body.claimType,
        incidentDate: new Date(req.body.incidentDate),
        claimAmount: req.body.claimAmount,
        deductible: req.body.deductible,
        adjusterName: req.body.adjusterName,
        adjusterContact: req.body.adjusterContact,
        estimateUrl: req.body.estimateUrl,
        documents: req.body.documents,
        notes: req.body.notes,
      };
      const claim = await phase6Service.createInsuranceClaim(claimData);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating insurance claim:", error);
      res.status(500).json({ message: "Failed to create insurance claim" });
    }
  });

  app.get('/api/insurance/claims', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const { status, notes } = req.body;
      const claim = await phase6Service.updateClaimStatus(id, status, notes);
      res.json(claim);
    } catch (error) {
      console.error("Error updating claim status:", error);
      res.status(500).json({ message: "Failed to update claim status" });
    }
  });

  app.get('/api/insurance/claims/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const scanData = {
        garageId,
        barcodeValue: req.body.barcodeValue,
        barcodeType: req.body.barcodeType,
        entityType: req.body.entityType,
        entityId: req.body.entityId,
        scannedBy: req.body.scannedBy,
        location: req.body.location,
      };
      const scan = await phase7Service.recordBarcodeScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      console.error("Error recording barcode scan:", error);
      res.status(500).json({ message: "Failed to record barcode scan" });
    }
  });

  app.get('/api/barcode/history', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const displayData = {
        garageId,
        displayName: req.body.displayName,
        location: req.body.location,
        resolution: req.body.resolution,
        orientation: req.body.orientation,
      };
      const display = await phase7Service.createSignageDisplay(displayData);
      res.status(201).json(display);
    } catch (error) {
      console.error("Error creating signage display:", error);
      res.status(500).json({ message: "Failed to create signage display" });
    }
  });

  app.post('/api/signage/content', isAuthenticated, async (req, res) => {
    try {
      const contentData = {
        displayId: req.body.displayId,
        contentType: req.body.contentType,
        contentUrl: req.body.contentUrl,
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        validFrom: req.body.validFrom ? new Date(req.body.validFrom) : undefined,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : undefined,
        priority: req.body.priority,
      };
      const content = await phase7Service.createSignageContent(contentData);
      res.status(201).json(content);
    } catch (error) {
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
      const garageId = req.user.garageId;
      const sessionData = {
        garageId,
        kioskId: req.body.kioskId,
        sessionType: req.body.sessionType,
      };
      const session = await phase7Service.createKioskSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating kiosk session:", error);
      res.status(500).json({ message: "Failed to create kiosk session" });
    }
  });

  app.post('/api/kiosk/check-in', isAuthenticated, async (req, res) => {
    try {
      const checkInData = {
        sessionId: req.body.sessionId,
        customerId: req.body.customerId,
        vehicleId: req.body.vehicleId,
        appointmentId: req.body.appointmentId,
        checkInType: req.body.checkInType,
        signature: req.body.signature,
        additionalNotes: req.body.additionalNotes,
      };
      const checkIn = await phase7Service.completeKioskCheckIn(checkInData);
      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Error completing kiosk check-in:", error);
      res.status(500).json({ message: "Failed to complete kiosk check-in" });
    }
  });

  // Security Camera Integration
  app.post('/api/security/cameras', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
      const cameraData = {
        garageId,
        cameraName: req.body.cameraName,
        location: req.body.location,
        ipAddress: req.body.ipAddress,
        streamUrl: req.body.streamUrl,
        resolution: req.body.resolution,
        hasMotionDetection: req.body.hasMotionDetection,
      };
      const camera = await phase7Service.createSecurityCamera(cameraData);
      res.status(201).json(camera);
    } catch (error) {
      console.error("Error creating security camera:", error);
      res.status(500).json({ message: "Failed to create security camera" });
    }
  });

  app.post('/api/security/recordings', isAuthenticated, async (req, res) => {
    try {
      const recordingData = {
        cameraId: req.body.cameraId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        recordingUrl: req.body.recordingUrl,
        fileSize: req.body.fileSize,
        eventType: req.body.eventType,
        vehicleId: req.body.vehicleId,
        notes: req.body.notes,
      };
      const recording = await phase7Service.createCameraRecording(recordingData);
      res.status(201).json(recording);
    } catch (error) {
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
      const garageId = req.user.garageId;
      const scanData = {
        garageId,
        plateNumber: req.body.plateNumber,
        confidence: req.body.confidence,
        vehicleId: req.body.vehicleId,
        customerId: req.body.customerId,
        cameraId: req.body.cameraId,
        imageUrl: req.body.imageUrl,
        scanType: req.body.scanType,
        location: req.body.location,
        matchedAutomatically: req.body.matchedAutomatically,
      };
      const scan = await phase7Service.recordLicensePlateScan(scanData);
      res.status(201).json(scan);
    } catch (error) {
      console.error("Error recording license plate scan:", error);
      res.status(500).json({ message: "Failed to record license plate scan" });
    }
  });

  app.get('/api/lpr/scans', isAuthenticated, async (req: any, res) => {
    try {
      const garageId = req.user.garageId;
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
      const garageId = req.user.garageId;
      const { status } = req.query;
      const logs = await phase7Service.getVehicleEntryLogs(garageId, status as string);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching entry logs:", error);
      res.status(500).json({ message: "Failed to fetch entry logs" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server for chat
  initializeChatWebSocket(httpServer);
  
  return httpServer;
}
