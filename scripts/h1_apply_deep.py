#!/usr/bin/env python3
"""Apply the deep (2-hop / dual-garage) H-1 guards to server/routes.ts.

These are the NEEDS-DECISION routes: their table has no garage_id and reaches
the tenant only via a 2-hop parent chain, or (inventory_transfers) via two
garage columns either of which may own the row."""
import re

ROUTES = "server/routes.ts"

CHAT_MSG_CONV = {"table": "chat_messages", "fk": "message_id",
                 "parent": {"table": "chat_conversations", "fk": "conversation_id"}}
LOYALTY_ACC_USER = {"table": "customer_loyalty_accounts", "fk": "account_id",
                    "parent": {"table": "users", "fk": "customer_id"}}
OBD_VEH = {"table": "obd_sessions", "fk": "session_id",
           "parent": {"table": "vehicles", "fk": "vehicle_id"}}
PLAN_INV = {"table": "payment_plans", "fk": "payment_plan_id",
            "parent": {"table": "invoices", "fk": "invoice_id"}}
FC_FG = {"table": "fleet_contracts", "fk": "contract_id",
         "parent": {"table": "fleet_groups", "fk": "fleet_group_id"}}

# (method, path, config)
BATCH = [
    ("delete", "/api/chat/attachments/:id", {"table": "chat_attachments", "parent": CHAT_MSG_CONV}),
    ("get",   "/api/loyalty-redemptions/:id", {"table": "loyalty_redemptions", "parent": LOYALTY_ACC_USER}),
    ("patch", "/api/loyalty-redemptions/:id", {"table": "loyalty_redemptions", "parent": LOYALTY_ACC_USER}),
    ("get",   "/api/loyalty-transactions/:id", {"table": "loyalty_transactions", "parent": LOYALTY_ACC_USER}),
    ("get",   "/api/diagnostic-reports/:id", {"table": "diagnostic_reports", "parent": OBD_VEH}),
    # parent-addressed: :sessionId is an obd_session (1 hop to vehicles)
    ("get",   "/api/obd-sessions/:sessionId/diagnostic-reports",
        {"table": "obd_sessions", "idParam": "sessionId", "parent": {"table": "vehicles", "fk": "vehicle_id"}}),
    ("patch", "/api/installments/:id", {"table": "installments", "parent": PLAN_INV}),
    # parent-addressed: :licenseId is a subscription_license (1 hop to branches)
    ("get",   "/api/subscription-licenses/:licenseId/audit-logs",
        {"table": "subscription_licenses", "idParam": "licenseId", "parent": {"table": "branches", "fk": "branch_id"}}),
    # parent-addressed: :fulfillmentOrderId is a fulfillment_order (1 hop to branches)
    ("get",   "/api/fulfillment-orders/:fulfillmentOrderId/shipment-events",
        {"table": "fulfillment_orders", "idParam": "fulfillmentOrderId", "parent": {"table": "branches", "fk": "branch_id"}}),
    # :renewalId is a contract_renewal (2 hops: fleet_contracts -> fleet_groups)
    ("post",  "/api/contracts/:contractId/renewals/:renewalId/accept",
        {"table": "contract_renewals", "idParam": "renewalId", "parent": FC_FG}),
    # dual-garage: visible to either party of the transfer
    ("get",   "/api/inventory-transfers/:id", {"table": "inventory_transfers", "tenantColumns": ["from_garage_id", "to_garage_id"]}),
    ("patch", "/api/inventory-transfers/:id", {"table": "inventory_transfers", "tenantColumns": ["from_garage_id", "to_garage_id"]}),
    ("post",  "/api/inventory-transfers/:id/approve", {"table": "inventory_transfers", "tenantColumns": ["from_garage_id", "to_garage_id"]}),
    ("post",  "/api/inventory-transfers/:id/complete", {"table": "inventory_transfers", "tenantColumns": ["from_garage_id", "to_garage_id"]}),
]

def hop_str(h):
    parts = [f"table: '{h['table']}'", f"fk: '{h['fk']}'"]
    if "parentIdColumn" in h:
        parts.append(f"parentIdColumn: '{h['parentIdColumn']}'")
    if "tenantColumn" in h:
        parts.append(f"tenantColumn: '{h['tenantColumn']}'")
    if "parent" in h:
        parts.append("parent: " + hop_str(h["parent"]))
    return "{ " + ", ".join(parts) + " }"

def guard_str(cfg):
    parts = [f"table: '{cfg['table']}'"]
    if "idParam" in cfg:
        parts.append(f"idParam: '{cfg['idParam']}'")
    if "tenantColumn" in cfg:
        parts.append(f"tenantColumn: '{cfg['tenantColumn']}'")
    if "tenantColumns" in cfg:
        parts.append("tenantColumns: [" + ", ".join(f"'{c}'" for c in cfg["tenantColumns"]) + "]")
    if "parent" in cfg:
        parts.append("parent: " + hop_str(cfg["parent"]))
    return "requireResourceOwnership({ " + ", ".join(parts) + " }), "

with open(ROUTES) as f:
    lines = f.readlines()

applied, already, missing = [], [], []
for method, path, cfg in BATCH:
    esc = re.escape(path)
    pat = re.compile(r"(app\." + method + r"\(['\"`]" + esc + r"['\"`],\s*)(isAuthenticated,\s*)")
    hit = False
    for i, line in enumerate(lines):
        if not pat.search(line):
            continue
        hit = True
        if "requireResourceOwnership(" in line:
            already.append(f"{method} {path}")
            break
        lines[i] = pat.sub(lambda mm: mm.group(1) + mm.group(2) + guard_str(cfg), line, count=1)
        applied.append(f"{method} {path} -> {cfg['table']}")
        break
    if not hit:
        missing.append(f"{method} {path}")

with open(ROUTES, "w") as f:
    f.writelines(lines)

print(f"APPLIED {len(applied)}")
for a in applied: print("  +", a)
if already: print("ALREADY", already)
if missing: print("NOT FOUND", missing)
