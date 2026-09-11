// Minimal in-house circuit breaker — no external dependency. Opens after
// `failureThreshold` consecutive failures; stays open for `resetTimeoutMs`
// before allowing one trial ("half-open") call through.
type State = "closed" | "open" | "half_open";

export class CircuitBreaker {
  private state: State = "closed";
  private consecutiveFailures = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 30_000,
  ) {}

  private canAttempt(): boolean {
    if (this.state === "closed") return true;
    if (this.state === "open") {
      if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
        this.state = "half_open";
        return true;
      }
      return false;
    }
    return true; // half_open: allow the trial call
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.consecutiveFailures += 1;
    if (this.state === "half_open" || this.consecutiveFailures >= this.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }

  isOpen(): boolean {
    return !this.canAttempt();
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canAttempt()) {
      throw new Error("Circuit breaker open");
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
}
