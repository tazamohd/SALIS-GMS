// PHASE 6 - COMPLIANCE & QUALITY BACKEND SERVICE
// 4 modules with database operations

import { db } from "./db";
import { 
  environmentalCompliance,
  qualityChecklists,
  nonConformances,
  correctiveActions,
  safetyIncidents,
  incidentInvestigations,
  insuranceClaims,
  users
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

// ========================================
// 1. ENVIRONMENTAL COMPLIANCE
// ========================================

export async function createComplianceRecord(data: {
  garageId: string;
  complianceType: string;
  recordDate: Date;
  wasteType?: string;
  quantity?: number;
  unit?: string;
  disposalMethod?: string;
  disposalCompany?: string;
  certificationNumber?: string;
  cost?: number;
  regulatoryStandard?: string;
  attachments?: any;
  notes?: string;
}) {
  try {
    const [record] = await db
      .insert(environmentalCompliance)
      .values({
        ...data,
        quantity: data.quantity?.toString(),
        cost: data.cost?.toString(),
      })
      .returning();
    
    return record;
  } catch (error) {
    console.error('Error creating compliance record:', error);
    throw new Error('Failed to create compliance record');
  }
}

export async function getComplianceRecords(garageId: string, complianceType?: string) {
  try {
    const query = db
      .select()
      .from(environmentalCompliance)
      .where(eq(environmentalCompliance.garageId, garageId))
      .$dynamic();
    
    if (complianceType) {
      query.where(and(
        eq(environmentalCompliance.garageId, garageId),
        eq(environmentalCompliance.complianceType, complianceType)
      ));
    }
    
    const records = await query.orderBy(desc(environmentalCompliance.recordDate)).limit(100);
    
    return records;
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    return [];
  }
}

export async function getComplianceAnalytics(garageId: string, startDate: Date, endDate: Date) {
  try {
    const analytics = await db
      .select({
        wasteType: environmentalCompliance.wasteType,
        totalQuantity: sql<number>`SUM(${environmentalCompliance.quantity}::numeric)`,
        totalCost: sql<number>`SUM(${environmentalCompliance.cost}::numeric)`,
        recordCount: sql<number>`count(*)::int`,
      })
      .from(environmentalCompliance)
      .where(and(
        eq(environmentalCompliance.garageId, garageId),
        gte(environmentalCompliance.recordDate, startDate),
        lte(environmentalCompliance.recordDate, endDate)
      ))
      .groupBy(environmentalCompliance.wasteType);
    
    return analytics;
  } catch (error) {
    console.error('Error fetching compliance analytics:', error);
    return [];
  }
}

// ========================================
// 2. ISO 9001 QUALITY MANAGEMENT
// ========================================

export async function createQualityChecklist(data: {
  garageId: string;
  name: string;
  category?: string;
  checklistItems: any;
}) {
  try {
    const [checklist] = await db
      .insert(qualityChecklists)
      .values(data)
      .returning();
    
    return checklist;
  } catch (error) {
    console.error('Error creating quality checklist:', error);
    throw new Error('Failed to create quality checklist');
  }
}

export async function getQualityChecklists(garageId: string) {
  try {
    const checklists = await db
      .select()
      .from(qualityChecklists)
      .where(and(
        eq(qualityChecklists.garageId, garageId),
        eq(qualityChecklists.isActive, true)
      ))
      .orderBy(qualityChecklists.name);
    
    return checklists;
  } catch (error) {
    console.error('Error fetching quality checklists:', error);
    return [];
  }
}

export async function createNonConformance(data: {
  garageId: string;
  ncNumber: string;
  title: string;
  description: string;
  category?: string;
  severity?: string;
  detectedBy: string;
  detectedDate: Date;
  jobCardId?: string;
  rootCause?: string;
}) {
  try {
    const [nc] = await db
      .insert(nonConformances)
      .values(data)
      .returning();
    
    return nc;
  } catch (error) {
    console.error('Error creating non-conformance:', error);
    throw new Error('Failed to create non-conformance');
  }
}

export async function getNonConformances(garageId: string, status?: string) {
  try {
    const query = db
      .select({
        id: nonConformances.id,
        ncNumber: nonConformances.ncNumber,
        title: nonConformances.title,
        description: nonConformances.description,
        category: nonConformances.category,
        severity: nonConformances.severity,
        detectedBy: users.fullName,
        detectedDate: nonConformances.detectedDate,
        rootCause: nonConformances.rootCause,
        status: nonConformances.status,
        createdAt: nonConformances.createdAt,
      })
      .from(nonConformances)
      .leftJoin(users, eq(nonConformances.detectedBy, users.id))
      .where(eq(nonConformances.garageId, garageId))
      .$dynamic();
    
    if (status) {
      query.where(and(
        eq(nonConformances.garageId, garageId),
        eq(nonConformances.status, status)
      ));
    }
    
    const ncs = await query.orderBy(desc(nonConformances.detectedDate)).limit(100);
    
    return ncs;
  } catch (error) {
    console.error('Error fetching non-conformances:', error);
    return [];
  }
}

export async function createCorrectiveAction(data: {
  ncId: string;
  actionDescription: string;
  assignedTo: string;
  targetDate: Date;
  priority?: string;
}) {
  try {
    const [action] = await db
      .insert(correctiveActions)
      .values(data)
      .returning();
    
    return action;
  } catch (error) {
    console.error('Error creating corrective action:', error);
    throw new Error('Failed to create corrective action');
  }
}

// ========================================
// 3. SAFETY INCIDENT REPORTING
// ========================================

export async function createSafetyIncident(data: {
  garageId: string;
  incidentNumber: string;
  incidentDate: Date;
  incidentType: string;
  severity: string;
  location?: string;
  involvedPersons?: any;
  witnesses?: any;
  description: string;
  immediateActions?: string;
  reportedBy: string;
  oshaRecordable?: boolean;
  medicalTreatment?: boolean;
  lostWorkDays?: number;
  attachments?: any;
}) {
  try {
    const [incident] = await db
      .insert(safetyIncidents)
      .values(data)
      .returning();
    
    return incident;
  } catch (error) {
    console.error('Error creating safety incident:', error);
    throw new Error('Failed to create safety incident');
  }
}

export async function getSafetyIncidents(garageId: string, status?: string) {
  try {
    const query = db
      .select({
        id: safetyIncidents.id,
        incidentNumber: safetyIncidents.incidentNumber,
        incidentDate: safetyIncidents.incidentDate,
        incidentType: safetyIncidents.incidentType,
        severity: safetyIncidents.severity,
        location: safetyIncidents.location,
        description: safetyIncidents.description,
        reportedBy: users.fullName,
        oshaRecordable: safetyIncidents.oshaRecordable,
        status: safetyIncidents.status,
        createdAt: safetyIncidents.createdAt,
      })
      .from(safetyIncidents)
      .leftJoin(users, eq(safetyIncidents.reportedBy, users.id))
      .where(eq(safetyIncidents.garageId, garageId))
      .$dynamic();
    
    if (status) {
      query.where(and(
        eq(safetyIncidents.garageId, garageId),
        eq(safetyIncidents.status, status)
      ));
    }
    
    const incidents = await query.orderBy(desc(safetyIncidents.incidentDate)).limit(100);
    
    return incidents;
  } catch (error) {
    console.error('Error fetching safety incidents:', error);
    return [];
  }
}

export async function createIncidentInvestigation(data: {
  incidentId: string;
  investigator: string;
  investigationDate: Date;
  findings?: string;
  rootCause?: string;
  contributingFactors?: any;
  recommendations?: any;
}) {
  try {
    const [investigation] = await db
      .insert(incidentInvestigations)
      .values(data)
      .returning();
    
    return investigation;
  } catch (error) {
    console.error('Error creating incident investigation:', error);
    throw new Error('Failed to create incident investigation');
  }
}

export async function getSafetyAnalytics(garageId: string, startDate: Date, endDate: Date) {
  try {
    const analytics = await db
      .select({
        totalIncidents: sql<number>`count(*)::int`,
        byType: sql<any>`json_object_agg(${safetyIncidents.incidentType}, count(*))`,
        bySeverity: sql<any>`json_object_agg(${safetyIncidents.severity}, count(*))`,
        oshaRecordableCount: sql<number>`count(*) FILTER (WHERE ${safetyIncidents.oshaRecordable} = true)::int`,
        totalLostWorkDays: sql<number>`SUM(${safetyIncidents.lostWorkDays}::int)`,
      })
      .from(safetyIncidents)
      .where(and(
        eq(safetyIncidents.garageId, garageId),
        gte(safetyIncidents.incidentDate, startDate),
        lte(safetyIncidents.incidentDate, endDate)
      ));
    
    return analytics[0] || {
      totalIncidents: 0,
      byType: {},
      bySeverity: {},
      oshaRecordableCount: 0,
      totalLostWorkDays: 0,
    };
  } catch (error) {
    console.error('Error fetching safety analytics:', error);
    return {
      totalIncidents: 0,
      byType: {},
      bySeverity: {},
      oshaRecordableCount: 0,
      totalLostWorkDays: 0,
    };
  }
}

// ========================================
// 4. INSURANCE CLAIMS
// ========================================

export async function createInsuranceClaim(data: {
  garageId: string;
  claimNumber: string;
  jobCardId?: string;
  customerId: string;
  vehicleId?: string;
  insuranceCompany: string;
  policyNumber?: string;
  claimType?: string;
  incidentDate: Date;
  claimAmount: number;
  deductible?: number;
  adjusterName?: string;
  adjusterContact?: string;
  estimateUrl?: string;
  documents?: any;
  notes?: string;
}) {
  try {
    const [claim] = await db
      .insert(insuranceClaims)
      .values({
        ...data,
        claimAmount: data.claimAmount.toString(),
        deductible: data.deductible?.toString(),
      })
      .returning();
    
    return claim;
  } catch (error) {
    console.error('Error creating insurance claim:', error);
    throw new Error('Failed to create insurance claim');
  }
}

export async function getInsuranceClaims(garageId: string, status?: string) {
  try {
    const query = db
      .select({
        id: insuranceClaims.id,
        claimNumber: insuranceClaims.claimNumber,
        customerName: users.fullName,
        insuranceCompany: insuranceClaims.insuranceCompany,
        claimType: insuranceClaims.claimType,
        incidentDate: insuranceClaims.incidentDate,
        claimAmount: insuranceClaims.claimAmount,
        approvedAmount: insuranceClaims.approvedAmount,
        status: insuranceClaims.status,
        adjusterName: insuranceClaims.adjusterName,
        createdAt: insuranceClaims.createdAt,
      })
      .from(insuranceClaims)
      .leftJoin(users, eq(insuranceClaims.customerId, users.id))
      .where(eq(insuranceClaims.garageId, garageId))
      .$dynamic();
    
    if (status) {
      query.where(and(
        eq(insuranceClaims.garageId, garageId),
        eq(insuranceClaims.status, status)
      ));
    }
    
    const claims = await query.orderBy(desc(insuranceClaims.createdAt)).limit(100);
    
    return claims;
  } catch (error) {
    console.error('Error fetching insurance claims:', error);
    return [];
  }
}

export async function updateClaimStatus(claimId: string, status: string, approvedAmount?: number) {
  try {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (approvedAmount !== undefined) {
      updateData.approvedAmount = approvedAmount.toString();
    }
    
    const [claim] = await db
      .update(insuranceClaims)
      .set(updateData)
      .where(eq(insuranceClaims.id, claimId))
      .returning();
    
    return claim;
  } catch (error) {
    console.error('Error updating claim status:', error);
    throw new Error('Failed to update claim status');
  }
}

export async function getClaimsAnalytics(garageId: string, startDate: Date, endDate: Date) {
  try {
    const analytics = await db
      .select({
        totalClaims: sql<number>`count(*)::int`,
        totalClaimAmount: sql<number>`COALESCE(SUM(${insuranceClaims.claimAmount}::numeric), 0)`,
        totalApprovedAmount: sql<number>`COALESCE(SUM(${insuranceClaims.approvedAmount}::numeric), 0)`,
        byStatus: sql<any>`json_object_agg(${insuranceClaims.status}, count(*))`,
        byInsurer: sql<any>`json_object_agg(${insuranceClaims.insuranceCompany}, count(*))`,
      })
      .from(insuranceClaims)
      .where(and(
        eq(insuranceClaims.garageId, garageId),
        gte(insuranceClaims.createdAt, startDate),
        lte(insuranceClaims.createdAt, endDate)
      ));
    
    return analytics[0] || {
      totalClaims: 0,
      totalClaimAmount: 0,
      totalApprovedAmount: 0,
      byStatus: {},
      byInsurer: {},
    };
  } catch (error) {
    console.error('Error fetching claims analytics:', error);
    return {
      totalClaims: 0,
      totalClaimAmount: 0,
      totalApprovedAmount: 0,
      byStatus: {},
      byInsurer: {},
    };
  }
}
