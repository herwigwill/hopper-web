import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { watchConsole } from "./helpers";

test.describe("landing page", () => {
  test("loads with no console errors and the key content", async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Never lose your\splace\./);
    await expect(page.getByRole("heading", { name: "Got pulled away? Press Back." })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Go straight to the one that needs you/ })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Be the first to try Hopper." })).toBeAttached();
    // Scroll through everything so every moment's script runs.
    for (let y = 0; y < 12; y++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(120);
    }
    expect(problems).toEqual([]);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page } as never).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });

  test("has no serious accessibility violations with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const results = await new AxeBuilder({ page } as never).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });

  test("never scrolls sideways", async ({ page }) => {
    for (const width of [375, 768, 1280, 1728]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("has sharing and indexing metadata", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Hopper/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://addhopper.com/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://addhopper.com/og.png");
    expect((await request.get("/og.png")).status()).toBe(200);
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://addhopper.com/sitemap.xml");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("https://addhopper.com/privacy");
    expect(sitemap).toContain("https://addhopper.com/features/windows");
    expect(sitemap).not.toContain("waitlist");
  });

  test("every internal link and asset resolves", async ({ page, request }) => {
    for (const path of ["/", "/features", "/features/search", "/features/navigation", "/features/agents", "/features/windows", "/features/hotkeys", "/features/privacy-controls", "/features/on-device", "/getting-started", "/tips", "/compare", "/help", "/about", "/blog", "/privacy", "/terms"]) {
      await page.goto(path);
      const urls = await page.evaluate(() => [
        ...[...document.querySelectorAll("a[href]")].map((a) => (a as HTMLAnchorElement).href),
        ...[...document.querySelectorAll("img[src]")].map((i) => (i as HTMLImageElement).src),
      ]);
      for (const url of new Set(urls)) {
        const u = new URL(url);
        if (u.protocol === "mailto:" || u.host !== new URL(page.url()).host) continue;
        expect((await request.get(u.pathname)).status(), url).toBe(200);
      }
    }
  });

  test("measures well: no layout shift on load", async ({ page }) => {
    await page.goto("/");
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) total += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 2500);
        }),
    );
    expect(cls).toBeLessThanOrEqual(0.1);
  });
});
