import { expect, test } from "@playwright/test";
import { clearStorage, createAccount, finishProfiling } from "./helpers";

test.beforeEach(async ({ page }) => {
  await clearStorage(page);
});

test("ranks categories from the profile and risk answers (rule-based without an API key)", async ({ page }) => {
  await createAccount(page, "ana");
  await finishProfiling(page, { goal: "pensie" });
  await page.getByTestId("portal-recommendations").click();
  await expect(page).toHaveURL(/\/recomandari$/);

  await page.getByRole("button", { name: "Nu încă" }).click();
  await page.getByRole("button", { name: "Aș aștepta liniștit" }).click();
  await page.getByRole("button", { name: "Generează recomandările" }).click();

  const recs = page.getByTestId("recommendations");
  await expect(recs).toBeVisible();
  await expect(recs.getByText("Calculat după reguli")).toBeVisible();
  await expect(recs.locator("li").first()).toContainText("Cont de economii");
  await expect(page.getByTestId("rec-etf-global")).toHaveCount(0);
  await page.getByText(/De ce nu îți recomandăm acum celelalte categorii/).click();
  await expect(page.getByText("Fără fond de urgență, ai putea fi nevoit să vinzi").first()).toBeVisible();

  // Changing the answers invalidates the old list; regenerating reflects them.
  await page.getByRole("group", { name: /fond de urgență/ }).getByRole("button", { name: "Da", exact: true }).click();
  await page.getByRole("button", { name: "Aș pune mai mulți bani" }).click();
  await expect(recs).toHaveCount(0);
  await page.getByRole("button", { name: "Generează recomandările" }).click();
  await expect(page.getByTestId("rec-etf-global")).toBeVisible();
  await expect(page.getByTestId("rec-pilon3")).toBeVisible();

  // An expensive loan moves early repayment to the top; caution/check categories are explained apart.
  await page.getByRole("group", { name: /credit cu dobândă mare/ }).getByRole("button", { name: "Da", exact: true }).click();
  await page.getByRole("button", { name: "Generează recomandările" }).click();
  await expect(recs.locator("li").first()).toContainText("Rambursarea anticipată a unui credit scump");
  const toKnow = page.getByTestId("to-know");
  await expect(toKnow.getByTestId("know-cripto")).toContainText("MiCA");
  await expect(toKnow.getByTestId("know-pilon2")).toContainText("De verificat");
  await expect(recs.getByTestId("rec-cripto")).toHaveCount(0);

  // Answers are saved in the account.
  await page.reload();
  await expect(page.getByRole("button", { name: "Aș pune mai mulți bani" })).toHaveAttribute("aria-pressed", "true");

  // The fact sheet opens and cites sources; the disclaimer is always there.
  await page.getByRole("button", { name: "Generează recomandările" }).click();
  await page.getByTestId("rec-etf-global").getByText("Fișa categoriei").click();
  await expect(page.getByTestId("rec-etf-global").getByRole("link", { name: /ASF/ })).toBeVisible();
  await expect(page.getByText("nu este consultanță de investiții autorizată")).toBeVisible();
});

test("asks to log in when there is no account", async ({ page }) => {
  await page.goto("/recomandari");
  await expect(page.getByRole("link", { name: "Intră în cont" }).last()).toBeVisible();
});

test("the API validates input and never needs the browser to hold a key", async ({ request }) => {
  const bad = await request.post("/api/recomandari", { data: { horizonYears: -1 } });
  expect(bad.status()).toBe(400);
  const ok = await request.post("/api/recomandari", {
    data: { horizonYears: 2, goal: "locuinta", emergencyFund: "da", riskTolerance: "scazuta", experience: "deloc", savings: 30000, monthly: 500, placement: "cont-curent", ageRange: null },
  });
  expect(ok.status()).toBe(200);
  const body = await ok.json();
  expect(body.source).toBe("reguli");
  const ids = body.items.map((i: { id: string }) => i.id);
  expect(ids).not.toContain("etf-bet");
  expect(ids).not.toContain("etf-global");
  expect(ids).not.toContain("pilon3");
});
