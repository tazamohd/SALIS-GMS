import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// ==========================================
// TECHNICIAN MOBILE APP API
// ==========================================

// Get assigned job cards for technician
router.get("/mobile/technician/jobs", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const technicianId = user?.id;
    const userGarageId = user?.garageId;

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
router.patch("/mobile/technician/jobs/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
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
router.post("/mobile/technician/time-entries", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const technicianId = user?.id;
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
router.post("/mobile/uploads", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
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
router.get("/mobile/parts/scan/:barcode", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ADVISOR', 'TECHNICIAN']), async (req: Request, res: Response) => {
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
router.get("/mobile/customer/vehicles", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customerId = user?.id;
    const vehicles = await storage.getCustomerVehicles(customerId);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// Get customer appointments (mobile)
router.get("/mobile/customer/appointments", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customerId = user?.id;
    const appointments = await storage.getCustomerAppointments(customerId);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// Book new appointment (mobile)
router.post("/mobile/customer/appointments", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customerId = user?.id;
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
router.get("/mobile/customer/invoices", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customerId = user?.id;
    const invoices = await storage.getCustomerInvoices(customerId);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// Process mobile payment
router.post("/mobile/payments", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customerId = user?.id;
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
router.get("/mobile/customer/tracking/:jobId", isAuthenticated, async (req: Request, res: Response) => {
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
router.post("/mobile/customer/reviews", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customerId = user?.id;
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
router.get("/mobile/manager/dashboard", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;

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
router.get("/mobile/manager/approvals", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
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
router.patch("/mobile/manager/approvals/:id", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
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
router.get("/mobile/manager/team", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userGarageId = user?.garageId;

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
router.get("/mobile/manager/reports", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
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
router.get("/mobile/manager/alerts", isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
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

export const mobileApiRoutes = router;
