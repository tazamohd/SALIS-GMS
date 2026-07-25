CREATE TABLE "accounting_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"company_id" varchar NOT NULL,
	"company_name" varchar,
	"access_token" text,
	"refresh_token" text,
	"token_expiry" timestamp,
	"is_active" boolean DEFAULT true,
	"sync_settings" jsonb,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accounting_sync" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"sync_type" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"local_id" varchar NOT NULL,
	"external_id" varchar,
	"status" varchar(50) DEFAULT 'pending',
	"sync_direction" varchar(50),
	"last_synced_at" timestamp,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accounting_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"invoice_id" uuid,
	"external_id" varchar(255),
	"transaction_type" varchar(100) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"description" text,
	"transaction_date" timestamp NOT NULL,
	"sync_status" varchar(50) DEFAULT 'pending',
	"synced_at" timestamp,
	"accounting_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "action_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"previous_state" jsonb,
	"new_state" jsonb,
	"can_undo" boolean DEFAULT true,
	"undone_at" timestamp,
	"redone_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"module" varchar(100) NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar,
	"session_id" varchar(255),
	"messages" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active',
	"handoff_to" varchar,
	"handoff_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"intent" varchar(100),
	"confidence" numeric(5, 2),
	"action_taken" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_job_estimations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"job_card_id" uuid,
	"vehicle_id" uuid,
	"service_type" varchar(255),
	"estimated_hours" numeric(10, 2),
	"estimated_cost" numeric(10, 2),
	"confidence" numeric(5, 2),
	"reasoning" text,
	"actual_hours" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_maintenance_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"predicted_issue" text NOT NULL,
	"severity" varchar(50),
	"recommended_action" text,
	"estimated_timeframe" varchar(100),
	"confidence" numeric(5, 2),
	"based_on_data" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_parts_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"job_card_id" uuid,
	"vehicle_id" uuid NOT NULL,
	"recommended_parts" jsonb NOT NULL,
	"reasoning" text,
	"total_estimated_cost" numeric(10, 2),
	"confidence" numeric(5, 2),
	"status" varchar(50) DEFAULT 'pending',
	"applied_to_job_card" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_schedule_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"optimization_type" varchar(100),
	"suggestions" jsonb NOT NULL,
	"reasoning" text,
	"potential_time_saved" numeric(10, 2),
	"status" varchar(50) DEFAULT 'pending',
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_scheduling_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"priority" integer DEFAULT 1,
	"consider_technician_skills" boolean DEFAULT true,
	"consider_technician_workload" boolean DEFAULT true,
	"consider_part_availability" boolean DEFAULT true,
	"consider_customer_preference" boolean DEFAULT true,
	"buffer_time_between_jobs" integer DEFAULT 15,
	"max_jobs_per_technician" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_service_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"suggestion_type" varchar(100) NOT NULL,
	"service_description" text NOT NULL,
	"estimated_cost" numeric(10, 2),
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"reasoning" text,
	"confidence" numeric(5, 2),
	"related_job_card_id" uuid,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"presented_at" timestamp,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_video_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar,
	"vehicle_id" uuid,
	"video_url" varchar(500) NOT NULL,
	"video_size" integer,
	"video_duration" integer,
	"uploaded_at" timestamp DEFAULT now(),
	"analysis_status" varchar(20) DEFAULT 'pending',
	"ai_model" varchar(50) DEFAULT 'gpt-4-vision',
	"detected_issues" jsonb,
	"confidence" numeric(5, 2),
	"suggested_services" jsonb,
	"estimated_cost" numeric(10, 2),
	"priority_level" varchar(20) DEFAULT 'medium',
	"triage_category" varchar(50),
	"appointment_scheduled" boolean DEFAULT false,
	"appointment_id" uuid,
	"analysis_notes" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"reminder_type" varchar NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"previous_status" varchar,
	"new_status" varchar NOT NULL,
	"changed_by" varchar NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_number" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"customer_id" varchar,
	"customer_name" varchar NOT NULL,
	"customer_phone" varchar NOT NULL,
	"customer_email" varchar,
	"vehicle_info" jsonb NOT NULL,
	"service_type" varchar NOT NULL,
	"description" text,
	"appointment_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"status" varchar DEFAULT 'scheduled' NOT NULL,
	"assigned_to" varchar,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp,
	"notes" text,
	"cancellation_reason" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "appointments_appointment_number_unique" UNIQUE("appointment_number")
);
--> statement-breakpoint
CREATE TABLE "ar_guide_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"job_card_id" uuid,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration" integer,
	"steps_completed" integer DEFAULT 0,
	"accuracy" numeric(5, 2),
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_repair_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"repair_category" varchar(100),
	"difficulty_level" varchar(20) DEFAULT 'intermediate',
	"estimated_duration" integer,
	"ar_model_url" varchar(500),
	"steps" jsonb,
	"required_tools" jsonb,
	"safety_warnings" text,
	"view_count" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"is_published" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assistant_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"assigned_tasks" text,
	"training_level" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto_reorder_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"stock_level_at_trigger" integer NOT NULL,
	"quantity_ordered" integer NOT NULL,
	"supplier" varchar,
	"order_status" varchar(50) DEFAULT 'pending',
	"purchase_order_id" uuid,
	"triggered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auto_reorder_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"reorder_point" integer NOT NULL,
	"reorder_quantity" integer NOT NULL,
	"preferred_supplier" varchar,
	"max_price" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"last_triggered" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "backup_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"job_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"file_name" varchar(255),
	"file_size" integer,
	"data_types" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "barcode_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"scan_type" varchar(50) NOT NULL,
	"barcode_data" varchar NOT NULL,
	"part_id" uuid,
	"vehicle_id" uuid,
	"tool_id" uuid,
	"scanned_by" varchar NOT NULL,
	"location" varchar,
	"associated_action" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "biometric_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"authentication_type" varchar(50) NOT NULL,
	"success" boolean NOT NULL,
	"confidence" numeric(5, 2),
	"device_id" varchar(100),
	"ip_address" varchar(50),
	"location" varchar(255),
	"action" varchar(100),
	"failure_reason" varchar(255),
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "biometric_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"fingerprint_hash" varchar(255),
	"face_embedding" text,
	"voiceprint_hash" varchar(255),
	"enrollment_date" timestamp DEFAULT now(),
	"last_verified" timestamp,
	"verification_count" integer DEFAULT 0,
	"failed_attempts" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"device_bindings" jsonb,
	"security_level" varchar(20) DEFAULT 'standard',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "biometric_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "blockchain_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"record_type" varchar(50) NOT NULL,
	"transaction_hash" varchar(66) NOT NULL,
	"block_number" integer,
	"blockchain_network" varchar(50) DEFAULT 'ethereum',
	"record_data" jsonb NOT NULL,
	"previous_hash" varchar(66),
	"timestamp" timestamp NOT NULL,
	"verification_status" varchar(20) DEFAULT 'verified',
	"smart_contract_address" varchar(42),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blockchain_records_transaction_hash_unique" UNIQUE("transaction_hash")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_heatmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"heatmap_type" varchar(100) NOT NULL,
	"period_type" varchar(50) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"data_points" jsonb NOT NULL,
	"aggregation_level" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_type" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"affected_technicians" jsonb,
	"is_all_day" boolean DEFAULT false,
	"color" varchar(7) DEFAULT '#000000',
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calibration_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calibration_id" uuid NOT NULL,
	"reminder_date" timestamp NOT NULL,
	"notified_users" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "camera_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"camera_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"recording_start" timestamp NOT NULL,
	"recording_end" timestamp NOT NULL,
	"recording_url" varchar,
	"file_size" integer,
	"event_type" varchar(50),
	"is_bookmarked" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"unsubscribed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"title" varchar(255),
	"type" varchar(50) DEFAULT 'direct' NOT NULL,
	"created_by" varchar NOT NULL,
	"last_message_at" timestamp,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_message_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"reaction" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" varchar NOT NULL,
	"message_type" varchar(50) DEFAULT 'text',
	"content" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"reply_to_id" uuid,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"last_read_at" timestamp,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp,
	"is_active" boolean DEFAULT true,
	"notifications_enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "collaboration_experts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"specialization" jsonb,
	"certifications" jsonb,
	"availability" jsonb,
	"hourly_rate" numeric(10, 2),
	"average_rating" numeric(3, 2),
	"total_sessions" integer DEFAULT 0,
	"success_rate" numeric(5, 2),
	"languages" jsonb,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"session_type" varchar(50) DEFAULT 'video_consultation',
	"job_card_id" uuid,
	"host_user_id" varchar NOT NULL,
	"expert_user_id" varchar,
	"participants" jsonb,
	"session_status" varchar(20) DEFAULT 'scheduled',
	"connection_quality" varchar(20),
	"bandwidth" integer,
	"latency" integer,
	"recording_url" varchar(500),
	"transcript" text,
	"shared_notes" text,
	"resolution" varchar(255),
	"rating" integer,
	"feedback" text,
	"started_at" timestamp,
	"ended_at" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"rule_type" varchar(30) NOT NULL,
	"base_percentage" numeric(5, 2),
	"fixed_amount" numeric(10, 2),
	"tier_config" jsonb,
	"applicable_services" text[],
	"min_job_value" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"job_card_id" uuid,
	"invoice_id" uuid,
	"commission_rule_id" uuid,
	"base_amount" numeric(10, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2),
	"period" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "corrective_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"non_conformance_id" uuid NOT NULL,
	"action_description" text NOT NULL,
	"assigned_to" varchar NOT NULL,
	"due_date" timestamp NOT NULL,
	"completed_date" timestamp,
	"effectiveness" varchar(50),
	"verified_by" varchar,
	"verified_date" timestamp,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cross_border_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fulfillment_order_id" uuid NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"document_number" varchar(100),
	"document_url" varchar(500),
	"issued_date" timestamp,
	"expiry_date" timestamp,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "currency_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_currency" varchar(3) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"effective_date" timestamp NOT NULL,
	"source" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"report_type" varchar(100) NOT NULL,
	"configuration" jsonb NOT NULL,
	"schedule" varchar(100),
	"recipients" jsonb,
	"last_run_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_loyalty_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"program_id" uuid NOT NULL,
	"total_points_earned" integer DEFAULT 0,
	"current_points" integer DEFAULT 0,
	"lifetime_spent" numeric(12, 2) DEFAULT '0.00',
	"current_tier" varchar(50) DEFAULT 'bronze',
	"tier_since" timestamp DEFAULT now(),
	"referral_code" varchar(50),
	"successful_referrals" integer DEFAULT 0,
	"enrolled_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_loyalty_accounts_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "customer_ltv_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"total_revenue" numeric(12, 2) NOT NULL,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"avg_order_value" numeric(10, 2),
	"first_visit_date" timestamp,
	"last_visit_date" timestamp,
	"days_since_last_visit" integer,
	"visit_frequency" numeric(5, 2),
	"predicted_ltv" numeric(12, 2),
	"retention_risk" varchar(50),
	"retention_score" numeric(5, 2),
	"churn_probability" numeric(5, 2),
	"recommended_action" text,
	"calculated_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"note_type" varchar(50) NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL,
	"is_important" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_portal_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_accessed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_portal_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "customer_portal_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"allow_online_booking" boolean DEFAULT true,
	"allow_estimate_approval" boolean DEFAULT true,
	"allow_online_payment" boolean DEFAULT true,
	"allow_service_history_view" boolean DEFAULT true,
	"require_email_verification" boolean DEFAULT true,
	"custom_branding" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"address" varchar(500),
	"nationality" varchar(100),
	"preferred_language" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "customer_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referee_email" varchar NOT NULL,
	"referee_phone" varchar,
	"referee_name" varchar,
	"referee_id" varchar,
	"referral_code" varchar NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"first_visit_date" timestamp,
	"first_purchase_amount" numeric(10, 2),
	"referrer_reward_claimed" boolean DEFAULT false,
	"referrer_reward_claimed_at" timestamp,
	"referee_reward_claimed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "customer_referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "customer_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"job_card_id" uuid,
	"rating" integer NOT NULL,
	"service_quality_rating" integer,
	"pricing_rating" integer,
	"speed_rating" integer,
	"communication_rating" integer,
	"title" varchar,
	"comment" text,
	"would_recommend" boolean,
	"platform" varchar(50),
	"external_review_id" varchar,
	"is_public" boolean DEFAULT true,
	"response_text" text,
	"responded_at" timestamp,
	"responded_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"widget_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"data_source" varchar(255) NOT NULL,
	"configuration" jsonb NOT NULL,
	"position" jsonb,
	"refresh_interval" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demand_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"forecast_type" varchar(100) NOT NULL,
	"target_date" timestamp NOT NULL,
	"predicted_value" numeric(12, 2) NOT NULL,
	"confidence_interval" jsonb,
	"actual_value" numeric(12, 2),
	"accuracy" numeric(5, 2),
	"model_used" varchar(100),
	"input_features" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"technician_id" varchar,
	"vehicle_id" uuid,
	"assigned_at" timestamp DEFAULT now(),
	"unassigned_at" timestamp,
	"status" varchar(50) DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "diagnostic_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"report_type" varchar(100),
	"fault_codes" text[],
	"live_data" jsonb,
	"recommendations" text,
	"severity" varchar(50),
	"generated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digital_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"related_type" varchar(50) NOT NULL,
	"related_id" uuid NOT NULL,
	"signed_by" varchar NOT NULL,
	"signature_data" text NOT NULL,
	"signature_type" varchar(50) DEFAULT 'customer',
	"ip_address" varchar(50),
	"device_info" varchar(255),
	"consent_text" text,
	"consent_given" boolean DEFAULT false,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digital_twins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"twin_status" varchar(20) DEFAULT 'active',
	"last_synced_at" timestamp,
	"data_points" integer DEFAULT 0,
	"simulation_runs" integer DEFAULT 0,
	"virtual_model" jsonb,
	"sensor_data" jsonb,
	"maintenance_history" jsonb,
	"wear_patterns" jsonb,
	"performance_metrics" jsonb,
	"fuel_efficiency" numeric(5, 2),
	"predicted_failures" jsonb,
	"next_maintenance_date" timestamp,
	"estimated_remaining_life" integer,
	"total_mileage" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "digital_twins_vehicle_id_unique" UNIQUE("vehicle_id")
);
--> statement-breakpoint
CREATE TABLE "digital_walkarounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"walkaround_type" varchar(50) NOT NULL,
	"photos" jsonb NOT NULL,
	"mileage_reading" integer,
	"fuel_level" varchar(20),
	"damage_previously_noted" jsonb,
	"new_damage_identified" jsonb,
	"interior_condition" varchar(50),
	"customer_signature_url" varchar,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discount_id" uuid NOT NULL,
	"invoice_id" uuid,
	"estimate_id" uuid,
	"customer_id" varchar NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discounts_promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_purchase_amount" numeric(10, 2),
	"max_discount_amount" numeric(10, 2),
	"applicable_categories" text[],
	"applicable_services" text[],
	"applicable_parts" text[],
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"per_customer_limit" integer,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "discounts_promotions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "document_access_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"accessed_by" varchar NOT NULL,
	"action" varchar(50) NOT NULL,
	"ip_address" varchar(50),
	"device_info" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"category_name" varchar(255) NOT NULL,
	"description" text,
	"requires_expiration" boolean DEFAULT false,
	"expiration_warning_days" integer DEFAULT 30,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"category_id" uuid,
	"document_name" varchar(255) NOT NULL,
	"description" text,
	"related_type" varchar(50),
	"related_id" varchar,
	"file_url" varchar(500) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"document_number" varchar(100),
	"issue_date" timestamp,
	"expiration_date" timestamp,
	"reminder_sent" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'active',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drone_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar,
	"inspection_type" varchar(50) NOT NULL,
	"drone_model" varchar(100),
	"pilot_id" varchar,
	"flight_duration" integer,
	"altitude_range" varchar(50),
	"weather_conditions" varchar(100),
	"image_count" integer DEFAULT 0,
	"video_count" integer DEFAULT 0,
	"damage_detected" boolean DEFAULT false,
	"ai_analysis_completed" boolean DEFAULT false,
	"inspection_status" varchar(20) DEFAULT 'scheduled',
	"scheduled_at" timestamp,
	"completed_at" timestamp,
	"report_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drone_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inspection_id" uuid NOT NULL,
	"media_type" varchar(20) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"file_size" integer,
	"resolution" varchar(20),
	"capture_angle" varchar(50),
	"gps_coordinates" varchar(100),
	"altitude" numeric(6, 2),
	"damage_annotations" jsonb,
	"ai_confidence_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "edge_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"device_name" varchar(255) NOT NULL,
	"device_type" varchar(50) NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"ip_address" varchar(50),
	"mac_address" varchar(20),
	"manufacturer" varchar(100),
	"model" varchar(100),
	"firmware_version" varchar(50),
	"cpu_usage" numeric(5, 2),
	"memory_usage" numeric(5, 2),
	"storage_usage" numeric(5, 2),
	"capabilities" jsonb,
	"offline_mode" boolean DEFAULT false,
	"last_sync" timestamp,
	"status" varchar(20) DEFAULT 'online',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "edge_devices_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "edge_diagnostics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"diagnostic_type" varchar(50) NOT NULL,
	"processed_locally" boolean DEFAULT true,
	"data_size" integer,
	"processing_time" integer,
	"raw_data" jsonb,
	"results" jsonb,
	"dtc_codes" jsonb,
	"recommendations" jsonb,
	"cloud_synced" boolean DEFAULT false,
	"synced_at" timestamp,
	"performed_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"template" text NOT NULL,
	"provider" varchar(50) DEFAULT 'sendgrid',
	"target_audience" varchar(100),
	"customer_segment" jsonb,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"total_recipients" integer DEFAULT 0,
	"emails_sent" integer DEFAULT 0,
	"emails_opened" integer DEFAULT 0,
	"click_throughs" integer DEFAULT 0,
	"bounces" integer DEFAULT 0,
	"unsubscribes" integer DEFAULT 0,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar(100),
	"subject" varchar NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"variables" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"employee_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"clock_in" timestamp NOT NULL,
	"clock_out" timestamp,
	"break_start" timestamp,
	"break_end" timestamp,
	"total_hours" numeric(5, 2),
	"overtime_hours" numeric(5, 2),
	"status" varchar(20) DEFAULT 'present' NOT NULL,
	"notes" text,
	"approved_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_trainings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"employee_id" varchar NOT NULL,
	"training_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'enrolled' NOT NULL,
	"enrolled_date" timestamp DEFAULT now() NOT NULL,
	"completed_date" timestamp,
	"expiry_date" timestamp,
	"score" numeric(5, 2),
	"certificate_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entitlement_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"revoked_at" timestamp,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "environmental_compliance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"compliance_type" varchar(100) NOT NULL,
	"record_date" timestamp NOT NULL,
	"waste_type" varchar,
	"quantity" numeric(10, 2),
	"unit" varchar(50),
	"disposal_method" varchar,
	"disposal_company" varchar,
	"certification_number" varchar,
	"cost" numeric(10, 2),
	"regulatory_standard" varchar,
	"attachments" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "equipment_calibration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"tool_id" uuid NOT NULL,
	"calibration_type" varchar(100) NOT NULL,
	"calibration_standard" varchar,
	"last_calibration_date" timestamp NOT NULL,
	"next_calibration_due" timestamp NOT NULL,
	"calibration_interval" integer NOT NULL,
	"calibrated_by" varchar,
	"certification_number" varchar,
	"calibration_results" jsonb,
	"status" varchar(50) DEFAULT 'valid',
	"attachments" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "estimate_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estimate_id" uuid NOT NULL,
	"item_type" varchar NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"unit_cost" numeric(10, 2),
	"line_total" numeric(10, 2) NOT NULL,
	"discount_id" uuid,
	"discount_amount" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estimate_number" varchar(50) NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"vehicle_info" jsonb,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"valid_until" timestamp,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"converted_to_job_card_id" uuid,
	"converted_to_invoice_id" uuid,
	"notes" text,
	"terms" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "estimates_estimate_number_unique" UNIQUE("estimate_number")
);
--> statement-breakpoint
CREATE TABLE "export_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"module" varchar(50) NOT NULL,
	"format" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"file_name" varchar(255),
	"file_url" text,
	"filter_config" jsonb,
	"record_count" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"flag_name" varchar(255) NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"source" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fleet_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleet_group_id" uuid NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	"contract_type" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"monthly_fee" numeric(10, 2),
	"discount_percentage" numeric(5, 2) DEFAULT '0.00',
	"included_services" jsonb DEFAULT '[]'::jsonb,
	"excluded_services" jsonb DEFAULT '[]'::jsonb,
	"max_vehicles" integer,
	"billing_cycle" varchar(50) DEFAULT 'monthly',
	"auto_renew" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'active',
	"terms" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fleet_contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "fleet_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"fleet_name" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"contact_person" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"billing_address" text,
	"tax_id" varchar(100),
	"discount_percentage" numeric(5, 2) DEFAULT '0.00',
	"payment_terms" varchar(100),
	"preferred_payment_method" varchar(50),
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fleet_maintenance_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleet_group_id" uuid NOT NULL,
	"schedule_name" varchar(255) NOT NULL,
	"description" text,
	"service_type" varchar(100) NOT NULL,
	"interval_type" varchar NOT NULL,
	"interval_mileage" integer,
	"interval_months" integer,
	"applicable_vehicle_types" text[],
	"estimated_cost" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fleet_pricing_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"fleet_group_id" uuid,
	"tier_name" varchar(255) NOT NULL,
	"min_vehicles" integer NOT NULL,
	"max_vehicles" integer,
	"discount_percentage" numeric(5, 2) NOT NULL,
	"applicable_services" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fleet_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleet_group_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"fleet_number" varchar(100),
	"department" varchar(100),
	"assigned_driver" varchar(255),
	"driver_phone" varchar(20),
	"average_monthly_mileage" integer,
	"custom_maintenance_schedule" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "franchise_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_group_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"franchisee_owner_id" varchar,
	"joined_at" timestamp DEFAULT now(),
	"status" varchar(50) DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "franchise_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_group_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"royalty_percentage" numeric(5, 2),
	"marketing_fee_percentage" numeric(5, 2),
	"status" varchar(50) DEFAULT 'active',
	"terms" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "franchise_contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "franchise_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"headquarters" varchar(500),
	"total_branches" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "franchise_kpis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"month" varchar(7) NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"total_job_cards" integer DEFAULT 0,
	"customer_satisfaction" numeric(3, 2),
	"royalty_paid" numeric(12, 2) DEFAULT '0',
	"marketing_fee_paid" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "franchise_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"franchise_group_id" uuid,
	"permissions" jsonb,
	"level" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_detection_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"case_type" varchar(50) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" varchar(100),
	"detection_method" varchar(50) DEFAULT 'ml_algorithm',
	"risk_score" numeric(5, 2) NOT NULL,
	"confidence" numeric(5, 2),
	"anomaly_indicators" jsonb,
	"suspicious_patterns" jsonb,
	"historical_data" jsonb,
	"estimated_loss" numeric(10, 2),
	"status" varchar(20) DEFAULT 'detected',
	"investigator" varchar,
	"investigation_notes" text,
	"resolution" text,
	"action_taken" text,
	"detected_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_detection_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"rule_type" varchar(50) NOT NULL,
	"category" varchar(50),
	"conditions" jsonb NOT NULL,
	"threshold" numeric(10, 2),
	"severity" varchar(20) DEFAULT 'medium',
	"is_active" boolean DEFAULT true,
	"trigger_count" integer DEFAULT 0,
	"false_positive_rate" numeric(5, 2),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fulfillment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"partner_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"order_date" timestamp DEFAULT now(),
	"requested_delivery_date" timestamp,
	"status" varchar(50) DEFAULT 'pending',
	"total_amount" numeric(12, 2) DEFAULT '0',
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fulfillment_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "garages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(100),
	"city" varchar(100),
	"license_number" varchar(100),
	"saas_plan_id" uuid,
	"working_hours" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gdpr_data_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" varchar,
	"request_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"request_data" jsonb,
	"response_data" jsonb,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incident_investigations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"investigator" varchar NOT NULL,
	"root_cause_analysis" text,
	"contributing_factors" jsonb,
	"preventive_measures" jsonb,
	"completed_date" timestamp,
	"status" varchar(50) DEFAULT 'in_progress',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inspection_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"vehicle_types" jsonb DEFAULT '[]'::jsonb,
	"checklist_items" jsonb NOT NULL,
	"estimate_rules" jsonb DEFAULT '[]'::jsonb,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_plan_id" uuid NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"payment_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insurance_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"claim_number" varchar NOT NULL,
	"job_card_id" uuid,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"insurance_company" varchar NOT NULL,
	"policy_number" varchar,
	"claim_type" varchar(100),
	"incident_date" timestamp NOT NULL,
	"claim_amount" numeric(12, 2) NOT NULL,
	"approved_amount" numeric(12, 2),
	"deductible" numeric(10, 2),
	"status" varchar(50) DEFAULT 'submitted',
	"adjuster_name" varchar,
	"adjuster_contact" varchar,
	"estimate_url" varchar,
	"documents" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "insurance_claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
