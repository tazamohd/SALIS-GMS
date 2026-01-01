// PHASE 5 - OPERATIONS & EFFICIENCY BACKEND SERVICE
// 5 modules with real database operations

import { db } from "./db";
import { 
  aiSchedulingRules,
  schedulingOptimizations,
  autoReorderRules,
  autoReorderHistory,
  routingOptimizations,
  timeClockEntries,
  payrollPeriods,
  payrollEntries,
  equipmentCalibration,
  calibrationReminders,
  spareParts,
  users,
  tools,
  appointments
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

// ========================================
// 1. AI-POWERED SCHEDULING OPTIMIZER
// ========================================

export async function getSchedulingRules(garageId: string) {
  try {
    const rules = await db
      .select()
      .from(aiSchedulingRules)
      .where(and(
        eq(aiSchedulingRules.garageId, garageId),
        eq(aiSchedulingRules.isActive, true)
      ))
      .orderBy(desc(aiSchedulingRules.priority));
    
    return rules;
  } catch (error) {
    console.error('Error fetching scheduling rules:', error);
    return [];
  }
}

export async function createSchedulingOptimization(data: {
  garageId: string;
  optimizationDate: Date;
  appointmentsOptimized: number;
  efficiencyGain?: number;
  technicianUtilization?: any;
  suggestions?: any;
}) {
  try {
    const [optimization] = await db
      .insert(schedulingOptimizations)
      .values({
        ...data,
        efficiencyGain: data.efficiencyGain?.toString(),
      })
      .returning();
    
    return optimization;
  } catch (error) {
    console.error('Error creating scheduling optimization:', error);
    throw new Error('Failed to create scheduling optimization');
  }
}

export async function getSchedulingHistory(garageId: string, limit: number = 30) {
  try {
    const history = await db
      .select()
      .from(schedulingOptimizations)
      .where(eq(schedulingOptimizations.garageId, garageId))
      .orderBy(desc(schedulingOptimizations.optimizationDate))
      .limit(limit);
    
    return history;
  } catch (error) {
    console.error('Error fetching scheduling history:', error);
    return [];
  }
}

export async function runSchedulingOptimization(garageId: string) {
  try {
    if (!garageId) {
      throw new Error('Garage ID is required for scheduling optimization');
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const garageAppointments = await db.select().from(appointments).where(eq(appointments.garageId, garageId));
    
    const upcomingAppointments = garageAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate < nextWeek && 
             apt.status !== 'completed' && apt.status !== 'cancelled';
    });
    
    const technicians = await db.select().from(users).where(and(eq(users.role, 'technician'), eq(users.garageId, garageId)));
    
    if (technicians.length === 0) {
      const noTechOptimization = await createSchedulingOptimization({
        garageId: garageId,
        optimizationDate: new Date(),
        appointmentsOptimized: upcomingAppointments.length,
        efficiencyGain: 0,
        technicianUtilization: {},
        suggestions: ['No technicians found. Add technicians to enable scheduling optimization.'],
      });
      return noTechOptimization;
    }
    
    const technicianWorkload: Record<string, number> = {};
    const technicianNames: Record<string, string> = {};
    
    technicians.forEach(tech => {
      technicianWorkload[tech.id] = 0;
      technicianNames[tech.id] = tech.fullName || tech.email;
    });
    
    upcomingAppointments.forEach(apt => {
      if (apt.assignedTo && technicianWorkload[apt.assignedTo] !== undefined) {
        technicianWorkload[apt.assignedTo] += apt.duration || 60;
      }
    });
    
    const totalWorkMinutes = Object.values(technicianWorkload).reduce((a, b) => a + b, 0);
    const avgWorkMinutes = technicians.length > 0 ? totalWorkMinutes / technicians.length : 0;
    
    const suggestions: string[] = [];
    const technicianUtilization: Record<string, string> = {};
    
    const maxWorkMinutesPerWeek = 40 * 60;
    
    Object.entries(technicianWorkload).forEach(([techId, minutes]) => {
      const utilization = (minutes / maxWorkMinutesPerWeek) * 100;
      technicianUtilization[technicianNames[techId] || techId] = utilization.toFixed(1);
      
      if (utilization < 50) {
        suggestions.push(`${technicianNames[techId]} has low utilization (${utilization.toFixed(0)}%). Consider assigning more appointments.`);
      } else if (utilization > 90) {
        suggestions.push(`${technicianNames[techId]} is overloaded (${utilization.toFixed(0)}%). Consider redistributing workload.`);
      }
    });
    
    const unassignedCount = upcomingAppointments.filter(apt => !apt.assignedTo).length;
    if (unassignedCount > 0) {
      suggestions.push(`${unassignedCount} appointments are unassigned. Assign technicians to improve efficiency.`);
    }
    
    const morningAppointments = upcomingAppointments.filter(apt => {
      const hour = new Date(apt.appointmentDate).getHours();
      return hour >= 8 && hour < 12;
    });
    const afternoonAppointments = upcomingAppointments.filter(apt => {
      const hour = new Date(apt.appointmentDate).getHours();
      return hour >= 12 && hour < 17;
    });
    
    if (morningAppointments.length > afternoonAppointments.length * 2) {
      suggestions.push('Morning schedule is heavy. Consider shifting some appointments to afternoon for better balance.');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Schedule looks well-optimized! All technicians have balanced workloads.');
    }
    
    const avgUtilization = Object.values(technicianUtilization)
      .map(v => parseFloat(v))
      .reduce((a, b) => a + b, 0) / (technicians.length || 1);
    
    const efficiencyGain = Math.min(15, Math.max(0, 100 - avgUtilization) / 5);
    
    const optimization = await createSchedulingOptimization({
      garageId: garageId,
      optimizationDate: new Date(),
      appointmentsOptimized: upcomingAppointments.length,
      efficiencyGain,
      technicianUtilization,
      suggestions,
    });
    
    return optimization;
  } catch (error) {
    console.error('Error running scheduling optimization:', error);
    throw new Error('Failed to run scheduling optimization');
  }
}

