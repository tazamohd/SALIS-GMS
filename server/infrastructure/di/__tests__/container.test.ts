import { describe, it, expect, vi } from 'vitest';
import { Container, token } from '../container';

describe('Container', () => {
  it('resolves a registered factory as a lazy singleton', () => {
    const T = token<{ n: number }>('T');
    const factory = vi.fn(() => ({ n: 1 }));
    const c = new Container().register(T, factory);
    const first = c.resolve(T);
    const second = c.resolve(T);
    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledOnce();
  });

  it('resolves a registered value', () => {
    const T = token<number>('num');
    const c = new Container().registerValue(T, 42);
    expect(c.resolve(T)).toBe(42);
  });

  it('injects dependencies through the container argument', () => {
    const DEP = token<number>('dep');
    const SVC = token<{ doubled: number }>('svc');
    const c = new Container()
      .registerValue(DEP, 21)
      .register(SVC, (ctx) => ({ doubled: ctx.resolve(DEP) * 2 }));
    expect(c.resolve(SVC).doubled).toBe(42);
  });

  it('throws for an unregistered token', () => {
    const T = token('missing');
    expect(() => new Container().resolve(T)).toThrow(/No provider registered/);
  });

  it('has() reports registration including parent scope', () => {
    const T = token<number>('t');
    const parent = new Container().registerValue(T, 1);
    const child = parent.createScope();
    expect(child.has(T)).toBe(true);
    expect(new Container().has(T)).toBe(false);
  });

  it('a scope inherits providers but keeps its own instance cache', () => {
    const T = token<object>('obj');
    const parent = new Container().register(T, () => ({}));
    const child = parent.createScope();
    expect(child.resolve(T)).not.toBe(parent.resolve(T));
  });
});
