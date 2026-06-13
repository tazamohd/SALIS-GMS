/**
 * Lightweight, in-language context compaction.
 *
 * Trims input tokens *before* a request reaches the model. All functions are
 * deterministic and require no extra LLM round-trip — they slide windows,
 * cap arrays, and truncate blobs. This captures the bulk of the savings on the
 * unbounded-growth hotspots (long chat history, stringified DB arrays, raw OCR
 * text) while staying single-runtime. For deeper compression (AST-aware code,
 * structured JSON crushing) route the shared client at a Headroom proxy via
 * AI_INTEGRATIONS_OPENAI_BASE_URL — see ./client.ts.
 */

export interface ChatMsg {
  role: string;
  content: string;
}

// Rough token estimate. OpenAI English text averages ~4 chars/token; this is a
// budgeting heuristic, not an exact tokenizer.
const CHARS_PER_TOKEN = 4;
export const estimateTokens = (text: string): number =>
  Math.ceil((text?.length ?? 0) / CHARS_PER_TOKEN);

/**
 * Sliding-window history compaction. Keeps the most recent messages within a
 * message-count and token budget; older messages are dropped and replaced by a
 * single marker so the model knows context was elided.
 */
export function compactHistory(
  history: ChatMsg[],
  opts: { maxMessages?: number; maxTokens?: number } = {}
): ChatMsg[] {
  const maxMessages = opts.maxMessages ?? 12;
  const maxTokens = opts.maxTokens ?? 3000;
  if (!Array.isArray(history) || history.length === 0) return [];

  // Walk newest-to-oldest, accumulating until a budget is hit.
  const kept: ChatMsg[] = [];
  let tokens = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const t = estimateTokens(msg?.content ?? "");
    if (kept.length >= maxMessages || tokens + t > maxTokens) break;
    kept.unshift(msg);
    tokens += t;
  }

  const omitted = history.length - kept.length;
  if (omitted > 0) {
    kept.unshift({
      role: "system",
      content: `[${omitted} earlier message(s) omitted to conserve context.]`,
    });
  }
  return kept;
}

/**
 * Cap an array of records to the most recent N (assuming chronological order,
 * oldest first). Returns the kept slice plus how many were omitted, so callers
 * can add a compact note instead of stringifying the whole array.
 */
export function compactRecords<T>(
  records: T[],
  maxRecords = 10
): { kept: T[]; omittedCount: number } {
  if (!Array.isArray(records)) return { kept: [], omittedCount: 0 };
  if (records.length <= maxRecords) return { kept: records, omittedCount: 0 };
  const kept = records.slice(records.length - maxRecords);
  return { kept, omittedCount: records.length - maxRecords };
}

/**
 * Head+tail truncation for large free-text blobs (e.g. OCR output). Preserves
 * the informative ends and elides the middle with a marker.
 */
export function truncateText(text: string, maxChars = 6000): string {
  if (!text || text.length <= maxChars) return text ?? "";
  const head = Math.floor(maxChars * 0.7);
  const tail = maxChars - head;
  return (
    text.slice(0, head) +
    `\n…[${text.length - maxChars} chars omitted]…\n` +
    text.slice(text.length - tail)
  );
}
