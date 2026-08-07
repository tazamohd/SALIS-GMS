/**
 * Customer service (Phase E5 — Domain Services).
 *
 * Owns the customer module's business rules: tenant scoping, cross-garage
 * visibility (404, never 403, so a record's existence isn't confirmed to
 * outsiders), list-vs-search selection, and domain event emission. Controllers
 * only translate HTTP to/from these calls. All data access goes through the
 * injected repository; the optional event bus is fire-and-forget.
 *
 * Rules preserved exactly from the pre-migration routes:
 *  - Tenant pin: a caller with a garage is pinned to it; the `?garage_id`
 *    override is honored only for garage-less (platform) callers.
 *  - Sub-resource ownership is checked only when the caller has a garage.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import { EventBus, createEvent } from '../../../infrastructure/events/event-bus';
import type { ICustomerRepository } from '../repositories/customer.repository';
import type {
  Customer,
  CustomerAuthContext,
  CustomerListResult,
} from '../domain/customer.types';
import { CustomerEventTypes, type CustomerViewedPayload } from '../events/customer.events';

const SEARCH_MIN_LENGTH = 2;

export interface CustomerListParams {
  auth: CustomerAuthContext;
  garageIdParam?: string;
  search?: string;
  limit: number;
  offset: number;
}

export class CustomerService {
  constructor(
    private readonly repository: ICustomerRepository,
    private readonly events?: EventBus,
  ) {}

  /** Resolve the effective tenant: session garage wins; param only for platform users. */
  private effectiveGarageId(auth: CustomerAuthContext, garageIdParam?: string): string | undefined {
    return auth.garageId ?? garageIdParam ?? undefined;
  }

  async list(params: CustomerListParams): Promise<CustomerListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const search = params.search;

    if (search && search.length >= SEARCH_MIN_LENGTH) {
      const pattern = `%${search.toLowerCase()}%`;
      const rows = await this.repository.search(garageId ?? '', pattern, params.limit);
      return { rows, total: rows.length };
    }

    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.limit, params.offset),
      this.repository.count(garageId),
    ]);
    return { rows, total };
  }

  /** Fetch one customer, enforcing tenant visibility, and emit a viewed event. */
  async getVisible(id: string, auth: CustomerAuthContext): Promise<Customer> {
    const customer = await this.repository.getById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found', { context: { id } });
    }
    if (auth.garageId && customer.garageId && customer.garageId !== auth.garageId) {
      throw new NotFoundError('Customer not found', { context: { id } });
    }
    this.emitViewed(id, auth);
    return customer;
  }

  /**
   * Guard a sub-resource read: the parent customer must belong to the caller's
   * garage. Garage-less (platform) callers pass without a lookup — matching the
   * legacy `requireOwnCustomer` behavior exactly.
   */
  private async assertVisible(id: string, auth: CustomerAuthContext): Promise<void> {
    if (!auth.garageId) return;
    const customer = await this.repository.getById(id);
    if (!customer || (customer.garageId && customer.garageId !== auth.garageId)) {
      throw new NotFoundError('Customer not found', { context: { id } });
    }
  }

  async vehicles(id: string, auth: CustomerAuthContext) {
    await this.assertVisible(id, auth);
    return this.repository.getVehicles(id);
  }

  async jobCards(id: string, auth: CustomerAuthContext) {
    await this.assertVisible(id, auth);
    return this.repository.getJobCards(id);
  }

  async invoices(id: string, auth: CustomerAuthContext) {
    await this.assertVisible(id, auth);
    return this.repository.getInvoices(id);
  }

  async payments(id: string, auth: CustomerAuthContext) {
    await this.assertVisible(id, auth);
    return this.repository.getPayments(id);
  }

  async notes(id: string, auth: CustomerAuthContext) {
    await this.assertVisible(id, auth);
    return this.repository.getNotes(id);
  }

  async serviceReminders(customerId: string, auth: CustomerAuthContext) {
    await this.assertVisible(customerId, auth);
    return this.repository.getServiceReminders(customerId);
  }

  async reviews(customerId: string, auth: CustomerAuthContext) {
    await this.assertVisible(customerId, auth);
    return this.repository.getReviews(customerId);
  }

  async signatures(customerId: string, auth: CustomerAuthContext) {
    await this.assertVisible(customerId, auth);
    return this.repository.getSignatures(customerId);
  }

  /** Fire-and-forget audit event; never affects the request outcome. */
  private emitViewed(customerId: string, auth: CustomerAuthContext): void {
    if (!this.events) return;
    const payload: CustomerViewedPayload = {
      customerId,
      viewedByGarageId: auth.garageId ?? null,
      viewedByUserId: auth.userId,
    };
    void this.events
      .publish(createEvent(CustomerEventTypes.Viewed, payload, auth.userId))
      .catch(() => {
        /* event delivery failures are handled by the bus (retry/DLQ). */
      });
  }
}
