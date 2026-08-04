-- Trial-expiry enforcement (D1) reads current_period_end, but trials
-- provisioned before that change carry NULL and would stay trialing
-- forever. Backfill their period from creation time using the default
-- trial length. Idempotent: only NULL rows match; Stripe-managed
-- subscriptions are excluded (webhooks own their lifecycle).
UPDATE "subscriptions"
SET "current_period_start" = COALESCE("current_period_start", "created_at"),
    "current_period_end" = "created_at" + INTERVAL '14 days'
WHERE "status" = 'trialing'
  AND "current_period_end" IS NULL
  AND "stripe_subscription_id" IS NULL;
