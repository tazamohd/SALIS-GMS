-- Performance indexes for frequently queried columns and foreign keys
-- Migration: 0003_add_performance_indexes.sql

-- =============================================
-- USERS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_garage_id ON users (garage_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users (user_type);

-- =============================================
-- GARAGES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_garages_saas_plan_id ON garages (saas_plan_id);
CREATE INDEX IF NOT EXISTS idx_garages_is_active ON garages (is_active);
CREATE INDEX IF NOT EXISTS idx_garages_created_at ON garages (created_at);

-- =============================================
-- BRANCHES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_branches_garage_id ON branches (garage_id);
CREATE INDEX IF NOT EXISTS idx_branches_created_at ON branches (created_at);

-- =============================================
-- USER ROLE BRANCH
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_role_branch_user_id ON user_role_branch (user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_branch_role_id ON user_role_branch (role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_branch_branch_id ON user_role_branch (branch_id);

-- =============================================
-- VEHICLES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles (customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_garage_id ON vehicles (garage_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles (license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles (vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles (is_active);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles (created_at);
-- Composite: vehicle + status
CREATE INDEX IF NOT EXISTS idx_vehicles_garage_id_is_active ON vehicles (garage_id, is_active);

-- =============================================
-- JOB CARDS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_job_cards_garage_id ON job_cards (garage_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_branch_id ON job_cards (branch_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer_id ON job_cards (customer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_by ON job_cards (created_by);
CREATE INDEX IF NOT EXISTS idx_job_cards_assigned_to ON job_cards (assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON job_cards (status);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON job_cards (created_at);
CREATE INDEX IF NOT EXISTS idx_job_cards_scheduled_date ON job_cards (scheduled_date);
-- Composite: garage + status (filter jobs by garage and status)
CREATE INDEX IF NOT EXISTS idx_job_cards_garage_id_status ON job_cards (garage_id, status);
-- Composite: customer + created_at (customer job history)
CREATE INDEX IF NOT EXISTS idx_job_cards_customer_id_created_at ON job_cards (customer_id, created_at);

-- =============================================
-- TASK ASSIGNMENTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_task_assignments_job_card_id ON task_assignments (job_card_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments (assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_by ON task_assignments (assigned_by);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments (status);

-- =============================================
-- TASK PROGRESS LOGS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_task_progress_logs_task_id ON task_progress_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_logs_user_id ON task_progress_logs (user_id);

-- =============================================
-- JOB CARD PARTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_job_card_parts_job_card_id ON job_card_parts (job_card_id);
CREATE INDEX IF NOT EXISTS idx_job_card_parts_spare_part_id ON job_card_parts (spare_part_id);
CREATE INDEX IF NOT EXISTS idx_job_card_parts_spare_part_inventory_id ON job_card_parts (spare_part_inventory_id);

-- =============================================
-- INVOICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_invoices_garage_id ON invoices (garage_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vehicle_id ON invoices (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_card_id ON invoices (job_card_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices (created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices (created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);
-- Composite: garage + status (filter invoices by garage and status)
CREATE INDEX IF NOT EXISTS idx_invoices_garage_id_status ON invoices (garage_id, status);
-- Composite: customer + created_at (customer billing history)
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id_created_at ON invoices (customer_id, created_at);

-- =============================================
-- INVOICE ITEMS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_discount_id ON invoice_items (discount_id);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments (created_by);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments (payment_method);

-- =============================================
-- APPOINTMENTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_appointments_garage_id ON appointments (garage_id);
CREATE INDEX IF NOT EXISTS idx_appointments_branch_id ON appointments (branch_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments (customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_to ON appointments (assigned_to);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments (created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments (created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments (appointment_date);
-- Composite: garage + status (filter appointments by garage and status)
CREATE INDEX IF NOT EXISTS idx_appointments_garage_id_status ON appointments (garage_id, status);
-- Composite: garage + appointment_date (calendar queries)
CREATE INDEX IF NOT EXISTS idx_appointments_garage_id_appointment_date ON appointments (garage_id, appointment_date);

-- =============================================
-- ESTIMATES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_estimates_garage_id ON estimates (garage_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates (customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_vehicle_id ON estimates (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_estimates_created_by ON estimates (created_by);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates (status);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates (created_at);
CREATE INDEX IF NOT EXISTS idx_estimates_converted_to_job_card_id ON estimates (converted_to_job_card_id);
CREATE INDEX IF NOT EXISTS idx_estimates_converted_to_invoice_id ON estimates (converted_to_invoice_id);
-- Composite: garage + status
CREATE INDEX IF NOT EXISTS idx_estimates_garage_id_status ON estimates (garage_id, status);
-- Composite: customer + created_at
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id_created_at ON estimates (customer_id, created_at);

-- =============================================
-- ESTIMATE ITEMS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items (estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_discount_id ON estimate_items (discount_id);

-- =============================================
-- SUPPLIERS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_suppliers_garage_id ON suppliers (garage_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers (email);
CREATE INDEX IF NOT EXISTS idx_suppliers_phone ON suppliers (phone);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers (is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers (created_at);

-- =============================================
-- PURCHASE ORDERS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_purchase_orders_garage_id ON purchase_orders (garage_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approved_by ON purchase_orders (approved_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders (status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders (created_at);
-- Composite: garage + status
CREATE INDEX IF NOT EXISTS idx_purchase_orders_garage_id_status ON purchase_orders (garage_id, status);
-- Composite: supplier + status
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id_status ON purchase_orders (supplier_id, status);

-- =============================================
-- PURCHASE ORDER ITEMS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items (purchase_order_id);

-- =============================================
-- SPARE PARTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_spare_parts_created_by ON spare_parts (created_by);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON spare_parts (category);
CREATE INDEX IF NOT EXISTS idx_spare_parts_is_active ON spare_parts (is_active);
CREATE INDEX IF NOT EXISTS idx_spare_parts_created_at ON spare_parts (created_at);

-- =============================================
-- SPARE PART INVENTORIES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_spare_part_inventories_spare_part_id ON spare_part_inventories (spare_part_id);
CREATE INDEX IF NOT EXISTS idx_spare_part_inventories_garage_id ON spare_part_inventories (garage_id);
CREATE INDEX IF NOT EXISTS idx_spare_part_inventories_branch_id ON spare_part_inventories (branch_id);
-- Composite: garage + spare_part (lookup inventory by garage)
CREATE INDEX IF NOT EXISTS idx_spare_part_inventories_garage_id_spare_part_id ON spare_part_inventories (garage_id, spare_part_id);

-- =============================================
-- FLEET GROUPS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_fleet_groups_garage_id ON fleet_groups (garage_id);
CREATE INDEX IF NOT EXISTS idx_fleet_groups_customer_id ON fleet_groups (customer_id);
CREATE INDEX IF NOT EXISTS idx_fleet_groups_is_active ON fleet_groups (is_active);

-- =============================================
-- FLEET VEHICLES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_fleet_group_id ON fleet_vehicles (fleet_group_id);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_vehicle_id ON fleet_vehicles (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_is_active ON fleet_vehicles (is_active);

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_garage_id ON notifications (garage_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);
-- Composite: recipient + status (unread notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id_status ON notifications (recipient_id, status);

-- =============================================
-- DISCOUNTS & PROMOTIONS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_discounts_promotions_garage_id ON discounts_promotions (garage_id);
CREATE INDEX IF NOT EXISTS idx_discounts_promotions_created_by ON discounts_promotions (created_by);
CREATE INDEX IF NOT EXISTS idx_discounts_promotions_is_active ON discounts_promotions (is_active);

-- =============================================
-- DISCOUNT USAGE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_id ON discount_usage (discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_invoice_id ON discount_usage (invoice_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_estimate_id ON discount_usage (estimate_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_customer_id ON discount_usage (customer_id);

-- =============================================
-- VEHICLE SERVICE HISTORY
-- =============================================
CREATE INDEX IF NOT EXISTS idx_vehicle_service_history_vehicle_id ON vehicle_service_history (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_service_history_job_card_id ON vehicle_service_history (job_card_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_service_history_performed_by ON vehicle_service_history (performed_by);
-- Composite: vehicle + service_date (service timeline)
CREATE INDEX IF NOT EXISTS idx_vehicle_service_history_vehicle_id_service_date ON vehicle_service_history (vehicle_id, service_date);

-- =============================================
-- MAINTENANCE SCHEDULES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_vehicle_id ON maintenance_schedules (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due_date ON maintenance_schedules (next_due_date);

-- =============================================
-- SERVICE REMINDERS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_service_reminders_customer_id ON service_reminders (customer_id);
CREATE INDEX IF NOT EXISTS idx_service_reminders_vehicle_id ON service_reminders (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_reminders_maintenance_schedule_id ON service_reminders (maintenance_schedule_id);
CREATE INDEX IF NOT EXISTS idx_service_reminders_status ON service_reminders (status);

-- =============================================
-- CUSTOMER NOTES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_by ON customer_notes (created_by);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes (created_at);

-- =============================================
-- SERVICE SIGNATURES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_service_signatures_job_card_id ON service_signatures (job_card_id);
CREATE INDEX IF NOT EXISTS idx_service_signatures_customer_id ON service_signatures (customer_id);

-- =============================================
-- SERVICE CHAT MESSAGES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_service_chat_messages_job_card_id ON service_chat_messages (job_card_id);
CREATE INDEX IF NOT EXISTS idx_service_chat_messages_sender_id ON service_chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_service_chat_messages_created_at ON service_chat_messages (created_at);

-- =============================================
-- SERVICE REVIEWS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_service_reviews_job_card_id ON service_reviews (job_card_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_customer_id ON service_reviews (customer_id);

-- =============================================
-- APPOINTMENT STATUS HISTORY
-- =============================================
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_appointment_id ON appointment_status_history (appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status_history_changed_by ON appointment_status_history (changed_by);

-- =============================================
-- APPOINTMENT REMINDERS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON appointment_reminders (appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_status ON appointment_reminders (status);

-- =============================================
-- SESSION LOGS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs (user_id);

-- =============================================
-- ACTIVITY LOGS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs (action_type);

-- =============================================
-- FEATURE FLAGS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_feature_flags_garage_id ON feature_flags (garage_id);

-- =============================================
-- SERVICE TEMPLATES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_service_templates_garage_id ON service_templates (garage_id);
CREATE INDEX IF NOT EXISTS idx_service_templates_category ON service_templates (category);

-- =============================================
-- TOOLS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tools_created_by ON tools (created_by);

-- =============================================
-- TOOL AVAILABILITY
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tool_availability_tool_id ON tool_availability (tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_availability_garage_id ON tool_availability (garage_id);
CREATE INDEX IF NOT EXISTS idx_tool_availability_branch_id ON tool_availability (branch_id);
CREATE INDEX IF NOT EXISTS idx_tool_availability_status ON tool_availability (status);

-- =============================================
-- TOOL USAGE LOGS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_tool_id ON tool_usage_logs (tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_job_card_id ON tool_usage_logs (job_card_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_task_id ON tool_usage_logs (task_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_user_id ON tool_usage_logs (user_id);

-- =============================================
-- TECHNICIAN AVAILABILITY
-- =============================================
CREATE INDEX IF NOT EXISTS idx_technician_availability_technician_id ON technician_availability (technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_availability_garage_id ON technician_availability (garage_id);

-- =============================================
-- RECURRING APPOINTMENTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_garage_id ON recurring_appointments (garage_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_customer_id ON recurring_appointments (customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_assigned_to ON recurring_appointments (assigned_to);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_created_by ON recurring_appointments (created_by);

-- =============================================
-- CALENDAR EVENTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_calendar_events_garage_id ON calendar_events (garage_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events (created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events (start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events (end_time);

-- =============================================
-- STOCK ALERTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_stock_alerts_spare_part_id ON stock_alerts (spare_part_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_garage_id ON stock_alerts (garage_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_branch_id ON stock_alerts (branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_alert_status ON stock_alerts (alert_status);

-- =============================================
-- REORDER SETTINGS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_reorder_settings_spare_part_id ON reorder_settings (spare_part_id);
CREATE INDEX IF NOT EXISTS idx_reorder_settings_garage_id ON reorder_settings (garage_id);
CREATE INDEX IF NOT EXISTS idx_reorder_settings_supplier_id ON reorder_settings (supplier_id);

-- =============================================
-- PRICING HISTORY
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pricing_history_spare_part_id ON pricing_history (spare_part_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_garage_id ON pricing_history (garage_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_changed_by ON pricing_history (changed_by);

-- =============================================
-- INVENTORY AUDIT TRAIL
-- =============================================
CREATE INDEX IF NOT EXISTS idx_inventory_audit_trail_spare_part_id ON inventory_audit_trail (spare_part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_trail_garage_id ON inventory_audit_trail (garage_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_trail_branch_id ON inventory_audit_trail (branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_trail_created_at ON inventory_audit_trail (created_at);

-- =============================================
-- NOTIFICATION SCHEDULES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notification_schedules_garage_id ON notification_schedules (garage_id);

-- =============================================
-- SAVED FILTER PRESETS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_saved_filter_presets_garage_id ON saved_filter_presets (garage_id);
CREATE INDEX IF NOT EXISTS idx_saved_filter_presets_user_id ON saved_filter_presets (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filter_presets_module ON saved_filter_presets (module);

-- =============================================
-- FLEET CONTRACTS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_fleet_contracts_fleet_group_id ON fleet_contracts (fleet_group_id);
CREATE INDEX IF NOT EXISTS idx_fleet_contracts_status ON fleet_contracts (status);
CREATE INDEX IF NOT EXISTS idx_fleet_contracts_created_by ON fleet_contracts (created_by);

-- =============================================
-- CONTRACT UTILIZATION
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contract_utilization_contract_id ON contract_utilization (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_utilization_job_card_id ON contract_utilization (job_card_id);
CREATE INDEX IF NOT EXISTS idx_contract_utilization_vehicle_id ON contract_utilization (vehicle_id);

-- =============================================
-- CONTRACT SLA METRICS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contract_sla_metrics_contract_id ON contract_sla_metrics (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_sla_metrics_job_card_id ON contract_sla_metrics (job_card_id);
