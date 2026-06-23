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
 * SUPER-APP SHARED RAILS (shared/schema/*.ts — new):
 * - identity.ts: userIdentities, memberships, kycVerifications
 * - ledger.ts: accounts, ledgerTransactions, ledgerEntries, accountBalances
 * - payment-intents.ts: paymentIntents, payouts
 * - catalog.ts: providers, servicesCatalog, providerServices
 * - orders.ts: orders (super_orders), orderItems, orderEvents
 * - notifications-ext.ts: deviceTokens, notificationPrefs
 * - fleet.ts: fleetAccounts, fleetVehicles, fleetDrivers, telematicsEvents,
 *             fleetTrips, fleetGeofences, fleetMaintenanceRecords,
 *             fuelTransactions, fleetDocuments
 * - index.ts: barrel re-export of all shared-rail modules
 *
 * The shared-rail tables extend (not replace) the existing schema.
 * Import from 'shared/schema/index' for new super-app code.
 */

// Re-export everything from schema for backwards compatibility
export * from './schema';
