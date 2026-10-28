import { expect, test, type Page } from "@playwright/test";

async function freshStart(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
}

test("full journey persists across reloads", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await freshStart(page);
  // The home funnel has its own test below; this journey uses the detailed profile.
  await page.goto("/profil");

  // Profile
  await page.getByLabel("Economii actuale").fill("20.000");
  await page.getByLabel("Venit net lunar aproximativ (opțional)").fill("5.000");
  await page.getByLabel("Cât pui deoparte lunar").fill("0");
  await page.getByLabel("Orizont de timp").fill("10");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();

  // Reality Check on official INS data, default window: last 5 years (2021–2025, base 2020).
  // 20.000 / (1,0505 · 1,138 · 1,104 · 1,0559 · 1,0732) ≈ 13.373
  await expect(page).toHaveURL(/\/reality-check$/);
  await expect(page.getByTestId("stat-nominal")).toHaveText("20.000 lei");
  await expect(page.getByTestId("stat-inflation")).toHaveText("+49,6%");
  await expect(page.getByTestId("stat-real")).toHaveText("13.373 lei");
  await expect(page.getByTestId("reality-loss")).toHaveText("6.627 lei");
  await expect(page.getByTestId("equivalents")).toContainText("1 iPhone de ultimă generație");
  await expect(page.getByTestId("equivalents")).toContainText("2 luni de chirie");
  await expect(page.getByTestId("reality-eur")).toContainText("4.135 €");
  // 6.627 / 5.000 ≈ 1,3
  await expect(page.getByTestId("reality-income")).toContainText("1,3 venituri nete lunare");
  // No editable inflation on this page.
  await expect(page.getByLabel(/Inflație/)).toHaveCount(0);

  // Changing the window updates the loss and the comparisons.
  await page.locator("label", { hasText: "Ultimii 3 ani (2023–2025)" }).click();
  await expect(page.getByTestId("stat-real")).toHaveText("15.987 lei");
  await expect(page.getByTestId("reality-loss")).toHaveText("4.013 lei");
  await expect(page.getByTestId("equivalents")).toContainText("10 plinuri de benzină");
  await page.locator("label", { hasText: "Ultimii 10 ani (2016–2025)" }).click();
  await expect(page.getByTestId("stat-real")).toHaveText("12.022 lei");
  await expect(page.getByTestId("reality-explanation")).toContainText("din 2015 până în 2025");
  await expect(page.getByTestId("equivalents")).toContainText("3 luni de chirie");

  // Simulator seeds from profile + illustrative 5% assumption: 20.000 / 1,05^10 ≈ 12.278
  await page.goto("/simulator");
  await expect(page.getByTestId("sim-real")).toHaveText("12.278 lei");
  await page.getByRole("button", { name: "Randament egal cu inflația" }).click();
  await expect(page.getByTestId("sim-real")).toHaveText("20.000 lei");
  await expect(page.getByTestId("sim-explanation")).toContainText("aproximativ aceeași putere de cumpărare");
  await page.getByRole("button", { name: "Vezi tabelul" }).click();
  await expect(page.getByRole("table")).toContainText("Putere de cumpărare (lei de azi)");

  // Scam scenario
  await page.goto("/fraude");
  await page.getByRole("button", { name: "Linkul necunoscut și termenul de 24h" }).click();
  await expect(page.getByText("Corect", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continuă" }).click();
  await page.getByRole("button", { name: /Verific în aplicația sau pe site-ul oficial/ }).click();
  await page.getByRole("button", { name: "Vezi rezumatul" }).click();
  await expect(page.getByRole("heading", { name: /Rezumat: 2 din 2/ })).toBeVisible();

  // Module + quiz with one wrong answer
  await page.goto("/invata/inflatia");
  await page.getByRole("button", { name: "Am citit — fac quiz-ul" }).click();
  await expect(page).toHaveURL(/\/invata\/inflatia\/quiz$/);

  await page.getByRole("button", { name: "Cât câștigă o bancă din dobânzi" }).click();
  await expect(page.getByTestId("quiz-feedback")).toContainText("Incorect");
  await expect(page.getByTestId("quiz-feedback")).toContainText("Răspunsul corect");
  await page.getByRole("button", { name: "Întrebarea următoare" }).click();
  await page.getByRole("button", { name: "Rămâne 10.000 lei" }).click();
  await page.getByRole("button", { name: "Întrebarea următoare" }).click();
  await page.getByRole("button", { name: /Pentru că efectul se compune/ }).click();
  await page.getByRole("button", { name: "Întrebarea următoare" }).click();
  await page.getByRole("button", { name: /structura cheltuielilor tale/ }).click();
  await page.getByRole("button", { name: "Vezi rezultatul" }).click();

  await expect(page.getByTestId("quiz-score")).toHaveText("Scor: 3 din 4");
  await expect(page.getByRole("link", { name: "Recitește: Ce este inflația" })).toHaveAttribute("href", "/invata/inflatia#ce-este");

  // Adaptive retry asks only the missed question
  await page.getByRole("button", { name: /Reia doar întrebările greșite \(1\)/ }).click();
  await expect(page.getByText("Reluare · Întrebarea 1 din 1")).toBeVisible();
  await page.getByRole("button", { name: "Creșterea generală a prețurilor într-o perioadă" }).click();
  await page.getByRole("button", { name: "Vezi rezultatul" }).click();
  await expect(page.getByTestId("quiz-score")).toHaveText("Scor: 4 din 4");

  // Persistence
  await page.goto("/progres");
  await page.reload();
  await expect(page.getByTestId("modules-read")).toHaveText("1/7");
  await expect(page.getByRole("row", { name: /Inflația și puterea de cumpărare/ })).toContainText("4/4 · trecut");
  const percent = Number((await page.getByTestId("progress-percent").textContent())!.replace("%", ""));
  expect(percent).toBeGreaterThan(0);

  await page.goto("/reality-check");
  await page.reload();
  await expect(page.getByLabel("Ultimii 10 ani (2016–2025)")).toBeChecked();
  await expect(page.getByTestId("stat-real")).toHaveText("12.022 lei");

  expect(errors).toEqual([]);
});

test("profile validation shows an error summary and inline errors", async ({ page }) => {
  await freshStart(page);
  await page.goto("/profil");
  await page.getByLabel("Orizont de timp").fill("2,5");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "Verifică" });
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(page.getByText("Introdu suma aproximativă a economiilor (poate fi 0).").first()).toBeVisible();
  await expect(page.getByText("Introdu un număr întreg de ani.").first()).toBeVisible();
  await expect(page).toHaveURL(/\/profil$/);
});

