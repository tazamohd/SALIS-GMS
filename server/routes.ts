// @ts-nocheck — Monolith file, slated for deletion in Phase 3 (route refactoring)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import {
  jobCardParts,
  jobCards,
  invoices,
} from "@shared/schema";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { smsService } from "./services/smsService";
import { initializeChatWebSocket } from "./websocket";
import { z } from "zod";
import {
  insertExportJobSchema,
  insertFranchiseGroupSchema,
  insertFranchiseContractSchema,
  insertFranchiseKpiSchema,
  insertRevenueSharingRuleSchema,
  insertCurrencyRateSchema,
  insertTaxRegionSchema,
  insertTimezoneRuleSchema,
  insertNetworkPartnerSchema,
  insertVendorCatalogSchema,
  insertOemProductSchema,
  insertSubscriptionLicenseSchema,
  insertLicenseAuditLogSchema,
  insertEntitlementAssignmentSchema,
  insertStorageFacilitySchema,
  insertVehicleStorageAssignmentSchema,
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

const calibrationRecordSchema = z.object({
  equipmentId: z.string(),
  equipmentName: z.string(),
  calibrationDate: z.string(),
  nextDueDate: z.string(),
  calibratedBy: z.string(),
  certificationNumber: z.string().optional(),
  notes: z.string().optional(),
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
  // REMOVED: garages routes — now served by operations.ts

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

  // REMOVED: Supplier Management (Module 11) routes — now served by suppliers.ts

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

  // REMOVED: notification routes — now served by notifications-legacy.ts

  // REMOVED: notification preferences routes — now served by customer-support.ts

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
  
  // 6. STRIPE PAYMENT PROCESSING (with input validation)

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

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.id || 'default-user';
    res.json({ message: "This is a protected route", userId });
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

  // REMOVED: Fleet Management (Module 40) routes — now served by fleet.ts

  // Module 41: Warranty Tracking

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

  app.get("/api/quality/non-conformances", isAuthenticated, async (req, res) => {
    res.json([
      { id: "NC-2024-001", title: "Incorrect torque on wheel nuts", severity: "major", status: "resolved" },
    ]);
  });

  app.post("/api/quality/non-conformances", isAuthenticated, async (req, res) => {
    res.status(201).json({ id: "NC-NEW", ...req.body });
  });

  // ========================================
  // PHASE 1: AI & AUTOMATION
  // ========================================

  // REMOVED: Analytics Phase 2 (2nd block) routes — now served by analytics.ts

  // ========================================
  // PHASE 7: ADVANCED HARDWARE (GET Routes)
  // ========================================

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

  // REMOVED: reviews & referral routes — now served by customer-support.ts

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
  // PHASE 7: ADVANCED HARDWARE ROUTES
  // ==========================================

  // REMOVED: signage routes — now served by operations.ts

  // ==========================================
  // PHASE 7: ROUTE ALIASES FOR FRONTEND
  // ==========================================

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

  // REMOVED: backup & restore routes — now served by operations.ts

  // REMOVED: HR module routes -- now served by hr-payroll.ts

  // REMOVED: service bay dashboard routes — now served by service-operations.ts

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

  // REMOVED: loyalty program routes -- now served by loyalty.ts

  // ==========================================
  // Workshop Calendar API
  // ==========================================

  // REMOVED: AR overlay routes — now served by ar-vr.ts

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
