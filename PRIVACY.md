# Privacy Policy — SALIS AUTO

**Last updated:** June 2026
**Controller:** SALIS AUTO ("we", "us", "our")

> **Note:** This is a baseline policy drafted by the engineering team. It must be
> reviewed by qualified legal counsel familiar with the Saudi **Personal Data
> Protection Law (PDPL)** before publication.

SALIS AUTO is a multi-tenant garage management platform. This policy explains
what personal data we process, why, and the rights available to you under the
Saudi PDPL and other applicable laws.

## 1. Who controls your data

Each garage that uses SALIS AUTO ("the Garage") is the **data controller** for
the customer, vehicle, and employee records it enters. SALIS AUTO acts as the
**data processor** that hosts and processes that data on the Garage's behalf
under a data-processing agreement.

## 2. Data we collect

| Category | Examples | Source |
|---|---|---|
| Account data | Name, email, phone, role, password hash | You / the Garage |
| Customer data | Customer name, contact details, national ID/TRN | The Garage |
| Vehicle data | Make, model, VIN, plate, mileage, service history | The Garage |
| Financial data | Invoices, payments, payment-card tokens (held by Stripe, not us) | The Garage / payment processor |
| Employee/HR data | Salary, GOSI, attendance, leave (for Garage staff) | The Garage |
| Usage data | IP address, browser, request logs, request IDs | Automatically |

We do **not** store full payment-card numbers. Card processing is handled by
**Stripe**; we retain only a token and the last four digits.

## 3. Why we process it

- To provide the garage-management service (job cards, invoices, scheduling).
- To authenticate users and secure the platform.
- To produce ZATCA-compliant tax invoices (a legal obligation in Saudi Arabia).
- To send transactional notifications (appointment confirmations, receipts).
- To detect and prevent fraud and abuse.

## 4. Sub-processors

We share data only with sub-processors necessary to run the service:

| Sub-processor | Purpose | Data shared |
|---|---|---|
| Stripe | Payment processing | Payment amount, customer reference |
| Twilio | SMS notifications | Phone number, message body |
| GetResponse | Email campaigns (if enabled by Garage) | Email, name |
| OpenAI | AI features (if enabled by Garage) | Anonymised operational metrics |
| Cloud hosting (Render / Railway / Neon) | Application + database hosting | All platform data |

## 5. Data residency

We aim to host data in a region compliant with Saudi PDPL data-residency
expectations. Where a sub-processor operates outside the Kingdom, transfers are
made under appropriate safeguards.

## 6. Retention

We retain data for as long as the Garage maintains an active account, plus any
period required by Saudi tax law (invoices: typically 6 years). On account
closure, data is deleted or returned within 90 days, except where law requires
longer retention.

## 7. Your rights under PDPL

You may, subject to verification:
- **Access** the personal data we hold about you.
- **Correct** inaccurate data.
- **Delete** your data (subject to legal retention obligations).
- **Object** to or restrict certain processing.
- **Withdraw consent** where processing is based on consent.

To exercise these rights, contact the Garage that holds your record, or email
**privacy@salisauto.com**. We respond within the period required by PDPL.

## 8. Security

We protect data with TLS in transit, hashed passwords (bcrypt), CSRF
protection, security headers (helmet/CSP), per-tenant data isolation, rate
limiting, optional two-factor authentication, and audited access. No system is
perfectly secure; we encourage you to use a strong, unique password and enable
2FA.

## 9. Children

The platform is a business tool not directed at children under 18.

## 10. Changes

We may update this policy. Material changes will be notified through the
application. The "Last updated" date reflects the current version.

## 11. Contact

Privacy questions: **privacy@salisauto.com**
Data protection officer: **dpo@salisauto.com**
