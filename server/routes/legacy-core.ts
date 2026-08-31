// @ts-nocheck
import { Router } from "express";
import { isAuthenticated, hashPassword } from "../auth";
import { storage } from "../storage";
import { db } from "../db";

const router = Router();

// 1. POST /register — user registration with auto-login
router.post('/register', async (req, res) => {
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

// 2. GET /auth/user — authenticated user info with roles and portal
router.get('/auth/user', isAuthenticated, async (req: any, res) => {
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

// 3. GET /search — smart search across customers, vehicles, parts, invoices, job cards, appointments
router.get('/search', isAuthenticated, async (req: any, res) => {
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

// 4. GET /roles — list all roles
router.get('/roles', isAuthenticated, async (req, res) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
});

// 5. GET /user/:id/roles — get roles for a specific user
router.get('/user/:id/roles', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userRoles = await storage.getUserRoles(id);
    res.json(userRoles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ message: "Failed to fetch user roles" });
  }
});

// 6. GET /public/track/:token — public job tracking by token (no auth)
router.get('/public/track/:token', async (req, res) => {
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

// 7. POST /invoices/from-job/:jobId — create invoice from job card
router.post('/invoices/from-job/:jobId', isAuthenticated, async (req: any, res) => {
  try {
    const { jobCards, taskAssignments, jobCardParts, spareParts, invoices, invoiceItems, saudiTaxCompliance, technicianProfiles } = await import("@shared/schema");
    const { eq, sql } = await import("drizzle-orm");
    const { db } = await import("../db");

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

// 8. GET /reports/overview — reports overview
router.get('/reports/overview', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const overview = await storage.getReportsOverview(garage_id as string | undefined);
    res.json(overview);
  } catch (error) {
    console.error("Error fetching reports overview:", error);
    res.status(500).json({ message: "Failed to fetch reports overview" });
  }
});

// 9. GET /reports/job-cards — job card analytics
router.get('/reports/job-cards', isAuthenticated, async (req, res) => {
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

// 10. GET /reports/inventory — inventory report
router.get('/reports/inventory', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const report = await storage.getInventoryReport(garage_id as string | undefined);
    res.json(report);
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    res.status(500).json({ message: "Failed to fetch inventory report" });
  }
});

// 11. GET /integrated/status — integration status overview
router.get('/integrated/status', isAuthenticated, async (req, res) => {
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

// 12. GET /technician-workload/:technicianId — technician workload report
router.get('/technician-workload/:technicianId', isAuthenticated, async (req: any, res) => {
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

export default router;
