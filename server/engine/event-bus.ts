// @ts-nocheck
/**
 * SALIS AUTO - Event Bus
 * In-process pub/sub system for cross-module communication.
 * Upgradeable to Redis/RabbitMQ for distributed deployments.
 */

import type { WorkflowEvent } from '../../shared/workflows';

type EventHandler = (event: WorkflowEvent) => Promise<void> | void;

interface Subscription {
  pattern: string;
  handler: EventHandler;
  description: string;
  async: boolean;
}

class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private eventLog: WorkflowEvent[] = [];
  private maxLogSize = 1000;

  /**
   * Subscribe to events matching a pattern.
   * Patterns support wildcards: "job.*", "*.created", "*.*"
   */
  on(pattern: string, handler: EventHandler, description = '', async = true): () => void {
    const sub: Subscription = { pattern, handler, description, async };

    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, []);
    }
    this.subscriptions.get(pattern)!.push(sub);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(pattern);
      if (subs) {
        const idx = subs.indexOf(sub);
        if (idx !== -1) subs.splice(idx, 1);
        if (subs.length === 0) this.subscriptions.delete(pattern);
      }
    };
  }

  /**
   * Emit an event to all matching subscribers.
   * Events are typed as "category.action" (e.g., "job.completed", "inventory.low")
   */
  async emit(event: WorkflowEvent): Promise<void> {
    // Log the event
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    const matchingHandlers: { handler: EventHandler; async: boolean }[] = [];

    for (const [pattern, subs] of this.subscriptions.entries()) {
      if (this.matchPattern(pattern, event.type)) {
        for (const sub of subs) {
          matchingHandlers.push({ handler: sub.handler, async: sub.async });
        }
      }
    }

    // Execute sync handlers first, then async handlers in parallel
    const syncHandlers = matchingHandlers.filter(h => !h.async);
    const asyncHandlers = matchingHandlers.filter(h => h.async);

    // Sync handlers run sequentially
    for (const { handler } of syncHandlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Sync handler error for "${event.type}":`, err);
      }
    }

    // Async handlers run in parallel (fire-and-forget with error logging)
    if (asyncHandlers.length > 0) {
      Promise.allSettled(
        asyncHandlers.map(({ handler }) =>
          Promise.resolve(handler(event)).catch(err => {
            console.error(`[EventBus] Async handler error for "${event.type}":`, err);
          })
        )
      );
    }
  }

  /**
   * Create a typed event helper
   */
  createEvent(
    type: string,
    entityType: string,
    entityId: string,
    garageId: string,
    data: Record<string, any> = {},
    userId?: string
  ): WorkflowEvent {
    return {
      type,
      entityType,
      entityId,
      garageId,
      userId,
      data,
      timestamp: new Date(),
    };
  }

  /**
   * Get recent events (for Command Center)
   */
  getRecentEvents(limit = 50, garageId?: string): WorkflowEvent[] {
    let events = [...this.eventLog].reverse();
    if (garageId) {
      events = events.filter(e => e.garageId === garageId);
    }
    return events.slice(0, limit);
  }

  /**
   * Get event counts by type (for analytics)
   */
  getEventCounts(since?: Date, garageId?: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.eventLog) {
      if (since && event.timestamp < since) continue;
      if (garageId && event.garageId !== garageId) continue;
      counts[event.type] = (counts[event.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Get all registered subscriptions (for debugging/monitoring)
   */
  getSubscriptions(): Array<{ pattern: string; count: number; descriptions: string[] }> {
    const result: Array<{ pattern: string; count: number; descriptions: string[] }> = [];
    for (const [pattern, subs] of this.subscriptions.entries()) {
      result.push({
        pattern,
        count: subs.length,
        descriptions: subs.map(s => s.description).filter(Boolean),
      });
    }
    return result;
  }

  /**
   * Pattern matching: supports "job.completed", "job.*", "*.completed", "*.*"
   */
  private matchPattern(pattern: string, eventType: string): boolean {
    if (pattern === '*' || pattern === '*.*') return true;

    const patternParts = pattern.split('.');
    const eventParts = eventType.split('.');

    if (patternParts.length !== eventParts.length) return false;

    return patternParts.every((part, i) => part === '*' || part === eventParts[i]);
  }
}

// Singleton instance
export const eventBus = new EventBus();
