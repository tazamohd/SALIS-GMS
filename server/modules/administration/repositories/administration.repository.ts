/**
 * Administration repository (Phase E). The only data-layer / infrastructure
 * access for the platform-admin surface: the cross-tenant Drizzle read/write
 * queries that backed the monolith handlers, the legacy `storage` application /
 * subscription-request / support-ticket methods, and the system-introspection
 * probes (DB ping, process metrics, integration env-config, temp-credential
 * minting). No business rules here.
 */

import { sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '../../../db';
import { storage } from '../../../storage';
import { hashPassword } from '../../../auth';

export interface PlatformStatsData {
  totalGarages: number;
  activeGarages: number;
  totalUsers: number;
  totalSuppliers: number;
  supportTickets: number;
  pendingApplications: number;
  pendingSubscriptionRequests: number;
  planMix: Array<{ plan: string; count: number }>;
  roleCounts: Array<{ role: string; count: number }>;
}

export interface DbHealth {
  dbOk: boolean;
  dbLatencyMs: number;
  dbConnections: number;
}

export interface CreateGarageInput {
  name: string;
  address: string; // already composed "addr, city, country"
  phone?: string;
  email?: string;
  subscriptionPlan?: string;
}

export interface IAdministrationRepository {
  getStatsData(): Promise<PlatformStatsData>;
  uptimeSeconds(): number;
  listGarages(): Promise<Record<string, unknown>[]>;
  findGarageByName(name: string): Promise<boolean>;
  createGarage(input: CreateGarageInput): Promise<Record<string, unknown> | undefined>;
  setGarageActive(id: string, isActive: boolean): Promise<void>;
  listSuppliers(): Promise<Record<string, unknown>[]>;
  listSupportTickets(): Promise<Record<string, unknown>[]>;
  updateSupportTicket(
    id: string,
    data: Record<string, unknown>,
  ): ReturnType<typeof storage.updateSupportTicket>;
  probeDbHealth(): Promise<DbHealth>;
  systemMetrics(): { uptimeSeconds: number; memoryRssMb: number; memoryHeapUsedMb: number; nodeVersion: string };
  integrationConfig(dbOk: boolean): Array<{ name: string; configured: boolean; operational?: boolean }>;
  listGarageApplications(status?: string): ReturnType<typeof storage.listGarageApplications>;
  getGarageApplication(id: string): ReturnType<typeof storage.getGarageApplication>;
  approveGarageApplication(
    id: string,
    adminUserId: string,
    opts: { hashedPassword?: string },
  ): ReturnType<typeof storage.approveGarageApplication>;
  rejectGarageApplication(
    id: string,
    adminUserId: string,
    reason?: string,
  ): ReturnType<typeof storage.rejectGarageApplication>;
  mintTempCredential(): Promise<{ plaintext: string; hash: string }>;
  listSubscriptionRequests(status?: string): ReturnType<typeof storage.listSubscriptionRequests>;
  approveSubscriptionRequest(
    id: string,
    adminUserId: string,
  ): ReturnType<typeof storage.approveSubscriptionRequest>;
  rejectSubscriptionRequest(
    id: string,
    adminUserId: string,
    reason?: string,
  ): ReturnType<typeof storage.rejectSubscriptionRequest>;
}

export class AdministrationRepository implements IAdministrationRepository {
  async getStatsData(): Promise<PlatformStatsData> {
    const [totalGarages, activeGarages, totalUsers, plans, tickets, pendingApps, pendingSubs, totalSuppliers, roleRows] =
      await Promise.all([
        db.execute(sql`SELECT COUNT(*) as count FROM garages`),
        db.execute(sql`SELECT COUNT(*) as count FROM garages WHERE is_active = true`),
        db.execute(sql`SELECT COUNT(*) as count FROM users`),
        db.execute(sql`SELECT plan, COUNT(*) as count FROM subscriptions WHERE status IN ('active','trialing') GROUP BY plan`),
        db.execute(sql`SELECT COUNT(*) as count FROM support_tickets WHERE status NOT IN ('resolved','closed')`),
        db.execute(sql`SELECT COUNT(*) as count FROM garage_applications WHERE status = 'pending'`),
        db.execute(sql`SELECT COUNT(*) as count FROM subscription_requests WHERE status = 'pending'`),
        db.execute(sql`SELECT COUNT(*) as count FROM suppliers`),
        db.execute(sql`SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC`),
      ]);
    const num = (r: { rows: Record<string, unknown>[] }) => Number(r.rows[0]?.count ?? 0);
    return {
      totalGarages: num(totalGarages),
      activeGarages: num(activeGarages),
      totalUsers: num(totalUsers),
      totalSuppliers: num(totalSuppliers),
      supportTickets: num(tickets),
      pendingApplications: num(pendingApps),
      pendingSubscriptionRequests: num(pendingSubs),
      planMix: (plans.rows as Record<string, unknown>[]).map((r) => ({ plan: String(r.plan), count: Number(r.count) })),
      roleCounts: (roleRows.rows as Record<string, unknown>[]).map((r) => ({ role: String(r.role), count: Number(r.count) })),
    };
  }

  uptimeSeconds(): number {
    return Math.round(process.uptime());
  }

  async listGarages(): Promise<Record<string, unknown>[]> {
    const result = await db.execute(sql`
      SELECT g.*, COUNT(u.id) as user_count
      FROM garages g
      LEFT JOIN users u ON u.garage_id = g.id
      GROUP BY g.id
      ORDER BY g.created_at DESC
      LIMIT 100
    `);
    return result.rows as Record<string, unknown>[];
  }

  async findGarageByName(name: string): Promise<boolean> {
    const existing = await db.execute(sql`SELECT id FROM garages WHERE name = ${name} LIMIT 1`);
    return existing.rows.length > 0;
  }

  async createGarage(input: CreateGarageInput): Promise<Record<string, unknown> | undefined> {
    const result = await db.execute(sql`
      INSERT INTO garages (id, name, address, phone, email, subscription_plan, is_active, created_at)
      VALUES (
        gen_random_uuid(), ${input.name}, ${input.address}, ${input.phone}, ${input.email},
        ${input.subscriptionPlan ?? 'STARTER'}, true, NOW()
      )
      RETURNING *
    `);
    return result.rows[0] as Record<string, unknown> | undefined;
  }

  async setGarageActive(id: string, isActive: boolean): Promise<void> {
    await db.execute(sql`UPDATE garages SET is_active = ${isActive} WHERE id = ${id}`);
  }

  async listSuppliers(): Promise<Record<string, unknown>[]> {
    const result = await db.execute(sql`
      SELECT s.id, s.name, s.contact_person, s.email, s.phone, s.country,
             s.payment_terms, s.is_active, s.created_at, g.name AS garage
      FROM suppliers s
      LEFT JOIN garages g ON g.id = s.garage_id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    return result.rows as Record<string, unknown>[];
  }

  async listSupportTickets(): Promise<Record<string, unknown>[]> {
    const result = await db.execute(sql`
      SELECT t.id, t.garage_id, g.name AS garage, t.subject, t.priority, t.status,
             t.category, t.created_at
      FROM support_tickets t
      LEFT JOIN garages g ON g.id = t.garage_id
      ORDER BY t.created_at DESC
      LIMIT 100`);
    return result.rows as Record<string, unknown>[];
  }

  updateSupportTicket(id: string, data: Record<string, unknown>) {
    return storage.updateSupportTicket(id, data as never);
  }

  async probeDbHealth(): Promise<DbHealth> {
    const dbStart = Date.now();
    let dbOk = true;
    let dbConnections = 0;
    try {
      const conns = await db.execute(sql`SELECT COUNT(*) as count FROM pg_stat_activity WHERE datname = current_database()`);
      dbConnections = Number(conns.rows[0]?.count ?? 0);
    } catch {
      dbOk = false;
    }
    return { dbOk, dbLatencyMs: Date.now() - dbStart, dbConnections };
  }

  systemMetrics() {
    const mem = process.memoryUsage();
    return {
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      nodeVersion: process.version,
    };
  }

  integrationConfig(dbOk: boolean) {
    return [
      { name: 'PostgreSQL Database', configured: true, operational: dbOk },
      { name: 'Stripe Billing', configured: !!process.env.STRIPE_SECRET_KEY },
      { name: 'Stripe Webhook Signing', configured: !!process.env.STRIPE_WEBHOOK_SECRET },
      { name: 'Wathq CR Registry', configured: !!process.env.WATHQ_API_KEY },
      { name: 'Google Vision OCR', configured: !!process.env.GOOGLE_VISION_API_KEY },
      { name: 'Sentry Error Tracking', configured: !!process.env.SENTRY_DSN },
      { name: 'SMS Provider', configured: !!process.env.SMS_PROVIDER },
      { name: 'WhatsApp Webhook', configured: !!process.env.WHATSAPP_VERIFY_TOKEN },
    ];
  }

  listGarageApplications(status?: string) {
    return storage.listGarageApplications(status);
  }
  getGarageApplication(id: string) {
    return storage.getGarageApplication(id);
  }
  approveGarageApplication(id: string, adminUserId: string, opts: { hashedPassword?: string }) {
    return storage.approveGarageApplication(id, adminUserId, opts);
  }
  rejectGarageApplication(id: string, adminUserId: string, reason?: string) {
    return storage.rejectGarageApplication(id, adminUserId, reason);
  }

  async mintTempCredential(): Promise<{ plaintext: string; hash: string }> {
    const plaintext = randomBytes(9).toString('base64url');
    const hash = await hashPassword(plaintext);
    return { plaintext, hash };
  }

  listSubscriptionRequests(status?: string) {
    return storage.listSubscriptionRequests(status);
  }
  approveSubscriptionRequest(id: string, adminUserId: string) {
    return storage.approveSubscriptionRequest(id, adminUserId);
  }
  rejectSubscriptionRequest(id: string, adminUserId: string, reason?: string) {
    return storage.rejectSubscriptionRequest(id, adminUserId, reason);
  }
}
