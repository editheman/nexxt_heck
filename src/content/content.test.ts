import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MODULES } from "./modules";
import { SCAMS } from "./scams";

describe("learning modules", () => {
  it("have unique slugs and question ids", () => {
    expect(new Set(MODULES.map((m) => m.slug)).size).toBe(MODULES.length);
    const ids = MODULES.flatMap((m) => m.quiz.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(MODULES.map((m) => [m.slug, m] as const))("%s: every question points to a real option and section", (_, m) => {
    const sectionIds = new Set(m.sections.map((s) => s.id));
    expect(m.quiz.length).toBeGreaterThanOrEqual(3);
    for (const q of m.quiz) {
      expect(q.options.map((o) => o.id)).toContain(q.correctId);
      expect(sectionIds.has(q.sectionId)).toBe(true);
    }
  });
});

describe("scam scenarios", () => {
  it.each(SCAMS.map((s) => [s.id, s] as const))("%s: each step has exactly one correct choice", (_, s) => {
    for (const step of s.steps) expect(step.choices.filter((c) => c.correct)).toHaveLength(1);
  });
});

describe("Romanian copy", () => {
  // ş/ţ (cedilla) are the wrong glyphs for Romanian; ș/ț (comma below) are correct.
  it("uses comma-below diacritics everywhere in src", () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? walk(join(dir, d.name)) : /\.(ts|tsx)$/.test(d.name) ? [join(dir, d.name)] : [],
      );
    const offenders = walk(join(__dirname, "..")).filter((f) => f !== __filename && /[şţŞŢ]/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
