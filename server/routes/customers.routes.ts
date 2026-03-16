import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Customer Management Routes
 * - GET /api/customers - List all customers
 * - POST /api/customers - Create new customer
 * - GET /api/customers/:id - Get customer details
 * - GET /api/customers/:id/vehicles - Get customer vehicles
 * - GET /api/customers/:id/job-cards - Get customer job cards
 * - GET /api/customers/:id/invoices - Get customer invoices
 * - GET /api/customers/:id/payments - Get customer payments
 * - GET /api/customer-notes - Get customer notes
 */

// Get all customers
router.get("/customers", isAuthenticated, async (req, res) => {
  try {
    const { garage_id, search } = req.query;
    const customers = await storage.getCustomers(
      garage_id as string,
      search as string
    );
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Create new customer
router.post("/customers", isAuthenticated, async (req: any, res) => {
  try {
    const {
      fullName,
      firstName,
      lastName,
      email,
      phone,
      garageId,
      nationalId,
      address,
      nationality,
      preferredLanguage,
    } = req.body;

    if (!fullName || !email || !garageId) {
      return res
        .status(400)
        .json({ message: "Name, email, and garage are required" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A customer with this email already exists" });
    }

    const bcrypt = await import("bcrypt");
    const tempPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-8),
      10
    );

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
router.get(
  "/customers/:id/vehicles",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const vehicles = await storage.getCustomerVehicles(id);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch customer vehicles" });
    }
  }
);

// Get customer job cards
router.get(
  "/customers/:id/job-cards",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const jobCards = await storage.getCustomerJobCards(id);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching customer job cards:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch customer job cards" });
    }
  }
);

// Get customer invoices
router.get(
  "/customers/:id/invoices",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const invoices = await storage.getCustomerInvoices(id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch customer invoices" });
    }
  }
);

// Get customer payments
router.get(
  "/customers/:id/payments",
  isAuthenticated,
  async (req, res) => {
    try {
      const { id } = req.params;
      const payments = await storage.getCustomerPayments(id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching customer payments:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch customer payments" });
    }
  }
);

// Get customer notes
router.get(
  "/customer-notes",
  isAuthenticated,
  async (req, res) => {
    try {
      const { customerId } = req.query;
      if (!customerId) {
        return res
          .status(400)
          .json({ message: "Customer ID is required" });
      }
      const notes = await storage.getCustomerNotes(customerId as string);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching customer notes:", error);
      res.status(500).json({ message: "Failed to fetch customer notes" });
    }
  }
);

// Create customer note
router.post(
  "/customer-notes",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { customerId, note } = req.body;
      const userId = req.user?.id || "default-user";

      if (!customerId || !note) {
        return res
          .status(400)
          .json({ message: "Customer ID and note are required" });
      }

      const createdNote = await storage.createCustomerNote({
        customerId,
        note,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(createdNote);
    } catch (error) {
      console.error("Error creating customer note:", error);
      res.status(500).json({ message: "Failed to create customer note" });
    }
  }
);

export const customerRoutes = router;
