/**
 * Provider service (Phase E — Domain Services).
 *
 * The business rules for the caller's garage acting as a marketplace provider:
 * the "no provider account" authorization guard, the per-surface status
 * validations, the not-found rules, the profile allow-list, and the best-effort
 * customer notifications fired after a state change. Every rule is lifted
 * verbatim from the legacy monolith handlers and surfaced as a domain error.
 * All data access flows through the repository.
 */

import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';
import type { IProviderRepository } from '../repositories/provider.repository';

const BOOKING_STATUSES = ['accepted', 'declined', 'completed'];
const ORDER_STATUSES = ['confirmed', 'fulfilled', 'declined'];
const QUOTE_STATUSES = ['quoted', 'declined'];
const PROFILE_FIELDS = ['description', 'phone', 'email', 'address', 'photoUrl', 'workingHours'] as const;

export interface BookingUpdate {
  status?: string;
  providerNotes?: unknown;
}
export interface OrderUpdate {
  status?: string;
  providerNotes?: unknown;
}
export interface QuoteResponse {
  status?: string;
  quotedPremium?: unknown;
  quoteNotes?: unknown;
  validUntil?: unknown;
}

export class ProviderService {
  constructor(private readonly repository: IProviderRepository) {}

  /** Every provider surface requires the caller's session to carry a garage. */
  private assertProvider(providerId: string | undefined): asserts providerId is string {
    if (!providerId) throw new AuthorizationError('No provider account associated');
  }

  /**
   * Public guard for the offering write-path, where the controller must reject a
   * garage-less caller (403) BEFORE Zod-validating the body (400) — preserving
   * the legacy check ordering.
   */
  requireProvider(providerId: string | undefined): string {
    this.assertProvider(providerId);
    return providerId;
  }

  private str(v: unknown): string | undefined {
    return typeof v === 'string' ? v : undefined;
  }

