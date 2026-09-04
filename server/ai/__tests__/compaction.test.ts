import { describe, it, expect } from "vitest";
import {
  compactHistory,
  compactRecords,
  truncateText,
  estimateTokens,
  type ChatMsg,
} from "../compaction";

describe("compactHistory", () => {
  it("returns empty for empty/invalid input", () => {
    expect(compactHistory([])).toEqual([]);
    expect(compactHistory(undefined as any)).toEqual([]);
  });

  it("keeps short history unchanged (no marker)", () => {
    const hist: ChatMsg[] = [
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ];
    expect(compactHistory(hist)).toEqual(hist);
  });

  it("caps to the most recent N messages and prepends an elision marker", () => {
    const hist: ChatMsg[] = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `msg ${i}`,
    }));
    const out = compactHistory(hist, { maxMessages: 5 });
    // 5 kept + 1 marker
    expect(out).toHaveLength(6);
    expect(out[0].role).toBe("system");
    expect(out[0].content).toContain("15 earlier message");
    // most recent message is preserved at the end
    expect(out[out.length - 1].content).toBe("msg 19");
  });

  it("respects the token budget", () => {
    const hist: ChatMsg[] = Array.from({ length: 10 }, (_, i) => ({
      role: "user",
      content: "x".repeat(400), // ~100 tokens each
    }));
    const out = compactHistory(hist, { maxMessages: 100, maxTokens: 250 });
    // ~2 messages fit under 250 tokens, plus the marker
    const nonMarker = out.filter((m) => !m.content.startsWith("["));
    expect(nonMarker.length).toBeLessThanOrEqual(3);
    expect(out[0].content).toContain("omitted");
  });
});

describe("compactRecords", () => {
  it("returns all records when under the cap", () => {
    const recs = [1, 2, 3];
    expect(compactRecords(recs, 10)).toEqual({ kept: recs, omittedCount: 0 });
  });

  it("keeps the most recent N and reports the omitted count", () => {
    const recs = Array.from({ length: 25 }, (_, i) => i);
    const { kept, omittedCount } = compactRecords(recs, 10);
    expect(kept).toHaveLength(10);
    expect(kept[0]).toBe(15); // most recent 10 (oldest-first ordering)
    expect(kept[9]).toBe(24);
    expect(omittedCount).toBe(15);
  });

  it("handles non-arrays gracefully", () => {
    expect(compactRecords(null as any)).toEqual({ kept: [], omittedCount: 0 });
  });
});

describe("truncateText", () => {
  it("leaves short text untouched", () => {
    expect(truncateText("hello", 100)).toBe("hello");
    expect(truncateText("", 100)).toBe("");
  });

  it("truncates long text head+tail with a marker", () => {
    const text = "A".repeat(5000) + "B".repeat(5000);
    const out = truncateText(text, 1000);
    expect(out.length).toBeLessThan(text.length);
    expect(out).toContain("chars omitted");
    expect(out.startsWith("A")).toBe(true);
    expect(out.endsWith("B")).toBe(true);
  });
});

describe("estimateTokens", () => {
  it("approximates ~4 chars per token", () => {
    expect(estimateTokens("12345678")).toBe(2);
    expect(estimateTokens("")).toBe(0);
  });
});
