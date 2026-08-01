-- Exactly-once gateway settlement (deep-audit blocker B9).
--
-- Payment gateways retry webhooks; without a DB-level guard, two concurrent
-- retries of the same gateway transaction could each insert a completed payment
-- and double-credit the invoice. This partial unique index makes a duplicate
-- (gateway, gateway_transaction_id) impossible at the database level. It is
-- PARTIAL so the many manual / pending rows that carry a NULL transaction id
-- are unaffected (they are settled by other means and legitimately share NULL).
CREATE UNIQUE INDEX IF NOT EXISTS "payments_gateway_txn_unique"
  ON "payments" ("gateway", "gateway_transaction_id")
  WHERE "gateway_transaction_id" IS NOT NULL;
