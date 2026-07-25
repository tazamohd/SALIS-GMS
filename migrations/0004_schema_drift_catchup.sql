CREATE TABLE "agent_performance_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"interval_start" timestamp NOT NULL,
	"interval_end" timestamp NOT NULL,
	"calls_handled" integer DEFAULT 0,
	"calls_missed" integer DEFAULT 0,
	"avg_handle_time_seconds" integer,
	"avg_wait_time_seconds" integer,
	"first_call_resolution_rate" numeric(5, 2),
	"csat_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_assignment_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"recommended_technician_id" varchar NOT NULL,
	"confidence_score" numeric(5, 2) NOT NULL,
	"reasoning" jsonb NOT NULL,
	"job_context" jsonb NOT NULL,
	"technician_context" jsonb NOT NULL,
	"model_used" varchar(100) NOT NULL,
	"was_accepted" boolean DEFAULT false,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_reminder_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"reminder_type" varchar(20) NOT NULL,
	"reminder_timing" varchar(20) NOT NULL,
	"recipient_phone" varchar(50),
	"recipient_email" varchar(255),
	"message_content" text NOT NULL,
	"message_subject" varchar(255),
	"sent_at" timestamp DEFAULT now(),
	"delivery_status" varchar(20) DEFAULT 'sent',
	"delivered_at" timestamp,
	"failure_reason" text,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"responded_at" timestamp,
	"response_text" text,
	"response_action" varchar(20),
	"provider_message_id" varchar(255),
	"provider_status" varchar(50),
	"provider_cost" numeric(10, 4),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_reminder_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"sms_enabled" boolean DEFAULT true,
	"sms_reminder_hours" jsonb DEFAULT '[24,2]'::jsonb,
	"sms_template" text DEFAULT 'Hi {customerName}, reminder: Your appointment at {garageName} is scheduled for {appointmentTime}. Reply CONFIRM or CANCEL.',
	"email_enabled" boolean DEFAULT true,
	"email_reminder_hours" jsonb DEFAULT '[72,24]'::jsonb,
	"email_subject" varchar(255) DEFAULT 'Appointment Reminder - {garageName}',
	"email_template" text,
	"whatsapp_enabled" boolean DEFAULT false,
	"whatsapp_reminder_hours" jsonb DEFAULT '[24]'::jsonb,
	"whatsapp_template" text,
	"post_appointment_followup" boolean DEFAULT true,
	"followup_hours" integer DEFAULT 24,
	"request_review" boolean DEFAULT true,
	"no_show_auto_mark_minutes" integer DEFAULT 30,
	"no_show_reschedule_enabled" boolean DEFAULT true,
	"no_show_fee_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "appointment_reminder_settings_garage_id_unique" UNIQUE("garage_id")
);
--> statement-breakpoint
CREATE TABLE "ar_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"asset_name" varchar(255) NOT NULL,
	"asset_type" varchar(100) NOT NULL,
	"file_url" varchar(1000) NOT NULL,
	"thumbnail_url" varchar(1000),
	"file_format" varchar(50),
	"file_size" integer,
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_year_start" integer,
	"vehicle_year_end" integer,
	"component_category" varchar(100),
	"component_name" varchar(255),
	"part_number" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_global" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_device_pairings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"device_type" varchar(100) NOT NULL,
	"device_name" varchar(255),
	"device_model" varchar(255),
	"os_version" varchar(100),
	"app_version" varchar(50),
	"push_token" varchar(500),
	"is_active" boolean DEFAULT true,
	"last_connected_at" timestamp,
	"paired_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ar_device_pairings_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "ar_session_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"job_card_id" uuid,
	"instruction_id" uuid,
	"device_type" varchar(100),
	"device_model" varchar(255),
	"session_start_time" timestamp DEFAULT now() NOT NULL,
	"session_end_time" timestamp,
	"total_duration" integer,
	"steps_completed" integer DEFAULT 0,
	"total_steps" integer,
	"completion_percentage" numeric(5, 2),
	"pause_count" integer DEFAULT 0,
	"help_request_count" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"step_timings" jsonb DEFAULT '[]'::jsonb,
	"feedback_rating" integer,
	"feedback_comment" text,
	"status" varchar(50) DEFAULT 'in_progress',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ar_work_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"instruction_name" varchar(255) NOT NULL,
	"instruction_name_ar" varchar(255),
	"description" text,
	"description_ar" text,
	"service_type" varchar(255),
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_year_start" integer,
	"vehicle_year_end" integer,
	"difficulty_level" varchar(50),
	"estimated_duration" integer,
	"required_tools" jsonb DEFAULT '[]'::jsonb,
	"required_parts" jsonb DEFAULT '[]'::jsonb,
	"safety_warnings" jsonb DEFAULT '[]'::jsonb,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"total_steps" integer DEFAULT 0,
	"completion_rate" numeric(5, 2),
	"average_rating" numeric(3, 2),
	"usage_count" integer DEFAULT 0,
	"is_global" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"version" integer DEFAULT 1,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "article_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignment_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"previous_technician_id" varchar,
	"new_technician_id" varchar NOT NULL,
	"assignment_method" varchar(50) NOT NULL,
	"assigned_by" varchar NOT NULL,
	"reason" text,
	"ai_recommendation_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignment_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"rule_type" varchar(50) NOT NULL,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"conditions" jsonb NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "backup_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"backup_ref" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"size" integer NOT NULL,
	"total_records" integer DEFAULT 0 NOT NULL,
	"table_counts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bay_occupancy_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bay_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"job_card_id" uuid,
	"technician_id" varchar,
	"service_type" varchar(255),
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"estimated_duration" integer,
	"actual_duration" integer,
	"status" varchar(50) DEFAULT 'in_progress',
	"pause_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bay_telemetry_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bay_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"sensor_id" varchar(100),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"previous_data" jsonb,
	"new_data" jsonb,
	"change_reason" text,
	"performed_by" varchar,
	"performed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"appointment_id" uuid,
	"job_card_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"customer_id" varchar,
	"customer_name" varchar(255),
	"vehicle_info" jsonb,
	"service_type" varchar(255),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"resource_id" uuid,
	"bay_id" uuid,
	"technician_id" varchar,
	"status" varchar(50) DEFAULT 'scheduled',
	"priority" varchar(20) DEFAULT 'normal',
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" jsonb,
	"parent_appointment_id" uuid,
	"conflict_resolved" boolean DEFAULT false,
	"locked_by" varchar,
	"locked_at" timestamp,
	"lock_expires_at" timestamp,
	"google_calendar_event_id" varchar(255),
	"synced_with_google" boolean DEFAULT false,
	"last_synced_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_conflicts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"appointment_1_id" uuid NOT NULL,
	"appointment_2_id" uuid NOT NULL,
	"conflict_type" varchar(100),
	"resource_id" uuid,
	"severity" varchar(20) DEFAULT 'warning',
	"resolved" boolean DEFAULT false,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"resolution_note" text,
	"detected_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_disposition_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"category" varchar(50),
	"follow_up_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"payload" jsonb,
	"occurred_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"author_user_id" varchar NOT NULL,
	"note" text NOT NULL,
	"visibility" varchar(20) DEFAULT 'internal',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_queue_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"agent_user_id" varchar NOT NULL,
	"skill_tags" jsonb,
	"is_primary" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_queues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"priority" integer DEFAULT 5,
	"routing_strategy" varchar(50) DEFAULT 'round_robin',
	"max_queue_size" integer DEFAULT 50,
	"max_wait_time_seconds" integer DEFAULT 600,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"twilio_recording_sid" varchar(100),
	"storage_url" text,
	"transcription_url" text,
	"duration_seconds" integer,
	"file_size" integer,
	"started_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"queue_id" uuid,
	"customer_id" varchar,
	"vehicle_id" uuid,
	"direction" varchar(20) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'queued',
	"priority" integer DEFAULT 5,
	"assigned_agent_id" varchar,
	"twilio_call_sid" varchar(100),
	"started_at" timestamp,
	"answered_at" timestamp,
	"ended_at" timestamp,
	"duration_seconds" integer,
	"wait_time_seconds" integer,
	"talk_time_seconds" integer,
	"hold_time_seconds" integer,
	"outcome_code_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certification_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certification_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"module_id" uuid,
	"score" integer,
	"passed" boolean DEFAULT false,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"certificate_url" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"validity_period" integer,
	"required_modules" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"uploaded_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"policy_id" uuid,
	"auditor" varchar,
	"audit_date" timestamp NOT NULL,
	"audit_type" varchar(50),
	"findings" text,
	"score" integer,
	"status" varchar(20) DEFAULT 'pending',
	"corrective_actions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"regulatory_body" varchar(255),
	"effective_date" timestamp NOT NULL,
	"review_date" timestamp,
	"status" varchar(20) DEFAULT 'active',
	"document_ids" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"policy_id" uuid,
	"audit_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"assigned_to" varchar,
	"due_date" timestamp NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'pending',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_renewals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"renewal_type" varchar(50) NOT NULL,
	"proposed_start_date" timestamp NOT NULL,
	"proposed_end_date" timestamp NOT NULL,
	"proposed_monthly_fee" numeric(10, 2),
	"proposed_changes" jsonb,
	"notification_sent_at" timestamp,
	"customer_response" varchar(50),
	"customer_response_date" timestamp,
	"renewed_contract_id" uuid,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_sla_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"job_card_id" uuid,
	"metric_type" varchar(50) NOT NULL,
	"target_value" numeric(10, 2) NOT NULL,
	"actual_value" numeric(10, 2) NOT NULL,
	"compliance_status" varchar(50) NOT NULL,
	"breach_severity" varchar(50),
	"penalty_applied" numeric(10, 2) DEFAULT '0',
	"incident_date" timestamp NOT NULL,
	"resolution_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_utilization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"job_card_id" uuid,
	"service_date" timestamp NOT NULL,
	"service_type" varchar(100) NOT NULL,
	"vehicle_id" uuid,
	"labor_cost" numeric(10, 2) DEFAULT '0',
	"parts_cost" numeric(10, 2) DEFAULT '0',
	"total_cost" numeric(10, 2) NOT NULL,
	"is_covered_by_contract" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "currency_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tx_date" timestamp DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"original_amount" numeric(18, 4) NOT NULL,
	"original_currency" varchar(10) NOT NULL,
	"rate_used" numeric(18, 6) NOT NULL,
	"sar_equivalent" numeric(18, 4) NOT NULL,
	"type" varchar(30) NOT NULL,
	"reference" varchar(100),
	"customer_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_communication_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"preferred_channel" varchar(20) DEFAULT 'sms',
	"sms_opt_in" boolean DEFAULT true,
	"email_opt_in" boolean DEFAULT true,
	"whatsapp_opt_in" boolean DEFAULT false,
	"phone_opt_in" boolean DEFAULT true,
	"appointment_reminders" boolean DEFAULT true,
	"marketing_messages" boolean DEFAULT false,
	"service_reminders" boolean DEFAULT true,
	"promotional_offers" boolean DEFAULT false,
	"preferred_contact_time" varchar(20) DEFAULT 'business_hours',
	"do_not_disturb_start" varchar(5),
	"do_not_disturb_end" varchar(5),
	"language_preference" varchar(10) DEFAULT 'en',
	"primary_phone" varchar(50),
	"secondary_phone" varchar(50),
	"primary_email" varchar(255),
	"whatsapp_number" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customer_communication_preferences_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "document_library_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(500) NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(100) NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"uploaded_by" varchar(255),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dynamic_pricing_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"job_card_id" uuid,
	"vehicle_id" uuid,
	"service_type" varchar(255) NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"suggested_price" numeric(12, 2) NOT NULL,
	"min_recommended_price" numeric(12, 2),
	"max_recommended_price" numeric(12, 2),
	"confidence_score" numeric(5, 2),
	"applied_rules" jsonb DEFAULT '[]'::jsonb,
	"vehicle_factors" jsonb DEFAULT '{}'::jsonb,
	"market_data_used" jsonb DEFAULT '{}'::jsonb,
	"competitor_prices" jsonb DEFAULT '[]'::jsonb,
	"profit_margin_estimate" numeric(5, 2),
	"status" varchar(50) DEFAULT 'pending',
	"accepted_price" numeric(12, 2),
	"accepted_by" varchar,
	"accepted_at" timestamp,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"budget_limit" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"category_id" uuid,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"vendor" varchar(255),
	"description" text,
	"receipt_url" varchar(500),
	"payment_method" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fleet_account_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_ref" varchar(50),
	"fleet_account_id" uuid NOT NULL,
	"plate_number" varchar(50) NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"vin" varchar(50),
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"mileage" integer DEFAULT 0 NOT NULL,
	"last_service_date" date,
	"last_service_type" varchar(100),
	"next_service_due" date,
	"next_service_type" varchar(100),
	"avg_monthly_cost" numeric(12, 2) DEFAULT '0',
	"total_spend" numeric(14, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fleet_account_vehicles_external_ref_unique" UNIQUE("external_ref")
);
--> statement-breakpoint
CREATE TABLE "fleet_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_ref" varchar(50),
	"company_name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"contract_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"contract_start" date,
	"contract_end" date,
	"monthly_spend" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_spend" numeric(14, 2) DEFAULT '0' NOT NULL,
	"discount_percentage" integer DEFAULT 0 NOT NULL,
	"payment_terms" varchar(50) DEFAULT 'Net 30',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fleet_accounts_external_ref_unique" UNIQUE("external_ref")
);
--> statement-breakpoint
CREATE TABLE "fleet_maintenance_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_ref" varchar(50),
	"vehicle_id" uuid NOT NULL,
	"fleet_account_id" uuid NOT NULL,
	"service_type" varchar(100) NOT NULL,
	"scheduled_date" date NOT NULL,
	"status" varchar(30) DEFAULT 'scheduled' NOT NULL,
	"estimated_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fleet_maintenance_entries_external_ref_unique" UNIQUE("external_ref")
);
--> statement-breakpoint
CREATE TABLE "fleet_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"route_name" varchar(255) NOT NULL,
	"description" text,
	"vehicle_id" uuid,
	"driver_id" varchar,
	"job_card_ids" text[],
	"start_location" jsonb NOT NULL,
	"end_location" jsonb,
	"waypoints" jsonb,
	"optimized_route" jsonb,
	"total_distance" numeric(10, 2),
	"estimated_duration" integer,
	"actual_duration" integer,
	"status" varchar(50) DEFAULT 'planned',
	"scheduled_start_time" timestamp,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"route_polyline" text,
	"traffic_conditions" varchar(50),
	"fuel_estimate" numeric(8, 2),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_badge_awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" varchar NOT NULL,
	"badge_id" uuid NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(255),
	"tier" varchar(50) DEFAULT 'bronze',
	"criteria" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_event_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"points" integer NOT NULL,
	"badge_id" uuid,
	"category" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "gamification_event_definitions_event_key_unique" UNIQUE("event_key")
);
--> statement-breakpoint
CREATE TABLE "gamification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" varchar NOT NULL,
	"event_key" varchar(100) NOT NULL,
	"source_id" uuid,
	"metadata" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geofence_alert_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"geofence_zone_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"notification_method" varchar(50) DEFAULT 'email',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "geofence_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"geofence_zone_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"event_type" varchar(20) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"driver_id" varchar,
	"notification_sent" boolean DEFAULT false,
	"notification_sent_at" timestamp,
	"dwell_duration_minutes" integer,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "geofence_zone_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"geofence_zone_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "geofence_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"zone_type" varchar(50) NOT NULL,
	"geometry" jsonb NOT NULL,
	"center_latitude" double precision,
	"center_longitude" double precision,
	"radius" double precision,
	"alert_on_entry" boolean DEFAULT false,
	"alert_on_exit" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"color" varchar(20) DEFAULT '#3B82F6',
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmb_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"post_type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"image_urls" text[],
	"call_to_action" varchar(50),
	"action_url" varchar(500),
	"event_start_date" timestamp,
	"event_end_date" timestamp,
	"status" varchar(20) DEFAULT 'draft',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gmb_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"review_id" varchar(255) NOT NULL,
	"reviewer_name" varchar(255),
	"rating" integer NOT NULL,
	"comment" text,
	"review_date" timestamp NOT NULL,
	"response_text" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "gmb_reviews_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "google_business_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"location_id" varchar(255) NOT NULL,
	"business_name" varchar(255),
	"is_active" boolean DEFAULT true,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'general',
	"priority" varchar(20) DEFAULT 'normal',
	"target_audience" varchar(100) DEFAULT 'all',
	"target_department_id" uuid,
	"attachment_url" varchar(1000),
	"published_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"benefit_plan_id" uuid NOT NULL,
	"enrollment_date" date NOT NULL,
	"effective_date" date,
	"termination_date" date,
	"coverage" varchar(100),
	"dependents" jsonb DEFAULT '[]'::jsonb,
	"employee_contribution" numeric(12, 2),
	"employer_contribution" numeric(12, 2),
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_benefit_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"type" varchar(100) NOT NULL,
	"description" text,
	"provider" varchar(255),
	"policy_number" varchar(100),
	"coverage" text,
	"employer_contribution" numeric(12, 2),
	"employee_contribution" numeric(12, 2),
	"eligibility_rules" jsonb DEFAULT '{}'::jsonb,
	"effective_date" date,
	"expiration_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"resume_url" varchar(1000),
	"cover_letter_url" varchar(1000),
	"linkedin_url" varchar(500),
	"source" varchar(100),
	"referred_by" varchar,
	"current_company" varchar(255),
	"current_position" varchar(255),
	"expected_salary" numeric(12, 2),
	"notice_period" varchar(100),
	"years_of_experience" numeric(4, 1),
	"stage" varchar(50) DEFAULT 'applied',
	"rating" integer,
	"notes" text,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"contract_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"salary" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"salary_frequency" varchar(20) DEFAULT 'monthly',
	"working_hours_per_week" numeric(4, 1) DEFAULT '40',
	"probation_period_days" integer,
	"notice_period_days" integer,
	"benefits" jsonb DEFAULT '[]'::jsonb,
	"terms" text,
	"signed_at" timestamp,
	"signed_by_employee" boolean DEFAULT false,
	"signed_by_hr" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft',
	"document_url" varchar(1000),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"code" varchar(50),
	"description" text,
	"parent_department_id" uuid,
	"manager_id" varchar,
	"cost_center" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"file_url" varchar(1000),
	"file_size" integer,
	"mime_type" varchar(100),
	"expiry_date" date,
	"is_verified" boolean DEFAULT false,
	"verified_by" varchar,
	"verified_at" timestamp,
	"notes" text,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_employee_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"employee_number" varchar(50),
	"department_id" uuid,
	"position_id" uuid,
	"manager_id" varchar,
	"employment_type" varchar(50) DEFAULT 'full_time',
	"employment_status" varchar(50) DEFAULT 'active',
	"hire_date" date,
	"probation_end_date" date,
	"termination_date" date,
	"work_location" varchar(255),
	"work_email" varchar(255),
	"work_phone" varchar(50),
	"extension" varchar(20),
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(50),
	"emergency_contact_relation" varchar(100),
	"national_id" varchar(50),
	"passport_number" varchar(50),
	"passport_expiry" date,
	"visa_type" varchar(100),
	"visa_expiry" date,
	"bank_name" varchar(255),
	"bank_account_number" varchar(100),
	"iban" varchar(50),
	"base_salary" numeric(12, 2),
	"currency" varchar(10) DEFAULT 'SAR',
	"salary_payment_method" varchar(50) DEFAULT 'bank_transfer',
	"gosi_number" varchar(50),
	"medical_insurance_number" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"interview_type" varchar(100) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60,
	"location" varchar(255),
	"meeting_link" varchar(500),
	"interviewers" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'scheduled',
	"feedback" text,
	"rating" integer,
	"recommendation" varchar(50),
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"position_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"requirements" text,
	"responsibilities" text,
	"department_id" uuid,
	"employment_type" varchar(50),
	"experience_level" varchar(50),
	"salary_range_min" numeric(12, 2),
	"salary_range_max" numeric(12, 2),
	"currency" varchar(10) DEFAULT 'SAR',
	"location" varchar(255),
	"is_remote" boolean DEFAULT false,
	"open_positions" integer DEFAULT 1,
	"filled_positions" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'draft',
	"published_at" timestamp,
	"closing_date" date,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"total_days" numeric(5, 1) DEFAULT '0',
	"used_days" numeric(5, 1) DEFAULT '0',
	"pending_days" numeric(5, 1) DEFAULT '0',
	"carried_over_days" numeric(5, 1) DEFAULT '0',
	"adjusted_days" numeric(5, 1) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_request_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar(100) NOT NULL,
	"employee_name" varchar(255),
	"type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"reason" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"approved_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" numeric(5, 1) NOT NULL,
	"reason" text,
	"document_url" varchar(1000),
	"status" varchar(50) DEFAULT 'pending',
	"approved_by" varchar,
	"approved_at" timestamp,
	"rejection_reason" text,
	"emergency_contact" varchar(255),
	"handover_to" varchar,
	"handover_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_leave_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"code" varchar(20),
	"description" text,
	"is_paid" boolean DEFAULT true,
	"default_days_per_year" integer DEFAULT 0,
	"max_consecutive_days" integer,
	"requires_approval" boolean DEFAULT true,
	"requires_document" boolean DEFAULT false,
	"carry_over_allowed" boolean DEFAULT false,
	"max_carry_over_days" integer,
	"color" varchar(20) DEFAULT '#3b82f6',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_performance_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"review_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"target_date" date,
	"weight" integer DEFAULT 100,
	"progress" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'in_progress',
	"measurement_criteria" text,
	"result" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_performance_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"review_period_start" date NOT NULL,
	"review_period_end" date NOT NULL,
	"review_type" varchar(50) DEFAULT 'annual',
	"overall_rating" integer,
	"ratings" jsonb DEFAULT '{}'::jsonb,
	"strengths" text,
	"areas_for_improvement" text,
	"achievements" text,
	"goals" text,
	"self_assessment" text,
	"manager_comments" text,
	"employee_comments" text,
	"development_plan" text,
	"status" varchar(50) DEFAULT 'pending',
	"acknowledged_by_employee" boolean DEFAULT false,
	"acknowledged_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"department_id" uuid,
	"title" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"code" varchar(50),
	"level" varchar(50),
	"min_salary" numeric(12, 2),
	"max_salary" numeric(12, 2),
	"description" text,
	"requirements" text,
	"responsibilities" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_self_service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"request_type" varchar(100) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"priority" varchar(20) DEFAULT 'normal',
	"status" varchar(50) DEFAULT 'pending',
	"assigned_to" varchar,
	"response" text,
	"document_url" varchar(1000),
	"processed_by" varchar,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"forecast_date" date NOT NULL,
	"predicted_demand" integer NOT NULL,
	"confidence_score" numeric(5, 2),
	"forecast_method" varchar(100),
	"historical_data_points" integer,
	"seasonal_factor" numeric(5, 3),
	"trend_factor" numeric(5, 3),
	"actual_demand" integer,
	"variance_percentage" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_card_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"spare_part_inventory_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2),
	"line_total" numeric(10, 2),
	"is_deducted" boolean DEFAULT false,
	"deducted_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"task_id" uuid,
	"event_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"metadata" jsonb,
	"is_visible_to_customer" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kiosk_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(20) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"vehicle_plate" varchar(50) NOT NULL,
	"vehicle_info" varchar(255),
	"service_type" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"type" varchar(20) DEFAULT 'walk-in' NOT NULL,
	"appointment_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"author" varchar,
	"is_published" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"unhelpful_count" integer DEFAULT 0,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period" varchar(50) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"technician_id" varchar NOT NULL,
	"points_total" integer DEFAULT 0,
	"rank" integer,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"tier_id" uuid,
	"membership_number" varchar(50),
	"total_points_earned" integer DEFAULT 0,
	"total_points_redeemed" integer DEFAULT 0,
	"current_points" integer DEFAULT 0,
	"lifetime_spend" numeric(12, 2) DEFAULT '0',
	"total_visits" integer DEFAULT 0,
	"last_visit_date" timestamp,
	"referral_code" varchar(50),
	"referred_by" uuid,
	"referral_count" integer DEFAULT 0,
	"birthday_month" integer,
	"preferred_contact_method" varchar(50),
	"opt_in_marketing" boolean DEFAULT true,
	"status" varchar(50) DEFAULT 'active',
	"enrolled_at" timestamp DEFAULT now(),
	"tier_upgrade_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "loyalty_accounts_membership_number_unique" UNIQUE("membership_number"),
	CONSTRAINT "loyalty_accounts_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "loyalty_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"offer_name" varchar(255) NOT NULL,
	"offer_name_ar" varchar(255),
	"description" text,
	"description_ar" text,
	"offer_type" varchar(100) NOT NULL,
	"points_cost" integer,
	"discount_value" numeric(10, 2),
	"discount_percentage" numeric(5, 2),
	"minimum_spend" numeric(10, 2),
	"applicable_services" jsonb DEFAULT '[]'::jsonb,
	"tier_restriction" uuid,
	"usage_limit" integer,
	"usage_per_customer" integer DEFAULT 1,
	"current_usage_count" integer DEFAULT 0,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"image_url" varchar(500),
	"terms_and_conditions" text,
	"is_personalized" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"tier_name" varchar(100) NOT NULL,
	"tier_name_ar" varchar(100),
	"min_points" integer DEFAULT 0 NOT NULL,
	"max_points" integer,
	"points_multiplier" numeric(3, 2) DEFAULT '1.00',
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"free_services" jsonb DEFAULT '[]'::jsonb,
	"priority_booking" boolean DEFAULT false,
	"exclusive_offers" boolean DEFAULT false,
	"free_inspection" boolean DEFAULT false,
	"dedicated_advisor" boolean DEFAULT false,
	"color" varchar(50),
	"icon" varchar(100),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"rule_id" uuid,
	"service_type" varchar(100) NOT NULL,
	"predicted_due_at" timestamp NOT NULL,
	"predicted_mileage" integer,
	"confidence" numeric(3, 2),
	"status" varchar(50) DEFAULT 'pending',
	"source" varchar(50) NOT NULL,
	"notification_sent_at" timestamp,
	"acknowledged_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_trigger_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"rule_name" varchar(255) NOT NULL,
	"vehicle_type" varchar(100),
	"service_type" varchar(100) NOT NULL,
	"mileage_threshold" integer,
	"duration_threshold_days" integer,
	"condition_expression" jsonb,
	"priority" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_pricing_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"region" varchar(100) NOT NULL,
	"city" varchar(100),
	"service_category" varchar(100) NOT NULL,
	"service_type" varchar(255) NOT NULL,
	"vehicle_class" varchar(50),
	"vehicle_make" varchar(100),
	"min_price" numeric(12, 2) NOT NULL,
	"max_price" numeric(12, 2) NOT NULL,
	"avg_price" numeric(12, 2) NOT NULL,
	"median_price" numeric(12, 2),
	"sample_size" integer DEFAULT 0,
	"data_source" varchar(100),
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"provider_id" uuid NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"credentials" jsonb DEFAULT '{}'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"last_sync_at" timestamp,
	"sync_status" varchar(50) DEFAULT 'never',
	"total_spend" numeric(12, 2) DEFAULT '0.00',
	"monthly_budget" numeric(12, 2),
	"currency" varchar(10) DEFAULT 'USD',
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_ad_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"campaign_name" varchar(255) NOT NULL,
	"external_campaign_id" varchar(255),
	"objective" varchar(100),
	"status" varchar(50) DEFAULT 'draft',
	"budget" numeric(12, 2),
	"budget_type" varchar(50) DEFAULT 'daily',
	"spent_amount" numeric(12, 2) DEFAULT '0.00',
	"start_date" timestamp,
	"end_date" timestamp,
	"target_audience" jsonb DEFAULT '{}'::jsonb,
	"ad_content" jsonb DEFAULT '{}'::jsonb,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"ctr" numeric(8, 4) DEFAULT '0.00',
	"cpc" numeric(8, 4) DEFAULT '0.00',
	"cpm" numeric(8, 4) DEFAULT '0.00',
	"conversion_rate" numeric(8, 4) DEFAULT '0.00',
	"last_sync_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_comment_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"campaign_id" uuid,
	"provider_post_id" varchar(255),
	"post_content" text,
	"post_url" varchar(1000),
	"post_type" varchar(50),
	"total_comments" integer DEFAULT 0,
	"unreplied_count" integer DEFAULT 0,
	"sentiment" varchar(20),
	"last_comment_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"provider_comment_id" varchar(255),
	"author_name" varchar(255),
	"author_avatar" varchar(1000),
	"author_handle" varchar(255),
	"content" text NOT NULL,
	"sentiment" varchar(20),
	"is_from_us" boolean DEFAULT false,
	"is_hidden" boolean DEFAULT false,
	"has_replied" boolean DEFAULT false,
	"likes" integer DEFAULT 0,
	"replied_by" varchar,
	"replied_at" timestamp,
	"posted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"customer_id" varchar,
	"provider_thread_id" varchar(255),
	"channel" varchar(50) NOT NULL,
	"participant_name" varchar(255),
	"participant_avatar" varchar(1000),
	"participant_handle" varchar(255),
	"status" varchar(50) DEFAULT 'open',
	"priority" varchar(20) DEFAULT 'normal',
	"assigned_to" varchar,
	"unread_count" integer DEFAULT 0,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_creatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"campaign_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"format" varchar(50),
	"file_url" varchar(1000),
	"thumbnail_url" varchar(1000),
	"headline" varchar(500),
	"description" text,
	"call_to_action" varchar(100),
	"status" varchar(50) DEFAULT 'draft',
	"performance" jsonb DEFAULT '{}'::jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"provider_message_id" varchar(255),
	"direction" varchar(20) NOT NULL,
	"sender_name" varchar(255),
	"sender_avatar" varchar(1000),
	"content" text NOT NULL,
	"content_type" varchar(50) DEFAULT 'text',
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"delivery_status" varchar(50) DEFAULT 'sent',
	"is_read" boolean DEFAULT false,
	"sent_by" varchar,
	"sent_at" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"campaign_id" uuid,
	"note_type" varchar(50) DEFAULT 'general',
	"content" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"icon_url" varchar(500),
	"website_url" varchar(500),
	"capabilities" jsonb DEFAULT '[]'::jsonb,
	"auth_type" varchar(50) DEFAULT 'api_key',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "marketing_providers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "marketing_spend_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"campaign_id" uuid,
	"snapshot_date" date NOT NULL,
	"spend" numeric(12, 2) DEFAULT '0.00',
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"ctr" numeric(8, 4) DEFAULT '0.00',
	"cpc" numeric(8, 4) DEFAULT '0.00',
	"revenue" numeric(12, 2) DEFAULT '0.00',
	"roas" numeric(8, 4) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"campaign_id" uuid,
	"task_type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(20) DEFAULT 'medium',
	"due_date" timestamp,
	"assigned_to" varchar,
	"completed_at" timestamp,
	"completed_by" varchar,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mobile_app_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"garage_id" uuid,
	"app_type" varchar(20) NOT NULL,
	"session_token" varchar(500) NOT NULL,
	"device_id" varchar(255),
	"platform" varchar(20),
	"app_version" varchar(20),
	"last_synced_at" timestamp,
	"sync_status" varchar(20) DEFAULT 'synced',
	"offline_changes" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mobile_app_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "mobile_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"device_name" varchar(200) NOT NULL,
	"device_type" varchar(30) NOT NULL,
	"assigned_to" varchar,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"battery_level" integer,
	"last_sync" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mobile_quick_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"app_type" varchar(20) NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"icon" varchar(50),
	"route" varchar(255),
	"metadata" jsonb,
	"sort_order" integer DEFAULT 0,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "no_show_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"scheduled_time" timestamp NOT NULL,
	"marked_no_show_at" timestamp DEFAULT now() NOT NULL,
	"marked_by" varchar,
	"auto_marked" boolean DEFAULT false,
	"contact_attempts" integer DEFAULT 0,
	"last_contact_at" timestamp,
	"customer_reached" boolean DEFAULT false,
	"customer_reason" text,
	"rescheduled" boolean DEFAULT false,
	"rescheduled_appointment_id" uuid,
	"rescheduled_at" timestamp,
	"no_show_fee_charged" boolean DEFAULT false,
	"fee_amount" numeric(10, 2),
	"fee_paid" boolean DEFAULT false,
	"fee_waived" boolean DEFAULT false,
	"waived_reason" text,
	"estimated_revenue_loss" numeric(10, 2),
	"internal_notes" text,
	"customer_blacklisted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "no_show_tracking_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "notification_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"trigger_type" varchar NOT NULL,
	"channels" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"template_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parts_network_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"garage_id" uuid,
	"supplier_id" uuid,
	"member_type" varchar(50) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_name_ar" varchar(255),
	"trade_license" varchar(100),
	"vat_number" varchar(50),
	"contact_person" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"whatsapp" varchar(50),
	"address" text,
	"city" varchar(100),
	"region" varchar(100),
	"country" varchar(100) DEFAULT 'Saudi Arabia',
	"coordinates" jsonb,
	"specialized_brands" jsonb,
	"part_categories" jsonb,
	"vehicle_types" jsonb,
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"verification_documents" jsonb,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_quotations" integer DEFAULT 0,
	"response_rate" numeric(5, 2) DEFAULT '0.00',
	"avg_response_time_hours" numeric(5, 2),
	"auto_accept_quotations" boolean DEFAULT false,
	"notification_preferences" jsonb,
	"delivery_radius" integer,
	"min_order_value" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now(),
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parts_network_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"content" text,
	"content_ar" text,
	"reference_type" varchar(30),
	"reference_id" uuid,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parts_network_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"request_id" uuid NOT NULL,
	"response_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0',
	"delivery_cost" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"delivery_method" varchar(30),
	"delivery_address" text,
	"expected_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"status" varchar(30) DEFAULT 'pending',
	"payment_status" varchar(30) DEFAULT 'pending',
	"tracking_number" varchar(100),
	"tracking_url" varchar(500),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "parts_network_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "parts_quotation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"response_id" uuid,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"message_type" varchar(30) DEFAULT 'text',
	"content" text NOT NULL,
	"attachments" jsonb,
	"counter_offer_price" numeric(10, 2),
	"counter_offer_quantity" integer,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parts_quotation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_number" varchar(50) NOT NULL,
	"requester_id" uuid NOT NULL,
	"garage_id" uuid,
	"part_number" varchar(100),
	"part_name" varchar(255) NOT NULL,
	"part_name_ar" varchar(255),
	"brand" varchar(100),
	"alternative_brands" jsonb,
	"quantity" integer DEFAULT 1 NOT NULL,
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_year" integer,
	"vehicle_vin" varchar(50),
	"urgency" varchar(20) DEFAULT 'normal',
	"expires_at" timestamp,
	"delivery_preference" varchar(50) DEFAULT 'pickup',
	"preferred_delivery_location" text,
	"target_brands" jsonb,
	"target_member_types" jsonb,
	"target_regions" jsonb,
	"images" jsonb,
	"documents" jsonb,
	"notes" text,
	"status" varchar(30) DEFAULT 'open',
	"selected_response_id" uuid,
	"view_count" integer DEFAULT 0,
	"response_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "parts_quotation_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "parts_quotation_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"responder_id" uuid NOT NULL,
	"offered_part_number" varchar(100),
	"offered_part_name" varchar(255) NOT NULL,
	"offered_brand" varchar(100),
	"part_condition" varchar(30) DEFAULT 'new',
	"warranty" varchar(100),
	"unit_price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"total_price" numeric(10, 2) NOT NULL,
	"vat_included" boolean DEFAULT true,
	"available_quantity" integer NOT NULL,
	"min_order_quantity" integer DEFAULT 1,
	"delivery_option" varchar(30) DEFAULT 'pickup',
	"delivery_cost" numeric(10, 2) DEFAULT '0',
	"estimated_delivery_days" integer,
	"pickup_location" text,
	"valid_until" timestamp,
	"images" jsonb,
	"notes" text,
	"status" varchar(30) DEFAULT 'submitted',
	"viewed_at" timestamp,
	"selected_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pay_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"pay_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"garage_id" uuid,
	"employee_number" varchar(50),
	"hourly_rate" numeric(10, 2),
	"salary" numeric(10, 2),
	"pay_type" varchar(20) NOT NULL,
	"tax_id" varchar(50),
	"bank_account" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pay_period_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"regular_hours" numeric(8, 2) DEFAULT '0',
	"overtime_hours" numeric(8, 2) DEFAULT '0',
	"gross_pay" numeric(10, 2) NOT NULL,
	"net_pay" numeric(10, 2) NOT NULL,
	"tax_withheld" numeric(10, 2) DEFAULT '0',
	"other_deductions" numeric(10, 2) DEFAULT '0',
	"bonuses" numeric(10, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"is_system_permission" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_notification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"garage_id" uuid,
	"token" text NOT NULL,
	"platform" varchar(20) NOT NULL,
	"device_info" jsonb,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "push_notification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "push_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"user_id" varchar,
	"customer_id" varchar,
	"subscription_id" uuid,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"icon" varchar(500),
	"image" varchar(500),
	"badge" varchar(500),
	"tag" varchar(100),
	"data" jsonb DEFAULT '{}'::jsonb,
	"actions" jsonb DEFAULT '[]'::jsonb,
	"notification_type" varchar(100) NOT NULL,
	"priority" varchar(50) DEFAULT 'normal',
	"related_entity_type" varchar(100),
	"related_entity_id" uuid,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"clicked_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"customer_id" varchar,
	"endpoint" text NOT NULL,
	"p256dh" text,
	"auth" text,
	"device_type" varchar(50),
	"device_name" varchar(255),
	"browser_info" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_used_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qc_defects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inspection_id" uuid,
	"job_card_ref" varchar(100),
	"description" text NOT NULL,
	"severity" varchar(20) NOT NULL,
	"category" varchar(100) NOT NULL,
	"status" varchar(30) DEFAULT 'open' NOT NULL,
	"resolution_notes" text,
	"reported_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "qc_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_ref" varchar(100) NOT NULL,
	"vehicle_info" varchar(500) NOT NULL,
	"service_type" varchar(100) NOT NULL,
	"inspector" varchar(255),
	"inspector_id" varchar(100),
	"result" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"checklist_id" varchar(50),
	"completed_items" integer DEFAULT 0 NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"inspection_time_minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "replenishment_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"quantity_ordered" integer NOT NULL,
	"quantity_received" integer DEFAULT 0,
	"unit_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"current_stock" integer,
	"reorder_point" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "replenishment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"rule_id" uuid,
	"supplier_id" uuid,
	"trigger_type" varchar(100),
	"status" varchar(50) DEFAULT 'pending_approval',
	"total_items" integer DEFAULT 0,
	"total_amount" numeric(12, 2) DEFAULT '0',
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"approved_by" varchar,
	"approved_at" timestamp,
	"ordered_at" timestamp,
	"received_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "replenishment_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "route_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"sequence_number" integer NOT NULL,
	"checkpoint_type" varchar(50) NOT NULL,
	"location" jsonb NOT NULL,
	"job_card_id" uuid,
	"customer_id" varchar,
	"estimated_arrival" timestamp,
	"actual_arrival" timestamp,
	"estimated_departure" timestamp,
	"actual_departure" timestamp,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"completed_by" varchar,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "scheduling_optimization_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_at" timestamp DEFAULT now() NOT NULL,
	"appointments_optimized" integer DEFAULT 0 NOT NULL,
	"efficiency_gain" varchar(20),
	"technician_utilization" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"suggestions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assignments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"report" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasonal_tire_storage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"storage_number" varchar(50),
	"number_of_tires" integer DEFAULT 4,
	"tire_brand" varchar(100),
	"tire_model" varchar(100),
	"tire_size" varchar(50),
	"season" varchar(20),
	"rim_included" boolean DEFAULT false,
	"stored_date" timestamp NOT NULL,
	"expected_retrieval_date" timestamp,
	"actual_retrieval_date" timestamp,
	"status" varchar(20) DEFAULT 'stored',
	"storage_location" varchar(100),
	"bin_number" varchar(50),
	"condition_at_storage" varchar(20),
	"tread_depth_at_storage" jsonb,
	"condition_at_retrieval" varchar(20),
	"tread_depth_at_retrieval" jsonb,
	"damage_notes" text,
	"monthly_storage_fee" numeric(10, 2),
	"total_storage_fees" numeric(10, 2),
	"deposit_paid" numeric(10, 2),
	"deposit_refunded" numeric(10, 2),
	"payment_status" varchar(20) DEFAULT 'unpaid',
	"photos" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "seasonal_tire_storage_storage_number_unique" UNIQUE("storage_number")
);
--> statement-breakpoint
CREATE TABLE "service_bays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"branch_id" uuid,
	"bay_number" varchar(50) NOT NULL,
	"bay_name" varchar(255),
	"bay_type" varchar(100) DEFAULT 'general',
	"capacity" integer DEFAULT 1,
	"equipment" jsonb DEFAULT '[]'::jsonb,
	"hourly_rate" numeric(10, 2),
	"status" varchar(50) DEFAULT 'available',
	"current_vehicle_id" uuid,
	"current_job_card_id" uuid,
	"current_technician_id" varchar,
	"occupied_since" timestamp,
	"estimated_completion_time" timestamp,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"sender_id" varchar NOT NULL,
	"sender_type" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"attachments" text[],
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid,
	"vehicle_id" uuid,
	"customer_id" varchar,
	"technician_id" varchar,
	"overall_rating" integer NOT NULL,
	"wait_time_rating" integer,
	"quality_rating" integer,
	"communication_rating" integer,
	"comments" text,
	"sentiment" varchar(20),
	"sentiment_score" numeric(4, 3),
	"sentiment_keywords" jsonb,
	"media" jsonb,
	"is_verified" boolean DEFAULT false,
	"is_public" boolean DEFAULT true,
	"is_flagged" boolean DEFAULT false,
	"flag_reason" varchar(255),
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"response" text
);
--> statement-breakpoint
CREATE TABLE "service_reminder_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"name" varchar(255) NOT NULL,
	"service_type" varchar(255) NOT NULL,
	"description" text,
	"interval_days" integer,
	"interval_mileage" integer,
	"advance_notice_days" integer DEFAULT 7,
	"advance_notice_mileage" integer,
	"is_active" boolean DEFAULT true,
	"vehicle_makes" text[],
	"vehicle_models" text[],
	"notification_channels" text[] DEFAULT '{"push","email","sms"}',
	"message_template" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"categories" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_card_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"signature_data" text NOT NULL,
	"signed_at" timestamp DEFAULT now(),
	"document_type" varchar(50) NOT NULL,
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storage_facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" text,
	"total_slots" integer NOT NULL,
	"available_slots" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"plan" varchar(20) DEFAULT 'STARTER' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at" timestamp,
	"canceled_at" timestamp,
	"stripe_subscription_id" varchar(120),
	"stripe_customer_id" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_garage_id_unique" UNIQUE("garage_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_parts_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"spare_part_id" uuid,
	"supplier_id" uuid NOT NULL,
	"quantity_available" integer DEFAULT 0,
	"lead_time_days" integer,
	"price_per_unit" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'SAR',
	"external_part_number" varchar(255),
	"external_sku" varchar(255),
	"supplier_source" varchar(50),
	"last_synced_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_ticket_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"previous_value" text,
	"new_value" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"priority" varchar(50) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'open',
	"assigned_to" varchar,
	"created_by" varchar NOT NULL,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"resolution_notes" text,
	"sla_deadline" timestamp,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "support_tickets_conversation_id_unique" UNIQUE("conversation_id"),
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "technician_feedback_summary" (
	"technician_id" varchar PRIMARY KEY NOT NULL,
	"total_reviews" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"rating_5_count" integer DEFAULT 0,
	"rating_4_count" integer DEFAULT 0,
	"rating_3_count" integer DEFAULT 0,
	"rating_2_count" integer DEFAULT 0,
	"rating_1_count" integer DEFAULT 0,
	"rolling_avg_last_30_days" numeric(3, 2),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technician_metric_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_key" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"unit" varchar(50),
	"category" varchar(50),
	"aggregation_type" varchar(50),
	"default_config" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "technician_metric_definitions_metric_key_unique" UNIQUE("metric_key")
);
--> statement-breakpoint
CREATE TABLE "technician_metric_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"metric_key" varchar(100) NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"threshold_config" jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technician_performance_rollups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" varchar NOT NULL,
	"interval_type" varchar(20) NOT NULL,
	"interval_start" timestamp NOT NULL,
	"interval_end" timestamp NOT NULL,
	"metrics" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technician_performance_stream" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" varchar NOT NULL,
	"job_card_id" uuid,
	"metric_key" varchar(100) NOT NULL,
	"metric_value" numeric(12, 2) NOT NULL,
	"metadata" jsonb,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telematics_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false,
	"resolved_by" varchar,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telematics_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"external_device_id" varchar(255) NOT NULL,
	"device_type" varchar(100),
	"firmware_version" varchar(50),
	"last_heartbeat" timestamp,
	"status" varchar(50) DEFAULT 'active',
	"installed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "telematics_devices_external_device_id_unique" UNIQUE("external_device_id")
);
--> statement-breakpoint
CREATE TABLE "telematics_feeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid,
	"vehicle_id" uuid,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"speed" numeric(6, 2),
	"fuel_level" numeric(5, 2),
	"engine_status" varchar(20),
	"odometer" numeric(10, 2),
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telematics_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"api_type" varchar(50) NOT NULL,
	"base_url" varchar(500),
	"auth_schema" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telematics_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" uuid NOT NULL,
	"recorded_at" timestamp NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telematics_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"stream_type" varchar(100) NOT NULL,
	"unit" varchar(50),
	"threshold_config" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tire_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"size" varchar(50) NOT NULL,
	"season" varchar(20) NOT NULL,
	"speed_rating" varchar(10),
	"load_index" varchar(10),
	"dot_code" varchar(50),
	"quantity_in_stock" integer DEFAULT 0,
	"reorder_point" integer DEFAULT 4,
	"cost_price" numeric(10, 2),
	"retail_price" numeric(10, 2),
	"warranty_months" integer,
	"supplier_name" varchar(255),
	"supplier_sku" varchar(100),
	"features" jsonb,
	"suitable_vehicle_types" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tire_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"recommended_tire_ids" jsonb,
	"recommendation_reason" text,
	"driving_conditions" jsonb,
	"budget" varchar(20),
	"preferred_brands" jsonb,
	"priority_factors" jsonb,
	"generated_by" varchar(20) DEFAULT 'ai',
	"technician_id" varchar,
	"confidence_score" numeric(3, 2),
	"status" varchar(20) DEFAULT 'pending',
	"customer_feedback" text,
	"accepted_at" timestamp,
	"converted_to_job_card_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tire_rotation_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"garage_id" uuid NOT NULL,
	"rotation_pattern" varchar(50),
	"recommended_interval" integer DEFAULT 8000,
	"last_rotation_date" timestamp,
	"last_rotation_mileage" integer,
	"last_service_record_id" uuid,
	"next_rotation_due" timestamp,
	"next_rotation_mileage" integer,
	"reminder_enabled" boolean DEFAULT true,
	"reminder_sent_at" timestamp,
	"reminder_method" varchar(20) DEFAULT 'sms',
	"status" varchar(20) DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tire_service_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"job_card_id" uuid,
	"service_type" varchar(50) NOT NULL,
	"service_date" timestamp NOT NULL,
	"mileage_at_service" integer,
	"technician_id" varchar,
	"tire_inventory_id" uuid,
	"tire_position" varchar(50),
	"tire_brand" varchar(100),
	"tireModel" varchar(100),
	"tire_size" varchar(50),
	"tread_depth_fl" numeric(4, 2),
	"tread_depth_fr" numeric(4, 2),
	"tread_depth_rl" numeric(4, 2),
	"tread_depth_rr" numeric(4, 2),
	"tire_pressure_fl" numeric(4, 1),
	"tire_pressure_fr" numeric(4, 1),
	"tire_pressure_rl" numeric(4, 1),
	"tire_pressure_rr" numeric(4, 1),
	"labor_cost" numeric(10, 2),
	"parts_cost" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"warranty_expires_at" timestamp,
	"next_rotation_due" timestamp,
	"next_rotation_mileage" integer,
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "towing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar,
	"vehicle_id" uuid,
	"pickup_location" text NOT NULL,
	"dropoff_location" text NOT NULL,
	"tow_truck_id" uuid,
	"assigned_driver_id" varchar,
	"status" varchar(20) DEFAULT 'requested',
	"requested_at" timestamp DEFAULT now(),
	"dispatched_at" timestamp,
	"completed_at" timestamp,
	"distance" numeric(8, 2),
	"cost" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"duration" integer,
	"content" text,
	"video_url" varchar(500),
	"quiz_questions" jsonb,
	"passing_score" integer DEFAULT 70,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_location_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"altitude" double precision,
	"speed" double precision,
	"heading" double precision,
	"accuracy" double precision,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"source" varchar(50) DEFAULT 'gps',
	"driver_id" varchar,
	"job_card_id" uuid,
	"mileage" integer,
	"engine_status" varchar(20),
	"fuel_level" double precision,
	"battery_voltage" double precision
);
--> statement-breakpoint
CREATE TABLE "vehicle_pricing_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"vehicle_make" varchar(100) NOT NULL,
	"vehicle_model" varchar(100),
	"year_start" integer,
	"year_end" integer,
	"complexity_factor" numeric(5, 2) DEFAULT '1.00',
	"parts_availability_factor" numeric(5, 2) DEFAULT '1.00',
	"labor_intensity_factor" numeric(5, 2) DEFAULT '1.00',
	"luxury_premium_factor" numeric(5, 2) DEFAULT '1.00',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_storage_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"slot_number" varchar(20),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"monthly_rate" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
	"vehicle_id" uuid,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"speed" numeric(6, 2),
	"heading" numeric(5, 2),
	"altitude" numeric(8, 2),
	"accuracy" numeric(8, 2),
	"engine_status" varchar(50) DEFAULT 'off',
	"fuel_level" numeric(5, 2),
	"battery_voltage" numeric(5, 2),
	"odometer" numeric(12, 2),
	"diagnostic_codes" jsonb DEFAULT '[]'::jsonb,
	"is_moving" boolean DEFAULT false,
	"last_seen_at" timestamp DEFAULT now(),
	"device_id" varchar(100),
	"device_type" varchar(50),
	"signal_strength" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_tracking_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"speed" numeric(6, 2),
	"heading" numeric(5, 2),
	"engine_status" varchar(50),
	"odometer" numeric(12, 2),
	"event_type" varchar(50),
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshop_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar NOT NULL,
	"resource_name" varchar(255) NOT NULL,
	"color" varchar(50),
	"capacity" integer DEFAULT 1,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"availability" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "iot_alerts" ALTER COLUMN "trigger_value" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "iot_sensor_readings" ALTER COLUMN "value" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "iot_sensor_readings" ALTER COLUMN "threshold" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "contract_value" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "service_cap" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "renewal_notice_days" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "sla_response_time" integer;--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "sla_completion_time" integer;--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "sla_uptime_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "fleet_contracts" ADD COLUMN "penalty_rate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "garages" ADD COLUMN "subscription_plan" varchar(50) DEFAULT 'STARTER';--> statement-breakpoint
