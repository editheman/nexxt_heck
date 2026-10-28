/**
 * Local demo accounts (no backend). Passwords are never stored: each account keeps a random salt
 * and a PBKDF2-HMAC-SHA-256 hash. See docs/superpowers/specs/2026-10-28-accounts-design.md —
 * this is not real authentication; production needs server-side accounts.
 */

export const PBKDF2_ITERATIONS = 600_000;
export const ACCOUNTS_KEY = "pcac:accounts:v1";
export const SESSION_KEY = "pcac:session:v1";

export type Account = {
  id: string;
  /** As typed at sign-up (display); lookups are case-insensitive. */
  username: string;
  salt: string;
  hash: string;
  iterations: number;
  createdAt: string;
};

export type Session = { accountId: string };

export type SignUpErrors = Partial<Record<"username" | "password" | "confirm", string>>;

const USERNAME_RE = /^[A-Za-z0-9._-]{3,24}$/;

export function validateUsername(raw: string): string | null {
  const u = raw.trim();
  if (u === "") return "Alege un nume de utilizator.";
  if (!USERNAME_RE.test(u)) return "Folosește 3–24 de caractere: litere fără diacritice, cifre, punct, „_” sau „-”.";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Parola trebuie să aibă cel puțin 8 caractere.";
  if (pw.length > 128) return "Parola poate avea cel mult 128 de caractere.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Folosește cel puțin o literă și o cifră.";
  return null;
}

export const usernameKey = (u: string) => u.trim().toLowerCase();

export function findAccount(accounts: Account[], username: string): Account | undefined {
  const key = usernameKey(username);
  return accounts.find((a) => usernameKey(a.username) === key);
}

export function validateSignUp(input: { username: string; password: string; confirm: string }, accounts: Account[]): SignUpErrors {
  const e: SignUpErrors = {};
  const u = validateUsername(input.username);
  if (u) e.username = u;
  else if (findAccount(accounts, input.username)) e.username = "Acest nume de utilizator este deja folosit în acest browser.";
  const p = validatePassword(input.password);
  if (p) e.password = p;
  if (input.confirm !== input.password) e.confirm = "Parolele nu coincid.";
  return e;
}

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function createAccount(
  input: { username: string; password: string },
  now: Date,
  id: string,
  iterations = PBKDF2_ITERATIONS,
): Promise<Account> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(input.password, salt, iterations);
  return { id, username: input.username.trim(), salt: toB64(salt), hash: toB64(hash), iterations, createdAt: now.toISOString() };
}

/** Recomputes the hash and compares in constant time. */
export async function verifyPassword(account: Account, password: string): Promise<boolean> {
  const expected = fromB64(account.hash);
  const actual = await derive(password, fromB64(account.salt), account.iterations);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

/** localStorage key for a piece of per-account data; guest data keeps the original keys. */
export function accountStateKey(accountId: string | null, name: string): string {
  return accountId ? `pcac:acct:${accountId}:${name}` : `pcac:${name}`;
}

// ---- Parsing (never throws) ----

function json(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;

export function parseAccounts(raw: string | null): Account[] {
  const d = json(raw);
  if (!Array.isArray(d)) return [];
  return d.filter(
    (a): a is Account =>
      typeof a === "object" &&
      a !== null &&
      isStr(a.id) &&
      isStr(a.username) &&
      isStr(a.salt) &&
      isStr(a.hash) &&
      Number.isInteger(a.iterations) &&
      a.iterations > 0 &&
      isStr(a.createdAt),
  );
}

export function parseSession(raw: string | null): Session | null {
  const d = json(raw);
  return typeof d === "object" && d !== null && isStr((d as Session).accountId) ? { accountId: (d as Session).accountId } : null;
}
