import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, accountItem, clearStorage } from "./helpers";

const next = (page: Page) => page.getByRole("button", { name: "Creează contul și continuă" }).click();

async function credentials(page: Page, username = "ana", password = PASSWORD, confirm = password) {
  await page.getByLabel("Nume de utilizator").fill(username);
  await page.getByLabel("Parolă", { exact: true }).fill(password);
  await page.getByLabel("Confirmă parola").fill(confirm);
}

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
  await page.goto("/profil");
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 1 din 2: Cine ești?");
});

test("step 1 requires a username and a valid, confirmed password; the page has no footer", async ({ page }) => {
  await expect(page.locator("footer")).toHaveCount(0);
  await next(page);
  await expect(page.getByText("Alege un nume de utilizator.")).toBeVisible();
  await expect(page.getByLabel("Nume de utilizator")).toBeFocused();

  await credentials(page, "ana", "scurt1", "altceva");
  await next(page);
  await expect(page.getByText("Parola trebuie să aibă cel puțin 8 caractere.")).toBeVisible();
  await expect(page.getByText("Parolele nu coincid.")).toBeVisible();
  await expect(page.getByLabel("Parolă", { exact: true })).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem("pcac:accounts:v1"))).toBeNull();
});

test("the password can be shown and hidden", async ({ page }) => {
  const field = page.getByLabel("Parolă", { exact: true });
  await expect(field).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Arată parola" }).first().click();
  await expect(field).toHaveAttribute("type", "text");
});

test("creating the account stores a hash, never the password, and logs in", async ({ page }) => {
  await credentials(page);
  await next(page);
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 2 din 2: Banii tăi");
  const raw = await page.evaluate(() => JSON.stringify(localStorage));
  expect(raw).not.toContain(PASSWORD);
  const accounts = await page.evaluate(() => JSON.parse(localStorage.getItem("pcac:accounts:v1")!));
  expect(accounts).toHaveLength(1);
  expect(accounts[0]).toMatchObject({ username: "ana", iterations: 600000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pcac:session:v1")!).accountId)).toBe(accounts[0].id);
});

test("email is optional; without consent it is rejected and nothing is stored", async ({ page }) => {
  await credentials(page);
  await page.getByLabel("Adresă de e-mail").fill("ana@exemplu.ro");
  const consent = page.getByRole("checkbox");
  await expect(consent).not.toBeChecked();
  await next(page);
  await expect(page.getByText("Bifează acordul pentru digest sau lasă adresa de e-mail goală.")).toBeVisible();
  await expect(consent).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem("pcac:accounts:v1"))).toBeNull();
});

test("email with explicit consent subscribes under the new account (source: onboarding)", async ({ page }) => {
  await credentials(page);
  await page.getByLabel("Adresă de e-mail").fill("ana@exemplu.ro");
  await page.getByRole("checkbox").check();
  await next(page);
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 2 din 2: Banii tăi");
  expect((await accountItem(page, "subscriber:v1")).email).toBe("ana@exemplu.ro");
  const log = await accountItem(page, "consent:v1");
  expect(log[0]).toMatchObject({ granted: true, source: "onboarding" });
  expect(JSON.stringify(log)).not.toContain("ana@");
  expect(await page.evaluate(() => localStorage.getItem("pcac:subscriber:v1"))).toBeNull();

  await page.getByRole("button", { name: "Înapoi" }).click();
  await expect(page.getByTestId("onboarding-subscribed")).toContainText("a•••@exemplu.ro");
  await expect(page.getByText("Conectat ca")).toBeVisible();
});

test("Înapoi keeps the answers without asking for the password again; the profile is saved", async ({ page }) => {
  await credentials(page);
  const age = page.getByRole("button", { name: "26–30 ani" });
  await age.click();
  await next(page);
  await page.getByRole("button", { name: "Înapoi" }).click();
  await expect(page.getByLabel("Parolă", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "26–30 ani" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Continuă spre datele financiare" }).click();
  await page.getByLabel("Economii actuale").fill("10.000");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();
  await expect(page).toHaveURL(/\/reality-check$/);
  const saved = await accountItem(page, "v1");
  expect(saved.version).toBe(6);
  expect(saved.profile).toMatchObject({ alias: "ana", ageRange: "26-30", savings: 10000 });
});
