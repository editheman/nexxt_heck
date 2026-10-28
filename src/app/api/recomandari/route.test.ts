import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const body = { horizonYears: 20, goal: "pensie", emergencyFund: "da", riskTolerance: "ridicata", experience: "putina", savings: 40000, monthly: 800, placement: "cont-curent", ageRange: "26-30" };
const call = () => POST(new Request("http://x/api/recomandari", { method: "POST", body: JSON.stringify(body) }));
const modelSays = (content: string) =>
  vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 }));

beforeEach(() => {
  vi.stubEnv("AI_BASE_URL", "https://api.example.test/v1/");
  vi.stubEnv("AI_API_KEY", "test-key");
  vi.stubEnv("AI_MODEL", "test-model");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/recomandari with a model configured", () => {
  it("returns the model's validated ranking and sends only anonymised data with the key in the header", async () => {
    const fetchMock = modelSays(JSON.stringify({ recomandari: [{ id: "etf-global", motiv: "Orizont lung.", atentie: "Volatil." }, { id: "pilon3", motiv: "Pensie.", atentie: "Blocat." }] }));
    vi.stubGlobal("fetch", fetchMock);
    const data = await (await call()).json();
    expect(data).toMatchObject({ source: "ai", model: "test-model" });
    expect(data.items.map((i: { id: string }) => i.id)).toEqual(["etf-global", "pilon3"]);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.test/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const sent = String(init.body);
    expect(sent).not.toContain("40000");
    expect(sent).toContain("10.000–50.000 lei");
  });

  it("falls back to rules when the model states figures", async () => {
    vi.stubGlobal("fetch", modelSays(JSON.stringify({ recomandari: [{ id: "etf-global", motiv: "Aduce 9% pe an.", atentie: "-" }] })));
    expect((await (await call()).json()).source).toBe("reguli");
  });

  it("falls back to rules on network errors and HTTP errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network"); }));
    expect((await (await call()).json()).source).toBe("reguli");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    expect((await (await call()).json()).source).toBe("reguli");
  });

  it("drops categories the guardrails exclude", async () => {
    const short = { ...body, horizonYears: 2, riskTolerance: "scazuta" };
    vi.stubGlobal("fetch", modelSays(JSON.stringify({ recomandari: [{ id: "etf-bet", motiv: "x", atentie: "y" }, { id: "tezaur", motiv: "Ok.", atentie: "z" }] })));
    const res = await POST(new Request("http://x", { method: "POST", body: JSON.stringify(short) }));
    const data = await res.json();
    expect(data.items.map((i: { id: string }) => i.id)).toEqual(["tezaur"]);
  });

  it("retries once without a system message when the model rejects it (e.g. Gemma) and reports why it fell back otherwise", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: "System role not supported" } }), { status: 400 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ recomandari: [{ id: "etf-global", motiv: "Ok.", atentie: "-" }] }) } }] }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const data = await (await call()).json();
    expect(data.source).toBe("ai");
    const retryBody = JSON.parse(String((fetchMock.mock.calls[1] as unknown as [string, RequestInit])[1].body));
    expect(retryBody.messages.map((m: { role: string }) => m.role)).toEqual(["user"]);
    expect(retryBody.messages[0].content).toMatch(/Reguli stricte/);

    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { message: "model not found" } }), { status: 400 })));
    const failed = await (await call()).json();
    expect(failed.source).toBe("reguli");
    expect(failed.fallbackReason).toMatch(/400/);
    expect(failed.fallbackReason).toMatch(/model not found/);
    expect(JSON.stringify(failed)).not.toContain("test-key");
  });

  it("sends Gemma models a single user message from the start", async () => {
    vi.stubEnv("AI_MODEL", "OpenLLM-Ro/RoGemma2-9b-Instruct");
    const fetchMock = modelSays(JSON.stringify({ recomandari: [{ id: "pilon3", motiv: "Pensie.", atentie: "-" }] }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await (await call()).json()).source).toBe("ai");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.messages.map((m: { role: string }) => m.role)).toEqual(["user"]);
  });

  it("says when no model is configured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("AI_API_KEY", "");
    expect((await (await call()).json()).fallbackReason).toMatch(/nu este configurat/);
  });
});
