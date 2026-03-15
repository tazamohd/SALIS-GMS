/**
 * SALIS AUTO - Workflow & State Machine Type Definitions
 * Shared between server and client for consistent state management
 */

// ─── Entity Status Definitions ───────────────────────────────────────────────

export const JOB_CARD_STATUSES = [
  'draft', 'pending', 'assigned', 'in_progress', 'paused',
  'qc_review', 'rework', 'completed', 'invoiced', 'delivered', 'closed', 'cancelled'
] as const;
export type JobCardStatus = typeof JOB_CARD_STATUSES[number];

export const APPOINTMENT_STATUSES = [
  'requested', 'confirmed', 'reminded', 'checked_in',
  'in_service', 'completed', 'no_show', 'cancelled', 'rescheduled'
] as const;
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number];

export const INVOICE_STATUSES = [
  'draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'void', 'refunded'
] as const;
export type InvoiceStatus = typeof INVOICE_STATUSES[number];

export const PURCHASE_ORDER_STATUSES = [
  'draft', 'submitted', 'approved', 'rejected', 'ordered',
  'partially_received', 'received', 'closed', 'cancelled'
] as const;
export type PurchaseOrderStatus = typeof PURCHASE_ORDER_STATUSES[number];

export const ESTIMATE_STATUSES = [
  'draft', 'sent', 'viewed', 'approved', 'rejected', 'converted', 'expired'
] as const;
export type EstimateStatus = typeof ESTIMATE_STATUSES[number];

export const LEAVE_REQUEST_STATUSES = [
  'pending', 'approved', 'rejected', 'cancelled'
] as const;
export type LeaveRequestStatus = typeof LEAVE_REQUEST_STATUSES[number];

export const PAYMENT_STATUSES = [
  'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const TOWING_STATUSES = [
  'requested', 'dispatched', 'en_route', 'arrived', 'towing', 'delivered', 'completed', 'cancelled'
] as const;
export type TowingStatus = typeof TOWING_STATUSES[number];

// ─── State Machine Transition Definitions ────────────────────────────────────

export interface StateTransition<S extends string> {
  from: S;
  to: S;
  label: string;
  requiredRoles?: string[];
  autoTriggers?: string[];
}

export const JOB_CARD_TRANSITIONS: StateTransition<JobCardStatus>[] = [
  { from: 'draft', to: 'pending', label: 'Submit', autoTriggers: ['notify.advisor'] },
  { from: 'pending', to: 'assigned', label: 'Assign Technician', autoTriggers: ['notify.technician', 'calendar.block', 'parts.check'] },
  { from: 'pending', to: 'cancelled', label: 'Cancel', autoTriggers: ['notify.customer'] },
  { from: 'assigned', to: 'in_progress', label: 'Start Work', autoTriggers: ['notify.customer.status', 'timeclock.start'] },
  { from: 'in_progress', to: 'paused', label: 'Pause', autoTriggers: ['timeclock.pause'] },
  { from: 'paused', to: 'in_progress', label: 'Resume', autoTriggers: ['timeclock.resume'] },
  { from: 'in_progress', to: 'qc_review', label: 'Submit for QC', autoTriggers: ['notify.qc_inspector', 'qc.trigger'] },
  { from: 'qc_review', to: 'rework', label: 'Fail QC', autoTriggers: ['notify.technician', 'analytics.qc_fail'] },
  { from: 'rework', to: 'qc_review', label: 'Resubmit QC', autoTriggers: ['notify.qc_inspector'] },
  { from: 'qc_review', to: 'completed', label: 'Pass QC', autoTriggers: ['invoice.generate', 'notify.customer', 'analytics.complete', 'inventory.deduct'] },
  { from: 'in_progress', to: 'completed', label: 'Complete (No QC)', autoTriggers: ['invoice.generate', 'notify.customer', 'analytics.complete', 'inventory.deduct'] },
  { from: 'completed', to: 'invoiced', label: 'Invoice Sent', autoTriggers: ['notify.customer.invoice'] },
  { from: 'invoiced', to: 'delivered', label: 'Deliver Vehicle', autoTriggers: ['notify.customer.ready', 'feedback.request'] },
  { from: 'delivered', to: 'closed', label: 'Close Job', autoTriggers: ['analytics.close', 'reminder.schedule'] },
  { from: 'assigned', to: 'cancelled', label: 'Cancel', autoTriggers: ['notify.customer', 'calendar.unblock', 'parts.release'] },
  { from: 'in_progress', to: 'cancelled', label: 'Cancel', requiredRoles: ['ADMIN', 'MANAGER'], autoTriggers: ['notify.customer', 'parts.release', 'timeclock.stop'] },
];

