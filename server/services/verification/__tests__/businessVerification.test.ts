import { describe, it, expect } from "vitest";
import { verifyBusiness } from "../businessVerification";

describe("verifyBusiness", () => {
  it("verifies well-formed, non-blocklisted identifiers", () => {
    const r = verifyBusiness({ taxNumber: "311111111111113", commercialRegistration: "1011223344" });
    expect(r.status).toBe("verified");
    expect(r.checks.find((c) => c.name === "tax_number_format")?.passed).toBe(true);
  });

  it("fails on bad tax-number format (not 15 digits starting with 3)", () => {
    expect(verifyBusiness({ taxNumber: "123", commercialRegistration: "1011223344" }).status).toBe("failed");
    expect(verifyBusiness({ taxNumber: "411111111111114", commercialRegistration: "1011223344" }).status).toBe("failed");
  });

  it("fails on bad commercial-registration format (not 10 digits)", () => {
    expect(verifyBusiness({ taxNumber: "311111111111113", commercialRegistration: "123" }).status).toBe("failed");
  });

  it("routes well-formed but unconfirmed (blocklisted) identifiers to manual review", () => {
    const r = verifyBusiness({ taxNumber: "300000000000000", commercialRegistration: "1234560000" });
    expect(r.status).toBe("manual_review");
  });

  it("bypasses the registry for demo accounts (still format-checked)", () => {
    const ok = verifyBusiness({ taxNumber: "300000000000003", commercialRegistration: "1010000000", isDemo: true });
    expect(ok.status).toBe("verified");
    expect(ok.provider).toBe("demo");
    // Demo flag does not excuse a malformed number.
    expect(verifyBusiness({ taxNumber: "nope", commercialRegistration: "1010000000", isDemo: true }).status).toBe("failed");
  });
});
