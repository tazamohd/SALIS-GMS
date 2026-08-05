#!/usr/bin/env python3
"""Apply the H-1 guard plan (scripts/h1_apply_plan.json) to server/routes.ts.

For each (method, path, config) it inserts requireResourceOwnership(config)
after the first `isAuthenticated,` on that route's registration line
(first-match == the route Express dispatches). Idempotent: skips a line that
already carries a guard. Prints applied / already / not-found."""
import json, re

ROUTES = "server/routes.ts"
PLAN = "scripts/h1_apply_plan.json"

plan = json.load(open(PLAN))
with open(ROUTES) as f:
    lines = f.readlines()

def guard_str(cfg):
    parts = [f"table: '{cfg['table']}'"]
    if "idParam" in cfg:
        parts.append(f"idParam: '{cfg['idParam']}'")
    if "tenantColumn" in cfg:
        parts.append(f"tenantColumn: '{cfg['tenantColumn']}'")
    if "parent" in cfg:
        pp = cfg["parent"]
        parts.append(f"parent: {{ table: '{pp['table']}', fk: '{pp['fk']}' }}")
    return "requireResourceOwnership({ " + ", ".join(parts) + " }), "

applied, already, missing = [], [], []
for method, path, cfg in plan:
    esc = re.escape(path)
    pat = re.compile(r"(app\." + method.lower() + r"\(['\"`]" + esc + r"['\"`],\s*)(isAuthenticated,\s*)")
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
print(f"ALREADY {len(already)}")
print(f"NOT FOUND {len(missing)}:")
for x in missing:
    print("   ?", x)