CREATE TABLE "integration_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"integration_type" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true,
	"settings" jsonb,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"connection_id" uuid,
	"sync_type" varchar(100) NOT NULL,
	"status" varchar(50) NOT NULL,
	"records_processed" integer DEFAULT 0,
	"error_message" text,
	"sync_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_audit_trail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"action_type" varchar(50) NOT NULL,
	"quantity_before" integer NOT NULL,
	"quantity_change" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"unit_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"reference_type" varchar(50),
	"reference_id" uuid,
	"reason" varchar(255),
	"notes" text,
	"performed_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_number" varchar(50) NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"from_garage_id" uuid NOT NULL,
	"from_branch_id" uuid,
	"to_garage_id" uuid NOT NULL,
	"to_branch_id" uuid,
	"quantity" integer NOT NULL,
	"transfer_status" varchar(50) DEFAULT 'pending',
	"requested_by" varchar NOT NULL,
	"approved_by" varchar,
	"completed_by" varchar,
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"shipped_at" timestamp,
	"completed_at" timestamp,
	"expected_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"reason" varchar(255),
	"notes" text,
	"tracking_number" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "inventory_transfers_transfer_number_unique" UNIQUE("transfer_number")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"item_type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"unit_cost" numeric(10, 2),
	"line_total" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"discount_id" uuid,
	"discount_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"job_card_id" uuid,
	"invoice_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"balance_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"terms_and_conditions" text,
	"created_by" varchar NOT NULL,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "iot_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'medium',
	"message" text NOT NULL,
	"trigger_value" numeric(10, 2),
	"recommended_action" text,
	"status" varchar(20) DEFAULT 'active',
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iot_sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid NOT NULL,
	"reading_type" varchar(50) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"unit" varchar(20),
	"threshold" numeric(10, 2),
	"is_abnormal" boolean DEFAULT false,
	"raw_data" jsonb,
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iot_sensors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"sensor_type" varchar(50) NOT NULL,
	"sensor_identifier" varchar(100) NOT NULL,
	"manufacturer" varchar(100),
	"model" varchar(100),
	"installation_date" timestamp,
	"last_communication" timestamp,
	"battery_level" integer,
	"firmware_version" varchar(50),
	"status" varchar(20) DEFAULT 'active',
	"alerts_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "iot_sensors_sensor_identifier_unique" UNIQUE("sensor_identifier")
);
--> statement-breakpoint
CREATE TABLE "job_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_number" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"customer_id" varchar,
	"vehicle_info" jsonb NOT NULL,
	"service_type" varchar NOT NULL,
	"description" text NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"estimated_hours" numeric(4, 2),
	"actual_hours" numeric(4, 2),
	"total_cost" numeric(10, 2),
	"created_by" varchar NOT NULL,
	"assigned_to" varchar,
	"scheduled_date" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "job_cards_job_number_unique" UNIQUE("job_number")
);
--> statement-breakpoint
CREATE TABLE "kiosk_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"appointment_id" uuid,
	"service_requested" jsonb,
	"mileage" integer,
	"signature_url" varchar,
	"check_in_time" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kiosk_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"kiosk_id" varchar NOT NULL,
	"session_start" timestamp DEFAULT now(),
	"session_end" timestamp,
	"customer_id" varchar,
	"vehicle_id" uuid,
	"check_in_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "license_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"user_id" varchar,
	"event_details" text,
	"ip_address" varchar(50),
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "license_plate_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"plate_number" varchar NOT NULL,
	"confidence" numeric(5, 2),
	"vehicle_id" uuid,
	"customer_id" varchar,
	"camera_id" uuid,
	"image_url" varchar,
	"scan_type" varchar(50),
	"location" varchar,
	"matched_automatically" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loaner_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loaner_vehicle_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"job_card_id" uuid,
	"reservation_number" varchar(100),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"actual_return_date" timestamp,
	"start_mileage" integer,
	"end_mileage" integer,
	"start_fuel_level" varchar(20),
	"end_fuel_level" varchar(20),
	"deposit_paid" numeric(10, 2),
	"deposit_refunded" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"damage_reported" boolean DEFAULT false,
	"damage_description" text,
	"damage_photos" jsonb DEFAULT '[]'::jsonb,
	"damage_charge" numeric(10, 2),
	"status" varchar(50) DEFAULT 'reserved',
	"agreement_signature_id" uuid,
	"return_signature_id" uuid,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "loaner_reservations_reservation_number_unique" UNIQUE("reservation_number")
);
--> statement-breakpoint
CREATE TABLE "loaner_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"loaner_number" varchar(100),
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"license_plate" varchar(50),
	"vin" varchar(17),
	"color" varchar(50),
	"current_mileage" integer,
	"daily_rate" numeric(8, 2) DEFAULT '0.00',
	"deposit_amount" numeric(10, 2) DEFAULT '0.00',
	"insurance_coverage" text,
	"status" varchar(50) DEFAULT 'available',
	"condition" varchar(50) DEFAULT 'good',
	"last_service_date" timestamp,
	"next_service_due" integer,
	"features" jsonb DEFAULT '[]'::jsonb,
	"restrictions" text,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "loaner_vehicles_loaner_number_unique" UNIQUE("loaner_number")
);
--> statement-breakpoint
CREATE TABLE "locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"english_name" varchar(100),
	"is_rtl" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "locales_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "loyalty_program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"program_name" varchar(255) NOT NULL,
	"description" text,
	"points_per_dollar" numeric(5, 2) DEFAULT '1.00',
	"points_expire_days" integer,
	"referral_bonus_points" integer DEFAULT 0,
	"birthday_bonus_points" integer DEFAULT 0,
	"tier_system" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"reward_id" uuid NOT NULL,
	"points_redeemed" integer NOT NULL,
	"redemption_code" varchar(100),
	"status" varchar(50) DEFAULT 'pending',
	"used_at" timestamp,
	"expires_at" timestamp,
	"related_invoice_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "loyalty_redemptions_redemption_code_unique" UNIQUE("redemption_code")
);
--> statement-breakpoint
CREATE TABLE "loyalty_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"reward_name" varchar(255) NOT NULL,
	"description" text,
	"points_cost" integer NOT NULL,
	"reward_type" varchar(50) NOT NULL,
	"reward_value" numeric(10, 2),
	"availability" integer,
	"redeemed" integer DEFAULT 0,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"terms" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"points" integer NOT NULL,
	"related_type" varchar(50),
	"related_id" uuid,
	"description" text,
	"expires_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"description" text,
	"interval_type" varchar NOT NULL,
	"interval_mileage" integer,
	"interval_months" integer,
	"last_service_date" timestamp,
	"last_service_mileage" integer,
	"next_due_date" timestamp,
	"next_due_mileage" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"campaign_name" varchar(255) NOT NULL,
	"campaign_type" varchar(50) NOT NULL,
	"category" varchar(100),
	"target_audience" varchar(50) DEFAULT 'all',
	"target_filters" jsonb DEFAULT '{}'::jsonb,
	"subject" varchar(500),
	"email_content" text,
	"sms_content" text,
	"scheduled_date" timestamp,
	"send_immediately" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft',
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"clicked_count" integer DEFAULT 0,
	"unsubscribed_count" integer DEFAULT 0,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"marketplace" varchar(100) NOT NULL,
	"api_key" text,
	"api_secret" text,
	"account_id" varchar,
	"is_active" boolean DEFAULT true,
	"preferred_sellers" jsonb,
	"auto_order_threshold" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"marketplace" varchar(100) NOT NULL,
	"external_order_id" varchar NOT NULL,
	"part_number" varchar NOT NULL,
	"part_name" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"seller_id" varchar,
	"seller_name" varchar,
	"seller_rating" numeric(3, 2),
	"order_status" varchar(50) DEFAULT 'pending',
	"tracking_number" varchar,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"linked_job_card_id" uuid,
	"linked_spare_part" uuid,
	"order_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"related_type" varchar(50) NOT NULL,
	"related_id" uuid NOT NULL,
	"media_type" varchar(50) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"category" varchar(100),
	"description" text,
	"uploaded_by" varchar,
	"thumbnail_url" varchar(500),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mfa_statuses" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"method" varchar(50),
	"is_enabled" boolean DEFAULT false,
	"last_changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "network_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"partner_type" varchar(50) NOT NULL,
	"country" varchar(100),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"rating" numeric(3, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "non_conformances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"nc_number" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100),
	"severity" varchar(50),
	"detected_by" varchar NOT NULL,
	"detected_date" timestamp NOT NULL,
	"job_card_id" uuid,
	"root_cause" text,
	"status" varchar(50) DEFAULT 'open',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "non_conformances_nc_number_unique" UNIQUE("nc_number")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"channel" text,
	"event_map" text,
	"is_locked_by_admin" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"recipient_id" varchar NOT NULL,
	"garage_id" uuid,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"sent_at" timestamp,
	"read_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "obd_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"device_name" varchar(255) NOT NULL,
	"manufacturer" varchar(100),
	"model" varchar(100),
	"protocol_version" varchar(50),
	"firmware_version" varchar(50),
	"branch_id" uuid,
	"status" varchar(50) DEFAULT 'active',
	"last_connected" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "obd_devices_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "obd_diagnostic_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"job_card_id" uuid,
	"diagnostic_codes" jsonb NOT NULL,
	"live_data" jsonb,
	"freeze_frame_data" jsonb,
	"readiness_status" jsonb,
	"vehicle_info" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "obd_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"device_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"job_card_id" uuid,
	"technician_id" varchar,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "obd_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "ocr_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_url" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"extracted_data" jsonb,
	"confidence" numeric(5, 2),
	"customer_id" varchar,
	"vehicle_id" uuid,
	"invoice_id" uuid,
	"uploaded_by" varchar NOT NULL,
	"verified_by" varchar,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "oem_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_catalog_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_code" varchar(100) NOT NULL,
	"software_type" varchar(100),
	"version" varchar(50),
	"licensing_model" varchar(50),
	"price_per_seat" numeric(10, 2),
	"price_per_year" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"commission_rate" numeric(5, 2),
	"payment_terms" varchar(255),
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "partner_contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "parts_3d_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"part_number" varchar(100),
	"category" varchar(100),
	"manufacturer" varchar(100),
	"model_file_url" varchar(500) NOT NULL,
	"texture_file_url" varchar(500),
	"file_size" integer,
	"polygon_count" integer,
	"compatibility" jsonb,
	"explosion_view_url" varchar(500),
	"annotations" jsonb,
	"view_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT true,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parts_3d_view_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"user_id" varchar,
	"customer_id" varchar,
	"session_type" varchar(50) DEFAULT 'view',
	"duration" integer,
	"interactions" jsonb,
	"approved" boolean,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"plan_name" varchar(100) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"down_payment" numeric(10, 2) DEFAULT '0' NOT NULL,
	"number_of_installments" integer NOT NULL,
	"installment_amount" numeric(10, 2) NOT NULL,
	"frequency" varchar(20) DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"interest_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"reference_number" varchar(100),
	"notes" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"employee_id" varchar NOT NULL,
	"regular_hours" numeric(5, 2) DEFAULT '0',
	"overtime_hours" numeric(5, 2) DEFAULT '0',
	"hourly_rate" numeric(10, 2) NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0',
	"bonuses" numeric(10, 2) DEFAULT '0',
	"gross_pay" numeric(10, 2) NOT NULL,
	"tax_deductions" numeric(10, 2) DEFAULT '0',
	"other_deductions" numeric(10, 2) DEFAULT '0',
	"net_pay" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) DEFAULT 'direct_deposit',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"pay_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'draft',
	"total_gross_pay" numeric(12, 2),
	"total_deductions" numeric(12, 2),
	"total_net_pay" numeric(12, 2),
	"processed_by" varchar,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"employee_id" varchar NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"review_period" varchar(50) NOT NULL,
	"overall_rating" numeric(3, 2) NOT NULL,
	"technical_skills" numeric(3, 2),
	"customer_service" numeric(3, 2),
	"teamwork" numeric(3, 2),
	"punctuality" numeric(3, 2),
	"productivity" numeric(3, 2),
	"strengths" text,
	"areas_for_improvement" text,
	"goals" text,
	"comments" text,
	"employee_comments" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"allowed" boolean NOT NULL,
	"reason" text,
	"created_by" varchar,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"price_type" varchar(50) NOT NULL,
	"old_price" numeric(10, 2),
	"new_price" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"change_reason" varchar(255),
	"notes" text,
	"effective_date" timestamp DEFAULT now(),
	"changed_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_optimization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"optimization_type" varchar(50) NOT NULL,
	"service_id" uuid,
	"part_id" uuid,
	"current_price" numeric(10, 2) NOT NULL,
	"optimized_price" numeric(10, 2) NOT NULL,
	"price_change" numeric(5, 2),
	"algorithm" varchar(50) DEFAULT 'quantum_annealing',
	"factors" jsonb,
	"competitor_prices" jsonb,
	"demand_forecast" jsonb,
	"confidence_score" numeric(5, 2),
	"estimated_revenue_impact" numeric(10, 2),
	"status" varchar(20) DEFAULT 'suggested',
	"implemented_at" timestamp,
	"approved_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"rule_type" varchar(50) NOT NULL,
	"conditions" jsonb NOT NULL,
	"price_adjustment" jsonb,
	"min_price" numeric(10, 2),
	"max_price" numeric(10, 2),
	"priority" integer DEFAULT 50,
	"is_active" boolean DEFAULT true,
	"trigger_count" integer DEFAULT 0,
	"revenue_impact" numeric(12, 2),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profit_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"period_type" varchar(50) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_revenue" numeric(12, 2) NOT NULL,
	"total_costs" numeric(12, 2) NOT NULL,
	"labor_costs" numeric(12, 2),
	"parts_costs" numeric(12, 2),
	"overhead_costs" numeric(12, 2),
	"gross_profit" numeric(12, 2) NOT NULL,
	"net_profit" numeric(12, 2) NOT NULL,
	"profit_margin" numeric(5, 2) NOT NULL,
	"top_service_revenue" jsonb,
	"top_technician_revenue" jsonb,
	"top_customer_revenue" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"part_number" varchar(100),
	"part_name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer NOT NULL,
	"received_quantity" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"line_total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_number" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"expected_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" varchar NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "qr_code_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"appointment_id" uuid,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"qr_code_data" varchar(500) NOT NULL,
	"qr_code_image_url" varchar(500),
	"token_type" varchar(50) DEFAULT 'appointment',
	"is_used" boolean DEFAULT false,
	"used_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "qr_code_tokens_qr_code_data_unique" UNIQUE("qr_code_data")
);
--> statement-breakpoint
CREATE TABLE "qr_scan_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_code_id" uuid NOT NULL,
	"scanned_by" varchar,
	"scan_location" varchar(255),
	"device_info" varchar(255),
	"ip_address" varchar(50),
	"scan_result" varchar(50) DEFAULT 'success',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quality_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar(100),
	"checklistItems" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "realtime_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"session_id" varchar(100),
	"stream_type" varchar(50),
	"data_payload" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar,
	"customer_name" varchar NOT NULL,
	"customer_phone" varchar NOT NULL,
	"customer_email" varchar,
	"vehicle_info" jsonb NOT NULL,
	"service_type" varchar NOT NULL,
	"description" text,
	"duration" integer DEFAULT 60 NOT NULL,
	"assigned_to" varchar,
	"recurrence_pattern" varchar(50) NOT NULL,
	"recurrence_interval" integer DEFAULT 1,
	"day_of_week" integer,
	"day_of_month" integer,
	"start_time" varchar(5) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"max_occurrences" integer,
	"is_active" boolean DEFAULT true,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"referrer_reward_type" varchar(50) NOT NULL,
	"referrer_reward_amount" numeric(10, 2) NOT NULL,
	"referee_reward_type" varchar(50),
	"referee_reward_amount" numeric(10, 2),
	"minimum_purchase" numeric(10, 2),
	"expiry_days" integer,
	"is_active" boolean DEFAULT true,
	"terms_and_conditions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refund_number" varchar(50) NOT NULL,
	"invoice_id" uuid,
	"payment_id" uuid,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"refund_method" varchar(50) NOT NULL,
	"reason" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" varchar NOT NULL,
	"approved_by" varchar,
	"processed_by" varchar,
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"processed_at" timestamp,
	"reference_number" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "refunds_refund_number_unique" UNIQUE("refund_number")
);
--> statement-breakpoint
CREATE TABLE "reorder_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"is_auto_reorder_enabled" boolean DEFAULT false,
	"reorder_point" integer NOT NULL,
	"reorder_quantity" integer NOT NULL,
	"max_stock_level" integer,
	"supplier_id" uuid,
	"lead_time_days" integer DEFAULT 7,
	"last_reorder_date" timestamp,
	"next_reorder_date" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_sharing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_group_id" uuid NOT NULL,
	"revenue_type" varchar(100) NOT NULL,
	"franchise_percentage" numeric(5, 2) NOT NULL,
	"corporate_percentage" numeric(5, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review_platform_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"profile_url" varchar,
	"api_key" text,
	"is_active" boolean DEFAULT true,
	"auto_response" boolean DEFAULT false,
	"response_template" text,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"scope" varchar(100),
	"is_system_role" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routing_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"route_date" timestamp NOT NULL,
	"route_type" varchar(50) NOT NULL,
	"start_location" varchar,
	"stops" jsonb NOT NULL,
	"optimized_route" jsonb,
	"total_distance" numeric(10, 2),
	"estimated_duration" integer,
	"assigned_driver" varchar,
	"status" varchar(50) DEFAULT 'planned',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saas_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"max_users" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "safety_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"incident_number" varchar NOT NULL,
	"incident_date" timestamp NOT NULL,
	"incident_type" varchar(100) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"location" varchar,
	"involved_persons" jsonb,
	"witnesses" jsonb,
	"description" text NOT NULL,
	"immediate_actions" text,
	"reported_by" varchar NOT NULL,
	"osha_recordable" boolean DEFAULT false,
	"medical_treatment" boolean DEFAULT false,
	"lost_work_days" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'reported',
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "safety_incidents_incident_number_unique" UNIQUE("incident_number")
);
--> statement-breakpoint
CREATE TABLE "saudi_tax_compliance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vat_registration_number" varchar(15),
	"vat_registration_date" timestamp,
	"vat_rate" numeric(5, 2) DEFAULT '15.00',
	"is_vat_registered" boolean DEFAULT false,
	"zatca_certificate_id" varchar(100),
	"zatca_compliance_status" varchar(50) DEFAULT 'pending',
	"zatca_last_sync" timestamp,
	"zakat_enabled" boolean DEFAULT false,
	"zakat_rate" numeric(5, 2) DEFAULT '2.50',
	"use_hijri_calendar" boolean DEFAULT false,
	"company_name_arabic" varchar(255),
	"commercial_registration_number" varchar(50),
	"address_line1_arabic" varchar(255),
	"address_line2_arabic" varchar(255),
	"city_arabic" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "saudi_tax_compliance_garage_id_unique" UNIQUE("garage_id")
);
--> statement-breakpoint
CREATE TABLE "saved_filter_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(100) NOT NULL,
	"module" varchar(50) NOT NULL,
	"filter_config" jsonb NOT NULL,
	"is_global" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduling_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"optimization_date" timestamp NOT NULL,
	"appointments_optimized" integer DEFAULT 0,
	"efficiency_gain" numeric(5, 2),
	"technician_utilization" jsonb,
	"suggestions" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_cameras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"camera_name" varchar NOT NULL,
	"location" varchar NOT NULL,
	"camera_type" varchar(50),
	"stream_url" varchar,
	"recording_enabled" boolean DEFAULT true,
	"motion_detection" boolean DEFAULT true,
	"retention_days" integer DEFAULT 30,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"maintenance_schedule_id" uuid,
	"reminder_type" varchar NOT NULL,
	"reminder_title" varchar(255) NOT NULL,
	"reminder_message" text,
	"trigger_mileage" integer,
	"trigger_date" timestamp,
	"advance_days" integer DEFAULT 7,
	"advance_miles" integer DEFAULT 500,
	"status" varchar DEFAULT 'pending',
	"sent_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"description" text,
	"estimated_hours" numeric(4, 2),
	"standard_cost" numeric(10, 2),
	"task_steps" jsonb NOT NULL,
	"required_skills" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_tracking_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"status" varchar(100) NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"estimated_completion" timestamp,
	"completed_at" timestamp,
	"technician_id" varchar,
	"photo_urls" jsonb,
	"customer_notified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_type_profitability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"service_type" varchar(255) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"job_count" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"avg_revenue" numeric(10, 2),
	"avg_cost" numeric(10, 2),
	"profit_margin" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"login_time" timestamp DEFAULT now(),
	"logout_time" timestamp,
	"ip_address" varchar(45),
	"device_type" varchar(100),
	"is_impersonated" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"employee_id" varchar NOT NULL,
	"shift_template_id" uuid,
	"date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shift_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"break_duration" integer DEFAULT 60 NOT NULL,
	"days_of_week" text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fulfillment_order_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_date" timestamp DEFAULT now(),
	"location" varchar(500),
	"description" text,
	"tracking_number" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "signage_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"priority" integer DEFAULT 1,
	"content" jsonb NOT NULL,
	"duration" integer DEFAULT 10,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "signage_displays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"display_name" varchar NOT NULL,
	"location" varchar,
	"display_type" varchar(50),
	"is_active" boolean DEFAULT true,
	"orientation" varchar(20) DEFAULT 'landscape',
	"refresh_interval" integer DEFAULT 30,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"post_type" varchar(100),
	"content" text NOT NULL,
	"media_urls" jsonb,
	"scheduled_at" timestamp,
	"published_at" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"external_id" varchar,
	"likes" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"reach" integer DEFAULT 0,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spare_part_inventories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"stock_quantity" integer DEFAULT 0,
	"min_threshold" integer DEFAULT 5,
	"purchase_price" numeric(10, 2),
	"selling_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"currency" varchar DEFAULT 'USD',
	"purchase_tax_rate" numeric(5, 2) DEFAULT '0',
	"sale_tax_rate" numeric(5, 2) DEFAULT '0',
	"location" varchar,
	"last_restocked_at" timestamp,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spare_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"subcategory" varchar,
	"brand" varchar,
	"manufacturer" varchar,
	"sku" varchar NOT NULL,
	"barcode" varchar,
	"part_type" varchar DEFAULT 'generic' NOT NULL,
	"unit_of_measure" varchar DEFAULT 'pcs',
	"compatible_vehicles" jsonb,
	"linked_service_ids" jsonb,
	"linked_tool_ids" jsonb,
	"tags" jsonb,
	"media" jsonb,
	"documents" jsonb,
	"notes" text,
	"is_global" boolean DEFAULT false,
	"visibility" varchar DEFAULT 'private',
	"editable_by" varchar DEFAULT 'garage_admin',
	"created_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "spare_parts_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"alert_type" varchar(50) NOT NULL,
	"threshold" integer NOT NULL,
	"current_quantity" integer NOT NULL,
	"alert_status" varchar(50) DEFAULT 'active',
	"notified_users" jsonb,
	"last_notified_at" timestamp,
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_key" varchar(255) NOT NULL,
	"oem_product_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"max_seats" integer DEFAULT 1,
	"used_seats" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'active',
	"auto_renew" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "supplier_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"period" varchar(50) NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_value" numeric(12, 2) DEFAULT '0.00',
	"on_time_delivery_rate" numeric(5, 2),
	"quality_score" numeric(5, 2),
	"defect_rate" numeric(5, 2),
	"average_lead_time" numeric(5, 2),
	"price_competitiveness" numeric(5, 2),
	"overall_rating" numeric(3, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_price_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"spare_part_id" uuid,
	"part_name" varchar(255) NOT NULL,
	"part_number" varchar(100),
	"unit_price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"minimum_order_quantity" integer DEFAULT 1,
	"lead_time_days" integer,
	"availability" varchar(50) DEFAULT 'in_stock',
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"tax_id" varchar(100),
	"payment_terms" varchar(100),
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"task_name" varchar NOT NULL,
	"task_type" varchar NOT NULL,
	"description" text NOT NULL,
	"assigned_to" varchar NOT NULL,
	"assigned_by" varchar NOT NULL,
	"user_type" varchar NOT NULL,
	"status" varchar DEFAULT 'assigned' NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"estimated_minutes" integer,
	"actual_minutes" integer,
	"progress_percentage" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_progress_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"progress_percentage" integer NOT NULL,
	"step_description" text,
	"time_spent" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tax_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"tax_name" varchar(100) NOT NULL,
	"tax_type" varchar(50) NOT NULL,
	"tax_rate" numeric(5, 2) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"applicable_categories" text[],
	"min_amount" numeric(10, 2),
	"max_amount" numeric(10, 2),
	"region" varchar(100),
	"zip_codes" text[],
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tax_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_code" varchar(3) NOT NULL,
	"region_code" varchar(10),
	"region_name" varchar(255) NOT NULL,
	"tax_rate" numeric(5, 2) NOT NULL,
	"tax_type" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tecdoc_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_query" varchar(500) NOT NULL,
	"search_type" varchar(50) NOT NULL,
	"response" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technician_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"day_of_week" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_available" boolean DEFAULT true,
	"availability_type" varchar(50) NOT NULL,
	"reason" text,
	"is_recurring" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technician_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"skills" text,
	"is_lead" boolean DEFAULT false,
	"certifications" text,
	"qualifications" text,
	"speciality" varchar(255),
	"level" varchar(50) DEFAULT 'junior',
	"years_of_experience" integer,
	"hourly_rate" numeric(10, 2),
	"schedule" jsonb,
	"max_concurrent_jobs" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_clock_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"employee_id" varchar NOT NULL,
	"clock_in_time" timestamp NOT NULL,
	"clock_out_time" timestamp,
	"break_duration" integer DEFAULT 0,
	"total_hours" numeric(5, 2),
	"overtime_hours" numeric(5, 2) DEFAULT '0',
	"location" varchar,
	"notes" text,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timezone_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid,
	"timezone" varchar(100) NOT NULL,
	"utc_offset" varchar(10),
	"supports_dst" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tool_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"quantity" integer DEFAULT 1,
	"status" varchar DEFAULT 'available',
	"allow_override_fields" boolean DEFAULT false,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tool_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"job_card_id" uuid,
	"task_id" uuid,
	"user_id" varchar NOT NULL,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"tool_type" varchar NOT NULL,
	"brand" varchar,
	"manufacturer" varchar,
	"tags" jsonb,
	"compatible_vehicles" jsonb,
	"linked_service_ids" jsonb,
	"linked_part_ids" jsonb,
	"media" jsonb,
	"documents" jsonb,
	"is_global" boolean DEFAULT false,
	"visibility" varchar DEFAULT 'private',
	"editable_by" varchar DEFAULT 'garage_admin',
	"created_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tow_trucks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"truck_name" varchar(255) NOT NULL,
	"truck_number" varchar(100),
	"license_plate" varchar(50),
	"capacity" varchar(100),
	"current_driver_id" varchar,
	"status" varchar(50) DEFAULT 'available',
	"current_location" text,
	"gps_enabled" boolean DEFAULT false,
	"last_known_latitude" numeric(10, 7),
	"last_known_longitude" numeric(10, 7),
	"last_location_update" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "towing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"request_number" varchar(100),
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"service_type" varchar(50) NOT NULL,
	"pickup_location" text NOT NULL,
	"pickup_latitude" numeric(10, 7),
	"pickup_longitude" numeric(10, 7),
	"dropoff_location" text,
	"dropoff_latitude" numeric(10, 7),
	"dropoff_longitude" numeric(10, 7),
	"urgency" varchar(50) DEFAULT 'normal',
	"status" varchar(50) DEFAULT 'requested',
	"assigned_driver_id" varchar,
	"estimated_arrival" timestamp,
	"actual_arrival" timestamp,
	"service_cost" numeric(10, 2),
	"distance" numeric(8, 2),
	"notes" text,
	"customer_notes" text,
	"requested_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "towing_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "trainings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"provider" varchar(200),
	"training_type" varchar(50) NOT NULL,
	"duration" integer,
	"cost" numeric(10, 2),
	"is_recurring" boolean DEFAULT false NOT NULL,
	"validity_period" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale_id" uuid NOT NULL,
	"translation_key" varchar(255) NOT NULL,
	"translation_value" text NOT NULL,
	"namespace" varchar(100),
	"context" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "twin_simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"twin_id" uuid NOT NULL,
	"simulation_type" varchar(50) NOT NULL,
	"parameters" jsonb,
	"results" jsonb,
	"duration" integer,
	"accuracy" numeric(5, 2),
	"recommendations" jsonb,
	"performed_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "two_factor_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"secret" varchar(255) NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"backup_codes" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "two_factor_auth_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"consent_type" varchar(100) NOT NULL,
	"consent_given" boolean NOT NULL,
	"consent_version" varchar(50),
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_role_branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"role_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"is_primary_role" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC',
	"date_format" varchar(20) DEFAULT 'MM/DD/YYYY',
	"time_format" varchar(10) DEFAULT '12h',
	"theme" varchar(20) DEFAULT 'light',
	"font_size" varchar(10) DEFAULT 'medium',
	"compact_mode" boolean DEFAULT false,
	"enable_notifications" boolean DEFAULT true,
	"enable_sounds" boolean DEFAULT true,
	"enable_keyboard_shortcuts" boolean DEFAULT true,
	"print_settings" jsonb DEFAULT '{"paperSize":"A4","includeHeader":true,"includeFooter":true,"showLogo":true}'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(20),
	"profile_image_url" varchar(500),
	"national_id" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"access_end_date" timestamp,
	"garage_id" uuid,
	"user_type" varchar(50),
	"first_name" varchar,
	"last_name" varchar,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_entry_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar,
	"plate_number" varchar,
	"entry_time" timestamp NOT NULL,
	"exit_time" timestamp,
	"duration" integer,
	"purpose" varchar,
	"entry_scan_id" uuid,
	"exit_scan_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"inspection_number" varchar(100),
	"template_id" uuid,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"job_card_id" uuid,
	"inspector_id" varchar NOT NULL,
	"current_mileage" integer,
	"inspection_type" varchar(50) NOT NULL,
	"overall_status" varchar(50) DEFAULT 'in_progress',
	"findings" jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"estimated_cost" numeric(10, 2),
	"estimate_generated" boolean DEFAULT false,
	"estimate_id" uuid,
	"customer_notified" boolean DEFAULT false,
	"customer_signature_id" uuid,
	"inspection_date" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicle_inspections_inspection_number_unique" UNIQUE("inspection_number")
);
--> statement-breakpoint
CREATE TABLE "vehicle_service_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"job_card_id" uuid,
	"service_date" timestamp NOT NULL,
	"service_type" varchar(255) NOT NULL,
	"description" text,
	"mileage_at_service" integer,
	"cost" numeric(10, 2),
	"performed_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"license_plate" varchar(50) NOT NULL,
	"vin" varchar(100),
	"color" varchar(50),
	"mileage" integer,
	"engine_type" varchar(100),
	"transmission_type" varchar(50),
	"warranty_provider" varchar(255),
	"warranty_type" varchar(100),
	"warranty_start_date" timestamp,
	"warranty_end_date" timestamp,
	"warranty_mileage_limit" integer,
	"warranty_notes" text,
	"photos" text[],
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_catalogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"vendor_code" varchar(50) NOT NULL,
	"description" text,
	"website" varchar(500),
	"support_email" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vendor_catalogs_vendor_code_unique" UNIQUE("vendor_code")
);
--> statement-breakpoint
CREATE TABLE "video_consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"technician_id" varchar,
	"job_card_id" uuid,
	"platform" varchar(50) DEFAULT 'zoom',
	"meeting_url" varchar,
	"meeting_id" varchar,
	"passcode" varchar,
	"scheduled_at" timestamp NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"duration" integer,
	"status" varchar(50) DEFAULT 'scheduled',
	"recording_url" varchar,
	"notes" text,
	"customer_attended" boolean,
	"technician_attended" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"technician_id" varchar NOT NULL,
	"video_url" varchar NOT NULL,
	"thumbnail_url" varchar,
	"duration" integer,
	"transcription" text,
	"estimated_cost" numeric(10, 2),
	"recommended_services" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"viewed_at" timestamp,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "voice_commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"transcript" text NOT NULL,
	"intent" varchar(100) NOT NULL,
	"entities" jsonb,
	"confidence" numeric(5, 2),
	"action_executed" text,
	"success" boolean DEFAULT true,
	"error_message" text,
	"response_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "warehouse_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"partner_id" uuid,
	"country" varchar(100) NOT NULL,
	"city" varchar(100),
	"address" text,
	"capacity" integer,
	"current_stock" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"warranty_type" varchar(50) NOT NULL,
	"related_type" varchar(50) NOT NULL,
	"related_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"customer_id" varchar,
	"warranty_number" varchar(100),
	"provider" varchar(255),
	"provider_name" varchar(255),
	"coverage_description" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"mileage_limit" integer,
	"current_mileage" integer,
	"terms" text,
	"exclusions" text,
	"status" varchar(50) DEFAULT 'active',
	"is_transferable" boolean DEFAULT false,
	"document_url" varchar(500),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "warranties_warranty_number_unique" UNIQUE("warranty_number")
);
--> statement-breakpoint
CREATE TABLE "warranty_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warranty_id" uuid NOT NULL,
	"claim_number" varchar(100),
	"job_card_id" uuid,
	"claim_date" timestamp NOT NULL,
	"issue_description" text NOT NULL,
	"claim_amount" numeric(10, 2),
	"approved_amount" numeric(10, 2),
	"status" varchar(50) DEFAULT 'submitted',
	"submitted_by" varchar,
	"reviewed_by" varchar,
	"rejection_reason" text,
	"approval_notes" text,
	"payment_date" timestamp,
	"supporting_documents" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "warranty_claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
