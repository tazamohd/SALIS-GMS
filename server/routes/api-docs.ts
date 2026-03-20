// @ts-nocheck
import { Router } from 'express';

const router = Router();

interface EndpointEntry {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  description: string;
  module: string;
  authRequired: boolean;
}

const endpoints: EndpointEntry[] = [
  // Auth
  { method: 'POST', path: '/api/login', description: 'Authenticate user with credentials', module: 'auth', authRequired: false },
  { method: 'POST', path: '/api/logout', description: 'Log out current user session', module: 'auth', authRequired: true },
  { method: 'GET', path: '/api/user', description: 'Get current authenticated user', module: 'auth', authRequired: false },
  { method: 'POST', path: '/api/register', description: 'Register a new user account', module: 'auth', authRequired: false },

  // Job Cards
  { method: 'GET', path: '/api/job-cards', description: 'List all job cards', module: 'job-cards', authRequired: true },
  { method: 'GET', path: '/api/job-cards/:id', description: 'Get job card by ID', module: 'job-cards', authRequired: true },
  { method: 'GET', path: '/api/job-cards/:id/details', description: 'Get detailed job card with relations', module: 'job-cards', authRequired: true },
  { method: 'POST', path: '/api/job-cards', description: 'Create a new job card', module: 'job-cards', authRequired: true },
  { method: 'PUT', path: '/api/job-cards/:id', description: 'Update job card fully', module: 'job-cards', authRequired: true },
  { method: 'PATCH', path: '/api/job-cards/:id', description: 'Partially update a job card', module: 'job-cards', authRequired: true },
  { method: 'DELETE', path: '/api/job-cards/:id', description: 'Delete a job card', module: 'job-cards', authRequired: true },

  // Invoices
  { method: 'GET', path: '/api/invoices', description: 'List all invoices', module: 'invoices', authRequired: true },
  { method: 'GET', path: '/api/invoices/:id', description: 'Get invoice by ID', module: 'invoices', authRequired: true },
  { method: 'POST', path: '/api/invoices', description: 'Create a new invoice', module: 'invoices', authRequired: true },
  { method: 'PATCH', path: '/api/invoices/:id', description: 'Update an invoice', module: 'invoices', authRequired: true },
  { method: 'DELETE', path: '/api/invoices/:id', description: 'Delete an invoice', module: 'invoices', authRequired: true },

  // Appointments
  { method: 'GET', path: '/api/appointments', description: 'List all appointments', module: 'appointments', authRequired: true },
  { method: 'GET', path: '/api/appointments/:id', description: 'Get appointment by ID', module: 'appointments', authRequired: true },
  { method: 'POST', path: '/api/appointments', description: 'Create a new appointment', module: 'appointments', authRequired: true },
  { method: 'PATCH', path: '/api/appointments/:id', description: 'Update an appointment', module: 'appointments', authRequired: true },
  { method: 'DELETE', path: '/api/appointments/:id', description: 'Delete an appointment', module: 'appointments', authRequired: true },

  // Vehicles
  { method: 'GET', path: '/api/vehicles', description: 'List all vehicles', module: 'vehicles', authRequired: true },
  { method: 'GET', path: '/api/vehicles/:id', description: 'Get vehicle by ID', module: 'vehicles', authRequired: true },
  { method: 'POST', path: '/api/vehicles', description: 'Register a new vehicle', module: 'vehicles', authRequired: true },
  { method: 'PATCH', path: '/api/vehicles/:id', description: 'Update vehicle details', module: 'vehicles', authRequired: true },
  { method: 'DELETE', path: '/api/vehicles/:id', description: 'Delete a vehicle record', module: 'vehicles', authRequired: true },

  // Spare Parts
  { method: 'GET', path: '/api/spare-parts', description: 'List all spare parts', module: 'spare-parts', authRequired: true },
  { method: 'GET', path: '/api/spare-parts/:id', description: 'Get spare part by ID', module: 'spare-parts', authRequired: true },
  { method: 'POST', path: '/api/spare-parts', description: 'Add a new spare part', module: 'spare-parts', authRequired: true },
  { method: 'PATCH', path: '/api/spare-parts/:id', description: 'Update spare part info', module: 'spare-parts', authRequired: true },
  { method: 'DELETE', path: '/api/spare-parts/:id', description: 'Delete a spare part', module: 'spare-parts', authRequired: true },

  // Financial
  { method: 'GET', path: '/api/payments', description: 'List all payments', module: 'financial', authRequired: true },
  { method: 'POST', path: '/api/payments', description: 'Record a new payment', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/refunds', description: 'List all refunds', module: 'financial', authRequired: true },
  { method: 'POST', path: '/api/refunds', description: 'Process a refund', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/financial/summary', description: 'Get financial summary', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/financial/revenue', description: 'Get revenue breakdown', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/chart-of-accounts', description: 'Get chart of accounts', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/general-ledger', description: 'Get general ledger entries', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/journal-entries', description: 'List journal entries', module: 'financial', authRequired: true },
  { method: 'POST', path: '/api/journal-entries', description: 'Create a journal entry', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/trial-balance', description: 'Get trial balance', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/income-statement', description: 'Get income statement', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/balance-sheet', description: 'Get balance sheet', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/cash-flow-statement', description: 'Get cash flow statement', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/accounts-receivable', description: 'List accounts receivable', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/accounts-payable', description: 'List accounts payable', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/cost-centers', description: 'List cost centers', module: 'financial', authRequired: true },
  { method: 'GET', path: '/api/budget-management', description: 'Get budgets overview', module: 'financial', authRequired: true },

  // Saudi Compliance
  { method: 'GET', path: '/api/saudi/zatca/status', description: 'Get ZATCA e-invoicing status', module: 'saudi', authRequired: true },
  { method: 'POST', path: '/api/saudi/zatca/submit', description: 'Submit invoice to ZATCA', module: 'saudi', authRequired: true },
  { method: 'GET', path: '/api/saudi/vat/report', description: 'Generate VAT report', module: 'saudi', authRequired: true },
  { method: 'POST', path: '/api/saudi/vat/calculate', description: 'Calculate VAT for transaction', module: 'saudi', authRequired: true },

  // Workflow
  { method: 'GET', path: '/api/workflow/rules', description: 'List workflow automation rules', module: 'workflow', authRequired: true },
  { method: 'POST', path: '/api/workflow/rules', description: 'Create a workflow rule', module: 'workflow', authRequired: true },
  { method: 'PATCH', path: '/api/workflow/rules/:id', description: 'Update a workflow rule', module: 'workflow', authRequired: true },
  { method: 'DELETE', path: '/api/workflow/rules/:id', description: 'Delete a workflow rule', module: 'workflow', authRequired: true },
  { method: 'GET', path: '/api/workflow/executions', description: 'List workflow execution logs', module: 'workflow', authRequired: true },
  { method: 'POST', path: '/api/workflow/hooks/job-card', description: 'Trigger job card workflow hook', module: 'workflow', authRequired: true },
  { method: 'POST', path: '/api/workflow/hooks/appointment', description: 'Trigger appointment workflow hook', module: 'workflow', authRequired: true },
  { method: 'POST', path: '/api/workflow/hooks/invoice', description: 'Trigger invoice workflow hook', module: 'workflow', authRequired: true },

  // Scheduling
  { method: 'GET', path: '/api/scheduling/slots', description: 'Get available scheduling slots', module: 'scheduling', authRequired: true },
  { method: 'POST', path: '/api/scheduling/optimize', description: 'Run AI schedule optimization', module: 'scheduling', authRequired: true },
  { method: 'GET', path: '/api/scheduling/calendar', description: 'Get scheduling calendar view', module: 'scheduling', authRequired: true },
  { method: 'GET', path: '/api/scheduling/technicians', description: 'Get technician availability', module: 'scheduling', authRequired: true },

  // Predictive Maintenance
  { method: 'GET', path: '/api/predictive-maintenance/predictions', description: 'Get maintenance predictions', module: 'predictive-maintenance', authRequired: true },
  { method: 'GET', path: '/api/predictive-maintenance/vehicle/:vehicleId', description: 'Get predictions for a vehicle', module: 'predictive-maintenance', authRequired: true },
  { method: 'POST', path: '/api/predictive-maintenance/analyze', description: 'Run predictive analysis on vehicle', module: 'predictive-maintenance', authRequired: true },
  { method: 'GET', path: '/api/predictive-maintenance/alerts', description: 'Get predictive maintenance alerts', module: 'predictive-maintenance', authRequired: true },
  { method: 'GET', path: '/api/predictive-maintenance/stats', description: 'Get predictive maintenance statistics', module: 'predictive-maintenance', authRequired: true },

  // Parts Recommendations
  { method: 'GET', path: '/api/parts-recommendations', description: 'Get smart parts recommendations', module: 'parts-recommendations', authRequired: true },
  { method: 'GET', path: '/api/parts-recommendations/vehicle/:vehicleId', description: 'Get parts recommendations by vehicle', module: 'parts-recommendations', authRequired: true },
  { method: 'POST', path: '/api/parts-recommendations/generate', description: 'Generate AI parts recommendations', module: 'parts-recommendations', authRequired: true },
  { method: 'GET', path: '/api/parts-recommendations/stats', description: 'Get recommendation statistics', module: 'parts-recommendations', authRequired: true },

  // Reports
  { method: 'GET', path: '/api/reports/overview', description: 'Get reports overview', module: 'reports', authRequired: true },
  { method: 'GET', path: '/api/reports/revenue', description: 'Get revenue reports', module: 'reports', authRequired: true },
  { method: 'GET', path: '/api/reports/technician-performance', description: 'Get technician performance report', module: 'reports', authRequired: true },
  { method: 'GET', path: '/api/reports/inventory', description: 'Get inventory reports', module: 'reports', authRequired: true },
  { method: 'GET', path: '/api/reports/customer-analytics', description: 'Get customer analytics report', module: 'reports', authRequired: true },
  { method: 'POST', path: '/api/reports/custom', description: 'Generate custom report', module: 'reports', authRequired: true },
  { method: 'GET', path: '/api/reports/advanced', description: 'Get advanced analytics reports', module: 'reports', authRequired: true },

  // Notifications
  { method: 'GET', path: '/api/notification-center/notifications', description: 'List all notifications', module: 'notifications', authRequired: true },
  { method: 'POST', path: '/api/notification-center/notifications', description: 'Create a notification', module: 'notifications', authRequired: true },
  { method: 'PATCH', path: '/api/notification-center/notifications/:id/read', description: 'Mark notification as read', module: 'notifications', authRequired: true },
  { method: 'POST', path: '/api/notification-center/notifications/mark-all-read', description: 'Mark all notifications as read', module: 'notifications', authRequired: true },
  { method: 'DELETE', path: '/api/notification-center/notifications/:id', description: 'Delete a notification', module: 'notifications', authRequired: true },
  { method: 'GET', path: '/api/notification-center/preferences', description: 'Get notification preferences', module: 'notifications', authRequired: true },
  { method: 'PATCH', path: '/api/notification-center/preferences', description: 'Update notification preferences', module: 'notifications', authRequired: true },

  // Audit
  { method: 'GET', path: '/api/audit/logs', description: 'List audit trail logs', module: 'audit', authRequired: true },
  { method: 'GET', path: '/api/audit/logs/:id', description: 'Get audit log entry by ID', module: 'audit', authRequired: true },
  { method: 'GET', path: '/api/audit/stats', description: 'Get audit statistics', module: 'audit', authRequired: true },
  { method: 'GET', path: '/api/audit/entity/:entityType/:entityId', description: 'Get audit logs for entity', module: 'audit', authRequired: true },

  // Command Center
  { method: 'GET', path: '/api/command-center/overview', description: 'Get command center overview', module: 'command-center', authRequired: true },
  { method: 'GET', path: '/api/command-center/metrics', description: 'Get real-time metrics', module: 'command-center', authRequired: true },
  { method: 'GET', path: '/api/command-center/alerts', description: 'Get active alerts', module: 'command-center', authRequired: true },

  // Dashboard
  { method: 'GET', path: '/api/dashboard/stats', description: 'Get dashboard statistics', module: 'dashboard', authRequired: true },
  { method: 'GET', path: '/api/dashboard/recent-activity', description: 'Get recent activity feed', module: 'dashboard', authRequired: true },
  { method: 'GET', path: '/api/dashboard/kpi', description: 'Get KPI metrics', module: 'dashboard', authRequired: true },
  { method: 'GET', path: '/api/dashboard/widgets', description: 'Get dashboard widget data', module: 'dashboard', authRequired: true },

  // HR & Payroll
  { method: 'GET', path: '/api/hr/employees', description: 'List all employees', module: 'hr-payroll', authRequired: true },
  { method: 'POST', path: '/api/hr/employees', description: 'Add a new employee', module: 'hr-payroll', authRequired: true },
  { method: 'GET', path: '/api/hr/employees/:id', description: 'Get employee by ID', module: 'hr-payroll', authRequired: true },
  { method: 'PATCH', path: '/api/hr/employees/:id', description: 'Update employee details', module: 'hr-payroll', authRequired: true },
  { method: 'DELETE', path: '/api/hr/employees/:id', description: 'Delete an employee', module: 'hr-payroll', authRequired: true },
  { method: 'GET', path: '/api/hr/payroll', description: 'Get payroll records', module: 'hr-payroll', authRequired: true },
  { method: 'POST', path: '/api/hr/payroll/run', description: 'Run payroll processing', module: 'hr-payroll', authRequired: true },
  { method: 'GET', path: '/api/hr/attendance', description: 'Get attendance records', module: 'hr-payroll', authRequired: true },
  { method: 'POST', path: '/api/hr/attendance/clock', description: 'Clock in/out', module: 'hr-payroll', authRequired: true },
  { method: 'GET', path: '/api/hr/leave-requests', description: 'List leave requests', module: 'hr-payroll', authRequired: true },
  { method: 'POST', path: '/api/hr/leave-requests', description: 'Submit a leave request', module: 'hr-payroll', authRequired: true },
  { method: 'PATCH', path: '/api/hr/leave-requests/:id', description: 'Approve or reject leave request', module: 'hr-payroll', authRequired: true },

  // Inventory
  { method: 'GET', path: '/api/inventory', description: 'List inventory items', module: 'inventory', authRequired: true },
  { method: 'POST', path: '/api/inventory', description: 'Add inventory item', module: 'inventory', authRequired: true },
  { method: 'PATCH', path: '/api/inventory/:id', description: 'Update inventory item', module: 'inventory', authRequired: true },
  { method: 'DELETE', path: '/api/inventory/:id', description: 'Remove inventory item', module: 'inventory', authRequired: true },
  { method: 'GET', path: '/api/inventory/low-stock', description: 'Get low stock alerts', module: 'inventory', authRequired: true },
  { method: 'GET', path: '/api/inventory/valuation', description: 'Get inventory valuation', module: 'inventory', authRequired: true },
  { method: 'POST', path: '/api/inventory/transfer', description: 'Transfer inventory between locations', module: 'inventory', authRequired: true },
  { method: 'GET', path: '/api/purchase-orders', description: 'List purchase orders', module: 'inventory', authRequired: true },
  { method: 'POST', path: '/api/purchase-orders', description: 'Create purchase order', module: 'inventory', authRequired: true },
  { method: 'PATCH', path: '/api/purchase-orders/:id', description: 'Update purchase order', module: 'inventory', authRequired: true },

  // CRM
  { method: 'GET', path: '/api/crm/customers', description: 'List CRM customer profiles', module: 'crm', authRequired: true },
  { method: 'GET', path: '/api/crm/customers/:id', description: 'Get CRM customer profile', module: 'crm', authRequired: true },
  { method: 'GET', path: '/api/crm/loyalty/members', description: 'List loyalty program members', module: 'crm', authRequired: true },
  { method: 'POST', path: '/api/crm/loyalty/enroll', description: 'Enroll customer in loyalty program', module: 'crm', authRequired: true },
  { method: 'GET', path: '/api/crm/loyalty/points/:customerId', description: 'Get loyalty points balance', module: 'crm', authRequired: true },
  { method: 'POST', path: '/api/crm/loyalty/redeem', description: 'Redeem loyalty points', module: 'crm', authRequired: true },
  { method: 'GET', path: '/api/crm/campaigns', description: 'List CRM campaigns', module: 'crm', authRequired: true },
  { method: 'POST', path: '/api/crm/campaigns', description: 'Create a CRM campaign', module: 'crm', authRequired: true },

  // Quality Control
  { method: 'GET', path: '/api/qc/inspections', description: 'List QC inspections', module: 'qc', authRequired: true },
  { method: 'POST', path: '/api/qc/inspections', description: 'Create QC inspection', module: 'qc', authRequired: true },
  { method: 'GET', path: '/api/qc/inspections/:id', description: 'Get QC inspection by ID', module: 'qc', authRequired: true },
  { method: 'PATCH', path: '/api/qc/inspections/:id', description: 'Update QC inspection', module: 'qc', authRequired: true },
  { method: 'GET', path: '/api/qc/checklists', description: 'List QC checklists', module: 'qc', authRequired: true },
  { method: 'POST', path: '/api/qc/checklists', description: 'Create QC checklist', module: 'qc', authRequired: true },
  { method: 'GET', path: '/api/qc/stats', description: 'Get QC statistics', module: 'qc', authRequired: true },

  // Warranty
  { method: 'GET', path: '/api/warranties', description: 'List all warranties', module: 'warranty', authRequired: true },
  { method: 'POST', path: '/api/warranties', description: 'Create a warranty', module: 'warranty', authRequired: true },
  { method: 'GET', path: '/api/warranties/:id', description: 'Get warranty by ID', module: 'warranty', authRequired: true },
  { method: 'PATCH', path: '/api/warranties/:id', description: 'Update a warranty', module: 'warranty', authRequired: true },
  { method: 'DELETE', path: '/api/warranties/:id', description: 'Delete a warranty', module: 'warranty', authRequired: true },
  { method: 'GET', path: '/api/warranties/active', description: 'List active warranties', module: 'warranty', authRequired: true },
  { method: 'GET', path: '/api/warranties/expired', description: 'List expired warranties', module: 'warranty', authRequired: true },
  { method: 'GET', path: '/api/warranties/expiring', description: 'List expiring soon warranties', module: 'warranty', authRequired: true },
  { method: 'GET', path: '/api/warranty-claims', description: 'List warranty claims', module: 'warranty', authRequired: true },
  { method: 'POST', path: '/api/warranty-claims', description: 'File a warranty claim', module: 'warranty', authRequired: true },
  { method: 'PATCH', path: '/api/warranty-claims/:id', description: 'Update warranty claim', module: 'warranty', authRequired: true },
  { method: 'DELETE', path: '/api/warranty-claims/:id', description: 'Delete warranty claim', module: 'warranty', authRequired: true },

  // Fleet
  { method: 'GET', path: '/api/fleet', description: 'List fleet vehicles', module: 'fleet', authRequired: true },
  { method: 'POST', path: '/api/fleet', description: 'Add vehicle to fleet', module: 'fleet', authRequired: true },
  { method: 'GET', path: '/api/fleet/:id', description: 'Get fleet vehicle by ID', module: 'fleet', authRequired: true },
  { method: 'PATCH', path: '/api/fleet/:id', description: 'Update fleet vehicle', module: 'fleet', authRequired: true },
  { method: 'DELETE', path: '/api/fleet/:id', description: 'Remove from fleet', module: 'fleet', authRequired: true },
  { method: 'GET', path: '/api/fleet/tracking', description: 'Get fleet GPS tracking data', module: 'fleet', authRequired: true },
  { method: 'GET', path: '/api/fleet/maintenance-schedule', description: 'Get fleet maintenance schedule', module: 'fleet', authRequired: true },

  // Estimates
  { method: 'GET', path: '/api/estimates', description: 'List all estimates', module: 'estimates', authRequired: true },
  { method: 'POST', path: '/api/estimates', description: 'Create a new estimate', module: 'estimates', authRequired: true },
  { method: 'GET', path: '/api/estimates/:id', description: 'Get estimate by ID', module: 'estimates', authRequired: true },
  { method: 'PATCH', path: '/api/estimates/:id', description: 'Update an estimate', module: 'estimates', authRequired: true },
  { method: 'DELETE', path: '/api/estimates/:id', description: 'Delete an estimate', module: 'estimates', authRequired: true },
  { method: 'POST', path: '/api/estimates/:id/convert', description: 'Convert estimate to job card', module: 'estimates', authRequired: true },
  { method: 'POST', path: '/api/estimates/:id/send', description: 'Send estimate to customer', module: 'estimates', authRequired: true },

  // Kiosk
  { method: 'POST', path: '/api/kiosk/checkin', description: 'Customer self-service check-in', module: 'kiosk', authRequired: false },
  { method: 'GET', path: '/api/kiosk/services', description: 'Get available services for kiosk', module: 'kiosk', authRequired: false },
  { method: 'GET', path: '/api/kiosk/status/:token', description: 'Check service status by token', module: 'kiosk', authRequired: false },

  // WhatsApp
  { method: 'POST', path: '/api/whatsapp/send', description: 'Send WhatsApp message', module: 'whatsapp', authRequired: true },
  { method: 'GET', path: '/api/whatsapp/conversations', description: 'List WhatsApp conversations', module: 'whatsapp', authRequired: true },
  { method: 'GET', path: '/api/whatsapp/messages/:conversationId', description: 'Get messages in conversation', module: 'whatsapp', authRequired: true },
  { method: 'POST', path: '/api/whatsapp/webhook', description: 'WhatsApp webhook receiver', module: 'whatsapp', authRequired: false },
  { method: 'GET', path: '/api/whatsapp/templates', description: 'List WhatsApp message templates', module: 'whatsapp', authRequired: true },

  // Customer Portal
  { method: 'GET', path: '/api/customer-portal/dashboard', description: 'Get customer portal dashboard data', module: 'customer-portal', authRequired: true },
  { method: 'GET', path: '/api/customer-portal/vehicles', description: 'Get customer vehicles', module: 'customer-portal', authRequired: true },
  { method: 'GET', path: '/api/customer-portal/appointments', description: 'Get customer appointments', module: 'customer-portal', authRequired: true },
  { method: 'POST', path: '/api/customer-portal/appointments', description: 'Book appointment from portal', module: 'customer-portal', authRequired: true },
  { method: 'GET', path: '/api/customer-portal/invoices', description: 'Get customer invoices', module: 'customer-portal', authRequired: true },
  { method: 'GET', path: '/api/customer-portal/service-history', description: 'Get customer service history', module: 'customer-portal', authRequired: true },

  // Technician Mobile
  { method: 'GET', path: '/api/technician-mobile/my-jobs', description: 'Get technician assigned jobs', module: 'technician-mobile', authRequired: true },
  { method: 'PATCH', path: '/api/technician-mobile/jobs/:id/status', description: 'Update job status from mobile', module: 'technician-mobile', authRequired: true },
  { method: 'POST', path: '/api/technician-mobile/clock-in', description: 'Technician clock in', module: 'technician-mobile', authRequired: true },
  { method: 'POST', path: '/api/technician-mobile/clock-out', description: 'Technician clock out', module: 'technician-mobile', authRequired: true },
  { method: 'GET', path: '/api/technician-mobile/parts-lookup', description: 'Mobile parts lookup', module: 'technician-mobile', authRequired: true },
  { method: 'POST', path: '/api/technician-mobile/jobs/:id/photos', description: 'Upload job photos', module: 'technician-mobile', authRequired: true },

  // Franchise
  { method: 'GET', path: '/api/franchise/locations', description: 'List franchise locations', module: 'franchise', authRequired: true },
  { method: 'POST', path: '/api/franchise/locations', description: 'Add franchise location', module: 'franchise', authRequired: true },
  { method: 'GET', path: '/api/franchise/locations/:id', description: 'Get franchise location details', module: 'franchise', authRequired: true },
  { method: 'PATCH', path: '/api/franchise/locations/:id', description: 'Update franchise location', module: 'franchise', authRequired: true },
  { method: 'GET', path: '/api/franchise/performance', description: 'Get franchise performance comparison', module: 'franchise', authRequired: true },
  { method: 'GET', path: '/api/franchise/royalties', description: 'Get franchise royalty reports', module: 'franchise', authRequired: true },

  // IoT
  { method: 'GET', path: '/api/iot/devices', description: 'List IoT devices', module: 'iot', authRequired: true },
  { method: 'POST', path: '/api/iot/devices', description: 'Register IoT device', module: 'iot', authRequired: true },
  { method: 'GET', path: '/api/iot/devices/:id/data', description: 'Get IoT device data stream', module: 'iot', authRequired: true },
  { method: 'GET', path: '/api/iot/sensors', description: 'List IoT sensors', module: 'iot', authRequired: true },
  { method: 'GET', path: '/api/iot/alerts', description: 'Get IoT alerts', module: 'iot', authRequired: true },

  // Marketing
  { method: 'GET', path: '/api/marketing/accounts', description: 'List marketing platform accounts', module: 'marketing', authRequired: true },
  { method: 'GET', path: '/api/marketing/campaigns', description: 'List marketing campaigns', module: 'marketing', authRequired: true },
  { method: 'POST', path: '/api/marketing/campaigns', description: 'Create marketing campaign', module: 'marketing', authRequired: true },
  { method: 'GET', path: '/api/marketing/tasks', description: 'List marketing tasks', module: 'marketing', authRequired: true },
  { method: 'GET', path: '/api/marketing/social', description: 'Get social media engagement data', module: 'marketing', authRequired: true },
  { method: 'GET', path: '/api/marketing/analytics', description: 'Get marketing analytics', module: 'marketing', authRequired: true },

  // Documents
  { method: 'GET', path: '/api/documents', description: 'List all documents', module: 'documents', authRequired: true },
  { method: 'POST', path: '/api/documents', description: 'Upload a document', module: 'documents', authRequired: true },
  { method: 'GET', path: '/api/documents/:id', description: 'Get document by ID', module: 'documents', authRequired: true },
  { method: 'DELETE', path: '/api/documents/:id', description: 'Delete a document', module: 'documents', authRequired: true },
  { method: 'GET', path: '/api/documents/search', description: 'Search documents', module: 'documents', authRequired: true },

  // Currency
  { method: 'GET', path: '/api/currency/rates', description: 'Get current exchange rates', module: 'currency', authRequired: true },
  { method: 'POST', path: '/api/currency/convert', description: 'Convert between currencies', module: 'currency', authRequired: true },
  { method: 'GET', path: '/api/currency/supported', description: 'List supported currencies', module: 'currency', authRequired: false },

  // Supplier Portal
  { method: 'GET', path: '/api/supplier-portal/orders', description: 'List supplier orders', module: 'supplier-portal', authRequired: true },
  { method: 'GET', path: '/api/supplier-portal/orders/:id', description: 'Get supplier order details', module: 'supplier-portal', authRequired: true },
  { method: 'PATCH', path: '/api/supplier-portal/orders/:id/status', description: 'Update supplier order status', module: 'supplier-portal', authRequired: true },
  { method: 'GET', path: '/api/supplier-portal/products', description: 'List supplier products', module: 'supplier-portal', authRequired: true },
  { method: 'POST', path: '/api/supplier-portal/products', description: 'Add supplier product', module: 'supplier-portal', authRequired: true },
  { method: 'GET', path: '/api/supplier-portal/invoices', description: 'List supplier invoices', module: 'supplier-portal', authRequired: true },

  // SMS Campaigns
  { method: 'GET', path: '/api/sms-campaigns', description: 'List SMS campaigns', module: 'sms-campaigns', authRequired: true },
  { method: 'POST', path: '/api/sms-campaigns', description: 'Create an SMS campaign', module: 'sms-campaigns', authRequired: true },
  { method: 'GET', path: '/api/sms-campaigns/:id', description: 'Get SMS campaign by ID', module: 'sms-campaigns', authRequired: true },
  { method: 'PATCH', path: '/api/sms-campaigns/:id', description: 'Update SMS campaign', module: 'sms-campaigns', authRequired: true },
  { method: 'POST', path: '/api/sms-campaigns/:id/send', description: 'Send SMS campaign', module: 'sms-campaigns', authRequired: true },
  { method: 'GET', path: '/api/sms-campaigns/:id/analytics', description: 'Get SMS campaign analytics', module: 'sms-campaigns', authRequired: true },

  // Customers (core)
  { method: 'GET', path: '/api/customers', description: 'List all customers', module: 'customers', authRequired: true },
  { method: 'POST', path: '/api/customers', description: 'Create a new customer', module: 'customers', authRequired: true },
  { method: 'GET', path: '/api/customers/:id', description: 'Get customer by ID', module: 'customers', authRequired: true },
  { method: 'PATCH', path: '/api/customers/:id', description: 'Update customer details', module: 'customers', authRequired: true },
  { method: 'DELETE', path: '/api/customers/:id', description: 'Delete a customer', module: 'customers', authRequired: true },

  // Misc / System
  { method: 'GET', path: '/api/search', description: 'Global search across entities', module: 'system', authRequired: true },
  { method: 'GET', path: '/api/global-search', description: 'Advanced global search', module: 'system', authRequired: true },
  { method: 'GET', path: '/api/settings', description: 'Get user settings', module: 'system', authRequired: true },
  { method: 'PATCH', path: '/api/settings', description: 'Update user settings', module: 'system', authRequired: true },
  { method: 'POST', path: '/api/backup', description: 'Trigger data backup', module: 'system', authRequired: true },
  { method: 'GET', path: '/api/health', description: 'System health check', module: 'system', authRequired: false },
  { method: 'GET', path: '/api/ready', description: 'System readiness check', module: 'system', authRequired: false },

  // Service Templates & Tools
  { method: 'GET', path: '/api/service-templates', description: 'List service templates', module: 'service-templates', authRequired: true },
  { method: 'POST', path: '/api/service-templates', description: 'Create a service template', module: 'service-templates', authRequired: true },
  { method: 'GET', path: '/api/tools', description: 'List workshop tools', module: 'tools', authRequired: true },
  { method: 'POST', path: '/api/tools', description: 'Add a workshop tool', module: 'tools', authRequired: true },

  // Towing & Loaner
  { method: 'GET', path: '/api/towing-requests', description: 'List towing requests', module: 'towing', authRequired: true },
  { method: 'POST', path: '/api/towing-requests', description: 'Create towing request', module: 'towing', authRequired: true },
  { method: 'PATCH', path: '/api/towing-requests/:id', description: 'Update towing request', module: 'towing', authRequired: true },
  { method: 'DELETE', path: '/api/towing-requests/:id', description: 'Cancel towing request', module: 'towing', authRequired: true },
  { method: 'GET', path: '/api/tow-trucks', description: 'List tow trucks', module: 'towing', authRequired: true },
  { method: 'POST', path: '/api/tow-trucks', description: 'Add tow truck', module: 'towing', authRequired: true },
  { method: 'GET', path: '/api/loaner-vehicles', description: 'List loaner vehicles', module: 'loaner', authRequired: true },
  { method: 'POST', path: '/api/loaner-vehicles', description: 'Add loaner vehicle', module: 'loaner', authRequired: true },
  { method: 'GET', path: '/api/loaner-reservations', description: 'List loaner reservations', module: 'loaner', authRequired: true },
  { method: 'POST', path: '/api/loaner-reservations', description: 'Create loaner reservation', module: 'loaner', authRequired: true },

  // Inspections
  { method: 'GET', path: '/api/vehicle-inspections', description: 'List vehicle inspections', module: 'inspections', authRequired: true },
  { method: 'POST', path: '/api/vehicle-inspections', description: 'Create vehicle inspection', module: 'inspections', authRequired: true },
  { method: 'GET', path: '/api/vehicle-inspections/:id', description: 'Get inspection by ID', module: 'inspections', authRequired: true },
  { method: 'PATCH', path: '/api/vehicle-inspections/:id', description: 'Update vehicle inspection', module: 'inspections', authRequired: true },
  { method: 'DELETE', path: '/api/vehicle-inspections/:id', description: 'Delete vehicle inspection', module: 'inspections', authRequired: true },
  { method: 'GET', path: '/api/inspection-templates', description: 'List inspection templates', module: 'inspections', authRequired: true },
  { method: 'POST', path: '/api/inspection-templates', description: 'Create inspection template', module: 'inspections', authRequired: true },

  // Suppliers
  { method: 'GET', path: '/api/suppliers', description: 'List all suppliers', module: 'suppliers', authRequired: true },
  { method: 'POST', path: '/api/suppliers', description: 'Add a new supplier', module: 'suppliers', authRequired: true },
  { method: 'GET', path: '/api/suppliers/:id', description: 'Get supplier by ID', module: 'suppliers', authRequired: true },
  { method: 'PATCH', path: '/api/suppliers/:id', description: 'Update supplier details', module: 'suppliers', authRequired: true },
  { method: 'DELETE', path: '/api/suppliers/:id', description: 'Delete a supplier', module: 'suppliers', authRequired: true },

  // Public
  { method: 'GET', path: '/api/public/info', description: 'Get public garage info', module: 'public', authRequired: false },
  { method: 'GET', path: '/api/public/features', description: 'Get public features list', module: 'public', authRequired: false },
  { method: 'GET', path: '/api/public/modules', description: 'Get public modules list', module: 'public', authRequired: false },
  { method: 'GET', path: '/api/public/services', description: 'Get public services list', module: 'public', authRequired: false },
  { method: 'GET', path: '/api/public/stats', description: 'Get public statistics', module: 'public', authRequired: false },

  // API Docs (self-referencing)
  { method: 'GET', path: '/api/docs/endpoints', description: 'List all API endpoints', module: 'api-docs', authRequired: true },
  { method: 'GET', path: '/api/docs/stats', description: 'Get API documentation stats', module: 'api-docs', authRequired: true },
];

// GET /api/docs/endpoints
router.get('/docs/endpoints', (req, res) => {
  const { module, method, search } = req.query;

  let filtered = [...endpoints];

  if (module && typeof module === 'string') {
    filtered = filtered.filter(e => e.module === module);
  }

  if (method && typeof method === 'string') {
    filtered = filtered.filter(e => e.method === method.toUpperCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.path.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.module.toLowerCase().includes(q)
    );
  }

  // Group by module
  const grouped: Record<string, EndpointEntry[]> = {};
  for (const ep of filtered) {
    if (!grouped[ep.module]) grouped[ep.module] = [];
    grouped[ep.module].push(ep);
  }

  res.json({
    total: filtered.length,
    modules: Object.keys(grouped).length,
    endpoints: filtered,
    grouped,
  });
});

// GET /api/docs/stats
router.get('/docs/stats', (req, res) => {
  const modules = [...new Set(endpoints.map(e => e.module))];
  const methods: Record<string, number> = {};
  for (const ep of endpoints) {
    methods[ep.method] = (methods[ep.method] || 0) + 1;
  }

  const authRequired = endpoints.filter(e => e.authRequired).length;
  const publicEndpoints = endpoints.filter(e => !e.authRequired).length;

  res.json({
    total: endpoints.length,
    modulesCount: modules.length,
    modules: modules.sort(),
    methods,
    authRequired,
    publicEndpoints,
  });
});

export default router;
