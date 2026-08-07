/**
 * Composition root (Phase E3 — Dependency Injection).
 *
 * The single place where concrete implementations are wired into the container.
 * Everything else depends on abstractions and resolves from here. Building the
 * graph in one location keeps construction out of business code and makes the
 * dependency structure auditable.
 */

import { Container } from './container';
import { EVENT_BUS, CUSTOMER_REPOSITORY, CUSTOMER_SERVICE } from './tokens';
import { EventBus, type DeadLetter } from '../events/event-bus';
import { CustomerRepository } from '../../modules/customers/repositories/customer.repository';
import { CustomerService } from '../../modules/customers/services/customer.service';
import { registerCustomerEventHandlers } from '../../modules/customers/events/customer.handlers';

function buildEventBus(): EventBus {
  return new EventBus({
    logger: (level, message, context) => {
      if (level === 'error' || level === 'warn') {
        console[level](`[events] ${message}`, context ?? '');
      }
    },
    onDeadLetter: (dl: DeadLetter) => {
      console.error('[events] dead-letter', {
        type: dl.event.type,
        handler: dl.handler,
        attempts: dl.attempts,
      });
    },
  });
}

let container: Container | undefined;

/** Build (once) and return the application container. */
export function getAppContainer(): Container {
  if (container) return container;

  const c = new Container();

  c.register(EVENT_BUS, () => {
    const bus = buildEventBus();
    // Register module event subscribers against the shared bus.
    registerCustomerEventHandlers(bus);
    return bus;
  });

  c.register(CUSTOMER_REPOSITORY, () => new CustomerRepository());

  c.register(
    CUSTOMER_SERVICE,
    (ctx) => new CustomerService(ctx.resolve(CUSTOMER_REPOSITORY), ctx.resolve(EVENT_BUS)),
  );

  container = c;
  return c;
}

/** Reset the container (test isolation). */
export function resetAppContainer(): void {
  container = undefined;
}
