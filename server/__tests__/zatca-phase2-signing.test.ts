/**
 * ZATCA Phase 2 — signing, QR, and chain groundwork.
 *
 * Everything spec-deterministic is verified here without ZATCA credentials:
 * the initial-PIH constant, ICV/PIH embedding in the UBL XML, ECDSA
 * signing round-trips, and the 9-tag phase-2 QR TLV structure. The only
 * part left for sandbox credentials is the live FATOORA API exchange.
 */
import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  generateEInvoice,
  generatePhase2QR,
  decodeTlv,
  tlvEntry,
  zatcaEndpointFor,
  ZATCA_INITIAL_PIH,
  type ZATCAPhase2Invoice,
} from "../services/zatca-phase2";
import {
  generateEphemeralKeyPair,
  signInvoiceHash,
  verifyInvoiceSignature,
  getPublicKeyDer,
} from "../services/zatca-signing";

const invoice: ZATCAPhase2Invoice = {
  invoiceNumber: "INV-TEST-000001",
  invoiceType: "simplified",
  invoiceSubType: "0200000",
  issueDate: "2026-08-04T10:00:00Z",
  currency: "SAR",
  seller: {
    name: "SALIS AUTO Demo Garage",
    vatNumber: "311111111111113",
    address: { street: "King Fahd Rd", buildingNumber: "1234", city: "Riyadh", postalCode: "12345", district: "Olaya", country: "SA" },
  },
  lineItems: [
    { description: "Brake pads", quantity: 2, unitPrice: 100, taxCategory: "S", taxPercent: 15, discount: 0 },
  ],
  subtotal: 200,
  totalDiscount: 0,
  totalTaxableAmount: 200,
  totalVAT: 30,
  totalWithVAT: 230,
  paymentMethod: "cash",
};

describe("chain constants and XML embedding", () => {
  it("initial PIH equals base64(hex(sha256('0'))) per spec", () => {
    const expected = Buffer.from(
      crypto.createHash("sha256").update("0").digest("hex"),
    ).toString("base64");
    expect(ZATCA_INITIAL_PIH).toBe(expected);
    expect(ZATCA_INITIAL_PIH).toBe(
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
    );
  });

  it("embeds ICV and PIH in the UBL XML and defaults PIH to the chain start", () => {
    const first = generateEInvoice(invoice, 7);
    expect(first.xml).toContain("<cbc:ID>ICV</cbc:ID>");
    expect(first.xml).toContain("<cbc:UUID>7</cbc:UUID>");
    expect(first.xml).toContain(ZATCA_INITIAL_PIH);

    const chained = generateEInvoice(invoice, 8, first.hash);
    expect(chained.xml).toContain(first.hash);
  });

  it("invoice hash is the base64 sha256 of the XML", () => {
    const ubl = generateEInvoice(invoice, 1);
    const expected = crypto.createHash("sha256").update(ubl.xml, "utf-8").digest("base64");
    expect(ubl.hash).toBe(expected);
  });
});

describe("ECDSA stamp", () => {
  it("signs the invoice hash with secp256k1 and verifies with the public key", () => {
    const { privateKeyPem, publicKeyDer } = generateEphemeralKeyPair();
    const ubl = generateEInvoice(invoice, 1);
    const sig = signInvoiceHash(ubl.hash, privateKeyPem);
    expect(verifyInvoiceSignature(ubl.hash, sig, publicKeyDer)).toBe(true);
    // A different hash must not verify.
    const other = Buffer.from("x".repeat(32)).toString("base64");
    expect(verifyInvoiceSignature(other, sig, publicKeyDer)).toBe(false);
  });
});

describe("phase-2 QR (TLV tags 1–9)", () => {
  it("encodes 8 tags with the right values and a verifiable signature", () => {
    const { privateKeyPem } = generateEphemeralKeyPair();
    const ubl = generateEInvoice(invoice, 1);
    const qr = generatePhase2QR(
      {
        sellerName: invoice.seller.name,
        vatRegistrationNumber: invoice.seller.vatNumber,
        timestamp: invoice.issueDate,
        totalWithVAT: invoice.totalWithVAT,
        vatAmount: invoice.totalVAT,
      },
      ubl.hash,
      privateKeyPem,
    );

    const tags = decodeTlv(qr);
    expect(tags.get(1)!.toString("utf-8")).toBe(invoice.seller.name);
    expect(tags.get(2)!.toString("utf-8")).toBe("311111111111113");
    expect(tags.get(3)!.toString("utf-8")).toBe(invoice.issueDate);
    expect(tags.get(4)!.toString("utf-8")).toBe("230.00");
    expect(tags.get(5)!.toString("utf-8")).toBe("30.00");
    expect(tags.get(6)!.toString("utf-8")).toBe(ubl.hash);

    // Tag 7 (signature) verifies against tag 8 (public key) over tag 6.
    const sigB64 = tags.get(7)!.toString("base64");
    expect(verifyInvoiceSignature(ubl.hash, sigB64, tags.get(8)!)).toBe(true);
    expect(tags.get(8)!.equals(getPublicKeyDer(privateKeyPem))).toBe(true);
    // No certificate configured → no tag 9.
    expect(tags.has(9)).toBe(false);
  });

  it("rejects oversized TLV values instead of truncating silently", () => {
    expect(() => tlvEntry(1, "x".repeat(256))).toThrow();
  });
});

describe("endpoint selection", () => {
  it("simplified invoices report, standard invoices clear", () => {
    expect(zatcaEndpointFor("simplified")).toContain("/invoices/reporting/single");
    expect(zatcaEndpointFor("standard")).toContain("/invoices/clearance/single");
    expect(zatcaEndpointFor("standard")).toContain("developer-portal");
  });
});
