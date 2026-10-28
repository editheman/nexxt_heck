import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "Începe demo-ul" }).click();
});

test("shows an official-data fact with countdown, source and focus on Sari peste", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId("fact-headline")).not.toBeEmpty();
  await expect(dialog).toContainText("Date oficiale");
  await expect(dialog.getByRole("link", { name: /INS|BNR/ })).toBeVisible();
  await expect(dialog.getByTestId("fact-countdown")).toHaveText("Continui automat în 10 s");
  await expect(dialog.getByRole("button", { name: "Sari peste" })).toBeFocused();
});

test("continues to the profile automatically after 10 seconds", async ({ page }) => {
  await page.clock.runFor(5_000);
  await expect(page.getByTestId("fact-countdown")).toHaveText("Continui automat în 5 s");
  await expect(page).toHaveURL(/\/$/);
  await page.clock.runFor(5_100);
  await expect(page).toHaveURL(/\/profil$/);
});

test("Sari peste continues immediately", async ({ page }) => {
  await page.getByRole("button", { name: "Sari peste" }).click();
  await expect(page).toHaveURL(/\/profil$/);
});

test("Pauză stops the countdown and Reia resumes it", async ({ page }) => {
  await page.clock.runFor(2_000);
  await page.getByRole("button", { name: "Pauză" }).click();
  await expect(page.getByTestId("fact-countdown")).toHaveText("În pauză");
  await page.clock.runFor(30_000);
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Reia" }).click();
  await expect(page.getByTestId("fact-countdown")).toHaveText("Continui automat în 8 s");
  await page.clock.runFor(8_100);
  await expect(page).toHaveURL(/\/profil$/);
});

test("Escape closes the dialog and stays on the home page", async ({ page }) => {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.clock.runFor(15_000);
  await expect(page).toHaveURL(/\/$/);
});
