# Knowledge Base Schema

`knowledge.jsonl` is one JSON object per line (JSONL). Each record is a durable lesson
that generalizes beyond a single change. Keep entries short; they are primed
selectively by filtering on `tags`/`paths`/keywords.

## Record shape

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | string | yes | One of `pattern`, `anti-pattern`, `decision`, `gotcha`. |
| `title` | string | yes | One crisp line. Drives priming — make it searchable. |
| `detail` | string | yes | The why and the how. Enough to act on without re-deriving. |
| `tags` | string[] | yes | Lowercase keywords, e.g. `["rbac","tenant-isolation"]`. |
| `paths` | string[] | no | Repo-relative files/dirs the lesson concerns. |
| `date` | string | yes | `YYYY-MM-DD` first recorded. |
| `source` | string | no | PR number, issue, or session note. |

## Types

- **pattern** — a good approach to repeat (e.g. "register routes via modular
  `server/routes/<name>.ts` and export a `register` fn").
- **anti-pattern** — a mistake to avoid (e.g. "querying tenant data without
  `garageId`").
- **decision** — a choice with rationale (e.g. "lowered branch threshold to 60%
  because …"). Required whenever a threshold or convention changes.
- **gotcha** — a non-obvious trap (e.g. "server tests need Postgres").

## Rules

- Don't duplicate — update the existing record instead.
- Only record lessons that generalize. One-off fixes don't belong here.
- A correction the user made more than once is a signal to also update a skill/rubric.

## Example

```json
{"type":"anti-pattern","title":"Tenant-scoped query missing garageId filter","detail":"Any read/write over tenant data must filter by garageId; dev mode is lax but production must enforce it. Trusting a client-supplied garageId is also a break — derive it from the session.","tags":["rbac","tenant-isolation","security"],"paths":["server/routes/"],"date":"2026-06-13"}
```
