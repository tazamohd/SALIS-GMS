import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// Resolve the tenant strictly from the authenticated session — never from a
// client-supplied garage_id, which would allow cross-tenant access (IDOR).
function sessionGarageId(req: any): string | undefined {
  return req.user?.garageId;
}

// Loads a customer and confirms it belongs to the caller's garage. Returns the
// customer on success, or null after sending the appropriate 403/404 response.
async function loadOwnedCustomer(req: any, res: any, id: string) {
  const garageId = sessionGarageId(req);
  if (!garageId) {
    res.status(403).json({ message: "No garage associated with this account" });
    return null;
  }
  const customer = await storage.getCustomer(id);
  if (!customer || (customer as any).garageId !== garageId) {
    res.status(404).json({ message: "Customer not found" });
    return null;
  }
  return customer;
}

// Get all customers (scoped to the caller's garage)
router.get("/customers", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = sessionGarageId(req);
    if (!garageId) {
      return res.status(403).json({ message: "No garage associated with this account" });
    }
    const { search } = req.query;
    const customers = await storage.getCustomers(garageId, search as string);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Create new customer (always bound to the caller's garage)
router.post("/customers", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = sessionGarageId(req);
    if (!garageId) {
      return res.status(403).json({ message: "No garage associated with this account" });
    }
    const { fullName, firstName, lastName, email, phone, nationalId, address, nationality, preferredLanguage } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ message: "Name and email are required" });
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

// Get customer by ID (ownership enforced)
router.get("/customers/:id", isAuthenticated, async (req: any, res) => {
  try {
    const customer = await loadOwnedCustomer(req, res, req.params.id);
    if (!customer) return;
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
});

// Get customer vehicles
router.get("/customers/:id/vehicles", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedCustomer(req, res, req.params.id))) return;
    const vehicles = await storage.getCustomerVehicles(req.params.id);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    res.status(500).json({ message: "Failed to fetch customer vehicles" });
  }
});

// Get customer job cards
router.get("/customers/:id/job-cards", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedCustomer(req, res, req.params.id))) return;
    const jobCards = await storage.getCustomerJobCards(req.params.id);
    res.json(jobCards);
  } catch (error) {
    console.error("Error fetching customer job cards:", error);
    res.status(500).json({ message: "Failed to fetch customer job cards" });
  }
});

// Get customer invoices
router.get("/customers/:id/invoices", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedCustomer(req, res, req.params.id))) return;
    const invoices = await storage.getCustomerInvoices(req.params.id);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    res.status(500).json({ message: "Failed to fetch customer invoices" });
  }
});

// Get customer payments
router.get("/customers/:id/payments", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedCustomer(req, res, req.params.id))) return;
    const payments = await storage.getCustomerPayments(req.params.id);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching customer payments:", error);
    res.status(500).json({ message: "Failed to fetch customer payments" });
  }
});

// Get customer notes
router.get("/customers/:id/notes", isAuthenticated, async (req: any, res) => {
  try {
    if (!(await loadOwnedCustomer(req, res, req.params.id))) return;
    const notes = await storage.getCustomerNotes(req.params.id);
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
    if (!(await loadOwnedCustomer(req, res, id))) return;
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
