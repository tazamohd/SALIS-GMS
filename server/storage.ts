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
  type DiscountUsage,
  type InsertDiscountUsage,
  savedFilterPresets,
  exportJobs,
  type SavedFilterPreset,
  type InsertSavedFilterPreset,
  type ExportJob,
  type InsertExportJob,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, inArray, and, gte, lte, ilike } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

      if (inventory && inventory.stockQuantity <= setting.reorderPoint) {
        // Create purchase order (or add to reorders list)
        reordersToCreate.push({
          sparePartId: setting.sparePartId,
          currentQuantity: inventory.stockQuantity,
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
      await db
        .update(sparePartInventories)
        .set({
          stockQuantity: sourceInventory.stockQuantity - transfer.quantity,
          updatedAt: new Date(),
        })
        .where(eq(sparePartInventories.id, sourceInventory.id));

      // Create audit trail for source
      await this.createAuditTrailEntry({
        sparePartId: transfer.sparePartId,
        garageId: transfer.fromGarageId,
        branchId: transfer.fromBranchId,
        actionType: "transfer",
        quantityBefore: sourceInventory.stockQuantity,
        quantityChange: -transfer.quantity,
        quantityAfter: sourceInventory.stockQuantity - transfer.quantity,
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
      await db
        .update(sparePartInventories)
        .set({
          stockQuantity: destInventory.stockQuantity + transfer.quantity,
          updatedAt: new Date(),
        })
        .where(eq(sparePartInventories.id, destInventory.id));

      // Create audit trail for destination
      await this.createAuditTrailEntry({
        sparePartId: transfer.sparePartId,
        garageId: transfer.toGarageId,
        branchId: transfer.toBranchId,
        actionType: "transfer",
        quantityBefore: destInventory.stockQuantity,
        quantityChange: transfer.quantity,
        quantityAfter: destInventory.stockQuantity + transfer.quantity,
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
    let query = db.select({
      serviceType: jobCards.serviceType,
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
      cost: sql<number>`COALESCE(SUM(CAST(${invoiceItems.unitCost} AS DECIMAL) * ${invoiceItems.quantity}), 0)`,
      count: sql<number>`COUNT(DISTINCT ${jobCards.id})`,
    })
    .from(jobCards)
    .leftJoin(invoices, eq(jobCards.id, invoices.jobCardId))
    .leftJoin(invoiceItems, eq(invoices.id, invoiceItems.invoiceId))
    .where(eq(jobCards.garageId, garageId))
    .groupBy(jobCards.serviceType);

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(jobCards.garageId, garageId),
          sql`${jobCards.createdAt} >= ${startDate}`,
          sql`${jobCards.createdAt} <= ${endDate}`
        )
      );
    }

    const results = await query;

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
    let appointmentQuery = db.select({
      hour: sql<number>`EXTRACT(HOUR FROM ${appointments.appointmentDate})`,
      day: sql<string>`TO_CHAR(${appointments.appointmentDate}, 'Day')`,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
    })
    .from(appointments)
    .leftJoin(invoices, eq(appointments.customerId, invoices.customerId))
    .where(eq(appointments.garageId, garageId));

    if (startDate && endDate) {
      appointmentQuery = appointmentQuery.where(
        and(
          eq(appointments.garageId, garageId),
          sql`${appointments.appointmentDate} >= ${startDate}`,
          sql`${appointments.appointmentDate} <= ${endDate}`
        )
      );
    }

    const hourlyData = await appointmentQuery
      .groupBy(sql`EXTRACT(HOUR FROM ${appointments.appointmentDate})`);

    const dailyData = await appointmentQuery
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
      let jobQuery = db.select({
        jobsCompleted: sql<number>`COUNT(*)`,
        totalHours: sql<number>`COALESCE(SUM(CAST(${jobCards.actualHours} AS DECIMAL)), 0)`,
        revenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(jobCards)
      .leftJoin(invoices, eq(jobCards.id, invoices.jobCardId))
      .where(
        and(
          eq(jobCards.assignedTo, tech.id),
          eq(jobCards.status, 'completed')
        )
      );

      if (startDate && endDate) {
        jobQuery = jobQuery.where(
          and(
            eq(jobCards.assignedTo, tech.id),
            eq(jobCards.status, 'completed'),
            sql`${jobCards.completedAt} >= ${startDate}`,
            sql`${jobCards.completedAt} <= ${endDate}`
          )
        );
      }

      const [jobData] = await jobQuery;

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
    let customerQuery = db.select({
      count: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
    })
    .from(users)
    .leftJoin(invoices, eq(users.id, invoices.customerId))
    .where(
      and(
        eq(users.garageId, garageId),
        eq(users.userType, 'customer')
      )
    );

    if (startDate && endDate) {
      customerQuery = customerQuery.where(
        and(
          eq(users.garageId, garageId),
          eq(users.userType, 'customer'),
          sql`${users.createdAt} >= ${startDate}`,
          sql`${users.createdAt} <= ${endDate}`
        )
      );
    }

    const [data] = await customerQuery;
    
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
}

export const storage = new DatabaseStorage();
