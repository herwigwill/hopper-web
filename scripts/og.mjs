// Renders public/og.png (1200×630) and public/apple-touch-icon.png (180×180). Run: npm run og
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const pub = new URL("../public/", import.meta.url).pathname;
const font = readFileSync(pub + "fonts/archivo.woff2").toString("base64");
const icon = (n) => `data:image/webp;base64,${readFileSync(pub + `icons/${n}.webp`).toString("base64")}`;
const row = (n, t, s, k, on) =>
  `<div class="row${on ? " on" : ""}"><img src="${icon(n)}"><b>${t}</b><span>${s}</span><em>${k}</em></div>`;
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
<div class="brand"><svg width="40" height="40" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#fff"/><path d="M7 22 C 10 9, 18 9, 21 18" fill="none" stroke="#2b3bf5" stroke-width="3" stroke-linecap="round"/><circle cx="23.5" cy="22" r="3" fill="#ffc93c"/></svg>Hopper for Mac</div>
<div class="lx"><div class="q">q4<i></i></div>
${row("notion", "Q4 Launch Plan", "Product", "Page", true)}
${row("chrome", "Checkout funnel, Q4", "analytics.internal", "Tab")}
${row("chrome", "Q4 board deck", "docs.internal", "Tab")}
</div></body></html>`;
const touch = `<html><body style="margin:0"><svg width="180" height="180" viewBox="0 0 32 32"><rect width="32" height="32" fill="#2b3bf5"/><path d="M7 22 C 10 9, 18 9, 21 18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="23.5" cy="22" r="3" fill="#ffc93c"/></svg></body></html>`;
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
