/**
 * Purchase request validators (Phase E9 — Shared Validation Layer).
 *
 * Re-exports the canonical purchase-order/item insert schemas from the shared
 * schema so the procurement write endpoints validate against the same
 * definitions as the rest of the app. The `with-items` item schema drops
 * `purchaseOrderId` (assigned server-side after the parent order is created),
 * matching the legacy handler.
 */

import { insertPurchaseOrderSchema, insertPurchaseOrderItemSchema } from '@shared/schema';

export const purchaseOrderInsertSchema = insertPurchaseOrderSchema;
export const purchaseOrderUpdateSchema = insertPurchaseOrderSchema.partial();
export const purchaseOrderItemInsertSchema = insertPurchaseOrderItemSchema;
export const purchaseOrderItemWithoutParentSchema = insertPurchaseOrderItemSchema.omit({
  purchaseOrderId: true,
});
