// @ts-nocheck
/**
 * Vendor Catalog & OEM Software Licensing routes -- extracted from the monolith (routes.ts).
 *
 * Covers:
 *   /api/vendor-catalogs           (GET, POST)
 *   /api/vendor-catalogs/:id       (GET, PATCH, DELETE)
 *   /api/oem-products              (GET, POST)
 *   /api/oem-products/:id          (GET, PATCH, DELETE)
 *   /api/subscription-licenses     (GET, POST)
 *   /api/subscription-licenses/:id (GET, PATCH, DELETE)
 *   /api/subscription-licenses/:licenseId/audit-logs (GET)
 *   /api/license-audit-logs        (POST)
 *   /api/entitlement-assignments   (GET, POST)
 *   /api/entitlement-assignments/:id (GET, PATCH)
 */
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';
import {
  insertVendorCatalogSchema,
  insertOemProductSchema,
  insertSubscriptionLicenseSchema,
  insertLicenseAuditLogSchema,
  insertEntitlementAssignmentSchema,
} from '@shared/schema';

const router = Router();

// ========================================================================
// Vendor Catalogs
// ========================================================================

router.post("/vendor-catalogs", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertVendorCatalogSchema.parse(req.body);
    const catalog = await storage.createVendorCatalog(validatedData);
    res.status(201).json(catalog);
  } catch (error: any) {
    console.error("Error creating vendor catalog:", error);
    res.status(400).json({ error: error.message || "Failed to create vendor catalog" });
  }
});

router.get("/vendor-catalogs", isAuthenticated, async (req, res) => {
  try {
    const catalogs = await storage.getVendorCatalogs();
    res.json(catalogs);
  } catch (error) {
    console.error("Error fetching vendor catalogs:", error);
    res.status(500).json({ error: "Failed to fetch vendor catalogs" });
  }
});

router.get("/vendor-catalogs/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const catalog = await storage.getVendorCatalogById(id);
    if (!catalog) {
      return res.status(404).json({ error: "Vendor catalog not found" });
    }
    res.json(catalog);
  } catch (error) {
    console.error("Error fetching vendor catalog:", error);
    res.status(500).json({ error: "Failed to fetch vendor catalog" });
  }
});

router.patch("/vendor-catalogs/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateVendorCatalog(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating vendor catalog:", error);
    res.status(400).json({ error: error.message || "Failed to update vendor catalog" });
  }
});

router.delete("/vendor-catalogs/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteVendorCatalog(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor catalog:", error);
    res.status(500).json({ error: "Failed to delete vendor catalog" });
  }
});

// ========================================================================
// OEM Products
// ========================================================================

router.post("/oem-products", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertOemProductSchema.parse(req.body);
    const product = await storage.createOemProduct(validatedData);
    res.status(201).json(product);
  } catch (error: any) {
    console.error("Error creating OEM product:", error);
    res.status(400).json({ error: error.message || "Failed to create OEM product" });
  }
});

router.get("/oem-products", isAuthenticated, async (req, res) => {
  try {
    const { vendorCatalogId } = req.query;
    const products = await storage.getOemProducts(vendorCatalogId as string | undefined);
    res.json(products);
  } catch (error) {
    console.error("Error fetching OEM products:", error);
    res.status(500).json({ error: "Failed to fetch OEM products" });
  }
});

router.get("/oem-products/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await storage.getOemProductById(id);
    if (!product) {
      return res.status(404).json({ error: "OEM product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching OEM product:", error);
    res.status(500).json({ error: "Failed to fetch OEM product" });
  }
});

router.patch("/oem-products/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateOemProduct(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating OEM product:", error);
    res.status(400).json({ error: error.message || "Failed to update OEM product" });
  }
});

router.delete("/oem-products/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteOemProduct(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting OEM product:", error);
    res.status(500).json({ error: "Failed to delete OEM product" });
  }
});

// ========================================================================
// Subscription Licenses
// ========================================================================

router.post("/subscription-licenses", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertSubscriptionLicenseSchema.parse(req.body);
    const license = await storage.createSubscriptionLicense(validatedData);
    res.status(201).json(license);
  } catch (error: any) {
    console.error("Error creating subscription license:", error);
    res.status(400).json({ error: error.message || "Failed to create subscription license" });
  }
});

router.get("/subscription-licenses", isAuthenticated, async (req, res) => {
  try {
    const { branchId, status } = req.query;
    const licenses = await storage.getSubscriptionLicenses(
      branchId as string | undefined,
      { status: status as string | undefined }
    );
    res.json(licenses);
  } catch (error) {
    console.error("Error fetching subscription licenses:", error);
    res.status(500).json({ error: "Failed to fetch subscription licenses" });
  }
});

router.get("/subscription-licenses/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const license = await storage.getSubscriptionLicenseById(id);
    if (!license) {
      return res.status(404).json({ error: "Subscription license not found" });
    }
    res.json(license);
  } catch (error) {
    console.error("Error fetching subscription license:", error);
    res.status(500).json({ error: "Failed to fetch subscription license" });
  }
});

router.patch("/subscription-licenses/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateSubscriptionLicense(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating subscription license:", error);
    res.status(400).json({ error: error.message || "Failed to update subscription license" });
  }
});

router.delete("/subscription-licenses/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteSubscriptionLicense(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription license:", error);
    res.status(500).json({ error: "Failed to delete subscription license" });
  }
});

// ========================================================================
// License Audit Logs
// ========================================================================

router.post("/license-audit-logs", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    const validatedData = insertLicenseAuditLogSchema.parse({ ...req.body, userId: user.id });
    const log = await storage.createLicenseAuditLog(validatedData);
    res.status(201).json(log);
  } catch (error: any) {
    console.error("Error creating license audit log:", error);
    res.status(400).json({ error: error.message || "Failed to create license audit log" });
  }
});

router.get("/subscription-licenses/:licenseId/audit-logs", isAuthenticated, async (req, res) => {
  try {
    const { licenseId } = req.params;
    const logs = await storage.getLicenseAuditLogs(licenseId);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching license audit logs:", error);
    res.status(500).json({ error: "Failed to fetch license audit logs" });
  }
});

// ========================================================================
// Entitlement Assignments
// ========================================================================

router.post("/entitlement-assignments", isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertEntitlementAssignmentSchema.parse(req.body);
    const assignment = await storage.createEntitlementAssignment(validatedData);
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error("Error creating entitlement assignment:", error);
    res.status(400).json({ error: error.message || "Failed to create entitlement assignment" });
  }
});

router.get("/entitlement-assignments", isAuthenticated, async (req, res) => {
  try {
    const { licenseId, userId } = req.query;
    const assignments = await storage.getEntitlementAssignments(
      licenseId as string | undefined,
      userId as string | undefined
    );
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching entitlement assignments:", error);
    res.status(500).json({ error: "Failed to fetch entitlement assignments" });
  }
});

router.get("/entitlement-assignments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await storage.getEntitlementAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({ error: "Entitlement assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    console.error("Error fetching entitlement assignment:", error);
    res.status(500).json({ error: "Failed to fetch entitlement assignment" });
  }
});

router.patch("/entitlement-assignments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await storage.updateEntitlementAssignment(id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating entitlement assignment:", error);
    res.status(400).json({ error: error.message || "Failed to update entitlement assignment" });
  }
});

export default router;
