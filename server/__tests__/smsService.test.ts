import { describe, it, expect } from "vitest";
import { formatSaudiPhoneNumber, isSMSServiceConfigured, sendSMS } from "../smsService";

describe("formatSaudiPhoneNumber", () => {
  it("converts a local 0-prefixed number to +966", () => {
    expect(formatSaudiPhoneNumber("0501234567")).toBe("+966501234567");
  });

  it("adds +966 to a bare 9-digit number", () => {
    expect(formatSaudiPhoneNumber("501234567")).toBe("+966501234567");
  });

  it("prefixes + to a 966-prefixed number", () => {
    expect(formatSaudiPhoneNumber("966501234567")).toBe("+966501234567");
  });

  it("normalizes an already-formatted number", () => {
    expect(formatSaudiPhoneNumber("+966501234567")).toBe("+966501234567");
  });

  it("strips separators before formatting", () => {
    expect(formatSaudiPhoneNumber("050-123-4567")).toBe("+966501234567");
  });
});

describe("SMS graceful degradation (no Twilio credentials in test env)", () => {
  it("reports the service as not configured", () => {
    expect(isSMSServiceConfigured()).toBe(false);
  });

  it("sendSMS returns a clean failure instead of throwing", async () => {
    const res = await sendSMS({ to: "+966501234567", body: "hello" });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/not configured/i);
  });
});
