// @ts-nocheck
/**
 * Financial & Operations routes — extracted from the monolith (routes.ts).
 *
 * Covers:
 *   /api/expenses                              (GET, POST)
 *   /api/expenses/:id/approve                  (PATCH)
 *   /api/expenses/:id/reject                   (PATCH)
 *   /api/payment-plans                         (GET, POST)
 *   /api/payment-plans/:id                     (GET, PATCH)
 *   /api/tax-configurations                    (GET, POST)
 *   /api/tax-configurations/:id                (PATCH, DELETE)
 *   /api/insurance-claims                      (GET, POST)
 *   /api/insurance/claims                      (GET, POST)
 *   /api/insurance/claims/:id/status           (PATCH)
 *   /api/insurance/claims/analytics            (GET)
 *   /api/contracts/enhanced                    (GET)
 *   /api/contracts/:id/trigger-renewal         (POST)
 *   /api/contracts/:id/accept-renewal          (POST)
 *   /api/contracts/:contractId/trigger-renewal (POST)
 *   /api/contracts/:contractId/renewals/:renewalId/accept (POST)
 *   /api/accounting/connect                    (POST)
 *   /api/accounting/dashboard                  (GET)
 *   /api/accounting/sync                       (POST)
 *   /api/qr-codes/generate                     (POST)
 *   /api/qr-codes/scan                         (POST)
 *   /api/qr-codes/check-in                     (POST)
 *   /api/qr-codes/customer/:customerId         (GET)
 *   /api/qr-codes/appointment/:appointmentId   (GET)
 *   /api/qr-codes/scan-logs/:qrCodeId          (GET)
 *   /api/qr-codes/scan-logs/garage/:garageId   (GET)
 *   /api/filter-presets                        (GET, POST)
 *   /api/filter-presets/:id                    (PUT, DELETE)
 *   /api/media-attachments                     (POST)
 *   /api/media-attachments/:relatedType/:relatedId (GET)
 *   /api/media-attachments/:id                 (DELETE, PATCH)
 */
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  fleetContracts,
  contractUtilization,
  contractSLAMetrics,
  contractRenewals,
  insertSavedFilterPresetSchema,
  insertExpenseSchema,
} from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import * as phase3Service from "../phase3-integrations-service";
import * as phase6Service from "../phase6-compliance-service";
import { smsService } from "../services/smsService";

const router = Router();

// ── helpers ──────────────────────────────────────────────────────────
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

const insuranceClaimSchema = z.object({
  claimNumber: z.string(),
  jobCardId: z.string().optional(),
  customerId: z.string(),
  vehicleId: z.string(),
  insuranceCompany: z.string(),
  policyNumber: z.string(),
  claimType: z.enum(["collision", "comprehensive", "liability", "warranty"]),
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
  status: z.enum(["submitted", "under-review", "approved", "partially-approved", "denied", "paid"]),
  notes: z.string().optional(),
});

// =====================================================================
// EXPENSES
// =====================================================================

