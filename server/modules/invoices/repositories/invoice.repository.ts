/**
 * Invoice repository (Phase E4 — Repository Pattern).
 *
 * The only place in the invoice module that touches the data layer. Standard
 * CRUD delegates to the legacy `storage` facade; the "invoice from job card"
 * flow owns the Drizzle reads/writes it needs across job cards, tasks, parts,
 * spare parts, tax settings, technician profiles, and the invoice/item tables
 * (all previously inlined in the route handler). Keeping every query here
 * preserves the module's single data-access boundary; the server-side
 * calculation lives in the service.
 */

import { eq } from 'drizzle-orm';
import {
  jobCards,
  taskAssignments,
  jobCardParts,
  spareParts,
  invoices,
  invoiceItems,
  saudiTaxCompliance,
  technicianProfiles,
} from '@shared/schema';
import { db } from '../../../db';
import { storage } from '../../../storage';
import type { Invoice } from '../domain/invoice.types';

type CreateWithItemsArgs = Parameters<typeof storage.createInvoiceWithItems>;
type UpdateInvoiceData = Parameters<typeof storage.updateInvoice>[1];

export interface IInvoiceRepository {
  listPaginated(
    garageId: string | undefined,
    status: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Invoice[]>;
  count(garageId: string | undefined, status: string | undefined): Promise<number>;
  getById(id: string): Promise<Invoice | undefined>;
  getItems(id: string): ReturnType<typeof storage.getInvoiceItems>;
  createInvoice(data: Parameters<typeof storage.createInvoice>[0]): Promise<Invoice>;
  createWithItems(data: CreateWithItemsArgs[0], items: CreateWithItemsArgs[1]): Promise<Invoice>;
  update(id: string, data: UpdateInvoiceData, garageId?: string): Promise<Invoice>;
  delete(id: string, garageId?: string): Promise<void>;
  // "From job card" data access (server-side invoice generation).
  getJobCardRow(jobId: string): Promise<typeof jobCards.$inferSelect | undefined>;
  getTaxSettings(garageId: string): Promise<{ vatRate: string | null; isVatRegistered: boolean | null } | undefined>;
  getTechnicianHourlyRate(userId: string): Promise<{ hourlyRate: string | null } | undefined>;
  getTasksByJobCard(jobId: string): Promise<Array<typeof taskAssignments.$inferSelect>>;
  getJobCardParts(jobId: string): Promise<any[]>;
  getSparePartName(sparePartId: string): Promise<{ name: string } | undefined>;
  // Insert payloads are built by the service from computed values; typed loosely
  // (as the monolith did) to avoid threading enum/nullable column types through.
  insertInvoiceRow(values: any): Promise<typeof invoices.$inferSelect>;
  insertInvoiceItems(values: any[]): Promise<void>;
}

export class InvoiceRepository implements IInvoiceRepository {
  listPaginated(garageId: string | undefined, status: string | undefined, limit: number, offset: number) {
    return storage.getInvoicesPaginated(garageId, status, limit, offset);
  }

  count(garageId: string | undefined, status: string | undefined): Promise<number> {
    return storage.countInvoices(garageId, status);
  }

  getById(id: string): Promise<Invoice | undefined> {
    return storage.getInvoice(id);
  }

  getItems(id: string) {
    return storage.getInvoiceItems(id);
  }

  createInvoice(data: Parameters<typeof storage.createInvoice>[0]) {
    return storage.createInvoice(data);
  }

  createWithItems(data: CreateWithItemsArgs[0], items: CreateWithItemsArgs[1]) {
    return storage.createInvoiceWithItems(data, items);
  }

  update(id: string, data: UpdateInvoiceData, garageId?: string) {
    return storage.updateInvoice(id, data, garageId);
  }

  delete(id: string, garageId?: string) {
    return storage.deleteInvoice(id, garageId);
  }

  async getJobCardRow(jobId: string) {
    const [jobCard] = await db.select().from(jobCards).where(eq(jobCards.id, jobId));
    return jobCard;
  }

  async getTaxSettings(garageId: string) {
    const [row] = await db
      .select({ vatRate: saudiTaxCompliance.vatRate, isVatRegistered: saudiTaxCompliance.isVatRegistered })
      .from(saudiTaxCompliance)
      .where(eq(saudiTaxCompliance.garageId, garageId));
    return row;
  }

  async getTechnicianHourlyRate(userId: string) {
    const [row] = await db
      .select({ hourlyRate: technicianProfiles.hourlyRate })
      .from(technicianProfiles)
      .where(eq(technicianProfiles.userId, userId));
    return row;
  }

  getTasksByJobCard(jobId: string) {
    return db.select().from(taskAssignments).where(eq(taskAssignments.jobCardId, jobId));
  }

  getJobCardParts(jobId: string) {
    return db
      .select({
        id: jobCardParts.id,
        quantity: jobCardParts.quantity,
        unitPrice: jobCardParts.unitPrice,
        lineTotal: jobCardParts.lineTotal,
        sparePartId: jobCardParts.sparePartId,
      })
      .from(jobCardParts)
      .where(eq(jobCardParts.jobCardId, jobId));
  }

  async getSparePartName(sparePartId: string) {
    const [row] = await db
      .select({ name: spareParts.name })
      .from(spareParts)
      .where(eq(spareParts.id, sparePartId));
    return row;
  }

  async insertInvoiceRow(values: any) {
    const [row] = await db.insert(invoices).values(values).returning();
    return row;
  }

  async insertInvoiceItems(values: any[]) {
    await db.insert(invoiceItems).values(values);
  }
}
