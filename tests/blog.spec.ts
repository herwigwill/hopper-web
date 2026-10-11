import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, readdirSync } from "node:fs";
import { watchConsole } from "./helpers";

const slugs = readdirSync("src/content/blog").filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));

test.describe("blog", () => {
  test("index lists every post, newest first", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const links = await page.locator("main a.card").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(links.sort()).toEqual(slugs.map((s) => `/blog/${s}`).sort());
  });

  for (const slug of slugs) {
    test(`${slug}: page, structured data, cover`, async ({ page, request }) => {
      const problems = watchConsole(page);
      await page.goto(`/blog/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "The short answer" })).toBeVisible();
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      const types = ld["@graph"].map((n: { "@type": string }) => n["@type"]);
      expect(types).toContain("BlogPosting");
      expect(types).toContain("BreadcrumbList");
      expect(existsSync(`public/blog/${slug}.png`), "run npm run blog:covers").toBe(true);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`/blog/${slug}\\.png$`));
      expect((await request.get(`/blog/${slug}.md`)).ok()).toBe(true);
      const results = await new AxeBuilder({ page } as never).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => v.id)).toEqual([]);
      expect(problems).toEqual([]);
    });
  }

  test("feeds list every post", async ({ request }) => {
    const rss = await (await request.get("/rss.xml")).text();
    const llms = await (await request.get("/llms.txt")).text();
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const s of slugs) {
      expect(rss).toContain(`/blog/${s}<`);
      expect(llms).toContain(`/blog/${s}.md`);
      expect(sitemap).toContain(`/blog/${s}<`);
    }
  });
});
