import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const router = Router();

// POST /api/customer-portal/login — public (no auth)
router.post("/customer-portal/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user || user.userType !== "customer") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { comparePassword } = await import("../auth");
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
      },
    });
  } catch (error) {
    console.error("Error logging in to customer portal:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// POST /api/customer-portal/logout — public (no auth)
router.post("/customer-portal/logout", async (req: Request, res: Response) => {
  try {
    const token = req.headers["x-portal-token"];
    if (token) {
      await storage.revokePortalSession(token as string);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

// Portal auth middleware — validates x-portal-token header and attaches req.portalUser
const portalAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["x-portal-token"];
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

// GET /api/customer-portal/me
router.get("/customer-portal/me", portalAuth, async (req: any, res: Response) => {
  try {
    res.json(req.portalUser);
  } catch (error) {
    console.error("Error fetching portal user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// GET /api/customer-portal/appointments
router.get("/customer-portal/appointments", portalAuth, async (req: any, res: Response) => {
  try {
    const customerId = req.portalUser.id;
    const appointments = await storage.getCustomerAppointments(customerId);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching customer appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// GET /api/customer-portal/vehicles
router.get("/customer-portal/vehicles", portalAuth, async (req: any, res: Response) => {
  try {
    const customerId = req.portalUser.id;
    const vehicles = await storage.getCustomerVehicles(customerId);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching customer vehicles:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// GET /api/customer-portal/service-history
router.get("/customer-portal/service-history", portalAuth, async (req: any, res: Response) => {
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

// GET /api/customer-portal/estimates
router.get("/customer-portal/estimates", portalAuth, async (req: any, res: Response) => {
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

// POST /api/customer-portal/estimates/:id/approve
router.post("/customer-portal/estimates/:id/approve", portalAuth, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.portalUser.id;
    const estimate = await storage.approveEstimate(id, customerId);
    res.json(estimate);
  } catch (error: any) {
    console.error("Error approving estimate:", error);
    res.status(error.message?.includes("unauthorized") ? 403 : 500)
      .json({ message: error.message || "Failed to approve estimate" });
  }
});

// GET /api/customer-portal/invoices
router.get("/customer-portal/invoices", portalAuth, async (req: any, res: Response) => {
  try {
    const customerId = req.portalUser.id;
    const invoices = await storage.getCustomerInvoices(customerId);
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// GET /api/customer-portal/payments
router.get("/customer-portal/payments", portalAuth, async (req: any, res: Response) => {
  try {
    const customerId = req.portalUser.id;
    const payments = await storage.getCustomerPayments(customerId);
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

export const customerPortalApiRoutes = router;