router.get("/expenses", isAuthenticated, async (req: any, res) => {
  try {
    const expenses = await storage.getExpenses(req.user?.garageId, req.query.status, req.query.categoryId);
    res.json({ data: expenses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/expenses", isAuthenticated, async (req: any, res) => {
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

router.patch("/expenses/:id/approve", isAuthenticated, async (req: any, res) => {
  try {
    const expense = await storage.approveExpense(req.params.id, req.user?.id);
    res.json({ data: expense });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/expenses/:id/reject", isAuthenticated, async (req: any, res) => {
  try {
    const expense = await storage.rejectExpense(req.params.id, req.user?.id);
    res.json({ data: expense });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================================
// PAYMENT PLANS
// =====================================================================

router.get("/payment-plans", isAuthenticated, async (req: any, res) => {
  try {
    const { invoiceId } = req.query;
    const plans = await storage.getPaymentPlans(invoiceId);
    res.json(plans);
  } catch (error) {
    console.error("Error fetching payment plans:", error);
    res.status(500).json({ message: "Failed to fetch payment plans" });
  }
});

router.get("/payment-plans/:id", isAuthenticated, async (req: any, res) => {
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

router.post("/payment-plans", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || "default-user";
    const plan = await storage.createPaymentPlan({ ...req.body, createdBy: userId });
    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating payment plan:", error);
    res.status(500).json({ message: "Failed to create payment plan" });
  }
});

router.patch("/payment-plans/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const plan = await storage.updatePaymentPlan(id, req.body);
    res.json(plan);
  } catch (error) {
    console.error("Error updating payment plan:", error);
    res.status(500).json({ message: "Failed to update payment plan" });
  }
});

// =====================================================================
// TAX CONFIGURATIONS
// =====================================================================

router.get("/tax-configurations", isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, isActive } = req.query;
    if (!garageId) {
      return res.status(400).json({ message: "garageId is required" });
    }
    const configs = await storage.getTaxConfigurations(
      garageId,
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    );
    res.json(configs);
  } catch (error) {
    console.error("Error fetching tax configurations:", error);
    res.status(500).json({ message: "Failed to fetch tax configurations" });
  }
});

router.post("/tax-configurations", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || "default-user";
    const config = await storage.createTaxConfiguration({ ...req.body, createdBy: userId });
    res.status(201).json(config);
  } catch (error) {
    console.error("Error creating tax configuration:", error);
    res.status(500).json({ message: "Failed to create tax configuration" });
  }
});

router.patch("/tax-configurations/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const config = await storage.updateTaxConfiguration(id, req.body);
    res.json(config);
  } catch (error) {
    console.error("Error updating tax configuration:", error);
    res.status(500).json({ message: "Failed to update tax configuration" });
  }
});

router.delete("/tax-configurations/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteTaxConfiguration(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting tax configuration:", error);
    res.status(500).json({ message: "Failed to delete tax configuration" });
  }
});

// =====================================================================
// INSURANCE
// =====================================================================

// Insurance Claims - Module 89 (stub routes)
router.get("/insurance-claims", isAuthenticated, async (req, res) => {
  res.json([
    { id: "CLM-2024-001", customer: "John Smith", vehicle: "2020 Honda Civic", claimAmount: 3500, status: "approved" },
  ]);
});

router.post("/insurance-claims", isAuthenticated, async (req, res) => {
  res.status(201).json({ id: "CLM-NEW", ...req.body });
});