test("deep links without a profile and unknown modules are handled", async ({ page }) => {
  await freshStart(page);
  await page.goto("/reality-check");
  await expect(page.getByRole("heading", { name: "Mai întâi, un profil minim" })).toBeVisible();
  await page.getByRole("button", { name: "Folosește un profil exemplu" }).first().click();
  await expect(page.getByText("Exemplu fictiv").first()).toBeVisible();
  await expect(page.getByTestId("stat-nominal")).toBeVisible();

  const res = await page.goto("/invata/nu-exista");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Pagina nu există" })).toBeVisible();
});

test("schema-v1 saved data is migrated in place under pcac:v1", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      "pcac:v1",
      JSON.stringify({
        version: 1,
        profile: { alias: "", savings: 20000, placement: "numerar", nominalPct: 0, monthly: 0, years: 10, goal: "altul", isDemo: false },
        assumptions: { inflationPct: 5 },
        progress: { visited: {}, scams: {}, modulesRead: { inflatia: true }, quizzes: {} },
      }),
    );
  });
  await page.goto("/reality-check");
  await expect(page.getByLabel("Ultimii 5 ani (2021–2025)")).toBeChecked();
  await expect(page.getByTestId("stat-real")).toHaveText("13.373 lei");
  await page.getByRole("radio", { name: /Ultimii 3 ani/ }).check({ force: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pcac:v1")!));
  expect(saved.version).toBe(2);
  expect(saved.reality.years).toBe(3);
  expect(saved.profile.income).toBeNull();
  await page.goto("/progres");
  await expect(page.getByTestId("modules-read")).toHaveText("1/7");
});

test("corrupt saved data falls back to defaults", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pcac:v1", "{not json"));
  await page.goto("/progres");
  await expect(page.getByTestId("progress-percent")).toHaveText("0%");
});

test("reset clears progress after confirmation", async ({ page }) => {
  await freshStart(page);
  await page.goto("/reality-check");
  await page.getByRole("button", { name: "Folosește un profil exemplu" }).first().click();
  await page.goto("/progres");
  await page.getByRole("button", { name: "Resetează demo-ul" }).click();
  await page.getByRole("button", { name: "Da, șterge" }).click();
  await expect(page.getByText("Demo resetat")).toBeVisible();
  await expect(page.getByTestId("progress-percent")).toHaveText("0%");
});

