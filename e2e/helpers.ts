import { expect, type Page } from "@playwright/test";

export const PASSWORD = "parola123";

/** Fills onboarding step 1 as a new account and creates it. Lands on step 2. */
export async function createAccount(page: Page, username = "ana", password = PASSWORD) {
  await page.goto("/profil");
  await page.getByLabel("Nume de utilizator").fill(username);
  await page.getByLabel("Parolă", { exact: true }).fill(password);
  await page.getByLabel("Confirmă parola").fill(password);
  await page.getByRole("button", { name: "Creează contul și continuă" }).click();
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 2 din 2: Banii tăi");
}

/** Step 2 → Reality Check → simulator → portal. */
export async function finishProfiling(page: Page, { savings = "20.000", goal }: { savings?: string; goal?: string } = {}) {
  await page.getByLabel("Economii actuale").fill(savings);
  if (goal) await page.getByLabel("Obiectivul principal").selectOption(goal);
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();
  await expect(page).toHaveURL(/\/reality-check$/);
  await page.getByRole("link", { name: /Mergi mai departe la simulare/ }).click();
  await expect(page).toHaveURL(/\/simulator$/);
  await page.getByRole("button", { name: "Finalizează și deschide portalul" }).click();
  await expect(page).toHaveURL(/\/portal$/);
}

export async function clearStorage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** Reads a per-account key (e.g. "subscriber:v1") for the logged-in account. */
export function accountItem(page: Page, name: string) {
  return page.evaluate((n) => {
    const s = JSON.parse(localStorage.getItem("pcac:session:v1") ?? "null");
    const key = s ? `pcac:acct:${s.accountId}:${n}` : `pcac:${n}`;
    return JSON.parse(localStorage.getItem(key) ?? "null");
  }, name);
}

export async function openAccountMenu(page: Page) {
  await page.getByRole("button", { name: /^(Cont|Contul tău)/ }).click();
  return page.locator("#account-menu");
}
