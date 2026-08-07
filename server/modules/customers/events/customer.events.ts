/**
 * Customer domain events (Phase E7 — Event-Driven Architecture).
 *
 * The customer module's published event contract. `customer.viewed` is emitted
 * fire-and-forget when a single customer is read, feeding audit/analytics
 * handlers without adding latency or side effects to the request path.
 * Write-path events (e.g. `customer.registered`) are declared here so their
 * emit points are ready when customer write endpoints are migrated.
 */

export const CustomerEventTypes = {
  Viewed: 'customer.viewed',
  Registered: 'customer.registered',
  Updated: 'customer.updated',
} as const;

export type CustomerEventType = (typeof CustomerEventTypes)[keyof typeof CustomerEventTypes];

export interface CustomerViewedPayload {
  customerId: string;
  /** Garage of the viewer, or null for a platform-level viewer. */
  viewedByGarageId: string | null;
  viewedByUserId?: string;
}

export interface CustomerRegisteredPayload {
  customerId: string;
  garageId: string | null;
}
