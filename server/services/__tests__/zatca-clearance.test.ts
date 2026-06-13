import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { submitToClearance, isZatcaClearanceConfigured } from "../zatca-phase2";

const ubl = { xml: "<Invoice></Invoice>", hash: "abc123", encodedInvoice: "ZW5jb2RlZA==" };

describe("ZATCA Phase-2 clearance — honest deferral", () => {
  const prevUrl = process.env.ZATCA_API_URL;
  const prevCsid = process.env.ZATCA_CSID;

  beforeEach(() => {
    delete process.env.ZATCA_API_URL;
    delete process.env.ZATCA_CSID;
  });
  afterEach(() => {
    if (prevUrl === undefined) delete process.env.ZATCA_API_URL;
    else process.env.ZATCA_API_URL = prevUrl;
    if (prevCsid === undefined) delete process.env.ZATCA_CSID;
    else process.env.ZATCA_CSID = prevCsid;
  });

  it("is not configured without ZATCA_API_URL + CSID", () => {
    expect(isZatcaClearanceConfigured()).toBe(false);
  });

  it("returns NOT_CONFIGURED and never fabricates CLEARED", async () => {
    const res = await submitToClearance(ubl as any);
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.status).not.toBe("CLEARED");
    expect(res.errors?.[0]).toMatch(/not configured/i);
  });
});
