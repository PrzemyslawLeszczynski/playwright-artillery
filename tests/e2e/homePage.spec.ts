import { test, expect } from "@playwright/test";
import { HomePage } from "../../src/HomePage";

test.describe("DemoBlaze - Homepage", () => {
   let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test("should load homepage with correct title", async ({ page }) => {
    await homePage.assertPageLoaded();
    await expect(page).toHaveURL("https://www.demoblaze.com/");
  });

  test("should display navigation items", async () => {
    await expect(homePage.navBrand).toBeVisible();
    await expect(homePage.navHome).toBeVisible();
    await expect(homePage.navCart).toBeVisible();
    await expect(homePage.navLogin).toBeVisible();
    await expect(homePage.navSignUp).toBeVisible();
  });

  test("should display category sidebar", async () => {
    await expect(homePage.categoryList).toBeVisible();
    await expect(homePage.categoryPhones).toBeVisible();
    await expect(homePage.categoryLaptops).toBeVisible();
    await expect(homePage.categoryMonitors).toBeVisible();
  });

  test("should display product cards on load", async () => {
    await homePage.assertProductsVisible();
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
    console.log(`\n  Found ${count} product(s) on initial load.`);
  });

  test("should filter products by Phones category", async () => {
    await homePage.filterByCategory("Phones");
    await homePage.assertProductsVisible();
    const titles = await homePage.getProductTitles();
    expect(titles.length).toBeGreaterThan(0);
    console.log(`\n  Phones category products: ${titles.join(", ")}`);
  });

  test("should filter products by Laptops category", async () => {
    await homePage.filterByCategory("Laptops");
    await homePage.assertProductsVisible();
    const titles = await homePage.getProductTitles();
    expect(titles.length).toBeGreaterThan(0);
  });

  test("should filter products by Monitors category", async () => {
    await homePage.filterByCategory("Monitors");
    await homePage.assertProductsVisible();
    const titles = await homePage.getProductTitles();
    expect(titles.length).toBeGreaterThan(0);
  });

  test("should navigate to a product detail page", async ({ page }) => {
    await homePage.clickProduct(0);
    await expect(page).toHaveURL(/prod\.html/);
    await expect(page.locator(".product-content")).toBeVisible();
  });

  test("should open login modal", async ({ page }) => {
    await homePage.navLogin.click();
    await expect(page.locator("#logInModal")).toBeVisible({ timeout: 5_000 });
  });

  test("should open sign-up modal", async ({ page }) => {
    await homePage.navSignUp.click();
    await expect(page.locator("#signInModal")).toBeVisible({ timeout: 5_000 });
  });

  test("should display carousel", async () => {
    await expect(homePage.carousel).toBeVisible();
  });
});