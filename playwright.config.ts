import { defineConfig, devices } from "@playwright/test";

/** Tests run against the production build served like GitHub Pages serves it (scripts/serve.mjs). */
export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4322", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://localhost:4322",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    // WebKit is the engine most visitors (Safari on Mac and iPhone) use. Install it with `npx playwright install webkit`.
    ...(process.env.WEBKIT ? [{ name: "webkit", use: { ...devices["Desktop Safari"] } }, { name: "iphone", use: { ...devices["iPhone 15"] } }] : []),
  ],
});