export const APPOINTMENT_TRANSITIONS: StateTransition<AppointmentStatus>[] = [
  { from: 'requested', to: 'confirmed', label: 'Confirm', autoTriggers: ['sms.confirmation', 'email.confirmation', 'calendar.update'] },
  { from: 'confirmed', to: 'reminded', label: 'Send Reminder', autoTriggers: ['sms.reminder', 'email.reminder'] },
  { from: 'confirmed', to: 'checked_in', label: 'Check In', autoTriggers: ['jobcard.create', 'notify.advisor', 'bay.reserve'] },
  { from: 'reminded', to: 'checked_in', label: 'Check In', autoTriggers: ['jobcard.create', 'notify.advisor', 'bay.reserve'] },
  { from: 'checked_in', to: 'in_service', label: 'Start Service', autoTriggers: ['notify.customer.status'] },
  { from: 'in_service', to: 'completed', label: 'Complete', autoTriggers: ['notify.customer.complete', 'feedback.request'] },
  { from: 'confirmed', to: 'no_show', label: 'No Show', autoTriggers: ['analytics.no_show', 'calendar.free'] },
  { from: 'reminded', to: 'no_show', label: 'No Show', autoTriggers: ['analytics.no_show', 'calendar.free'] },
  { from: 'requested', to: 'cancelled', label: 'Cancel', autoTriggers: ['calendar.free'] },
  { from: 'confirmed', to: 'cancelled', label: 'Cancel', autoTriggers: ['calendar.free', 'notify.advisor'] },
  { from: 'confirmed', to: 'rescheduled', label: 'Reschedule', autoTriggers: ['calendar.update', 'sms.reschedule'] },
  { from: 'reminded', to: 'rescheduled', label: 'Reschedule', autoTriggers: ['calendar.update', 'sms.reschedule'] },
];

export const INVOICE_TRANSITIONS: StateTransition<InvoiceStatus>[] = [
  { from: 'draft', to: 'sent', label: 'Send', autoTriggers: ['email.invoice', 'sms.invoice'] },
  { from: 'sent', to: 'viewed', label: 'Mark Viewed', autoTriggers: [] },
  { from: 'sent', to: 'partially_paid', label: 'Partial Payment', autoTriggers: ['receipt.send', 'accounting.post'] },
  { from: 'viewed', to: 'partially_paid', label: 'Partial Payment', autoTriggers: ['receipt.send', 'accounting.post'] },
  { from: 'sent', to: 'paid', label: 'Full Payment', autoTriggers: ['receipt.send', 'accounting.post', 'analytics.revenue'] },
  { from: 'viewed', to: 'paid', label: 'Full Payment', autoTriggers: ['receipt.send', 'accounting.post', 'analytics.revenue'] },
  { from: 'partially_paid', to: 'paid', label: 'Full Payment', autoTriggers: ['receipt.send', 'accounting.post', 'analytics.revenue'] },
  { from: 'sent', to: 'overdue', label: 'Mark Overdue', autoTriggers: ['notify.customer.overdue', 'notify.accountant'] },
  { from: 'viewed', to: 'overdue', label: 'Mark Overdue', autoTriggers: ['notify.customer.overdue', 'notify.accountant'] },
  { from: 'overdue', to: 'paid', label: 'Late Payment', autoTriggers: ['receipt.send', 'accounting.post'] },
  { from: 'draft', to: 'void', label: 'Void', requiredRoles: ['ADMIN', 'ACCOUNTANT'], autoTriggers: ['accounting.reverse'] },
  { from: 'sent', to: 'void', label: 'Void', requiredRoles: ['ADMIN', 'ACCOUNTANT'], autoTriggers: ['accounting.reverse'] },
  { from: 'paid', to: 'refunded', label: 'Refund', requiredRoles: ['ADMIN', 'ACCOUNTANT'], autoTriggers: ['payment.refund', 'accounting.reverse'] },
];

