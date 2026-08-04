/**
 * ZATCA Phase 2 — cryptographic stamp (signing) utilities.
 *
 * ZATCA e-invoices are stamped with an ECDSA signature over the invoice
 * hash using the secp256k1 curve. The signing key + CSID certificate are
 * issued by ZATCA during onboarding (see server/scripts/zatca-onboard.ts).
 *
 * Key-deferred: with no ZATCA_EC_PRIVATE_KEY configured the platform runs
 * unsigned (phase-1 style QR, stub clearance). Configuring the key and
 * certificate upgrades every generated invoice to a signed phase-2 stamp
 * with the full 9-tag QR — no code changes.
 *
 * Env:
 *   ZATCA_EC_PRIVATE_KEY   PEM (or base64 of PEM) secp256k1 EC private key
 *   ZATCA_CERTIFICATE      PEM (or base64 of PEM) CSID certificate
 */
import crypto from "crypto";

export interface ZatcaSigningConfig {
  privateKeyPem: string;
  certificatePem?: string;
}

function decodeMaybeBase64Pem(value: string): string {
  const v = value.trim();
  if (v.includes("-----BEGIN")) return v;
  try {
    const decoded = Buffer.from(v, "base64").toString("utf-8");
    if (decoded.includes("-----BEGIN")) return decoded;
  } catch {
    /* fall through */
  }
  return v;
}

/** Signing config from env, or null when the platform runs unsigned. */
export function getZatcaSigningConfig(): ZatcaSigningConfig | null {
  const key = process.env.ZATCA_EC_PRIVATE_KEY;
  if (!key) return null;
  const cert = process.env.ZATCA_CERTIFICATE;
  return {
    privateKeyPem: decodeMaybeBase64Pem(key),
    certificatePem: cert ? decodeMaybeBase64Pem(cert) : undefined,
  };
}

/**
 * ECDSA-sign the (base64) invoice hash. Returns the DER signature, base64.
 * ZATCA signs the hash bytes themselves (the hash is the message digest).
 */
export function signInvoiceHash(invoiceHashBase64: string, privateKeyPem: string): string {
  const hashBytes = Buffer.from(invoiceHashBase64, "base64");
  const key = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign("sha256", hashBytes, key);
  return signature.toString("base64");
}

/** Verify a signature produced by signInvoiceHash (used by tests + QR readers). */
export function verifyInvoiceSignature(
  invoiceHashBase64: string,
  signatureBase64: string,
  publicKeyDer: Buffer,
): boolean {
  const key = crypto.createPublicKey({ key: publicKeyDer, format: "der", type: "spki" });
  return crypto.verify(
    "sha256",
    Buffer.from(invoiceHashBase64, "base64"),
    key,
    Buffer.from(signatureBase64, "base64"),
  );
}

/** Public key bytes (DER SubjectPublicKeyInfo) for QR tag 8. */
export function getPublicKeyDer(privateKeyPem: string): Buffer {
  const priv = crypto.createPrivateKey(privateKeyPem);
  const pub = crypto.createPublicKey(priv);
  return pub.export({ format: "der", type: "spki" }) as Buffer;
}

/**
 * Extract the certificate's own signature bytes (QR tag 9 on simplified
 * invoices). An X.509 certificate is DER SEQUENCE{ tbs, sigAlg, sigValue
 * BIT STRING } — we walk the outer sequence and return the final BIT
 * STRING's contents.
 */
export function getCertificateSignature(certificatePem: string): Buffer {
  const cert = new crypto.X509Certificate(certificatePem);
  const der = cert.raw;

  // Minimal DER reader.
  let offset = 0;
  const readTL = (): { tag: number; length: number; headerLen: number } => {
    const tag = der[offset];
    let len = der[offset + 1];
    let headerLen = 2;
    if (len & 0x80) {
      const n = len & 0x7f;
      len = 0;
      for (let i = 0; i < n; i++) len = (len << 8) | der[offset + 2 + i];
      headerLen = 2 + n;
    }
    return { tag, length: len, headerLen };
  };

  // Outer SEQUENCE
  const outer = readTL();
  if (outer.tag !== 0x30) throw new Error("Not a DER certificate");
  offset += outer.headerLen;

  // Child 1: tbsCertificate (skip)
  let tl = readTL();
  offset += tl.headerLen + tl.length;
  // Child 2: signatureAlgorithm (skip)
  tl = readTL();
  offset += tl.headerLen + tl.length;
  // Child 3: signatureValue BIT STRING
  tl = readTL();
  if (tl.tag !== 0x03) throw new Error("Certificate signature BIT STRING not found");
  // First content byte of a BIT STRING is the unused-bits count.
  return der.subarray(offset + tl.headerLen + 1, offset + tl.headerLen + tl.length);
}

/** Generate an ephemeral secp256k1 keypair (dev/test only). */
export function generateEphemeralKeyPair(): { privateKeyPem: string; publicKeyDer: Buffer } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
  });
  return {
    privateKeyPem: privateKey.export({ format: "pem", type: "sec1" }).toString(),
    publicKeyDer: publicKey.export({ format: "der", type: "spki" }) as Buffer,
  };
}
