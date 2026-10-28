import { describe, expect, it } from "vitest";
import {
  HISTORY_CAP,
  addGeneration,
  confirmMethod,
  currentGeneration,
  emptyPlans,
  history,
  methodsOf,
  removeMethod,
  sameSnapshot,
  toggleDraft,
  unconfirmMethod,
  type PlanSnapshot,
} from "./plans";

const snap: PlanSnapshot = {
  horizonYears: 10, goal: "pensie", placement: "cont-curent", savings: 20000, monthly: 500, ageRange: null,
  emergencyFund: "da", riskTolerance: "medie", experience: "putina", costlyDebt: "nu",
};
const items = (...ids: string[]) => ids.map((id) => ({ id, why: "w", watchOut: "c" })) as never;
const T = (n: number) => new Date(Date.UTC(2026, 9, 29, 10, n)).toISOString();

describe("generations", () => {
  it("pushes a new current set when the snapshot changes, and keeps the old one as history (newest first)", () => {
    let p = addGeneration(emptyPlans(), { snapshot: snap, items: items("etf-global", "pilon3"), source: "reguli" }, T(0), "g1");
    p = addGeneration(p, { snapshot: { ...snap, goal: "locuinta" }, items: items("depozit"), source: "ai", model: "m" }, T(1), "g2");
    p = addGeneration(p, { snapshot: { ...snap, horizonYears: 3 }, items: items("tezaur"), source: "reguli" }, T(2), "g3");
    expect(currentGeneration(p)?.id).toBe("g3");
    expect(history(p).map((g) => g.id)).toEqual(["g2", "g1"]);
  });

  it("updates the current set in place when the snapshot is the same, dropping methods no longer recommended", () => {
    let p = addGeneration(emptyPlans(), { snapshot: snap, items: items("etf-global", "pilon3"), source: "reguli" }, T(0), "g1");
    p = toggleDraft(p, "etf-global", T(1));
    p = toggleDraft(p, "pilon3", T(1));
    p = addGeneration(p, { snapshot: { ...snap }, items: items("pilon3", "fidelis"), source: "ai", model: "m" }, T(2), "g-ignored");
    expect(p.generations).toHaveLength(1);
    expect(currentGeneration(p)).toMatchObject({ id: "g1", source: "ai", createdAt: T(2) });
    expect(methodsOf(p, "g1").map((m) => m.productId)).toEqual(["pilon3"]);
  });

  it("compares snapshots by value", () => {
    expect(sameSnapshot(snap, { ...snap })).toBe(true);
    expect(sameSnapshot(snap, { ...snap, costlyDebt: "da" })).toBe(false);
  });

  it("caps the history", () => {
    let p = emptyPlans();
    for (let i = 0; i < HISTORY_CAP + 5; i++) p = addGeneration(p, { snapshot: { ...snap, horizonYears: i }, items: items("depozit"), source: "reguli" }, T(i), `g${i}`);
    expect(p.generations).toHaveLength(HISTORY_CAP);
    expect(currentGeneration(p)?.id).toBe(`g${HISTORY_CAP + 4}`);
  });
});

describe("methods", () => {
  const base = addGeneration(emptyPlans(), { snapshot: snap, items: items("etf-global", "pilon3"), source: "reguli" }, T(0), "g1");

  it("toggles drafts only for categories of the current set", () => {
    let p = toggleDraft(base, "etf-global", T(1));
    expect(methodsOf(p, "g1")).toEqual([{ productId: "etf-global", generationId: "g1", status: "draft", addedAt: T(1) }]);
    p = toggleDraft(p, "etf-global", T(2));
    expect(methodsOf(p, "g1")).toEqual([]);
    expect(toggleDraft(base, "cripto", T(1))).toBe(base);
  });

  it("confirms, un-confirms and removes", () => {
    let p = toggleDraft(base, "pilon3", T(1));
    p = confirmMethod(p, "g1", "pilon3", T(2));
    expect(methodsOf(p, "g1")[0]).toMatchObject({ status: "confirmed", confirmedAt: T(2) });
    // A confirmed method is not removed by the recommendation toggle.
    expect(methodsOf(toggleDraft(p, "pilon3", T(3)), "g1")[0].status).toBe("confirmed");
    p = unconfirmMethod(p, "g1", "pilon3");
    expect(methodsOf(p, "g1")[0]).toEqual({ productId: "pilon3", generationId: "g1", status: "draft", addedAt: T(1) });
    p = removeMethod(p, "g1", "pilon3");
    expect(methodsOf(p, "g1")).toEqual([]);
  });

  it("keeps old methods with their set when a new set is pushed", () => {
    let p = confirmMethod(toggleDraft(base, "pilon3", T(1)), "g1", "pilon3", T(2));
    p = addGeneration(p, { snapshot: { ...snap, goal: "altul" }, items: items("depozit"), source: "reguli" }, T(3), "g2");
    expect(methodsOf(p, "g1")).toHaveLength(1);
    expect(methodsOf(p, "g2")).toEqual([]);
    // History is read-only: actions only affect the current set.
    expect(confirmMethod(p, "g1", "pilon3", T(4))).toBe(p);
  });
});
