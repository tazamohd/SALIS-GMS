import { describe, it, expect } from 'vitest';
import { cn } from './utils';
import { isUnauthorizedError } from './authUtils';

describe('cn (className merge)', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('lets later tailwind utilities win conflicts', () => {
    // tailwind-merge: the last conflicting padding utility should remain.
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('supports conditional object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });
});

describe('isUnauthorizedError', () => {
  it('matches a 401 Unauthorized error message', () => {
    expect(isUnauthorizedError(new Error('401: Unauthorized'))).toBe(true);
  });

  it('is false for other errors', () => {
    expect(isUnauthorizedError(new Error('500: Internal Server Error'))).toBe(false);
    expect(isUnauthorizedError(new Error('forbidden'))).toBe(false);
  });
});
