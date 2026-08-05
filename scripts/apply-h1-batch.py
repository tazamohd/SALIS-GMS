#!/usr/bin/env python3
"""Insert requireResourceOwnership guards after `isAuthenticated,` on exact
route registration lines. Idempotent: skips a line that is already guarded."""
import re

ROUTES = "server/routes.ts"

# (method, path, table, idParam)
BATCH = [
    ("patch",  "/api/service-bays/:id/status",            "service_bays",          "id"),
    ("post",   "/api/service-bays/:bayId/sessions",       "service_bays",          "bayId"),
    ("get",    "/api/discounts/:id",                      "discounts_promotions",  "id"),
    ("patch",  "/api/discounts/:id",                      "discounts_promotions",  "id"),
    ("delete", "/api/discounts/:id",                      "discounts_promotions",  "id"),
    ("get",    "/api/loaner-vehicles/:id",                "loaner_vehicles",       "id"),
    ("patch",  "/api/loaner-vehicles/:id",                "loaner_vehicles",       "id"),
    ("delete", "/api/loaner-vehicles/:id",                "loaner_vehicles",       "id"),
    ("get",    "/api/calendar-appointments/:id",          "calendar_appointments", "id"),
    ("patch",  "/api/calendar-appointments/:id",          "calendar_appointments", "id"),
    ("delete", "/api/calendar-appointments/:id",          "calendar_appointments", "id"),
    ("post",   "/api/calendar-appointments/:id/move",     "calendar_appointments", "id"),
    ("patch",  "/api/recurring-appointments/:id",         "recurring_appointments","id"),
    ("delete", "/api/recurring-appointments/:id",         "recurring_appointments","id"),
    ("post",   "/api/recurring-appointments/:id/generate","recurring_appointments","id"),
    ("patch",  "/api/deliveries/:id",                     "deliveries",            "id"),
    ("delete", "/api/deliveries/:id",                     "deliveries",            "id"),
    ("post",   "/api/deliveries/:id/timeline",            "deliveries",            "id"),
    ("patch",  "/api/deliveries/:id/live",                "deliveries",            "id"),
    ("get",    "/api/replenishment-orders/:id",           "replenishment_orders",  "id"),
    ("patch",  "/api/replenishment-orders/:id",           "replenishment_orders",  "id"),
    ("post",   "/api/replenishment-orders/:id/approve",   "replenishment_orders",  "id"),
    ("delete", "/api/media-attachments/:id",              "media_attachments",     "id"),
    ("patch",  "/api/media-attachments/:id",              "media_attachments",     "id"),
    ("get",    "/api/document-categories/:id",            "document_categories",   "id"),
    ("patch",  "/api/document-categories/:id",            "document_categories",   "id"),
    ("delete", "/api/document-categories/:id",            "document_categories",   "id"),
    ("post",   "/api/video-estimates/:id/send",           "video_estimates",       "id"),
    ("patch",  "/api/video-estimates/:id/approve",        "video_estimates",       "id"),
]

with open(ROUTES) as f:
    lines = f.readlines()

def guard_str(table, idParam):
    cfg = f"table: '{table}'"
    if idParam != "id":
        cfg += f", idParam: '{idParam}'"
    return f"requireResourceOwnership({{ {cfg} }}), "

applied, missing, already = [], [], []
for method, path, table, idParam in BATCH:
    esc = re.escape(path)
    pat = re.compile(r"(app\." + method + r"\(['\"`]" + esc + r"['\"`],\s*)(isAuthenticated,\s*)")
    hit = False
    for i, line in enumerate(lines):
        m = pat.search(line)
        if not m:
            continue
        hit = True
        if "requireResourceOwnership(" in line:
            already.append(f"{method} {path}")
            break
        g = guard_str(table, idParam)
        lines[i] = pat.sub(lambda mm: mm.group(1) + mm.group(2) + g, line, count=1)
        applied.append(f"{method} {path} -> {table}" + ("" if idParam == "id" else f" (idParam {idParam})"))
        break
    if not hit:
        missing.append(f"{method} {path}")

with open(ROUTES, "w") as f:
    f.writelines(lines)

print(f"APPLIED {len(applied)}:")
for a in applied: print("  +", a)
if already:
    print(f"ALREADY GUARDED {len(already)}:")
    for a in already: print("  =", a)
if missing:
    print(f"NOT FOUND {len(missing)}:")
    for a in missing: print("  ?", a)
