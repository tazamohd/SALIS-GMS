/**
 * Image→text OCR adapter for vehicle-document scanning. Key-deferred: active
 * only when GOOGLE_VISION_API_KEY is set (Google Cloud Vision TEXT_DETECTION
 * via the REST API — no SDK dependency). Returns null on any failure so the
 * caller falls back to manual entry; it never fabricates text.
 */
export async function imageToText(imageBase64: string): Promise<string | null> {
  const key = process.env.GOOGLE_VISION_API_KEY;
  if (!key || !imageBase64) return null;

  // Strip a data-URL prefix if the client sent one.
  const content = imageBase64.replace(/^data:image\/[a-z+.-]+;base64,/i, "");

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ image: { content }, features: [{ type: "TEXT_DETECTION" }] }],
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json().catch(() => null);
    const text = body?.responses?.[0]?.fullTextAnnotation?.text;
    return typeof text === "string" && text.trim() ? text : null;
  } catch {
    return null;
  }
}

export function imageOcrConfigured(): boolean {
  return !!process.env.GOOGLE_VISION_API_KEY;
}
