import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against the production build served like GitHub Pages serves it (scripts/serve.mjs).
 * Port 4399 stays clear of dev servers (Astro steps up from 4321 when it's taken). TEST_PORT runs two suites at once.
 */
const port = Number(process.env.TEST_PORT) || 4399;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/serve.mjs",
    env: { PORT: String(port) },
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    // WebKit is the engine most visitors (Safari on Mac and iPhone) use. Install it with `npx playwright install webkit`.
    ...(process.env.WEBKIT ? [{ name: "webkit", use: { ...devices["Desktop Safari"] } }, { name: "iphone", use: { ...devices["iPhone 15"] } }] : []),
  ],
});
