import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Miscellaneous Routes
 *
 * Currently hosts the smart global search. Tools, service-templates, notifications
 * and backup remain served by the legacy monolith (`server/routes.ts`) until they are
 * migrated to DB-backed modular handlers in later sprints — see `routes/index.ts`.
 *
 * - GET /api/search - Smart cross-domain search (tenant-scoped)
 */

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

// Smart Search API — searches across customers, vehicles, parts, invoices, job cards,
// appointments. All tenant-private data is scoped to the caller's garage; the spare-parts
// catalogue is global by design (`storage.getSpareParts()` is not garage-scoped).
router.get("/search", isAuthenticated, async (req: any, res) => {
  try {
    const query = ((req.query.q as string) || "").toLowerCase().trim();
    if (query.length < 2) {
      return res.json([]);
    }

    const garageId = req.user?.garageId;
    const results: SearchResult[] = [];
    const limit = 5; // per category

    // Customers (tenant-scoped)
    const customers = await storage.getCustomers(garageId);
    customers
      .filter(
        (c: any) =>
          c.fullName?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.includes(query),
      )
      .slice(0, limit)
      .forEach((c: any) => {
        results.push({
          id: c.id,
          type: "customer",
          title: c.fullName || c.email,
          subtitle: c.phone || c.email,
          href: `/customers?id=${c.id}`,
        });
      });

    // Vehicles (tenant-scoped)
    const vehicles = await storage.getVehicles(garageId);
    vehicles
      .filter(
        (v: any) =>
          v.licensePlate?.toLowerCase().includes(query) ||
          v.vin?.toLowerCase().includes(query) ||
          v.make?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query),
      )
      .slice(0, limit)
      .forEach((v: any) => {
        results.push({
          id: v.id,
          type: "vehicle",
          title: `${v.make} ${v.model} (${v.year || ""})`,
          subtitle: v.licensePlate || v.vin || "No plate",
          href: `/vehicles?id=${v.id}`,
        });
      });

    // Spare parts (global catalogue)
    const parts = await storage.getSpareParts();
    parts
      .filter(
        (p: any) =>
          p.partNumber?.toLowerCase().includes(query) ||
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      )
      .slice(0, limit)
      .forEach((p: any) => {
        results.push({
          id: p.id,
          type: "part",
          title: p.name || p.partNumber,
          subtitle: `${p.partNumber} - $${p.unitPrice || 0}`,
          href: `/inventory?id=${p.id}`,
        });
      });

    // Invoices (tenant-scoped)
    const invoices = await storage.getInvoices(garageId);
    invoices
      .filter(
        (inv: any) =>
          inv.invoiceNumber?.toLowerCase().includes(query) || inv.id?.includes(query),
      )
      .slice(0, limit)
      .forEach((inv: any) => {
        results.push({
          id: inv.id,
          type: "invoice",
          title: inv.invoiceNumber || `Invoice #${inv.id.substring(0, 8)}`,
          subtitle: `$${inv.totalAmount || 0} - ${inv.status}`,
          href: `/invoices?id=${inv.id}`,
        });
      });

    // Job cards (tenant-scoped)
    const jobCards = await storage.getJobCards(garageId);
    jobCards
      .filter((jc: any) => {
        const vehicleInfo = jc.vehicleInfo as any;
        return (
          jc.id?.toLowerCase().includes(query) ||
          jc.serviceType?.toLowerCase().includes(query) ||
          vehicleInfo?.make?.toLowerCase().includes(query) ||
          vehicleInfo?.model?.toLowerCase().includes(query) ||
          vehicleInfo?.customerName?.toLowerCase().includes(query)
        );
      })
      .slice(0, limit)
      .forEach((jc: any) => {
        const vehicleInfo = jc.vehicleInfo as any;
        results.push({
          id: jc.id,
          type: "jobcard",
          title: `Job #${jc.id.substring(0, 8).toUpperCase()}`,
          subtitle: `${vehicleInfo?.make || ""} ${vehicleInfo?.model || ""} - ${jc.status}`,
          href: `/job-cards?id=${jc.id}`,
        });
      });

    // Appointments (tenant-scoped)
    const appointments = await storage.getAppointments(garageId);
    appointments
      .filter(
        (apt: any) =>
          apt.notes?.toLowerCase().includes(query) ||
          apt.serviceType?.toLowerCase().includes(query),
      )
      .slice(0, limit)
      .forEach((apt: any) => {
        results.push({
          id: apt.id,
          type: "appointment",
          title: apt.serviceType || "Appointment",
          subtitle: apt.scheduledDate
            ? new Date(apt.scheduledDate).toLocaleDateString()
            : "No date",
          href: `/appointments?id=${apt.id}`,
        });
      });

    res.json(results.slice(0, 20)); // overall limit
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

export const miscRoutes = router;
