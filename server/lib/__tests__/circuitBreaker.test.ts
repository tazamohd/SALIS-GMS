import { describe, it, expect, vi } from "vitest";
import { CircuitBreaker } from "../circuitBreaker";

describe("CircuitBreaker", () => {
  it("stays closed and passes through on success", async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const result = await breaker.exec(async () => "ok");
    expect(result).toBe("ok");
    expect(breaker.isOpen()).toBe(false);
  });

  it("opens after reaching the failure threshold", async () => {
    const breaker = new CircuitBreaker(2, 60_000);
    const failing = () => Promise.reject(new Error("boom"));

    await expect(breaker.exec(failing)).rejects.toThrow("boom");
    expect(breaker.isOpen()).toBe(false);

    await expect(breaker.exec(failing)).rejects.toThrow("boom");
    expect(breaker.isOpen()).toBe(true);
  });

  it("rejects immediately with breaker-open error once open", async () => {
    const breaker = new CircuitBreaker(1, 60_000);
    await expect(breaker.exec(() => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    expect(breaker.isOpen()).toBe(true);

    const fn = vi.fn();
    await expect(breaker.exec(fn)).rejects.toThrow("Circuit breaker open");
    expect(fn).not.toHaveBeenCalled();
  });

  it("allows a trial call after the reset timeout and closes on success", async () => {
    const breaker = new CircuitBreaker(1, 10);
    await expect(breaker.exec(() => Promise.reject(new Error("boom")))).rejects.toThrow();
    expect(breaker.isOpen()).toBe(true);

    await new Promise((r) => setTimeout(r, 15));

    const result = await breaker.exec(async () => "recovered");
    expect(result).toBe("recovered");
    expect(breaker.isOpen()).toBe(false);
  });

  it("re-opens if the half-open trial call fails", async () => {
    const breaker = new CircuitBreaker(1, 10);
    await expect(breaker.exec(() => Promise.reject(new Error("boom")))).rejects.toThrow();
    await new Promise((r) => setTimeout(r, 15));

    await expect(breaker.exec(() => Promise.reject(new Error("still down")))).rejects.toThrow("still down");
    expect(breaker.isOpen()).toBe(true);
  });
});
