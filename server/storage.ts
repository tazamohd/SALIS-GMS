import {
  users,
  garages,
  branches,
  roles,
  userRoleBranch,
  technicianProfiles,
  customerProfiles,
  assistantProfiles,
  jobCards,
  jobTrackingEvents,
  taskAssignments,
  serviceTemplates,
  tools,
  toolAvailability,
  toolUsageLogs,
  spareParts,
  sparePartInventories,
  appointments,
  appointmentStatusHistory,
  vehicles,
  vehicleServiceHistory,
  maintenanceSchedules,
  serviceReminders,
  customerNotes,
  serviceSignatures,
  serviceChatMessages,
  serviceReviews,
  suppliers,
  supplierPriceList,
  supplierPerformance,
  supplierPartsAvailability,
  purchaseOrders,
  purchaseOrderItems,
  assignmentRules,
  assignmentHistory,
  aiAssignmentRecommendations,
  callQueues,
  callQueueMembers,
  callSessions,
  callEvents,
  callNotes,
  callRecordings,
  callDispositionCodes,
  agentPerformanceSnapshots,
  invoices,
  invoiceItems,
  payments,
  technicianMetricDefinitions,
  technicianMetricPreferences,
  technicianPerformanceStream,
  technicianPerformanceRollups,
  serviceFeedback,
  technicianFeedbackSummary,
  maintenanceRecommendations,
  maintenanceTriggerRules,
  telematicsProviders,
  telematicsDevices,
  telematicsStreams,
  telematicsReadings,
  gamificationEventDefinitions,
  gamificationBadges,
  gamificationEvents,
  gamificationBadgeAwards,
  leaderboardSnapshots,
  type User,
  type UpsertUser,
  type Garage,
  type Branch,
  type Role,
  type JobCard,
  type JobTrackingEvent,
  type InsertJobTrackingEvent,
  type TaskAssignment,
  type ServiceTemplate,
  type InsertServiceTemplate,
  type Tool,
  type ToolAvailability,
  type ToolUsageLog,
  type SparePart,
  type InsertSparePart,
  type SparePartInventory,
  type InsertSparePartInventory,
  type Appointment,
  type InsertAppointment,
  type AppointmentStatusHistory,
  type Vehicle,
  type InsertVehicle,
  type VehicleServiceHistory,
  type InsertVehicleServiceHistory,
  type MaintenanceSchedule,
  type InsertMaintenanceSchedule,
  type ServiceReminder,
  type InsertServiceReminder,
  type CustomerNote,
  type InsertCustomerNote,
  type ServiceSignature,
  type InsertServiceSignature,
  type ServiceChatMessage,
  type InsertServiceChatMessage,
  type ServiceReview,
  type InsertServiceReview,
  type Supplier,
  type InsertSupplier,
  type SupplierPriceList,
  type InsertSupplierPriceList,
  type SupplierPerformance,
  type InsertSupplierPerformance,
  type SupplierPartsAvailability,
  type InsertSupplierPartsAvailability,
  type AssignmentRule,
  type InsertAssignmentRule,
  type AssignmentHistory,
  type InsertAssignmentHistory,
  type AiAssignmentRecommendation,
  type InsertAiAssignmentRecommendation,
  type CallQueue,
  type InsertCallQueue,
  type CallQueueMember,
  type InsertCallQueueMember,
  type CallSession,
  type InsertCallSession,
  type CallEvent,
  type InsertCallEvent,
  type CallNote,
  type InsertCallNote,
  type CallRecording,
  type InsertCallRecording,
  type CallDispositionCode,
  type InsertCallDispositionCode,
  type AgentPerformanceSnapshot,
  type InsertAgentPerformanceSnapshot,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type PurchaseOrderItem,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Payment,
  type InsertPayment,
  type InsertPurchaseOrderItem,
  type TechnicianProfile,
  type InsertTechnicianProfile,
  notifications,
  notificationSchedules,
  type Notification,
  type InsertNotification,
  type NotificationSchedule,
  type InsertNotificationSchedule,
  estimates,
  estimateItems,
  type Estimate,
  type InsertEstimate,
  type EstimateItem,
  type InsertEstimateItem,
  technicianAvailability,
  recurringAppointments,
  calendarEvents,
  type TechnicianAvailability,
  type InsertTechnicianAvailability,
  type RecurringAppointment,
  type InsertRecurringAppointment,
  type CalendarEvent,
  type InsertCalendarEvent,
  stockAlerts,
  reorderSettings,
  pricingHistory,
  inventoryAuditTrail,
  inventoryTransfers,
  tecDocCache,
  type StockAlert,
  type InsertStockAlert,
  type ReorderSetting,
  type InsertReorderSetting,
  type PricingHistory,
  type InsertPricingHistory,
  type InventoryAuditTrail,
  type InsertInventoryAuditTrail,
  type InventoryTransfer,
  type InsertInventoryTransfer,
  type TecDocCache,
  type InsertTecDocCache,
  paymentPlans,
  installments,
  refunds,
  taxConfigurations,
  discountsPromotions,
  discountUsage,
  type PaymentPlan,
  type InsertPaymentPlan,
  type Installment,
  type InsertInstallment,
  type Refund,
  type InsertRefund,
  type TaxConfiguration,
  type InsertTaxConfiguration,
  type DiscountPromotion,
  type InsertDiscountPromotion,
  chatConversations,
  chatParticipants,
  chatMessages,
  chatMessageReactions,
  supportTickets,
  supportTicketEvents,
  chatAttachments,
  type ChatConversation,
  type InsertChatConversation,
  type ChatParticipant,
  type InsertChatParticipant,
  type ChatMessage,
  type InsertChatMessage,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportTicketEvent,
  type InsertSupportTicketEvent,
  type ChatAttachment,
  type InsertChatAttachment,
  type ChatMessageReaction,
  type InsertChatMessageReaction,
  type DiscountUsage,
  type InsertDiscountUsage,
  savedFilterPresets,
  exportJobs,
  type SavedFilterPreset,
  type InsertSavedFilterPreset,
  type ExportJob,
  type InsertExportJob,
  employeeAttendance,
  shiftTemplates,
  shiftAssignments,
  commissionRules,
  commissions,
  performanceReviews,
  trainings,
  employeeTrainings,
  type EmployeeAttendance,
  type InsertEmployeeAttendance,
  type ShiftTemplate,
  type InsertShiftTemplate,
  type ShiftAssignment,
  type InsertShiftAssignment,
  type CommissionRule,
  type InsertCommissionRule,
  type Commission,
  type InsertCommission,
  type PerformanceReview,
  type InsertPerformanceReview,
  type Training,
  type InsertTraining,
  type EmployeeTraining,
  type InsertEmployeeTraining,
  aiJobEstimations,
  aiMaintenancePredictions,
  aiPartsRecommendations,
  aiScheduleOptimizations,
  aiChatConversations,
  voiceCommands,
  ocrDocuments,
  aiChatMessages,
  aiServiceSuggestions,
  integrationConnections,
  integrationSyncLogs,
  accountingTransactions,
  obdDiagnosticData,
  type IntegrationConnection,
  type InsertIntegrationConnection,
  type IntegrationSyncLog,
  type InsertIntegrationSyncLog,
  type AccountingTransaction,
  type InsertAccountingTransaction,
  type OBDDiagnosticData,
  type InsertOBDDiagnosticData,
  auditLogs,
  twoFactorAuth,
  backupJobs,
  gdprDataRequests,
  userConsents,
  permissionOverrides,
  type AuditLog,
  type InsertAuditLog,
  type TwoFactorAuth,
  type InsertTwoFactorAuth,
  type BackupJob,
  type InsertBackupJob,
  type GdprDataRequest,
  type InsertGdprDataRequest,
  type UserConsent,
  type InsertUserConsent,
  type PermissionOverride,
  type InsertPermissionOverride,
  userSettings,
  type UserSettings,
  type InsertUserSettings,
  actionHistory,
  type ActionHistory,
  type InsertActionHistory,
  dashboardWidgets,
  type DashboardWidget,
  type InsertDashboardWidget,
  customerPortalSessions,
  digitalSignatures,
  mediaAttachments,
  qrCodeTokens,
  qrScanLogs,
  fleetGroups,
  fleetVehicles,
  fleetContracts,
  fleetPricingTiers,
  fleetMaintenanceSchedules,
  type FleetGroup,
  type InsertFleetGroup,
  type FleetVehicle,
  type InsertFleetVehicle,
  type FleetContract,
  type InsertFleetContract,
  type FleetPricingTier,
  type InsertFleetPricingTier,
  type FleetMaintenanceSchedule,
  type InsertFleetMaintenanceSchedule,
  warranties,
  warrantyClaims,
  inspectionTemplates,
  vehicleInspections,
  towingRequests,
  towTrucks,
  loanerVehicles,
  loanerReservations,
  marketingCampaigns,
  campaignRecipients,
  loyaltyProgram,
  customerLoyaltyAccounts,
  loyaltyTransactions,
  loyaltyRewards,
  loyaltyRedemptions,
  documentCategories,
  documents,
  documentAccessLog,
  franchiseGroups,
  franchiseContracts,
  franchiseRoles,
  revenueSharingRules,
  franchiseKpis,
  franchiseBranches,
  locales,
  translationResources,
  currencyRates,
  taxRegions,
  timezoneRules,
  networkPartners,
  partnerContracts,
  fulfillmentOrders,
  shipmentEvents,
  warehouseNodes,
  crossBorderDocs,
  obdDevices,
  deviceAssignments,
  realtimeStreams,
  obdSessions,
  diagnosticReports,
  vendorCatalogs,
  oemProducts,
  subscriptionLicenses,
  licenseAuditLogs,
  entitlementAssignments,
  type FranchiseGroup,
  type InsertFranchiseGroup,
  type FranchiseContract,
  type InsertFranchiseContract,
  type FranchiseKpi,
  type InsertFranchiseKpi,
  type RevenueSharingRule,
  type InsertRevenueSharingRule,
  type Locale,
  type InsertLocale,
  type TranslationResource,
  type InsertTranslationResource,
  type CurrencyRate,
  type InsertCurrencyRate,
  type TaxRegion,
  type InsertTaxRegion,
  type TimezoneRule,
  type InsertTimezoneRule,
  type NetworkPartner,
  type InsertNetworkPartner,
  type PartnerContract,
  type InsertPartnerContract,
  type FulfillmentOrder,
  type InsertFulfillmentOrder,
  type ShipmentEvent,
  type InsertShipmentEvent,
  type WarehouseNode,
  type InsertWarehouseNode,
  type ObdDevice,
  type InsertObdDevice,
  type DeviceAssignment,
  type InsertDeviceAssignment,
  type ObdSession,
  type InsertObdSession,
  type DiagnosticReport,
  type InsertDiagnosticReport,
  type VendorCatalog,
  type InsertVendorCatalog,
  type OemProduct,
  type InsertOemProduct,
  type SubscriptionLicense,
  type InsertSubscriptionLicense,
  type LicenseAuditLog,
  type InsertLicenseAuditLog,
  type EntitlementAssignment,
  type InsertEntitlementAssignment,
  type InspectionTemplate,
  type InsertInspectionTemplate,
  type VehicleInspection,
  type InsertVehicleInspection,
  type TowingRequest,
  type InsertTowingRequest,
  type TowTruck,
  type InsertTowTruck,
  type LoanerVehicle,
  type InsertLoanerVehicle,
  type LoanerReservation,
  type InsertLoanerReservation,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  type CampaignRecipient,
  type InsertCampaignRecipient,
  type LoyaltyProgram,
  type InsertLoyaltyProgram,
  type CustomerLoyaltyAccount,
  type InsertCustomerLoyaltyAccount,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type LoyaltyReward,
  type InsertLoyaltyReward,
  type LoyaltyRedemption,
  type InsertLoyaltyRedemption,
  type DocumentCategory,
  type InsertDocumentCategory,
  type Document,
  type InsertDocument,
  type DocumentAccessLog,
  type InsertDocumentAccessLog,
  blockchainRecords,
  type BlockchainRecord,
  type InsertBlockchainRecord,
  arRepairGuides,
  arGuideSessions,
  type ARRepairGuide,
  type InsertARRepairGuide,
  type ARGuideSession,
  type InsertARGuideSession,
  iotSensors,
  iotSensorReadings,
  iotAlerts,
  type IoTSensor,
  type InsertIoTSensor,
  type IoTSensorReading,
  type InsertIoTSensorReading,
  type IoTAlert,
  type InsertIoTAlert,
  parts3DModels,
  parts3DViewSessions,
  type Parts3DModel,
  type InsertParts3DModel,
  type Parts3DViewSession,
  type InsertParts3DViewSession,
  droneInspections,
  droneMedia,
  type DroneInspection,
  type InsertDroneInspection,
  type DroneMedia,
  type InsertDroneMedia,
  aiVideoAnalysis,
  type AIVideoAnalysis,
  type InsertAIVideoAnalysis,
  digitalTwins,
  twinSimulations,
  type DigitalTwin,
  type InsertDigitalTwin,
  type TwinSimulation,
  type InsertTwinSimulation,
  fraudDetectionCases,
  fraudDetectionRules,
  type FraudDetectionCase,
  type InsertFraudDetectionCase,
  type FraudDetectionRule,
  type InsertFraudDetectionRule,
  biometricProfiles,
  biometricLogs,
  type BiometricProfile,
  type InsertBiometricProfile,
  type BiometricLog,
  type InsertBiometricLog,
  collaborationSessions,
  collaborationExperts,
  type CollaborationSession,
  type InsertCollaborationSession,
  type CollaborationExpert,
  type InsertCollaborationExpert,
  edgeDevices,
  edgeDiagnostics,
  type EdgeDevice,
  type InsertEdgeDevice,
  type EdgeDiagnostic,
  type InsertEdgeDiagnostic,
  pricingOptimization,
  pricingRules,
  type PricingOptimization,
  type InsertPricingOptimization,
  type PricingRule,
  type InsertPricingRule,
  neuralDiagnostics,
  neuralTrainingSessions,
  visionQualityChecks,
  visionDefects,
  nlpServiceRequests,
  nlpTrainingData,
  rlPartsOptimizations,
  rlLearningEpisodes,
  metaverseShowrooms,
  metaverseVisits,
  holographicGuides,
  holographicSessions,
  spatialWorkstations,
  spatialDiagnosticSessions,
  autonomousRobots,
  robotTasks,
  droneFleets,
  droneMissions,
  smartContracts,
  contractEvents,
  carbonCredits,
  carbonEmissions,
  greenEnergyAssets,
  evChargingStations,
  recycledParts,
  sustainabilityMetrics,
  satelliteConnections,
  satelliteUsageLogs,
  quantumEncryptionKeys,
  quantumSecureMessages,
  type NeuralDiagnostic,
  type InsertNeuralDiagnostic,
  type NeuralTrainingSession,
  type InsertNeuralTrainingSession,
  type VisionQualityCheck,
  type InsertVisionQualityCheck,
  type VisionDefect,
  type InsertVisionDefect,
  type NLPServiceRequest,
  type InsertNLPServiceRequest,
  type NLPTrainingData,
  type InsertNLPTrainingData,
  type RLPartsOptimization,
  type InsertRLPartsOptimization,
  type RLLearningEpisode,
  type InsertRLLearningEpisode,
  type MetaverseShowroom,
  type InsertMetaverseShowroom,
  type MetaverseVisit,
  type InsertMetaverseVisit,
  type HolographicGuide,
  type InsertHolographicGuide,
  type HolographicSession,
  type InsertHolographicSession,
  type SpatialWorkstation,
  type InsertSpatialWorkstation,
  type SpatialDiagnosticSession,
  type InsertSpatialDiagnosticSession,
  type AutonomousRobot,
  type InsertAutonomousRobot,
  type RobotTask,
  type InsertRobotTask,
  type DroneFleet,
  type InsertDroneFleet,
  type DroneMission,
  type InsertDroneMission,
  type SmartContract,
  type InsertSmartContract,
  type ContractEvent,
  type InsertContractEvent,
  type CarbonCredit,
  type InsertCarbonCredit,
  type CarbonEmission,
  type InsertCarbonEmission,
  type GreenEnergyAsset,
  type InsertGreenEnergyAsset,
  type EVChargingStation,
  type InsertEVChargingStation,
  type RecycledPart,
  type InsertRecycledPart,
  type SustainabilityMetric,
  type InsertSustainabilityMetric,
  type SatelliteConnection,
  type InsertSatelliteConnection,
  type SatelliteUsageLog,
  type InsertSatelliteUsageLog,
  type QuantumEncryptionKey,
  type InsertQuantumEncryptionKey,
  type QuantumSecureMessage,
  type InsertQuantumSecureMessage,
  payrollEmployees,
  payPeriods,
  payrollRuns,
  type PayrollEmployee,
  type InsertPayrollEmployee,
  type PayPeriod,
  type InsertPayPeriod,
  type PayrollRun,
  type InsertPayrollRun,
  expenseCategories,
  expenses,
  type ExpenseCategory,
  type InsertExpenseCategory,
  type Expense,
  type InsertExpense,
  towingJobs,
  type TowingJob,
  type InsertTowingJob,
  storageFacilities,
  vehicleStorageAssignments,
  type StorageFacility,
  type InsertStorageFacility,
  type VehicleStorageAssignment,
  type InsertVehicleStorageAssignment,
  telematicsFeeds,
  telematicsAlerts,
  type TelematicsFeed,
  type InsertTelematicsFeed,
  type TelematicsAlert,
  type InsertTelematicsAlert,
  articleCategories,
  knowledgeArticles,
  type ArticleCategory,
  type InsertArticleCategory,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  trainingModules,
  certifications,
  certificationAttempts,
  type TrainingModule,
  type InsertTrainingModule,
  type Certification,
  type InsertCertification,
  type CertificationAttempt,
  type InsertCertificationAttempt,
  googleBusinessProfiles,
  gmbPosts,
  gmbReviews,
  type GoogleBusinessProfile,
  type InsertGoogleBusinessProfile,
  type GmbPost,
  type InsertGmbPost,
  type GmbReview,
  type InsertGmbReview,
  compliancePolicies,
  complianceAudits,
  complianceTasks,
  type CompliancePolicy,
  type InsertCompliancePolicy,
  type ComplianceAudit,
  type InsertComplianceAudit,
  type ComplianceTask,
  type InsertComplianceTask,
  serviceBays,
  bayOccupancySessions,
  type ServiceBay,
  type InsertServiceBay,
  type BayOccupancySession,
  type InsertBayOccupancySession,
  inventoryForecasts,
  replenishmentOrders,
  loyaltyTiers,
  loyaltyAccounts,
  loyaltyOffers,
  workshopResources,
  calendarAppointments,
  arWorkInstructions,
  arSessionLogs,
  arDevicePairings,
  type InventoryForecast,
  type InsertInventoryForecast,
  type ReplenishmentOrder,
  type InsertReplenishmentOrder,
  type LoyaltyTier,
  type InsertLoyaltyTier,
  type LoyaltyAccount,
  type InsertLoyaltyAccount,
  type LoyaltyOffer,
  type InsertLoyaltyOffer,
  type WorkshopResource,
  type InsertWorkshopResource,
  type CalendarAppointment,
  type InsertCalendarAppointment,
  type ArWorkInstruction,
  type InsertArWorkInstruction,
  type ArSessionLog,
  type InsertArSessionLog,
  type ArDevicePairing,
  type InsertArDevicePairing,
  marketPricingData,
  vehiclePricingFactors,
  dynamicPricingSuggestions,
  type MarketPricingData,
  type InsertMarketPricingData,
  type VehiclePricingFactor,
  type InsertVehiclePricingFactor,
  type DynamicPricingSuggestion,
  type InsertDynamicPricingSuggestion,
  vehicleTracking,
  vehicleTrackingHistory,
  serviceReminderTemplates,
  pushSubscriptions,
  pushNotifications,
  notificationPreferences,
  type VehicleTracking,
  type InsertVehicleTracking,
  type VehicleTrackingHistory,
  type InsertVehicleTrackingHistory,
  type ServiceReminderTemplate,
  type InsertServiceReminderTemplate,
  type PushSubscription,
  type InsertPushSubscription,
  type PushNotification,
  type InsertPushNotification,
  type NotificationPreference,
  type InsertNotificationPreference,
  purchaseTasks,
  purchaseTaskParts,
  quotationRequests,
  supplierQuotations,
  quotationItems,
  supplierPayments,
  deliveries,
  deliveryItems,
  deliveryTimeline,
  liveDeliveryStatuses,
  type PurchaseTask,
  type InsertPurchaseTask,
  type PurchaseTaskPart,
  type InsertPurchaseTaskPart,
  type QuotationRequest,
  type InsertQuotationRequest,
  type SupplierQuotation,
  type InsertSupplierQuotation,
  type QuotationItem,
  type InsertQuotationItem,
  type SupplierPayment,
  type InsertSupplierPayment,
  type Delivery,
  type InsertDelivery,
  type DeliveryItem,
  type InsertDeliveryItem,
  type DeliveryTimelineEvent,
  type InsertDeliveryTimelineEvent,
  type LiveDeliveryStatus,
  type InsertLiveDeliveryStatus,
  vehicleLocationHistory,
  geofenceZones,
  geofenceEvents,
  fleetRoutes,
  routeCheckpoints,
  kioskTickets,
  type KioskTicket,
  type InsertKioskTicket,
  backupHistory,
  type BackupHistory,
  type InsertBackupHistory,
  currencyTransactions,
  type CurrencyTransaction,
  type InsertCurrencyTransaction,
  documentLibraryItems,
  type DocumentLibraryItem,
  type InsertDocumentLibraryItem,
  qcInspections,
  type QcInspection,
  type InsertQcInspection,
  qcDefects,
  type QcDefect,
  type InsertQcDefect,
  fleetAccounts,
  type FleetAccount,
  type InsertFleetAccount,
  fleetAccountVehicles,
  type FleetAccountVehicle,
  fleetMaintenanceEntries,
  type FleetMaintenanceEntry,
  mobileDevices,
  type MobileDevice,
  type InsertMobileDevice,
  subscriptions,
  type Subscription,
  type InsertSubscription,
  garageApplications,
  type GarageApplication,
  type InsertGarageApplication,
  subscriptionRequests,
  type SubscriptionRequest,
  type InsertSubscriptionRequest,
  customerVehicles,
  type CustomerVehicle,
  type InsertCustomerVehicle,
  schedulingOptimizationRuns,
  type SchedulingOptimizationRun,
  type InsertSchedulingOptimizationRun,
  hrLeaveRequestEntries,
  type HrLeaveRequestEntry,
  type InsertHrLeaveRequestEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, or, inArray, and, gte, lte, ilike, like, sql, isNull, gt, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { createHash, randomUUID } from "crypto";

/**
 * A users row with the bcrypt hash removed.
 *
 * Only the credential check may see `password`. Every method that hands user
 * rows to a caller for display returns SafeUser instead, because those rows are
 * serialised straight into API responses — /api/customers was returning
 * `$2b$10$...` hashes for every customer in the garage to any authenticated
 * caller.
 */
export type SafeUser = Omit<User, "password">;

/** Drop the hash from a row on its way out of the storage layer. */
function stripPassword(row: User): SafeUser {
  const { password: _discarded, ...rest } = row;
  return rest;
}

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getTechnicians(garageId?: string): Promise<SafeUser[]>;
  getTechnicianProfile(userId: string): Promise<TechnicianProfile | undefined>;
  createTechnicianProfile(data: InsertTechnicianProfile): Promise<TechnicianProfile>;
  updateTechnicianProfile(userId: string, data: Partial<TechnicianProfile>): Promise<TechnicianProfile>;
  
  // Garage operations
  getGarages(): Promise<Garage[]>;
  getGarageById(id: string): Promise<Garage | undefined>;
  createGarage(garage: typeof garages.$inferInsert): Promise<Garage>;
  
  // Branch operations
  getBranchesByGarageId(garageId: string): Promise<Branch[]>;
  createBranch(branch: typeof branches.$inferInsert): Promise<Branch>;
  
  // Role operations
  getRoles(): Promise<Role[]>;
  createRole(role: typeof roles.$inferInsert): Promise<Role>;
  
  // User-Role-Branch operations
  assignUserRole(userId: string, roleId: string, branchId: string, isPrimary?: boolean): Promise<void>;
  getUserRoles(userId: string): Promise<any[]>;
  
  // Job Card operations - Module 8
  getJobCards(garageId?: string, assignedTo?: string, customerId?: string): Promise<JobCard[]>;
  getJobCard(id: string): Promise<JobCard | undefined>;
  getJobCardWithDetails(id: string): Promise<any>;
  createJobCard(data: any): Promise<JobCard>;
  updateJobCard(id: string, data: any): Promise<JobCard>;
  
  // Dynamic Service Tracking - Feature #3
  generatePublicTrackingToken(jobCardId: string): Promise<{ rawToken: string, hashedToken: string, expiresAt: Date }>;
  getJobByTrackingToken(hashedToken: string): Promise<JobCard | undefined>;
  createJobTrackingEvent(data: InsertJobTrackingEvent): Promise<JobTrackingEvent>;
  getJobTrackingEvents(jobCardId: string, visibleToCustomer?: boolean): Promise<JobTrackingEvent[]>;
  updateJobETA(jobCardId: string, estimatedCompletionAt: Date, manualOverride?: boolean): Promise<JobCard>;
  
  // Technician-scoped operations
  getTechnicianJobCards(technicianId: string): Promise<JobCard[]>;
  getTechnicianTimeClockEntries(technicianId: string): Promise<any[]>;
  createTimeClockEntry(data: any): Promise<any>;
  
  // Task Assignment operations
  getTaskAssignments(jobCardId: string): Promise<TaskAssignment[]>;
  createTaskAssignment(data: any): Promise<TaskAssignment>;
  updateTaskAssignment(id: string, data: any): Promise<TaskAssignment>;
  
  // Service Template operations
  getAllServiceTemplates(): Promise<ServiceTemplate[]>;
  getServiceTemplates(garageId: string): Promise<ServiceTemplate[]>;
  getServiceTemplate(id: string): Promise<ServiceTemplate | undefined>;
  createServiceTemplate(data: InsertServiceTemplate): Promise<ServiceTemplate>;
  updateServiceTemplate(id: string, data: Partial<ServiceTemplate>): Promise<ServiceTemplate>;
  deleteServiceTemplate(id: string): Promise<void>;
  
  // Tool Management operations - Module 7
  getTools(garageId?: string, isGlobal?: boolean): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  createTool(data: any): Promise<Tool>;
  updateTool(id: string, data: any): Promise<Tool>;

  // Spare Parts operations - Module 12
  getSpareParts(): Promise<SparePart[]>;
  getSparePart(id: string): Promise<SparePart | undefined>;
  createSparePart(data: InsertSparePart): Promise<SparePart>;
  updateSparePart(id: string, data: Partial<SparePart>): Promise<SparePart>;
  deleteSparePart(id: string): Promise<void>;
  getSparePartInventories(garageId: string, sparePartId?: string): Promise<SparePartInventory[]>;
  createSparePartInventory(data: InsertSparePartInventory): Promise<SparePartInventory>;
  updateSparePartInventory(id: string, data: Partial<SparePartInventory>, garageId?: string, opts?: { userId?: string; expectedStockQuantity?: number }): Promise<SparePartInventory>;
  
  // Tool Availability operations
  getToolAvailability(garageId: string, toolId?: string): Promise<ToolAvailability[]>;
  createToolAvailability(data: any): Promise<ToolAvailability>;
  updateToolAvailability(id: string, data: any): Promise<ToolAvailability>;
  
  // Tool Usage operations
  getToolUsageLogs(toolId: string): Promise<ToolUsageLog[]>;
  createToolUsageLog(data: any): Promise<ToolUsageLog>;
  updateToolUsageLog(id: string, data: any): Promise<ToolUsageLog>;
  
  // Appointment operations - Module 9
  getAppointments(garageId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
  updateAppointmentStatus(id: string, status: string, userId: string, reason?: string): Promise<Appointment>;
  
  // Customer Management operations - Module 10
  getCustomers(garageId?: string, searchQuery?: string): Promise<SafeUser[]>;
  getCustomer(id: string): Promise<SafeUser | undefined>;
  getVehicles(garageId?: string): Promise<Vehicle[]>;
  getCustomerVehicles(customerId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(data: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;
  getCustomerNotes(customerId: string): Promise<CustomerNote[]>;
  createCustomerNote(data: InsertCustomerNote): Promise<CustomerNote>;
  deleteCustomerNote(id: string): Promise<void>;
  
  // Client Portal - Service Features
  getCustomerServiceReminders(customerId: string): Promise<ServiceReminder[]>;
  createServiceReminder(data: InsertServiceReminder): Promise<ServiceReminder>;
  getServiceChatMessages(jobCardId: string): Promise<ServiceChatMessage[]>;
  createServiceChatMessage(data: InsertServiceChatMessage): Promise<ServiceChatMessage>;
  getCustomerServiceReviews(customerId: string): Promise<ServiceReview[]>;
  createServiceReview(data: InsertServiceReview): Promise<ServiceReview>;
  getCustomerServiceSignatures(customerId: string): Promise<ServiceSignature[]>;
  createServiceSignature(data: InsertServiceSignature): Promise<ServiceSignature>;
  
  // Purchase Orders & Supplier Integration - Module 11
  getSuppliers(garageId?: string): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(data: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  
  // Supplier Price List methods - Module 43
  getSupplierPriceLists(supplierId?: string, sparePartId?: string): Promise<SupplierPriceList[]>;
  getSupplierPriceList(id: string, garageId?: string): Promise<SupplierPriceList | undefined>;
  createSupplierPriceList(data: InsertSupplierPriceList): Promise<SupplierPriceList>;
  updateSupplierPriceList(id: string, data: Partial<SupplierPriceList>, garageId?: string): Promise<SupplierPriceList>;
  deleteSupplierPriceList(id: string, garageId?: string): Promise<void>;
  comparePrices(sparePartId: string): Promise<SupplierPriceList[]>;
  
  // Supplier Performance methods - Module 43
  getSupplierPerformance(supplierId?: string, period?: string): Promise<SupplierPerformance[]>;
  getSupplierPerformanceRecord(id: string, garageId?: string): Promise<SupplierPerformance | undefined>;
  createSupplierPerformance(data: InsertSupplierPerformance): Promise<SupplierPerformance>;
  updateSupplierPerformance(id: string, data: Partial<SupplierPerformance>, garageId?: string): Promise<SupplierPerformance>;
  deleteSupplierPerformance(id: string, garageId?: string): Promise<void>;
  
  // Supplier Parts Availability - Feature #5
  getSupplierPartsAvailability(garageId: string, filters?: {sparePartId?: string, supplierId?: string, partName?: string}): Promise<SupplierPartsAvailability[]>;
  getSupplierPartAvailability(id: string, garageId: string): Promise<SupplierPartsAvailability | undefined>;
  createSupplierPartAvailability(data: InsertSupplierPartsAvailability): Promise<SupplierPartsAvailability>;
  updateSupplierPartAvailability(id: string, garageId: string, data: Partial<SupplierPartsAvailability>): Promise<SupplierPartsAvailability | null>;
  deleteSupplierPartAvailability(id: string, garageId: string): Promise<boolean>;
  syncSupplierAvailability(garageId: string, availabilityData: InsertSupplierPartsAvailability[]): Promise<SupplierPartsAvailability[]>;
  
  // Smart Job Assignment - Feature #6
  listAssignmentRules(garageId: string, isActive?: boolean): Promise<AssignmentRule[]>;
  upsertAssignmentRule(data: InsertAssignmentRule): Promise<AssignmentRule>;
  deleteAssignmentRule(id: string, garageId: string): Promise<boolean>;
  recordAssignmentEvent(data: InsertAssignmentHistory): Promise<AssignmentHistory>;
  listAssignmentHistory(garageId: string, jobCardId?: string, limit?: number): Promise<AssignmentHistory[]>;
  saveAIRecommendations(recommendations: InsertAiAssignmentRecommendation[]): Promise<AiAssignmentRecommendation[]>;
  listAIRecommendations(jobCardId: string, garageId: string, limit?: number): Promise<AiAssignmentRecommendation[]>;
  getJobCardWithContext(jobCardId: string, garageId: string): Promise<{jobCard: JobCard, technician: User | null} | null>;
  getTechniciansWithLoad(garageId: string, skillFilters?: string[]): Promise<Array<{technician: User & {profile: TechnicianProfile}, activeJobCount: number}>>;
  assignTechnicianToJob(params: {garageId: string, jobCardId: string, technicianId: string, assignedBy: string, reason?: string, aiRecommendationId?: string}): Promise<JobCard>;
  
  // Call Center Module - Wave 2
  createCallQueue(data: InsertCallQueue): Promise<CallQueue>;
  listCallQueues(garageId: string, isActive?: boolean): Promise<CallQueue[]>;
  getCallQueue(id: string, garageId: string): Promise<CallQueue | null>;
  updateCallQueue(id: string, garageId: string, data: Partial<CallQueue>): Promise<CallQueue | null>;
  deleteCallQueue(id: string, garageId: string): Promise<boolean>;
  getCallQueueWithMembers(queueId: string, garageId: string): Promise<{queue: CallQueue, members: CallQueueMember[]} | null>;
  
  addQueueMember(data: InsertCallQueueMember): Promise<CallQueueMember>;
  removeQueueMember(id: string, garageId: string): Promise<boolean>;
  listQueueMembers(queueId: string, garageId: string, isActive?: boolean): Promise<CallQueueMember[]>;
  updateQueueMember(id: string, garageId: string, data: Partial<CallQueueMember>): Promise<CallQueueMember | null>;
  
  createCallSession(data: InsertCallSession): Promise<CallSession>;
  getCallSession(id: string, garageId: string): Promise<CallSession | null>;
  listCallSessions(garageId: string, filters?: {status?: string, agentId?: string, queueId?: string}): Promise<CallSession[]>;
  updateCallSession(id: string, garageId: string, data: Partial<CallSession>): Promise<CallSession | null>;
  assignCallToAgent(params: {garageId: string, sessionId: string, agentId: string, assignedBy: string}): Promise<CallSession>;
  
  createCallEvent(data: InsertCallEvent): Promise<CallEvent>;
  listCallEvents(sessionId: string): Promise<CallEvent[]>;
  
  createCallNote(data: InsertCallNote): Promise<CallNote>;
  listCallNotes(sessionId: string): Promise<CallNote[]>;
  
  createCallRecording(data: InsertCallRecording): Promise<CallRecording>;
  listCallRecordings(sessionId: string): Promise<CallRecording[]>;
  
  createDispositionCode(data: InsertCallDispositionCode): Promise<CallDispositionCode>;
  listDispositionCodes(garageId: string, isActive?: boolean): Promise<CallDispositionCode[]>;
  updateDispositionCode(id: string, garageId: string, data: Partial<CallDispositionCode>): Promise<CallDispositionCode | null>;
  deleteDispositionCode(id: string, garageId: string): Promise<boolean>;
  
  createPerformanceSnapshot(data: InsertAgentPerformanceSnapshot): Promise<AgentPerformanceSnapshot>;
  listAgentPerformance(garageId: string, agentId?: string, dateRange?: {start: Date, end: Date}): Promise<AgentPerformanceSnapshot[]>;
  
  getPurchaseOrders(garageId?: string, status?: string): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(data: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder>;
  deletePurchaseOrder(id: string): Promise<void>;
  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(data: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: string, data: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem>;
  deletePurchaseOrderItem(id: string): Promise<void>;
  createPurchaseOrderWithItems(poData: InsertPurchaseOrder, items: Omit<InsertPurchaseOrderItem, 'purchaseOrderId'>[]): Promise<PurchaseOrder>;
  
  // Purchase Agent - Task Inbox
  getPurchaseTasks(garageId?: string, status?: string, priority?: string): Promise<PurchaseTask[]>;
  getPurchaseTask(id: string): Promise<PurchaseTask | undefined>;
  createPurchaseTask(data: InsertPurchaseTask): Promise<PurchaseTask>;
  updatePurchaseTask(id: string, data: Partial<PurchaseTask>, garageId?: string): Promise<PurchaseTask>;
  deletePurchaseTask(id: string, garageId?: string): Promise<void>;
  getPurchaseTaskParts(taskId: string): Promise<PurchaseTaskPart[]>;
  createPurchaseTaskPart(data: InsertPurchaseTaskPart): Promise<PurchaseTaskPart>;
  deletePurchaseTaskPart(id: string): Promise<void>;
  
  // Purchase Agent - Quotation Management
  getQuotationRequests(garageId?: string, status?: string): Promise<QuotationRequest[]>;
  getQuotationRequest(id: string): Promise<QuotationRequest | undefined>;
  createQuotationRequest(data: InsertQuotationRequest): Promise<QuotationRequest>;
  updateQuotationRequest(id: string, data: Partial<QuotationRequest>, garageId?: string): Promise<QuotationRequest>;
  deleteQuotationRequest(id: string, garageId?: string): Promise<void>;
  getSupplierQuotations(quotationRequestId: string): Promise<SupplierQuotation[]>;
  createSupplierQuotation(data: InsertSupplierQuotation): Promise<SupplierQuotation>;
  updateSupplierQuotation(id: string, data: Partial<SupplierQuotation>, garageId?: string): Promise<SupplierQuotation>;
  deleteSupplierQuotation(id: string, garageId?: string): Promise<void>;
  getQuotationItems(quotationId: string): Promise<QuotationItem[]>;
  createQuotationItem(data: InsertQuotationItem): Promise<QuotationItem>;
  deleteQuotationItem(id: string): Promise<void>;
  
  // Purchase Agent - Payment Tracking
  getSupplierPayments(garageId?: string, status?: string): Promise<SupplierPayment[]>;
  getSupplierPayment(id: string): Promise<SupplierPayment | undefined>;
  createSupplierPayment(data: InsertSupplierPayment): Promise<SupplierPayment>;
  updateSupplierPayment(id: string, data: Partial<SupplierPayment>, garageId?: string): Promise<SupplierPayment>;
  deleteSupplierPayment(id: string, garageId?: string): Promise<void>;
  
  // Purchase Agent - Delivery Tracking
  getDeliveries(garageId?: string, status?: string): Promise<Delivery[]>;
  getDelivery(id: string): Promise<Delivery | undefined>;
  createDelivery(data: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, data: Partial<Delivery>, garageId?: string): Promise<Delivery>;
  deleteDelivery(id: string, garageId?: string): Promise<void>;
  getDeliveryItems(deliveryId: string): Promise<DeliveryItem[]>;
  createDeliveryItem(data: InsertDeliveryItem): Promise<DeliveryItem>;
  deleteDeliveryItem(id: string): Promise<void>;
  getDeliveryTimeline(deliveryId: string): Promise<DeliveryTimelineEvent[]>;
  createDeliveryTimelineEvent(data: InsertDeliveryTimelineEvent): Promise<DeliveryTimelineEvent>;
  getLiveDeliveryStatus(deliveryId: string): Promise<LiveDeliveryStatus | undefined>;
  createLiveDeliveryStatus(data: InsertLiveDeliveryStatus): Promise<LiveDeliveryStatus>;
  updateLiveDeliveryStatus(id: string, data: Partial<LiveDeliveryStatus>): Promise<LiveDeliveryStatus>;
  
  // Invoice & Billing - Module 12
  getInvoices(garageId?: string, status?: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem>;
  deleteInvoiceItem(id: string): Promise<void>;
  createInvoiceWithItems(invoiceData: InsertInvoice, items: Omit<InsertInvoiceItem, 'invoiceId'>[]): Promise<Invoice>;
  getPayments(invoiceId?: string): Promise<Payment[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
  deletePayment(id: string): Promise<void>;
  
  // Estimates & Quotes - Module 23
  getEstimates(garageId?: string, status?: string): Promise<Estimate[]>;
  getEstimate(id: string): Promise<Estimate | undefined>;
  createEstimate(data: InsertEstimate): Promise<Estimate>;
  updateEstimate(id: string, data: Partial<Estimate>): Promise<Estimate>;
  deleteEstimate(id: string): Promise<void>;
  getEstimateItems(estimateId: string): Promise<EstimateItem[]>;
  createEstimateItem(data: InsertEstimateItem): Promise<EstimateItem>;
  deleteEstimateItem(id: string): Promise<void>;
  createEstimateWithItems(estimateData: InsertEstimate, items: Omit<InsertEstimateItem, 'estimateId'>[]): Promise<Estimate>;
  
  // Reports & Dashboards - Module 13
  getReportsOverview(garageId?: string): Promise<{
    totalRevenue: string;
    totalInvoices: number;
    totalJobCards: number;
    totalCustomers: number;
    pendingInvoices: number;
    activeJobCards: number;
    recentInvoices: Invoice[];
    recentJobCards: JobCard[];
  }>;
  getRevenueReport(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: string;
    paidAmount: string;
    pendingAmount: string;
    invoicesByStatus: { status: string; count: number; total: string }[];
    revenueByMonth: { month: string; revenue: string }[];
    paymentsByMethod: { method: string; total: string; count: number }[];
    comparison?: {
      previousMonth: {
        revenue: number;
        change: number;
        percentChange: number;
      };
      previousYear: {
        revenue: number;
        change: number;
        percentChange: number;
      };
    };
  }>;
  getJobCardAnalytics(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalJobCards: number;
    byStatus: { status: string; count: number }[];
    byPriority: { priority: string; count: number }[];
    averageCompletionTime: number;
    topTechnicians: { technicianId: string; jobCount: number }[];
  }>;
  getInventoryReport(garageId?: string): Promise<{
    totalTools: number;
    availableTools: number;
    inUseTools: number;
    toolsByCategory: { category: string; count: number }[];
    lowStockItems: { itemName: string; currentStock: number }[];
  }>;
  getTechnicianPerformance(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    technicians: {
      id: string;
      name: string;
      jobsCompleted: number;
      avgCompletionTime: number;
      revenueGenerated: number;
      efficiencyRating: number;
      jobsByStatus: { status: string; count: number }[];
    }[];
  }>;
  getCustomerAnalytics(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    customers: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      lifetimeValue: number;
      totalInvoices: number;
      totalVisits: number;
      avgInvoiceValue: number;
      lastVisit: Date | null;
      status: string;
    }[];
  }>;
  
  // Notification operations - Module 21
  getNotifications(recipientId?: string, garageId?: string, status?: string, type?: string): Promise<Notification[]>;
  getNotification(id: string): Promise<Notification | undefined>;
  createNotification(data: InsertNotification): Promise<Notification>;
  updateNotification(id: string, data: Partial<Notification>): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
  markNotificationAsSent(id: string): Promise<Notification>;
  markNotificationAsFailed(id: string, reason: string): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;
  getUnreadCount(recipientId: string, garageId?: string): Promise<number>;
  
  // Notification schedules - Automated notifications
  getNotificationSchedules(garageId: string): Promise<NotificationSchedule[]>;
  getNotificationSchedule(id: string): Promise<NotificationSchedule | undefined>;
  createNotificationSchedule(data: InsertNotificationSchedule): Promise<NotificationSchedule>;
  updateNotificationSchedule(id: string, data: Partial<NotificationSchedule>): Promise<NotificationSchedule>;
  deleteNotificationSchedule(id: string): Promise<void>;
  
  // Notification preferences - Module 24
  getNotificationPreferences(userId: string): Promise<NotificationPreference | undefined>;
  upsertNotificationPreferences(data: InsertNotificationPreference): Promise<NotificationPreference>;

  // Calendar & Scheduling - Module 26
  // Technician availability
  getTechnicianAvailability(technicianId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  createTechnicianAvailability(data: any): Promise<any>;
  updateTechnicianAvailability(id: string, data: any): Promise<any>;
  deleteTechnicianAvailability(id: string): Promise<void>;
  getGarageAvailability(garageId: string, startDate: Date, endDate: Date): Promise<any[]>;
  
  // Recurring appointments
  getRecurringAppointments(garageId: string): Promise<any[]>;
  getRecurringAppointment(id: string): Promise<any | undefined>;
  createRecurringAppointment(data: any): Promise<any>;
  updateRecurringAppointment(id: string, data: any): Promise<any>;
  deleteRecurringAppointment(id: string): Promise<void>;
  generateAppointmentsFromRecurring(recurringId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
  
  // Calendar events
  getCalendarEvents(garageId: string, startDate: Date, endDate: Date): Promise<any[]>;
  getCalendarEvent(id: string): Promise<any | undefined>;
  createCalendarEvent(data: any): Promise<any>;
  updateCalendarEvent(id: string, data: any): Promise<any>;
  deleteCalendarEvent(id: string): Promise<void>;
  
  // Conflict detection & optimization
  checkAppointmentConflicts(appointmentData: any): Promise<any[]>;
  getAvailableTimeSlots(technicianId: string, date: Date, duration: number): Promise<any[]>;
  getTechnicianWorkload(technicianId: string, startDate: Date, endDate: Date): Promise<any>;
  
  // Module 27: Inventory & Parts Management
  // Stock Alerts
  getStockAlerts(garageId: string, status?: string): Promise<any[]>;
  createStockAlert(data: any): Promise<any>;
  updateStockAlert(id: string, data: any, garageId?: string): Promise<any>;
  acknowledgeStockAlert(id: string, userId: string): Promise<any>;
  
  // Module 28: Advanced Financial Features
  // Payment Plans
  getPaymentPlans(invoiceId?: string): Promise<PaymentPlan[]>;
  getPaymentPlan(id: string, garageId?: string): Promise<PaymentPlan | undefined>;
  createPaymentPlan(data: InsertPaymentPlan): Promise<PaymentPlan>;
  updatePaymentPlan(id: string, data: Partial<PaymentPlan>, garageId?: string): Promise<PaymentPlan>;

  // Installments
  getInstallments(paymentPlanId: string): Promise<Installment[]>;
  getInstallment(id: string, garageId?: string): Promise<Installment | undefined>;
  createInstallment(data: InsertInstallment): Promise<Installment>;
  updateInstallment(id: string, data: Partial<Installment>, garageId?: string): Promise<Installment>;
  
  // Refunds
  getRefunds(garageId?: string, status?: string): Promise<Refund[]>;
  getRefund(id: string): Promise<Refund | undefined>;
  createRefund(data: InsertRefund): Promise<Refund>;
  updateRefund(id: string, data: Partial<Refund>): Promise<Refund>;
  
  // Tax Configurations
  getTaxConfigurations(garageId: string, isActive?: boolean): Promise<TaxConfiguration[]>;
  getTaxConfiguration(id: string): Promise<TaxConfiguration | undefined>;
  createTaxConfiguration(data: InsertTaxConfiguration): Promise<TaxConfiguration>;
  updateTaxConfiguration(id: string, data: Partial<TaxConfiguration>, garageId?: string): Promise<TaxConfiguration>;
  deleteTaxConfiguration(id: string, garageId?: string): Promise<void>;
  
  // Discounts & Promotions
  getDiscounts(garageId: string, isActive?: boolean): Promise<DiscountPromotion[]>;
  getDiscount(id: string): Promise<DiscountPromotion | undefined>;
  getDiscountByCode(code: string): Promise<DiscountPromotion | undefined>;
  createDiscount(data: InsertDiscountPromotion): Promise<DiscountPromotion>;
  updateDiscount(id: string, data: Partial<DiscountPromotion>): Promise<DiscountPromotion>;
  deleteDiscount(id: string): Promise<void>;
  
  // Discount Usage
  getDiscountUsage(discountId: string): Promise<DiscountUsage[]>;
  createDiscountUsage(data: InsertDiscountUsage): Promise<DiscountUsage>;
  
  // Helpers
  calculateTax(garageId: string, amount: number, category: string): Promise<{ taxAmount: number; taxRate: number; taxName: string }>;
  validateDiscount(code: string, garageId: string, customerId: string, amount: number): Promise<{ valid: boolean; discount?: DiscountPromotion; discountAmount?: number; message?: string }>;
  
  // Reorder Settings
  getReorderSettings(garageId: string, sparePartId?: string): Promise<any[]>;
  createReorderSetting(data: any): Promise<any>;
  updateReorderSetting(id: string, data: any, garageId?: string): Promise<any>;
  processAutoReorders(garageId: string): Promise<any[]>;
  
  // Pricing History
  getPricingHistory(sparePartId: string): Promise<any[]>;
  createPricingHistory(data: any): Promise<any>;
  
  // Inventory Audit Trail
  getInventoryAuditTrail(garageId: string, sparePartId?: string, limit?: number): Promise<any[]>;
  createAuditTrailEntry(data: any): Promise<any>;
  
  // Inventory Transfers
  getInventoryTransfers(garageId: string, status?: string): Promise<any[]>;
  getInventoryTransfer(id: string): Promise<any | undefined>;
  createInventoryTransfer(data: any): Promise<any>;
  updateInventoryTransfer(id: string, data: any): Promise<any>;
  approveInventoryTransfer(id: string, userId: string): Promise<any>;
  completeInventoryTransfer(id: string, userId: string): Promise<any>;
  
  // TecDoc Integration
  searchTecDoc(query: string, searchType: string): Promise<any>;
  getTecDocCache(query: string, searchType: string): Promise<any | undefined>;
  cacheTecDocResponse(query: string, searchType: string, response: any): Promise<any>;
  
  // Module 29: Search & Filtering
  // Global Search
  globalSearch(garageId: string, query: string, modules?: string[]): Promise<any>;
  
  // Saved Filter Presets
  getSavedFilterPresets(garageId: string, userId?: string, module?: string): Promise<SavedFilterPreset[]>;
  getSavedFilterPreset(id: string): Promise<SavedFilterPreset | undefined>;
  createSavedFilterPreset(data: InsertSavedFilterPreset): Promise<SavedFilterPreset>;
  updateSavedFilterPreset(id: string, data: Partial<SavedFilterPreset>): Promise<SavedFilterPreset>;
  deleteSavedFilterPreset(id: string): Promise<void>;
  
  // Export Jobs
  getExportJobs(garageId: string, userId?: string): Promise<ExportJob[]>;
  getExportJob(id: string): Promise<ExportJob | undefined>;
  createExportJob(data: InsertExportJob): Promise<ExportJob>;
  updateExportJob(id: string, data: Partial<ExportJob>): Promise<ExportJob>;
  
  // Bulk Operations
  bulkDelete(module: string, ids: string[]): Promise<{ deleted: number }>;
  bulkUpdate(module: string, ids: string[], data: any): Promise<{ updated: number }>;
  
  // Module 30: Business Intelligence & Analytics
  getMostProfitableServices(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    services: {
      serviceType: string;
      revenue: number;
      cost: number;
      profit: number;
      profitMargin: number;
      count: number;
    }[];
  }>;
  
  getPeakHoursAnalysis(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    hourlyDistribution: { hour: number; count: number; revenue: number }[];
    dailyDistribution: { day: string; count: number; revenue: number }[];
    peakHour: number;
    peakDay: string;
  }>;
  
  getTechnicianUtilizationRates(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    technicians: {
      id: string;
      name: string;
      totalHoursAvailable: number;
      totalHoursWorked: number;
      utilizationRate: number;
      jobsCompleted: number;
      revenueGenerated: number;
    }[];
  }>;
  
  getCustomerAcquisitionCost(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    totalMarketingCost: number;
    newCustomers: number;
    acquisitionCost: number;
    customersBySource: { source: string; count: number; cost: number }[];
  }>;
  
  // Module 31: Staff & HR Management
  // Employee Attendance
  getEmployeeAttendance(garageId: string, employeeId?: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getAttendance(id: string): Promise<any | undefined>;
  createAttendance(data: any): Promise<any>;
  updateAttendance(id: string, data: any): Promise<any>;
  clockIn(employeeId: string, garageId: string): Promise<any>;
  clockOut(attendanceId: string): Promise<any>;
  startBreak(attendanceId: string): Promise<any>;
  endBreak(attendanceId: string): Promise<any>;
  
  // Shift Management
  getShiftTemplates(garageId: string): Promise<any[]>;
  getShiftTemplate(id: string): Promise<any | undefined>;
  createShiftTemplate(data: any): Promise<any>;
  updateShiftTemplate(id: string, data: any): Promise<any>;
  deleteShiftTemplate(id: string): Promise<void>;
  getShiftAssignments(garageId: string, employeeId?: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getShiftAssignment(id: string): Promise<any | undefined>;
  createShiftAssignment(data: any): Promise<any>;
  updateShiftAssignment(id: string, data: any): Promise<any>;
  deleteShiftAssignment(id: string): Promise<void>;
  
  // Commission Management
  getCommissionRules(garageId: string): Promise<any[]>;
  getCommissionRule(id: string): Promise<any | undefined>;
  createCommissionRule(data: any): Promise<any>;
  updateCommissionRule(id: string, data: any): Promise<any>;
  deleteCommissionRule(id: string): Promise<void>;
  getCommissions(garageId: string, technicianId?: string, period?: string, status?: string): Promise<any[]>;
  getCommission(id: string): Promise<any | undefined>;
  createCommission(data: any): Promise<any>;
  updateCommission(id: string, data: any): Promise<any>;
  calculateCommission(jobCardId: string, garageId: string): Promise<any>;
  
  // Performance Reviews
  getPerformanceReviews(garageId: string, employeeId?: string): Promise<any[]>;
  getPerformanceReview(id: string): Promise<any | undefined>;
  createPerformanceReview(data: any): Promise<any>;
  updatePerformanceReview(id: string, data: any): Promise<any>;
  deletePerformanceReview(id: string): Promise<void>;
  
  // Training & Certifications
  getTrainings(garageId: string): Promise<any[]>;
  getTraining(id: string): Promise<any | undefined>;
  createTraining(data: any): Promise<any>;
  updateTraining(id: string, data: any): Promise<any>;
  deleteTraining(id: string): Promise<void>;
  getEmployeeTrainings(garageId: string, employeeId?: string, status?: string): Promise<any[]>;
  getEmployeeTraining(id: string): Promise<any | undefined>;
  createEmployeeTraining(data: any): Promise<any>;
  updateEmployeeTraining(id: string, data: any): Promise<any>;
  deleteEmployeeTraining(id: string): Promise<void>;
  
  // Module 32: AI Automation & Insights
  getAIJobEstimations(garageId: string, vehicleId?: string): Promise<any[]>;
  getAIJobEstimation(id: string): Promise<any | undefined>;
  createAIJobEstimation(data: any): Promise<any>;
  updateAIJobEstimation(id: string, data: any): Promise<any>;
  
  getAIMaintenancePredictions(garageId: string, vehicleId?: string, status?: string): Promise<any[]>;
  getAIMaintenancePrediction(id: string): Promise<any | undefined>;
  createAIMaintenancePrediction(data: any): Promise<any>;
  updateAIMaintenancePrediction(id: string, data: any): Promise<any>;
  acknowledgeMaintenancePrediction(id: string, userId: string): Promise<any>;
  
  getAIPartsRecommendations(garageId: string, vehicleId?: string, status?: string): Promise<any[]>;
  getAIPartsRecommendation(id: string): Promise<any | undefined>;
  createAIPartsRecommendation(data: any): Promise<any>;
  updateAIPartsRecommendation(id: string, data: any): Promise<any>;
  
  getAIScheduleOptimizations(garageId: string, status?: string): Promise<any[]>;
  getAIScheduleOptimization(id: string): Promise<any | undefined>;
  createAIScheduleOptimization(data: any): Promise<any>;
  updateAIScheduleOptimization(id: string, data: any): Promise<any>;
  
  getAIChatConversations(garageId: string, customerId?: string, status?: string): Promise<any[]>;
  getAIChatConversation(id: string): Promise<any | undefined>;
  createAIChatConversation(data: any): Promise<any>;
  updateAIChatConversation(id: string, data: any): Promise<any>;
  
  // Phase 1: AI & Automation - Voice Commands & OCR
  getVoiceCommands(userId: string, limit?: number): Promise<any[]>;
  createVoiceCommand(data: any): Promise<any>;
  
  getOCRDocuments(garageId: string, status?: string): Promise<any[]>;
  getOCRDocument(id: string): Promise<any | undefined>;
  createOCRDocument(data: any): Promise<any>;
  updateOCRDocument(id: string, data: any): Promise<any>;
  
  // Module 36: In-App Chat Support
  getChatConversations(garageId: string, userId?: string): Promise<any[]>;
  getChatConversation(id: string): Promise<any | undefined>;
  createChatConversation(data: any): Promise<any>;
  updateChatConversation(id: string, data: any): Promise<any>;
  
  getChatMessages(conversationId: string, limit?: number): Promise<any[]>;
  getChatMessage(id: string): Promise<any | undefined>;
  createChatMessage(data: any): Promise<any>;
  updateChatMessage(id: string, data: any): Promise<any>;
  deleteChatMessage(id: string): Promise<void>;
  
  getChatParticipants(conversationId: string): Promise<any[]>;
  addChatParticipant(data: any): Promise<any>;
  updateChatParticipant(id: string, data: any): Promise<any>;
  removeChatParticipant(id: string): Promise<void>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string, conversationId?: string): Promise<number>;
  
  // Chat Support Enhancements - Support Tickets
  getSupportTickets(garageId: string, filters?: {status?: string, priority?: string, assignedTo?: string, category?: string}): Promise<any[]>;
  getSupportTicket(id: string): Promise<any | undefined>;
  getSupportTicketByConversation(conversationId: string): Promise<any | undefined>;
  createSupportTicket(data: any): Promise<any>;
  updateSupportTicket(id: string, data: any): Promise<any>;
  createSupportTicketEvent(data: any): Promise<any>;
  getSupportTicketEvents(ticketId: string): Promise<any[]>;
  assignTicket(ticketId: string, userId: string, assignedBy: string): Promise<any>;
  updateTicketStatus(ticketId: string, status: string, userId: string, notes?: string): Promise<any>;
  
  // Chat Attachments
  createChatAttachment(data: any): Promise<any>;
  getChatAttachments(messageId: string): Promise<any[]>;
  deleteChatAttachment(id: string): Promise<void>;
  
  // Chat Reactions
  addMessageReaction(data: any): Promise<any>;
  removeMessageReaction(messageId: string, userId: string): Promise<void>;
  getMessageReactions(messageId: string): Promise<any[]>;
  
  // Module 37: Customer Self-Service Portal
  createPortalSession(customerId: string): Promise<any>;
  validatePortalSession(token: string): Promise<any | null>;
  revokePortalSession(token: string): Promise<void>;
  getCustomerServiceHistory(customerId: string, vehicleId?: string): Promise<any[]>;
  getCustomerEstimates(customerId: string, status?: string): Promise<any[]>;
  approveEstimate(estimateId: string, customerId: string): Promise<any>;
  getCustomerPayments(customerId: string): Promise<any[]>;
  
  // Module 38: Digital Signatures & Media Documentation
  createDigitalSignature(data: any): Promise<any>;
  getDigitalSignatures(relatedType: string, relatedId: string): Promise<any[]>;
  getDigitalSignature(id: string): Promise<any | undefined>;
  
  createMediaAttachment(data: any): Promise<any>;
  getMediaAttachments(relatedType: string, relatedId: string, category?: string): Promise<any[]>;
  getMediaAttachment(id: string): Promise<any | undefined>;
  deleteMediaAttachment(id: string): Promise<void>;
  updateMediaAttachment(id: string, data: any): Promise<any>;
  
  // Module 41: Warranty Tracking
  createWarranty(data: any): Promise<any>;
  getWarrantiesByGarage(garageId: string): Promise<any[]>;
  getWarrantyById(id: string): Promise<any | undefined>;
  getWarrantiesByVehicle(vehicleId: string): Promise<any[]>;
  getWarrantiesByCustomer(customerId: string): Promise<any[]>;
  getActiveWarranties(garageId: string): Promise<any[]>;
  getExpiredWarranties(garageId: string): Promise<any[]>;
  getExpiringWarranties(garageId: string, daysThreshold: number): Promise<any[]>;
  updateWarranty(id: string, data: any): Promise<any>;
  deleteWarranty(id: string): Promise<void>;

  createWarrantyClaim(data: any): Promise<any>;
  getWarrantyClaimsByGarage(garageId: string): Promise<any[]>;
  getWarrantyClaimById(id: string): Promise<any | undefined>;
  getWarrantyClaimsByWarranty(warrantyId: string): Promise<any[]>;
  updateWarrantyClaim(id: string, data: any): Promise<any>;
  deleteWarrantyClaim(id: string): Promise<void>;

  // Module 45: Vehicle Inspection Checklists
  createInspectionTemplate(data: InsertInspectionTemplate): Promise<InspectionTemplate>;
  getInspectionTemplates(garageId: string): Promise<InspectionTemplate[]>;
  getInspectionTemplateById(id: string): Promise<InspectionTemplate | undefined>;
  updateInspectionTemplate(id: string, data: Partial<InsertInspectionTemplate>): Promise<InspectionTemplate>;
  deleteInspectionTemplate(id: string): Promise<void>;

  createVehicleInspection(data: InsertVehicleInspection): Promise<VehicleInspection>;
  getVehicleInspections(garageId: string, filters?: {status?: string, vehicleId?: string, customerId?: string}): Promise<VehicleInspection[]>;
  getVehicleInspectionById(id: string): Promise<VehicleInspection | undefined>;
  updateVehicleInspection(id: string, data: Partial<InsertVehicleInspection>): Promise<VehicleInspection>;
  deleteVehicleInspection(id: string): Promise<void>;

  // Module 46: Towing & Roadside Assistance
  createTowingRequest(data: InsertTowingRequest): Promise<TowingRequest>;
  getTowingRequests(garageId: string, filters?: {status?: string, serviceType?: string}): Promise<TowingRequest[]>;
  getTowingRequestById(id: string): Promise<TowingRequest | undefined>;
  updateTowingRequest(id: string, data: Partial<InsertTowingRequest>): Promise<TowingRequest>;
  deleteTowingRequest(id: string): Promise<void>;

  createTowTruck(data: InsertTowTruck): Promise<TowTruck>;
  getTowTrucks(garageId: string, filters?: {status?: string}): Promise<TowTruck[]>;
  getTowTruckById(id: string): Promise<TowTruck | undefined>;
  updateTowTruck(id: string, data: Partial<InsertTowTruck>): Promise<TowTruck>;
  deleteTowTruck(id: string): Promise<void>;
  updateTowTruckLocation(id: string, latitude: string, longitude: string): Promise<TowTruck>;

  // Module 48: Loaner Vehicle Management
  createLoanerVehicle(data: InsertLoanerVehicle): Promise<LoanerVehicle>;
  getLoanerVehicles(garageId: string, filters?: {status?: string, condition?: string}): Promise<LoanerVehicle[]>;
  getLoanerVehicleById(id: string): Promise<LoanerVehicle | undefined>;
  updateLoanerVehicle(id: string, data: Partial<InsertLoanerVehicle>): Promise<LoanerVehicle>;
  deleteLoanerVehicle(id: string): Promise<void>;

  createLoanerReservation(data: InsertLoanerReservation): Promise<LoanerReservation>;
  getLoanerReservations(garageId: string, filters?: {status?: string, loanerVehicleId?: string}): Promise<LoanerReservation[]>;
  getLoanerReservationById(id: string): Promise<LoanerReservation | undefined>;
  updateLoanerReservation(id: string, data: Partial<InsertLoanerReservation>): Promise<LoanerReservation>;
  deleteLoanerReservation(id: string): Promise<void>;

  // Module 42: Marketing Automation
  createMarketingCampaign(data: any): Promise<any>;
  getMarketingCampaigns(garageId: string, filters?: {status?: string, campaignType?: string}): Promise<any[]>;
  getMarketingCampaignById(id: string): Promise<any | undefined>;
  updateMarketingCampaign(id: string, data: any): Promise<any>;
  deleteMarketingCampaign(id: string): Promise<void>;
  getCampaignRecipients(campaignId: string): Promise<any[]>;
  createCampaignRecipient(data: any): Promise<any>;
  updateCampaignRecipient(id: string, data: any): Promise<any>;
  getCampaignAnalytics(campaignId: string): Promise<any>;

  // Module 44: Customer Loyalty Program
  createLoyaltyProgram(data: any): Promise<any>;
  getLoyaltyPrograms(garageId: string): Promise<any[]>;
  getLoyaltyProgramById(id: string): Promise<any | undefined>;
  updateLoyaltyProgram(id: string, data: any): Promise<any>;
  deleteLoyaltyProgram(id: string): Promise<void>;
  
  createLoyaltyAccount(data: any): Promise<any>;
  getLoyaltyAccounts(programId?: string, customerId?: string): Promise<any[]>;
  getLoyaltyAccountById(id: string): Promise<any | undefined>;
  updateLoyaltyAccount(id: string, data: any): Promise<any>;
  getLoyaltyAccountByCustomer(customerId: string): Promise<any | undefined>;
  
  createLoyaltyTransaction(data: any): Promise<any>;
  getLoyaltyTransactions(accountId: string): Promise<any[]>;
  getLoyaltyTransactionById(id: string): Promise<any | undefined>;
  
  createLoyaltyReward(data: any): Promise<any>;
  getLoyaltyRewards(programId: string, filters?: {isActive?: boolean}): Promise<any[]>;
  getLoyaltyRewardById(id: string): Promise<any | undefined>;
  updateLoyaltyReward(id: string, data: any): Promise<any>;
  deleteLoyaltyReward(id: string): Promise<void>;
  
  createLoyaltyRedemption(data: any): Promise<any>;
  getLoyaltyRedemptions(accountId?: string, filters?: {status?: string}): Promise<any[]>;
  getLoyaltyRedemptionById(id: string): Promise<any | undefined>;
  updateLoyaltyRedemption(id: string, data: any): Promise<any>;

  // Module 47: Document Management
  createDocumentCategory(data: any): Promise<any>;
  getDocumentCategories(garageId: string): Promise<any[]>;
  getDocumentCategoryById(id: string): Promise<any | undefined>;
  updateDocumentCategory(id: string, data: any): Promise<any>;
  deleteDocumentCategory(id: string): Promise<void>;
  
  createDocument(data: any): Promise<any>;
  getDocuments(garageId: string, filters?: {categoryId?: string, relatedType?: string, relatedId?: string, status?: string}): Promise<any[]>;
  getDocumentById(id: string): Promise<any | undefined>;
  updateDocument(id: string, data: any): Promise<any>;
  deleteDocument(id: string): Promise<void>;
  getExpiringDocuments(garageId: string, daysAhead: number): Promise<any[]>;
  
  createDocumentAccessLog(data: any): Promise<any>;
  getDocumentAccessLogs(documentId: string): Promise<any[]>;

  // Module 56: Franchise Command Center
  createFranchiseGroup(data: any): Promise<any>;
  getFranchiseGroups(): Promise<any[]>;
  getFranchiseGroupById(id: string): Promise<any | undefined>;
  updateFranchiseGroup(id: string, data: any): Promise<any>;
  deleteFranchiseGroup(id: string): Promise<void>;

  createFranchiseContract(data: any): Promise<any>;
  getFranchiseContracts(franchiseGroupId?: string): Promise<any[]>;
  getFranchiseContractById(id: string): Promise<any | undefined>;
  updateFranchiseContract(id: string, data: any): Promise<any>;
  deleteFranchiseContract(id: string): Promise<void>;

  createFranchiseKpi(data: any): Promise<any>;
  getFranchiseKpis(branchId: string, filters?: {month?: string}): Promise<any[]>;
  getFranchiseKpiById(id: string): Promise<any | undefined>;
  updateFranchiseKpi(id: string, data: any): Promise<any>;

  createRevenueSharingRule(data: any): Promise<any>;
  getRevenueSharingRules(franchiseGroupId: string): Promise<any[]>;
  getRevenueSharingRuleById(id: string): Promise<any | undefined>;
  updateRevenueSharingRule(id: string, data: any): Promise<any>;
  deleteRevenueSharingRule(id: string): Promise<void>;

  // Module 59: Globalization Layer
  createLocale(data: any): Promise<any>;
  getLocales(): Promise<any[]>;
  getLocaleById(id: string): Promise<any | undefined>;
  updateLocale(id: string, data: any): Promise<any>;
  deleteLocale(id: string): Promise<void>;

  createTranslationResource(data: any): Promise<any>;
  getTranslationResources(localeId: string, filters?: {namespace?: string}): Promise<any[]>;
  getTranslationResourceById(id: string): Promise<any | undefined>;
  updateTranslationResource(id: string, data: any): Promise<any>;
  deleteTranslationResource(id: string): Promise<void>;

  createCurrencyRate(data: any): Promise<any>;
  getCurrencyRates(fromCurrency?: string, toCurrency?: string): Promise<any[]>;
  getLatestCurrencyRate(fromCurrency: string, toCurrency: string): Promise<any | undefined>;

  createTaxRegion(data: any): Promise<any>;
  getTaxRegions(countryCode?: string): Promise<any[]>;
  getTaxRegionById(id: string): Promise<any | undefined>;
  updateTaxRegion(id: string, data: any): Promise<any>;
  deleteTaxRegion(id: string): Promise<void>;

  createTimezoneRule(data: any): Promise<any>;
  getTimezoneRules(branchId?: string): Promise<any[]>;
  getTimezoneRuleById(id: string): Promise<any | undefined>;
  updateTimezoneRule(id: string, data: any): Promise<any>;

  // Module 60: Parts Supply Network
  createNetworkPartner(data: any): Promise<any>;
  getNetworkPartners(filters?: {partnerType?: string, country?: string}): Promise<any[]>;
  getNetworkPartnerById(id: string): Promise<any | undefined>;
  updateNetworkPartner(id: string, data: any): Promise<any>;
  deleteNetworkPartner(id: string): Promise<void>;

  createFulfillmentOrder(data: any): Promise<any>;
  getFulfillmentOrders(filters?: {partnerId?: string, branchId?: string, status?: string}): Promise<any[]>;
  getFulfillmentOrderById(id: string): Promise<any | undefined>;
  updateFulfillmentOrder(id: string, data: any): Promise<any>;
  deleteFulfillmentOrder(id: string): Promise<void>;

  createShipmentEvent(data: any): Promise<any>;
  getShipmentEvents(fulfillmentOrderId: string): Promise<any[]>;

  createWarehouseNode(data: any): Promise<any>;
  getWarehouseNodes(partnerId?: string): Promise<any[]>;
  getWarehouseNodeById(id: string): Promise<any | undefined>;
  updateWarehouseNode(id: string, data: any): Promise<any>;
  deleteWarehouseNode(id: string): Promise<void>;

  // Module 57: Diagnostics & OBD Hub
  createObdDevice(data: any): Promise<any>;
  getObdDevices(branchId?: string): Promise<any[]>;
  getObdDeviceById(id: string): Promise<any | undefined>;
  updateObdDevice(id: string, data: any): Promise<any>;
  deleteObdDevice(id: string): Promise<void>;

  createDeviceAssignment(data: any): Promise<any>;
  getDeviceAssignments(deviceId?: string, technicianId?: string): Promise<any[]>;
  getDeviceAssignmentById(id: string): Promise<any | undefined>;
  updateDeviceAssignment(id: string, data: any): Promise<any>;

  createObdSession(data: any): Promise<any>;
  getObdSessions(filters?: {deviceId?: string, vehicleId?: string, status?: string}): Promise<any[]>;
  getObdSessionById(id: string): Promise<any | undefined>;
  updateObdSession(id: string, data: any): Promise<any>;

  createDiagnosticReport(data: any): Promise<any>;
  getDiagnosticReports(sessionId: string): Promise<any[]>;
  getDiagnosticReportById(id: string): Promise<any | undefined>;

  // Module 58: OEM Software Subscriptions
  createVendorCatalog(data: any): Promise<any>;
  getVendorCatalogs(): Promise<any[]>;
  getVendorCatalogById(id: string): Promise<any | undefined>;
  updateVendorCatalog(id: string, data: any): Promise<any>;
  deleteVendorCatalog(id: string): Promise<void>;

  createOemProduct(data: any): Promise<any>;
  getOemProducts(vendorCatalogId?: string): Promise<any[]>;
  getOemProductById(id: string): Promise<any | undefined>;
  updateOemProduct(id: string, data: any): Promise<any>;
  deleteOemProduct(id: string): Promise<void>;

  createSubscriptionLicense(data: any): Promise<any>;
  getSubscriptionLicenses(branchId?: string, filters?: {status?: string}): Promise<any[]>;
  getSubscriptionLicenseById(id: string): Promise<any | undefined>;
  updateSubscriptionLicense(id: string, data: any): Promise<any>;
  deleteSubscriptionLicense(id: string): Promise<void>;

  createLicenseAuditLog(data: any): Promise<any>;
  getLicenseAuditLogs(licenseId: string): Promise<any[]>;

  createEntitlementAssignment(data: any): Promise<any>;
  getEntitlementAssignments(licenseId?: string, userId?: string): Promise<any[]>;
  getEntitlementAssignmentById(id: string): Promise<any | undefined>;
  updateEntitlementAssignment(id: string, data: any): Promise<any>;

  // Emerging Technologies
  // Blockchain Vehicle History
  createBlockchainRecord(data: InsertBlockchainRecord): Promise<BlockchainRecord>;
  getBlockchainRecords(vehicleId?: string, garageId?: string): Promise<BlockchainRecord[]>;
  getBlockchainRecord(id: string): Promise<BlockchainRecord | undefined>;
  updateBlockchainRecord(id: string, data: Partial<BlockchainRecord>): Promise<BlockchainRecord>;
  deleteBlockchainRecord(id: string): Promise<void>;
  
  // AR Repair Guides
  createArRepairGuide(data: InsertARRepairGuide): Promise<ARRepairGuide>;
  getArRepairGuides(garageId?: string): Promise<ARRepairGuide[]>;
  getArRepairGuide(id: string): Promise<ARRepairGuide | undefined>;
  updateArRepairGuide(id: string, data: Partial<ARRepairGuide>): Promise<ARRepairGuide>;
  deleteArRepairGuide(id: string): Promise<void>;
  createArGuideSession(data: InsertARGuideSession): Promise<ARGuideSession>;
  getArGuideSessions(guideId?: string, technicianId?: string): Promise<ARGuideSession[]>;
  deleteArGuideSession(id: string): Promise<void>;
  
  // IoT Sensor Integration
  createIotSensor(data: InsertIoTSensor): Promise<IoTSensor>;
  getIotSensors(vehicleId?: string): Promise<IoTSensor[]>;
  updateIotSensor(id: string, data: Partial<IoTSensor>): Promise<IoTSensor>;
  deleteIotSensor(id: string): Promise<void>;
  // IoT rather than Iot: the implementations and the route call sites both
  // use that casing, so the interface was declaring methods nothing had.
  createIoTSensorReading(data: InsertIoTSensorReading): Promise<IoTSensorReading>;
  getIoTSensorReadings(sensorId?: string, vehicleId?: string): Promise<IoTSensorReading[]>;
  createIotAlert(data: InsertIoTAlert): Promise<IoTAlert>;
  getIotAlerts(sensorId?: string, status?: string): Promise<IoTAlert[]>;
  updateIotAlert(id: string, data: Partial<IoTAlert>): Promise<IoTAlert>;
  
  // 3D Parts Visualization
  createParts3DModel(data: InsertParts3DModel): Promise<Parts3DModel>;
  getParts3DModels(garageId?: string): Promise<Parts3DModel[]>;
  getParts3DModel(id: string): Promise<Parts3DModel | undefined>;
  updateParts3DModel(id: string, data: Partial<Parts3DModel>): Promise<Parts3DModel>;
  deleteParts3DModel(id: string): Promise<void>;
  createParts3DViewSession(data: InsertParts3DViewSession): Promise<Parts3DViewSession>;
  getParts3DViewSessions(modelId?: string): Promise<Parts3DViewSession[]>;
  
  // Drone Inspection Services
  createDroneInspection(data: InsertDroneInspection): Promise<DroneInspection>;
  getDroneInspections(garageId?: string, vehicleId?: string): Promise<DroneInspection[]>;
  getDroneInspection(id: string): Promise<DroneInspection | undefined>;
  updateDroneInspection(id: string, data: Partial<DroneInspection>): Promise<DroneInspection>;
  deleteDroneInspection(id: string): Promise<void>;
  createDroneMedia(data: InsertDroneMedia): Promise<DroneMedia>;
  getDroneMedia(inspectionId: string): Promise<DroneMedia[]>;
  
  // AI Video Analysis
  createAiVideoAnalysis(data: InsertAIVideoAnalysis): Promise<AIVideoAnalysis>;
  getAiVideoAnalyses(customerId?: string, vehicleId?: string): Promise<AIVideoAnalysis[]>;
  updateAiVideoAnalysis(id: string, data: Partial<AIVideoAnalysis>): Promise<AIVideoAnalysis>;
  deleteAiVideoAnalysis(id: string): Promise<void>;
  
  // Digital Twin Simulations
  createDigitalTwin(data: InsertDigitalTwin): Promise<DigitalTwin>;
  getDigitalTwins(vehicleId?: string): Promise<DigitalTwin[]>;
  updateDigitalTwin(id: string, data: Partial<DigitalTwin>): Promise<DigitalTwin>;
  deleteDigitalTwin(id: string): Promise<void>;
  createTwinSimulation(data: InsertTwinSimulation): Promise<TwinSimulation>;
  getTwinSimulations(twinId: string): Promise<TwinSimulation[]>;
  updateTwinSimulation(id: string, data: Partial<TwinSimulation>): Promise<TwinSimulation>;
  
  // ML Fraud Detection
  createFraudDetectionCase(data: InsertFraudDetectionCase): Promise<FraudDetectionCase>;
  getFraudDetectionCases(garageId?: string, riskLevel?: string): Promise<FraudDetectionCase[]>;
  updateFraudDetectionCase(id: string, data: Partial<FraudDetectionCase>): Promise<FraudDetectionCase>;
  deleteFraudDetectionCase(id: string): Promise<void>;
  createFraudDetectionRule(data: InsertFraudDetectionRule): Promise<FraudDetectionRule>;
  getFraudDetectionRules(garageId: string): Promise<FraudDetectionRule[]>;
  updateFraudDetectionRule(id: string, data: Partial<FraudDetectionRule>): Promise<FraudDetectionRule>;
  deleteFraudDetectionRule(id: string): Promise<void>;
  
  // Biometric Authentication
  createBiometricProfile(data: InsertBiometricProfile): Promise<BiometricProfile>;
  getBiometricProfile(userId: string): Promise<BiometricProfile | undefined>;
  updateBiometricProfile(userId: string, data: Partial<BiometricProfile>): Promise<BiometricProfile>;
  deleteBiometricProfile(userId: string): Promise<void>;
  createBiometricLog(data: InsertBiometricLog): Promise<BiometricLog>;
  getBiometricLogs(userId: string): Promise<BiometricLog[]>;
  
  // 5G Remote Collaboration
  createCollaborationSession(data: InsertCollaborationSession): Promise<CollaborationSession>;
  getCollaborationSessions(garageId?: string, status?: string): Promise<CollaborationSession[]>;
  updateCollaborationSession(id: string, data: Partial<CollaborationSession>): Promise<CollaborationSession>;
  deleteCollaborationSession(id: string): Promise<void>;
  createCollaborationExpert(data: InsertCollaborationExpert): Promise<CollaborationExpert>;
  getCollaborationExperts(sessionId: string): Promise<CollaborationExpert[]>;
  
  // Edge Computing Diagnostics
  createEdgeDevice(data: InsertEdgeDevice): Promise<EdgeDevice>;
  getEdgeDevices(garageId?: string): Promise<EdgeDevice[]>;
  updateEdgeDevice(id: string, data: Partial<EdgeDevice>): Promise<EdgeDevice>;
  deleteEdgeDevice(id: string): Promise<void>;
  createEdgeDiagnostic(data: InsertEdgeDiagnostic): Promise<EdgeDiagnostic>;
  getEdgeDiagnostics(deviceId?: string, vehicleId?: string): Promise<EdgeDiagnostic[]>;
  updateEdgeDiagnostic(id: string, data: Partial<EdgeDiagnostic>): Promise<EdgeDiagnostic>;
  deleteEdgeDiagnostic(id: string): Promise<void>;
  
  // Quantum-Inspired Pricing
  createPricingOptimization(data: InsertPricingOptimization): Promise<PricingOptimization>;
  getPricingOptimizations(garageId: string, serviceType?: string): Promise<PricingOptimization[]>;
  updatePricingOptimization(id: string, data: Partial<PricingOptimization>): Promise<PricingOptimization>;
  deletePricingOptimization(id: string): Promise<void>;
  createPricingRule(data: InsertPricingRule): Promise<PricingRule>;
  getPricingRules(garageId: string): Promise<PricingRule[]>;
  updatePricingRule(id: string, data: Partial<PricingRule>): Promise<PricingRule>;
  deletePricingRule(id: string): Promise<void>;
  
  // Supporting tables for emerging technologies
  createIotAlert(data: any): Promise<any>;
  getIotAlerts(sensorId?: string, vehicleId?: string): Promise<any[]>;
  createDroneMedia(data: any): Promise<any>;
  getDroneMedia(inspectionId: string): Promise<any[]>;
  createTwinSimulation(data: any): Promise<any>;
  getTwinSimulations(twinId: string): Promise<any[]>;
  createCollaborationExpert(data: any): Promise<any>;
  getCollaborationExperts(): Promise<any[]>;
  createPricingRule(data: any): Promise<any>;
  getPricingRules(garageId?: string): Promise<any[]>;
  createBiometricLog(data: any): Promise<any>;
  getBiometricLogs(userId: string): Promise<any[]>;
  createFraudDetectionRule(data: any): Promise<any>;
  getFraudDetectionRules(garageId?: string): Promise<any[]>;
  
  // Neural Network Diagnostics
  getNeuralDiagnostics(garageId: string): Promise<NeuralDiagnostic[]>;
  createNeuralDiagnostic(data: InsertNeuralDiagnostic): Promise<NeuralDiagnostic>;
  getNeuralTrainingSessions(garageId: string): Promise<NeuralTrainingSession[]>;
  createNeuralTrainingSession(data: InsertNeuralTrainingSession): Promise<NeuralTrainingSession>;
  
  // Computer Vision QC
  getVisionQualityChecks(garageId: string): Promise<VisionQualityCheck[]>;
  createVisionQualityCheck(data: InsertVisionQualityCheck): Promise<VisionQualityCheck>;
  getVisionDefects(garageId: string): Promise<VisionDefect[]>;
  createVisionDefect(data: InsertVisionDefect): Promise<VisionDefect>;
  
  // NLP Service Writer
  getNLPServiceRequests(garageId: string): Promise<NLPServiceRequest[]>;
  createNLPServiceRequest(data: InsertNLPServiceRequest): Promise<NLPServiceRequest>;
  getNLPTrainingData(garageId: string): Promise<NLPTrainingData[]>;
  createNLPTrainingData(data: InsertNLPTrainingData): Promise<NLPTrainingData>;
  
  // RL Parts Optimizer
  getRLPartsOptimizations(garageId: string): Promise<RLPartsOptimization[]>;
  createRLPartsOptimization(data: InsertRLPartsOptimization): Promise<RLPartsOptimization>;
  getRLLearningEpisodes(garageId: string): Promise<RLLearningEpisode[]>;
  createRLLearningEpisode(data: InsertRLLearningEpisode): Promise<RLLearningEpisode>;
  
  // Metaverse Showroom
  getMetaverseShowrooms(garageId: string): Promise<MetaverseShowroom[]>;
  createMetaverseShowroom(data: InsertMetaverseShowroom): Promise<MetaverseShowroom>;
  getMetaverseVisits(garageId: string): Promise<MetaverseVisit[]>;
  createMetaverseVisit(data: InsertMetaverseVisit): Promise<MetaverseVisit>;
  
  // Holographic Guides
  getHolographicGuides(garageId: string): Promise<HolographicGuide[]>;
  createHolographicGuide(data: InsertHolographicGuide): Promise<HolographicGuide>;
  getHolographicSessions(garageId: string): Promise<HolographicSession[]>;
  createHolographicSession(data: InsertHolographicSession): Promise<HolographicSession>;
  
  // Spatial Computing
  getSpatialWorkstations(garageId: string): Promise<SpatialWorkstation[]>;
  createSpatialWorkstation(data: InsertSpatialWorkstation): Promise<SpatialWorkstation>;
  getSpatialDiagnosticSessions(garageId: string): Promise<SpatialDiagnosticSession[]>;
  createSpatialDiagnosticSession(data: InsertSpatialDiagnosticSession): Promise<SpatialDiagnosticSession>;
  
  // Autonomous Robots
  getAutonomousRobots(garageId: string): Promise<AutonomousRobot[]>;
  createAutonomousRobot(data: InsertAutonomousRobot): Promise<AutonomousRobot>;
  getRobotTasks(garageId: string): Promise<RobotTask[]>;
  createRobotTask(data: InsertRobotTask): Promise<RobotTask>;
  
  // Drone Fleet
  getDroneFleets(garageId: string): Promise<DroneFleet[]>;
  createDroneFleet(data: InsertDroneFleet): Promise<DroneFleet>;
  getDroneMissions(garageId: string): Promise<DroneMission[]>;
  createDroneMission(data: InsertDroneMission): Promise<DroneMission>;
  
  // Smart Contracts
  getSmartContracts(garageId: string): Promise<SmartContract[]>;
  createSmartContract(data: InsertSmartContract): Promise<SmartContract>;
  getContractEvents(garageId: string): Promise<ContractEvent[]>;
  createContractEvent(data: InsertContractEvent): Promise<ContractEvent>;
  
  // Carbon Credits
  getCarbonCredits(garageId: string): Promise<CarbonCredit[]>;
  createCarbonCredit(data: InsertCarbonCredit): Promise<CarbonCredit>;
  getCarbonEmissions(garageId: string): Promise<CarbonEmission[]>;
  createCarbonEmission(data: InsertCarbonEmission): Promise<CarbonEmission>;
  
  // Green Energy
  getGreenEnergyAssets(garageId: string): Promise<GreenEnergyAsset[]>;
  createGreenEnergyAsset(data: InsertGreenEnergyAsset): Promise<GreenEnergyAsset>;
  getEVChargingStations(garageId: string): Promise<EVChargingStation[]>;
  createEVChargingStation(data: InsertEVChargingStation): Promise<EVChargingStation>;
  
  // Circular Economy
  getRecycledParts(garageId: string): Promise<RecycledPart[]>;
  createRecycledPart(data: InsertRecycledPart): Promise<RecycledPart>;
  getSustainabilityMetrics(garageId: string): Promise<SustainabilityMetric[]>;
  createSustainabilityMetric(data: InsertSustainabilityMetric): Promise<SustainabilityMetric>;
  
  // Satellite
  getSatelliteConnections(garageId: string): Promise<SatelliteConnection[]>;
  createSatelliteConnection(data: InsertSatelliteConnection): Promise<SatelliteConnection>;
  getSatelliteUsageLogs(garageId: string): Promise<SatelliteUsageLog[]>;
  createSatelliteUsageLog(data: InsertSatelliteUsageLog): Promise<SatelliteUsageLog>;
  
  // Quantum Encryption
  getQuantumEncryptionKeys(garageId: string): Promise<QuantumEncryptionKey[]>;
  createQuantumEncryptionKey(data: InsertQuantumEncryptionKey): Promise<QuantumEncryptionKey>;
  getQuantumSecureMessages(garageId: string): Promise<QuantumSecureMessage[]>;
  createQuantumSecureMessage(data: InsertQuantumSecureMessage): Promise<QuantumSecureMessage>;

  // Payroll Management Module
  getPayrollEmployees(garageId: string): Promise<PayrollEmployee[]>;
  getPayrollEmployee(id: string): Promise<PayrollEmployee | undefined>;
  createPayrollEmployee(data: InsertPayrollEmployee): Promise<PayrollEmployee>;
  updatePayrollEmployee(id: string, data: Partial<PayrollEmployee>): Promise<PayrollEmployee>;
  /** Resolves false when no row matched, so callers can distinguish a
   *  no-op delete from a successful one. */
  deletePayrollEmployee(id: string): Promise<boolean>;
  getPayPeriods(garageId: string, status?: string): Promise<PayPeriod[]>;
  getPayPeriod(id: string): Promise<PayPeriod | undefined>;
  createPayPeriod(data: InsertPayPeriod): Promise<PayPeriod>;
  updatePayPeriod(id: string, data: Partial<PayPeriod>): Promise<PayPeriod>;
  deletePayPeriod(id: string): Promise<void>;
  getPayrollRuns(payPeriodId: string): Promise<PayrollRun[]>;
  getPayrollRun(id: string): Promise<PayrollRun | undefined>;
  createPayrollRun(data: InsertPayrollRun): Promise<PayrollRun>;
  updatePayrollRun(id: string, data: Partial<PayrollRun>): Promise<PayrollRun>;
  deletePayrollRun(id: string): Promise<void>;

  // Expense Tracking Module
  getExpenseCategories(garageId: string): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: string): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(data: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory>;
  deleteExpenseCategory(id: string): Promise<void>;
  getExpenses(garageId: string, status?: string, categoryId?: string): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(data: InsertExpense): Promise<Expense>;
  updateExpense(id: string, data: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  approveExpense(id: string, approverId: string): Promise<Expense>;
  rejectExpense(id: string, approverId: string): Promise<Expense>;

  // Towing Services Module
  getTowingJobs(garageId: string, status?: string): Promise<TowingJob[]>;
  getTowingJob(id: string): Promise<TowingJob | undefined>;
  createTowingJob(data: InsertTowingJob): Promise<TowingJob>;
  updateTowingJob(id: string, data: Partial<TowingJob>): Promise<TowingJob>;
  deleteTowingJob(id: string): Promise<void>;

  // Vehicle Storage Module
  getStorageFacilities(garageId: string): Promise<StorageFacility[]>;
  getStorageFacility(id: string): Promise<StorageFacility | undefined>;
  createStorageFacility(data: InsertStorageFacility): Promise<StorageFacility>;
  updateStorageFacility(id: string, data: Partial<StorageFacility>): Promise<StorageFacility>;
  deleteStorageFacility(id: string): Promise<void>;
  getVehicleStorageAssignments(facilityId?: string, vehicleId?: string): Promise<VehicleStorageAssignment[]>;
  getVehicleStorageAssignment(id: string): Promise<VehicleStorageAssignment | undefined>;
  createVehicleStorageAssignment(data: InsertVehicleStorageAssignment): Promise<VehicleStorageAssignment>;
  updateVehicleStorageAssignment(id: string, data: Partial<VehicleStorageAssignment>): Promise<VehicleStorageAssignment>;
  deleteVehicleStorageAssignment(id: string): Promise<void>;

  // Telematics Integration Module
  getTelematicsFeeds(vehicleId?: string, deviceId?: string): Promise<TelematicsFeed[]>;
  getTelematicsFeed(id: string): Promise<TelematicsFeed | undefined>;
  createTelematicsFeed(data: InsertTelematicsFeed): Promise<TelematicsFeed>;
  getTelematicsAlerts(vehicleId?: string, isResolved?: boolean): Promise<TelematicsAlert[]>;
  getTelematicsAlert(id: string): Promise<TelematicsAlert | undefined>;
  createTelematicsAlert(data: InsertTelematicsAlert): Promise<TelematicsAlert>;
  updateTelematicsAlert(id: string, data: Partial<TelematicsAlert>): Promise<TelematicsAlert>;
  resolveTelematicsAlert(id: string, userId: string): Promise<TelematicsAlert>;

  // Knowledge Base Module
  getArticleCategories(): Promise<ArticleCategory[]>;
  getArticleCategory(id: string): Promise<ArticleCategory | undefined>;
  createArticleCategory(data: InsertArticleCategory): Promise<ArticleCategory>;
  updateArticleCategory(id: string, data: Partial<ArticleCategory>): Promise<ArticleCategory>;
  deleteArticleCategory(id: string): Promise<void>;
  getKnowledgeArticles(categoryId?: string, isPublished?: boolean): Promise<KnowledgeArticle[]>;
  getKnowledgeArticle(id: string): Promise<KnowledgeArticle | undefined>;
  createKnowledgeArticle(data: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  updateKnowledgeArticle(id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle>;
  deleteKnowledgeArticle(id: string): Promise<void>;
  incrementArticleViews(id: string): Promise<void>;
  markArticleHelpful(id: string, isHelpful: boolean): Promise<void>;

  // Training & Certification LMS Module
  getTrainingModules(isActive?: boolean): Promise<TrainingModule[]>;
  getTrainingModule(id: string): Promise<TrainingModule | undefined>;
  createTrainingModule(data: InsertTrainingModule): Promise<TrainingModule>;
  updateTrainingModule(id: string, data: Partial<TrainingModule>): Promise<TrainingModule>;
  deleteTrainingModule(id: string): Promise<void>;
  getCertifications(isActive?: boolean): Promise<Certification[]>;
  getCertification(id: string): Promise<Certification | undefined>;
  createCertification(data: InsertCertification): Promise<Certification>;
  updateCertification(id: string, data: Partial<Certification>): Promise<Certification>;
  deleteCertification(id: string): Promise<void>;
  getCertificationAttempts(userId?: string, certificationId?: string): Promise<CertificationAttempt[]>;
  getCertificationAttempt(id: string): Promise<CertificationAttempt | undefined>;
  createCertificationAttempt(data: InsertCertificationAttempt): Promise<CertificationAttempt>;
  updateCertificationAttempt(id: string, data: Partial<CertificationAttempt>): Promise<CertificationAttempt>;

  // Google My Business Module
  getGoogleBusinessProfiles(garageId: string): Promise<GoogleBusinessProfile[]>;
  getGoogleBusinessProfile(id: string): Promise<GoogleBusinessProfile | undefined>;
  createGoogleBusinessProfile(data: InsertGoogleBusinessProfile): Promise<GoogleBusinessProfile>;
  updateGoogleBusinessProfile(id: string, data: Partial<GoogleBusinessProfile>): Promise<GoogleBusinessProfile>;
  deleteGoogleBusinessProfile(id: string): Promise<void>;
  getGmbPosts(profileId?: string, status?: string): Promise<GmbPost[]>;
  getGmbPost(id: string): Promise<GmbPost | undefined>;
  createGmbPost(data: InsertGmbPost): Promise<GmbPost>;
  updateGmbPost(id: string, data: Partial<GmbPost>): Promise<GmbPost>;
  deleteGmbPost(id: string): Promise<void>;
  publishGmbPost(id: string): Promise<GmbPost>;
  getGmbReviews(profileId?: string): Promise<GmbReview[]>;
  getGmbReview(id: string): Promise<GmbReview | undefined>;
  createGmbReview(data: InsertGmbReview): Promise<GmbReview>;
  updateGmbReview(id: string, data: Partial<GmbReview>): Promise<GmbReview>;
  respondToGmbReview(id: string, responseText: string): Promise<GmbReview>;

  // Compliance Management Module
  getCompliancePolicies(garageId: string, status?: string): Promise<CompliancePolicy[]>;
  getCompliancePolicy(id: string): Promise<CompliancePolicy | undefined>;
  createCompliancePolicy(data: InsertCompliancePolicy): Promise<CompliancePolicy>;
  updateCompliancePolicy(id: string, data: Partial<CompliancePolicy>): Promise<CompliancePolicy>;
  deleteCompliancePolicy(id: string): Promise<void>;
  getComplianceAudits(garageId: string, policyId?: string, status?: string): Promise<ComplianceAudit[]>;
  getComplianceAudit(id: string): Promise<ComplianceAudit | undefined>;
  createComplianceAudit(data: InsertComplianceAudit): Promise<ComplianceAudit>;
  updateComplianceAudit(id: string, data: Partial<ComplianceAudit>): Promise<ComplianceAudit>;
  deleteComplianceAudit(id: string): Promise<void>;
  getComplianceTasks(garageId: string, policyId?: string, status?: string): Promise<ComplianceTask[]>;
  getComplianceTask(id: string): Promise<ComplianceTask | undefined>;
  createComplianceTask(data: InsertComplianceTask): Promise<ComplianceTask>;
  updateComplianceTask(id: string, data: Partial<ComplianceTask>): Promise<ComplianceTask>;
  deleteComplianceTask(id: string): Promise<void>;
  completeComplianceTask(id: string): Promise<ComplianceTask>;

  // IoT Vehicle Health Monitoring Module
  getIotSensors(vehicleId?: string, status?: string): Promise<any[]>;
  getIotSensor(id: string): Promise<any | undefined>;
  createIotSensor(data: any): Promise<any>;
  updateIotSensor(id: string, data: any): Promise<any>;
  deleteIotSensor(id: string): Promise<void>;
  recordSensorReading(data: any): Promise<any>;
  getSensorReadings(sensorId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getRecentAnomalies(vehicleId: string, limit?: number): Promise<any[]>;
  getIotAlerts(vehicleId?: string, status?: string, severity?: string): Promise<any[]>;
  getIotAlert(id: string): Promise<any | undefined>;
  acknowledgeIotAlert(id: string, userId: string): Promise<any>;
  resolveIotAlert(id: string, userId: string, resolution: string, jobCardId?: string): Promise<any>;
  processAlertRules(sensorId: string, readingValue: number): Promise<any[]>;

  // Automated Inventory Reordering Module
  getInventoryForecasts(garageId: string): Promise<InventoryForecast[]>;
  getInventoryForecast(id: string): Promise<InventoryForecast | undefined>;
  createInventoryForecast(data: InsertInventoryForecast): Promise<InventoryForecast>;
  getReplenishmentOrders(garageId?: string, status?: string): Promise<ReplenishmentOrder[]>;
  getReplenishmentOrder(id: string): Promise<ReplenishmentOrder | undefined>;
  createReplenishmentOrder(data: InsertReplenishmentOrder): Promise<ReplenishmentOrder>;
  updateReplenishmentOrder(id: string, data: Partial<ReplenishmentOrder>): Promise<ReplenishmentOrder>;
  approveReplenishmentOrder(id: string, userId: string): Promise<ReplenishmentOrder>;

  // Customer Loyalty Program Module
  getLoyaltyTiers(garageId: string): Promise<LoyaltyTier[]>;
  getLoyaltyTier(id: string): Promise<LoyaltyTier | undefined>;
  createLoyaltyTier(data: InsertLoyaltyTier): Promise<LoyaltyTier>;
  updateLoyaltyTier(id: string, data: Partial<LoyaltyTier>): Promise<LoyaltyTier>;
  deleteLoyaltyTier(id: string): Promise<void>;
  // The loyalty_accounts table is the older of the two loyalty models; the
  // current one is customer_loyalty_accounts, which owns the unsuffixed
  // names declared above. Redeclaring them here merged the two into
  // overloads that no implementation could satisfy.
  getLoyaltyAccountsLegacy(garageId?: string): Promise<LoyaltyAccount[]>;
  getLoyaltyAccount(id: string): Promise<LoyaltyAccount | undefined>;
  getLoyaltyAccountByCustomerLegacy(customerId: string): Promise<LoyaltyAccount | undefined>;
  createLoyaltyAccountLegacy(data: InsertLoyaltyAccount): Promise<LoyaltyAccount>;
  updateLoyaltyAccountLegacy(id: string, data: Partial<LoyaltyAccount>): Promise<LoyaltyAccount>;
  addLoyaltyPoints(accountId: string, points: number): Promise<LoyaltyAccount>;
  redeemLoyaltyPoints(accountId: string, points: number): Promise<LoyaltyAccount>;
  getLoyaltyOffers(garageId?: string, isActive?: boolean): Promise<LoyaltyOffer[]>;
  getLoyaltyOffer(id: string): Promise<LoyaltyOffer | undefined>;
  createLoyaltyOffer(data: InsertLoyaltyOffer): Promise<LoyaltyOffer>;
  updateLoyaltyOffer(id: string, data: Partial<LoyaltyOffer>): Promise<LoyaltyOffer>;
  deleteLoyaltyOffer(id: string): Promise<void>;

  // Workshop Calendar Module
  getWorkshopResources(garageId: string): Promise<WorkshopResource[]>;
  getWorkshopResource(id: string): Promise<WorkshopResource | undefined>;
  createWorkshopResource(data: InsertWorkshopResource): Promise<WorkshopResource>;
  updateWorkshopResource(id: string, data: Partial<WorkshopResource>): Promise<WorkshopResource>;
  deleteWorkshopResource(id: string): Promise<void>;
  getCalendarAppointments(garageId: string, startDate?: Date, endDate?: Date): Promise<CalendarAppointment[]>;
  getCalendarAppointment(id: string): Promise<CalendarAppointment | undefined>;
  createCalendarAppointment(data: InsertCalendarAppointment): Promise<CalendarAppointment>;
  updateCalendarAppointment(id: string, data: Partial<CalendarAppointment>): Promise<CalendarAppointment>;
  deleteCalendarAppointment(id: string): Promise<void>;
  moveCalendarAppointment(id: string, newStart: Date, newEnd: Date, resourceId?: string): Promise<CalendarAppointment>;

  // AR Overlay Module
  getArWorkInstructions(garageId?: string): Promise<ArWorkInstruction[]>;
  getArWorkInstruction(id: string): Promise<ArWorkInstruction | undefined>;
  createArWorkInstruction(data: InsertArWorkInstruction): Promise<ArWorkInstruction>;
  updateArWorkInstruction(id: string, data: Partial<ArWorkInstruction>): Promise<ArWorkInstruction>;
  deleteArWorkInstruction(id: string): Promise<void>;
  getArSessionLogs(garageId: string, technicianId?: string): Promise<ArSessionLog[]>;
  getArSessionLog(id: string): Promise<ArSessionLog | undefined>;
  createArSessionLog(data: InsertArSessionLog): Promise<ArSessionLog>;
  updateArSessionLog(id: string, data: Partial<ArSessionLog>): Promise<ArSessionLog>;
  getArDevicePairings(garageId: string): Promise<ArDevicePairing[]>;
  getArDevicePairing(id: string): Promise<ArDevicePairing | undefined>;
  createArDevicePairing(data: InsertArDevicePairing): Promise<ArDevicePairing>;
  updateArDevicePairing(id: string, data: Partial<ArDevicePairing>): Promise<ArDevicePairing>;
  deleteArDevicePairing(id: string): Promise<void>;

  // Dynamic Pricing Module
  getMarketPricingData(garageId?: string, filters?: { region?: string; serviceType?: string; vehicleClass?: string }): Promise<MarketPricingData[]>;
  getMarketPricingDataItem(id: string): Promise<MarketPricingData | undefined>;
  createMarketPricingData(data: InsertMarketPricingData): Promise<MarketPricingData>;
  updateMarketPricingData(id: string, data: Partial<MarketPricingData>): Promise<MarketPricingData>;
  deleteMarketPricingData(id: string): Promise<void>;
  getVehiclePricingFactors(garageId?: string, vehicleMake?: string): Promise<VehiclePricingFactor[]>;
  getVehiclePricingFactor(id: string): Promise<VehiclePricingFactor | undefined>;
  createVehiclePricingFactor(data: InsertVehiclePricingFactor): Promise<VehiclePricingFactor>;
  updateVehiclePricingFactor(id: string, data: Partial<VehiclePricingFactor>): Promise<VehiclePricingFactor>;
  deleteVehiclePricingFactor(id: string): Promise<void>;
  getDynamicPricingSuggestions(garageId: string, filters?: { vehicleId?: string; status?: string }): Promise<DynamicPricingSuggestion[]>;
  getDynamicPricingSuggestion(id: string): Promise<DynamicPricingSuggestion | undefined>;
  createDynamicPricingSuggestion(data: InsertDynamicPricingSuggestion): Promise<DynamicPricingSuggestion>;
  updateDynamicPricingSuggestion(id: string, data: Partial<DynamicPricingSuggestion>): Promise<DynamicPricingSuggestion>;
  deleteDynamicPricingSuggestion(id: string): Promise<void>;
  calculateDynamicPrice(params: { serviceType: string; vehicleMake?: string; vehicleYear?: number; vehicleClass?: string; region?: string }): Promise<{ basePrice: number; suggestedPrice: number; minPrice: number; maxPrice: number; factors: any; confidence: number }>;

  // Search methods (server-side filtered, garage-scoped — fixes OOM in /api/search)
  searchCustomers(garageId: string, pattern: string, limit: number): Promise<SafeUser[]>;
  searchVehicles(garageId: string, pattern: string, limit: number): Promise<Vehicle[]>;
  searchParts(garageId: string, pattern: string, limit: number): Promise<SparePart[]>;
  searchInvoices(garageId: string, pattern: string, limit: number): Promise<Invoice[]>;
  searchJobCards(garageId: string, pattern: string, limit: number): Promise<JobCard[]>;
  searchAppointments(garageId: string, pattern: string, limit: number): Promise<Appointment[]>;

  // Paginated list methods (SA-017)
  getCustomersPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SafeUser[]>;
  countCustomers(garageId: string | undefined): Promise<number>;
  getVehiclesPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Vehicle[]>;
  countVehicles(garageId: string | undefined): Promise<number>;
  getJobCardsPaginated(garageId: string | undefined, assignedTo: string | undefined, limit: number, offset: number): Promise<JobCard[]>;
  countJobCards(garageId: string | undefined, assignedTo: string | undefined): Promise<number>;
  getInvoicesPaginated(garageId: string | undefined, status: string | undefined, limit: number, offset: number): Promise<Invoice[]>;
  countInvoices(garageId: string | undefined, status: string | undefined): Promise<number>;
  getAppointmentsPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Appointment[]>;
  countAppointments(garageId: string | undefined): Promise<number>;
  getSparePartsPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SparePart[]>;
  countSpareParts(garageId: string | undefined): Promise<number>;
  getSuppliersPaginated(garageId: string | undefined, limit: number, offset: number): Promise<any[]>;
  countSuppliers(garageId: string | undefined): Promise<number>;
  getGaragesPaginated(limit: number, offset: number): Promise<any[]>;
  countGarages(): Promise<number>;
  getTechniciansPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SafeUser[]>;
  countTechnicians(garageId: string | undefined): Promise<number>;
  getEstimatesPaginated(garageId: string | undefined, status: string | undefined, limit: number, offset: number): Promise<any[]>;
  countEstimates(garageId: string | undefined, status: string | undefined): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    // Defense-in-depth: never persist a cleartext password. bcrypt hashes start
    // with $2a/$2b/$2y$ — if the caller passed something else, hash it here.
    const data: any = { ...userData };
    if (typeof data.password === 'string' && !/^\$2[aby]\$/.test(data.password)) {
      const bcrypt = await import('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
    }
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getTechnicians(garageId?: string): Promise<SafeUser[]> {
    if (garageId) {
      return (await db.select().from(users).where(
        and(
          eq(users.userType, 'technician'),
          eq(users.garageId, garageId)
        )
      )).map(stripPassword);
    }
    return (await db.select().from(users).where(eq(users.userType, 'technician'))).map(stripPassword);
  }

  async getTechnicianProfile(userId: string): Promise<TechnicianProfile | undefined> {
    const [profile] = await db.select().from(technicianProfiles).where(eq(technicianProfiles.userId, userId));
    return profile;
  }

  async createTechnicianProfile(data: InsertTechnicianProfile): Promise<TechnicianProfile> {
    const [profile] = await db.insert(technicianProfiles).values(data).returning();
    return profile;
  }

  async updateTechnicianProfile(userId: string, data: Partial<TechnicianProfile>): Promise<TechnicianProfile> {
    const [profile] = await db
      .update(technicianProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(technicianProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Garage operations
  async getGarages(): Promise<Garage[]> {
    return await db.select().from(garages);
  }

  async getGarageById(id: string): Promise<Garage | undefined> {
    const [garage] = await db.select().from(garages).where(eq(garages.id, id));
    return garage;
  }

  async createGarage(garageData: typeof garages.$inferInsert): Promise<Garage> {
    const [garage] = await db.insert(garages).values(garageData).returning();
    return garage;
  }

  // Branch operations
  async getBranchesByGarageId(garageId: string): Promise<Branch[]> {
    return await db.select().from(branches).where(eq(branches.garageId, garageId));
  }

  async createBranch(branchData: typeof branches.$inferInsert): Promise<Branch> {
    const [branch] = await db.insert(branches).values(branchData).returning();
    return branch;
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createRole(roleData: typeof roles.$inferInsert): Promise<Role> {
    const [role] = await db.insert(roles).values(roleData).returning();
    return role;
  }

  // User-Role-Branch operations
  async assignUserRole(userId: string, roleId: string, branchId: string, isPrimary: boolean = false): Promise<void> {
    await db.insert(userRoleBranch).values({
      userId,
      roleId,
      branchId,
      isPrimaryRole: isPrimary,
    });
  }

  async getUserRoles(userId: string): Promise<any[]> {
    return await db
      .select({
        role: roles,
        branch: branches,
        garage: garages,
        assignedAt: userRoleBranch.assignedAt,
        isPrimaryRole: userRoleBranch.isPrimaryRole,
      })
      .from(userRoleBranch)
      .leftJoin(roles, eq(userRoleBranch.roleId, roles.id))
      .leftJoin(branches, eq(userRoleBranch.branchId, branches.id))
      .leftJoin(garages, eq(branches.garageId, garages.id))
      .where(eq(userRoleBranch.userId, userId));
  }

  // Job Card operations - Module 8: Job Cards & Task Assignment
  async getJobCards(garageId?: string, assignedTo?: string, customerId?: string): Promise<JobCard[]> {
    const conditions = [];
    if (garageId) {
      conditions.push(eq(jobCards.garageId, garageId));
    }
    if (assignedTo) {
      conditions.push(eq(jobCards.assignedTo, assignedTo));
    }
    // Customer-role callers pass their own id so they only see their jobs.
    if (customerId) {
      conditions.push(eq(jobCards.customerId, customerId));
    }

    if (conditions.length > 0) {
      return await db.select().from(jobCards).where(and(...conditions)).orderBy(desc(jobCards.createdAt));
    }
    return await db.select().from(jobCards).orderBy(desc(jobCards.createdAt));
  }

  async getJobCard(id: string): Promise<JobCard | undefined> {
    const [jobCard] = await db.select().from(jobCards).where(eq(jobCards.id, id));
    return jobCard;
  }

  async getJobCardWithDetails(id: string): Promise<any> {
    const { diagnosticReports, obdSessions, maintenanceRecommendations, invoices, invoiceItems, payments, vehicles, users, jobTrackingEvents } = await import("@shared/schema");

    const [jobCard] = await db.select().from(jobCards).where(eq(jobCards.id, id));
    if (!jobCard) return null;

    // job_cards keeps the vehicle as a jsonb snapshot (vehicle_info); there is
    // no vehicle_id foreign key. Resolve the registered vehicle by VIN within
    // the same garage, and fall back to the snapshot when there is no match.
    const vehicleInfo = (jobCard.vehicleInfo ?? {}) as { vin?: string };
    const [registeredVehicle] = vehicleInfo.vin
      ? await db.select().from(vehicles).where(
          and(eq(vehicles.vin, vehicleInfo.vin), eq(vehicles.garageId, jobCard.garageId)),
        )
      : [];
    const vehicle = registeredVehicle ?? jobCard.vehicleInfo ?? null;

    const [technician] = jobCard.assignedTo
      ? await db.select().from(users).where(eq(users.id, jobCard.assignedTo))
      : [null];

    // diagnostic_reports hangs off an OBD session; the session is what carries
    // job_card_id, so reaching the reports takes the extra hop.
    const diagnostics = await db
      .select(getTableColumns(diagnosticReports))
      .from(diagnosticReports)
      .innerJoin(obdSessions, eq(diagnosticReports.sessionId, obdSessions.id))
      .where(eq(obdSessions.jobCardId, id));

    // maintenance_recommendations are keyed by vehicle, not by job card.
    const recommendations = registeredVehicle
      ? await db.select().from(maintenanceRecommendations)
          .where(eq(maintenanceRecommendations.vehicleId, registeredVehicle.id))
      : [];

    const trackingEvents = await db.select().from(jobTrackingEvents).where(eq(jobTrackingEvents.jobCardId, id)).orderBy(desc(jobTrackingEvents.createdAt));

    const jobInvoices = await db.select().from(invoices).where(eq(invoices.jobCardId, id));

    const invoiceDetails = await Promise.all(jobInvoices.map(async (inv) => {
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, inv.id));
      const invoicePayments = await db.select().from(payments).where(eq(payments.invoiceId, inv.id));
      return { ...inv, items, payments: invoicePayments };
    }));

    return {
      ...jobCard,
      vehicle,
      technician: technician ? { id: technician.id, fullName: technician.fullName } : null,
      diagnostics,
      recommendations,
      trackingEvents,
      invoices: invoiceDetails
    };
  }

  async createJobCard(data: any): Promise<JobCard> {
    const [jobCard] = await db.insert(jobCards).values(data).returning();
    return jobCard;
  }

  async updateJobCard(id: string, data: any, garageId?: string): Promise<JobCard> {
    // Tenant scope (B16 breadth).
    const [jobCard] = await db.update(jobCards).set(data)
      .where(and(eq(jobCards.id, id), garageId ? eq(jobCards.garageId, garageId) : undefined))
      .returning();
    return jobCard;
  }

  // Dynamic Service Tracking - Feature #3
  async generatePublicTrackingToken(jobCardId: string): Promise<{ rawToken: string, hashedToken: string, expiresAt: Date }> {
    const rawToken = randomUUID();
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiration

    await db.update(jobCards)
      .set({ 
        publicTrackingToken: hashedToken,
        publicTrackingTokenExpiresAt: expiresAt 
      })
      .where(eq(jobCards.id, jobCardId));

    return { rawToken, hashedToken, expiresAt };
  }

  async getJobByTrackingToken(hashedToken: string): Promise<JobCard | undefined> {
    const [jobCard] = await db.select()
      .from(jobCards)
      .where(
        and(
          eq(jobCards.publicTrackingToken, hashedToken),
          gt(jobCards.publicTrackingTokenExpiresAt, new Date())
        )
      );
    return jobCard;
  }

  async createJobTrackingEvent(data: InsertJobTrackingEvent): Promise<JobTrackingEvent> {
    const [event] = await db.insert(jobTrackingEvents).values(data).returning();
    return event;
  }

  async getJobTrackingEvents(jobCardId: string, visibleToCustomer?: boolean): Promise<JobTrackingEvent[]> {
    const conditions = [eq(jobTrackingEvents.jobCardId, jobCardId)];
    
    if (visibleToCustomer !== undefined) {
      conditions.push(eq(jobTrackingEvents.isVisibleToCustomer, visibleToCustomer));
    }

    return await db.select()
      .from(jobTrackingEvents)
      .where(and(...conditions))
      .orderBy(desc(jobTrackingEvents.createdAt));
  }

  async updateJobETA(jobCardId: string, estimatedCompletionAt: Date, manualOverride: boolean = false): Promise<JobCard> {
    const [jobCard] = await db.update(jobCards)
      .set({
        estimatedCompletionAt,
        etaLastCalculatedAt: new Date(),
        etaManualOverride: manualOverride,
      })
      .where(eq(jobCards.id, jobCardId))
      .returning();
    return jobCard;
  }

  // Technician-scoped operations
  async getTechnicianJobCards(technicianId: string): Promise<JobCard[]> {
    return await db.select()
      .from(jobCards)
      // job_cards names the column assigned_to, not assigned_technician_id.
      .where(eq(jobCards.assignedTo, technicianId))
      .orderBy(desc(jobCards.createdAt));
  }

  async getTechnicianTimeClockEntries(technicianId: string): Promise<any[]> {
    // TODO: Create timeClockEntries table in schema
    // For now, return empty array
    return [];
  }

  async createTimeClockEntry(data: any): Promise<any> {
    // TODO: Implement after timeClockEntries table is created
    return data;
  }

  // Task Assignment operations
  async getTaskAssignments(jobCardId: string): Promise<TaskAssignment[]> {
    return await db.select().from(taskAssignments).where(eq(taskAssignments.jobCardId, jobCardId));
  }

  async createTaskAssignment(data: any): Promise<TaskAssignment> {
    const [task] = await db.insert(taskAssignments).values(data).returning();
    return task;
  }

  async updateTaskAssignment(id: string, data: any): Promise<TaskAssignment> {
    const [task] = await db.update(taskAssignments).set(data).where(eq(taskAssignments.id, id)).returning();
    return task;
  }

  // Service Templates operations
  async getAllServiceTemplates(): Promise<ServiceTemplate[]> {
    return await db.select().from(serviceTemplates).orderBy(serviceTemplates.name);
  }

  async getServiceTemplates(garageId: string): Promise<ServiceTemplate[]> {
    return await db.select().from(serviceTemplates)
      .where(eq(serviceTemplates.garageId, garageId))
      .orderBy(serviceTemplates.name);
  }

  async getServiceTemplate(id: string): Promise<ServiceTemplate | undefined> {
    const [template] = await db.select().from(serviceTemplates).where(eq(serviceTemplates.id, id));
    return template;
  }

  async createServiceTemplate(data: InsertServiceTemplate): Promise<ServiceTemplate> {
    const [template] = await db.insert(serviceTemplates).values(data).returning();
    return template;
  }

  async updateServiceTemplate(id: string, data: Partial<ServiceTemplate>, garageId?: string): Promise<ServiceTemplate> {
    // Tenant scope (B16 breadth).
    const [template] = await db.update(serviceTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(serviceTemplates.id, id), garageId ? eq(serviceTemplates.garageId, garageId) : undefined))
      .returning();
    return template;
  }

  async deleteServiceTemplate(id: string, garageId?: string): Promise<void> {
    await db.delete(serviceTemplates).where(and(eq(serviceTemplates.id, id), garageId ? eq(serviceTemplates.garageId, garageId) : undefined));
  }

  // Tool Management operations - Module 7
  async getTools(garageId?: string, isGlobal?: boolean): Promise<Tool[]> {
    // tools has no garage_id column — a tool is visible when it is global or
    // was created by someone in the caller's garage. Previously both params
    // were ignored, listing every tenant's tools.
    const conditions = [eq(tools.isActive, true)];
    if (isGlobal !== undefined) {
      conditions.push(eq(tools.isGlobal, isGlobal));
    }
    if (garageId) {
      conditions.push(
        or(
          eq(tools.isGlobal, true),
          sql`EXISTS (SELECT 1 FROM ${users} WHERE ${users.id} = ${tools.createdBy} AND ${users.garageId} = ${garageId})`,
        )!,
      );
    }
    return await db.select().from(tools)
      .where(and(...conditions))
      .orderBy(tools.name);
  }

  async getTool(id: string): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool;
  }

  async createTool(data: any): Promise<Tool> {
    const [tool] = await db.insert(tools).values(data).returning();
    return tool;
  }

  async updateTool(id: string, data: any): Promise<Tool> {
    const [tool] = await db.update(tools).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(tools.id, id)).returning();
    return tool;
  }

  // Spare Parts operations - Module 12
  async getSpareParts(): Promise<SparePart[]> {
    return await db.select().from(spareParts)
      .where(eq(spareParts.isActive, true))
      .orderBy(spareParts.name);
  }

  async getSparePart(id: string): Promise<SparePart | undefined> {
    const [part] = await db.select().from(spareParts).where(eq(spareParts.id, id));
    return part;
  }

  async createSparePart(data: InsertSparePart): Promise<SparePart> {
    const [part] = await db.insert(spareParts).values(data).returning();
    return part;
  }

  async updateSparePart(id: string, data: Partial<SparePart>): Promise<SparePart> {
    const [part] = await db.update(spareParts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(spareParts.id, id))
      .returning();
    return part;
  }

  async deleteSparePart(id: string): Promise<void> {
    await db.delete(spareParts).where(eq(spareParts.id, id));
  }

  async getSparePartInventories(garageId: string, sparePartId?: string): Promise<SparePartInventory[]> {
    if (sparePartId) {
      return await db.select().from(sparePartInventories)
        .where(and(
          eq(sparePartInventories.garageId, garageId),
          eq(sparePartInventories.sparePartId, sparePartId)
        ));
    }
    return await db.select().from(sparePartInventories)
      .where(eq(sparePartInventories.garageId, garageId));
  }

  async createSparePartInventory(data: InsertSparePartInventory): Promise<SparePartInventory> {
    const [inventory] = await db.insert(sparePartInventories).values(data).returning();
    return inventory;
  }

  async updateSparePartInventory(
    id: string,
    data: Partial<SparePartInventory>,
    garageId?: string,
    opts?: { userId?: string; expectedStockQuantity?: number }
  ): Promise<SparePartInventory> {
    // A blind absolute overwrite of stockQuantity is a lost-update race: two
    // concurrent adjustments each read-modify-write and one clobbers the other
    // (audit medium #7). Run under a row lock so writers serialize, support
    // optional optimistic concurrency, and record an audit-trail entry whenever
    // stock actually moves.
    return await db.transaction(async (tx) => {
      const [inventory] = await tx
        .select()
        .from(sparePartInventories)
        .where(
          and(
            eq(sparePartInventories.id, id),
            garageId ? eq(sparePartInventories.garageId, garageId) : undefined
          )
        )
        .for("update");
      // Cross-tenant / missing row: no match — handler turns this into a 404.
      if (!inventory) return undefined as any;

      const before = inventory.stockQuantity ?? 0;

      // Optimistic concurrency: if the caller states the stock it expected to
      // be updating, reject when the row has moved since they read it.
      if (
        typeof opts?.expectedStockQuantity === "number" &&
        before !== opts.expectedStockQuantity
      ) {
        const conflict: any = new Error(
          `Stock changed since read: expected ${opts.expectedStockQuantity}, found ${before}`
        );
        conflict.code = "STOCK_CONFLICT";
        throw conflict;
      }

      const [updated] = await tx
        .update(sparePartInventories)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sparePartInventories.id, inventory.id))
        .returning();

      // Record the movement when the absolute stock value changed and we know
      // who did it (performed_by is NOT NULL); skip silently for callers that
      // only touch pricing/thresholds or don't pass a user.
      const after = updated.stockQuantity ?? 0;
      if (opts?.userId && after !== before) {
        await tx.insert(inventoryAuditTrail).values({
          sparePartId: updated.sparePartId,
          garageId: updated.garageId,
          branchId: updated.branchId,
          actionType: "adjust",
          quantityBefore: before,
          quantityChange: after - before,
          quantityAfter: after,
          referenceType: "manual",
          reason: "Manual inventory adjustment",
          performedBy: opts.userId,
        } as any);
      }

      return updated;
    });
  }

  // Tool Availability operations
  async getToolAvailability(garageId: string, toolId?: string): Promise<ToolAvailability[]> {
    return await db.select().from(toolAvailability)
      .where(eq(toolAvailability.garageId, garageId));
  }

  async createToolAvailability(data: any): Promise<ToolAvailability> {
    const [availability] = await db.insert(toolAvailability).values(data).returning();
    return availability;
  }

  async updateToolAvailability(id: string, data: any): Promise<ToolAvailability> {
    const [availability] = await db.update(toolAvailability).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(toolAvailability.id, id)).returning();
    return availability;
  }

  // Tool Usage operations
  async getToolUsageLogs(toolId: string): Promise<ToolUsageLog[]> {
    return await db.select().from(toolUsageLogs)
      .where(eq(toolUsageLogs.toolId, toolId))
      .orderBy(desc(toolUsageLogs.startTime));
  }

  async createToolUsageLog(data: any): Promise<ToolUsageLog> {
    const [log] = await db.insert(toolUsageLogs).values(data).returning();
    return log;
  }

  async updateToolUsageLog(id: string, data: any): Promise<ToolUsageLog> {
    const [log] = await db.update(toolUsageLogs).set(data).where(eq(toolUsageLogs.id, id)).returning();
    return log;
  }

  // Appointment operations - Module 9: Appointments & Scheduling
  async getAppointments(garageId?: string, status?: string, dateFrom?: string, dateTo?: string): Promise<Appointment[]> {
    const conditions = [];
    
    if (garageId) {
      conditions.push(eq(appointments.garageId, garageId));
    }
    if (status) {
      conditions.push(eq(appointments.status, status));
    }
    if (dateFrom) {
      conditions.push(gte(appointments.appointmentDate, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(appointments.appointmentDate, new Date(dateTo)));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(appointments)
        .where(and(...conditions))
        .orderBy(desc(appointments.appointmentDate));
    }
    
    return await db.select().from(appointments)
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(data: Omit<InsertAppointment, 'appointmentNumber' | 'id'>): Promise<Appointment> {
    const appointmentNumber = `APT-${Date.now()}`;
    const [appointment] = await db.insert(appointments).values({
      ...data,
      appointmentNumber,
    }).returning();
    return appointment;
  }

  async updateAppointment(id: string, data: Partial<Appointment>, garageId?: string): Promise<Appointment> {
    // Tenant scope (B16 breadth).
    const [appointment] = await db.update(appointments).set({
      ...data,
      updatedAt: new Date()
    }).where(and(eq(appointments.id, id), garageId ? eq(appointments.garageId, garageId) : undefined)).returning();
    return appointment;
  }

  async deleteAppointment(id: string, garageId?: string): Promise<void> {
    await db.delete(appointments).where(and(eq(appointments.id, id), garageId ? eq(appointments.garageId, garageId) : undefined));
  }

  async updateAppointmentStatus(id: string, status: string, userId: string, reason?: string): Promise<Appointment> {
    const currentAppointment = await this.getAppointment(id);
    if (!currentAppointment) {
      throw new Error("Appointment not found");
    }

    await db.insert(appointmentStatusHistory).values({
      appointmentId: id,
      previousStatus: currentAppointment.status,
      newStatus: status,
      changedBy: userId,
      reason: reason || null,
    });

    const [updatedAppointment] = await db.update(appointments).set({
      status,
      updatedAt: new Date()
    }).where(eq(appointments.id, id)).returning();
    
    return updatedAppointment;
  }

  // Customer Management operations - Module 10
  async getCustomers(garageId?: string, searchQuery?: string): Promise<SafeUser[]> {
    const conditions = [eq(users.userType, "customer")];
    
    if (garageId) {
      conditions.push(eq(users.garageId, garageId));
    }
    
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      conditions.push(
        or(
          ilike(users.fullName, searchPattern),
          ilike(users.email, searchPattern),
          ilike(users.phone, searchPattern)
        )!
      );
    }
    
    let query = db.select().from(users).where(and(...conditions));
    
    return (await query.orderBy(desc(users.createdAt))).map(stripPassword);
  }

  async getCustomer(id: string): Promise<SafeUser | undefined> {
    const [customer] = await db.select().from(users)
      .where(eq(users.id, id));
    return customer ? stripPassword(customer) : undefined;
  }

  async getVehicles(garageId?: string): Promise<Vehicle[]> {
    if (garageId) {
      return await db.select().from(vehicles)
        .where(and(
          eq(vehicles.garageId, garageId),
          eq(vehicles.isActive, true)
        ))
        .orderBy(desc(vehicles.createdAt));
    }
    return await db.select().from(vehicles)
      .where(eq(vehicles.isActive, true))
      .orderBy(desc(vehicles.createdAt));
  }

  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles)
      .where(and(
        eq(vehicles.customerId, customerId),
        eq(vehicles.isActive, true)
      ))
      .orderBy(desc(vehicles.createdAt));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(data: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(data).returning();
    return vehicle;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const [vehicle] = await db.update(vehicles).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.update(vehicles).set({ isActive: false }).where(eq(vehicles.id, id));
  }

  // Vehicle Service History - Module 22 Enhancements
  async getVehicleServiceHistory(vehicleId: string): Promise<VehicleServiceHistory[]> {
    return await db.select().from(vehicleServiceHistory)
      .where(eq(vehicleServiceHistory.vehicleId, vehicleId))
      .orderBy(desc(vehicleServiceHistory.serviceDate));
  }

  async createServiceHistory(data: InsertVehicleServiceHistory): Promise<VehicleServiceHistory> {
    const [history] = await db.insert(vehicleServiceHistory).values(data).returning();
    return history;
  }

  async deleteServiceHistory(id: string): Promise<void> {
    await db.delete(vehicleServiceHistory).where(eq(vehicleServiceHistory.id, id));
  }

  // Maintenance Schedules - Module 22 Enhancements
  async getMaintenanceSchedules(vehicleId: string): Promise<MaintenanceSchedule[]> {
    return await db.select().from(maintenanceSchedules)
      .where(and(
        eq(maintenanceSchedules.vehicleId, vehicleId),
        eq(maintenanceSchedules.isActive, true)
      ))
      .orderBy(maintenanceSchedules.nextDueDate);
  }

  async getMaintenanceSchedule(id: string): Promise<MaintenanceSchedule | undefined> {
    const [schedule] = await db.select().from(maintenanceSchedules)
      .where(eq(maintenanceSchedules.id, id));
    return schedule;
  }

  async createMaintenanceSchedule(data: InsertMaintenanceSchedule): Promise<MaintenanceSchedule> {
    const [schedule] = await db.insert(maintenanceSchedules).values(data).returning();
    return schedule;
  }

  async updateMaintenanceSchedule(id: string, data: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const [schedule] = await db.update(maintenanceSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(maintenanceSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteMaintenanceSchedule(id: string): Promise<void> {
    await db.update(maintenanceSchedules)
      .set({ isActive: false })
      .where(eq(maintenanceSchedules.id, id));
  }

  // Service Reminders - Module 22 Enhancements
  async getServiceReminders(vehicleId: string, status?: string): Promise<ServiceReminder[]> {
    const conditions = [
      eq(serviceReminders.vehicleId, vehicleId),
      eq(serviceReminders.isActive, true)
    ];
    
    if (status) {
      conditions.push(eq(serviceReminders.status, status));
    }
    
    return await db.select().from(serviceReminders)
      .where(and(...conditions))
      .orderBy(serviceReminders.triggerDate);
  }

  async getServiceReminder(id: string): Promise<ServiceReminder | undefined> {
    const [reminder] = await db.select().from(serviceReminders)
      .where(eq(serviceReminders.id, id));
    return reminder;
  }

  async createServiceReminder(data: InsertServiceReminder): Promise<ServiceReminder> {
    const [reminder] = await db.insert(serviceReminders).values(data).returning();
    return reminder;
  }

  async updateServiceReminder(id: string, data: Partial<ServiceReminder>): Promise<ServiceReminder> {
    const [reminder] = await db.update(serviceReminders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceReminders.id, id))
      .returning();
    return reminder;
  }

  async deleteServiceReminder(id: string): Promise<void> {
    await db.update(serviceReminders)
      .set({ isActive: false })
      .where(eq(serviceReminders.id, id));
  }

  // VIN decoder helper
  async decodeVIN(vin: string): Promise<any> {
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      const data = await response.json();
      return data.Results;
    } catch (error) {
      console.error('VIN decode error:', error);
      return null;
    }
  }

  async getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
    return await db.select().from(customerNotes)
      .where(eq(customerNotes.customerId, customerId))
      .orderBy(desc(customerNotes.createdAt));
  }

  async createCustomerNote(data: InsertCustomerNote): Promise<CustomerNote> {
    const [note] = await db.insert(customerNotes).values(data).returning();
    return note;
  }

  async deleteCustomerNote(id: string): Promise<void> {
    await db.delete(customerNotes).where(eq(customerNotes.id, id));
  }

  // Client Portal - Service Features
  async getCustomerServiceReminders(customerId: string): Promise<ServiceReminder[]> {
    return await db.select().from(serviceReminders)
      .where(eq(serviceReminders.customerId, customerId))
      .orderBy(desc(serviceReminders.createdAt));
  }

  async getServiceChatMessages(jobCardId: string): Promise<ServiceChatMessage[]> {
    return await db.select().from(serviceChatMessages)
      .where(eq(serviceChatMessages.jobCardId, jobCardId))
      .orderBy(serviceChatMessages.createdAt);
  }

  async createServiceChatMessage(data: InsertServiceChatMessage): Promise<ServiceChatMessage> {
    const [message] = await db.insert(serviceChatMessages).values(data).returning();
    return message;
  }

  async getCustomerServiceReviews(customerId: string): Promise<ServiceReview[]> {
    return await db.select().from(serviceReviews)
      .where(eq(serviceReviews.customerId, customerId))
      .orderBy(desc(serviceReviews.createdAt));
  }

  async createServiceReview(data: InsertServiceReview): Promise<ServiceReview> {
    const [review] = await db.insert(serviceReviews).values(data).returning();
    return review;
  }

  async getCustomerServiceSignatures(customerId: string): Promise<ServiceSignature[]> {
    return await db.select().from(serviceSignatures)
      .where(eq(serviceSignatures.customerId, customerId))
      .orderBy(desc(serviceSignatures.createdAt));
  }

  async createServiceSignature(data: InsertServiceSignature): Promise<ServiceSignature> {
    const [signature] = await db.insert(serviceSignatures).values(data).returning();
    return signature;
  }

  // Purchase Orders & Supplier Integration - Module 11
  async getSuppliers(garageId?: string): Promise<Supplier[]> {
    if (garageId) {
      return await db.select().from(suppliers)
        .where(and(
          eq(suppliers.garageId, garageId),
          eq(suppliers.isActive, true)
        ))
        .orderBy(desc(suppliers.createdAt));
    }
    return await db.select().from(suppliers)
      .where(eq(suppliers.isActive, true))
      .orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(data).returning();
    return supplier;
  }

  // `garageId`, when provided, scopes the write to the caller's tenant so an
  // authenticated user cannot update/delete another garage's supplier by id
  // (deep-audit blocker B4). Existing 2-arg callers are unaffected.
  async updateSupplier(id: string, data: Partial<Supplier>, garageId?: string): Promise<Supplier> {
    const [supplier] = await db.update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), garageId ? eq(suppliers.garageId, garageId) : undefined))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: string, garageId?: string): Promise<void> {
    await db.update(suppliers)
      .set({ isActive: false })
      .where(and(eq(suppliers.id, id), garageId ? eq(suppliers.garageId, garageId) : undefined));
  }

  async getSupplierPriceLists(supplierId?: string, sparePartId?: string): Promise<SupplierPriceList[]> {
    const conditions = [];
    
    if (supplierId) {
      conditions.push(eq(supplierPriceList.supplierId, supplierId));
    }
    
    if (sparePartId) {
      conditions.push(eq(supplierPriceList.sparePartId, sparePartId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(supplierPriceList)
        .where(and(...conditions))
        .orderBy(desc(supplierPriceList.lastUpdated));
    }
    
    return await db.select().from(supplierPriceList)
      .orderBy(desc(supplierPriceList.lastUpdated));
  }

  // Restrict a supplier-owned child row (which has no garage_id of its own) to
  // the caller's garage by requiring its supplierId to belong to a supplier in
  // that garage. Returns undefined when no garageId is supplied so legacy
  // callers stay unscoped (backward-compatible).
  private supplierGarageScope(supplierIdColumn: any, garageId?: string) {
    if (!garageId) return undefined;
    return inArray(
      supplierIdColumn,
      db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.garageId, garageId))
    );
  }

  // Same idea for other parentless child rows: constrain a foreign key to
  // parents in the caller's garage. Undefined when no garageId (unscoped).
  private quotationRequestGarageScope(requestIdColumn: any, garageId?: string) {
    if (!garageId) return undefined;
    return inArray(
      requestIdColumn,
      db.select({ id: quotationRequests.id }).from(quotationRequests).where(eq(quotationRequests.garageId, garageId))
    );
  }

  private invoiceGarageScope(invoiceIdColumn: any, garageId?: string) {
    if (!garageId) return undefined;
    return inArray(
      invoiceIdColumn,
      db.select({ id: invoices.id }).from(invoices).where(eq(invoices.garageId, garageId))
    );
  }

  // Two hops: installment -> paymentPlan -> invoice -> garage.
  private paymentPlanGarageScope(planIdColumn: any, garageId?: string) {
    if (!garageId) return undefined;
    return inArray(
      planIdColumn,
      db.select({ id: paymentPlans.id }).from(paymentPlans).where(
        inArray(paymentPlans.invoiceId, db.select({ id: invoices.id }).from(invoices).where(eq(invoices.garageId, garageId)))
      )
    );
  }

  async getSupplierPriceList(id: string, garageId?: string): Promise<SupplierPriceList | undefined> {
    const [priceList] = await db.select().from(supplierPriceList)
      .where(and(eq(supplierPriceList.id, id), this.supplierGarageScope(supplierPriceList.supplierId, garageId)));
    return priceList;
  }

  async createSupplierPriceList(data: InsertSupplierPriceList): Promise<SupplierPriceList> {
    const [priceList] = await db.insert(supplierPriceList)
      .values(data)
      .returning();
    return priceList;
  }

  async updateSupplierPriceList(id: string, data: Partial<SupplierPriceList>, garageId?: string): Promise<SupplierPriceList> {
    // Tenant scope (B16 breadth): supplier_price_list has no garage_id, so
    // scope through the parent supplier's garage — a cross-tenant id matches
    // no row (handler 404s).
    const [priceList] = await db.update(supplierPriceList)
      .set({ ...data, lastUpdated: new Date() })
      .where(and(eq(supplierPriceList.id, id), this.supplierGarageScope(supplierPriceList.supplierId, garageId)))
      .returning();
    return priceList;
  }

  async deleteSupplierPriceList(id: string, garageId?: string): Promise<void> {
    await db.delete(supplierPriceList)
      .where(and(eq(supplierPriceList.id, id), this.supplierGarageScope(supplierPriceList.supplierId, garageId)));
  }

  async comparePrices(sparePartId: string): Promise<SupplierPriceList[]> {
    return await db.select().from(supplierPriceList)
      .where(and(
        eq(supplierPriceList.sparePartId, sparePartId),
        eq(supplierPriceList.isActive, true)
      ))
      .orderBy(supplierPriceList.unitPrice);
  }

  async getSupplierPerformance(supplierId?: string, period?: string): Promise<SupplierPerformance[]> {
    const conditions = [];
    
    if (supplierId) {
      conditions.push(eq(supplierPerformance.supplierId, supplierId));
    }
    
    if (period) {
      conditions.push(eq(supplierPerformance.period, period));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(supplierPerformance)
        .where(and(...conditions))
        .orderBy(desc(supplierPerformance.period));
    }
    
    return await db.select().from(supplierPerformance)
      .orderBy(desc(supplierPerformance.period));
  }

  async getSupplierPerformanceRecord(id: string, garageId?: string): Promise<SupplierPerformance | undefined> {
    const [performance] = await db.select().from(supplierPerformance)
      .where(and(eq(supplierPerformance.id, id), this.supplierGarageScope(supplierPerformance.supplierId, garageId)));
    return performance;
  }

  async createSupplierPerformance(data: InsertSupplierPerformance): Promise<SupplierPerformance> {
    const [performance] = await db.insert(supplierPerformance)
      .values(data)
      .returning();
    return performance;
  }

  async updateSupplierPerformance(id: string, data: Partial<SupplierPerformance>, garageId?: string): Promise<SupplierPerformance> {
    // Tenant scope (B16 breadth): scope through the parent supplier's garage.
    const [performance] = await db.update(supplierPerformance)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(supplierPerformance.id, id), this.supplierGarageScope(supplierPerformance.supplierId, garageId)))
      .returning();
    return performance;
  }

  async deleteSupplierPerformance(id: string, garageId?: string): Promise<void> {
    await db.delete(supplierPerformance)
      .where(and(eq(supplierPerformance.id, id), this.supplierGarageScope(supplierPerformance.supplierId, garageId)));
  }

  // Supplier Parts Availability - Feature #5
  async getSupplierPartsAvailability(
    garageId: string, 
    filters?: {sparePartId?: string, supplierId?: string, partName?: string}
  ): Promise<SupplierPartsAvailability[]> {
    const conditions = [eq(supplierPartsAvailability.garageId, garageId)];
    
    if (filters?.sparePartId) {
      conditions.push(eq(supplierPartsAvailability.sparePartId, filters.sparePartId));
    }
    
    if (filters?.supplierId) {
      conditions.push(eq(supplierPartsAvailability.supplierId, filters.supplierId));
    }
    
    if (filters?.partName) {
      // or() is typed as possibly-undefined (it is, for an empty argument
      // list), so it has to be narrowed before joining the condition list.
      const nameMatch = or(
        ilike(supplierPartsAvailability.externalPartNumber, `%${filters.partName}%`),
        ilike(supplierPartsAvailability.externalSku, `%${filters.partName}%`)
      );
      if (nameMatch) conditions.push(nameMatch);
    }
    
    return await db.select().from(supplierPartsAvailability)
      .where(and(...conditions))
      .orderBy(desc(supplierPartsAvailability.lastSyncedAt));
  }

  async getSupplierPartAvailability(id: string, garageId: string): Promise<SupplierPartsAvailability | undefined> {
    const [availability] = await db.select().from(supplierPartsAvailability)
      .where(and(
        eq(supplierPartsAvailability.id, id),
        eq(supplierPartsAvailability.garageId, garageId)
      ));
    return availability;
  }

  async createSupplierPartAvailability(data: InsertSupplierPartsAvailability): Promise<SupplierPartsAvailability> {
    const [availability] = await db.insert(supplierPartsAvailability)
      .values(data)
      .returning();
    return availability;
  }

  async updateSupplierPartAvailability(id: string, garageId: string, data: Partial<SupplierPartsAvailability>): Promise<SupplierPartsAvailability | null> {
    const [availability] = await db.update(supplierPartsAvailability)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(supplierPartsAvailability.id, id),
        eq(supplierPartsAvailability.garageId, garageId)
      ))
      .returning();
    return availability || null;
  }

  async deleteSupplierPartAvailability(id: string, garageId: string): Promise<boolean> {
    const result = await db.delete(supplierPartsAvailability)
      .where(and(
        eq(supplierPartsAvailability.id, id),
        eq(supplierPartsAvailability.garageId, garageId)
      ))
      .returning();
    return result.length > 0;
  }

  async syncSupplierAvailability(garageId: string, availabilityData: InsertSupplierPartsAvailability[]): Promise<SupplierPartsAvailability[]> {
    const results: SupplierPartsAvailability[] = [];
    
    for (const data of availabilityData) {
      const existing = await db.select().from(supplierPartsAvailability)
        .where(and(
          eq(supplierPartsAvailability.garageId, data.garageId),
          eq(supplierPartsAvailability.supplierId, data.supplierId),
          data.sparePartId ? eq(supplierPartsAvailability.sparePartId, data.sparePartId) : isNull(supplierPartsAvailability.sparePartId),
          data.externalSku ? eq(supplierPartsAvailability.externalSku, data.externalSku) : sql`true`
        ));
      
      if (existing.length > 0) {
        const [updated] = await db.update(supplierPartsAvailability)
          .set({ ...data, lastSyncedAt: new Date(), updatedAt: new Date() })
          .where(eq(supplierPartsAvailability.id, existing[0].id))
          .returning();
        results.push(updated);
      } else {
        const [created] = await db.insert(supplierPartsAvailability)
          .values({ ...data, lastSyncedAt: new Date() })
          .returning();
        results.push(created);
      }
    }
    
    return results;
  }

  // Smart Job Assignment - Feature #6
  async listAssignmentRules(garageId: string, isActive?: boolean): Promise<AssignmentRule[]> {
    const conditions = [eq(assignmentRules.garageId, garageId)];
    if (isActive !== undefined) {
      conditions.push(eq(assignmentRules.isActive, isActive));
    }
    return await db.select().from(assignmentRules)
      .where(and(...conditions))
      .orderBy(desc(assignmentRules.priority));
  }

  async upsertAssignmentRule(data: InsertAssignmentRule): Promise<AssignmentRule> {
    const existing = await db.select().from(assignmentRules)
      .where(and(
        eq(assignmentRules.garageId, data.garageId),
        eq(assignmentRules.ruleName, data.ruleName)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db.update(assignmentRules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(assignmentRules.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(assignmentRules)
      .values(data)
      .returning();
    return created;
  }

  async deleteAssignmentRule(id: string, garageId: string): Promise<boolean> {
    const result = await db.delete(assignmentRules)
      .where(and(
        eq(assignmentRules.id, id),
        eq(assignmentRules.garageId, garageId)
      ))
      .returning();
    return result.length > 0;
  }

  async recordAssignmentEvent(data: InsertAssignmentHistory): Promise<AssignmentHistory> {
    const [event] = await db.insert(assignmentHistory)
      .values(data)
      .returning();
    return event;
  }

  async listAssignmentHistory(garageId: string, jobCardId?: string, limit: number = 50): Promise<AssignmentHistory[]> {
    const conditions = [eq(assignmentHistory.garageId, garageId)];
    if (jobCardId) {
      conditions.push(eq(assignmentHistory.jobCardId, jobCardId));
    }
    
    const query = db.select().from(assignmentHistory)
      .where(and(...conditions))
      .orderBy(desc(assignmentHistory.createdAt));
    
    if (limit > 0) {
      return await query.limit(limit);
    }
    return await query;
  }

  async saveAIRecommendations(recommendations: InsertAiAssignmentRecommendation[]): Promise<AiAssignmentRecommendation[]> {
    if (recommendations.length === 0) return [];
    const results = await db.insert(aiAssignmentRecommendations)
      .values(recommendations)
      .returning();
    return results;
  }

  async listAIRecommendations(jobCardId: string, garageId: string, limit: number = 10): Promise<AiAssignmentRecommendation[]> {
    const query = db.select().from(aiAssignmentRecommendations)
      .where(and(
        eq(aiAssignmentRecommendations.jobCardId, jobCardId),
        eq(aiAssignmentRecommendations.garageId, garageId)
      ))
      .orderBy(desc(aiAssignmentRecommendations.createdAt));
    
    if (limit > 0) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getJobCardWithContext(jobCardId: string, garageId: string): Promise<{jobCard: JobCard, technician: User | null} | null> {
    const [jobCard] = await db.select().from(jobCards)
      .where(and(
        eq(jobCards.id, jobCardId),
        eq(jobCards.garageId, garageId)
      ));
    
    if (!jobCard) return null;
    
    let technician: User | null = null;
    if (jobCard.assignedTo) {
      const [tech] = await db.select().from(users)
        .where(eq(users.id, jobCard.assignedTo));
      technician = tech || null;
    }
    
    return { jobCard, technician };
  }

  async getTechniciansWithLoad(garageId: string, skillFilters?: string[]): Promise<Array<{technician: User & {profile: TechnicianProfile}, activeJobCount: number}>> {
    const technicians = await db.select({
      user: users,
      profile: technicianProfiles
    })
    .from(users)
    .innerJoin(technicianProfiles, eq(users.id, technicianProfiles.userId))
    .where(and(
      eq(users.garageId, garageId),
      eq(users.isActive, true)
    ));
    
    const results = [];
    for (const { user, profile } of technicians) {
      if (skillFilters && skillFilters.length > 0 && profile.skills) {
        const hasSkill = skillFilters.some(skill => 
          profile.skills?.toLowerCase().includes(skill.toLowerCase())
        );
        if (!hasSkill) continue;
      }
      
      const activeJobs = await db.select().from(jobCards)
        .where(and(
          eq(jobCards.assignedTo, user.id),
          or(
            eq(jobCards.status, 'assigned'),
            eq(jobCards.status, 'in_progress')
          )
        ));
      
      results.push({
        technician: { ...user, profile },
        activeJobCount: activeJobs.length
      });
    }
    
    return results;
  }

  async assignTechnicianToJob(params: {garageId: string, jobCardId: string, technicianId: string, assignedBy: string, reason?: string, aiRecommendationId?: string}): Promise<JobCard> {
    const { garageId, jobCardId, technicianId, assignedBy, reason, aiRecommendationId } = params;
    
    return await db.transaction(async (tx) => {
      const [jobCard] = await tx.select().from(jobCards)
        .where(and(
          eq(jobCards.id, jobCardId),
          eq(jobCards.garageId, garageId)
        ));
      
      if (!jobCard) {
        throw new Error("Job card not found");
      }
      
      const previousTechnicianId = jobCard.assignedTo;
      
      const [updated] = await tx.update(jobCards)
        .set({ assignedTo: technicianId, updatedAt: new Date() })
        .where(eq(jobCards.id, jobCardId))
        .returning();
      
      await tx.insert(assignmentHistory).values({
        jobCardId,
        garageId,
        previousTechnicianId: previousTechnicianId || null,
        newTechnicianId: technicianId,
        assignmentMethod: aiRecommendationId ? 'ai_recommended' : 'manual',
        assignedBy,
        reason: reason || null,
        aiRecommendationId: aiRecommendationId || null
      });
      
      if (aiRecommendationId) {
        await tx.update(aiAssignmentRecommendations)
          .set({ wasAccepted: true })
          .where(eq(aiAssignmentRecommendations.id, aiRecommendationId));
      }
      
      return updated;
    });
  }

  // Call Center Module - Wave 2 Implementation
  async createCallQueue(data: InsertCallQueue): Promise<CallQueue> {
    const [queue] = await db.insert(callQueues)
      .values(data)
      .returning();
    return queue;
  }

  async listCallQueues(garageId: string, isActive?: boolean): Promise<CallQueue[]> {
    const conditions = [eq(callQueues.garageId, garageId)];
    if (isActive !== undefined) {
      conditions.push(eq(callQueues.isActive, isActive));
    }
    return await db.select().from(callQueues)
      .where(and(...conditions))
      .orderBy(desc(callQueues.priority));
  }

  async getCallQueue(id: string, garageId: string): Promise<CallQueue | null> {
    const [queue] = await db.select().from(callQueues)
      .where(and(
        eq(callQueues.id, id),
        eq(callQueues.garageId, garageId)
      ));
    return queue || null;
  }

  async updateCallQueue(id: string, garageId: string, data: Partial<CallQueue>): Promise<CallQueue | null> {
    const [updated] = await db.update(callQueues)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(callQueues.id, id),
        eq(callQueues.garageId, garageId)
      ))
      .returning();
    return updated || null;
  }

  async deleteCallQueue(id: string, garageId: string): Promise<boolean> {
    const result = await db.delete(callQueues)
      .where(and(
        eq(callQueues.id, id),
        eq(callQueues.garageId, garageId)
      ))
      .returning();
    return result.length > 0;
  }

  async getCallQueueWithMembers(queueId: string, garageId: string): Promise<{queue: CallQueue, members: CallQueueMember[]} | null> {
    const queue = await this.getCallQueue(queueId, garageId);
    if (!queue) return null;
    
    const members = await this.listQueueMembers(queueId, garageId);
    return { queue, members };
  }

  async addQueueMember(data: InsertCallQueueMember): Promise<CallQueueMember> {
    const [member] = await db.insert(callQueueMembers)
      .values(data)
      .returning();
    return member;
  }

  async removeQueueMember(id: string, garageId: string): Promise<boolean> {
    const result = await db.delete(callQueueMembers)
      .where(and(
        eq(callQueueMembers.id, id),
        eq(callQueueMembers.garageId, garageId)
      ))
      .returning();
    return result.length > 0;
  }

  async listQueueMembers(queueId: string, garageId: string, isActive?: boolean): Promise<CallQueueMember[]> {
    const conditions = [
      eq(callQueueMembers.queueId, queueId),
      eq(callQueueMembers.garageId, garageId)
    ];
    if (isActive !== undefined) {
      conditions.push(eq(callQueueMembers.isActive, isActive));
    }
    return await db.select().from(callQueueMembers)
      .where(and(...conditions));
  }

  async updateQueueMember(id: string, garageId: string, data: Partial<CallQueueMember>): Promise<CallQueueMember | null> {
    const [updated] = await db.update(callQueueMembers)
      .set(data)
      .where(and(
        eq(callQueueMembers.id, id),
        eq(callQueueMembers.garageId, garageId)
      ))
      .returning();
    return updated || null;
  }

  async createCallSession(data: InsertCallSession): Promise<CallSession> {
    const [session] = await db.insert(callSessions)
      .values(data)
      .returning();
    return session;
  }

  async getCallSession(id: string, garageId: string): Promise<CallSession | null> {
    const [session] = await db.select().from(callSessions)
      .where(and(
        eq(callSessions.id, id),
        eq(callSessions.garageId, garageId)
      ));
    return session || null;
  }

  async listCallSessions(garageId: string, filters?: {status?: string, agentId?: string, queueId?: string}): Promise<CallSession[]> {
    const conditions = [eq(callSessions.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(callSessions.status, filters.status));
    }
    if (filters?.agentId) {
      conditions.push(eq(callSessions.assignedAgentId, filters.agentId));
    }
    if (filters?.queueId) {
      conditions.push(eq(callSessions.queueId, filters.queueId));
    }
    
    return await db.select().from(callSessions)
      .where(and(...conditions))
      .orderBy(desc(callSessions.createdAt));
  }

  async updateCallSession(id: string, garageId: string, data: Partial<CallSession>): Promise<CallSession | null> {
    const [updated] = await db.update(callSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(callSessions.id, id),
        eq(callSessions.garageId, garageId)
      ))
      .returning();
    return updated || null;
  }

  async assignCallToAgent(params: {garageId: string, sessionId: string, agentId: string, assignedBy: string}): Promise<CallSession> {
    const { garageId, sessionId, agentId, assignedBy } = params;
    
    return await db.transaction(async (tx) => {
      const [session] = await tx.select().from(callSessions)
        .where(and(
          eq(callSessions.id, sessionId),
          eq(callSessions.garageId, garageId)
        ));
      
      if (!session) {
        throw new Error("Call session not found");
      }
      
      const [updated] = await tx.update(callSessions)
        .set({ 
          assignedAgentId: agentId,
          status: 'assigned',
          updatedAt: new Date() 
        })
        .where(eq(callSessions.id, sessionId))
        .returning();
      
      await tx.insert(callEvents).values({
        sessionId,
        eventType: 'agent_assigned',
        payload: { agentId, assignedBy }
      });
      
      return updated;
    });
  }

  async createCallEvent(data: InsertCallEvent): Promise<CallEvent> {
    const [event] = await db.insert(callEvents)
      .values(data)
      .returning();
    return event;
  }

  async listCallEvents(sessionId: string): Promise<CallEvent[]> {
    return await db.select().from(callEvents)
      .where(eq(callEvents.sessionId, sessionId))
      .orderBy(desc(callEvents.occurredAt));
  }

  async createCallNote(data: InsertCallNote): Promise<CallNote> {
    const [note] = await db.insert(callNotes)
      .values(data)
      .returning();
    return note;
  }

  async listCallNotes(sessionId: string): Promise<CallNote[]> {
    return await db.select().from(callNotes)
      .where(eq(callNotes.sessionId, sessionId))
      .orderBy(desc(callNotes.createdAt));
  }

  async createCallRecording(data: InsertCallRecording): Promise<CallRecording> {
    const [recording] = await db.insert(callRecordings)
      .values(data)
      .returning();
    return recording;
  }

  async listCallRecordings(sessionId: string): Promise<CallRecording[]> {
    return await db.select().from(callRecordings)
      .where(eq(callRecordings.sessionId, sessionId))
      .orderBy(desc(callRecordings.createdAt));
  }

  async createDispositionCode(data: InsertCallDispositionCode): Promise<CallDispositionCode> {
    const [code] = await db.insert(callDispositionCodes)
      .values(data)
      .returning();
    return code;
  }

  async listDispositionCodes(garageId: string, isActive?: boolean): Promise<CallDispositionCode[]> {
    const conditions = [eq(callDispositionCodes.garageId, garageId)];
    if (isActive !== undefined) {
      conditions.push(eq(callDispositionCodes.isActive, isActive));
    }
    return await db.select().from(callDispositionCodes)
      .where(and(...conditions))
      .orderBy(callDispositionCodes.label);
  }

  async updateDispositionCode(id: string, garageId: string, data: Partial<CallDispositionCode>): Promise<CallDispositionCode | null> {
    const [updated] = await db.update(callDispositionCodes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(callDispositionCodes.id, id),
        eq(callDispositionCodes.garageId, garageId)
      ))
      .returning();
    return updated || null;
  }

  async deleteDispositionCode(id: string, garageId: string): Promise<boolean> {
    const result = await db.delete(callDispositionCodes)
      .where(and(
        eq(callDispositionCodes.id, id),
        eq(callDispositionCodes.garageId, garageId)
      ))
      .returning();
    return result.length > 0;
  }

  async createPerformanceSnapshot(data: InsertAgentPerformanceSnapshot): Promise<AgentPerformanceSnapshot> {
    const [snapshot] = await db.insert(agentPerformanceSnapshots)
      .values(data)
      .returning();
    return snapshot;
  }

  async listAgentPerformance(garageId: string, agentId?: string, dateRange?: {start: Date, end: Date}): Promise<AgentPerformanceSnapshot[]> {
    const conditions = [eq(agentPerformanceSnapshots.garageId, garageId)];
    
    if (agentId) {
      conditions.push(eq(agentPerformanceSnapshots.agentUserId, agentId));
    }
    if (dateRange) {
      conditions.push(gte(agentPerformanceSnapshots.intervalStart, dateRange.start));
      conditions.push(lte(agentPerformanceSnapshots.intervalEnd, dateRange.end));
    }
    
    return await db.select().from(agentPerformanceSnapshots)
      .where(and(...conditions))
      .orderBy(desc(agentPerformanceSnapshots.intervalStart));
  }

  async getPurchaseOrders(garageId?: string, status?: string): Promise<PurchaseOrder[]> {
    const conditions = [];
    
    if (garageId) {
      conditions.push(eq(purchaseOrders.garageId, garageId));
    }
    
    if (status) {
      conditions.push(eq(purchaseOrders.status, status));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(purchaseOrders)
        .where(and(...conditions))
        .orderBy(desc(purchaseOrders.createdAt));
    }
    
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return po;
  }

  async createPurchaseOrder(data: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const poNumber = `PO-${Date.now()}`;
    const [po] = await db.insert(purchaseOrders)
      .values({ ...data, poNumber })
      .returning();
    return po;
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>, garageId?: string): Promise<PurchaseOrder> {
    // Tenant scope (B16 breadth).
    const [po] = await db.update(purchaseOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, id), garageId ? eq(purchaseOrders.garageId, garageId) : undefined))
      .returning();
    return po;
  }

  async deletePurchaseOrder(id: string, garageId?: string): Promise<void> {
    await db.delete(purchaseOrders).where(and(eq(purchaseOrders.id, id), garageId ? eq(purchaseOrders.garageId, garageId) : undefined));
  }

  async getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    return await db.select().from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId))
      .orderBy(desc(purchaseOrderItems.createdAt));
  }

  async createPurchaseOrderItem(data: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [item] = await db.insert(purchaseOrderItems).values(data).returning();
    return item;
  }

  async updatePurchaseOrderItem(id: string, data: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem> {
    const [item] = await db.update(purchaseOrderItems)
      .set(data)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return item;
  }

  async deletePurchaseOrderItem(id: string): Promise<void> {
    await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
  }

  async createPurchaseOrderWithItems(
    poData: InsertPurchaseOrder,
    items: Omit<InsertPurchaseOrderItem, 'purchaseOrderId'>[]
  ): Promise<PurchaseOrder> {
    return await db.transaction(async (tx) => {
      const poNumber = `PO-${Date.now()}`;
      const [po] = await tx.insert(purchaseOrders)
        .values({ ...poData, poNumber })
        .returning();
      
      if (items.length > 0) {
        await tx.insert(purchaseOrderItems)
          .values(items.map(item => ({ ...item, purchaseOrderId: po.id })));
      }
      
      return po;
    });
  }

  // Purchase Agent - Task Inbox
  async getPurchaseTasks(garageId?: string, status?: string, priority?: string): Promise<PurchaseTask[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(purchaseTasks.garageId, garageId));
    if (status) conditions.push(eq(purchaseTasks.status, status));
    if (priority) conditions.push(eq(purchaseTasks.priority, priority));
    if (conditions.length > 0) {
      return await db.select().from(purchaseTasks)
        .where(and(...conditions))
        .orderBy(desc(purchaseTasks.createdAt));
    }
    return await db.select().from(purchaseTasks).orderBy(desc(purchaseTasks.createdAt));
  }

  async getPurchaseTask(id: string): Promise<PurchaseTask | undefined> {
    const [task] = await db.select().from(purchaseTasks).where(eq(purchaseTasks.id, id));
    return task;
  }

  async createPurchaseTask(data: InsertPurchaseTask): Promise<PurchaseTask> {
    const taskNumber = `PT-${Date.now()}`;
    const [task] = await db.insert(purchaseTasks)
      .values({ ...data, taskNumber })
      .returning();
    return task;
  }

  async updatePurchaseTask(id: string, data: Partial<PurchaseTask>, garageId?: string): Promise<PurchaseTask> {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [task] = await db.update(purchaseTasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(purchaseTasks.id, id), garageId ? eq(purchaseTasks.garageId, garageId) : undefined))
      .returning();
    return task;
  }

  async deletePurchaseTask(id: string, garageId?: string): Promise<void> {
    await db.delete(purchaseTasks)
      .where(and(eq(purchaseTasks.id, id), garageId ? eq(purchaseTasks.garageId, garageId) : undefined));
  }

  async getPurchaseTaskParts(taskId: string): Promise<PurchaseTaskPart[]> {
    return await db.select().from(purchaseTaskParts)
      .where(eq(purchaseTaskParts.taskId, taskId))
      .orderBy(desc(purchaseTaskParts.createdAt));
  }

  async createPurchaseTaskPart(data: InsertPurchaseTaskPart): Promise<PurchaseTaskPart> {
    const [part] = await db.insert(purchaseTaskParts).values(data).returning();
    return part;
  }

  async deletePurchaseTaskPart(id: string): Promise<void> {
    await db.delete(purchaseTaskParts).where(eq(purchaseTaskParts.id, id));
  }

  // Purchase Agent - Quotation Management
  async getQuotationRequests(garageId?: string, status?: string): Promise<QuotationRequest[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(quotationRequests.garageId, garageId));
    if (status) conditions.push(eq(quotationRequests.status, status));
    if (conditions.length > 0) {
      return await db.select().from(quotationRequests)
        .where(and(...conditions))
        .orderBy(desc(quotationRequests.createdAt));
    }
    return await db.select().from(quotationRequests).orderBy(desc(quotationRequests.createdAt));
  }

  async getQuotationRequest(id: string): Promise<QuotationRequest | undefined> {
    const [req] = await db.select().from(quotationRequests).where(eq(quotationRequests.id, id));
    return req;
  }

  async createQuotationRequest(data: InsertQuotationRequest): Promise<QuotationRequest> {
    const requestNumber = `QR-${Date.now()}`;
    const [req] = await db.insert(quotationRequests)
      .values({ ...data, requestNumber })
      .returning();
    return req;
  }

  async updateQuotationRequest(id: string, data: Partial<QuotationRequest>, garageId?: string): Promise<QuotationRequest> {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [req] = await db.update(quotationRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(quotationRequests.id, id), garageId ? eq(quotationRequests.garageId, garageId) : undefined))
      .returning();
    return req;
  }

  async deleteQuotationRequest(id: string, garageId?: string): Promise<void> {
    await db.delete(quotationRequests)
      .where(and(eq(quotationRequests.id, id), garageId ? eq(quotationRequests.garageId, garageId) : undefined));
  }

  async getSupplierQuotations(quotationRequestId: string): Promise<SupplierQuotation[]> {
    return await db.select().from(supplierQuotations)
      .where(eq(supplierQuotations.quotationRequestId, quotationRequestId))
      .orderBy(desc(supplierQuotations.createdAt));
  }

  async createSupplierQuotation(data: InsertSupplierQuotation): Promise<SupplierQuotation> {
    const [q] = await db.insert(supplierQuotations).values(data).returning();
    return q;
  }

  async updateSupplierQuotation(id: string, data: Partial<SupplierQuotation>, garageId?: string): Promise<SupplierQuotation> {
    // Tenant scope (B16 breadth): supplier_quotations has no garage_id; scope
    // through the parent quotation request's garage.
    const [q] = await db.update(supplierQuotations)
      .set(data)
      .where(and(eq(supplierQuotations.id, id), this.quotationRequestGarageScope(supplierQuotations.quotationRequestId, garageId)))
      .returning();
    return q;
  }

  async deleteSupplierQuotation(id: string, garageId?: string): Promise<void> {
    await db.delete(supplierQuotations)
      .where(and(eq(supplierQuotations.id, id), this.quotationRequestGarageScope(supplierQuotations.quotationRequestId, garageId)));
  }

  async getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
    return await db.select().from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId))
      .orderBy(desc(quotationItems.createdAt));
  }

  async createQuotationItem(data: InsertQuotationItem): Promise<QuotationItem> {
    const [item] = await db.insert(quotationItems).values(data).returning();
    return item;
  }

  async deleteQuotationItem(id: string): Promise<void> {
    await db.delete(quotationItems).where(eq(quotationItems.id, id));
  }

  // Purchase Agent - Payment Tracking
  async getSupplierPayments(garageId?: string, status?: string): Promise<SupplierPayment[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(supplierPayments.garageId, garageId));
    if (status) conditions.push(eq(supplierPayments.status, status));
    if (conditions.length > 0) {
      return await db.select().from(supplierPayments)
        .where(and(...conditions))
        .orderBy(desc(supplierPayments.createdAt));
    }
    return await db.select().from(supplierPayments).orderBy(desc(supplierPayments.createdAt));
  }

  async getSupplierPayment(id: string): Promise<SupplierPayment | undefined> {
    const [payment] = await db.select().from(supplierPayments).where(eq(supplierPayments.id, id));
    return payment;
  }

  async createSupplierPayment(data: InsertSupplierPayment): Promise<SupplierPayment> {
    const [payment] = await db.insert(supplierPayments).values(data).returning();
    return payment;
  }

  async updateSupplierPayment(id: string, data: Partial<SupplierPayment>, garageId?: string): Promise<SupplierPayment> {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [payment] = await db.update(supplierPayments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(supplierPayments.id, id), garageId ? eq(supplierPayments.garageId, garageId) : undefined))
      .returning();
    return payment;
  }

  async deleteSupplierPayment(id: string, garageId?: string): Promise<void> {
    await db.delete(supplierPayments)
      .where(and(eq(supplierPayments.id, id), garageId ? eq(supplierPayments.garageId, garageId) : undefined));
  }

  // Purchase Agent - Delivery Tracking
  async getDeliveries(garageId?: string, status?: string): Promise<Delivery[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(deliveries.garageId, garageId));
    if (status) conditions.push(eq(deliveries.status, status));
    if (conditions.length > 0) {
      return await db.select().from(deliveries)
        .where(and(...conditions))
        .orderBy(desc(deliveries.createdAt));
    }
    return await db.select().from(deliveries).orderBy(desc(deliveries.createdAt));
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery;
  }

  async createDelivery(data: InsertDelivery): Promise<Delivery> {
    const [delivery] = await db.insert(deliveries).values(data).returning();
    return delivery;
  }

  async updateDelivery(id: string, data: Partial<Delivery>, garageId?: string): Promise<Delivery> {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [delivery] = await db.update(deliveries)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(deliveries.id, id), garageId ? eq(deliveries.garageId, garageId) : undefined))
      .returning();
    return delivery;
  }

  async deleteDelivery(id: string, garageId?: string): Promise<void> {
    await db.delete(deliveries)
      .where(and(eq(deliveries.id, id), garageId ? eq(deliveries.garageId, garageId) : undefined));
  }

  async getDeliveryItems(deliveryId: string): Promise<DeliveryItem[]> {
    return await db.select().from(deliveryItems)
      .where(eq(deliveryItems.deliveryId, deliveryId))
      .orderBy(desc(deliveryItems.createdAt));
  }

  async createDeliveryItem(data: InsertDeliveryItem): Promise<DeliveryItem> {
    const [item] = await db.insert(deliveryItems).values(data).returning();
    return item;
  }

  async deleteDeliveryItem(id: string): Promise<void> {
    await db.delete(deliveryItems).where(eq(deliveryItems.id, id));
  }

  async getDeliveryTimeline(deliveryId: string): Promise<DeliveryTimelineEvent[]> {
    return await db.select().from(deliveryTimeline)
      .where(eq(deliveryTimeline.deliveryId, deliveryId))
      .orderBy(asc(deliveryTimeline.timestamp));
  }

  async createDeliveryTimelineEvent(data: InsertDeliveryTimelineEvent): Promise<DeliveryTimelineEvent> {
    const [event] = await db.insert(deliveryTimeline).values(data).returning();
    return event;
  }

  async getLiveDeliveryStatus(deliveryId: string): Promise<LiveDeliveryStatus | undefined> {
    const [status] = await db.select().from(liveDeliveryStatuses)
      .where(eq(liveDeliveryStatuses.deliveryId, deliveryId));
    return status;
  }

  async createLiveDeliveryStatus(data: InsertLiveDeliveryStatus): Promise<LiveDeliveryStatus> {
    const [status] = await db.insert(liveDeliveryStatuses).values(data).returning();
    return status;
  }

  async updateLiveDeliveryStatus(id: string, data: Partial<LiveDeliveryStatus>): Promise<LiveDeliveryStatus> {
    const [status] = await db.update(liveDeliveryStatuses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(liveDeliveryStatuses.id, id))
      .returning();
    return status;
  }

  // Module 12: Invoice & Billing
  async getInvoices(garageId?: string, status?: string): Promise<Invoice[]> {
    const { invoices } = await import("@shared/schema");
    const conditions = [];
    
    if (garageId) {
      conditions.push(eq(invoices.garageId, garageId));
    }
    
    if (status) {
      conditions.push(eq(invoices.status, status));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(invoices)
        .where(and(...conditions))
        .orderBy(desc(invoices.createdAt));
    }
    
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const { invoices } = await import("@shared/schema");
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const { invoices } = await import("@shared/schema");
    // A bare INV-<timestamp> collides on the unique invoice_number when two
    // invoices are created within the same millisecond. Add a random suffix.
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const [invoice] = await db.insert(invoices)
      .values({ ...data, invoiceNumber })
      .returning();
    return invoice;
  }

  // `garageId`, when provided, scopes the write to the caller's tenant (B4).
  async updateInvoice(id: string, data: Partial<Invoice>, garageId?: string): Promise<Invoice> {
    const { invoices } = await import("@shared/schema");
    const [invoice] = await db.update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(invoices.id, id), garageId ? eq(invoices.garageId, garageId) : undefined))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string, garageId?: string): Promise<void> {
    const { invoices } = await import("@shared/schema");
    await db.delete(invoices)
      .where(and(eq(invoices.id, id), garageId ? eq(invoices.garageId, garageId) : undefined));
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const { invoiceItems } = await import("@shared/schema");
    return await db.select().from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(desc(invoiceItems.createdAt));
  }

  async createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem> {
    const { invoiceItems } = await import("@shared/schema");
    const [item] = await db.insert(invoiceItems).values(data).returning();
    return item;
  }

  async deleteInvoiceItem(id: string): Promise<void> {
    const { invoiceItems } = await import("@shared/schema");
    await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
  }

  async createInvoiceWithItems(
    invoiceData: InsertInvoice,
    items: Omit<InsertInvoiceItem, 'invoiceId'>[]
  ): Promise<Invoice> {
    const { invoices, invoiceItems } = await import("@shared/schema");
    return await db.transaction(async (tx) => {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const [invoice] = await tx.insert(invoices)
        .values({ ...invoiceData, invoiceNumber })
        .returning();
      
      if (items.length > 0) {
        await tx.insert(invoiceItems)
          .values(items.map(item => ({ ...item, invoiceId: invoice.id })));
      }
      
      return invoice;
    });
  }

  async getPayments(invoiceId?: string): Promise<Payment[]> {
    const { payments } = await import("@shared/schema");
    if (invoiceId) {
      return await db.select().from(payments)
        .where(eq(payments.invoiceId, invoiceId))
        .orderBy(desc(payments.createdAt));
    }
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const { payments } = await import("@shared/schema");
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    const { payments } = await import("@shared/schema");
    await db.delete(payments).where(eq(payments.id, id));
  }

  /**
   * Atomically record a payment and update the invoice balance (deep-audit
   * blocker B6). The invoice row is locked FOR UPDATE for the life of the
   * transaction, so concurrent payments serialize and can no longer read a
   * stale paidAmount and lose money. `garageId`, when provided, scopes the
   * invoice lookup so a payment cannot be recorded against another tenant's
   * invoice. Returns undefined when the (garage-scoped) invoice does not exist.
   */
  async recordPayment(
    data: InsertPayment,
    garageId?: string,
  ): Promise<{ payment: Payment; invoice: Invoice } | undefined> {
    const { payments, invoices } = await import("@shared/schema");
    return await db.transaction(async (tx) => {
      const [invoice] = await tx
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, data.invoiceId), garageId ? eq(invoices.garageId, garageId) : undefined))
        .for("update");
      if (!invoice) return undefined;

      const [payment] = await tx.insert(payments).values(data).returning();

      const newPaid = parseFloat(invoice.paidAmount) + parseFloat(payment.amount);
      const balance = parseFloat(invoice.totalAmount) - newPaid;
      const [updated] = await tx
        .update(invoices)
        .set({
          paidAmount: newPaid.toFixed(2),
          balanceAmount: balance.toFixed(2),
          status: balance <= 0 ? "paid" : invoice.status,
          paidAt: balance <= 0 ? new Date() : invoice.paidAt,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id))
        .returning();
      return { payment, invoice: updated };
    });
  }

  /**
   * Exactly-once gateway settlement (deep-audit blocker B9). Runs in one
   * transaction with the invoice locked FOR UPDATE, so concurrent webhook
   * retries serialize: the first settles, the rest observe the completed payment
   * and no-op. The partial unique index payments_gateway_txn_unique is the
   * database-level backstop — a duplicate (gateway, gateway_transaction_id) that
   * slips past the lock raises 23505 and is treated as already-processed. Used
   * by both the webhook path and the manual settle (transactionId undefined).
   */
  async settleGatewayPayment(opts: {
    invoiceId: string;
    amount?: number;
    currency?: string;
    gateway: string;
    methodType?: string;
    transactionId?: string;
    createdBy?: string;
  }): Promise<{ settled: boolean; alreadyProcessed: boolean }> {
    const { payments, invoices } = await import("@shared/schema");
    return await db.transaction(async (tx) => {
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, opts.invoiceId)).for("update");
      if (!invoice) return { settled: false, alreadyProcessed: false };

      const amount = opts.amount ?? Number((invoice as any).balanceAmount ?? (invoice as any).totalAmount ?? 0);

      const applySettle = async () => {
        const prevPaid = parseFloat(invoice.paidAmount || "0");
        const total = parseFloat(invoice.totalAmount || "0");
        const newPaid = prevPaid + Number(amount);
        const balance = Math.max(total - newPaid, 0);
        await tx
          .update(invoices)
          .set({
            paidAmount: newPaid.toFixed(2),
            balanceAmount: balance.toFixed(2),
            status: balance <= 0 ? "paid" : invoice.status,
            paidAt: balance <= 0 ? new Date() : invoice.paidAt,
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoice.id));
      };

      if (opts.transactionId) {
        const existing = await tx
          .select()
          .from(payments)
          .where(and(eq(payments.gateway, opts.gateway as any), eq(payments.gatewayTransactionId, opts.transactionId)));
        if (existing.some((p) => p.status === "completed")) {
          return { settled: false, alreadyProcessed: true };
        }
        const pending = existing.find((p) => p.status === "pending");
        if (pending) {
          await tx.update(payments).set({ status: "completed", paymentDate: new Date() }).where(eq(payments.id, pending.id));
          await applySettle();
          return { settled: true, alreadyProcessed: false };
        }
      }

      try {
        // Savepoint so a unique-index violation doesn't poison the outer txn.
        await tx.transaction(async (sp) => {
          await sp.insert(payments).values({
            invoiceId: opts.invoiceId,
            amount: Number(amount).toFixed(2),
            paymentMethod: opts.methodType || "card",
            gateway: opts.gateway,
            methodType: opts.methodType || null,
            status: "completed",
            currency: opts.currency || "SAR",
            gatewayTransactionId: opts.transactionId || null,
            createdBy: opts.createdBy || (invoice as any).createdBy || null,
          } as any);
        });
      } catch (e: any) {
        if (String(e?.code) === "23505") return { settled: false, alreadyProcessed: true };
        throw e;
      }

      await applySettle();
      return { settled: true, alreadyProcessed: false };
    });
  }

  /**
   * Atomically reverse (delete) a payment and restore the invoice balance
   * (deep-audit blocker B7). Both the payment and its invoice are locked FOR
   * UPDATE. `garageId`, when provided, scopes the reversal to the caller's
   * tenant. Returns false when the payment or its (garage-scoped) invoice is
   * not found — the caller maps that to 404.
   */
  async reversePayment(id: string, garageId?: string): Promise<boolean> {
    const { payments, invoices } = await import("@shared/schema");
    return await db.transaction(async (tx) => {
      const [payment] = await tx.select().from(payments).where(eq(payments.id, id)).for("update");
      if (!payment) return false;

      const [invoice] = await tx
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, payment.invoiceId), garageId ? eq(invoices.garageId, garageId) : undefined))
        .for("update");
      if (!invoice) return false; // cross-tenant or orphaned — refuse

      await tx.delete(payments).where(eq(payments.id, id));

      const newPaid = Math.max(0, parseFloat(invoice.paidAmount) - parseFloat(payment.amount));
      const balance = parseFloat(invoice.totalAmount) - newPaid;
      await tx
        .update(invoices)
        .set({
          paidAmount: newPaid.toFixed(2),
          balanceAmount: balance.toFixed(2),
          // Reopening: a fully-paid invoice that is no longer covered reverts to 'sent'.
          status: balance <= 0 ? invoice.status : invoice.status === "paid" ? "sent" : invoice.status,
          paidAt: balance <= 0 ? invoice.paidAt : null,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));
      return true;
    });
  }

  // Estimates & Quotes - Module 23
  async getEstimates(garageId?: string, status?: string): Promise<Estimate[]> {
    const conditions = [];
    
    if (garageId) {
      conditions.push(eq(estimates.garageId, garageId));
    }
    
    if (status) {
      conditions.push(eq(estimates.status, status));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(estimates)
        .where(and(...conditions))
        .orderBy(desc(estimates.createdAt));
    }
    
    return await db.select().from(estimates).orderBy(desc(estimates.createdAt));
  }

  async getEstimate(id: string): Promise<Estimate | undefined> {
    const [estimate] = await db.select().from(estimates).where(eq(estimates.id, id));
    return estimate;
  }

  async createEstimate(data: InsertEstimate): Promise<Estimate> {
    const estimateNumber = `EST-${Date.now()}`;
    const [estimate] = await db.insert(estimates)
      .values({ ...data, estimateNumber })
      .returning();
    return estimate;
  }

  // `garageId`, when provided, scopes the write to the caller's tenant (B4).
  async updateEstimate(id: string, data: Partial<Estimate>, garageId?: string): Promise<Estimate> {
    const [estimate] = await db.update(estimates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(estimates.id, id), garageId ? eq(estimates.garageId, garageId) : undefined))
      .returning();
    return estimate;
  }

  async deleteEstimate(id: string, garageId?: string): Promise<void> {
    await db.delete(estimates)
      .where(and(eq(estimates.id, id), garageId ? eq(estimates.garageId, garageId) : undefined));
  }

  async getEstimateItems(estimateId: string): Promise<EstimateItem[]> {
    return await db.select().from(estimateItems)
      .where(eq(estimateItems.estimateId, estimateId))
      .orderBy(desc(estimateItems.createdAt));
  }

  async createEstimateItem(data: InsertEstimateItem): Promise<EstimateItem> {
    const [item] = await db.insert(estimateItems).values(data).returning();
    return item;
  }

  async deleteEstimateItem(id: string): Promise<void> {
    await db.delete(estimateItems).where(eq(estimateItems.id, id));
  }

  async createEstimateWithItems(
    estimateData: InsertEstimate,
    items: Omit<InsertEstimateItem, 'estimateId'>[]
  ): Promise<Estimate> {
    return await db.transaction(async (tx) => {
      const estimateNumber = `EST-${Date.now()}`;
      const [estimate] = await tx.insert(estimates)
        .values({ ...estimateData, estimateNumber })
        .returning();
      
      if (items.length > 0) {
        await tx.insert(estimateItems)
          .values(items.map(item => ({ ...item, estimateId: estimate.id })));
      }
      
      return estimate;
    });
  }

  // Reports & Dashboards - Module 13
  async getReportsOverview(garageId?: string): Promise<{
    totalRevenue: string;
    totalInvoices: number;
    totalJobCards: number;
    totalCustomers: number;
    pendingInvoices: number;
    activeJobCards: number;
    recentInvoices: Invoice[];
    recentJobCards: JobCard[];
  }> {
    const invoicesData = garageId 
      ? await this.getInvoices(garageId)
      : await this.getInvoices();
    
    const jobCardsData = await this.getJobCards();
    const filteredJobCards = garageId
      ? jobCardsData.filter(jc => jc.garageId === garageId)
      : jobCardsData;
    
    const customersData = await db.select().from(users).where(eq(users.userType, 'customer'));
    
    const totalRevenue = invoicesData
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0)
      .toFixed(2);
    
    const pendingInvoices = invoicesData.filter(inv => 
      inv.status === 'draft' || inv.status === 'sent'
    ).length;
    
    const activeJobCards = filteredJobCards.filter(jc => 
      jc.status === 'pending' || jc.status === 'in_progress'
    ).length;
    
    return {
      totalRevenue,
      totalInvoices: invoicesData.length,
      totalJobCards: filteredJobCards.length,
      totalCustomers: customersData.length,
      pendingInvoices,
      activeJobCards,
      recentInvoices: invoicesData.slice(0, 5),
      recentJobCards: filteredJobCards.slice(0, 5),
    };
  }

  async getRevenueReport(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: string;
    paidAmount: string;
    pendingAmount: string;
    invoicesByStatus: { status: string; count: number; total: string }[];
    revenueByMonth: { month: string; revenue: string }[];
    paymentsByMethod: { method: string; total: string; count: number }[];
  }> {
    const invoicesData = garageId 
      ? await this.getInvoices(garageId)
      : await this.getInvoices();
    
    // Filter by date range if provided
    let filteredInvoices = invoicesData;
    if (startDate || endDate) {
      filteredInvoices = invoicesData.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        if (startDate && invDate < startDate) return false;
        if (endDate && invDate > endDate) return false;
        return true;
      });
    }
    
    const totalRevenue = filteredInvoices
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0)
      .toFixed(2);
    
    const paidAmount = filteredInvoices
      .reduce((sum, inv) => sum + parseFloat(inv.paidAmount), 0)
      .toFixed(2);
    
    const pendingAmount = filteredInvoices
      .reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0)
      .toFixed(2);
    
    // Group by status
    const statusMap = new Map<string, { count: number; total: number }>();
    filteredInvoices.forEach(inv => {
      const existing = statusMap.get(inv.status) || { count: 0, total: 0 };
      statusMap.set(inv.status, {
        count: existing.count + 1,
        total: existing.total + parseFloat(inv.totalAmount),
      });
    });
    
    const invoicesByStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      total: data.total.toFixed(2),
    }));
    
    // Group by month
    const monthMap = new Map<string, number>();
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, existing + parseFloat(inv.totalAmount));
    });
    
    const revenueByMonth = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({
        month,
        revenue: revenue.toFixed(2),
      }));
    
    // Get payments and group by method
    const paymentsData = await this.getPayments();
    const filteredPayments = paymentsData.filter(payment => {
      const invoice = filteredInvoices.find(inv => inv.id === payment.invoiceId);
      return !!invoice;
    });
    
    const methodMap = new Map<string, { count: number; total: number }>();
    filteredPayments.forEach(payment => {
      const existing = methodMap.get(payment.paymentMethod) || { count: 0, total: 0 };
      methodMap.set(payment.paymentMethod, {
        count: existing.count + 1,
        total: existing.total + parseFloat(payment.amount),
      });
    });
    
    const paymentsByMethod = Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      total: data.total.toFixed(2),
      count: data.count,
    }));
    
    // Calculate comparison metrics if date range is provided
    let comparison;
    if (startDate && endDate) {
      const currentRevenue = parseFloat(totalRevenue);
      
      // Calculate previous month (same date range, 1 month earlier)
      // Use the original invoicesData (before current date filter) for comparison
      const prevMonthStart = new Date(startDate);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(endDate);
      prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
      
      const prevMonthInvoices = invoicesData.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate >= prevMonthStart && invDate <= prevMonthEnd;
      });
      
      const prevMonthRevenue = prevMonthInvoices
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
      
      const monthChange = currentRevenue - prevMonthRevenue;
      const monthPercentChange = prevMonthRevenue > 0 
        ? (monthChange / prevMonthRevenue) * 100 
        : 0;
      
      // Calculate previous year (same date range, 1 year earlier)
      const prevYearStart = new Date(startDate);
      prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
      const prevYearEnd = new Date(endDate);
      prevYearEnd.setFullYear(prevYearEnd.getFullYear() - 1);
      
      const prevYearInvoices = invoicesData.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate >= prevYearStart && invDate <= prevYearEnd;
      });
      
      const prevYearRevenue = prevYearInvoices
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0);
      
      const yearChange = currentRevenue - prevYearRevenue;
      const yearPercentChange = prevYearRevenue > 0 
        ? (yearChange / prevYearRevenue) * 100 
        : 0;
      
      comparison = {
        previousMonth: {
          revenue: Math.round(prevMonthRevenue * 100) / 100,
          change: Math.round(monthChange * 100) / 100,
          percentChange: Math.round(monthPercentChange * 100) / 100,
        },
        previousYear: {
          revenue: Math.round(prevYearRevenue * 100) / 100,
          change: Math.round(yearChange * 100) / 100,
          percentChange: Math.round(yearPercentChange * 100) / 100,
        },
      };
    }
    
    const result: {
      totalRevenue: string;
      paidAmount: string;
      pendingAmount: string;
      invoicesByStatus: { status: string; count: number; total: string }[];
      revenueByMonth: { month: string; revenue: string }[];
      paymentsByMethod: { method: string; total: string; count: number }[];
      comparison?: {
        previousMonth: {
          revenue: number;
          change: number;
          percentChange: number;
        };
        previousYear: {
          revenue: number;
          change: number;
          percentChange: number;
        };
      };
    } = {
      totalRevenue,
      paidAmount,
      pendingAmount,
      invoicesByStatus,
      revenueByMonth,
      paymentsByMethod,
    };
    
    if (comparison) {
      result.comparison = comparison;
    }
    
    return result;
  }

  async getJobCardAnalytics(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    totalJobCards: number;
    byStatus: { status: string; count: number }[];
    byPriority: { priority: string; count: number }[];
    averageCompletionTime: number;
    topTechnicians: { technicianId: string; jobCount: number }[];
  }> {
    const jobCardsData = await this.getJobCards();
    let filteredJobCards = garageId
      ? jobCardsData.filter(jc => jc.garageId === garageId)
      : jobCardsData;
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filteredJobCards = filteredJobCards.filter(jc => {
        if (!jc.createdAt) return true;
        const jcDate = new Date(jc.createdAt);
        if (startDate && jcDate < startDate) return false;
        if (endDate && jcDate > endDate) return false;
        return true;
      });
    }
    
    // Group by status
    const statusMap = new Map<string, number>();
    filteredJobCards.forEach(jc => {
      statusMap.set(jc.status, (statusMap.get(jc.status) || 0) + 1);
    });
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));
    
    // Group by priority
    const priorityMap = new Map<string, number>();
    filteredJobCards.forEach(jc => {
      priorityMap.set(jc.priority, (priorityMap.get(jc.priority) || 0) + 1);
    });
    const byPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));
    
    // Calculate average completion time from completed job cards
    const completedJobCards = filteredJobCards.filter(jc => 
      jc.status === 'completed' && jc.createdAt && jc.completedAt
    );
    let averageCompletionTime = 0;
    if (completedJobCards.length > 0) {
      const totalHours = completedJobCards.reduce((sum, jc) => {
        const start = new Date(jc.createdAt!).getTime();
        const end = new Date(jc.completedAt!).getTime();
        return sum + ((end - start) / (1000 * 60 * 60)); // Convert to hours
      }, 0);
      averageCompletionTime = Math.round(totalHours / completedJobCards.length);
    }
    
    // Get task assignments for the filtered job cards only
    const jobCardIds = filteredJobCards.map(jc => jc.id);
    const relevantTasks = jobCardIds.length > 0
      ? await db.select().from(taskAssignments)
          .where(inArray(taskAssignments.jobCardId, jobCardIds))
      : [];
    
    const techMap = new Map<string, number>();
    relevantTasks.forEach(task => {
      if (task.assignedTo) {
        techMap.set(task.assignedTo, (techMap.get(task.assignedTo) || 0) + 1);
      }
    });
    
    const topTechnicians = Array.from(techMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([technicianId, jobCount]) => ({
        technicianId,
        jobCount,
      }));
    
    return {
      totalJobCards: filteredJobCards.length,
      byStatus,
      byPriority,
      averageCompletionTime,
      topTechnicians,
    };
  }

  async getInventoryReport(garageId?: string): Promise<{
    totalTools: number;
    availableTools: number;
    inUseTools: number;
    toolsByCategory: { category: string; count: number }[];
    lowStockItems: { itemName: string; currentStock: number }[];
  }> {
    const toolsData = await this.getTools();
    
    // Tools table doesn't have garageId - all tools are available system-wide
    // We'll use all tools for now since they can be assigned to any garage
    const filteredTools = toolsData;
    
    // Get tool availability records
    const availabilityRecords = await db.select().from(toolAvailability);
    
    let availableTools = 0;
    let inUseTools = 0;
    
    // Filter by garage if specified and count availability
    const relevantAvailability = garageId
      ? availabilityRecords.filter(a => a.garageId === garageId)
      : availabilityRecords;
    
    relevantAvailability.forEach(avail => {
      if (avail.status === 'available') availableTools++;
      if (avail.status === 'in_use') inUseTools++;
    });
    
    // Group by category (toolType)
    const categoryMap = new Map<string, number>();
    filteredTools.forEach(tool => {
      categoryMap.set(tool.toolType, (categoryMap.get(tool.toolType) || 0) + 1);
    });
    const toolsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));
    
    // Placeholder for low stock items (would need actual stock tracking)
    const lowStockItems: { itemName: string; currentStock: number }[] = [];
    
    return {
      totalTools: filteredTools.length,
      availableTools,
      inUseTools,
      toolsByCategory,
      lowStockItems,
    };
  }

  async getTechnicianPerformance(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    technicians: {
      id: string;
      name: string;
      jobsCompleted: number;
      avgCompletionTime: number;
      revenueGenerated: number;
      efficiencyRating: number;
      jobsByStatus: { status: string; count: number }[];
    }[];
  }> {
    // Build query conditions for technicians
    const technicianConditions = [eq(users.userType, 'technician')];
    if (garageId) {
      technicianConditions.push(eq(users.garageId, garageId));
    }
    
    // Get technicians with proper SQL filtering
    const filteredTechnicians = await db
      .select()
      .from(users)
      .where(and(...technicianConditions));
    
    // Build query conditions for job cards based on date range and garage
    const jobCardConditions = [];
    if (garageId) {
      jobCardConditions.push(eq(jobCards.garageId, garageId));
    }
    if (startDate) {
      jobCardConditions.push(gte(jobCards.createdAt, startDate));
    }
    if (endDate) {
      jobCardConditions.push(lte(jobCards.createdAt, endDate));
    }
    
    // Get job cards with proper SQL filtering
    const relevantJobCards = jobCardConditions.length > 0
      ? await db.select().from(jobCards).where(and(...jobCardConditions))
      : await db.select().from(jobCards);
    
    // Build query conditions for invoices based on date range and garage
    const invoiceConditions = [];
    if (garageId) {
      invoiceConditions.push(eq(invoices.garageId, garageId));
    }
    if (startDate) {
      invoiceConditions.push(gte(invoices.createdAt, startDate));
    }
    if (endDate) {
      invoiceConditions.push(lte(invoices.createdAt, endDate));
    }
    
    // Get invoices with proper SQL filtering
    const relevantInvoices = invoiceConditions.length > 0
      ? await db.select().from(invoices).where(and(...invoiceConditions))
      : await db.select().from(invoices);
    
    // Calculate performance metrics for each technician
    const technicianMetrics = await Promise.all(
      filteredTechnicians.map(async (tech) => {
        // Get job cards assigned to this technician
        const techJobCards = relevantJobCards.filter(jc => jc.assignedTo === tech.id);
        
        // Count jobs by status
        const statusMap = new Map<string, number>();
        techJobCards.forEach(jc => {
          statusMap.set(jc.status, (statusMap.get(jc.status) || 0) + 1);
        });
        
        const jobsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
          status,
          count,
        }));
        
        // Calculate completed jobs
        const completedJobs = techJobCards.filter(jc => jc.status === 'completed');
        const jobsCompleted = completedJobs.length;
        
        // Calculate average completion time (in days) - only for jobs with completedAt
        let avgCompletionTime = 0;
        const jobsWithCompletionDate = completedJobs.filter(jc => jc.createdAt && jc.completedAt);
        if (jobsWithCompletionDate.length > 0) {
          const totalDays = jobsWithCompletionDate.reduce((sum, jc) => {
            const created = new Date(jc.createdAt!);
            const completed = new Date(jc.completedAt!);
            const diffTime = Math.abs(completed.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }, 0);
          avgCompletionTime = totalDays / jobsWithCompletionDate.length;
        }
        
        // Calculate revenue generated from job cards linked to invoices (parse as number)
        const techInvoices = relevantInvoices.filter(inv => 
          techJobCards.some(jc => jc.id === inv.jobCardId)
        );
        const totalRevenue = techInvoices.reduce((sum, inv) => {
          const amount = parseFloat(inv.totalAmount || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        // Calculate efficiency rating (percentage of jobs completed on time)
        // For now, use completion rate as efficiency
        const efficiencyRating = techJobCards.length > 0 
          ? (completedJobs.length / techJobCards.length) * 100 
          : 0;
        
        return {
          id: tech.id,
          name: tech.fullName || 'Unknown',
          jobsCompleted,
          avgCompletionTime: Math.round(avgCompletionTime * 10) / 10, // Round to 1 decimal
          revenueGenerated: Math.round(totalRevenue * 100) / 100, // Round to 2 decimals, return as number
          efficiencyRating: Math.round(efficiencyRating),
          jobsByStatus,
        };
      })
    );
    
    return {
      technicians: technicianMetrics,
    };
  }

  async getCustomerAnalytics(garageId?: string, startDate?: Date, endDate?: Date): Promise<{
    customers: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      lifetimeValue: number;
      totalInvoices: number;
      totalVisits: number;
      avgInvoiceValue: number;
      lastVisit: Date | null;
      status: string;
    }[];
  }> {
    // Get all customers (users with userType 'customer')
    const allCustomers = await db.select().from(users);
    const customerUsers = allCustomers.filter(u => u.userType === 'customer');
    
    // Filter by garage if specified (customers associated with that garage through invoices/appointments)
    // For now, we'll get all customers and filter their data by garage
    
    // Build query conditions for invoices based on date range and garage
    const invoiceConditions = [];
    if (garageId) {
      invoiceConditions.push(eq(invoices.garageId, garageId));
    }
    if (startDate) {
      invoiceConditions.push(gte(invoices.createdAt, startDate));
    }
    if (endDate) {
      invoiceConditions.push(lte(invoices.createdAt, endDate));
    }
    
    // Get invoices with proper SQL filtering
    const relevantInvoices = invoiceConditions.length > 0
      ? await db.select().from(invoices).where(and(...invoiceConditions))
      : await db.select().from(invoices);
    
    // Build query conditions for appointments based on date range and garage
    const appointmentConditions = [];
    if (garageId) {
      appointmentConditions.push(eq(appointments.garageId, garageId));
    }
    if (startDate) {
      appointmentConditions.push(gte(appointments.appointmentDate, startDate));
    }
    if (endDate) {
      appointmentConditions.push(lte(appointments.appointmentDate, endDate));
    }
    
    // Get appointments with proper SQL filtering
    const relevantAppointments = appointmentConditions.length > 0
      ? await db.select().from(appointments).where(and(...appointmentConditions))
      : await db.select().from(appointments);
    
    // Get unique customer IDs from relevant invoices and appointments
    const activeCustomerIds = new Set<string>();
    relevantInvoices.forEach(inv => {
      if (inv.customerId) activeCustomerIds.add(inv.customerId);
    });
    relevantAppointments.forEach(apt => {
      if (apt.customerId) activeCustomerIds.add(apt.customerId);
    });
    
    // Filter customers to only those with activity in the filtered data
    const filteredCustomerUsers = garageId
      ? customerUsers.filter(c => activeCustomerIds.has(c.id))
      : customerUsers;
    
    // Calculate analytics for each customer
    const customerMetrics = filteredCustomerUsers.map((customer) => {
      // Get invoices for this customer
      const customerInvoices = relevantInvoices.filter(inv => inv.customerId === customer.id);
      
      // Get appointments for this customer
      const customerAppointments = relevantAppointments.filter(apt => apt.customerId === customer.id);
      
      // Calculate lifetime value (total amount from invoices)
      const lifetimeValue = customerInvoices.reduce((sum, inv) => {
        const amount = parseFloat(inv.totalAmount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      // Calculate total invoices
      const totalInvoices = customerInvoices.length;
      
      // Calculate average invoice value
      const avgInvoiceValue = totalInvoices > 0 ? lifetimeValue / totalInvoices : 0;
      
      // Calculate total visits (appointments + job cards would be more accurate, but using appointments for now)
      const totalVisits = customerAppointments.length;
      
      // Get last visit date (most recent appointment)
      let lastVisit: Date | null = null;
      if (customerAppointments.length > 0) {
        const sortedAppointments = customerAppointments.sort((a, b) => {
          const dateA = a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
          const dateB = b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
          return dateB - dateA;
        });
        if (sortedAppointments[0].appointmentDate) {
          lastVisit = new Date(sortedAppointments[0].appointmentDate);
        }
      }
      
      // Determine customer status based on activity
      let status = 'inactive';
      if (lastVisit) {
        const daysSinceLastVisit = Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastVisit <= 30) {
          status = 'active';
        } else if (daysSinceLastVisit <= 90) {
          status = 'recent';
        }
      }
      
      return {
        id: customer.id,
        name: customer.fullName || 'Unknown',
        email: customer.email,
        phone: customer.phone,
        lifetimeValue: Math.round(lifetimeValue * 100) / 100,
        totalInvoices,
        totalVisits,
        avgInvoiceValue: Math.round(avgInvoiceValue * 100) / 100,
        lastVisit,
        status,
      };
    });
    
    // Sort by lifetime value descending
    customerMetrics.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
    
    return {
      customers: customerMetrics,
    };
  }
  
  // Notification operations - Module 21
  async getNotifications(
    recipientId?: string,
    garageId?: string,
    status?: string,
    type?: string
  ): Promise<Notification[]> {
    const conditions = [];
    if (recipientId) conditions.push(eq(notifications.recipientId, recipientId));
    if (garageId) conditions.push(eq(notifications.garageId, garageId));
    if (status) conditions.push(eq(notifications.status, status));
    if (type) conditions.push(eq(notifications.type, type));

    const result = await db
      .select()
      .from(notifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(notifications.createdAt));

    return result;
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ status: 'read', readAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markNotificationAsSent(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markNotificationAsFailed(id: string, reason: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ 
        status: 'failed', 
        failureReason: reason, 
        updatedAt: new Date() 
      })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async getUnreadCount(recipientId: string, garageId?: string): Promise<number> {
    const conditions = [
      eq(notifications.recipientId, recipientId),
      or(
        eq(notifications.status, 'pending'),
        eq(notifications.status, 'sent'),
        eq(notifications.status, 'delivered')
      )
    ];
    
    if (garageId) {
      conditions.push(eq(notifications.garageId, garageId));
    }

    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions));

    return result.length;
  }

  // Notification Schedules - Automated notifications
  async getNotificationSchedules(garageId: string): Promise<NotificationSchedule[]> {
    const { notificationSchedules } = await import("@shared/schema");
    return db
      .select()
      .from(notificationSchedules)
      .where(eq(notificationSchedules.garageId, garageId))
      .orderBy(notificationSchedules.triggerType);
  }

  async getNotificationSchedule(id: string): Promise<NotificationSchedule | undefined> {
    const { notificationSchedules } = await import("@shared/schema");
    const [schedule] = await db
      .select()
      .from(notificationSchedules)
      .where(eq(notificationSchedules.id, id));
    return schedule;
  }

  async createNotificationSchedule(data: InsertNotificationSchedule): Promise<NotificationSchedule> {
    const { notificationSchedules } = await import("@shared/schema");
    const [schedule] = await db
      .insert(notificationSchedules)
      .values(data)
      .returning();
    return schedule;
  }

  async updateNotificationSchedule(id: string, data: Partial<NotificationSchedule>): Promise<NotificationSchedule> {
    const { notificationSchedules } = await import("@shared/schema");
    const [schedule] = await db
      .update(notificationSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteNotificationSchedule(id: string): Promise<void> {
    const { notificationSchedules } = await import("@shared/schema");
    await db.delete(notificationSchedules).where(eq(notificationSchedules.id, id));
  }

  // Notification Preferences - Module 24 (canonical versions are at line ~11990)

  // Customer Portal Methods - Module 25
  async getCustomerAppointments(customerId: string) {
    const { appointments } = await import("@shared/schema");
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.customerId, customerId))
      .orderBy(desc(appointments.appointmentDate));
    return result;
  }

  async getCustomerInvoices(customerId: string) {
    const { invoices } = await import("@shared/schema");
    const result = await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.invoiceDate));
    return result;
  }

  async getCustomerJobCards(customerId: string) {
    const { jobCards } = await import("@shared/schema");
    const result = await db
      .select()
      .from(jobCards)
      .where(eq(jobCards.customerId, customerId))
      .orderBy(desc(jobCards.createdAt));
    return result;
  }

  async getCustomerProfile(userId: string) {
    const { customerProfiles } = await import("@shared/schema");
    const [profile] = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId));
    return profile || null;
  }

  async createCustomerProfile(data: { userId: string; address?: string | null; nationality?: string | null; preferredLanguage?: string | null }) {
    const { customerProfiles } = await import("@shared/schema");
    const [profile] = await db
      .insert(customerProfiles)
      .values(data)
      .returning();
    return profile;
  }

  // Calendar & Scheduling Methods - Module 26
  // Technician Availability
  async getTechnicianAvailability(technicianId: string, startDate?: Date, endDate?: Date) {
    if (startDate && endDate) {
      return await db
        .select()
        .from(technicianAvailability)
        .where(
          and(
            eq(technicianAvailability.technicianId, technicianId),
            or(
              and(
                gte(technicianAvailability.startDate, startDate),
                lte(technicianAvailability.startDate, endDate)
              ),
              and(
                gte(technicianAvailability.endDate, startDate),
                lte(technicianAvailability.endDate, endDate)
              )
            )
          )
        );
    }

    return await db
      .select()
      .from(technicianAvailability)
      .where(eq(technicianAvailability.technicianId, technicianId));
  }

  async createTechnicianAvailability(data: InsertTechnicianAvailability) {
    const [availability] = await db
      .insert(technicianAvailability)
      .values(data)
      .returning();
    return availability;
  }

  async updateTechnicianAvailability(id: string, data: Partial<TechnicianAvailability>) {
    const [updated] = await db
      .update(technicianAvailability)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(technicianAvailability.id, id))
      .returning();
    return updated;
  }

  async deleteTechnicianAvailability(id: string) {
    await db.delete(technicianAvailability).where(eq(technicianAvailability.id, id));
  }

  async getGarageAvailability(garageId: string, startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(technicianAvailability)
      .where(
        and(
          eq(technicianAvailability.garageId, garageId),
          or(
            and(
              gte(technicianAvailability.startDate, startDate),
              lte(technicianAvailability.startDate, endDate)
            ),
            and(
              gte(technicianAvailability.endDate, startDate),
              lte(technicianAvailability.endDate, endDate)
            )
          )
        )
      );
  }

  // Recurring Appointments
  async getRecurringAppointments(garageId: string) {
    return await db
      .select()
      .from(recurringAppointments)
      .where(
        and(
          eq(recurringAppointments.garageId, garageId),
          eq(recurringAppointments.isActive, true)
        )
      )
      .orderBy(desc(recurringAppointments.createdAt));
  }

  async getRecurringAppointment(id: string) {
    const [appointment] = await db
      .select()
      .from(recurringAppointments)
      .where(eq(recurringAppointments.id, id));
    return appointment;
  }

  async createRecurringAppointment(data: InsertRecurringAppointment) {
    const [appointment] = await db
      .insert(recurringAppointments)
      .values(data)
      .returning();
    return appointment;
  }

  async updateRecurringAppointment(id: string, data: Partial<RecurringAppointment>) {
    const [updated] = await db
      .update(recurringAppointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(recurringAppointments.id, id))
      .returning();
    return updated;
  }

  async deleteRecurringAppointment(id: string) {
    await db
      .update(recurringAppointments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(recurringAppointments.id, id));
  }

  async generateAppointmentsFromRecurring(recurringId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    const recurring = await this.getRecurringAppointment(recurringId);
    if (!recurring) return [];

    const generatedAppointments: Appointment[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Logic to generate appointments based on recurrence pattern
      // This is a simplified version - full implementation would handle all patterns
      if (recurring.recurrencePattern === 'weekly' && currentDate.getDay() === recurring.dayOfWeek) {
        const appointmentDate = new Date(currentDate);
        const [hours, minutes] = recurring.startTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const appointmentNumber = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const [appointment] = await db
          .insert(appointments)
          .values({
            appointmentNumber,
            garageId: recurring.garageId,
            customerId: recurring.customerId,
            customerName: recurring.customerName,
            customerPhone: recurring.customerPhone,
            customerEmail: recurring.customerEmail,
            vehicleInfo: recurring.vehicleInfo,
            serviceType: recurring.serviceType,
            description: recurring.description,
            appointmentDate,
            duration: recurring.duration,
            status: 'scheduled',
            assignedTo: recurring.assignedTo,
            createdBy: recurring.createdBy,
          })
          .returning();
        
        generatedAppointments.push(appointment);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return generatedAppointments;
  }

  // Calendar Events
  async getCalendarEvents(garageId: string, startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.garageId, garageId),
          gte(calendarEvents.startTime, startDate),
          lte(calendarEvents.endTime, endDate)
        )
      )
      .orderBy(calendarEvents.startTime);
  }

  async getCalendarEvent(id: string) {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id));
    return event;
  }

  async createCalendarEvent(data: InsertCalendarEvent) {
    const [event] = await db
      .insert(calendarEvents)
      .values(data)
      .returning();
    return event;
  }

  async updateCalendarEvent(id: string, data: Partial<CalendarEvent>) {
    const [updated] = await db
      .update(calendarEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return updated;
  }

  async deleteCalendarEvent(id: string) {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Conflict Detection & Optimization
  async checkAppointmentConflicts(appointmentData: any) {
    const conflicts = [];
    const { appointmentDate, duration, assignedTo } = appointmentData;
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    // Check for overlapping appointments
    const overlappingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.assignedTo, assignedTo),
          or(
            and(
              gte(appointments.appointmentDate, appointmentDate),
              lte(appointments.appointmentDate, endTime)
            ),
            and(
              lte(appointments.appointmentDate, appointmentDate),
              gte(
                appointments.appointmentDate,
                new Date(appointmentDate.getTime() - duration * 60000)
              )
            )
          )
        )
      );

    if (overlappingAppointments.length > 0) {
      conflicts.push({
        type: 'appointment_overlap',
        conflicts: overlappingAppointments,
      });
    }

    // Check for technician availability/time off
    const techAvailability = await this.getTechnicianAvailability(
      assignedTo,
      appointmentDate,
      endTime
    );

    const unavailable = techAvailability.filter(
      (avail) => !avail.isAvailable && avail.availabilityType === 'time_off'
    );

    if (unavailable.length > 0) {
      conflicts.push({
        type: 'technician_unavailable',
        conflicts: unavailable,
      });
    }

    return conflicts;
  }

  async getAvailableTimeSlots(technicianId: string, date: Date, duration: number) {
    const slots = [];
    const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM default
    
    // Get technician's appointments for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.assignedTo, technicianId),
          gte(appointments.appointmentDate, dayStart),
          lte(appointments.appointmentDate, dayEnd)
        )
      )
      .orderBy(appointments.appointmentDate);

    // Calculate available slots
    let currentTime = new Date(date);
    currentTime.setHours(workingHours.start, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(workingHours.end, 0, 0, 0);

    for (const appointment of dayAppointments) {
      const appointmentStart = new Date(appointment.appointmentDate);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);

      // If there's a gap before this appointment
      if (currentTime < appointmentStart) {
        const availableMinutes = (appointmentStart.getTime() - currentTime.getTime()) / 60000;
        if (availableMinutes >= duration) {
          slots.push({
            start: new Date(currentTime),
            end: new Date(appointmentStart),
            duration: availableMinutes,
          });
        }
      }

      currentTime = appointmentEnd;
    }

    // Check if there's time after the last appointment
    if (currentTime < endTime) {
      const availableMinutes = (endTime.getTime() - currentTime.getTime()) / 60000;
      if (availableMinutes >= duration) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(endTime),
          duration: availableMinutes,
        });
      }
    }

    return slots;
  }

  async getTechnicianWorkload(technicianId: string, startDate: Date, endDate: Date) {
    const appointmentsList = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.assignedTo, technicianId),
          gte(appointments.appointmentDate, startDate),
          lte(appointments.appointmentDate, endDate)
        )
      );

    const totalMinutes = appointmentsList.reduce((sum, apt) => sum + apt.duration, 0);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalAppointments: appointmentsList.length,
      totalHours: totalMinutes / 60,
      averagePerDay: appointmentsList.length / totalDays,
      utilizationRate: (totalMinutes / (totalDays * 8 * 60)) * 100, // Assuming 8-hour workdays
    };
  }

  // Module 27: Inventory & Parts Management
  // Stock Alerts
  async getStockAlerts(garageId: string, status?: string) {
    const conditions = [eq(stockAlerts.garageId, garageId)];
    if (status) {
      conditions.push(eq(stockAlerts.alertStatus, status));
    }
    return await db
      .select()
      .from(stockAlerts)
      .where(and(...conditions))
      .orderBy(desc(stockAlerts.createdAt));
  }

  async createStockAlert(data: InsertStockAlert) {
    const [alert] = await db.insert(stockAlerts).values(data).returning();
    return alert;
  }

  async updateStockAlert(id: string, data: Partial<StockAlert>, garageId?: string) {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [alert] = await db
      .update(stockAlerts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(stockAlerts.id, id), garageId ? eq(stockAlerts.garageId, garageId) : undefined))
      .returning();
    return alert;
  }

  async acknowledgeStockAlert(id: string, userId: string) {
    const [alert] = await db
      .update(stockAlerts)
      .set({
        alertStatus: "acknowledged",
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(stockAlerts.id, id))
      .returning();
    return alert;
  }

  // Reorder Settings
  async getReorderSettings(garageId: string, sparePartId?: string) {
    if (sparePartId) {
      return await db
        .select()
        .from(reorderSettings)
        .where(
          and(
            eq(reorderSettings.garageId, garageId),
            eq(reorderSettings.sparePartId, sparePartId)
          )
        );
    }
    return await db
      .select()
      .from(reorderSettings)
      .where(eq(reorderSettings.garageId, garageId))
      .orderBy(reorderSettings.sparePartId);
  }

  async createReorderSetting(data: InsertReorderSetting) {
    const [setting] = await db.insert(reorderSettings).values(data).returning();
    return setting;
  }

  async updateReorderSetting(id: string, data: Partial<ReorderSetting>, garageId?: string) {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [setting] = await db
      .update(reorderSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(reorderSettings.id, id), garageId ? eq(reorderSettings.garageId, garageId) : undefined))
      .returning();
    return setting;
  }

  async processAutoReorders(garageId: string) {
    // Get all enabled reorder settings for garage
    const settings = await db
      .select()
      .from(reorderSettings)
      .where(
        and(
          eq(reorderSettings.garageId, garageId),
          eq(reorderSettings.isAutoReorderEnabled, true)
        )
      );

    const reordersToCreate = [];

    for (const setting of settings) {
      // Check current stock level
      const [inventory] = await db
        .select()
        .from(sparePartInventories)
        .where(
          and(
            eq(sparePartInventories.sparePartId, setting.sparePartId),
            eq(sparePartInventories.garageId, garageId)
          )
        );

      if (inventory && (inventory.stockQuantity ?? 0) <= setting.reorderPoint) {
        // Create purchase order (or add to reorders list)
        reordersToCreate.push({
          sparePartId: setting.sparePartId,
          currentQuantity: inventory.stockQuantity ?? 0,
          reorderQuantity: setting.reorderQuantity,
          supplierId: setting.supplierId,
          reorderSettingId: setting.id,
        });

        // Update last reorder date
        await db
          .update(reorderSettings)
          .set({
            lastReorderDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(reorderSettings.id, setting.id));
      }
    }

    return reordersToCreate;
  }

  // Pricing History
  async getPricingHistory(sparePartId: string) {
    return await db
      .select()
      .from(pricingHistory)
      .where(eq(pricingHistory.sparePartId, sparePartId))
      .orderBy(desc(pricingHistory.effectiveDate));
  }

  async createPricingHistory(data: InsertPricingHistory) {
    const [history] = await db.insert(pricingHistory).values(data).returning();
    return history;
  }

  // Inventory Audit Trail
  async getInventoryAuditTrail(garageId: string, sparePartId?: string, limit: number = 100) {
    const conditions = [eq(inventoryAuditTrail.garageId, garageId)];
    if (sparePartId) {
      conditions.push(eq(inventoryAuditTrail.sparePartId, sparePartId));
    }

    return await db
      .select()
      .from(inventoryAuditTrail)
      .where(and(...conditions))
      .orderBy(desc(inventoryAuditTrail.createdAt))
      .limit(limit);
  }

  async createAuditTrailEntry(data: InsertInventoryAuditTrail) {
    const [entry] = await db.insert(inventoryAuditTrail).values(data).returning();
    return entry;
  }

  // Inventory Transfers
  async getInventoryTransfers(garageId: string, status?: string) {
    const conditions = [
      or(
        eq(inventoryTransfers.fromGarageId, garageId),
        eq(inventoryTransfers.toGarageId, garageId)
      ),
    ];

    if (status) {
      conditions.push(eq(inventoryTransfers.transferStatus, status));
    }

    return await db
      .select()
      .from(inventoryTransfers)
      .where(and(...conditions))
      .orderBy(desc(inventoryTransfers.createdAt));
  }

  async getInventoryTransfer(id: string) {
    const [transfer] = await db
      .select()
      .from(inventoryTransfers)
      .where(eq(inventoryTransfers.id, id));
    return transfer;
  }

  async createInventoryTransfer(data: InsertInventoryTransfer) {
    // Generate transfer number
    const transferCount = await db.select().from(inventoryTransfers);
    const transferNumber = `TRN-${String(transferCount.length + 1).padStart(6, "0")}`;

    const [transfer] = await db
      .insert(inventoryTransfers)
      .values({
        ...data,
        transferNumber,
      })
      .returning();
    return transfer;
  }

  async updateInventoryTransfer(id: string, data: Partial<InventoryTransfer>) {
    const [transfer] = await db
      .update(inventoryTransfers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventoryTransfers.id, id))
      .returning();
    return transfer;
  }

  async approveInventoryTransfer(id: string, userId: string) {
    const [transfer] = await db
      .update(inventoryTransfers)
      .set({
        transferStatus: "in_transit",
        approvedBy: userId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inventoryTransfers.id, id))
      .returning();
    return transfer;
  }

  /**
   * Complete an inventory transfer atomically and exactly once (deep-audit
   * blocker B15). Previously this ran source-decrement, dest-increment and the
   * status update as three separate statements with no transaction, no row
   * locks and no idempotency guard — so a crash left inventory inconsistent and
   * calling /complete twice deducted twice. Now everything runs in one
   * transaction: the transfer row and both inventory rows are locked FOR UPDATE,
   * an already-completed transfer short-circuits, and the audit entries are part
   * of the same atomic unit.
   */
  async completeInventoryTransfer(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const [transfer] = await tx
        .select()
        .from(inventoryTransfers)
        .where(eq(inventoryTransfers.id, id))
        .for("update");
      if (!transfer) throw new Error("Transfer not found");

      // Idempotency: a second /complete (retry, double-click) is a no-op.
      if (transfer.transferStatus === "completed") {
        return transfer;
      }

      // Lock the source and destination inventory rows FOR UPDATE. To avoid
      // deadlocks under concurrent opposite-direction transfers of the same
      // part (A→B while B→A), acquire the two row locks in a deterministic
      // order (sorted by garageId) rather than always source-then-destination.
      const lockInventory = (garageId: string) =>
        tx
          .select()
          .from(sparePartInventories)
          .where(
            and(
              eq(sparePartInventories.sparePartId, transfer.sparePartId),
              eq(sparePartInventories.garageId, garageId)
            )
          )
          .for("update");

      let sourceInventory: any;
      let destInventory: any;
      if (transfer.fromGarageId <= transfer.toGarageId) {
        [sourceInventory] = await lockInventory(transfer.fromGarageId);
        [destInventory] = await lockInventory(transfer.toGarageId);
      } else {
        [destInventory] = await lockInventory(transfer.toGarageId);
        [sourceInventory] = await lockInventory(transfer.fromGarageId);
      }

      // Source sufficiency (audit medium #6): the source must exist and hold
      // enough stock. Throwing aborts the transaction, so stock can never go
      // negative and the transfer stays pending for the caller to retry.
      const sourceStock = sourceInventory?.stockQuantity ?? 0;
      if (!sourceInventory || sourceStock < transfer.quantity) {
        throw new Error(
          `Insufficient source stock for transfer ${transfer.id}: have ${sourceStock}, need ${transfer.quantity}`
        );
      }

      // Source: decrement with an atomic SQL expression.
      await tx
        .update(sparePartInventories)
        .set({
          stockQuantity: sql`${sparePartInventories.stockQuantity} - ${transfer.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(sparePartInventories.id, sourceInventory.id));

      await tx.insert(inventoryAuditTrail).values({
        sparePartId: transfer.sparePartId,
        garageId: transfer.fromGarageId,
        branchId: transfer.fromBranchId,
        actionType: "transfer",
        quantityBefore: sourceStock,
        quantityChange: -transfer.quantity,
        quantityAfter: sourceStock - transfer.quantity,
        referenceType: "transfer",
        referenceId: transfer.id,
        reason: `Transfer to ${transfer.toGarageId}`,
        performedBy: userId,
      } as any);

      // Destination: increment the existing row, or create one so the moved
      // stock is never silently dropped when the destination has no row yet.
      if (destInventory) {
        const currentStock = destInventory.stockQuantity ?? 0;
        await tx
          .update(sparePartInventories)
          .set({
            stockQuantity: sql`${sparePartInventories.stockQuantity} + ${transfer.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(sparePartInventories.id, destInventory.id));

        await tx.insert(inventoryAuditTrail).values({
          sparePartId: transfer.sparePartId,
          garageId: transfer.toGarageId,
          branchId: transfer.toBranchId,
          actionType: "transfer",
          quantityBefore: currentStock,
          quantityChange: transfer.quantity,
          quantityAfter: currentStock + transfer.quantity,
          referenceType: "transfer",
          referenceId: transfer.id,
          reason: `Transfer from ${transfer.fromGarageId}`,
          performedBy: userId,
        } as any);
      } else {
        await tx.insert(sparePartInventories).values({
          sparePartId: transfer.sparePartId,
          garageId: transfer.toGarageId,
          branchId: transfer.toBranchId,
          stockQuantity: transfer.quantity,
        } as any);

        await tx.insert(inventoryAuditTrail).values({
          sparePartId: transfer.sparePartId,
          garageId: transfer.toGarageId,
          branchId: transfer.toBranchId,
          actionType: "transfer",
          quantityBefore: 0,
          quantityChange: transfer.quantity,
          quantityAfter: transfer.quantity,
          referenceType: "transfer",
          referenceId: transfer.id,
          reason: `Transfer from ${transfer.fromGarageId} (new destination stock)`,
          performedBy: userId,
        } as any);
      }

      const [updatedTransfer] = await tx
        .update(inventoryTransfers)
        .set({
          transferStatus: "completed",
          completedBy: userId,
          completedAt: new Date(),
          actualDeliveryDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(inventoryTransfers.id, id))
        .returning();

      return updatedTransfer;
    });
  }

  // TecDoc Integration
  async searchTecDoc(query: string, searchType: string) {
    // Check cache first
    const cached = await this.getTecDocCache(query, searchType);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached.response;
    }

    // Make TecDoc API request (requires TecDoc API credentials)
    // Note: This is a placeholder - actual implementation requires TecDoc API setup
    const tecDocApiUrl = process.env.TECDOC_API_URL || "";
    const tecDocApiKey = process.env.TECDOC_API_KEY || "";

    if (!tecDocApiUrl || !tecDocApiKey) {
      throw new Error("TecDoc API credentials not configured");
    }

    try {
      const response = await fetch(`${tecDocApiUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tecDocApiKey}`,
        },
        body: JSON.stringify({
          query,
          searchType,
        }),
      });

      const data = await response.json();

      // Cache the response
      await this.cacheTecDocResponse(query, searchType, data);

      return data;
    } catch (error) {
      console.error("TecDoc API error:", error);
      throw new Error("Failed to search TecDoc catalog");
    }
  }

  async getTecDocCache(query: string, searchType: string) {
    const [cached] = await db
      .select()
      .from(tecDocCache)
      .where(
        and(
          eq(tecDocCache.searchQuery, query),
          eq(tecDocCache.searchType, searchType)
        )
      );
    return cached;
  }

  async cacheTecDocResponse(query: string, searchType: string, response: any) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

    const [cached] = await db
      .insert(tecDocCache)
      .values({
        searchQuery: query,
        searchType,
        response,
        expiresAt,
      })
      .returning();
    return cached;
  }

  // Module 28: Advanced Financial Features
  // Payment Plans
  async getPaymentPlans(invoiceId?: string): Promise<PaymentPlan[]> {
    if (invoiceId) {
      return await db.select().from(paymentPlans).where(eq(paymentPlans.invoiceId, invoiceId));
    }
    return await db.select().from(paymentPlans).orderBy(desc(paymentPlans.createdAt));
  }

  async getPaymentPlan(id: string, garageId?: string): Promise<PaymentPlan | undefined> {
    const [plan] = await db.select().from(paymentPlans)
      .where(and(eq(paymentPlans.id, id), this.invoiceGarageScope(paymentPlans.invoiceId, garageId)));
    return plan;
  }

  async createPaymentPlan(data: InsertPaymentPlan): Promise<PaymentPlan> {
    const [plan] = await db.insert(paymentPlans).values(data).returning();
    return plan;
  }

  async updatePaymentPlan(id: string, data: Partial<PaymentPlan>, garageId?: string): Promise<PaymentPlan> {
    // Tenant scope (B16 breadth): scope through the parent invoice's garage.
    const [plan] = await db.update(paymentPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(paymentPlans.id, id), this.invoiceGarageScope(paymentPlans.invoiceId, garageId)))
      .returning();
    return plan;
  }

  // Installments
  async getInstallments(paymentPlanId: string): Promise<Installment[]> {
    return await db.select().from(installments)
      .where(eq(installments.paymentPlanId, paymentPlanId))
      .orderBy(installments.installmentNumber);
  }

  async getInstallment(id: string, garageId?: string): Promise<Installment | undefined> {
    const [installment] = await db.select().from(installments)
      .where(and(eq(installments.id, id), this.paymentPlanGarageScope(installments.paymentPlanId, garageId)));
    return installment;
  }

  async createInstallment(data: InsertInstallment): Promise<Installment> {
    const [installment] = await db.insert(installments).values(data).returning();
    return installment;
  }

  async updateInstallment(id: string, data: Partial<Installment>, garageId?: string): Promise<Installment> {
    // Tenant scope (B16 breadth): two hops — installment -> paymentPlan -> invoice.
    const [installment] = await db.update(installments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(installments.id, id), this.paymentPlanGarageScope(installments.paymentPlanId, garageId)))
      .returning();
    return installment;
  }

  // Refunds
  async getRefunds(garageId?: string, status?: string): Promise<Refund[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(refunds.garageId, garageId));
    if (status) conditions.push(eq(refunds.status, status));

    if (conditions.length > 0) {
      return await db.select().from(refunds).where(and(...conditions)).orderBy(desc(refunds.requestedAt));
    }
    return await db.select().from(refunds).orderBy(desc(refunds.requestedAt));
  }

  async getRefund(id: string): Promise<Refund | undefined> {
    const [refund] = await db.select().from(refunds).where(eq(refunds.id, id));
    return refund;
  }

  async createRefund(data: InsertRefund): Promise<Refund> {
    const refundNumber = `RFD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [refund] = await db.insert(refunds).values({ ...data, refundNumber }).returning();
    return refund;
  }

  async updateRefund(id: string, data: Partial<Refund>): Promise<Refund> {
    const [refund] = await db.update(refunds)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(refunds.id, id))
      .returning();
    return refund;
  }

  // Tax Configurations
  async getTaxConfigurations(garageId: string, isActive?: boolean): Promise<TaxConfiguration[]> {
    const conditions = [eq(taxConfigurations.garageId, garageId)];
    if (isActive !== undefined) {
      conditions.push(eq(taxConfigurations.isActive, isActive));
    }
    return await db.select().from(taxConfigurations)
      .where(and(...conditions))
      .orderBy(desc(taxConfigurations.isDefault), desc(taxConfigurations.createdAt));
  }

  async getTaxConfiguration(id: string): Promise<TaxConfiguration | undefined> {
    const [config] = await db.select().from(taxConfigurations).where(eq(taxConfigurations.id, id));
    return config;
  }

  async createTaxConfiguration(data: InsertTaxConfiguration): Promise<TaxConfiguration> {
    const [config] = await db.insert(taxConfigurations).values(data).returning();
    return config;
  }

  async updateTaxConfiguration(id: string, data: Partial<TaxConfiguration>, garageId?: string): Promise<TaxConfiguration> {
    // Tenant scope (B16 breadth): a cross-tenant update matches no row.
    const [config] = await db.update(taxConfigurations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(taxConfigurations.id, id), garageId ? eq(taxConfigurations.garageId, garageId) : undefined))
      .returning();
    return config;
  }

  async deleteTaxConfiguration(id: string, garageId?: string): Promise<void> {
    await db.delete(taxConfigurations)
      .where(and(eq(taxConfigurations.id, id), garageId ? eq(taxConfigurations.garageId, garageId) : undefined));
  }

  // Discounts & Promotions
  async getDiscounts(garageId: string, isActive?: boolean): Promise<DiscountPromotion[]> {
    const conditions = [eq(discountsPromotions.garageId, garageId)];
    if (isActive !== undefined) {
      conditions.push(eq(discountsPromotions.isActive, isActive));
    }
    return await db.select().from(discountsPromotions)
      .where(and(...conditions))
      .orderBy(desc(discountsPromotions.createdAt));
  }

  async getDiscount(id: string): Promise<DiscountPromotion | undefined> {
    const [discount] = await db.select().from(discountsPromotions).where(eq(discountsPromotions.id, id));
    return discount;
  }

  async getDiscountByCode(code: string): Promise<DiscountPromotion | undefined> {
    const [discount] = await db.select().from(discountsPromotions).where(eq(discountsPromotions.code, code));
    return discount;
  }

  async createDiscount(data: InsertDiscountPromotion): Promise<DiscountPromotion> {
    const [discount] = await db.insert(discountsPromotions).values(data).returning();
    return discount;
  }

  async updateDiscount(id: string, data: Partial<DiscountPromotion>): Promise<DiscountPromotion> {
    const [discount] = await db.update(discountsPromotions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(discountsPromotions.id, id))
      .returning();
    return discount;
  }

  async deleteDiscount(id: string): Promise<void> {
    await db.delete(discountsPromotions).where(eq(discountsPromotions.id, id));
  }

  // Discount Usage Tracking
  async getDiscountUsage(discountId: string): Promise<DiscountUsage[]> {
    return await db.select().from(discountUsage)
      .where(eq(discountUsage.discountId, discountId))
      .orderBy(desc(discountUsage.appliedAt));
  }

  async createDiscountUsage(data: InsertDiscountUsage): Promise<DiscountUsage> {
    const [usage] = await db.insert(discountUsage).values(data).returning();
    
    // Increment usage count
    const discount = await this.getDiscount(data.discountId);
    if (discount) {
      await this.updateDiscount(data.discountId, {
        usageCount: (discount.usageCount || 0) + 1,
      });
    }
    
    return usage;
  }

  // Tax Calculation Helper
  async calculateTax(garageId: string, amount: number, category: string): Promise<{ taxAmount: number; taxRate: number; taxName: string }> {
    const configs = await this.getTaxConfigurations(garageId, true);
    
    // Find applicable tax
    const applicableTax = configs.find(config => {
      if (config.applicableCategories && !config.applicableCategories.includes(category)) {
        return false;
      }
      if (config.minAmount && amount < Number(config.minAmount)) {
        return false;
      }
      if (config.maxAmount && amount > Number(config.maxAmount)) {
        return false;
      }
      return true;
    });

    if (!applicableTax) {
      return { taxAmount: 0, taxRate: 0, taxName: '' };
    }

    const taxRate = Number(applicableTax.taxRate);
    const taxAmount = (amount * taxRate) / 100;

    return {
      taxAmount,
      taxRate,
      taxName: applicableTax.taxName,
    };
  }

  // Discount Validation Helper
  async validateDiscount(code: string, garageId: string, customerId: string, amount: number): Promise<{ valid: boolean; discount?: DiscountPromotion; discountAmount?: number; message?: string }> {
    const discount = await this.getDiscountByCode(code);

    if (!discount) {
      return { valid: false, message: 'Invalid discount code' };
    }

    if (discount.garageId !== garageId) {
      return { valid: false, message: 'Discount not available for this garage' };
    }

    if (!discount.isActive) {
      return { valid: false, message: 'Discount is not active' };
    }

    const now = new Date();
    if (now < new Date(discount.startDate) || now > new Date(discount.endDate)) {
      return { valid: false, message: 'Discount has expired or not yet started' };
    }

    if (discount.minPurchaseAmount && amount < Number(discount.minPurchaseAmount)) {
      return { valid: false, message: `Minimum purchase amount is $${discount.minPurchaseAmount}` };
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { valid: false, message: 'Discount usage limit reached' };
    }

    // Check per-customer limit
    if (discount.perCustomerLimit) {
      const usage = await this.getDiscountUsage(discount.id);
      const customerUsage = usage.filter(u => u.customerId === customerId).length;
      if (customerUsage >= discount.perCustomerLimit) {
        return { valid: false, message: 'You have reached the usage limit for this discount' };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (amount * Number(discount.discountValue)) / 100;
    } else if (discount.discountType === 'fixed_amount') {
      discountAmount = Number(discount.discountValue);
    }

    // Apply max discount cap
    if (discount.maxDiscountAmount && discountAmount > Number(discount.maxDiscountAmount)) {
      discountAmount = Number(discount.maxDiscountAmount);
    }

    return { valid: true, discount, discountAmount };
  }

  // ============= Module 29: Search & Filtering =============
  
  // Global Search across multiple modules
  async globalSearch(garageId: string, query: string, modules?: string[]): Promise<any> {
    const searchTerm = `%${query}%`;
    const results: any = { jobCards: [], customers: [], vehicles: [], invoices: [], estimates: [], spareParts: [] };

    // If modules are specified, only search those
    const searchModules = modules || ['jobCards', 'customers', 'vehicles', 'invoices', 'estimates', 'spareParts'];

    if (searchModules.includes('jobCards')) {
      results.jobCards = await db.select().from(jobCards)
        .where(
          and(
            eq(jobCards.garageId, garageId),
            or(
              ilike(jobCards.jobNumber, searchTerm),
              ilike(jobCards.description, searchTerm)
            )
          )
        )
        .limit(10);
    }

    if (searchModules.includes('customers')) {
      results.customers = await db.select().from(users)
        .where(
          and(
            eq(users.garageId, garageId),
            eq(users.userType, 'customer'),
            or(
              ilike(users.fullName, searchTerm),
              ilike(users.email, searchTerm),
              ilike(users.phone, searchTerm)
            )
          )
        )
        .limit(10);
    }

    if (searchModules.includes('vehicles')) {
      results.vehicles = await db.select().from(vehicles)
        .where(
          and(
            eq(vehicles.garageId, garageId),
            or(
              ilike(vehicles.licensePlate, searchTerm),
              ilike(vehicles.vin, searchTerm),
              ilike(vehicles.make, searchTerm),
              ilike(vehicles.model, searchTerm)
            )
          )
        )
        .limit(10);
    }

    if (searchModules.includes('invoices')) {
      results.invoices = await db.select().from(invoices)
        .where(
          and(
            eq(invoices.garageId, garageId),
            or(
              ilike(invoices.invoiceNumber, searchTerm),
              ilike(invoices.notes, searchTerm)
            )
          )
        )
        .limit(10);
    }

    if (searchModules.includes('estimates')) {
      results.estimates = await db.select().from(estimates)
        .where(
          and(
            eq(estimates.garageId, garageId),
            or(
              ilike(estimates.estimateNumber, searchTerm),
              ilike(estimates.notes, searchTerm)
            )
          )
        )
        .limit(10);
    }

    if (searchModules.includes('spareParts')) {
      results.spareParts = await db.select().from(spareParts)
        .where(
          or(
            ilike(spareParts.sku, searchTerm),
            ilike(spareParts.name, searchTerm),
            ilike(spareParts.description, searchTerm)
          )
        )
        .limit(10);
    }

    return results;
  }

  // Saved Filter Presets
  async getSavedFilterPresets(garageId: string, userId?: string, module?: string): Promise<SavedFilterPreset[]> {
    const conditions = [eq(savedFilterPresets.garageId, garageId)];
    
    if (userId) {
      conditions.push(or(
        eq(savedFilterPresets.userId, userId),
        eq(savedFilterPresets.isGlobal, true)
      ) as any);
    }
    
    if (module) {
      conditions.push(eq(savedFilterPresets.module, module));
    }

    return await db.select().from(savedFilterPresets)
      .where(and(...conditions))
      .orderBy(desc(savedFilterPresets.createdAt));
  }

  async getSavedFilterPreset(id: string): Promise<SavedFilterPreset | undefined> {
    const [preset] = await db.select().from(savedFilterPresets)
      .where(eq(savedFilterPresets.id, id));
    return preset;
  }

  async createSavedFilterPreset(data: InsertSavedFilterPreset): Promise<SavedFilterPreset> {
    const [preset] = await db.insert(savedFilterPresets).values(data).returning();
    return preset;
  }

  async updateSavedFilterPreset(id: string, data: Partial<SavedFilterPreset>): Promise<SavedFilterPreset> {
    const [preset] = await db.update(savedFilterPresets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(savedFilterPresets.id, id))
      .returning();
    return preset;
  }

  async deleteSavedFilterPreset(id: string): Promise<void> {
    await db.delete(savedFilterPresets).where(eq(savedFilterPresets.id, id));
  }

  // Export Jobs
  async getExportJobs(garageId: string, userId?: string): Promise<ExportJob[]> {
    const conditions = [eq(exportJobs.garageId, garageId)];
    if (userId) {
      conditions.push(eq(exportJobs.userId, userId));
    }

    return await db.select().from(exportJobs)
      .where(and(...conditions))
      .orderBy(desc(exportJobs.createdAt));
  }

  async getExportJob(id: string): Promise<ExportJob | undefined> {
    const [job] = await db.select().from(exportJobs)
      .where(eq(exportJobs.id, id));
    return job;
  }

  async createExportJob(data: InsertExportJob): Promise<ExportJob> {
    const [job] = await db.insert(exportJobs).values(data).returning();
    return job;
  }

  async updateExportJob(id: string, data: Partial<ExportJob>): Promise<ExportJob> {
    const [job] = await db.update(exportJobs)
      .set(data)
      .where(eq(exportJobs.id, id))
      .returning();
    return job;
  }

  // Bulk Operations
  async bulkDelete(module: string, ids: string[]): Promise<{ deleted: number }> {
    let count = 0;

    switch (module) {
      case 'jobCards':
        const deleteJobCards = await db.delete(jobCards).where(inArray(jobCards.id, ids));
        count = deleteJobCards.rowCount || 0;
        break;
      case 'customers':
        const deleteCustomers = await db.delete(users).where(inArray(users.id, ids));
        count = deleteCustomers.rowCount || 0;
        break;
      case 'vehicles':
        const deleteVehicles = await db.delete(vehicles).where(inArray(vehicles.id, ids));
        count = deleteVehicles.rowCount || 0;
        break;
      case 'invoices':
        const deleteInvoices = await db.delete(invoices).where(inArray(invoices.id, ids));
        count = deleteInvoices.rowCount || 0;
        break;
      case 'estimates':
        const deleteEstimates = await db.delete(estimates).where(inArray(estimates.id, ids));
        count = deleteEstimates.rowCount || 0;
        break;
      case 'spareParts':
        const deleteSpareParts = await db.delete(spareParts).where(inArray(spareParts.id, ids));
        count = deleteSpareParts.rowCount || 0;
        break;
      default:
        throw new Error(`Bulk delete not supported for module: ${module}`);
    }

    return { deleted: count };
  }

  async bulkUpdate(module: string, ids: string[], data: any): Promise<{ updated: number }> {
    let count = 0;

    switch (module) {
      case 'jobCards':
        const updateJobCards = await db.update(jobCards)
          .set(data)
          .where(inArray(jobCards.id, ids));
        count = updateJobCards.rowCount || 0;
        break;
      case 'customers':
        const updateCustomers = await db.update(users)
          .set(data)
          .where(inArray(users.id, ids));
        count = updateCustomers.rowCount || 0;
        break;
      case 'vehicles':
        const updateVehicles = await db.update(vehicles)
          .set(data)
          .where(inArray(vehicles.id, ids));
        count = updateVehicles.rowCount || 0;
        break;
      case 'invoices':
        const updateInvoices = await db.update(invoices)
          .set(data)
          .where(inArray(invoices.id, ids));
        count = updateInvoices.rowCount || 0;
        break;
      case 'estimates':
        const updateEstimates = await db.update(estimates)
          .set(data)
          .where(inArray(estimates.id, ids));
        count = updateEstimates.rowCount || 0;
        break;
      case 'spareParts':
        const updateSpareParts = await db.update(spareParts)
          .set(data)
          .where(inArray(spareParts.id, ids));
        count = updateSpareParts.rowCount || 0;
        break;
      default:
        throw new Error(`Bulk update not supported for module: ${module}`);
    }

    return { updated: count };
  }
  
  // Module 30: Business Intelligence & Analytics
  async getMostProfitableServices(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    services: {
      serviceType: string;
      revenue: number;
      cost: number;
      profit: number;
      profitMargin: number;
      count: number;
    }[];
  }> {
    const whereConditions = [eq(jobCards.garageId, garageId)];
    
    if (startDate && endDate) {
      whereConditions.push(sql`${jobCards.createdAt} >= ${startDate}`);
      whereConditions.push(sql`${jobCards.createdAt} <= ${endDate}`);
    }

    const results = await db.select({
      serviceType: jobCards.serviceType,
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
      cost: sql<number>`COALESCE(SUM(CAST(${invoiceItems.unitCost} AS DECIMAL) * ${invoiceItems.quantity}), 0)`,
      count: sql<number>`COUNT(DISTINCT ${jobCards.id})`,
    })
    .from(jobCards)
    .leftJoin(invoices, eq(jobCards.id, invoices.jobCardId))
    .leftJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
    .where(and(...whereConditions))
    .groupBy(jobCards.serviceType);

    const services = results.map(r => ({
      serviceType: r.serviceType,
      revenue: Number(r.revenue) || 0,
      cost: Number(r.cost) || 0,
      profit: Number(r.revenue) - Number(r.cost) || 0,
      profitMargin: Number(r.revenue) > 0 ? ((Number(r.revenue) - Number(r.cost)) / Number(r.revenue)) * 100 : 0,
      count: Number(r.count) || 0,
    }));

    return { services };
  }

  async getPeakHoursAnalysis(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    hourlyDistribution: { hour: number; count: number; revenue: number }[];
    dailyDistribution: { day: string; count: number; revenue: number }[];
    peakHour: number;
    peakDay: string;
  }> {
    const appointmentConditions = [eq(appointments.garageId, garageId)];
    
    if (startDate && endDate) {
      appointmentConditions.push(sql`${appointments.appointmentDate} >= ${startDate}`);
      appointmentConditions.push(sql`${appointments.appointmentDate} <= ${endDate}`);
    }

    // Two independent queries: selecting both hour and day from one shared
    // builder made each grouped query select an ungrouped column (Postgres
    // 42803), so this method failed on every call.
    const hourlyData = await db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${appointments.appointmentDate})`,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
    })
    .from(appointments)
    .leftJoin(invoices, eq(appointments.customerId, invoices.customerId))
    .where(and(...appointmentConditions))
    .groupBy(sql`EXTRACT(HOUR FROM ${appointments.appointmentDate})`);

    const dailyData = await db.select({
      day: sql<string>`TO_CHAR(${appointments.appointmentDate}, 'Day')`,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
    })
    .from(appointments)
    .leftJoin(invoices, eq(appointments.customerId, invoices.customerId))
    .where(and(...appointmentConditions))
    .groupBy(sql`TO_CHAR(${appointments.appointmentDate}, 'Day')`);

    const hourlyDistribution = hourlyData.map(h => ({
      hour: Number(h.hour) || 0,
      count: Number(h.count) || 0,
      revenue: Number(h.revenue) || 0,
    }));

    const dailyDistribution = dailyData.map(d => ({
      day: d.day?.trim() || '',
      count: Number(d.count) || 0,
      revenue: Number(d.revenue) || 0,
    }));

    const peakHour = hourlyDistribution.reduce((max, h) => h.count > max.count ? h : max, hourlyDistribution[0] || { hour: 0, count: 0, revenue: 0 }).hour;
    const peakDay = dailyDistribution.reduce((max, d) => d.count > max.count ? d : max, dailyDistribution[0] || { day: '', count: 0, revenue: 0 }).day;

    return {
      hourlyDistribution,
      dailyDistribution,
      peakHour,
      peakDay,
    };
  }

  async getTechnicianUtilizationRates(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    technicians: {
      id: string;
      name: string;
      totalHoursAvailable: number;
      totalHoursWorked: number;
      utilizationRate: number;
      jobsCompleted: number;
      revenueGenerated: number;
    }[];
  }> {
    const technicians = await db.select().from(users).where(
      and(
        eq(users.garageId, garageId),
        eq(users.userType, 'technician')
      )
    );

    const results = await Promise.all(technicians.map(async (tech) => {
      const jobConditions = [
        eq(jobCards.assignedTo, tech.id),
        eq(jobCards.status, 'completed')
      ];

      if (startDate && endDate) {
        jobConditions.push(sql`${jobCards.completedAt} >= ${startDate}`);
        jobConditions.push(sql`${jobCards.completedAt} <= ${endDate}`);
      }

      const [jobData] = await db.select({
        jobsCompleted: sql<number>`COUNT(*)`,
        totalHours: sql<number>`COALESCE(SUM(CAST(${jobCards.actualHours} AS DECIMAL)), 0)`,
        revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(jobCards)
      .leftJoin(invoices, eq(jobCards.id, invoices.jobCardId))
      .where(and(...jobConditions));

      // Assuming 8-hour workdays and 5 days per week
      const daysInPeriod = startDate && endDate 
        ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      const totalHoursAvailable = (daysInPeriod / 7) * 40; // 40 hours per week

      const totalHoursWorked = Number(jobData?.totalHours) || 0;
      const utilizationRate = totalHoursAvailable > 0 ? (totalHoursWorked / totalHoursAvailable) * 100 : 0;

      return {
        id: tech.id,
        name: tech.fullName || 'Unknown',
        totalHoursAvailable,
        totalHoursWorked,
        utilizationRate,
        jobsCompleted: Number(jobData?.jobsCompleted) || 0,
        revenueGenerated: Number(jobData?.revenue) || 0,
      };
    }));

    return { technicians: results };
  }

  async getCustomerAcquisitionCost(garageId: string, startDate?: Date, endDate?: Date): Promise<{
    totalMarketingCost: number;
    newCustomers: number;
    acquisitionCost: number;
    customersBySource: { source: string; count: number; cost: number }[];
  }> {
    // For now, we'll estimate marketing costs based on revenue
    // In a real implementation, you'd have a marketing_costs table
    const customerConditions = [
      eq(users.garageId, garageId),
      eq(users.userType, 'customer')
    ];

    if (startDate && endDate) {
      customerConditions.push(sql`${users.createdAt} >= ${startDate}`);
      customerConditions.push(sql`${users.createdAt} <= ${endDate}`);
    }

    const [data] = await db.select({
      count: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
    })
    .from(users)
    .leftJoin(invoices, eq(users.id, invoices.customerId))
    .where(and(...customerConditions));
    
    // Estimate marketing cost as 10% of revenue (this should be configurable)
    const totalMarketingCost = (Number(data?.totalRevenue) || 0) * 0.1;
    const newCustomers = Number(data?.count) || 0;
    const acquisitionCost = newCustomers > 0 ? totalMarketingCost / newCustomers : 0;

    // Mock data for customer sources - in real implementation, track this
    const customersBySource = [
      { source: 'Organic Search', count: Math.floor(newCustomers * 0.4), cost: acquisitionCost * 0.3 },
      { source: 'Social Media', count: Math.floor(newCustomers * 0.3), cost: acquisitionCost * 0.4 },
      { source: 'Referrals', count: Math.floor(newCustomers * 0.2), cost: acquisitionCost * 0.1 },
      { source: 'Paid Ads', count: Math.floor(newCustomers * 0.1), cost: acquisitionCost * 0.2 },
    ];

    return {
      totalMarketingCost,
      newCustomers,
      acquisitionCost,
      customersBySource,
    };
  }

  // Module 31: Staff & HR Management
  
  // Employee Attendance
  async getEmployeeAttendance(garageId: string, employeeId?: string, startDate?: Date, endDate?: Date): Promise<EmployeeAttendance[]> {
    const conditions = [eq(employeeAttendance.garageId, garageId)];
    
    if (employeeId) {
      conditions.push(eq(employeeAttendance.employeeId, employeeId));
    }
    if (startDate) {
      conditions.push(gte(employeeAttendance.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(employeeAttendance.date, endDate));
    }
    
    return await db.select().from(employeeAttendance)
      .where(and(...conditions))
      .orderBy(desc(employeeAttendance.date));
  }

  async getAttendance(id: string): Promise<EmployeeAttendance | undefined> {
    const [record] = await db.select().from(employeeAttendance).where(eq(employeeAttendance.id, id));
    return record;
  }

  async createAttendance(data: InsertEmployeeAttendance): Promise<EmployeeAttendance> {
    const [record] = await db.insert(employeeAttendance).values(data).returning();
    return record;
  }

  async updateAttendance(id: string, data: Partial<EmployeeAttendance>): Promise<EmployeeAttendance> {
    const [record] = await db.update(employeeAttendance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employeeAttendance.id, id))
      .returning();
    return record;
  }

  async clockIn(employeeId: string, garageId: string): Promise<EmployeeAttendance> {
    const now = new Date();
    const [record] = await db.insert(employeeAttendance).values({
      garageId,
      employeeId,
      date: now,
      clockIn: now,
      status: 'present'
    }).returning();
    return record;
  }

  async clockOut(attendanceId: string): Promise<EmployeeAttendance> {
    const now = new Date();
    const [record] = await db.select().from(employeeAttendance).where(eq(employeeAttendance.id, attendanceId));
    
    if (!record) throw new Error('Attendance record not found');
    
    const clockInTime = new Date(record.clockIn);
    const totalMinutes = (now.getTime() - clockInTime.getTime()) / (1000 * 60);
    const breakMinutes = record.breakStart && record.breakEnd 
      ? (new Date(record.breakEnd).getTime() - new Date(record.breakStart).getTime()) / (1000 * 60)
      : 0;
    const totalHours = ((totalMinutes - breakMinutes) / 60).toFixed(2);
    
    const [updated] = await db.update(employeeAttendance)
      .set({ 
        clockOut: now, 
        totalHours,
        updatedAt: new Date() 
      })
      .where(eq(employeeAttendance.id, attendanceId))
      .returning();
    return updated;
  }

  async startBreak(attendanceId: string): Promise<EmployeeAttendance> {
    const [updated] = await db.update(employeeAttendance)
      .set({ breakStart: new Date(), updatedAt: new Date() })
      .where(eq(employeeAttendance.id, attendanceId))
      .returning();
    return updated;
  }

  async endBreak(attendanceId: string): Promise<EmployeeAttendance> {
    const [updated] = await db.update(employeeAttendance)
      .set({ breakEnd: new Date(), updatedAt: new Date() })
      .where(eq(employeeAttendance.id, attendanceId))
      .returning();
    return updated;
  }

  // Shift Management
  async getShiftTemplates(garageId: string): Promise<ShiftTemplate[]> {
    return await db.select().from(shiftTemplates)
      .where(eq(shiftTemplates.garageId, garageId))
      .orderBy(shiftTemplates.name);
  }

  async getShiftTemplate(id: string): Promise<ShiftTemplate | undefined> {
    const [template] = await db.select().from(shiftTemplates).where(eq(shiftTemplates.id, id));
    return template;
  }

  async createShiftTemplate(data: InsertShiftTemplate): Promise<ShiftTemplate> {
    const [template] = await db.insert(shiftTemplates).values(data).returning();
    return template;
  }

  async updateShiftTemplate(id: string, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> {
    const [template] = await db.update(shiftTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shiftTemplates.id, id))
      .returning();
    return template;
  }

  async deleteShiftTemplate(id: string): Promise<void> {
    await db.delete(shiftTemplates).where(eq(shiftTemplates.id, id));
  }

  async getShiftAssignments(garageId: string, employeeId?: string, startDate?: Date, endDate?: Date): Promise<ShiftAssignment[]> {
    const conditions = [eq(shiftAssignments.garageId, garageId)];
    
    if (employeeId) {
      conditions.push(eq(shiftAssignments.employeeId, employeeId));
    }
    if (startDate) {
      conditions.push(gte(shiftAssignments.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(shiftAssignments.date, endDate));
    }
    
    return await db.select().from(shiftAssignments)
      .where(and(...conditions))
      .orderBy(desc(shiftAssignments.date));
  }

  async getShiftAssignment(id: string): Promise<ShiftAssignment | undefined> {
    const [assignment] = await db.select().from(shiftAssignments).where(eq(shiftAssignments.id, id));
    return assignment;
  }

  async createShiftAssignment(data: InsertShiftAssignment): Promise<ShiftAssignment> {
    const [assignment] = await db.insert(shiftAssignments).values(data).returning();
    return assignment;
  }

  async updateShiftAssignment(id: string, data: Partial<ShiftAssignment>): Promise<ShiftAssignment> {
    const [assignment] = await db.update(shiftAssignments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shiftAssignments.id, id))
      .returning();
    return assignment;
  }

  async deleteShiftAssignment(id: string): Promise<void> {
    await db.delete(shiftAssignments).where(eq(shiftAssignments.id, id));
  }

  // Commission Management
  async getCommissionRules(garageId: string): Promise<CommissionRule[]> {
    return await db.select().from(commissionRules)
      .where(eq(commissionRules.garageId, garageId))
      .orderBy(commissionRules.name);
  }

  async getCommissionRule(id: string): Promise<CommissionRule | undefined> {
    const [rule] = await db.select().from(commissionRules).where(eq(commissionRules.id, id));
    return rule;
  }

  async createCommissionRule(data: InsertCommissionRule): Promise<CommissionRule> {
    const [rule] = await db.insert(commissionRules).values(data).returning();
    return rule;
  }

  async updateCommissionRule(id: string, data: Partial<CommissionRule>): Promise<CommissionRule> {
    const [rule] = await db.update(commissionRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(commissionRules.id, id))
      .returning();
    return rule;
  }

  async deleteCommissionRule(id: string): Promise<void> {
    await db.delete(commissionRules).where(eq(commissionRules.id, id));
  }

  async getCommissions(garageId: string, technicianId?: string, period?: string, status?: string): Promise<Commission[]> {
    const conditions = [eq(commissions.garageId, garageId)];
    
    if (technicianId) {
      conditions.push(eq(commissions.technicianId, technicianId));
    }
    if (period) {
      conditions.push(eq(commissions.period, period));
    }
    if (status) {
      conditions.push(eq(commissions.status, status));
    }
    
    return await db.select().from(commissions)
      .where(and(...conditions))
      .orderBy(desc(commissions.createdAt));
  }

  async getCommission(id: string): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission;
  }

  async createCommission(data: InsertCommission): Promise<Commission> {
    const [commission] = await db.insert(commissions).values(data).returning();
    return commission;
  }

  async updateCommission(id: string, data: Partial<Commission>): Promise<Commission> {
    const [commission] = await db.update(commissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(commissions.id, id))
      .returning();
    return commission;
  }

  async calculateCommission(jobCardId: string, garageId: string): Promise<Commission | null> {
    const [jobCard] = await db.select().from(jobCards).where(eq(jobCards.id, jobCardId));
    if (!jobCard || !jobCard.assignedTo) return null;
    
    const [invoice] = await db.select().from(invoices).where(eq(invoices.jobCardId, jobCardId));
    if (!invoice) return null;
    
    const rules = await db.select().from(commissionRules)
      .where(and(
        eq(commissionRules.garageId, garageId),
        eq(commissionRules.isActive, true)
      ));
    
    let applicableRule = rules[0];
    if (!applicableRule) return null;
    
    const baseAmount = parseFloat(invoice.totalAmount);
    let commissionAmount = 0;
    let commissionRate = 0;
    
    if (applicableRule.ruleType === 'percentage') {
      commissionRate = parseFloat(applicableRule.basePercentage || '0');
      commissionAmount = (baseAmount * commissionRate) / 100;
    } else if (applicableRule.ruleType === 'fixed_per_job') {
      commissionAmount = parseFloat(applicableRule.fixedAmount || '0');
    }
    
    const period = new Date().toISOString().slice(0, 7);
    
    const [commission] = await db.insert(commissions).values({
      garageId,
      technicianId: jobCard.assignedTo,
      jobCardId,
      invoiceId: invoice.id,
      commissionRuleId: applicableRule.id,
      baseAmount: baseAmount.toFixed(2),
      commissionAmount: commissionAmount.toFixed(2),
      commissionRate: commissionRate.toFixed(2),
      period,
      status: 'pending'
    }).returning();
    
    return commission;
  }

  // Performance Reviews
  async getPerformanceReviews(garageId: string, employeeId?: string): Promise<PerformanceReview[]> {
    const conditions = [eq(performanceReviews.garageId, garageId)];
    
    if (employeeId) {
      conditions.push(eq(performanceReviews.employeeId, employeeId));
    }
    
    return await db.select().from(performanceReviews)
      .where(and(...conditions))
      .orderBy(desc(performanceReviews.createdAt));
  }

  async getPerformanceReview(id: string): Promise<PerformanceReview | undefined> {
    const [review] = await db.select().from(performanceReviews).where(eq(performanceReviews.id, id));
    return review;
  }

  async createPerformanceReview(data: InsertPerformanceReview): Promise<PerformanceReview> {
    const [review] = await db.insert(performanceReviews).values(data).returning();
    return review;
  }

  async updatePerformanceReview(id: string, data: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const [review] = await db.update(performanceReviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(performanceReviews.id, id))
      .returning();
    return review;
  }

  async deletePerformanceReview(id: string): Promise<void> {
    await db.delete(performanceReviews).where(eq(performanceReviews.id, id));
  }

  // Training & Certifications
  async getTrainings(garageId: string): Promise<Training[]> {
    return await db.select().from(trainings)
      .where(eq(trainings.garageId, garageId))
      .orderBy(trainings.name);
  }

  async getTraining(id: string): Promise<Training | undefined> {
    const [training] = await db.select().from(trainings).where(eq(trainings.id, id));
    return training;
  }

  async createTraining(data: InsertTraining): Promise<Training> {
    const [training] = await db.insert(trainings).values(data).returning();
    return training;
  }

  async updateTraining(id: string, data: Partial<Training>): Promise<Training> {
    const [training] = await db.update(trainings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(trainings.id, id))
      .returning();
    return training;
  }

  async deleteTraining(id: string): Promise<void> {
    await db.delete(trainings).where(eq(trainings.id, id));
  }

  async getEmployeeTrainings(garageId: string, employeeId?: string, status?: string): Promise<EmployeeTraining[]> {
    const conditions = [eq(employeeTrainings.garageId, garageId)];
    
    if (employeeId) {
      conditions.push(eq(employeeTrainings.employeeId, employeeId));
    }
    if (status) {
      conditions.push(eq(employeeTrainings.status, status));
    }
    
    return await db.select().from(employeeTrainings)
      .where(and(...conditions))
      .orderBy(desc(employeeTrainings.enrolledDate));
  }

  async getEmployeeTraining(id: string): Promise<EmployeeTraining | undefined> {
    const [record] = await db.select().from(employeeTrainings).where(eq(employeeTrainings.id, id));
    return record;
  }

  async createEmployeeTraining(data: InsertEmployeeTraining): Promise<EmployeeTraining> {
    const [record] = await db.insert(employeeTrainings).values(data).returning();
    return record;
  }

  async updateEmployeeTraining(id: string, data: Partial<EmployeeTraining>): Promise<EmployeeTraining> {
    const [record] = await db.update(employeeTrainings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employeeTrainings.id, id))
      .returning();
    return record;
  }

  async deleteEmployeeTraining(id: string): Promise<void> {
    await db.delete(employeeTrainings).where(eq(employeeTrainings.id, id));
  }

  // Module 32: AI Automation & Insights
  async getAIJobEstimations(garageId: string, vehicleId?: string): Promise<any[]> {
    const conditions = [eq(aiJobEstimations.garageId, garageId)];
    if (vehicleId) {
      conditions.push(eq(aiJobEstimations.vehicleId, vehicleId));
    }
    return await db.select().from(aiJobEstimations)
      .where(and(...conditions))
      .orderBy(desc(aiJobEstimations.createdAt));
  }

  async getAIJobEstimation(id: string): Promise<any | undefined> {
    const [estimation] = await db.select().from(aiJobEstimations).where(eq(aiJobEstimations.id, id));
    return estimation;
  }

  async createAIJobEstimation(data: any): Promise<any> {
    const [estimation] = await db.insert(aiJobEstimations).values(data).returning();
    return estimation;
  }

  async updateAIJobEstimation(id: string, data: any): Promise<any> {
    const [estimation] = await db.update(aiJobEstimations)
      .set(data)
      .where(eq(aiJobEstimations.id, id))
      .returning();
    return estimation;
  }

  async getAIMaintenancePredictions(garageId: string, vehicleId?: string, status?: string): Promise<any[]> {
    const conditions = [eq(aiMaintenancePredictions.garageId, garageId)];
    if (vehicleId) {
      conditions.push(eq(aiMaintenancePredictions.vehicleId, vehicleId));
    }
    if (status) {
      conditions.push(eq(aiMaintenancePredictions.status, status));
    }
    return await db.select().from(aiMaintenancePredictions)
      .where(and(...conditions))
      .orderBy(desc(aiMaintenancePredictions.createdAt));
  }

  async getAIMaintenancePrediction(id: string): Promise<any | undefined> {
    const [prediction] = await db.select().from(aiMaintenancePredictions).where(eq(aiMaintenancePredictions.id, id));
    return prediction;
  }

  async createAIMaintenancePrediction(data: any): Promise<any> {
    const [prediction] = await db.insert(aiMaintenancePredictions).values(data).returning();
    return prediction;
  }

  async updateAIMaintenancePrediction(id: string, data: any): Promise<any> {
    const [prediction] = await db.update(aiMaintenancePredictions)
      .set(data)
      .where(eq(aiMaintenancePredictions.id, id))
      .returning();
    return prediction;
  }

  async acknowledgeMaintenancePrediction(id: string, userId: string): Promise<any> {
    const [prediction] = await db.update(aiMaintenancePredictions)
      .set({ 
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        status: 'acknowledged'
      })
      .where(eq(aiMaintenancePredictions.id, id))
      .returning();
    return prediction;
  }

  async getAIPartsRecommendations(garageId: string, vehicleId?: string, status?: string): Promise<any[]> {
    const conditions = [eq(aiPartsRecommendations.garageId, garageId)];
    if (vehicleId) {
      conditions.push(eq(aiPartsRecommendations.vehicleId, vehicleId));
    }
    if (status) {
      conditions.push(eq(aiPartsRecommendations.status, status));
    }
    return await db.select().from(aiPartsRecommendations)
      .where(and(...conditions))
      .orderBy(desc(aiPartsRecommendations.createdAt));
  }

  async getAIPartsRecommendation(id: string): Promise<any | undefined> {
    const [recommendation] = await db.select().from(aiPartsRecommendations).where(eq(aiPartsRecommendations.id, id));
    return recommendation;
  }

  async createAIPartsRecommendation(data: any): Promise<any> {
    const [recommendation] = await db.insert(aiPartsRecommendations).values(data).returning();
    return recommendation;
  }

  async updateAIPartsRecommendation(id: string, data: any): Promise<any> {
    const [recommendation] = await db.update(aiPartsRecommendations)
      .set(data)
      .where(eq(aiPartsRecommendations.id, id))
      .returning();
    return recommendation;
  }

  async getAIScheduleOptimizations(garageId: string, status?: string): Promise<any[]> {
    const conditions = [eq(aiScheduleOptimizations.garageId, garageId)];
    if (status) {
      conditions.push(eq(aiScheduleOptimizations.status, status));
    }
    return await db.select().from(aiScheduleOptimizations)
      .where(and(...conditions))
      .orderBy(desc(aiScheduleOptimizations.createdAt));
  }

  async getAIScheduleOptimization(id: string): Promise<any | undefined> {
    const [optimization] = await db.select().from(aiScheduleOptimizations).where(eq(aiScheduleOptimizations.id, id));
    return optimization;
  }

  async createAIScheduleOptimization(data: any): Promise<any> {
    const [optimization] = await db.insert(aiScheduleOptimizations).values(data).returning();
    return optimization;
  }

  async updateAIScheduleOptimization(id: string, data: any): Promise<any> {
    const [optimization] = await db.update(aiScheduleOptimizations)
      .set(data)
      .where(eq(aiScheduleOptimizations.id, id))
      .returning();
    return optimization;
  }

  async getAIChatConversations(garageId: string, customerId?: string, status?: string): Promise<any[]> {
    const conditions = [eq(aiChatConversations.garageId, garageId)];
    if (customerId) {
      conditions.push(eq(aiChatConversations.customerId, customerId));
    }
    if (status) {
      conditions.push(eq(aiChatConversations.status, status));
    }
    return await db.select().from(aiChatConversations)
      .where(and(...conditions))
      .orderBy(desc(aiChatConversations.createdAt));
  }

  async getAIChatConversation(id: string): Promise<any | undefined> {
    const [conversation] = await db.select().from(aiChatConversations).where(eq(aiChatConversations.id, id));
    return conversation;
  }

  async createAIChatConversation(data: any): Promise<any> {
    const [conversation] = await db.insert(aiChatConversations).values(data).returning();
    return conversation;
  }

  async updateAIChatConversation(id: string, data: any): Promise<any> {
    const [conversation] = await db.update(aiChatConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiChatConversations.id, id))
      .returning();
    return conversation;
  }

  // Phase 1: AI & Automation - Voice Commands & OCR
  async getVoiceCommands(userId: string, limit: number = 50): Promise<any[]> {
    return await db.select().from(voiceCommands)
      .where(eq(voiceCommands.userId, userId))
      .orderBy(desc(voiceCommands.createdAt))
      .limit(limit);
  }

  async createVoiceCommand(data: any): Promise<any> {
    const [command] = await db.insert(voiceCommands).values(data).returning();
    return command;
  }

  async getOCRDocuments(garageId: string, status?: string): Promise<any[]> {
    // ocr_documents has no garage_id column — scope through the uploader's
    // garage. Without this every tenant saw every garage's scanned documents.
    const conditions = [
      sql`EXISTS (SELECT 1 FROM ${users} WHERE ${users.id} = ${ocrDocuments.uploadedBy} AND ${users.garageId} = ${garageId})`,
    ];
    if (status) {
      conditions.push(eq(ocrDocuments.status, status));
    }

    return await db
      .select()
      .from(ocrDocuments)
      .where(and(...conditions))
      .orderBy(desc(ocrDocuments.createdAt));
  }

  async getOCRDocument(id: string): Promise<any | undefined> {
    const [document] = await db.select().from(ocrDocuments).where(eq(ocrDocuments.id, id));
    return document;
  }

  async createOCRDocument(data: any): Promise<any> {
    const [document] = await db.insert(ocrDocuments).values(data).returning();
    return document;
  }

  async updateOCRDocument(id: string, data: any): Promise<any> {
    const [document] = await db.update(ocrDocuments)
      .set({ ...data })
      .where(eq(ocrDocuments.id, id))
      .returning();
    return document;
  }

  // Module 33: Third-Party Integrations
  async getIntegrationConnections(garageId: string): Promise<IntegrationConnection[]> {
    return await db.select().from(integrationConnections)
      .where(eq(integrationConnections.garageId, garageId))
      .orderBy(desc(integrationConnections.createdAt));
  }

  async getIntegrationConnection(id: string): Promise<IntegrationConnection | undefined> {
    const [connection] = await db.select().from(integrationConnections)
      .where(eq(integrationConnections.id, id));
    return connection;
  }

  async createIntegrationConnection(data: InsertIntegrationConnection): Promise<IntegrationConnection> {
    const [connection] = await db.insert(integrationConnections).values(data).returning();
    return connection;
  }

  async updateIntegrationConnection(id: string, data: Partial<IntegrationConnection>): Promise<IntegrationConnection> {
    const [connection] = await db.update(integrationConnections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrationConnections.id, id))
      .returning();
    return connection;
  }

  async deleteIntegrationConnection(id: string): Promise<void> {
    await db.delete(integrationConnections).where(eq(integrationConnections.id, id));
  }

  async getIntegrationSyncLogs(garageId: string, connectionId?: string): Promise<IntegrationSyncLog[]> {
    const conditions = [eq(integrationSyncLogs.garageId, garageId)];
    if (connectionId) {
      conditions.push(eq(integrationSyncLogs.connectionId, connectionId));
    }
    return await db.select().from(integrationSyncLogs)
      .where(and(...conditions))
      .orderBy(desc(integrationSyncLogs.createdAt))
      .limit(100);
  }

  async createIntegrationSyncLog(data: InsertIntegrationSyncLog): Promise<IntegrationSyncLog> {
    const [log] = await db.insert(integrationSyncLogs).values(data).returning();
    return log;
  }

  async getAccountingTransactions(garageId: string, syncStatus?: string): Promise<AccountingTransaction[]> {
    const conditions = [eq(accountingTransactions.garageId, garageId)];
    if (syncStatus) {
      conditions.push(eq(accountingTransactions.syncStatus, syncStatus));
    }
    return await db.select().from(accountingTransactions)
      .where(and(...conditions))
      .orderBy(desc(accountingTransactions.createdAt));
  }

  async createAccountingTransaction(data: InsertAccountingTransaction): Promise<AccountingTransaction> {
    const [transaction] = await db.insert(accountingTransactions).values(data).returning();
    return transaction;
  }

  async getOBDDiagnostics(garageId: string, vehicleId?: string): Promise<OBDDiagnosticData[]> {
    const conditions = [eq(obdDiagnosticData.garageId, garageId)];
    if (vehicleId) {
      conditions.push(eq(obdDiagnosticData.vehicleId, vehicleId));
    }
    return await db.select().from(obdDiagnosticData)
      .where(and(...conditions))
      .orderBy(desc(obdDiagnosticData.createdAt));
  }

  async createOBDDiagnostic(data: InsertOBDDiagnosticData): Promise<OBDDiagnosticData> {
    const [diagnostic] = await db.insert(obdDiagnosticData).values(data).returning();
    return diagnostic;
  }

  // Module 34: Security & Compliance
  async getAuditLogs(garageId: string, filters?: {
    userId?: string;
    resourceType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    const conditions = [eq(auditLogs.garageId, garageId)];
    
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.resourceType) {
      conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.timestamp, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.timestamp, filters.endDate));
    }
    
    return await db.select().from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.timestamp))
      .limit(1000);
  }

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }

  async getTwoFactorAuth(userId: string): Promise<TwoFactorAuth | undefined> {
    const [auth] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId));
    return auth;
  }

  async createTwoFactorAuth(data: InsertTwoFactorAuth): Promise<TwoFactorAuth> {
    const [auth] = await db.insert(twoFactorAuth).values(data).returning();
    return auth;
  }

  async updateTwoFactorAuth(userId: string, data: Partial<TwoFactorAuth>): Promise<TwoFactorAuth> {
    const [auth] = await db.update(twoFactorAuth)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(twoFactorAuth.userId, userId))
      .returning();
    return auth;
  }

  async deleteTwoFactorAuth(userId: string): Promise<void> {
    await db.delete(twoFactorAuth).where(eq(twoFactorAuth.userId, userId));
  }

  async getBackupJobs(garageId: string, status?: string): Promise<BackupJob[]> {
    const conditions = [eq(backupJobs.garageId, garageId)];
    if (status) {
      conditions.push(eq(backupJobs.status, status));
    }
    return await db.select().from(backupJobs)
      .where(and(...conditions))
      .orderBy(desc(backupJobs.createdAt));
  }

  async getBackupJob(id: string): Promise<BackupJob | undefined> {
    const [job] = await db.select().from(backupJobs).where(eq(backupJobs.id, id));
    return job;
  }

  async createBackupJob(data: InsertBackupJob): Promise<BackupJob> {
    const [job] = await db.insert(backupJobs).values(data).returning();
    return job;
  }

  async updateBackupJob(id: string, data: Partial<BackupJob>): Promise<BackupJob> {
    const [job] = await db.update(backupJobs)
      .set(data)
      .where(eq(backupJobs.id, id))
      .returning();
    return job;
  }

  async getGdprDataRequests(garageId: string, userId?: string): Promise<GdprDataRequest[]> {
    const conditions = [eq(gdprDataRequests.garageId, garageId)];
    if (userId) {
      conditions.push(eq(gdprDataRequests.userId, userId));
    }
    return await db.select().from(gdprDataRequests)
      .where(and(...conditions))
      .orderBy(desc(gdprDataRequests.createdAt));
  }

  async createGdprDataRequest(data: InsertGdprDataRequest): Promise<GdprDataRequest> {
    const [request] = await db.insert(gdprDataRequests).values(data).returning();
    return request;
  }

  async updateGdprDataRequest(id: string, data: Partial<GdprDataRequest>): Promise<GdprDataRequest> {
    const [request] = await db.update(gdprDataRequests)
      .set(data)
      .where(eq(gdprDataRequests.id, id))
      .returning();
    return request;
  }

  async getUserConsents(userId: string): Promise<UserConsent[]> {
    return await db.select().from(userConsents)
      .where(eq(userConsents.userId, userId))
      .orderBy(desc(userConsents.createdAt));
  }

  async createUserConsent(data: InsertUserConsent): Promise<UserConsent> {
    const [consent] = await db.insert(userConsents).values(data).returning();
    return consent;
  }

  async updateUserConsent(id: string, data: Partial<UserConsent>): Promise<UserConsent> {
    const [consent] = await db.update(userConsents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userConsents.id, id))
      .returning();
    return consent;
  }

  async getPermissionOverrides(garageId: string, userId?: string): Promise<PermissionOverride[]> {
    const conditions = [
      eq(permissionOverrides.garageId, garageId),
      or(
        isNull(permissionOverrides.expiresAt),
        gte(permissionOverrides.expiresAt, new Date())
      ) ?? sql`true`
    ];
    
    if (userId) {
      conditions.push(eq(permissionOverrides.userId, userId));
    }
    
    return await db.select().from(permissionOverrides)
      .where(and(...conditions))
      .orderBy(desc(permissionOverrides.createdAt));
  }

  async createPermissionOverride(data: InsertPermissionOverride): Promise<PermissionOverride> {
    const [override] = await db.insert(permissionOverrides).values(data).returning();
    return override;
  }

  async deletePermissionOverride(id: string): Promise<void> {
    await db.delete(permissionOverrides).where(eq(permissionOverrides.id, id));
  }

  // Module 35: System Improvements
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async createUserSettings(data: InsertUserSettings): Promise<UserSettings> {
    const [settings] = await db.insert(userSettings).values(data).returning();
    return settings;
  }

  async updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    const [settings] = await db.update(userSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return settings;
  }

  async getActionHistory(garageId: string, userId?: string, limit: number = 50): Promise<ActionHistory[]> {
    const conditions = [
      eq(actionHistory.garageId, garageId),
      eq(actionHistory.canUndo, true),
    ];
    
    if (userId) {
      conditions.push(eq(actionHistory.userId, userId));
    }
    
    return await db.select().from(actionHistory)
      .where(and(...conditions))
      .orderBy(desc(actionHistory.createdAt))
      .limit(limit);
  }

  async createActionHistory(data: InsertActionHistory): Promise<ActionHistory> {
    const [history] = await db.insert(actionHistory).values(data).returning();
    return history;
  }

  async undoAction(id: string): Promise<ActionHistory> {
    const [history] = await db.update(actionHistory)
      .set({ undoneAt: new Date(), canUndo: false })
      .where(eq(actionHistory.id, id))
      .returning();
    return history;
  }

  async redoAction(id: string): Promise<ActionHistory> {
    const [history] = await db.update(actionHistory)
      .set({ redoneAt: new Date(), undoneAt: null, canUndo: false })
      .where(eq(actionHistory.id, id))
      .returning();
    return history;
  }

  // Module 36: In-App Chat Support
  async getChatConversations(garageId: string, userId?: string): Promise<ChatConversation[]> {
    if (userId) {
      const conversations = await db
        .select({
          conversation: chatConversations,
        })
        .from(chatConversations)
        .innerJoin(chatParticipants, eq(chatParticipants.conversationId, chatConversations.id))
        .where(
          and(
            eq(chatConversations.garageId, garageId),
            eq(chatParticipants.userId, userId),
            eq(chatParticipants.isActive, true)
          )
        )
        .orderBy(desc(chatConversations.lastMessageAt));
      
      return conversations.map(c => c.conversation);
    }
    
    return await db.select().from(chatConversations)
      .where(eq(chatConversations.garageId, garageId))
      .orderBy(desc(chatConversations.lastMessageAt));
  }

  async getChatConversation(id: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation;
  }

  async createChatConversation(data: InsertChatConversation): Promise<ChatConversation> {
    const [conversation] = await db.insert(chatConversations).values(data).returning();
    return conversation;
  }

  async updateChatConversation(id: string, data: Partial<ChatConversation>): Promise<ChatConversation> {
    const [conversation] = await db.update(chatConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation;
  }

  async getChatMessages(conversationId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          isNull(chatMessages.deletedAt)
        )
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message;
  }

  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(data).returning();
    
    await db.update(chatConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatConversations.id, data.conversationId));
    
    return message;
  }

  async updateChatMessage(id: string, data: Partial<ChatMessage>): Promise<ChatMessage> {
    const [message] = await db.update(chatMessages)
      .set({ ...data, isEdited: true, editedAt: new Date() })
      .where(eq(chatMessages.id, id))
      .returning();
    return message;
  }

  async deleteChatMessage(id: string): Promise<void> {
    await db.update(chatMessages)
      .set({ deletedAt: new Date() })
      .where(eq(chatMessages.id, id));
  }

  async getChatParticipants(conversationId: string): Promise<ChatParticipant[]> {
    return await db.select().from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          eq(chatParticipants.isActive, true)
        )
      );
  }

  async addChatParticipant(data: InsertChatParticipant): Promise<ChatParticipant> {
    const [participant] = await db.insert(chatParticipants).values(data).returning();
    return participant;
  }

  async updateChatParticipant(id: string, data: Partial<ChatParticipant>): Promise<ChatParticipant> {
    const [participant] = await db.update(chatParticipants)
      .set(data)
      .where(eq(chatParticipants.id, id))
      .returning();
    return participant;
  }

  async removeChatParticipant(id: string): Promise<void> {
    await db.update(chatParticipants)
      .set({ isActive: false, leftAt: new Date() })
      .where(eq(chatParticipants.id, id));
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db.update(chatParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          eq(chatParticipants.userId, userId)
        )
      );
  }

  async getUnreadMessageCount(userId: string, conversationId?: string): Promise<number> {
    if (conversationId) {
      const [participant] = await db.select().from(chatParticipants)
        .where(
          and(
            eq(chatParticipants.conversationId, conversationId),
            eq(chatParticipants.userId, userId)
          )
        );
      
      if (!participant || !participant.lastReadAt) {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(chatMessages)
          .where(eq(chatMessages.conversationId, conversationId));
        return Number(result.count);
      }
      
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(chatMessages)
        .where(
          and(
            eq(chatMessages.conversationId, conversationId),
            gt(chatMessages.createdAt, participant.lastReadAt)
          )
        );
      return Number(result.count);
    }
    
    const userConversations = await db.select().from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.isActive, true)
        )
      );
    
    let totalUnread = 0;
    for (const participant of userConversations) {
      const count = await this.getUnreadMessageCount(userId, participant.conversationId);
      totalUnread += count;
    }
    
    return totalUnread;
  }

  // Chat Support Enhancements - Support Tickets
  async getSupportTickets(
    garageId: string, 
    filters?: {status?: string, priority?: string, assignedTo?: string, category?: string}
  ): Promise<SupportTicket[]> {
    const conditions = [eq(supportTickets.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(supportTickets.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(supportTickets.priority, filters.priority));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(supportTickets.assignedTo, filters.assignedTo));
    }
    if (filters?.category) {
      conditions.push(eq(supportTickets.category, filters.category));
    }
    
    return await db.select().from(supportTickets)
      .where(and(...conditions))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getSupportTicketByConversation(conversationId: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets)
      .where(eq(supportTickets.conversationId, conversationId));
    return ticket;
  }

  // ticketNumber is generated here, so callers must not supply one.
  async createSupportTicket(data: Omit<InsertSupportTicket, "ticketNumber">): Promise<SupportTicket> {
    const year = new Date().getFullYear();
    const garageIdSuffix = data.garageId.substring(0, 4).toUpperCase();
    
    const [lastTicket] = await db.select().from(supportTickets)
      .where(eq(supportTickets.garageId, data.garageId))
      .orderBy(desc(supportTickets.createdAt))
      .limit(1);
    
    let sequence = 1;
    if (lastTicket?.ticketNumber) {
      const match = lastTicket.ticketNumber.match(/\d+$/);
      if (match) {
        sequence = parseInt(match[0]) + 1;
      }
    }
    
    const ticketNumber = `TKT-${year}-${garageIdSuffix}-${sequence.toString().padStart(4, '0')}`;
    
    const [ticket] = await db.insert(supportTickets)
      .values({ ...data, ticketNumber })
      .returning();
    
    await this.createSupportTicketEvent({
      ticketId: ticket.id,
      userId: data.createdBy,
      eventType: 'created',
      newValue: ticket.status,
      notes: 'Ticket created',
    });
    
    return ticket;
  }

  async updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
    const [ticket] = await db.update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  async createSupportTicketEvent(data: InsertSupportTicketEvent): Promise<SupportTicketEvent> {
    const [event] = await db.insert(supportTicketEvents).values(data).returning();
    return event;
  }

  async getSupportTicketEvents(ticketId: string): Promise<SupportTicketEvent[]> {
    return await db.select().from(supportTicketEvents)
      .where(eq(supportTicketEvents.ticketId, ticketId))
      .orderBy(desc(supportTicketEvents.createdAt));
  }

  async assignTicket(ticketId: string, userId: string, assignedBy: string): Promise<SupportTicket> {
    const ticket = await this.getSupportTicket(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    const [updated] = await db.update(supportTickets)
      .set({ assignedTo: userId, updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    
    await this.createSupportTicketEvent({
      ticketId,
      userId: assignedBy,
      eventType: 'assigned',
      previousValue: ticket.assignedTo || '',
      newValue: userId,
      notes: `Ticket assigned to user ${userId}`,
    });
    
    return updated;
  }

  async updateTicketStatus(
    ticketId: string, 
    status: string, 
    userId: string, 
    notes?: string
  ): Promise<SupportTicket> {
    const ticket = await this.getSupportTicket(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    } else if (status === 'closed') {
      updateData.closedAt = new Date();
    }
    
    const [updated] = await db.update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, ticketId))
      .returning();
    
    await this.createSupportTicketEvent({
      ticketId,
      userId,
      eventType: 'status_changed',
      previousValue: ticket.status,
      newValue: status,
      notes: notes || `Status changed from ${ticket.status} to ${status}`,
    });
    
    return updated;
  }

  // Chat Attachments
  async createChatAttachment(data: InsertChatAttachment): Promise<ChatAttachment> {
    const [attachment] = await db.insert(chatAttachments).values(data).returning();
    return attachment;
  }

  async getChatAttachments(messageId: string): Promise<ChatAttachment[]> {
    return await db.select().from(chatAttachments)
      .where(eq(chatAttachments.messageId, messageId))
      .orderBy(desc(chatAttachments.createdAt));
  }

  async deleteChatAttachment(id: string): Promise<void> {
    await db.delete(chatAttachments).where(eq(chatAttachments.id, id));
  }

  // Chat Reactions
  async addMessageReaction(data: InsertChatMessageReaction): Promise<ChatMessageReaction> {
    const [reaction] = await db.insert(chatMessageReactions).values(data).returning();
    return reaction;
  }

  async removeMessageReaction(messageId: string, userId: string): Promise<void> {
    await db.delete(chatMessageReactions)
      .where(
        and(
          eq(chatMessageReactions.messageId, messageId),
          eq(chatMessageReactions.userId, userId)
        )
      );
  }

  async getMessageReactions(messageId: string): Promise<ChatMessageReaction[]> {
    return await db.select().from(chatMessageReactions)
      .where(eq(chatMessageReactions.messageId, messageId))
      .orderBy(desc(chatMessageReactions.createdAt));
  }

  // Module 37: Customer Self-Service Portal
  async createPortalSession(customerId: string): Promise<any> {
    const token = `portal_${crypto.randomUUID()}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [session] = await db.insert(customerPortalSessions)
      .values({
        customerId,
        token,
        expiresAt,
      })
      .returning();
    
    return session;
  }

  async validatePortalSession(token: string): Promise<any | null> {
    const [session] = await db.select()
      .from(customerPortalSessions)
      .where(eq(customerPortalSessions.token, token));
    
    if (!session || new Date() > session.expiresAt) {
      return null;
    }
    
    // Update last accessed time
    await db.update(customerPortalSessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(customerPortalSessions.id, session.id));
    
    return session;
  }

  async revokePortalSession(token: string): Promise<void> {
    await db.delete(customerPortalSessions)
      .where(eq(customerPortalSessions.token, token));
  }

  async getCustomerServiceHistory(customerId: string, vehicleId?: string): Promise<any[]> {
    if (vehicleId) {
      return await db.select({
        history: vehicleServiceHistory,
        vehicle: vehicles,
        jobCard: jobCards,
      })
      .from(vehicleServiceHistory)
      .leftJoin(vehicles, eq(vehicleServiceHistory.vehicleId, vehicles.id))
      .leftJoin(jobCards, eq(vehicleServiceHistory.jobCardId, jobCards.id))
      .where(
        and(
          eq(vehicleServiceHistory.vehicleId, vehicleId),
          eq(vehicles.customerId, customerId)
        )
      )
      .orderBy(desc(vehicleServiceHistory.serviceDate));
    }
    
    const customerVehicles = await this.getCustomerVehicles(customerId);
    const vehicleIds = customerVehicles.map((v: any) => v.id);
    
    if (vehicleIds.length === 0) return [];
    
    return await db.select({
      history: vehicleServiceHistory,
      vehicle: vehicles,
      jobCard: jobCards,
    })
    .from(vehicleServiceHistory)
    .leftJoin(vehicles, eq(vehicleServiceHistory.vehicleId, vehicles.id))
    .leftJoin(jobCards, eq(vehicleServiceHistory.jobCardId, jobCards.id))
    .where(inArray(vehicleServiceHistory.vehicleId, vehicleIds))
    .orderBy(desc(vehicleServiceHistory.serviceDate));
  }

  async getCustomerEstimates(customerId: string, status?: string): Promise<any[]> {
    if (status) {
      return await db.select({
        estimate: estimates,
        vehicle: vehicles,
      })
      .from(estimates)
      .leftJoin(vehicles, eq(estimates.vehicleId, vehicles.id))
      .where(
        and(
          eq(estimates.customerId, customerId),
          eq(estimates.status, status)
        )
      )
      .orderBy(desc(estimates.createdAt));
    }
    
    return await db.select({
      estimate: estimates,
      vehicle: vehicles,
    })
    .from(estimates)
    .leftJoin(vehicles, eq(estimates.vehicleId, vehicles.id))
    .where(eq(estimates.customerId, customerId))
    .orderBy(desc(estimates.createdAt));
  }

  async approveEstimate(estimateId: string, customerId: string): Promise<any> {
    // Verify customer owns this estimate
    const [estimate] = await db.select()
      .from(estimates)
      .where(
        and(
          eq(estimates.id, estimateId),
          eq(estimates.customerId, customerId)
        )
      );
    
    if (!estimate) {
      throw new Error('Estimate not found or unauthorized');
    }
    
    const [updated] = await db.update(estimates)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(estimates.id, estimateId))
      .returning();
    
    return updated;
  }

  async getCustomerPayments(customerId: string): Promise<any[]> {
    const customerInvoices = await this.getCustomerInvoices(customerId);
    const invoiceIds = customerInvoices.map((inv: any) => inv.id);
    
    if (invoiceIds.length === 0) return [];
    
    return await db.select({
      payment: payments,
      invoice: invoices,
    })
    .from(payments)
    .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(inArray(payments.invoiceId, invoiceIds))
    .orderBy(desc(payments.paymentDate));
  }

  // Module 38: Digital Signatures & Media Documentation
  async createDigitalSignature(data: any): Promise<any> {
    const [signature] = await db.insert(digitalSignatures)
      .values(data)
      .returning();
    return signature;
  }

  async getDigitalSignatures(relatedType: string, relatedId: string): Promise<any[]> {
    return await db.select()
      .from(digitalSignatures)
      .where(
        and(
          eq(digitalSignatures.relatedType, relatedType),
          eq(digitalSignatures.relatedId, relatedId)
        )
      )
      .orderBy(desc(digitalSignatures.createdAt));
  }

  async getDigitalSignature(id: string): Promise<any | undefined> {
    const [signature] = await db.select()
      .from(digitalSignatures)
      .where(eq(digitalSignatures.id, id));
    return signature;
  }

  async createMediaAttachment(data: any): Promise<any> {
    const [media] = await db.insert(mediaAttachments)
      .values(data)
      .returning();
    return media;
  }

  async getMediaAttachments(relatedType: string, relatedId: string, category?: string, garageId?: string): Promise<any[]> {
    const conditions = [
      eq(mediaAttachments.relatedType, relatedType),
      eq(mediaAttachments.relatedId, relatedId)
    ];
    if (garageId) conditions.push(eq(mediaAttachments.garageId, garageId));
    
    if (category) {
      conditions.push(eq(mediaAttachments.category, category));
    }
    
    return await db.select()
      .from(mediaAttachments)
      .where(and(...conditions))
      .orderBy(desc(mediaAttachments.createdAt));
  }

  async getMediaAttachment(id: string): Promise<any | undefined> {
    const [media] = await db.select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.id, id));
    return media;
  }

  async deleteMediaAttachment(id: string, garageId?: string): Promise<void> {
    await db.delete(mediaAttachments)
      .where(garageId
        ? and(eq(mediaAttachments.id, id), eq(mediaAttachments.garageId, garageId))
        : eq(mediaAttachments.id, id));
  }

  async updateMediaAttachment(id: string, data: any, garageId?: string): Promise<any> {
    const [media] = await db.update(mediaAttachments)
      .set(data)
      .where(garageId
        ? and(eq(mediaAttachments.id, id), eq(mediaAttachments.garageId, garageId))
        : eq(mediaAttachments.id, id))
      .returning();
    return media;
  }

  // Module 39: QR Code Check-In System
  async createQRCodeToken(data: any): Promise<any> {
    const [token] = await db.insert(qrCodeTokens)
      .values(data)
      .returning();
    return token;
  }

  async getQRCodeToken(id: string): Promise<any | undefined> {
    const [token] = await db.select()
      .from(qrCodeTokens)
      .where(eq(qrCodeTokens.id, id));
    return token;
  }

  async getQRCodeTokenByData(qrCodeData: string): Promise<any | undefined> {
    const [token] = await db.select()
      .from(qrCodeTokens)
      .where(eq(qrCodeTokens.qrCodeData, qrCodeData));
    return token;
  }

  async getQRCodeTokensByCustomer(customerId: string): Promise<any[]> {
    return await db.select()
      .from(qrCodeTokens)
      .where(eq(qrCodeTokens.customerId, customerId))
      .orderBy(desc(qrCodeTokens.createdAt));
  }

  async getQRCodeTokensByAppointment(appointmentId: string): Promise<any[]> {
    return await db.select()
      .from(qrCodeTokens)
      .where(eq(qrCodeTokens.appointmentId, appointmentId))
      .orderBy(desc(qrCodeTokens.createdAt));
  }

  async markQRCodeAsUsed(id: string): Promise<any> {
    const [token] = await db.update(qrCodeTokens)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(eq(qrCodeTokens.id, id))
      .returning();
    return token;
  }

  async createQRScanLog(data: any): Promise<any> {
    const [log] = await db.insert(qrScanLogs)
      .values(data)
      .returning();
    return log;
  }

  async getQRScanLogsByToken(qrCodeId: string): Promise<any[]> {
    return await db.select()
      .from(qrScanLogs)
      .where(eq(qrScanLogs.qrCodeId, qrCodeId))
      .orderBy(desc(qrScanLogs.createdAt));
  }

  async getQRScanLogsByGarage(garageId: string, limit?: number): Promise<any[]> {
    const query = db.select({
      log: qrScanLogs,
      token: qrCodeTokens,
    })
    .from(qrScanLogs)
    .leftJoin(qrCodeTokens, eq(qrScanLogs.qrCodeId, qrCodeTokens.id))
    .where(eq(qrCodeTokens.garageId, garageId))
    .orderBy(desc(qrScanLogs.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async createAppointmentStatusHistory(data: any): Promise<any> {
    const [history] = await db.insert(appointmentStatusHistory)
      .values(data)
      .returning();
    return history;
  }

  // Module 40: Fleet Management
  async createFleetGroup(data: any): Promise<any> {
    const [fleetGroup] = await db.insert(fleetGroups)
      .values(data)
      .returning();
    return fleetGroup;
  }

  async getFleetGroup(id: string): Promise<any> {
    const [fleetGroup] = await db.select()
      .from(fleetGroups)
      .where(eq(fleetGroups.id, id));
    return fleetGroup;
  }

  async getFleetGroupsByGarage(garageId: string): Promise<any[]> {
    return await db.select()
      .from(fleetGroups)
      .where(eq(fleetGroups.garageId, garageId))
      .orderBy(desc(fleetGroups.createdAt));
  }

  async updateFleetGroup(id: string, data: any): Promise<any> {
    const [fleetGroup] = await db.update(fleetGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fleetGroups.id, id))
      .returning();
    return fleetGroup;
  }

  async deleteFleetGroup(id: string): Promise<void> {
    await db.delete(fleetGroups)
      .where(eq(fleetGroups.id, id));
  }

  async createFleetVehicle(data: any): Promise<any> {
    const [fleetVehicle] = await db.insert(fleetVehicles)
      .values(data)
      .returning();
    return fleetVehicle;
  }

  async getFleetVehicle(id: string): Promise<any> {
    const [fleetVehicle] = await db.select()
      .from(fleetVehicles)
      .where(eq(fleetVehicles.id, id));
    return fleetVehicle;
  }

  async getFleetVehiclesByGroup(fleetGroupId: string): Promise<any[]> {
    return await db.select({
      fleetVehicle: fleetVehicles,
      vehicle: vehicles,
    })
    .from(fleetVehicles)
    .leftJoin(vehicles, eq(fleetVehicles.vehicleId, vehicles.id))
    .where(eq(fleetVehicles.fleetGroupId, fleetGroupId))
    .orderBy(desc(fleetVehicles.assignedAt));
  }

  async updateFleetVehicle(id: string, data: any): Promise<any> {
    const [fleetVehicle] = await db.update(fleetVehicles)
      .set(data)
      .where(eq(fleetVehicles.id, id))
      .returning();
    return fleetVehicle;
  }

  async deleteFleetVehicle(id: string): Promise<void> {
    await db.delete(fleetVehicles)
      .where(eq(fleetVehicles.id, id));
  }

  async createFleetContract(data: any): Promise<any> {
    const [contract] = await db.insert(fleetContracts)
      .values(data)
      .returning();
    return contract;
  }

  async getFleetContract(id: string): Promise<any> {
    const [contract] = await db.select()
      .from(fleetContracts)
      .where(eq(fleetContracts.id, id));
    return contract;
  }

  async getFleetContractsByGroup(fleetGroupId: string): Promise<any[]> {
    return await db.select()
      .from(fleetContracts)
      .where(eq(fleetContracts.fleetGroupId, fleetGroupId))
      .orderBy(desc(fleetContracts.createdAt));
  }

  async updateFleetContract(id: string, data: any): Promise<any> {
    const [contract] = await db.update(fleetContracts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fleetContracts.id, id))
      .returning();
    return contract;
  }

  async deleteFleetContract(id: string): Promise<void> {
    await db.delete(fleetContracts)
      .where(eq(fleetContracts.id, id));
  }

  async createFleetPricingTier(data: any): Promise<any> {
    const [tier] = await db.insert(fleetPricingTiers)
      .values(data)
      .returning();
    return tier;
  }

  async getFleetPricingTier(id: string): Promise<any> {
    const [tier] = await db.select()
      .from(fleetPricingTiers)
      .where(eq(fleetPricingTiers.id, id));
    return tier;
  }

  async getFleetPricingTiersByGarage(garageId: string): Promise<any[]> {
    return await db.select()
      .from(fleetPricingTiers)
      .where(eq(fleetPricingTiers.garageId, garageId))
      .orderBy(desc(fleetPricingTiers.createdAt));
  }

  async getFleetPricingTiersByGroup(fleetGroupId: string): Promise<any[]> {
    return await db.select()
      .from(fleetPricingTiers)
      .where(eq(fleetPricingTiers.fleetGroupId, fleetGroupId))
      .orderBy(desc(fleetPricingTiers.createdAt));
  }

  async updateFleetPricingTier(id: string, data: any): Promise<any> {
    const [tier] = await db.update(fleetPricingTiers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fleetPricingTiers.id, id))
      .returning();
    return tier;
  }

  async deleteFleetPricingTier(id: string): Promise<void> {
    await db.delete(fleetPricingTiers)
      .where(eq(fleetPricingTiers.id, id));
  }

  async createFleetMaintenanceSchedule(data: any): Promise<any> {
    const [schedule] = await db.insert(fleetMaintenanceSchedules)
      .values(data)
      .returning();
    return schedule;
  }

  async getFleetMaintenanceSchedule(id: string): Promise<any> {
    const [schedule] = await db.select()
      .from(fleetMaintenanceSchedules)
      .where(eq(fleetMaintenanceSchedules.id, id));
    return schedule;
  }

  async getFleetMaintenanceSchedulesByGroup(fleetGroupId: string): Promise<any[]> {
    return await db.select()
      .from(fleetMaintenanceSchedules)
      .where(eq(fleetMaintenanceSchedules.fleetGroupId, fleetGroupId))
      .orderBy(desc(fleetMaintenanceSchedules.createdAt));
  }

  async updateFleetMaintenanceSchedule(id: string, data: any): Promise<any> {
    const [schedule] = await db.update(fleetMaintenanceSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fleetMaintenanceSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteFleetMaintenanceSchedule(id: string): Promise<void> {
    await db.delete(fleetMaintenanceSchedules)
      .where(eq(fleetMaintenanceSchedules.id, id));
  }

  // Module 41: Warranty Tracking
  async createWarranty(data: any): Promise<any> {
    const [warranty] = await db.insert(warranties)
      .values(data)
      .returning();
    return warranty;
  }

  async getWarrantiesByGarage(garageId: string): Promise<any[]> {
    return await db.select()
      .from(warranties)
      .where(eq(warranties.garageId, garageId))
      .orderBy(desc(warranties.createdAt));
  }

  async getWarrantyById(id: string): Promise<any | undefined> {
    const [warranty] = await db.select()
      .from(warranties)
      .where(eq(warranties.id, id));
    return warranty;
  }

  async getWarrantiesByVehicle(vehicleId: string): Promise<any[]> {
    return await db.select()
      .from(warranties)
      .where(eq(warranties.vehicleId, vehicleId))
      .orderBy(desc(warranties.createdAt));
  }

  async getWarrantiesByCustomer(customerId: string): Promise<any[]> {
    return await db.select()
      .from(warranties)
      .where(eq(warranties.customerId, customerId))
      .orderBy(desc(warranties.createdAt));
  }

  async getActiveWarranties(garageId: string): Promise<any[]> {
    return await db.select()
      .from(warranties)
      .where(and(
        eq(warranties.garageId, garageId),
        eq(warranties.status, 'active'),
        gte(warranties.endDate, new Date())
      ))
      .orderBy(desc(warranties.endDate));
  }

  async getExpiredWarranties(garageId: string): Promise<any[]> {
    return await db.select()
      .from(warranties)
      .where(and(
        eq(warranties.garageId, garageId),
        or(
          eq(warranties.status, 'expired'),
          lte(warranties.endDate, new Date())
        )
      ))
      .orderBy(desc(warranties.endDate));
  }

  async getExpiringWarranties(garageId: string, daysThreshold: number): Promise<any[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return await db.select()
      .from(warranties)
      .where(and(
        eq(warranties.garageId, garageId),
        eq(warranties.status, 'active'),
        lte(warranties.endDate, thresholdDate),
        gte(warranties.endDate, new Date())
      ))
      .orderBy(warranties.endDate);
  }

  async updateWarranty(id: string, data: any): Promise<any> {
    const [warranty] = await db.update(warranties)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(warranties.id, id))
      .returning();
    return warranty;
  }

  async deleteWarranty(id: string): Promise<void> {
    await db.delete(warranties)
      .where(eq(warranties.id, id));
  }

  async createWarrantyClaim(data: any): Promise<any> {
    const [claim] = await db.insert(warrantyClaims)
      .values(data)
      .returning();
    return claim;
  }

  async getWarrantyClaimsByGarage(garageId: string): Promise<any[]> {
    return await db.select({
      claim: warrantyClaims,
      warranty: warranties
    })
      .from(warrantyClaims)
      .innerJoin(warranties, eq(warrantyClaims.warrantyId, warranties.id))
      .where(eq(warranties.garageId, garageId))
      .orderBy(desc(warrantyClaims.createdAt));
  }

  async getWarrantyClaimById(id: string): Promise<any | undefined> {
    const [claim] = await db.select()
      .from(warrantyClaims)
      .where(eq(warrantyClaims.id, id));
    return claim;
  }

  async getWarrantyClaimsByWarranty(warrantyId: string): Promise<any[]> {
    return await db.select()
      .from(warrantyClaims)
      .where(eq(warrantyClaims.warrantyId, warrantyId))
      .orderBy(desc(warrantyClaims.createdAt));
  }

  async updateWarrantyClaim(id: string, data: any): Promise<any> {
    const [claim] = await db.update(warrantyClaims)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(warrantyClaims.id, id))
      .returning();
    return claim;
  }

  async deleteWarrantyClaim(id: string): Promise<void> {
    await db.delete(warrantyClaims)
      .where(eq(warrantyClaims.id, id));
  }

  // Module 45: Vehicle Inspection Checklists
  async createInspectionTemplate(data: InsertInspectionTemplate): Promise<InspectionTemplate> {
    const [template] = await db.insert(inspectionTemplates).values(data).returning();
    return template;
  }

  async getInspectionTemplates(garageId: string): Promise<InspectionTemplate[]> {
    return await db.select()
      .from(inspectionTemplates)
      .where(eq(inspectionTemplates.garageId, garageId))
      .orderBy(desc(inspectionTemplates.createdAt));
  }

  async getInspectionTemplateById(id: string): Promise<InspectionTemplate | undefined> {
    const [template] = await db.select()
      .from(inspectionTemplates)
      .where(eq(inspectionTemplates.id, id));
    return template;
  }

  async updateInspectionTemplate(id: string, data: Partial<InsertInspectionTemplate>): Promise<InspectionTemplate> {
    const [template] = await db.update(inspectionTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inspectionTemplates.id, id))
      .returning();
    return template;
  }

  async deleteInspectionTemplate(id: string): Promise<void> {
    await db.delete(inspectionTemplates)
      .where(eq(inspectionTemplates.id, id));
  }

  async createVehicleInspection(data: InsertVehicleInspection): Promise<VehicleInspection> {
    const inspectionNumber = `INS-${Date.now()}`;
    const [inspection] = await db.insert(vehicleInspections)
      .values({ ...data, inspectionNumber })
      .returning();
    return inspection;
  }

  async getVehicleInspections(
    garageId: string,
    filters?: {status?: string, vehicleId?: string, customerId?: string}
  ): Promise<VehicleInspection[]> {
    const conditions = [eq(vehicleInspections.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(vehicleInspections.overallStatus, filters.status));
    }
    if (filters?.vehicleId) {
      conditions.push(eq(vehicleInspections.vehicleId, filters.vehicleId));
    }
    if (filters?.customerId) {
      conditions.push(eq(vehicleInspections.customerId, filters.customerId));
    }

    return await db.select()
      .from(vehicleInspections)
      .where(and(...conditions))
      .orderBy(desc(vehicleInspections.createdAt));
  }

  async getVehicleInspectionById(id: string): Promise<VehicleInspection | undefined> {
    const [inspection] = await db.select()
      .from(vehicleInspections)
      .where(eq(vehicleInspections.id, id));
    return inspection;
  }

  async updateVehicleInspection(id: string, data: Partial<InsertVehicleInspection>, garageId?: string): Promise<VehicleInspection> {
    // Tenant scope (B16 breadth).
    const [inspection] = await db.update(vehicleInspections)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(vehicleInspections.id, id), garageId ? eq(vehicleInspections.garageId, garageId) : undefined))
      .returning();
    return inspection;
  }

  async deleteVehicleInspection(id: string, garageId?: string): Promise<void> {
    await db.delete(vehicleInspections)
      .where(and(eq(vehicleInspections.id, id), garageId ? eq(vehicleInspections.garageId, garageId) : undefined));
  }

  // Module 46: Towing & Roadside Assistance
  async createTowingRequest(data: InsertTowingRequest): Promise<TowingRequest> {
    const requestNumber = `TOW-${Date.now()}`;
    const [request] = await db.insert(towingRequests)
      .values({ ...data, requestNumber })
      .returning();
    return request;
  }

  async getTowingRequests(
    garageId: string,
    filters?: {status?: string, serviceType?: string}
  ): Promise<TowingRequest[]> {
    const conditions = [eq(towingRequests.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(towingRequests.status, filters.status));
    }
    if (filters?.serviceType) {
      conditions.push(eq(towingRequests.serviceType, filters.serviceType));
    }

    return await db.select()
      .from(towingRequests)
      .where(and(...conditions))
      .orderBy(desc(towingRequests.createdAt));
  }

  async getTowingRequestById(id: string): Promise<TowingRequest | undefined> {
    const [request] = await db.select()
      .from(towingRequests)
      .where(eq(towingRequests.id, id));
    return request;
  }

  async updateTowingRequest(id: string, data: Partial<InsertTowingRequest>): Promise<TowingRequest> {
    const [request] = await db.update(towingRequests)
      .set(data)
      .where(eq(towingRequests.id, id))
      .returning();
    return request;
  }

  async deleteTowingRequest(id: string): Promise<void> {
    await db.delete(towingRequests)
      .where(eq(towingRequests.id, id));
  }

  async createTowTruck(data: InsertTowTruck): Promise<TowTruck> {
    const [truck] = await db.insert(towTrucks)
      .values(data)
      .returning();
    return truck;
  }

  async getTowTrucks(
    garageId: string,
    filters?: {status?: string}
  ): Promise<TowTruck[]> {
    const conditions = [eq(towTrucks.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(towTrucks.status, filters.status));
    }

    return await db.select()
      .from(towTrucks)
      .where(and(...conditions))
      .orderBy(desc(towTrucks.createdAt));
  }

  async getTowTruckById(id: string): Promise<TowTruck | undefined> {
    const [truck] = await db.select()
      .from(towTrucks)
      .where(eq(towTrucks.id, id));
    return truck;
  }

  async updateTowTruck(id: string, data: Partial<InsertTowTruck>): Promise<TowTruck> {
    const [truck] = await db.update(towTrucks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(towTrucks.id, id))
      .returning();
    return truck;
  }

  async deleteTowTruck(id: string): Promise<void> {
    await db.delete(towTrucks)
      .where(eq(towTrucks.id, id));
  }

  async updateTowTruckLocation(id: string, latitude: string, longitude: string): Promise<TowTruck> {
    const [truck] = await db.update(towTrucks)
      .set({
        lastKnownLatitude: latitude,
        lastKnownLongitude: longitude,
        lastLocationUpdate: new Date(),
      })
      .where(eq(towTrucks.id, id))
      .returning();
    return truck;
  }

  // Module 48: Loaner Vehicle Management
  async createLoanerVehicle(data: InsertLoanerVehicle): Promise<LoanerVehicle> {
    const loanerNumber = `LOAN-${Date.now()}`;
    const [vehicle] = await db.insert(loanerVehicles)
      .values({ ...data, loanerNumber })
      .returning();
    return vehicle;
  }

  async getLoanerVehicles(
    garageId: string,
    filters?: {status?: string, condition?: string}
  ): Promise<LoanerVehicle[]> {
    const conditions = [eq(loanerVehicles.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(loanerVehicles.status, filters.status));
    }
    if (filters?.condition) {
      conditions.push(eq(loanerVehicles.condition, filters.condition));
    }

    return await db.select()
      .from(loanerVehicles)
      .where(and(...conditions))
      .orderBy(desc(loanerVehicles.createdAt));
  }

  async getLoanerVehicleById(id: string): Promise<LoanerVehicle | undefined> {
    const [vehicle] = await db.select()
      .from(loanerVehicles)
      .where(eq(loanerVehicles.id, id));
    return vehicle;
  }

  async updateLoanerVehicle(id: string, data: Partial<InsertLoanerVehicle>, garageId?: string): Promise<LoanerVehicle> {
    // Tenant scope (B16 breadth).
    const [vehicle] = await db.update(loanerVehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(loanerVehicles.id, id), garageId ? eq(loanerVehicles.garageId, garageId) : undefined))
      .returning();
    return vehicle;
  }

  async deleteLoanerVehicle(id: string, garageId?: string): Promise<void> {
    await db.delete(loanerVehicles)
      .where(and(eq(loanerVehicles.id, id), garageId ? eq(loanerVehicles.garageId, garageId) : undefined));
  }

  async createLoanerReservation(data: InsertLoanerReservation): Promise<LoanerReservation> {
    const reservationNumber = `RES-${Date.now()}`;
    const [reservation] = await db.insert(loanerReservations)
      .values({ ...data, reservationNumber })
      .returning();
    return reservation;
  }

  async getLoanerReservations(
    garageId: string,
    filters?: {status?: string, loanerVehicleId?: string}
  ): Promise<LoanerReservation[]> {
    const conditions: any[] = [];
    
    if (filters?.status || filters?.loanerVehicleId) {
      if (filters?.status) {
        conditions.push(eq(loanerReservations.status, filters.status));
      }
      if (filters?.loanerVehicleId) {
        conditions.push(eq(loanerReservations.loanerVehicleId, filters.loanerVehicleId));
      }

      return await db.select()
        .from(loanerReservations)
        .innerJoin(loanerVehicles, eq(loanerReservations.loanerVehicleId, loanerVehicles.id))
        .where(and(eq(loanerVehicles.garageId, garageId), ...conditions))
        .orderBy(desc(loanerReservations.createdAt))
        .then(results => results.map(r => r.loaner_reservations));
    }

    return await db.select()
      .from(loanerReservations)
      .innerJoin(loanerVehicles, eq(loanerReservations.loanerVehicleId, loanerVehicles.id))
      .where(eq(loanerVehicles.garageId, garageId))
      .orderBy(desc(loanerReservations.createdAt))
      .then(results => results.map(r => r.loaner_reservations));
  }

  async getLoanerReservationById(id: string): Promise<LoanerReservation | undefined> {
    const [reservation] = await db.select()
      .from(loanerReservations)
      .where(eq(loanerReservations.id, id));
    return reservation;
  }

  async updateLoanerReservation(id: string, data: Partial<InsertLoanerReservation>): Promise<LoanerReservation> {
    const [reservation] = await db.update(loanerReservations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanerReservations.id, id))
      .returning();
    return reservation;
  }

  async deleteLoanerReservation(id: string): Promise<void> {
    await db.delete(loanerReservations)
      .where(eq(loanerReservations.id, id));
  }

  // Module 42: Marketing Automation
  async createMarketingCampaign(data: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [campaign] = await db.insert(marketingCampaigns)
      .values(data)
      .returning();
    return campaign;
  }

  async getMarketingCampaigns(
    garageId: string,
    filters?: {status?: string, campaignType?: string}
  ): Promise<MarketingCampaign[]> {
    const conditions = [eq(marketingCampaigns.garageId, garageId)];
    
    if (filters?.status) {
      conditions.push(eq(marketingCampaigns.status, filters.status));
    }
    if (filters?.campaignType) {
      conditions.push(eq(marketingCampaigns.campaignType, filters.campaignType));
    }

    return await db.select()
      .from(marketingCampaigns)
      .where(and(...conditions))
      .orderBy(desc(marketingCampaigns.createdAt));
  }

  async getMarketingCampaignById(id: string): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db.select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.id, id));
    return campaign;
  }

  async updateMarketingCampaign(id: string, data: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign> {
    const [campaign] = await db.update(marketingCampaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteMarketingCampaign(id: string): Promise<void> {
    await db.delete(marketingCampaigns)
      .where(eq(marketingCampaigns.id, id));
  }

  async getCampaignRecipients(campaignId: string): Promise<CampaignRecipient[]> {
    return await db.select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId))
      .orderBy(desc(campaignRecipients.createdAt));
  }

  async createCampaignRecipient(data: InsertCampaignRecipient): Promise<CampaignRecipient> {
    const [recipient] = await db.insert(campaignRecipients)
      .values(data)
      .returning();
    return recipient;
  }

  async updateCampaignRecipient(id: string, data: Partial<InsertCampaignRecipient>): Promise<CampaignRecipient> {
    const [recipient] = await db.update(campaignRecipients)
      .set(data)
      .where(eq(campaignRecipients.id, id))
      .returning();
    return recipient;
  }

  async getCampaignAnalytics(campaignId: string): Promise<any> {
    const [campaign] = await db.select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.id, campaignId));
    
    if (!campaign) return null;

    const recipients = await db.select()
      .from(campaignRecipients)
      .where(eq(campaignRecipients.campaignId, campaignId));

    const totalRecipients = campaign.totalRecipients ?? 0;
    const sentCount = campaign.sentCount ?? 0;
    const deliveredCount = campaign.deliveredCount ?? 0;
    const openedCount = campaign.openedCount ?? 0;
    const clickedCount = campaign.clickedCount ?? 0;
    const unsubscribedCount = campaign.unsubscribedCount ?? 0;

    return {
      totalRecipients,
      sentCount,
      deliveredCount,
      openedCount,
      clickedCount,
      unsubscribedCount,
      deliveryRate: totalRecipients > 0 ? (deliveredCount / totalRecipients * 100).toFixed(2) : 0,
      openRate: deliveredCount > 0 ? (openedCount / deliveredCount * 100).toFixed(2) : 0,
      clickRate: deliveredCount > 0 ? (clickedCount / deliveredCount * 100).toFixed(2) : 0,
      unsubscribeRate: sentCount > 0 ? (unsubscribedCount / sentCount * 100).toFixed(2) : 0,
      recipients: recipients
    };
  }

  // Module 44: Customer Loyalty Program
  async createLoyaltyProgram(data: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const [program] = await db.insert(loyaltyProgram)
      .values(data)
      .returning();
    return program;
  }

  async getLoyaltyPrograms(garageId: string): Promise<LoyaltyProgram[]> {
    return await db.select()
      .from(loyaltyProgram)
      .where(eq(loyaltyProgram.garageId, garageId))
      .orderBy(desc(loyaltyProgram.createdAt));
  }

  async getLoyaltyProgramById(id: string): Promise<LoyaltyProgram | undefined> {
    const [program] = await db.select()
      .from(loyaltyProgram)
      .where(eq(loyaltyProgram.id, id));
    return program;
  }

  async updateLoyaltyProgram(id: string, data: Partial<InsertLoyaltyProgram>): Promise<LoyaltyProgram> {
    const [program] = await db.update(loyaltyProgram)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loyaltyProgram.id, id))
      .returning();
    return program;
  }

  async deleteLoyaltyProgram(id: string): Promise<void> {
    await db.delete(loyaltyProgram)
      .where(eq(loyaltyProgram.id, id));
  }

  async createLoyaltyAccount(data: InsertCustomerLoyaltyAccount): Promise<CustomerLoyaltyAccount> {
    const referralCode = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const [account] = await db.insert(customerLoyaltyAccounts)
      .values({ ...data, referralCode })
      .returning();
    return account;
  }

  async getLoyaltyAccounts(programId?: string, customerId?: string): Promise<CustomerLoyaltyAccount[]> {
    const conditions: any[] = [];
    
    if (programId) {
      conditions.push(eq(customerLoyaltyAccounts.programId, programId));
    }
    if (customerId) {
      conditions.push(eq(customerLoyaltyAccounts.customerId, customerId));
    }

    if (conditions.length === 0) {
      return await db.select()
        .from(customerLoyaltyAccounts)
        .orderBy(desc(customerLoyaltyAccounts.enrolledAt));
    }

    return await db.select()
      .from(customerLoyaltyAccounts)
      .where(and(...conditions))
      .orderBy(desc(customerLoyaltyAccounts.enrolledAt));
  }

  async getLoyaltyAccountById(id: string): Promise<CustomerLoyaltyAccount | undefined> {
    const [account] = await db.select()
      .from(customerLoyaltyAccounts)
      .where(eq(customerLoyaltyAccounts.id, id));
    return account;
  }

  async updateLoyaltyAccount(id: string, data: Partial<InsertCustomerLoyaltyAccount>): Promise<CustomerLoyaltyAccount> {
    const [account] = await db.update(customerLoyaltyAccounts)
      .set(data)
      .where(eq(customerLoyaltyAccounts.id, id))
      .returning();
    return account;
  }

  async getLoyaltyAccountByCustomer(customerId: string): Promise<CustomerLoyaltyAccount | undefined> {
    const [account] = await db.select()
      .from(customerLoyaltyAccounts)
      .where(eq(customerLoyaltyAccounts.customerId, customerId));
    return account;
  }

  async createLoyaltyTransaction(data: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const [transaction] = await db.insert(loyaltyTransactions)
      .values(data)
      .returning();
    
    // Update account points
    const account = await this.getLoyaltyAccountById(data.accountId);
    if (account) {
      const currentPoints = account.currentPoints ?? 0;
      const totalPointsEarned = account.totalPointsEarned ?? 0;
      const newPoints = currentPoints + data.points;
      const newTotalEarned = data.points > 0 ? totalPointsEarned + data.points : totalPointsEarned;
      await this.updateLoyaltyAccount(data.accountId, {
        currentPoints: newPoints,
        totalPointsEarned: newTotalEarned
      });
    }

    return transaction;
  }

  async getLoyaltyTransactions(accountId: string): Promise<LoyaltyTransaction[]> {
    return await db.select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.accountId, accountId))
      .orderBy(desc(loyaltyTransactions.createdAt));
  }

  async getLoyaltyTransactionById(id: string): Promise<LoyaltyTransaction | undefined> {
    const [transaction] = await db.select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.id, id));
    return transaction;
  }

  async createLoyaltyReward(data: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const [reward] = await db.insert(loyaltyRewards)
      .values(data)
      .returning();
    return reward;
  }

  async getLoyaltyRewards(programId: string, filters?: {isActive?: boolean}): Promise<LoyaltyReward[]> {
    const conditions = [eq(loyaltyRewards.programId, programId)];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(loyaltyRewards.isActive, filters.isActive));
    }

    return await db.select()
      .from(loyaltyRewards)
      .where(and(...conditions))
      .orderBy(desc(loyaltyRewards.createdAt));
  }

  async getLoyaltyRewardById(id: string): Promise<LoyaltyReward | undefined> {
    const [reward] = await db.select()
      .from(loyaltyRewards)
      .where(eq(loyaltyRewards.id, id));
    return reward;
  }

  async updateLoyaltyReward(id: string, data: Partial<InsertLoyaltyReward>): Promise<LoyaltyReward> {
    const [reward] = await db.update(loyaltyRewards)
      .set(data)
      .where(eq(loyaltyRewards.id, id))
      .returning();
    return reward;
  }

  async deleteLoyaltyReward(id: string): Promise<void> {
    await db.delete(loyaltyRewards)
      .where(eq(loyaltyRewards.id, id));
  }

  async createLoyaltyRedemption(data: InsertLoyaltyRedemption): Promise<LoyaltyRedemption> {
    const redemptionCode = `REDEEM-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const [redemption] = await db.insert(loyaltyRedemptions)
      .values({ ...data, redemptionCode })
      .returning();
    
    // Deduct points from account
    const account = await this.getLoyaltyAccountById(data.accountId);
    if (account) {
      const currentPoints = account.currentPoints ?? 0;
      await this.updateLoyaltyAccount(data.accountId, {
        currentPoints: currentPoints - data.pointsRedeemed
      });
    }

    return redemption;
  }

  async getLoyaltyRedemptions(accountId?: string, filters?: {status?: string}): Promise<LoyaltyRedemption[]> {
    const conditions: any[] = [];
    
    if (accountId) {
      conditions.push(eq(loyaltyRedemptions.accountId, accountId));
    }
    if (filters?.status) {
      conditions.push(eq(loyaltyRedemptions.status, filters.status));
    }

    if (conditions.length === 0) {
      return await db.select()
        .from(loyaltyRedemptions)
        .orderBy(desc(loyaltyRedemptions.createdAt));
    }

    return await db.select()
      .from(loyaltyRedemptions)
      .where(and(...conditions))
      .orderBy(desc(loyaltyRedemptions.createdAt));
  }

  async getLoyaltyRedemptionById(id: string): Promise<LoyaltyRedemption | undefined> {
    const [redemption] = await db.select()
      .from(loyaltyRedemptions)
      .where(eq(loyaltyRedemptions.id, id));
    return redemption;
  }

  async updateLoyaltyRedemption(id: string, data: Partial<InsertLoyaltyRedemption>): Promise<LoyaltyRedemption> {
    const [redemption] = await db.update(loyaltyRedemptions)
      .set(data)
      .where(eq(loyaltyRedemptions.id, id))
      .returning();
    return redemption;
  }

  // Module 47: Document Management
  async createDocumentCategory(data: InsertDocumentCategory): Promise<DocumentCategory> {
    const [category] = await db.insert(documentCategories)
      .values(data)
      .returning();
    return category;
  }

  async getDocumentCategories(garageId: string): Promise<DocumentCategory[]> {
    return await db.select()
      .from(documentCategories)
      .where(eq(documentCategories.garageId, garageId))
      .orderBy(desc(documentCategories.createdAt));
  }

  async getDocumentCategoryById(id: string): Promise<DocumentCategory | undefined> {
    const [category] = await db.select()
      .from(documentCategories)
      .where(eq(documentCategories.id, id));
    return category;
  }

  async updateDocumentCategory(id: string, data: Partial<InsertDocumentCategory>): Promise<DocumentCategory> {
    const [category] = await db.update(documentCategories)
      .set(data)
      .where(eq(documentCategories.id, id))
      .returning();
    return category;
  }

  async deleteDocumentCategory(id: string): Promise<void> {
    await db.delete(documentCategories)
      .where(eq(documentCategories.id, id));
  }

  async createDocument(data: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents)
      .values(data)
      .returning();
    return document;
  }

  async getDocuments(
    garageId: string,
    filters?: {categoryId?: string, relatedType?: string, relatedId?: string, status?: string}
  ): Promise<Document[]> {
    const conditions = [eq(documents.garageId, garageId)];
    
    if (filters?.categoryId) {
      conditions.push(eq(documents.categoryId, filters.categoryId));
    }
    if (filters?.relatedType) {
      conditions.push(eq(documents.relatedType, filters.relatedType));
    }
    if (filters?.relatedId) {
      conditions.push(eq(documents.relatedId, filters.relatedId));
    }
    if (filters?.status) {
      conditions.push(eq(documents.status, filters.status));
    }

    return await db.select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [document] = await db.select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async updateDocument(id: string, data: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db.update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents)
      .where(eq(documents.id, id));
  }

  async getExpiringDocuments(garageId: string, daysAhead: number): Promise<Document[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await db.select()
      .from(documents)
      .where(
        and(
          eq(documents.garageId, garageId),
          eq(documents.status, 'active'),
          lte(documents.expirationDate, futureDate),
          gte(documents.expirationDate, new Date())
        )
      )
      .orderBy(documents.expirationDate);
  }

  async createDocumentAccessLog(data: InsertDocumentAccessLog): Promise<DocumentAccessLog> {
    const [log] = await db.insert(documentAccessLog)
      .values(data)
      .returning();
    return log;
  }

  async getDocumentAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    return await db.select()
      .from(documentAccessLog)
      .where(eq(documentAccessLog.documentId, documentId))
      .orderBy(desc(documentAccessLog.createdAt));
  }

  // ========================================================================
  // ENTERPRISE ERP MODULES (56-60) STORAGE METHODS
  // ========================================================================

  // Module 56: Franchise Command Center
  async createFranchiseGroup(data: InsertFranchiseGroup): Promise<FranchiseGroup> {
    const [group] = await db.insert(franchiseGroups).values(data).returning();
    return group;
  }

  async getFranchiseGroups(): Promise<FranchiseGroup[]> {
    return await db.select().from(franchiseGroups).orderBy(desc(franchiseGroups.createdAt));
  }

  async getFranchiseGroupById(id: string): Promise<FranchiseGroup | undefined> {
    const [group] = await db.select().from(franchiseGroups).where(eq(franchiseGroups.id, id));
    return group;
  }

  async updateFranchiseGroup(id: string, data: Partial<InsertFranchiseGroup>): Promise<FranchiseGroup> {
    const [group] = await db.update(franchiseGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(franchiseGroups.id, id))
      .returning();
    return group;
  }

  async deleteFranchiseGroup(id: string): Promise<void> {
    await db.delete(franchiseGroups).where(eq(franchiseGroups.id, id));
  }

  async createFranchiseContract(data: InsertFranchiseContract): Promise<FranchiseContract> {
    const [contract] = await db.insert(franchiseContracts).values(data).returning();
    return contract;
  }

  async getFranchiseContracts(franchiseGroupId?: string): Promise<FranchiseContract[]> {
    if (franchiseGroupId) {
      return await db.select()
        .from(franchiseContracts)
        .where(eq(franchiseContracts.franchiseGroupId, franchiseGroupId))
        .orderBy(desc(franchiseContracts.createdAt));
    }
    return await db.select().from(franchiseContracts).orderBy(desc(franchiseContracts.createdAt));
  }

  async getFranchiseContractById(id: string): Promise<FranchiseContract | undefined> {
    const [contract] = await db.select().from(franchiseContracts).where(eq(franchiseContracts.id, id));
    return contract;
  }

  async updateFranchiseContract(id: string, data: Partial<InsertFranchiseContract>): Promise<FranchiseContract> {
    const [contract] = await db.update(franchiseContracts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(franchiseContracts.id, id))
      .returning();
    return contract;
  }

  async deleteFranchiseContract(id: string): Promise<void> {
    await db.delete(franchiseContracts).where(eq(franchiseContracts.id, id));
  }

  async createFranchiseKpi(data: InsertFranchiseKpi): Promise<FranchiseKpi> {
    const [kpi] = await db.insert(franchiseKpis).values(data).returning();
    return kpi;
  }

  async getFranchiseKpis(branchId: string, filters?: {month?: string}): Promise<FranchiseKpi[]> {
    const conditions = [eq(franchiseKpis.branchId, branchId)];
    if (filters?.month) {
      conditions.push(eq(franchiseKpis.month, filters.month));
    }
    return await db.select()
      .from(franchiseKpis)
      .where(and(...conditions))
      .orderBy(desc(franchiseKpis.createdAt));
  }

  async getFranchiseKpiById(id: string): Promise<FranchiseKpi | undefined> {
    const [kpi] = await db.select().from(franchiseKpis).where(eq(franchiseKpis.id, id));
    return kpi;
  }

  async updateFranchiseKpi(id: string, data: Partial<InsertFranchiseKpi>): Promise<FranchiseKpi> {
    const [kpi] = await db.update(franchiseKpis)
      .set(data)
      .where(eq(franchiseKpis.id, id))
      .returning();
    return kpi;
  }

  async createRevenueSharingRule(data: InsertRevenueSharingRule): Promise<RevenueSharingRule> {
    const [rule] = await db.insert(revenueSharingRules).values(data).returning();
    return rule;
  }

  async getRevenueSharingRules(franchiseGroupId: string): Promise<RevenueSharingRule[]> {
    return await db.select()
      .from(revenueSharingRules)
      .where(eq(revenueSharingRules.franchiseGroupId, franchiseGroupId))
      .orderBy(desc(revenueSharingRules.createdAt));
  }

  async getRevenueSharingRuleById(id: string): Promise<RevenueSharingRule | undefined> {
    const [rule] = await db.select().from(revenueSharingRules).where(eq(revenueSharingRules.id, id));
    return rule;
  }

  async updateRevenueSharingRule(id: string, data: Partial<InsertRevenueSharingRule>): Promise<RevenueSharingRule> {
    const [rule] = await db.update(revenueSharingRules)
      .set(data)
      .where(eq(revenueSharingRules.id, id))
      .returning();
    return rule;
  }

  async deleteRevenueSharingRule(id: string): Promise<void> {
    await db.delete(revenueSharingRules).where(eq(revenueSharingRules.id, id));
  }

  // Module 59: Globalization Layer
  async createLocale(data: InsertLocale): Promise<Locale> {
    const [locale] = await db.insert(locales).values(data).returning();
    return locale;
  }

  async getLocales(): Promise<Locale[]> {
    return await db.select().from(locales).orderBy(locales.name);
  }

  async getLocaleById(id: string): Promise<Locale | undefined> {
    const [locale] = await db.select().from(locales).where(eq(locales.id, id));
    return locale;
  }

  async updateLocale(id: string, data: Partial<InsertLocale>): Promise<Locale> {
    const [locale] = await db.update(locales)
      .set(data)
      .where(eq(locales.id, id))
      .returning();
    return locale;
  }

  async deleteLocale(id: string): Promise<void> {
    await db.delete(locales).where(eq(locales.id, id));
  }

  async createTranslationResource(data: InsertTranslationResource): Promise<TranslationResource> {
    const [resource] = await db.insert(translationResources).values(data).returning();
    return resource;
  }

  async getTranslationResources(localeId: string, filters?: {namespace?: string}): Promise<TranslationResource[]> {
    const conditions = [eq(translationResources.localeId, localeId)];
    if (filters?.namespace) {
      conditions.push(eq(translationResources.namespace, filters.namespace));
    }
    return await db.select()
      .from(translationResources)
      .where(and(...conditions))
      .orderBy(translationResources.translationKey);
  }

  async getTranslationResourceById(id: string): Promise<TranslationResource | undefined> {
    const [resource] = await db.select().from(translationResources).where(eq(translationResources.id, id));
    return resource;
  }

  async updateTranslationResource(id: string, data: Partial<InsertTranslationResource>): Promise<TranslationResource> {
    const [resource] = await db.update(translationResources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(translationResources.id, id))
      .returning();
    return resource;
  }

  async deleteTranslationResource(id: string): Promise<void> {
    await db.delete(translationResources).where(eq(translationResources.id, id));
  }

  async createCurrencyRate(data: InsertCurrencyRate): Promise<CurrencyRate> {
    const [rate] = await db.insert(currencyRates).values(data).returning();
    return rate;
  }

  async getCurrencyRates(fromCurrency?: string, toCurrency?: string): Promise<CurrencyRate[]> {
    const conditions = [];
    if (fromCurrency) {
      conditions.push(eq(currencyRates.fromCurrency, fromCurrency));
    }
    if (toCurrency) {
      conditions.push(eq(currencyRates.toCurrency, toCurrency));
    }
    if (conditions.length === 0) {
      return await db.select().from(currencyRates).orderBy(desc(currencyRates.effectiveDate));
    }
    return await db.select()
      .from(currencyRates)
      .where(and(...conditions))
      .orderBy(desc(currencyRates.effectiveDate));
  }

  async getLatestCurrencyRate(fromCurrency: string, toCurrency: string): Promise<CurrencyRate | undefined> {
    const [rate] = await db.select()
      .from(currencyRates)
      .where(and(
        eq(currencyRates.fromCurrency, fromCurrency),
        eq(currencyRates.toCurrency, toCurrency)
      ))
      .orderBy(desc(currencyRates.effectiveDate))
      .limit(1);
    return rate;
  }

  async createTaxRegion(data: InsertTaxRegion): Promise<TaxRegion> {
    const [region] = await db.insert(taxRegions).values(data).returning();
    return region;
  }

  async getTaxRegions(countryCode?: string): Promise<TaxRegion[]> {
    if (countryCode) {
      return await db.select()
        .from(taxRegions)
        .where(eq(taxRegions.countryCode, countryCode))
        .orderBy(taxRegions.regionName);
    }
    return await db.select().from(taxRegions).orderBy(taxRegions.countryCode, taxRegions.regionName);
  }

  async getTaxRegionById(id: string): Promise<TaxRegion | undefined> {
    const [region] = await db.select().from(taxRegions).where(eq(taxRegions.id, id));
    return region;
  }

  async updateTaxRegion(id: string, data: Partial<InsertTaxRegion>): Promise<TaxRegion> {
    const [region] = await db.update(taxRegions)
      .set(data)
      .where(eq(taxRegions.id, id))
      .returning();
    return region;
  }

  async deleteTaxRegion(id: string): Promise<void> {
    await db.delete(taxRegions).where(eq(taxRegions.id, id));
  }

  async createTimezoneRule(data: InsertTimezoneRule): Promise<TimezoneRule> {
    const [rule] = await db.insert(timezoneRules).values(data).returning();
    return rule;
  }

  async getTimezoneRules(branchId?: string): Promise<TimezoneRule[]> {
    if (branchId) {
      return await db.select()
        .from(timezoneRules)
        .where(eq(timezoneRules.branchId, branchId));
    }
    return await db.select().from(timezoneRules);
  }

  async getTimezoneRuleById(id: string): Promise<TimezoneRule | undefined> {
    const [rule] = await db.select().from(timezoneRules).where(eq(timezoneRules.id, id));
    return rule;
  }

  async updateTimezoneRule(id: string, data: Partial<InsertTimezoneRule>): Promise<TimezoneRule> {
    const [rule] = await db.update(timezoneRules)
      .set(data)
      .where(eq(timezoneRules.id, id))
      .returning();
    return rule;
  }

  // Module 60: Parts Supply Network
  async createNetworkPartner(data: InsertNetworkPartner): Promise<NetworkPartner> {
    const [partner] = await db.insert(networkPartners).values(data).returning();
    return partner;
  }

  async getNetworkPartners(filters?: {partnerType?: string, country?: string}): Promise<NetworkPartner[]> {
    const conditions = [];
    if (filters?.partnerType) {
      conditions.push(eq(networkPartners.partnerType, filters.partnerType));
    }
    if (filters?.country) {
      conditions.push(eq(networkPartners.country, filters.country));
    }
    if (conditions.length === 0) {
      return await db.select().from(networkPartners).orderBy(networkPartners.name);
    }
    return await db.select()
      .from(networkPartners)
      .where(and(...conditions))
      .orderBy(networkPartners.name);
  }

  async getNetworkPartnerById(id: string): Promise<NetworkPartner | undefined> {
    const [partner] = await db.select().from(networkPartners).where(eq(networkPartners.id, id));
    return partner;
  }

  async updateNetworkPartner(id: string, data: Partial<InsertNetworkPartner>): Promise<NetworkPartner> {
    const [partner] = await db.update(networkPartners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(networkPartners.id, id))
      .returning();
    return partner;
  }

  async deleteNetworkPartner(id: string): Promise<void> {
    await db.delete(networkPartners).where(eq(networkPartners.id, id));
  }

  async createFulfillmentOrder(data: InsertFulfillmentOrder): Promise<FulfillmentOrder> {
    const [order] = await db.insert(fulfillmentOrders).values(data).returning();
    return order;
  }

  async getFulfillmentOrders(filters?: {partnerId?: string, branchId?: string, status?: string}): Promise<FulfillmentOrder[]> {
    const conditions = [];
    if (filters?.partnerId) {
      conditions.push(eq(fulfillmentOrders.partnerId, filters.partnerId));
    }
    if (filters?.branchId) {
      conditions.push(eq(fulfillmentOrders.branchId, filters.branchId));
    }
    if (filters?.status) {
      conditions.push(eq(fulfillmentOrders.status, filters.status));
    }
    if (conditions.length === 0) {
      return await db.select().from(fulfillmentOrders).orderBy(desc(fulfillmentOrders.createdAt));
    }
    return await db.select()
      .from(fulfillmentOrders)
      .where(and(...conditions))
      .orderBy(desc(fulfillmentOrders.createdAt));
  }

  async getFulfillmentOrderById(id: string): Promise<FulfillmentOrder | undefined> {
    const [order] = await db.select().from(fulfillmentOrders).where(eq(fulfillmentOrders.id, id));
    return order;
  }

  async updateFulfillmentOrder(id: string, data: Partial<InsertFulfillmentOrder>): Promise<FulfillmentOrder> {
    const [order] = await db.update(fulfillmentOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fulfillmentOrders.id, id))
      .returning();
    return order;
  }

  async deleteFulfillmentOrder(id: string): Promise<void> {
    await db.delete(fulfillmentOrders).where(eq(fulfillmentOrders.id, id));
  }

  async createShipmentEvent(data: InsertShipmentEvent): Promise<ShipmentEvent> {
    const [event] = await db.insert(shipmentEvents).values(data).returning();
    return event;
  }

  async getShipmentEvents(fulfillmentOrderId: string): Promise<ShipmentEvent[]> {
    return await db.select()
      .from(shipmentEvents)
      .where(eq(shipmentEvents.fulfillmentOrderId, fulfillmentOrderId))
      .orderBy(desc(shipmentEvents.eventDate));
  }

  async createWarehouseNode(data: InsertWarehouseNode): Promise<WarehouseNode> {
    const [node] = await db.insert(warehouseNodes).values(data).returning();
    return node;
  }

  async getWarehouseNodes(partnerId?: string): Promise<WarehouseNode[]> {
    if (partnerId) {
      return await db.select()
        .from(warehouseNodes)
        .where(eq(warehouseNodes.partnerId, partnerId))
        .orderBy(warehouseNodes.name);
    }
    return await db.select().from(warehouseNodes).orderBy(warehouseNodes.name);
  }

  async getWarehouseNodeById(id: string): Promise<WarehouseNode | undefined> {
    const [node] = await db.select().from(warehouseNodes).where(eq(warehouseNodes.id, id));
    return node;
  }

  async updateWarehouseNode(id: string, data: Partial<InsertWarehouseNode>): Promise<WarehouseNode> {
    const [node] = await db.update(warehouseNodes)
      .set(data)
      .where(eq(warehouseNodes.id, id))
      .returning();
    return node;
  }

  async deleteWarehouseNode(id: string): Promise<void> {
    await db.delete(warehouseNodes).where(eq(warehouseNodes.id, id));
  }

  // Module 57: Diagnostics & OBD Hub
  async createObdDevice(data: InsertObdDevice): Promise<ObdDevice> {
    const [device] = await db.insert(obdDevices).values(data).returning();
    return device;
  }

  async getObdDevices(branchId?: string): Promise<ObdDevice[]> {
    if (branchId) {
      return await db.select()
        .from(obdDevices)
        .where(eq(obdDevices.branchId, branchId))
        .orderBy(obdDevices.deviceName);
    }
    return await db.select().from(obdDevices).orderBy(obdDevices.deviceName);
  }

  async getObdDeviceById(id: string): Promise<ObdDevice | undefined> {
    const [device] = await db.select().from(obdDevices).where(eq(obdDevices.id, id));
    return device;
  }

  async updateObdDevice(id: string, data: Partial<InsertObdDevice>): Promise<ObdDevice> {
    const [device] = await db.update(obdDevices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(obdDevices.id, id))
      .returning();
    return device;
  }

  async deleteObdDevice(id: string): Promise<void> {
    await db.delete(obdDevices).where(eq(obdDevices.id, id));
  }

  async createDeviceAssignment(data: InsertDeviceAssignment): Promise<DeviceAssignment> {
    const [assignment] = await db.insert(deviceAssignments).values(data).returning();
    return assignment;
  }

  async getDeviceAssignments(deviceId?: string, technicianId?: string): Promise<DeviceAssignment[]> {
    const conditions = [];
    if (deviceId) {
      conditions.push(eq(deviceAssignments.deviceId, deviceId));
    }
    if (technicianId) {
      conditions.push(eq(deviceAssignments.technicianId, technicianId));
    }
    if (conditions.length === 0) {
      return await db.select().from(deviceAssignments).orderBy(desc(deviceAssignments.assignedAt));
    }
    return await db.select()
      .from(deviceAssignments)
      .where(and(...conditions))
      .orderBy(desc(deviceAssignments.assignedAt));
  }

  async getDeviceAssignmentById(id: string): Promise<DeviceAssignment | undefined> {
    const [assignment] = await db.select().from(deviceAssignments).where(eq(deviceAssignments.id, id));
    return assignment;
  }

  async updateDeviceAssignment(id: string, data: Partial<InsertDeviceAssignment>): Promise<DeviceAssignment> {
    const [assignment] = await db.update(deviceAssignments)
      .set(data)
      .where(eq(deviceAssignments.id, id))
      .returning();
    return assignment;
  }

  async createObdSession(data: InsertObdSession): Promise<ObdSession> {
    const [session] = await db.insert(obdSessions).values(data).returning();
    return session;
  }

  async getObdSessions(filters?: {deviceId?: string, vehicleId?: string, status?: string}): Promise<ObdSession[]> {
    const conditions = [];
    if (filters?.deviceId) {
      conditions.push(eq(obdSessions.deviceId, filters.deviceId));
    }
    if (filters?.vehicleId) {
      conditions.push(eq(obdSessions.vehicleId, filters.vehicleId));
    }
    if (filters?.status) {
      conditions.push(eq(obdSessions.status, filters.status));
    }
    if (conditions.length === 0) {
      return await db.select().from(obdSessions).orderBy(desc(obdSessions.startTime));
    }
    return await db.select()
      .from(obdSessions)
      .where(and(...conditions))
      .orderBy(desc(obdSessions.startTime));
  }

  async getObdSessionById(id: string): Promise<ObdSession | undefined> {
    const [session] = await db.select().from(obdSessions).where(eq(obdSessions.id, id));
    return session;
  }

  async updateObdSession(id: string, data: Partial<InsertObdSession>): Promise<ObdSession> {
    const [session] = await db.update(obdSessions)
      .set(data)
      .where(eq(obdSessions.id, id))
      .returning();
    return session;
  }

  async createDiagnosticReport(data: InsertDiagnosticReport): Promise<DiagnosticReport> {
    const [report] = await db.insert(diagnosticReports).values(data).returning();
    return report;
  }

  async getDiagnosticReports(sessionId: string): Promise<DiagnosticReport[]> {
    return await db.select()
      .from(diagnosticReports)
      .where(eq(diagnosticReports.sessionId, sessionId))
      .orderBy(desc(diagnosticReports.generatedAt));
  }

  async getDiagnosticReportById(id: string): Promise<DiagnosticReport | undefined> {
    const [report] = await db.select().from(diagnosticReports).where(eq(diagnosticReports.id, id));
    return report;
  }

  // Module 58: OEM Software Subscriptions
  async createVendorCatalog(data: InsertVendorCatalog): Promise<VendorCatalog> {
    const [catalog] = await db.insert(vendorCatalogs).values(data).returning();
    return catalog;
  }

  async getVendorCatalogs(): Promise<VendorCatalog[]> {
    return await db.select().from(vendorCatalogs).orderBy(vendorCatalogs.vendorName);
  }

  async getVendorCatalogById(id: string): Promise<VendorCatalog | undefined> {
    const [catalog] = await db.select().from(vendorCatalogs).where(eq(vendorCatalogs.id, id));
    return catalog;
  }

  async updateVendorCatalog(id: string, data: Partial<InsertVendorCatalog>): Promise<VendorCatalog> {
    const [catalog] = await db.update(vendorCatalogs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vendorCatalogs.id, id))
      .returning();
    return catalog;
  }

  async deleteVendorCatalog(id: string): Promise<void> {
    await db.delete(vendorCatalogs).where(eq(vendorCatalogs.id, id));
  }

  async createOemProduct(data: InsertOemProduct): Promise<OemProduct> {
    const [product] = await db.insert(oemProducts).values(data).returning();
    return product;
  }

  async getOemProducts(vendorCatalogId?: string): Promise<OemProduct[]> {
    if (vendorCatalogId) {
      return await db.select()
        .from(oemProducts)
        .where(eq(oemProducts.vendorCatalogId, vendorCatalogId))
        .orderBy(oemProducts.productName);
    }
    return await db.select().from(oemProducts).orderBy(oemProducts.productName);
  }

  async getOemProductById(id: string): Promise<OemProduct | undefined> {
    const [product] = await db.select().from(oemProducts).where(eq(oemProducts.id, id));
    return product;
  }

  async updateOemProduct(id: string, data: Partial<InsertOemProduct>): Promise<OemProduct> {
    const [product] = await db.update(oemProducts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(oemProducts.id, id))
      .returning();
    return product;
  }

  async deleteOemProduct(id: string): Promise<void> {
    await db.delete(oemProducts).where(eq(oemProducts.id, id));
  }

  async createSubscriptionLicense(data: InsertSubscriptionLicense): Promise<SubscriptionLicense> {
    const [license] = await db.insert(subscriptionLicenses).values(data).returning();
    return license;
  }

  async getSubscriptionLicenses(branchId?: string, filters?: {status?: string}): Promise<SubscriptionLicense[]> {
    const conditions = [];
    if (branchId) {
      conditions.push(eq(subscriptionLicenses.branchId, branchId));
    }
    if (filters?.status) {
      conditions.push(eq(subscriptionLicenses.status, filters.status));
    }
    if (conditions.length === 0) {
      return await db.select().from(subscriptionLicenses).orderBy(desc(subscriptionLicenses.createdAt));
    }
    return await db.select()
      .from(subscriptionLicenses)
      .where(and(...conditions))
      .orderBy(desc(subscriptionLicenses.createdAt));
  }

  async getSubscriptionLicenseById(id: string): Promise<SubscriptionLicense | undefined> {
    const [license] = await db.select().from(subscriptionLicenses).where(eq(subscriptionLicenses.id, id));
    return license;
  }

  async updateSubscriptionLicense(id: string, data: Partial<InsertSubscriptionLicense>): Promise<SubscriptionLicense> {
    const [license] = await db.update(subscriptionLicenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptionLicenses.id, id))
      .returning();
    return license;
  }

  async deleteSubscriptionLicense(id: string): Promise<void> {
    await db.delete(subscriptionLicenses).where(eq(subscriptionLicenses.id, id));
  }

  async createLicenseAuditLog(data: InsertLicenseAuditLog): Promise<LicenseAuditLog> {
    const [log] = await db.insert(licenseAuditLogs).values(data).returning();
    return log;
  }

  async getLicenseAuditLogs(licenseId: string): Promise<LicenseAuditLog[]> {
    return await db.select()
      .from(licenseAuditLogs)
      .where(eq(licenseAuditLogs.licenseId, licenseId))
      .orderBy(desc(licenseAuditLogs.timestamp));
  }

  async createEntitlementAssignment(data: InsertEntitlementAssignment): Promise<EntitlementAssignment> {
    const [assignment] = await db.insert(entitlementAssignments).values(data).returning();
    return assignment;
  }

  async getEntitlementAssignments(licenseId?: string, userId?: string): Promise<EntitlementAssignment[]> {
    const conditions = [];
    if (licenseId) {
      conditions.push(eq(entitlementAssignments.licenseId, licenseId));
    }
    if (userId) {
      conditions.push(eq(entitlementAssignments.userId, userId));
    }
    if (conditions.length === 0) {
      return await db.select().from(entitlementAssignments).orderBy(desc(entitlementAssignments.createdAt));
    }
    return await db.select()
      .from(entitlementAssignments)
      .where(and(...conditions))
      .orderBy(desc(entitlementAssignments.createdAt));
  }

  async getEntitlementAssignmentById(id: string): Promise<EntitlementAssignment | undefined> {
    const [assignment] = await db.select().from(entitlementAssignments).where(eq(entitlementAssignments.id, id));
    return assignment;
  }

  async updateEntitlementAssignment(id: string, data: Partial<InsertEntitlementAssignment>): Promise<EntitlementAssignment> {
    const [assignment] = await db.update(entitlementAssignments)
      .set(data)
      .where(eq(entitlementAssignments.id, id))
      .returning();
    return assignment;
  }

  // Emerging Technologies Implementations
  
  // Blockchain Vehicle History
  async createBlockchainRecord(data: InsertBlockchainRecord): Promise<BlockchainRecord> {
    const [record] = await db.insert(blockchainRecords).values(data).returning();
    return record;
  }

  async getBlockchainRecords(vehicleId?: string, garageId?: string): Promise<BlockchainRecord[]> {
    const conditions = [];
    if (vehicleId) conditions.push(eq(blockchainRecords.vehicleId, vehicleId));
    if (garageId) conditions.push(eq(blockchainRecords.garageId, garageId));
    
    if (conditions.length === 0) {
      return await db.select().from(blockchainRecords).orderBy(desc(blockchainRecords.timestamp));
    }
    return await db.select().from(blockchainRecords).where(and(...conditions)).orderBy(desc(blockchainRecords.timestamp));
  }

  async getBlockchainRecord(id: string): Promise<BlockchainRecord | undefined> {
    const [record] = await db.select().from(blockchainRecords).where(eq(blockchainRecords.id, id));
    return record;
  }

  // AR Repair Guides
  async createArRepairGuide(data: InsertARRepairGuide): Promise<ARRepairGuide> {
    const [guide] = await db.insert(arRepairGuides).values(data).returning();
    return guide;
  }

  async getArRepairGuides(garageId?: string): Promise<ARRepairGuide[]> {
    if (garageId) {
      return await db.select().from(arRepairGuides).where(eq(arRepairGuides.garageId, garageId)).orderBy(desc(arRepairGuides.createdAt));
    }
    return await db.select().from(arRepairGuides).orderBy(desc(arRepairGuides.createdAt));
  }

  async getArRepairGuide(id: string): Promise<ARRepairGuide | undefined> {
    const [guide] = await db.select().from(arRepairGuides).where(eq(arRepairGuides.id, id));
    return guide;
  }

  async updateArRepairGuide(id: string, data: Partial<ARRepairGuide>): Promise<ARRepairGuide> {
    const [guide] = await db.update(arRepairGuides)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(arRepairGuides.id, id))
      .returning();
    return guide;
  }

  async createArGuideSession(data: InsertARGuideSession): Promise<ARGuideSession> {
    const [session] = await db.insert(arGuideSessions).values(data).returning();
    return session;
  }

  // IoT Sensor Integration
  async createIoTSensor(data: InsertIoTSensor): Promise<IoTSensor> {
    const [sensor] = await db.insert(iotSensors).values(data).returning();
    return sensor;
  }

  async getIoTSensors(vehicleId?: string): Promise<IoTSensor[]> {
    if (vehicleId) {
      return await db.select().from(iotSensors).where(eq(iotSensors.vehicleId, vehicleId));
    }
    return await db.select().from(iotSensors).orderBy(desc(iotSensors.createdAt));
  }

  async createIoTSensorReading(data: InsertIoTSensorReading): Promise<IoTSensorReading> {
    const [reading] = await db.insert(iotSensorReadings).values(data).returning();
    return reading;
  }

  async getIoTSensorReadings(sensorId?: string, vehicleId?: string): Promise<IoTSensorReading[]> {
    const conditions = [];
    if (sensorId) conditions.push(eq(iotSensorReadings.sensorId, sensorId));
    // The reading knows its sensor; the sensor knows its vehicle. vehicleId
    // was accepted and then silently dropped.
    if (vehicleId) {
      conditions.push(sql`EXISTS (SELECT 1 FROM ${iotSensors} WHERE ${iotSensors.id} = ${iotSensorReadings.sensorId} AND ${iotSensors.vehicleId} = ${vehicleId})`);
    }

    if (conditions.length === 0) {
      return await db.select().from(iotSensorReadings).orderBy(desc(iotSensorReadings.timestamp)).limit(500);
    }
    return await db.select().from(iotSensorReadings).where(and(...conditions)).orderBy(desc(iotSensorReadings.timestamp)).limit(500);
  }

  // 3D Parts Visualization
  async createParts3DModel(data: InsertParts3DModel): Promise<Parts3DModel> {
    const [model] = await db.insert(parts3DModels).values(data).returning();
    return model;
  }

  async getParts3DModels(garageId?: string): Promise<Parts3DModel[]> {
    // parts_3d_models is a global catalogue — it has no garage_id, so the
    // parameter cannot narrow anything. Kept for signature compatibility.
    void garageId;
    return await db.select().from(parts3DModels);
  }

  async getParts3DModel(id: string): Promise<Parts3DModel | undefined> {
    const [model] = await db.select().from(parts3DModels).where(eq(parts3DModels.id, id));
    return model;
  }

  // Drone Inspection Services
  async createDroneInspection(data: InsertDroneInspection): Promise<DroneInspection> {
    const [inspection] = await db.insert(droneInspections).values(data).returning();
    return inspection;
  }

  async getDroneInspections(garageId?: string, vehicleId?: string): Promise<DroneInspection[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(droneInspections.garageId, garageId));
    if (vehicleId) conditions.push(eq(droneInspections.vehicleId, vehicleId));
    
    // drone_inspections has scheduled_at/completed_at, not inspection_date.
    if (conditions.length === 0) {
      return await db.select().from(droneInspections).orderBy(desc(droneInspections.scheduledAt));
    }
    return await db.select().from(droneInspections).where(and(...conditions)).orderBy(desc(droneInspections.scheduledAt));
  }

  async getDroneInspection(id: string): Promise<DroneInspection | undefined> {
    const [inspection] = await db.select().from(droneInspections).where(eq(droneInspections.id, id));
    return inspection;
  }

  // AI Video Analysis
  async createAiVideoAnalysis(data: InsertAIVideoAnalysis): Promise<AIVideoAnalysis> {
    const [analysis] = await db.insert(aiVideoAnalysis).values(data).returning();
    return analysis;
  }

  async getAiVideoAnalyses(customerId?: string, vehicleId?: string): Promise<AIVideoAnalysis[]> {
    const conditions = [];
    if (customerId) conditions.push(eq(aiVideoAnalysis.customerId, customerId));
    if (vehicleId) conditions.push(eq(aiVideoAnalysis.vehicleId, vehicleId));
    
    if (conditions.length === 0) {
      return await db.select().from(aiVideoAnalysis).orderBy(desc(aiVideoAnalysis.uploadedAt));
    }
    return await db.select().from(aiVideoAnalysis).where(and(...conditions)).orderBy(desc(aiVideoAnalysis.uploadedAt));
  }

  async updateAiVideoAnalysis(id: string, data: Partial<AIVideoAnalysis>): Promise<AIVideoAnalysis> {
    const [analysis] = await db.update(aiVideoAnalysis)
      .set(data)
      .where(eq(aiVideoAnalysis.id, id))
      .returning();
    return analysis;
  }

  // Digital Twin Simulations
  async createDigitalTwin(data: InsertDigitalTwin): Promise<DigitalTwin> {
    const [twin] = await db.insert(digitalTwins).values(data).returning();
    return twin;
  }

  async getDigitalTwins(vehicleId?: string): Promise<DigitalTwin[]> {
    if (vehicleId) {
      return await db.select().from(digitalTwins).where(eq(digitalTwins.vehicleId, vehicleId));
    }
    return await db.select().from(digitalTwins).orderBy(desc(digitalTwins.lastSyncedAt));
  }

  async updateDigitalTwin(id: string, data: Partial<DigitalTwin>): Promise<DigitalTwin> {
    const [twin] = await db.update(digitalTwins)
      .set({ ...data, lastSyncedAt: new Date() })
      .where(eq(digitalTwins.id, id))
      .returning();
    return twin;
  }

  // ML Fraud Detection
  async createFraudDetectionCase(data: InsertFraudDetectionCase): Promise<FraudDetectionCase> {
    const [detectionCase] = await db.insert(fraudDetectionCases).values(data).returning();
    return detectionCase;
  }

  async getFraudDetectionCases(garageId?: string, riskLevel?: string): Promise<FraudDetectionCase[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(fraudDetectionCases.garageId, garageId));
    // fraud_detection_cases has no risk_level column; the closest
    // discriminator with those semantics is status.
    if (riskLevel) conditions.push(eq(fraudDetectionCases.status, riskLevel));
    
    if (conditions.length === 0) {
      return await db.select().from(fraudDetectionCases).orderBy(desc(fraudDetectionCases.detectedAt)).limit(100);
    }
    return await db.select().from(fraudDetectionCases).where(and(...conditions)).orderBy(desc(fraudDetectionCases.detectedAt)).limit(100);
  }

  // Biometric Authentication
  async createBiometricProfile(data: InsertBiometricProfile): Promise<BiometricProfile> {
    const [profile] = await db.insert(biometricProfiles).values(data).returning();
    return profile;
  }

  async getBiometricProfile(userId: string): Promise<BiometricProfile | undefined> {
    const [profile] = await db.select().from(biometricProfiles).where(eq(biometricProfiles.userId, userId));
    return profile;
  }

  async updateBiometricProfile(userId: string, data: Partial<BiometricProfile>): Promise<BiometricProfile> {
    const [profile] = await db.update(biometricProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(biometricProfiles.userId, userId))
      .returning();
    return profile;
  }

  // 5G Remote Collaboration
  async createCollaborationSession(data: InsertCollaborationSession): Promise<CollaborationSession> {
    const [session] = await db.insert(collaborationSessions).values(data).returning();
    return session;
  }

  async getCollaborationSessions(garageId?: string, status?: string): Promise<CollaborationSession[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(collaborationSessions.garageId, garageId));
    // Columns are session_status and started_at.
    if (status) conditions.push(eq(collaborationSessions.sessionStatus, status));

    if (conditions.length === 0) {
      return await db.select().from(collaborationSessions).orderBy(desc(collaborationSessions.startedAt));
    }
    return await db.select().from(collaborationSessions).where(and(...conditions)).orderBy(desc(collaborationSessions.startedAt));
  }

  async updateCollaborationSession(id: string, data: Partial<CollaborationSession>): Promise<CollaborationSession> {
    const [session] = await db.update(collaborationSessions)
      .set(data)
      .where(eq(collaborationSessions.id, id))
      .returning();
    return session;
  }

  // Edge Computing Diagnostics
  async createEdgeDevice(data: InsertEdgeDevice): Promise<EdgeDevice> {
    const [device] = await db.insert(edgeDevices).values(data).returning();
    return device;
  }

  async getEdgeDevices(garageId?: string): Promise<EdgeDevice[]> {
    if (garageId) {
      return await db.select().from(edgeDevices).where(eq(edgeDevices.garageId, garageId));
    }
    return await db.select().from(edgeDevices);
  }

  async createEdgeDiagnostic(data: InsertEdgeDiagnostic): Promise<EdgeDiagnostic> {
    const [diagnostic] = await db.insert(edgeDiagnostics).values(data).returning();
    return diagnostic;
  }

  async getEdgeDiagnostics(deviceId?: string, vehicleId?: string): Promise<EdgeDiagnostic[]> {
    const conditions = [];
    if (deviceId) conditions.push(eq(edgeDiagnostics.deviceId, deviceId));
    if (vehicleId) conditions.push(eq(edgeDiagnostics.vehicleId, vehicleId));
    
    // edge_diagnostics has no diagnosed_at; created_at is the event time.
    if (conditions.length === 0) {
      return await db.select().from(edgeDiagnostics).orderBy(desc(edgeDiagnostics.createdAt)).limit(500);
    }
    return await db.select().from(edgeDiagnostics).where(and(...conditions)).orderBy(desc(edgeDiagnostics.createdAt)).limit(500);
  }

  // Quantum-Inspired Pricing
  async createPricingOptimization(data: InsertPricingOptimization): Promise<PricingOptimization> {
    const [pricing] = await db.insert(pricingOptimization).values(data).returning();
    return pricing;
  }

  async getPricingOptimizations(garageId: string, serviceType?: string): Promise<PricingOptimization[]> {
    // pricing_optimization keys services by service_id and orders by
    // created_at; there is no service_type or calculated_at.
    if (serviceType) {
      return await db.select()
        .from(pricingOptimization)
        .where(and(eq(pricingOptimization.garageId, garageId), eq(pricingOptimization.serviceId, serviceType)))
        .orderBy(desc(pricingOptimization.createdAt));
    }
    return await db.select()
      .from(pricingOptimization)
      .where(eq(pricingOptimization.garageId, garageId))
      .orderBy(desc(pricingOptimization.createdAt));
  }

  async updatePricingOptimization(id: string, data: Partial<PricingOptimization>): Promise<PricingOptimization> {
    const [pricing] = await db.update(pricingOptimization)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pricingOptimization.id, id))
      .returning();
    return pricing;
  }

  // Supporting tables for emerging technologies
  async createIotAlert(data: any): Promise<any> {
    const [alert] = await db.insert(iotAlerts).values(data).returning();
    return alert;
  }

  // getIotAlerts canonical implementation at line ~10321

  async createDroneMedia(data: any): Promise<any> {
    const [media] = await db.insert(droneMedia).values(data).returning();
    return media;
  }

  async getDroneMedia(inspectionId: string): Promise<any[]> {
    return await db.select().from(droneMedia).where(eq(droneMedia.inspectionId, inspectionId));
  }

  async createTwinSimulation(data: any): Promise<any> {
    const [simulation] = await db.insert(twinSimulations).values(data).returning();
    return simulation;
  }

  async getTwinSimulations(twinId: string): Promise<any[]> {
    // twin_simulations has no simulated_at; created_at is the run time.
    return await db.select().from(twinSimulations).where(eq(twinSimulations.twinId, twinId)).orderBy(desc(twinSimulations.createdAt));
  }

  async createCollaborationExpert(data: any): Promise<any> {
    const [expert] = await db.insert(collaborationExperts).values(data).returning();
    return expert;
  }

  async getCollaborationExperts(): Promise<any[]> {
    return await db.select().from(collaborationExperts);
  }

  async createPricingRule(data: any): Promise<any> {
    const [rule] = await db.insert(pricingRules).values(data).returning();
    return rule;
  }

  async getPricingRules(garageId?: string): Promise<any[]> {
    if (garageId) {
      return await db.select().from(pricingRules).where(eq(pricingRules.garageId, garageId));
    }
    return await db.select().from(pricingRules);
  }

  async createBiometricLog(data: any): Promise<any> {
    const [log] = await db.insert(biometricLogs).values(data).returning();
    return log;
  }

  async getBiometricLogs(userId: string): Promise<any[]> {
    // biometric_logs points at the biometric profile, and the profile is
    // what carries user_id.
    return await db.select().from(biometricLogs)
      .where(sql`EXISTS (SELECT 1 FROM ${biometricProfiles} WHERE ${biometricProfiles.id} = ${biometricLogs.profileId} AND ${biometricProfiles.userId} = ${userId})`)
      .orderBy(desc(biometricLogs.timestamp)).limit(100);
  }

  async createFraudDetectionRule(data: any): Promise<any> {
    const [rule] = await db.insert(fraudDetectionRules).values(data).returning();
    return rule;
  }

  async getFraudDetectionRules(garageId?: string): Promise<any[]> {
    // fraud_detection_rules is a global rule set — no garage_id column.
    void garageId;
    return await db.select().from(fraudDetectionRules).orderBy(fraudDetectionRules.ruleName);
  }
  
  // Neural Network Diagnostics
  async getNeuralDiagnostics(garageId: string): Promise<NeuralDiagnostic[]> {
    return await db.select().from(neuralDiagnostics).where(eq(neuralDiagnostics.garageId, garageId)).orderBy(desc(neuralDiagnostics.createdAt));
  }
  
  async createNeuralDiagnostic(data: InsertNeuralDiagnostic): Promise<NeuralDiagnostic> {
    const [record] = await db.insert(neuralDiagnostics).values(data).returning();
    return record;
  }
  
  async getNeuralTrainingSessions(garageId: string): Promise<NeuralTrainingSession[]> {
    return await db.select().from(neuralTrainingSessions).where(eq(neuralTrainingSessions.garageId, garageId)).orderBy(desc(neuralTrainingSessions.createdAt));
  }
  
  async createNeuralTrainingSession(data: InsertNeuralTrainingSession): Promise<NeuralTrainingSession> {
    const [record] = await db.insert(neuralTrainingSessions).values(data).returning();
    return record;
  }
  
  // Computer Vision QC
  async getVisionQualityChecks(garageId: string): Promise<VisionQualityCheck[]> {
    return await db.select().from(visionQualityChecks).where(eq(visionQualityChecks.garageId, garageId)).orderBy(desc(visionQualityChecks.createdAt));
  }
  
  async createVisionQualityCheck(data: InsertVisionQualityCheck): Promise<VisionQualityCheck> {
    const [record] = await db.insert(visionQualityChecks).values(data).returning();
    return record;
  }
  
  async getVisionDefects(garageId: string): Promise<VisionDefect[]> {
    // visionDefects has no garage_id; the garage lives on the parent row.
    return await db.select().from(visionDefects)
      .where(sql`EXISTS (SELECT 1 FROM ${visionQualityChecks} WHERE ${visionQualityChecks.id} = ${visionDefects.qualityCheckId} AND ${visionQualityChecks.garageId} = ${garageId})`)
      .orderBy(desc(visionDefects.createdAt));
  }
  
  async createVisionDefect(data: InsertVisionDefect): Promise<VisionDefect> {
    const [record] = await db.insert(visionDefects).values(data).returning();
    return record;
  }
  
  // NLP Service Writer
  async getNLPServiceRequests(garageId: string): Promise<NLPServiceRequest[]> {
    return await db.select().from(nlpServiceRequests).where(eq(nlpServiceRequests.garageId, garageId)).orderBy(desc(nlpServiceRequests.createdAt));
  }
  
  async createNLPServiceRequest(data: InsertNLPServiceRequest): Promise<NLPServiceRequest> {
    const [record] = await db.insert(nlpServiceRequests).values(data).returning();
    return record;
  }
  
  async getNLPTrainingData(garageId: string): Promise<NLPTrainingData[]> {
    return await db.select().from(nlpTrainingData).where(eq(nlpTrainingData.garageId, garageId)).orderBy(desc(nlpTrainingData.createdAt));
  }
  
  async createNLPTrainingData(data: InsertNLPTrainingData): Promise<NLPTrainingData> {
    const [record] = await db.insert(nlpTrainingData).values(data).returning();
    return record;
  }
  
  // RL Parts Optimizer
  async getRLPartsOptimizations(garageId: string): Promise<RLPartsOptimization[]> {
    return await db.select().from(rlPartsOptimizations).where(eq(rlPartsOptimizations.garageId, garageId)).orderBy(desc(rlPartsOptimizations.createdAt));
  }
  
  async createRLPartsOptimization(data: InsertRLPartsOptimization): Promise<RLPartsOptimization> {
    const [record] = await db.insert(rlPartsOptimizations).values(data).returning();
    return record;
  }
  
  async getRLLearningEpisodes(garageId: string): Promise<RLLearningEpisode[]> {
    return await db.select().from(rlLearningEpisodes).where(eq(rlLearningEpisodes.garageId, garageId)).orderBy(desc(rlLearningEpisodes.createdAt));
  }
  
  async createRLLearningEpisode(data: InsertRLLearningEpisode): Promise<RLLearningEpisode> {
    const [record] = await db.insert(rlLearningEpisodes).values(data).returning();
    return record;
  }
  
  // Metaverse Showroom
  async getMetaverseShowrooms(garageId: string): Promise<MetaverseShowroom[]> {
    return await db.select().from(metaverseShowrooms).where(eq(metaverseShowrooms.garageId, garageId)).orderBy(desc(metaverseShowrooms.createdAt));
  }
  
  async createMetaverseShowroom(data: InsertMetaverseShowroom): Promise<MetaverseShowroom> {
    const [record] = await db.insert(metaverseShowrooms).values(data).returning();
    return record;
  }
  
  async getMetaverseVisits(garageId: string): Promise<MetaverseVisit[]> {
    // metaverseVisits has no garage_id; the garage lives on the parent row.
    return await db.select().from(metaverseVisits)
      .where(sql`EXISTS (SELECT 1 FROM ${metaverseShowrooms} WHERE ${metaverseShowrooms.id} = ${metaverseVisits.showroomId} AND ${metaverseShowrooms.garageId} = ${garageId})`)
      .orderBy(desc(metaverseVisits.createdAt));
  }
  
  async createMetaverseVisit(data: InsertMetaverseVisit): Promise<MetaverseVisit> {
    const [record] = await db.insert(metaverseVisits).values(data).returning();
    return record;
  }
  
  // Holographic Guides
  async getHolographicGuides(garageId: string): Promise<HolographicGuide[]> {
    return await db.select().from(holographicGuides).where(eq(holographicGuides.garageId, garageId)).orderBy(desc(holographicGuides.createdAt));
  }
  
  async createHolographicGuide(data: InsertHolographicGuide): Promise<HolographicGuide> {
    const [record] = await db.insert(holographicGuides).values(data).returning();
    return record;
  }
  
  async getHolographicSessions(garageId: string): Promise<HolographicSession[]> {
    // holographicSessions has no garage_id; the garage lives on the parent row.
    return await db.select().from(holographicSessions)
      .where(sql`EXISTS (SELECT 1 FROM ${holographicGuides} WHERE ${holographicGuides.id} = ${holographicSessions.guideId} AND ${holographicGuides.garageId} = ${garageId})`)
      .orderBy(desc(holographicSessions.createdAt));
  }
  
  async createHolographicSession(data: InsertHolographicSession): Promise<HolographicSession> {
    const [record] = await db.insert(holographicSessions).values(data).returning();
    return record;
  }
  
  // Spatial Computing
  async getSpatialWorkstations(garageId: string): Promise<SpatialWorkstation[]> {
    return await db.select().from(spatialWorkstations).where(eq(spatialWorkstations.garageId, garageId)).orderBy(desc(spatialWorkstations.createdAt));
  }
  
  async createSpatialWorkstation(data: InsertSpatialWorkstation): Promise<SpatialWorkstation> {
    const [record] = await db.insert(spatialWorkstations).values(data).returning();
    return record;
  }
  
  async getSpatialDiagnosticSessions(garageId: string): Promise<SpatialDiagnosticSession[]> {
    // spatialDiagnosticSessions has no garage_id; the garage lives on the parent row.
    return await db.select().from(spatialDiagnosticSessions)
      .where(sql`EXISTS (SELECT 1 FROM ${spatialWorkstations} WHERE ${spatialWorkstations.id} = ${spatialDiagnosticSessions.workstationId} AND ${spatialWorkstations.garageId} = ${garageId})`)
      .orderBy(desc(spatialDiagnosticSessions.createdAt));
  }
  
  async createSpatialDiagnosticSession(data: InsertSpatialDiagnosticSession): Promise<SpatialDiagnosticSession> {
    const [record] = await db.insert(spatialDiagnosticSessions).values(data).returning();
    return record;
  }
  
  // Autonomous Robots
  async getAutonomousRobots(garageId: string): Promise<AutonomousRobot[]> {
    return await db.select().from(autonomousRobots).where(eq(autonomousRobots.garageId, garageId)).orderBy(desc(autonomousRobots.createdAt));
  }
  
  async createAutonomousRobot(data: InsertAutonomousRobot): Promise<AutonomousRobot> {
    const [record] = await db.insert(autonomousRobots).values(data).returning();
    return record;
  }
  
  async getRobotTasks(garageId: string): Promise<RobotTask[]> {
    // robotTasks has no garage_id; the garage lives on the parent row.
    return await db.select().from(robotTasks)
      .where(sql`EXISTS (SELECT 1 FROM ${autonomousRobots} WHERE ${autonomousRobots.id} = ${robotTasks.robotId} AND ${autonomousRobots.garageId} = ${garageId})`)
      .orderBy(desc(robotTasks.createdAt));
  }
  
  async createRobotTask(data: InsertRobotTask): Promise<RobotTask> {
    const [record] = await db.insert(robotTasks).values(data).returning();
    return record;
  }
  
  // Drone Fleet
  async getDroneFleets(garageId: string): Promise<DroneFleet[]> {
    return await db.select().from(droneFleets).where(eq(droneFleets.garageId, garageId)).orderBy(desc(droneFleets.createdAt));
  }
  
  async createDroneFleet(data: InsertDroneFleet): Promise<DroneFleet> {
    const [record] = await db.insert(droneFleets).values(data).returning();
    return record;
  }
  
  async getDroneMissions(garageId: string): Promise<DroneMission[]> {
    // droneMissions has no garage_id; the garage lives on the parent row.
    return await db.select().from(droneMissions)
      .where(sql`EXISTS (SELECT 1 FROM ${droneFleets} WHERE ${droneFleets.id} = ${droneMissions.droneId} AND ${droneFleets.garageId} = ${garageId})`)
      .orderBy(desc(droneMissions.createdAt));
  }
  
  async createDroneMission(data: InsertDroneMission): Promise<DroneMission> {
    const [record] = await db.insert(droneMissions).values(data).returning();
    return record;
  }
  
  // Smart Contracts
  async getSmartContracts(garageId: string): Promise<SmartContract[]> {
    return await db.select().from(smartContracts).where(eq(smartContracts.garageId, garageId)).orderBy(desc(smartContracts.createdAt));
  }
  
  async createSmartContract(data: InsertSmartContract): Promise<SmartContract> {
    const [record] = await db.insert(smartContracts).values(data).returning();
    return record;
  }
  
  async getContractEvents(garageId: string): Promise<ContractEvent[]> {
    // contractEvents has no garage_id; the garage lives on the parent row.
    return await db.select().from(contractEvents)
      .where(sql`EXISTS (SELECT 1 FROM ${smartContracts} WHERE ${smartContracts.id} = ${contractEvents.contractId} AND ${smartContracts.garageId} = ${garageId})`)
      .orderBy(desc(contractEvents.createdAt));
  }
  
  async createContractEvent(data: InsertContractEvent): Promise<ContractEvent> {
    const [record] = await db.insert(contractEvents).values(data).returning();
    return record;
  }
  
  // Carbon Credits
  async getCarbonCredits(garageId: string): Promise<CarbonCredit[]> {
    return await db.select().from(carbonCredits).where(eq(carbonCredits.garageId, garageId)).orderBy(desc(carbonCredits.createdAt));
  }
  
  async createCarbonCredit(data: InsertCarbonCredit): Promise<CarbonCredit> {
    const [record] = await db.insert(carbonCredits).values(data).returning();
    return record;
  }
  
  async getCarbonEmissions(garageId: string): Promise<CarbonEmission[]> {
    return await db.select().from(carbonEmissions).where(eq(carbonEmissions.garageId, garageId)).orderBy(desc(carbonEmissions.createdAt));
  }
  
  async createCarbonEmission(data: InsertCarbonEmission): Promise<CarbonEmission> {
    const [record] = await db.insert(carbonEmissions).values(data).returning();
    return record;
  }
  
  // Green Energy
  async getGreenEnergyAssets(garageId: string): Promise<GreenEnergyAsset[]> {
    return await db.select().from(greenEnergyAssets).where(eq(greenEnergyAssets.garageId, garageId)).orderBy(desc(greenEnergyAssets.createdAt));
  }
  
  async createGreenEnergyAsset(data: InsertGreenEnergyAsset): Promise<GreenEnergyAsset> {
    const [record] = await db.insert(greenEnergyAssets).values(data).returning();
    return record;
  }
  
  async getEVChargingStations(garageId: string): Promise<EVChargingStation[]> {
    return await db.select().from(evChargingStations).where(eq(evChargingStations.garageId, garageId)).orderBy(desc(evChargingStations.createdAt));
  }
  
  async createEVChargingStation(data: InsertEVChargingStation): Promise<EVChargingStation> {
    const [record] = await db.insert(evChargingStations).values(data).returning();
    return record;
  }
  
  // Circular Economy
  async getRecycledParts(garageId: string): Promise<RecycledPart[]> {
    return await db.select().from(recycledParts).where(eq(recycledParts.garageId, garageId)).orderBy(desc(recycledParts.createdAt));
  }
  
  async createRecycledPart(data: InsertRecycledPart): Promise<RecycledPart> {
    const [record] = await db.insert(recycledParts).values(data).returning();
    return record;
  }
  
  async getSustainabilityMetrics(garageId: string): Promise<SustainabilityMetric[]> {
    return await db.select().from(sustainabilityMetrics).where(eq(sustainabilityMetrics.garageId, garageId)).orderBy(desc(sustainabilityMetrics.createdAt));
  }
  
  async createSustainabilityMetric(data: InsertSustainabilityMetric): Promise<SustainabilityMetric> {
    const [record] = await db.insert(sustainabilityMetrics).values(data).returning();
    return record;
  }
  
  // Satellite
  async getSatelliteConnections(garageId: string): Promise<SatelliteConnection[]> {
    return await db.select().from(satelliteConnections).where(eq(satelliteConnections.garageId, garageId)).orderBy(desc(satelliteConnections.createdAt));
  }
  
  async createSatelliteConnection(data: InsertSatelliteConnection): Promise<SatelliteConnection> {
    const [record] = await db.insert(satelliteConnections).values(data).returning();
    return record;
  }
  
  async getSatelliteUsageLogs(garageId: string): Promise<SatelliteUsageLog[]> {
    // satelliteUsageLogs has no garage_id; the garage lives on the parent row.
    return await db.select().from(satelliteUsageLogs)
      .where(sql`EXISTS (SELECT 1 FROM ${satelliteConnections} WHERE ${satelliteConnections.id} = ${satelliteUsageLogs.connectionId} AND ${satelliteConnections.garageId} = ${garageId})`)
      .orderBy(desc(satelliteUsageLogs.createdAt));
  }
  
  async createSatelliteUsageLog(data: InsertSatelliteUsageLog): Promise<SatelliteUsageLog> {
    const [record] = await db.insert(satelliteUsageLogs).values(data).returning();
    return record;
  }
  
  // Quantum Encryption
  async getQuantumEncryptionKeys(garageId: string): Promise<QuantumEncryptionKey[]> {
    return await db.select().from(quantumEncryptionKeys).where(eq(quantumEncryptionKeys.garageId, garageId)).orderBy(desc(quantumEncryptionKeys.createdAt));
  }
  
  async createQuantumEncryptionKey(data: InsertQuantumEncryptionKey): Promise<QuantumEncryptionKey> {
    const [record] = await db.insert(quantumEncryptionKeys).values(data).returning();
    return record;
  }
  
  async getQuantumSecureMessages(garageId: string): Promise<QuantumSecureMessage[]> {
    return await db.select().from(quantumSecureMessages).where(eq(quantumSecureMessages.garageId, garageId)).orderBy(desc(quantumSecureMessages.createdAt));
  }
  
  async createQuantumSecureMessage(data: InsertQuantumSecureMessage): Promise<QuantumSecureMessage> {
    const [record] = await db.insert(quantumSecureMessages).values(data).returning();
    return record;
  }

  // IoT Vehicle Health Monitoring Implementation
  async getIotSensors(vehicleId?: string, status?: string): Promise<any[]> {
    const conditions = [];
    
    if (vehicleId) {
      conditions.push(eq(iotSensors.vehicleId, vehicleId));
    }
    if (status) {
      conditions.push(eq(iotSensors.status, status));
    }
    
    const query = conditions.length > 0
      ? db.select().from(iotSensors).where(and(...conditions))
      : db.select().from(iotSensors);
    
    return await query.orderBy(desc(iotSensors.lastCommunication));
  }

  async getIotSensor(id: string): Promise<any | undefined> {
    const [sensor] = await db.select().from(iotSensors).where(eq(iotSensors.id, id));
    return sensor;
  }

  async createIotSensor(data: any): Promise<any> {
    const [sensor] = await db.insert(iotSensors).values(data).returning();
    await db.update(iotSensors).set({ lastCommunication: new Date() }).where(eq(iotSensors.id, sensor.id));
    return sensor;
  }

  async updateIotSensor(id: string, data: any): Promise<any> {
    const [sensor] = await db.update(iotSensors).set({ ...data, updatedAt: new Date() }).where(eq(iotSensors.id, id)).returning();
    return sensor;
  }

  async deleteIotSensor(id: string): Promise<void> {
    await db.delete(iotSensors).where(eq(iotSensors.id, id));
  }

  async recordSensorReading(data: any): Promise<any> {
    const [reading] = await db.insert(iotSensorReadings).values({
      ...data,
      timestamp: new Date(),
    }).returning();

    // Update sensor last communication
    await db.update(iotSensors).set({ lastCommunication: new Date() }).where(eq(iotSensors.id, data.sensorId));

    // Process alert rules
    if (data.value !== null && data.value !== undefined) {
      await this.processAlertRules(data.sensorId, parseFloat(data.value));
    }

    return reading;
  }

  async getSensorReadings(sensorId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    // A second .where() on the same builder replaces the first rather than
    // adding to it, so the date range has to join the condition list.
    const conditions = [eq(iotSensorReadings.sensorId, sensorId)];
    if (startDate && endDate) {
      conditions.push(gte(iotSensorReadings.timestamp, startDate));
      conditions.push(lte(iotSensorReadings.timestamp, endDate));
    }

    return await db.select().from(iotSensorReadings)
      .where(and(...conditions))
      .orderBy(desc(iotSensorReadings.timestamp))
      .limit(1000);
  }

  async getRecentAnomalies(vehicleId: string, limit: number = 10): Promise<any[]> {
    // iot_sensor_readings has no vehicle_id; the sensor is what is fitted to
    // the vehicle, so the filter goes through iot_sensors.
    return await db.select()
      .from(iotSensorReadings)
      .where(and(
        sql`EXISTS (SELECT 1 FROM ${iotSensors} WHERE ${iotSensors.id} = ${iotSensorReadings.sensorId} AND ${iotSensors.vehicleId} = ${vehicleId})`,
        eq(iotSensorReadings.isAbnormal, true)
      ))
      .orderBy(desc(iotSensorReadings.timestamp))
      .limit(limit);
  }

  async getIotAlerts(vehicleId?: string, status?: string, severity?: string): Promise<any[]> {
    let conditions = [];
    
    if (vehicleId) {
      conditions.push(eq(iotAlerts.vehicleId, vehicleId));
    }
    if (status) {
      conditions.push(eq(iotAlerts.status, status));
    }
    if (severity) {
      conditions.push(eq(iotAlerts.severity, severity));
    }
    
    const query = conditions.length > 0 
      ? db.select().from(iotAlerts).where(and(...conditions))
      : db.select().from(iotAlerts);
    
    return await query.orderBy(desc(iotAlerts.createdAt));
  }

  async getIotAlert(id: string): Promise<any | undefined> {
    const [alert] = await db.select().from(iotAlerts).where(eq(iotAlerts.id, id));
    return alert;
  }

  async acknowledgeIotAlert(id: string, userId: string): Promise<any> {
    const [alert] = await db.update(iotAlerts).set({
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    }).where(eq(iotAlerts.id, id)).returning();
    return alert;
  }

  async resolveIotAlert(id: string, userId: string, resolution: string, jobCardId?: string): Promise<any> {
    const updateData: any = {
      status: 'resolved',
      resolvedBy: userId,
      resolvedAt: new Date(),
      recommendedAction: resolution,
    };
    
    if (jobCardId) {
      updateData.jobCardId = jobCardId;
    }
    
    const [alert] = await db.update(iotAlerts).set(updateData).where(eq(iotAlerts.id, id)).returning();
    return alert;
  }

  async processAlertRules(sensorId: string, readingValue: number): Promise<any[]> {
    const sensor = await this.getIotSensor(sensorId);
    if (!sensor) return [];

    // Get all active alert rules for this sensor type (placeholder - needs alert rules table)
    // For now, use basic threshold logic
    const alerts: any[] = [];
    
    // Check if reading is abnormal (placeholder logic)
    if (readingValue > 100 || readingValue < 0) {
      const [alert] = await db.insert(iotAlerts).values({
        sensorId: sensor.id,
        vehicleId: sensor.vehicleId,
        alertType: sensor.sensorType,
        severity: readingValue > 120 ? 'critical' : 'high',
        message: `${sensor.sensorType} reading of ${readingValue} exceeds normal range`,
        // trigger_value is a decimal column, so it takes a string.
        triggerValue: readingValue.toString(),
        status: 'active',
      }).returning();
      
      alerts.push(alert);
    }
    
    return alerts;
  }

  // Fleet Tracking & GPS Management
  async recordVehicleLocation(data: any): Promise<any> {
    const [location] = await db.insert(vehicleLocationHistory).values(data).returning();
    return location;
  }

  async getVehicleLocationHistory(vehicleId: string, startDate?: Date, endDate?: Date, limit: number = 100): Promise<any[]> {
    const conditions = [eq(vehicleLocationHistory.vehicleId, vehicleId)];
    
    if (startDate) {
      conditions.push(gte(vehicleLocationHistory.timestamp, startDate));
    }
    if (endDate) {
      conditions.push(lte(vehicleLocationHistory.timestamp, endDate));
    }
    
    return await db.select()
      .from(vehicleLocationHistory)
      .where(and(...conditions))
      .orderBy(desc(vehicleLocationHistory.timestamp))
      .limit(limit);
  }

  async getLatestVehicleLocation(vehicleId: string): Promise<any | undefined> {
    const [location] = await db.select()
      .from(vehicleLocationHistory)
      .where(eq(vehicleLocationHistory.vehicleId, vehicleId))
      .orderBy(desc(vehicleLocationHistory.timestamp))
      .limit(1);
    return location;
  }

  async getGeofenceZones(garageId: string): Promise<any[]> {
    return await db.select()
      .from(geofenceZones)
      .where(and(
        eq(geofenceZones.garageId, garageId),
        eq(geofenceZones.isActive, true)
      ))
      .orderBy(desc(geofenceZones.createdAt));
  }

  async getGeofenceZone(id: string): Promise<any | undefined> {
    const [zone] = await db.select().from(geofenceZones).where(eq(geofenceZones.id, id));
    return zone;
  }

  async createGeofenceZone(data: any): Promise<any> {
    const [zone] = await db.insert(geofenceZones).values(data).returning();
    return zone;
  }

  async updateGeofenceZone(id: string, data: any): Promise<any> {
    const [zone] = await db.update(geofenceZones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(geofenceZones.id, id))
      .returning();
    return zone;
  }

  async deleteGeofenceZone(id: string): Promise<void> {
    await db.delete(geofenceZones).where(eq(geofenceZones.id, id));
  }

  async recordGeofenceEvent(data: any): Promise<any> {
    const [event] = await db.insert(geofenceEvents).values(data).returning();
    return event;
  }

  async getGeofenceEvents(zoneId?: string, vehicleId?: string, startDate?: Date, limit: number = 100): Promise<any[]> {
    const conditions = [];
    
    if (zoneId) {
      conditions.push(eq(geofenceEvents.geofenceZoneId, zoneId));
    }
    if (vehicleId) {
      conditions.push(eq(geofenceEvents.vehicleId, vehicleId));
    }
    if (startDate) {
      conditions.push(gte(geofenceEvents.timestamp, startDate));
    }
    
    const query = conditions.length > 0
      ? db.select().from(geofenceEvents).where(and(...conditions))
      : db.select().from(geofenceEvents);
    
    return await query.orderBy(desc(geofenceEvents.timestamp)).limit(limit);
  }

  async getFleetRoutes(garageId: string, status?: string): Promise<any[]> {
    const conditions = [eq(fleetRoutes.garageId, garageId)];
    
    if (status) {
      conditions.push(eq(fleetRoutes.status, status));
    }
    
    return await db.select()
      .from(fleetRoutes)
      .where(and(...conditions))
      .orderBy(desc(fleetRoutes.createdAt));
  }

  async getFleetRoute(id: string): Promise<any | undefined> {
    const [route] = await db.select().from(fleetRoutes).where(eq(fleetRoutes.id, id));
    return route;
  }

  async createFleetRoute(data: any): Promise<any> {
    const [route] = await db.insert(fleetRoutes).values(data).returning();
    return route;
  }

  async updateFleetRoute(id: string, data: any): Promise<any> {
    const [route] = await db.update(fleetRoutes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fleetRoutes.id, id))
      .returning();
    return route;
  }

  async getRouteCheckpoints(routeId: string): Promise<any[]> {
    return await db.select()
      .from(routeCheckpoints)
      .where(eq(routeCheckpoints.routeId, routeId))
      .orderBy(routeCheckpoints.sequenceNumber);
  }

  async createRouteCheckpoint(data: any): Promise<any> {
    const [checkpoint] = await db.insert(routeCheckpoints).values(data).returning();
    return checkpoint;
  }

  async updateRouteCheckpoint(id: string, data: any): Promise<any> {
    const [checkpoint] = await db.update(routeCheckpoints)
      .set(data)
      .where(eq(routeCheckpoints.id, id))
      .returning();
    return checkpoint;
  }

  // ========================================
  // TECHNICIAN PERFORMANCE METHODS
  // ========================================
  
  async getTechnicianMetricDefinitions(): Promise<any[]> {
    return await db.select().from(technicianMetricDefinitions)
      .where(eq(technicianMetricDefinitions.isActive, true));
  }

  async getTechnicianMetricPreferences(userId: string): Promise<any[]> {
    return await db.select().from(technicianMetricPreferences)
      .where(eq(technicianMetricPreferences.userId, userId))
      .orderBy(technicianMetricPreferences.sortOrder);
  }

  async upsertTechnicianMetricPreference(data: any): Promise<any> {
    const [preference] = await db.insert(technicianMetricPreferences)
      .values(data)
      .onConflictDoUpdate({
        target: [technicianMetricPreferences.userId, technicianMetricPreferences.metricKey],
        set: data
      })
      .returning();
    return preference;
  }

  async getTechnicianPerformanceRollups(technicianId: string, period: string): Promise<any[]> {
    return await db.select().from(technicianPerformanceRollups)
      .where(and(
        eq(technicianPerformanceRollups.technicianId, technicianId),
        eq(technicianPerformanceRollups.intervalType, period)
      ))
      .orderBy(desc(technicianPerformanceRollups.intervalStart))
      .limit(30);
  }

  // ========================================
  // CUSTOMER FEEDBACK METHODS
  // ========================================
  
  async createServiceFeedback(data: any): Promise<any> {
    const [feedback] = await db.insert(serviceFeedback).values(data).returning();
    return feedback;
  }

  async getServiceFeedbackByJobCard(jobCardId: string): Promise<any[]> {
    return await db.select().from(serviceFeedback)
      .where(eq(serviceFeedback.jobCardId, jobCardId));
  }

  async getServiceFeedbackByTechnician(technicianId: string): Promise<any[]> {
    return await db.select().from(serviceFeedback)
      .where(eq(serviceFeedback.technicianId, technicianId))
      .orderBy(desc(serviceFeedback.submittedAt))
      .limit(100);
  }

  async getTechnicianFeedbackSummary(technicianId: string): Promise<any | null> {
    const [summary] = await db.select().from(technicianFeedbackSummary)
      .where(eq(technicianFeedbackSummary.technicianId, technicianId));
    return summary || null;
  }

  async updateTechnicianFeedbackSummary(technicianId: string): Promise<void> {
    const feedback = await this.getServiceFeedbackByTechnician(technicianId);
    if (feedback.length === 0) return;

    const totalReviews = feedback.length;
    const avgRating = feedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / totalReviews;
    const ratingCounts = feedback.reduce((acc, f) => {
      acc[`rating${f.overallRating}Count`] = (acc[`rating${f.overallRating}Count`] || 0) + 1;
      return acc;
    }, {} as any);

    await db.insert(technicianFeedbackSummary)
      .values({
        technicianId,
        totalReviews,
        averageRating: avgRating.toFixed(2),
        rating5Count: ratingCounts.rating5Count || 0,
        rating4Count: ratingCounts.rating4Count || 0,
        rating3Count: ratingCounts.rating3Count || 0,
        rating2Count: ratingCounts.rating2Count || 0,
        rating1Count: ratingCounts.rating1Count || 0,
      })
      .onConflictDoUpdate({
        target: technicianFeedbackSummary.technicianId,
        set: {
          totalReviews,
          averageRating: avgRating.toFixed(2),
          rating5Count: ratingCounts.rating5Count || 0,
          rating4Count: ratingCounts.rating4Count || 0,
          rating3Count: ratingCounts.rating3Count || 0,
          rating2Count: ratingCounts.rating2Count || 0,
          rating1Count: ratingCounts.rating1Count || 0,
          lastUpdated: new Date(),
        }
      });
  }

  // Get all feedback with filters
  async getAllServiceFeedback(filters?: { 
    sentiment?: string; 
    minRating?: number; 
    maxRating?: number;
    isFlagged?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    // Simplified query to avoid drizzle nested object issues
    let query = db.select()
      .from(serviceFeedback)
      .$dynamic();

    if (filters?.sentiment) {
      query = query.where(eq(serviceFeedback.sentiment, filters.sentiment));
    }
    if (filters?.minRating) {
      query = query.where(gte(serviceFeedback.overallRating, filters.minRating));
    }
    if (filters?.maxRating) {
      query = query.where(lte(serviceFeedback.overallRating, filters.maxRating));
    }
    if (filters?.isFlagged !== undefined) {
      query = query.where(eq(serviceFeedback.isFlagged, filters.isFlagged));
    }
    if (filters?.startDate) {
      query = query.where(gte(serviceFeedback.submittedAt, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(serviceFeedback.submittedAt, filters.endDate));
    }

    query = query.orderBy(desc(serviceFeedback.submittedAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  // Get feedback analytics with sentiment breakdown
  async getFeedbackAnalytics(): Promise<any> {
    const allFeedback = await db.select().from(serviceFeedback);
    
    const totalFeedback = allFeedback.length;
    const avgOverallRating = allFeedback.length > 0 
      ? allFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / totalFeedback 
      : 0;
    
    const sentimentCounts = allFeedback.reduce((acc, f) => {
      const sentiment = f.sentiment || 'unanalyzed';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ratingDistribution = allFeedback.reduce((acc, f) => {
      acc[f.overallRating] = (acc[f.overallRating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const flaggedCount = allFeedback.filter(f => f.isFlagged).length;
    const pendingResponseCount = allFeedback.filter(f => !f.response && f.overallRating <= 3).length;

    const avgWaitTime = allFeedback.filter(f => f.waitTimeRating).length > 0
      ? allFeedback.filter(f => f.waitTimeRating).reduce((sum, f) => sum + (f.waitTimeRating || 0), 0) / allFeedback.filter(f => f.waitTimeRating).length
      : 0;
    const avgQuality = allFeedback.filter(f => f.qualityRating).length > 0
      ? allFeedback.filter(f => f.qualityRating).reduce((sum, f) => sum + (f.qualityRating || 0), 0) / allFeedback.filter(f => f.qualityRating).length
      : 0;
    const avgCommunication = allFeedback.filter(f => f.communicationRating).length > 0
      ? allFeedback.filter(f => f.communicationRating).reduce((sum, f) => sum + (f.communicationRating || 0), 0) / allFeedback.filter(f => f.communicationRating).length
      : 0;

    return {
      totalFeedback,
      avgOverallRating: avgOverallRating.toFixed(2),
      sentimentCounts,
      ratingDistribution,
      flaggedCount,
      pendingResponseCount,
      categoryRatings: {
        waitTime: avgWaitTime.toFixed(2),
        quality: avgQuality.toFixed(2),
        communication: avgCommunication.toFixed(2),
      },
    };
  }

  // Update feedback with response
  async respondToFeedback(id: string, response: string): Promise<any> {
    const [updated] = await db.update(serviceFeedback)
      .set({
        response,
        respondedAt: new Date(),
      })
      .where(eq(serviceFeedback.id, id))
      .returning();
    return updated;
  }

  // Flag feedback for moderation
  async flagFeedback(id: string, reason: string): Promise<any> {
    const [updated] = await db.update(serviceFeedback)
      .set({
        isFlagged: true,
        flagReason: reason,
      })
      .where(eq(serviceFeedback.id, id))
      .returning();
    return updated;
  }

  // Unflag feedback
  async unflagFeedback(id: string): Promise<any> {
    const [updated] = await db.update(serviceFeedback)
      .set({
        isFlagged: false,
        flagReason: null,
      })
      .where(eq(serviceFeedback.id, id))
      .returning();
    return updated;
  }

  // Update sentiment analysis for feedback
  async updateFeedbackSentiment(id: string, sentiment: string, sentimentScore: number, keywords: string[]): Promise<any> {
    const [updated] = await db.update(serviceFeedback)
      .set({
        sentiment,
        sentimentScore: sentimentScore.toString(),
        sentimentKeywords: keywords,
      })
      .where(eq(serviceFeedback.id, id))
      .returning();
    return updated;
  }

  // Get feedback by ID
  async getServiceFeedbackById(id: string): Promise<any | null> {
    // customer_profiles only holds address/nationality/preferred_language —
    // the name, email and phone are on users. The customer therefore needs a
    // second, aliased join against users, since the unaliased one is already
    // taken by the technician.
    const customerUsers = alias(users, "customer_users");
    const [feedback] = await db.select({
      feedback: serviceFeedback,
      customer: {
        id: customerUsers.id,
        firstName: customerUsers.firstName,
        lastName: customerUsers.lastName,
        email: customerUsers.email,
        phone: customerUsers.phone,
      },
      technician: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },
      vehicle: {
        id: vehicles.id,
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        licensePlate: vehicles.licensePlate,
      },
      jobCard: {
        id: jobCards.id,
        jobNumber: jobCards.jobNumber,
        status: jobCards.status,
      },
    }).from(serviceFeedback)
      .leftJoin(customerUsers, eq(serviceFeedback.customerId, customerUsers.id))
      .leftJoin(users, eq(serviceFeedback.technicianId, users.id))
      .leftJoin(vehicles, eq(serviceFeedback.vehicleId, vehicles.id))
      .leftJoin(jobCards, eq(serviceFeedback.jobCardId, jobCards.id))
      .where(eq(serviceFeedback.id, id));
    return feedback || null;
  }

  // ========================================
  // MAINTENANCE RECOMMENDATIONS METHODS
  // ========================================
  
  async getMaintenanceRecommendations(vehicleId: string): Promise<any[]> {
    return await db.select().from(maintenanceRecommendations)
      .where(eq(maintenanceRecommendations.vehicleId, vehicleId))
      .orderBy(maintenanceRecommendations.predictedDueAt);
  }

  async acknowledgeMaintenanceRecommendation(id: string): Promise<any> {
    const [recommendation] = await db.update(maintenanceRecommendations)
      .set({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(maintenanceRecommendations.id, id))
      .returning();
    return recommendation;
  }

  // ========================================
  // TELEMATICS METHODS
  // ========================================
  
  async getTelematicsDeviceByVehicle(vehicleId: string): Promise<any | null> {
    const [device] = await db.select().from(telematicsDevices)
      .where(eq(telematicsDevices.vehicleId, vehicleId));
    return device || null;
  }

  async getTelematicsReadings(vehicleId: string, streamType?: string, hours: number = 24): Promise<any[]> {
    const device = await this.getTelematicsDeviceByVehicle(vehicleId);
    if (!device) return [];

    const streams = await db.select().from(telematicsStreams)
      .where(and(
        eq(telematicsStreams.deviceId, device.id),
        streamType ? eq(telematicsStreams.streamType, streamType) : sql`true`
      ));

    if (streams.length === 0) return [];

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const streamIds = streams.map(s => s.id);

    return await db.select().from(telematicsReadings)
      .where(and(
        sql`${telematicsReadings.streamId} = ANY(${streamIds})`,
        gte(telematicsReadings.recordedAt, cutoffTime)
      ))
      .orderBy(telematicsReadings.recordedAt);
  }

  // ========================================
  // GAMIFICATION METHODS
  // ========================================
  
  async getLeaderboard(period: string, limit: number = 10): Promise<any[]> {
    return await db.select().from(leaderboardSnapshots)
      .where(eq(leaderboardSnapshots.period, period))
      .orderBy(leaderboardSnapshots.rank)
      .limit(limit);
  }

  async getTechnicianPoints(technicianId: string): Promise<number> {
    const events = await db.select().from(gamificationEvents)
      .where(eq(gamificationEvents.technicianId, technicianId));
    
    const definitions = await db.select().from(gamificationEventDefinitions);
    const pointsMap = Object.fromEntries(definitions.map(d => [d.eventKey, d.points]));
    
    return events.reduce((total, event) => total + (pointsMap[event.eventKey] || 0), 0);
  }

  async getTechnicianBadges(technicianId: string): Promise<any[]> {
    return await db.select({
      badge: gamificationBadges,
      awardedAt: gamificationBadgeAwards.awardedAt
    })
      .from(gamificationBadgeAwards)
      .innerJoin(gamificationBadges, eq(gamificationBadgeAwards.badgeId, gamificationBadges.id))
      .where(eq(gamificationBadgeAwards.technicianId, technicianId))
      .orderBy(desc(gamificationBadgeAwards.awardedAt));
  }

  async getTechnicianRecentEvents(technicianId: string, limit: number = 10): Promise<any[]> {
    return await db.select().from(gamificationEvents)
      .where(eq(gamificationEvents.technicianId, technicianId))
      .orderBy(desc(gamificationEvents.occurredAt))
      .limit(limit);
  }

  async getGamificationBadges(): Promise<any[]> {
    return await db.select().from(gamificationBadges)
      .where(eq(gamificationBadges.isActive, true));
  }

  // ========================================
  // DASHBOARD WIDGETS METHODS
  // ========================================
  
  async getDashboardWidgets(userId: string, garageId: string): Promise<DashboardWidget[]> {
    return await db.select().from(dashboardWidgets)
      .where(and(
        eq(dashboardWidgets.userId, userId),
        eq(dashboardWidgets.garageId, garageId),
        eq(dashboardWidgets.isActive, true)
      ))
      .orderBy(dashboardWidgets.createdAt);
  }

  async getDashboardWidget(id: string): Promise<DashboardWidget | undefined> {
    const [widget] = await db.select().from(dashboardWidgets)
      .where(eq(dashboardWidgets.id, id));
    return widget;
  }

  async createDashboardWidget(data: InsertDashboardWidget): Promise<DashboardWidget> {
    const [widget] = await db.insert(dashboardWidgets).values(data).returning();
    return widget;
  }

  async updateDashboardWidget(id: string, data: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const [widget] = await db.update(dashboardWidgets)
      .set(data)
      .where(eq(dashboardWidgets.id, id))
      .returning();
    return widget;
  }

  async deleteDashboardWidget(id: string): Promise<void> {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id));
  }

  async updateWidgetPositions(userId: string, positions: { id: string; position: any }[]): Promise<void> {
    for (const { id, position } of positions) {
      await db.update(dashboardWidgets)
        .set({ position })
        .where(and(
          eq(dashboardWidgets.id, id),
          eq(dashboardWidgets.userId, userId)
        ));
    }
  }

  async getDefaultWidgets(): Promise<any[]> {
    return [
      { widgetType: 'kpi', title: 'Total Revenue', dataSource: 'invoices', configuration: { metric: 'sum', field: 'total' } },
      { widgetType: 'kpi', title: 'Active Customers', dataSource: 'customers', configuration: { metric: 'count' } },
      { widgetType: 'kpi', title: 'Open Job Cards', dataSource: 'job_cards', configuration: { metric: 'count', filter: { status: 'in_progress' } } },
      { widgetType: 'kpi', title: 'Parts Inventory', dataSource: 'inventory', configuration: { metric: 'count' } },
      { widgetType: 'chart', title: 'Revenue Trend', dataSource: 'invoices', configuration: { chartType: 'line', groupBy: 'month' } },
      { widgetType: 'chart', title: 'Service Distribution', dataSource: 'job_cards', configuration: { chartType: 'pie', groupBy: 'serviceType' } },
      { widgetType: 'table', title: 'Recent Jobs', dataSource: 'job_cards', configuration: { limit: 5, orderBy: 'createdAt' } },
      { widgetType: 'metric', title: 'Average Repair Time', dataSource: 'job_cards', configuration: { metric: 'avg', field: 'duration' } },
    ];
  }

  // ========================================
  // BACKUP SCHEDULE METHODS
  // ========================================
  
  async deleteBackupJob(id: string): Promise<void> {
    await db.delete(backupJobs).where(eq(backupJobs.id, id));
  }

  async getLatestBackup(garageId: string): Promise<BackupJob | undefined> {
    const [backup] = await db.select().from(backupJobs)
      .where(and(
        eq(backupJobs.garageId, garageId),
        eq(backupJobs.status, 'completed')
      ))
      .orderBy(desc(backupJobs.completedAt))
      .limit(1);
    return backup;
  }

  async getBackupStats(garageId: string): Promise<any> {
    const allBackups = await db.select().from(backupJobs)
      .where(eq(backupJobs.garageId, garageId));
    
    const completed = allBackups.filter(b => b.status === 'completed');
    const failed = allBackups.filter(b => b.status === 'failed');
    const totalSize = completed.reduce((sum, b) => sum + (b.fileSize || 0), 0);
    
    return {
      totalBackups: allBackups.length,
      completedBackups: completed.length,
      failedBackups: failed.length,
      totalStorageUsed: totalSize,
      lastBackupDate: completed[0]?.completedAt || null,
    };
  }

  // ==========================================
  // SERVICE BAY DASHBOARD METHODS
  // ==========================================

  async getServiceBays(garageId?: string): Promise<ServiceBay[]> {
    if (garageId) {
      return await db.select().from(serviceBays)
        .where(eq(serviceBays.garageId, garageId))
        .orderBy(serviceBays.bayNumber);
    }
    return await db.select().from(serviceBays).orderBy(serviceBays.bayNumber);
  }

  async getServiceBaysWithSessions(garageId?: string): Promise<any[]> {
    const bays = await this.getServiceBays(garageId);
    
    const baysWithSessions = await Promise.all(bays.map(async (bay) => {
      const activeSessions = await db.select().from(bayOccupancySessions)
        .where(and(
          eq(bayOccupancySessions.bayId, bay.id),
          isNull(bayOccupancySessions.endTime)
        ))
        .orderBy(desc(bayOccupancySessions.startTime))
        .limit(1);
      
      const currentSession = activeSessions[0];
      
      let sessionWithDetails = null;
      if (currentSession) {
        let vehicle = null;
        let jobCard = null;
        
        if (currentSession.vehicleId) {
          const [v] = await db.select().from(vehicles)
            .where(eq(vehicles.id, currentSession.vehicleId));
          vehicle = v;
        }
        
        if (currentSession.jobCardId) {
          const [jc] = await db.select().from(jobCards)
            .where(eq(jobCards.id, currentSession.jobCardId));
          jobCard = jc;
        }
        
        sessionWithDetails = { ...currentSession, vehicle, jobCard };
      }
      
      return { ...bay, currentSession: sessionWithDetails };
    }));
    
    return baysWithSessions;
  }

  async getServiceBayStatistics(garageId?: string): Promise<any> {
    const bays = await this.getServiceBays(garageId);
    const totalBays = bays.length;
    const occupiedBays = bays.filter(b => b.status === 'occupied').length;
    const availableBays = bays.filter(b => b.status === 'available').length;
    const maintenanceBays = bays.filter(b => b.status === 'maintenance').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let completedSessionsQuery = db.select().from(bayOccupancySessions)
      .where(gte(bayOccupancySessions.endTime, today));
    
    const completedSessions = await completedSessionsQuery;
    
    let totalDuration = 0;
    let completedCount = 0;
    for (const session of completedSessions) {
      if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        totalDuration += (end.getTime() - start.getTime()) / 60000;
        completedCount++;
      }
    }
    
    const avgSessionDuration = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0;
    
    return {
      totalBays,
      occupiedBays,
      availableBays,
      maintenanceBays,
      avgSessionDuration,
      todayCompletedSessions: completedCount,
    };
  }

  async createServiceBay(data: InsertServiceBay): Promise<ServiceBay> {
    const [bay] = await db.insert(serviceBays).values(data).returning();
    return bay;
  }

  async updateServiceBayStatus(bayId: string, status: string): Promise<ServiceBay | null> {
    const [bay] = await db.update(serviceBays)
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceBays.id, bayId))
      .returning();
    return bay || null;
  }

  async startBaySession(bayId: string, vehicleId?: string, jobCardId?: string): Promise<BayOccupancySession> {
    // Use a transaction to ensure atomicity and prevent race conditions
    return await db.transaction(async (tx) => {
      // Lock the service bay row by updating updatedAt first
      // This creates an exclusive row lock, preventing concurrent session starts
      const [lockedBay] = await tx.update(serviceBays)
        .set({ updatedAt: new Date() })
        .where(eq(serviceBays.id, bayId))
        .returning();
      
      if (!lockedBay) {
        throw new Error('Service bay not found');
      }
      
      // Close any existing open sessions on this bay (now safely locked)
      await tx.update(bayOccupancySessions)
        .set({ endTime: new Date() })
        .where(and(
          eq(bayOccupancySessions.bayId, bayId),
          isNull(bayOccupancySessions.endTime)
        ));
      
      // Insert new session
      // garage_id is NOT NULL and was omitted entirely; take it from the bay
      // that was just locked. The column is service_type, not session_type.
      const [session] = await tx.insert(bayOccupancySessions).values({
        bayId,
        garageId: lockedBay.garageId,
        vehicleId: vehicleId || null,
        jobCardId: jobCardId || null,
        startTime: new Date(),
        serviceType: 'service',
      }).returning();
      
      if (!session) {
        throw new Error('Failed to create bay session');
      }
      
      // Update bay status to occupied
      await tx.update(serviceBays)
        .set({ status: 'occupied', updatedAt: new Date() })
        .where(eq(serviceBays.id, bayId));
      
      return session;
    });
  }

  async endBaySession(sessionId: string): Promise<BayOccupancySession | null> {
    const [session] = await db.select().from(bayOccupancySessions)
      .where(eq(bayOccupancySessions.id, sessionId));
    
    if (!session) return null;
    
    await db.update(serviceBays)
      .set({ status: 'available', updatedAt: new Date() })
      .where(eq(serviceBays.id, session.bayId));
    
    const [updatedSession] = await db.update(bayOccupancySessions)
      .set({ endTime: new Date() })
      .where(eq(bayOccupancySessions.id, sessionId))
      .returning();
    
    return updatedSession;
  }

  // Automated Inventory Reordering Module
  async getInventoryForecasts(garageId: string): Promise<InventoryForecast[]> {
    return await db.select().from(inventoryForecasts)
      .where(eq(inventoryForecasts.garageId, garageId))
      .orderBy(desc(inventoryForecasts.forecastDate));
  }

  async getInventoryForecast(id: string): Promise<InventoryForecast | undefined> {
    const [forecast] = await db.select().from(inventoryForecasts)
      .where(eq(inventoryForecasts.id, id));
    return forecast;
  }

  async createInventoryForecast(data: InsertInventoryForecast): Promise<InventoryForecast> {
    const [forecast] = await db.insert(inventoryForecasts).values(data).returning();
    return forecast;
  }

  async getReplenishmentOrders(garageId?: string, status?: string): Promise<ReplenishmentOrder[]> {
    let query = db.select().from(replenishmentOrders);
    const conditions = [];
    if (garageId) conditions.push(eq(replenishmentOrders.garageId, garageId));
    if (status) conditions.push(eq(replenishmentOrders.status, status));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return await query.orderBy(desc(replenishmentOrders.createdAt));
  }

  async getReplenishmentOrder(id: string): Promise<ReplenishmentOrder | undefined> {
    const [order] = await db.select().from(replenishmentOrders)
      .where(eq(replenishmentOrders.id, id));
    return order;
  }

  async createReplenishmentOrder(data: InsertReplenishmentOrder): Promise<ReplenishmentOrder> {
    const [order] = await db.insert(replenishmentOrders).values(data).returning();
    return order;
  }

  async updateReplenishmentOrder(id: string, data: Partial<ReplenishmentOrder>): Promise<ReplenishmentOrder> {
    const [order] = await db.update(replenishmentOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(replenishmentOrders.id, id))
      .returning();
    return order;
  }

  async approveReplenishmentOrder(id: string, userId: string): Promise<ReplenishmentOrder> {
    const [order] = await db.update(replenishmentOrders)
      .set({ status: 'approved', approvedBy: userId, approvedAt: new Date(), updatedAt: new Date() })
      .where(eq(replenishmentOrders.id, id))
      .returning();
    return order;
  }

  // Customer Loyalty Program Module
  async getLoyaltyTiers(garageId: string): Promise<LoyaltyTier[]> {
    return await db.select().from(loyaltyTiers)
      .where(eq(loyaltyTiers.garageId, garageId))
      .orderBy(loyaltyTiers.sortOrder);
  }

  async getLoyaltyTier(id: string): Promise<LoyaltyTier | undefined> {
    const [tier] = await db.select().from(loyaltyTiers)
      .where(eq(loyaltyTiers.id, id));
    return tier;
  }

  async createLoyaltyTier(data: InsertLoyaltyTier): Promise<LoyaltyTier> {
    const [tier] = await db.insert(loyaltyTiers).values(data).returning();
    return tier;
  }

  async updateLoyaltyTier(id: string, data: Partial<LoyaltyTier>): Promise<LoyaltyTier> {
    const [tier] = await db.update(loyaltyTiers)
      .set(data)
      .where(eq(loyaltyTiers.id, id))
      .returning();
    return tier;
  }

  async deleteLoyaltyTier(id: string): Promise<void> {
    await db.delete(loyaltyTiers).where(eq(loyaltyTiers.id, id));
  }

  // Legacy loyaltyAccounts methods (kept for compatibility with old schema)
  async getLoyaltyAccountsLegacy(garageId?: string): Promise<LoyaltyAccount[]> {
    if (garageId) {
      return await db.select().from(loyaltyAccounts)
        .where(eq(loyaltyAccounts.garageId, garageId))
        .orderBy(desc(loyaltyAccounts.currentPoints));
    }
    return await db.select().from(loyaltyAccounts)
      .orderBy(desc(loyaltyAccounts.currentPoints));
  }

  async getLoyaltyAccountLegacy(id: string): Promise<LoyaltyAccount | undefined> {
    const [account] = await db.select().from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.id, id));
    return account;
  }

  async getLoyaltyAccountByCustomerLegacy(customerId: string): Promise<LoyaltyAccount | undefined> {
    const [account] = await db.select().from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.customerId, customerId));
    return account;
  }

  async createLoyaltyAccountLegacy(data: InsertLoyaltyAccount): Promise<LoyaltyAccount> {
    const [account] = await db.insert(loyaltyAccounts).values(data).returning();
    return account;
  }

  async updateLoyaltyAccountLegacy(id: string, data: Partial<LoyaltyAccount>): Promise<LoyaltyAccount> {
    const [account] = await db.update(loyaltyAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loyaltyAccounts.id, id))
      .returning();
    return account;
  }

  async addLoyaltyPoints(accountId: string, points: number): Promise<LoyaltyAccount> {
    const [account] = await db.select().from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.id, accountId));
    if (!account) throw new Error('Loyalty account not found');
    
    const [updated] = await db.update(loyaltyAccounts)
      .set({
        currentPoints: (account.currentPoints || 0) + points,
        totalPointsEarned: (account.totalPointsEarned || 0) + points,
        updatedAt: new Date()
      })
      .where(eq(loyaltyAccounts.id, accountId))
      .returning();
    return updated;
  }

  async redeemLoyaltyPoints(accountId: string, points: number): Promise<LoyaltyAccount> {
    const [account] = await db.select().from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.id, accountId));
    if (!account) throw new Error('Loyalty account not found');
    if ((account.currentPoints || 0) < points) throw new Error('Insufficient points');
    
    const [updated] = await db.update(loyaltyAccounts)
      .set({
        currentPoints: (account.currentPoints || 0) - points,
        totalPointsRedeemed: (account.totalPointsRedeemed || 0) + points,
        updatedAt: new Date()
      })
      .where(eq(loyaltyAccounts.id, accountId))
      .returning();
    return updated;
  }

  async getLoyaltyOffers(garageId?: string, isActive?: boolean): Promise<LoyaltyOffer[]> {
    const conditions = [];
    if (garageId) conditions.push(eq(loyaltyOffers.garageId, garageId));
    if (isActive !== undefined) conditions.push(eq(loyaltyOffers.isActive, isActive));
    
    if (conditions.length > 0) {
      return await db.select().from(loyaltyOffers)
        .where(and(...conditions))
        .orderBy(desc(loyaltyOffers.createdAt));
    }
    return await db.select().from(loyaltyOffers)
      .orderBy(desc(loyaltyOffers.createdAt));
  }

  async getLoyaltyOffer(id: string): Promise<LoyaltyOffer | undefined> {
    const [offer] = await db.select().from(loyaltyOffers)
      .where(eq(loyaltyOffers.id, id));
    return offer;
  }

  async createLoyaltyOffer(data: InsertLoyaltyOffer): Promise<LoyaltyOffer> {
    const [offer] = await db.insert(loyaltyOffers).values(data).returning();
    return offer;
  }

  async updateLoyaltyOffer(id: string, data: Partial<LoyaltyOffer>): Promise<LoyaltyOffer> {
    const [offer] = await db.update(loyaltyOffers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loyaltyOffers.id, id))
      .returning();
    return offer;
  }

  async deleteLoyaltyOffer(id: string): Promise<void> {
    await db.delete(loyaltyOffers).where(eq(loyaltyOffers.id, id));
  }

  // Workshop Calendar Module
  async getWorkshopResources(garageId: string): Promise<WorkshopResource[]> {
    return await db.select().from(workshopResources)
      .where(eq(workshopResources.garageId, garageId));
  }

  async getWorkshopResource(id: string): Promise<WorkshopResource | undefined> {
    const [resource] = await db.select().from(workshopResources)
      .where(eq(workshopResources.id, id));
    return resource;
  }

  async createWorkshopResource(data: InsertWorkshopResource): Promise<WorkshopResource> {
    const [resource] = await db.insert(workshopResources).values(data).returning();
    return resource;
  }

  async updateWorkshopResource(id: string, data: Partial<WorkshopResource>): Promise<WorkshopResource> {
    const [resource] = await db.update(workshopResources)
      .set(data)
      .where(eq(workshopResources.id, id))
      .returning();
    return resource;
  }

  async deleteWorkshopResource(id: string): Promise<void> {
    await db.delete(workshopResources).where(eq(workshopResources.id, id));
  }

  async getCalendarAppointments(garageId: string, startDate?: Date, endDate?: Date): Promise<CalendarAppointment[]> {
    const conditions = [eq(calendarAppointments.garageId, garageId)];
    if (startDate) conditions.push(gte(calendarAppointments.startTime, startDate));
    if (endDate) conditions.push(lte(calendarAppointments.endTime, endDate));
    
    return await db.select().from(calendarAppointments)
      .where(and(...conditions))
      .orderBy(calendarAppointments.startTime);
  }

  async getCalendarAppointment(id: string): Promise<CalendarAppointment | undefined> {
    const [appointment] = await db.select().from(calendarAppointments)
      .where(eq(calendarAppointments.id, id));
    return appointment;
  }

  async createCalendarAppointment(data: InsertCalendarAppointment): Promise<CalendarAppointment> {
    const [appointment] = await db.insert(calendarAppointments).values(data).returning();
    return appointment;
  }

  async updateCalendarAppointment(id: string, data: Partial<CalendarAppointment>): Promise<CalendarAppointment> {
    const [appointment] = await db.update(calendarAppointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(calendarAppointments.id, id))
      .returning();
    return appointment;
  }

  async deleteCalendarAppointment(id: string): Promise<void> {
    await db.delete(calendarAppointments).where(eq(calendarAppointments.id, id));
  }

  async moveCalendarAppointment(id: string, newStart: Date, newEnd: Date, resourceId?: string): Promise<CalendarAppointment> {
    const updateData: Partial<CalendarAppointment> = {
      startTime: newStart,
      endTime: newEnd,
      updatedAt: new Date()
    };
    if (resourceId) updateData.resourceId = resourceId;
    
    const [appointment] = await db.update(calendarAppointments)
      .set(updateData)
      .where(eq(calendarAppointments.id, id))
      .returning();
    return appointment;
  }

  // AR Overlay Module
  async getArWorkInstructions(garageId?: string): Promise<ArWorkInstruction[]> {
    if (garageId) {
      return await db.select().from(arWorkInstructions)
        .where(or(eq(arWorkInstructions.garageId, garageId), eq(arWorkInstructions.isGlobal, true)))
        .orderBy(desc(arWorkInstructions.usageCount));
    }
    return await db.select().from(arWorkInstructions)
      .orderBy(desc(arWorkInstructions.usageCount));
  }

  async getArWorkInstruction(id: string): Promise<ArWorkInstruction | undefined> {
    const [instruction] = await db.select().from(arWorkInstructions)
      .where(eq(arWorkInstructions.id, id));
    return instruction;
  }

  async createArWorkInstruction(data: InsertArWorkInstruction): Promise<ArWorkInstruction> {
    const [instruction] = await db.insert(arWorkInstructions).values(data).returning();
    return instruction;
  }

  async updateArWorkInstruction(id: string, data: Partial<ArWorkInstruction>): Promise<ArWorkInstruction> {
    const [instruction] = await db.update(arWorkInstructions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(arWorkInstructions.id, id))
      .returning();
    return instruction;
  }

  async deleteArWorkInstruction(id: string): Promise<void> {
    await db.delete(arWorkInstructions).where(eq(arWorkInstructions.id, id));
  }

  async getArSessionLogs(garageId: string, technicianId?: string): Promise<ArSessionLog[]> {
    const conditions = [eq(arSessionLogs.garageId, garageId)];
    if (technicianId) conditions.push(eq(arSessionLogs.technicianId, technicianId));
    
    return await db.select().from(arSessionLogs)
      .where(and(...conditions))
      .orderBy(desc(arSessionLogs.sessionStartTime));
  }

  async getArSessionLog(id: string): Promise<ArSessionLog | undefined> {
    const [session] = await db.select().from(arSessionLogs)
      .where(eq(arSessionLogs.id, id));
    return session;
  }

  async createArSessionLog(data: InsertArSessionLog): Promise<ArSessionLog> {
    const [session] = await db.insert(arSessionLogs).values(data).returning();
    return session;
  }

  async updateArSessionLog(id: string, data: Partial<ArSessionLog>): Promise<ArSessionLog> {
    const [session] = await db.update(arSessionLogs)
      .set(data)
      .where(eq(arSessionLogs.id, id))
      .returning();
    return session;
  }

  async getArDevicePairings(garageId: string): Promise<ArDevicePairing[]> {
    return await db.select().from(arDevicePairings)
      .where(eq(arDevicePairings.garageId, garageId))
      .orderBy(desc(arDevicePairings.lastConnectedAt));
  }

  async getArDevicePairing(id: string): Promise<ArDevicePairing | undefined> {
    const [pairing] = await db.select().from(arDevicePairings)
      .where(eq(arDevicePairings.id, id));
    return pairing;
  }

  async createArDevicePairing(data: InsertArDevicePairing): Promise<ArDevicePairing> {
    const [pairing] = await db.insert(arDevicePairings).values(data).returning();
    return pairing;
  }

  async updateArDevicePairing(id: string, data: Partial<ArDevicePairing>): Promise<ArDevicePairing> {
    const [pairing] = await db.update(arDevicePairings)
      .set(data)
      .where(eq(arDevicePairings.id, id))
      .returning();
    return pairing;
  }

  async deleteArDevicePairing(id: string): Promise<void> {
    await db.delete(arDevicePairings).where(eq(arDevicePairings.id, id));
  }

  // Dynamic Pricing Module implementations
  async getMarketPricingData(garageId?: string, filters?: { region?: string; serviceType?: string; vehicleClass?: string }): Promise<MarketPricingData[]> {
    const conditions: any[] = [eq(marketPricingData.isActive, true)];
    if (garageId) conditions.push(eq(marketPricingData.garageId, garageId));
    if (filters?.region) conditions.push(eq(marketPricingData.region, filters.region));
    if (filters?.serviceType) conditions.push(eq(marketPricingData.serviceType, filters.serviceType));
    if (filters?.vehicleClass) conditions.push(eq(marketPricingData.vehicleClass, filters.vehicleClass));
    
    return await db.select().from(marketPricingData)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(marketPricingData.effectiveDate));
  }

  async getMarketPricingDataItem(id: string): Promise<MarketPricingData | undefined> {
    const [item] = await db.select().from(marketPricingData)
      .where(eq(marketPricingData.id, id));
    return item;
  }

  async createMarketPricingData(data: InsertMarketPricingData): Promise<MarketPricingData> {
    const [item] = await db.insert(marketPricingData).values(data).returning();
    return item;
  }

  async updateMarketPricingData(id: string, data: Partial<MarketPricingData>): Promise<MarketPricingData> {
    const [item] = await db.update(marketPricingData)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(marketPricingData.id, id))
      .returning();
    return item;
  }

  async deleteMarketPricingData(id: string): Promise<void> {
    await db.delete(marketPricingData).where(eq(marketPricingData.id, id));
  }

  async getVehiclePricingFactors(garageId?: string, vehicleMake?: string): Promise<VehiclePricingFactor[]> {
    const conditions: any[] = [eq(vehiclePricingFactors.isActive, true)];
    if (garageId) conditions.push(or(eq(vehiclePricingFactors.garageId, garageId), isNull(vehiclePricingFactors.garageId)));
    if (vehicleMake) conditions.push(eq(vehiclePricingFactors.vehicleMake, vehicleMake));
    
    return await db.select().from(vehiclePricingFactors)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(vehiclePricingFactors.vehicleMake);
  }

  async getVehiclePricingFactor(id: string): Promise<VehiclePricingFactor | undefined> {
    const [factor] = await db.select().from(vehiclePricingFactors)
      .where(eq(vehiclePricingFactors.id, id));
    return factor;
  }

  async createVehiclePricingFactor(data: InsertVehiclePricingFactor): Promise<VehiclePricingFactor> {
    const [factor] = await db.insert(vehiclePricingFactors).values(data).returning();
    return factor;
  }

  async updateVehiclePricingFactor(id: string, data: Partial<VehiclePricingFactor>): Promise<VehiclePricingFactor> {
    const [factor] = await db.update(vehiclePricingFactors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vehiclePricingFactors.id, id))
      .returning();
    return factor;
  }

  async deleteVehiclePricingFactor(id: string): Promise<void> {
    await db.delete(vehiclePricingFactors).where(eq(vehiclePricingFactors.id, id));
  }

  async getDynamicPricingSuggestions(garageId: string, filters?: { vehicleId?: string; status?: string }): Promise<DynamicPricingSuggestion[]> {
    const conditions: any[] = [eq(dynamicPricingSuggestions.garageId, garageId)];
    if (filters?.vehicleId) conditions.push(eq(dynamicPricingSuggestions.vehicleId, filters.vehicleId));
    if (filters?.status) conditions.push(eq(dynamicPricingSuggestions.status, filters.status));
    
    return await db.select().from(dynamicPricingSuggestions)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(dynamicPricingSuggestions.createdAt));
  }

  async getDynamicPricingSuggestion(id: string): Promise<DynamicPricingSuggestion | undefined> {
    const [suggestion] = await db.select().from(dynamicPricingSuggestions)
      .where(eq(dynamicPricingSuggestions.id, id));
    return suggestion;
  }

  async createDynamicPricingSuggestion(data: InsertDynamicPricingSuggestion): Promise<DynamicPricingSuggestion> {
    const [suggestion] = await db.insert(dynamicPricingSuggestions).values(data).returning();
    return suggestion;
  }

  async updateDynamicPricingSuggestion(id: string, data: Partial<DynamicPricingSuggestion>): Promise<DynamicPricingSuggestion> {
    const [suggestion] = await db.update(dynamicPricingSuggestions)
      .set(data)
      .where(eq(dynamicPricingSuggestions.id, id))
      .returning();
    return suggestion;
  }

  async deleteDynamicPricingSuggestion(id: string): Promise<void> {
    await db.delete(dynamicPricingSuggestions).where(eq(dynamicPricingSuggestions.id, id));
  }

  async calculateDynamicPrice(params: { 
    serviceType: string; 
    vehicleMake?: string; 
    vehicleYear?: number; 
    vehicleClass?: string; 
    region?: string 
  }): Promise<{ 
    basePrice: number; 
    suggestedPrice: number; 
    minPrice: number; 
    maxPrice: number; 
    factors: any; 
    confidence: number 
  }> {
    const region = params.region || 'saudi_arabia';
    const vehicleClass = params.vehicleClass || 'standard';
    
    const marketData = await db.select().from(marketPricingData)
      .where(and(
        eq(marketPricingData.serviceType, params.serviceType),
        eq(marketPricingData.region, region),
        eq(marketPricingData.isActive, true),
        or(
          eq(marketPricingData.vehicleClass, vehicleClass),
          isNull(marketPricingData.vehicleClass)
        )
      ))
      .limit(1);

    let basePrice = 500;
    let minPrice = 400;
    let maxPrice = 600;
    let confidence = 50;

    if (marketData.length > 0) {
      basePrice = parseFloat(marketData[0].avgPrice);
      minPrice = parseFloat(marketData[0].minPrice);
      maxPrice = parseFloat(marketData[0].maxPrice);
      confidence = Math.min(95, 60 + (marketData[0].sampleSize || 0) / 10);
    }

    let adjustmentFactor = 1.0;
    const appliedFactors: any = {};

    if (params.vehicleMake) {
      const vehicleFactors = await db.select().from(vehiclePricingFactors)
        .where(and(
          eq(vehiclePricingFactors.vehicleMake, params.vehicleMake),
          eq(vehiclePricingFactors.isActive, true)
        ))
        .limit(1);

      if (vehicleFactors.length > 0) {
        const factor = vehicleFactors[0];
        const complexity = parseFloat(factor.complexityFactor || '1.00');
        const parts = parseFloat(factor.partsAvailabilityFactor || '1.00');
        const labor = parseFloat(factor.laborIntensityFactor || '1.00');
        const luxury = parseFloat(factor.luxuryPremiumFactor || '1.00');
        
        adjustmentFactor = (complexity + parts + labor + luxury) / 4;
        appliedFactors.vehicleMake = params.vehicleMake;
        appliedFactors.complexityFactor = complexity;
        appliedFactors.partsAvailabilityFactor = parts;
        appliedFactors.laborIntensityFactor = labor;
        appliedFactors.luxuryPremiumFactor = luxury;
        confidence = Math.min(95, confidence + 10);
      }
    }

    if (params.vehicleYear) {
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - params.vehicleYear;
      if (vehicleAge > 10) {
        adjustmentFactor *= 1.15;
        appliedFactors.ageAdjustment = 1.15;
        appliedFactors.vehicleAge = vehicleAge;
      } else if (vehicleAge > 5) {
        adjustmentFactor *= 1.05;
        appliedFactors.ageAdjustment = 1.05;
        appliedFactors.vehicleAge = vehicleAge;
      }
    }

    const suggestedPrice = Math.round(basePrice * adjustmentFactor * 100) / 100;
    const adjustedMin = Math.round(minPrice * adjustmentFactor * 100) / 100;
    const adjustedMax = Math.round(maxPrice * adjustmentFactor * 100) / 100;

    return {
      basePrice,
      suggestedPrice,
      minPrice: adjustedMin,
      maxPrice: adjustedMax,
      factors: appliedFactors,
      confidence
    };
  }

  // ==================== Vehicle Tracking ====================

  async getVehicleTrackingData(garageId?: string): Promise<VehicleTracking[]> {
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(vehicleTracking.garageId, garageId));
    
    return conditions.length > 0 
      ? await db.select().from(vehicleTracking).where(and(...conditions))
      : await db.select().from(vehicleTracking);
  }

  async getVehicleTrackingByVehicleId(vehicleId: string): Promise<VehicleTracking | undefined> {
    const [tracking] = await db.select().from(vehicleTracking)
      .where(eq(vehicleTracking.vehicleId, vehicleId));
    return tracking;
  }

  async createVehicleTracking(data: InsertVehicleTracking): Promise<VehicleTracking> {
    const [tracking] = await db.insert(vehicleTracking).values(data).returning();
    return tracking;
  }

  async updateVehicleTracking(vehicleId: string, data: Partial<VehicleTracking>): Promise<VehicleTracking> {
    const [tracking] = await db.update(vehicleTracking)
      .set({ ...data, lastSeenAt: new Date() })
      .where(eq(vehicleTracking.vehicleId, vehicleId))
      .returning();
    return tracking;
  }

  async upsertVehicleTracking(vehicleId: string, data: InsertVehicleTracking): Promise<VehicleTracking> {
    const existing = await this.getVehicleTrackingByVehicleId(vehicleId);
    if (existing) {
      return await this.updateVehicleTracking(vehicleId, data);
    } else {
      return await this.createVehicleTracking({ ...data, vehicleId });
    }
  }

  async getVehicleTrackingHistory(vehicleId: string, limit: number = 100): Promise<VehicleTrackingHistory[]> {
    return await db.select().from(vehicleTrackingHistory)
      .where(eq(vehicleTrackingHistory.vehicleId, vehicleId))
      .orderBy(desc(vehicleTrackingHistory.recordedAt))
      .limit(limit);
  }

  async createVehicleTrackingHistory(data: InsertVehicleTrackingHistory): Promise<VehicleTrackingHistory> {
    const [history] = await db.insert(vehicleTrackingHistory).values(data).returning();
    return history;
  }

  // ==================== Service Reminders Extended ====================

  async getServiceRemindersDue(garageId?: string): Promise<ServiceReminder[]> {
    const now = new Date();
    const conditions: any[] = [
      eq(serviceReminders.status, 'pending'),
      eq(serviceReminders.isActive, true),
      lte(serviceReminders.triggerDate, now)
    ];
    // service_reminders has no garage_id — it hangs off a vehicle, and the
    // vehicle is what carries the garage. Scope through it.
    if (garageId) {
      conditions.push(sql`EXISTS (SELECT 1 FROM ${vehicles} WHERE ${vehicles.id} = ${serviceReminders.vehicleId} AND ${vehicles.garageId} = ${garageId})`);
    }

    return await db.select().from(serviceReminders)
      .where(and(...conditions))
      .orderBy(asc(serviceReminders.triggerDate));
  }

  async getServiceRemindersByVehicle(vehicleId: string): Promise<ServiceReminder[]> {
    return await db.select().from(serviceReminders)
      .where(eq(serviceReminders.vehicleId, vehicleId))
      .orderBy(desc(serviceReminders.createdAt));
  }

  async getServiceRemindersByCustomer(customerId: string): Promise<ServiceReminder[]> {
    return await db.select().from(serviceReminders)
      .where(eq(serviceReminders.customerId, customerId))
      .orderBy(desc(serviceReminders.createdAt));
  }

  async updateServiceReminderStatus(id: string, status: string): Promise<ServiceReminder> {
    const [reminder] = await db.update(serviceReminders)
      .set({ status, updatedAt: new Date(), sentAt: status === 'sent' ? new Date() : undefined })
      .where(eq(serviceReminders.id, id))
      .returning();
    return reminder;
  }

  // ==================== Service Reminder Templates ====================

  async getServiceReminderTemplates(garageId?: string): Promise<ServiceReminderTemplate[]> {
    const conditions: any[] = [eq(serviceReminderTemplates.isActive, true)];
    if (garageId) conditions.push(eq(serviceReminderTemplates.garageId, garageId));
    
    return await db.select().from(serviceReminderTemplates)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(asc(serviceReminderTemplates.name));
  }

  async getServiceReminderTemplate(id: string): Promise<ServiceReminderTemplate | undefined> {
    const [template] = await db.select().from(serviceReminderTemplates)
      .where(eq(serviceReminderTemplates.id, id));
    return template;
  }

  async createServiceReminderTemplate(data: InsertServiceReminderTemplate): Promise<ServiceReminderTemplate> {
    const [template] = await db.insert(serviceReminderTemplates).values(data).returning();
    return template;
  }

  async updateServiceReminderTemplate(id: string, data: Partial<ServiceReminderTemplate>): Promise<ServiceReminderTemplate> {
    const [template] = await db.update(serviceReminderTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceReminderTemplates.id, id))
      .returning();
    return template;
  }

  async deleteServiceReminderTemplate(id: string): Promise<void> {
    await db.update(serviceReminderTemplates)
      .set({ isActive: false })
      .where(eq(serviceReminderTemplates.id, id));
  }

  // ==================== Push Subscriptions ====================

  async getPushSubscriptions(userId?: string, customerId?: string): Promise<PushSubscription[]> {
    const conditions: any[] = [eq(pushSubscriptions.isActive, true)];
    if (userId) conditions.push(eq(pushSubscriptions.userId, userId));
    if (customerId) conditions.push(eq(pushSubscriptions.customerId, customerId));
    
    return await db.select().from(pushSubscriptions)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(pushSubscriptions.lastUsedAt));
  }

  async getPushSubscription(id: string): Promise<PushSubscription | undefined> {
    const [subscription] = await db.select().from(pushSubscriptions)
      .where(eq(pushSubscriptions.id, id));
    return subscription;
  }

  async createPushSubscription(data: InsertPushSubscription): Promise<PushSubscription> {
    const [subscription] = await db.insert(pushSubscriptions).values(data).returning();
    return subscription;
  }

  async updatePushSubscription(id: string, data: Partial<PushSubscription>): Promise<PushSubscription> {
    const [subscription] = await db.update(pushSubscriptions)
      .set({ ...data, lastUsedAt: new Date() })
      .where(eq(pushSubscriptions.id, id))
      .returning();
    return subscription;
  }

  async deletePushSubscription(id: string): Promise<void> {
    await db.update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.id, id));
  }

  // ==================== Push Notifications ====================

  async getPushNotifications(filters?: { userId?: string; customerId?: string; status?: string; type?: string }): Promise<PushNotification[]> {
    const conditions: any[] = [];
    if (filters?.userId) conditions.push(eq(pushNotifications.userId, filters.userId));
    if (filters?.customerId) conditions.push(eq(pushNotifications.customerId, filters.customerId));
    if (filters?.status) conditions.push(eq(pushNotifications.status, filters.status));
    if (filters?.type) conditions.push(eq(pushNotifications.notificationType, filters.type));
    
    return conditions.length > 0
      ? await db.select().from(pushNotifications).where(and(...conditions)).orderBy(desc(pushNotifications.createdAt)).limit(100)
      : await db.select().from(pushNotifications).orderBy(desc(pushNotifications.createdAt)).limit(100);
  }

  async getPushNotification(id: string): Promise<PushNotification | undefined> {
    const [notification] = await db.select().from(pushNotifications)
      .where(eq(pushNotifications.id, id));
    return notification;
  }

  async createPushNotification(data: InsertPushNotification): Promise<PushNotification> {
    const [notification] = await db.insert(pushNotifications).values(data).returning();
    return notification;
  }

  async updatePushNotification(id: string, data: Partial<PushNotification>): Promise<PushNotification> {
    const [notification] = await db.update(pushNotifications)
      .set(data)
      .where(eq(pushNotifications.id, id))
      .returning();
    return notification;
  }

  // Distinct from markNotificationAsRead: push_notifications and
  // notifications are separate tables with separate ids, and sharing one
  // method meant PATCH /api/notifications/:id/read matched nothing and
  // silently returned an empty body.
  async markPushNotificationAsRead(id: string): Promise<PushNotification> {
    const [notification] = await db.update(pushNotifications)
      .set({ status: 'read', readAt: new Date() })
      .where(eq(pushNotifications.id, id))
      .returning();
    return notification;
  }

  async markNotificationAsClicked(id: string): Promise<PushNotification> {
    const [notification] = await db.update(pushNotifications)
      .set({ status: 'clicked', clickedAt: new Date() })
      .where(eq(pushNotifications.id, id))
      .returning();
    return notification;
  }

  async sendPushNotification(notificationId: string): Promise<PushNotification> {
    const [notification] = await db.update(pushNotifications)
      .set({ status: 'sent', sentAt: new Date() })
      .where(eq(pushNotifications.id, notificationId))
      .returning();
    return notification;
  }

  async getUnreadNotificationCount(userId?: string, customerId?: string): Promise<number> {
    const conditions: any[] = [
      or(eq(pushNotifications.status, 'pending'), eq(pushNotifications.status, 'sent'))
    ];
    if (userId) conditions.push(eq(pushNotifications.userId, userId));
    if (customerId) conditions.push(eq(pushNotifications.customerId, customerId));
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(pushNotifications)
      .where(and(...conditions));
    
    return Number(result[0]?.count || 0);
  }

  // ==================== Notification Preferences ====================

  async getNotificationPreferences(userId: string): Promise<NotificationPreference | undefined> {
    if (!userId) return undefined;
    const [prefs] = await db.select().from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async upsertNotificationPreferences(data: InsertNotificationPreference): Promise<NotificationPreference> {
    // user_id is the table's primary key, so this is a plain ON CONFLICT
    // rather than a read-then-branch. The route is a PUT, so an existing row
    // is replaced wholesale — omitted fields fall back to their defaults.
    const [saved] = await db.insert(notificationPreferences)
      .values(data)
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          channel: data.channel ?? null,
          eventMap: data.eventMap ?? null,
          isLockedByAdmin: data.isLockedByAdmin ?? false,
        },
      })
      .returning();
    return saved;
  }

  // ==================== Auto Service Reminder Generation ====================

  async generateAutoServiceReminders(garageId?: string): Promise<ServiceReminder[]> {
    // Scope to a single garage — the unscoped version generated reminders for
    // every tenant's vehicles from every tenant's templates (cross-tenant + N+1).
    const templates = await this.getServiceReminderTemplates(garageId);
    const vehicles = await this.getVehicles(garageId);
    const generatedReminders: ServiceReminder[] = [];
    
    for (const template of templates) {
      for (const vehicle of vehicles) {
        if (template.vehicleMakes && template.vehicleMakes.length > 0) {
          if (!template.vehicleMakes.includes(vehicle.make || '')) continue;
        }
        
        const existingReminders = await this.getServiceRemindersByVehicle(vehicle.id);
        const hasActiveReminder = existingReminders.some(r => 
          r.maintenanceScheduleId?.toString() === template.serviceType && 
          (r.status === 'pending' || r.status === 'sent')
        );
        
        if (!hasActiveReminder && template.intervalDays) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + template.intervalDays - (template.advanceNoticeDays || 7));
          
          const [reminder] = await db.insert(serviceReminders).values({
            vehicleId: vehicle.id,
            customerId: vehicle.customerId,
            reminderType: 'scheduled',
            reminderTitle: template.name,
            reminderMessage: template.messageTemplate || `${template.name} is due for your ${vehicle.make} ${vehicle.model}`,
            triggerDate: dueDate,
            advanceDays: template.advanceNoticeDays || 7,
            status: 'pending',
            isActive: true,
          }).returning();

          generatedReminders.push(reminder);
        }
      }
    }

    return generatedReminders;
  }

  // ==================== Search methods (server-side filtered, OOM-safe) ====================

  async searchCustomers(garageId: string, pattern: string, limit: number): Promise<SafeUser[]> {
    const { users } = await import("@shared/schema").then(m => ({ users: m.users }));
    return (await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.garageId, garageId),
          eq(users.userType, 'customer'),
          or(
            like(users.fullName, pattern),
            like(users.email, pattern),
            like(users.phone, pattern)
          )
        )
      )
      .limit(limit)).map(stripPassword);
  }

  async searchVehicles(garageId: string, pattern: string, limit: number): Promise<Vehicle[]> {
    const { vehicles } = await import("@shared/schema").then(m => ({ vehicles: m.vehicles }));
    return await db
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.garageId, garageId),
          or(
            like(vehicles.licensePlate, pattern),
            like(vehicles.vin, pattern),
            like(vehicles.make, pattern),
            like(vehicles.model, pattern)
          )
        )
      )
      .limit(limit);
  }

  async searchParts(garageId: string, pattern: string, limit: number): Promise<SparePart[]> {
    const { spareParts, sparePartInventories } = await import("@shared/schema")
      .then(m => ({ spareParts: m.spareParts, sparePartInventories: m.sparePartInventories }));
    // spare_parts is a global catalogue with no garage_id — per-garage stock
    // lives in spare_part_inventories, so scoping goes through that table.
    // partNumber is likewise not a column; the catalogue identifiers are
    // sku and barcode.
    return await db
      .select()
      .from(spareParts)
      .where(
        and(
          sql`EXISTS (SELECT 1 FROM ${sparePartInventories} WHERE ${sparePartInventories.sparePartId} = ${spareParts.id} AND ${sparePartInventories.garageId} = ${garageId})`,
          or(
            like(spareParts.sku, pattern),
            like(spareParts.name, pattern),
            like(spareParts.description, pattern)
          )
        )
      )
      .limit(limit);
  }

  async searchInvoices(garageId: string, pattern: string, limit: number): Promise<Invoice[]> {
    const { invoices } = await import("@shared/schema").then(m => ({ invoices: m.invoices }));
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.garageId, garageId),
          like(invoices.invoiceNumber, pattern)
        )
      )
      .limit(limit);
  }

  async searchJobCards(garageId: string, pattern: string, limit: number): Promise<JobCard[]> {
    const { jobCards } = await import("@shared/schema").then(m => ({ jobCards: m.jobCards }));
    return await db
      .select()
      .from(jobCards)
      .where(
        and(
          eq(jobCards.garageId, garageId),
          or(
            ilike(jobCards.jobNumber, pattern),
            ilike(jobCards.serviceType, pattern)
          )
        )
      )
      .limit(limit);
  }

  async searchAppointments(garageId: string, pattern: string, limit: number): Promise<Appointment[]> {
    const { appointments } = await import("@shared/schema").then(m => ({ appointments: m.appointments }));
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.garageId, garageId),
          or(
            ilike(appointments.notes, pattern),
            ilike(appointments.serviceType, pattern)
          )
        )
      )
      .limit(limit);
  }

  // ==================== Paginated list methods (SA-017) ====================

  async getCustomersPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SafeUser[]> {
    const { users } = await import("@shared/schema").then(m => ({ users: m.users }));
    const baseWhere = eq(users.userType, 'customer');
    const where = garageId ? and(baseWhere, eq(users.garageId, garageId)) : baseWhere;
    return (await db
      .select()
      .from(users)
      .where(where)
      .orderBy(users.createdAt)
      .limit(limit)
      .offset(offset)).map(stripPassword);
  }

  async countCustomers(garageId: string | undefined): Promise<number> {
    const { users } = await import("@shared/schema").then(m => ({ users: m.users }));
    const baseWhere = eq(users.userType, 'customer');
    const where = garageId ? and(baseWhere, eq(users.garageId, garageId)) : baseWhere;
    const result = await db.select({ count: sql<number>`count(*)` }).from(users).where(where);
    return Number(result[0]?.count ?? 0);
  }

  async getVehiclesPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Vehicle[]> {
    const { vehicles } = await import("@shared/schema").then(m => ({ vehicles: m.vehicles }));
    const where = garageId ? eq(vehicles.garageId, garageId) : undefined;
    const query = db.select().from(vehicles);
    if (where) {
      return await query.where(where).orderBy(vehicles.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(vehicles.createdAt).limit(limit).offset(offset);
  }

  async countVehicles(garageId: string | undefined): Promise<number> {
    const { vehicles } = await import("@shared/schema").then(m => ({ vehicles: m.vehicles }));
    const where = garageId ? eq(vehicles.garageId, garageId) : undefined;
    const query = db.select({ count: sql<number>`count(*)` }).from(vehicles);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  async getJobCardsPaginated(garageId: string | undefined, assignedTo: string | undefined, limit: number, offset: number): Promise<JobCard[]> {
    const { jobCards } = await import("@shared/schema").then(m => ({ jobCards: m.jobCards }));
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(jobCards.garageId, garageId));
    if (assignedTo) conditions.push(eq(jobCards.assignedTo, assignedTo));
    const where = conditions.length > 1 ? and(...conditions) : conditions[0];
    const query = db.select().from(jobCards);
    if (where) {
      return await query.where(where).orderBy(jobCards.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(jobCards.createdAt).limit(limit).offset(offset);
  }

  async countJobCards(garageId: string | undefined, assignedTo: string | undefined): Promise<number> {
    const { jobCards } = await import("@shared/schema").then(m => ({ jobCards: m.jobCards }));
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(jobCards.garageId, garageId));
    if (assignedTo) conditions.push(eq(jobCards.assignedTo, assignedTo));
    const where = conditions.length > 1 ? and(...conditions) : conditions[0];
    const query = db.select({ count: sql<number>`count(*)` }).from(jobCards);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  async getInvoicesPaginated(garageId: string | undefined, status: string | undefined, limit: number, offset: number): Promise<Invoice[]> {
    const { invoices } = await import("@shared/schema").then(m => ({ invoices: m.invoices }));
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(invoices.garageId, garageId));
    if (status) conditions.push(eq(invoices.status, status));
    const where = conditions.length > 1 ? and(...conditions) : conditions[0];
    const query = db.select().from(invoices);
    if (where) {
      return await query.where(where).orderBy(invoices.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(invoices.createdAt).limit(limit).offset(offset);
  }

  async countInvoices(garageId: string | undefined, status: string | undefined): Promise<number> {
    const { invoices } = await import("@shared/schema").then(m => ({ invoices: m.invoices }));
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(invoices.garageId, garageId));
    if (status) conditions.push(eq(invoices.status, status));
    const where = conditions.length > 1 ? and(...conditions) : conditions[0];
    const query = db.select({ count: sql<number>`count(*)` }).from(invoices);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  async getAppointmentsPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Appointment[]> {
    const { appointments } = await import("@shared/schema").then(m => ({ appointments: m.appointments }));
    const where = garageId ? eq(appointments.garageId, garageId) : undefined;
    const query = db.select().from(appointments);
    if (where) {
      return await query.where(where).orderBy(appointments.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(appointments.createdAt).limit(limit).offset(offset);
  }

  async countAppointments(garageId: string | undefined): Promise<number> {
    const { appointments } = await import("@shared/schema").then(m => ({ appointments: m.appointments }));
    const where = garageId ? eq(appointments.garageId, garageId) : undefined;
    const query = db.select({ count: sql<number>`count(*)` }).from(appointments);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  async getSparePartsPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SparePart[]> {
    const { spareParts, sparePartInventories } = await import("@shared/schema")
      .then(m => ({ spareParts: m.spareParts, sparePartInventories: m.sparePartInventories }));
    // Scoped through spare_part_inventories: the catalogue itself is global.
    const where = garageId
      ? sql`EXISTS (SELECT 1 FROM ${sparePartInventories} WHERE ${sparePartInventories.sparePartId} = ${spareParts.id} AND ${sparePartInventories.garageId} = ${garageId})`
      : undefined;
    const query = db.select().from(spareParts);
    if (where) {
      return await query.where(where).orderBy(spareParts.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(spareParts.createdAt).limit(limit).offset(offset);
  }

  async countSpareParts(garageId: string | undefined): Promise<number> {
    const { spareParts, sparePartInventories } = await import("@shared/schema")
      .then(m => ({ spareParts: m.spareParts, sparePartInventories: m.sparePartInventories }));
    const where = garageId
      ? sql`EXISTS (SELECT 1 FROM ${sparePartInventories} WHERE ${sparePartInventories.sparePartId} = ${spareParts.id} AND ${sparePartInventories.garageId} = ${garageId})`
      : undefined;
    const query = db.select({ count: sql<number>`count(*)` }).from(spareParts);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  async getSuppliersPaginated(garageId: string | undefined, limit: number, offset: number): Promise<any[]> {
    const { suppliers } = await import("@shared/schema").then(m => ({ suppliers: m.suppliers }));
    const where = garageId ? eq(suppliers.garageId, garageId) : undefined;
    const query = db.select().from(suppliers);
    if (where) {
      return await query.where(where).orderBy(suppliers.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(suppliers.createdAt).limit(limit).offset(offset);
  }

  async countSuppliers(garageId: string | undefined): Promise<number> {
    const { suppliers } = await import("@shared/schema").then(m => ({ suppliers: m.suppliers }));
    const where = garageId ? eq(suppliers.garageId, garageId) : undefined;
    const query = db.select({ count: sql<number>`count(*)` }).from(suppliers);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  async getGaragesPaginated(limit: number, offset: number): Promise<any[]> {
    const { garages } = await import("@shared/schema").then(m => ({ garages: m.garages }));
    return await db.select().from(garages).orderBy(garages.createdAt).limit(limit).offset(offset);
  }

  async countGarages(): Promise<number> {
    const { garages } = await import("@shared/schema").then(m => ({ garages: m.garages }));
    const result = await db.select({ count: sql<number>`count(*)` }).from(garages);
    return Number(result[0]?.count ?? 0);
  }

  async getTechniciansPaginated(garageId: string | undefined, limit: number, offset: number): Promise<SafeUser[]> {
    const { users } = await import("@shared/schema").then(m => ({ users: m.users }));
    const baseWhere = eq(users.userType, 'technician');
    const where = garageId ? and(baseWhere, eq(users.garageId, garageId)) : baseWhere;
    return (await db.select().from(users).where(where).orderBy(users.createdAt).limit(limit).offset(offset)).map(stripPassword);
  }

  async countTechnicians(garageId: string | undefined): Promise<number> {
    const { users } = await import("@shared/schema").then(m => ({ users: m.users }));
    const baseWhere = eq(users.userType, 'technician');
    const where = garageId ? and(baseWhere, eq(users.garageId, garageId)) : baseWhere;
    const result = await db.select({ count: sql<number>`count(*)` }).from(users).where(where);
    return Number(result[0]?.count ?? 0);
  }

  async getEstimatesPaginated(garageId: string | undefined, status: string | undefined, limit: number, offset: number): Promise<any[]> {
    const { estimates } = await import("@shared/schema").then(m => ({ estimates: m.estimates }));
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(estimates.garageId, garageId));
    if (status) conditions.push(eq(estimates.status, status));
    const where = conditions.length > 1 ? and(...conditions) : conditions[0];
    const query = db.select().from(estimates);
    if (where) {
      return await query.where(where).orderBy(estimates.createdAt).limit(limit).offset(offset);
    }
    return await query.orderBy(estimates.createdAt).limit(limit).offset(offset);
  }

  async countEstimates(garageId: string | undefined, status: string | undefined): Promise<number> {
    const { estimates } = await import("@shared/schema").then(m => ({ estimates: m.estimates }));
    const conditions: any[] = [];
    if (garageId) conditions.push(eq(estimates.garageId, garageId));
    if (status) conditions.push(eq(estimates.status, status));
    const where = conditions.length > 1 ? and(...conditions) : conditions[0];
    const query = db.select({ count: sql<number>`count(*)` }).from(estimates);
    const result = where ? await query.where(where) : await query;
    return Number(result[0]?.count ?? 0);
  }

  // ==========================================================================
  // Kiosk queue
  // ==========================================================================

  async listKioskTickets(filter?: { statuses?: string[] }): Promise<KioskTicket[]> {
    const base = db.select().from(kioskTickets);
    const rows = filter?.statuses?.length
      ? await base.where(inArray(kioskTickets.status, filter.statuses))
      : await base;
    // Queue order is arrival order; callers derive position from this.
    return rows.sort(
      (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
    );
  }

  async getKioskTicket(id: string): Promise<KioskTicket | undefined> {
    // Callers pass a user-supplied path segment that may not be a uuid, and a
    // malformed uuid makes Postgres raise rather than return no rows.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return undefined;
    }
    const [row] = await db.select().from(kioskTickets).where(eq(kioskTickets.id, id));
    return row;
  }

  async getKioskTicketByNumber(ticketNumber: string): Promise<KioskTicket | undefined> {
    const [row] = await db
      .select()
      .from(kioskTickets)
      .where(eq(kioskTickets.ticketNumber, ticketNumber));
    return row;
  }

  async getNextKioskTicketNumber(): Promise<string> {
    // Tickets reset daily: A-001, A-002, ... scoped to today's rows.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(kioskTickets)
      .where(gte(kioskTickets.createdAt, startOfDay));
    const next = Number(row?.count ?? 0) + 1;
    return `A-${String(next).padStart(3, "0")}`;
  }

  /** Guards against issuing a second ticket for an appointment already checked in. */
  async findKioskTicketByAppointment(
    appointmentId: string,
  ): Promise<KioskTicket | undefined> {
    const [row] = await db
      .select()
      .from(kioskTickets)
      .where(
        and(
          eq(kioskTickets.appointmentId, appointmentId),
          inArray(kioskTickets.status, ["waiting", "in-progress"]),
        ),
      );
    return row;
  }

  /** Same guard for walk-ins, which are identified by phone rather than appointment. */
  async findActiveKioskTicketByPhone(phone: string): Promise<KioskTicket | undefined> {
    const [row] = await db
      .select()
      .from(kioskTickets)
      .where(
        and(
          eq(kioskTickets.phone, phone),
          inArray(kioskTickets.status, ["waiting", "in-progress"]),
        ),
      );
    return row;
  }

  async createKioskTicket(data: InsertKioskTicket): Promise<KioskTicket> {
    const [row] = await db.insert(kioskTickets).values(data).returning();
    return row;
  }

  async updateKioskTicket(
    id: string,
    data: Partial<InsertKioskTicket>,
  ): Promise<KioskTicket | undefined> {
    const [row] = await db
      .update(kioskTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(kioskTickets.id, id))
      .returning();
    return row;
  }

  // ==========================================================================
  // Backup history
  // ==========================================================================

  async listBackupHistory(): Promise<BackupHistory[]> {
    return await db.select().from(backupHistory).orderBy(desc(backupHistory.createdAt));
  }

  // Named *BackupHistory rather than *Backup: getLatestBackup/getBackupStats
  // already exist above for the garage-scoped backup_jobs table, which the
  // legacy monolith uses. These operate on backup_history and take no garage.
  async getLatestBackupHistory(): Promise<BackupHistory | undefined> {
    const [row] = await db
      .select()
      .from(backupHistory)
      .orderBy(desc(backupHistory.createdAt))
      .limit(1);
    return row;
  }

  async getBackupHistoryStats(): Promise<{ count: number; totalSize: number }> {
    const [row] = await db
      .select({
        count: sql<number>`count(*)`,
        totalSize: sql<number>`coalesce(sum(${backupHistory.size}), 0)`,
      })
      .from(backupHistory);
    return { count: Number(row?.count ?? 0), totalSize: Number(row?.totalSize ?? 0) };
  }

  async createBackupHistory(data: InsertBackupHistory): Promise<BackupHistory> {
    const [row] = await db.insert(backupHistory).values(data).returning();
    return row;
  }

  // ==========================================================================
  // Currency transactions
  // ==========================================================================

  async listCurrencyTransactions(filter?: {
    type?: string;
    currency?: string;
    limit?: number;
  }, garageId?: string): Promise<CurrencyTransaction[]> {
    const conditions: any[] = [];
    // Tenant scope (B5): only the caller's garage when provided.
    if (garageId) conditions.push(eq(currencyTransactions.garageId, garageId));
    if (filter?.type) conditions.push(eq(currencyTransactions.type, filter.type));
    if (filter?.currency)
      conditions.push(eq(currencyTransactions.originalCurrency, filter.currency));

    const query = db
      .select()
      .from(currencyTransactions)
      .orderBy(desc(currencyTransactions.txDate))
      .limit(filter?.limit ?? 50);

    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async createCurrencyTransaction(
    data: InsertCurrencyTransaction,
  ): Promise<CurrencyTransaction> {
    const [row] = await db.insert(currencyTransactions).values(data).returning();
    return row;
  }

  // ==========================================================================
  // Document library
  // ==========================================================================

  async listDocumentLibraryItems(filter?: {
    category?: string;
    tag?: string;
    search?: string;
  }, garageId?: string): Promise<DocumentLibraryItem[]> {
    const conditions: any[] = [];
    // Tenant scope (B5): only the caller's garage when provided.
    if (garageId) conditions.push(eq(documentLibraryItems.garageId, garageId));
    if (filter?.category) conditions.push(eq(documentLibraryItems.category, filter.category));
    if (filter?.search) conditions.push(ilike(documentLibraryItems.name, `%${filter.search}%`));
    // tags is jsonb; containment keeps the match inside Postgres.
    if (filter?.tag)
      conditions.push(sql`${documentLibraryItems.tags} @> ${JSON.stringify([filter.tag])}::jsonb`);

    const query = db
      .select()
      .from(documentLibraryItems)
      .orderBy(desc(documentLibraryItems.createdAt));

    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async getDocumentLibraryItem(id: string, garageId?: string): Promise<DocumentLibraryItem | undefined> {
    const [row] = await db
      .select()
      .from(documentLibraryItems)
      .where(and(eq(documentLibraryItems.id, id), garageId ? eq(documentLibraryItems.garageId, garageId) : undefined));
    return row;
  }

  async createDocumentLibraryItem(
    data: InsertDocumentLibraryItem,
  ): Promise<DocumentLibraryItem> {
    const [row] = await db.insert(documentLibraryItems).values(data).returning();
    return row;
  }

  async deleteDocumentLibraryItem(id: string, garageId?: string): Promise<boolean> {
    // Tenant scope (verification audit): a cross-tenant delete deletes nothing.
    const rows = await db
      .delete(documentLibraryItems)
      .where(and(eq(documentLibraryItems.id, id), garageId ? eq(documentLibraryItems.garageId, garageId) : undefined))
      .returning();
    return rows.length > 0;
  }

  // ==========================================================================
  // Quality control
  // ==========================================================================

  async listQcInspections(filter?: {
    result?: string;
    inspector?: string;
  }): Promise<QcInspection[]> {
    const conditions: any[] = [];
    if (filter?.result) conditions.push(eq(qcInspections.result, filter.result));
    if (filter?.inspector) conditions.push(eq(qcInspections.inspector, filter.inspector));

    const query = db.select().from(qcInspections).orderBy(desc(qcInspections.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async createQcInspection(data: InsertQcInspection): Promise<QcInspection> {
    const [row] = await db.insert(qcInspections).values(data).returning();
    return row;
  }

  async updateQcInspection(
    id: string,
    data: Partial<InsertQcInspection>,
  ): Promise<QcInspection | undefined> {
    const [row] = await db
      .update(qcInspections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(qcInspections.id, id))
      .returning();
    return row;
  }

  async listQcDefects(filter?: {
    severity?: string;
    status?: string;
    category?: string;
  }): Promise<QcDefect[]> {
    const conditions: any[] = [];
    if (filter?.severity) conditions.push(eq(qcDefects.severity, filter.severity));
    if (filter?.status) conditions.push(eq(qcDefects.status, filter.status));
    if (filter?.category) conditions.push(eq(qcDefects.category, filter.category));

    const query = db.select().from(qcDefects).orderBy(desc(qcDefects.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async createQcDefect(data: InsertQcDefect): Promise<QcDefect> {
    const [row] = await db.insert(qcDefects).values(data).returning();
    return row;
  }

  // ==========================================================================
  // Fleet accounts
  // ==========================================================================

  async listFleetAccounts(garageId?: string): Promise<FleetAccount[]> {
    // Tenant scope (B5): only the caller's garage when provided.
    const q = db.select().from(fleetAccounts).orderBy(desc(fleetAccounts.createdAt));
    return garageId ? await q.where(eq(fleetAccounts.garageId, garageId)) : await q;
  }

  async getFleetAccount(id: string, garageId?: string): Promise<FleetAccount | undefined> {
    const [row] = await db.select().from(fleetAccounts)
      .where(and(eq(fleetAccounts.id, id), garageId ? eq(fleetAccounts.garageId, garageId) : undefined));
    return row;
  }

  async createFleetAccount(data: InsertFleetAccount): Promise<FleetAccount> {
    const [row] = await db.insert(fleetAccounts).values(data).returning();
    return row;
  }

  /** Without an account id this returns every vehicle — the list route needs
   *  the full set to compute per-account counts in one pass. */
  async listFleetAccountVehicles(fleetAccountId?: string): Promise<FleetAccountVehicle[]> {
    const query = db.select().from(fleetAccountVehicles);
    return fleetAccountId
      ? await query.where(eq(fleetAccountVehicles.fleetAccountId, fleetAccountId))
      : await query;
  }

  async listFleetMaintenanceEntries(
    fleetAccountId?: string,
  ): Promise<FleetMaintenanceEntry[]> {
    const query = db
      .select()
      .from(fleetMaintenanceEntries)
      .orderBy(asc(fleetMaintenanceEntries.scheduledDate));
    return fleetAccountId
      ? await query.where(eq(fleetMaintenanceEntries.fleetAccountId, fleetAccountId))
      : await query;
  }

  // ==========================================================================
  // Mobile devices (garage-scoped)
  // ==========================================================================

  async getMobileDevices(garageId: string): Promise<MobileDevice[]> {
    return await db
      .select()
      .from(mobileDevices)
      .where(eq(mobileDevices.garageId, garageId))
      .orderBy(desc(mobileDevices.createdAt));
  }

  async createMobileDevice(
    garageId: string,
    data: Omit<InsertMobileDevice, "garageId">,
  ): Promise<MobileDevice> {
    // garageId comes from the session, never the request body, so a caller
    // cannot plant a device in another tenant's garage.
    const [row] = await db
      .insert(mobileDevices)
      .values({ ...data, garageId })
      .returning();
    return row;
  }

  async updateMobileDevice(
    id: string,
    garageId: string,
    data: Partial<Omit<InsertMobileDevice, "garageId">>,
  ): Promise<MobileDevice | undefined> {
    const [row] = await db
      .update(mobileDevices)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(mobileDevices.id, id), eq(mobileDevices.garageId, garageId)))
      .returning();
    return row;
  }

  async deleteMobileDevice(id: string, garageId: string): Promise<boolean> {
    const rows = await db
      .delete(mobileDevices)
      .where(and(eq(mobileDevices.id, id), eq(mobileDevices.garageId, garageId)))
      .returning();
    return rows.length > 0;
  }

  // ==========================================================================
  // Subscriptions
  // ==========================================================================

  async listAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  /** Every garage is treated as having a subscription; absent rows default to
   *  the STARTER plan rather than forcing callers to handle undefined. */
  async ensureSubscription(garageId: string): Promise<Subscription> {
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.garageId, garageId));
    if (existing) return existing;

    const [created] = await db
      .insert(subscriptions)
      .values({ garageId, plan: "STARTER", status: "active" })
      .onConflictDoNothing({ target: subscriptions.garageId })
      .returning();
    if (created) return created;

    // Lost an insert race; the winning row is now present.
    const [row] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.garageId, garageId));
    return row;
  }

  async updateSubscription(
    garageId: string,
    data: Partial<Omit<InsertSubscription, "garageId">>,
  ): Promise<Subscription | undefined> {
    await this.ensureSubscription(garageId);
    const [row] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.garageId, garageId))
      .returning();
    return row;
  }

  // ==========================================================================
  // Platform SuperAdmin — garage onboarding applications
  // ==========================================================================

  async createGarageApplication(data: InsertGarageApplication): Promise<GarageApplication> {
    const [row] = await db.insert(garageApplications).values(data).returning();
    return row;
  }

  async listGarageApplications(status?: string): Promise<GarageApplication[]> {
    const query = db.select().from(garageApplications).orderBy(desc(garageApplications.createdAt));
    return status ? await query.where(eq(garageApplications.status, status)) : await query;
  }

  async getGarageApplication(id: string): Promise<GarageApplication | undefined> {
    const [row] = await db.select().from(garageApplications).where(eq(garageApplications.id, id));
    return row;
  }

  /**
   * Approve a pending garage application: atomically provision the garage, its
   * owner user (role ADMIN), and a trial subscription, then mark the
   * application approved. `hashedPassword` is prepared by the caller (the route
   * has the hashing util); the plaintext is never stored here. Idempotent: a
   * second approve returns the already-provisioned result without duplicating.
   */
  async approveGarageApplication(
    id: string,
    reviewerId: string | null,
    opts?: { hashedPassword?: string; autoApproved?: boolean },
  ): Promise<{ application: GarageApplication; garageId: string; ownerUserId: string }> {
    return await db.transaction(async (tx) => {
      const [app] = await tx
        .select()
        .from(garageApplications)
        .where(eq(garageApplications.id, id))
        .for("update");
      if (!app) throw new Error("Application not found");

      if (app.status === "approved" && app.provisionedGarageId && app.provisionedUserId) {
        return { application: app, garageId: app.provisionedGarageId, ownerUserId: app.provisionedUserId };
      }
      if (app.status === "rejected") {
        throw new Error("Application already rejected");
      }

      // Prefer the applicant's own password (hashed at submit); fall back to a
      // reviewer-provided temp hash. One of the two must be present.
      const password = app.ownerPasswordHash ?? opts?.hashedPassword;
      if (!password) {
        throw new Error("No password available to provision the owner account");
      }

      const [garage] = await tx
        .insert(garages)
        .values({
          name: app.businessName,
          city: app.city,
          country: app.country,
          isActive: true,
          subscriptionPlan: app.requestedPlan,
          businessType: app.providerType ?? "garage",
        } as any)
        .returning();

      const [owner] = await tx
        .insert(users)
        .values({
          email: app.email,
          password,
          fullName: app.ownerName,
          phone: app.phone,
          role: "ADMIN",
          userType: "admin",
          garageId: garage.id,
          isActive: true,
        } as any)
        .returning();

      await tx
        .insert(subscriptions)
        .values({ garageId: garage.id, plan: app.requestedPlan, status: "trialing" } as any)
        .onConflictDoNothing({ target: subscriptions.garageId });

      const [updated] = await tx
        .update(garageApplications)
        .set({
          status: "approved",
          autoApproved: opts?.autoApproved ?? false,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          provisionedGarageId: garage.id,
          provisionedUserId: owner.id,
          updatedAt: new Date(),
        })
        .where(eq(garageApplications.id, id))
        .returning();

      return { application: updated, garageId: garage.id, ownerUserId: owner.id };
    });
  }

  async rejectGarageApplication(
    id: string,
    reviewerId: string,
    reason?: string,
  ): Promise<GarageApplication | undefined> {
    const [row] = await db
      .update(garageApplications)
      .set({
        status: "rejected",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: reason ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(garageApplications.id, id), eq(garageApplications.status, "pending")))
      .returning();
    return row;
  }

  // ==========================================================================
  // Platform SuperAdmin — subscription change requests
  // ==========================================================================

  async createSubscriptionRequest(data: InsertSubscriptionRequest): Promise<SubscriptionRequest> {
    const [row] = await db.insert(subscriptionRequests).values(data).returning();
    return row;
  }

  async listSubscriptionRequests(status?: string): Promise<SubscriptionRequest[]> {
    const query = db.select().from(subscriptionRequests).orderBy(desc(subscriptionRequests.createdAt));
    return status ? await query.where(eq(subscriptionRequests.status, status)) : await query;
  }

  /** A garage's own most-recent pending request (used to prevent duplicates). */
  async getPendingSubscriptionRequest(garageId: string): Promise<SubscriptionRequest | undefined> {
    const [row] = await db
      .select()
      .from(subscriptionRequests)
      .where(and(eq(subscriptionRequests.garageId, garageId), eq(subscriptionRequests.status, "pending")))
      .orderBy(desc(subscriptionRequests.createdAt))
      .limit(1);
    return row;
  }

  /** Approve a pending request: atomically apply the plan to both the
   *  subscription row and the garage's cached plan, then mark it approved. */
  async approveSubscriptionRequest(
    id: string,
    reviewerId: string,
  ): Promise<SubscriptionRequest | undefined> {
    return await db.transaction(async (tx) => {
      const [reqRow] = await tx
        .select()
        .from(subscriptionRequests)
        .where(eq(subscriptionRequests.id, id))
        .for("update");
      if (!reqRow) return undefined;
      if (reqRow.status !== "pending") {
        throw new Error(`Request is already ${reqRow.status}`);
      }

      await tx
        .insert(subscriptions)
        .values({ garageId: reqRow.garageId, plan: reqRow.requestedPlan, status: "active" } as any)
        .onConflictDoUpdate({
          target: subscriptions.garageId,
          set: { plan: reqRow.requestedPlan, updatedAt: new Date() },
        });

      await tx
        .update(garages)
        .set({ subscriptionPlan: reqRow.requestedPlan })
        .where(eq(garages.id, reqRow.garageId));

      const [updated] = await tx
        .update(subscriptionRequests)
        .set({ status: "approved", reviewedBy: reviewerId, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriptionRequests.id, id))
        .returning();
      return updated;
    });
  }

  async rejectSubscriptionRequest(
    id: string,
    reviewerId: string,
    reason?: string,
  ): Promise<SubscriptionRequest | undefined> {
    const [row] = await db
      .update(subscriptionRequests)
      .set({
        status: "rejected",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: reason ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(subscriptionRequests.id, id), eq(subscriptionRequests.status, "pending")))
      .returning();
    return row;
  }

  // ==========================================================================
  // Customer marketplace — a customer's own vehicles (all scoped to customerId)
  // ==========================================================================

  async listCustomerVehicles(customerId: string): Promise<CustomerVehicle[]> {
    return await db
      .select()
      .from(customerVehicles)
      .where(and(eq(customerVehicles.customerId, customerId), eq(customerVehicles.isActive, true)))
      .orderBy(desc(customerVehicles.createdAt));
  }

  async getCustomerVehicle(id: string, customerId: string): Promise<CustomerVehicle | undefined> {
    const [row] = await db
      .select()
      .from(customerVehicles)
      .where(and(eq(customerVehicles.id, id), eq(customerVehicles.customerId, customerId)));
    return row;
  }

  async createCustomerVehicle(data: InsertCustomerVehicle & { customerId: string }): Promise<CustomerVehicle> {
    const [row] = await db.insert(customerVehicles).values(data).returning();
    return row;
  }

  async updateCustomerVehicle(
    id: string,
    data: Partial<InsertCustomerVehicle>,
    customerId: string,
  ): Promise<CustomerVehicle | undefined> {
    // Ownership is enforced in the WHERE — another customer's id matches nothing.
    const [row] = await db
      .update(customerVehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(customerVehicles.id, id), eq(customerVehicles.customerId, customerId)))
      .returning();
    return row;
  }

  async deleteCustomerVehicle(id: string, customerId: string): Promise<void> {
    // Soft-delete so history/bookings that referenced it stay intact.
    await db
      .update(customerVehicles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(customerVehicles.id, id), eq(customerVehicles.customerId, customerId)));
  }

  // ==========================================================================
  // Customer marketplace — public provider directory
  // ==========================================================================

  /** List active, approved providers customers can browse. Today providers are
   *  garages; parts_store / insurance types return empty until provisioned. */
  async listMarketplaceProviders(opts?: { type?: string; q?: string; city?: string }): Promise<any[]> {
    const conditions: any[] = [eq(garages.isActive, true)];
    if (opts?.type) conditions.push(eq(garages.businessType, opts.type));
    if (opts?.q) conditions.push(ilike(garages.name, `%${opts.q}%`));
    if (opts?.city) conditions.push(ilike(garages.city, `%${opts.city}%`));
    const rows = await db
      .select({
        id: garages.id,
        name: garages.name,
        city: garages.city,
        country: garages.country,
        providerType: garages.businessType,
        createdAt: garages.createdAt,
      })
      .from(garages)
      .where(and(...conditions))
      .orderBy(desc(garages.createdAt))
      .limit(100);
    return rows;
  }

  async getMarketplaceProvider(id: string): Promise<any | undefined> {
    const [g] = await db
      .select({
        id: garages.id,
        name: garages.name,
        city: garages.city,
        country: garages.country,
        providerType: garages.businessType,
        createdAt: garages.createdAt,
      })
      .from(garages)
      .where(and(eq(garages.id, id), eq(garages.isActive, true)));
    if (!g) return undefined;
    const services = await db
      .select({
        id: serviceTemplates.id,
        name: serviceTemplates.name,
        category: serviceTemplates.category,
        description: serviceTemplates.description,
        estimatedHours: serviceTemplates.estimatedHours,
        standardCost: serviceTemplates.standardCost,
      })
      .from(serviceTemplates)
      .where(and(eq(serviceTemplates.garageId, id), eq(serviceTemplates.isActive, true)))
      .orderBy(asc(serviceTemplates.name));
    return { ...g, services };
  }

  /** Smart search across providers and the services they offer. Returns both a
   *  provider hit list (name match) and service hits (name/category match)
   *  annotated with their provider, so a customer can search a service and find
   *  who offers it. */
  async searchMarketplace(query: string): Promise<{ providers: any[]; services: any[] }> {
    const q = `%${query}%`;
    const providers = await db
      .select({ id: garages.id, name: garages.name, city: garages.city, country: garages.country, providerType: garages.businessType })
      .from(garages)
      .where(and(eq(garages.isActive, true), ilike(garages.name, q)))
      .limit(25);

    const services = await db
      .select({
        id: serviceTemplates.id,
        name: serviceTemplates.name,
        category: serviceTemplates.category,
        standardCost: serviceTemplates.standardCost,
        providerId: garages.id,
        providerName: garages.name,
        providerCity: garages.city,
      })
      .from(serviceTemplates)
      .innerJoin(garages, eq(serviceTemplates.garageId, garages.id))
      .where(
        and(
          eq(garages.isActive, true),
          eq(serviceTemplates.isActive, true),
          or(ilike(serviceTemplates.name, q), ilike(serviceTemplates.category, q)),
        ),
      )
      .limit(50);

    return { providers, services };
  }

  // ==========================================================================
  // Knowledge base
  // ==========================================================================

  async getArticleCategories(): Promise<any[]> {
    return await db.select().from(articleCategories).orderBy(asc(articleCategories.sortOrder));
  }

  async getKnowledgeArticles(categoryId?: string, isPublished?: boolean): Promise<any[]> {
    const conditions: any[] = [];
    if (categoryId) conditions.push(eq(knowledgeArticles.categoryId, categoryId));
    if (isPublished !== undefined)
      conditions.push(eq(knowledgeArticles.isPublished, isPublished));

    const query = db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async getKnowledgeArticle(id: string): Promise<any | undefined> {
    const [row] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id));
    return row;
  }

  /** Incremented in SQL rather than read-modify-write so concurrent views
   *  cannot lose counts. */
  async incrementArticleViews(id: string): Promise<void> {
    await db
      .update(knowledgeArticles)
      .set({ views: sql`coalesce(${knowledgeArticles.views}, 0) + 1` })
      .where(eq(knowledgeArticles.id, id));
  }

  // ==========================================================================
  // Training and certifications
  // ==========================================================================

  async getTrainingModules(isActive?: boolean): Promise<any[]> {
    const query = db.select().from(trainingModules).orderBy(desc(trainingModules.createdAt));
    return isActive !== undefined
      ? await query.where(eq(trainingModules.isActive, isActive))
      : await query;
  }

  async getCertifications(isActive?: boolean): Promise<any[]> {
    const query = db.select().from(certifications).orderBy(desc(certifications.createdAt));
    return isActive !== undefined
      ? await query.where(eq(certifications.isActive, isActive))
      : await query;
  }

  async getCertificationAttempts(
    userId?: string,
    certificationId?: string,
  ): Promise<any[]> {
    const conditions: any[] = [];
    if (userId) conditions.push(eq(certificationAttempts.userId, userId));
    if (certificationId)
      conditions.push(eq(certificationAttempts.certificationId, certificationId));

    const query = db
      .select()
      .from(certificationAttempts)
      .orderBy(desc(certificationAttempts.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  // ==========================================================================
  // Google My Business
  // ==========================================================================

  async getGoogleBusinessProfiles(garageId?: string): Promise<any[]> {
    const query = db
      .select()
      .from(googleBusinessProfiles)
      .orderBy(desc(googleBusinessProfiles.createdAt));
    return garageId
      ? await query.where(eq(googleBusinessProfiles.garageId, garageId))
      : await query;
  }

  async getGmbPosts(profileId?: string, status?: string): Promise<any[]> {
    const conditions: any[] = [];
    if (profileId) conditions.push(eq(gmbPosts.profileId, profileId));
    if (status) conditions.push(eq(gmbPosts.status, status));

    const query = db.select().from(gmbPosts).orderBy(desc(gmbPosts.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async getGmbReviews(profileId?: string): Promise<any[]> {
    const query = db.select().from(gmbReviews).orderBy(desc(gmbReviews.reviewDate));
    return profileId ? await query.where(eq(gmbReviews.profileId, profileId)) : await query;
  }

  // ==========================================================================
  // Scheduling optimisation history
  // ==========================================================================

  async createSchedulingOptimizationRun(
    data: InsertSchedulingOptimizationRun,
  ): Promise<SchedulingOptimizationRun> {
    const [row] = await db.insert(schedulingOptimizationRuns).values(data).returning();
    return row;
  }

  async listSchedulingOptimizationRuns(
    limit = 20,
  ): Promise<SchedulingOptimizationRun[]> {
    return await db
      .select()
      .from(schedulingOptimizationRuns)
      .orderBy(desc(schedulingOptimizationRuns.runAt))
      .limit(limit);
  }

  // ==========================================================================
  // HR leave requests
  // ==========================================================================

  async listLeaveRequestEntries(filter?: {
    status?: string;
    employeeId?: string;
  }): Promise<HrLeaveRequestEntry[]> {
    const conditions: any[] = [];
    if (filter?.status) conditions.push(eq(hrLeaveRequestEntries.status, filter.status));
    if (filter?.employeeId)
      conditions.push(eq(hrLeaveRequestEntries.employeeId, filter.employeeId));

    const query = db
      .select()
      .from(hrLeaveRequestEntries)
      .orderBy(desc(hrLeaveRequestEntries.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  /** Counts every status in one grouped query rather than three round trips. */
  async countLeaveRequestEntriesByStatus(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const rows = await db
      .select({
        status: hrLeaveRequestEntries.status,
        count: sql<number>`count(*)`,
      })
      .from(hrLeaveRequestEntries)
      .groupBy(hrLeaveRequestEntries.status);

    const counts = { pending: 0, approved: 0, rejected: 0 };
    for (const r of rows) {
      if (r.status in counts) counts[r.status as keyof typeof counts] = Number(r.count);
    }
    return counts;
  }

  async createLeaveRequestEntry(
    data: InsertHrLeaveRequestEntry,
  ): Promise<HrLeaveRequestEntry> {
    const [row] = await db.insert(hrLeaveRequestEntries).values(data).returning();
    return row;
  }

  async updateLeaveRequestEntry(
    id: string,
    data: Partial<InsertHrLeaveRequestEntry>,
  ): Promise<HrLeaveRequestEntry | undefined> {
    const [row] = await db
      .update(hrLeaveRequestEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hrLeaveRequestEntries.id, id))
      .returning();
    return row;
  }

  // ==========================================================================
  // Smart contracts
  // ==========================================================================

  /** Garage-scoped: a wrong-tenant id matches no rows and yields undefined. */
  async updateSmartContractStatus(
    id: string,
    garageId: string,
    status: string,
  ): Promise<any | undefined> {
    const [row] = await db
      .update(smartContracts)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(smartContracts.id, id), eq(smartContracts.garageId, garageId)))
      .returning();
    return row;
  }

  // ==========================================================================
  // Compliance (all garage-scoped)
  // ==========================================================================

  async getCompliancePolicies(garageId: string, status?: string): Promise<any[]> {
    const conditions: any[] = [eq(compliancePolicies.garageId, garageId)];
    if (status) conditions.push(eq(compliancePolicies.status, status));
    return await db
      .select()
      .from(compliancePolicies)
      .where(and(...conditions))
      .orderBy(desc(compliancePolicies.createdAt));
  }

  async createCompliancePolicy(data: any): Promise<any> {
    const [row] = await db.insert(compliancePolicies).values(data).returning();
    return row;
  }

  async getComplianceAudits(
    garageId: string,
    policyId?: string,
    status?: string,
  ): Promise<any[]> {
    const conditions: any[] = [eq(complianceAudits.garageId, garageId)];
    if (policyId) conditions.push(eq(complianceAudits.policyId, policyId));
    if (status) conditions.push(eq(complianceAudits.status, status));
    return await db
      .select()
      .from(complianceAudits)
      .where(and(...conditions))
      .orderBy(desc(complianceAudits.auditDate));
  }

  async createComplianceAudit(data: any): Promise<any> {
    const [row] = await db.insert(complianceAudits).values(data).returning();
    return row;
  }

  async getComplianceTasks(
    garageId: string,
    policyId?: string,
    status?: string,
  ): Promise<any[]> {
    const conditions: any[] = [eq(complianceTasks.garageId, garageId)];
    if (policyId) conditions.push(eq(complianceTasks.policyId, policyId));
    if (status) conditions.push(eq(complianceTasks.status, status));
    return await db
      .select()
      .from(complianceTasks)
      .where(and(...conditions))
      .orderBy(asc(complianceTasks.dueDate));
  }

  async createComplianceTask(data: any): Promise<any> {
    const [row] = await db.insert(complianceTasks).values(data).returning();
    return row;
  }

  async completeComplianceTask(id: string): Promise<any | undefined> {
    const [row] = await db
      .update(complianceTasks)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(complianceTasks.id, id))
      .returning();
    return row;
  }

  // ==========================================================================
  // Expenses (garage-scoped)
  // ==========================================================================

  async getExpenseCategories(garageId: string): Promise<any[]> {
    return await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.garageId, garageId))
      .orderBy(asc(expenseCategories.name));
  }

  async createExpenseCategory(data: any): Promise<any> {
    const [row] = await db.insert(expenseCategories).values(data).returning();
    return row;
  }

  async getExpenses(
    garageId: string,
    status?: string,
    categoryId?: string,
  ): Promise<any[]> {
    const conditions: any[] = [eq(expenses.garageId, garageId)];
    if (status) conditions.push(eq(expenses.status, status));
    if (categoryId) conditions.push(eq(expenses.categoryId, categoryId));
    return await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date));
  }

  async createExpense(data: any): Promise<any> {
    const [row] = await db.insert(expenses).values(data).returning();
    return row;
  }

  async approveExpense(id: string, approvedBy: string): Promise<any | undefined> {
    const [row] = await db
      .update(expenses)
      .set({ status: "approved", approvedBy, approvedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return row;
  }

  async rejectExpense(id: string, approvedBy: string): Promise<any | undefined> {
    // approvedBy doubles as "actioned by" — the column records who decided,
    // not that the decision was an approval.
    const [row] = await db
      .update(expenses)
      .set({ status: "rejected", approvedBy, approvedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return row;
  }

  // ==========================================================================
  // Payroll
  // ==========================================================================

  async getPayrollEmployees(garageId: string): Promise<any[]> {
    return await db
      .select()
      .from(payrollEmployees)
      .where(eq(payrollEmployees.garageId, garageId))
      .orderBy(asc(payrollEmployees.employeeNumber));
  }

  async createPayrollEmployee(data: any): Promise<any> {
    const [row] = await db.insert(payrollEmployees).values(data).returning();
    return row;
  }

  async updatePayrollEmployee(id: string, data: any): Promise<any | undefined> {
    const [row] = await db
      .update(payrollEmployees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payrollEmployees.id, id))
      .returning();
    return row;
  }

  async deletePayrollEmployee(id: string): Promise<boolean> {
    const rows = await db
      .delete(payrollEmployees)
      .where(eq(payrollEmployees.id, id))
      .returning();
    return rows.length > 0;
  }

  async getPayPeriods(garageId: string, status?: string): Promise<any[]> {
    const conditions: any[] = [eq(payPeriods.garageId, garageId)];
    if (status) conditions.push(eq(payPeriods.status, status));
    return await db
      .select()
      .from(payPeriods)
      .where(and(...conditions))
      .orderBy(desc(payPeriods.startDate));
  }

  async createPayPeriod(data: any): Promise<any> {
    const [row] = await db.insert(payPeriods).values(data).returning();
    return row;
  }

  async getPayrollRuns(payPeriodId: string): Promise<any[]> {
    return await db
      .select()
      .from(payrollRuns)
      .where(eq(payrollRuns.payPeriodId, payPeriodId))
      .orderBy(desc(payrollRuns.createdAt));
  }

  async createPayrollRun(data: any): Promise<any> {
    const [row] = await db.insert(payrollRuns).values(data).returning();
    return row;
  }

  // ==========================================================================
  // Knowledge base / training / GMB writes
  // ==========================================================================

  async createArticleCategory(data: any): Promise<any> {
    const [row] = await db.insert(articleCategories).values(data).returning();
    return row;
  }

  async createKnowledgeArticle(data: any): Promise<any> {
    const [row] = await db.insert(knowledgeArticles).values(data).returning();
    return row;
  }

  async updateKnowledgeArticle(id: string, data: any): Promise<any | undefined> {
    const [row] = await db
      .update(knowledgeArticles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(knowledgeArticles.id, id))
      .returning();
    return row;
  }

  async createTrainingModule(data: any): Promise<any> {
    const [row] = await db.insert(trainingModules).values(data).returning();
    return row;
  }

  async createCertification(data: any): Promise<any> {
    const [row] = await db.insert(certifications).values(data).returning();
    return row;
  }

  async createCertificationAttempt(data: any): Promise<any> {
    const [row] = await db.insert(certificationAttempts).values(data).returning();
    return row;
  }

  async createGoogleBusinessProfile(data: any): Promise<any> {
    const [row] = await db.insert(googleBusinessProfiles).values(data).returning();
    return row;
  }

  async createGmbPost(data: any): Promise<any> {
    const [row] = await db.insert(gmbPosts).values(data).returning();
    return row;
  }

  async publishGmbPost(id: string): Promise<any | undefined> {
    const [row] = await db
      .update(gmbPosts)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(gmbPosts.id, id))
      .returning();
    return row;
  }

  async createGmbReview(data: any): Promise<any> {
    const [row] = await db.insert(gmbReviews).values(data).returning();
    return row;
  }

  async respondToGmbReview(id: string, responseText: string): Promise<any | undefined> {
    const [row] = await db
      .update(gmbReviews)
      .set({ responseText, respondedAt: new Date(), updatedAt: new Date() })
      .where(eq(gmbReviews.id, id))
      .returning();
    return row;
  }

  // ==========================================================================
  // Telematics
  // ==========================================================================

  async getTelematicsFeeds(vehicleId?: string, deviceId?: string): Promise<any[]> {
    const conditions: any[] = [];
    if (vehicleId) conditions.push(eq(telematicsFeeds.vehicleId, vehicleId));
    if (deviceId) conditions.push(eq(telematicsFeeds.deviceId, deviceId));

    const query = db.select().from(telematicsFeeds).orderBy(desc(telematicsFeeds.timestamp));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async createTelematicsFeed(data: any): Promise<any> {
    const [row] = await db.insert(telematicsFeeds).values(data).returning();
    return row;
  }

  async getTelematicsAlerts(vehicleId?: string, isResolved?: boolean): Promise<any[]> {
    const conditions: any[] = [];
    if (vehicleId) conditions.push(eq(telematicsAlerts.vehicleId, vehicleId));
    if (isResolved !== undefined)
      conditions.push(eq(telematicsAlerts.isResolved, isResolved));

    const query = db.select().from(telematicsAlerts).orderBy(desc(telematicsAlerts.createdAt));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async createTelematicsAlert(data: any): Promise<any> {
    const [row] = await db.insert(telematicsAlerts).values(data).returning();
    return row;
  }

  async resolveTelematicsAlert(id: string, resolvedBy: string): Promise<any | undefined> {
    const [row] = await db
      .update(telematicsAlerts)
      .set({ isResolved: true, resolvedBy, resolvedAt: new Date() })
      .where(eq(telematicsAlerts.id, id))
      .returning();
    return row;
  }

  // ==========================================================================
  // Towing and vehicle storage
  // ==========================================================================

  async getTowingJobs(garageId: string, status?: string): Promise<any[]> {
    const conditions: any[] = [eq(towingJobs.garageId, garageId)];
    if (status) conditions.push(eq(towingJobs.status, status));
    return await db
      .select()
      .from(towingJobs)
      .where(and(...conditions))
      .orderBy(desc(towingJobs.requestedAt));
  }

  async createTowingJob(data: any): Promise<any> {
    const [row] = await db.insert(towingJobs).values(data).returning();
    return row;
  }

  async updateTowingJob(id: string, data: any): Promise<any | undefined> {
    const [row] = await db
      .update(towingJobs)
      .set(data)
      .where(eq(towingJobs.id, id))
      .returning();
    return row;
  }

  async getStorageFacilities(garageId: string): Promise<any[]> {
    return await db
      .select()
      .from(storageFacilities)
      .where(eq(storageFacilities.garageId, garageId))
      .orderBy(asc(storageFacilities.name));
  }

  async createStorageFacility(data: any): Promise<any> {
    const [row] = await db.insert(storageFacilities).values(data).returning();
    return row;
  }

  async getVehicleStorageAssignments(
    facilityId?: string,
    vehicleId?: string,
  ): Promise<any[]> {
    const conditions: any[] = [];
    if (facilityId) conditions.push(eq(vehicleStorageAssignments.facilityId, facilityId));
    if (vehicleId) conditions.push(eq(vehicleStorageAssignments.vehicleId, vehicleId));

    const query = db
      .select()
      .from(vehicleStorageAssignments)
      .orderBy(desc(vehicleStorageAssignments.startDate));
    return conditions.length
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;
  }

  async createVehicleStorageAssignment(data: any): Promise<any> {
    const [row] = await db.insert(vehicleStorageAssignments).values(data).returning();
    return row;
  }

  // ==========================================================================
  // Misc
  // ==========================================================================

  /** Singular lookup by id; getLoyaltyAccounts (plural) already exists and
   *  lists by garage. */
  async getLoyaltyAccount(id: string): Promise<any | undefined> {
    const [row] = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.id, id));
    return row;
  }

  async getVehiclesByCustomer(customerId: string): Promise<any[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.customerId, customerId))
      .orderBy(desc(vehicles.createdAt));
  }

  // ==================== Single-row reads, updates and deletes ====================
  // Declared on IStorage but never implemented, so any route reaching for one
  // of them threw "is not a function". Each is the plain by-id form over the
  // table its return type already infers from.

  async getArticleCategory(id: string): Promise<ArticleCategory | undefined> {
    const [row] = await db.select().from(articleCategories).where(eq(articleCategories.id, id));
    return row;
  }

  async updateArticleCategory(id: string, data: Partial<ArticleCategory>): Promise<ArticleCategory> {
    const [row] = await db.update(articleCategories).set(data).where(eq(articleCategories.id, id)).returning();
    return row;
  }

  async deleteArticleCategory(id: string): Promise<void> {
    await db.delete(articleCategories).where(eq(articleCategories.id, id));
  }

  async getCertification(id: string): Promise<Certification | undefined> {
    const [row] = await db.select().from(certifications).where(eq(certifications.id, id));
    return row;
  }

  async updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
    const [row] = await db.update(certifications).set(data).where(eq(certifications.id, id)).returning();
    return row;
  }

  async getCertificationAttempt(id: string): Promise<CertificationAttempt | undefined> {
    const [row] = await db.select().from(certificationAttempts).where(eq(certificationAttempts.id, id));
    return row;
  }

  async updateCertificationAttempt(id: string, data: Partial<CertificationAttempt>): Promise<CertificationAttempt> {
    const [row] = await db.update(certificationAttempts).set(data).where(eq(certificationAttempts.id, id)).returning();
    return row;
  }

  async getComplianceAudit(id: string): Promise<ComplianceAudit | undefined> {
    const [row] = await db.select().from(complianceAudits).where(eq(complianceAudits.id, id));
    return row;
  }

  async updateComplianceAudit(id: string, data: Partial<ComplianceAudit>): Promise<ComplianceAudit> {
    const [row] = await db.update(complianceAudits).set({ ...data, updatedAt: new Date() }).where(eq(complianceAudits.id, id)).returning();
    return row;
  }

  async deleteComplianceAudit(id: string): Promise<void> {
    await db.delete(complianceAudits).where(eq(complianceAudits.id, id));
  }

  async getCompliancePolicy(id: string): Promise<CompliancePolicy | undefined> {
    const [row] = await db.select().from(compliancePolicies).where(eq(compliancePolicies.id, id));
    return row;
  }

  async updateCompliancePolicy(id: string, data: Partial<CompliancePolicy>): Promise<CompliancePolicy> {
    const [row] = await db.update(compliancePolicies).set({ ...data, updatedAt: new Date() }).where(eq(compliancePolicies.id, id)).returning();
    return row;
  }

  async deleteCompliancePolicy(id: string): Promise<void> {
    await db.delete(compliancePolicies).where(eq(compliancePolicies.id, id));
  }

  async getComplianceTask(id: string): Promise<ComplianceTask | undefined> {
    const [row] = await db.select().from(complianceTasks).where(eq(complianceTasks.id, id));
    return row;
  }

  async updateComplianceTask(id: string, data: Partial<ComplianceTask>): Promise<ComplianceTask> {
    const [row] = await db.update(complianceTasks).set({ ...data, updatedAt: new Date() }).where(eq(complianceTasks.id, id)).returning();
    return row;
  }

  async deleteComplianceTask(id: string): Promise<void> {
    await db.delete(complianceTasks).where(eq(complianceTasks.id, id));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [row] = await db.select().from(expenses).where(eq(expenses.id, id));
    return row;
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    const [row] = await db.update(expenses).set({ ...data, updatedAt: new Date() }).where(eq(expenses.id, id)).returning();
    return row;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getExpenseCategory(id: string): Promise<ExpenseCategory | undefined> {
    const [row] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return row;
  }

  async updateExpenseCategory(id: string, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const [row] = await db.update(expenseCategories).set(data).where(eq(expenseCategories.id, id)).returning();
    return row;
  }

  async deleteExpenseCategory(id: string): Promise<void> {
    await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
  }

  async getGmbPost(id: string): Promise<GmbPost | undefined> {
    const [row] = await db.select().from(gmbPosts).where(eq(gmbPosts.id, id));
    return row;
  }

  async updateGmbPost(id: string, data: Partial<GmbPost>): Promise<GmbPost> {
    const [row] = await db.update(gmbPosts).set({ ...data, updatedAt: new Date() }).where(eq(gmbPosts.id, id)).returning();
    return row;
  }

  async deleteGmbPost(id: string): Promise<void> {
    await db.delete(gmbPosts).where(eq(gmbPosts.id, id));
  }

  async getGmbReview(id: string): Promise<GmbReview | undefined> {
    const [row] = await db.select().from(gmbReviews).where(eq(gmbReviews.id, id));
    return row;
  }

  async updateGmbReview(id: string, data: Partial<GmbReview>): Promise<GmbReview> {
    const [row] = await db.update(gmbReviews).set({ ...data, updatedAt: new Date() }).where(eq(gmbReviews.id, id)).returning();
    return row;
  }

  async getGoogleBusinessProfile(id: string): Promise<GoogleBusinessProfile | undefined> {
    const [row] = await db.select().from(googleBusinessProfiles).where(eq(googleBusinessProfiles.id, id));
    return row;
  }

  async updateGoogleBusinessProfile(id: string, data: Partial<GoogleBusinessProfile>): Promise<GoogleBusinessProfile> {
    const [row] = await db.update(googleBusinessProfiles).set({ ...data, updatedAt: new Date() }).where(eq(googleBusinessProfiles.id, id)).returning();
    return row;
  }

  async deleteGoogleBusinessProfile(id: string): Promise<void> {
    await db.delete(googleBusinessProfiles).where(eq(googleBusinessProfiles.id, id));
  }

  async getPayPeriod(id: string): Promise<PayPeriod | undefined> {
    const [row] = await db.select().from(payPeriods).where(eq(payPeriods.id, id));
    return row;
  }

  async updatePayPeriod(id: string, data: Partial<PayPeriod>): Promise<PayPeriod> {
    const [row] = await db.update(payPeriods).set(data).where(eq(payPeriods.id, id)).returning();
    return row;
  }

  async deletePayPeriod(id: string): Promise<void> {
    await db.delete(payPeriods).where(eq(payPeriods.id, id));
  }

  async getPayrollEmployee(id: string): Promise<PayrollEmployee | undefined> {
    const [row] = await db.select().from(payrollEmployees).where(eq(payrollEmployees.id, id));
    return row;
  }

  async getPayrollRun(id: string): Promise<PayrollRun | undefined> {
    const [row] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, id));
    return row;
  }

  async updatePayrollRun(id: string, data: Partial<PayrollRun>): Promise<PayrollRun> {
    const [row] = await db.update(payrollRuns).set(data).where(eq(payrollRuns.id, id)).returning();
    return row;
  }

  async deletePayrollRun(id: string): Promise<void> {
    await db.delete(payrollRuns).where(eq(payrollRuns.id, id));
  }

  async getStorageFacility(id: string): Promise<StorageFacility | undefined> {
    const [row] = await db.select().from(storageFacilities).where(eq(storageFacilities.id, id));
    return row;
  }

  async updateStorageFacility(id: string, data: Partial<StorageFacility>): Promise<StorageFacility> {
    const [row] = await db.update(storageFacilities).set(data).where(eq(storageFacilities.id, id)).returning();
    return row;
  }

  async deleteStorageFacility(id: string): Promise<void> {
    await db.delete(storageFacilities).where(eq(storageFacilities.id, id));
  }

  async getTelematicsAlert(id: string): Promise<TelematicsAlert | undefined> {
    const [row] = await db.select().from(telematicsAlerts).where(eq(telematicsAlerts.id, id));
    return row;
  }

  async updateTelematicsAlert(id: string, data: Partial<TelematicsAlert>): Promise<TelematicsAlert> {
    const [row] = await db.update(telematicsAlerts).set(data).where(eq(telematicsAlerts.id, id)).returning();
    return row;
  }

  async getTelematicsFeed(id: string): Promise<TelematicsFeed | undefined> {
    const [row] = await db.select().from(telematicsFeeds).where(eq(telematicsFeeds.id, id));
    return row;
  }

  async getTowingJob(id: string): Promise<TowingJob | undefined> {
    const [row] = await db.select().from(towingJobs).where(eq(towingJobs.id, id));
    return row;
  }

  async deleteTowingJob(id: string): Promise<void> {
    await db.delete(towingJobs).where(eq(towingJobs.id, id));
  }

  async getTrainingModule(id: string): Promise<TrainingModule | undefined> {
    const [row] = await db.select().from(trainingModules).where(eq(trainingModules.id, id));
    return row;
  }

  async updateTrainingModule(id: string, data: Partial<TrainingModule>): Promise<TrainingModule> {
    const [row] = await db.update(trainingModules).set({ ...data, updatedAt: new Date() }).where(eq(trainingModules.id, id)).returning();
    return row;
  }

  async deleteTrainingModule(id: string): Promise<void> {
    await db.delete(trainingModules).where(eq(trainingModules.id, id));
  }

  async getVehicleStorageAssignment(id: string): Promise<VehicleStorageAssignment | undefined> {
    const [row] = await db.select().from(vehicleStorageAssignments).where(eq(vehicleStorageAssignments.id, id));
    return row;
  }

  async updateVehicleStorageAssignment(id: string, data: Partial<VehicleStorageAssignment>): Promise<VehicleStorageAssignment> {
    const [row] = await db.update(vehicleStorageAssignments).set({ ...data, updatedAt: new Date() }).where(eq(vehicleStorageAssignments.id, id)).returning();
    return row;
  }

  async deleteVehicleStorageAssignment(id: string): Promise<void> {
    await db.delete(vehicleStorageAssignments).where(eq(vehicleStorageAssignments.id, id));
  }

  async updateBlockchainRecord(id: string, data: Partial<BlockchainRecord>): Promise<BlockchainRecord> {
    const [row] = await db.update(blockchainRecords).set(data).where(eq(blockchainRecords.id, id)).returning();
    return row;
  }

  async deleteBlockchainRecord(id: string): Promise<void> {
    await db.delete(blockchainRecords).where(eq(blockchainRecords.id, id));
  }

  async updateDroneInspection(id: string, data: Partial<DroneInspection>): Promise<DroneInspection> {
    const [row] = await db.update(droneInspections).set({ ...data, updatedAt: new Date() }).where(eq(droneInspections.id, id)).returning();
    return row;
  }

  async deleteDroneInspection(id: string): Promise<void> {
    await db.delete(droneInspections).where(eq(droneInspections.id, id));
  }

  async updateEdgeDevice(id: string, data: Partial<EdgeDevice>): Promise<EdgeDevice> {
    const [row] = await db.update(edgeDevices).set({ ...data, updatedAt: new Date() }).where(eq(edgeDevices.id, id)).returning();
    return row;
  }

  async updateEdgeDiagnostic(id: string, data: Partial<EdgeDiagnostic>): Promise<EdgeDiagnostic> {
    const [row] = await db.update(edgeDiagnostics).set(data).where(eq(edgeDiagnostics.id, id)).returning();
    return row;
  }

  async deleteEdgeDiagnostic(id: string): Promise<void> {
    await db.delete(edgeDiagnostics).where(eq(edgeDiagnostics.id, id));
  }

  async updateFraudDetectionCase(id: string, data: Partial<FraudDetectionCase>): Promise<FraudDetectionCase> {
    const [row] = await db.update(fraudDetectionCases).set({ ...data, updatedAt: new Date() }).where(eq(fraudDetectionCases.id, id)).returning();
    return row;
  }

  async deleteFraudDetectionCase(id: string): Promise<void> {
    await db.delete(fraudDetectionCases).where(eq(fraudDetectionCases.id, id));
  }

  async updateFraudDetectionRule(id: string, data: Partial<FraudDetectionRule>): Promise<FraudDetectionRule> {
    const [row] = await db.update(fraudDetectionRules).set({ ...data, updatedAt: new Date() }).where(eq(fraudDetectionRules.id, id)).returning();
    return row;
  }

  async deleteFraudDetectionRule(id: string): Promise<void> {
    await db.delete(fraudDetectionRules).where(eq(fraudDetectionRules.id, id));
  }

  async updateIotAlert(id: string, data: Partial<IoTAlert>): Promise<IoTAlert> {
    const [row] = await db.update(iotAlerts).set(data).where(eq(iotAlerts.id, id)).returning();
    return row;
  }

  async updateParts3DModel(id: string, data: Partial<Parts3DModel>): Promise<Parts3DModel> {
    const [row] = await db.update(parts3DModels).set({ ...data, updatedAt: new Date() }).where(eq(parts3DModels.id, id)).returning();
    return row;
  }

  async deleteParts3DModel(id: string): Promise<void> {
    await db.delete(parts3DModels).where(eq(parts3DModels.id, id));
  }

  async updatePricingRule(id: string, data: Partial<PricingRule>): Promise<PricingRule> {
    const [row] = await db.update(pricingRules).set({ ...data, updatedAt: new Date() }).where(eq(pricingRules.id, id)).returning();
    return row;
  }

  async deletePricingRule(id: string): Promise<void> {
    await db.delete(pricingRules).where(eq(pricingRules.id, id));
  }

  async updateTwinSimulation(id: string, data: Partial<TwinSimulation>): Promise<TwinSimulation> {
    const [row] = await db.update(twinSimulations).set(data).where(eq(twinSimulations.id, id)).returning();
    return row;
  }

  async deleteAiVideoAnalysis(id: string): Promise<void> {
    await db.delete(aiVideoAnalysis).where(eq(aiVideoAnalysis.id, id));
  }

  async deleteArGuideSession(id: string): Promise<void> {
    await db.delete(arGuideSessions).where(eq(arGuideSessions.id, id));
  }

  async deleteArRepairGuide(id: string): Promise<void> {
    await db.delete(arRepairGuides).where(eq(arRepairGuides.id, id));
  }

  async deleteCollaborationSession(id: string): Promise<void> {
    await db.delete(collaborationSessions).where(eq(collaborationSessions.id, id));
  }

  async deleteDigitalTwin(id: string): Promise<void> {
    await db.delete(digitalTwins).where(eq(digitalTwins.id, id));
  }

  async deleteKnowledgeArticle(id: string): Promise<void> {
    await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
  }

  async deletePricingOptimization(id: string): Promise<void> {
    await db.delete(pricingOptimization).where(eq(pricingOptimization.id, id));
  }

  async deleteCertification(id: string): Promise<void> {
    await db.delete(certifications).where(eq(certifications.id, id));
  }

  async deleteEdgeDevice(id: string): Promise<void> {
    await db.delete(edgeDevices).where(eq(edgeDevices.id, id));
  }

  // ---- The remainder are not plain by-id forms ----

  /** biometric_profiles is keyed by user_id, one profile per user. */
  async deleteBiometricProfile(userId: string): Promise<void> {
    await db.delete(biometricProfiles).where(eq(biometricProfiles.userId, userId));
  }

  /** Records a reader's vote against the article's running tallies. */
  async markArticleHelpful(id: string, isHelpful: boolean): Promise<void> {
    const column = isHelpful ? knowledgeArticles.helpfulCount : knowledgeArticles.unhelpfulCount;
    await db.update(knowledgeArticles)
      .set({
        [isHelpful ? "helpfulCount" : "unhelpfulCount"]: sql`COALESCE(${column}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeArticles.id, id));
  }

  async getArGuideSessions(guideId?: string, technicianId?: string): Promise<ARGuideSession[]> {
    const conditions = [];
    if (guideId) conditions.push(eq(arGuideSessions.guideId, guideId));
    if (technicianId) conditions.push(eq(arGuideSessions.technicianId, technicianId));

    const query = db.select().from(arGuideSessions);
    return conditions.length
      ? await query.where(and(...conditions)).orderBy(desc(arGuideSessions.startedAt))
      : await query.orderBy(desc(arGuideSessions.startedAt));
  }

  async createParts3DViewSession(data: InsertParts3DViewSession): Promise<Parts3DViewSession> {
    const [row] = await db.insert(parts3DViewSessions).values(data).returning();
    return row;
  }

  async getParts3DViewSessions(modelId?: string): Promise<Parts3DViewSession[]> {
    const query = db.select().from(parts3DViewSessions);
    return modelId
      ? await query.where(eq(parts3DViewSessions.modelId, modelId)).orderBy(desc(parts3DViewSessions.createdAt))
      : await query.orderBy(desc(parts3DViewSessions.createdAt));
  }
}

export const storage = new DatabaseStorage();
