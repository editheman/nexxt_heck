/** Learning interests chosen after the Reality Check. Every topic leads to a real module. */
export const TOPIC_IDS = ["etf", "inflatie", "randament-real", "fond-urgenta", "diversificare", "comisioane", "taxe", "fraude"] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export type Topic = { id: TopicId; label: string; question: string; moduleSlug: string };

export const TOPICS: Topic[] = [
  { id: "etf", label: "Investiții prin ETF-uri", question: "Ce este un ETF, cât costă și ce riscuri are?", moduleSlug: "etf" },
  { id: "inflatie", label: "Inflația și puterea de cumpărare", question: "De ce cumpără banii mai puțin în timp?", moduleSlug: "inflatia" },
  { id: "randament-real", label: "Randament real", question: "Cum compar o dobândă cu inflația?", moduleSlug: "randament-real" },
  { id: "fond-urgenta", label: "Fond de urgență", question: "Câți bani să am deoparte pentru neprevăzut?", moduleSlug: "lichiditate" },
  { id: "diversificare", label: "Diversificare", question: "De ce nu pun toți banii într-un singur loc?", moduleSlug: "diversificare" },
  { id: "comisioane", label: "Comisioane și costuri", question: "Cât mă costă, de fapt, un produs financiar?", moduleSlug: "comisioane" },
  { id: "taxe", label: "Taxe și randament net", question: "Ce rămâne după impozite?", moduleSlug: "taxe" },
  { id: "fraude", label: "Protecție anti-fraudă", question: "Cum recunosc o înșelătorie financiară?", moduleSlug: "fraude" },
];
