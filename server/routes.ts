// @ts-nocheck — Monolith file, slated for deletion in Phase 3 (route refactoring)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import {
  jobCardParts,
  jobCards,
  invoices,
} from "@shared/schema";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { initializeChatWebSocket } from "./websocket";
import { z } from "zod";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { auditLog } from './auditMiddleware';

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


  // Data Import

  // REMOVED: Telematics Integration routes — now served by obd-telematics.ts
  // REMOVED: Knowledge Base routes — now served by training.ts
  // REMOVED: Training LMS routes — now served by training.ts
  // REMOVED: GMB routes — now served by gmb.ts
  // REMOVED: Client Portal + Chatbot routes — now served by customer-support.ts
  // REMOVED: IoT Vehicle Health routes — now served by iot.ts

  // REMOVED: fleet GPS/tracking routes — now served by fleet.ts


  // REMOVED: technician performance routes -- now served by operations.ts


  // REMOVED: telematics routes -- now served by obd-telematics.ts

  // REMOVED: gamification routes -- now served by training.ts

  // ========================================
  // DASHBOARD WIDGETS ROUTES
  // ========================================

  // REMOVED: backup & restore routes — now served by operations.ts

  // REMOVED: HR module routes -- now served by hr-payroll.ts

  // REMOVED: service bay dashboard routes — now served by service-operations.ts


  const httpServer = createServer(app);
  
  // Initialize WebSocket server for chat
  initializeChatWebSocket(httpServer);
  
  return httpServer;
}
