import { describe, it, expect } from "vitest";

// Unit tests for ledger logic. These test the invariant enforcement
// without a real database connection. The actual LedgerService class
// depends on `db`, so we test the pure validation logic extracted here.

function validateEntries(
  entries: Array<{ direction: "debit" | "credit"; amount: bigint }>,
) {
  if (entries.length < 2) {
    throw new Error("A ledger transaction requires at least 2 entries");
  }

  let totalDebits = BigInt(0);
  let totalCredits = BigInt(0);
  for (const entry of entries) {
    if (entry.amount <= BigInt(0)) {
      throw new Error("Entry amount must be positive");
    }
    if (entry.direction === "debit") totalDebits += entry.amount;
    else totalCredits += entry.amount;
  }

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Unbalanced transaction: debits=${totalDebits} credits=${totalCredits}`,
    );
  }

  return { totalDebits, totalCredits };
}

describe("Ledger double-entry invariants", () => {
  it("accepts a balanced two-entry transaction", () => {
    const result = validateEntries([
      { direction: "debit", amount: BigInt(10000) },
      { direction: "credit", amount: BigInt(10000) },
    ]);
    expect(result.totalDebits).toBe(BigInt(10000));
    expect(result.totalCredits).toBe(BigInt(10000));
  });

  it("accepts a multi-leg balanced transaction", () => {
    const result = validateEntries([
      { direction: "debit", amount: BigInt(5000) },
      { direction: "debit", amount: BigInt(500) },
      { direction: "credit", amount: BigInt(4500) },
      { direction: "credit", amount: BigInt(1000) },
    ]);
    expect(result.totalDebits).toBe(BigInt(5500));
    expect(result.totalCredits).toBe(BigInt(5500));
  });

  it("rejects unbalanced entries", () => {
    expect(() =>
      validateEntries([
        { direction: "debit", amount: BigInt(10000) },
        { direction: "credit", amount: BigInt(9999) },
      ]),
    ).toThrow("Unbalanced transaction");
  });

  it("rejects zero-amount entries", () => {
    expect(() =>
      validateEntries([
        { direction: "debit", amount: BigInt(0) },
        { direction: "credit", amount: BigInt(0) },
      ]),
    ).toThrow("Entry amount must be positive");
  });

  it("rejects negative amounts", () => {
    expect(() =>
      validateEntries([
        { direction: "debit", amount: BigInt(-100) },
        { direction: "credit", amount: BigInt(-100) },
      ]),
    ).toThrow("Entry amount must be positive");
  });

  it("rejects a single entry", () => {
    expect(() =>
      validateEntries([{ direction: "debit", amount: BigInt(1000) }]),
    ).toThrow("A ledger transaction requires at least 2 entries");
  });

  it("handles SAR amounts correctly in halalas", () => {
    // 150.75 SAR = 15075 halalas
    const result = validateEntries([
      { direction: "debit", amount: BigInt(15075) },
      { direction: "credit", amount: BigInt(15075) },
    ]);
    expect(result.totalDebits).toBe(BigInt(15075));
  });
});