ALTER TABLE "iot_alerts" ADD COLUMN "job_card_id" uuid;--> statement-breakpoint
ALTER TABLE "job_cards" ADD COLUMN "estimated_completion_at" timestamp;--> statement-breakpoint
ALTER TABLE "job_cards" ADD COLUMN "eta_last_calculated_at" timestamp;--> statement-breakpoint
ALTER TABLE "job_cards" ADD COLUMN "eta_manual_override" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "job_cards" ADD COLUMN "public_tracking_token" varchar(64);--> statement-breakpoint
ALTER TABLE "job_cards" ADD COLUMN "public_tracking_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_reminders" ADD COLUMN "customer_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'ADVISOR';--> statement-breakpoint
ALTER TABLE "agent_performance_snapshots" ADD CONSTRAINT "agent_performance_snapshots_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_snapshots" ADD CONSTRAINT "agent_performance_snapshots_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assignment_recommendations" ADD CONSTRAINT "ai_assignment_recommendations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assignment_recommendations" ADD CONSTRAINT "ai_assignment_recommendations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assignment_recommendations" ADD CONSTRAINT "ai_assignment_recommendations_recommended_technician_id_users_id_fk" FOREIGN KEY ("recommended_technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_logs" ADD CONSTRAINT "appointment_reminder_logs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_logs" ADD CONSTRAINT "appointment_reminder_logs_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_logs" ADD CONSTRAINT "appointment_reminder_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_settings" ADD CONSTRAINT "appointment_reminder_settings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_assets" ADD CONSTRAINT "ar_assets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_assets" ADD CONSTRAINT "ar_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_device_pairings" ADD CONSTRAINT "ar_device_pairings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_device_pairings" ADD CONSTRAINT "ar_device_pairings_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_session_logs" ADD CONSTRAINT "ar_session_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_session_logs" ADD CONSTRAINT "ar_session_logs_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_session_logs" ADD CONSTRAINT "ar_session_logs_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_session_logs" ADD CONSTRAINT "ar_session_logs_instruction_id_ar_work_instructions_id_fk" FOREIGN KEY ("instruction_id") REFERENCES "public"."ar_work_instructions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_work_instructions" ADD CONSTRAINT "ar_work_instructions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_work_instructions" ADD CONSTRAINT "ar_work_instructions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_previous_technician_id_users_id_fk" FOREIGN KEY ("previous_technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_new_technician_id_users_id_fk" FOREIGN KEY ("new_technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_ai_recommendation_id_ai_assignment_recommendations_id_fk" FOREIGN KEY ("ai_recommendation_id") REFERENCES "public"."ai_assignment_recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_rules" ADD CONSTRAINT "assignment_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_rules" ADD CONSTRAINT "assignment_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_bay_id_service_bays_id_fk" FOREIGN KEY ("bay_id") REFERENCES "public"."service_bays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_telemetry_events" ADD CONSTRAINT "bay_telemetry_events_bay_id_service_bays_id_fk" FOREIGN KEY ("bay_id") REFERENCES "public"."service_bays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_telemetry_events" ADD CONSTRAINT "bay_telemetry_events_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_activity_log" ADD CONSTRAINT "calendar_activity_log_appointment_id_calendar_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."calendar_appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_activity_log" ADD CONSTRAINT "calendar_activity_log_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_activity_log" ADD CONSTRAINT "calendar_activity_log_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_resource_id_workshop_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."workshop_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_bay_id_service_bays_id_fk" FOREIGN KEY ("bay_id") REFERENCES "public"."service_bays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_appointments" ADD CONSTRAINT "calendar_appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_conflicts" ADD CONSTRAINT "calendar_conflicts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_conflicts" ADD CONSTRAINT "calendar_conflicts_appointment_1_id_calendar_appointments_id_fk" FOREIGN KEY ("appointment_1_id") REFERENCES "public"."calendar_appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_conflicts" ADD CONSTRAINT "calendar_conflicts_appointment_2_id_calendar_appointments_id_fk" FOREIGN KEY ("appointment_2_id") REFERENCES "public"."calendar_appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_conflicts" ADD CONSTRAINT "calendar_conflicts_resource_id_workshop_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."workshop_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_conflicts" ADD CONSTRAINT "calendar_conflicts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_disposition_codes" ADD CONSTRAINT "call_disposition_codes_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_session_id_call_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."call_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_notes" ADD CONSTRAINT "call_notes_session_id_call_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."call_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_notes" ADD CONSTRAINT "call_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_queue_members" ADD CONSTRAINT "call_queue_members_queue_id_call_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."call_queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_queue_members" ADD CONSTRAINT "call_queue_members_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_queue_members" ADD CONSTRAINT "call_queue_members_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_queues" ADD CONSTRAINT "call_queues_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_session_id_call_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."call_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_queue_id_call_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."call_queues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_outcome_code_id_call_disposition_codes_id_fk" FOREIGN KEY ("outcome_code_id") REFERENCES "public"."call_disposition_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_attempts" ADD CONSTRAINT "certification_attempts_certification_id_certifications_id_fk" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_attempts" ADD CONSTRAINT "certification_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_attempts" ADD CONSTRAINT "certification_attempts_module_id_training_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."training_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_policy_id_compliance_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."compliance_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_auditor_users_id_fk" FOREIGN KEY ("auditor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_policies" ADD CONSTRAINT "compliance_policies_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_policy_id_compliance_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."compliance_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_audit_id_compliance_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_renewals" ADD CONSTRAINT "contract_renewals_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_renewals" ADD CONSTRAINT "contract_renewals_renewed_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("renewed_contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_renewals" ADD CONSTRAINT "contract_renewals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_sla_metrics" ADD CONSTRAINT "contract_sla_metrics_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_sla_metrics" ADD CONSTRAINT "contract_sla_metrics_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_utilization" ADD CONSTRAINT "contract_utilization_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_utilization" ADD CONSTRAINT "contract_utilization_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_utilization" ADD CONSTRAINT "contract_utilization_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_communication_preferences" ADD CONSTRAINT "customer_communication_preferences_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_accepted_by_users_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_account_vehicles" ADD CONSTRAINT "fleet_account_vehicles_fleet_account_id_fleet_accounts_id_fk" FOREIGN KEY ("fleet_account_id") REFERENCES "public"."fleet_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_maintenance_entries" ADD CONSTRAINT "fleet_maintenance_entries_vehicle_id_fleet_account_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."fleet_account_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_maintenance_entries" ADD CONSTRAINT "fleet_maintenance_entries_fleet_account_id_fleet_accounts_id_fk" FOREIGN KEY ("fleet_account_id") REFERENCES "public"."fleet_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_badge_awards" ADD CONSTRAINT "gamification_badge_awards_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_badge_awards" ADD CONSTRAINT "gamification_badge_awards_badge_id_gamification_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."gamification_badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_event_definitions" ADD CONSTRAINT "gamification_event_definitions_badge_id_gamification_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."gamification_badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_events" ADD CONSTRAINT "gamification_events_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_alert_recipients" ADD CONSTRAINT "geofence_alert_recipients_geofence_zone_id_geofence_zones_id_fk" FOREIGN KEY ("geofence_zone_id") REFERENCES "public"."geofence_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_alert_recipients" ADD CONSTRAINT "geofence_alert_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_events" ADD CONSTRAINT "geofence_events_geofence_zone_id_geofence_zones_id_fk" FOREIGN KEY ("geofence_zone_id") REFERENCES "public"."geofence_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_events" ADD CONSTRAINT "geofence_events_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_events" ADD CONSTRAINT "geofence_events_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_zone_vehicles" ADD CONSTRAINT "geofence_zone_vehicles_geofence_zone_id_geofence_zones_id_fk" FOREIGN KEY ("geofence_zone_id") REFERENCES "public"."geofence_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_zone_vehicles" ADD CONSTRAINT "geofence_zone_vehicles_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_zones" ADD CONSTRAINT "geofence_zones_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_zones" ADD CONSTRAINT "geofence_zones_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmb_posts" ADD CONSTRAINT "gmb_posts_profile_id_google_business_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."google_business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gmb_reviews" ADD CONSTRAINT "gmb_reviews_profile_id_google_business_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."google_business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_business_profiles" ADD CONSTRAINT "google_business_profiles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_announcements" ADD CONSTRAINT "hr_announcements_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_announcements" ADD CONSTRAINT "hr_announcements_target_department_id_hr_departments_id_fk" FOREIGN KEY ("target_department_id") REFERENCES "public"."hr_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_announcements" ADD CONSTRAINT "hr_announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_enrollments" ADD CONSTRAINT "hr_benefit_enrollments_benefit_plan_id_hr_benefit_plans_id_fk" FOREIGN KEY ("benefit_plan_id") REFERENCES "public"."hr_benefit_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_benefit_plans" ADD CONSTRAINT "hr_benefit_plans_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_candidates" ADD CONSTRAINT "hr_candidates_job_posting_id_hr_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."hr_job_postings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_candidates" ADD CONSTRAINT "hr_candidates_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_candidates" ADD CONSTRAINT "hr_candidates_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_contracts" ADD CONSTRAINT "hr_contracts_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD CONSTRAINT "hr_departments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_departments" ADD CONSTRAINT "hr_departments_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_employee_profiles" ADD CONSTRAINT "hr_employee_profiles_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_interviews" ADD CONSTRAINT "hr_interviews_candidate_id_hr_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."hr_candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_interviews" ADD CONSTRAINT "hr_interviews_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_job_postings" ADD CONSTRAINT "hr_job_postings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_job_postings" ADD CONSTRAINT "hr_job_postings_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_job_postings" ADD CONSTRAINT "hr_job_postings_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_job_postings" ADD CONSTRAINT "hr_job_postings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_leave_type_id_hr_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."hr_leave_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_leave_type_id_hr_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."hr_leave_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_handover_to_users_id_fk" FOREIGN KEY ("handover_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leave_types" ADD CONSTRAINT "hr_leave_types_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_goals" ADD CONSTRAINT "hr_performance_goals_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_goals" ADD CONSTRAINT "hr_performance_goals_review_id_hr_performance_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."hr_performance_reviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_reviews" ADD CONSTRAINT "hr_performance_reviews_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_performance_reviews" ADD CONSTRAINT "hr_performance_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_department_id_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_self_service_requests" ADD CONSTRAINT "hr_self_service_requests_employee_id_hr_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_employee_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_self_service_requests" ADD CONSTRAINT "hr_self_service_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_self_service_requests" ADD CONSTRAINT "hr_self_service_requests_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_forecasts" ADD CONSTRAINT "inventory_forecasts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_forecasts" ADD CONSTRAINT "inventory_forecasts_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_card_parts" ADD CONSTRAINT "job_card_parts_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_card_parts" ADD CONSTRAINT "job_card_parts_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_card_parts" ADD CONSTRAINT "job_card_parts_spare_part_inventory_id_spare_part_inventories_id_fk" FOREIGN KEY ("spare_part_inventory_id") REFERENCES "public"."spare_part_inventories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking_events" ADD CONSTRAINT "job_tracking_events_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking_events" ADD CONSTRAINT "job_tracking_events_task_id_task_assignments_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking_events" ADD CONSTRAINT "job_tracking_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_tier_id_loyalty_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_referred_by_loyalty_accounts_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_tier_restriction_loyalty_tiers_id_fk" FOREIGN KEY ("tier_restriction") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_tiers" ADD CONSTRAINT "loyalty_tiers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_recommendations" ADD CONSTRAINT "maintenance_recommendations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_recommendations" ADD CONSTRAINT "maintenance_recommendations_rule_id_maintenance_trigger_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."maintenance_trigger_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_trigger_rules" ADD CONSTRAINT "maintenance_trigger_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_pricing_data" ADD CONSTRAINT "market_pricing_data_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_accounts" ADD CONSTRAINT "marketing_accounts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_accounts" ADD CONSTRAINT "marketing_accounts_provider_id_marketing_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."marketing_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_accounts" ADD CONSTRAINT "marketing_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_ad_campaigns" ADD CONSTRAINT "marketing_ad_campaigns_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_ad_campaigns" ADD CONSTRAINT "marketing_ad_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_comment_threads" ADD CONSTRAINT "marketing_comment_threads_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_comment_threads" ADD CONSTRAINT "marketing_comment_threads_campaign_id_marketing_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_ad_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_comments" ADD CONSTRAINT "marketing_comments_thread_id_marketing_comment_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."marketing_comment_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_comments" ADD CONSTRAINT "marketing_comments_replied_by_users_id_fk" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_conversations" ADD CONSTRAINT "marketing_conversations_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_conversations" ADD CONSTRAINT "marketing_conversations_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_conversations" ADD CONSTRAINT "marketing_conversations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_creatives" ADD CONSTRAINT "marketing_creatives_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_creatives" ADD CONSTRAINT "marketing_creatives_campaign_id_marketing_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_ad_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_creatives" ADD CONSTRAINT "marketing_creatives_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_messages" ADD CONSTRAINT "marketing_messages_conversation_id_marketing_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."marketing_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_messages" ADD CONSTRAINT "marketing_messages_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_notes" ADD CONSTRAINT "marketing_notes_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_notes" ADD CONSTRAINT "marketing_notes_campaign_id_marketing_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_ad_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_notes" ADD CONSTRAINT "marketing_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_spend_snapshots" ADD CONSTRAINT "marketing_spend_snapshots_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_spend_snapshots" ADD CONSTRAINT "marketing_spend_snapshots_campaign_id_marketing_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_ad_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_tasks" ADD CONSTRAINT "marketing_tasks_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_tasks" ADD CONSTRAINT "marketing_tasks_campaign_id_marketing_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_ad_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_tasks" ADD CONSTRAINT "marketing_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_tasks" ADD CONSTRAINT "marketing_tasks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_tasks" ADD CONSTRAINT "marketing_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_app_sessions" ADD CONSTRAINT "mobile_app_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_app_sessions" ADD CONSTRAINT "mobile_app_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_quick_actions" ADD CONSTRAINT "mobile_quick_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_rescheduled_appointment_id_appointments_id_fk" FOREIGN KEY ("rescheduled_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_schedules" ADD CONSTRAINT "notification_schedules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_members" ADD CONSTRAINT "parts_network_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_members" ADD CONSTRAINT "parts_network_members_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_members" ADD CONSTRAINT "parts_network_members_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_notifications" ADD CONSTRAINT "parts_network_notifications_member_id_parts_network_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_orders" ADD CONSTRAINT "parts_network_orders_request_id_parts_quotation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."parts_quotation_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_orders" ADD CONSTRAINT "parts_network_orders_response_id_parts_quotation_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."parts_quotation_responses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_orders" ADD CONSTRAINT "parts_network_orders_buyer_id_parts_network_members_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_network_orders" ADD CONSTRAINT "parts_network_orders_seller_id_parts_network_members_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_messages" ADD CONSTRAINT "parts_quotation_messages_request_id_parts_quotation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."parts_quotation_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_messages" ADD CONSTRAINT "parts_quotation_messages_response_id_parts_quotation_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."parts_quotation_responses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_messages" ADD CONSTRAINT "parts_quotation_messages_sender_id_parts_network_members_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_messages" ADD CONSTRAINT "parts_quotation_messages_receiver_id_parts_network_members_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_requests" ADD CONSTRAINT "parts_quotation_requests_requester_id_parts_network_members_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_requests" ADD CONSTRAINT "parts_quotation_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_responses" ADD CONSTRAINT "parts_quotation_responses_request_id_parts_quotation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."parts_quotation_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts_quotation_responses" ADD CONSTRAINT "parts_quotation_responses_responder_id_parts_network_members_id_fk" FOREIGN KEY ("responder_id") REFERENCES "public"."parts_network_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_periods" ADD CONSTRAINT "pay_periods_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_employees" ADD CONSTRAINT "payroll_employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_employees" ADD CONSTRAINT "payroll_employees_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_pay_period_id_pay_periods_id_fk" FOREIGN KEY ("pay_period_id") REFERENCES "public"."pay_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_employee_id_payroll_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."payroll_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_subscription_id_push_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."push_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qc_defects" ADD CONSTRAINT "qc_defects_inspection_id_qc_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."qc_inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_order_items" ADD CONSTRAINT "replenishment_order_items_order_id_replenishment_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."replenishment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_order_items" ADD CONSTRAINT "replenishment_order_items_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_rule_id_auto_reorder_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."auto_reorder_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_route_id_fleet_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."fleet_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_tire_storage" ADD CONSTRAINT "seasonal_tire_storage_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_tire_storage" ADD CONSTRAINT "seasonal_tire_storage_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_tire_storage" ADD CONSTRAINT "seasonal_tire_storage_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_bays" ADD CONSTRAINT "service_bays_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_bays" ADD CONSTRAINT "service_bays_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_bays" ADD CONSTRAINT "service_bays_current_vehicle_id_vehicles_id_fk" FOREIGN KEY ("current_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_bays" ADD CONSTRAINT "service_bays_current_job_card_id_job_cards_id_fk" FOREIGN KEY ("current_job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_bays" ADD CONSTRAINT "service_bays_current_technician_id_users_id_fk" FOREIGN KEY ("current_technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_chat_messages" ADD CONSTRAINT "service_chat_messages_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_chat_messages" ADD CONSTRAINT "service_chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_feedback" ADD CONSTRAINT "service_feedback_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_signatures" ADD CONSTRAINT "service_signatures_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_signatures" ADD CONSTRAINT "service_signatures_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_facilities" ADD CONSTRAINT "storage_facilities_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_parts_availability" ADD CONSTRAINT "supplier_parts_availability_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_parts_availability" ADD CONSTRAINT "supplier_parts_availability_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_parts_availability" ADD CONSTRAINT "supplier_parts_availability_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_feedback_summary" ADD CONSTRAINT "technician_feedback_summary_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_metric_preferences" ADD CONSTRAINT "technician_metric_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_performance_rollups" ADD CONSTRAINT "technician_performance_rollups_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_performance_stream" ADD CONSTRAINT "technician_performance_stream_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_performance_stream" ADD CONSTRAINT "technician_performance_stream_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_alerts" ADD CONSTRAINT "telematics_alerts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_alerts" ADD CONSTRAINT "telematics_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_devices" ADD CONSTRAINT "telematics_devices_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_devices" ADD CONSTRAINT "telematics_devices_provider_id_telematics_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."telematics_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_feeds" ADD CONSTRAINT "telematics_feeds_device_id_obd_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."obd_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_feeds" ADD CONSTRAINT "telematics_feeds_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_readings" ADD CONSTRAINT "telematics_readings_stream_id_telematics_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."telematics_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_streams" ADD CONSTRAINT "telematics_streams_device_id_telematics_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."telematics_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_inventory" ADD CONSTRAINT "tire_inventory_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_recommendations" ADD CONSTRAINT "tire_recommendations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_recommendations" ADD CONSTRAINT "tire_recommendations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_recommendations" ADD CONSTRAINT "tire_recommendations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_recommendations" ADD CONSTRAINT "tire_recommendations_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_recommendations" ADD CONSTRAINT "tire_recommendations_converted_to_job_card_id_job_cards_id_fk" FOREIGN KEY ("converted_to_job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_rotation_schedules" ADD CONSTRAINT "tire_rotation_schedules_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_rotation_schedules" ADD CONSTRAINT "tire_rotation_schedules_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_rotation_schedules" ADD CONSTRAINT "tire_rotation_schedules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_rotation_schedules" ADD CONSTRAINT "tire_rotation_schedules_last_service_record_id_tire_service_records_id_fk" FOREIGN KEY ("last_service_record_id") REFERENCES "public"."tire_service_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_service_records" ADD CONSTRAINT "tire_service_records_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_service_records" ADD CONSTRAINT "tire_service_records_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_service_records" ADD CONSTRAINT "tire_service_records_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_service_records" ADD CONSTRAINT "tire_service_records_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_service_records" ADD CONSTRAINT "tire_service_records_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tire_service_records" ADD CONSTRAINT "tire_service_records_tire_inventory_id_tire_inventory_id_fk" FOREIGN KEY ("tire_inventory_id") REFERENCES "public"."tire_inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_assigned_driver_id_users_id_fk" FOREIGN KEY ("assigned_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_location_history" ADD CONSTRAINT "vehicle_location_history_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_location_history" ADD CONSTRAINT "vehicle_location_history_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_location_history" ADD CONSTRAINT "vehicle_location_history_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_pricing_factors" ADD CONSTRAINT "vehicle_pricing_factors_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_storage_assignments" ADD CONSTRAINT "vehicle_storage_assignments_facility_id_storage_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."storage_facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_storage_assignments" ADD CONSTRAINT "vehicle_storage_assignments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_storage_assignments" ADD CONSTRAINT "vehicle_storage_assignments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_tracking" ADD CONSTRAINT "vehicle_tracking_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_tracking_history" ADD CONSTRAINT "vehicle_tracking_history_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_resources" ADD CONSTRAINT "workshop_resources_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_performance_agent_idx" ON "agent_performance_snapshots" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "agent_performance_garage_idx" ON "agent_performance_snapshots" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "ai_recommendations_job_card_idx" ON "ai_assignment_recommendations" USING btree ("job_card_id");--> statement-breakpoint
CREATE INDEX "ai_recommendations_garage_idx" ON "ai_assignment_recommendations" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "disposition_codes_garage_idx" ON "call_disposition_codes" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "call_events_session_idx" ON "call_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "call_notes_session_idx" ON "call_notes" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "queue_members_queue_idx" ON "call_queue_members" USING btree ("queue_id");--> statement-breakpoint
CREATE INDEX "queue_members_garage_idx" ON "call_queue_members" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "queue_members_agent_idx" ON "call_queue_members" USING btree ("agent_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "queue_members_unique_agent_queue" ON "call_queue_members" USING btree ("queue_id","agent_user_id");--> statement-breakpoint
CREATE INDEX "call_queues_garage_idx" ON "call_queues" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "call_recordings_session_idx" ON "call_recordings" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "call_sessions_garage_idx" ON "call_sessions" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "call_sessions_queue_idx" ON "call_sessions" USING btree ("queue_id");--> statement-breakpoint
CREATE INDEX "call_sessions_customer_idx" ON "call_sessions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "call_sessions_agent_idx" ON "call_sessions" USING btree ("assigned_agent_id");--> statement-breakpoint
CREATE INDEX "call_sessions_status_idx" ON "call_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "call_sessions_twilio_idx" ON "call_sessions" USING btree ("twilio_call_sid");--> statement-breakpoint
CREATE UNIQUE INDEX "gamif_badge_awards_tech_badge_unique" ON "gamification_badge_awards" USING btree ("technician_id","badge_id");--> statement-breakpoint
CREATE INDEX "gamif_events_technician_idx" ON "gamification_events" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "gamif_events_occurred_at_idx" ON "gamification_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "geofence_alert_recipients_zone_user_idx" ON "geofence_alert_recipients" USING btree ("geofence_zone_id","user_id");--> statement-breakpoint
CREATE INDEX "geofence_events_geofence_timestamp_idx" ON "geofence_events" USING btree ("geofence_zone_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "geofence_events_vehicle_timestamp_idx" ON "geofence_events" USING btree ("vehicle_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "geofence_events_timestamp_idx" ON "geofence_events" USING btree ("timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "geofence_events_pending_notification_idx" ON "geofence_events" USING btree ("notification_sent") WHERE notification_sent = false;--> statement-breakpoint
CREATE UNIQUE INDEX "geofence_zone_vehicles_zone_vehicle_idx" ON "geofence_zone_vehicles" USING btree ("geofence_zone_id","vehicle_id");--> statement-breakpoint
CREATE INDEX "geofence_zones_garage_active_idx" ON "geofence_zones" USING btree ("garage_id","is_active");--> statement-breakpoint
CREATE INDEX "job_tracking_events_job_card_created_idx" ON "job_tracking_events" USING btree ("job_card_id","created_at");--> statement-breakpoint
CREATE INDEX "job_tracking_events_visible_idx" ON "job_tracking_events" USING btree ("job_card_id") WHERE "job_tracking_events"."is_visible_to_customer" = true;--> statement-breakpoint
CREATE INDEX "leaderboard_period_tech_idx" ON "leaderboard_snapshots" USING btree ("period","technician_id");--> statement-breakpoint
CREATE INDEX "leaderboard_period_rank_idx" ON "leaderboard_snapshots" USING btree ("period","rank");--> statement-breakpoint
CREATE INDEX "maint_rec_vehicle_status_idx" ON "maintenance_recommendations" USING btree ("vehicle_id","status");--> statement-breakpoint
CREATE INDEX "maint_rec_predicted_due_idx" ON "maintenance_recommendations" USING btree ("predicted_due_at");--> statement-breakpoint
CREATE INDEX "maint_rules_garage_idx" ON "maintenance_trigger_rules" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "mobile_devices_garage_idx" ON "mobile_devices" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "route_checkpoints_route_sequence_idx" ON "route_checkpoints" USING btree ("route_id","sequence_number");--> statement-breakpoint
CREATE INDEX "feedback_job_card_idx" ON "service_feedback" USING btree ("job_card_id");--> statement-breakpoint
CREATE INDEX "feedback_technician_idx" ON "service_feedback" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "feedback_submitted_at_idx" ON "service_feedback" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "feedback_sentiment_idx" ON "service_feedback" USING btree ("sentiment");--> statement-breakpoint
CREATE INDEX "subscriptions_garage_idx" ON "subscriptions" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_sub_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "spa_garage_part_supplier_idx" ON "supplier_parts_availability" USING btree ("garage_id","spare_part_id","supplier_id");--> statement-breakpoint
CREATE INDEX "spa_supplier_sync_idx" ON "supplier_parts_availability" USING btree ("supplier_id","last_synced_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tech_metric_pref_user_metric_unique" ON "technician_metric_preferences" USING btree ("user_id","metric_key");--> statement-breakpoint
CREATE INDEX "perf_rollup_tech_interval_idx" ON "technician_performance_rollups" USING btree ("technician_id","interval_start");--> statement-breakpoint
CREATE INDEX "perf_stream_technician_idx" ON "technician_performance_stream" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "perf_stream_recorded_at_idx" ON "technician_performance_stream" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "perf_stream_metric_key_idx" ON "technician_performance_stream" USING btree ("metric_key");--> statement-breakpoint
CREATE INDEX "telem_devices_vehicle_idx" ON "telematics_devices" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "telem_devices_provider_idx" ON "telematics_devices" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "telem_readings_stream_recorded_idx" ON "telematics_readings" USING btree ("stream_id","recorded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "telem_readings_stream_recorded_unique" ON "telematics_readings" USING btree ("stream_id","recorded_at");--> statement-breakpoint
CREATE INDEX "telem_streams_device_idx" ON "telematics_streams" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "vehicle_location_history_vehicle_timestamp_idx" ON "vehicle_location_history" USING btree ("vehicle_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "vehicle_location_history_timestamp_idx" ON "vehicle_location_history" USING btree ("timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "vehicle_location_history_vehicle_latest_idx" ON "vehicle_location_history" USING btree ("vehicle_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reminders" ADD CONSTRAINT "service_reminders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_garage_status_invoice_date_idx" ON "invoices" USING btree ("garage_id","status","invoice_date");--> statement-breakpoint
CREATE INDEX "idx_iot_alerts_sensor_status" ON "iot_alerts" USING btree ("sensor_id","status");--> statement-breakpoint
CREATE INDEX "idx_iot_alerts_vehicle" ON "iot_alerts" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_iot_alerts_status" ON "iot_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_iot_readings_sensor_timestamp" ON "iot_sensor_readings" USING btree ("sensor_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_iot_readings_timestamp" ON "iot_sensor_readings" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "job_cards_public_tracking_token_idx" ON "job_cards" USING btree ("public_tracking_token");--> statement-breakpoint
CREATE INDEX "job_cards_garage_created_idx" ON "job_cards" USING btree ("garage_id","created_at");--> statement-breakpoint
CREATE INDEX "job_cards_garage_completed_idx" ON "job_cards" USING btree ("garage_id","completed_at");--> statement-breakpoint
CREATE INDEX "job_cards_garage_status_idx" ON "job_cards" USING btree ("garage_id","status");--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_public_tracking_token_unique" UNIQUE("public_tracking_token");