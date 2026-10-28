"use client";

import { useSyncExternalStore } from "react";
import { MODULE_SLUGS } from "@/content/moduleSlugs";
import { SESSION_KEY, accountStateKey, parseSession } from "./auth";
import {
  declinePrompt,
  defaultPrompt,
  dismissPrompt,
  parseConsentLog,
  parsePrompt,
  parseReading,
  parseSubscriber,
  recordArticleOpen,
  recordImpression,
  subscribe,
  unsubscribe,
  type ConsentRecord,
  type ConsentSource,
  type PromptState,
  type ReadingState,
  type SubscribeResult,
  type Subscriber,
} from "./newsletter";

/**
 * Separate keys on purpose: reading events, prompt state, subscriber (email) and consent log never
 * share a record. Each account has its own set; logged out uses the guest keys (`pcac:reading:v1`, …).
 */
const NAMES = { reading: "reading:v1", prompt: "prompt:v1", subscriber: "subscriber:v1", consent: "consent:v1" } as const;

export function newsletterKeys(accountId: string | null) {
  return {
    reading: accountStateKey(accountId, NAMES.reading),
    prompt: accountStateKey(accountId, NAMES.prompt),
    subscriber: accountStateKey(accountId, NAMES.subscriber),
    consent: accountStateKey(accountId, NAMES.consent),
  };
}

function keys() {
  let accountId: string | null = null;
  try {
    accountId = parseSession(window.localStorage.getItem(SESSION_KEY))?.accountId ?? null;
  } catch {
    /* storage blocked: guest */
  }
  return newsletterKeys(accountId);
}

export type NewsletterSnapshot = {
  reading: ReadingState;
  prompt: PromptState;
  subscriber: Subscriber | null;
  consentLog: ConsentRecord[];
};

const SERVER: NewsletterSnapshot = { reading: { opened: [] }, prompt: defaultPrompt(), subscriber: null, consentLog: [] };
let cache: NewsletterSnapshot | null = null;
const listeners = new Set<() => void>();

function get(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep in memory for this page view */
  }
}

function read(): NewsletterSnapshot {
  if (cache === null) {
    const k = keys();
    cache = {
      reading: parseReading(get(k.reading)),
      prompt: parsePrompt(get(k.prompt)),
      subscriber: parseSubscriber(get(k.subscriber)),
      consentLog: parseConsentLog(get(k.consent)),
    };
  }
  return cache;
}

/** Re-reads from storage, e.g. after login/logout switched the active account. */
export function refreshNewsletter() {
  cache = null;
  listeners.forEach((l) => l());
}

function commit(next: Partial<NewsletterSnapshot>) {
  const cur = read();
  cache = { ...cur, ...next };
  const k = keys();
  if (next.reading) set(k.reading, next.reading);
  if (next.prompt) set(k.prompt, next.prompt);
  if ("subscriber" in next) set(k.subscriber, next.subscriber ?? null);
  if (next.consentLog) set(k.consent, next.consentLog);
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key === SESSION_KEY || Object.values(keys()).includes(e.key)) {
    cache = null;
    listeners.forEach((l) => l());
  }
}

function subscribeStore(l: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `s-${Date.now().toString(36)}`;
}

export const newsletter = {
  /** Lightweight, local-only article-open event: records the slug in a distinct set. */
  trackArticleOpen(slug: string) {
    const cur = read().reading;
    const next = recordArticleOpen(cur, slug, MODULE_SLUGS);
    if (next !== cur) commit({ reading: next });
  },
  recordImpression() {
    commit({ prompt: recordImpression(read().prompt) });
  },
  dismiss() {
    commit({ prompt: dismissPrompt(read().prompt, new Date()) });
  },
  decline() {
    commit({ prompt: declinePrompt(read().prompt) });
  },
  subscribe(email: string, marketingConsent: boolean, source: ConsentSource): SubscribeResult {
    const r = subscribe({ email, marketingConsent, source }, new Date(), newId());
    if (r.ok) commit({ subscriber: r.subscriber, consentLog: [...read().consentLog, r.consent] });
    return r;
  },
  unsubscribe(source: ConsentSource) {
    const s = read().subscriber;
    if (!s) return;
    commit({ subscriber: null, consentLog: [...read().consentLog, unsubscribe(s, new Date(), source)] });
  },
  /** Used by "Resetează demo-ul": removes every newsletter-related key, including the consent log. */
  clearAll() {
    Object.values(keys()).forEach((k) => set(k, null));
    cache = null;
    listeners.forEach((l) => l());
  },
};

export function useNewsletter() {
  const snap = useSyncExternalStore(subscribeStore, read, () => SERVER);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  return { ...snap, hydrated };
}
