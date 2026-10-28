import type { Goal } from "@/lib/storage";

/**
 * Learning path per savings goal (profile step 2, „Obiectivul principal”). The Învață page and the
 * portal show these modules first, in this order. Educational framing only — not recommendations.
 */
export type GoalPath = { intro: string; modules: string[] };

export const GOAL_PATHS: Record<Goal, GoalPath> = {
  "fond-urgenta": {
    intro:
      "Un fond de urgență trebuie să fie sigur și ușor de accesat. Începe cu lichiditatea, apoi vezi cum îl erodează inflația și cum îl ferești de fraude.",
    modules: ["lichiditate", "inflatia", "fraude"],
  },
  locuinta: {
    intro:
      "Pentru un avans strângi bani câțiva ani și ai nevoie de ei la o dată anume. Contează să compari dobânzile cu inflația, să urmărești costurile și să păstrezi banii accesibili.",
    modules: ["inflatia", "randament-real", "comisioane", "lichiditate"],
  },
  educatie: {
    intro:
      "Pentru cursuri sau studii planifici o sumă pe un orizont scurt sau mediu. Vezi cât din valoare pierzi din cauza inflației și cum compari corect opțiunile de economisire.",
    modules: ["inflatia", "randament-real", "lichiditate"],
  },
  pensie: {
    intro:
      "Pe termen lung, timpul lucrează pentru sau împotriva ta. Contează diversificarea, costurile și randamentul net real; ETF-urile sunt una dintre opțiunile pe care merită să le înțelegi.",
    modules: ["diversificare", "etf", "comisioane", "taxe", "randament-real"],
  },
  altul: {
    intro:
      "Indiferent pentru ce economisești, bazele sunt aceleași: cum te afectează inflația, cum îți protejezi banii de fraude și de ce nu pui totul într-un singur loc.",
    modules: ["inflatia", "fraude", "diversificare"],
  },
};
