/**
 * In-process event bus (Phase E7 — Event-Driven Architecture).
 *
 * A dependency-free publish/subscribe bus for internal domain events. It is the
 * seam that future asynchronous/out-of-process transports (a real queue) can
 * replace without touching domain code. Guarantees provided here:
 *
 *  - Idempotent delivery: a given (eventId, handler) pair runs at most once
 *    successfully, so re-publishing a retried event is safe.
 *  - Retry with backoff: a throwing handler is retried up to its configured
 *    limit before the event is dead-lettered.
 *  - Dead-letter capture: exhausted events are recorded (and surfaced via
 *    `onDeadLetter`) instead of crashing the publisher.
 *  - Publish never rejects: handler failures are isolated per subscriber, so a
 *    fire-and-forget `publish()` in a request path can never break the response.
 */

import { randomUUID } from 'crypto';

export interface DomainEvent<T = unknown> {
  /** Unique id — the idempotency key. */
  id: string;
  /** Dotted event type, e.g. "customer.viewed". */
  type: string;
  /** ISO-8601 timestamp of when the event occurred. */
  occurredAt: string;
  payload: T;
  /** Optional request/trace correlation id. */
  correlationId?: string;
  /** Delivery attempt number, injected per-handler at dispatch time. */
  attempts?: number;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export interface SubscribeOptions {
  /** Stable handler name — part of the idempotency key and DLQ record. */
  name?: string;
  /** Max retry attempts after the first failure (default: bus default). */
  retries?: number;
}

export interface DeadLetter {
  event: DomainEvent;
  handler: string;
  error: Error;
  attempts: number;
}

type Logger = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, unknown>,
) => void;

export interface EventBusOptions {
  /** Default max retries for handlers that don't specify one. Default 2. */
  defaultRetries?: number;
  /** Backoff in ms for a given attempt (1-based). Default: attempt * 50. */
  backoffMs?: (attempt: number) => number;
  /** Sleep implementation — injectable so tests run without real timers. */
  sleep?: (ms: number) => Promise<void>;
  logger?: Logger;
  onDeadLetter?: (deadLetter: DeadLetter) => void;
  /** Idempotency store (pluggable). Default: in-memory Set. */
  idempotencyStore?: Set<string>;
}

interface Subscription {
  handler: EventHandler;
  name: string;
  retries: number;
}

export function createEvent<T>(type: string, payload: T, correlationId?: string): DomainEvent<T> {
  return {
    id: randomUUID(),
    type,
    occurredAt: new Date().toISOString(),
    payload,
    correlationId,
  };
}

export class EventBus {
  private readonly handlers = new Map<string, Subscription[]>();
  private readonly processed: Set<string>;
  private readonly deadLetters: DeadLetter[] = [];
  private readonly defaultRetries: number;
  private readonly backoffMs: (attempt: number) => number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly logger: Logger;
  private readonly onDeadLetter?: (deadLetter: DeadLetter) => void;

  private anonymousCounter = 0;

  constructor(options: EventBusOptions = {}) {
    this.defaultRetries = options.defaultRetries ?? 2;
    this.backoffMs = options.backoffMs ?? ((attempt) => attempt * 50);
    this.sleep = options.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.logger = options.logger ?? (() => {});
    this.onDeadLetter = options.onDeadLetter;
    this.processed = options.idempotencyStore ?? new Set<string>();
  }

  /** Register a handler for an event type. Returns an unsubscribe function. */
  subscribe<T = unknown>(
    type: string,
    handler: EventHandler<T>,
    options: SubscribeOptions = {},
  ): () => void {
    const name = options.name ?? `${type}#${++this.anonymousCounter}`;
    const sub: Subscription = {
      handler: handler as EventHandler,
      name,
      retries: options.retries ?? this.defaultRetries,
    };
    const list = this.handlers.get(type) ?? [];
    list.push(sub);
    this.handlers.set(type, list);
    return () => {
      const current = this.handlers.get(type);
      if (!current) return;
      this.handlers.set(
        type,
        current.filter((s) => s !== sub),
      );
    };
  }

  /**
   * Publish an event to all subscribers. Resolves once every subscriber has
   * either succeeded, been skipped as a duplicate, or been dead-lettered.
   * Never rejects.
   */
  async publish<T = unknown>(event: DomainEvent<T>): Promise<void> {
    const subs = this.handlers.get(event.type) ?? [];
    if (subs.length === 0) {
      this.logger('debug', `No subscribers for ${event.type}`, { eventId: event.id });
      return;
    }
    await Promise.all(subs.map((sub) => this.dispatch(event, sub)));
  }

  private async dispatch(event: DomainEvent, sub: Subscription): Promise<void> {
    const key = `${event.id}:${sub.name}`;
    if (this.processed.has(key)) {
      this.logger('debug', `Skipping duplicate delivery`, { key, type: event.type });
      return;
    }

    let attempt = 0;
    for (;;) {
      try {
        await sub.handler({ ...event, attempts: attempt });
        this.processed.add(key);
        return;
      } catch (err) {
        attempt++;
        if (attempt > sub.retries) {
          const deadLetter: DeadLetter = {
            event,
            handler: sub.name,
            error: err instanceof Error ? err : new Error(String(err)),
            attempts: attempt,
          };
          this.deadLetters.push(deadLetter);
          this.logger('error', `Event dead-lettered after ${attempt} attempts`, {
            type: event.type,
            handler: sub.name,
            eventId: event.id,
          });
          this.onDeadLetter?.(deadLetter);
          return;
        }
        this.logger('warn', `Handler failed, retrying (attempt ${attempt})`, {
          type: event.type,
          handler: sub.name,
        });
        await this.sleep(this.backoffMs(attempt));
      }
    }
  }

  /** Snapshot of dead-lettered events (for inspection / reprocessing). */
  getDeadLetters(): readonly DeadLetter[] {
    return [...this.deadLetters];
  }

  clearDeadLetters(): void {
    this.deadLetters.length = 0;
  }

  /** Number of distinct (event, handler) deliveries recorded as processed. */
  get processedCount(): number {
    return this.processed.size;
  }
}
