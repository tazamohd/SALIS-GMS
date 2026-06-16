# AI System Prompts

SALIS AUTO's AI features share a single, centrally-managed prompt library:
[`server/ai/prompts.ts`](../../server/ai/prompts.ts).

## Why

Previously every AI service inlined its own system-prompt string. Two of them
(the customer-support persona in `services/aiChatbot.ts` and `ai.ts`) had
drifted into near-duplicates, and the prompts varied widely in quality and
structure. Centralizing them gives us:

- **One source of truth** — fix tone, branding, or guardrails in one place.
- **Consistent structure** — every assistant follows the same anatomy.
- **Shared guardrails** — safety, scope, and anti-leak rules applied uniformly.
- **No duplication** — the customer assistant persona is now a single builder.

## Structure

The library applies a prompt structure adapted from the patterns used by
leading production AI products, catalogued in
[x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools).
The wording is original to SALIS AUTO — only the structural conventions are
borrowed.

Each prompt is assembled by `composePrompt()` from these sections:

| Section | Purpose |
|---|---|
| **Identity** | One sentence: who the assistant is. |
| **Brand/Domain** | Shared `SALIS_BRAND` context (Saudi market, SAR, ZATCA/VAT). |
| **Mission** | What the assistant is ultimately trying to achieve. |
| **Capabilities** | Concrete things it can do. |
| **Guidelines** | How it should behave. |
| **Guardrails** | Hard constraints. `SHARED_GUARDRAILS` apply to all; prompts may append. |
| **Output** | Exact response/JSON contract the caller parses. |

`SHARED_GUARDRAILS` cover domain scoping, never leaking the system prompt,
prioritizing vehicle/customer safety, not fabricating part numbers or prices,
and staying concise.

## Where each prompt is used

| Export | Call site |
|---|---|
| `SERVICE_CHATBOT_PROMPT` | `server/ai-service.ts` — `streamChatResponse` |
| `PREDICTIVE_MAINTENANCE_PROMPT` | `server/ai-service.ts` — `analyzePredictiveMaintenance` |
| `PARTS_RECOMMENDATION_BRIEF_PROMPT` | `server/ai-service.ts` — `generatePartsRecommendations` |
| `OCR_ANALYSIS_PROMPT` | `server/ai-service.ts` — `analyzeOCRDocument` |
| `SERVICE_SUGGESTIONS_PROMPT` | `server/ai-service.ts` — `generateServiceSuggestions` |
| `customerAssistantPrompt()` | `server/services/aiChatbot.ts` and `server/ai.ts` (shared persona) |
| `BOOKING_INTENT_PROMPT` | `server/services/aiChatbot.ts` — `extractBookingIntent` |
| `JOB_ESTIMATOR_PROMPT` | `server/ai.ts` — `estimateJobTime` |
| `MAINTENANCE_PREDICTION_PROMPT` | `server/ai.ts` — `predictMaintenance` |
| `PARTS_SPECIALIST_PROMPT` | `server/ai.ts` — `recommendParts` |
| `SCHEDULE_OPTIMIZER_PROMPT` | `server/ai.ts` — `optimizeSchedule` |
| `PREDICTIVE_DIAGNOSTIC_PROMPT` | `server/services/predictiveDiagnostics.ts` |
| `technicianAssignmentPrompt()` | `server/services/assignmentAI.ts` |
| `BUSINESS_INTELLIGENCE_PROMPT` | `server/ai/business-intelligence.ts` |
| `REPAIR_GUIDE_PROMPT` | `server/routes/ai-repair-guide.ts` |

## Adding or changing a prompt

1. Add or edit the export in `server/ai/prompts.ts` using `composePrompt()`.
2. Keep the `OUTPUT` section identical to what the caller parses — downstream
   code expects specific JSON shapes.
3. Import and use it at the call site; never re-inline a prompt string.
