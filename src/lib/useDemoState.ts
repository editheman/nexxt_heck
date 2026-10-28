"use client";

import { useSyncExternalStore } from "react";
import type { RealityWindow } from "@/content/macro-ro";
import type { ProductId } from "@/content/products";
import { addGeneration, confirmMethod, removeMethod, toggleDraft, unconfirmMethod, type PlanSnapshot } from "./plans";
import type { RecommendResponse } from "./recommend";
import { SESSION_KEY, accountStateKey, parseSession } from "./auth";
import {
  defaultState,
  parseState,
  serializeState,
  type DemoState,
  type Profile,
} from "./storage";

let cache: DemoState | null = null;
let cacheKey: string | null = null;
let storageAvailable = true;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT = defaultState();

/** The logged-in account's state key, or the guest key (`pcac:v1`) when logged out. */
export function currentStateKey(): string {
  let accountId: string | null = null;
  try {
    accountId = parseSession(window.localStorage.getItem(SESSION_KEY))?.accountId ?? null;
  } catch {
    /* storage blocked: guest */
  }
  return accountStateKey(accountId, "v1");
}

function read(): DemoState {
  if (cache === null) {
    cacheKey = currentStateKey();
    try {
      cache = parseState(window.localStorage.getItem(cacheKey));
    } catch {
      storageAvailable = false;
      cache = defaultState();
    }
  }
  return cache;
}

function notify() {
  listeners.forEach((l) => l());
}

function write(next: DemoState) {
  cache = next;
  try {
    window.localStorage.setItem(cacheKey ?? currentStateKey(), serializeState(next));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  notify();
}

/** Current state outside React (e.g. right after login, before the next render). */
export function getDemoState(): DemoState {
  return read();
}

/** Re-reads from storage, e.g. after login/logout switched the active account. */
export function refreshDemoState() {
  cache = null;
  notify();
}

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== cacheKey && e.key !== SESSION_KEY) return;
  refreshDemoState();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

export function updateState(fn: (s: DemoState) => DemoState) {
  write(fn(read()));
}

export const actions = {
  saveProfile(profile: Profile) {
    updateState((s) => ({ ...s, profile }));
  },
  setRiskProfile(riskProfile: DemoState["riskProfile"]) {
    updateState((s) => ({ ...s, riskProfile }));
  },
  saveGeneration(snapshot: PlanSnapshot, r: RecommendResponse) {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `g-${Date.now().toString(36)}`;
    updateState((s) => ({ ...s, plans: addGeneration(s.plans, { snapshot, items: r.items, source: r.source, model: r.model }, new Date().toISOString(), id) }));
  },
  toggleMethod(productId: ProductId) {
    updateState((s) => ({ ...s, plans: toggleDraft(s.plans, productId, new Date().toISOString()) }));
  },
  confirmMethod(generationId: string, productId: ProductId) {
    updateState((s) => ({ ...s, plans: confirmMethod(s.plans, generationId, productId, new Date().toISOString()) }));
  },
  unconfirmMethod(generationId: string, productId: ProductId) {
    updateState((s) => ({ ...s, plans: unconfirmMethod(s.plans, generationId, productId) }));
  },
  removeMethod(generationId: string, productId: ProductId) {
    updateState((s) => ({ ...s, plans: removeMethod(s.plans, generationId, productId) }));
  },
  completeOnboarding() {
    if (read().onboarding.completedAt) return;
    updateState((s) => ({ ...s, onboarding: { completedAt: new Date().toISOString() } }));
  },
  setRealityYears(years: RealityWindow) {
    updateState((s) => ({ ...s, reality: { years } }));
  },
  markVisited(page: "reality" | "simulator") {
    if (read().progress.visited[page]) return;
    updateState((s) => ({ ...s, progress: { ...s.progress, visited: { ...s.progress.visited, [page]: true } } }));
  },
  recordScam(id: string, correct: number, total: number) {
    updateState((s) => ({
      ...s,
      progress: { ...s.progress, scams: { ...s.progress.scams, [id]: { completed: true, correct, total } } },
    }));
  },
  markModuleRead(slug: string) {
    updateState((s) => ({
      ...s,
      progress: { ...s.progress, modulesRead: { ...s.progress.modulesRead, [slug]: true } },
    }));
  },
  recordQuiz(slug: string, correct: number, total: number, wrongIds: string[]) {
    updateState((s) => {
      const prev = s.progress.quizzes[slug];
      const best = Math.max(prev?.best ?? 0, correct);
      return {
        ...s,
        progress: { ...s.progress, quizzes: { ...s.progress.quizzes, [slug]: { best, total, lastWrong: wrongIds } } },
      };
    });
  },
  reset() {
    write(defaultState());
  },
};

/**
 * `hydrated` is false during SSR and the first client render, so pages can
 * show a neutral skeleton instead of flashing default (empty) state.
 */
export function useDemoState() {
  const state = useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return { state, hydrated, storageAvailable: hydrated ? storageAvailable : true };
}
