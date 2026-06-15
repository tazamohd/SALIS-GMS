# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues on `tazamohd/salis-gms`.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

> **Note for Claude Code on the web / remote sessions:** the `gh` CLI is not
> available in the managed remote execution environment. In that context use the
> GitHub MCP tools instead (`mcp__github__issue_write`, `mcp__github__issue_read`,
> `mcp__github__list_issues`, `mcp__github__add_issue_comment`, etc.), which are
> scoped to `tazamohd/salis-gms`. The conventions above still describe the intent;
> only the transport differs.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments` (or `mcp__github__issue_read` in a remote session).
