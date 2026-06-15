/**
 * Strip CR/LF (and tabs) from a value before it is written to a log so that
 * user-controlled data cannot forge log entries (CWE-117, log injection).
 * Accepts Errors (uses .message) or any value (coerced to string).
 */
export function sanitizeForLog(value: unknown): string {
  const str = value instanceof Error ? value.message : String(value);
  return str.replace(/[\r\n\t]+/g, " ");
}