export const PURCHASE_ORDER_TRANSITIONS: StateTransition<PurchaseOrderStatus>[] = [
  { from: 'draft', to: 'submitted', label: 'Submit', autoTriggers: ['notify.manager'] },
  { from: 'submitted', to: 'approved', label: 'Approve', requiredRoles: ['ADMIN', 'MANAGER'], autoTriggers: ['notify.supplier', 'notify.purchaseAgent'] },
  { from: 'submitted', to: 'rejected', label: 'Reject', requiredRoles: ['ADMIN', 'MANAGER'], autoTriggers: ['notify.purchaseAgent'] },
  { from: 'approved', to: 'ordered', label: 'Place Order', autoTriggers: ['supplier.notify', 'tracking.create'] },
  { from: 'ordered', to: 'partially_received', label: 'Partial Receive', autoTriggers: ['inventory.update', 'notify.purchaseAgent'] },
  { from: 'ordered', to: 'received', label: 'Full Receive', autoTriggers: ['inventory.update', 'accounting.post', 'notify.purchaseAgent'] },
  { from: 'partially_received', to: 'received', label: 'Full Receive', autoTriggers: ['inventory.update', 'accounting.post'] },
  { from: 'received', to: 'closed', label: 'Close', autoTriggers: ['analytics.procurement'] },
  { from: 'draft', to: 'cancelled', label: 'Cancel', autoTriggers: [] },
  { from: 'submitted', to: 'cancelled', label: 'Cancel', autoTriggers: ['notify.manager'] },
  { from: 'approved', to: 'cancelled', label: 'Cancel', requiredRoles: ['ADMIN', 'MANAGER'], autoTriggers: ['notify.supplier'] },
];

export const ESTIMATE_TRANSITIONS: StateTransition<EstimateStatus>[] = [
  { from: 'draft', to: 'sent', label: 'Send to Customer', autoTriggers: ['email.estimate', 'sms.estimate'] },
  { from: 'sent', to: 'viewed', label: 'Mark Viewed', autoTriggers: [] },
  { from: 'sent', to: 'approved', label: 'Customer Approved', autoTriggers: ['jobcard.create', 'notify.advisor'] },
  { from: 'viewed', to: 'approved', label: 'Customer Approved', autoTriggers: ['jobcard.create', 'notify.advisor'] },
  { from: 'sent', to: 'rejected', label: 'Customer Rejected', autoTriggers: ['analytics.estimate_rejected'] },
  { from: 'viewed', to: 'rejected', label: 'Customer Rejected', autoTriggers: ['analytics.estimate_rejected'] },
  { from: 'approved', to: 'converted', label: 'Convert to Job', autoTriggers: ['jobcard.create'] },
  { from: 'sent', to: 'expired', label: 'Expire', autoTriggers: ['notify.customer.followup'] },
  { from: 'viewed', to: 'expired', label: 'Expire', autoTriggers: ['notify.customer.followup'] },
];

// ─── Event Bus Types ─────────────────────────────────────────────────────────

export interface WorkflowEvent {
  type: string;
  entityType: string;
  entityId: string;
  garageId: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type EventCategory =
  | 'job' | 'appointment' | 'invoice' | 'payment' | 'estimate'
  | 'inventory' | 'purchase_order' | 'technician' | 'customer'
  | 'notification' | 'analytics' | 'accounting' | 'hr' | 'system';

// ─── Workflow Trigger Types ──────────────────────────────────────────────────

export interface WorkflowTrigger {
  event: string;
  handler: string;
  description: string;
  async?: boolean;
}

// ─── Command Center Types ────────────────────────────────────────────────────

export interface CommandCenterData {
  service: {
    activeJobs: number;
    pendingJobs: number;
    completedToday: number;
    avgCompletionTime: number;
    bayUtilization: number;
    overdueJobs: number;
  };
  parts: {
    stockHealth: number;
    pendingPOs: number;
    lowStockAlerts: number;
    turnoverRate: number;
    stockoutCount: number;
  };
  finance: {
    dailyRevenue: number;
    monthlyRevenue: number;
    outstandingAR: number;
    collectionRate: number;
    avgMargin: number;
    overdueInvoices: number;
  };
  hr: {
    presentToday: number;
    totalStaff: number;
    attendanceRate: number;
    overtimeHours: number;
    technicianUtilization: number;
  };
  customer: {
    appointmentsToday: number;
    walkIns: number;
    avgWaitTime: number;
    npsScore: number;
    repeatRate: number;
    avgRating: number;
  };
  alerts: AlertItem[];
  recentEvents: WorkflowEvent[];
}

export interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  department: string;
  message: string;
  entityType?: string;
  entityId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

// ─── AI Intelligence Types ───────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  category: 'revenue' | 'demand' | 'parts' | 'workforce' | 'customer' | 'cashflow' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface RevenueForecast {
  period: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

export interface DemandPrediction {
  serviceType: string;
  expectedDemand: number;
  period: string;
  confidence: number;
}
