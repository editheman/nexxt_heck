import {
  anonymize,
  buildMessages,
  fallbackRecommendations,
  parseModelOutput,
  rulesFor,
  validateRequest,
  type ChatMessage,
  type RecommendResponse,
} from "@/lib/recommend";

/**
 * POST /api/recomandari — ranks product categories for the user's (anonymised) situation.
 * Uses an OpenAI-compatible model (e.g. Featherless) when AI_BASE_URL / AI_API_KEY / AI_MODEL are set
 * on the server; otherwise, or on any error/invalid answer, returns the rule-based ranking together
 * with `fallbackReason`, so the UI can say why. The API key never reaches the browser or the logs.
 */
/** Per attempt: Featherless may need time to load a less-used model on the first call. */
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) > 0 ? Number(process.env.AI_TIMEOUT_MS) : 45_000;
/** Four short recommendations fit comfortably; small models otherwise keep generating. */
const MAX_TOKENS = 500;
/** Chat templates known to reject the system role. */
const NO_SYSTEM_ROLE = /gemma/i;

/** Some chat templates (e.g. Gemma) reject the "system" role; fold it into the user message. */
function withoutSystem(messages: ChatMessage[]): ChatMessage[] {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content);
  const user = messages.filter((m) => m.role !== "system").map((m) => m.content);
  return [{ role: "user", content: [...system, ...user].join("\n\n") }];
}

async function errorText(res: Response) {
  try {
    const t = await res.text();
    try {
      const j = JSON.parse(t) as { error?: { message?: string } | string; message?: string };
      const msg = typeof j.error === "string" ? j.error : (j.error?.message ?? j.message);
      if (msg) return msg.slice(0, 200);
    } catch {
      /* not JSON */
    }
    return t.slice(0, 200);
  } catch {
    return "";
  }
}

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
  const rules = (fallbackReason: string): RecommendResponse => ({ items: fallbackRecommendations(fits), source: "reguli", fallbackReason });

  const { AI_BASE_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_BASE_URL || !AI_API_KEY || !AI_MODEL) return Response.json(rules("Modelul AI nu este configurat pe server (AI_BASE_URL, AI_API_KEY, AI_MODEL)."));
  if (eligible.length === 0) return Response.json(rules("Nicio categorie nu trece regulile pentru situația ta."));

  const built = buildMessages(anonymize(req), fits);
  const messages = NO_SYSTEM_ROLE.test(AI_MODEL) ? withoutSystem(built) : built;
  const send = (msgs: ChatMessage[]) =>
    fetch(`${AI_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
        "HTTP-Referer": "https://protejeaza.demo",
        "X-Title": "Protejeaza ce ai construit",
      },
      body: JSON.stringify({ model: AI_MODEL, messages: msgs, temperature: 0.2, max_tokens: MAX_TOKENS }),
    });

  try {
    let res = await send(messages);
    if (res.status === 400 && messages.some((m) => m.role === "system")) {
      const first = await errorText(res);
      console.warn(`[recomandari] model ${AI_MODEL}: HTTP 400 (${first}); retrying without a system message`);
      res = await send(withoutSystem(messages));
    }
    if (!res.ok) {
      const reason = `Modelul ${AI_MODEL} a răspuns cu HTTP ${res.status}${(await errorText(res)).replace(/^(.+)$/, ": $1")}.`;
      console.warn(`[recomandari] ${reason} Using rules.`);
      return Response.json(rules(reason));
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const items = parseModelOutput(content, eligible);
    if (!items) {
      console.warn(`[recomandari] model ${AI_MODEL}: answer rejected by validation; using rules. Answer: ${content.slice(0, 300)}`);
      return Response.json(rules(`Răspunsul modelului ${AI_MODEL} nu a trecut validarea (format sau cifre nepermise).`));
    }
    return Response.json({ items, source: "ai", model: AI_MODEL } satisfies RecommendResponse);
  } catch (e) {
    const reason =
      (e as Error).name === "TimeoutError" || (e as Error).name === "AbortError"
        ? `Modelul ${AI_MODEL} nu a răspuns în ${TIMEOUT_MS / 1000} secunde.`
        : `Nu am putut contacta modelul ${AI_MODEL} (${(e as Error).message}).`;
    console.warn(`[recomandari] ${reason} Using rules.`);
    return Response.json(rules(reason));
  }
}
