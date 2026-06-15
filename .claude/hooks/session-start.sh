#!/usr/bin/env bash
# SessionStart hook for SALIS-GMS (metaswarm-inspired).
# Verifies the project can typecheck and test in this environment, and surfaces a
# short orientation so the agent primes correctly. Non-fatal: prints guidance and
# always exits 0 so it never blocks a session.
set -uo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 0

note()  { printf '  %s\n' "$1"; }
ok()    { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn()  { printf '  \033[33m!\033[0m %s\n' "$1"; }

echo "── SALIS-GMS session start ─────────────────────────────"

# 1) Dependencies
if [ ! -d node_modules ]; then
  warn "node_modules missing — run: npm ci"
else
  ok "dependencies installed"
fi

# 2) Database hint (tests need Postgres)
if [ -n "${DATABASE_URL:-}${TEST_DATABASE_URL:-}" ]; then
  ok "database URL is set"
else
  warn "no DATABASE_URL/TEST_DATABASE_URL — server tests need Postgres (see CLAUDE.md)"
fi

# 3) Quick typecheck (best-effort, time-boxed)
if [ -d node_modules ]; then
  if timeout 120 npx tsc --noEmit >/tmp/salis_tsc.log 2>&1; then
    ok "typecheck clean (npm run check)"
  else
    warn "typecheck has errors — see /tmp/salis_tsc.log (tail below)"
    tail -n 5 /tmp/salis_tsc.log | sed 's/^/      /'
  fi
fi

echo "──────────────────────────────────────────────────────"
note "Orchestration layer: .claude/README.md   |   Start work: /start-task"
note "DoD: npm run check && npm test && npm run lint && npm run coverage:gate"
echo "──────────────────────────────────────────────────────"
exit 0