ALTER TABLE "accounting_connections" ADD CONSTRAINT "accounting_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_sync" ADD CONSTRAINT "accounting_sync_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_transactions" ADD CONSTRAINT "accounting_transactions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_transactions" ADD CONSTRAINT "accounting_transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_history" ADD CONSTRAINT "action_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_history" ADD CONSTRAINT "action_history_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" ADD CONSTRAINT "ai_chat_conversations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" ADD CONSTRAINT "ai_chat_conversations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" ADD CONSTRAINT "ai_chat_conversations_handoff_to_users_id_fk" FOREIGN KEY ("handoff_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_conversation_id_ai_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_job_estimations" ADD CONSTRAINT "ai_job_estimations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_job_estimations" ADD CONSTRAINT "ai_job_estimations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_job_estimations" ADD CONSTRAINT "ai_job_estimations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_maintenance_predictions" ADD CONSTRAINT "ai_maintenance_predictions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_maintenance_predictions" ADD CONSTRAINT "ai_maintenance_predictions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_maintenance_predictions" ADD CONSTRAINT "ai_maintenance_predictions_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_parts_recommendations" ADD CONSTRAINT "ai_parts_recommendations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_parts_recommendations" ADD CONSTRAINT "ai_parts_recommendations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_parts_recommendations" ADD CONSTRAINT "ai_parts_recommendations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_schedule_optimizations" ADD CONSTRAINT "ai_schedule_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_scheduling_rules" ADD CONSTRAINT "ai_scheduling_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_service_suggestions" ADD CONSTRAINT "ai_service_suggestions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_service_suggestions" ADD CONSTRAINT "ai_service_suggestions_related_job_card_id_job_cards_id_fk" FOREIGN KEY ("related_job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_video_analysis" ADD CONSTRAINT "ai_video_analysis_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_video_analysis" ADD CONSTRAINT "ai_video_analysis_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_video_analysis" ADD CONSTRAINT "ai_video_analysis_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_status_history" ADD CONSTRAINT "appointment_status_history_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_status_history" ADD CONSTRAINT "appointment_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_guide_sessions" ADD CONSTRAINT "ar_guide_sessions_guide_id_ar_repair_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."ar_repair_guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_guide_sessions" ADD CONSTRAINT "ar_guide_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_guide_sessions" ADD CONSTRAINT "ar_guide_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_repair_guides" ADD CONSTRAINT "ar_repair_guides_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_repair_guides" ADD CONSTRAINT "ar_repair_guides_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_profiles" ADD CONSTRAINT "assistant_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_history" ADD CONSTRAINT "auto_reorder_history_rule_id_auto_reorder_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."auto_reorder_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_history" ADD CONSTRAINT "auto_reorder_history_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_history" ADD CONSTRAINT "auto_reorder_history_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_rules" ADD CONSTRAINT "auto_reorder_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_rules" ADD CONSTRAINT "auto_reorder_rules_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_scanned_by_users_id_fk" FOREIGN KEY ("scanned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_logs" ADD CONSTRAINT "biometric_logs_profile_id_biometric_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."biometric_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_profiles" ADD CONSTRAINT "biometric_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_heatmaps" ADD CONSTRAINT "business_heatmaps_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_reminders" ADD CONSTRAINT "calibration_reminders_calibration_id_equipment_calibration_id_fk" FOREIGN KEY ("calibration_id") REFERENCES "public"."equipment_calibration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camera_recordings" ADD CONSTRAINT "camera_recordings_camera_id_security_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."security_cameras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camera_recordings" ADD CONSTRAINT "camera_recordings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reactions" ADD CONSTRAINT "chat_message_reactions_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reactions" ADD CONSTRAINT "chat_message_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_chat_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_experts" ADD CONSTRAINT "collaboration_experts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_expert_user_id_users_id_fk" FOREIGN KEY ("expert_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_commission_rule_id_commission_rules_id_fk" FOREIGN KEY ("commission_rule_id") REFERENCES "public"."commission_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_non_conformance_id_non_conformances_id_fk" FOREIGN KEY ("non_conformance_id") REFERENCES "public"."non_conformances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_border_docs" ADD CONSTRAINT "cross_border_docs_fulfillment_order_id_fulfillment_orders_id_fk" FOREIGN KEY ("fulfillment_order_id") REFERENCES "public"."fulfillment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_loyalty_accounts" ADD CONSTRAINT "customer_loyalty_accounts_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_loyalty_accounts" ADD CONSTRAINT "customer_loyalty_accounts_program_id_loyalty_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_program"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_ltv_analysis" ADD CONSTRAINT "customer_ltv_analysis_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_ltv_analysis" ADD CONSTRAINT "customer_ltv_analysis_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_portal_sessions" ADD CONSTRAINT "customer_portal_sessions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_portal_settings" ADD CONSTRAINT "customer_portal_settings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_program_id_referral_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."referral_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_referrals" ADD CONSTRAINT "customer_referrals_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_device_id_obd_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."obd_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_assignments" ADD CONSTRAINT "device_assignments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_reports" ADD CONSTRAINT "diagnostic_reports_session_id_obd_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."obd_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_signed_by_users_id_fk" FOREIGN KEY ("signed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_twins" ADD CONSTRAINT "digital_twins_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_walkarounds" ADD CONSTRAINT "digital_walkarounds_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_walkarounds" ADD CONSTRAINT "digital_walkarounds_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_walkarounds" ADD CONSTRAINT "digital_walkarounds_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_discount_id_discounts_promotions_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts_promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts_promotions" ADD CONSTRAINT "discounts_promotions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts_promotions" ADD CONSTRAINT "discounts_promotions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_accessed_by_users_id_fk" FOREIGN KEY ("accessed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_pilot_id_users_id_fk" FOREIGN KEY ("pilot_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_media" ADD CONSTRAINT "drone_media_inspection_id_drone_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."drone_inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edge_devices" ADD CONSTRAINT "edge_devices_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edge_diagnostics" ADD CONSTRAINT "edge_diagnostics_device_id_edge_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."edge_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edge_diagnostics" ADD CONSTRAINT "edge_diagnostics_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edge_diagnostics" ADD CONSTRAINT "edge_diagnostics_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlement_assignments" ADD CONSTRAINT "entitlement_assignments_license_id_subscription_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."subscription_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlement_assignments" ADD CONSTRAINT "entitlement_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_compliance" ADD CONSTRAINT "environmental_compliance_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_calibration" ADD CONSTRAINT "equipment_calibration_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_calibration" ADD CONSTRAINT "equipment_calibration_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_discount_id_discounts_promotions_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts_promotions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_converted_to_job_card_id_job_cards_id_fk" FOREIGN KEY ("converted_to_job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_converted_to_invoice_id_invoices_id_fk" FOREIGN KEY ("converted_to_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD CONSTRAINT "fleet_contracts_fleet_group_id_fleet_groups_id_fk" FOREIGN KEY ("fleet_group_id") REFERENCES "public"."fleet_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD CONSTRAINT "fleet_contracts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_groups" ADD CONSTRAINT "fleet_groups_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_groups" ADD CONSTRAINT "fleet_groups_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_maintenance_schedules" ADD CONSTRAINT "fleet_maintenance_schedules_fleet_group_id_fleet_groups_id_fk" FOREIGN KEY ("fleet_group_id") REFERENCES "public"."fleet_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_pricing_tiers" ADD CONSTRAINT "fleet_pricing_tiers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_pricing_tiers" ADD CONSTRAINT "fleet_pricing_tiers_fleet_group_id_fleet_groups_id_fk" FOREIGN KEY ("fleet_group_id") REFERENCES "public"."fleet_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_vehicles" ADD CONSTRAINT "fleet_vehicles_fleet_group_id_fleet_groups_id_fk" FOREIGN KEY ("fleet_group_id") REFERENCES "public"."fleet_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_vehicles" ADD CONSTRAINT "fleet_vehicles_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_branches" ADD CONSTRAINT "franchise_branches_franchise_group_id_franchise_groups_id_fk" FOREIGN KEY ("franchise_group_id") REFERENCES "public"."franchise_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_branches" ADD CONSTRAINT "franchise_branches_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_branches" ADD CONSTRAINT "franchise_branches_franchisee_owner_id_users_id_fk" FOREIGN KEY ("franchisee_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_contracts" ADD CONSTRAINT "franchise_contracts_franchise_group_id_franchise_groups_id_fk" FOREIGN KEY ("franchise_group_id") REFERENCES "public"."franchise_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_contracts" ADD CONSTRAINT "franchise_contracts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_kpis" ADD CONSTRAINT "franchise_kpis_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_roles" ADD CONSTRAINT "franchise_roles_franchise_group_id_franchise_groups_id_fk" FOREIGN KEY ("franchise_group_id") REFERENCES "public"."franchise_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_cases" ADD CONSTRAINT "fraud_detection_cases_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_cases" ADD CONSTRAINT "fraud_detection_cases_investigator_users_id_fk" FOREIGN KEY ("investigator") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_rules" ADD CONSTRAINT "fraud_detection_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fulfillment_orders" ADD CONSTRAINT "fulfillment_orders_partner_id_network_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."network_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fulfillment_orders" ADD CONSTRAINT "fulfillment_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garages" ADD CONSTRAINT "garages_saas_plan_id_saas_plans_id_fk" FOREIGN KEY ("saas_plan_id") REFERENCES "public"."saas_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_data_requests" ADD CONSTRAINT "gdpr_data_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_data_requests" ADD CONSTRAINT "gdpr_data_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_investigations" ADD CONSTRAINT "incident_investigations_incident_id_safety_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."safety_incidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_investigations" ADD CONSTRAINT "incident_investigations_investigator_users_id_fk" FOREIGN KEY ("investigator") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_from_garage_id_garages_id_fk" FOREIGN KEY ("from_garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_from_branch_id_branches_id_fk" FOREIGN KEY ("from_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_to_garage_id_garages_id_fk" FOREIGN KEY ("to_garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_to_branch_id_branches_id_fk" FOREIGN KEY ("to_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_discount_id_discounts_promotions_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts_promotions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_sensor_id_iot_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."iot_sensors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_sensor_readings" ADD CONSTRAINT "iot_sensor_readings_sensor_id_iot_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."iot_sensors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_sensors" ADD CONSTRAINT "iot_sensors_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_session_id_kiosk_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."kiosk_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_audit_logs" ADD CONSTRAINT "license_audit_logs_license_id_subscription_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."subscription_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_audit_logs" ADD CONSTRAINT "license_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_camera_id_security_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."security_cameras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_loaner_vehicle_id_loaner_vehicles_id_fk" FOREIGN KEY ("loaner_vehicle_id") REFERENCES "public"."loaner_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_agreement_signature_id_digital_signatures_id_fk" FOREIGN KEY ("agreement_signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_return_signature_id_digital_signatures_id_fk" FOREIGN KEY ("return_signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_vehicles" ADD CONSTRAINT "loaner_vehicles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_vehicles" ADD CONSTRAINT "loaner_vehicles_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_program" ADD CONSTRAINT "loyalty_program_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_account_id_customer_loyalty_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."customer_loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_related_invoice_id_invoices_id_fk" FOREIGN KEY ("related_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_program_id_loyalty_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_program"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_account_id_customer_loyalty_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."customer_loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_connections" ADD CONSTRAINT "marketplace_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_linked_job_card_id_job_cards_id_fk" FOREIGN KEY ("linked_job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_linked_spare_part_spare_parts_id_fk" FOREIGN KEY ("linked_spare_part") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_statuses" ADD CONSTRAINT "mfa_statuses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_detected_by_users_id_fk" FOREIGN KEY ("detected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_devices" ADD CONSTRAINT "obd_devices_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_diagnostic_data" ADD CONSTRAINT "obd_diagnostic_data_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_diagnostic_data" ADD CONSTRAINT "obd_diagnostic_data_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_diagnostic_data" ADD CONSTRAINT "obd_diagnostic_data_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_sessions" ADD CONSTRAINT "obd_sessions_device_id_obd_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."obd_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_sessions" ADD CONSTRAINT "obd_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_sessions" ADD CONSTRAINT "obd_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "obd_sessions" ADD CONSTRAINT "obd_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_documents" ADD CONSTRAINT "ocr_documents_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_documents" ADD CONSTRAINT "ocr_documents_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_documents" ADD CONSTRAINT "ocr_documents_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_documents" ADD CONSTRAINT "ocr_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_documents" ADD CONSTRAINT "ocr_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oem_products" ADD CONSTRAINT "oem_products_vendor_catalog_id_vendor_catalogs_id_fk" FOREIGN KEY ("vendor_catalog_id") REFERENCES "public"."vendor_catalogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_contracts" ADD CONSTRAINT "partner_contracts_partner_id_network_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."network_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_3d_models" ADD CONSTRAINT "parts_3d_models_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_3d_view_sessions" ADD CONSTRAINT "parts_3d_view_sessions_model_id_parts_3d_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."parts_3d_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_3d_view_sessions" ADD CONSTRAINT "parts_3d_view_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_3d_view_sessions" ADD CONSTRAINT "parts_3d_view_sessions_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_period_id_payroll_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_overrides" ADD CONSTRAINT "permission_overrides_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_overrides" ADD CONSTRAINT "permission_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_overrides" ADD CONSTRAINT "permission_overrides_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_history" ADD CONSTRAINT "pricing_history_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_history" ADD CONSTRAINT "pricing_history_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_history" ADD CONSTRAINT "pricing_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_optimization" ADD CONSTRAINT "pricing_optimization_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_optimization" ADD CONSTRAINT "pricing_optimization_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_analysis" ADD CONSTRAINT "profit_analysis_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_qr_code_id_qr_code_tokens_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_code_tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scanned_by_users_id_fk" FOREIGN KEY ("scanned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_checklists" ADD CONSTRAINT "quality_checklists_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realtime_streams" ADD CONSTRAINT "realtime_streams_device_id_obd_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."obd_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_programs" ADD CONSTRAINT "referral_programs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_settings" ADD CONSTRAINT "reorder_settings_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_settings" ADD CONSTRAINT "reorder_settings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_settings" ADD CONSTRAINT "reorder_settings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_settings" ADD CONSTRAINT "reorder_settings_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reorder_settings" ADD CONSTRAINT "reorder_settings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_sharing_rules" ADD CONSTRAINT "revenue_sharing_rules_franchise_group_id_franchise_groups_id_fk" FOREIGN KEY ("franchise_group_id") REFERENCES "public"."franchise_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_platform_integrations" ADD CONSTRAINT "review_platform_integrations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_optimizations" ADD CONSTRAINT "routing_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_optimizations" ADD CONSTRAINT "routing_optimizations_assigned_driver_users_id_fk" FOREIGN KEY ("assigned_driver") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saudi_tax_compliance" ADD CONSTRAINT "saudi_tax_compliance_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_filter_presets" ADD CONSTRAINT "saved_filter_presets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_filter_presets" ADD CONSTRAINT "saved_filter_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_optimizations" ADD CONSTRAINT "scheduling_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_cameras" ADD CONSTRAINT "security_cameras_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reminders" ADD CONSTRAINT "service_reminders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reminders" ADD CONSTRAINT "service_reminders_maintenance_schedule_id_maintenance_schedules_id_fk" FOREIGN KEY ("maintenance_schedule_id") REFERENCES "public"."maintenance_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_templates" ADD CONSTRAINT "service_templates_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_tracking_updates" ADD CONSTRAINT "service_tracking_updates_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_tracking_updates" ADD CONSTRAINT "service_tracking_updates_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_type_profitability" ADD CONSTRAINT "service_type_profitability_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_template_id_shift_templates_id_fk" FOREIGN KEY ("shift_template_id") REFERENCES "public"."shift_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_fulfillment_order_id_fulfillment_orders_id_fk" FOREIGN KEY ("fulfillment_order_id") REFERENCES "public"."fulfillment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signage_content" ADD CONSTRAINT "signage_content_display_id_signage_displays_id_fk" FOREIGN KEY ("display_id") REFERENCES "public"."signage_displays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signage_displays" ADD CONSTRAINT "signage_displays_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_inventories" ADD CONSTRAINT "spare_part_inventories_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_inventories" ADD CONSTRAINT "spare_part_inventories_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_inventories" ADD CONSTRAINT "spare_part_inventories_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_parts" ADD CONSTRAINT "spare_parts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_licenses" ADD CONSTRAINT "subscription_licenses_oem_product_id_oem_products_id_fk" FOREIGN KEY ("oem_product_id") REFERENCES "public"."oem_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_licenses" ADD CONSTRAINT "subscription_licenses_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_performance" ADD CONSTRAINT "supplier_performance_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_price_list" ADD CONSTRAINT "supplier_price_list_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_price_list" ADD CONSTRAINT "supplier_price_list_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress_logs" ADD CONSTRAINT "task_progress_logs_task_id_task_assignments_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress_logs" ADD CONSTRAINT "task_progress_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_configurations" ADD CONSTRAINT "tax_configurations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_configurations" ADD CONSTRAINT "tax_configurations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_availability" ADD CONSTRAINT "technician_availability_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_availability" ADD CONSTRAINT "technician_availability_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD CONSTRAINT "technician_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_clock_entries" ADD CONSTRAINT "time_clock_entries_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_clock_entries" ADD CONSTRAINT "time_clock_entries_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_clock_entries" ADD CONSTRAINT "time_clock_entries_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timezone_rules" ADD CONSTRAINT "timezone_rules_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_availability" ADD CONSTRAINT "tool_availability_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_availability" ADD CONSTRAINT "tool_availability_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_availability" ADD CONSTRAINT "tool_availability_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage_logs" ADD CONSTRAINT "tool_usage_logs_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage_logs" ADD CONSTRAINT "tool_usage_logs_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage_logs" ADD CONSTRAINT "tool_usage_logs_task_id_task_assignments_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage_logs" ADD CONSTRAINT "tool_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tow_trucks" ADD CONSTRAINT "tow_trucks_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tow_trucks" ADD CONSTRAINT "tow_trucks_current_driver_id_users_id_fk" FOREIGN KEY ("current_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_requests" ADD CONSTRAINT "towing_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_requests" ADD CONSTRAINT "towing_requests_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_requests" ADD CONSTRAINT "towing_requests_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_requests" ADD CONSTRAINT "towing_requests_assigned_driver_id_users_id_fk" FOREIGN KEY ("assigned_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_resources" ADD CONSTRAINT "translation_resources_locale_id_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."locales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twin_simulations" ADD CONSTRAINT "twin_simulations_twin_id_digital_twins_id_fk" FOREIGN KEY ("twin_id") REFERENCES "public"."digital_twins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twin_simulations" ADD CONSTRAINT "twin_simulations_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_branch" ADD CONSTRAINT "user_role_branch_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_branch" ADD CONSTRAINT "user_role_branch_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_branch" ADD CONSTRAINT "user_role_branch_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_entry_logs" ADD CONSTRAINT "vehicle_entry_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_entry_logs" ADD CONSTRAINT "vehicle_entry_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_entry_logs" ADD CONSTRAINT "vehicle_entry_logs_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_entry_logs" ADD CONSTRAINT "vehicle_entry_logs_entry_scan_id_license_plate_scans_id_fk" FOREIGN KEY ("entry_scan_id") REFERENCES "public"."license_plate_scans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_entry_logs" ADD CONSTRAINT "vehicle_entry_logs_exit_scan_id_license_plate_scans_id_fk" FOREIGN KEY ("exit_scan_id") REFERENCES "public"."license_plate_scans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_template_id_inspection_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."inspection_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_customer_signature_id_digital_signatures_id_fk" FOREIGN KEY ("customer_signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_service_history" ADD CONSTRAINT "vehicle_service_history_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_service_history" ADD CONSTRAINT "vehicle_service_history_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_service_history" ADD CONSTRAINT "vehicle_service_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_consultations" ADD CONSTRAINT "video_consultations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_consultations" ADD CONSTRAINT "video_consultations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_consultations" ADD CONSTRAINT "video_consultations_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_consultations" ADD CONSTRAINT "video_consultations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_estimates" ADD CONSTRAINT "video_estimates_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_estimates" ADD CONSTRAINT "video_estimates_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_estimates" ADD CONSTRAINT "video_estimates_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_estimates" ADD CONSTRAINT "video_estimates_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_commands" ADD CONSTRAINT "voice_commands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_nodes" ADD CONSTRAINT "warehouse_nodes_partner_id_network_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."network_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_warranty_id_warranties_id_fk" FOREIGN KEY ("warranty_id") REFERENCES "public"."warranties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");