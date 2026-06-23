import { describe, it, expect, vi } from "vitest";
import {
  submitToClearance,
  mapClearanceResponse,
  generateEInvoice,
  type UBLInvoiceXML,
  type ZATCAPhase2Invoice,
} from "../zatca-phase2";

const ubl: UBLInvoiceXML = {
  xml: "<Invoice><cbc:UUID>abc-123</cbc:UUID></Invoice>",
  hash: "HASH==",
  encodedInvoice: "ENC",
};

function fakeResponse(ok: boolean, status: number, body: unknown): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

describe("submitToClearance", () => {
  it("does not call the API and reports dev-mode when no CSID is configured", async () => {
    const fetchMock = vi.fn();
    const res = await submitToClearance(ubl, "", fetchMock as unknown as typeof fetch);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.status).toBe("REPORTED");
    expect(res.warnings?.[0]).toMatch(/not configured/i);
  });

  it("submits and maps a CLEARED response when a CSID is present", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      fakeResponse(true, 200, {
        clearanceStatus: "CLEARED",
        clearanceId: "CLR-9",
        validationResults: { warningMessages: [{ message: "minor" }], errorMessages: [] },
      }),
    );
    const res = await submitToClearance(ubl, "CSID", fetchMock as unknown as typeof fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(res.status).toBe("CLEARED");
    expect(res.clearanceId).toBe("CLR-9");
    expect(res.warnings).toEqual(["minor"]);
  });

  it("returns REJECTED with mapped errors on an HTTP error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      fakeResponse(false, 400, { validationResults: { errorMessages: [{ message: "bad VAT" }] } }),
    );
    const res = await submitToClearance(ubl, "CSID", fetchMock as unknown as typeof fetch);
    expect(res.status).toBe("REJECTED");
    expect(res.errors).toContain("bad VAT");
  });

  it("returns ERROR when the network call throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    const res = await submitToClearance(ubl, "CSID", fetchMock as unknown as typeof fetch);
    expect(res.status).toBe("ERROR");
    expect(res.errors?.[0]).toMatch(/network down/);
  });
});

describe("mapClearanceResponse", () => {
  it("maps REPORTED reporting status", () => {
    const res = mapClearanceResponse({ reportingStatus: "REPORTED" }, "H");
    expect(res.status).toBe("REPORTED");
    expect(res.invoiceHash).toBe("H");
  });

  it("defaults to REJECTED for an unrecognized payload", () => {
    expect(mapClearanceResponse({}, "H").status).toBe("REJECTED");
  });
});

describe("generateEInvoice", () => {
  it("produces UBL XML containing the invoice number and a non-empty hash", () => {
    const invoice: ZATCAPhase2Invoice = {
      invoiceNumber: "INV-1",
      invoiceType: "standard",
      invoiceSubType: "0100000",
      issueDate: "2026-01-01",
      currency: "SAR",
      seller: {
        name: "Seller",
        vatNumber: "300000000000003",
        address: { street: "x", buildingNumber: "1", city: "Riyadh", postalCode: "11111", district: "d", country: "SA" },
      },
      lineItems: [{ description: "oil", quantity: 1, unitPrice: 100, taxCategory: "S", taxPercent: 15, discount: 0 }],
      subtotal: 100,
      totalDiscount: 0,
      totalTaxableAmount: 100,
      totalVAT: 15,
      totalWithVAT: 115,
      paymentMethod: "cash",
    };
    const out = generateEInvoice(invoice, 1, "");
    expect(out.xml).toContain("INV-1");
    expect(out.hash.length).toBeGreaterThan(0);
    expect(out.encodedInvoice.length).toBeGreaterThan(0);
  });
});
