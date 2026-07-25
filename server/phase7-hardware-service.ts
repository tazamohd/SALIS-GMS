// @ts-nocheck
// PHASE 7 - ADVANCED HARDWARE BACKEND SERVICE
// 5 modules with database operations

import { db } from "./db";
import { 
  barcodeScans,
  signageDisplays,
  signageContent,
  kioskSessions,
  kioskCheckIns,
  securityCameras,
  cameraRecordings,
  licensePlateScans,
  vehicleEntryLogs,
  spareParts,
  vehicles,
  tools,
  users,
  appointments
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

// ========================================
// 1. BARCODE/QR SCANNER INTEGRATION
// ========================================

export async function recordBarcodeScan(data: {
  garageId: string;
  scanType: string;
  barcodeData: string;
  partId?: string;
  vehicleId?: string;
  toolId?: string;
  scannedBy: string;
  location?: string;
  associatedAction?: string;
}) {
  try {
    const [scan] = await db
      .insert(barcodeScans)
      .values(data)
      .returning();
    
    return scan;
  } catch (error) {
    console.error('Error recording barcode scan:', error);
    throw new Error('Failed to record barcode scan');
  }
}

export async function getBarcodeScanHistory(garageId: string, scanType?: string) {
  try {
    const query = db
      .select({
        id: barcodeScans.id,
        scanType: barcodeScans.scanType,
        barcodeData: barcodeScans.barcodeData,
        partName: spareParts.partName,
        vehiclePlate: vehicles.licensePlate,
        toolName: tools.toolName,
        scannedBy: users.fullName,
        location: barcodeScans.location,
        associatedAction: barcodeScans.associatedAction,
        createdAt: barcodeScans.createdAt,
      })
      .from(barcodeScans)
      .leftJoin(spareParts, eq(barcodeScans.partId, spareParts.id))
      .leftJoin(vehicles, eq(barcodeScans.vehicleId, vehicles.id))
      .leftJoin(tools, eq(barcodeScans.toolId, tools.id))
      .leftJoin(users, eq(barcodeScans.scannedBy, users.id))
      .where(eq(barcodeScans.garageId, garageId))
      .$dynamic();
    
    if (scanType) {
      query.where(and(
        eq(barcodeScans.garageId, garageId),
        eq(barcodeScans.scanType, scanType)
      ));
    }
    
    const scans = await query.orderBy(desc(barcodeScans.createdAt)).limit(100);
    
    return scans;
  } catch (error) {
    console.error('Error fetching barcode scan history:', error);
    return [];
  }
}

// ========================================
// 2. DIGITAL SIGNAGE SYSTEM
// ========================================

export async function createSignageDisplay(data: {
  garageId: string;
  displayName: string;
  location?: string;
  displayType?: string;
  orientation?: string;
  refreshInterval?: number;
}) {
  try {
    const [display] = await db
      .insert(signageDisplays)
      .values(data)
      .returning();
    
    return display;
  } catch (error) {
    console.error('Error creating signage display:', error);
    throw new Error('Failed to create signage display');
  }
}

export async function getSignageDisplays(garageId: string) {
  try {
    const displays = await db
      .select()
      .from(signageDisplays)
      .where(and(
        eq(signageDisplays.garageId, garageId),
        eq(signageDisplays.isActive, true)
      ))
      .orderBy(signageDisplays.displayName);
    
    return displays;
  } catch (error) {
    console.error('Error fetching signage displays:', error);
    return [];
  }
}

export async function createSignageContent(data: {
  displayId: string;
  contentType: string;
  priority?: number;
  content: any;
  duration?: number;
  validFrom?: Date;
  validUntil?: Date;
}) {
  try {
    const [content] = await db
      .insert(signageContent)
      .values(data)
      .returning();
    
    return content;
  } catch (error) {
    console.error('Error creating signage content:', error);
    throw new Error('Failed to create signage content');
  }
}

export async function getActiveContentForDisplay(displayId: string) {
  try {
    const now = new Date();
    
    const content = await db
      .select()
      .from(signageContent)
      .where(and(
        eq(signageContent.displayId, displayId),
        eq(signageContent.isActive, true)
      ))
      .orderBy(desc(signageContent.priority));
    
    // Filter in memory to handle nullable validFrom/validUntil
    return content.filter(c => {
      const validFrom = c.validFrom ? new Date(c.validFrom) : null;
      const validUntil = c.validUntil ? new Date(c.validUntil) : null;
      const isAfterStart = !validFrom || validFrom <= now;
      const isBeforeEnd = !validUntil || validUntil >= now;
      return isAfterStart && isBeforeEnd;
    });
  } catch (error) {
    console.error('Error fetching signage content:', error);
    return [];
  }
}

// ========================================
// 3. KIOSK CHECK-IN INTERFACE
// ========================================

export async function startKioskSession(garageId: string, kioskId: string) {
  try {
    const [session] = await db
      .insert(kioskSessions)
      .values({
        garageId,
        kioskId,
        sessionStart: new Date(),
      })
      .returning();
    
    return session;
  } catch (error) {
    console.error('Error starting kiosk session:', error);
    throw new Error('Failed to start kiosk session');
  }
}

export async function completeKioskCheckIn(data: {
  sessionId: string;
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  serviceRequested?: any;
  mileage?: number;
  signatureUrl?: string;
}) {
  try {
    const [checkIn] = await db
      .insert(kioskCheckIns)
      .values({
        ...data,
        checkInTime: new Date(),
      })
      .returning();
    
    // Update session
    await db
      .update(kioskSessions)
      .set({
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        checkInCompleted: true,
        sessionEnd: new Date(),
      })
      .where(eq(kioskSessions.id, data.sessionId));
    
    return checkIn;
  } catch (error) {
    console.error('Error completing kiosk check-in:', error);
    throw new Error('Failed to complete kiosk check-in');
  }
}

export async function getKioskCheckIns(garageId: string, limit: number = 50) {
  try {
    const checkIns = await db
      .select({
        id: kioskCheckIns.id,
        customerName: users.fullName,
        vehiclePlate: vehicles.licensePlate,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        serviceRequested: kioskCheckIns.serviceRequested,
        mileage: kioskCheckIns.mileage,
        checkInTime: kioskCheckIns.checkInTime,
      })
      .from(kioskCheckIns)
      .innerJoin(kioskSessions, eq(kioskCheckIns.sessionId, kioskSessions.id))
      .leftJoin(users, eq(kioskCheckIns.customerId, users.id))
      .leftJoin(vehicles, eq(kioskCheckIns.vehicleId, vehicles.id))
      .where(eq(kioskSessions.garageId, garageId))
      .orderBy(desc(kioskCheckIns.checkInTime))
      .limit(limit);
    
    return checkIns;
  } catch (error) {
    console.error('Error fetching kiosk check-ins:', error);
    return [];
  }
}

// ========================================
// 4. SECURITY CAMERA INTEGRATION
// ========================================

export async function createSecurityCamera(data: {
  garageId: string;
  cameraName: string;
  location: string;
  cameraType?: string;
  streamUrl?: string;
  recordingEnabled?: boolean;
  motionDetection?: boolean;
  retentionDays?: number;
}) {
  try {
    const [camera] = await db
      .insert(securityCameras)
      .values(data)
      .returning();
    
    return camera;
  } catch (error) {
    console.error('Error creating security camera:', error);
    throw new Error('Failed to create security camera');
  }
}

export async function getSecurityCameras(garageId: string) {
  try {
    const cameras = await db
      .select()
      .from(securityCameras)
      .where(eq(securityCameras.garageId, garageId))
      .orderBy(securityCameras.location);
    
    return cameras;
  } catch (error) {
    console.error('Error fetching security cameras:', error);
    return [];
  }
}

export async function createCameraRecording(data: {
  cameraId: string;
  vehicleId?: string;
  recordingStart: Date;
  recordingEnd: Date;
  recordingUrl?: string;
  fileSize?: number;
  eventType?: string;
  notes?: string;
}) {
  try {
    const [recording] = await db
      .insert(cameraRecordings)
      .values(data)
      .returning();
    
    return recording;
  } catch (error) {
    console.error('Error creating camera recording:', error);
    throw new Error('Failed to create camera recording');
  }
}

export async function getCameraRecordings(cameraId: string, limit: number = 50) {
  try {
    const recordings = await db
      .select({
        id: cameraRecordings.id,
        vehiclePlate: vehicles.licensePlate,
        recordingStart: cameraRecordings.recordingStart,
        recordingEnd: cameraRecordings.recordingEnd,
        recordingUrl: cameraRecordings.recordingUrl,
        fileSize: cameraRecordings.fileSize,
        eventType: cameraRecordings.eventType,
        isBookmarked: cameraRecordings.isBookmarked,
        createdAt: cameraRecordings.createdAt,
      })
      .from(cameraRecordings)
      .leftJoin(vehicles, eq(cameraRecordings.vehicleId, vehicles.id))
      .where(eq(cameraRecordings.cameraId, cameraId))
      .orderBy(desc(cameraRecordings.recordingStart))
      .limit(limit);
    
    return recordings;
  } catch (error) {
    console.error('Error fetching camera recordings:', error);
    return [];
  }
}

// ========================================
// 5. LICENSE PLATE RECOGNITION
// ========================================

export async function recordLicensePlateScan(data: {
  garageId: string;
  plateNumber: string;
  confidence?: number;
  vehicleId?: string;
  customerId?: string;
  cameraId?: string;
  imageUrl?: string;
  scanType?: string;
  location?: string;
  matchedAutomatically?: boolean;
}) {
  try {
    const [scan] = await db
      .insert(licensePlateScans)
      .values({
        ...data,
        confidence: data.confidence?.toString(),
      })
      .returning();
    
    // Try to match vehicle
    if (data.vehicleId) {
      // Create entry log
      if (data.scanType === 'entry') {
        await db
          .insert(vehicleEntryLogs)
          .values({
            garageId: data.garageId,
            vehicleId: data.vehicleId,
            customerId: data.customerId,
            plateNumber: data.plateNumber,
            entryTime: new Date(),
            purpose: 'service',
            entryScanId: scan.id,
          });
      } else if (data.scanType === 'exit') {
        // Find open entry and update it
        const [openEntry] = await db
          .select()
          .from(vehicleEntryLogs)
          .where(and(
            eq(vehicleEntryLogs.vehicleId, data.vehicleId),
            sql`${vehicleEntryLogs.exitTime} IS NULL`
          ))
          .orderBy(desc(vehicleEntryLogs.entryTime))
          .limit(1);
        
        if (openEntry) {
          const entryTime = new Date(openEntry.entryTime);
          const exitTime = new Date();
          const duration = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000 / 60);
          
          await db
            .update(vehicleEntryLogs)
            .set({
              exitTime,
              duration,
              exitScanId: scan.id,
            })
            .where(eq(vehicleEntryLogs.id, openEntry.id));
        }
      }
    }
    
    return scan;
  } catch (error) {
    console.error('Error recording license plate scan:', error);
    throw new Error('Failed to record license plate scan');
  }
}

