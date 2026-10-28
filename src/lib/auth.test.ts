import { describe, expect, it } from "vitest";
import {
  PBKDF2_ITERATIONS,
  accountStateKey,
  createAccount,
  findAccount,
  parseAccounts,
  parseSession,
  validatePassword,
  validateSignUp,
  validateUsername,
  verifyPassword,
} from "./auth";

const FAST = 1_000; // keep unit tests quick; production uses PBKDF2_ITERATIONS
const NOW = new Date("2026-10-28T10:00:00.000Z");

describe("validateUsername", () => {
  it.each(["ana", "Ana.Pop", "ion_99", "a-b"])("accepts %j", (u) => expect(validateUsername(u)).toBeNull());
  it.each(["", "ab", "a".repeat(25), "ana pop", "ană", "ana@x"])("rejects %j", (u) => expect(validateUsername(u)).toBeTypeOf("string"));
});

describe("validatePassword", () => {
  it("requires 8–128 characters with a letter and a digit", () => {
    expect(validatePassword("parola123")).toBeNull();
    expect(validatePassword("scurt1")).toBeTypeOf("string");
    expect(validatePassword("doarlitere")).toBeTypeOf("string");
    expect(validatePassword("12345678")).toBeTypeOf("string");
    expect(validatePassword(`a1${"x".repeat(127)}`)).toBeTypeOf("string");
  });
});

describe("validateSignUp", () => {
  it("rejects a taken username case-insensitively and a mismatched confirmation", async () => {
    const existing = await createAccount({ username: "Ana", password: "parola123" }, NOW, "id-1", FAST);
    const e = validateSignUp({ username: "ana", password: "parola123", confirm: "parola124" }, [existing]);
    expect(e.username).toMatch(/folosit/);
    expect(e.confirm).toBeTypeOf("string");
    expect(e.password).toBeUndefined();
  });
});

describe("createAccount / verifyPassword", () => {
  it("never stores the password and verifies only the right one", async () => {
    const a = await createAccount({ username: "Ana", password: "parola123" }, NOW, "id-1", FAST);
    expect(JSON.stringify(a)).not.toContain("parola123");
    expect(a).toMatchObject({ id: "id-1", username: "Ana", iterations: FAST, createdAt: NOW.toISOString() });
    expect(await verifyPassword(a, "parola123")).toBe(true);
    expect(await verifyPassword(a, "Parola123")).toBe(false);
    expect(await verifyPassword(a, "")).toBe(false);
  });

  it("uses a fresh salt per account", async () => {
    const a = await createAccount({ username: "a1x", password: "parola123" }, NOW, "1", FAST);
    const b = await createAccount({ username: "b1x", password: "parola123" }, NOW, "2", FAST);
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });

  it("defaults to the OWASP-recommended iteration count", () => {
    expect(PBKDF2_ITERATIONS).toBeGreaterThanOrEqual(600_000);
  });
});

describe("lookup and parsing", () => {
  it("finds accounts case-insensitively", async () => {
    const a = await createAccount({ username: "Ana", password: "parola123" }, NOW, "id-1", FAST);
    expect(findAccount([a], " ANA ")?.id).toBe("id-1");
    expect(findAccount([a], "ion")).toBeUndefined();
  });

  it("never throws on bad stored data", async () => {
    const a = await createAccount({ username: "Ana", password: "parola123" }, NOW, "id-1", FAST);
    expect(parseAccounts("{bad")).toEqual([]);
    expect(parseAccounts(JSON.stringify([a, { username: "x" }, 4]))).toEqual([a]);
    expect(parseSession("nope")).toBeNull();
    expect(parseSession(JSON.stringify({ accountId: "id-1" }))).toEqual({ accountId: "id-1" });
  });

  it("keeps each account's data under its own key", () => {
    expect(accountStateKey(null, "v1")).toBe("pcac:v1");
    expect(accountStateKey("id-1", "v1")).toBe("pcac:acct:id-1:v1");
    expect(accountStateKey("id-1", "subscriber:v1")).toBe("pcac:acct:id-1:subscriber:v1");
  });
});