// Insurance Claims - full implementation
router.post("/insurance/claims", isAuthenticated, async (req: any, res) => {
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

router.get("/insurance/claims", isAuthenticated, async (req: any, res) => {
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

router.patch("/insurance/claims/:id/status", isAuthenticated, async (req, res) => {
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

router.get("/insurance/claims/analytics", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const analytics = await phase6Service.getClaimsAnalytics(garageId);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching claims analytics:", error);
    res.status(500).json({ message: "Failed to fetch claims analytics" });
  }
});

// =====================================================================
// CONTRACTS (enhanced fleet contract management)
// =====================================================================

router.get("/contracts/enhanced", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;

    // Fetch all contracts for the garage
    const contracts = await db.select().from(fleetContracts).where(eq(fleetContracts.garageId, garageId));

    // Fetch related data for each contract
    const enhancedContracts = await Promise.all(
      contracts.map(async (contract) => {
        const [utilization, slaMetrics, renewals] = await Promise.all([
          db.select().from(contractUtilization).where(eq(contractUtilization.contractId, contract.id)),
          db.select().from(contractSLAMetrics).where(eq(contractSLAMetrics.contractId, contract.id)),
          db.select().from(contractRenewals).where(eq(contractRenewals.contractId, contract.id)).orderBy(desc(contractRenewals.createdAt)),
        ]);

        return {
          ...contract,
          utilization,
          slaMetrics,
          renewals,
        };
      }),
    );

    res.json(enhancedContracts);
  } catch (error) {
    console.error("Error fetching enhanced contracts:", error);
    res.status(500).json({ message: "Failed to fetch enhanced contracts" });
  }
});

router.post("/contracts/:id/trigger-renewal", isAuthenticated, async (req: any, res) => {
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

    const [renewal] = await db
      .insert(contractRenewals)
      .values({
        contractId,
        renewalStatus: "pending",
        proposedStartDate: contract.endDate,
        proposedEndDate: newEndDate.toISOString(),
        proposedValue: contract.monthlyValue ? contract.monthlyValue * 12 : contract.totalValue,
        proposedTerms: contract.terms,
        notificationSentAt: new Date().toISOString(),
      })
      .returning();

    res.status(201).json(renewal);
  } catch (error) {
    console.error("Error triggering contract renewal:", error);
    res.status(500).json({ message: "Failed to trigger contract renewal" });
  }
});

router.post("/contracts/:id/accept-renewal", isAuthenticated, async (req: any, res) => {
  try {
    const contractId = req.params.id;
    const { renewalId } = req.body;

    if (!renewalId) {
      return res.status(400).json({ message: "Renewal ID is required" });
    }

    // Update renewal status
    await db
      .update(contractRenewals)
      .set({
        renewalStatus: "accepted",
        acceptedAt: new Date().toISOString(),
      })
      .where(eq(contractRenewals.id, renewalId));

    // Fetch the renewal to get proposed dates and values
    const [renewal] = await db.select().from(contractRenewals).where(eq(contractRenewals.id, renewalId));

    if (!renewal) {
      return res.status(404).json({ message: "Renewal not found" });
    }

    // Update the contract with new dates and values
    const [updatedContract] = await db
      .update(fleetContracts)
      .set({
        startDate: renewal.proposedStartDate,
        endDate: renewal.proposedEndDate,
        totalValue: renewal.proposedValue,
        terms: renewal.proposedTerms,
        status: "active",
      })
      .where(eq(fleetContracts.id, contractId))
      .returning();

    res.json(updatedContract);
  } catch (error) {
    console.error("Error accepting contract renewal:", error);
    res.status(500).json({ message: "Failed to accept contract renewal" });
  }
});

router.post("/contracts/:contractId/trigger-renewal", isAuthenticated, async (req: any, res) => {
  try {
    const { addMonths, addDays } = await import("date-fns");

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
    const [renewal] = await db
      .insert(contractRenewals)
      .values({
        contractId: contract.id,
        renewalType: contract.autoRenew ? "automatic" : "manual",
        proposedStartDate: proposedStart,
        proposedEndDate: proposedEnd,
        proposedMonthlyFee: contract.monthlyFee,
        notificationSentAt: new Date(),
        status: "notified",
        createdBy: req.user?.id,
      })
      .returning();

    // Update contract status
    await db
      .update(fleetContracts)
      .set({ status: "pending_renewal" })
      .where(eq(fleetContracts.id, contract.id));

    res.json(renewal);
  } catch (error) {
    console.error("Error triggering renewal:", error);
    res.status(500).json({ message: "Failed to trigger renewal" });
  }
});

router.post("/contracts/:contractId/renewals/:renewalId/accept", isAuthenticated, async (req: any, res) => {
  try {
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
    const [newContract] = await db
      .insert(fleetContracts)
      .values({
        ...oldContract,
        id: undefined,
        contractNumber: `${oldContract.contractNumber}-R`,
        startDate: renewal.proposedStartDate,
        endDate: renewal.proposedEndDate,
        monthlyFee: renewal.proposedMonthlyFee || oldContract.monthlyFee,
        status: "active",
        createdBy: req.user?.id,
      })
      .returning();

    // Update renewal record
    await db
      .update(contractRenewals)
      .set({
        status: "completed",
        customerResponse: "accepted",
        customerResponseDate: new Date(),
        renewedContractId: newContract.id,
      })
      .where(eq(contractRenewals.id, renewal.id));

    // Update old contract
    await db
      .update(fleetContracts)
      .set({ status: "expired" })
      .where(eq(fleetContracts.id, oldContract.id));

    res.json({ renewal, newContract });
  } catch (error) {
    console.error("Error accepting renewal:", error);
    res.status(500).json({ message: "Failed to accept renewal" });
  }
});

// =====================================================================
// ACCOUNTING
// =====================================================================

router.post("/accounting/connect", isAuthenticated, async (req: any, res) => {
  try {
    const { platform } = req.body;
    const result = await phase3Service.initiateAccountingConnection(req.user?.garageId, platform);
    res.json(result);
  } catch (error: any) {
    console.error("Error connecting accounting:", error);
    res.status(500).json({ message: error.message || "Failed to connect accounting provider" });
  }
});

router.get("/accounting/dashboard", isAuthenticated, async (req: any, res) => {
  try {
    const dashboard = await phase3Service.getAccountingDashboard(req.user?.garageId);
    res.json(dashboard);
  } catch (error: any) {
    console.error("Error fetching accounting dashboard:", error);
    res.status(500).json({ message: error.message || "Failed to fetch accounting dashboard" });
  }
});

router.post("/accounting/sync", isAuthenticated, async (req: any, res) => {
  try {
    const { connectionId, syncType } = req.body;
    const result = await phase3Service.syncAccountingData(connectionId, syncType);
    res.json(result);
  } catch (error: any) {
    console.error("Error syncing accounting:", error);
    res.status(500).json({ message: error.message || "Failed to sync accounting data" });
  }
});

// =====================================================================
// QR CODES
// =====================================================================

router.post("/qr-codes/generate", isAuthenticated, async (req: any, res) => {
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
      errorCorrectionLevel: "H",
      type: "image/png",
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
      tokenType: tokenType || "appointment",
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

router.post("/qr-codes/scan", isAuthenticated, async (req: any, res) => {
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
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
        scanResult: "invalid",
      });

      return res.status(404).json({ message: "Invalid QR code", scanResult: "invalid" });
    }

    // Check if expired
    if (new Date() > new Date(qrToken.expiresAt)) {
      await storage.createQRScanLog({
        qrCodeId: qrToken.id,
        scannedBy: req.user?.id,
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
        scanResult: "expired",
      });

      return res.status(400).json({ message: "QR code has expired", scanResult: "expired" });
    }

    // Check if already used
    if (qrToken.isUsed) {
      await storage.createQRScanLog({
        qrCodeId: qrToken.id,
        scannedBy: req.user?.id,
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
        scanResult: "already_used",
      });

      return res.status(400).json({ message: "QR code has already been used", scanResult: "already_used" });
    }

    // Log successful scan
    await storage.createQRScanLog({
      qrCodeId: qrToken.id,
      scannedBy: req.user?.id,
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.connection.remoteAddress,
      scanResult: "success",
    });

    res.json({
      message: "QR code scanned successfully",
      scanResult: "success",
      qrToken,
    });
  } catch (error) {
    console.error("Error scanning QR code:", error);
    res.status(500).json({ message: "Failed to scan QR code" });
  }
});

