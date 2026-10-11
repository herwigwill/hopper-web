// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://addhopper.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  // PORT lets each worktree's dev server take its own port (the preview tool assigns one; see .claude/launch.json).
  server: { port: Number(process.env.PORT) || 4321 },
  // Scripts are always separate files so the CSP (Base.astro) can be script-src 'self' with no inline scripts.
  vite: { build: { assetsInlineLimit: 0 } },
});
