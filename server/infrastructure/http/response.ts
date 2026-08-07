/**
 * Standard HTTP response layer (Phase E10 — Shared Response Layer).
 *
 * Defines one success/error envelope plus helpers so every NEW or opt-in
 * endpoint returns a predictable contract:
 *
 *   success:  { success: true,  data, meta?, traceId? }
 *   error:    { success: false, error: { code, message, details?, correlationId? }, traceId? }
 *
 * Existing endpoints keep their legacy shapes until a coordinated client
 * migration (see ADR-0002); this layer is the forward standard, not a
 * retroactive rewrite.
 */

import type { Response } from 'express';
import { isDomainError, type ErrorModel } from '../errors/domain-errors';

export interface ResponseMeta {
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    hasMore: boolean;
  };
  [key: string]: unknown;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
  traceId?: string;
}

export interface ErrorEnvelope {
  success: false;
  error: ErrorModel;
  traceId?: string;
}

export type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export function success<T>(data: T, meta?: ResponseMeta, traceId?: string): SuccessEnvelope<T> {
  const env: SuccessEnvelope<T> = { success: true, data };
  if (meta) env.meta = meta;
  if (traceId) env.traceId = traceId;
  return env;
}

export function failure(error: ErrorModel, traceId?: string): ErrorEnvelope {
  const env: ErrorEnvelope = { success: false, error };
  if (traceId) env.traceId = traceId;
  return env;
}

/**
 * Map any thrown value to an HTTP status + safe error model. Domain errors map
 * to their declared status/code; anything else becomes a generic 500 that never
 * leaks the underlying message.
 */
export function toErrorModel(
  err: unknown,
  correlationId?: string,
): { status: number; model: ErrorModel } {
  if (isDomainError(err)) {
    return { status: err.httpStatus, model: err.toModel(correlationId) };
  }
  const model: ErrorModel = { code: 'INTERNAL_ERROR', message: 'Internal Server Error' };
  if (correlationId) model.correlationId = correlationId;
  return { status: 500, model };
}

/** Send a standard success envelope. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  opts: { status?: number; meta?: ResponseMeta; traceId?: string } = {},
): void {
  res.status(opts.status ?? 200).json(success(data, opts.meta, opts.traceId));
}

/** Send a standard error envelope for a thrown value. */
export function sendError(res: Response, err: unknown, correlationId?: string): void {
  const { status, model } = toErrorModel(err, correlationId);
  res.status(status).json(failure(model, correlationId));
}