// ========================================
// 2. PARTS AUTO-REORDERING SYSTEM
// ========================================

export async function getAutoReorderRules(garageId: string) {
  try {
    const rules = await db
      .select({
        ruleId: autoReorderRules.id,
        partId: autoReorderRules.partId,
        partName: spareParts.partName,
        partNumber: spareParts.partNumber,
        currentStock: spareParts.quantityInStock,
        reorderPoint: autoReorderRules.reorderPoint,
        reorderQuantity: autoReorderRules.reorderQuantity,
        preferredSupplier: autoReorderRules.preferredSupplier,
        maxPrice: autoReorderRules.maxPrice,
        isActive: autoReorderRules.isActive,
        lastTriggered: autoReorderRules.lastTriggered,
      })
      .from(autoReorderRules)
      .innerJoin(spareParts, eq(autoReorderRules.partId, spareParts.id))
      .where(eq(spareParts.garageId, garageId));
    
    return rules;
  } catch (error) {
    console.error('Error fetching auto-reorder rules:', error);
    return [];
  }
}

export async function checkAndTriggerReorders(garageId: string) {
  try {
    // Get all parts below reorder point
    const rules = await db
      .select({
        ruleId: autoReorderRules.id,
        partId: autoReorderRules.partId,
        currentStock: spareParts.quantityInStock,
        reorderPoint: autoReorderRules.reorderPoint,
        reorderQuantity: autoReorderRules.reorderQuantity,
        preferredSupplier: autoReorderRules.preferredSupplier,
      })
      .from(autoReorderRules)
      .innerJoin(spareParts, eq(autoReorderRules.partId, spareParts.id))
      .where(and(
        eq(spareParts.garageId, garageId),
        eq(autoReorderRules.isActive, true),
        sql`${spareParts.quantityInStock} <= ${autoReorderRules.reorderPoint}`
      ));
    
    const triggeredOrders = [];
    
    for (const rule of rules) {
      const [history] = await db
        .insert(autoReorderHistory)
        .values({
          ruleId: rule.ruleId,
          partId: rule.partId,
          stockLevelAtTrigger: rule.currentStock || 0,
          quantityOrdered: rule.reorderQuantity,
          supplier: rule.preferredSupplier,
          orderStatus: 'pending',
        })
        .returning();
      
      triggeredOrders.push(history);
      
      // Update last triggered
      await db
        .update(autoReorderRules)
        .set({ lastTriggered: new Date() })
        .where(eq(autoReorderRules.id, rule.ruleId));
    }
    
    return triggeredOrders;
  } catch (error) {
    console.error('Error checking reorders:', error);
    return [];
  }
}

