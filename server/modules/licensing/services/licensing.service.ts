/**
 * Licensing service (Phase D.1 — Domain Services).
 *
 * Owns the license lifecycle for the issuable-key subsystem that complements the
 * SaaS `subscriptions` entitlement model: issue a signed key bound to a plan +
 * limits, activate/deactivate it against a tenant, validate it (with the
 * offline grace window), renew, and revoke — every transition audited in
 * `license_activations`. Entitlement limits reuse `@shared/plans`: a license
 * only overrides what it sets; everything else inherits the plan default. No
 * data access here — all through the repository.
 */

import { PLANS, PLAN_HIERARCHY, type PlanId } from '@shared/plans';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../infrastructure/errors/domain-errors';
import type { ILicensingRepository, LicenseFilter } from '../repositories/licensing.repository';
import type { LicensePayload } from '../../../services/licensing/license-key';

const DAY_MS = 86_400_000;
const LICENSE_TYPES = ['subscription', 'perpetual', 'trial'];

type LicenseRow = Awaited<ReturnType<ILicensingRepository['getById']>>;

export interface IssueLicenseInput {
  plan?: unknown;
  type?: unknown;
  durationDays?: unknown;
  expiresAt?: unknown;
  offlineGraceDays?: unknown;
  issuedTo?: unknown;
  boundGarageId?: unknown;
  maxUsers?: number | null;
  maxBranches?: number | null;
  maxGarages?: number | null;
  maxVehicles?: number | null;
  storageGb?: number | null;
  apiQuotaPerDay?: number | null;
  metadata?: Record<string, unknown>;
}

export class LicensingService {
  constructor(private readonly repository: ILicensingRepository) {}

  private num(v: unknown): number | null {
    return v === 'unlimited' || v == null ? null : Number(v);
  }

  /** Effective entitlements = license overrides ?? the plan default. */
  entitlements(lic: NonNullable<LicenseRow>) {
    const planLimits = PLANS[lic.plan as PlanId]?.limits;
    return {
      plan: lic.plan,
      limits: {
        maxUsers: lic.maxUsers ?? (planLimits ? this.num(planLimits.users) : null),
        maxBranches: lic.maxBranches ?? (planLimits ? this.num(planLimits.branches) : null),
        maxGarages: lic.maxGarages ?? null,
        maxVehicles: lic.maxVehicles ?? null,
        storageGb: lic.storageGb ?? (planLimits ? this.num(planLimits.storageGb) : null),
        apiQuotaPerDay: lic.apiQuotaPerDay ?? null,
      },
    };
  }

  private computeExpiry(type: string, input: IssueLicenseInput, issuedAt: Date): Date | null {
    if (type === 'perpetual') return null;
    if (input.expiresAt) return new Date(input.expiresAt as string);
    const days = Number(input.durationDays) > 0 ? Number(input.durationDays) : type === 'trial' ? 14 : 365;
    return new Date(issuedAt.getTime() + days * DAY_MS);
  }

  async issue(input: IssueLicenseInput, issuedBy: string | undefined) {
    const plan = String(input.plan ?? '').toUpperCase();
    if (!(plan in PLAN_HIERARCHY)) {
      throw new ValidationError('Invalid plan. Use STARTER, PRO or ENTERPRISE.');
    }
    const type = LICENSE_TYPES.includes(String(input.type)) ? String(input.type) : 'subscription';
    const planLimits = PLANS[plan as PlanId].limits;
    const limits = {
      maxUsers: input.maxUsers ?? this.num(planLimits.users),
      maxBranches: input.maxBranches ?? this.num(planLimits.branches),
      maxGarages: input.maxGarages ?? null,
      maxVehicles: input.maxVehicles ?? null,
      storageGb: input.storageGb ?? this.num(planLimits.storageGb),
      apiQuotaPerDay: input.apiQuotaPerDay ?? null,
    };
    const offlineGraceDays = Number(input.offlineGraceDays) >= 0 ? Number(input.offlineGraceDays) : 7;
    const boundGarageId = typeof input.boundGarageId === 'string' ? input.boundGarageId : null;

    const id = this.repository.newId();
    const issuedAt = new Date();
    const expiresAt = this.computeExpiry(type, input, issuedAt);
    const payload: LicensePayload = {
      id,
      plan,
      type,
      limits,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      offlineGraceDays,
    };
    const licenseKey = this.repository.sign(payload);

    const license = await this.repository.create({
      id,
      licenseKey,
      plan,
      type,
      status: boundGarageId ? 'active' : 'issued',
      ...limits,
      boundGarageId,
      issuedTo: typeof input.issuedTo === 'string' ? input.issuedTo : null,
      issuedBy: issuedBy ?? null,
      issuedAt,
      activatedAt: boundGarageId ? issuedAt : null,
      expiresAt,
      offlineGraceDays,
      metadata: input.metadata ?? {},
    } as never);

    if (boundGarageId) {
      await this.repository.recordActivation({ licenseId: id, action: 'activated', garageId: boundGarageId, performedBy: issuedBy ?? null });
    }
    return { license, licenseKey };
  }

