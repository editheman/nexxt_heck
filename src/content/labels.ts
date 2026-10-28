import type { Goal, Placement } from "@/lib/storage";

export const PLACEMENT_LABELS: Record<Placement, string> = {
  numerar: "Numerar (acasă)",
  "cont-curent": "Cont curent",
  depozit: "Depozit bancar",
  investitii: "Investiții (fonduri, acțiuni, titluri de stat etc.)",
  mix: "Un mix din cele de mai sus",
};

export const GOAL_LABELS: Record<Goal, string> = {
  "fond-urgenta": "Fond de urgență",
  locuinta: "Avans pentru o locuință",
  educatie: "Educație sau cursuri",
  pensie: "Pensie / termen lung",
  altul: "Alt obiectiv",
};
