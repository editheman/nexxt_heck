import { z } from "zod";

export const INDUSTRIES = ["it", "horeca", "sanatate", "corporate", "constructii", "freelancer"] as const;
export type Industry = (typeof INDUSTRIES)[number];

/** Romanian copy: non-empty, and only comma-below ș/ț (the cedilla variants U+015F/U+0163 are wrong). */
export const RoText = z
  .string()
  .trim()
  .min(1)
  .refine((s) => !/[\u015F\u0163\u015E\u0162]/.test(s), { message: "Folosește ș/ț cu virgulă dedesubt, nu variantele cu sedilă." });

export const SourceSchema = z.object({
  label: RoText,
  url: z.url({ protocol: /^https$/ }),
});

export const MacroFactSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Short label above the fact, e.g. "Inflație 2025". */
  kicker: RoText,
  text: RoText,
  sources: z.array(SourceSchema).min(1),
});

export const IndustryInsightSchema = z.object({
  industry: z.enum(INDUSTRIES),
  label: RoText,
  headline: RoText,
  stat: z.object({ value: RoText, caption: RoText }),
  body: RoText,
  /** "official" = a published figure; "estimate" = calculated from official series. */
  kind: z.enum(["official", "estimate"]),
  sources: z.array(SourceSchema).min(1),
});

export const DynamicFactsSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: z.iso.date(),
    /** Latest complete year of official data used. */
    dataYear: z.int().min(2000).max(2100),
    macroFacts: z.array(MacroFactSchema).min(1),
    industries: z.array(IndustryInsightSchema),
  })
  .refine((d) => INDUSTRIES.every((i) => d.industries.filter((x) => x.industry === i).length === 1), {
    message: "Fiecare domeniu trebuie să aibă exact un insight.",
    path: ["industries"],
  });

export type MacroFact = z.infer<typeof MacroFactSchema>;
export type IndustryInsight = z.infer<typeof IndustryInsightSchema>;
export type DynamicFacts = z.infer<typeof DynamicFactsSchema>;
