# Project Interview

## Round 0: Project Type
Question: Confirm project type — source code detected; document SALIS-GMS from codebase analysis?
Answer: Existing project (analyze the codebase automatically).

## Round 1: Ownership and Purpose
Question: Who maintains this project and what is the primary goal going forward?
Answer: All three apply — SALIS-GMS is an active product under continued development, it must remain maintainable for onboarding, and it is undergoing incremental refactoring/migration (see REFACTORING_CHECKLIST.md and ROUTES_REFACTORING_SUMMARY.md). Documentation should reflect the current state plus the refactoring trajectory.

## Round 2: Constraints and Non-Goals
Question: What are the known constraints, technical debts, or things this project intentionally does NOT do?
Answer: No known critical constraints — document the codebase as-is without constraint annotations.

## Round 3: Documentation Priority
Question: What is the most important aspect to capture accurately in the documentation?
Answer: Architecture and module boundaries — prioritize how the system is structured and how the client, server, and shared modules interact.
