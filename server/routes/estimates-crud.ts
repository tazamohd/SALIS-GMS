// @ts-nocheck
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

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

const router = Router();

// GET /estimates — List estimates
router.get('/estimates', isAuthenticated, async (req, res) => {
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

// GET /estimates/:id — Single estimate
router.get('/estimates/:id', isAuthenticated, async (req, res) => {
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

// POST /estimates/with-items — Create estimate with items
router.post('/estimates/with-items', isAuthenticated, async (req: any, res) => {
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

// PATCH /estimates/:id — Update estimate
router.patch('/estimates/:id', isAuthenticated, async (req, res) => {
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

// DELETE /estimates/:id — Delete estimate
router.delete('/estimates/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteEstimate(id);
    res.json({ message: "Estimate deleted successfully" });
  } catch (error) {
    console.error("Error deleting estimate:", error);
    res.status(500).json({ message: "Failed to delete estimate" });
  }
});

// GET /estimates/:id/items — Get estimate items
router.get('/estimates/:id/items', isAuthenticated, async (req, res) => {
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
router.post('/estimates/:id/convert-to-job-card', isAuthenticated, async (req: any, res) => {
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
router.post('/estimates/:id/convert-to-invoice', isAuthenticated, async (req: any, res) => {
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

export default router;
