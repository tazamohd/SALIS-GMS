#!/usr/bin/env python3
"""Plan H-1 ownership guards from the mapper's classified.json.

Emits, per actionable route, the guard config the applier will insert — or
defers it with a reason. Prints APPLY and DEFER sets; does NOT edit files.
"""
import json, re, sys

F = "/tmp/claude-0/-home-user-GMS/cc1b5ceb-28a7-5c33-8896-b1a5256734c9/scratchpad/classified.json"
d = json.load(open(F))
groups = d["groups"]

def camel(fk):  # job_card_id -> jobCardId
    parts = fk.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])

# Parent resource segment (as it appears in the URL) -> (table, tenancy)
# tenancy: 'garage' = has garage_id (direct guard on this table is valid).
# Only parents with garage_id can be guarded directly when a nested route
# addresses them by id.
PARENT_RES = {
    "customers": ("users", "garage"),
    "technicians": ("users", "garage"),
    "vehicles": ("vehicles", "garage"),
    "job-cards": ("job_cards", "garage"),
    "suppliers": ("suppliers", "garage"),
    "invoices": ("invoices", "garage"),
    "appointments": ("appointments", "garage"),
    "deliveries": ("deliveries", "garage"),
    "loyalty-programs": ("loyalty_program", "garage"),
    "marketing-campaigns": ("marketing_campaigns", "garage"),
    "purchase-orders": ("purchase_orders", "garage"),
    "documents": ("documents", "garage"),
    # parents WITHOUT garage_id -> cannot direct-guard; nested routes deferred
    "obd-sessions": ("obd_sessions", "skip"),
    "fulfillment-orders": ("fulfillment_orders", "skip"),
    "subscription-licenses": ("subscription_licenses", "skip"),
    "pay-periods": ("pay_periods", "garage"),
}

# Explicit overrides: path -> (table, idParam, parentTuple|None, tenantColumn|None)
OVERRIDE = {
    "/api/technicians/:id/job-cards": ("users", "id", None, None),
    "/api/technicians/:id/time-clock": ("users", "id", None, None),
    "/api/technicians/:technicianId/time-clock": ("users", "technicianId", None, None),
    "/api/time-slots/:technicianId": ("users", "technicianId", None, None),
    "/api/technician-workload/:technicianId": ("users", "technicianId", None, None),
    "/api/qr-codes/customer/:customerId": ("users", "customerId", None, None),
    "/api/qr-codes/appointment/:appointmentId": ("appointments", "appointmentId", None, None),
    # Duplicate registration: the LIVE first copy (L6733) hits performance_reviews
    # (direct garage_id); the dead L19843 shadow hits hr_performance_reviews.
    # All three verbs on this path address a performance_reviews row.
    "/api/hr/performance-reviews/:id": ("performance_reviews", "id", None, None),
    # Route param IS the pay_period id (not a payroll_run id).
    "/api/payroll/runs/:periodId": ("pay_periods", "periodId", None, None),
}

# Trailing path segments that are ACTIONS on the resource (not child collections),
# so an :id before them still addresses the resource itself.
ACTION_VERBS = {
    "status", "approve", "reject", "process", "send", "track", "move", "generate",
    "acknowledge", "resolve", "end", "complete", "respond", "flag", "unflag",
    "analyze-sentiment", "publish", "restore", "assign", "read", "clicked", "start",
    "handoff", "set-password", "convert-to-job-card", "convert-to-invoice",
    "trigger-renewal", "accept-renewal", "redeem-points", "add-points", "eta",
    "update", "undo", "redo", "run", "refresh", "location", "cancel", "reopen",
}

# Hard excludes (polymorphic, external id, 2-hop dual-garage, unknown session tbl)
EXCLUDE = {
    "/api/inventory-transfers/:id/complete",
    "/api/service-bays/sessions/:sessionId/end",
    "/api/integrations/google-calendar/delete-event/:eventId",
    "/api/digital-signatures/:relatedType/:relatedId",
    "/api/media-attachments/:relatedType/:relatedId",
    "/api/pricing-history/:sparePartId",
}

