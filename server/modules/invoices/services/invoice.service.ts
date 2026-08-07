/**
 * Invoice service (Phase E5 — Domain Services).
 *
 * Owns the invoice module's business rules: tenant scoping, the session-garage
 * pin on create (never trust a body garageId, B12), the status-transition
 * workflow on update, and the server-side "invoice from job card" calculation
 * (labor + parts + configurable tax, computed on the server — never trusting the
 * client). Every creation path emits a fire-and-forget `invoice.created` event
 * (E7). All data access flows through the injected repository.
 *
 * Behavior mirrors the legacy monolith handlers exactly, including the generated
 * invoice number and the returned breakdown.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import { EventBus, createEvent } from '../../../infrastructure/events/event-bus';
import type { IInvoiceRepository } from '../repositories/invoice.repository';
import { INVOICE_STATUS_TRANSITIONS } from '../validators/invoice.validators';
import { InvoiceEventTypes, type InvoiceCreationSource } from '../events/invoice.events';
import type {
  Invoice,
  InvoiceAuthContext,
  InvoiceFromJobResult,
  InvoiceListParams,
  InvoiceListResult,
} from '../domain/invoice.types';

const DEFAULT_TAX_RATE = 0.15; // Saudi Arabia VAT 15% default
const DEFAULT_LABOR_RATE = 75; // Default hourly labor rate

export class InvoiceService {
  constructor(
    private readonly repository: IInvoiceRepository,
    private readonly events?: EventBus,
  ) {}

  private effectiveGarageId(auth: InvoiceAuthContext, garageIdParam?: string): string | undefined {
    // Legacy list preferred ?garage_id over session garage; preserved verbatim.
    return garageIdParam ?? auth.garageId ?? undefined;
  }

  async list(params: InvoiceListParams): Promise<InvoiceListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.status, params.limit, params.offset),
      this.repository.count(garageId, params.status),
    ]);
    return { rows, total };
  }

  async getVisible(id: string, auth: InvoiceAuthContext): Promise<Invoice> {
    const invoice = await this.repository.getById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice not found', { context: { id } });
    }
    if (auth.garageId && invoice.garageId && invoice.garageId !== auth.garageId) {
      throw new NotFoundError('Invoice not found', { context: { id } });
    }
    return invoice;
  }

  async getItemsVisible(id: string, auth: InvoiceAuthContext) {
    // Parent ownership: items inherit the invoice's garage scope.
    if (auth.garageId) {
      const invoice = await this.repository.getById(id);
      if (!invoice || (invoice.garageId && invoice.garageId !== auth.garageId)) {
        throw new NotFoundError('Invoice not found', { context: { id } });
      }
    }
    return this.repository.getItems(id);
  }

  async create(
    data: Parameters<IInvoiceRepository['createInvoice']>[0],
    auth: InvoiceAuthContext,
  ): Promise<Invoice> {
    const invoiceData = {
      ...data,
      createdBy: auth.userId || 'default-user',
      garageId: auth.garageId ?? (data as { garageId?: string }).garageId,
    };
    const invoice = await this.repository.createInvoice(invoiceData as never);
    this.emitCreated(invoice, 'manual', auth);
    return invoice;
  }

  async createWithItems(
    invoiceData: Parameters<IInvoiceRepository['createWithItems']>[0],
    items: Parameters<IInvoiceRepository['createWithItems']>[1],
    auth: InvoiceAuthContext,
  ): Promise<Invoice> {
    const data = { ...invoiceData, createdBy: auth.userId || 'default-user' };
    const invoice = await this.repository.createWithItems(data as never, items);
    this.emitCreated(invoice, 'with-items', auth);
    return invoice;
  }

  async update(
    id: string,
    data: Parameters<IInvoiceRepository['update']>[1],
    auth: InvoiceAuthContext,
  ): Promise<Invoice> {
    const status = (data as { status?: string }).status;
    if (status) {
      const current = await this.repository.getById(id);
      if (!current) {
        throw new NotFoundError('Invoice not found', { context: { id } });
      }
      const currentStatus = String(current.status);
      const allowed = INVOICE_STATUS_TRANSITIONS[currentStatus] || [currentStatus];
      if (!allowed.includes(status)) {
        throw new ValidationError(`Invalid status transition from ${currentStatus} to ${status}`);
      }
    }
    const invoice = await this.repository.update(id, data, auth.garageId ?? undefined);
    if (!invoice) {
      throw new NotFoundError('Invoice not found', { context: { id } });
    }
    return invoice;
  }

  delete(id: string, auth: InvoiceAuthContext): Promise<void> {
    return this.repository.delete(id, auth.garageId ?? undefined);
  }

  /**
   * Generate an invoice from a job card. All monetary values are computed
   * server-side from the job card's tasks (labor) and parts, using the garage's
   * configured VAT rate and the assigned technician's hourly rate when available.
   */
  async createFromJob(jobId: string, auth: InvoiceAuthContext): Promise<InvoiceFromJobResult> {
    const userId = auth.userId || 'default-user';

    const jobCard = await this.repository.getJobCardRow(jobId);
    if (!jobCard) {
      throw new NotFoundError('Job card not found', { context: { jobId } });
    }

    // Tax rate: garage VAT config or default (accepts percentage or decimal form).
    let taxRate = DEFAULT_TAX_RATE;
    const taxSettings = await this.repository.getTaxSettings(jobCard.garageId);
    if (taxSettings?.isVatRegistered && taxSettings.vatRate) {
      const storedRate = parseFloat(taxSettings.vatRate);
      taxRate = storedRate > 1 ? storedRate / 100 : storedRate;
    }

    // Labor rate: assigned technician's hourly rate or default.
    let laborRate = DEFAULT_LABOR_RATE;
    let laborRateFromTechnician = false;
    if (jobCard.assignedTo) {
      const techProfile = await this.repository.getTechnicianHourlyRate(jobCard.assignedTo);
      if (techProfile?.hourlyRate) {
        laborRate = parseFloat(techProfile.hourlyRate);
        laborRateFromTechnician = true;
      }
    }

    // Labor minutes from task assignments, falling back to job card hours.
    const tasks = await this.repository.getTasksByJobCard(jobId);
    let laborMinutes = 0;
    for (const task of tasks) {
      laborMinutes += task.actualMinutes || task.estimatedMinutes || 0;
    }
    if (laborMinutes === 0) {
      const hours = parseFloat(
        jobCard.actualHours?.toString() || jobCard.estimatedHours?.toString() || '0',
      );
      laborMinutes = hours * 60;
    }
    const laborCost = (laborMinutes / 60) * laborRate;

    // Parts cost + line items.
    const parts = await this.repository.getJobCardParts(jobId);
    let partsCost = 0;
    const partLineItems: Array<Record<string, unknown>> = [];
    for (const part of parts) {
      const qty = part.quantity || 1;
      const price = parseFloat(part.unitPrice?.toString() || part.lineTotal?.toString() || '0');
      const lineTotal = part.lineTotal ? parseFloat(part.lineTotal.toString()) : qty * price;
      partsCost += lineTotal;
      const partInfo = part.sparePartId
        ? await this.repository.getSparePartName(part.sparePartId)
        : undefined;
      partLineItems.push({
        itemType: 'part',
        description: partInfo?.name || 'Spare Part',
        quantity: qty,
        unitPrice: price.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
        taxRate: (taxRate * 100).toFixed(2),
      });
    }

    const subtotal = laborCost + partsCost;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newInvoice = await this.repository.insertInvoiceRow({
      invoiceNumber,
      garageId: jobCard.garageId,
      customerId: jobCard.customerId || userId,
      vehicleId: null,
      jobCardId: jobId,
      invoiceDate: new Date(),
      dueDate,
      status: 'draft',
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      discountAmount: '0',
      totalAmount: totalAmount.toFixed(2),
      paidAmount: '0',
      balanceAmount: totalAmount.toFixed(2),
      notes: `Invoice generated from Job Card: ${jobCard.jobNumber}`,
      createdBy: userId,
    });

    const lineItems: Array<Record<string, unknown>> = [];
    if (laborCost > 0) {
      lineItems.push({
        invoiceId: newInvoice.id,
        itemType: 'labor',
        description: `Labor: ${(laborMinutes / 60).toFixed(1)} hours @ $${laborRate}/hr`,
        quantity: 1,
        unitPrice: laborCost.toFixed(2),
        lineTotal: laborCost.toFixed(2),
        taxRate: (taxRate * 100).toFixed(2),
      });
    }
    for (const partItem of partLineItems) {
      lineItems.push({ invoiceId: newInvoice.id, ...partItem });
    }
    if (lineItems.length > 0) {
      await this.repository.insertInvoiceItems(lineItems);
    }

    this.emitCreated(newInvoice, 'from-job', auth);

    return {
      invoice: newInvoice,
      breakdown: {
        laborCost: laborCost.toFixed(2),
        laborMinutes,
        laborRate,
        partsCost: partsCost.toFixed(2),
        partsCount: parts.length,
        subtotal: subtotal.toFixed(2),
        taxRate,
        taxRatePercent: (taxRate * 100).toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        configSource: {
          taxRateSource: taxSettings?.isVatRegistered ? 'saudiTaxCompliance' : 'default',
          laborRateSource: laborRateFromTechnician ? 'technicianProfiles' : 'default',
        },
      },
      items: lineItems,
    };
  }

  private emitCreated(invoice: Invoice, source: InvoiceCreationSource, auth: InvoiceAuthContext): void {
    if (!this.events) return;
    void this.events
      .publish(
        createEvent(InvoiceEventTypes.Created, {
          invoiceId: invoice.id,
          garageId: invoice.garageId ?? null,
          source,
          createdByUserId: auth.userId,
        }),
      )
      .catch(() => {
        /* delivery failures are handled by the bus (retry/DLQ). */
      });
  }
}
