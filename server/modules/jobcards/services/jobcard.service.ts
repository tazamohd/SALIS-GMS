/**
 * Job card service (Phase E5 — Domain Services).
 *
 * Owns the job card module's business rules: tenant scoping, cross-garage
 * visibility (404, never 403), and the list's garage/assignment filtering. The
 * list is tenant-pinned exactly as before (session garage wins; `?garage_id` is
 * honored only for garage-less platform users). Sub-resource ownership
 * reproduces the legacy `requireOwnJobCard` guard. All data access flows through
 * the injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IJobCardRepository } from '../repositories/jobcard.repository';
import type {
  JobCard,
  JobCardAuthContext,
  JobCardListParams,
  JobCardListResult,
} from '../domain/jobcard.types';

export class JobCardService {
  constructor(private readonly repository: IJobCardRepository) {}

  private effectiveGarageId(auth: JobCardAuthContext, garageIdParam?: string): string | undefined {
    return auth.garageId ?? garageIdParam ?? undefined;
  }

  async list(params: JobCardListParams): Promise<JobCardListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.assignedTo, params.limit, params.offset),
      this.repository.count(garageId, params.assignedTo),
    ]);
    return { rows, total };
  }

  async getVisible(id: string, auth: JobCardAuthContext): Promise<JobCard> {
    const jobCard = await this.repository.getById(id);
    if (!jobCard) {
      throw new NotFoundError('Job card not found', { context: { id } });
    }
    if (auth.garageId && jobCard.garageId && jobCard.garageId !== auth.garageId) {
      throw new NotFoundError('Job card not found', { context: { id } });
    }
    return jobCard;
  }

  async getDetailsVisible(id: string, auth: JobCardAuthContext): Promise<unknown> {
    const details = await this.repository.getWithDetails(id);
    if (!details) {
      throw new NotFoundError('Job card not found', { context: { id } });
    }
    if (auth.garageId && details.garageId && details.garageId !== auth.garageId) {
      throw new NotFoundError('Job card not found', { context: { id } });
    }
    return details;
  }

  /**
   * Guard a sub-resource read: the parent job card must belong to the caller's
   * garage. Garage-less callers pass without a lookup — matching the legacy
   * `requireOwnJobCard` behavior exactly.
   */
  private async assertVisible(id: string, auth: JobCardAuthContext): Promise<void> {
    if (!auth.garageId) return;
    const jobCard = await this.repository.getById(id);
    if (!jobCard || (jobCard.garageId && jobCard.garageId !== auth.garageId)) {
      throw new NotFoundError('Job card not found', { context: { id } });
    }
  }

  async parts(jobCardId: string, auth: JobCardAuthContext) {
    await this.assertVisible(jobCardId, auth);
    return this.repository.getParts(jobCardId);
  }

  async tasks(jobCardId: string, auth: JobCardAuthContext) {
    await this.assertVisible(jobCardId, auth);
    return this.repository.getTasks(jobCardId);
  }
}
