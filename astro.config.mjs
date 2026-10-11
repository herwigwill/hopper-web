// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://addhopper.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  // Scripts are always separate files so the CSP (Base.astro) can be script-src 'self' with no inline scripts.
  vite: { build: { assetsInlineLimit: 0 } },
});