export async function getLicensePlateScans(garageId: string, limit: number = 100) {
  try {
    const scans = await db
      .select({
        id: licensePlateScans.id,
        plateNumber: licensePlateScans.plateNumber,
        confidence: licensePlateScans.confidence,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        customerName: users.fullName,
        scanType: licensePlateScans.scanType,
        location: licensePlateScans.location,
        matchedAutomatically: licensePlateScans.matchedAutomatically,
        createdAt: licensePlateScans.createdAt,
      })
      .from(licensePlateScans)
      .leftJoin(vehicles, eq(licensePlateScans.vehicleId, vehicles.id))
      .leftJoin(users, eq(licensePlateScans.customerId, users.id))
      .where(eq(licensePlateScans.garageId, garageId))
      .orderBy(desc(licensePlateScans.createdAt))
      .limit(limit);
    
    return scans;
  } catch (error) {
    console.error('Error fetching license plate scans:', error);
    return [];
  }
}

export async function getVehicleEntryLogs(garageId: string, vehicleId?: string) {
  try {
    const query = db
      .select({
        id: vehicleEntryLogs.id,
        plateNumber: vehicleEntryLogs.plateNumber,
        vehicleMake: vehicles.make,
        vehicleModel: vehicles.model,
        customerName: users.fullName,
        entryTime: vehicleEntryLogs.entryTime,
        exitTime: vehicleEntryLogs.exitTime,
        duration: vehicleEntryLogs.duration,
        purpose: vehicleEntryLogs.purpose,
      })
      .from(vehicleEntryLogs)
      .leftJoin(vehicles, eq(vehicleEntryLogs.vehicleId, vehicles.id))
      .leftJoin(users, eq(vehicleEntryLogs.customerId, users.id))
      .where(eq(vehicleEntryLogs.garageId, garageId))
      .$dynamic();
    
    if (vehicleId) {
      query.where(and(
        eq(vehicleEntryLogs.garageId, garageId),
        eq(vehicleEntryLogs.vehicleId, vehicleId)
      ));
    }
    
    const logs = await query.orderBy(desc(vehicleEntryLogs.entryTime)).limit(100);
    
    return logs;
  } catch (error) {
    console.error('Error fetching vehicle entry logs:', error);
    return [];
  }
}
