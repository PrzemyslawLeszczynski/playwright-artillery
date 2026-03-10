import { type Config, type Scenario } from "artillery";
import { type Page, expect } from "@playwright/test";

export const config: Config = {
  target: "https://www.demoblaze.com",
  phases: [
    {
      duration: 60,
      arrivalRate: 2,
      maxVusers: 10,
      name: "Warm-up", // Gradual start to stabilize app
    },
    {
      duration: 120,
      arrivalRate: 5,
      maxVusers: 40,
      name: "Ramp-up", // Increase to sustained load
    },
    {
      duration: 300,
      arrivalRate: 10,
      maxVusers: 80,
      name: "Sustained load", // Main test phase (5 min)
    },
    {
      duration: 60,
      arrivalRate: 0,
      maxVusers: 10,
      name: "Cool down", // Graceful shutdown
    },
  ],
  // 8-core machine optimization (1 worker per core)
  // workers controls how many Artillery worker processes run in parallel
  workers: 8,
  plugins: {
    ensure: {},
  },
  ensure: {
    conditions: [
      {
        expression: "http.response_time.p95 < 5000",
      },
      {
        expression: "http.response_time.p99 < 9000",
      },
      {
        expression: "browser.page.TTFB.https://www.demoblaze.com/.p95 < 3500",
      },
      {
        expression: "browser.page.FCP.https://www.demoblaze.com/.p95 < 5000",
      },
      {
        expression: "browser.page.LCP.https://www.demoblaze.com/.p95 < 6500",
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
  await page.waitForTimeout(500); // allow Bootstrap fade-out animation to complete

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
