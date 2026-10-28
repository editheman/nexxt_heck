import { expect, test } from "@playwright/test";
import { PASSWORD, clearStorage, createAccount, finishProfiling, openAccountMenu } from "./helpers";

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test("account menu: login/sign-up when logged out, portal/logout when logged in", async ({ page, isMobile }) => {
  let menu = await openAccountMenu(page);
  await expect(menu.getByRole("link", { name: "Intră în cont" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Creează cont" })).toBeVisible();
  await expect(menu.getByText("Deconectare")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);

  await createAccount(page, "ana");
  await finishProfiling(page, { goal: "pensie" });

  menu = await openAccountMenu(page);
  await expect(menu).toContainText("Conectat ca ana");
  await expect(menu.getByRole("link", { name: "Portalul meu" })).toBeVisible();
  await menu.getByRole("button", { name: "Deconectare" }).click();

  await expect(page).toHaveURL(/\/$/);
  if (!isMobile) await expect(page.getByRole("navigation", { name: "Navigare principală" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Începe demo-ul" })).toBeVisible();
  await page.goto("/portal");
  await expect(page.getByTestId("portal-login")).toBeVisible();
  await expect((await openAccountMenu(page)).getByText("Conectat ca")).toHaveCount(0);
});

test("login: wrong password is rejected generically, the right one restores the same data", async ({ page }) => {
  await createAccount(page, "ana");
  await finishProfiling(page, { goal: "pensie" });
  await page.goto("/invata/etf");
  await page.getByRole("button", { name: "Am citit — fac quiz-ul" }).click();
  await expect(page).toHaveURL(/\/invata\/etf\/quiz$/);
  await (await openAccountMenu(page)).getByRole("button", { name: "Deconectare" }).click();

  await page.goto("/intra");
  await page.getByLabel("Nume de utilizator").fill("ana");
  await page.getByLabel("Parolă", { exact: true }).fill("gresita123");
  await page.getByRole("button", { name: "Intră în cont" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "greșită" })).toHaveText("Nume de utilizator sau parolă greșită.");
  await expect(page.getByLabel("Parolă", { exact: true })).toHaveValue("");

  await page.getByLabel("Nume de utilizator").fill("nimeni");
  await page.getByLabel("Parolă", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Intră în cont" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "greșită" })).toHaveText("Nume de utilizator sau parolă greșită.");

  await page.getByLabel("Nume de utilizator").fill("ANA");
  await page.getByLabel("Parolă", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Intră în cont" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByTestId("portal-goal")).toHaveText("Pensie / termen lung");
  await page.goto("/progres");
  await expect(page.getByTestId("modules-read")).toHaveText("1/8");
});

test("a second account sees none of the first account's data; usernames are unique", async ({ page }) => {
  await createAccount(page, "ana");
  await finishProfiling(page, { savings: "50.000", goal: "pensie" });
  await (await openAccountMenu(page)).getByRole("button", { name: "Deconectare" }).click();

  await page.goto("/profil");
  await page.getByLabel("Nume de utilizator").fill("Ana");
  await page.getByLabel("Parolă", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirmă parola").fill(PASSWORD);
  await page.getByRole("button", { name: "Creează contul și continuă" }).click();
  await expect(page.getByText("Acest nume de utilizator este deja folosit în acest browser.")).toBeVisible();

  await createAccount(page, "ion");
  await page.goto("/reality-check");
  await expect(page.getByRole("heading", { name: "Mai întâi, un profil minim" })).toBeVisible();
  await page.goto("/portal");
  await expect(page.getByText("Mai ai de completat profilul")).toBeVisible();
});

test("progress made before signing up moves into the new account", async ({ page }) => {
  await page.goto("/invata/inflatia");
  await page.getByRole("button", { name: "Am citit — fac quiz-ul" }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await createAccount(page, "ana");
  await page.goto("/progres");
  await expect(page.getByTestId("modules-read")).toHaveText("1/8");
  await (await openAccountMenu(page)).getByRole("button", { name: "Deconectare" }).click();
  await page.goto("/progres");
  await expect(page.getByTestId("modules-read")).toHaveText("0/8");
});

test("already logged in: /intra offers the portal and logout", async ({ page }) => {
  await createAccount(page, "ana");
  await page.goto("/intra");
  await expect(page.getByText("Ești conectat ca")).toContainText("ana");
  await page.getByRole("button", { name: "Deconectare" }).click();
  await expect(page).toHaveURL(/\/$/);
});
