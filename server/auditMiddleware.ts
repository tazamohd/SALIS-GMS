import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { InsertAuditLog } from '@shared/schema';

// Actions that should be audited
const AUDITABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Resource type mapping based on URL patterns
const getResourceType = (url: string): string | null => {
  const patterns: Record<string, string> = {
    '/api/job-cards': 'job_card',
    '/api/appointments': 'appointment',
    '/api/customers': 'customer',
    '/api/vehicles': 'vehicle',
    '/api/invoices': 'invoice',
    '/api/payments': 'payment',
    '/api/spare-parts': 'spare_part',
    '/api/purchase-orders': 'purchase_order',
    '/api/users': 'user',
    '/api/estimates': 'estimate',
    '/api/tools': 'tool',
    '/api/suppliers': 'supplier',
    '/api/integrations': 'integration',
    '/api/security': 'security',
    '/api/gdpr': 'gdpr',
  };

  for (const [pattern, type] of Object.entries(patterns)) {
    if (url.startsWith(pattern)) {
      return type;
    }
  }
  return null;
};

// Extract resource ID from URL
const getResourceId = (url: string): string | null => {
  const idPattern = /\/([a-f0-9-]{36})\/?(?:\?|$)/i;
  const match = url.match(idPattern);
  return match ? match[1] : null;
};

// Get action name based on HTTP method
const getActionName = (method: string, url: string): string => {
  const methodMap: Record<string, string> = {
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete',
  };

  const action = methodMap[method] || method.toLowerCase();
  const resourceType = getResourceType(url);
  
  return resourceType ? `${action}_${resourceType}` : action;
};

// Audit logging middleware
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // Skip if no user or not an auditable method
  if (!user || !AUDITABLE_METHODS.includes(req.method)) {
    return next();
  }

  // Skip auth and non-resource endpoints
  if (req.url.startsWith('/api/auth') || req.url.startsWith('/api/notifications/unread-count')) {
    return next();
  }

  const resourceType = getResourceType(req.url);
  if (!resourceType) {
    return next();
  }

  // Capture original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody: any;
  let statusCode: number;

  // Intercept response to capture status and body
  res.send = function(data: any) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalSend.call(this, data);
  };

  res.json = function(data: any) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalJson.call(this, data);
  };

  // Log after response is sent
  res.on('finish', async () => {
    try {
      // Only log successful operations (2xx status codes)
      if (statusCode >= 200 && statusCode < 300) {
        const garageId = user.claims?.garageId;
        if (!garageId) return;

        const auditLogData: InsertAuditLog = {
          garageId,
          userId: user.id,
          action: getActionName(req.method, req.url),
          resourceType,
          resourceId: getResourceId(req.url) || responseBody?.id,
          details: {
            method: req.method,
            url: req.url,
            body: req.body,
            query: req.query,
            responseStatus: statusCode,
          },
          ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                     req.socket.remoteAddress || 
                     null,
          userAgent: req.headers['user-agent'] || null,
        };

        await storage.createAuditLog(auditLogData);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't fail the request if audit logging fails
    }
  });

  next();
};

// Helper to manually create audit log (for special cases)
export const createManualAuditLog = async (data: InsertAuditLog) => {
  try {
    await storage.createAuditLog(data);
  } catch (error) {
    console.error('Error creating manual audit log:', error);
  }
};
