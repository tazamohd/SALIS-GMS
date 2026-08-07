/**
 * Repository contracts (Phase E4 — Repository Pattern).
 *
 * All database access belongs behind a repository. Services and controllers
 * depend on these interfaces, never on the data layer directly, so queries are
 * reusable, data access is centralized, and services are testable with in-memory
 * fakes.
 *
 * During incremental migration a repository may delegate to the legacy
 * `storage` facade (a strangler-fig seam): the boundary is established now, and
 * a repository's internals can later move to direct Drizzle queries without any
 * change to its callers.
 */

import { NotFoundError } from '../errors/domain-errors';

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | undefined>;
}

export interface TenantScopedRepository<T, ID = string> extends Repository<T, ID> {
  /** List within a tenant (garage). `undefined` garage = platform-wide. */
  list(garageId: string | undefined, options?: { limit: number; offset: number }): Promise<T[]>;
  count(garageId: string | undefined): Promise<number>;
}

export abstract class BaseRepository {
  /** Throw a domain 404 when a required record is missing. */
  protected assertFound<T>(value: T | undefined | null, entity: string, id: string): T {
    if (value == null) {
      throw new NotFoundError(`${entity} not found`, { context: { entity, id } });
    }
    return value;
  }
}
