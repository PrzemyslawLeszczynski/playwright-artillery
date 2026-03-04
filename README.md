# pw-artillery

A combined **Playwright functional test** and **Artillery browser-based load test** suite written in TypeScript, targeting [DemoBlaze](https://www.demoblaze.com/).

---

## What is Artillery?

[Artillery](https://www.artillery.io/) is an open-source load and performance testing framework. Unlike traditional HTTP-level load tools (e.g. k6, JMeter), Artillery's **Playwright engine** drives real browser instances as virtual users executing actual end-to-end user journeys under load, capturing real Web Vitals (FCP, LCP, TTFB, CLS) and browser-level metrics.

### Artillery Documentation

| Resource | Link |
| --- | --- |
| Getting started | [artillery.io/docs/get-started](https://www.artillery.io/docs/get-started/get-artillery) |
| Playwright engine | [artillery.io/docs/reference/engines/playwright](https://www.artillery.io/docs/reference/engines/playwright) |
| Load phases config | [artillery.io/docs/reference/test-script#phases](https://www.artillery.io/docs/reference/test-script#load-phases) |
| Metrics reference | [artillery.io/docs/reference/metrics](https://www.artillery.io/docs/reference/artillery-metrics-reference) |
| Artillery Cloud | [app.artillery.io](https://app.artillery.io/) |

### Why use Artillery with Playwright?

| Playwright alone       | Artillery + Playwright                |
| ---------------------- | ------------------------------------- |
| Functional correctness | Functional correctness **under load** |
| Single virtual user    | Configurable concurrent virtual users |
| Pass/fail reporting    | Performance metrics + Web Vitals      |
| HTML trace report      | Artillery Cloud dashboard             |

---

## Project Structure

```
 src/
    HomePage.ts                  # Page Object Model for DemoBlaze homepage
 tests/
    e2e/
       homePage.spec.ts         # Playwright functional (e2e) tests
    load/
        homePage.load.spec.ts    # Artillery browser-based load test
 .env                             # Local environment variables (gitignored)
 .gitignore
 package.json
 playwright.config.ts             # Playwright configuration
 tsconfig.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Installation

### 1. Install npm dependencies

```bash
npm install
```

Installs all packages:

| Package                            | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| `@playwright/test`                 | Playwright test runner and browser automation   |
| `artillery`                        | Load testing framework                          |
| `dotenv`                           | Loads `.env` file into `process.env` at runtime |
| `dotenv-cli`                       | Enables `dotenv --` prefix in npm scripts       |
| `@artilleryio/playwright-reporter` | Sends Playwright results to Artillery Cloud     |
| `typescript`                       | TypeScript compiler                             |
| `@types/node`                      | Node.js type definitions                        |

### 2. Install Playwright browsers

```bash
npx playwright install --with-deps
```

Installs Chromium, Firefox, and WebKit with their OS-level dependencies.

### 3. Configure environment variables

Create a `.env` file in the project root (already gitignored):

```
ARTILLERY_CLOUD_API_KEY=your_api_key_here
```

> Get your API key from [Artillery Cloud](https://app.artillery.io/). Required only for `npm run artillery:report`.

Verify the key is loaded correctly:

```powershell
node -e "require('dotenv').config(); console.log(process.env.ARTILLERY_CLOUD_API_KEY)"
```

---

## Running Playwright E2E Tests

All functional tests run against [https://www.demoblaze.com](https://www.demoblaze.com) using Chromium by default.

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run test:cloud`  | Run all e2e tests headless               |
| `npm run test:headed` | Run all e2e tests with visible browser   |
| `npm run test:ui`     | Open Playwright UI mode (interactive)    |
| `npm run report`      | Run tests + open HTML report with traces |

### Test coverage (`tests/e2e/homePage.spec.ts`)

- Homepage loads with correct title and URL
- Navigation bar items are visible
- Category sidebar is visible (Phones, Laptops, Monitors)
- Product grid displays on load
- Category filtering works for all three categories
- Product detail page navigation
- Login modal opens
- Sign-up modal opens
- Carousel is visible

### Run a specific test

```bash
npx playwright test --project=chromium -g "should open login modal"
```

### Run across all browsers

```bash
npx playwright test
```

Configured browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari.

---

## Running Artillery Load Tests

Artillery simulates virtual users running the full browser-based user journey defined in `tests/load/homePage.load.spec.ts`.

### User journey per virtual user

1. **Open homepage** — navigate to `/`, wait for products to load, assert title, nav, category sidebar, and product grid are visible
2. **Open login modal** — click Login, verify `#logInModal` is visible, close it with the `×` button
3. **Browse Phones category** — click the Phones filter, assert products reload, capture product titles
4. **Open product detail page** — click the first product, verify URL matches `prod.html`, assert product content is visible, then navigate back

### Commands

| Command                         | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| `npm run artillery:load`        | Run load test headless (no Cloud reporting)        |
| `npm run artillery:load:report` | Run load test + publish results to Artillery Cloud |
| `npm run artillery:perf`        | Run full perf test (4 phases, 8 workers) headless  |
| `npm run artillery:perf:report` | Run full perf test + publish to Artillery Cloud    |

### Run directly with Artillery CLI

```bash
# Headless
npx artillery run ./tests/load/homePage.load.spec.ts

# Headed (visible browser)
npx artillery run --overrides "{\"config\":{\"engines\":{\"playwright\":{\"headless\":false}}}}" ./tests/load/homePage.load.spec.ts

# With Artillery Cloud reporting
# Load test (warm-up only)
npm run artillery:load

# Full perf test (4 phases)
npm run artillery:perf

# With Artillery Cloud reporting
dotenv -- artillery run ./tests/load/homePage.load.spec.ts --record
```

### Metrics captured

Artillery captures real browser metrics per virtual user:

| Metric                               | Description                   |
| ------------------------------------ | ----------------------------- |
| `browser.page.FCP`                   | First Contentful Paint        |
| `browser.page.LCP`                   | Largest Contentful Paint      |
| `browser.page.TTFB`                  | Time To First Byte            |
| `browser.page.CLS`                   | Cumulative Layout Shift       |
| `browser.http_requests`              | Total HTTP requests made      |
| `vusers.completed` / `vusers.failed` | Virtual user pass/fail count  |
| `vusers.session_length`              | Total session duration per VU |

---

## Page Object Model

[src/HomePage.ts](src/HomePage.ts) encapsulates all selectors and interactions for the DemoBlaze homepage.

### Available methods

| Method                       | Description                                        |
| ---------------------------- | -------------------------------------------------- |
| `goto()`                     | Navigate to base URL `/`                           |
| `waitForPageLoad()`          | Wait for DOM + first product card visible          |
| `filterByCategory(category)` | Click Phones / Laptops / Monitors filter           |
| `getProductCount()`          | Return number of visible product cards             |
| `getProductTitles()`         | Return array of product title strings              |
| `clickProduct(index)`        | Click product by index (default: 0)                |
| `goToNextPage()`             | Click the next page button                         |
| `assertPageLoaded()`         | Assert title, nav brand, and category list visible |
| `assertProductsVisible()`    | Assert at least one product card is visible        |
| `getPerformanceMetrics()`    | Return Navigation Timing + Paint Timing data       |

---

## Versions

| Package    | Version |
| ---------- | ------- |
| Playwright | 1.58.2  |
| Artillery  | 2.0.30  |
| TypeScript | 5.x     |
| Node.js    | v18+    |
