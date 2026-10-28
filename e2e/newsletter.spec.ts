import { expect, test, type Page } from "@playwright/test";

const KEYS = { prompt: "pcac:prompt:v1", subscriber: "pcac:subscriber:v1", consent: "pcac:consent:v1", reading: "pcac:reading:v1" };

async function fresh(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
}

const storage = (page: Page, key: string) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), key);
const prompt = (page: Page) => page.getByTestId("newsletter-prompt");

async function openArticle(page: Page, slug: string) {
  await page.goto(`/invata/${slug}`);
  await expect(page.getByRole("button", { name: "Am citit — fac quiz-ul" })).toBeVisible();
}

test("prompt appears only after two distinct articles and does not block reading", async ({ page }) => {
  await fresh(page);
  await openArticle(page, "inflatia");
  await expect(prompt(page)).toHaveCount(0);
  await openArticle(page, "inflatia");
  await expect(prompt(page)).toHaveCount(0);

  await openArticle(page, "lichiditate");
  await expect(prompt(page)).toBeVisible();
  await expect(prompt(page).getByRole("checkbox")).not.toBeChecked();
  await expect(prompt(page)).toContainText("Mod demo");
  await expect(prompt(page).getByRole("link", { name: "nota de confidențialitate" })).toHaveAttribute("href", "/confidentialitate");
  expect(await storage(page, KEYS.reading)).toEqual({ opened: ["inflatia", "lichiditate"] });

  // Reading continues: the quiz action is still usable with the prompt on screen.
  await page.getByRole("button", { name: "Am citit — fac quiz-ul" }).click();
  await expect(page).toHaveURL(/\/invata\/lichiditate\/quiz$/);
});

test("email without consent stores nothing; invalid email is rejected", async ({ page }) => {
  await fresh(page);
  await openArticle(page, "inflatia");
  await openArticle(page, "taxe");
  const p = prompt(page);

  await p.getByLabel("Adresa de e-mail").fill("ana@exemplu.ro");
  await p.getByRole("button", { name: "Abonează-mă" }).click();
  await expect(p.getByText("Pentru a te abona, bifează acordul.")).toBeVisible();
  await expect(p.getByRole("checkbox")).toBeFocused();
  expect(await storage(page, KEYS.subscriber)).toBeNull();
  expect(await storage(page, KEYS.consent)).toBeNull();

  await p.getByLabel("Adresa de e-mail").fill("ana@exemplu");
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: "Abonează-mă" }).click();
  await expect(p.getByText("Adresa de e-mail nu pare validă.")).toBeVisible();
  expect(await storage(page, KEYS.subscriber)).toBeNull();
});

test("dismissing snoozes the prompt across articles and reloads", async ({ page }) => {
  await fresh(page);
  await openArticle(page, "inflatia");
  await openArticle(page, "lichiditate");
  await prompt(page).getByRole("button", { name: "Închide — poate mai târziu" }).click();
  await expect(page.getByText("Nu îți mai arătăm propunerea în următoarele săptămâni.")).toBeVisible();

  await openArticle(page, "diversificare");
  await expect(prompt(page)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Am citit — fac quiz-ul" })).toBeVisible();
  await expect(prompt(page)).toHaveCount(0);

  const state = await storage(page, KEYS.prompt);
  expect(state.dismissals).toBe(1);
  expect(Date.parse(state.snoozedUntil)).toBeGreaterThan(Date.now() + 13 * 86_400_000);
});

test("declining hides the prompt for good", async ({ page }) => {
  await fresh(page);
  await openArticle(page, "inflatia");
  await openArticle(page, "comisioane");
  await prompt(page).getByRole("button", { name: "Nu, mulțumesc" }).click();
  await openArticle(page, "taxe");
  await expect(prompt(page)).toHaveCount(0);
  expect((await storage(page, KEYS.prompt)).declined).toBe(true);
});

test("subscribe with explicit consent, then unsubscribe", async ({ page }) => {
  await fresh(page);
  await openArticle(page, "inflatia");
  await openArticle(page, "fraude");
  const p = prompt(page);
  await p.getByLabel("Adresa de e-mail").fill("ana@exemplu.ro");
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: "Abonează-mă" }).click();
  await expect(p.getByText("Abonare înregistrată (mod demo)")).toBeVisible();
  await expect(p).toContainText("Nu a fost trimis niciun e-mail");

  const subscriber = await storage(page, KEYS.subscriber);
  expect(subscriber.email).toBe("ana@exemplu.ro");
  const log = await storage(page, KEYS.consent);
  expect(log).toHaveLength(1);
  expect(log[0]).toMatchObject({ subscriberId: subscriber.id, granted: true, purpose: "newsletter", source: "article-prompt" });
  expect(log[0].textVersion).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
  expect(JSON.stringify(log)).not.toContain("ana@");

  await openArticle(page, "taxe");
  await expect(prompt(page)).toHaveCount(0);

  await page.goto("/progres");
  await expect(page.getByTestId("newsletter-settings")).toContainText("a•••@exemplu.ro");

  await page.goto("/dezabonare");
  await page.getByRole("button", { name: "Dezabonează-mă" }).click();
  await expect(page.getByText("Te-ai dezabonat")).toBeVisible();
  expect(await storage(page, KEYS.subscriber)).toBeNull();
  const after = await storage(page, KEYS.consent);
  expect(after.map((c: { granted: boolean }) => c.granted)).toEqual([true, false]);
});

test("reset demo clears email and consent data", async ({ page }) => {
  await fresh(page);
  await page.goto("/progres");
  const s = page.getByTestId("newsletter-settings");
  await s.getByLabel("Adresa de e-mail").fill("ion@exemplu.ro");
  await s.getByRole("checkbox").check();
  await s.getByRole("button", { name: "Abonează-mă" }).click();
  await expect(s.getByText("Abonare înregistrată (mod demo)")).toBeVisible();
  await page.getByRole("button", { name: "Resetează demo-ul" }).click();
  await page.getByRole("button", { name: "Da, șterge" }).click();
  for (const k of Object.values(KEYS)) expect(await storage(page, k)).toBeNull();
});