router.post("/qr-codes/check-in", isAuthenticated, async (req: any, res) => {
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
      if (appointment && appointment.status === "confirmed") {
        await storage.updateAppointment(qrToken.appointmentId, {
          status: "checked_in",
        });

        // Create status history entry
        await storage.createAppointmentStatusHistory({
          appointmentId: qrToken.appointmentId,
          status: "checked_in",
          notes: notes || "Customer checked in via QR code",
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
                message: `You've successfully checked in for your appointment. We'll be with you shortly!`,
              },
              category: "appointment",
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
      type: "appointment",
      category: "appointment",
      title: "Check-in Successful",
      message: "You have successfully checked in. We will be with you shortly.",
      garageId: req.user?.garageId,
    });

    res.json({
      message: "Check-in successful",
      qrToken,
      appointmentId: qrToken.appointmentId,
    });
  } catch (error) {
    console.error("Error processing check-in:", error);
    res.status(500).json({ message: "Failed to process check-in" });
  }
});

router.get("/qr-codes/customer/:customerId", isAuthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const tokens = await storage.getQRCodeTokensByCustomer(customerId);
    res.json(tokens);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    res.status(500).json({ message: "Failed to fetch QR codes" });
  }
});

router.get("/qr-codes/appointment/:appointmentId", isAuthenticated, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const tokens = await storage.getQRCodeTokensByAppointment(appointmentId);
    res.json(tokens);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    res.status(500).json({ message: "Failed to fetch QR codes" });
  }
});

