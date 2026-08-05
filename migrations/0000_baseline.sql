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
	"currency" varchar(10) DEFAULT 'SAR',
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
CREATE TABLE "assistant_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"assigned_tasks" text,
	"training_level" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
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
CREATE TABLE "autonomous_robots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"robot_name" varchar(255) NOT NULL,
	"robot_type" varchar(100) NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"manufacturer" varchar(255),
	"capabilities" text[],
	"current_location" varchar(255),
	"battery_level" integer DEFAULT 100,
	"status" varchar(50) DEFAULT 'idle',
	"last_maintenance" timestamp,
	"total_operating_hours" numeric(10, 2) DEFAULT '0',
	"tasks_completed" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"firmware_version" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "autonomous_robots_serial_number_unique" UNIQUE("serial_number")
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
CREATE TABLE "carbon_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"credit_type" varchar(100) NOT NULL,
	"quantity" numeric(15, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"verification_standard" varchar(100),
	"project_name" varchar(255),
	"vintage_year" integer,
	"expiry_date" timestamp,
	"status" varchar(50) DEFAULT 'available',
	"traded_to" uuid,
	"traded_at" timestamp,
	"certificate_url" varchar(500),
	"blockchain_record" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carbon_emissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"emission_source" varchar(100) NOT NULL,
	"emission_date" timestamp NOT NULL,
	"co2_equivalent" numeric(10, 2) NOT NULL,
	"unit" varchar(20) DEFAULT 'kg',
	"activity" varchar(255),
	"offset_by" uuid,
	"is_offset" boolean DEFAULT false,
	"reporting_period" varchar(50),
	"verified_by" varchar,
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "contract_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_data" jsonb NOT NULL,
	"block_number" integer,
	"transaction_hash" varchar(255),
	"triggered_by" varchar(255),
	"gas_used" numeric(15, 8),
	"status" varchar(50) DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "currency_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
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
CREATE TABLE "customer_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100),
	"year" integer,
	"vin" varchar(100),
	"license_plate" varchar(50),
	"color" varchar(50),
	"mileage" integer,
	"engine_type" varchar(100),
	"transmission_type" varchar(50),
	"insurance_provider" varchar(255),
	"insurance_policy_number" varchar(100),
	"insurance_expiry" timestamp,
	"license_doc_url" text,
	"insurance_doc_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"purchase_order_id" uuid,
	"order_number" varchar(50),
	"supplier_id" uuid NOT NULL,
	"supplier_contact" varchar(255),
	"supplier_phone" varchar(30),
	"delivery_location" varchar(255),
	"delivery_address" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"tracking_number" varchar(100),
	"carrier" varchar(100),
	"guidance_notes" text,
	"additional_notes" text,
	"received_by" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"status" varchar(100) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"location" varchar(255),
	"note" text,
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
CREATE TABLE "doc_sequences" (
	"garage_id" uuid NOT NULL,
	"doc_type" varchar(30) NOT NULL,
	"next_value" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "doc_sequences_garage_id_doc_type_pk" PRIMARY KEY("garage_id","doc_type")
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
CREATE TABLE "document_library_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid,
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
CREATE TABLE "drone_fleets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"drone_name" varchar(255) NOT NULL,
	"drone_model" varchar(100) NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"registration_number" varchar(100),
	"max_flight_time" integer NOT NULL,
	"max_range" numeric(10, 2) NOT NULL,
	"camera_resolution" varchar(50),
	"sensors" text[],
	"battery_level" integer DEFAULT 100,
	"total_flight_hours" numeric(10, 2) DEFAULT '0',
	"missions_completed" integer DEFAULT 0,
	"last_maintenance" timestamp,
	"status" varchar(50) DEFAULT 'available',
	"current_location" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "drone_fleets_serial_number_unique" UNIQUE("serial_number")
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
CREATE TABLE "drone_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drone_id" uuid NOT NULL,
	"mission_type" varchar(100) NOT NULL,
	"target_location" jsonb NOT NULL,
	"flight_plan" jsonb,
	"pilot_id" varchar,
	"vehicle_id" uuid,
	"status" varchar(50) DEFAULT 'planned',
	"start_time" timestamp,
	"end_time" timestamp,
	"flight_duration" integer,
	"distance_covered" numeric(10, 2),
	"media_collected" integer DEFAULT 0,
	"weather_conditions" varchar(255),
	"issues_detected" integer DEFAULT 0,
	"report_url" varchar(500),
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "ev_charging_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"station_name" varchar(255) NOT NULL,
	"location" varchar(255),
	"charger_type" varchar(100) NOT NULL,
	"power_rating" numeric(10, 2) NOT NULL,
	"connector_types" text[],
	"simultaneous_charging" integer DEFAULT 1,
	"total_charging_sessions" integer DEFAULT 0,
	"total_energy_delivered" numeric(15, 2) DEFAULT '0',
	"current_status" varchar(50) DEFAULT 'available',
	"pricing" jsonb,
	"is_public" boolean DEFAULT false,
	"network_provider" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"garage_id" uuid,
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
CREATE TABLE "fleet_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleet_group_id" uuid NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	"contract_type" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"monthly_fee" numeric(10, 2),
	"contract_value" numeric(12, 2),
	"service_cap" numeric(12, 2),
	"discount_percentage" numeric(5, 2) DEFAULT '0.00',
	"included_services" jsonb DEFAULT '[]'::jsonb,
	"excluded_services" jsonb DEFAULT '[]'::jsonb,
	"max_vehicles" integer,
	"billing_cycle" varchar(50) DEFAULT 'monthly',
	"auto_renew" boolean DEFAULT false,
	"renewal_notice_days" integer DEFAULT 30,
	"sla_response_time" integer,
	"sla_completion_time" integer,
	"sla_uptime_percentage" numeric(5, 2),
	"penalty_rate" numeric(5, 2),
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
CREATE TABLE "garage_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_type" varchar(30) DEFAULT 'garage' NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"owner_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"city" varchar(100),
	"country" varchar(100),
	"requested_plan" varchar(20) DEFAULT 'STARTER' NOT NULL,
	"notes" text,
	"tax_number" varchar(20),
	"commercial_registration" varchar(20),
	"is_demo" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"verification_status" varchar(20) DEFAULT 'unverified' NOT NULL,
	"verification_details" jsonb,
	"auto_approved" boolean DEFAULT false NOT NULL,
	"owner_password_hash" varchar(255),
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"provisioned_garage_id" uuid,
	"provisioned_user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"created_at" timestamp DEFAULT now(),
	"subscription_plan" varchar(50) DEFAULT 'STARTER',
	"business_type" varchar(30) DEFAULT 'garage' NOT NULL,
	"description" text,
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"photo_url" text
);
--> statement-breakpoint
CREATE TABLE "gate_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"garage_id" uuid,
	"customer_id" varchar,
	"vehicle_id" uuid,
	"pass_code" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"issued_by" varchar,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"used_at" timestamp,
	"used_by" varchar,
	"notes" text,
	CONSTRAINT "gate_passes_pass_code_unique" UNIQUE("pass_code")
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
CREATE TABLE "gosi_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saudi_employee_rate" double precision DEFAULT 0.0975 NOT NULL,
	"saudi_employer_rate" double precision DEFAULT 0.1175 NOT NULL,
	"non_saudi_employee_rate" double precision DEFAULT 0 NOT NULL,
	"non_saudi_employer_rate" double precision DEFAULT 0.02 NOT NULL,
	"max_contribution_salary" numeric(12, 2) DEFAULT '45000' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"changed_by" varchar(255),
	"change_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "green_energy_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"asset_type" varchar(100) NOT NULL,
	"asset_name" varchar(255) NOT NULL,
	"manufacturer" varchar(255),
	"capacity" numeric(10, 2) NOT NULL,
	"unit" varchar(20) DEFAULT 'kWh',
	"installation_date" timestamp,
	"warranty_expiry" timestamp,
	"total_energy_generated" numeric(15, 2) DEFAULT '0',
	"total_energy_saved" numeric(15, 2) DEFAULT '0',
	"current_output" numeric(10, 2),
	"efficiency" numeric(5, 2),
	"status" varchar(50) DEFAULT 'operational',
	"last_maintenance" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holographic_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"service_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"hologram_model_url" varchar(500) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"estimated_duration" integer NOT NULL,
	"steps" jsonb NOT NULL,
	"safety_warnings" text[],
	"required_tools" text[],
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"version" varchar(50) DEFAULT '1.0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holographic_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"job_card_id" uuid,
	"device_type" varchar(100) NOT NULL,
	"session_duration" integer,
	"steps_completed" integer DEFAULT 0,
	"total_steps" integer NOT NULL,
	"errors_made" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp
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
CREATE TABLE "insurance_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_id" uuid NOT NULL,
	"offering_id" uuid,
	"plan_name" varchar(255),
	"customer_vehicle_id" uuid,
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_year" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"quoted_premium" numeric(10, 2),
	"currency" varchar(10) DEFAULT 'SAR' NOT NULL,
	"quote_notes" text,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"zatca_clearance_status" varchar(20),
	"zatca_clearance_id" varchar(100),
	"zatca_invoice_hash" text,
	"zatca_qr_code" text,
	"zatca_cleared_at" timestamp,
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
	"trigger_value" numeric(12, 4),
	"recommended_action" text,
	"status" varchar(20) DEFAULT 'active',
	"acknowledged_by" varchar,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"job_card_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iot_sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid NOT NULL,
	"reading_type" varchar(50) NOT NULL,
	"value" numeric(12, 4) NOT NULL,
	"unit" varchar(20),
	"threshold" numeric(12, 4),
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
	"estimated_completion_at" timestamp,
	"eta_last_calculated_at" timestamp,
	"eta_manual_override" boolean DEFAULT false,
	"public_tracking_token" varchar(64),
	"public_tracking_token_expires_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "job_cards_job_number_unique" UNIQUE("job_number"),
	CONSTRAINT "job_cards_public_tracking_token_unique" UNIQUE("public_tracking_token")
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
CREATE TABLE "live_delivery_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"parts_description" text,
	"destination_garage" varchar(255),
	"destination_address" text,
	"store_keeper_name" varchar(255),
	"store_keeper_phone" varchar(30),
	"driver_name" varchar(255),
	"driver_phone" varchar(30),
	"driver_photo" varchar(500),
	"vehicle_number" varchar(50),
	"current_stage" varchar(30) DEFAULT 'confirmed',
	"estimated_arrival" varchar(50),
	"stages" jsonb DEFAULT '[]'::jsonb,
	"live_updates" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"currency" varchar(10) DEFAULT 'SAR',
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
CREATE TABLE "marketplace_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_id" uuid NOT NULL,
	"service_template_id" uuid,
	"customer_vehicle_id" uuid,
	"service_name" varchar(255),
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"vehicle_year" integer,
	"vehicle_plate" varchar(50),
	"preferred_date" timestamp,
	"notes" text,
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"provider_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"currency" varchar(10) DEFAULT 'SAR',
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
CREATE TABLE "metaverse_showrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"virtual_world_url" varchar(500) NOT NULL,
	"platform" varchar(100) NOT NULL,
	"max_concurrent_users" integer DEFAULT 50,
	"current_users" integer DEFAULT 0,
	"total_visits" integer DEFAULT 0,
	"average_session_duration" integer,
	"vehicles_displayed" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metaverse_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"showroom_id" uuid NOT NULL,
	"customer_id" varchar,
	"session_id" varchar(255) NOT NULL,
	"duration" integer,
	"vehicles_viewed" text[],
	"interaction_count" integer DEFAULT 0,
	"lead_generated" boolean DEFAULT false,
	"device_type" varchar(100),
	"vr_headset" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mfa_statuses" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"method" varchar(50),
	"is_enabled" boolean DEFAULT false,
	"last_changed_at" timestamp DEFAULT now()
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
CREATE TABLE "neural_diagnostics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"job_card_id" uuid,
	"model_version" varchar(50) NOT NULL,
	"input_data" jsonb NOT NULL,
	"predicted_failures" jsonb NOT NULL,
	"confidence_score" numeric(5, 2) NOT NULL,
	"time_to_failure" integer,
	"recommended_actions" text[],
	"actual_outcome" varchar(100),
	"accuracy_rating" numeric(5, 2),
	"training_data_used" integer,
	"processing_time_ms" integer,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "neural_training_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"model_version" varchar(50) NOT NULL,
	"dataset_size" integer NOT NULL,
	"epochs" integer NOT NULL,
	"accuracy" numeric(5, 2),
	"loss" numeric(10, 6),
	"training_duration_minutes" integer,
	"hyperparameters" jsonb,
	"status" varchar(50) DEFAULT 'in_progress',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "nlp_service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"original_complaint" text NOT NULL,
	"processed_complaint" text NOT NULL,
	"extracted_symptoms" text[],
	"suggested_services" jsonb NOT NULL,
	"urgency_level" varchar(50) NOT NULL,
	"estimated_cost" numeric(10, 2),
	"sentiment" varchar(50),
	"confidence" numeric(5, 2) NOT NULL,
	"job_card_id" uuid,
	"approved" boolean DEFAULT false,
	"approved_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nlp_training_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"original_text" text NOT NULL,
	"processed_text" text NOT NULL,
	"labels" text[],
	"category" varchar(100),
	"is_validated" boolean DEFAULT false,
	"validated_by" varchar,
	"created_at" timestamp DEFAULT now()
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
	"created_at" timestamp DEFAULT now(),
	"gateway" varchar(30),
	"method_type" varchar(30),
	"status" varchar(20) DEFAULT 'completed',
	"currency" varchar(3) DEFAULT 'SAR',
	"gateway_transaction_id" varchar(255),
	"gateway_reference" varchar(255),
	"processing_fee" numeric(10, 2),
	"failure_reason" text,
	"gateway_metadata" jsonb
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
CREATE TABLE "pricing_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spare_part_id" uuid NOT NULL,
	"garage_id" uuid NOT NULL,
	"price_type" varchar(50) NOT NULL,
	"old_price" numeric(10, 2),
	"new_price" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'SAR',
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
CREATE TABLE "provider_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"kind" varchar(20) DEFAULT 'service' NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"description" text,
	"price" numeric(10, 2),
	"currency" varchar(10) DEFAULT 'SAR',
	"attributes" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"offering_id" uuid,
	"name" varchar(255) NOT NULL,
	"unit_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"provider_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR' NOT NULL,
	"notes" text,
	"provider_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"customer_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "purchase_task_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"part_number" varchar(100),
	"part_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"urgency" varchar(20) DEFAULT 'medium',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_number" varchar(50) NOT NULL,
	"garage_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"source_type" varchar(50) NOT NULL,
	"source_name" varchar(255),
	"source_user_id" varchar,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"store_location" varchar(255),
	"due_date" timestamp,
	"notes" text,
	"guidance_notes" text,
	"assigned_to" varchar,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_tasks_task_number_unique" UNIQUE("task_number")
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
CREATE TABLE "quantum_encryption_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"key_type" varchar(100) NOT NULL,
	"algorithm" varchar(100) DEFAULT 'QKD-BB84',
	"key_size" integer NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"usage_count" integer DEFAULT 0,
	"max_usage" integer,
	"status" varchar(50) DEFAULT 'active',
	"associated_users" text[],
	"security_level" varchar(50) DEFAULT 'top_secret',
	"is_revoked" boolean DEFAULT false,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quantum_secure_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"encryption_key_id" uuid NOT NULL,
	"sender_id" varchar NOT NULL,
	"recipient_id" varchar NOT NULL,
	"message_type" varchar(100) NOT NULL,
	"encrypted_content" text NOT NULL,
	"integrity_hash" varchar(255) NOT NULL,
	"transmission_method" varchar(100),
	"delivery_status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp DEFAULT now(),
	"received_at" timestamp,
	"read_at" timestamp,
	"is_compromised" boolean DEFAULT false,
	"security_audit" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"part_number" varchar(100),
	"part_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"availability" varchar(30) DEFAULT 'in_stock',
	"lead_time" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_number" varchar(50) NOT NULL,
	"garage_id" uuid NOT NULL,
	"task_id" uuid,
	"title" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"store_location" varchar(255),
	"due_date" timestamp,
	"selected_quotation_id" uuid,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quotation_requests_request_number_unique" UNIQUE("request_number")
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
CREATE TABLE "recycled_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"original_part_id" uuid,
	"part_name" varchar(255) NOT NULL,
	"condition" varchar(50) NOT NULL,
	"recycling_method" varchar(100) NOT NULL,
	"source_vehicle_id" uuid,
	"dismantled_date" timestamp,
	"certification_number" varchar(255),
	"quality_grade" varchar(50),
	"selling_price" numeric(10, 2),
	"environmental_savings" jsonb,
	"sold_to" varchar,
	"sold_date" timestamp,
	"status" varchar(50) DEFAULT 'available',
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
CREATE TABLE "rl_learning_episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"episode_number" integer NOT NULL,
	"total_reward" numeric(10, 2) NOT NULL,
	"average_reward" numeric(10, 2),
	"exploration_rate" numeric(5, 4),
	"learning_rate" numeric(5, 4),
	"steps_completed" integer NOT NULL,
	"convergence_metric" numeric(10, 6),
	"status" varchar(50) DEFAULT 'completed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rl_parts_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"current_stock_level" integer NOT NULL,
	"recommended_stock_level" integer NOT NULL,
	"reorder_point" integer NOT NULL,
	"reorder_quantity" integer NOT NULL,
	"expected_demand" numeric(10, 2) NOT NULL,
	"demand_variance" numeric(10, 2),
	"lead_time" integer NOT NULL,
	"holding_cost" numeric(10, 2),
	"stockout_cost" numeric(10, 2),
	"confidence_level" numeric(5, 2) NOT NULL,
	"reward" numeric(10, 2),
	"action_taken" varchar(100),
	"model_version" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "robot_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"robot_id" uuid NOT NULL,
	"job_card_id" uuid,
	"task_type" varchar(100) NOT NULL,
	"priority" varchar(50) DEFAULT 'medium',
	"description" text,
	"parameters" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"success_rate" numeric(5, 2),
	"error_message" text,
	"assigned_by" varchar,
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"scope" varchar(100),
	"is_system_role" boolean DEFAULT false,
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
CREATE TABLE "satellite_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"provider" varchar(100) NOT NULL,
	"terminal_id" varchar(255) NOT NULL,
	"location" jsonb NOT NULL,
	"bandwidth" numeric(10, 2),
	"latency" integer,
	"data_usage" numeric(15, 2) DEFAULT '0',
	"data_limit" numeric(15, 2),
	"signal_strength" integer,
	"uptime" numeric(5, 2),
	"status" varchar(50) DEFAULT 'active',
	"last_connected" timestamp,
	"monthly_fee" numeric(10, 2),
	"contract_expiry" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "satellite_connections_terminal_id_unique" UNIQUE("terminal_id")
);
--> statement-breakpoint
CREATE TABLE "satellite_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"session_start" timestamp NOT NULL,
	"session_end" timestamp,
	"data_transferred" numeric(10, 2),
	"average_speed" numeric(10, 2),
	"application_used" varchar(255),
	"user_id" varchar,
	"cost" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "service_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar,
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
CREATE TABLE "smart_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"contract_type" varchar(100) NOT NULL,
	"contract_address" varchar(255),
	"blockchain" varchar(100) DEFAULT 'Ethereum',
	"party_a" varchar(255) NOT NULL,
	"party_b" varchar(255) NOT NULL,
	"terms" jsonb NOT NULL,
	"contract_value" numeric(15, 2),
	"currency" varchar(10) DEFAULT 'SAR',
	"status" varchar(50) DEFAULT 'draft',
	"deployed_at" timestamp,
	"executed_at" timestamp,
	"gas_fee" numeric(15, 8),
	"transaction_hash" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "smart_contracts_contract_address_unique" UNIQUE("contract_address")
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
	"currency" varchar DEFAULT 'SAR',
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
CREATE TABLE "spatial_diagnostic_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workstation_id" uuid NOT NULL,
	"technician_id" varchar NOT NULL,
	"vehicle_id" uuid,
	"job_card_id" uuid,
	"session_type" varchar(100) NOT NULL,
	"duration" integer,
	"diagnostics_performed" jsonb NOT NULL,
	"issues_found" integer DEFAULT 0,
	"virtual_assets_loaded" integer DEFAULT 0,
	"hand_gestures_used" integer DEFAULT 0,
	"accuracy" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "spatial_workstations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"device_type" varchar(100) NOT NULL,
	"device_serial" varchar(255),
	"firmware_version" varchar(50),
	"calibration_status" varchar(50) DEFAULT 'calibrated',
	"last_calibration" timestamp,
	"assigned_technician" varchar,
	"is_active" boolean DEFAULT true,
	"battery_level" integer,
	"usage_hours" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "spatial_workstations_device_serial_unique" UNIQUE("device_serial")
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
CREATE TABLE "subscription_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"current_plan" varchar(20),
	"requested_plan" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"requested_by" varchar,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "supplier_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"purchase_order_id" uuid,
	"order_number" varchar(50),
	"supplier_id" uuid NOT NULL,
	"supplier_bank" varchar(100),
	"supplier_iban" varchar(50),
	"invoice_number" varchar(100),
	"invoice_date" timestamp,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"paid_date" timestamp,
	"payment_method" varchar(50) DEFAULT 'Bank Transfer',
	"payment_reference" varchar(100),
	"notes" text,
	"guidance_notes" text,
	"approval_status" varchar(20) DEFAULT 'pending',
	"approved_by" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"currency" varchar(10) DEFAULT 'SAR',
	"minimum_order_quantity" integer DEFAULT 1,
	"lead_time_days" integer,
	"availability" varchar(50) DEFAULT 'in_stock',
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_request_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"delivery_time" varchar(100),
	"total_price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR',
	"valid_until" timestamp,
	"payment_terms" varchar(100),
	"notes" text,
	"is_recommended" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "sustainability_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"metric_type" varchar(100) NOT NULL,
	"metric_value" numeric(15, 2) NOT NULL,
	"unit" varchar(50),
	"reporting_period" varchar(50) NOT NULL,
	"target_value" numeric(15, 2),
	"achievement_rate" numeric(5, 2),
	"category" varchar(100),
	"esg_score" numeric(5, 2),
	"certifications" text[],
	"verified" boolean DEFAULT false,
	"verified_by" varchar,
	"created_at" timestamp DEFAULT now()
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
	"currency" varchar(3) DEFAULT 'SAR' NOT NULL,
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
	"phone_verified_at" timestamp,
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
	"role" varchar(50) DEFAULT 'ADVISOR',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vat_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_code" varchar(2) DEFAULT 'SA' NOT NULL,
	"vat_rate" double precision DEFAULT 0.15 NOT NULL,
	"vat_registration_number" varchar(50),
	"company_name_en" varchar(255),
	"company_name_ar" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"changed_by" varchar(255),
	"change_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "vision_defects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quality_check_id" uuid NOT NULL,
	"defect_type" varchar(100) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"location" jsonb NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"dimensions" jsonb,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vision_quality_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"job_card_id" uuid,
	"check_type" varchar(100) NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"defects_detected" jsonb NOT NULL,
	"quality_score" numeric(5, 2) NOT NULL,
	"passed_inspection" boolean DEFAULT false,
	"inspector_id" varchar,
	"manual_override" boolean DEFAULT false,
	"override_reason" text,
	"ai_model" varchar(100) NOT NULL,
	"processing_time_ms" integer,
	"annotated_image_url" varchar(500),
	"status" varchar(50) DEFAULT 'completed',
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
ALTER TABLE "accounting_connections" ADD CONSTRAINT "accounting_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_sync" ADD CONSTRAINT "accounting_sync_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_transactions" ADD CONSTRAINT "accounting_transactions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_transactions" ADD CONSTRAINT "accounting_transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_history" ADD CONSTRAINT "action_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_history" ADD CONSTRAINT "action_history_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_snapshots" ADD CONSTRAINT "agent_performance_snapshots_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_snapshots" ADD CONSTRAINT "agent_performance_snapshots_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assignment_recommendations" ADD CONSTRAINT "ai_assignment_recommendations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assignment_recommendations" ADD CONSTRAINT "ai_assignment_recommendations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_assignment_recommendations" ADD CONSTRAINT "ai_assignment_recommendations_recommended_technician_id_users_id_fk" FOREIGN KEY ("recommended_technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "appointment_reminder_logs" ADD CONSTRAINT "appointment_reminder_logs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_logs" ADD CONSTRAINT "appointment_reminder_logs_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_logs" ADD CONSTRAINT "appointment_reminder_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder_settings" ADD CONSTRAINT "appointment_reminder_settings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_status_history" ADD CONSTRAINT "appointment_status_history_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_status_history" ADD CONSTRAINT "appointment_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_assets" ADD CONSTRAINT "ar_assets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_assets" ADD CONSTRAINT "ar_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_device_pairings" ADD CONSTRAINT "ar_device_pairings_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_device_pairings" ADD CONSTRAINT "ar_device_pairings_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_guide_sessions" ADD CONSTRAINT "ar_guide_sessions_guide_id_ar_repair_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."ar_repair_guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_guide_sessions" ADD CONSTRAINT "ar_guide_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_guide_sessions" ADD CONSTRAINT "ar_guide_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_repair_guides" ADD CONSTRAINT "ar_repair_guides_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ar_repair_guides" ADD CONSTRAINT "ar_repair_guides_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "assistant_profiles" ADD CONSTRAINT "assistant_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_history" ADD CONSTRAINT "auto_reorder_history_rule_id_auto_reorder_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."auto_reorder_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_history" ADD CONSTRAINT "auto_reorder_history_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_history" ADD CONSTRAINT "auto_reorder_history_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_rules" ADD CONSTRAINT "auto_reorder_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_reorder_rules" ADD CONSTRAINT "auto_reorder_rules_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autonomous_robots" ADD CONSTRAINT "autonomous_robots_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_scanned_by_users_id_fk" FOREIGN KEY ("scanned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_bay_id_service_bays_id_fk" FOREIGN KEY ("bay_id") REFERENCES "public"."service_bays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_occupancy_sessions" ADD CONSTRAINT "bay_occupancy_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_telemetry_events" ADD CONSTRAINT "bay_telemetry_events_bay_id_service_bays_id_fk" FOREIGN KEY ("bay_id") REFERENCES "public"."service_bays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bay_telemetry_events" ADD CONSTRAINT "bay_telemetry_events_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_logs" ADD CONSTRAINT "biometric_logs_profile_id_biometric_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."biometric_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_profiles" ADD CONSTRAINT "biometric_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_heatmaps" ADD CONSTRAINT "business_heatmaps_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_reminders" ADD CONSTRAINT "calibration_reminders_calibration_id_equipment_calibration_id_fk" FOREIGN KEY ("calibration_id") REFERENCES "public"."equipment_calibration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "camera_recordings" ADD CONSTRAINT "camera_recordings_camera_id_security_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."security_cameras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camera_recordings" ADD CONSTRAINT "camera_recordings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_traded_to_garages_id_fk" FOREIGN KEY ("traded_to") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions" ADD CONSTRAINT "carbon_emissions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions" ADD CONSTRAINT "carbon_emissions_offset_by_carbon_credits_id_fk" FOREIGN KEY ("offset_by") REFERENCES "public"."carbon_credits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions" ADD CONSTRAINT "carbon_emissions_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_attempts" ADD CONSTRAINT "certification_attempts_certification_id_certifications_id_fk" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_attempts" ADD CONSTRAINT "certification_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_attempts" ADD CONSTRAINT "certification_attempts_module_id_training_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."training_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_policy_id_compliance_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."compliance_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audits" ADD CONSTRAINT "compliance_audits_auditor_users_id_fk" FOREIGN KEY ("auditor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_policies" ADD CONSTRAINT "compliance_policies_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_policy_id_compliance_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."compliance_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_audit_id_compliance_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."compliance_audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tasks" ADD CONSTRAINT "compliance_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_events" ADD CONSTRAINT "contract_events_contract_id_smart_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."smart_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_renewals" ADD CONSTRAINT "contract_renewals_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_renewals" ADD CONSTRAINT "contract_renewals_renewed_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("renewed_contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_renewals" ADD CONSTRAINT "contract_renewals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_sla_metrics" ADD CONSTRAINT "contract_sla_metrics_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_sla_metrics" ADD CONSTRAINT "contract_sla_metrics_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_utilization" ADD CONSTRAINT "contract_utilization_contract_id_fleet_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."fleet_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_utilization" ADD CONSTRAINT "contract_utilization_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_utilization" ADD CONSTRAINT "contract_utilization_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_non_conformance_id_non_conformances_id_fk" FOREIGN KEY ("non_conformance_id") REFERENCES "public"."non_conformances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_border_docs" ADD CONSTRAINT "cross_border_docs_fulfillment_order_id_fulfillment_orders_id_fk" FOREIGN KEY ("fulfillment_order_id") REFERENCES "public"."fulfillment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_communication_preferences" ADD CONSTRAINT "customer_communication_preferences_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "customer_vehicles" ADD CONSTRAINT "customer_vehicles_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_items" ADD CONSTRAINT "delivery_items_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_timeline" ADD CONSTRAINT "delivery_timeline_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "doc_sequences" ADD CONSTRAINT "doc_sequences_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_accessed_by_users_id_fk" FOREIGN KEY ("accessed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_document_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_fleets" ADD CONSTRAINT "drone_fleets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_inspections" ADD CONSTRAINT "drone_inspections_pilot_id_users_id_fk" FOREIGN KEY ("pilot_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_media" ADD CONSTRAINT "drone_media_inspection_id_drone_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."drone_inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_drone_id_drone_fleets_id_fk" FOREIGN KEY ("drone_id") REFERENCES "public"."drone_fleets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_pilot_id_users_id_fk" FOREIGN KEY ("pilot_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_pricing_suggestions" ADD CONSTRAINT "dynamic_pricing_suggestions_accepted_by_users_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "ev_charging_stations" ADD CONSTRAINT "ev_charging_stations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_routes" ADD CONSTRAINT "fleet_routes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "gamification_badge_awards" ADD CONSTRAINT "gamification_badge_awards_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_badge_awards" ADD CONSTRAINT "gamification_badge_awards_badge_id_gamification_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."gamification_badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_event_definitions" ADD CONSTRAINT "gamification_event_definitions_badge_id_gamification_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."gamification_badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_events" ADD CONSTRAINT "gamification_events_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_applications" ADD CONSTRAINT "garage_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_applications" ADD CONSTRAINT "garage_applications_provisioned_garage_id_garages_id_fk" FOREIGN KEY ("provisioned_garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_applications" ADD CONSTRAINT "garage_applications_provisioned_user_id_users_id_fk" FOREIGN KEY ("provisioned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garages" ADD CONSTRAINT "garages_saas_plan_id_saas_plans_id_fk" FOREIGN KEY ("saas_plan_id") REFERENCES "public"."saas_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_passes" ADD CONSTRAINT "gate_passes_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_passes" ADD CONSTRAINT "gate_passes_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_data_requests" ADD CONSTRAINT "gdpr_data_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_data_requests" ADD CONSTRAINT "gdpr_data_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "green_energy_assets" ADD CONSTRAINT "green_energy_assets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_guides" ADD CONSTRAINT "holographic_guides_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_guides" ADD CONSTRAINT "holographic_guides_service_id_service_templates_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_guide_id_holographic_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."holographic_guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_offering_id_provider_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."provider_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_quotes" ADD CONSTRAINT "insurance_quotes_customer_vehicle_id_customer_vehicles_id_fk" FOREIGN KEY ("customer_vehicle_id") REFERENCES "public"."customer_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_audit_trail" ADD CONSTRAINT "inventory_audit_trail_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_forecasts" ADD CONSTRAINT "inventory_forecasts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_forecasts" ADD CONSTRAINT "inventory_forecasts_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_sensor_readings" ADD CONSTRAINT "iot_sensor_readings_sensor_id_iot_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."iot_sensors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_sensors" ADD CONSTRAINT "iot_sensors_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_card_parts" ADD CONSTRAINT "job_card_parts_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_card_parts" ADD CONSTRAINT "job_card_parts_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_card_parts" ADD CONSTRAINT "job_card_parts_spare_part_inventory_id_spare_part_inventories_id_fk" FOREIGN KEY ("spare_part_inventory_id") REFERENCES "public"."spare_part_inventories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking_events" ADD CONSTRAINT "job_tracking_events_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking_events" ADD CONSTRAINT "job_tracking_events_task_id_task_assignments_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_tracking_events" ADD CONSTRAINT "job_tracking_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_session_id_kiosk_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."kiosk_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_check_ins" ADD CONSTRAINT "kiosk_check_ins_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_audit_logs" ADD CONSTRAINT "license_audit_logs_license_id_subscription_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."subscription_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_audit_logs" ADD CONSTRAINT "license_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plate_scans" ADD CONSTRAINT "license_plate_scans_camera_id_security_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."security_cameras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_delivery_statuses" ADD CONSTRAINT "live_delivery_statuses_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_loaner_vehicle_id_loaner_vehicles_id_fk" FOREIGN KEY ("loaner_vehicle_id") REFERENCES "public"."loaner_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_agreement_signature_id_digital_signatures_id_fk" FOREIGN KEY ("agreement_signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_return_signature_id_digital_signatures_id_fk" FOREIGN KEY ("return_signature_id") REFERENCES "public"."digital_signatures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_reservations" ADD CONSTRAINT "loaner_reservations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_vehicles" ADD CONSTRAINT "loaner_vehicles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loaner_vehicles" ADD CONSTRAINT "loaner_vehicles_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_tier_id_loyalty_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_referred_by_loyalty_accounts_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_tier_restriction_loyalty_tiers_id_fk" FOREIGN KEY ("tier_restriction") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_offers" ADD CONSTRAINT "loyalty_offers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_program" ADD CONSTRAINT "loyalty_program_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_account_id_customer_loyalty_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."customer_loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_related_invoice_id_invoices_id_fk" FOREIGN KEY ("related_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_program_id_loyalty_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_program"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_tiers" ADD CONSTRAINT "loyalty_tiers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_account_id_customer_loyalty_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."customer_loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_recommendations" ADD CONSTRAINT "maintenance_recommendations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_recommendations" ADD CONSTRAINT "maintenance_recommendations_rule_id_maintenance_trigger_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."maintenance_trigger_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_trigger_rules" ADD CONSTRAINT "maintenance_trigger_rules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_pricing_data" ADD CONSTRAINT "market_pricing_data_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_accounts" ADD CONSTRAINT "marketing_accounts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_accounts" ADD CONSTRAINT "marketing_accounts_provider_id_marketing_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."marketing_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_accounts" ADD CONSTRAINT "marketing_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_ad_campaigns" ADD CONSTRAINT "marketing_ad_campaigns_account_id_marketing_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."marketing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_ad_campaigns" ADD CONSTRAINT "marketing_ad_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_service_template_id_service_templates_id_fk" FOREIGN KEY ("service_template_id") REFERENCES "public"."service_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_bookings" ADD CONSTRAINT "marketplace_bookings_customer_vehicle_id_customer_vehicles_id_fk" FOREIGN KEY ("customer_vehicle_id") REFERENCES "public"."customer_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_connections" ADD CONSTRAINT "marketplace_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_linked_job_card_id_job_cards_id_fk" FOREIGN KEY ("linked_job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_linked_spare_part_spare_parts_id_fk" FOREIGN KEY ("linked_spare_part") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metaverse_showrooms" ADD CONSTRAINT "metaverse_showrooms_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metaverse_visits" ADD CONSTRAINT "metaverse_visits_showroom_id_metaverse_showrooms_id_fk" FOREIGN KEY ("showroom_id") REFERENCES "public"."metaverse_showrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metaverse_visits" ADD CONSTRAINT "metaverse_visits_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_statuses" ADD CONSTRAINT "mfa_statuses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_app_sessions" ADD CONSTRAINT "mobile_app_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_app_sessions" ADD CONSTRAINT "mobile_app_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_quick_actions" ADD CONSTRAINT "mobile_quick_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neural_diagnostics" ADD CONSTRAINT "neural_diagnostics_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neural_diagnostics" ADD CONSTRAINT "neural_diagnostics_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neural_diagnostics" ADD CONSTRAINT "neural_diagnostics_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neural_training_sessions" ADD CONSTRAINT "neural_training_sessions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_service_requests" ADD CONSTRAINT "nlp_service_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_service_requests" ADD CONSTRAINT "nlp_service_requests_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_service_requests" ADD CONSTRAINT "nlp_service_requests_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_service_requests" ADD CONSTRAINT "nlp_service_requests_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_service_requests" ADD CONSTRAINT "nlp_service_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_training_data" ADD CONSTRAINT "nlp_training_data_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nlp_training_data" ADD CONSTRAINT "nlp_training_data_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "no_show_tracking" ADD CONSTRAINT "no_show_tracking_rescheduled_appointment_id_appointments_id_fk" FOREIGN KEY ("rescheduled_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_detected_by_users_id_fk" FOREIGN KEY ("detected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_schedules" ADD CONSTRAINT "notification_schedules_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_employees" ADD CONSTRAINT "payroll_employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_employees" ADD CONSTRAINT "payroll_employees_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_period_id_payroll_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_pay_period_id_pay_periods_id_fk" FOREIGN KEY ("pay_period_id") REFERENCES "public"."pay_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_employee_id_payroll_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."payroll_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "provider_offerings" ADD CONSTRAINT "provider_offerings_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_order_items" ADD CONSTRAINT "provider_order_items_order_id_provider_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."provider_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_order_items" ADD CONSTRAINT "provider_order_items_offering_id_provider_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."provider_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_orders" ADD CONSTRAINT "provider_orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_orders" ADD CONSTRAINT "provider_orders_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_provider_id_garages_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_task_parts" ADD CONSTRAINT "purchase_task_parts_task_id_purchase_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."purchase_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tasks" ADD CONSTRAINT "purchase_tasks_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tasks" ADD CONSTRAINT "purchase_tasks_source_user_id_users_id_fk" FOREIGN KEY ("source_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tasks" ADD CONSTRAINT "purchase_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_tokens" ADD CONSTRAINT "push_notification_tokens_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_subscription_id_push_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."push_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_tokens" ADD CONSTRAINT "qr_code_tokens_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_qr_code_id_qr_code_tokens_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_code_tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scanned_by_users_id_fk" FOREIGN KEY ("scanned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_checklists" ADD CONSTRAINT "quality_checklists_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_encryption_keys" ADD CONSTRAINT "quantum_encryption_keys_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_encryption_key_id_quantum_encryption_keys_id_fk" FOREIGN KEY ("encryption_key_id") REFERENCES "public"."quantum_encryption_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_supplier_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."supplier_quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_requests" ADD CONSTRAINT "quotation_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_requests" ADD CONSTRAINT "quotation_requests_task_id_purchase_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."purchase_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_requests" ADD CONSTRAINT "quotation_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realtime_streams" ADD CONSTRAINT "realtime_streams_device_id_obd_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."obd_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_appointments" ADD CONSTRAINT "recurring_appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_original_part_id_spare_parts_id_fk" FOREIGN KEY ("original_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_source_vehicle_id_vehicles_id_fk" FOREIGN KEY ("source_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_sold_to_customer_profiles_user_id_fk" FOREIGN KEY ("sold_to") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "replenishment_order_items" ADD CONSTRAINT "replenishment_order_items_order_id_replenishment_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."replenishment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_order_items" ADD CONSTRAINT "replenishment_order_items_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_rule_id_auto_reorder_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."auto_reorder_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_orders" ADD CONSTRAINT "replenishment_orders_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_sharing_rules" ADD CONSTRAINT "revenue_sharing_rules_franchise_group_id_franchise_groups_id_fk" FOREIGN KEY ("franchise_group_id") REFERENCES "public"."franchise_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_platform_integrations" ADD CONSTRAINT "review_platform_integrations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rl_learning_episodes" ADD CONSTRAINT "rl_learning_episodes_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rl_parts_optimizations" ADD CONSTRAINT "rl_parts_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rl_parts_optimizations" ADD CONSTRAINT "rl_parts_optimizations_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "robot_tasks" ADD CONSTRAINT "robot_tasks_robot_id_autonomous_robots_id_fk" FOREIGN KEY ("robot_id") REFERENCES "public"."autonomous_robots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "robot_tasks" ADD CONSTRAINT "robot_tasks_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "robot_tasks" ADD CONSTRAINT "robot_tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_route_id_fleet_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."fleet_routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_optimizations" ADD CONSTRAINT "routing_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_optimizations" ADD CONSTRAINT "routing_optimizations_assigned_driver_users_id_fk" FOREIGN KEY ("assigned_driver") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_connections" ADD CONSTRAINT "satellite_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_usage_logs" ADD CONSTRAINT "satellite_usage_logs_connection_id_satellite_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."satellite_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_usage_logs" ADD CONSTRAINT "satellite_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saudi_tax_compliance" ADD CONSTRAINT "saudi_tax_compliance_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_filter_presets" ADD CONSTRAINT "saved_filter_presets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_filter_presets" ADD CONSTRAINT "saved_filter_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduling_optimizations" ADD CONSTRAINT "scheduling_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_tire_storage" ADD CONSTRAINT "seasonal_tire_storage_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_tire_storage" ADD CONSTRAINT "seasonal_tire_storage_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasonal_tire_storage" ADD CONSTRAINT "seasonal_tire_storage_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_cameras" ADD CONSTRAINT "security_cameras_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "service_reminders" ADD CONSTRAINT "service_reminders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reminders" ADD CONSTRAINT "service_reminders_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reminders" ADD CONSTRAINT "service_reminders_maintenance_schedule_id_maintenance_schedules_id_fk" FOREIGN KEY ("maintenance_schedule_id") REFERENCES "public"."maintenance_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_signatures" ADD CONSTRAINT "service_signatures_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_signatures" ADD CONSTRAINT "service_signatures_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_inventories" ADD CONSTRAINT "spare_part_inventories_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_inventories" ADD CONSTRAINT "spare_part_inventories_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_part_inventories" ADD CONSTRAINT "spare_part_inventories_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_parts" ADD CONSTRAINT "spare_parts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_workstation_id_spatial_workstations_id_fk" FOREIGN KEY ("workstation_id") REFERENCES "public"."spatial_workstations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_workstations" ADD CONSTRAINT "spatial_workstations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_workstations" ADD CONSTRAINT "spatial_workstations_assigned_technician_users_id_fk" FOREIGN KEY ("assigned_technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_facilities" ADD CONSTRAINT "storage_facilities_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_licenses" ADD CONSTRAINT "subscription_licenses_oem_product_id_oem_products_id_fk" FOREIGN KEY ("oem_product_id") REFERENCES "public"."oem_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_licenses" ADD CONSTRAINT "subscription_licenses_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_parts_availability" ADD CONSTRAINT "supplier_parts_availability_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_parts_availability" ADD CONSTRAINT "supplier_parts_availability_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_parts_availability" ADD CONSTRAINT "supplier_parts_availability_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_performance" ADD CONSTRAINT "supplier_performance_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_price_list" ADD CONSTRAINT "supplier_price_list_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_price_list" ADD CONSTRAINT "supplier_price_list_spare_part_id_spare_parts_id_fk" FOREIGN KEY ("spare_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_quotation_request_id_quotation_requests_id_fk" FOREIGN KEY ("quotation_request_id") REFERENCES "public"."quotation_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustainability_metrics" ADD CONSTRAINT "sustainability_metrics_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustainability_metrics" ADD CONSTRAINT "sustainability_metrics_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress_logs" ADD CONSTRAINT "task_progress_logs_task_id_task_assignments_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress_logs" ADD CONSTRAINT "task_progress_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_configurations" ADD CONSTRAINT "tax_configurations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_configurations" ADD CONSTRAINT "tax_configurations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_availability" ADD CONSTRAINT "technician_availability_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_availability" ADD CONSTRAINT "technician_availability_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_feedback_summary" ADD CONSTRAINT "technician_feedback_summary_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_metric_preferences" ADD CONSTRAINT "technician_metric_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_performance_rollups" ADD CONSTRAINT "technician_performance_rollups_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_performance_stream" ADD CONSTRAINT "technician_performance_stream_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_performance_stream" ADD CONSTRAINT "technician_performance_stream_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD CONSTRAINT "technician_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_alerts" ADD CONSTRAINT "telematics_alerts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_alerts" ADD CONSTRAINT "telematics_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_devices" ADD CONSTRAINT "telematics_devices_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_devices" ADD CONSTRAINT "telematics_devices_provider_id_telematics_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."telematics_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_feeds" ADD CONSTRAINT "telematics_feeds_device_id_obd_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."obd_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_feeds" ADD CONSTRAINT "telematics_feeds_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_readings" ADD CONSTRAINT "telematics_readings_stream_id_telematics_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."telematics_streams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telematics_streams" ADD CONSTRAINT "telematics_streams_device_id_telematics_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."telematics_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_clock_entries" ADD CONSTRAINT "time_clock_entries_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_clock_entries" ADD CONSTRAINT "time_clock_entries_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_clock_entries" ADD CONSTRAINT "time_clock_entries_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timezone_rules" ADD CONSTRAINT "timezone_rules_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "towing_jobs" ADD CONSTRAINT "towing_jobs_assigned_driver_id_users_id_fk" FOREIGN KEY ("assigned_driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "vehicle_location_history" ADD CONSTRAINT "vehicle_location_history_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_location_history" ADD CONSTRAINT "vehicle_location_history_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_location_history" ADD CONSTRAINT "vehicle_location_history_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_pricing_factors" ADD CONSTRAINT "vehicle_pricing_factors_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_service_history" ADD CONSTRAINT "vehicle_service_history_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_service_history" ADD CONSTRAINT "vehicle_service_history_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_service_history" ADD CONSTRAINT "vehicle_service_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_storage_assignments" ADD CONSTRAINT "vehicle_storage_assignments_facility_id_storage_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."storage_facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_storage_assignments" ADD CONSTRAINT "vehicle_storage_assignments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_storage_assignments" ADD CONSTRAINT "vehicle_storage_assignments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_tracking" ADD CONSTRAINT "vehicle_tracking_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_tracking_history" ADD CONSTRAINT "vehicle_tracking_history_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "vision_defects" ADD CONSTRAINT "vision_defects_quality_check_id_vision_quality_checks_id_fk" FOREIGN KEY ("quality_check_id") REFERENCES "public"."vision_quality_checks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "currency_transactions_garage_idx" ON "currency_transactions" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "customer_vehicles_customer_idx" ON "customer_vehicles" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "document_library_items_garage_idx" ON "document_library_items" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "fleet_accounts_garage_idx" ON "fleet_accounts" USING btree ("garage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "gamif_badge_awards_tech_badge_unique" ON "gamification_badge_awards" USING btree ("technician_id","badge_id");--> statement-breakpoint
CREATE INDEX "gamif_events_technician_idx" ON "gamification_events" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "gamif_events_occurred_at_idx" ON "gamification_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "garage_applications_status_idx" ON "garage_applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "geofence_alert_recipients_zone_user_idx" ON "geofence_alert_recipients" USING btree ("geofence_zone_id","user_id");--> statement-breakpoint
CREATE INDEX "geofence_events_geofence_timestamp_idx" ON "geofence_events" USING btree ("geofence_zone_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "geofence_events_vehicle_timestamp_idx" ON "geofence_events" USING btree ("vehicle_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "geofence_events_timestamp_idx" ON "geofence_events" USING btree ("timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "geofence_events_pending_notification_idx" ON "geofence_events" USING btree ("notification_sent") WHERE notification_sent = false;--> statement-breakpoint
CREATE UNIQUE INDEX "geofence_zone_vehicles_zone_vehicle_idx" ON "geofence_zone_vehicles" USING btree ("geofence_zone_id","vehicle_id");--> statement-breakpoint
CREATE INDEX "geofence_zones_garage_active_idx" ON "geofence_zones" USING btree ("garage_id","is_active");--> statement-breakpoint
CREATE INDEX "insurance_quotes_customer_idx" ON "insurance_quotes" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "insurance_quotes_provider_idx" ON "insurance_quotes" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_iot_alerts_sensor_status" ON "iot_alerts" USING btree ("sensor_id","status");--> statement-breakpoint
CREATE INDEX "idx_iot_alerts_vehicle" ON "iot_alerts" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_iot_alerts_status" ON "iot_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_iot_readings_sensor_timestamp" ON "iot_sensor_readings" USING btree ("sensor_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_iot_readings_timestamp" ON "iot_sensor_readings" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "job_cards_public_tracking_token_idx" ON "job_cards" USING btree ("public_tracking_token");--> statement-breakpoint
CREATE INDEX "job_tracking_events_job_card_created_idx" ON "job_tracking_events" USING btree ("job_card_id","created_at");--> statement-breakpoint
CREATE INDEX "job_tracking_events_visible_idx" ON "job_tracking_events" USING btree ("job_card_id") WHERE "job_tracking_events"."is_visible_to_customer" = true;--> statement-breakpoint
CREATE INDEX "leaderboard_period_tech_idx" ON "leaderboard_snapshots" USING btree ("period","technician_id");--> statement-breakpoint
CREATE INDEX "leaderboard_period_rank_idx" ON "leaderboard_snapshots" USING btree ("period","rank");--> statement-breakpoint
CREATE INDEX "maint_rec_vehicle_status_idx" ON "maintenance_recommendations" USING btree ("vehicle_id","status");--> statement-breakpoint
CREATE INDEX "maint_rec_predicted_due_idx" ON "maintenance_recommendations" USING btree ("predicted_due_at");--> statement-breakpoint
CREATE INDEX "maint_rules_garage_idx" ON "maintenance_trigger_rules" USING btree ("garage_id");--> statement-breakpoint
CREATE INDEX "marketplace_bookings_customer_idx" ON "marketplace_bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "marketplace_bookings_provider_idx" ON "marketplace_bookings" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "marketplace_bookings_status_idx" ON "marketplace_bookings" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_gateway_txn_unique" ON "payments" USING btree ("gateway","gateway_transaction_id") WHERE "payments"."gateway_transaction_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "provider_offerings_provider_idx" ON "provider_offerings" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "provider_orders_customer_idx" ON "provider_orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "provider_orders_provider_idx" ON "provider_orders" USING btree ("provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_reviews_provider_customer_unique" ON "provider_reviews" USING btree ("provider_id","customer_id");--> statement-breakpoint
CREATE INDEX "provider_reviews_provider_idx" ON "provider_reviews" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "route_checkpoints_route_sequence_idx" ON "route_checkpoints" USING btree ("route_id","sequence_number");--> statement-breakpoint
CREATE INDEX "feedback_job_card_idx" ON "service_feedback" USING btree ("job_card_id");--> statement-breakpoint
CREATE INDEX "feedback_technician_idx" ON "service_feedback" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "feedback_submitted_at_idx" ON "service_feedback" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "feedback_sentiment_idx" ON "service_feedback" USING btree ("sentiment");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "subscription_requests_status_idx" ON "subscription_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_requests_garage_idx" ON "subscription_requests" USING btree ("garage_id");--> statement-breakpoint
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
CREATE INDEX "vehicle_location_history_timestamp_idx" ON "vehicle_location_history" USING btree ("timestamp" DESC NULLS LAST);