export async function getReorderHistory(garageId: string, limit: number = 50) {
  try {
    const history = await db
      .select({
        id: autoReorderHistory.id,
        partName: spareParts.partName,
        partNumber: spareParts.partNumber,
        stockLevelAtTrigger: autoReorderHistory.stockLevelAtTrigger,
        quantityOrdered: autoReorderHistory.quantityOrdered,
        supplier: autoReorderHistory.supplier,
        orderStatus: autoReorderHistory.orderStatus,
        triggeredAt: autoReorderHistory.triggeredAt,
      })
      .from(autoReorderHistory)
      .innerJoin(spareParts, eq(autoReorderHistory.partId, spareParts.id))
      .where(eq(spareParts.garageId, garageId))
      .orderBy(desc(autoReorderHistory.triggeredAt))
      .limit(limit);
    
    return history;
  } catch (error) {
    console.error('Error fetching reorder history:', error);
    return [];
  }
}

// ========================================
// 3. MULTI-LOCATION ROUTING OPTIMIZER
// ========================================

export async function createRoutingOptimization(data: {
  garageId: string;
  routeDate: Date;
  routeType: string;
  startLocation?: string;
  stops: any;
  totalDistance?: number;
  estimatedDuration?: number;
  assignedDriver?: string;
}) {
  try {
    const [route] = await db
      .insert(routingOptimizations)
      .values({
        ...data,
        totalDistance: data.totalDistance?.toString(),
        optimizedRoute: data.stops, // Simple pass-through, real optimization would use mapping API
        status: 'planned',
      })
      .returning();
    
    return route;
  } catch (error) {
    console.error('Error creating routing optimization:', error);
    throw new Error('Failed to create routing optimization');
  }
}

