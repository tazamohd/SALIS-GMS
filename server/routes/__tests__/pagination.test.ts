/**
 * Tests for pagination utilities
 */

import { describe, it, expect } from 'vitest';
import { parsePagination, sendPaginated, DEFAULT_LIMIT, MAX_LIMIT } from '../pagination';

function mockReq(query: Record<string, string> = {}) {
  return { query } as any;
}

function mockRes() {
  let statusCode = 200;
  let jsonData: any = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      jsonData = data;
      return this;
    },
  };
  return { res, getStatus: () => statusCode, getJson: () => jsonData };
}

describe('parsePagination', () => {
  it('returns defaults when no params provided', () => {
    const result = parsePagination(mockReq());
    expect(result.limit).toBe(DEFAULT_LIMIT);
    expect(result.offset).toBe(0);
    expect(result.explicit).toBe(false);
  });

  it('parses valid limit and offset', () => {
    const result = parsePagination(mockReq({ limit: '25', offset: '50' }));
    expect(result.limit).toBe(25);
    expect(result.offset).toBe(50);
    expect(result.explicit).toBe(true);
  });

  it('flags explicit when only offset is provided', () => {
    const result = parsePagination(mockReq({ offset: '10' }));
    expect(result.explicit).toBe(true);
  });

  it('flags explicit when only limit is provided', () => {
    const result = parsePagination(mockReq({ limit: '100' }));
    expect(result.explicit).toBe(true);
  });

  it('clamps limit to MAX_LIMIT', () => {
    const result = parsePagination(mockReq({ limit: '10000' }));
    expect(result.limit).toBe(MAX_LIMIT);
  });

  it('uses default for invalid limit', () => {
    const result = parsePagination(mockReq({ limit: 'abc' }));
    expect(result.limit).toBe(DEFAULT_LIMIT);
  });

  it('rejects negative limit, uses default', () => {
    const result = parsePagination(mockReq({ limit: '-5' }));
    expect(result.limit).toBe(DEFAULT_LIMIT);
  });

  it('uses 0 for negative offset', () => {
    const result = parsePagination(mockReq({ offset: '-10' }));
    expect(result.offset).toBe(0);
  });

  it('uses 0 for invalid offset', () => {
    const result = parsePagination(mockReq({ offset: 'xyz' }));
    expect(result.offset).toBe(0);
  });
});

describe('sendPaginated', () => {
  const data = [{ id: '1' }, { id: '2' }, { id: '3' }];

  it('returns plain array when explicit=false (backward compatibility)', () => {
    const { res, getJson } = mockRes();
    const params = { limit: 50, offset: 0, explicit: false };
    sendPaginated(res, data, 100, params, false);
    const json = getJson();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toEqual(data);
  });

  it('returns envelope when explicit=true', () => {
    const { res, getJson } = mockRes();
    const params = { limit: 50, offset: 0, explicit: true };
    sendPaginated(res, data, 100, params, true);
    const json = getJson();
    expect(json.data).toEqual(data);
    expect(json.pagination.total).toBe(100);
    expect(json.pagination.limit).toBe(50);
    expect(json.pagination.offset).toBe(0);
    expect(json.pagination.hasMore).toBe(true);
  });

  it('sets hasMore=false when offset+length >= total', () => {
    const { res, getJson } = mockRes();
    const params = { limit: 10, offset: 95, explicit: true };
    sendPaginated(res, [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }], 100, params, true);
    const json = getJson();
    expect(json.pagination.hasMore).toBe(false);
  });

  it('sets hasMore=false on last page', () => {
    const { res, getJson } = mockRes();
    const params = { limit: 10, offset: 98, explicit: true };
    sendPaginated(res, [{ id: '99' }, { id: '100' }], 100, params, true);
    const json = getJson();
    expect(json.pagination.hasMore).toBe(false);
  });

  it('sets hasMore=false when result is empty', () => {
    const { res, getJson } = mockRes();
    const params = { limit: 10, offset: 200, explicit: true };
    sendPaginated(res, [], 100, params, true);
    const json = getJson();
    expect(json.pagination.hasMore).toBe(false);
  });
});