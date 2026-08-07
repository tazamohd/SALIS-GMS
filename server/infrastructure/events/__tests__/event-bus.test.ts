import { describe, it, expect, vi } from 'vitest';
import { EventBus, createEvent, type DomainEvent } from '../event-bus';

const noSleep = () => Promise.resolve();

function busWith(overrides = {}) {
  return new EventBus({ sleep: noSleep, defaultRetries: 2, ...overrides });
}

describe('EventBus', () => {
  it('delivers an event to all subscribers', async () => {
    const bus = busWith();
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe('x.happened', a, { name: 'a' });
    bus.subscribe('x.happened', b, { name: 'b' });
    await bus.publish(createEvent('x.happened', { n: 1 }));
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it('is idempotent: the same event id runs a handler at most once', async () => {
    const bus = busWith();
    const handler = vi.fn();
    bus.subscribe('x', handler, { name: 'h' });
    const event: DomainEvent = createEvent('x', {});
    await bus.publish(event);
    await bus.publish(event); // re-delivery of the same id
    expect(handler).toHaveBeenCalledOnce();
  });

  it('retries a failing handler up to its limit, then succeeds', async () => {
    const bus = busWith();
    let calls = 0;
    const handler = vi.fn(() => {
      calls++;
      if (calls < 3) throw new Error('transient');
    });
    bus.subscribe('x', handler, { name: 'h', retries: 2 });
    await bus.publish(createEvent('x', {}));
    expect(calls).toBe(3); // 1 initial + 2 retries
    expect(bus.getDeadLetters()).toHaveLength(0);
  });

  it('dead-letters an event after retries are exhausted without rejecting publish', async () => {
    const dead: unknown[] = [];
    const bus = busWith({ onDeadLetter: (dl: unknown) => dead.push(dl) });
    const handler = vi.fn(() => {
      throw new Error('always fails');
    });
    bus.subscribe('x', handler, { name: 'h', retries: 1 });
    await expect(bus.publish(createEvent('x', {}))).resolves.toBeUndefined();
    expect(handler).toHaveBeenCalledTimes(2); // 1 + 1 retry
    expect(bus.getDeadLetters()).toHaveLength(1);
    expect(dead).toHaveLength(1);
  });

  it('isolates a failing subscriber from a healthy one', async () => {
    const bus = busWith();
    const good = vi.fn();
    const bad = vi.fn(() => {
      throw new Error('boom');
    });
    bus.subscribe('x', good, { name: 'good' });
    bus.subscribe('x', bad, { name: 'bad', retries: 0 });
    await bus.publish(createEvent('x', {}));
    expect(good).toHaveBeenCalledOnce();
    expect(bus.getDeadLetters()).toHaveLength(1);
  });

  it('unsubscribe stops further delivery', async () => {
    const bus = busWith();
    const handler = vi.fn();
    const off = bus.subscribe('x', handler, { name: 'h' });
    off();
    await bus.publish(createEvent('x', {}));
    expect(handler).not.toHaveBeenCalled();
  });

  it('is a no-op when there are no subscribers', async () => {
    const bus = busWith();
    await expect(bus.publish(createEvent('nobody.listening', {}))).resolves.toBeUndefined();
  });
});