  list(filter: LicenseFilter) {
    return this.repository.list(filter);
  }

  async get(id: string) {
    const license = await this.repository.getById(id);
    if (!license) throw new NotFoundError('License not found');
    return license;
  }

  async activations(id: string) {
    await this.get(id);
    return this.repository.listActivations(id);
  }

  async activate(licenseKey: string, garageId: string | undefined, performedBy: string | undefined) {
    if (!garageId) throw new ValidationError('No garage associated with this account');
    if (!this.repository.verify(licenseKey).valid) throw new ValidationError('Invalid license key');
    const lic = await this.repository.getByKey(licenseKey);
    if (!lic) throw new NotFoundError('License not found');
    if (lic.status === 'revoked') throw new ConflictError('License has been revoked');
    if (lic.boundGarageId && lic.boundGarageId !== garageId) {
      throw new ConflictError('License is already activated for another tenant');
    }
    const now = new Date();
    if (lic.expiresAt && now > lic.expiresAt) throw new ValidationError('License has expired');

    const license = await this.repository.update(lic.id, {
      status: 'active',
      boundGarageId: garageId,
      activatedAt: lic.activatedAt ?? now,
      lastValidatedAt: now,
    } as never);
    await this.repository.recordActivation({ licenseId: lic.id, action: 'activated', garageId, performedBy: performedBy ?? null });
    return { license, entitlements: this.entitlements(license!) };
  }

  async validate(licenseKey: string) {
    const sig = this.repository.verify(licenseKey);
    if (!sig.valid) return { valid: false, reason: sig.reason ?? 'invalid signature' };
    const lic = await this.repository.getByKey(licenseKey);
    if (!lic) return { valid: false, reason: 'unknown license' };
    if (lic.status === 'revoked') return { valid: false, status: 'revoked', reason: 'revoked' };

    const now = new Date();
    let status = 'active';
    let graceUntil: string | null = null;
    if (lic.expiresAt) {
      const graceEnd = new Date(lic.expiresAt.getTime() + lic.offlineGraceDays * DAY_MS);
      if (now > graceEnd) {
        await this.repository.update(lic.id, { status: 'expired' } as never);
        return { valid: false, status: 'expired', reason: 'expired' };
      }
      if (now > lic.expiresAt) {
        status = 'grace';
        graceUntil = graceEnd.toISOString();
      }
    }
    await this.repository.update(lic.id, { lastValidatedAt: now } as never);
    await this.repository.recordActivation({ licenseId: lic.id, action: 'validated', garageId: lic.boundGarageId ?? null });
    return {
      valid: true,
      status,
      plan: lic.plan,
      entitlements: this.entitlements(lic),
      expiresAt: lic.expiresAt ? lic.expiresAt.toISOString() : null,
      graceUntil,
    };
  }

  async renew(id: string, extendDays: number, performedBy: string | undefined) {
    const lic = await this.get(id);
    if (lic.status === 'revoked') throw new ConflictError('Cannot renew a revoked license');
    const days = Number(extendDays) > 0 ? Number(extendDays) : 365;
    const now = new Date();
    const base = lic.expiresAt && lic.expiresAt > now ? lic.expiresAt : now;
    const expiresAt = new Date(base.getTime() + days * DAY_MS);
    const license = await this.repository.update(id, { expiresAt, status: 'active' } as never);
    await this.repository.recordActivation({ licenseId: id, action: 'renewed', performedBy: performedBy ?? null, details: { extendDays: days } });
    return license;
  }

  async revoke(id: string, reason: string | undefined, performedBy: string | undefined) {
    await this.get(id);
    const license = await this.repository.update(id, {
      status: 'revoked',
      revokedAt: new Date(),
      revokedReason: reason ?? null,
    } as never);
    await this.repository.recordActivation({ licenseId: id, action: 'revoked', performedBy: performedBy ?? null, details: { reason: reason ?? null } });
    return license;
  }

  async deactivate(id: string, performedBy: string | undefined) {
    const lic = await this.get(id);
    if (lic.status === 'revoked') throw new ConflictError('License is revoked');
    const license = await this.repository.update(id, { status: 'issued', boundGarageId: null, activatedAt: null } as never);
    await this.repository.recordActivation({ licenseId: id, action: 'deactivated', garageId: lic.boundGarageId ?? null, performedBy: performedBy ?? null });
    return license;
  }
}
