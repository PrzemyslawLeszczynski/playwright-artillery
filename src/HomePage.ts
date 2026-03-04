import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the DemoBlaze homepage.
 * URL: https://www.demoblaze.com/
 */
export class HomePage {
  readonly page: Page;

  // Navigation
  readonly navBrand: Locator;
  readonly navHome: Locator;
  readonly navContact: Locator;
  readonly navAboutUs: Locator;
  readonly navCart: Locator;
  readonly navLogin: Locator;
  readonly navSignUp: Locator;

  // Category sidebar
  readonly categoryList: Locator;
  readonly categoryPhones: Locator;
  readonly categoryLaptops: Locator;
  readonly categoryMonitors: Locator;

  // Product grid
  readonly productCards: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;
  readonly nextPageBtn: Locator;
  readonly prevPageBtn: Locator;

  // Carousel
  readonly carousel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.navBrand = page.locator(".navbar-brand");
    this.navHome = page.locator("#nava");
    this.navContact = page.locator('a[data-target="#exampleModal"]');
    this.navAboutUs = page.locator('a[data-target="#videoModal"]');
    this.navCart = page.locator("#cartur");
    this.navLogin = page.locator("#login2");
    this.navSignUp = page.locator("#signin2");

    // Categories
    this.categoryList = page.locator(".list-group");
    this.categoryPhones = page.locator('a.list-group-item:has-text("Phones")');
    this.categoryLaptops = page.locator(
      'a.list-group-item:has-text("Laptops")',
    );
    this.categoryMonitors = page.locator(
      'a.list-group-item:has-text("Monitors")',
    );

    // Products
    this.productCards = page.locator(".card");
    this.productTitles = page.locator(".card-title a");
    this.productPrices = page.locator(".card-block h5");
    this.nextPageBtn = page.locator("#next2");
    this.prevPageBtn = page.locator("#prev2");

    // Carousel
    this.carousel = page.locator("#carouselExampleIndicators");
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async waitForPageLoad(): Promise<void> {
    // demoblaze.com has continuous background polling — domcontentloaded is reliable
    await this.page.waitForLoadState("domcontentloaded");
    await this.productCards
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  // ── Category filters ────────────────────────────────────────────────────────

  async filterByCategory(
    category: "Phones" | "Laptops" | "Monitors",
  ): Promise<void> {
    const map = {
      Phones: this.categoryPhones,
      Laptops: this.categoryLaptops,
      Monitors: this.categoryMonitors,
    };
    await map[category].click();
    // demoblaze.com never reaches networkidle — wait for products to re-render
    await this.productCards
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  // ── Products ────────────────────────────────────────────────────────────────

  async getProductCount(): Promise<number> {
    await this.productCards.first().waitFor({ state: "visible" });
    return this.productCards.count();
  }

  async getProductTitles(): Promise<string[]> {
    await this.productTitles.first().waitFor({ state: "visible" });
    return this.productTitles.allTextContents();
  }

  async clickProduct(index: number = 0): Promise<void> {
    await this.productTitles.nth(index).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageBtn.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertPageLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/STORE/i);
    await expect(this.navBrand).toBeVisible();
    await expect(this.categoryList).toBeVisible();
  }

  async assertProductsVisible(): Promise<void> {
    await expect(this.productCards.first()).toBeVisible();
  }
}
