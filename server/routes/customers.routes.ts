import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { resolveGarageScope } from "../middleware/garageScope";
import { maybePaginate } from "../middleware/pagination";

const router = Router();

// Get all customers
router.get("/customers", isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    // Scope to the caller's garage — never trust a client-supplied garage_id
    // (prevents cross-tenant reads). Platform admins may override.
    const garageId = resolveGarageScope(req);
    const customers = await storage.getCustomers(garageId as string, search as string);
    // Opt-in pagination: plain array unless ?page/?limit is passed.
    res.json(maybePaginate(req, customers));
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Create new customer
router.post("/customers", isAuthenticated, async (req: any, res) => {
  try {
    const { fullName, firstName, lastName, email, phone, garageId, nationalId, address, nationality, preferredLanguage } = req.body;

    if (!fullName || !email || !garageId) {
      return res.status(400).json({ message: "Name, email, and garage are required" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "A customer with this email already exists" });
    }

    const bcrypt = await import("bcrypt");
    const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

    const customer = await storage.createUser({
      fullName,
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      phone: phone || null,
      password: tempPassword,
      garageId,
      nationalId: nationalId || null,
      userType: "customer",
      isActive: true,
    });

    if (address || nationality || preferredLanguage) {
      try {
        await storage.createCustomerProfile({
          userId: customer.id,
          address: address || null,
          nationality: nationality || null,
          preferredLanguage: preferredLanguage || null,
        });
      } catch (profileError) {
        console.error("Error creating customer profile:", profileError);
      }
    }

    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Failed to create customer" });
  }
});

// Get customer by ID
router.get("/customers/:id", isAuthenticated, async (req, res) => {
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

// Get customer vehicles
router.get("/customers/:id/vehicles", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const vehicles = await storage.getCustomerVehicles(id);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    res.status(500).json({ message: "Failed to fetch customer vehicles" });
  }
});

// Get customer job cards
router.get("/customers/:id/job-cards", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const jobCards = await storage.getCustomerJobCards(id);
    res.json(jobCards);
  } catch (error) {
    console.error("Error fetching customer job cards:", error);
    res.status(500).json({ message: "Failed to fetch customer job cards" });
  }
});

// Get customer invoices
router.get("/customers/:id/invoices", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await storage.getCustomerInvoices(id);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    res.status(500).json({ message: "Failed to fetch customer invoices" });
  }
});

// Get customer payments
router.get("/customers/:id/payments", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await storage.getCustomerPayments(id);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching customer payments:", error);
    res.status(500).json({ message: "Failed to fetch customer payments" });
  }
});

// Get customer notes
router.get("/customers/:id/notes", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await storage.getCustomerNotes(id);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching customer notes:", error);
    res.status(500).json({ message: "Failed to fetch customer notes" });
  }
});

// Create customer note
router.post("/customers/:id/notes", isAuthenticated, async (req: any, res) => {
  try {
    const { insertCustomerNoteSchema } = await import("@shared/schema");
    const { id } = req.params;
    const userId = req.user?.id || "default-user";

    const validationResult = insertCustomerNoteSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const noteData = {
      ...validationResult.data,
      customerId: id,
      createdBy: userId,
    };

    const note = await storage.createCustomerNote(noteData);
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating customer note:", error);
    res.status(500).json({ message: "Failed to create customer note" });
  }
});

// Delete customer note
router.delete("/customer-notes/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteCustomerNote(id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Failed to delete note" });
  }
});

export const customerRoutes = router;
