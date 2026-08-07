import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import { success, failure, toErrorModel, sendSuccess, sendError } from '../response';
import { NotFoundError } from '../../errors/domain-errors';

function fakeRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status: vi.fn(function (this: any, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn(function (this: any, body: unknown) {
      this.body = body;
      return this;
    }),
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe('response envelope', () => {
  it('builds a success envelope with optional meta and traceId', () => {
    expect(success({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
    expect(success([1], { pagination: { total: 1, limit: 25, offset: 0, page: 1, hasMore: false } }, 't')).toEqual({
      success: true,
      data: [1],
      meta: { pagination: { total: 1, limit: 25, offset: 0, page: 1, hasMore: false } },
      traceId: 't',
    });
  });

  it('builds an error envelope', () => {
    expect(failure({ code: 'X', message: 'y' }, 't')).toEqual({
      success: false,
      error: { code: 'X', message: 'y' },
      traceId: 't',
    });
  });

  it('maps a domain error to its status/code and an unknown error to a safe 500', () => {
    expect(toErrorModel(new NotFoundError('gone'), 'c1')).toEqual({
      status: 404,
      model: { code: 'NOT_FOUND', message: 'gone', correlationId: 'c1' },
    });
    const unknown = toErrorModel(new Error('db password is hunter2'));
    expect(unknown.status).toBe(500);
    expect(unknown.model.message).toBe('Internal Server Error');
    expect(JSON.stringify(unknown.model)).not.toContain('hunter2');
  });

  it('sendSuccess / sendError write status + envelope', () => {
    const ok = fakeRes();
    sendSuccess(ok, { a: 1 }, { status: 201 });
    expect(ok.statusCode).toBe(201);
    expect(ok.body).toEqual({ success: true, data: { a: 1 } });

    const bad = fakeRes();
    sendError(bad, new NotFoundError('nope'), 'c9');
    expect(bad.statusCode).toBe(404);
    expect(bad.body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'nope', correlationId: 'c9' },
      traceId: 'c9',
    });
  });
});
