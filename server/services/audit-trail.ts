import { db } from '../db';
import { sql } from 'drizzle-orm';

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

// Auto-create table if not exists
async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT NOW(),
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      garage_id TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'low'
    )
  `);
}

let tableReady = false;
async function init() {
  if (!tableReady) {
    await ensureTable();
    tableReady = true;
  }
}

function rowToAuditEntry(row: any): AuditEntry {
  return {
    id: String(row.id),
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
    userId: row.user_id,
    userName: row.user_name,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id || '',
    details: row.details || '',
    ipAddress: row.ip_address || '',
    userAgent: row.user_agent || '',
    garageId: row.garage_id,
    severity: row.severity as AuditEntry['severity'],
  };
}

export async function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
  await init();
  const result = await db.execute(sql`
    INSERT INTO audit_log (user_id, user_name, action, resource, resource_id, details, ip_address, user_agent, garage_id, severity)
    VALUES (${entry.userId}, ${entry.userName}, ${entry.action}, ${entry.resource}, ${entry.resourceId}, ${entry.details}, ${entry.ipAddress}, ${entry.userAgent}, ${entry.garageId}, ${entry.severity})
    RETURNING *
  `);
  return rowToAuditEntry(result.rows[0]);
}

export async function getAuditLog(options?: {
  garageId?: string;
  userId?: string;
  resource?: string;
  action?: string;
  severity?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<{ entries: AuditEntry[]; total: number }> {
  await init();
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  // Build conditions
  const conditions: ReturnType<typeof sql>[] = [];
  if (options?.garageId) conditions.push(sql`garage_id = ${options.garageId}`);
  if (options?.userId) conditions.push(sql`user_id = ${options.userId}`);
  if (options?.resource) conditions.push(sql`resource = ${options.resource}`);
  if (options?.action) conditions.push(sql`action = ${options.action}`);
  if (options?.severity) conditions.push(sql`severity = ${options.severity}`);
  if (options?.from) conditions.push(sql`timestamp >= ${options.from}::timestamp`);
  if (options?.to) conditions.push(sql`timestamp <= ${options.to}::timestamp`);

  let whereClause = sql`1=1`;
  for (const cond of conditions) {
    whereClause = sql`${whereClause} AND ${cond}`;
  }

  const countResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM audit_log WHERE ${whereClause}
  `);
  const total = Number(countResult.rows[0].count);

  const result = await db.execute(sql`
    SELECT * FROM audit_log WHERE ${whereClause}
    ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}
  `);

  return { entries: result.rows.map(rowToAuditEntry), total };
}

export async function getAuditStats(garageId: string) {
  await init();

  // Total entries for this garage
  const totalResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM audit_log WHERE garage_id = ${garageId}
  `);
  const total = Number(totalResult.rows[0].count);

  // Last 24h count
  const last24hResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM audit_log
    WHERE garage_id = ${garageId} AND timestamp > NOW() - INTERVAL '24 hours'
  `);
  const last24h = Number(last24hResult.rows[0].count);

  // Action counts (last 24h)
  const actionResult = await db.execute(sql`
    SELECT action, COUNT(*) as count FROM audit_log
    WHERE garage_id = ${garageId} AND timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY action
  `);
  const actionCounts: Record<string, number> = {};
  for (const row of actionResult.rows) {
    actionCounts[row.action as string] = Number(row.count);
  }

  // Resource counts (last 24h)
  const resourceResult = await db.execute(sql`
    SELECT resource, COUNT(*) as count FROM audit_log
    WHERE garage_id = ${garageId} AND timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY resource
  `);
  const resourceCounts: Record<string, number> = {};
  for (const row of resourceResult.rows) {
    resourceCounts[row.resource as string] = Number(row.count);
  }

  // Severity counts (last 24h)
  const severityResult = await db.execute(sql`
    SELECT severity, COUNT(*) as count FROM audit_log
    WHERE garage_id = ${garageId} AND timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY severity
  `);
  const severityCounts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const row of severityResult.rows) {
    severityCounts[row.severity as string] = Number(row.count);
  }

  // Top users (last 24h)
  const topUsersResult = await db.execute(sql`
    SELECT user_name, COUNT(*) as count FROM audit_log
    WHERE garage_id = ${garageId} AND timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY user_name ORDER BY count DESC LIMIT 5
  `);
  const topUsers = topUsersResult.rows.map((row: any) => ({
    name: row.user_name as string,
    count: Number(row.count),
  }));

  return {
    total,
    last24h,
    actionCounts,
    resourceCounts,
    severityCounts,
    topUsers,
  };
}

// Seed demo audit entries
export async function seedAuditLog(garageId: string) {
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

  for (const e of demoEntries) {
    await logAudit({
      ...e,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: 'Mozilla/5.0',
      garageId,
    });
  }
}