router.get("/qr-codes/scan-logs/:qrCodeId", isAuthenticated, async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const logs = await storage.getQRScanLogsByToken(qrCodeId);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching scan logs:", error);
    res.status(500).json({ message: "Failed to fetch scan logs" });
  }
});

router.get("/qr-codes/scan-logs/garage/:garageId", isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.params;
    const { limit } = req.query;
    const logs = await storage.getQRScanLogsByGarage(garageId, limit ? parseInt(limit as string) : undefined);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching scan logs:", error);
    res.status(500).json({ message: "Failed to fetch scan logs" });
  }
});

// =====================================================================
// FILTER PRESETS
// =====================================================================

router.get("/filter-presets", isAuthenticated, async (req: any, res) => {
  try {
    const { garageId, module } = req.query;
    const userId = req.user?.id || "default-user";
    const presets = await storage.getSavedFilterPresets(garageId, userId, module);
    res.json(presets);
  } catch (error) {
    console.error("Error getting filter presets:", error);
    res.status(500).json({ message: "Failed to get filter presets" });
  }
});

router.post("/filter-presets", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id || "default-user";
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

router.put("/filter-presets/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const preset = await storage.updateSavedFilterPreset(id, req.body);
    res.json(preset);
  } catch (error) {
    console.error("Error updating filter preset:", error);
    res.status(500).json({ message: "Failed to update filter preset" });
  }
});

router.delete("/filter-presets/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    await storage.deleteSavedFilterPreset(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting filter preset:", error);
    res.status(500).json({ message: "Failed to delete filter preset" });
  }
});

// =====================================================================
// MEDIA ATTACHMENTS
// =====================================================================

router.post("/media-attachments", isAuthenticated, async (req: any, res) => {
  try {
    const {
      relatedType, relatedId, mediaType, fileUrl, fileName,
      fileSize, mimeType, category, description, thumbnailUrl, metadata,
    } = req.body;
    const garageId = req.user?.garageId;
    const userId = req.user?.id || "default-user";

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
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (mimeType && !allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ message: "Invalid file type. Only images, videos, and documents (PDF, DOC, DOCX) are allowed" });
    }

    // Validate base64 format if provided
    if (fileUrl.startsWith("data:")) {
      const base64Regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,([A-Za-z0-9+/=]+)$/;
      if (!base64Regex.test(fileUrl)) {
        return res.status(400).json({ message: "Invalid base64 data format" });
      }

      // Extract and verify base64 size matches reported size
      const base64Data = fileUrl.split(",")[1];
      const estimatedSize = (base64Data.length * 3) / 4;
      if (estimatedSize > MAX_FILE_SIZE) {
        return res.status(400).json({ message: "File size exceeds 10MB limit" });
      }
    }

    // Validate media type matches file extension
    const mediaTypeMapping: Record<string, string[]> = {
      photo: ["jpg", "jpeg", "png", "gif", "webp"],
      video: ["mp4", "webm", "mov"],
      document: ["pdf", "doc", "docx"],
    };

    const fileExtension = fileName.split(".").pop()?.toLowerCase();
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

router.get("/media-attachments/:relatedType/:relatedId", isAuthenticated, async (req, res) => {
  try {
    const { relatedType, relatedId } = req.params;
    const { category } = req.query;
    const media = await storage.getMediaAttachments(relatedType, relatedId, category as string | undefined);
    res.json(media);
  } catch (error) {
    console.error("Error fetching media attachments:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

router.delete("/media-attachments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteMediaAttachment(id);
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media attachment:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
});

router.patch("/media-attachments/:id", isAuthenticated, async (req, res) => {
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

export default router;
