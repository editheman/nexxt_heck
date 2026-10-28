import { expect, test, type Page } from "@playwright/test";

const state = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("pcac:v1") ?? "null"));

test("guided profiling: profil → Reality Check → interese → simulator → portal", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (!isMobile) await expect(page.getByRole("navigation", { name: "Navigare principală" })).toHaveCount(0);

  await page.goto("/profil");
  await page.getByLabel("Cum să-ți spunem").fill("Ana");
  await page.getByRole("button", { name: "Continuă spre datele financiare" }).click();
  await page.getByLabel("Economii actuale").fill("20.000");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();

  await expect(page).toHaveURL(/\/reality-check$/);
  await expect(page.getByText("Profilare · Pasul 2 din 4")).toBeVisible();
  await page.getByRole("link", { name: /Alege ce vrei să înveți/ }).click();

  await expect(page).toHaveURL(/\/interese$/);
  await expect(page.getByText("Profilare · Pasul 3 din 4")).toBeVisible();
  await page.getByRole("button", { name: "Salvează și continuă spre simulator" }).click();
  await expect(page.getByText("Alege cel puțin o temă")).toBeVisible();
  await page.getByText("Investiții prin ETF-uri").click();
  await page.getByText("Protecție anti-fraudă").click();
  await page.getByRole("button", { name: "Salvează și continuă spre simulator" }).click();

  await expect(page).toHaveURL(/\/simulator$/);
  await expect(page.getByText("Profilare · Pasul 4 din 4")).toBeVisible();
  // Fraude and Învață are no longer steps of the chain.
  await expect(page.getByRole("link", { name: /Exersează: recunoaște o fraudă/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Finalizează și deschide portalul" }).click();

  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bună, Ana!");
  await expect(page.getByTestId("portal-interests")).toContainText("Investiții prin ETF-uri");
  const rec = page.getByTestId("portal-recommended");
  await expect(rec.getByRole("link")).toHaveCount(2);
  await expect(rec).toContainText("Ce înseamnă să investești în ETF-uri");
  await expect(rec).toContainText("Cum recunoști o fraudă financiară");
  await expect(page.getByTestId("portal-learn")).toBeVisible();
  await expect(page.getByTestId("portal-scams")).toBeVisible();

  const s = await state(page);
  expect(s.interests).toEqual(["etf", "fraude"]);
  expect(s.onboarding.completedAt).not.toBeNull();

  // After profiling: nav is visible and pages are not chained.
  if (!isMobile) await expect(page.getByRole("navigation", { name: "Navigare principală" })).toBeVisible();
  await page.getByTestId("portal-reality").click();
  await expect(page).toHaveURL(/\/reality-check$/);
  await expect(page.getByText(/Pasul 2 din 4/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Portalul tău" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Înapoi în portalul tău/ })).toBeVisible();
});

test("interests are editable from the portal and persist across reloads", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "pcac:v1",
      JSON.stringify({
        version: 4,
        profile: { alias: "Ion", savings: 1000, placement: "numerar", nominalPct: 0, monthly: 0, years: 5, goal: "altul", ageRange: null, isDemo: false },
        interests: ["etf"],
        onboarding: { completedAt: "2026-10-28T10:00:00.000Z" },
      }),
    ),
  );
  await page.goto("/portal");
  await page.getByRole("link", { name: "Modifică interesele" }).click();
  await expect(page).toHaveURL(/\/interese$/);
  await expect(page.getByRole("checkbox", { name: /Investiții prin ETF-uri/ })).toBeChecked();
  await page.getByText("Fond de urgență").click();
  await page.getByRole("button", { name: "Salvează interesele" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await page.reload();
  await expect(page.getByTestId("portal-recommended")).toContainText("Lichiditatea și fondul de urgență");
  expect((await state(page)).interests).toEqual(["etf", "fond-urgenta"]);
});

test("home CTA opens the portal once profiling is done", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("pcac:v1", JSON.stringify({ version: 4, onboarding: { completedAt: "2026-10-28T10:00:00.000Z" } })),
  );
  await page.reload();
  await page.getByRole("link", { name: "Deschide portalul tău" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole("link", { name: "Începe profilarea" })).toBeVisible();
});
