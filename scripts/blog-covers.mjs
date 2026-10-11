// Screenshots each blog post's cover (src/components/blog/Cover.astro) to public/blog/<slug>.png, 1200×630, for
// social cards and search results. Run after adding or changing a post: npm run blog:covers (it builds first).
import { chromium } from "@playwright/test";
import { readFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const out = join(root, "public/blog");
mkdirSync(out, { recursive: true });
const slugs = readdirSync(join(dist, "blog/cover")).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml" };

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
// Serve dist/ to the page without a server.
await p.route("http://covers.local/**", (route) => {
  let path = decodeURIComponent(new URL(route.request().url()).pathname);
  let file = join(dist, path);
  if (!extname(file)) file += ".html";
  if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
  route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] ?? "application/octet-stream" });
});
for (const slug of slugs) {
  await p.goto(`http://covers.local/blog/cover/${slug}`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(150);
  await p.screenshot({ path: join(out, `${slug}.png`) });
  console.log(`public/blog/${slug}.png`);
}
await b.close();
