import { expect, test, type Page } from "@playwright/test";

const storage = (page: Page, key: string) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), key);
const next = (page: Page) => page.getByRole("button", { name: "Continuă spre datele financiare" }).click();

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/profil");
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 1 din 2: Cine ești?");
});

test("step 1 requires a name or pseudonym; the page has no footer", async ({ page }) => {
  await expect(page.locator("footer")).toHaveCount(0);
  await next(page);
  await expect(page.getByText("Spune-ne cum să-ți spunem")).toBeVisible();
  await expect(page.getByLabel("Cum să-ți spunem")).toBeFocused();
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 1 din 2: Cine ești?");
});

test("email is optional: continuing without it stores no subscriber", async ({ page }) => {
  await page.getByLabel("Cum să-ți spunem").fill("Ana");
  await next(page);
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 2 din 2: Banii tăi");
  expect(await storage(page, "pcac:subscriber:v1")).toBeNull();
});

test("an email without consent is rejected and nothing is stored", async ({ page }) => {
  await page.getByLabel("Cum să-ți spunem").fill("Ana");
  await page.getByLabel("Adresă de e-mail").fill("ana@exemplu.ro");
  const consent = page.getByRole("checkbox");
  await expect(consent).toBeVisible();
  await expect(consent).not.toBeChecked();
  await next(page);
  await expect(page.getByText("Bifează acordul pentru digest sau lasă adresa de e-mail goală.")).toBeVisible();
  await expect(consent).toBeFocused();
  expect(await storage(page, "pcac:subscriber:v1")).toBeNull();
  expect(await storage(page, "pcac:consent:v1")).toBeNull();
});

test("email with explicit consent subscribes (source: onboarding), consent stored without the email", async ({ page }) => {
  await page.getByLabel("Cum să-ți spunem").fill("Ana");
  await page.getByLabel("Adresă de e-mail").fill("ana@exemplu.ro");
  await page.getByRole("checkbox").check();
  await next(page);
  await expect(page.getByTestId("onboarding-step")).toHaveText("Pasul 2 din 2: Banii tăi");
  expect((await storage(page, "pcac:subscriber:v1")).email).toBe("ana@exemplu.ro");
  const log = await storage(page, "pcac:consent:v1");
  expect(log).toHaveLength(1);
  expect(log[0]).toMatchObject({ granted: true, source: "onboarding" });
  expect(JSON.stringify(log)).not.toContain("ana@");

  await page.getByRole("button", { name: "Înapoi" }).click();
  await expect(page.getByTestId("onboarding-subscribed")).toContainText("a•••@exemplu.ro");
});

test("Înapoi keeps step-1 answers; the saved profile has the alias and age range", async ({ page }) => {
  await page.getByLabel("Cum să-ți spunem").fill("Ana");
  const age = page.getByRole("button", { name: "26–30 ani" });
  await age.click();
  await expect(age).toHaveAttribute("aria-pressed", "true");
  await next(page);
  await page.getByRole("button", { name: "Înapoi" }).click();
  await expect(page.getByLabel("Cum să-ți spunem")).toHaveValue("Ana");
  await expect(page.getByRole("button", { name: "26–30 ani" })).toHaveAttribute("aria-pressed", "true");
  await next(page);
  await page.getByLabel("Economii actuale").fill("10.000");
  await page.getByRole("button", { name: "Salvează și vezi Reality Check" }).click();
  await expect(page).toHaveURL(/\/reality-check$/);
  const saved = await storage(page, "pcac:v1");
  expect(saved.version).toBe(3);
  expect(saved.profile).toMatchObject({ alias: "Ana", ageRange: "26-30", savings: 10000 });
});