test("mobile menu navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Meniu" }).click();
  await page.locator("#mobile-nav").getByRole("link", { name: "Progres" }).click();
  await expect(page).toHaveURL(/\/progres$/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("home funnel: industry chip → insight → inline sliders → Reality Check, no modals", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await freshStart(page);
  await page.goto("/");

  await expect(page.getByTestId("macro-ticker").getByRole("listitem")).toHaveCount(5);
  await expect(page.getByTestId("macro-ticker")).toContainText("7,32%");
  await expect(page.getByTestId("sector-insight")).toHaveCount(0);

  await page.getByText("HoReCa", { exact: true }).click();
  await expect(page.getByTestId("sector-stat")).toHaveText("3.396 lei");
  await expect(page.getByTestId("sector-insight")).toContainText("12 cafele de specialitate");

  await page.getByText("IT & Tech", { exact: true }).click();
  await expect(page.getByTestId("sector-stat")).toHaveText("11.810 lei");

  const reveal = page.getByRole("button", { name: "Vrei să vezi calculul exact pe buzunarul tău?" });
  await expect(reveal).toHaveAttribute("aria-expanded", "false");
  await reveal.click();
  await expect(reveal).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("quick-calc")).toBeVisible();

  await page.getByLabel("Venit net lunar", { exact: true }).fill("4.000");
  await page.getByLabel("Economii în numerar sau cont curent", { exact: true }).fill("10.000");
  // 10.000 − 10.000 / 1,49558 ≈ 3.314; / 4.000 ≈ 83%
  await expect(page.getByTestId("quick-loss")).toHaveText("3.314 lei");
  await expect(page.getByTestId("quick-result")).toContainText("83% dintr-un venit net lunar");
  await expect(page.getByTestId("quick-result")).toContainText("8 plinuri de benzină");

  // Clearing a field hides the result and disables the CTA instead of using a stale value.
  await page.getByLabel("Economii în numerar sau cont curent", { exact: true }).fill("");
  await expect(page.getByTestId("quick-result")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Vezi calculul complet" })).toBeDisabled();
  await page.getByLabel("Economii în numerar sau cont curent", { exact: true }).fill("10.000");

  await expect(page.locator("dialog[open], [role=dialog]")).toHaveCount(0);

  await page.getByRole("button", { name: "Vezi calculul complet" }).click();
  await expect(page).toHaveURL(/\/reality-check$/);
  await expect(page.getByTestId("stat-nominal")).toHaveText("10.000 lei");
  await expect(page.getByTestId("reality-loss")).toHaveText("3.314 lei");
  await expect(page.getByTestId("reality-income")).toContainText("83% dintr-un venit net lunar");

  // Industry choice persists.
  await page.goto("/");
  await expect(page.getByRole("radio", { name: "IT & Tech" })).toBeChecked();
  await expect(page.getByTestId("sector-stat")).toHaveText("11.810 lei");
  expect(errors).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("friends comparison shares only educational progress", async ({ page }) => {
  await freshStart(page);
  await page.goto("/progres");

  await page.getByRole("button", { name: "Activează comparația" }).click();
  await expect(page.getByText("Alege un alias de 2–24 caractere.")).toBeVisible();
  await page.getByLabel("Aliasul tău").fill("Ana");
  await page.getByRole("button", { name: "Activează comparația" }).click();

  const code = await page.getByTestId("my-friend-code").inputValue();
  const payload = JSON.parse(Buffer.from(code.replace("PCAC1.", ""), "base64url").toString("utf8"));
  expect(Object.keys(payload).sort()).toEqual(["a", "m", "p", "q", "s"]);
  expect(payload.a).toBe("Ana");

  await page.getByLabel("Adaugă codul unui prieten").fill("ceva greșit");
  await page.getByRole("button", { name: "Adaugă", exact: true }).click();
  await expect(page.getByText("Codul nu este valid.", { exact: false })).toBeVisible();

  const friend = "PCAC1." + Buffer.from(JSON.stringify({ a: "Mihai", p: 60, m: 3, q: 2, s: 1 })).toString("base64url");
  await page.getByLabel("Adaugă codul unui prieten").fill(friend);
  await page.getByRole("button", { name: "Adaugă", exact: true }).click();
  const table = page.getByTestId("friends-table");
  await expect(table.getByRole("row", { name: /Mihai/ })).toContainText("60%");
  await expect(table.getByRole("row", { name: /Ana \(tu\)/ })).toContainText("0%");

  await page.reload();
  await expect(page.getByTestId("friends-table").getByRole("row", { name: /Mihai/ })).toBeVisible();
  await page.getByRole("button", { name: "Elimină Mihai" }).click();
  await expect(page.getByTestId("friends-table").getByRole("row", { name: /Mihai/ })).toHaveCount(0);
});
