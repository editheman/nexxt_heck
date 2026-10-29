import { expect, test, type Page } from "@playwright/test";
import { clearStorage, createAccount, finishProfiling, openAccountMenu } from "./helpers";

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

async function logout(page: Page) {
  await openAccountMenu(page);
  await page.getByRole("button", { name: "Deconectare" }).click();
}

test("every other account is a friend, compared only by % of purchasing power kept", async ({ page, isMobile }) => {
  // Logged out: no panel.
  await page.goto("/invata");
  await expect(page.getByTestId("friends-panel")).toHaveCount(0);

  await createAccount(page, "ana");
  await finishProfiling(page, { savings: "123.456" });
  const panel = page.getByTestId("friends-panel");
  const me = panel.getByTestId("friend-me");
  await expect(me).toContainText("ana (tu)");
  await expect(me.getByTestId("kept-pct")).toHaveText(/^\d+%$/);
  await expect(panel.getByTestId("friends-empty")).toBeVisible();
  const anaPct = await me.getByTestId("kept-pct").innerText();
  await logout(page);

  // A friend without a profile shows no value.
  await createAccount(page, "elena");
  await logout(page);

  await createAccount(page, "ion");
  await finishProfiling(page);
  await expect(panel.getByTestId("friend-ana").getByTestId("kept-pct")).toHaveText(anaPct);
  await expect(panel.getByTestId("friend-elena")).toContainText("Nu și-a completat încă profilul.");
  await expect(panel).not.toContainText("123");
  await expect(panel.getByRole("checkbox")).toHaveCount(0);

  // Desktop (xl): fixed to the right edge; the page content does not run under it.
  if (!isMobile) {
    await page.setViewportSize({ width: 1440, height: 900 });
    const box = (await panel.boundingBox())!;
    expect(Math.round(box.x + box.width)).toBe(1440);
    const mainRight = await page.evaluate(() => document.querySelector("main > div")!.getBoundingClientRect().right);
    expect(mainRight).toBeLessThanOrEqual(box.x + 1);
  }

  // Never on the home page.
  await page.goto("/");
  await expect(page.getByTestId("friends-panel")).toHaveCount(0);
});
