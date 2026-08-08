/**
 * Marketplace write-path service (Phase E — Domain Services).
 *
 * Owns the authenticated parts-marketplace surface: the external eBay/Amazon
 * parts search, order placement (garage-scoped) and tracking, the (still-stubbed)
 * order listing, and the customer review submission with its transaction gate.
 *
 * The review rules are lifted verbatim from the legacy handler: a whole-number
 * rating 1–5 is required (else 400), the provider must exist (else 404), the
 * customer must have transacted with the provider (else 403), and the comment is
 * trimmed and capped. All data / external access flows through the repository.
 */

import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';
import type {
  IMarketplaceWritesRepository,
  MarketplaceKind,
  PlaceOrderInput,
} from '../repositories/marketplace-writes.repository';

/** Legacy review comment cap (characters). */
const REVIEW_COMMENT_MAX = 2000;

export interface SubmitReviewInput {
  providerId?: unknown;
  rating?: unknown;
  comment?: unknown;
}

export class MarketplaceWritesService {
  constructor(private readonly repository: IMarketplaceWritesRepository) {}

  searchParts(partNumber: string, marketplace: MarketplaceKind) {
    return this.repository.searchParts(partNumber, marketplace);
  }

  /** Place an external order for the caller's garage (garage stamped by the caller). */
  placeOrder(garageId: string | undefined, body: Record<string, unknown>) {
    return this.repository.placeOrder({ ...body, garageId } as PlaceOrderInput);
  }

  trackOrder(orderId: string) {
    return this.repository.trackOrder(orderId);
  }

  /**
   * Order listing is not yet backed by a query — the legacy handler returns an
   * empty list. Preserved as a stub (the garage is accepted but unused) until a
   * real read exists.
   */
  listOrders(_garageId: string | undefined): unknown[] {
    return [];
  }

  /**
   * Submit (or update) a customer's review of a provider. One review per
   * provider per customer — the repository upsert handles the resubmit case.
   */
  async submitReview(customerId: string, input: SubmitReviewInput) {
    const { providerId, rating, comment } = input;
    const r = Number(rating);
    if (!providerId || !Number.isInteger(r) || r < 1 || r > 5) {
      throw new ValidationError('providerId and a whole-number rating 1–5 are required');
    }
    const id = String(providerId);

    const provider = await this.repository.getProvider(id);
    if (!provider) throw new NotFoundError('Provider not found', { context: { providerId: id } });

    if (!(await this.repository.hasTransactedWith(customerId, id))) {
      throw new AuthorizationError(
        'You can review a provider after completing a booking, order or quote with them',
      );
    }

    const cleaned =
      typeof comment === 'string' && comment.trim()
        ? comment.trim().slice(0, REVIEW_COMMENT_MAX)
        : undefined;
    return this.repository.upsertReview(id, customerId, r, cleaned);
  }
}
