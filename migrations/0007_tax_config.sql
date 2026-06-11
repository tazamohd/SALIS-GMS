-- DB-driven VAT / GOSI rate configuration (editable without a code deploy).
CREATE TABLE IF NOT EXISTS "vat_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "country_code" varchar(2) NOT NULL DEFAULT 'SA',
  "vat_rate" double precision NOT NULL DEFAULT 0.15,
  "vat_registration_number" varchar(50),
  "company_name_en" varchar(255),
  "company_name_ar" varchar(255),
  "is_active" boolean NOT NULL DEFAULT true,
  "effective_from" timestamp NOT NULL DEFAULT now(),
  "effective_to" timestamp,
  "changed_by" varchar(255),
  "change_reason" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gosi_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "saudi_employee_rate" double precision NOT NULL DEFAULT 0.0975,
  "saudi_employer_rate" double precision NOT NULL DEFAULT 0.1175,
  "non_saudi_employee_rate" double precision NOT NULL DEFAULT 0,
  "non_saudi_employer_rate" double precision NOT NULL DEFAULT 0.02,
  "max_contribution_salary" numeric(12, 2) NOT NULL DEFAULT '45000',
  "is_active" boolean NOT NULL DEFAULT true,
  "effective_from" timestamp NOT NULL DEFAULT now(),
  "effective_to" timestamp,
  "changed_by" varchar(255),
  "change_reason" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
-- Seed one active row each (only if none exists yet).
INSERT INTO "vat_config" ("country_code", "vat_rate", "company_name_en", "company_name_ar", "is_active")
SELECT 'SA', 0.15, 'SALIS AUTO', 'ساليس أوتو', true
WHERE NOT EXISTS (SELECT 1 FROM "vat_config" WHERE "is_active" = true);--> statement-breakpoint
INSERT INTO "gosi_config" ("saudi_employee_rate", "saudi_employer_rate", "non_saudi_employee_rate", "non_saudi_employer_rate", "max_contribution_salary", "is_active")
SELECT 0.0975, 0.1175, 0, 0.02, '45000', true
WHERE NOT EXISTS (SELECT 1 FROM "gosi_config" WHERE "is_active" = true);
