/**
 * ZATCA Phase 2 — CSID onboarding (run once per environment).
 *
 * Flow (per the FATOORA onboarding spec):
 *   1. Generate a secp256k1 EC key + CSR carrying ZATCA's required subject
 *      and extension fields (EGS unit serial, VAT number, invoice types…).
 *   2. POST the CSR + portal OTP to /compliance → compliance CSID.
 *   3. Run the compliance checks (submit sample invoices) with that CSID.
 *   4. POST to /production/csids with the compliance request ID → production
 *      CSID certificate.
 *
 * Usage:
 *   npx tsx server/scripts/zatca-onboard.ts \
 *     --vat 3XXXXXXXXXXXXX3 --org "SALIS AUTO" --unit "Riyadh-1" \
 *     --otp 123456 [--env sandbox|simulation|production]
 *
 * Outputs zatca-ec-key.pem + zatca-csr.pem in the working directory and
 * prints the CSID responses. Store the resulting values as env vars:
 *   ZATCA_EC_PRIVATE_KEY, ZATCA_CERTIFICATE, ZATCA_CSID, ZATCA_SECRET
 * Never commit any of these files or values.
 */
import { execFileSync } from "child_process";
import { writeFileSync, readFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i].replace(/^--/, ""), process.argv[i + 1] ?? "");
}

const vat = args.get("vat");
const org = args.get("org") ?? "SALIS AUTO";
const unit = args.get("unit") ?? "EGS-1";
const otp = args.get("otp");
const env = args.get("env") ?? "sandbox";

if (!vat || !/^3\d{13}3$/.test(vat)) {
  console.error("--vat must be a 15-digit VAT number starting and ending with 3");
  process.exit(1);
}

const BASES: Record<string, string> = {
  sandbox: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
  simulation: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
  production: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
};
const base = BASES[env];
if (!base) {
  console.error(`--env must be one of: ${Object.keys(BASES).join(", ")}`);
  process.exit(1);
}

async function main() {
  // 1. EC key + CSR with ZATCA extensions (openssl does the ASN.1 heavy lifting).
  const dir = mkdtempSync(join(tmpdir(), "zatca-"));
  const keyPath = join(dir, "ec-key.pem");
  const csrPath = join(dir, "csr.pem");
  const cnfPath = join(dir, "csr.cnf");

  // Certificate template name differs per environment.
  const template =
    env === "production" ? "ZATCA-Code-Signing" : env === "simulation" ? "PREZATCA-Code-Signing" : "TSTZATCA-Code-Signing";

  writeFileSync(
    cnfPath,
    `oid_section = OIDs
[OIDs]
certificateTemplateName = 1.3.6.1.4.1.311.20.2
[req]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn
[dn]
C = SA
OU = ${unit}
O = ${org}
CN = ${org}-${unit}
[req_ext]
certificateTemplateName = ASN1:PRINTABLESTRING:${template}
subjectAltName = dirName:alt_names
[alt_names]
SN = 1-${org}|2-${unit}|3-${cryptoRandom()}
UID = ${vat}
title = 1100
registeredAddress = Riyadh
businessCategory = Automotive
`,
  );

  execFileSync("openssl", ["ecparam", "-name", "secp256k1", "-genkey", "-noout", "-out", keyPath]);
  execFileSync("openssl", ["req", "-new", "-sha256", "-key", keyPath, "-config", cnfPath, "-out", csrPath]);

  const privateKeyPem = readFileSync(keyPath, "utf-8");
  const csrPem = readFileSync(csrPath, "utf-8");
  const csrBase64 = Buffer.from(csrPem).toString("base64");

  writeFileSync("zatca-ec-key.pem", privateKeyPem, { mode: 0o600 });
  writeFileSync("zatca-csr.pem", csrPem);
  console.log("✅ Key written to zatca-ec-key.pem (keep secret), CSR to zatca-csr.pem");

  if (!otp) {
    console.log("No --otp supplied — stopping after CSR generation.");
    console.log("Get an OTP from the FATOORA portal, then re-run with --otp to request the compliance CSID.");
    return;
  }

  // 2. Compliance CSID.
  const compliance = await fetch(`${base}/compliance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Version": "V2",
      OTP: otp,
    },
    body: JSON.stringify({ csr: csrBase64 }),
  });
  const compData: any = await compliance.json().catch(() => ({}));
  if (!compliance.ok) {
    console.error(`❌ Compliance CSID request failed (HTTP ${compliance.status}):`, compData);
    process.exit(1);
  }
  console.log("✅ Compliance CSID issued:");
  console.log("   requestID:", compData.requestID);
  console.log("   binarySecurityToken (ZATCA_CSID):", compData.binarySecurityToken);
  console.log("   secret (ZATCA_SECRET):", compData.secret);
  console.log();
  console.log("Next: run the compliance checks (submit sample invoices with this CSID),");
  console.log(`then request the production CSID: POST ${base}/production/csids`);
  console.log(`with body {"compliance_request_id": "${compData.requestID}"} using the compliance CSID as Basic auth.`);
  console.log();
  console.log("Finally set env vars: ZATCA_EC_PRIVATE_KEY (the PEM), ZATCA_CERTIFICATE");
  console.log("(decoded binarySecurityToken), ZATCA_CSID, ZATCA_SECRET.");
}

function cryptoRandom(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

main().catch((err) => {
  console.error("Onboarding failed:", err);
  process.exit(1);
});
