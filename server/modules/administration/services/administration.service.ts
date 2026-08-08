/**
 * Administration service (Phase E — Domain Services).
 *
 * The business rules for the platform-admin surface: the MRR roll-up from the
 * live plan mix, the garage-name uniqueness + address composition, the
 * support-ticket allow-list, the garage-application approve/reject workflow
 * (temp-credential minting when the applicant has no password), and the
 * subscription-request approve/reject transitions. Rules are lifted verbatim
 * from the monolith and surfaced as domain errors. All data / infrastructure
 * access flows through the repository.
 */

import { PLANS } from '@shared/plans';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/errors/domain-errors';
import type { IAdministrationRepository } from '../repositories/administration.repository';

const SUPPORT_TICKET_FIELDS = ['status', 'priority', 'assignedTo'] as const;

export class AdministrationService {
  constructor(private readonly repository: IAdministrationRepository) {}

  async getStats() {
    const data = await this.repository.getStatsData();
    // Real MRR from the subscription plan mix (display prices from the shared
    // plan catalog — Stripe is the billing source of truth).
    const priceByPlan = new Map(
      Object.values(PLANS).map((p: { id: string; priceMonthly?: number }) => [p.id, p.priceMonthly ?? 0]),
    );
    let monthlyRevenue = 0;
    for (const row of data.planMix) {
      monthlyRevenue += (priceByPlan.get(row.plan) ?? 0) * row.count;
    }
    return {
      totalGarages: data.totalGarages,
      activeGarages: data.activeGarages,
      totalUsers: data.totalUsers,
      totalSuppliers: data.totalSuppliers,
      monthlyRevenue,
      supportTickets: data.supportTickets,
      pendingApplications: data.pendingApplications,
      pendingSubscriptionRequests: data.pendingSubscriptionRequests,
      planMix: data.planMix,
      roleCounts: data.roleCounts,
      uptimeSeconds: this.repository.uptimeSeconds(),
    };
  }

  listGarages() {
    return this.repository.listGarages();
  }

  async createGarage(body: Record<string, unknown>) {
    const name = body?.name as string;
    if (await this.repository.findGarageByName(name)) {
      throw new ValidationError('A garage with this name already exists');
    }
    const address = `${body?.address}, ${body?.city}, ${body?.country}`;
    return this.repository.createGarage({
      name,
      address,
      phone: body?.phone as string | undefined,
      email: body?.email as string | undefined,
      subscriptionPlan: body?.subscriptionPlan as string | undefined,
    });
  }

  async setGarageStatus(id: string, status: unknown) {
    await this.repository.setGarageActive(id, status === 'active');
    return { success: true };
  }

  listSuppliers() {
    return this.repository.listSuppliers();
  }

  listSupportTickets() {
    return this.repository.listSupportTickets();
  }

  async updateSupportTicket(id: string, body: Record<string, unknown>) {
    const allowed: Record<string, string> = {};
    for (const k of SUPPORT_TICKET_FIELDS) {
      if (typeof body?.[k] === 'string') allowed[k] = body[k] as string;
    }
    if (Object.keys(allowed).length === 0) throw new ValidationError('Nothing to update');
    const updated = await this.repository.updateSupportTicket(id, allowed);
    if (!updated) throw new NotFoundError('Ticket not found');
    return updated;
  }

  async getSystemHealth() {
    const { dbOk, dbLatencyMs, dbConnections } = await this.repository.probeDbHealth();
    const metrics = this.repository.systemMetrics();
    return {
      uptimeSeconds: metrics.uptimeSeconds,
      dbOk,
      dbLatencyMs,
      dbConnections,
      memoryRssMb: metrics.memoryRssMb,
      memoryHeapUsedMb: metrics.memoryHeapUsedMb,
      nodeVersion: metrics.nodeVersion,
      integrations: this.repository.integrationConfig(dbOk),
    };
  }

  listGarageApplications(status?: string) {
    return this.repository.listGarageApplications(status);
  }

  async approveGarageApplication(id: string, adminUserId: string) {
    const application = await this.repository.getGarageApplication(id);
    if (!application) throw new NotFoundError('Application not found');
    if (application.status === 'rejected') throw new ConflictError('Application already rejected');

    // If the applicant set their own password at signup, provision with it.
    // Otherwise mint a one-time temp password, hash it for storage, and return
    // the plaintext ONCE for the super admin to relay (never persisted/logged).
    let tempPassword: string | undefined;
    let hashedPassword: string | undefined;
    if (!application.ownerPasswordHash) {
      const cred = await this.repository.mintTempCredential();
      tempPassword = cred.plaintext;
      hashedPassword = cred.hash;
    }
    const result = await this.repository.approveGarageApplication(id, adminUserId, { hashedPassword });
    return {
      application: result.application,
      garageId: result.garageId,
      ownerEmail: application.email,
      ...(tempPassword ? { tempPassword } : {}),
    };
  }

  async rejectGarageApplication(id: string, adminUserId: string, reason?: string) {
    const rejected = await this.repository.rejectGarageApplication(id, adminUserId, reason);
    if (!rejected) throw new NotFoundError('Pending application not found');
    return rejected;
  }

  listSubscriptionRequests(status?: string) {
    return this.repository.listSubscriptionRequests(status);
  }

  async approveSubscriptionRequest(id: string, adminUserId: string) {
    try {
      const approved = await this.repository.approveSubscriptionRequest(id, adminUserId);
      if (!approved) throw new NotFoundError('Request not found');
      return approved;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      if (/already/.test((error as Error)?.message || '')) {
        throw new ConflictError((error as Error).message);
      }
      throw error;
    }
  }

  async rejectSubscriptionRequest(id: string, adminUserId: string, reason?: string) {
    const rejected = await this.repository.rejectSubscriptionRequest(id, adminUserId, reason);
    if (!rejected) throw new NotFoundError('Pending request not found');
    return rejected;
  }
}
