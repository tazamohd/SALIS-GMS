import { describe, it, expect, vi } from 'vitest';
import {
  PermissionRegistry,
  authorize,
  sameTenant,
  isOwner,
  type AuthzSubject,
} from '../registry';
import { AuthenticationError, AuthorizationError } from '../../errors/domain-errors';

describe('PermissionRegistry', () => {
  it('grants permissions by role', () => {
    const reg = new PermissionRegistry()
      .definePermission({ key: 'customers:read', description: 'Read customers' })
      .grant('MANAGER', 'customers:read');
    expect(reg.can({ role: 'MANAGER' }, 'customers:read')).toBe(true);
    expect(reg.can({ role: 'TECHNICIAN' }, 'customers:read')).toBe(false);
  });

  it('lets an explicit policy override role grants (tenant-aware)', () => {
    const reg = new PermissionRegistry().definePolicy('customers:read', sameTenant);
    const subject: AuthzSubject = { role: 'MANAGER', garageId: 'g1' };
    expect(reg.can(subject, 'customers:read', { garageId: 'g1' })).toBe(true);
    expect(reg.can(subject, 'customers:read', { garageId: 'g2' })).toBe(false);
  });

  it('sameTenant: platform (garage-less) subject or resource passes', () => {
    expect(sameTenant({ garageId: null }, { garageId: 'g2' })).toBe(true);
    expect(sameTenant({ garageId: 'g1' }, { garageId: null })).toBe(true);
    expect(sameTenant({ garageId: 'g1' }, { garageId: 'g1' })).toBe(true);
    expect(sameTenant({ garageId: 'g1' }, { garageId: 'g2' })).toBe(false);
  });

  it('isOwner: matches owner id, platform subject bypasses', () => {
    expect(isOwner({ id: 'u1', garageId: 'g1' }, { ownerId: 'u1' })).toBe(true);
    expect(isOwner({ id: 'u1', garageId: 'g1' }, { ownerId: 'u2' })).toBe(false);
    expect(isOwner({ id: 'u1', garageId: null }, { ownerId: 'u2' })).toBe(true);
  });
});

describe('authorize guard', () => {
  const reg = new PermissionRegistry().grant('MANAGER', 'customers:read');

  it('passes 401 to next when unauthenticated', () => {
    const next = vi.fn();
    authorize(reg, 'customers:read')({} as never, {} as never, next);
    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
  });

  it('passes 403 to next when the permission is missing', () => {
    const next = vi.fn();
    authorize(reg, 'customers:read')(
      { user: { role: 'TECHNICIAN' } } as never,
      {} as never,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it('calls next() with no error when permitted', () => {
    const next = vi.fn();
    authorize(reg, 'customers:read')(
      { user: { role: 'MANAGER' } } as never,
      {} as never,
      next,
    );
    expect(next).toHaveBeenCalledWith();
  });
});
