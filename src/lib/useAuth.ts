"use client";

import { useSyncExternalStore } from "react";
import {
  ACCOUNTS_KEY,
  PBKDF2_ITERATIONS,
  SESSION_KEY,
  accountStateKey,
  createAccount,
  findAccount,
  parseAccounts,
  parseSession,
  validateSignUp,
  verifyPassword,
  type Account,
  type SignUpErrors,
} from "./auth";
import { refreshDemoState } from "./useDemoState";
import { newsletterKeys, refreshNewsletter } from "./useNewsletter";

type Snapshot = { accounts: Account[]; account: Account | null };

const SERVER: Snapshot = { accounts: [], account: null };
let cache: Snapshot | null = null;
const listeners = new Set<() => void>();

function get(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked */
  }
}

function read(): Snapshot {
  if (cache === null) {
    const accounts = parseAccounts(get(ACCOUNTS_KEY));
    const session = parseSession(get(SESSION_KEY));
    cache = { accounts, account: accounts.find((a) => a.id === session?.accountId) ?? null };
  }
  return cache;
}

/** Login/logout switches which keys every store reads, so all of them refresh together. */
function refreshAll() {
  cache = null;
  refreshDemoState();
  refreshNewsletter();
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key === ACCOUNTS_KEY || e.key === SESSION_KEY) refreshAll();
}

function subscribe(l: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Moves the guest's demo state and newsletter data into the new account (progress made before signing up is kept). */
function moveGuestData(accountId: string) {
  const pairs: Array<[string, string]> = [[accountStateKey(null, "v1"), accountStateKey(accountId, "v1")]];
  const from = newsletterKeys(null);
  const to = newsletterKeys(accountId);
  for (const k of Object.keys(from) as Array<keyof typeof from>) pairs.push([from[k], to[k]]);
  for (const [src, dst] of pairs) {
    const v = get(src);
    if (v !== null) {
      set(dst, v);
      set(src, null);
    }
  }
}

/** Never matches (fixed salt, all-zero hash). Used only to spend equal time on unknown usernames. */
const DUMMY_ACCOUNT: Account = {
  id: "-",
  username: "-",
  salt: "AAAAAAAAAAAAAAAAAAAAAA==",
  hash: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  iterations: PBKDF2_ITERATIONS,
  createdAt: "1970-01-01T00:00:00.000Z",
};

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `a-${Date.now().toString(36)}`);

export const auth = {
  async signUp(input: { username: string; password: string; confirm: string }): Promise<{ ok: true } | { ok: false; errors: SignUpErrors }> {
    const accounts = read().accounts;
    const errors = validateSignUp(input, accounts);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    const account = await createAccount({ username: input.username, password: input.password }, new Date(), newId());
    set(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
    moveGuestData(account.id);
    set(SESSION_KEY, JSON.stringify({ accountId: account.id }));
    refreshAll();
    return { ok: true };
  },

  async login(username: string, password: string): Promise<boolean> {
    const account = findAccount(read().accounts, username);
    // Same work (a full PBKDF2 run) and the same answer whether or not the username exists,
    // so response time does not reveal which usernames are registered.
    const ok = await verifyPassword(account ?? DUMMY_ACCOUNT, password);
    if (!ok || !account) return false;
    set(SESSION_KEY, JSON.stringify({ accountId: account.id }));
    refreshAll();
    return true;
  },

  logout() {
    set(SESSION_KEY, null);
    refreshAll();
  },
};

export function useAuth() {
  const snap = useSyncExternalStore(subscribe, read, () => SERVER);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  return { account: snap.account, hydrated };
}
