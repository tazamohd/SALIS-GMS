import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireAdmin } from '../middleware/requireRole';
import { db } from '../db';
import { storage } from '../storage';
import { users, vehicles, jobCards, invoices, appointments, spareParts, sparePartInventories } from '../../shared/schema';
import { count } from 'drizzle-orm';

const router = Router();

// GET /api/backup/status — Last backup time, size, count
router.get('/backup/status', isAuthenticated, requireAdmin, async (_req, res) => {
  try {
    const [latest, stats] = await Promise.all([
      storage.getLatestBackup(),
      storage.getBackupStats(),
    ]);
    res.json({
      lastBackupTime: latest?.createdAt ?? null,
      lastBackupSize: latest?.size ?? 0,
      backupCount: stats.count,
      nextScheduled: null, // scheduled backups not implemented in dev
      storageUsed: stats.totalSize,
    });
  } catch (error: any) {
    console.error('Backup status error:', error);
    res.status(500).json({ error: 'Failed to get backup status' });
  }
});

// POST /api/backup/create — Create a new backup snapshot
router.post('/backup/create', isAuthenticated, requireAdmin, async (_req, res) => {
  try {
    // Gather counts from key tables
    const [customerCount] = await db.select({ count: count() }).from(users);
    const [vehicleCount] = await db.select({ count: count() }).from(vehicles);
    const [jobCardCount] = await db.select({ count: count() }).from(jobCards);
    const [invoiceCount] = await db.select({ count: count() }).from(invoices);
    const [appointmentCount] = await db.select({ count: count() }).from(appointments);
    const [partCount] = await db.select({ count: count() }).from(spareParts);
    const [inventoryCount] = await db.select({ count: count() }).from(sparePartInventories);

    const tableCounts: Record<string, number> = {
      users: Number(customerCount?.count ?? 0),
      vehicles: Number(vehicleCount?.count ?? 0),
      job_cards: Number(jobCardCount?.count ?? 0),
      invoices: Number(invoiceCount?.count ?? 0),
      appointments: Number(appointmentCount?.count ?? 0),
      spare_parts: Number(partCount?.count ?? 0),
      spare_part_inventories: Number(inventoryCount?.count ?? 0),
    };

    const totalRecords = Object.values(tableCounts).reduce((a, b) => a + b, 0);
    // Estimate ~500 bytes per record for size approximation
    const estimatedSize = totalRecords * 500;

    const stamp = Date.now();
    const backup = await storage.createBackupHistory({
      backupRef: `backup-${stamp}`,
      type: 'full',
      size: estimatedSize,
      totalRecords,
      tableCounts,
      metadata: {
        totalRecords,
        engine: 'dev-snapshot',
        note: 'Development backup — table counts and metadata only. Production would use pg_dump.',
      },
    });

    res.json({
      success: true,
      backup: {
        id: backup.id,
        createdAt: backup.createdAt,
        size: backup.size,
        type: backup.type,
        tableCounts: backup.tableCounts,
        metadata: backup.metadata,
      },
    });
  } catch (error: any) {
    console.error('Backup creation error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// GET /api/backup/list — List available backups
router.get('/backup/list', isAuthenticated, requireAdmin, async (_req, res) => {
  try {
    const rows = await storage.listBackupHistory();
    res.json(rows.map((b: any) => ({
      id: b.id,
      createdAt: b.createdAt,
      size: b.size,
      type: b.type,
      totalRecords: b.totalRecords ?? b.metadata?.totalRecords ?? 0,
    })));
  } catch (error: any) {
    console.error('Backup list error:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// GET /api/backup/export/:type — Export data as JSON from real DB tables
router.get('/backup/export/:type', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    let data: any[];

    switch (type) {
      case 'customers': {
        data = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
            userType: users.userType,
            role: users.role,
            isActive: users.isActive,
            createdAt: users.createdAt,
          })
          .from(users)
          .limit(5000);
        break;
      }
      case 'invoices': {
        data = await db
          .select({
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
            customerId: invoices.customerId,
            vehicleId: invoices.vehicleId,
            invoiceDate: invoices.invoiceDate,
            dueDate: invoices.dueDate,
            status: invoices.status,
            subtotal: invoices.subtotal,
            taxAmount: invoices.taxAmount,
            discountAmount: invoices.discountAmount,
            totalAmount: invoices.totalAmount,
            paidAmount: invoices.paidAmount,
            createdAt: invoices.createdAt,
          })
          .from(invoices)
          .limit(5000);
        break;
      }
      case 'job-cards': {
        data = await db
          .select({
            id: jobCards.id,
            jobNumber: jobCards.jobNumber,
            customerId: jobCards.customerId,
            vehicleInfo: jobCards.vehicleInfo,
            serviceType: jobCards.serviceType,
            description: jobCards.description,
            status: jobCards.status,
            priority: jobCards.priority,
            totalCost: jobCards.totalCost,
            createdAt: jobCards.createdAt,
            completedAt: jobCards.completedAt,
          })
          .from(jobCards)
          .limit(5000);
        break;
      }
      case 'inventory': {
        data = await db
          .select({
            id: spareParts.id,
            name: spareParts.name,
            category: spareParts.category,
            sku: spareParts.sku,
            brand: spareParts.brand,
            partType: spareParts.partType,
            isActive: spareParts.isActive,
            createdAt: spareParts.createdAt,
          })
          .from(spareParts)
          .limit(5000);
        break;
      }
      case 'appointments': {
        data = await db
          .select({
            id: appointments.id,
            appointmentNumber: appointments.appointmentNumber,
            customerName: appointments.customerName,
            customerPhone: appointments.customerPhone,
            vehicleInfo: appointments.vehicleInfo,
            serviceType: appointments.serviceType,
            appointmentDate: appointments.appointmentDate,
            duration: appointments.duration,
            status: appointments.status,
            createdAt: appointments.createdAt,
          })
          .from(appointments)
          .limit(5000);
        break;
      }
      case 'vehicles': {
        data = await db
          .select({
            id: vehicles.id,
            customerId: vehicles.customerId,
            make: vehicles.make,
            model: vehicles.model,
            year: vehicles.year,
            licensePlate: vehicles.licensePlate,
            vin: vehicles.vin,
            color: vehicles.color,
            mileage: vehicles.mileage,
            engineType: vehicles.engineType,
            createdAt: vehicles.createdAt,
          })
          .from(vehicles)
          .limit(5000);
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown export type: ${type}. Supported: customers, invoices, job-cards, inventory, appointments, vehicles` });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(data);
  } catch (error: any) {
    console.error('Backup export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
