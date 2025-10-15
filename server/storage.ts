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

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
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
    
    return {
      totalRevenue,
      paidAmount,
      pendingAmount,
      invoicesByStatus,
      revenueByMonth,
      paymentsByMethod,
    };
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
}

export const storage = new DatabaseStorage();
