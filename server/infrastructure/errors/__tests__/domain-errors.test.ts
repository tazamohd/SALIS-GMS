import { describe, it, expect } from 'vitest';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  AuthorizationError,
  BusinessRuleError,
  isDomainError,
} from '../domain-errors';

describe('domain-errors', () => {
  it('maps each error to its code and status', () => {
    expect(new NotFoundError('x').httpStatus).toBe(404);
    expect(new NotFoundError('x').code).toBe('NOT_FOUND');
    expect(new ValidationError('x').httpStatus).toBe(400);
    expect(new AuthorizationError('x').httpStatus).toBe(403);
    expect(new BusinessRuleError('x').httpStatus).toBe(422);
  });

  it('exposes status as an alias of httpStatus for the legacy handler', () => {
    const err = new NotFoundError('gone');
    expect(err.status).toBe(err.httpStatus);
  });

  it('is instanceof DomainError and Error (prototype chain intact)', () => {
    const err = new NotFoundError('gone');
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(Error);
    expect(isDomainError(err)).toBe(true);
    expect(isDomainError(new Error('plain'))).toBe(false);
  });

  it('projects to a wire model with details and correlation id', () => {
    const err = new ValidationError('bad', { details: [{ field: 'name' }] });
    const model = err.toModel('trace-1');
    expect(model).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'bad',
      details: [{ field: 'name' }],
      correlationId: 'trace-1',
    });
  });

  it('carries context and cause without leaking them into the model', () => {
    const cause = new Error('root');
    const err = new NotFoundError('gone', { context: { id: '7' }, cause });
    expect(err.context).toEqual({ id: '7' });
    expect(err.cause).toBe(cause);
    expect(err.toModel()).toEqual({ code: 'NOT_FOUND', message: 'gone' });
  });
});
