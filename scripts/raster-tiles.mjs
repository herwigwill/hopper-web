// Rasterises generated SVG tiles to 128px WebP-ready PNGs (then converted with Pillow). Dev-only helper.
import { chromium } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
const dir = new URL("../public/icons/", import.meta.url).pathname;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 1 });
for (const f of readdirSync(dir).filter((f) => f.endsWith(".svg"))) {
  await p.setContent(`<body style="margin:0;background:transparent">${readFileSync(dir + f, "utf8").replace("<svg ", '<svg width="128" height="128" ')}</body>`);
  await p.screenshot({ path: `/tmp/claude-0/${f.replace(".svg", ".png")}`, omitBackground: true });
}
await b.close();
