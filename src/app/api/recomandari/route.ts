import { fallbackRecommendations, anonymize, buildMessages, parseModelOutput, rulesFor, validateRequest, type RecommendResponse } from "@/lib/recommend";

/**
 * POST /api/recomandari — ranks product categories for the user's (anonymised) situation.
 * Uses an OpenAI-compatible model (e.g. Featherless) when AI_BASE_URL / AI_API_KEY / AI_MODEL are set
 * on the server; otherwise, or on any error/invalid answer, returns the rule-based ranking.
 * The API key never reaches the browser.
 */
const TIMEOUT_MS = 20_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const req = validateRequest(body);
  if (!req) return Response.json({ error: "Date de profil invalide." }, { status: 400 });

  const fits = rulesFor(req);
  const eligible = fits.filter((f) => f.eligible).map((f) => f.id);
  const fallback: RecommendResponse = { items: fallbackRecommendations(fits), source: "reguli" };

  const { AI_BASE_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_BASE_URL || !AI_API_KEY || !AI_MODEL || eligible.length === 0) return Response.json(fallback);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${AI_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
        "HTTP-Referer": "https://protejeaza.demo",
        "X-Title": "Protejeaza ce ai construit",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: buildMessages(anonymize(req), fits),
        temperature: 0.2,
        max_tokens: 900,
      }),
    });
    if (!res.ok) {
      console.warn(`[recomandari] model HTTP ${res.status}; using rules`);
      return Response.json(fallback);
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const items = parseModelOutput(data.choices?.[0]?.message?.content ?? "", eligible);
    if (!items) {
      console.warn("[recomandari] model answer rejected by validation; using rules");
      return Response.json(fallback);
    }
    return Response.json({ items, source: "ai", model: AI_MODEL } satisfies RecommendResponse);
  } catch (e) {
    console.warn(`[recomandari] model call failed (${(e as Error).name}); using rules`);
    return Response.json(fallback);
  } finally {
    clearTimeout(timer);
  }
}
