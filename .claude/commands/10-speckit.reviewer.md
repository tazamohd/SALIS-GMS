---
description: "[Prefer native] Code review. On SALIS-GMS use /code-review."
---

# Workflow: speckit.reviewer

> **Note for SALIS-GMS:** This overlaps with the built-in `/code-review`, which is
> the preferred reviewer for this repo. Use this command only if you want the
> speckit review format.

1. **Context Analysis**:
   - The user may specify files to review, "staged" for git staged changes, or "branch" for branch diff.

2. **Load Skill**:
   - Use the `Read` tool to read the skill file at: `.claude/skills/speckit.reviewer/SKILL.md`

3. **Execute**:
   - Follow the instructions in the `SKILL.md` exactly.
   - Apply the user's prompt as the input arguments/context for the skill's logic.

4. **On Error**:
   - If no files to review: Ask user to stage changes or specify file paths
   - If not a git repo: Review current directory files instead
