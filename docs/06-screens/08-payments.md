# Screen Documentation — Section 08: Payments

**Screens:** 051–053  
**Section:** Billing & Payments  
**Navigation Group:** Billing & Payments  

---

## Screen 051 — Payments (`/payments`)

### Description
Payment recording and tracking for all transactions.

### Payment Methods Supported
| Method | Integration | Currency |
|--------|------------|---------|
| Cash | Manual entry | SAR |
| Bank Transfer | Manual entry + reference | SAR + multi-currency |
| Stripe | Automatic (credit/debit) | SAR + USD + EUR |
| PayPal | Automatic | SAR + USD |

### Payment Recording
1. Select invoice
2. Choose payment method
3. Enter amount (supports partial payments)
4. Enter transaction reference (for bank transfers)
5. Select payment date
6. Click Record Payment
7. Invoice status updates automatically

### Partial Payments
For large invoices, the system supports:
- Multiple partial payments
- Running balance tracking
- Final payment closes the invoice

---

## Screen 052 — Stripe Payment Processing (`/stripe-payment-processing`)

### Description
Stripe integration management and payment link generation.

### Features
- **Payment Link Generator** — Create shareable payment links
- **Card Terminal** — Accept in-person card payments via Stripe Terminal
- **Subscription Billing** — For fleet accounts with monthly billing
- **Webhook Status** — Monitor Stripe webhook health
- **Transaction History** — Stripe transaction log with reconciliation

---

## Screen 053 — Refund Management (`/refund-management`)

### Description
Process and track customer refunds with proper accounting entries.

### Refund Types
| Type | When | Process |
|------|------|---------|
| Full Refund | Job cancelled | Reverse full invoice |
| Partial Refund | Partial work done | Credit for uncompleted work |
| Parts Return | Wrong part supplied | Reverse parts charge |
| Goodwill Credit | Customer complaint | Credit note |

---

*Screen Documentation 08 — Payments*
