// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, getQueryFn } from '../lib/queryClient';

describe('apiRequest', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends GET request without body', async () => {
    (globalThis.fetch as any).mockResolvedValue({ ok: true, text: () => '' });
    await apiRequest('GET', '/api/test');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/test', {
      method: 'GET',
      headers: {},
      body: undefined,
      credentials: 'include',
    });
  });

  it('sends POST request with JSON body', async () => {
    (globalThis.fetch as any).mockResolvedValue({ ok: true, text: () => '' });
    await apiRequest('POST', '/api/test', { foo: 'bar' });
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
      credentials: 'include',
    });
  });

  it('throws on non-ok response', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Not Found'),
    });
    await expect(apiRequest('GET', '/api/missing')).rejects.toThrow('404: Not Found');
  });

  it('includes credentials for authentication', async () => {
    (globalThis.fetch as any).mockResolvedValue({ ok: true, text: () => '' });
    await apiRequest('DELETE', '/api/item/1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/item/1',
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});

describe('getQueryFn', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches queryKey[0] as URL', async () => {
    const data = { id: 1, name: 'test' };
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });

    const queryFn = getQueryFn({ on401: 'throw' });
    const result = await queryFn({ queryKey: ['/api/items'], meta: undefined, signal: new AbortController().signal, pageParam: undefined, direction: undefined });
    expect(result).toEqual(data);
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/items', { credentials: 'include' });
  });

  it('returns null on 401 when on401 is returnNull', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Unauthorized'),
    });

    const queryFn = getQueryFn({ on401: 'returnNull' });
    const result = await queryFn({ queryKey: ['/api/auth/user'], meta: undefined, signal: new AbortController().signal, pageParam: undefined, direction: undefined });
    expect(result).toBeNull();
  });

  it('throws on 401 when on401 is throw', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Unauthorized'),
    });

    const queryFn = getQueryFn({ on401: 'throw' });
    await expect(
      queryFn({ queryKey: ['/api/auth/user'], meta: undefined, signal: new AbortController().signal, pageParam: undefined, direction: undefined }),
    ).rejects.toThrow('401');
  });
});
