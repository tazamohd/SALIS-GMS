CREATE TABLE "staff_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"requested_role_key" varchar(50),
	"message" text,
	"password_hash" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"provisioned_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"code" varchar(24) NOT NULL,
	"email" varchar(255),
	"role_key" varchar(50) NOT NULL,
	"guard_role" varchar(20) NOT NULL,
	"user_type" varchar(50),
	"max_uses" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "garage_applications" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "tax_number" varchar(20);--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "commercial_registration" varchar(20);--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "brand_primary_color" varchar(20);--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "brand_secondary_color" varchar(20);--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "invoice_settings" jsonb;--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "onboarding_step" varchar(40);--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "staff_join_code" varchar(12);--> statement-breakpoint
ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_applications" ADD CONSTRAINT "staff_applications_provisioned_user_id_users_id_fk" FOREIGN KEY ("provisioned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_invites" ADD CONSTRAINT "staff_invites_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_invites" ADD CONSTRAINT "staff_invites_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_invites" ADD CONSTRAINT "staff_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_applications_garage_status_idx" ON "staff_applications" USING btree ("garage_id","status");--> statement-breakpoint
CREATE INDEX "staff_invites_garage_idx" ON "staff_invites" USING btree ("garage_id");--> statement-breakpoint
ALTER TABLE "garages" ADD CONSTRAINT "garages_staff_join_code_unique" UNIQUE("staff_join_code");