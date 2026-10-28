import { expect, test } from "@playwright/test";
import { clearStorage, createAccount, finishProfiling } from "./helpers";

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test("choose methods as drafts, confirm one, re-profile and keep the old set in history", async ({ page }) => {
  await createAccount(page, "ana");
  await finishProfiling(page, { goal: "pensie" });
  await expect(page.getByTestId("portal-methods-counts")).toHaveText("0 în draft · 0 folosite");

  await page.goto("/recomandari");
  await page.getByRole("group", { name: /fond de urgență/ }).getByRole("button", { name: "Da", exact: true }).click();
  await page.getByRole("button", { name: "Aș aștepta liniștit" }).click();
  await page.getByRole("button", { name: "Generează recomandările" }).click();
  await expect(page.getByTestId("recommendations")).toBeVisible();

  // Pick two methods; picking again un-picks a draft.
  await page.getByTestId("choose-etf-global").click();
  await expect(page.getByTestId("choose-etf-global")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("choose-pilon3").click();
  const third = page.getByTestId("recommendations").locator('[data-testid^="choose-"]').nth(2);
  await third.click();
  await expect(third).toHaveAttribute("aria-pressed", "true");
  await third.click();
  await expect(third).toHaveAttribute("aria-pressed", "false");

  // The set survives a reload without regenerating.
  await page.reload();
  await expect(page.getByTestId("choose-pilon3")).toHaveAttribute("aria-pressed", "true");

  await page.goto("/portal");
  await expect(page.getByTestId("portal-methods-counts")).toHaveText("2 în draft · 0 folosite");
  await page.getByTestId("portal-methods").click();
  await expect(page).toHaveURL(/\/metode$/);

  await page.getByTestId("confirm-pilon3").click();
  await expect(page.getByTestId("methods-used").getByTestId("method-pilon3")).toBeVisible();
  await expect(page.getByTestId("methods-drafts").getByTestId("method-etf-global")).toBeVisible();
  await expect(page.getByText("Nu ai încă un istoric.")).toBeVisible();

  // Re-profile: change the goal → the saved set is out of date until regenerated.
  await page.goto("/profil");
  await page.getByRole("button", { name: "Continuă spre datele financiare" }).click();
  await page.getByLabel("Obiectivul principal").selectOption("locuinta");
  await page.getByLabel("Orizont de timp").fill("4");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await page.goto("/recomandari");
  await expect(page.getByTestId("stale-notice")).toBeVisible();
  await expect(page.getByTestId("choose-etf-global")).toHaveCount(0);
  await page.getByRole("button", { name: "Generează din nou" }).click();
  await expect(page.getByTestId("stale-notice")).toHaveCount(0);
  await page.getByTestId("choose-tezaur").click();

  await page.goto("/metode");
  await page.reload();
  const current = page.getByTestId("methods-current");
  await expect(current).toContainText("Avans pentru o locuință");
  await expect(current.getByTestId("method-tezaur")).toBeVisible();
  await expect(current.getByTestId("method-pilon3")).toHaveCount(0);
  const hist = page.getByTestId("methods-history");
  await expect(hist).toContainText("Pensie / termen lung");
  await expect(hist.getByText("Folosită")).toBeVisible();
  await expect(hist.getByText("Draft")).toBeVisible();

  await page.goto("/portal");
  await expect(page.getByTestId("portal-methods-counts")).toHaveText("1 în draft · 0 folosite · 1 profil anterior în istoric");
});

test("un-confirm and remove only affect the current set; empty and logged-out states", async ({ page }) => {
  await page.goto("/metode");
  await expect(page.getByRole("link", { name: "Intră în cont" }).last()).toBeVisible();

  await createAccount(page, "ion");
  await finishProfiling(page, { goal: "pensie" });
  await page.goto("/metode");
  await expect(page.getByTestId("methods-empty")).toBeVisible();

  await page.goto("/recomandari");
  await page.getByRole("button", { name: "Generează recomandările" }).click();
  await page.getByTestId("choose-pilon3").click();
  await page.goto("/metode");
  await page.getByTestId("confirm-pilon3").click();
  await page.getByRole("button", { name: "Nu o mai folosesc" }).click();
  await expect(page.getByTestId("methods-drafts").getByTestId("method-pilon3")).toBeVisible();
  await page.getByRole("button", { name: /Scoate Fond de pensii/ }).click();
  await expect(page.getByText("Nu ai ales încă nicio metodă")).toBeVisible();
});
