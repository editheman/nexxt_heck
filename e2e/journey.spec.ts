import { expect, test, type Page } from "@playwright/test";
import { PASSWORD } from "./helpers";

async function freshStart(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
}

test("full journey persists across reloads", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await freshStart(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Începe demo-ul" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Sari peste" }).click();
  await expect(page).toHaveURL(/\/profil$/);

  // Profile, step 1 (create the account) → step 2
  await page.getByLabel("Nume de utilizator").fill("ana");
  await page.getByLabel("Parolă", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirmă parola").fill(PASSWORD);
  await page.getByRole("button", { name: "Creează contul și continuă" }).click();
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 2 din 2: Banii tăi");
  await page.getByLabel("Economii actuale").fill("20.000");
  await page.getByLabel("Cât pui deoparte lunar").fill("0");
  await page.getByLabel("Orizont de timp").fill("10");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();

  // Reality Check on official INS data, default window: last 5 years (2021–2025, base 2020).
  // 20.000 / (1,0505 · 1,138 · 1,104 · 1,0559 · 1,0732) ≈ 13.373
  await expect(page).toHaveURL(/\/reality-check$/);
  await expect(page.getByTestId("stat-nominal")).toHaveText("20.000 lei");
  await expect(page.getByTestId("stat-inflation")).toHaveText("+49,6%");
  // The window picker and the result cards describe the same period (base year → latest year).
  await expect(page.getByLabel("Ultimii 5 ani (2020–2025)")).toBeChecked();
  await expect(page.getByText("Cât au crescut prețurile, 2020–2025")).toBeVisible();
  await expect(page.getByTestId("stat-real")).toHaveText("13.373 lei");
  await expect(page.getByTestId("reality-loss")).toHaveText("6.627 lei");
  await expect(page.getByTestId("equivalents")).toContainText("1 iPhone de ultimă generație");
  await expect(page.getByTestId("equivalents")).toContainText("2 luni de chirie");
  await expect(page.getByTestId("reality-eur")).toContainText("4.135 €");
  // No editable inflation on this page.
  await expect(page.getByLabel(/Inflație/)).toHaveCount(0);

  // Changing the window updates the loss and the comparisons.
  await page.locator("label", { hasText: "Ultimii 3 ani (2022–2025)" }).click();
  await expect(page.getByTestId("stat-real")).toHaveText("15.987 lei");
  await expect(page.getByTestId("reality-loss")).toHaveText("4.013 lei");
  await expect(page.getByTestId("equivalents")).toContainText("10 plinuri de benzină");
  await page.locator("label", { hasText: "Ultimii 10 ani (2015–2025)" }).click();
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
  await expect(page.getByTestId("modules-read")).toHaveText("1/8");
  await expect(page.getByRole("row", { name: /Inflația și puterea de cumpărare/ })).toContainText("4/4 · trecut");
  const percent = Number((await page.getByTestId("progress-percent").textContent())!.replace("%", ""));
  expect(percent).toBeGreaterThan(0);

  await page.goto("/reality-check");
  await page.reload();
  await expect(page.getByLabel("Ultimii 10 ani (2015–2025)")).toBeChecked();
  await expect(page.getByTestId("stat-real")).toHaveText("12.022 lei");

  expect(errors).toEqual([]);
});

test("profile validation shows an error summary and inline errors", async ({ page }) => {
  await freshStart(page);
  await page.goto("/profil");
  await page.getByLabel("Nume de utilizator").fill("ana");
  await page.getByLabel("Parolă", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirmă parola").fill(PASSWORD);
  await page.getByRole("button", { name: "Creează contul și continuă" }).click();
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
  await expect(page.getByLabel("Ultimii 5 ani (2020–2025)")).toBeChecked();
  await expect(page.getByTestId("stat-real")).toHaveText("13.373 lei");
  await page.getByRole("radio", { name: /Ultimii 3 ani/ }).check({ force: true });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pcac:v1")!));
  expect(saved.version).toBe(5);
  expect(saved.profile.ageRange).toBeNull();
  expect(saved.reality.years).toBe(3);
  await page.goto("/progres");
  await expect(page.getByTestId("modules-read")).toHaveText("1/8");
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
  // The menu exists only after the guided profiling is finished.
  await expect(page.getByRole("button", { name: "Meniu" })).toHaveCount(0);
  await page.evaluate(() =>
    localStorage.setItem("pcac:v1", JSON.stringify({ version: 5, onboarding: { completedAt: "2026-10-28T10:00:00.000Z" } })),
  );
  await page.reload();
  await page.getByRole("button", { name: "Meniu" }).click();
  await page.locator("#mobile-nav").getByRole("link", { name: "Progres" }).click();
  await expect(page).toHaveURL(/\/progres$/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("home is a single screen with working pillar links", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Învață azi. Decide informat.");
  await expect(page.locator("footer")).toHaveCount(0);
  if (!isMobile) {
    const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 1);
    expect(scrolls).toBe(false);
  }
  const pillars = page.getByRole("navigation", { name: "Teme principale" });
  await expect(pillars.getByRole("link")).toHaveCount(3);
  await pillars.getByRole("link", { name: /Protecție anti-fraudă/ }).click();
  await expect(page).toHaveURL(/\/fraude$/);
  await expect(page.locator("footer")).toHaveCount(1);
});
