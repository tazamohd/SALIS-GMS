CREATE TABLE "license_activations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"action" varchar(20) NOT NULL,
	"garage_id" uuid,
	"instance_id" varchar(128),
	"performed_by" varchar,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_key" varchar(512) NOT NULL,
	"plan" varchar(20) DEFAULT 'STARTER' NOT NULL,
	"type" varchar(20) DEFAULT 'subscription' NOT NULL,
	"status" varchar(20) DEFAULT 'issued' NOT NULL,
	"max_users" integer,
	"max_branches" integer,
	"max_garages" integer,
	"max_vehicles" integer,
	"storage_gb" integer,
	"api_quota_per_day" integer,
	"bound_garage_id" uuid,
	"issued_to" varchar(255),
	"issued_by" varchar,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"activated_at" timestamp,
	"expires_at" timestamp,
	"offline_grace_days" integer DEFAULT 7 NOT NULL,
	"last_validated_at" timestamp,
	"revoked_at" timestamp,
	"revoked_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_bound_garage_id_garages_id_fk" FOREIGN KEY ("bound_garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_activations_license_idx" ON "license_activations" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "licenses_status_idx" ON "licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "licenses_bound_garage_idx" ON "licenses" USING btree ("bound_garage_id");