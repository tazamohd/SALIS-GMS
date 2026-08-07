/**
 * Job card DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { JobCard } from '../domain/jobcard.types';

export type JobCardDTO = JobCard;

export function toJobCardDTO(jobCard: JobCard): JobCardDTO {
  return jobCard;
}
