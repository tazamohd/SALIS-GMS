/**
 * Backup repository (Phase E4). The only data-layer access for the
 * platform/administration backup surface. Wraps the legacy `storage`
 * backup-history methods and owns the direct Drizzle count/export queries that
 * backed `server/routes/backup.ts`.
 */

import { db } from '../../../db';
import { count } from 'drizzle-orm';
import {
  users,
  vehicles,
  jobCards,
  invoices,
  appointments,
  spareParts,
  sparePartInventories,
} from '@shared/schema';
import { storage } from '../../../storage';

// storage backup-history rows are loosely typed; `Any` keeps the seam readable.
type Any = any;

/** The tables counted in a dev snapshot, keyed by their snapshot label. */
const COUNT_TABLES = [
  ['users', users],
  ['vehicles', vehicles],
  ['job_cards', jobCards],
  ['invoices', invoices],
  ['appointments', appointments],
  ['spare_parts', spareParts],
  ['spare_part_inventories', sparePartInventories],
] as const;

export interface IBackupRepository {
  latest(): Promise<Any>;
  stats(): Promise<{ count: number; totalSize: number }>;
  create(data: Any): Promise<Any>;
  list(): Promise<Any[]>;
  tableCounts(): Promise<Record<string, number>>;
  /** Rows for an export type, or null when the type is unknown. */
  exportData(type: string): Promise<Any[] | null>;
}

export class BackupRepository implements IBackupRepository {
  latest() { return storage.getLatestBackupHistory(); }
  stats() { return storage.getBackupHistoryStats(); }
  create(data: Any) { return storage.createBackupHistory(data); }
  list() { return storage.listBackupHistory() as Promise<Any[]>; }

  async tableCounts(): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const [label, table] of COUNT_TABLES) {
      const [row] = await db.select({ count: count() }).from(table as Any);
      out[label] = Number(row?.count ?? 0);
    }
    return out;
  }

  async exportData(type: string): Promise<Any[] | null> {
    switch (type) {
      case 'customers':
        return db.select({
          id: users.id, fullName: users.fullName, email: users.email, phone: users.phone,
          userType: users.userType, role: users.role, isActive: users.isActive, createdAt: users.createdAt,
        }).from(users).limit(5000);
      case 'invoices':
        return db.select({
          id: invoices.id, invoiceNumber: invoices.invoiceNumber, customerId: invoices.customerId,
          vehicleId: invoices.vehicleId, invoiceDate: invoices.invoiceDate, dueDate: invoices.dueDate,
          status: invoices.status, subtotal: invoices.subtotal, taxAmount: invoices.taxAmount,
          discountAmount: invoices.discountAmount, totalAmount: invoices.totalAmount,
          paidAmount: invoices.paidAmount, createdAt: invoices.createdAt,
        }).from(invoices).limit(5000);
      case 'job-cards':
        return db.select({
          id: jobCards.id, jobNumber: jobCards.jobNumber, customerId: jobCards.customerId,
          vehicleInfo: jobCards.vehicleInfo, serviceType: jobCards.serviceType, description: jobCards.description,
          status: jobCards.status, priority: jobCards.priority, totalCost: jobCards.totalCost,
          createdAt: jobCards.createdAt, completedAt: jobCards.completedAt,
        }).from(jobCards).limit(5000);
      case 'inventory':
        return db.select({
          id: spareParts.id, name: spareParts.name, category: spareParts.category, sku: spareParts.sku,
          brand: spareParts.brand, partType: spareParts.partType, isActive: spareParts.isActive,
          createdAt: spareParts.createdAt,
        }).from(spareParts).limit(5000);
      case 'appointments':
        return db.select({
          id: appointments.id, appointmentNumber: appointments.appointmentNumber,
          customerName: appointments.customerName, customerPhone: appointments.customerPhone,
          vehicleInfo: appointments.vehicleInfo, serviceType: appointments.serviceType,
          appointmentDate: appointments.appointmentDate, duration: appointments.duration,
          status: appointments.status, createdAt: appointments.createdAt,
        }).from(appointments).limit(5000);
      case 'vehicles':
        return db.select({
          id: vehicles.id, customerId: vehicles.customerId, make: vehicles.make, model: vehicles.model,
          year: vehicles.year, licensePlate: vehicles.licensePlate, vin: vehicles.vin, color: vehicles.color,
          mileage: vehicles.mileage, engineType: vehicles.engineType, createdAt: vehicles.createdAt,
        }).from(vehicles).limit(5000);
      default:
        return null;
    }
  }
}