ACTIONABLE = {"DIRECT", "PARENT", "PROVIDER"}

def params(p):
    return re.findall(r":(\w+)", p)

def parts_of(p):
    return [x for x in p.split("/") if x != ""]

def plan_route(f):
    p, table, cat, a, b = f["p"], f["table"], f["cat"], f.get("a"), f.get("b")
    # Sanitize the parent-FK to a bare snake_case identifier (the mapper
    # sometimes annotates it, e.g. "vehicle_id (route :vehicleId)").
    if b:
        m = re.match(r"[a-z_][a-z0-9_]*", b)
        b = m.group(0) if m else None
    if a:
        m = re.match(r"[a-z_][a-z0-9_]*", a)
        a = m.group(0) if m else None
    # Explicit decisions win regardless of the mapper's category.
    if p in EXCLUDE:
        return ("defer", "excluded (polymorphic/external/2-hop/dual-garage)")
    if ":relatedType" in p:
        return ("defer", "polymorphic relatedType/relatedId")
    if p in OVERRIDE:
        t, ip, par, tc = OVERRIDE[p]
        return ("apply", cfg(t, ip, par, tc))
    if cat not in ACTIONABLE:
        return ("skip", None)

    pr = p.split("/")
    pis = [i for i, x in enumerate(pr) if x.startswith(":")]
    pi = pis[-1]
    last = pr[pi][1:]
    seg_before = pr[pi - 1] if pi > 0 else None
    after = pr[pi + 1:]                              # segments after the last param
    after_na = [s for s in after if s not in ACTION_VERBS]  # non-action trailing segs
    fkc = camel(b) if b else None

    if cat == "PROVIDER":
        return ("apply", cfg(table, last, None, "provider_id"))

    # Does the last param address a PARENT resource rather than the row itself?
    #  (a) it sits directly under a known parent resource that has a child
    #      collection after it  (/api/vehicles/:id/service-reminders), or
    #  (b) its name matches the parent FK  (/api/.../:jobCardId/...).
    parent_by_seg = seg_before in PARENT_RES and bool(after_na)
    parent_by_fk = bool(fkc) and last == fkc
    if parent_by_seg or parent_by_fk:
        if parent_by_seg:
            ptbl, tenancy = PARENT_RES[seg_before]
            if tenancy != "garage":
                return ("defer", f"nested route, parent '{seg_before}' not garage-scoped")
            return ("apply", cfg(ptbl, last, None, None))
        # parent_by_fk: guard the mapper's parent table `a` (garage_id by defn)
        if a:
            return ("apply", cfg(a, last, None, None))

    # Terminal: the param addresses the row itself.
    if cat == "DIRECT":
        return ("apply", cfg(table, last, None, None))
    if cat == "PARENT":
        return ("apply", cfg(table, last, (a, b), None))
    return ("skip", None)

def cfg(table, idParam, parent, tenantColumn):
    d = {"table": table}
    if idParam != "id":
        d["idParam"] = idParam
    if tenantColumn:
        d["tenantColumn"] = tenantColumn
    if parent:
        d["parent"] = {"table": parent[0], "fk": parent[1]}
    return d

apply_list, defer_list = [], []
for k, v in groups.items():
    for f in v:
        act, payload = plan_route(f)
        if act == "apply":
            apply_list.append((f["m"], f["p"], payload))
        elif act == "defer":
            defer_list.append((f["m"], f["p"], payload, f["cat"]))

print(f"APPLY: {len(apply_list)} routes")
for m, p, c in sorted(apply_list, key=lambda x: (x[2]["table"], x[1])):
    print(f"  {m:6} {p:60} -> {json.dumps(c)}")
print(f"\nDEFER: {len(defer_list)} routes")
for m, p, r, cat in defer_list:
    print(f"  {m:6} {p:55} [{cat}] {r}")

json.dump(apply_list, open("/workspace/salis-gms/scripts/h1_apply_plan.json", "w"))
