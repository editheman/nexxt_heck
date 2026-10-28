import { describe, expect, it } from "vitest";
import {
  CONSENT_TEXT_VERSION,
  PROMPT_RULES,
  declinePrompt,
  defaultPrompt,
  dismissPrompt,
  parseConsentLog,
  parsePrompt,
  parseReading,
  parseSubscriber,
  recordArticleOpen,
  recordImpression,
  shouldShowPrompt,
  subscribe,
  unsubscribe,
  validateEmail,
  type PromptState,
  type ReadingState,
} from "./newsletter";

const CATALOG = ["inflatia", "randament-real", "lichiditate"] as const;
const NOW = new Date("2026-10-28T10:00:00.000Z");
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000);
const read = (...slugs: string[]): ReadingState =>
  slugs.reduce<ReadingState>((r, s) => recordArticleOpen(r, s, CATALOG), { opened: [] });

const show = (reading: ReadingState, prompt: PromptState = defaultPrompt(), at = NOW, subscribed = false) =>
  shouldShowPrompt({ reading, prompt, subscribed }, at);

describe("article-count trigger", () => {
  it("does not show after a single article", () => {
    expect(show(read("inflatia"))).toBe(false);
  });

  it("shows after two distinct articles", () => {
    expect(PROMPT_RULES.minArticles).toBe(2);
    expect(show(read("inflatia", "lichiditate"))).toBe(true);
  });

  it("counts reopening the same article only once", () => {
    const r = read("inflatia", "inflatia", "inflatia");
    expect(r.opened).toEqual(["inflatia"]);
    expect(show(r)).toBe(false);
  });

  it("ignores slugs that are not articles", () => {
    expect(read("inflatia", "../admin", "nu-exista").opened).toEqual(["inflatia"]);
  });

  it("never shows to a subscriber", () => {
    expect(show(read("inflatia", "lichiditate"), defaultPrompt(), NOW, true)).toBe(false);
  });
});

describe("dismissal and decline", () => {
  const reading = read("inflatia", "lichiditate", "randament-real");

  it("snoozes for 14 days after the first dismissal", () => {
    const p = dismissPrompt(defaultPrompt(), NOW);
    expect(show(reading, p, days(1))).toBe(false);
    expect(show(reading, p, days(13.9))).toBe(false);
    expect(show(reading, p, days(14))).toBe(true);
  });

  it("snoozes longer after the second dismissal and declines after the third", () => {
    let p = dismissPrompt(defaultPrompt(), NOW);
    p = dismissPrompt(p, days(14));
    expect(show(reading, p, days(14 + 29))).toBe(false);
    expect(show(reading, p, days(14 + 30))).toBe(true);
    p = dismissPrompt(p, days(44));
    expect(p.declined).toBe(true);
    expect(show(reading, p, days(1000))).toBe(false);
  });

  it("never shows again after an explicit decline", () => {
    const p = declinePrompt(defaultPrompt());
    expect(show(reading, p, days(365))).toBe(false);
  });
});

describe("repeated visits", () => {
  const reading = read("inflatia", "lichiditate");

  it("stops after the maximum number of impressions, even without interaction", () => {
    let p = defaultPrompt();
    for (let i = 0; i < PROMPT_RULES.maxImpressions; i++) {
      expect(show(reading, p)).toBe(true);
      p = recordImpression(p);
    }
    expect(show(reading, p)).toBe(false);
  });

  it("persists the prompt state across visits via storage round-trip", () => {
    const p = dismissPrompt(recordImpression(defaultPrompt()), NOW);
    const restored = parsePrompt(JSON.stringify(p));
    expect(restored).toEqual(p);
    expect(show(parseReading(JSON.stringify(reading)), restored, days(2))).toBe(false);
  });
});

describe("validateEmail", () => {
  it.each(["ana@exemplu.ro", "  Ana.Pop+digest@mail.example.com  "])("accepts %j", (input) => {
    const r = validateEmail(input);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.email).toBe(input.trim());
  });

  it.each(["", "   ", "ana", "ana@", "@exemplu.ro", "ana@exemplu", "ana exemplu@x.ro", "ana@@x.ro", `${"a".repeat(250)}@x.ro`])(
    "rejects %j",
    (input) => {
      const r = validateEmail(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBeTypeOf("string");
    },
  );
});

describe("explicit consent", () => {
  it("refuses to subscribe without marketing consent, even with a valid email", () => {
    const r = subscribe({ email: "ana@exemplu.ro", marketingConsent: false, source: "article-prompt" }, NOW, "id-1");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.consent).toBeTypeOf("string");
      expect(r.errors.email).toBeUndefined();
    }
  });

  it("reports both problems at once", () => {
    const r = subscribe({ email: "nu", marketingConsent: false, source: "article-prompt" }, NOW, "id-1");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.email).toBeTypeOf("string");
      expect(r.errors.consent).toBeTypeOf("string");
    }
  });

  it("stores consent separately from the email, with timestamp and text version", () => {
    const r = subscribe({ email: " ana@exemplu.ro ", marketingConsent: true, source: "article-prompt" }, NOW, "id-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.subscriber).toEqual({ id: "id-1", email: "ana@exemplu.ro", createdAt: NOW.toISOString(), delivery: "demo" });
    expect(r.consent).toEqual({
      subscriberId: "id-1",
      purpose: "newsletter",
      granted: true,
      at: NOW.toISOString(),
      textVersion: CONSENT_TEXT_VERSION,
      source: "article-prompt",
    });
    expect(JSON.stringify(r.consent)).not.toContain("ana@");
    expect(JSON.stringify(r.subscriber)).not.toContain(CONSENT_TEXT_VERSION);
  });

  it("records a withdrawal on unsubscribe without the email", () => {
    const withdrawal = unsubscribe({ id: "id-1", email: "ana@exemplu.ro", createdAt: NOW.toISOString(), delivery: "demo" }, days(3), "unsubscribe-page");
    expect(withdrawal).toEqual({
      subscriberId: "id-1",
      purpose: "newsletter",
      granted: false,
      at: days(3).toISOString(),
      textVersion: CONSENT_TEXT_VERSION,
      source: "unsubscribe-page",
    });
    expect(JSON.stringify(withdrawal)).not.toContain("ana@");
  });
});

describe("storage parsing", () => {
  it("falls back to defaults on corrupt data", () => {
    expect(parseReading("{x")).toEqual({ opened: [] });
    expect(parsePrompt("[]")).toEqual(defaultPrompt());
    expect(parseSubscriber('{"email":1}')).toBeNull();
    expect(parseConsentLog("nope")).toEqual([]);
  });

  it("accepts consent given during onboarding", () => {
    const c = { subscriberId: "a", purpose: "newsletter", granted: true, at: NOW.toISOString(), textVersion: "v", source: "onboarding" };
    expect(parseConsentLog(JSON.stringify([c]))).toEqual([c]);
  });

  it("drops malformed consent entries and subscribers without a valid email", () => {
    const good = { subscriberId: "a", purpose: "newsletter", granted: true, at: NOW.toISOString(), textVersion: "v", source: "article-prompt" };
    expect(parseConsentLog(JSON.stringify([good, { granted: "da" }]))).toEqual([good]);
    expect(parseSubscriber(JSON.stringify({ id: "a", email: "nu-e-email", createdAt: NOW.toISOString(), delivery: "demo" }))).toBeNull();
  });
});
