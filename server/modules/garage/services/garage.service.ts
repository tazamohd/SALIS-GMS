/**
 * Garage service (Phase E5 — Domain Services).
 *
 * The garage list is a global (non-tenant-scoped) paginated read. Detail throws
 * a domain 404 when missing. Role/branch reads are thin delegations — the route
 * guards (requireManagerOrAbove, requireResourceOwnership) enforce access. All
 * data access flows through the injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IGarageRepository } from '../repositories/garage.repository';
import type { Garage, GarageListParams } from '../domain/garage.types';

export class GarageService {
  constructor(private readonly repository: IGarageRepository) {}

  async list(params: GarageListParams) {
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(params.limit, params.offset),
      this.repository.count(),
    ]);
    return { rows, total };
  }

  async getById(id: string): Promise<Garage> {
    const garage = await this.repository.getById(id);
    if (!garage) {
      throw new NotFoundError('Garage not found', { context: { id } });
    }
    return garage;
  }

  branches(garageId: string) {
    return this.repository.getBranches(garageId);
  }

  roles() {
    return this.repository.getRoles();
  }

  userRoles(userId: string) {
    return this.repository.getUserRoles(userId);
  }
}
