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
  suppliers,
  supplierPriceList,
  supplierPerformance,
  purchaseOrders,
  purchaseOrderItems,
  invoices,
  invoiceItems,
  payments,
  type User,
  type UpsertUser,
  type Garage,
  type Branch,
  type Role,
  type JobCard,
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
  type Supplier,
  type InsertSupplier,
  type SupplierPriceList,
  type InsertSupplierPriceList,
  type SupplierPerformance,
  type InsertSupplierPerformance,
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
  type Notification,
  type InsertNotification,
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
  type ChatConversation,
  type InsertChatConversation,
  type ChatParticipant,
  type InsertChatParticipant,
  type ChatMessage,
  type InsertChatMessage,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, inArray, and, gte, lte, ilike, sql, isNull, gt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getTechnicians(garageId?: string): Promise<User[]>;
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
  getJobCards(garageId?: string, assignedTo?: string): Promise<JobCard[]>;
  getJobCard(id: string): Promise<JobCard | undefined>;
  createJobCard(data: any): Promise<JobCard>;
  updateJobCard(id: string, data: any): Promise<JobCard>;
  
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
  updateSparePartInventory(id: string, data: Partial<SparePartInventory>): Promise<SparePartInventory>;
  
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
  getCustomers(garageId?: string, searchQuery?: string): Promise<User[]>;
  getCustomer(id: string): Promise<User | undefined>;
  getVehicles(garageId?: string): Promise<Vehicle[]>;
  getCustomerVehicles(customerId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(data: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;
  getCustomerNotes(customerId: string): Promise<CustomerNote[]>;
  createCustomerNote(data: InsertCustomerNote): Promise<CustomerNote>;
  deleteCustomerNote(id: string): Promise<void>;
  
  // Purchase Orders & Supplier Integration - Module 11
  getSuppliers(garageId?: string): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(data: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  
  // Supplier Price List methods - Module 43
  getSupplierPriceLists(supplierId?: string, sparePartId?: string): Promise<SupplierPriceList[]>;
  getSupplierPriceList(id: string): Promise<SupplierPriceList | undefined>;
  createSupplierPriceList(data: InsertSupplierPriceList): Promise<SupplierPriceList>;
  updateSupplierPriceList(id: string, data: Partial<SupplierPriceList>): Promise<SupplierPriceList>;
  deleteSupplierPriceList(id: string): Promise<void>;
  comparePrices(sparePartId: string): Promise<SupplierPriceList[]>;
  
  // Supplier Performance methods - Module 43
  getSupplierPerformance(supplierId?: string, period?: string): Promise<SupplierPerformance[]>;
  getSupplierPerformanceRecord(id: string): Promise<SupplierPerformance | undefined>;
  createSupplierPerformance(data: InsertSupplierPerformance): Promise<SupplierPerformance>;
  updateSupplierPerformance(id: string, data: Partial<SupplierPerformance>): Promise<SupplierPerformance>;
  deleteSupplierPerformance(id: string): Promise<void>;
  
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
  
  // Notification preferences - Module 24
  getNotificationPreferences(userId: string): Promise<any | undefined>;
  upsertNotificationPreferences(userId: string, eventMap: string): Promise<any>;

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
  updateStockAlert(id: string, data: any): Promise<any>;
  acknowledgeStockAlert(id: string, userId: string): Promise<any>;
  
  // Module 28: Advanced Financial Features
  // Payment Plans
  getPaymentPlans(invoiceId?: string): Promise<PaymentPlan[]>;
  getPaymentPlan(id: string): Promise<PaymentPlan | undefined>;
  createPaymentPlan(data: InsertPaymentPlan): Promise<PaymentPlan>;
  updatePaymentPlan(id: string, data: Partial<PaymentPlan>): Promise<PaymentPlan>;
  
  // Installments
  getInstallments(paymentPlanId: string): Promise<Installment[]>;
  getInstallment(id: string): Promise<Installment | undefined>;
  createInstallment(data: InsertInstallment): Promise<Installment>;
  updateInstallment(id: string, data: Partial<Installment>): Promise<Installment>;
  
  // Refunds
  getRefunds(garageId?: string, status?: string): Promise<Refund[]>;
  getRefund(id: string): Promise<Refund | undefined>;
  createRefund(data: InsertRefund): Promise<Refund>;
  updateRefund(id: string, data: Partial<Refund>): Promise<Refund>;
  
  // Tax Configurations
  getTaxConfigurations(garageId: string, isActive?: boolean): Promise<TaxConfiguration[]>;
  getTaxConfiguration(id: string): Promise<TaxConfiguration | undefined>;
  createTaxConfiguration(data: InsertTaxConfiguration): Promise<TaxConfiguration>;
  updateTaxConfiguration(id: string, data: Partial<TaxConfiguration>): Promise<TaxConfiguration>;
  deleteTaxConfiguration(id: string): Promise<void>;
  
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
  updateReorderSetting(id: string, data: any): Promise<any>;
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
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getTechnicians(garageId?: string): Promise<User[]> {
    if (garageId) {
      return await db.select().from(users).where(
        and(
          eq(users.userType, 'technician'),
          eq(users.garageId, garageId)
        )
      );
    }
    return await db.select().from(users).where(eq(users.userType, 'technician'));
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
  async getJobCards(garageId?: string, assignedTo?: string): Promise<JobCard[]> {
    const conditions = [];
    if (garageId) {
      conditions.push(eq(jobCards.garageId, garageId));
    }
    if (assignedTo) {
      conditions.push(eq(jobCards.assignedTo, assignedTo));
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

  async createJobCard(data: any): Promise<JobCard> {
    const [jobCard] = await db.insert(jobCards).values(data).returning();
    return jobCard;
  }

  async updateJobCard(id: string, data: any): Promise<JobCard> {
    const [jobCard] = await db.update(jobCards).set(data).where(eq(jobCards.id, id)).returning();
    return jobCard;
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

  async updateServiceTemplate(id: string, data: Partial<ServiceTemplate>): Promise<ServiceTemplate> {
    const [template] = await db.update(serviceTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceTemplates.id, id))
      .returning();
    return template;
  }

  async deleteServiceTemplate(id: string): Promise<void> {
    await db.delete(serviceTemplates).where(eq(serviceTemplates.id, id));
  }

  // Tool Management operations - Module 7
  async getTools(garageId?: string, isGlobal?: boolean): Promise<Tool[]> {
    return await db.select().from(tools)
      .where(eq(tools.isActive, true))
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

  async updateSparePartInventory(id: string, data: Partial<SparePartInventory>): Promise<SparePartInventory> {
    const [inventory] = await db.update(sparePartInventories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sparePartInventories.id, id))
      .returning();
    return inventory;
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

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db.update(appointments).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(appointments.id, id)).returning();
    return appointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
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
  async getCustomers(garageId?: string, searchQuery?: string): Promise<User[]> {
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
    
    return await query.orderBy(desc(users.createdAt));
  }

  async getCustomer(id: string): Promise<User | undefined> {
    const [customer] = await db.select().from(users)
      .where(eq(users.id, id));
    return customer;
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

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const [supplier] = await db.update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.update(suppliers)
      .set({ isActive: false })
      .where(eq(suppliers.id, id));
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

  async getSupplierPriceList(id: string): Promise<SupplierPriceList | undefined> {
    const [priceList] = await db.select().from(supplierPriceList)
      .where(eq(supplierPriceList.id, id));
    return priceList;
  }

  async createSupplierPriceList(data: InsertSupplierPriceList): Promise<SupplierPriceList> {
    const [priceList] = await db.insert(supplierPriceList)
      .values(data)
      .returning();
    return priceList;
  }

  async updateSupplierPriceList(id: string, data: Partial<SupplierPriceList>): Promise<SupplierPriceList> {
    const [priceList] = await db.update(supplierPriceList)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(supplierPriceList.id, id))
      .returning();
    return priceList;
  }

  async deleteSupplierPriceList(id: string): Promise<void> {
    await db.delete(supplierPriceList)
      .where(eq(supplierPriceList.id, id));
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

  async getSupplierPerformanceRecord(id: string): Promise<SupplierPerformance | undefined> {
    const [performance] = await db.select().from(supplierPerformance)
      .where(eq(supplierPerformance.id, id));
    return performance;
  }

  async createSupplierPerformance(data: InsertSupplierPerformance): Promise<SupplierPerformance> {
    const [performance] = await db.insert(supplierPerformance)
      .values(data)
      .returning();
    return performance;
  }

  async updateSupplierPerformance(id: string, data: Partial<SupplierPerformance>): Promise<SupplierPerformance> {
    const [performance] = await db.update(supplierPerformance)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supplierPerformance.id, id))
      .returning();
    return performance;
  }

  async deleteSupplierPerformance(id: string): Promise<void> {
    await db.delete(supplierPerformance)
      .where(eq(supplierPerformance.id, id));
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

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const [po] = await db.update(purchaseOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return po;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
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
    const invoiceNumber = `INV-${Date.now()}`;
    const [invoice] = await db.insert(invoices)
      .values({ ...data, invoiceNumber })
      .returning();
    return invoice;
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const { invoices } = await import("@shared/schema");
    const [invoice] = await db.update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    const { invoices } = await import("@shared/schema");
    await db.delete(invoices).where(eq(invoices.id, id));
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
      const invoiceNumber = `INV-${Date.now()}`;
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

  async updateEstimate(id: string, data: Partial<Estimate>): Promise<Estimate> {
    const [estimate] = await db.update(estimates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(estimates.id, id))
      .returning();
    return estimate;
  }

  async deleteEstimate(id: string): Promise<void> {
    await db.delete(estimates).where(eq(estimates.id, id));
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

  // Notification Preferences - Module 24
  async getNotificationPreferences(userId: string) {
    const { notificationPreferences } = await import("@shared/schema");
    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async upsertNotificationPreferences(userId: string, eventMap: string) {
    const { notificationPreferences } = await import("@shared/schema");
    const [prefs] = await db
      .insert(notificationPreferences)
      .values({ userId, eventMap, channel: 'all' })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: { eventMap },
      })
      .returning();
    return prefs;
  }

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

  async updateStockAlert(id: string, data: Partial<StockAlert>) {
    const [alert] = await db
      .update(stockAlerts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stockAlerts.id, id))
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

  async updateReorderSetting(id: string, data: Partial<ReorderSetting>) {
    const [setting] = await db
      .update(reorderSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reorderSettings.id, id))
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

  async completeInventoryTransfer(id: string, userId: string) {
    const transfer = await this.getInventoryTransfer(id);
    if (!transfer) throw new Error("Transfer not found");

    // Update source inventory
    const [sourceInventory] = await db
      .select()
      .from(sparePartInventories)
      .where(
        and(
          eq(sparePartInventories.sparePartId, transfer.sparePartId),
          eq(sparePartInventories.garageId, transfer.fromGarageId)
        )
      );

    if (sourceInventory) {
      const currentStock = sourceInventory.stockQuantity ?? 0;
      await db
        .update(sparePartInventories)
        .set({
          stockQuantity: currentStock - transfer.quantity,
          updatedAt: new Date(),
        })
        .where(eq(sparePartInventories.id, sourceInventory.id));

      // Create audit trail for source
      await this.createAuditTrailEntry({
        sparePartId: transfer.sparePartId,
        garageId: transfer.fromGarageId,
        branchId: transfer.fromBranchId,
        actionType: "transfer",
        quantityBefore: currentStock,
        quantityChange: -transfer.quantity,
        quantityAfter: currentStock - transfer.quantity,
        referenceType: "transfer",
        referenceId: transfer.id,
        reason: `Transfer to ${transfer.toGarageId}`,
        performedBy: userId,
      });
    }

    // Update destination inventory
    const [destInventory] = await db
      .select()
      .from(sparePartInventories)
      .where(
        and(
          eq(sparePartInventories.sparePartId, transfer.sparePartId),
          eq(sparePartInventories.garageId, transfer.toGarageId)
        )
      );

    if (destInventory) {
      const currentStock = destInventory.stockQuantity ?? 0;
      await db
        .update(sparePartInventories)
        .set({
          stockQuantity: currentStock + transfer.quantity,
          updatedAt: new Date(),
        })
        .where(eq(sparePartInventories.id, destInventory.id));

      // Create audit trail for destination
      await this.createAuditTrailEntry({
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
      });
    }

    // Update transfer status
    const [updatedTransfer] = await db
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

  async getPaymentPlan(id: string): Promise<PaymentPlan | undefined> {
    const [plan] = await db.select().from(paymentPlans).where(eq(paymentPlans.id, id));
    return plan;
  }

  async createPaymentPlan(data: InsertPaymentPlan): Promise<PaymentPlan> {
    const [plan] = await db.insert(paymentPlans).values(data).returning();
    return plan;
  }

  async updatePaymentPlan(id: string, data: Partial<PaymentPlan>): Promise<PaymentPlan> {
    const [plan] = await db.update(paymentPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentPlans.id, id))
      .returning();
    return plan;
  }

  // Installments
  async getInstallments(paymentPlanId: string): Promise<Installment[]> {
    return await db.select().from(installments)
      .where(eq(installments.paymentPlanId, paymentPlanId))
      .orderBy(installments.installmentNumber);
  }

  async getInstallment(id: string): Promise<Installment | undefined> {
    const [installment] = await db.select().from(installments).where(eq(installments.id, id));
    return installment;
  }

  async createInstallment(data: InsertInstallment): Promise<Installment> {
    const [installment] = await db.insert(installments).values(data).returning();
    return installment;
  }

  async updateInstallment(id: string, data: Partial<Installment>): Promise<Installment> {
    const [installment] = await db.update(installments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(installments.id, id))
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

  async updateTaxConfiguration(id: string, data: Partial<TaxConfiguration>): Promise<TaxConfiguration> {
    const [config] = await db.update(taxConfigurations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxConfigurations.id, id))
      .returning();
    return config;
  }

  async deleteTaxConfiguration(id: string): Promise<void> {
    await db.delete(taxConfigurations).where(eq(taxConfigurations.id, id));
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

    const baseQuery = db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${appointments.appointmentDate})`,
      day: sql<string>`TO_CHAR(${appointments.appointmentDate}, 'Day')`,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
    })
    .from(appointments)
    .leftJoin(invoices, eq(appointments.customerId, invoices.customerId))
    .where(and(...appointmentConditions));

    const hourlyData = await baseQuery
      .groupBy(sql`EXTRACT(HOUR FROM ${appointments.appointmentDate})`);

    const dailyData = await baseQuery
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
    const conditions = [];
    if (status) {
      conditions.push(eq(ocrDocuments.status, status));
    }
    
    const query = db.select().from(ocrDocuments).orderBy(desc(ocrDocuments.createdAt));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    return await query;
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
    let query = db.select().from(permissionOverrides)
      .where(
        and(
          eq(permissionOverrides.garageId, garageId),
          or(
            isNull(permissionOverrides.expiresAt),
            gte(permissionOverrides.expiresAt, new Date())
          ) ?? sql`true`
        )
      );
    
    if (userId) {
      query = query.where(eq(permissionOverrides.userId, userId));
    }
    
    return await query.orderBy(desc(permissionOverrides.createdAt));
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

  async getMediaAttachments(relatedType: string, relatedId: string, category?: string): Promise<any[]> {
    const conditions = [
      eq(mediaAttachments.relatedType, relatedType),
      eq(mediaAttachments.relatedId, relatedId)
    ];
    
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

  async deleteMediaAttachment(id: string): Promise<void> {
    await db.delete(mediaAttachments)
      .where(eq(mediaAttachments.id, id));
  }

  async updateMediaAttachment(id: string, data: any): Promise<any> {
    const [media] = await db.update(mediaAttachments)
      .set(data)
      .where(eq(mediaAttachments.id, id))
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

  async updateVehicleInspection(id: string, data: Partial<InsertVehicleInspection>): Promise<VehicleInspection> {
    const [inspection] = await db.update(vehicleInspections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vehicleInspections.id, id))
      .returning();
    return inspection;
  }

  async deleteVehicleInspection(id: string): Promise<void> {
    await db.delete(vehicleInspections)
      .where(eq(vehicleInspections.id, id));
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

  async updateLoanerVehicle(id: string, data: Partial<InsertLoanerVehicle>): Promise<LoanerVehicle> {
    const [vehicle] = await db.update(loanerVehicles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loanerVehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteLoanerVehicle(id: string): Promise<void> {
    await db.delete(loanerVehicles)
      .where(eq(loanerVehicles.id, id));
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
}

export const storage = new DatabaseStorage();
