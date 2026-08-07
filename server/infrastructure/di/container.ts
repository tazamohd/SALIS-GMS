/**
 * Minimal typed dependency-injection container (Phase E3 — Dependency Injection).
 *
 * Providers are keyed by typed tokens. Resolution is lazy and singleton by
 * default (a provider runs once, the result is cached). `createScope()` returns
 * a child container that inherits parent providers but caches its own instances
 * — useful for per-request scoping. This exists to decouple wiring from
 * construction so services are easy to test with fakes.
 */

export type Token<T> = symbol & { readonly __brand?: T };

/** Create a typed token. The description aids debugging and error messages. */
export function token<T>(description: string): Token<T> {
  return Symbol(description) as Token<T>;
}

export type Factory<T> = (container: Container) => T;

export class Container {
  private readonly factories = new Map<symbol, Factory<unknown>>();
  private readonly instances = new Map<symbol, unknown>();

  constructor(private readonly parent?: Container) {}

  /** Register a lazy singleton provider. */
  register<T>(t: Token<T>, factory: Factory<T>): this {
    this.factories.set(t, factory as Factory<unknown>);
    return this;
  }

  /** Register an already-constructed value. */
  registerValue<T>(t: Token<T>, value: T): this {
    this.instances.set(t, value);
    return this;
  }

  has(t: Token<unknown>): boolean {
    return (
      this.instances.has(t) || this.factories.has(t) || (this.parent?.has(t) ?? false)
    );
  }

  resolve<T>(t: Token<T>): T {
    if (this.instances.has(t)) return this.instances.get(t) as T;

    // Walk the scope chain. The nearest FACTORY instantiates a fresh instance
    // cached on THIS scope (so a child scope gets its own instance from an
    // inherited provider — request scoping). An explicit registered VALUE found
    // first is a shared singleton and is returned as-is.
    for (let node: Container | undefined = this; node; node = node.parent) {
      const factory = node.factories.get(t);
      if (factory) {
        const value = factory(this) as T;
        this.instances.set(t, value);
        return value;
      }
      if (node.instances.has(t)) return node.instances.get(t) as T;
    }

    throw new Error(`No provider registered for token: ${String(t.description)}`);
  }

  /** Child container that inherits providers but keeps its own instance cache. */
  createScope(): Container {
    return new Container(this);
  }
}
