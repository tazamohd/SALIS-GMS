/**
 * `apiRequest` rejects with an Error whose message is "<status>: <body>", where
 * the body is usually the server's JSON envelope. Every form that surfaces an
 * API failure wants the human-readable `message` out of that, so the unwrapping
 * lives here once instead of being re-implemented per page.
 */
export function extractApiMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!(error instanceof Error)) return fallback;

  const jsonPart = error.message.match(/\{[\s\S]*\}/);
  if (jsonPart) {
    try {
      const parsed = JSON.parse(jsonPart[0]);
      if (typeof parsed?.message === "string" && parsed.message) return parsed.message;
      // Zod-style envelopes: { errors: [{ message }] }
      const first = Array.isArray(parsed?.errors) ? parsed.errors[0] : null;
      if (typeof first?.message === "string" && first.message) return first.message;
    } catch {
      // Not JSON after all — fall through to the raw message.
    }
  }

  // Strip a leading "<status>: " so the toast doesn't read "400: Bad request".
  return error.message.replace(/^\d{3}:\s*/, "") || fallback;
}