export async function getRoutes(garageId: string, status?: string) {
  try {
    const query = db
      .select({
        id: routingOptimizations.id,
        routeDate: routingOptimizations.routeDate,
        routeType: routingOptimizations.routeType,
        stops: routingOptimizations.stops,
        optimizedRoute: routingOptimizations.optimizedRoute,
        totalDistance: routingOptimizations.totalDistance,
        estimatedDuration: routingOptimizations.estimatedDuration,
        driverName: users.fullName,
        status: routingOptimizations.status,
        createdAt: routingOptimizations.createdAt,
      })
      .from(routingOptimizations)
      .leftJoin(users, eq(routingOptimizations.assignedDriver, users.id))
      .where(eq(routingOptimizations.garageId, garageId))
      .$dynamic();
    
    if (status) {
      query.where(and(
        eq(routingOptimizations.garageId, garageId),
        eq(routingOptimizations.status, status)
      ));
    }
    
    const routes = await query.orderBy(desc(routingOptimizations.routeDate)).limit(50);
    
    return routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
}

// ========================================
// 4. TIME CLOCK & PAYROLL
// ========================================

export async function clockIn(employeeId: string, garageId: string, location?: string) {
  try {
    const [entry] = await db
      .insert(timeClockEntries)
      .values({
        garageId,
        employeeId,
        clockInTime: new Date(),
        location,
      })
      .returning();
    
    return entry;
  } catch (error) {
    console.error('Error clocking in:', error);
    throw new Error('Failed to clock in');
  }
}

export async function clockOut(entryId: string, breakDuration: number = 0) {
  try {
    const clockOutTime = new Date();
    
    // Get the entry to calculate hours
    const [entry] = await db
      .select()
      .from(timeClockEntries)
      .where(eq(timeClockEntries.id, entryId))
      .limit(1);
    
    if (!entry) {
      throw new Error('Time clock entry not found');
    }
    
    const clockInTime = new Date(entry.clockInTime);
    const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / 1000 / 60 - breakDuration;
    const totalHours = (totalMinutes / 60).toFixed(2);
    const overtimeHours = Math.max(0, totalMinutes / 60 - 8).toFixed(2);
    
    const [updated] = await db
      .update(timeClockEntries)
      .set({
        clockOutTime,
        breakDuration,
        totalHours,
        overtimeHours,
      })
      .where(eq(timeClockEntries.id, entryId))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error clocking out:', error);
    throw new Error('Failed to clock out');
  }
}

export async function getTimeEntries(employeeId: string, startDate: Date, endDate: Date) {
  try {
    const entries = await db
      .select()
      .from(timeClockEntries)
      .where(and(
        eq(timeClockEntries.employeeId, employeeId),
        gte(timeClockEntries.clockInTime, startDate),
        lte(timeClockEntries.clockInTime, endDate)
      ))
      .orderBy(desc(timeClockEntries.clockInTime));
    
    return entries;
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
}

export async function calculatePayroll(periodId: string) {
  try {
    // Get period details
    const [period] = await db
      .select()
      .from(payrollPeriods)
      .where(eq(payrollPeriods.id, periodId))
      .limit(1);
    
    if (!period) {
      throw new Error('Payroll period not found');
    }
    
    // Get time entries for period
    const timeEntries = await db
      .select({
        employeeId: timeClockEntries.employeeId,
        regularHours: sql<number>`SUM(CASE WHEN ${timeClockEntries.totalHours}::numeric <= 8 THEN ${timeClockEntries.totalHours}::numeric ELSE 8 END)`,
        overtimeHours: sql<number>`SUM(${timeClockEntries.overtimeHours}::numeric)`,
      })
      .from(timeClockEntries)
      .where(and(
        eq(timeClockEntries.garageId, period.garageId),
        gte(timeClockEntries.clockInTime, period.periodStart),
        lte(timeClockEntries.clockInTime, period.periodEnd)
      ))
      .groupBy(timeClockEntries.employeeId);
    
    return timeEntries;
  } catch (error) {
    console.error('Error calculating payroll:', error);
    return [];
  }
}

// ========================================
// 5. EQUIPMENT CALIBRATION TRACKING
// ========================================

export async function getCalibrationRecords(garageId: string) {
  try {
    const records = await db
      .select({
        id: equipmentCalibration.id,
        toolName: tools.toolName,
        toolNumber: tools.toolNumber,
        calibrationType: equipmentCalibration.calibrationType,
        lastCalibrationDate: equipmentCalibration.lastCalibrationDate,
        nextCalibrationDue: equipmentCalibration.nextCalibrationDue,
        calibrationInterval: equipmentCalibration.calibrationInterval,
        calibratedBy: equipmentCalibration.calibratedBy,
        certificationNumber: equipmentCalibration.certificationNumber,
        status: equipmentCalibration.status,
        createdAt: equipmentCalibration.createdAt,
      })
      .from(equipmentCalibration)
      .innerJoin(tools, eq(equipmentCalibration.toolId, tools.id))
      .where(eq(equipmentCalibration.garageId, garageId))
      .orderBy(equipmentCalibration.nextCalibrationDue);
    
    return records;
  } catch (error) {
    console.error('Error fetching calibration records:', error);
    return [];
  }
}

export async function createCalibrationRecord(data: {
  garageId: string;
  toolId: string;
  calibrationType: string;
  calibrationStandard?: string;
  lastCalibrationDate: Date;
  nextCalibrationDue: Date;
  calibrationInterval: number;
  calibratedBy?: string;
  certificationNumber?: string;
  calibrationResults?: any;
}) {
  try {
    const [record] = await db
      .insert(equipmentCalibration)
      .values(data)
      .returning();
    
    return record;
  } catch (error) {
    console.error('Error creating calibration record:', error);
    throw new Error('Failed to create calibration record');
  }
}

export async function getDueCalibrations(garageId: string) {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Next 30 days
    
    const dueCals = await db
      .select({
        id: equipmentCalibration.id,
        toolName: tools.toolName,
        toolNumber: tools.toolNumber,
        calibrationType: equipmentCalibration.calibrationType,
        nextCalibrationDue: equipmentCalibration.nextCalibrationDue,
        status: equipmentCalibration.status,
      })
      .from(equipmentCalibration)
      .innerJoin(tools, eq(equipmentCalibration.toolId, tools.id))
      .where(and(
        eq(equipmentCalibration.garageId, garageId),
        lte(equipmentCalibration.nextCalibrationDue, dueDate)
      ))
      .orderBy(equipmentCalibration.nextCalibrationDue);
    
    return dueCals;
  } catch (error) {
    console.error('Error fetching due calibrations:', error);
    return [];
  }
}
