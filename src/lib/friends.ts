import { z } from "zod";
import type { ProgressSummary } from "./progress";
import { ALIAS_MAX, type Friend } from "./storage";

/**
 * Friend codes: "PCAC1." + base64url(JSON). They carry only an alias and
 * educational completion counts — never income, savings or any profile figure.
 * There is no server: friends exchange codes themselves (chat, e-mail).
 */
const PREFIX = "PCAC1.";

const count = z.int().min(0).max(100);
const CodeSchema = z.strictObject({
  a: z.string().trim().min(2).max(ALIAS_MAX),
  p: z.int().min(0).max(100),
  m: count,
  q: count,
  s: count,
});

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function friendFromProgress(alias: string, p: ProgressSummary): Friend {
  return { alias: alias.trim(), percent: p.percent, modulesRead: p.modulesRead, quizzesPassed: p.quizzesPassed, scamsDone: p.scamsDone };
}

export function encodeFriendCode(f: Friend): string {
  return PREFIX + toBase64Url(JSON.stringify({ a: f.alias, p: f.percent, m: f.modulesRead, q: f.quizzesPassed, s: f.scamsDone }));
}

/** Never throws: returns null for anything that is not a valid code. */
export function decodeFriendCode(input: string): Friend | null {
  const code = input.trim();
  if (!code.startsWith(PREFIX)) return null;
  try {
    const parsed = CodeSchema.safeParse(JSON.parse(fromBase64Url(code.slice(PREFIX.length))));
    if (!parsed.success) return null;
    const { a, p, m, q, s } = parsed.data;
    return { alias: a, percent: p, modulesRead: m, quizzesPassed: q, scamsDone: s };
  } catch {
    return null;
  }
}
