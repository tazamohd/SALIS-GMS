---
description: "[Prefer native] Static analysis. On SALIS-GMS use /security-review + npm run lint/check."
---

// turbo-all

# Workflow: speckit.checker

> **Note for SALIS-GMS:** This overlaps with native tooling. Prefer
> `/security-review` plus `npm run lint` (ESLint) and `npm run check` (`tsc`).
> Use this command only if you specifically want the speckit aggregator format.

1. **Context Analysis**:
   - The user may specify paths to check or run on entire project.

2. **Load Skill**:
   - Use the `Read` tool to read the skill file at: `.claude/skills/speckit.checker/SKILL.md`

3. **Execute**:
   - Follow the instructions in the `SKILL.md` exactly.
   - Apply the user's prompt as the input arguments/context for the skill's logic.

4. **On Error**:
   - If no linting tools available: Report which tools to install based on project type
   - If tools fail: Show raw error and suggest config fixes
