export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  garageId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory audit log (would be DB table in production)
const auditLog: AuditEntry[] = [];
let nextId = 1;

export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const audit: AuditEntry = {
    id: String(nextId++),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditLog.unshift(audit);
  if (auditLog.length > 1000) auditLog.length = 1000;
  return audit;
}

export function getAuditLog(options?: {
  garageId?: string;
  userId?: string;
  resource?: string;
  action?: string;
  severity?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): { entries: AuditEntry[]; total: number } {
  let filtered = [...auditLog];
  if (options?.garageId) filtered = filtered.filter(e => e.garageId === options.garageId);
  if (options?.userId) filtered = filtered.filter(e => e.userId === options.userId);
  if (options?.resource) filtered = filtered.filter(e => e.resource === options.resource);
  if (options?.action) filtered = filtered.filter(e => e.action === options.action);
  if (options?.severity) filtered = filtered.filter(e => e.severity === options.severity);
  if (options?.from) filtered = filtered.filter(e => e.timestamp >= options.from!);
  if (options?.to) filtered = filtered.filter(e => e.timestamp <= options.to!);

  const total = filtered.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return { entries: filtered.slice(offset, offset + limit), total };
}

export function getAuditStats(garageId: string) {
  const entries = auditLog.filter(e => e.garageId === garageId);
  const last24h = entries.filter(e => new Date(e.timestamp) > new Date(Date.now() - 86400000));

  const actionCounts: Record<string, number> = {};
  const resourceCounts: Record<string, number> = {};
  const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };

  last24h.forEach(e => {
    actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
    resourceCounts[e.resource] = (resourceCounts[e.resource] || 0) + 1;
    severityCounts[e.severity]++;
  });

  return {
    total: entries.length,
    last24h: last24h.length,
    actionCounts,
    resourceCounts,
    severityCounts,
    topUsers: Object.entries(
      last24h.reduce((acc: Record<string, number>, e) => { acc[e.userName] = (acc[e.userName] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
  };
}

// Seed demo audit entries
export function seedAuditLog(garageId: string) {
  const demoEntries = [
    { userId: '1', userName: 'Admin', action: 'LOGIN', resource: 'auth', resourceId: '1', details: 'Successful login', severity: 'low' as const },
    { userId: '2', userName: 'Mohammed', action: 'CREATE', resource: 'job_card', resourceId: 'JC-1042', details: 'Created job card for Toyota Camry', severity: 'low' as const },
    { userId: '1', userName: 'Admin', action: 'UPDATE', resource: 'user', resourceId: '5', details: 'Changed user role from technician to manager', severity: 'high' as const },
    { userId: '3', userName: 'Sara', action: 'DELETE', resource: 'invoice', resourceId: 'INV-089', details: 'Voided invoice INV-089', severity: 'high' as const },
    { userId: '2', userName: 'Mohammed', action: 'UPDATE', resource: 'inventory', resourceId: 'SP-45', details: 'Adjusted stock quantity from 10 to 8', severity: 'medium' as const },
    { userId: '1', userName: 'Admin', action: 'EXPORT', resource: 'report', resourceId: 'revenue-q1', details: 'Exported Q1 revenue report', severity: 'low' as const },
    { userId: '4', userName: 'Ahmed', action: 'LOGIN_FAILED', resource: 'auth', resourceId: '4', details: 'Failed login attempt - wrong password', severity: 'critical' as const },
    { userId: '1', userName: 'Admin', action: 'UPDATE', resource: 'settings', resourceId: 'garage', details: 'Updated VAT rate to 15%', severity: 'high' as const },
    { userId: '2', userName: 'Mohammed', action: 'CREATE', resource: 'purchase_order', resourceId: 'PO-234', details: 'Created PO for brake parts', severity: 'medium' as const },
    { userId: '3', userName: 'Sara', action: 'UPDATE', resource: 'job_card', resourceId: 'JC-1038', details: 'Status changed to completed', severity: 'low' as const },
  ];

  demoEntries.forEach(e => logAudit({ ...e, ipAddress: '192.168.1.' + Math.floor(Math.random() * 255), userAgent: 'Mozilla/5.0', garageId }));
}
