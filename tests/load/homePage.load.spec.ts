import { type Config, type Scenario } from "artillery";
import { type Page, expect } from "@playwright/test";

export const config: Config = {
  target: "https://www.demoblaze.com",
  phases: [
    {
      duration: 10,
      arrivalRate: 1,
      maxVusers: 10,
      name: "Warm up",
    },
  ],
  plugins: {
    ensure: {},
  },
  ensure: {
    conditions: [
      {
        expression: "http.response_time.p95 < 3000",
      },
      {
        expression: "browser.page.TTFB.https://www.demoblaze.com/.p95 < 1800",
      },
      {
        expression: "browser.page.FCP.https://www.demoblaze.com/.p95 < 500",
      },
      {
        expression: "browser.page.LCP.https://www.demoblaze.com/.p95 < 3500",
      },
      {
        expression: "vusers.failed == 0",
      },
    ],
  },
  engines: {
    playwright: {
      trace: {
        enabled: true,
        maxConcurrentRecordings: 5,
      },
    },
  },
};

export const scenarios: Scenario[] = [
  {
    engine: "playwright",
    testFunction: browseHomePage,
  },
];

async function browseHomePage(page: Page) {
  const { HomePage } = await import("../../src/HomePage");
  const homePage = new HomePage(page);

  // ── Step 1: Open homepage ──────────────────────────────────────────────────
  await homePage.goto();
  await homePage.waitForPageLoad();
  await homePage.assertPageLoaded();
  await homePage.assertProductsVisible();

  // ── Step 2: Open login modal ───────────────────────────────────────────────
  await homePage.navLogin.click();
  await expect(page.locator("#logInModal")).toBeVisible({ timeout: 5_000 });
  await page.locator("#logInModal .close").click();
  await page.waitForTimeout(500);

  // ── Step 3: Browse Phones category ────────────────────────────────────────
  await homePage.filterByCategory("Phones");
  await homePage.assertProductsVisible();
  await homePage.getProductTitles();

  // ── Step 4: Open product detail page ──────────────────────────────────────
  await homePage.clickProduct(0);
  await expect(page).toHaveURL(/prod\.html/);
  await expect(
    page.locator(".product-content, #tbodyid, h2.name").first(),
  ).toBeVisible({ timeout: 10_000 });
  await page.goBack();
  await homePage.waitForPageLoad();
}
