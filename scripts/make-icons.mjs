// Builds macOS-style app tiles from official brand marks (via @iconify-json/logos) for apps
// whose real icon couldn't be copied from an installed app. See ASSETS.md.
import { readFileSync, writeFileSync } from "node:fs";
const set = JSON.parse(readFileSync(new URL("../node_modules/@iconify-json/logos/icons.json", import.meta.url)));
const mark = (name) => {
  const i = set.icons[name];
  return { body: i.body, w: i.width ?? set.width ?? 256, h: i.height ?? set.height ?? 256 };
};
const tile = ({ bg, name, scale = 0.5, border = "rgba(0,0,0,.08)" }) => {
  const m = mark(name);
  const box = 80 * scale;
  const s = box / Math.max(m.w, m.h);
  const w = m.w * s, h = m.h * s;
  const x = 50 - w / 2, y = 50 - h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".18"/></filter></defs><rect x="10" y="10" width="80" height="80" rx="18.5" fill="${bg}" filter="url(#d)"/><rect x="10.25" y="10.25" width="79.5" height="79.5" rx="18.3" fill="none" stroke="${border}" stroke-width=".5"/><g transform="translate(${x} ${y}) scale(${s})">${m.body}</g></svg>`;
};
const tiles = {
  slack: { bg: "#ffffff", name: "slack-icon", scale: 0.56 },
  notion: { bg: "#ffffff", name: "notion-icon", scale: 0.58 },
  claude: { bg: "#F4EFE6", name: "claude-icon", scale: 0.6 },
  codex: { bg: "#ffffff", name: "codex", scale: 0.62 },
  obsidian: { bg: "#1E1B2E", name: "obsidian-icon", scale: 0.58, border: "rgba(255,255,255,.08)" },
  safari: { bg: "#ffffff", name: "safari", scale: 0.8 },
};
for (const [id, t] of Object.entries(tiles)) writeFileSync(new URL(`../public/icons/${id}.svg`, import.meta.url), tile(t));
console.log("tiles:", Object.keys(tiles).join(", "));
