/**
 * Job card repository (Phase E4 — Repository Pattern).
 *
 * The only place in the job card module that touches the data layer. Most reads
 * delegate to the legacy `storage` facade (strangler-fig seam); the parts read
 * owns its Drizzle query directly (it was previously inlined in the route
 * handler) — demonstrating the repository absorbing both patterns behind one
 * boundary.
 */

import { eq } from 'drizzle-orm';
import { jobCardParts } from '@shared/schema';
import { db } from '../../../db';
import { storage } from '../../../storage';
import type { JobCard } from '../domain/jobcard.types';

export interface IJobCardRepository {
  listPaginated(
    garageId: string | undefined,
    assignedTo: string | undefined,
    limit: number,
    offset: number,
  ): Promise<JobCard[]>;
  count(garageId: string | undefined, assignedTo: string | undefined): Promise<number>;
  getById(id: string): Promise<JobCard | undefined>;
  getWithDetails(id: string): ReturnType<typeof storage.getJobCardWithDetails>;
  getParts(jobCardId: string): Promise<(typeof jobCardParts.$inferSelect)[]>;
  getTasks(jobCardId: string): ReturnType<typeof storage.getTaskAssignments>;
}

export class JobCardRepository implements IJobCardRepository {
  listPaginated(
    garageId: string | undefined,
    assignedTo: string | undefined,
    limit: number,
    offset: number,
  ): Promise<JobCard[]> {
    return storage.getJobCardsPaginated(garageId, assignedTo, limit, offset);
  }

  count(garageId: string | undefined, assignedTo: string | undefined): Promise<number> {
    return storage.countJobCards(garageId, assignedTo);
  }

  getById(id: string): Promise<JobCard | undefined> {
    return storage.getJobCard(id);
  }

  getWithDetails(id: string) {
    return storage.getJobCardWithDetails(id);
  }

  getParts(jobCardId: string) {
    return db.select().from(jobCardParts).where(eq(jobCardParts.jobCardId, jobCardId));
  }

  getTasks(jobCardId: string) {
    return storage.getTaskAssignments(jobCardId);
  }
}
