import { expect, test, type Page } from "@playwright/test";
import { createAccount } from "./helpers";

function seed(page: Page, goal: string) {
  return page.evaluate((g) => {
    localStorage.setItem(
      "pcac:v1",
      JSON.stringify({
        version: 5,
        profile: { alias: "Ion", savings: 1000, placement: "numerar", nominalPct: 0, monthly: 0, years: 5, goal: g, ageRange: null, isDemo: false },
        onboarding: { completedAt: "2026-10-28T10:00:00.000Z" },
      }),
    );
  }, goal);
}

test("guided profiling: profil → Reality Check → simulator → portal, personalised by goal", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (!isMobile) await expect(page.getByRole("navigation", { name: "Navigare principală" })).toHaveCount(0);

  await createAccount(page, "Ana");
  await page.getByLabel("Economii actuale").fill("20.000");
  await page.getByLabel("Obiectivul principal").selectOption("pensie");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();

  await expect(page).toHaveURL(/\/reality-check$/);
  await expect(page.getByText("Profilare · Pasul 2 din 3")).toBeVisible();
  await page.getByRole("link", { name: /Proiectează viitorul în simulator/ }).click();

  await expect(page).toHaveURL(/\/simulator$/);
  await expect(page.getByText("Profilare · Pasul 3 din 3")).toBeVisible();
  await page.getByRole("button", { name: "Finalizează și deschide portalul" }).click();

  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bună, Ana!");
  await expect(page.getByTestId("portal-goal")).toHaveText("Pensie / termen lung");
  await expect(page.getByTestId("portal-recommended")).toContainText("Ce înseamnă să investești în ETF-uri");
  await expect(page.getByTestId("portal-learn")).toBeVisible();
  await expect(page.getByTestId("portal-scams")).toHaveCount(0);

  // After profiling the pages are not chained.
  await page.getByTestId("portal-reality").click();
  await expect(page.getByText(/Pasul 2 din 3/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Înapoi în portalul tău/ })).toBeVisible();

  // The interests page is gone.
  const res = await page.goto("/interese");
  expect(res?.status()).toBe(404);
});

test("Învață shows a different learning path for each savings goal", async ({ page }) => {
  await page.goto("/");
  await seed(page, "fond-urgenta");
  await page.goto("/invata");
  const path = page.getByTestId("goal-path");
  await expect(page.getByTestId("goal-title")).toHaveText("Fond de urgență");
  await expect(path.locator('a[href^="/invata/"]').first()).toContainText("Lichiditatea și fondul de urgență");
  await expect(path).not.toContainText("ETF");

  await seed(page, "pensie");
  await page.reload();
  await expect(page.getByTestId("goal-title")).toHaveText("Pensie / termen lung");
  await expect(path.locator('a[href^="/invata/"]').first()).toContainText("Diversificarea riscului");
  await expect(path).toContainText("Ce înseamnă să investești în ETF-uri");
  // Everything else stays available below.
  await expect(page.getByRole("heading", { name: "Alte module" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Lichiditatea și fondul de urgență/ })).toBeVisible();
});

test("without a profile Învață lists all modules and asks for the goal", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/invata");
  await expect(page.getByTestId("goal-path")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Completează profilul" })).toBeVisible();
  await expect(page.locator('a[href^="/invata/"]')).toHaveCount(8);
});
