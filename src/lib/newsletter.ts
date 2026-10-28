/**
 * Progressive email capture: pure logic, no React, no I/O.
 * See docs/superpowers/specs/2026-10-28-newsletter-design.md.
 */
import { CONSENT_TEXT_VERSION } from "@/content/consent";

export { CONSENT_TEXT_VERSION };

export const PROMPT_RULES = {
  /** Distinct articles opened before the prompt may appear. */
  minArticles: 2,
  /** Total number of article views in which the prompt may be rendered. */
  maxImpressions: 3,
  /** Snooze length after the 1st, 2nd… dismissal; one more dismissal counts as a decline. */
  snoozeDays: [14, 30],
} as const;

export type ReadingState = { opened: string[] };

export type PromptState = {
  impressions: number;
  dismissals: number;
  /** ISO timestamp; prompt hidden until then. */
  snoozedUntil: string | null;
  declined: boolean;
};

export type Subscriber = { id: string; email: string; createdAt: string; delivery: "demo" };

export type ConsentSource = "onboarding" | "article-prompt" | "progress-page" | "unsubscribe-page";

export type ConsentRecord = {
  subscriberId: string;
  purpose: "newsletter";
  granted: boolean;
  at: string;
  textVersion: string;
  source: ConsentSource;
};

export const defaultPrompt = (): PromptState => ({ impressions: 0, dismissals: 0, snoozedUntil: null, declined: false });

/** Adds a slug to the distinct set; unknown slugs are ignored, nothing else is recorded. */
export function recordArticleOpen(reading: ReadingState, slug: string, catalog: readonly string[]): ReadingState {
  if (!catalog.includes(slug) || reading.opened.includes(slug)) return reading;
  return { opened: [...reading.opened, slug] };
}

export function shouldShowPrompt(
  s: { reading: ReadingState; prompt: PromptState; subscribed: boolean },
  now: Date,
): boolean {
  const p = s.prompt;
  if (s.subscribed || p.declined) return false;
  if (s.reading.opened.length < PROMPT_RULES.minArticles) return false;
  if (p.impressions >= PROMPT_RULES.maxImpressions) return false;
  if (p.snoozedUntil && now.getTime() < Date.parse(p.snoozedUntil)) return false;
  return true;
}

export const recordImpression = (p: PromptState): PromptState => ({ ...p, impressions: p.impressions + 1 });

export function dismissPrompt(p: PromptState, now: Date): PromptState {
  const dismissals = p.dismissals + 1;
  const snooze = PROMPT_RULES.snoozeDays[dismissals - 1];
  if (snooze === undefined) return { ...p, dismissals, declined: true, snoozedUntil: null };
  return { ...p, dismissals, snoozedUntil: new Date(now.getTime() + snooze * 86_400_000).toISOString() };
}

export const declinePrompt = (p: PromptState): PromptState => ({ ...p, declined: true, snoozedUntil: null });

// Practical check, not RFC 5322: one @, no spaces, a dot in the domain, sane length.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function validateEmail(raw: string): { ok: true; email: string } | { ok: false; error: string } {
  const email = raw.trim();
  if (email === "") return { ok: false, error: "Introdu adresa de e-mail." };
  if (email.length > 254 || !EMAIL_RE.test(email))
    return { ok: false, error: "Adresa de e-mail nu pare validă. Exemplu: nume@exemplu.ro" };
  return { ok: true, email };
}

export type SubscribeResult =
  | { ok: true; subscriber: Subscriber; consent: ConsentRecord }
  | { ok: false; errors: { email?: string; consent?: string } };

/** Entering an email is never treated as consent: `marketingConsent` must be explicitly true. */
export function subscribe(
  input: { email: string; marketingConsent: boolean; source: ConsentSource },
  now: Date,
  id: string,
): SubscribeResult {
  const v = validateEmail(input.email);
  const errors: { email?: string; consent?: string } = {};
  if (!v.ok) errors.email = v.error;
  if (input.marketingConsent !== true)
    errors.consent = "Pentru a te abona, bifează acordul. Fără el nu salvăm adresa.";
  if (!v.ok || errors.consent) return { ok: false, errors };

  const at = now.toISOString();
  return {
    ok: true,
    subscriber: { id, email: v.email, createdAt: at, delivery: "demo" },
    consent: { subscriberId: id, purpose: "newsletter", granted: true, at, textVersion: CONSENT_TEXT_VERSION, source: input.source },
  };
}

/** Withdrawal entry for the consent log. The caller deletes the subscriber record (email). */
export function unsubscribe(subscriber: Subscriber, now: Date, source: ConsentSource): ConsentRecord {
  return {
    subscriberId: subscriber.id,
    purpose: "newsletter",
    granted: false,
    at: now.toISOString(),
    textVersion: CONSENT_TEXT_VERSION,
    source,
  };
}

/** Masks an address for display: "ana.pop@exemplu.ro" → "a•••@exemplu.ro". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}•••@${domain}`;
}

// ---- Parsing (never throws) ----

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isIso = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

function json(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function parseReading(raw: string | null): ReadingState {
  const d = json(raw);
  if (!isObj(d) || !Array.isArray(d.opened)) return { opened: [] };
  return { opened: [...new Set(d.opened.filter((x): x is string => typeof x === "string"))] };
}

export function parsePrompt(raw: string | null): PromptState {
  const d = json(raw);
  if (!isObj(d)) return defaultPrompt();
  return {
    impressions: isCount(d.impressions) ? d.impressions : 0,
    dismissals: isCount(d.dismissals) ? d.dismissals : 0,
    snoozedUntil: isIso(d.snoozedUntil) ? d.snoozedUntil : null,
    declined: d.declined === true,
  };
}

export function parseSubscriber(raw: string | null): Subscriber | null {
  const d = json(raw);
  if (!isObj(d) || typeof d.id !== "string" || typeof d.email !== "string" || !isIso(d.createdAt) || d.delivery !== "demo")
    return null;
  if (!validateEmail(d.email).ok) return null;
  return { id: d.id, email: d.email, createdAt: d.createdAt, delivery: "demo" };
}

const SOURCES: ConsentSource[] = ["onboarding", "article-prompt", "progress-page", "unsubscribe-page"];

export function parseConsentLog(raw: string | null): ConsentRecord[] {
  const d = json(raw);
  if (!Array.isArray(d)) return [];
  return d.filter(
    (c): c is ConsentRecord =>
      isObj(c) &&
      typeof c.subscriberId === "string" &&
      c.purpose === "newsletter" &&
      typeof c.granted === "boolean" &&
      isIso(c.at) &&
      typeof c.textVersion === "string" &&
      SOURCES.includes(c.source as ConsentSource),
  );
}
