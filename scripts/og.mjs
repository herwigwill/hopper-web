// Renders public/og.png (1200×630) and public/apple-touch-icon.png (180×180). Run: npm run og
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const pub = new URL("../public/", import.meta.url).pathname;
const font = readFileSync(pub + "fonts/archivo.woff2").toString("base64");
const icon = (n) => `data:image/webp;base64,${readFileSync(pub + `icons/${n}.webp`).toString("base64")}`;
const row = (n, t, s, k, on) =>
  `<div class="row${on ? " on" : ""}"><img src="${icon(n)}"><b>${t}</b><span>${s}</span><em>${k}</em></div>`;
// The mark, the bunny ears (same paths as src/components/HopperMark.astro), centred in a square tile.
const ears = (bg, fg, size, radius) =>
  `<svg width="${size}" height="${size}" viewBox="-76 -52 276 276"><rect x="-76" y="-52" width="276" height="276" rx="${radius}" fill="${bg}"/><g fill="${fg}"><path d="M22,168.4C21.2,169.1 12.4,146 11.9,143.9C11.6,143.1 11.1,141.6 10.6,140.6C7.2,132.9 2.7,117.5 1.6,109.5C-0.9,93 4.4,69.2 16.4,41.5C26,19.6 33.3,7.6 40,2.7C44.9,-0.8 49,0.6 50.4,7.4C50.5,7.4 50.4,8 50.5,8C52.1,8 43.8,94.6 38,146.8C37.7,149.5 38.8,163.1 32.4,166.8C29.6,168.5 23.7,171.5 22,168.4Z"/><path d="M80.1,156.6C76.6,155.6 74.2,149.9 73.8,145.9C73.2,140.1 75.3,125.2 76.1,121.4C76.9,118.1 78.9,113.4 81.5,109.3C82.4,107.9 83.1,106.8 83.3,106.7C83.4,106.6 84.2,105.5 85.1,104.4C89.2,99 93.3,94.4 99.4,88.3C107.3,80.4 112.3,76.4 116.3,74.7C117.4,74.2 119.2,73.3 121,74.6C122.5,75.6 123,79 121.4,81.4C119.9,83.6 101.9,107 92.7,132.2C91.4,135.6 86.1,158.4 80.1,156.6Z"/></g></svg>`;
const og = `<html><head><style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${font});font-weight:100 900;font-stretch:62% 125%}
body{margin:0;width:1200px;height:630px;background:#2b3bf5;color:#fff;font-family:A;overflow:hidden;position:relative}
h1{position:absolute;left:72px;top:64px;margin:0;font-size:118px;line-height:.92;font-weight:800;font-stretch:78%;letter-spacing:-.025em;width:640px}
.brand{position:absolute;left:72px;bottom:56px;font-size:34px;font-weight:800;font-stretch:85%;display:flex;gap:12px;align-items:center}
.lx{position:absolute;right:-40px;top:150px;width:600px;border-radius:18px;background:rgb(30,31,38);padding:10px;font-family:-apple-system,Helvetica,Arial,sans-serif;box-shadow:0 40px 80px -20px rgba(6,8,30,.6)}
.q{font-size:28px;padding:16px 14px 18px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:8px}.q i{display:inline-block;width:3px;height:30px;background:#ffc93c;vertical-align:-5px;margin-left:2px}
.row{display:flex;gap:14px;align-items:center;padding:13px 14px;border-radius:12px;font-size:20px;color:#f2f2f5}.row.on{background:rgba(255,255,255,.11);box-shadow:0 0 0 3px #ffc93c}
.row img{width:34px;height:34px}.row span{color:rgba(235,235,245,.5);font-size:17px}.row em{margin-left:auto;font-style:normal;color:rgba(235,235,245,.5);font-size:17px}
</style></head><body>
<h1>Never lose your place.</h1>
<div class="brand">${ears("#fff", "#2b3bf5", 40, 64)}Hopper for Mac</div>
<div class="lx"><div class="q">q4<i></i></div>
${row("notion", "Q4 Launch Plan", "Product", "Page", true)}
${row("chrome", "Checkout funnel, Q4", "analytics.internal", "Tab")}
${row("chrome", "Q4 board deck", "docs.internal", "Tab")}
</div></body></html>`;
const touch = `<html><body style="margin:0">${ears("#2b3bf5", "#fff", 180, 0)}</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(og);
await p.waitForTimeout(300);
await p.screenshot({ path: pub + "og.png" });
await p.setViewportSize({ width: 180, height: 180 });
await p.setContent(touch);
await p.screenshot({ path: pub + "apple-touch-icon.png" });
await b.close();
console.log("Wrote public/og.png and public/apple-touch-icon.png");
