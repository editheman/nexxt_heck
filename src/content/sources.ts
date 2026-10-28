/** Official Romanian institutions referenced for verification. Names and homepages only — no figures are attributed to them. */
export const OFFICIAL_SOURCES = [
  { name: "INS", url: "https://insse.ro", topic: "date oficiale despre inflație (indicele prețurilor de consum)" },
  { name: "BNR", url: "https://www.bnr.ro", topic: "politică monetară și informații despre sistemul bancar" },
  { name: "ASF", url: "https://asfromania.ro", topic: "piața de capital, asigurări, pensii private și avertizări despre entități neautorizate" },
  { name: "DNSC", url: "https://dnsc.ro", topic: "securitate cibernetică și raportarea tentativelor de fraudă online" },
  { name: "ANAF", url: "https://www.anaf.ro", topic: "reguli fiscale actuale" },
] as const;

export const sourceByName = (name: (typeof OFFICIAL_SOURCES)[number]["name"]) =>
  OFFICIAL_SOURCES.find((s) => s.name === name)!;
