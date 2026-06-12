---
description: "[Prefer native] Run tests/coverage. On SALIS-GMS use npm test (Vitest) + /verify."
---

// turbo-all

# Workflow: speckit.tester

> **Note for SALIS-GMS:** This overlaps with native tooling. Prefer
> `npm test` / `npm run test:coverage` (Vitest), the Playwright `e2e/` suite, and
> `/verify`. Use this command only if you want the speckit reporting format.

1. **Context Analysis**:
   - The user may specify test paths, options, or just run all tests.

2. **Load Skill**:
   - Use the `Read` tool to read the skill file at: `.claude/skills/speckit.tester/SKILL.md`

3. **Execute**:
   - Follow the instructions in the `SKILL.md` exactly.
   - Apply the user's prompt as the input arguments/context for the skill's logic.

4. **On Error**:
   - If no test framework detected: Report "No test framework found. Install Jest, Vitest, Pytest, or similar."
   - If tests fail: Show failure details and suggest fixes
