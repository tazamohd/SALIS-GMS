/**
 * Schema Organization Guide
 *
 * shared/schema.ts contains 391 table definitions organized by domain:
 *
 * CORE (tables 1-30):
 * - sessions, saasPlans, garages, users, customers, vehicles
 *
 * SERVICE OPS (tables 31-80):
 * - jobCards, appointments, estimates, serviceTemplates, inspections
 *
 * INVENTORY (tables 81-120):
 * - spareParts, sparePartInventories, purchaseOrders, suppliers
 *
 * FINANCE (tables 121-170):
 * - invoices, payments, expenses, generalLedger, journalEntries
 *
 * HR (tables 171-210):
 * - attendance, payroll, leaveRequests, training
 *
 * MARKETING (tables 211-240):
 * - campaigns, socialMedia, emailMarketing, loyalty
 *
 * COMPLIANCE (tables 241-270):
 * - auditLogs, safetyIncidents, environmentalCompliance
 *
 * AI & AUTOMATION (tables 271-310):
 * - aiPredictions, workflows, automationRules
 *
 * EMERGING TECH (tables 311-350):
 * - iotSensors, digitalTwins, blockchainRecords
 *
 * ENTERPRISE (tables 351-391):
 * - franchise, multiLocation, analytics
 *
 * Future: Split into domain-specific files when doing a major refactor.
 * Each domain module would export its own tables and be re-exported from schema.ts.
 */

// Re-export everything from schema for backwards compatibility
export * from './schema';
