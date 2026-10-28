"use client";

import { useSyncExternalStore } from "react";
import type { RealityWindow } from "@/content/macro-ro";
import type { TopicId } from "@/content/topics";
import {
  STORAGE_KEY,
  defaultState,
  parseState,
  serializeState,
  type DemoState,
  type Profile,
} from "./storage";

let cache: DemoState | null = null;
let storageAvailable = true;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT = defaultState();

function read(): DemoState {
  if (cache === null) {
    try {
      cache = parseState(window.localStorage.getItem(STORAGE_KEY));
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
    window.localStorage.setItem(STORAGE_KEY, serializeState(next));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  notify();
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY && e.key !== null) return;
  cache = parseState(e.newValue);
  notify();
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
  setInterests(interests: TopicId[]) {
    updateState((s) => ({ ...s, interests }));
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
