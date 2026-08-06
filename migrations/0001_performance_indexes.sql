-- 0001_performance_indexes.sql
-- Add missing btree indexes on tenant (garage_id) and foreign-key columns.
--
-- Audit DB-C1/DB-C2: the FK + garage_id columns below had no leading-column
-- index, so every tenant-scoped `WHERE garage_id = $1` and every FK join / child
-- lookup did a sequential scan. Idempotent (IF NOT EXISTS); safe to re-run.
--
-- Plain CREATE INDEX (the migrator runs each file in a transaction). On a large
-- production DB, apply the CONCURRENTLY variant during a maintenance window
-- instead — see migrations/README.md.
CREATE INDEX IF NOT EXISTS "idx_accounting_connections_garage_id" ON "accounting_connections" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounting_sync_garage_id" ON "accounting_sync" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounting_transactions_garage_id" ON "accounting_transactions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounting_transactions_invoice_id" ON "accounting_transactions" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_action_history_garage_id" ON "action_history" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_action_history_user_id" ON "action_history" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_logs_user_id" ON "activity_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_assignment_recommendations_recommended_technician_id" ON "ai_assignment_recommendations" ("recommended_technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_chat_conversations_customer_id" ON "ai_chat_conversations" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_chat_conversations_garage_id" ON "ai_chat_conversations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_chat_conversations_handoff_to" ON "ai_chat_conversations" ("handoff_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_chat_messages_conversation_id" ON "ai_chat_messages" ("conversation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_job_estimations_garage_id" ON "ai_job_estimations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_job_estimations_job_card_id" ON "ai_job_estimations" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_job_estimations_vehicle_id" ON "ai_job_estimations" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_maintenance_predictions_acknowledged_by" ON "ai_maintenance_predictions" ("acknowledged_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_maintenance_predictions_garage_id" ON "ai_maintenance_predictions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_maintenance_predictions_vehicle_id" ON "ai_maintenance_predictions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_parts_recommendations_garage_id" ON "ai_parts_recommendations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_parts_recommendations_job_card_id" ON "ai_parts_recommendations" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_parts_recommendations_vehicle_id" ON "ai_parts_recommendations" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_schedule_optimizations_garage_id" ON "ai_schedule_optimizations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_scheduling_rules_garage_id" ON "ai_scheduling_rules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_service_suggestions_related_job_card_id" ON "ai_service_suggestions" ("related_job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_service_suggestions_vehicle_id" ON "ai_service_suggestions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_video_analysis_appointment_id" ON "ai_video_analysis" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_video_analysis_customer_id" ON "ai_video_analysis" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_video_analysis_vehicle_id" ON "ai_video_analysis" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointment_reminder_logs_appointment_id" ON "appointment_reminder_logs" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointment_reminder_logs_customer_id" ON "appointment_reminder_logs" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointment_reminder_logs_garage_id" ON "appointment_reminder_logs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_appointment_id" ON "appointment_reminders" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointment_status_history_appointment_id" ON "appointment_status_history" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointment_status_history_changed_by" ON "appointment_status_history" ("changed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_assigned_to" ON "appointments" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_branch_id" ON "appointments" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_created_by" ON "appointments" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_customer_id" ON "appointments" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_appointments_garage_id" ON "appointments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_assets_garage_id" ON "ar_assets" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_assets_uploaded_by" ON "ar_assets" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_device_pairings_garage_id" ON "ar_device_pairings" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_device_pairings_technician_id" ON "ar_device_pairings" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_guide_sessions_guide_id" ON "ar_guide_sessions" ("guide_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_guide_sessions_job_card_id" ON "ar_guide_sessions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_guide_sessions_technician_id" ON "ar_guide_sessions" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_repair_guides_created_by" ON "ar_repair_guides" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_repair_guides_garage_id" ON "ar_repair_guides" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_session_logs_garage_id" ON "ar_session_logs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_session_logs_instruction_id" ON "ar_session_logs" ("instruction_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_session_logs_job_card_id" ON "ar_session_logs" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_session_logs_technician_id" ON "ar_session_logs" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_work_instructions_created_by" ON "ar_work_instructions" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ar_work_instructions_garage_id" ON "ar_work_instructions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_history_ai_recommendation_id" ON "assignment_history" ("ai_recommendation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_history_assigned_by" ON "assignment_history" ("assigned_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_history_garage_id" ON "assignment_history" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_history_job_card_id" ON "assignment_history" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_history_new_technician_id" ON "assignment_history" ("new_technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_history_previous_technician_id" ON "assignment_history" ("previous_technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_rules_created_by" ON "assignment_rules" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assignment_rules_garage_id" ON "assignment_rules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_garage_id" ON "audit_logs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auto_reorder_history_part_id" ON "auto_reorder_history" ("part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auto_reorder_history_purchase_order_id" ON "auto_reorder_history" ("purchase_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auto_reorder_history_rule_id" ON "auto_reorder_history" ("rule_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auto_reorder_rules_garage_id" ON "auto_reorder_rules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auto_reorder_rules_part_id" ON "auto_reorder_rules" ("part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_autonomous_robots_garage_id" ON "autonomous_robots" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_created_by" ON "backup_jobs" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_backup_jobs_garage_id" ON "backup_jobs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_barcode_scans_garage_id" ON "barcode_scans" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_barcode_scans_part_id" ON "barcode_scans" ("part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_barcode_scans_scanned_by" ON "barcode_scans" ("scanned_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_barcode_scans_tool_id" ON "barcode_scans" ("tool_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_barcode_scans_vehicle_id" ON "barcode_scans" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_occupancy_sessions_bay_id" ON "bay_occupancy_sessions" ("bay_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_occupancy_sessions_garage_id" ON "bay_occupancy_sessions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_occupancy_sessions_job_card_id" ON "bay_occupancy_sessions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_occupancy_sessions_technician_id" ON "bay_occupancy_sessions" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_occupancy_sessions_vehicle_id" ON "bay_occupancy_sessions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_telemetry_events_bay_id" ON "bay_telemetry_events" ("bay_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bay_telemetry_events_garage_id" ON "bay_telemetry_events" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_biometric_logs_profile_id" ON "biometric_logs" ("profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blockchain_records_garage_id" ON "blockchain_records" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blockchain_records_vehicle_id" ON "blockchain_records" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_garage_id" ON "branches" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_business_heatmaps_garage_id" ON "business_heatmaps" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_activity_log_appointment_id" ON "calendar_activity_log" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_activity_log_garage_id" ON "calendar_activity_log" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_activity_log_performed_by" ON "calendar_activity_log" ("performed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_appointment_id" ON "calendar_appointments" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_bay_id" ON "calendar_appointments" ("bay_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_created_by" ON "calendar_appointments" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_customer_id" ON "calendar_appointments" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_garage_id" ON "calendar_appointments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_job_card_id" ON "calendar_appointments" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_locked_by" ON "calendar_appointments" ("locked_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_resource_id" ON "calendar_appointments" ("resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_appointments_technician_id" ON "calendar_appointments" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_conflicts_appointment_1_id" ON "calendar_conflicts" ("appointment_1_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_conflicts_appointment_2_id" ON "calendar_conflicts" ("appointment_2_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_conflicts_garage_id" ON "calendar_conflicts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_conflicts_resolved_by" ON "calendar_conflicts" ("resolved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_conflicts_resource_id" ON "calendar_conflicts" ("resource_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_events_created_by" ON "calendar_events" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_events_garage_id" ON "calendar_events" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calibration_reminders_calibration_id" ON "calibration_reminders" ("calibration_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_notes_author_user_id" ON "call_notes" ("author_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_sessions_outcome_code_id" ON "call_sessions" ("outcome_code_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_call_sessions_vehicle_id" ON "call_sessions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_camera_recordings_camera_id" ON "camera_recordings" ("camera_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_camera_recordings_vehicle_id" ON "camera_recordings" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_recipients_campaign_id" ON "campaign_recipients" ("campaign_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_recipients_customer_id" ON "campaign_recipients" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_carbon_credits_garage_id" ON "carbon_credits" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_carbon_credits_traded_to" ON "carbon_credits" ("traded_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_carbon_emissions_garage_id" ON "carbon_emissions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_carbon_emissions_offset_by" ON "carbon_emissions" ("offset_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_carbon_emissions_verified_by" ON "carbon_emissions" ("verified_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_certification_attempts_certification_id" ON "certification_attempts" ("certification_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_certification_attempts_module_id" ON "certification_attempts" ("module_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_certification_attempts_user_id" ON "certification_attempts" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_attachments_message_id" ON "chat_attachments" ("message_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_attachments_uploaded_by" ON "chat_attachments" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_conversations_created_by" ON "chat_conversations" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_conversations_garage_id" ON "chat_conversations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_message_reactions_message_id" ON "chat_message_reactions" ("message_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_message_reactions_user_id" ON "chat_message_reactions" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_conversation_id" ON "chat_messages" ("conversation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_reply_to_id" ON "chat_messages" ("reply_to_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_messages_sender_id" ON "chat_messages" ("sender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_participants_conversation_id" ON "chat_participants" ("conversation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_participants_user_id" ON "chat_participants" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collaboration_experts_user_id" ON "collaboration_experts" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collaboration_sessions_expert_user_id" ON "collaboration_sessions" ("expert_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collaboration_sessions_garage_id" ON "collaboration_sessions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collaboration_sessions_host_user_id" ON "collaboration_sessions" ("host_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collaboration_sessions_job_card_id" ON "collaboration_sessions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_commission_rules_garage_id" ON "commission_rules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_commissions_commission_rule_id" ON "commissions" ("commission_rule_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_commissions_garage_id" ON "commissions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_commissions_invoice_id" ON "commissions" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_commissions_job_card_id" ON "commissions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_commissions_technician_id" ON "commissions" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_audits_auditor" ON "compliance_audits" ("auditor");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_audits_garage_id" ON "compliance_audits" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_audits_policy_id" ON "compliance_audits" ("policy_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_policies_garage_id" ON "compliance_policies" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_tasks_assigned_to" ON "compliance_tasks" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_tasks_audit_id" ON "compliance_tasks" ("audit_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_tasks_garage_id" ON "compliance_tasks" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compliance_tasks_policy_id" ON "compliance_tasks" ("policy_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_events_contract_id" ON "contract_events" ("contract_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_renewals_contract_id" ON "contract_renewals" ("contract_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_renewals_created_by" ON "contract_renewals" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_renewals_renewed_contract_id" ON "contract_renewals" ("renewed_contract_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_sla_metrics_contract_id" ON "contract_sla_metrics" ("contract_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_sla_metrics_job_card_id" ON "contract_sla_metrics" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_utilization_contract_id" ON "contract_utilization" ("contract_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_utilization_job_card_id" ON "contract_utilization" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contract_utilization_vehicle_id" ON "contract_utilization" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_corrective_actions_assigned_to" ON "corrective_actions" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_corrective_actions_non_conformance_id" ON "corrective_actions" ("non_conformance_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_corrective_actions_verified_by" ON "corrective_actions" ("verified_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cross_border_docs_fulfillment_order_id" ON "cross_border_docs" ("fulfillment_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_custom_reports_created_by" ON "custom_reports" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_custom_reports_garage_id" ON "custom_reports" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_loyalty_accounts_customer_id" ON "customer_loyalty_accounts" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_loyalty_accounts_program_id" ON "customer_loyalty_accounts" ("program_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_ltv_analysis_customer_id" ON "customer_ltv_analysis" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_ltv_analysis_garage_id" ON "customer_ltv_analysis" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_notes_created_by" ON "customer_notes" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_notes_customer_id" ON "customer_notes" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_portal_sessions_customer_id" ON "customer_portal_sessions" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_portal_settings_garage_id" ON "customer_portal_settings" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_referrals_program_id" ON "customer_referrals" ("program_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_referrals_referee_id" ON "customer_referrals" ("referee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_referrals_referrer_id" ON "customer_referrals" ("referrer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_reviews_customer_id" ON "customer_reviews" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_reviews_garage_id" ON "customer_reviews" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_reviews_job_card_id" ON "customer_reviews" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customer_reviews_responded_by" ON "customer_reviews" ("responded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboard_widgets_garage_id" ON "dashboard_widgets" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboard_widgets_user_id" ON "dashboard_widgets" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deliveries_created_by" ON "deliveries" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deliveries_garage_id" ON "deliveries" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deliveries_purchase_order_id" ON "deliveries" ("purchase_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deliveries_supplier_id" ON "deliveries" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_delivery_items_delivery_id" ON "delivery_items" ("delivery_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_delivery_timeline_delivery_id" ON "delivery_timeline" ("delivery_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_demand_forecasts_garage_id" ON "demand_forecasts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_device_assignments_device_id" ON "device_assignments" ("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_device_assignments_technician_id" ON "device_assignments" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_device_assignments_vehicle_id" ON "device_assignments" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_diagnostic_reports_session_id" ON "diagnostic_reports" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_digital_signatures_garage_id" ON "digital_signatures" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_digital_signatures_signed_by" ON "digital_signatures" ("signed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_digital_walkarounds_job_card_id" ON "digital_walkarounds" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_digital_walkarounds_technician_id" ON "digital_walkarounds" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_digital_walkarounds_vehicle_id" ON "digital_walkarounds" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_usage_customer_id" ON "discount_usage" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_usage_discount_id" ON "discount_usage" ("discount_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_usage_estimate_id" ON "discount_usage" ("estimate_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discount_usage_invoice_id" ON "discount_usage" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discounts_promotions_created_by" ON "discounts_promotions" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_discounts_promotions_garage_id" ON "discounts_promotions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_document_access_log_accessed_by" ON "document_access_log" ("accessed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_document_access_log_document_id" ON "document_access_log" ("document_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_document_categories_garage_id" ON "document_categories" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_category_id" ON "documents" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_garage_id" ON "documents" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_documents_uploaded_by" ON "documents" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_fleets_garage_id" ON "drone_fleets" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_inspections_customer_id" ON "drone_inspections" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_inspections_garage_id" ON "drone_inspections" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_inspections_pilot_id" ON "drone_inspections" ("pilot_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_inspections_vehicle_id" ON "drone_inspections" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_media_inspection_id" ON "drone_media" ("inspection_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_missions_drone_id" ON "drone_missions" ("drone_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_missions_pilot_id" ON "drone_missions" ("pilot_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_drone_missions_vehicle_id" ON "drone_missions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dynamic_pricing_suggestions_accepted_by" ON "dynamic_pricing_suggestions" ("accepted_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dynamic_pricing_suggestions_garage_id" ON "dynamic_pricing_suggestions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dynamic_pricing_suggestions_job_card_id" ON "dynamic_pricing_suggestions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dynamic_pricing_suggestions_vehicle_id" ON "dynamic_pricing_suggestions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_edge_devices_garage_id" ON "edge_devices" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_edge_diagnostics_device_id" ON "edge_diagnostics" ("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_edge_diagnostics_performed_by" ON "edge_diagnostics" ("performed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_edge_diagnostics_vehicle_id" ON "edge_diagnostics" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_campaigns_created_by" ON "email_campaigns" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_campaigns_garage_id" ON "email_campaigns" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_templates_garage_id" ON "email_templates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employee_attendance_approved_by" ON "employee_attendance" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employee_attendance_employee_id" ON "employee_attendance" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employee_attendance_garage_id" ON "employee_attendance" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employee_trainings_employee_id" ON "employee_trainings" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employee_trainings_garage_id" ON "employee_trainings" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employee_trainings_training_id" ON "employee_trainings" ("training_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entitlement_assignments_license_id" ON "entitlement_assignments" ("license_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entitlement_assignments_user_id" ON "entitlement_assignments" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_environmental_compliance_garage_id" ON "environmental_compliance" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_equipment_calibration_garage_id" ON "equipment_calibration" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_equipment_calibration_tool_id" ON "equipment_calibration" ("tool_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimate_items_discount_id" ON "estimate_items" ("discount_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimate_items_estimate_id" ON "estimate_items" ("estimate_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimates_converted_to_invoice_id" ON "estimates" ("converted_to_invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimates_converted_to_job_card_id" ON "estimates" ("converted_to_job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimates_created_by" ON "estimates" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimates_customer_id" ON "estimates" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimates_garage_id" ON "estimates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_estimates_vehicle_id" ON "estimates" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ev_charging_stations_garage_id" ON "ev_charging_stations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expense_categories_garage_id" ON "expense_categories" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expenses_approved_by" ON "expenses" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expenses_category_id" ON "expenses" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expenses_garage_id" ON "expenses" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expenses_user_id" ON "expenses" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_export_jobs_garage_id" ON "export_jobs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_export_jobs_user_id" ON "export_jobs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feature_flags_garage_id" ON "feature_flags" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_contracts_created_by" ON "fleet_contracts" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_contracts_fleet_group_id" ON "fleet_contracts" ("fleet_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_groups_customer_id" ON "fleet_groups" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_groups_garage_id" ON "fleet_groups" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_maintenance_schedules_fleet_group_id" ON "fleet_maintenance_schedules" ("fleet_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_pricing_tiers_fleet_group_id" ON "fleet_pricing_tiers" ("fleet_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_pricing_tiers_garage_id" ON "fleet_pricing_tiers" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_routes_created_by" ON "fleet_routes" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_routes_driver_id" ON "fleet_routes" ("driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_routes_garage_id" ON "fleet_routes" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_routes_vehicle_id" ON "fleet_routes" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_vehicles_fleet_group_id" ON "fleet_vehicles" ("fleet_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fleet_vehicles_vehicle_id" ON "fleet_vehicles" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_branches_branch_id" ON "franchise_branches" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_branches_franchise_group_id" ON "franchise_branches" ("franchise_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_branches_franchisee_owner_id" ON "franchise_branches" ("franchisee_owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_contracts_branch_id" ON "franchise_contracts" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_contracts_franchise_group_id" ON "franchise_contracts" ("franchise_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_kpis_branch_id" ON "franchise_kpis" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_franchise_roles_franchise_group_id" ON "franchise_roles" ("franchise_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fraud_detection_cases_garage_id" ON "fraud_detection_cases" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fraud_detection_cases_investigator" ON "fraud_detection_cases" ("investigator");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fraud_detection_rules_created_by" ON "fraud_detection_rules" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fulfillment_orders_branch_id" ON "fulfillment_orders" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_fulfillment_orders_partner_id" ON "fulfillment_orders" ("partner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gamification_badge_awards_badge_id" ON "gamification_badge_awards" ("badge_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gamification_event_definitions_badge_id" ON "gamification_event_definitions" ("badge_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_garage_applications_provisioned_garage_id" ON "garage_applications" ("provisioned_garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_garage_applications_provisioned_user_id" ON "garage_applications" ("provisioned_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_garage_applications_reviewed_by" ON "garage_applications" ("reviewed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_garages_saas_plan_id" ON "garages" ("saas_plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gate_passes_garage_id" ON "gate_passes" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gate_passes_invoice_id" ON "gate_passes" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gdpr_data_requests_garage_id" ON "gdpr_data_requests" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gdpr_data_requests_user_id" ON "gdpr_data_requests" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_geofence_alert_recipients_user_id" ON "geofence_alert_recipients" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_geofence_events_driver_id" ON "geofence_events" ("driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_geofence_zone_vehicles_vehicle_id" ON "geofence_zone_vehicles" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_geofence_zones_created_by" ON "geofence_zones" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gmb_posts_profile_id" ON "gmb_posts" ("profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gmb_reviews_profile_id" ON "gmb_reviews" ("profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_google_business_profiles_garage_id" ON "google_business_profiles" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_green_energy_assets_garage_id" ON "green_energy_assets" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_holographic_guides_garage_id" ON "holographic_guides" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_holographic_guides_service_id" ON "holographic_guides" ("service_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_holographic_sessions_guide_id" ON "holographic_sessions" ("guide_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_holographic_sessions_job_card_id" ON "holographic_sessions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_holographic_sessions_technician_id" ON "holographic_sessions" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_announcements_created_by" ON "hr_announcements" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_announcements_garage_id" ON "hr_announcements" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_announcements_target_department_id" ON "hr_announcements" ("target_department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_benefit_enrollments_benefit_plan_id" ON "hr_benefit_enrollments" ("benefit_plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_benefit_enrollments_employee_id" ON "hr_benefit_enrollments" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_benefit_plans_garage_id" ON "hr_benefit_plans" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_candidates_assigned_to" ON "hr_candidates" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_candidates_job_posting_id" ON "hr_candidates" ("job_posting_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_candidates_referred_by" ON "hr_candidates" ("referred_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_contracts_employee_id" ON "hr_contracts" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_departments_garage_id" ON "hr_departments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_departments_manager_id" ON "hr_departments" ("manager_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_documents_employee_id" ON "hr_documents" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_documents_uploaded_by" ON "hr_documents" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_documents_verified_by" ON "hr_documents" ("verified_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_employee_profiles_department_id" ON "hr_employee_profiles" ("department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_employee_profiles_garage_id" ON "hr_employee_profiles" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_employee_profiles_manager_id" ON "hr_employee_profiles" ("manager_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_employee_profiles_position_id" ON "hr_employee_profiles" ("position_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_employee_profiles_user_id" ON "hr_employee_profiles" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_interviews_candidate_id" ON "hr_interviews" ("candidate_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_interviews_created_by" ON "hr_interviews" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_job_postings_created_by" ON "hr_job_postings" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_job_postings_department_id" ON "hr_job_postings" ("department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_job_postings_garage_id" ON "hr_job_postings" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_job_postings_position_id" ON "hr_job_postings" ("position_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_balances_employee_id" ON "hr_leave_balances" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_balances_leave_type_id" ON "hr_leave_balances" ("leave_type_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_requests_approved_by" ON "hr_leave_requests" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_requests_employee_id" ON "hr_leave_requests" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_requests_handover_to" ON "hr_leave_requests" ("handover_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_requests_leave_type_id" ON "hr_leave_requests" ("leave_type_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_leave_types_garage_id" ON "hr_leave_types" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_performance_goals_employee_id" ON "hr_performance_goals" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_performance_goals_review_id" ON "hr_performance_goals" ("review_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_performance_reviews_employee_id" ON "hr_performance_reviews" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_performance_reviews_reviewer_id" ON "hr_performance_reviews" ("reviewer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_positions_department_id" ON "hr_positions" ("department_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_positions_garage_id" ON "hr_positions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_self_service_requests_assigned_to" ON "hr_self_service_requests" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_self_service_requests_employee_id" ON "hr_self_service_requests" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hr_self_service_requests_processed_by" ON "hr_self_service_requests" ("processed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_incident_investigations_incident_id" ON "incident_investigations" ("incident_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_incident_investigations_investigator" ON "incident_investigations" ("investigator");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inspection_templates_created_by" ON "inspection_templates" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inspection_templates_garage_id" ON "inspection_templates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_installments_payment_id" ON "installments" ("payment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_installments_payment_plan_id" ON "installments" ("payment_plan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insurance_claims_customer_id" ON "insurance_claims" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insurance_claims_garage_id" ON "insurance_claims" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insurance_claims_job_card_id" ON "insurance_claims" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insurance_claims_vehicle_id" ON "insurance_claims" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insurance_quotes_customer_vehicle_id" ON "insurance_quotes" ("customer_vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insurance_quotes_offering_id" ON "insurance_quotes" ("offering_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_integration_connections_garage_id" ON "integration_connections" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_integration_sync_logs_connection_id" ON "integration_sync_logs" ("connection_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_integration_sync_logs_garage_id" ON "integration_sync_logs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_audit_trail_branch_id" ON "inventory_audit_trail" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_audit_trail_garage_id" ON "inventory_audit_trail" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_audit_trail_performed_by" ON "inventory_audit_trail" ("performed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_audit_trail_spare_part_id" ON "inventory_audit_trail" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_forecasts_garage_id" ON "inventory_forecasts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_forecasts_part_id" ON "inventory_forecasts" ("part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_approved_by" ON "inventory_transfers" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_completed_by" ON "inventory_transfers" ("completed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_from_branch_id" ON "inventory_transfers" ("from_branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_from_garage_id" ON "inventory_transfers" ("from_garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_requested_by" ON "inventory_transfers" ("requested_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_spare_part_id" ON "inventory_transfers" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_to_branch_id" ON "inventory_transfers" ("to_branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_transfers_to_garage_id" ON "inventory_transfers" ("to_garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoice_items_discount_id" ON "invoice_items" ("discount_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoice_items_invoice_id" ON "invoice_items" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_created_by" ON "invoices" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_customer_id" ON "invoices" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_garage_id" ON "invoices" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_job_card_id" ON "invoices" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_vehicle_id" ON "invoices" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iot_alerts_acknowledged_by" ON "iot_alerts" ("acknowledged_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iot_alerts_job_card_id" ON "iot_alerts" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iot_sensors_vehicle_id" ON "iot_sensors" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_card_parts_job_card_id" ON "job_card_parts" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_card_parts_spare_part_id" ON "job_card_parts" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_card_parts_spare_part_inventory_id" ON "job_card_parts" ("spare_part_inventory_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_cards_assigned_to" ON "job_cards" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_cards_branch_id" ON "job_cards" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_cards_created_by" ON "job_cards" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_cards_garage_id" ON "job_cards" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_tracking_events_created_by" ON "job_tracking_events" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_tracking_events_task_id" ON "job_tracking_events" ("task_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_check_ins_appointment_id" ON "kiosk_check_ins" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_check_ins_customer_id" ON "kiosk_check_ins" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_check_ins_session_id" ON "kiosk_check_ins" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_check_ins_vehicle_id" ON "kiosk_check_ins" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_sessions_customer_id" ON "kiosk_sessions" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_sessions_garage_id" ON "kiosk_sessions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kiosk_sessions_vehicle_id" ON "kiosk_sessions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_knowledge_articles_author" ON "knowledge_articles" ("author");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_knowledge_articles_category_id" ON "knowledge_articles" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leaderboard_snapshots_technician_id" ON "leaderboard_snapshots" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_license_audit_logs_license_id" ON "license_audit_logs" ("license_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_license_audit_logs_user_id" ON "license_audit_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_license_plate_scans_camera_id" ON "license_plate_scans" ("camera_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_license_plate_scans_customer_id" ON "license_plate_scans" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_license_plate_scans_garage_id" ON "license_plate_scans" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_license_plate_scans_vehicle_id" ON "license_plate_scans" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_live_delivery_statuses_delivery_id" ON "live_delivery_statuses" ("delivery_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_reservations_agreement_signature_id" ON "loaner_reservations" ("agreement_signature_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_reservations_created_by" ON "loaner_reservations" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_reservations_customer_id" ON "loaner_reservations" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_reservations_job_card_id" ON "loaner_reservations" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_reservations_loaner_vehicle_id" ON "loaner_reservations" ("loaner_vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_reservations_return_signature_id" ON "loaner_reservations" ("return_signature_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_vehicles_garage_id" ON "loaner_vehicles" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loaner_vehicles_vehicle_id" ON "loaner_vehicles" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_accounts_customer_id" ON "loyalty_accounts" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_accounts_garage_id" ON "loyalty_accounts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_accounts_referred_by" ON "loyalty_accounts" ("referred_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_accounts_tier_id" ON "loyalty_accounts" ("tier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_offers_created_by" ON "loyalty_offers" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_offers_garage_id" ON "loyalty_offers" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_offers_tier_restriction" ON "loyalty_offers" ("tier_restriction");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_program_garage_id" ON "loyalty_program" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_redemptions_account_id" ON "loyalty_redemptions" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_redemptions_related_invoice_id" ON "loyalty_redemptions" ("related_invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_redemptions_reward_id" ON "loyalty_redemptions" ("reward_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_rewards_program_id" ON "loyalty_rewards" ("program_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_tiers_garage_id" ON "loyalty_tiers" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_account_id" ON "loyalty_transactions" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_created_by" ON "loyalty_transactions" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_maintenance_recommendations_rule_id" ON "maintenance_recommendations" ("rule_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_maintenance_schedules_vehicle_id" ON "maintenance_schedules" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_market_pricing_data_garage_id" ON "market_pricing_data" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_accounts_created_by" ON "marketing_accounts" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_accounts_garage_id" ON "marketing_accounts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_accounts_provider_id" ON "marketing_accounts" ("provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_ad_campaigns_account_id" ON "marketing_ad_campaigns" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_ad_campaigns_created_by" ON "marketing_ad_campaigns" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_campaigns_created_by" ON "marketing_campaigns" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_campaigns_garage_id" ON "marketing_campaigns" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_comment_threads_account_id" ON "marketing_comment_threads" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_comment_threads_campaign_id" ON "marketing_comment_threads" ("campaign_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_comments_replied_by" ON "marketing_comments" ("replied_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_comments_thread_id" ON "marketing_comments" ("thread_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_conversations_account_id" ON "marketing_conversations" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_conversations_assigned_to" ON "marketing_conversations" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_conversations_customer_id" ON "marketing_conversations" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_creatives_account_id" ON "marketing_creatives" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_creatives_campaign_id" ON "marketing_creatives" ("campaign_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_creatives_created_by" ON "marketing_creatives" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_messages_conversation_id" ON "marketing_messages" ("conversation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_messages_sent_by" ON "marketing_messages" ("sent_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_notes_account_id" ON "marketing_notes" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_notes_campaign_id" ON "marketing_notes" ("campaign_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_notes_created_by" ON "marketing_notes" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_spend_snapshots_account_id" ON "marketing_spend_snapshots" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_spend_snapshots_campaign_id" ON "marketing_spend_snapshots" ("campaign_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_tasks_account_id" ON "marketing_tasks" ("account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_tasks_assigned_to" ON "marketing_tasks" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_tasks_campaign_id" ON "marketing_tasks" ("campaign_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_tasks_completed_by" ON "marketing_tasks" ("completed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketing_tasks_created_by" ON "marketing_tasks" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_bookings_customer_vehicle_id" ON "marketplace_bookings" ("customer_vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_bookings_service_template_id" ON "marketplace_bookings" ("service_template_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_connections_garage_id" ON "marketplace_connections" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_orders_garage_id" ON "marketplace_orders" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_orders_linked_job_card_id" ON "marketplace_orders" ("linked_job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_marketplace_orders_linked_spare_part" ON "marketplace_orders" ("linked_spare_part");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_attachments_garage_id" ON "media_attachments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_attachments_uploaded_by" ON "media_attachments" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metaverse_showrooms_garage_id" ON "metaverse_showrooms" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metaverse_visits_customer_id" ON "metaverse_visits" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metaverse_visits_showroom_id" ON "metaverse_visits" ("showroom_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mobile_app_sessions_garage_id" ON "mobile_app_sessions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mobile_app_sessions_user_id" ON "mobile_app_sessions" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mobile_devices_garage_id" ON "mobile_devices" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mobile_quick_actions_user_id" ON "mobile_quick_actions" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_neural_diagnostics_garage_id" ON "neural_diagnostics" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_neural_diagnostics_job_card_id" ON "neural_diagnostics" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_neural_diagnostics_vehicle_id" ON "neural_diagnostics" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_neural_training_sessions_garage_id" ON "neural_training_sessions" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_service_requests_approved_by" ON "nlp_service_requests" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_service_requests_customer_id" ON "nlp_service_requests" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_service_requests_garage_id" ON "nlp_service_requests" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_service_requests_job_card_id" ON "nlp_service_requests" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_service_requests_vehicle_id" ON "nlp_service_requests" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_training_data_garage_id" ON "nlp_training_data" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nlp_training_data_validated_by" ON "nlp_training_data" ("validated_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_no_show_tracking_customer_id" ON "no_show_tracking" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_no_show_tracking_garage_id" ON "no_show_tracking" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_no_show_tracking_marked_by" ON "no_show_tracking" ("marked_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_no_show_tracking_rescheduled_appointment_id" ON "no_show_tracking" ("rescheduled_appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_non_conformances_detected_by" ON "non_conformances" ("detected_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_non_conformances_garage_id" ON "non_conformances" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_non_conformances_job_card_id" ON "non_conformances" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notification_schedules_garage_id" ON "notification_schedules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_garage_id" ON "notifications" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_recipient_id" ON "notifications" ("recipient_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_devices_branch_id" ON "obd_devices" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_diagnostic_data_garage_id" ON "obd_diagnostic_data" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_diagnostic_data_job_card_id" ON "obd_diagnostic_data" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_diagnostic_data_vehicle_id" ON "obd_diagnostic_data" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_sessions_device_id" ON "obd_sessions" ("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_sessions_job_card_id" ON "obd_sessions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_sessions_technician_id" ON "obd_sessions" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_obd_sessions_vehicle_id" ON "obd_sessions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ocr_documents_customer_id" ON "ocr_documents" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ocr_documents_invoice_id" ON "ocr_documents" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ocr_documents_uploaded_by" ON "ocr_documents" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ocr_documents_vehicle_id" ON "ocr_documents" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ocr_documents_verified_by" ON "ocr_documents" ("verified_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_products_vendor_catalog_id" ON "oem_products" ("vendor_catalog_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_partner_contracts_partner_id" ON "partner_contracts" ("partner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_3d_models_uploaded_by" ON "parts_3d_models" ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_3d_view_sessions_customer_id" ON "parts_3d_view_sessions" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_3d_view_sessions_model_id" ON "parts_3d_view_sessions" ("model_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_3d_view_sessions_user_id" ON "parts_3d_view_sessions" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_members_garage_id" ON "parts_network_members" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_members_supplier_id" ON "parts_network_members" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_members_user_id" ON "parts_network_members" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_notifications_member_id" ON "parts_network_notifications" ("member_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_orders_buyer_id" ON "parts_network_orders" ("buyer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_orders_request_id" ON "parts_network_orders" ("request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_orders_response_id" ON "parts_network_orders" ("response_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_network_orders_seller_id" ON "parts_network_orders" ("seller_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_messages_receiver_id" ON "parts_quotation_messages" ("receiver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_messages_request_id" ON "parts_quotation_messages" ("request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_messages_response_id" ON "parts_quotation_messages" ("response_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_messages_sender_id" ON "parts_quotation_messages" ("sender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_requests_garage_id" ON "parts_quotation_requests" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_requests_requester_id" ON "parts_quotation_requests" ("requester_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_responses_request_id" ON "parts_quotation_responses" ("request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_quotation_responses_responder_id" ON "parts_quotation_responses" ("responder_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pay_periods_garage_id" ON "pay_periods" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_plans_created_by" ON "payment_plans" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_plans_invoice_id" ON "payment_plans" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_created_by" ON "payments" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_invoice_id" ON "payments" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_employees_garage_id" ON "payroll_employees" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_employees_user_id" ON "payroll_employees" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_entries_employee_id" ON "payroll_entries" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_entries_period_id" ON "payroll_entries" ("period_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_periods_garage_id" ON "payroll_periods" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_periods_processed_by" ON "payroll_periods" ("processed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_runs_employee_id" ON "payroll_runs" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_runs_pay_period_id" ON "payroll_runs" ("pay_period_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_performance_reviews_employee_id" ON "performance_reviews" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_performance_reviews_garage_id" ON "performance_reviews" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_performance_reviews_reviewer_id" ON "performance_reviews" ("reviewer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_permission_overrides_created_by" ON "permission_overrides" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_permission_overrides_garage_id" ON "permission_overrides" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_permission_overrides_user_id" ON "permission_overrides" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_history_changed_by" ON "pricing_history" ("changed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_history_garage_id" ON "pricing_history" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_history_spare_part_id" ON "pricing_history" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_optimization_approved_by" ON "pricing_optimization" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_optimization_garage_id" ON "pricing_optimization" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_rules_created_by" ON "pricing_rules" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pricing_rules_garage_id" ON "pricing_rules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profit_analysis_garage_id" ON "profit_analysis" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_provider_order_items_offering_id" ON "provider_order_items" ("offering_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_provider_order_items_order_id" ON "provider_order_items" ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_provider_reviews_customer_id" ON "provider_reviews" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_order_items_purchase_order_id" ON "purchase_order_items" ("purchase_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_approved_by" ON "purchase_orders" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_created_by" ON "purchase_orders" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_garage_id" ON "purchase_orders" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_supplier_id" ON "purchase_orders" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_task_parts_task_id" ON "purchase_task_parts" ("task_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_tasks_assigned_to" ON "purchase_tasks" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_tasks_garage_id" ON "purchase_tasks" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_tasks_source_user_id" ON "purchase_tasks" ("source_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_notification_tokens_garage_id" ON "push_notification_tokens" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_notification_tokens_user_id" ON "push_notification_tokens" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_notifications_customer_id" ON "push_notifications" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_notifications_garage_id" ON "push_notifications" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_notifications_subscription_id" ON "push_notifications" ("subscription_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_notifications_user_id" ON "push_notifications" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_subscriptions_customer_id" ON "push_subscriptions" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_subscriptions_user_id" ON "push_subscriptions" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qr_code_tokens_appointment_id" ON "qr_code_tokens" ("appointment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qr_code_tokens_customer_id" ON "qr_code_tokens" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qr_code_tokens_garage_id" ON "qr_code_tokens" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qr_code_tokens_vehicle_id" ON "qr_code_tokens" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qr_scan_logs_qr_code_id" ON "qr_scan_logs" ("qr_code_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qr_scan_logs_scanned_by" ON "qr_scan_logs" ("scanned_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quality_checklists_garage_id" ON "quality_checklists" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quantum_encryption_keys_garage_id" ON "quantum_encryption_keys" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quantum_secure_messages_encryption_key_id" ON "quantum_secure_messages" ("encryption_key_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quantum_secure_messages_garage_id" ON "quantum_secure_messages" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quantum_secure_messages_recipient_id" ON "quantum_secure_messages" ("recipient_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quantum_secure_messages_sender_id" ON "quantum_secure_messages" ("sender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quotation_items_quotation_id" ON "quotation_items" ("quotation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quotation_requests_created_by" ON "quotation_requests" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quotation_requests_garage_id" ON "quotation_requests" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quotation_requests_task_id" ON "quotation_requests" ("task_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_realtime_streams_device_id" ON "realtime_streams" ("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recurring_appointments_assigned_to" ON "recurring_appointments" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recurring_appointments_created_by" ON "recurring_appointments" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recurring_appointments_customer_id" ON "recurring_appointments" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recurring_appointments_garage_id" ON "recurring_appointments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recycled_parts_garage_id" ON "recycled_parts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recycled_parts_original_part_id" ON "recycled_parts" ("original_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recycled_parts_sold_to" ON "recycled_parts" ("sold_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_recycled_parts_source_vehicle_id" ON "recycled_parts" ("source_vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referral_programs_garage_id" ON "referral_programs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_approved_by" ON "refunds" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_customer_id" ON "refunds" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_garage_id" ON "refunds" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_invoice_id" ON "refunds" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_payment_id" ON "refunds" ("payment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_processed_by" ON "refunds" ("processed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refunds_requested_by" ON "refunds" ("requested_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reorder_settings_branch_id" ON "reorder_settings" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reorder_settings_created_by" ON "reorder_settings" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reorder_settings_garage_id" ON "reorder_settings" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reorder_settings_spare_part_id" ON "reorder_settings" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reorder_settings_supplier_id" ON "reorder_settings" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replenishment_order_items_order_id" ON "replenishment_order_items" ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replenishment_order_items_part_id" ON "replenishment_order_items" ("part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replenishment_orders_approved_by" ON "replenishment_orders" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replenishment_orders_garage_id" ON "replenishment_orders" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replenishment_orders_rule_id" ON "replenishment_orders" ("rule_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replenishment_orders_supplier_id" ON "replenishment_orders" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revenue_sharing_rules_franchise_group_id" ON "revenue_sharing_rules" ("franchise_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_review_platform_integrations_garage_id" ON "review_platform_integrations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rl_learning_episodes_garage_id" ON "rl_learning_episodes" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rl_parts_optimizations_garage_id" ON "rl_parts_optimizations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rl_parts_optimizations_part_id" ON "rl_parts_optimizations" ("part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_robot_tasks_assigned_by" ON "robot_tasks" ("assigned_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_robot_tasks_job_card_id" ON "robot_tasks" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_robot_tasks_robot_id" ON "robot_tasks" ("robot_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_role_permissions_permission_id" ON "role_permissions" ("permission_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_role_permissions_role_id" ON "role_permissions" ("role_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_route_checkpoints_completed_by" ON "route_checkpoints" ("completed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_route_checkpoints_customer_id" ON "route_checkpoints" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_route_checkpoints_job_card_id" ON "route_checkpoints" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routing_optimizations_assigned_driver" ON "routing_optimizations" ("assigned_driver");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_routing_optimizations_garage_id" ON "routing_optimizations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_safety_incidents_garage_id" ON "safety_incidents" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_safety_incidents_reported_by" ON "safety_incidents" ("reported_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_satellite_connections_garage_id" ON "satellite_connections" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_satellite_usage_logs_connection_id" ON "satellite_usage_logs" ("connection_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_satellite_usage_logs_user_id" ON "satellite_usage_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_saved_filter_presets_garage_id" ON "saved_filter_presets" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_saved_filter_presets_user_id" ON "saved_filter_presets" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scheduling_optimizations_garage_id" ON "scheduling_optimizations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seasonal_tire_storage_customer_id" ON "seasonal_tire_storage" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seasonal_tire_storage_garage_id" ON "seasonal_tire_storage" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_seasonal_tire_storage_vehicle_id" ON "seasonal_tire_storage" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_security_cameras_garage_id" ON "security_cameras" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_bays_branch_id" ON "service_bays" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_bays_current_job_card_id" ON "service_bays" ("current_job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_bays_current_technician_id" ON "service_bays" ("current_technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_bays_current_vehicle_id" ON "service_bays" ("current_vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_bays_garage_id" ON "service_bays" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_chat_messages_job_card_id" ON "service_chat_messages" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_chat_messages_sender_id" ON "service_chat_messages" ("sender_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_feedback_customer_id" ON "service_feedback" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_feedback_vehicle_id" ON "service_feedback" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_reminder_templates_garage_id" ON "service_reminder_templates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_reminders_customer_id" ON "service_reminders" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_reminders_maintenance_schedule_id" ON "service_reminders" ("maintenance_schedule_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_reminders_vehicle_id" ON "service_reminders" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_reviews_customer_id" ON "service_reviews" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_reviews_job_card_id" ON "service_reviews" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_signatures_customer_id" ON "service_signatures" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_signatures_job_card_id" ON "service_signatures" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_templates_garage_id" ON "service_templates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_tracking_updates_job_card_id" ON "service_tracking_updates" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_tracking_updates_technician_id" ON "service_tracking_updates" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_service_type_profitability_garage_id" ON "service_type_profitability" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_session_logs_user_id" ON "session_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shift_assignments_created_by" ON "shift_assignments" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shift_assignments_employee_id" ON "shift_assignments" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shift_assignments_garage_id" ON "shift_assignments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shift_assignments_shift_template_id" ON "shift_assignments" ("shift_template_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shift_templates_garage_id" ON "shift_templates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipment_events_fulfillment_order_id" ON "shipment_events" ("fulfillment_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_signage_content_display_id" ON "signage_content" ("display_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_signage_displays_garage_id" ON "signage_displays" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_smart_contracts_garage_id" ON "smart_contracts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_posts_created_by" ON "social_posts" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_social_posts_garage_id" ON "social_posts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spare_part_inventories_branch_id" ON "spare_part_inventories" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spare_part_inventories_garage_id" ON "spare_part_inventories" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spare_part_inventories_spare_part_id" ON "spare_part_inventories" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spare_parts_created_by" ON "spare_parts" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spatial_diagnostic_sessions_job_card_id" ON "spatial_diagnostic_sessions" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spatial_diagnostic_sessions_technician_id" ON "spatial_diagnostic_sessions" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spatial_diagnostic_sessions_vehicle_id" ON "spatial_diagnostic_sessions" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spatial_diagnostic_sessions_workstation_id" ON "spatial_diagnostic_sessions" ("workstation_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spatial_workstations_assigned_technician" ON "spatial_workstations" ("assigned_technician");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_spatial_workstations_garage_id" ON "spatial_workstations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_alerts_acknowledged_by" ON "stock_alerts" ("acknowledged_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_alerts_branch_id" ON "stock_alerts" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_alerts_garage_id" ON "stock_alerts" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_alerts_spare_part_id" ON "stock_alerts" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_facilities_garage_id" ON "storage_facilities" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_licenses_branch_id" ON "subscription_licenses" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_licenses_oem_product_id" ON "subscription_licenses" ("oem_product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_requests_requested_by" ON "subscription_requests" ("requested_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_requests_reviewed_by" ON "subscription_requests" ("reviewed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_parts_availability_spare_part_id" ON "supplier_parts_availability" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_payments_created_by" ON "supplier_payments" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_payments_garage_id" ON "supplier_payments" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_payments_purchase_order_id" ON "supplier_payments" ("purchase_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_payments_supplier_id" ON "supplier_payments" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_performance_supplier_id" ON "supplier_performance" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_price_list_spare_part_id" ON "supplier_price_list" ("spare_part_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_price_list_supplier_id" ON "supplier_price_list" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_quotations_quotation_request_id" ON "supplier_quotations" ("quotation_request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_supplier_quotations_supplier_id" ON "supplier_quotations" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_suppliers_garage_id" ON "suppliers" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_support_ticket_events_ticket_id" ON "support_ticket_events" ("ticket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_support_ticket_events_user_id" ON "support_ticket_events" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_support_tickets_assigned_to" ON "support_tickets" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_support_tickets_created_by" ON "support_tickets" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_support_tickets_garage_id" ON "support_tickets" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sustainability_metrics_garage_id" ON "sustainability_metrics" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sustainability_metrics_verified_by" ON "sustainability_metrics" ("verified_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_task_assignments_assigned_by" ON "task_assignments" ("assigned_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_task_assignments_assigned_to" ON "task_assignments" ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_task_assignments_job_card_id" ON "task_assignments" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_task_progress_logs_task_id" ON "task_progress_logs" ("task_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_task_progress_logs_user_id" ON "task_progress_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tax_configurations_created_by" ON "tax_configurations" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tax_configurations_garage_id" ON "tax_configurations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_technician_availability_garage_id" ON "technician_availability" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_technician_availability_technician_id" ON "technician_availability" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_technician_performance_stream_job_card_id" ON "technician_performance_stream" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telematics_alerts_resolved_by" ON "telematics_alerts" ("resolved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telematics_alerts_vehicle_id" ON "telematics_alerts" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telematics_feeds_device_id" ON "telematics_feeds" ("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telematics_feeds_vehicle_id" ON "telematics_feeds" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_time_clock_entries_approved_by" ON "time_clock_entries" ("approved_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_time_clock_entries_employee_id" ON "time_clock_entries" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_time_clock_entries_garage_id" ON "time_clock_entries" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_timezone_rules_branch_id" ON "timezone_rules" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_inventory_garage_id" ON "tire_inventory" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_recommendations_converted_to_job_card_id" ON "tire_recommendations" ("converted_to_job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_recommendations_customer_id" ON "tire_recommendations" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_recommendations_garage_id" ON "tire_recommendations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_recommendations_technician_id" ON "tire_recommendations" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_recommendations_vehicle_id" ON "tire_recommendations" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_rotation_schedules_customer_id" ON "tire_rotation_schedules" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_rotation_schedules_garage_id" ON "tire_rotation_schedules" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_rotation_schedules_last_service_record_id" ON "tire_rotation_schedules" ("last_service_record_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_rotation_schedules_vehicle_id" ON "tire_rotation_schedules" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_service_records_customer_id" ON "tire_service_records" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_service_records_garage_id" ON "tire_service_records" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_service_records_job_card_id" ON "tire_service_records" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_service_records_technician_id" ON "tire_service_records" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_service_records_tire_inventory_id" ON "tire_service_records" ("tire_inventory_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tire_service_records_vehicle_id" ON "tire_service_records" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_availability_branch_id" ON "tool_availability" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_availability_garage_id" ON "tool_availability" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_availability_tool_id" ON "tool_availability" ("tool_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_usage_logs_job_card_id" ON "tool_usage_logs" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_usage_logs_task_id" ON "tool_usage_logs" ("task_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_usage_logs_tool_id" ON "tool_usage_logs" ("tool_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tool_usage_logs_user_id" ON "tool_usage_logs" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tools_created_by" ON "tools" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tow_trucks_current_driver_id" ON "tow_trucks" ("current_driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tow_trucks_garage_id" ON "tow_trucks" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_jobs_assigned_driver_id" ON "towing_jobs" ("assigned_driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_jobs_customer_id" ON "towing_jobs" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_jobs_garage_id" ON "towing_jobs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_jobs_vehicle_id" ON "towing_jobs" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_requests_assigned_driver_id" ON "towing_requests" ("assigned_driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_requests_customer_id" ON "towing_requests" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_requests_garage_id" ON "towing_requests" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_towing_requests_vehicle_id" ON "towing_requests" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trainings_garage_id" ON "trainings" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_translation_resources_locale_id" ON "translation_resources" ("locale_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twin_simulations_performed_by" ON "twin_simulations" ("performed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twin_simulations_twin_id" ON "twin_simulations" ("twin_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_consents_user_id" ON "user_consents" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_role_branch_branch_id" ON "user_role_branch" ("branch_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_role_branch_role_id" ON "user_role_branch" ("role_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_role_branch_user_id" ON "user_role_branch" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_garage_id" ON "users" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_entry_logs_customer_id" ON "vehicle_entry_logs" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_entry_logs_entry_scan_id" ON "vehicle_entry_logs" ("entry_scan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_entry_logs_exit_scan_id" ON "vehicle_entry_logs" ("exit_scan_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_entry_logs_garage_id" ON "vehicle_entry_logs" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_entry_logs_vehicle_id" ON "vehicle_entry_logs" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_customer_id" ON "vehicle_inspections" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_customer_signature_id" ON "vehicle_inspections" ("customer_signature_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_estimate_id" ON "vehicle_inspections" ("estimate_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_garage_id" ON "vehicle_inspections" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_inspector_id" ON "vehicle_inspections" ("inspector_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_job_card_id" ON "vehicle_inspections" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_template_id" ON "vehicle_inspections" ("template_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_inspections_vehicle_id" ON "vehicle_inspections" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_location_history_driver_id" ON "vehicle_location_history" ("driver_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_location_history_job_card_id" ON "vehicle_location_history" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_pricing_factors_garage_id" ON "vehicle_pricing_factors" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_service_history_job_card_id" ON "vehicle_service_history" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_service_history_performed_by" ON "vehicle_service_history" ("performed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_service_history_vehicle_id" ON "vehicle_service_history" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_storage_assignments_customer_id" ON "vehicle_storage_assignments" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_storage_assignments_facility_id" ON "vehicle_storage_assignments" ("facility_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_storage_assignments_vehicle_id" ON "vehicle_storage_assignments" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_tracking_garage_id" ON "vehicle_tracking" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_tracking_vehicle_id" ON "vehicle_tracking" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_tracking_history_vehicle_id" ON "vehicle_tracking_history" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicles_customer_id" ON "vehicles" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicles_garage_id" ON "vehicles" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_consultations_customer_id" ON "video_consultations" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_consultations_garage_id" ON "video_consultations" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_consultations_job_card_id" ON "video_consultations" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_consultations_technician_id" ON "video_consultations" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_estimates_customer_id" ON "video_estimates" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_estimates_garage_id" ON "video_estimates" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_estimates_technician_id" ON "video_estimates" ("technician_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_video_estimates_vehicle_id" ON "video_estimates" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vision_defects_quality_check_id" ON "vision_defects" ("quality_check_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vision_quality_checks_garage_id" ON "vision_quality_checks" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vision_quality_checks_inspector_id" ON "vision_quality_checks" ("inspector_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vision_quality_checks_job_card_id" ON "vision_quality_checks" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vision_quality_checks_vehicle_id" ON "vision_quality_checks" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_voice_commands_user_id" ON "voice_commands" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warehouse_nodes_partner_id" ON "warehouse_nodes" ("partner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranties_created_by" ON "warranties" ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranties_customer_id" ON "warranties" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranties_garage_id" ON "warranties" ("garage_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranties_vehicle_id" ON "warranties" ("vehicle_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranty_claims_job_card_id" ON "warranty_claims" ("job_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranty_claims_reviewed_by" ON "warranty_claims" ("reviewed_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranty_claims_submitted_by" ON "warranty_claims" ("submitted_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_warranty_claims_warranty_id" ON "warranty_claims" ("warranty_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workshop_resources_garage_id" ON "workshop_resources" ("garage_id");