  /** Best-effort customer notification (never fails the request). */
  private async notifyCustomer(
    customerId: string,
    providerId: string,
    title: string,
    message: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.repository.createNotification({
        type: 'in-app',
        category: 'general',
        recipientId: customerId,
        garageId: providerId,
        title,
        message,
        metadata,
      } as never);
    } catch (e) {
      console.error('Customer notification failed:', e);
    }
  }

  // ---- Bookings ------------------------------------------------------------

  listBookings(providerId: string | undefined, status?: string) {
    this.assertProvider(providerId);
    return this.repository.listBookings(providerId, status);
  }

  async updateBooking(providerId: string | undefined, id: string, body: BookingUpdate) {
    this.assertProvider(providerId);
    const status = body?.status;
    if (status && !BOOKING_STATUSES.includes(status)) {
      throw new ValidationError('status must be accepted, declined or completed');
    }
    const updated = await this.repository.updateBooking(id, providerId, {
      status,
      providerNotes: this.str(body?.providerNotes),
    });
    if (!updated) throw new NotFoundError('Booking not found');

    if (status) {
      try {
        const verb = status === 'accepted' ? 'accepted' : status === 'declined' ? 'declined' : 'marked complete';
        await this.repository.createNotification({
          type: 'in-app',
          category: 'appointment',
          recipientId: updated.customerId,
          garageId: providerId,
          title: `Booking ${verb}`,
          message: `Your booking${updated.serviceName ? ` for ${updated.serviceName}` : ''} was ${verb}.${updated.providerNotes ? ` Note: ${updated.providerNotes}` : ''}`,
          metadata: { bookingId: updated.id, status },
        } as never);
      } catch (notifyErr) {
        console.error('Booking notification (customer) failed:', notifyErr);
      }
    }
    return updated;
  }

  // ---- Offerings -----------------------------------------------------------

  listOfferings(providerId: string | undefined) {
    this.assertProvider(providerId);
    return this.repository.listOfferings(providerId);
  }

  /** `data` is the Zod-validated offering body from the controller boundary. */
  createOffering(providerId: string | undefined, data: Record<string, unknown>) {
    this.assertProvider(providerId);
    return this.repository.createOffering({ ...data, providerId } as never);
  }

  async updateOffering(providerId: string | undefined, id: string, data: Record<string, unknown>) {
    this.assertProvider(providerId);
    const updated = await this.repository.updateOffering(id, providerId, data as never);
    if (!updated) throw new NotFoundError('Offering not found');
    return updated;
  }

  async deleteOffering(providerId: string | undefined, id: string) {
    this.assertProvider(providerId);
    await this.repository.deleteOffering(id, providerId); // scoped
    return { message: 'Offering removed' };
  }

  // ---- Profile -------------------------------------------------------------

  async getProfile(providerId: string | undefined) {
    this.assertProvider(providerId);
    const provider = await this.repository.getProvider(providerId);
    if (!provider) throw new NotFoundError('Provider not found');
    return provider;
  }

  updateProfile(providerId: string | undefined, body: Record<string, unknown>) {
    this.assertProvider(providerId);
    const allowed: Record<string, string> = {};
    for (const k of PROFILE_FIELDS) {
      if (typeof body?.[k] === 'string') allowed[k] = body[k] as string;
    }
    if (Object.keys(allowed).length === 0) throw new ValidationError('Nothing to update');
    return this.repository.updateProfile(providerId, allowed as never);
  }

  // ---- Orders (provider side) ---------------------------------------------

  listOrders(providerId: string | undefined) {
    this.assertProvider(providerId);
    return this.repository.listOrders(providerId);
  }

  async updateOrder(providerId: string | undefined, id: string, body: OrderUpdate) {
    this.assertProvider(providerId);
    const status = body?.status;
    if (status && !ORDER_STATUSES.includes(status)) {
      throw new ValidationError('status must be confirmed, fulfilled or declined');
    }
    const updated = await this.repository.updateOrder(id, providerId, {
      status,
      providerNotes: this.str(body?.providerNotes),
    });
    if (!updated) throw new NotFoundError('Order not found');
    if (status) {
      await this.notifyCustomer(
        updated.customerId,
        providerId,
        `Order ${status}`,
        `Your order (${updated.totalAmount} ${updated.currency}) is now ${status}.${updated.providerNotes ? ` Note: ${updated.providerNotes}` : ''}`,
        { orderId: updated.id, status },
      );
    }
    return updated;
  }

  // ---- Insurance quotes (provider side) -----------------------------------

  listQuotes(providerId: string | undefined) {
    this.assertProvider(providerId);
    return this.repository.listQuotes(providerId);
  }

  async respondQuote(providerId: string | undefined, id: string, body: QuoteResponse) {
    this.assertProvider(providerId);
    const status = body?.status;
    if (!status || !QUOTE_STATUSES.includes(status)) {
      throw new ValidationError('status must be quoted or declined');
    }
    if (status === 'quoted' && !(Number(body?.quotedPremium) > 0)) {
      throw new ValidationError('quotedPremium is required to quote');
    }
    const updated = await this.repository.respondQuote(id, providerId, {
      status: status as 'quoted' | 'declined',
      quotedPremium: status === 'quoted' ? String(body?.quotedPremium) : undefined,
      quoteNotes: this.str(body?.quoteNotes),
      validUntil: body?.validUntil ? new Date(body.validUntil as string) : undefined,
    });
    if (!updated) throw new NotFoundError('Quote not found');
    await this.notifyCustomer(
      updated.customerId,
      providerId,
      status === 'quoted' ? 'Your insurance quote is ready' : 'Quote request declined',
      status === 'quoted'
        ? `Premium: ${updated.quotedPremium} ${updated.currency}${updated.quoteNotes ? ` — ${updated.quoteNotes}` : ''}`
        : `The insurer declined${updated.quoteNotes ? `: ${updated.quoteNotes}` : '.'}`,
      { quoteId: updated.id, status },
    );
    return updated;
  }
}
