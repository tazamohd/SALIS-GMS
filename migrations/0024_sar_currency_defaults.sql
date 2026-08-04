-- SAR is the platform currency (Saudi/GCC market). Flip every remaining
-- USD column default to SAR and migrate rows that only ever held the old
-- default. Idempotent: SET DEFAULT is absolute, UPDATEs filter on 'USD'.
ALTER TABLE "spare_part_inventories" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "pricing_history" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "accounting_transactions" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "supplier_price_list" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "marketplace_orders" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "smart_contracts" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "marketing_accounts" ALTER COLUMN "currency" SET DEFAULT 'SAR';--> statement-breakpoint
UPDATE "spare_part_inventories" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "pricing_history" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "accounting_transactions" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "user_settings" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "supplier_price_list" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "marketplace_orders" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "smart_contracts" SET "currency" = 'SAR' WHERE "currency" = 'USD';--> statement-breakpoint
UPDATE "marketing_accounts" SET "currency" = 'SAR' WHERE "currency" = 'USD';
