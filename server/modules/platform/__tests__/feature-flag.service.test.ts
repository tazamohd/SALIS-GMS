import { describe, it, expect, vi } from 'vitest';
import { FeatureFlagService } from '../services/feature-flag.service';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';

const FLAG = {
  id: 'f1',
  garageId: 'g1',
  flagName: 'beta',
  isEnabled: true,
  source: null,
  createdAt: null,
};

function repo(o: Record<string, unknown> = {}) {
  return {
    listByGarage: vi.fn(async () => [FLAG]),
    getByIdForGarage: vi.fn(async () => FLAG),
    create: vi.fn(async (data: Record<string, unknown>) => ({ ...FLAG, ...data })),
    updateEnabledForGarage: vi.fn(async () => FLAG),
    deleteForGarage: vi.fn(async () => FLAG),
    ...o,
  };
}

describe('FeatureFlagService', () => {
  it('list passes through, garage-scoped', async () => {
    const r = repo();
    const out = await new FeatureFlagService(r as never).list('g1');
    expect(out).toEqual([FLAG]);
    expect(r.listByGarage).toHaveBeenCalledWith('g1');
  });

  it('get returns the flag when found', async () => {
    expect(await new FeatureFlagService(repo() as never).get('f1', 'g1')).toEqual(FLAG);
  });

  it('get throws NotFoundError when the flag is missing', async () => {
    const s = new FeatureFlagService(repo({ getByIdForGarage: vi.fn(async () => undefined) }) as never);
    await expect(s.get('f1', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('create requires a flagName', async () => {
    const s = new FeatureFlagService(repo() as never);
    await expect(s.create('g1', {})).rejects.toBeInstanceOf(ValidationError);
  });

  it('create applies the isEnabled=false / source=null defaults', async () => {
    const r = repo();
    await new FeatureFlagService(r as never).create('g1', { flagName: 'beta' });
    expect(r.create).toHaveBeenCalledWith({
      garageId: 'g1',
      flagName: 'beta',
      isEnabled: false,
      source: null,
    });
  });

  it('create honors explicit isEnabled and source', async () => {
    const r = repo();
    await new FeatureFlagService(r as never).create('g1', {
      flagName: 'beta',
      isEnabled: true,
      source: 'admin',
    });
    expect(r.create).toHaveBeenCalledWith({
      garageId: 'g1',
      flagName: 'beta',
      isEnabled: true,
      source: 'admin',
    });
  });

  it('setEnabled returns the updated flag', async () => {
    const r = repo();
    expect(await new FeatureFlagService(r as never).setEnabled('f1', 'g1', false)).toEqual(FLAG);
    expect(r.updateEnabledForGarage).toHaveBeenCalledWith('f1', 'g1', false);
  });

  it('setEnabled throws NotFoundError when the flag is missing', async () => {
    const s = new FeatureFlagService(repo({ updateEnabledForGarage: vi.fn(async () => undefined) }) as never);
    await expect(s.setEnabled('f1', 'g1', true)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('remove returns the deleted flag', async () => {
    expect(await new FeatureFlagService(repo() as never).remove('f1', 'g1')).toEqual(FLAG);
  });

  it('remove throws NotFoundError when the flag is missing', async () => {
    const s = new FeatureFlagService(repo({ deleteForGarage: vi.fn(async () => undefined) }) as never);
    await expect(s.remove('f1', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });
});
