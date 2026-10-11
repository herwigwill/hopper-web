// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import { toWebRequest, sendWebResponse } from "./scripts/node-request.mjs";

/** Serves api/waitlist.ts in `astro dev`, the same handler Vercel runs in production. */
const devApi = {
  name: "hopper-dev-api",
  hooks: {
    "astro:server:setup": ({ server }) => {
      server.middlewares.use("/api/waitlist", async (req, res) => {
        req.url = "/api/waitlist" + (req.url === "/" ? "" : req.url);
        const { handleWaitlist } = await server.ssrLoadModule("/api/_lib/waitlist.ts");
        const request = await toWebRequest(req, `http://${req.headers.host}`);
        const env = { ...loadEnv("development", process.cwd(), ""), ...process.env };
        await sendWebResponse(res, await handleWaitlist(request, env, req.socket.remoteAddress ?? "local"));
      });
    },
  },
};

export default defineConfig({
  site: "https://addhopper.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  integrations: [devApi],
  devToolbar: { enabled: false },
  // Scripts are always separate files so the CSP (vercel.json) can be script-src 'self' with no inline scripts.
  vite: { build: { assetsInlineLimit: 0 } },
});
