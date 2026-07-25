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
	"currency" varchar(10) DEFAULT 'USD',
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
ALTER TABLE "autonomous_robots" ADD CONSTRAINT "autonomous_robots_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_traded_to_garages_id_fk" FOREIGN KEY ("traded_to") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions" ADD CONSTRAINT "carbon_emissions_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions" ADD CONSTRAINT "carbon_emissions_offset_by_carbon_credits_id_fk" FOREIGN KEY ("offset_by") REFERENCES "public"."carbon_credits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_emissions" ADD CONSTRAINT "carbon_emissions_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_events" ADD CONSTRAINT "contract_events_contract_id_smart_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."smart_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_fleets" ADD CONSTRAINT "drone_fleets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_drone_id_drone_fleets_id_fk" FOREIGN KEY ("drone_id") REFERENCES "public"."drone_fleets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_pilot_id_users_id_fk" FOREIGN KEY ("pilot_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drone_missions" ADD CONSTRAINT "drone_missions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ev_charging_stations" ADD CONSTRAINT "ev_charging_stations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "green_energy_assets" ADD CONSTRAINT "green_energy_assets_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_guides" ADD CONSTRAINT "holographic_guides_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_guides" ADD CONSTRAINT "holographic_guides_service_id_service_templates_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_guide_id_holographic_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."holographic_guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holographic_sessions" ADD CONSTRAINT "holographic_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metaverse_showrooms" ADD CONSTRAINT "metaverse_showrooms_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metaverse_visits" ADD CONSTRAINT "metaverse_visits_showroom_id_metaverse_showrooms_id_fk" FOREIGN KEY ("showroom_id") REFERENCES "public"."metaverse_showrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metaverse_visits" ADD CONSTRAINT "metaverse_visits_customer_id_customer_profiles_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "quantum_encryption_keys" ADD CONSTRAINT "quantum_encryption_keys_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_encryption_key_id_quantum_encryption_keys_id_fk" FOREIGN KEY ("encryption_key_id") REFERENCES "public"."quantum_encryption_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantum_secure_messages" ADD CONSTRAINT "quantum_secure_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_original_part_id_spare_parts_id_fk" FOREIGN KEY ("original_part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_source_vehicle_id_vehicles_id_fk" FOREIGN KEY ("source_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recycled_parts" ADD CONSTRAINT "recycled_parts_sold_to_customer_profiles_user_id_fk" FOREIGN KEY ("sold_to") REFERENCES "public"."customer_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rl_learning_episodes" ADD CONSTRAINT "rl_learning_episodes_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rl_parts_optimizations" ADD CONSTRAINT "rl_parts_optimizations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rl_parts_optimizations" ADD CONSTRAINT "rl_parts_optimizations_part_id_spare_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."spare_parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "robot_tasks" ADD CONSTRAINT "robot_tasks_robot_id_autonomous_robots_id_fk" FOREIGN KEY ("robot_id") REFERENCES "public"."autonomous_robots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "robot_tasks" ADD CONSTRAINT "robot_tasks_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "robot_tasks" ADD CONSTRAINT "robot_tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_connections" ADD CONSTRAINT "satellite_connections_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_usage_logs" ADD CONSTRAINT "satellite_usage_logs_connection_id_satellite_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."satellite_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "satellite_usage_logs" ADD CONSTRAINT "satellite_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_contracts" ADD CONSTRAINT "smart_contracts_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_workstation_id_spatial_workstations_id_fk" FOREIGN KEY ("workstation_id") REFERENCES "public"."spatial_workstations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_diagnostic_sessions" ADD CONSTRAINT "spatial_diagnostic_sessions_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_workstations" ADD CONSTRAINT "spatial_workstations_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spatial_workstations" ADD CONSTRAINT "spatial_workstations_assigned_technician_users_id_fk" FOREIGN KEY ("assigned_technician") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustainability_metrics" ADD CONSTRAINT "sustainability_metrics_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sustainability_metrics" ADD CONSTRAINT "sustainability_metrics_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_defects" ADD CONSTRAINT "vision_defects_quality_check_id_vision_quality_checks_id_fk" FOREIGN KEY ("quality_check_id") REFERENCES "public"."vision_quality_checks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_job_card_id_job_cards_id_fk" FOREIGN KEY ("job_card_id") REFERENCES "public"."job_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_quality_checks" ADD CONSTRAINT "vision_quality_checks_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;